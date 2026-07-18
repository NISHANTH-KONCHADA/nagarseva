import mongoose, { Document, Schema } from 'mongoose'

export interface IStatusHistory {
  status: string
  timestamp: Date
  notes?: string
}

export interface IComplaint extends Document {
  type: 'pothole' | 'streetlight' | 'drainage' | 'encroachment' | 'illegal_dumping' | 'unsafe_area'
  description: string
  photoUrl?: string
  location: {
    lat: number
    lng: number
  }
  ward: mongoose.Types.ObjectId
  severity: number
  status: 'submitted' | 'routed' | 'in_progress' | 'resolved' | 'escalated'
  assignedAuthority?: mongoose.Types.ObjectId
  escalationLevel: number
  aiConfidence?: number
  aiReasoning?: string
  createdAt: Date
  updatedAt: Date
  statusHistory: IStatusHistory[]
}

const complaintSchema = new Schema<IComplaint>(
  {
    type: {
      type: String,
      enum: ['pothole', 'streetlight', 'drainage', 'encroachment', 'illegal_dumping', 'unsafe_area'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    ward: {
      type: Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
    },
    severity: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'routed', 'in_progress', 'resolved', 'escalated'],
      default: 'submitted',
    },
    assignedAuthority: {
    escalationLevel: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,
    },
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    aiReasoning: {
      type: String,
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
        },
      },
    ],

        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IComplaint>('Complaint', complaintSchema)
