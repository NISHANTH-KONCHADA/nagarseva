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
    <div className="max-w-5xl mx-auto relative z-10 pt-4 pb-20">
      <div className="glass-panel p-10 mb-12 border-b-4 border-emerald-500/30 text-center sm:text-left relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-stone-800 to-emerald-600 tracking-tighter mb-4 relative z-10">My Reports</h2>
        <p className="text-stone-600 mt-2 text-xl font-medium max-w-2xl relative z-10">Track the real-time status and AI resolution history of your civic issues.</p>
      </div>
      
      <div className="space-y-12">
        {complaints.map(complaint => {
          const statusStyle = getStatusStyle(complaint.status)
          return (
            <div key={complaint._id} className="glass-panel overflow-hidden group hover:scale-[1.02] transition-transform duration-500 hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="p-8 sm:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="px-5 py-2 bg-white/70 backdrop-blur-md text-stone-800 rounded-full text-xs font-black uppercase tracking-widest border border-white/60 shadow-sm">
                        {complaint.type.replace('_', ' ')}
                      </span>
                      <span className="px-5 py-2 bg-emerald-500/10 backdrop-blur-md text-emerald-800 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm">
                        Level {complaint.severity}/5
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-stone-800 leading-tight mb-4 tracking-tight group-hover:text-emerald-900 transition-colors">{complaint.description}</h3>
                    <p className="text-sm text-stone-500 flex items-center gap-2 font-bold tracking-widest uppercase">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      {format(new Date(complaint.createdAt), 'MMM d, yyyy \u2022 h:mm a')}
                    </p>
                  </div>
                  
                  <div className={`flex items-center space-x-3 px-6 py-4 rounded-3xl border shadow-lg backdrop-blur-xl ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text} whitespace-nowrap`}>
                    {statusStyle.icon}
                    <span className="font-black capitalize tracking-widest text-lg">{complaint.status}</span>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="mt-10 pt-10 border-t border-stone-200/50 bg-stone-50/50 -mx-8 sm:-mx-10 px-8 sm:px-10 pb-8 rounded-b-3xl">
                  <h4 className="text-sm font-black text-stone-700 mb-8 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" /> Resolution Journey
                  </h4>
                  <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-emerald-300 before:via-emerald-400/50 before:to-transparent">
                    {complaint.statusHistory.map((history: any, index: number) => (
                      <div key={index} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group/timeline pb-10 last:pb-0">
                        {/* Marker */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-emerald-500 shadow-xl shrink-0 md:order-1 md:group-odd/timeline:-translate-x-1/2 md:group-even/timeline:translate-x-1/2 z-10 transition-transform duration-300 group-hover/timeline:scale-125"></div>
                        
                        {/* Content */}
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-3rem)] bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-md border border-white/80 group-hover/timeline:-translate-y-1 transition-transform duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                            <h5 className="font-black text-lg text-stone-800 capitalize tracking-wide">{history.status}</h5>
                            <span className="text-xs text-stone-500 font-bold bg-white px-3 py-1.5 rounded-xl shadow-sm tracking-widest uppercase">{format(new Date(history.timestamp), 'MMM d, h:mm a')}</span>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-stone-600 font-medium leading-relaxed mt-2">{history.notes}</p>
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
