import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Ward from '../src/models/Ward.js'
import Authority from '../src/models/Authority.js'
import Complaint from '../src/models/Complaint.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/city-complaints'

/**
 * Clear all data from the database
 */
async function clearDatabase() {
  try {
    console.log('\n???  Connecting to MongoDB...')
    console.log(`   URI: ${MONGODB_URI}`)

    await mongoose.connect(MONGODB_URI)
    console.log('? Connected to MongoDB\n')

    console.log('??  Clearing all collections...\n')

    const complaintCount = await Complaint.deleteMany({})
    console.log(`   ? Deleted ${complaintCount.deletedCount} complaints`)

    const authorityCount = await Authority.deleteMany({})
    console.log(`   ? Deleted ${authorityCount.deletedCount} authorities`)

    const wardCount = await Ward.deleteMany({})
    console.log(`   ? Deleted ${wardCount.deletedCount} wards`)

    console.log('\n? Database cleared successfully\n')
  } catch (error) {
    console.error('\n? Clear operation failed:')
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`)
    } else {
      console.error(`   Error: ${error}`)
    }
    process.exit(1)
  } finally {
    console.log('?? Closing database connection...')
    await mongoose.connection.close()
    console.log('? Connection closed\n')
  }
}

// Run the clear
clearDatabase()
