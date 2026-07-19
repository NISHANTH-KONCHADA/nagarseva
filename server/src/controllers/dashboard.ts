import { Request, Response } from 'express'
import Complaint from '../models/Complaint.js'
import Ward from '../models/Ward.js'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export const getWardDashboardStats = async (req: Request, res: Response) => {
  try {
    const wards = await Ward.find()
    const complaints = await Complaint.find().populate('ward')

    const statsPromises = wards.map(async (ward) => {
      const wardComplaints = complaints.filter(c => 
        c.ward && (c.ward as any)._id.toString() === ward._id.toString()
      )

      const volume = wardComplaints.length
      const resolved = wardComplaints.filter(c => c.status === 'resolved')
      const escalated = wardComplaints.filter(c => c.escalationLevel > 0 || c.status === 'escalated')

      const resolutionRate = volume > 0 ? (resolved.length / volume) * 100 : 0

      // Calculate avg resolution time in days
      let avgResolutionTimeDays = 0
      if (resolved.length > 0) {
        const totalMs = resolved.reduce((acc, c) => {
          return acc + (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime())
        }, 0)
        avgResolutionTimeDays = (totalMs / resolved.length) / (1000 * 60 * 60 * 24)
      }

      // Generate AI summary
      let summary = 'Insufficient data for summary.'
      if (volume > 0) {
        try {
          const prompt = `You are a civic accountability assistant analyzing data for ${ward.name}.
Total Complaints: ${volume}
Resolution Rate: ${resolutionRate.toFixed(1)}%
Average Resolution Time: ${avgResolutionTimeDays.toFixed(1)} days
Escalations: ${escalated.length}

Provide a single paragraph (max 3 sentences) summarizing this ward's performance in plain language. Be objective, highlight trends, and do not use greetings.`

          const response = await groq.chat.completions.create({
            model: 'llama3-8b-8192',
            max_tokens: 100,
            messages: [{ role: 'user', content: prompt }]
          })
          
          summary = response.choices[0]?.message?.content?.trim() || summary
        } catch (aiError) {
          console.error(`AI summary failed for ward ${ward.name}:`, aiError)
        }
      }

      return {
        wardId: ward._id,
        wardName: ward.name,
        volume,
        resolutionRate: Math.round(resolutionRate),
        avgResolutionTimeDays: Number(avgResolutionTimeDays.toFixed(1)),
        escalations: escalated.length,
        summary
      }
    })

    const dashboardStats = await Promise.all(statsPromises)

    res.json(dashboardStats)
  } catch (error) {
    console.error('Error generating dashboard stats:', error)
    res.status(500).json({ error: 'Failed to generate dashboard stats' })
  }
}
