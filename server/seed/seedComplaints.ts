import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Ward from '../src/models/Ward.js'
import Authority from '../src/models/Authority.js'
import Complaint from '../src/models/Complaint.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/city-complaints'

const ISSUE_TYPES = ['pothole', 'streetlight', 'drainage', 'encroachment', 'illegal_dumping', 'unsafe_area']
const DESCRIPTIONS = {
  pothole: ['Huge pothole on main road', 'Deep crater avoiding traffic', 'Road broken after rains'],
  streetlight: ['Streetlight not working for days', 'Pitch dark lane', 'Flickering street lamp'],
  drainage: ['Open manhole', 'Clogged drain overflowing', 'Sewage water on street'],
  encroachment: ['Illegal stall blocking footpath', 'Construction material on road', 'Hawkers blocking way'],
  illegal_dumping: ['Garbage dumped on corner', 'Construction debris thrown', 'No garbage pickup'],
  unsafe_area: ['Dark alley feels unsafe', 'Suspicious activity near corner', 'No police patrol']
}
const TIME_OF_DAY = ['morning', 'evening', 'night']

function getRandom(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomLocationInWard(center: {lat: number, lng: number}) {
  const latOffset = (Math.random() - 0.5) * 0.02
  const lngOffset = (Math.random() - 0.5) * 0.02
  return {
    lat: center.lat + latOffset,
    lng: center.lng + lngOffset
  }
}

async function seedComplaints() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    await Complaint.deleteMany({})
    console.log('Cleared existing complaints')

    const wards = await Ward.find()
    const authorities = await Authority.find()

    const complaintsToCreate = []

    for (let i = 0; i < 25; i++) {
      const ward = getRandom(wards)
      const type = getRandom(ISSUE_TYPES)
      const description = getRandom(DESCRIPTIONS[type as keyof typeof DESCRIPTIONS])
      const severity = Math.floor(Math.random() * 5) + 1
      const timeOfDay = getRandom(TIME_OF_DAY)
      const location = getRandomLocationInWard(ward.center)
      
      const wardAuthorities = authorities.filter(a => a.ward.toString() === ward._id.toString())
      const assignedAuthority = wardAuthorities.find(a => a.issueTypesHandled.includes(type))

      const daysAgo = Math.random() * 3
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      const updatedAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000)

      const statusChoices = ['submitted', 'in_progress', 'resolved', 'escalated']
      const status = getRandom(statusChoices)

      complaintsToCreate.push({
        userId: 'test-user-seed',
        type,
        severity,
        description,
        location,
        timeOfDay,
        imageUrl: 'https://via.placeholder.com/400x300?text=Issue+Photo',
        status,
        ward: ward._id,
        assignedTo: assignedAuthority?._id,
        createdAt,
        updatedAt,
        escalationLevel: status === 'escalated' ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 2),
        statusHistory: [
          { status: 'submitted', timestamp: createdAt, notes: 'Complaint submitted' },
          { status, timestamp: updatedAt, notes: `Status changed to ${status}` }
        ]
      })
    }

    await Complaint.insertMany(complaintsToCreate)
    console.log(`Successfully seeded ${complaintsToCreate.length} complaints`)
    
    process.exit(0)
  } catch (error) {
    console.error('Error seeding complaints:', error)
    process.exit(1)
  }
}

seedComplaints()
