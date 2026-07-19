import { useState, useRef } from 'react'
import { Camera, MapPin, Send, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ReportIssue() {
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<any | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLocationClick = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (err) => {
          setError('Failed to get location. Please ensure location services are enabled.')
          console.error(err)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser.')
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 800
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        setPhotoBase64(dataUrl)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !location || !photoBase64) {
      setError('Please provide a photo, location, and description.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const userId = localStorage.getItem('nagarseva_user_id')

    try {
      const response = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          photoUrl: photoBase64,
          location,
          userId
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit complaint')
      }

      const result = await response.json()
      setSuccess(result)
      
      setDescription('')
      setLocation(null)
      setPhotoBase64(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto relative z-10">
      <div className="glass-panel overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600/90 to-teal-700/90 backdrop-blur-md px-6 py-8 text-center sm:text-left border-b border-white/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <h2 className="text-3xl font-bold text-white tracking-tight relative z-10">Report an Issue</h2>
          <p className="text-emerald-50 mt-2 text-sm sm:text-base font-medium relative z-10">Help keep our city safe and clean. AI will route your issue automatically.</p>
        </div>
        
        <div className="p-6 sm:p-8">
          {success && (
            <div className="mb-6 p-5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-2xl shadow-inner relative overflow-hidden">
              <div className="flex items-center space-x-3 mb-3 relative z-10">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="text-emerald-900 font-bold text-lg">Issue Reported Successfully!</h3>
              </div>
              <div className="text-sm text-emerald-800 space-y-2 ml-9 relative z-10 font-medium">
                <p><span className="font-bold text-emerald-900">Classification:</span> {success.aiClassification?.issueType}</p>
                <p><span className="font-bold text-emerald-900">Severity:</span> {success.aiClassification?.severity}/5</p>
                <p><span className="font-bold text-emerald-900">Routed To:</span> {success.assignedAuthority?.name || 'Pending assignment'}</p>
                <div className="mt-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl italic text-emerald-800 shadow-sm border border-emerald-200/50">
                  "{success.aiClassification?.reasoning}"
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-xl text-red-800 font-medium text-sm flex items-center shadow-sm">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 text-red-600" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 tracking-wide uppercase">Capture Photo Evidence</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all duration-300 ${
                  photoBase64 
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-inner' 
                    : 'border-stone-400/50 bg-white/30 hover:border-emerald-400 hover:bg-white/50 hover:shadow-md backdrop-blur-sm'
                }`}
              >
                {photoBase64 ? (
                  <div className="flex flex-col items-center">
                    <img src={photoBase64} alt="Preview" className="h-40 object-contain mb-3 rounded-xl shadow-md border border-white/50" />
                    <span className="text-sm text-emerald-800 font-bold bg-emerald-100/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">Tap to change photo</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-stone-600">
                    <div className="bg-white/60 p-4 rounded-full mb-4 shadow-sm border border-white/50">
                      <Camera className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="font-bold text-stone-800">Click to capture or upload photo</p>
                    <p className="text-xs mt-2 text-stone-600 max-w-xs mx-auto font-medium">Our AI agent will automatically analyze the image to determine the issue type and severity.</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 tracking-wide uppercase">Location</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleLocationClick}
                  className="flex-1 sm:flex-none flex items-center justify-center px-5 py-3 glass-input font-bold text-stone-700 hover:scale-105 hover:bg-white/80 active:scale-95"
                >
                  <MapPin className={`w-5 h-5 mr-2 ${location ? 'text-emerald-500' : 'text-stone-500'}`} />
                  {location ? 'Location Captured' : 'Get Current Location'}
                </button>
                {location && (
                  <span className="text-sm text-emerald-800 font-bold bg-emerald-500/20 backdrop-blur-sm px-4 py-3 rounded-xl border border-emerald-400/30 text-center shadow-inner">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 tracking-wide uppercase">Additional Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full glass-input placeholder-stone-500 text-stone-800 font-medium"
                placeholder="Provide any helpful details for the authorities..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center py-4 px-4 text-lg font-black tracking-wide uppercase ${
                loading ? 'bg-stone-300 text-stone-500 cursor-not-allowed rounded-xl' : 'glass-button'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Analyzing & Routing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Civic Report
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
