import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import healthRoutes from './routes/health.js'
import complaintRoutes from './routes/complaints.js'
import wardRoutes from './routes/wards.js'
import authorityRoutes from './routes/authorities.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/city-complaints'

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  })

// Routes
app.use('/api', healthRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/wards', wardRoutes)
app.use('/api/authorities', authorityRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(`Client URL: ${CLIENT_URL}`)
})

