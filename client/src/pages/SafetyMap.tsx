import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Filter } from 'lucide-react'

// Assign L to window so leaflet plugins can find it when dynamically imported
;(window as any).L = L

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function HeatLayer({ data }: { data: any[] }) {
  const map = useMap()
  
  useEffect(() => {
    let heatLayer: any;
    
    // Dynamically import leaflet.heat after window.L is set
    import('leaflet.heat').then(() => {
      const heatData: [number, number, number][] = data.map(complaint => {
        const ageDays = (Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        let intensity = complaint.severity
        if (ageDays > 7) intensity *= 0.5
        if (ageDays > 30) intensity *= 0.2
        return [complaint.location.lat, complaint.location.lng, intensity] as [number, number, number]
      })
      
      // @ts-ignore
      if (L.heatLayer) {
        heatLayer = L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 15,
          max: 5,
          gradient: {0.2: '#0ea5e9', 0.4: '#10b981', 0.6: '#eab308', 0.8: '#f97316', 1.0: '#ef4444'}
        }).addTo(map)
      }
    })

    return () => {
      if (heatLayer) map.removeLayer(heatLayer)
    }
  }, [data, map])

  return null
}

export default function SafetyMap() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [timeOfDay, setTimeOfDay] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHeatmapData = async () => {
      setLoading(true)
      try {
        let url = `${API_URL}/api/complaints?type=unsafe_area`
        if (timeOfDay !== 'all') {
          url += `&timeOfDay=${timeOfDay}`
        }
        
        const res = await fetch(url)
        const json = await res.json()
        setComplaints(json.data)
      } catch (err) {
        console.error('Failed to fetch heatmap data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHeatmapData()
  }, [timeOfDay])

  const center = [17.3850, 78.4867]

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative z-10">
      <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 tracking-tight">Safety Heatmap</h2>
          <p className="text-stone-600 mt-2 font-medium text-lg">Visualizing high-risk areas based on severity and recency</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto glass-input relative z-10 p-1">
          <Filter className="w-5 h-5 text-emerald-600 ml-3" />
          <select 
            value={timeOfDay} 
            onChange={(e) => setTimeOfDay(e.target.value)}
            className="bg-transparent border-none text-stone-700 font-bold focus:ring-0 cursor-pointer w-full outline-none py-2 px-2 appearance-none"
          >
            <option value="all">All Times</option>
            <option value="morning">Morning (6am - 12pm)</option>
            <option value="afternoon">Afternoon (12pm - 6pm)</option>
            <option value="evening">Evening (6pm - 12am)</option>
            <option value="night">Night (12am - 6am)</option>
          </select>
        </div>
      </div>

      <div className="relative h-[65vh] min-h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl glass-panel p-2">
        <div className="w-full h-full rounded-2xl overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 z-[1000] bg-white/40 backdrop-blur-md flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-xl px-8 py-5 rounded-3xl shadow-2xl font-bold text-emerald-700 flex items-center gap-4 border border-emerald-200/50">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                Loading Map Data...
              </div>
            </div>
          )}
          <MapContainer 
            center={center as [number, number]} 
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <HeatLayer data={complaints} />
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
