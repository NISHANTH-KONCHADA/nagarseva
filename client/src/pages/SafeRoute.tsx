import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin, Navigation, Shield, Loader2, Info } from 'lucide-react'

// Fix default icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function MapEvents({ onMapClick }: { onMapClick: (latlng: any) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng)
    },
  })
  return null
}

export default function SafeRoute() {
  const [start, setStart] = useState<any>(null)
  const [end, setEnd] = useState<any>(null)
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMapClick = (latlng: any) => {
    if (!start) {
      setStart(latlng)
    } else if (!end) {
      setEnd(latlng)
    } else {
      setStart(latlng)
      setEnd(null)
      setRoutes([])
    }
  }

  const findSafeRoute = async () => {
    if (!start || !end) return
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`${API_URL}/api/routes/safe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: { lat: start.lat, lng: start.lng },
          end: { lat: end.lat, lng: end.lng }
        })
      })

      if (!res.ok) throw new Error('Failed to fetch routes')
      const data = await res.json()
      setRoutes(data.routes)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const defaultCenter = [17.3850, 78.4867]

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative z-10">
      <div className="glass-panel p-6 sm:p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-2xl shadow-inner border border-emerald-500/20">
                  <Shield className="w-8 h-8" />
                </div>
                Safer Route Finder
              </h2>
              <p className="text-stone-600 mt-4 font-medium text-lg">Navigate the city securely. Our AI agent scores candidate paths based on real-time unresolved safety hazards.</p>
            </div>
            
            <div className="bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow-sm">
              <h3 className="font-bold text-stone-800 flex items-center mb-4 uppercase tracking-wider text-sm">
                <Info className="w-4 h-4 mr-2 text-emerald-500" />
                Instructions
              </h3>
              <ul className="text-stone-700 space-y-3 text-sm font-semibold">
                <li className="flex items-center"><MapPin className="w-5 h-5 text-emerald-500 mr-3" /> 1. Click map to set Start Point</li>
                <li className="flex items-center"><MapPin className="w-5 h-5 text-rose-500 mr-3" /> 2. Click map to set End Point</li>
                <li className="flex items-center"><Navigation className="w-5 h-5 text-sky-500 mr-3" /> 3. Click "Find Safest Route"</li>
              </ul>
            </div>
          </div>
          
          <div className="md:w-80 flex flex-col justify-end space-y-5">
            <div className="space-y-4 bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/60">
              <div className="flex items-center justify-between text-sm font-bold text-stone-700">
                <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-3 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>Start:</span>
                <span className="text-stone-600 bg-white/60 px-3 py-1.5 rounded-xl font-mono text-xs border border-white">{start ? `${start.lat.toFixed(4)}, ${start.lng.toFixed(4)}` : 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-stone-700">
                <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-rose-500 mr-3 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>End:</span>
                <span className="text-stone-600 bg-white/60 px-3 py-1.5 rounded-xl font-mono text-xs border border-white">{end ? `${end.lat.toFixed(4)}, ${end.lng.toFixed(4)}` : 'Not set'}</span>
              </div>
            </div>
            <button
              onClick={findSafeRoute}
              disabled={!start || !end || loading}
              className={`w-full py-4 px-4 text-lg font-black tracking-wide uppercase transition-all duration-300 flex items-center justify-center ${
                !start || !end || loading 
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed rounded-2xl' 
                  : 'glass-button'
              }`}
            >
              {loading ? (
                <><Loader2 className="w-6 h-6 animate-spin mr-2" /> Analyzing Paths...</>
              ) : (
                <><Navigation className="w-6 h-6 mr-2" /> Find Safest Route</>
              )}
            </button>
            
            {error && <div className="text-rose-800 text-sm font-bold bg-rose-500/20 backdrop-blur-sm p-4 rounded-xl border border-rose-400/30 text-center shadow-inner">{error}</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 h-[600px] rounded-3xl overflow-hidden shadow-2xl glass-panel p-2 relative z-0">
          <div className="w-full h-full rounded-2xl overflow-hidden">
            <MapContainer 
              center={defaultCenter as [number, number]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <MapEvents onMapClick={handleMapClick} />
              
              {start && <Marker position={start} />}
              {end && <Marker position={end} />}

              {routes.map((route, idx) => (
                <Polyline 
                  key={idx}
                  positions={route.path.map((p: any) => [p.lat, p.lng])} 
                  color={idx === 0 ? '#10b981' : '#a8a29e'} 
                  weight={idx === 0 ? 8 : 4}
                  opacity={idx === 0 ? 0.9 : 0.6}
                  dashArray={idx !== 0 ? '10, 10' : undefined}
                />
              ))}
            </MapContainer>
          </div>
        </div>
        
        {/* Route Details Panel */}
        <div className="glass-panel p-6 sm:p-8 h-fit">
          <h3 className="font-bold text-stone-800 text-2xl tracking-tight mb-6 flex items-center"><Navigation className="w-6 h-6 mr-3 text-emerald-500"/>Route Analysis</h3>
          {routes.length > 0 ? (
            <div className="space-y-5">
              {routes.map((route, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border transition-all ${idx === 0 ? 'bg-emerald-500/10 border-emerald-400/40 shadow-inner' : 'bg-white/40 border-white/60'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`font-bold tracking-wide ${idx === 0 ? 'text-emerald-800' : 'text-stone-700'}`}>
                      {idx === 0 ? 'Safest Recommended' : `Alternative ${idx}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`text-4xl font-black ${idx === 0 ? 'text-emerald-600' : 'text-stone-400'}`}>
                      {route.score}
                    </div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-widest leading-tight">
                      Hazard<br/>Score
                    </span>
                  </div>
                  <p className={`text-sm font-semibold mt-3 ${idx === 0 ? 'text-emerald-700' : 'text-stone-500'}`}>
                    {idx === 0 ? 'Lowest risk based on active reports.' : 'Higher risk path.'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-dashed border-stone-300">
              <Shield className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-600 font-bold text-base">Select points and find a route to see safety scores.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
