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
    <div className="max-w-7xl mx-auto space-y-6 relative z-10 pb-20">
      <div className="glass-panel p-10 mb-8 border-b-4 border-emerald-500/30">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-stone-800 to-emerald-600 tracking-tighter mb-4">Accountability Hub</h2>
        <p className="text-stone-600 text-xl font-medium max-w-2xl">Real-time civic performance metrics and AI summaries for all wards.</p>
      </div>

      {/* Bento Box Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* Big KPI 1 (Spans 2 cols) */}
        <div className="col-span-1 md:col-span-2 glass-panel p-8 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors"></div>
          <p className="text-sm text-indigo-800 font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Activity className="w-4 h-4" /> Total Civic Volume</p>
          <div className="text-7xl font-black text-stone-800 tracking-tighter mt-4">{totalVolume}</div>
          <p className="text-indigo-600/80 font-medium mt-4">Total reports across all city wards</p>
        </div>

        {/* Small KPI 1 */}
        <div className="col-span-1 glass-panel p-8 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors"></div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-6" />
          <p className="text-sm text-emerald-800 font-bold uppercase tracking-widest mb-1">Avg Resolution</p>
          <div className="text-4xl font-black text-stone-800">{avgResRate.toFixed(1)}%</div>
        </div>

        {/* Small KPI 2 */}
        <div className="col-span-1 glass-panel p-8 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute -right-5 -bottom-5 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl group-hover:bg-amber-500/30 transition-colors"></div>
          <Clock className="w-8 h-8 text-amber-500 mb-6" />
          <p className="text-sm text-amber-800 font-bold uppercase tracking-widest mb-1">Avg Time</p>
          <div className="text-4xl font-black text-stone-800">{avgResTime.toFixed(1)}d</div>
        </div>

        {/* Main Chart (Spans 2 cols, 2 rows) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 glass-panel p-8">
          <h3 className="font-bold text-stone-800 mb-8 text-2xl flex items-center gap-2"><BarChart className="text-emerald-500 w-6 h-6"/> Volume by Ward</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.4)" />
                <XAxis dataKey="wardName" axisLine={false} tickLine={false} tick={{fill: '#57534e', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#57534e', fontWeight: 600}} />
                <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.4)'}} contentStyle={{borderRadius: '20px', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="volume" name="Total Complaints" radius={[12, 12, 0, 0]}>
                  {stats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorEmerald)" />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small KPI 3 */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 glass-panel p-8 bg-rose-500/5 hover:bg-rose-500/10 transition-colors border border-rose-500/20">
          <ShieldAlert className="w-8 h-8 text-rose-500 mb-6" />
          <p className="text-sm text-rose-800 font-bold uppercase tracking-widest mb-1">Escalations</p>
          <div className="text-5xl font-black text-rose-600">{totalEscalations}</div>
          <p className="text-sm text-rose-600/80 font-bold mt-4 tracking-wide">High priority unresolved</p>
        </div>

        {/* Secondary Chart */}
        <div className="col-span-1 md:col-span-3 lg:col-span-1 lg:row-span-1 glass-panel p-8">
          <h3 className="font-bold text-stone-800 mb-6 text-xl flex items-center gap-2"><Activity className="text-sky-500 w-5 h-5"/> Resolution %</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.4)" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#57534e', fontWeight: 600}} />
                <YAxis dataKey="wardName" type="category" axisLine={false} tickLine={false} tick={{fill: '#57534e', fontWeight: 600}} width={80} />
                <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.4)'}} contentStyle={{borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)'}} />
                <Bar dataKey="resolutionRate" name="Resolution Rate (%)" fill="#0ea5e9" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Ward Summaries spanning full width */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 glass-panel p-10 mt-6">
          <h3 className="font-black text-stone-800 mb-8 text-3xl tracking-tight">AI Ward Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map(ward => (
              <div key={ward.wardId} className="bg-white/40 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-full -z-10 group-hover:scale-[1.5] transition-transform duration-700"></div>
                <div className="flex justify-between items-start mb-6">
                  <h4 className="font-black text-2xl text-stone-800">{ward.wardName}</h4>
                  <div className={`px-4 py-2 rounded-2xl text-xs font-black tracking-widest uppercase border shadow-sm ${
                    ward.resolutionRate >= 70 ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' :
                    ward.resolutionRate >= 40 ? 'bg-amber-500/10 text-amber-800 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-800 border-rose-500/20'
                  }`}>
                    {ward.resolutionRate}% Res
                  </div>
                </div>
                <div className="bg-white/50 p-4 rounded-2xl border border-white/50 shadow-inner mb-6">
                  <p className="text-stone-700 text-sm leading-relaxed italic font-semibold">
                    "{ward.summary}"
                  </p>
                </div>
                <div className="flex justify-between text-xs font-black text-stone-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-rose-500" /> {ward.escalations} Esc.</span>
                  <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-emerald-500" /> {ward.avgResolutionTimeDays}d avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
