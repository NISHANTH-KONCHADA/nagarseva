import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Ward from '../src/models/Ward.js'
import Authority from '../src/models/Authority.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/city-complaints'

const ISSUE_TYPES = ['pothole', 'streetlight', 'drainage', 'encroachment', 'illegal_dumping', 'unsafe_area']

// Mumbai coordinates roughly
const wardsData = [
  {
    name: 'Andheri (West)',
    center: { lat: 19.1136, lng: 72.8397 },
    boundaryGeoJSON: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[72.82, 19.10], [72.85, 19.10], [72.85, 19.13], [72.82, 19.13], [72.82, 19.10]]]
        }
      }]
    }
  },
  {
    name: 'Bandra (West)',
    center: { lat: 19.0596, lng: 72.8295 },
    boundaryGeoJSON: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[72.81, 19.04], [72.84, 19.04], [72.84, 19.07], [72.81, 19.07], [72.81, 19.04]]]
        }
      }]
    }
  },
  {
    name: 'Colaba',
    center: { lat: 18.9067, lng: 72.8147 },
    boundaryGeoJSON: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[72.80, 18.89], [72.83, 18.89], [72.83, 18.92], [72.80, 18.92], [72.80, 18.89]]]
        }
      }]
    }
  },
  {
    name: 'Dadar',
    center: { lat: 19.0178, lng: 72.8478 },
    boundaryGeoJSON: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[72.83, 19.00], [72.86, 19.00], [72.86, 19.03], [72.83, 19.03], [72.83, 19.00]]]
        }
      }]
    }
  },
  {
    name: 'Borivali',
    center: { lat: 19.2307, lng: 72.8567 },
    boundaryGeoJSON: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[72.84, 19.22], [72.87, 19.22], [72.87, 19.25], [72.84, 19.25], [72.84, 19.22]]]
        }
      }]
    }
  }
]

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    await Ward.deleteMany({})
    await Authority.deleteMany({})
    console.log('Cleared existing wards and authorities')

    for (const wardData of wardsData) {
      const ward = await Ward.create(wardData)
      console.log(`Created ward: ${ward.name}`)

      // Create authorities for this ward
      const authorities = [
        { name: `Roads Dept - ${ward.name}`, department: 'Roads & Traffic', issueTypesHandled: ['pothole', 'encroachment'], ward: ward._id },
        { name: `Electrical Dept - ${ward.name}`, department: 'Electrical', issueTypesHandled: ['streetlight'], ward: ward._id },
        { name: `Water & Sanitation - ${ward.name}`, department: 'Sanitation', issueTypesHandled: ['drainage', 'illegal_dumping'], ward: ward._id },
        { name: `Local Police - ${ward.name}`, department: 'Law & Order', issueTypesHandled: ['unsafe_area'], ward: ward._id },
      ]

      await Authority.insertMany(authorities)
      console.log(`Created authorities for ${ward.name}`)
    }

    console.log('Seeding complete!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

seed()
