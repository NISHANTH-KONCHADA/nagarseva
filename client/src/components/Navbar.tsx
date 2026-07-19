import { Link, useLocation } from 'react-router-dom'
import { Home, AlertTriangle, Map, ShieldAlert, BarChart3, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { name: 'Report Issue', path: '/report', icon: AlertTriangle },
    { name: 'My Complaints', path: '/my-complaints', icon: null },
    { name: 'Safety Map', path: '/safety-map', icon: Map },
    { name: 'Safe Routes', path: '/safe-route', icon: ShieldAlert },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  ]

  return (
    <nav className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="glass-panel flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2 font-bold text-2xl text-emerald-800 tracking-tight hover:scale-105 transition-transform">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-1.5 rounded-xl shadow-lg shadow-emerald-500/30">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span>Nagar<span className="text-emerald-500">Seva</span></span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-2">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-semibold ${
                location.pathname === link.path 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                  : 'text-gray-600 hover:bg-white/50 hover:text-emerald-700'
              }`}
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              <span>{link.name}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-600 hover:text-emerald-700 focus:outline-none p-2 rounded-xl hover:bg-white/50 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden glass-panel mt-2 absolute w-[calc(100%-2rem)] shadow-xl z-50">
          <div className="p-3 space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-semibold ${
                  location.pathname === link.path 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                    : 'text-gray-600 hover:bg-white/50 hover:text-emerald-700'
                }`}
              >
                {link.icon && <link.icon className="w-5 h-5" />}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
