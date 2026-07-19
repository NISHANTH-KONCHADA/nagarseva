import { useState, useRef } from 'react'
import { Camera, MapPin, Loader2, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ReportIssue() {
  const [step, setStep] = useState(1)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<any | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLocationClick = () => {
    setLoadingLocation(true)
    setError(null)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLoadingLocation(false)
          setStep(3)
        },
        (err) => {
          setError('Failed to get location. Please ensure location services are enabled.')
          setLoadingLocation(false)
          console.error(err)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser.')
      setLoadingLocation(false)
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

    // Using a pseudo-userId as requested
    let userId = localStorage.getItem('nagarseva_user_id')
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(2, 9)
      localStorage.setItem('nagarseva_user_id', userId)
    }

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

  const getSeverityColor = (severity: number) => {
    switch(severity) {
      case 1: return 'bg-green-100 text-green-800'
      case 2: return 'bg-yellow-100 text-yellow-800'
      case 3: return 'bg-orange-100 text-orange-800'
      case 4: return 'bg-red-100 text-red-800'
      case 5: return 'bg-red-600 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 pt-8 px-6 pb-24">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Issue Reported</h2>
          <p className="text-slate-500 mb-8">AI has automatically classified and routed your issue.</p>
          
          <div className="bg-slate-50 rounded-xl p-5 text-left space-y-4 mb-8 border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Classification</span>
              <span className="font-semibold text-slate-800 capitalize">{success.aiClassification?.issueType.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Severity</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getSeverityColor(success.aiClassification?.severity)}`}>
                Level {success.aiClassification?.severity}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Routed To</span>
              <span className="font-semibold text-teal-700">{success.assignedAuthority?.name || 'Pending'}</span>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600 italic">"{success.aiClassification?.reasoning}"</p>
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
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-4 px-6 rounded-xl transition-colors min-h-[44px]"
          >
            Report Another Issue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-4 pb-24">
      <div className="max-w-md mx-auto">
        
        {/* Simple Progress Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                step >= num ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > num ? <CheckCircle2 className="w-4 h-4" /> : num}
              </div>
              {num < 3 && (
                <div className="hidden sm:block h-1 w-full bg-slate-200 absolute -z-10 translate-y-4"></div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Step 1: Photo */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Add Photo</h2>
              <p className="text-slate-500 mb-8 text-sm">Take a clear picture of the civic issue.</p>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-teal-300 bg-teal-50 hover:bg-teal-100 rounded-2xl p-10 text-center cursor-pointer transition-colors"
              >
                <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center mb-4 shadow-sm text-teal-600">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-teal-900 mb-1">Open Camera</h3>
                <p className="text-teal-600/70 text-sm">Tap to capture image</p>
                
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
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-medium mb-6">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirm Location</h2>
              <p className="text-slate-500 mb-8 text-sm">We need the exact GPS coordinates to route this correctly.</p>
              
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-6">
                  <MapPin className="w-10 h-10 text-blue-600" />
                </div>
                
                <button
                  type="button"
                  onClick={handleLocationClick}
                  disabled={loadingLocation}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-4 px-6 rounded-xl transition-colors min-h-[44px] flex items-center justify-center"
                >
                  {loadingLocation ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Capturing Location...</>
                  ) : (
                    'Capture GPS Location'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details & Submit */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-medium mb-6">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Final Details</h2>
              <p className="text-slate-500 mb-8 text-sm">Provide a short description of what you observed.</p>
              
              <div className="space-y-6">
                <div className="flex gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {photoBase64 && <img src={photoBase64} alt="Evidence preview" className="w-16 h-16 object-cover rounded-lg" />}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center text-teal-700 text-sm font-semibold mb-1">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Photo attached
                    </div>
                    {location && (
                      <div className="flex items-center text-blue-700 text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Location captured
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[44px]"
                    placeholder="E.g. Large pothole on the main road causing traffic..."
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !description.trim()}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-medium py-4 px-6 rounded-xl transition-colors min-h-[44px] flex items-center justify-center"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
