import { useState, useRef } from 'react'
import { Camera, MapPin, Loader2, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ReportIssue() {
  const [step, setStep] = useState(1)
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
          setStep(3)
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
        setStep(2)
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
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto relative z-10 pt-10">
        <div className="glass-panel p-12 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 z-0"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)] mb-6 animate-[blob_3s_infinite]">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black text-stone-800 mb-4 tracking-tight">Report Analyzed & Filed</h2>
            
            <div className="w-full text-left bg-white/50 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-xl mt-6 space-y-4">
              <div className="flex justify-between items-center border-b border-stone-200/50 pb-4">
                <span className="text-stone-500 font-bold uppercase tracking-widest text-sm">Classification</span>
                <span className="font-black text-xl text-emerald-700">{success.aiClassification?.issueType}</span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-200/50 pb-4">
                <span className="text-stone-500 font-bold uppercase tracking-widest text-sm">Severity</span>
                <span className="font-black text-xl text-amber-600">{success.aiClassification?.severity}/5</span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-200/50 pb-4">
                <span className="text-stone-500 font-bold uppercase tracking-widest text-sm">Routed To</span>
                <span className="font-black text-lg text-indigo-700">{success.assignedAuthority?.name || 'Pending assignment'}</span>
              </div>
              <div className="mt-6 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 italic text-stone-700 font-medium">
                "{success.aiClassification?.reasoning}"
              </div>
            </div>

            <button 
              onClick={() => {
                setSuccess(null)
                setStep(1)
                setPhotoBase64(null)
                setLocation(null)
                setDescription('')
              }}
              className="mt-8 glass-button w-full flex items-center justify-center py-4"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto relative z-10 pt-4 pb-20">
      
      {/* Stepper Header */}
      <div className="mb-10 flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-200 -translate-y-1/2 rounded-full z-0"></div>
        <div className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        
        {[1, 2, 3].map((num) => (
          <div key={num} className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full font-black text-lg transition-all duration-500 ${
            step >= num 
              ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110' 
              : 'bg-white text-stone-400 border-2 border-stone-200'
          }`}>
            {step > num ? <CheckCircle2 className="w-6 h-6" /> : num}
          </div>
        ))}
      </div>

      <div className="glass-panel overflow-hidden p-8 sm:p-12">
        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 font-bold flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3 text-rose-500" />
            {error}
          </div>
        )}

        {/* Step 1: Photo */}
        {step === 1 && (
          <div className="animate-[fade-in_0.5s_ease-out]">
            <h2 className="text-4xl font-black text-stone-800 mb-2 tracking-tight">Capture Evidence</h2>
            <p className="text-stone-500 font-medium mb-8">Our AI requires a photo to automatically analyze the issue.</p>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-3 border-dashed border-emerald-400/50 rounded-[3rem] p-12 text-center cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-500 transition-all duration-300 group bg-white/40 backdrop-blur-sm"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-200 transition-all shadow-inner">
                <Camera className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-2">Tap to Upload Photo</h3>
              <p className="text-stone-500 font-medium">Supports PNG, JPG (Max 10MB)</p>
              
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
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="animate-[fade-in_0.5s_ease-out]">
            <button onClick={() => setStep(1)} className="text-stone-500 hover:text-emerald-600 flex items-center gap-2 font-bold mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Photo
            </button>
            <h2 className="text-4xl font-black text-stone-800 mb-2 tracking-tight">Pinpoint Location</h2>
            <p className="text-stone-500 font-medium mb-8">Where exactly is this issue located?</p>
            
            <div className="flex flex-col items-center justify-center p-12 bg-white/40 backdrop-blur-md rounded-[3rem] border border-stone-200/50 shadow-sm">
              <div className="w-32 h-32 bg-sky-100 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-sky-200 rounded-full animate-ping opacity-20"></div>
                <MapPin className="w-12 h-12 text-sky-600 relative z-10" />
              </div>
              <button
                type="button"
                onClick={handleLocationClick}
                className="glass-button text-xl px-10 py-5 w-full sm:w-auto flex items-center justify-center"
              >
                Use Current Location
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details & Submit */}
        {step === 3 && (
          <div className="animate-[fade-in_0.5s_ease-out]">
            <button onClick={() => setStep(2)} className="text-stone-500 hover:text-emerald-600 flex items-center gap-2 font-bold mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Location
            </button>
            <h2 className="text-4xl font-black text-stone-800 mb-2 tracking-tight">Final Details</h2>
            <p className="text-stone-500 font-medium mb-8">Add any extra context to help authorities.</p>
            
            <div className="space-y-6">
              <div className="flex gap-4 mb-8">
                {photoBase64 && <img src={photoBase64} alt="Evidence" className="w-24 h-24 object-cover rounded-2xl shadow-md border border-white/50" />}
                {location && (
                  <div className="flex-1 bg-sky-50 rounded-2xl p-4 flex flex-col justify-center border border-sky-100">
                    <span className="text-xs font-bold text-sky-800 uppercase tracking-widest mb-1">Pinned Location</span>
                    <span className="font-medium text-sky-900">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-3 tracking-widest uppercase">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full glass-input text-lg p-5 rounded-2xl bg-white/60 focus:bg-white"
                  placeholder="E.g. Large pothole on the right lane near the intersection..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full flex items-center justify-center py-5 px-6 text-xl font-black tracking-wide ${
                  loading ? 'bg-stone-200 text-stone-400 cursor-not-allowed rounded-2xl' : 'glass-button'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    AI Analyzing...
                  </>
                ) : (
                  <>
                    Submit to Authorities <ArrowRight className="w-6 h-6 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
