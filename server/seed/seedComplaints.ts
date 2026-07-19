import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Complaint from '../src/models/Complaint.js'
import Ward from '../src/models/Ward.js'
import Authority from '../src/models/Authority.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nagarseva'

const samplePhotos = [
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1584984285816-f3316cc24a35?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=400'
]

async function seedComplaints() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing complaints
    await Complaint.deleteMany({})
    console.log('Cleared existing complaints')

    const wards = await Ward.find()
    const authorities = await Authority.find()

    if (wards.length === 0 || authorities.length === 0) {
      throw new Error('Please run seedWardsAuthorities.ts first!')
    }

    const types = ['pothole', 'streetlight', 'drainage', 'encroachment', 'illegal_dumping', 'unsafe_area']
    const complaintsToCreate = []

    // Center roughly around Hyderabad
    const baseLat = 17.3850
    const baseLng = 78.4867

    for (let i = 0; i < 25; i++) {
      const ward = wards[Math.floor(Math.random() * wards.length)]
      const type = types[Math.floor(Math.random() * types.length)]
      const authority = authorities.find(a => 
        a.ward.toString() === ward._id.toString() && a.type === type
      )

      // Randomize status and dates to test escalation and dashboard
      // 20% resolved, 20% old enough to trigger escalation (older than 2 mins), 60% fresh
      let status = 'routed'
      let createdAt = new Date()
      let updatedAt = new Date()
      
      const rand = Math.random()
      if (rand < 0.2) {
        status = 'resolved'
        createdAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        updatedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      } else if (rand < 0.4) {
        // Stale complaint, triggers escalation (needs to be > 2 mins old in our demo)
        createdAt = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        updatedAt = createdAt
      } else {
        // Fresh complaint
        createdAt = new Date(Date.now() - 30 * 1000) // 30 seconds ago
        updatedAt = createdAt
      }

      complaintsToCreate.push({
        type,
        description: `Sample complaint regarding ${type.replace('_', ' ')} in ${ward.name}`,
        photoUrl: samplePhotos[Math.floor(Math.random() * samplePhotos.length)],
        location: {
          lat: baseLat + (Math.random() - 0.5) * 0.05,
          lng: baseLng + (Math.random() - 0.5) * 0.05
        },
        ward: ward._id,
        severity: Math.floor(Math.random() * 3) + 3, // 3 to 5
        status,
        assignedAuthority: authority?._id,
        escalationLevel: 0,
        aiConfidence: 0.85 + (Math.random() * 0.1),
        aiReasoning: 'Auto-generated seed complaint for demo purposes.',
        statusHistory: [{
          status: 'submitted',
          timestamp: createdAt,
          notes: 'Complaint submitted by citizen'
        }, {
          status: 'routed',
          timestamp: new Date(createdAt.getTime() + 1000),
          notes: 'AI automatically routed complaint'
        }, ...(status === 'resolved' ? [{
          status: 'resolved',
          timestamp: updatedAt,
          notes: 'Issue resolved by authority'
        }] : [])],
        createdAt,
        updatedAt
      })
    }

    await Complaint.insertMany(complaintsToCreate)
    console.log(`Successfully seeded ${complaintsToCreate.length} complaints`)

  } catch (error) {
    console.error('Error seeding complaints:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedComplaints()
