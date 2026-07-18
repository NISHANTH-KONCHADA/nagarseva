# Seed Script Documentation

## Overview

This directory contains database seeding scripts for the City Complaints application.

### Scripts

#### 1. **seedWardsAuthorities.ts** - Create sample data
Creates 5 sample wards with GeoJSON boundaries and 30 authority entries (6 per ward).

**Run:**
```bash
npm run seed
```

**What it creates:**
- **5 Wards**: Downtown Ward, East Ward, North Ward, South Ward, West Ward
  - Each with realistic GeoJSON polygon boundaries (~2km × 2km)
  - Contact information (emergency, main office, address, hours)
- **30 Authorities**: 6 per ward covering all issue types
  - pothole ? Municipal Roads Department
  - streetlight ? Electricity Board
  - drainage ? Water & Drainage Department
  - encroachment ? Town Planning & Development Authority
  - illegal_dumping ? Municipal Sanitation & Waste Management
  - unsafe_area ? Local Police & Public Safety Department

**Output Example:**
```
?? Connecting to MongoDB...
? Connected to MongoDB

?? Starting seed operation...

?? Creating ward: Downtown Ward
   ? Ward created (ID: 670e4c1a2b3c4d5e6f7g8h9i)
   ? Created 6 authorities:
      • Municipal Roads Department (pothole)
      • Electricity Board (streetlight)
      • Water & Drainage Department (drainage)
      • Town Planning & Development Authority (encroachment)
      • Municipal Sanitation & Waste Management (illegal_dumping)
      • Local Police & Public Safety Department (unsafe_area)
...
? SEED OPERATION COMPLETED SUCCESSFULLY
?? Summary:
   • Wards created: 5
   • Authorities created: 30
```

#### 2. **clearDatabase.ts** - Reset database
Deletes all wards, authorities, and complaints.

**Run:**
```bash
npm run seed:clear
```

**Clears:**
- All Ward documents
- All Authority documents
- All Complaint documents

---

## How to Use

### 1. Ensure MongoDB is Running
```bash
# If using MongoDB locally
mongod
```

### 2. Setup Environment
Create/verify `.env` in server directory:
```env
MONGODB_URI=mongodb://localhost:27017/city-complaints
```

### 3. Run the Seed
```bash
cd server
npm install  # if needed
npm run seed
```

### 4. Verify Data
```bash
# Option A: Using MongoDB Shell
mongosh
> use city-complaints
> db.wards.find({})
> db.authorities.find({})

# Option B: Using API
# Wards: GET http://localhost:5000/api/wards
# Authorities: GET http://localhost:5000/api/authorities
```

---

## Database Verification Queries

### MongoDB Shell / Mongosh

```javascript
// Find all wards
db.wards.find({})

// Find all authorities
db.authorities.find({})

// Find authorities for "Downtown Ward"
db.authorities.find({name: /Downtown Ward/})

// Find who handles "pothole" issues
db.authorities.find({issueTypesHandled: "pothole"})

// Count authorities by department
db.authorities.aggregate([
  {$group: {_id: "$department", count: {$sum: 1}}}
])

// Find a ward with its boundaries
db.wards.find({name: "Downtown Ward"}).pretty()

// Count total documents
db.wards.countDocuments()
db.authorities.countDocuments()
```

### REST API Queries

```bash
# Get all wards
curl http://localhost:5000/api/wards

# Get all authorities
curl http://localhost:5000/api/authorities

# Get a specific ward by ID (from seeding output)
curl http://localhost:5000/api/wards/{wardId}

# Get authorities for a specific ward
curl http://localhost:5000/api/authorities?ward={wardId}
```

---

## Data Structure Examples

### Ward Document
```json
{
  "_id": "670e4c1a2b3c4d5e6f7g8h9i",
  "name": "Downtown Ward",
  "boundaryGeoJSON": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-74.021, 40.6978],
              [-73.991, 40.6978],
              [-73.991, 40.7278],
              [-74.021, 40.7278],
              [-74.021, 40.6978]
            ]
          ]
        },
        "properties": {
          "name": "Ward Boundary"
        }
      }
    ]
  },
  "authorityContacts": {
    "emergency": "+1-555-0101",
    "main_office": "+1-555-0102",
    "office_address": "123 Main St, Downtown",
    "office_hours": "9 AM - 6 PM, Monday-Friday"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Authority Document
```json
{
  "_id": "670e4c1b2b3c4d5e6f7g8h9j",
  "name": "Downtown Ward - Municipal Roads Department",
  "department": "Municipal Roads Department",
  "issueTypesHandled": ["pothole"],
  "ward": "670e4c1a2b3c4d5e6f7g8h9i",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## Resetting the Database

If you need to start over:

```bash
# Clear all data
npm run seed:clear

# Reseed with fresh data
npm run seed
```

---

## Troubleshooting

### "E11000 duplicate key error"
**Problem:** Database already has data
**Solution:**
```bash
npm run seed:clear
npm run seed
```

### "connect ECONNREFUSED 127.0.0.1:27017"
**Problem:** MongoDB is not running
**Solution:**
```bash
# Start MongoDB
mongod

# Or if using Docker
docker run -d -p 27017:27017 mongo
```

### "MONGODB_URI not found"
**Problem:** `.env` file missing or not configured
**Solution:**
```bash
cd server
cp .env.example .env
# Edit .env and set correct MONGODB_URI
```

---

## Development Notes

- Coordinates are centered around NYC (40.7128°N, 74.0060°W)
- Each ward boundary is approximately 2km × 2km
- Department mappings follow realistic municipal structures
- Contact information is fake but formatted realistically
- All authorities are marked with their ward relationship for routing
