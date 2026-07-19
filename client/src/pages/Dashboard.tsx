import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Activity, Clock, ShieldAlert, CheckCircle2, Map } from 'lucide-react'

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

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div></div>
  if (error) return (
    <div className="min-h-screen bg-slate-50 pt-8 px-4">
      <div className="text-center text-red-700 py-6 px-4 bg-red-50 border border-red-200 rounded-xl max-w-md mx-auto">
        <p className="font-medium">{error}</p>
      </div>
    </div>
  )

  const totalVolume = stats.reduce((acc, curr) => acc + curr.volume, 0)
  const avgResRate = stats.reduce((acc, curr) => acc + curr.resolutionRate, 0) / (stats.length || 1)
  const totalEscalations = stats.reduce((acc, curr) => acc + curr.escalations, 0)
  const avgResTime = stats.reduce((acc, curr) => acc + curr.avgResolutionTimeDays, 0) / (stats.length || 1)

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        <div className="mb-8 px-2">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Ward Dashboard</h2>
          <p className="text-slate-500 text-sm">Real-time civic performance metrics and AI summaries.</p>
        </div>

        {/* Overview KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-500" /> Total Issues
            </p>
            <div className="text-4xl font-black text-slate-900">{totalVolume}</div>
          </div>

          <div className="col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-500" /> Resolved
            </p>
            <div className="text-3xl font-black text-slate-900">{avgResRate.toFixed(1)}%</div>
          </div>

          <div className="col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" /> Avg Time
            </p>
            <div className="text-3xl font-black text-slate-900">{avgResTime.toFixed(1)}d</div>
          </div>
          
          <div className="col-span-2 md:col-span-1 bg-red-50 rounded-2xl p-6 shadow-sm border border-red-100">
            <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Escalated
            </p>
            <div className="text-4xl font-black text-red-700">{totalEscalations}</div>
          </div>

        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Main Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Map className="text-blue-500 w-5 h-5"/> Volume by Ward
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="wardName" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="volume" name="Total Complaints" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-teal-500 w-5 h-5"/> Resolution Rate
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis dataKey="wardName" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={80} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="resolutionRate" name="Resolution Rate (%)" fill="#14b8a6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* AI Ward Summaries */}
        <div className="pt-6">
          <h3 className="font-bold text-slate-900 mb-4 px-2">AI Ward Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map(ward => (
              <div key={ward.wardId} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-lg text-slate-800">{ward.wardName}</h4>
                  <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    ward.resolutionRate >= 70 ? 'bg-teal-50 text-teal-700' :
                    ward.resolutionRate >= 40 ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {ward.resolutionRate}% Res
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {ward.summary}
                  </p>
                </div>
                
                <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-red-400" /> {ward.escalations} Esc.</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-400" /> {ward.avgResolutionTimeDays}d avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
