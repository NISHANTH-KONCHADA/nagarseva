import Groq from 'groq-sdk'
import Complaint from '../models/Complaint.js'
import { io } from '../index.js'

const ESCALATION_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes
const AGE_THRESHOLD_MS = 2 * 60 * 1000 // 2 minutes (simulating 1 day)

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

async function generateEscalationReason(complaint: any): Promise<string> {
  try {
    const ageInMinutes = Math.floor((Date.now() - new Date(complaint.createdAt).getTime()) / 60000)
    
    const prompt = `You are an automated escalation system for a city complaint platform.
A complaint has not been resolved in a timely manner and is being escalated.
Issue type: ${complaint.type}
Severity: ${complaint.severity}/5
Current Escalation Level: ${complaint.escalationLevel}
Age: ${ageInMinutes} minutes (simulating days)

Provide a single concise sentence summarizing the reason for escalation, focusing on its age and severity. Do not use quotes or introductory text, just the sentence.`

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      max_tokens: 50,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.choices?.[0]?.message?.content || ''
    return text.trim() || 'Escalated due to prolonged age and severity.'
  } catch (error) {
    console.error('Error generating escalation reason:', error)
    return 'Escalated automatically based on time elapsed and severity.'
  }
}

export function startEscalationAgent() {
  console.log(`Starting escalation agent (interval: ${ESCALATION_INTERVAL_MS}ms)...`)
  
  setInterval(async () => {
    try {
      console.log('Running escalation check...')
      
      const thresholdDate = new Date(Date.now() - AGE_THRESHOLD_MS)
      
      // Find complaints not resolved and updated older than the threshold
      const complaintsToEscalate = await Complaint.find({
        status: { $ne: 'resolved' },
        updatedAt: { $lt: thresholdDate }
      })
      
      if (complaintsToEscalate.length === 0) {
        return
      }
      
      console.log(`Found ${complaintsToEscalate.length} complaints to escalate.`)
      
      for (const complaint of complaintsToEscalate) {
        // Bump escalation level
        complaint.escalationLevel = (complaint.escalationLevel || 0) + 1
        
        // Generate reason
        const reason = await generateEscalationReason(complaint)
        
        // Update status if it crossed 2
        let statusChanged = false
        if (complaint.escalationLevel > 2 && complaint.status !== 'escalated') {
          complaint.status = 'escalated'
          statusChanged = true
        }
        
        // Append history
        complaint.statusHistory.push({
          status: complaint.status,
          timestamp: new Date(),
          notes: reason,
        })
        
        await complaint.save()
        console.log(`Escalated complaint ${complaint._id} to level ${complaint.escalationLevel}. Reason: ${reason}`)
        
        // Emit event to connected clients if the status officially became 'escalated'
        if (statusChanged) {
          io.emit('complaint:escalated', complaint)
        }
      }
      
    } catch (error) {
      console.error('Error in escalation agent cycle:', error)
    }
  }, ESCALATION_INTERVAL_MS)
}
