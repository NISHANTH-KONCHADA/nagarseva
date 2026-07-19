import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Dock } from './components/Dock'
import { FloatingAssistant } from './components/FloatingAssistant'

import Home from './pages/Home'
import ReportIssue from './pages/ReportIssue'
import MyComplaints from './pages/MyComplaints'
import SafetyMap from './pages/SafetyMap'
import SafeRoute from './pages/SafeRoute'
import Dashboard from './pages/Dashboard'

function App() {
  // Ensure a persistent userId exists for the session
  useEffect(() => {
    if (!localStorage.getItem('nagarseva_user_id')) {
      localStorage.setItem('nagarseva_user_id', uuidv4())
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900 relative overflow-hidden pb-24">
        {/* Ambient background blur blobs */}
        <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none animate-blob"></div>
        <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-teal-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="fixed -bottom-32 left-1/2 w-[600px] h-[600px] bg-sky-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none animate-blob" style={{ animationDelay: '4s' }}></div>

        <main className="flex-grow w-full relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/my-complaints" element={<MyComplaints />} />
            <Route path="/safety-map" element={<SafetyMap />} />
            <Route path="/safe-route" element={<SafeRoute />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <FloatingAssistant />
        <Dock />
      </div>
    </Router>
  )
}

export default App
