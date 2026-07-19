import { Request, Response } from 'express'
import Complaint from '../models/Complaint.js'
import { processComplaintWithAI } from '../services/aiAgent.js'

// List all complaints with pagination
export const getComplaints = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const filter: any = {}
    if (req.query.userId) filter.userId = req.query.userId as string
    if (req.query.type) filter.type = req.query.type as string

    if (req.query.timeOfDay) {
      const tod = req.query.timeOfDay as string
      let hourRanges: number[] = []
      if (tod === 'morning') hourRanges = [6, 12]
      else if (tod === 'afternoon') hourRanges = [12, 18]
      else if (tod === 'evening') hourRanges = [18, 24]
      else if (tod === 'night') hourRanges = [0, 6]

      if (hourRanges.length) {
        filter.$expr = {
          $and: [
            { $gte: [{ $hour: '$createdAt' }, hourRanges[0]] },
            { $lt: [{ $hour: '$createdAt' }, hourRanges[1]] }
          ]
        }
      }
    }

    const complaints = await Complaint.find(filter)
      .populate('ward')
      .populate('assignedAuthority')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })

    const total = await Complaint.countDocuments(filter)

    res.json({
      data: complaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' })
  }
}

// Get single complaint by ID
export const getComplaintById = async (req: Request, res: Response) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('ward')
      .populate('assignedAuthority')

    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' })
      return
    }

    res.json(complaint)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaint' })
  }
}
// Create new complaint (with AI classification and auto-routing)
export const createComplaint = async (req: Request, res: Response) => {
  try {
    const {
      description,
      photoUrl,
      location,
      status,
      userId,
    } = req.body

    // Validate required fields
    if (!description || !location) {
      res.status(400).json({ error: 'Missing required fields: description, location' })
      return
    }

    if (!location.lat || !location.lng) {
      res.status(400).json({ error: 'Location must include lat and lng' })
      return
    }

    let aiResult = null
    let photoBase64 = null

    // If photo is provided, extract base64 and process with AI
    if (photoUrl) {
      try {
        // Handle different photo input formats
        if (photoUrl.startsWith('data:image')) {
          // Already base64 data URI
          photoBase64 = photoUrl.split(',')[1]
        } else if (photoUrl.startsWith('http')) {
          // URL - convert to base64
          const response = await fetch(photoUrl)
          const buffer = await response.arrayBuffer()
          photoBase64 = Buffer.from(buffer).toString('base64')
        } else {
          // Assume it's already base64
          photoBase64 = photoUrl
        }

        // Process complaint with AI classification and routing
        aiResult = await processComplaintWithAI(photoBase64, description, location)
      } catch (aiError) {
        console.error('AI processing error:', aiError)
        // Continue without AI classification - return error but allow manual creation
        res.status(400).json({
          error: 'Failed to process complaint image with AI. Please provide valid photo or try again.',
          details: aiError instanceof Error ? aiError.message : 'Unknown error',
        })
        return
      }
    } else {
      // No photo provided - cannot use AI classification
      res.status(400).json({
        error: 'Photo is required for AI-powered complaint classification and auto-routing',
      })
      return
    }

    // Create complaint with AI-determined values
    const complaint = new Complaint({
      type: aiResult.issueType,
      description,
      photoUrl,
      location,
      ward: aiResult.ward,
      severity: aiResult.severity,
      status: status || 'routed',
      userId,
      assignedAuthority: aiResult.assignedAuthority,
      escalationLevel: 0,
      aiConfidence: aiResult.confidence,
      aiReasoning: aiResult.reasoning,
      statusHistory: [
        {
          status: status || 'routed',
          timestamp: new Date(),
          notes: `Auto-classified by AI with ${(aiResult.confidence * 100).toFixed(0)}% confidence`,
        },
      ],
    })

    const saved = await complaint.save()
    const populated = await saved.populate(['ward', 'assignedAuthority'])

    res.status(201).json({
      ...populated.toObject(),
      aiClassification: {
        issueType: aiResult.issueType,
        severity: aiResult.severity,
        confidence: aiResult.confidence,
        reasoning: aiResult.reasoning,
      },
    })
  } catch (error: any) {
    console.error('Create complaint error:', error)
    res.status(500).json({ error: error.message || 'Failed to create complaint' })
  }
}


// Update complaint
export const updateComplaint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, ...updateData } = req.body

    const complaint = await Complaint.findById(id)
    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' })
      return
    }

    // If status is being updated, add to statusHistory
    if (status && status !== complaint.status) {
      complaint.statusHistory.push({
        status,
        timestamp: new Date(),
        notes: req.body.statusNotes,
      })
    }

    Object.assign(complaint, updateData)
    if (status) complaint.status = status

    const saved = await complaint.save()
    const populated = await saved.populate(['ward', 'assignedAuthority'])

    res.json(populated)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update complaint' })
  }
}

// Delete complaint
export const deleteComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id)

    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' })
      return
    }

    res.json({ message: 'Complaint deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete complaint' })
  }
}
