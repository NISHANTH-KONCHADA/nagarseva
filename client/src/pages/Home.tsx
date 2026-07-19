import { Link } from 'react-router-dom'
import { ArrowRight, Shield, AlertTriangle, Map } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 overflow-hidden relative z-10 pb-20">
      
      {/* Premium Hero Section */}
      <div className="relative group perspective-1000">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="glass-panel p-10 sm:p-16 max-w-4xl w-full flex flex-col items-center relative z-10 rounded-[3rem] border border-white/50 bg-white/30 backdrop-blur-2xl shadow-2xl transition-transform duration-700 ease-out transform group-hover:scale-[1.02]">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-white/60 mb-8 backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold text-emerald-800 tracking-wide uppercase">Nagarseva AI is Live</span>
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-stone-900 tracking-tighter mb-6 leading-tight">
            City Life, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400">Perfected.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-stone-600 max-w-2xl font-medium leading-relaxed mb-10">
            Report issues seamlessly. Track resolutions instantly. Navigate your city safely with AI-driven insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/report" className="glass-button text-lg flex items-center justify-center gap-2 group px-8 py-4">
              Report an Issue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/dashboard" className="px-8 py-4 rounded-xl font-bold text-emerald-800 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all border border-emerald-500/20 backdrop-blur-sm">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full z-10 px-4">
        <div className="glass-panel p-8 text-left group hover:bg-white/50 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Smart Reporting</h3>
          <p className="text-stone-500 font-medium">AI instantly categorizes and routes your civic complaints to the exact right authority.</p>
        </div>

        <div className="glass-panel p-8 text-left group hover:bg-white/50 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center mb-6 text-sky-600 group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Safe Navigation</h3>
          <p className="text-stone-500 font-medium">Find the safest routes home by avoiding areas with unresolved high-severity reports.</p>
        </div>

        <div className="glass-panel p-8 text-left group hover:bg-white/50 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6 text-amber-600 group-hover:scale-110 transition-transform">
            <Map className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Real-time Heatmaps</h3>
          <p className="text-stone-500 font-medium">Visualize civic health and risk zones across the city with real-time mapping.</p>
        </div>
      </div>
    </div>
  )
}
