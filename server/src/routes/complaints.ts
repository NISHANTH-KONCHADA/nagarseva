import express from 'express'
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} from '../controllers/complaints.js'

const router = express.Router()

// List all complaints with pagination
router.get('/', getComplaints)

// Get single complaint by ID
router.get('/:id', getComplaintById)

// Create new complaint
router.post('/', createComplaint)

// Update complaint
router.put('/:id', updateComplaint)

// Delete complaint
router.delete('/:id', deleteComplaint)

export default router
