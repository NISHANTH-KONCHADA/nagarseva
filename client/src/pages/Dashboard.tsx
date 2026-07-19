import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Activity, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Dashboard() {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dashboard/wards`)
        if (!res.ok) throw new Error('Failed to fetch dashboard data')
        const data = await res.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>
  if (error) return <div className="text-center py-20 text-red-600 font-medium glass-panel max-w-md mx-auto">{error}</div>

  const totalVolume = stats.reduce((acc, curr) => acc + curr.volume, 0)
  const avgResRate = stats.reduce((acc, curr) => acc + curr.resolutionRate, 0) / (stats.length || 1)
  const totalEscalations = stats.reduce((acc, curr) => acc + curr.escalations, 0)
  const avgResTime = stats.reduce((acc, curr) => acc + curr.avgResolutionTimeDays, 0) / (stats.length || 1)

  return (
    <div className="max-w-7xl mx-auto space-y-10 relative z-10">
      <div className="glass-panel p-8">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 tracking-tight">Public Accountability Dashboard</h2>
        <p className="text-stone-600 mt-3 text-lg font-medium">Real-time civic performance metrics across all wards.</p>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Complaints', value: totalVolume, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100/50' },
          { label: 'Avg Resolution Rate', value: `${avgResRate.toFixed(1)}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
          { label: 'Avg Resolution Time', value: `${avgResTime.toFixed(1)} days`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100/50' },
          { label: 'Total Escalations', value: totalEscalations, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-100/50' },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-panel p-6 flex items-center space-x-5 hover:scale-105 transition-transform duration-300">
            <div className={`${kpi.bg} p-4 rounded-2xl shadow-inner border border-white/40`}><kpi.icon className={`${kpi.color} w-8 h-8`} /></div>
            <div>
              <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className="text-3xl font-black text-stone-800 tracking-tight">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8">
          <h3 className="font-bold text-stone-800 mb-8 text-xl flex items-center gap-2"><BarChart className="text-emerald-500"/> Complaint Volume by Ward</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis dataKey="wardName" axisLine={false} tickLine={false} tick={{fill: '#57534e', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#57534e', fontWeight: 600}} />
                <Tooltip cursor={{fill: 'rgba(245, 245, 244, 0.5)'}} contentStyle={{borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="volume" name="Total Complaints" radius={[8, 8, 0, 0]}>
                  {stats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#059669', '#34d399', '#047857', '#6ee7b7'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8">
          <h3 className="font-bold text-stone-800 mb-8 text-xl flex items-center gap-2"><Activity className="text-sky-500"/> Resolution Rate by Ward (%)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7e5e4" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#57534e', fontWeight: 600}} />
                <YAxis dataKey="wardName" type="category" axisLine={false} tickLine={false} tick={{fill: '#57534e', fontWeight: 600}} width={100} />
                <Tooltip cursor={{fill: 'rgba(245, 245, 244, 0.5)'}} contentStyle={{borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="resolutionRate" name="Resolution Rate (%)" fill="#0ea5e9" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Ward Summaries */}
      <div className="glass-panel p-8">
        <h3 className="font-bold text-stone-800 mb-8 text-2xl tracking-tight">AI Accountability Summaries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {stats.map(ward => (
            <div key={ward.wardId} className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/60 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-300/30 to-transparent rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-stone-200/50">
                <h4 className="font-bold text-xl text-stone-800">{ward.wardName}</h4>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wider border ${
                  ward.resolutionRate >= 70 ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200' :
                  ward.resolutionRate >= 40 ? 'bg-amber-100/80 text-amber-800 border-amber-200' :
                  'bg-rose-100/80 text-rose-800 border-rose-200'
                }`}>
                  {ward.resolutionRate}% Resolved
                </div>
              </div>
              <p className="text-stone-700 text-sm leading-relaxed border-l-4 border-emerald-400 pl-4 py-1 italic font-medium">
                "{ward.summary}"
              </p>
              <div className="mt-6 pt-4 flex justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-rose-400" /> {ward.escalations} Esc.</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-400" /> {ward.avgResolutionTimeDays} days avg</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
