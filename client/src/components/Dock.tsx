import { Link, useLocation } from 'react-router-dom'
import { Home, AlertTriangle, Map, ShieldAlert, BarChart3, List } from 'lucide-react'

export function Dock() {
  const location = useLocation()

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Report', path: '/report', icon: AlertTriangle },
    { name: 'Complaints', path: '/my-complaints', icon: List },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Map', path: '/safety-map', icon: Map },
    { name: 'Routes', path: '/safe-route', icon: ShieldAlert },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="glass-panel px-4 py-3 flex items-center gap-2 sm:gap-4 rounded-3xl border border-white/40 shadow-2xl backdrop-blur-xl bg-white/30">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.name}
              to={link.path}
              className="relative group flex flex-col items-center justify-center transition-all duration-300"
            >
              <div 
                className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] -translate-y-2' 
                    : 'bg-white/40 hover:bg-white/60 hover:-translate-y-1'
                }`}
              >
                <link.icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300 ${isActive ? 'text-white' : 'text-stone-600 group-hover:text-emerald-700'}`} />
              </div>
              
              {/* Tooltip */}
              <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform duration-200 bg-stone-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                {link.name}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-800 rotate-45"></div>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
