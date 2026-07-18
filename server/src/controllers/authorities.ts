import { Request, Response } from 'express'
import Authority from '../models/Authority.js'

// List all authorities with pagination
export const getAuthorities = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const authorities = await Authority.find()
      .populate('ward')
      .limit(limit)
      .skip(skip)
      .sort({ name: 1 })

    const total = await Authority.countDocuments()

    res.json({
      data: authorities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch authorities' })
  }
}

// Get single authority by ID
export const getAuthorityById = async (req: Request, res: Response) => {
  try {
    const authority = await Authority.findById(req.params.id).populate('ward')

    if (!authority) {
      res.status(404).json({ error: 'Authority not found' })
      return
    }

    res.json(authority)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch authority' })
  }
}

// Create new authority
export const createAuthority = async (req: Request, res: Response) => {
  try {
    const { name, department, issueTypesHandled, ward } = req.body

    // Validate required fields
    if (!name || !department || !ward) {
      res.status(400).json({ error: 'Missing required fields: name, department, ward' })
      return
    }

    // Validate issue types
    if (issueTypesHandled) {
      const validTypes = ['pothole', 'streetlight', 'drainage', 'encroachment', 'illegal_dumping', 'unsafe_area']
      for (const type of issueTypesHandled) {
        if (!validTypes.includes(type)) {
          res.status(400).json({ error: `Invalid issue type: ${type}` })
          return
        }
      }
    }

    const authority = new Authority({
      name,
      department,
      issueTypesHandled: issueTypesHandled || [],
      ward,
    })

    const saved = await authority.save()
    const populated = await saved.populate('ward')

    res.status(201).json(populated)
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Authority name already exists' })
      return
    }
    res.status(500).json({ error: error.message || 'Failed to create authority' })
  }
}

// Update authority
export const updateAuthority = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { issueTypesHandled, ...updateData } = req.body

    // Validate issue types if provided
    if (issueTypesHandled) {
      const validTypes = ['pothole', 'streetlight', 'drainage', 'encroachment', 'illegal_dumping', 'unsafe_area']
      for (const type of issueTypesHandled) {
        if (!validTypes.includes(type)) {
          res.status(400).json({ error: `Invalid issue type: ${type}` })
          return
        }
      }
    }

    const authority = await Authority.findByIdAndUpdate(
      id,
      { ...updateData, ...(issueTypesHandled && { issueTypesHandled }) },
      { new: true, runValidators: true }
    ).populate('ward')

    if (!authority) {
      res.status(404).json({ error: 'Authority not found' })
      return
    }

    res.json(authority)
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Authority name already exists' })
      return
    }
    res.status(500).json({ error: error.message || 'Failed to update authority' })
  }
}

// Delete authority
export const deleteAuthority = async (req: Request, res: Response) => {
  try {
    const authority = await Authority.findByIdAndDelete(req.params.id)

    if (!authority) {
      res.status(404).json({ error: 'Authority not found' })
      return
    }

    res.json({ message: 'Authority deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete authority' })
  }
}
