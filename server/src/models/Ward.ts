import mongoose, { Document, Schema } from 'mongoose'

export interface IWard extends Document {
  name: string
  center: { lat: number; lng: number }
  boundaryGeoJSON: GeoJSON.FeatureCollection
  authorityContacts: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const wardSchema = new Schema<IWard>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    boundaryGeoJSON: {
      type: {
        type: String,
        enum: ['FeatureCollection'],
        required: true,
      },
      features: {
        type: [
          {
            type: {
              type: String,
              enum: ['Feature'],
              required: true,
            },
            geometry: {
              type: {
                type: String,
                enum: ['Polygon', 'MultiPolygon'],
                required: true,
              },
              coordinates: {
                type: Schema.Types.Mixed,
                required: true,
              },
            },
            properties: {
              type: Schema.Types.Mixed,
            },
          },
        ],
      },
    },
    authorityContacts: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IWard>('Ward', wardSchema)
