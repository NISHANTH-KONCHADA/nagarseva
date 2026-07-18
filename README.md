# Full-Stack Application

A modern full-stack web application with React + Vite + TypeScript + Tailwind frontend and Node + Express + MongoDB backend.

## Project Structure

```
fullstack-app/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Tailwind CSS
│   ├── public/            # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── index.html
├── server/                # Express backend
│   ├── src/
│   │   ├── index.ts       # Entry point
│   │   ├── controllers/   # Request handlers
│   │   │   └── health.ts
│   │   ├── routes/        # API routes
│   │   │   └── health.ts
│   │   ├── services/      # Business logic (empty scaffold)
│   │   └── models/        # MongoDB models (empty scaffold)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── package.json           # Root workspace config
├── .gitignore
└── README.md
```

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS transformations

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Static typing
- **MongoDB + Mongoose** - Database (scaffolded, not configured)
- **CORS** - Cross-origin request handling
- **dotenv** - Environment configuration

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies for root, client, and server
npm run install:all

# Or manually:
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 2. Configure Environment

Create `.env` in the server folder (copy from `.env.example`):

```bash
cp server/.env.example server/.env
```

Edit `server/.env` as needed for your setup:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fullstack-app
CLIENT_URL=http://localhost:5173
```

### 3. Development

Run both client and server concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1: Frontend (runs on http://localhost:5173)
npm run dev:client

# Terminal 2: Backend (runs on http://localhost:5000)
npm run dev:server
```

### 4. Build for Production

```bash
npm run build
```

This will build both the React app and the Express server.

### 5. Start Production Server

```bash
npm start
```

## API Endpoints

### Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "ok"
  }
  ```

## Development Features

### Client
- Hot module replacement (HMR) with Vite
- Automatic proxy to backend API (configured for `/api/*`)
- TypeScript strict mode enabled
- Tailwind CSS with PostCSS processing

### Server
- Watch mode with `tsx` for automatic restarts on file changes
- CORS configured for client origin
- Error handling middleware
- TypeScript strict mode enabled

## Next Steps

1. **Add Models** - Define Mongoose schemas in `/server/src/models/`
2. **Add Services** - Create business logic in `/server/src/services/`
3. **Add Routes & Controllers** - Expand API routes and request handlers
4. **Add Styling** - Expand Tailwind CSS configuration and components
5. **Setup Database** - Configure MongoDB connection string in `.env`
6. **Add Tests** - Configure Jest or Vitest for testing
7. **Environment Setup** - Create `.env` files for different environments

## Troubleshooting

### Port Already in Use
If port 5000 or 5173 is already in use:
- Change the port in `server/.env` or `client/vite.config.ts`
- Or kill the process using that port

### CORS Issues
Ensure `CLIENT_URL` in `server/.env` matches your frontend URL (default: `http://localhost:5173`)

### MongoDB Connection
Make sure MongoDB is running and the `MONGODB_URI` in `.env` is correct

## License

MIT
