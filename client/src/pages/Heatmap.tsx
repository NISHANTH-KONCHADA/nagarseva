import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import 'leaflet.heat'
import { ShieldAlert, Sun, Sunrise, Moon, Loader2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Component to handle adding heatmap layer to Leaflet map
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap()
  const heatLayerRef = useRef<any>(null)

  useEffect(() => {
    if (!map) return

    // Remove existing layer if it exists
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current)
    }

    if (points.length > 0) {
      // @ts-ignore - leaflet.heat adds this to L
      heatLayerRef.current = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 15,
        gradient: {
          0.4: 'blue',
          0.6: 'cyan',
          0.7: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        }
      }).addTo(map)
    }

    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current)
      }
    }
  }, [map, points])

  return null
}

export default function Heatmap() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'evening' | 'night'>('all')

  useEffect(() => {
    const fetchUnsafeAreas = async () => {
      try {
        setLoading(true)
        // Fetch only 'unsafe_area' complaints
        const url = new URL(`${API_URL}/api/complaints`)
        url.searchParams.append('type', 'unsafe_area')
        
        if (timeFilter !== 'all') {
          url.searchParams.append('timeOfDay', timeFilter)
        }

        const res = await fetch(url.toString())
        if (!res.ok) throw new Error('Failed to fetch data')
        
        const data = await res.json()
        setComplaints(data.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUnsafeAreas()
  }, [timeFilter])

  // Extract lat, lng, and severity weight for heatmap
  const heatPoints: [number, number, number][] = complaints.map(c => [
    c.location.lat, 
    c.location.lng, 
    c.severity / 5 // Normalize severity to 0-1 for weight
  ])

  // Center roughly on Mumbai based on seed data
  const center: [number, number] = [19.0760, 72.8777]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative z-10 pb-20">
      
      {/* Header and Filters overlay */}
      <div className="bg-white px-4 py-6 sm:px-6 shadow-sm border-b border-slate-200 z-[1000] relative">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="text-red-500 w-6 h-6" /> Safety Heatmap
            </h2>
            <p className="text-slate-500 text-sm mt-1">Visualize high-risk "unsafe area" reports across the city.</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
            <button 
              onClick={() => setTimeFilter('all')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${timeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All Time
            </button>
            <button 
              onClick={() => setTimeFilter('morning')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${timeFilter === 'morning' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Sunrise className="w-4 h-4" /> Morning
            </button>
            <button 
              onClick={() => setTimeFilter('evening')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${timeFilter === 'evening' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Sun className="w-4 h-4" /> Evening
            </button>
            <button 
              onClick={() => setTimeFilter('night')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${timeFilter === 'night' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Moon className="w-4 h-4" /> Night
            </button>
          </div>

        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative z-0">
        {loading && (
          <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-[1000] flex items-center justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg flex items-center text-teal-600 font-semibold text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading map data...
            </div>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 p-6 z-10">
            <div className="text-center text-red-700 py-6 px-4 bg-red-50 border border-red-200 rounded-xl max-w-md w-full">
              <p className="font-medium">{error}</p>
            </div>
          </div>
        ) : (
          <MapContainer 
            center={center} 
            zoom={12} 
            style={{ height: '100%', width: '100%', minHeight: '500px' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <HeatmapLayer points={heatPoints} />
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-24 right-4 sm:bottom-6 sm:right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-200 z-[1000]">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Severity Heat</h4>
        <div className="flex h-3 w-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 via-lime-400 to-red-500"></div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mt-1">
          <span>Low</span>
          <span>Critical</span>
        </div>
      </div>
    </div>
  )
}
