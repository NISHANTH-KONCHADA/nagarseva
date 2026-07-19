import { Request, Response } from 'express'
import Complaint from '../models/Complaint.js'

// Haversine formula to calculate distance between two points in meters
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3 // metres
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export const getSafeRoute = async (req: Request, res: Response) => {
  try {
    const startLat = parseFloat(req.query.startLat as string)
    const startLng = parseFloat(req.query.startLng as string)
    const endLat = parseFloat(req.query.endLat as string)
    const endLng = parseFloat(req.query.endLng as string)

    if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
      res.status(400).json({ error: 'Valid startLat, startLng, endLat, endLng are required' })
      return
    }

    // Get all unresolved unsafe_area complaints
    const unsafeComplaints = await Complaint.find({
      type: 'unsafe_area',
      status: { $ne: 'resolved' }
    })

    // Generate 3 candidate paths (using a simple midpoint offset approach)
    // Path 1: Direct line (Start -> Midpoint -> End)
    const midLat = (startLat + endLat) / 2
    const midLng = (startLng + endLng) / 2

    // Simple orthogonal offset for Path 2 and Path 3
    const latDiff = endLat - startLat
    const lngDiff = endLng - startLng
    
    // Offset magnitude (roughly 0.005 degrees, approx 500m)
    const offsetMag = 0.005 
    
    const candidates = [
      {
        id: 'path_direct',
        points: [
          { lat: startLat, lng: startLng },
          { lat: midLat, lng: midLng },
          { lat: endLat, lng: endLng }
        ],
        score: 0
      },
      {
        id: 'path_alt_1',
        points: [
          { lat: startLat, lng: startLng },
          { lat: midLat - lngDiff * offsetMag, lng: midLng + latDiff * offsetMag },
          { lat: endLat, lng: endLng }
        ],
        score: 0
      },
      {
        id: 'path_alt_2',
        points: [
          { lat: startLat, lng: startLng },
          { lat: midLat + lngDiff * offsetMag, lng: midLng - latDiff * offsetMag },
          { lat: endLat, lng: endLng }
        ],
        score: 0
      }
    ]

    // Score paths: Count complaints within 100m of any point on the path
    candidates.forEach(path => {
      let riskScore = 0
      unsafeComplaints.forEach(complaint => {
        // Check if this complaint is within 100m of any point in the path
        const isNear = path.points.some(point => {
          const dist = getDistanceInMeters(point.lat, point.lng, complaint.location.lat, complaint.location.lng)
          return dist <= 100 // within 100 meters
        })
        
        if (isNear) {
          riskScore += complaint.severity // Weight by severity
        }
      })
      path.score = riskScore
    })

    // Sort by lowest risk score
    candidates.sort((a, b) => a.score - b.score)

    res.json({
      candidates,
      recommended: candidates[0].id
    })
  } catch (error) {
    console.error('Error generating safe route:', error)
    res.status(500).json({ error: 'Failed to generate safe route' })
  }
}
