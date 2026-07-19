import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Navbar } from './components/Navbar'
import { FloatingAssistant } from './components/FloatingAssistant'

import ReportIssue from './pages/ReportIssue'
import MyComplaints from './pages/MyComplaints'
import SafetyMap from './pages/SafetyMap'
import SafeRoute from './pages/SafeRoute'
import Dashboard from './pages/Dashboard'

function HomePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="glass-panel p-12 max-w-3xl w-full flex flex-col items-center relative z-10">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 mb-6 drop-shadow-sm">Welcome to Nagarseva</h1>
        <p className="text-xl text-gray-700 max-w-2xl font-medium leading-relaxed">
          The unified civic platform for reporting issues, tracking resolutions, and navigating your city safely.
        </p>
      </div>
    </div>
  )
}

function App() {
  // Ensure a persistent userId exists for the session
  useEffect(() => {
    if (!localStorage.getItem('nagarseva_user_id')) {
      localStorage.setItem('nagarseva_user_id', uuidv4())
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900 relative overflow-hidden">
        {/* Ambient background blur blobs */}
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none animate-blob"></div>
        <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-teal-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="fixed -bottom-32 left-1/2 w-[600px] h-[600px] bg-sky-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none animate-blob" style={{ animationDelay: '4s' }}></div>

        <Navbar />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Routes>
            <Route path="/" element={<HomePlaceholder />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/my-complaints" element={<MyComplaints />} />
            <Route path="/safety-map" element={<SafetyMap />} />
            <Route path="/safe-route" element={<SafeRoute />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <FloatingAssistant />
      </div>
    </Router>
  )
}

export default App
