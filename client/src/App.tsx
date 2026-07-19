import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { AlertCircle, FileText, Map as MapIcon, BarChart3 } from 'lucide-react'

import ReportIssue from './pages/ReportIssue'
import MyComplaints from './pages/MyComplaints'
import Heatmap from './pages/Heatmap'
import Dashboard from './pages/Dashboard'

function BottomNav() {
  const location = useLocation()
  
  const navItems = [
    { path: '/report', label: 'Report', icon: <AlertCircle className="w-6 h-6" /> },
    { path: '/my-complaints', label: 'Track', icon: <FileText className="w-6 h-6" /> },
    { path: '/heatmap', label: 'Map', icon: <MapIcon className="w-6 h-6" /> },
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart3 className="w-6 h-6" /> }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-[9999] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/report')
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {item.icon}
              <span className={`text-[10px] font-semibold ${isActive ? 'text-teal-600' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
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
      <div className="bg-slate-100 min-h-screen flex justify-center selection:bg-teal-200 selection:text-teal-900 font-sans">
        {/* Mobile device constraint wrapper for desktop */}
        <div className="w-full sm:max-w-md bg-white min-h-screen shadow-2xl relative overflow-x-hidden">
          
          <header className="bg-teal-600 text-white p-4 sticky top-0 z-[9999] shadow-md">
            <h1 className="text-xl font-bold text-center tracking-wide">NagarSeva</h1>
          </header>

          <main className="flex-grow w-full h-full">
            <Routes>
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/my-complaints" element={<MyComplaints />} />
              <Route path="/heatmap" element={<Heatmap />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/report" replace />} />
              <Route path="*" element={<Navigate to="/report" replace />} />
            </Routes>
          </main>
          
          <BottomNav />
        </div>
      </div>
    </Router>
  )
}

export default App
