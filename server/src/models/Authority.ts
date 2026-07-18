import mongoose, { Document, Schema } from 'mongoose'

export interface IAuthority extends Document {
  name: string
  department: string
  issueTypesHandled: string[]
  ward: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const authoritySchema = new Schema<IAuthority>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    issueTypesHandled: [
      {
        type: String,
        enum: ['pothole', 'streetlight', 'drainage', 'encroachment', 'illegal_dumping', 'unsafe_area'],
      },
    ],
    ward: {
      type: Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IAuthority>('Authority', authoritySchema)
