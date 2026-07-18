import express from 'express'
import {
  getWards,
  getWardById,
  createWard,
  updateWard,
  deleteWard,
} from '../controllers/wards.js'

const router = express.Router()

// List all wards with pagination
router.get('/', getWards)

// Get single ward by ID
router.get('/:id', getWardById)

// Create new ward
router.post('/', createWard)

// Update ward
router.put('/:id', updateWard)

// Delete ward
router.delete('/:id', deleteWard)

export default router
