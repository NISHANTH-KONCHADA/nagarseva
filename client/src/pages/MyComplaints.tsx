import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { format } from 'date-fns'
import { Clock, AlertTriangle, CheckCircle2, Activity } from 'lucide-react'

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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>
  if (error) return <div className="text-center text-red-600 py-12 font-medium bg-red-500/20 rounded-xl backdrop-blur-sm border border-red-500/30 max-w-md mx-auto">{error}</div>
  if (complaints.length === 0) return (
    <div className="text-center py-20 glass-panel max-w-2xl mx-auto">
      <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
      <h3 className="text-2xl font-bold text-stone-800 tracking-tight">No complaints found</h3>
      <p className="text-stone-600 mt-2 font-medium">You haven't reported any civic issues yet.</p>
    </div>
  )

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'resolved': return { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-500/20', text: 'text-emerald-800', border: 'border-emerald-400/30' }
      case 'escalated': return { icon: <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />, bg: 'bg-rose-500/20', text: 'text-rose-800', border: 'border-rose-400/30' }
      default: return { icon: <Clock className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-500/20', text: 'text-amber-800', border: 'border-amber-400/30' }
    }
  }

  return (
    <div className="max-w-4xl mx-auto relative z-10">
      <div className="glass-panel p-8 mb-8">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 tracking-tight">My Complaints</h2>
        <p className="text-stone-600 mt-3 text-lg font-medium">Track the real-time status of issues you've reported.</p>
      </div>
      
      <div className="space-y-8">
        {complaints.map(complaint => {
          const statusStyle = getStatusStyle(complaint.status)
          return (
            <div key={complaint._id} className="glass-panel overflow-hidden hover:scale-[1.01] transition-transform duration-300">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="px-4 py-1.5 bg-white/50 backdrop-blur-sm text-stone-800 rounded-full text-xs font-bold uppercase tracking-wider border border-white/60 shadow-sm">
                        {complaint.type.replace('_', ' ')}
                      </span>
                      <span className="px-4 py-1.5 bg-emerald-500/10 backdrop-blur-sm text-emerald-800 rounded-full text-xs font-bold border border-emerald-500/20 shadow-sm">
                        Severity {complaint.severity}/5
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-stone-800 leading-tight">{complaint.description}</h3>
                    <p className="text-sm text-stone-600 mt-3 flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      {format(new Date(complaint.createdAt), 'MMM d, yyyy \u2022 h:mm a')}
                    </p>
                  </div>
                  
                  <div className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl border shadow-sm backdrop-blur-md ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text} whitespace-nowrap`}>
                    {statusStyle.icon}
                    <span className="font-bold capitalize tracking-wide">{complaint.status}</span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="mt-8 pt-8 border-t border-stone-300/50">
                  <h4 className="text-sm font-bold text-stone-700 mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" /> Status History
                  </h4>
                  <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-300 before:via-emerald-400/50 before:to-transparent">
                    {complaint.statusHistory.map((history: any, index: number) => (
                      <div key={index} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active pb-8 last:pb-0">
                        {/* Marker */}
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white/80 bg-emerald-500 shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 backdrop-blur-sm"></div>
                        
                        {/* Content */}
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] bg-white/60 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white/60">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-bold text-stone-800 capitalize tracking-wide">{history.status}</h5>
                            <span className="text-xs text-stone-500 font-medium bg-white/50 px-2 py-1 rounded-md">{format(new Date(history.timestamp), 'MMM d, h:mm a')}</span>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-stone-600 mt-2 font-medium leading-relaxed">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
