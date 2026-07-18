import { Request, Response } from 'express'
import Ward from '../models/Ward.js'

// List all wards with pagination
export const getWards = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const wards = await Ward.find()
      .limit(limit)
      .skip(skip)
      .sort({ name: 1 })

    const total = await Ward.countDocuments()

    res.json({
      data: wards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wards' })
  }
}

// Get single ward by ID
export const getWardById = async (req: Request, res: Response) => {
  try {
    const ward = await Ward.findById(req.params.id)

    if (!ward) {
      res.status(404).json({ error: 'Ward not found' })
      return
    }

    res.json(ward)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ward' })
  }
}

// Create new ward
export const createWard = async (req: Request, res: Response) => {
  try {
    const { name, boundaryGeoJSON, authorityContacts } = req.body

    // Validate required fields
    if (!name) {
      res.status(400).json({ error: 'Name is required' })
      return
    }

    if (boundaryGeoJSON && !validateGeoJSON(boundaryGeoJSON)) {
      res.status(400).json({ error: 'Invalid GeoJSON format' })
      return
    }

    const ward = new Ward({
      name,
      boundaryGeoJSON: boundaryGeoJSON || { type: 'FeatureCollection', features: [] },
      authorityContacts: authorityContacts || {},
    })

    const saved = await ward.save()
    res.status(201).json(saved)
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Ward name already exists' })
      return
    }
    res.status(500).json({ error: error.message || 'Failed to create ward' })
  }
}

// Update ward
export const updateWard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { boundaryGeoJSON, ...updateData } = req.body

    if (boundaryGeoJSON && !validateGeoJSON(boundaryGeoJSON)) {
      res.status(400).json({ error: 'Invalid GeoJSON format' })
      return
    }

    const ward = await Ward.findByIdAndUpdate(
      id,
      { ...updateData, ...(boundaryGeoJSON && { boundaryGeoJSON }) },
      { new: true, runValidators: true }
    )

    if (!ward) {
      res.status(404).json({ error: 'Ward not found' })
      return
    }

    res.json(ward)
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Ward name already exists' })
      return
    }
    res.status(500).json({ error: error.message || 'Failed to update ward' })
  }
}

// Delete ward
export const deleteWard = async (req: Request, res: Response) => {
  try {
    const ward = await Ward.findByIdAndDelete(req.params.id)

    if (!ward) {
      res.status(404).json({ error: 'Ward not found' })
      return
    }

    res.json({ message: 'Ward deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ward' })
  }
}

// Helper function to validate GeoJSON
function validateGeoJSON(geoJSON: any): boolean {
  if (!geoJSON.type || geoJSON.type !== 'FeatureCollection') {
    return false
  }
  if (!Array.isArray(geoJSON.features)) {
    return false
  }
  return true
}
