import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { format } from 'date-fns'
import { Clock, AlertTriangle, CheckCircle2, Activity, MapPin } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function MyComplaints() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComplaints = async () => {
    const userId = localStorage.getItem('nagarseva_user_id')
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/complaints?userId=${userId}`)
      if (!res.ok) throw new Error('Failed to fetch complaints')
      const data = await res.json()
      setComplaints(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()

    const socket = io(API_URL)
    
    socket.on('complaint:escalated', (updatedComplaint) => {
      setComplaints(current => 
        current.map(c => c._id === updatedComplaint._id ? { ...c, ...updatedComplaint } : c)
      )
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div></div>
  
  if (error) return (
    <div className="min-h-screen bg-slate-50 pt-8 px-4">
      <div className="text-center text-red-700 py-6 px-4 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto flex flex-col items-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
        <p className="font-medium">{error}</p>
      </div>
    </div>
  )

  if (complaints.length === 0) return (
    <div className="min-h-screen bg-slate-50 pt-16 px-6">
      <div className="text-center bg-white rounded-2xl shadow-sm border border-slate-200 p-10 max-w-md mx-auto">
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-teal-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No complaints found</h3>
        <p className="text-slate-500 text-sm">You haven't reported any civic issues yet.</p>
      </div>
    </div>
  )

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'resolved': return { icon: <CheckCircle2 className="w-4 h-4 text-teal-600" />, bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' }
      case 'escalated': return { icon: <AlertTriangle className="w-4 h-4 text-red-600" />, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
      default: return { icon: <Clock className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-24 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        
        <div className="mb-8 px-2">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">My Reports</h2>
          <p className="text-slate-500 text-sm">Track the real-time status of your civic issues.</p>
        </div>
        
        <div className="space-y-6">
          {complaints.map(complaint => {
            const statusStyle = getStatusStyle(complaint.status)
            return (
              <div key={complaint._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header info */}
                <div className="p-5 sm:p-6 pb-4">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold uppercase tracking-wider">
                          {complaint.type.replace('_', ' ')}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${complaint.severity >= 4 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'}`}>
                          Level {complaint.severity}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">{complaint.description}</h3>
                    </div>
                    
                    <div className={`flex flex-col items-center px-3 py-2 rounded-lg border ${statusStyle.bg} ${statusStyle.border} shrink-0`}>
                      {statusStyle.icon}
                      <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${statusStyle.text}`}>{complaint.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-slate-400" />
                      {format(new Date(complaint.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                      {complaint.ward?.name || 'Unknown Ward'}
                    </span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="bg-slate-50 border-t border-slate-100 p-5 sm:p-6">
                  <h4 className="text-xs font-bold text-slate-500 mb-5 uppercase tracking-wider flex items-center">
                    <Activity className="w-4 h-4 mr-2" /> Timeline
                  </h4>
                  
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:w-0.5 before:bg-slate-200 before:h-full before:-translate-y-2">
                    {complaint.statusHistory.map((history: any, index: number) => (
                      <div key={index} className="relative flex items-start gap-4 z-10">
                        {/* Marker */}
                        <div className={`w-6 h-6 rounded-full border-2 border-white flex-shrink-0 mt-0.5 shadow-sm ${
                          index === 0 ? 'bg-teal-500' : 'bg-slate-300'
                        }`}></div>
                        
                        {/* Content */}
                        <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-100 -mt-1">
                          <div className="flex justify-between items-center mb-1">
                            <h5 className="font-semibold text-slate-800 capitalize text-sm">{history.status}</h5>
                            <span className="text-xs text-slate-400 font-medium">{format(new Date(history.timestamp), 'MMM d, h:mm a')}</span>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-slate-600 mt-2">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
