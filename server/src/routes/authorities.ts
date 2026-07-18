import express from 'express'
import {
  getAuthorities,
  getAuthorityById,
  createAuthority,
  updateAuthority,
  deleteAuthority,
} from '../controllers/authorities.js'

const router = express.Router()

// List all authorities with pagination
router.get('/', getAuthorities)

// Get single authority by ID
router.get('/:id', getAuthorityById)

// Create new authority
router.post('/', createAuthority)

// Update authority
router.put('/:id', updateAuthority)

// Delete authority
router.delete('/:id', deleteAuthority)

export default router
