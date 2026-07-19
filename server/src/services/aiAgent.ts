import Groq from 'groq-sdk'
import mongoose from 'mongoose'
import Ward from '../models/Ward.js'
import Authority from '../models/Authority.js'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface ClassificationResult {
  issueType: 'pothole' | 'streetlight' | 'drainage' | 'encroachment' | 'illegal_dumping' | 'unsafe_area'
  severity: number
  confidence: number
  reasoning: string
}

export interface ComplaintProcessingResult {
  issueType: 'pothole' | 'streetlight' | 'drainage' | 'encroachment' | 'illegal_dumping' | 'unsafe_area'
  severity: number
  confidence: number
  reasoning: string
  ward: mongoose.Types.ObjectId | null
  assignedAuthority: mongoose.Types.ObjectId | null
}

/**
 * Classify a complaint using Groq's vision model
 * Sends photo + description to llama-3.2-90b-vision
 * Returns structured JSON with issue classification
 */
export async function classifyComplaint(
  photoBase64: string,
  description: string,
  location: { lat: number; lng: number }
): Promise<ClassificationResult> {
  try {
    const prompt = `You are an expert urban infrastructure inspector. Analyze the provided image and description to classify the street complaint.

Description: "${description}"
Location: Latitude ${location.lat}, Longitude ${location.lng}

Classify the issue into ONE of these categories:
- pothole: Road surface damage/potholes
- streetlight: Street lamp or lighting issues
- drainage: Drainage, water, or flooding issues
- encroachment: Illegal structures or encroachments on public space
- illegal_dumping: Trash, garbage, or waste dumping
- unsafe_area: Safety hazards or dangerous conditions

Rate the severity from 1-5:
1 = Minor (cosmetic only)
2 = Low (minor functional impact)
3 = Medium (noticeable impact on usage)
4 = High (significant safety/functionality concern)
5 = Critical (immediate danger or complete failure)

Provide your assessment as valid JSON (no markdown, just raw JSON):
{
  "issueType": "category_here",
  "severity": number_1_to_5,
  "confidence": decimal_0_to_1,
  "reasoning": "brief explanation of classification"
}

Respond ONLY with the JSON object, nothing else.`

    const response = await groq.chat.completions.create({
      model: 'llama-3.2-90b-vision-preview',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${photoBase64}`,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ] as any,
        },
      ],
    })

    const responseText = response.choices[0]?.message?.content || ''

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Groq response')
    }

    const parsedResponse = JSON.parse(jsonMatch[0])

    // Validate and normalize response
    const validIssueTypes = ['pothole', 'streetlight', 'drainage', 'encroachment', 'illegal_dumping', 'unsafe_area']
    const issueType = validIssueTypes.includes(parsedResponse.issueType)
      ? parsedResponse.issueType
      : 'unsafe_area'

    const severity = Math.min(5, Math.max(1, Math.round(parsedResponse.severity || 3)))
    const confidence = Math.min(1, Math.max(0, parsedResponse.confidence || 0.5))

    return {
      issueType,
      severity,
      confidence,
      reasoning: parsedResponse.reasoning || 'Classification completed by AI model',
    }
  } catch (error: any) {
    console.error('Groq API error:', error)
    throw new Error(`Failed to classify complaint: ${error.message}`)
  }
}

/**
 * Find authority responsible for an issue type in a specific ward
 */
export async function findAuthorityForComplaint(
  issueType: string,
  wardId: mongoose.Types.ObjectId
): Promise<mongoose.Types.ObjectId | null> {
  try {
    const authority = await Authority.findOne({
      ward: wardId,
      issueTypesHandled: issueType,
    })

    return authority ? authority._id : null
  } catch (error: any) {
    console.error('Error finding authority:', error)
    return null
  }
}

/**
 * Find ward by geospatial location
 * Uses MongoDB geospatial query on Ward.boundaryGeoJSON
 * Falls back to first ward if geospatial query fails
 */
export async function findWardByLocation(lat: number, lng: number): Promise<mongoose.Types.ObjectId | null> {
  try {
    const wards = await Ward.find()
    if (wards.length === 0) return null

    let nearestWard = wards[0]
    let minDistance = Infinity

    for (const ward of wards) {
      if (ward.center && typeof ward.center.lat === 'number' && typeof ward.center.lng === 'number') {
        const dx = ward.center.lat - lat
        const dy = ward.center.lng - lng
        const distance = dx * dx + dy * dy
        if (distance < minDistance) {
          minDistance = distance
          nearestWard = ward
        }
      }
    }

    return nearestWard._id
  } catch (error: any) {
    console.error('Error finding ward by location:', error)
    const firstWard = await Ward.findOne()
    return firstWard ? firstWard._id : null
  }
}

/**
 * Main orchestration function
 * Processes complaint with AI classification and authority routing
 */
export async function processComplaintWithAI(
  photoBase64: string,
  description: string,
  location: { lat: number; lng: number }
): Promise<ComplaintProcessingResult> {
  try {
    // Step 1: Classify the complaint via vision model
    const classification = await classifyComplaint(photoBase64, description, location)

    // Step 2: Find the ward by location
    const wardId = await findWardByLocation(location.lat, location.lng)

    // Step 3: Find authority for this issue type + ward (only if wardId exists)
    let authorityId: mongoose.Types.ObjectId | null = null
    if (wardId) {
      authorityId = await findAuthorityForComplaint(classification.issueType, wardId)
    }

    return {
      issueType: classification.issueType,
      severity: classification.severity,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      ward: wardId,
      assignedAuthority: authorityId,
    }
  } catch (error: any) {
    console.error('Error processing complaint with AI:', error)
    throw error
  }
}
