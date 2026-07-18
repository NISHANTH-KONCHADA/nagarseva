import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Ward from '../src/models/Ward.js'
import Authority from '../src/models/Authority.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/city-complaints'

// Issue type to department mapping
const issueTypeMappings: Record<string, string> = {
  pothole: 'Municipal Roads Department',
  streetlight: 'Electricity Board',
  drainage: 'Water & Drainage Department',
  encroachment: 'Town Planning & Development Authority',
  illegal_dumping: 'Municipal Sanitation & Waste Management',
  unsafe_area: 'Local Police & Public Safety Department',
}

// Ward data with GeoJSON boundaries (real-looking fake coordinates around city center)
const wardsData = [
  {
    name: 'Downtown Ward',
    lat: 40.7128,
    lng: -74.0060,
    contacts: {
      emergency: '+1-555-0101',
      main_office: '+1-555-0102',
      office_address: '123 Main St, Downtown',
      office_hours: '9 AM - 6 PM, Monday-Friday',
    },
  },
  {
    name: 'East Ward',
    lat: 40.7614,
    lng: -73.9776,
    contacts: {
      emergency: '+1-555-0201',
      main_office: '+1-555-0202',
      office_address: '456 East Ave, East District',
      office_hours: '8 AM - 5 PM, Monday-Friday',
    },
  },
  {
    name: 'North Ward',
    lat: 40.8088,
    lng: -73.9482,
    contacts: {
      emergency: '+1-555-0301',
      main_office: '+1-555-0302',
      office_address: '789 North Blvd, North Area',
      office_hours: '9 AM - 6 PM, Monday-Friday',
    },
  },
  {
    name: 'South Ward',
    lat: 40.6892,
    lng: -73.9760,
    contacts: {
      emergency: '+1-555-0401',
      main_office: '+1-555-0402',
      office_address: '321 South Lane, South Sector',
      office_hours: '8 AM - 5 PM, Monday-Friday',
    },
  },
  {
    name: 'West Ward',
    lat: 40.7282,
    lng: -74.0145,
    contacts: {
      emergency: '+1-555-0501',
      main_office: '+1-555-0502',
      office_address: '654 West Street, West Zone',
      office_hours: '9 AM - 6 PM, Monday-Friday',
    },
  },
]

/**
 * Create a GeoJSON polygon boundary around a center point
 * Returns a square boundary approximately 2km x 2km
 */
function createBoundaryPolygon(centerLat: number, centerLng: number): GeoJSON.FeatureCollection {
  const offset = 0.015 // ~1.5km at equator

  const polygon = [
    [
      [centerLng - offset, centerLat - offset],
      [centerLng + offset, centerLat - offset],
      [centerLng + offset, centerLat + offset],
      [centerLng - offset, centerLat + offset],
      [centerLng - offset, centerLat - offset], // Close the polygon
    ],
  ]

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: polygon,
        },
        properties: {
          name: 'Ward Boundary',
        },
      },
    ],
  }
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    console.log('\n?? Connecting to MongoDB...')
    console.log(`   URI: ${MONGODB_URI}`)

    await mongoose.connect(MONGODB_URI)
    console.log('? Connected to MongoDB\n')

    // Check if data already exists
    const existingWards = await Ward.countDocuments()
    const existingAuthorities = await Authority.countDocuments()

    if (existingWards > 0 || existingAuthorities > 0) {
      console.log('??  Database already contains data:')
      console.log(`   - ${existingWards} wards`)
      console.log(`   - ${existingAuthorities} authorities`)
      console.log('\n?? To reset, run: npm run seed:clear\n')
      await mongoose.connection.close()
      return
    }

    console.log('?? Starting seed operation...\n')

    let totalAuthoritiesCreated = 0
    const createdWardsInfo: Array<{ name: string; id: string; authorities: number }> = []

    // Create wards and their authorities
    for (const wardData of wardsData) {
      console.log(`?? Creating ward: ${wardData.name}`)

      const boundary = createBoundaryPolygon(wardData.lat, wardData.lng)

      // Create ward
      const ward = await Ward.create({
        name: wardData.name,
        boundaryGeoJSON: boundary,
        authorityContacts: wardData.contacts,
      })

      console.log(`   ? Ward created (ID: ${ward._id})`)

      // Create authorities for this ward
      const authorities = []
      const issueTypes = Object.keys(issueTypeMappings)

      for (const issueType of issueTypes) {
        const authority = await Authority.create({
          name: `${wardData.name} - ${issueTypeMappings[issueType]}`,
          department: issueTypeMappings[issueType],
          issueTypesHandled: [issueType],
          ward: ward._id,
        })
        authorities.push(authority)
        totalAuthoritiesCreated++
      }

      console.log(
        `   ? Created ${authorities.length} authorities:\n` +
          authorities
            .map(
              (a) =>
                `      • ${issueTypeMappings[a.issueTypesHandled[0]]} (${a.issueTypesHandled[0]})`
            )
            .join('\n')
      )

      createdWardsInfo.push({
        name: wardData.name,
        id: ward._id.toString(),
        authorities: authorities.length,
      })

      console.log()
    }

    // Print summary
    console.log('=' .repeat(70))
    console.log('? SEED OPERATION COMPLETED SUCCESSFULLY')
    console.log('=' .repeat(70))
    console.log()
    console.log('?? Summary:')
    console.log(`   • Wards created: ${createdWardsInfo.length}`)
    console.log(`   • Authorities created: ${totalAuthoritiesCreated}`)
    console.log()
    console.log('?? Ward Details:')
    createdWardsInfo.forEach((ward) => {
      console.log(`   ? ${ward.name}`)
      console.log(`     - ID: ${ward.id}`)
      console.log(`     - Authorities: ${ward.authorities}`)
    })
    console.log()

    // Sample queries
    console.log('?? Sample MongoDB Queries:')
    console.log()
    console.log('   1. Find all wards:')
    console.log('      db.wards.find({})')
    console.log()
    console.log('   2. Find authorities for "Downtown Ward":')
    console.log('      db.authorities.find({name: /Downtown Ward/})')
    console.log()
    console.log('   3. Find who handles "pothole" issues:')
    console.log('      db.authorities.find({issueTypesHandled: "pothole"})')
    console.log()
    console.log('   4. Count authorities by department:')
    console.log('      db.authorities.aggregate([{$group: {_id: "$department", count: {$sum: 1}}}])')
    console.log()

    console.log('=' .repeat(70))
  } catch (error) {
    console.error('\n? Seed operation failed:')
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`)
      if (error.message.includes('E11000')) {
        console.error('   Cause: Duplicate unique field detected')
        console.error('   Tip: Run "npm run seed:clear" to reset the database')
      }
    } else {
      console.error(`   Error: ${error}`)
    }
    process.exit(1)
  } finally {
    console.log('\n?? Closing database connection...')
    await mongoose.connection.close()
    console.log('? Connection closed\n')
  }
}

// Run the seed
seedDatabase()
