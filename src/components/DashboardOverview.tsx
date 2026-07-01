import React, { useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";

interface DashboardOverviewProps {
  onSelectCity?: (cityName: string) => void;
}

export default function DashboardOverview({ onSelectCity }: DashboardOverviewProps) {
  const [trendPeriod, setTrendPeriod] = useState("7 Days");

  // Sparkline coordinates for the Orange AQI trend curve
  const sparklinePoints = [
    { label: "01 May", val: 180 },
    { label: "02 May", val: 210 },
    { label: "03 May", val: 195 },
    { label: "04 May", val: 205 },
    { label: "05 May", val: 190 },
    { label: "06 May", val: 215 },
    { label: "07 May", val: 196 }
  ];

  // Map data to SVG viewport (e.g. width=300, height=80)
  const svgWidth = 320;
  const svgHeight = 70;
  const minVal = 100;
  const maxVal = 250;

  const pointsString = sparklinePoints
    .map((p, i) => {
      const x = (i / (sparklinePoints.length - 1)) * (svgWidth - 40) + 20;
      const y = svgHeight - ((p.val - minVal) / (maxVal - minVal)) * (svgHeight - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-[360px] h-full overflow-y-auto bg-[#040d1a] border-l border-slate-800/80 flex flex-col p-4 space-y-4 select-none shrink-0 custom-scrollbar">
      
      {/* 1. NATIONAL OVERVIEW SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase">National Overview</h3>
          <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" /> Auto-sync
          </span>
        </div>

        {/* 2x3 Metric Bento Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Avg AQI */}
          <div className="bg-[#051124] border border-slate-800/60 rounded-lg p-2.5 flex flex-col justify-between h-20 hover:border-slate-700/60 transition-colors">
            <span className="text-[9px] text-slate-400 font-sans leading-tight">Avg AQI (India)</span>
            <div className="text-center my-1">
              <span className="text-2xl font-display font-black text-amber-500">196</span>
            </div>
            <span className="text-[9px] text-amber-500 font-mono text-center font-bold">Poor</span>
          </div>

          {/* Max AQI */}
          <div className="bg-[#051124] border border-slate-800/60 rounded-lg p-2.5 flex flex-col justify-between h-20 hover:border-slate-700/60 transition-colors">
            <span className="text-[9px] text-slate-400 font-sans leading-tight">Max AQI (Today)</span>
            <div className="text-center my-1">
              <span className="text-2xl font-display font-black text-red-500">412</span>
            </div>
            <span className="text-[9px] text-red-500 font-mono text-center font-bold">Severe</span>
          </div>

          {/* Active Fires */}
          <div className="bg-[#051124] border border-slate-800/60 rounded-lg p-2.5 flex flex-col justify-between h-20 hover:border-slate-700/60 transition-colors">
            <span className="text-[9px] text-slate-400 font-sans leading-tight">Active Fires</span>
            <div className="text-center my-1">
              <span className="text-2xl font-display font-black text-orange-500">1256</span>
            </div>
            <span className="text-[9px] text-orange-400 font-mono text-center font-bold">High</span>
          </div>

          {/* HCHO Average */}
          <div className="bg-[#051124] border border-slate-800/60 rounded-lg p-2.5 flex flex-col justify-between h-20 hover:border-slate-700/60 transition-colors">
            <span className="text-[9px] text-slate-400 font-sans leading-tight">HCHO Avg (India)</span>
            <div className="text-center my-1">
              <span className="text-lg font-display font-bold text-sky-400">2.35</span>
            </div>
            <span className="text-[7.5px] text-slate-500 font-mono text-center truncate">×10¹⁵ molec/cm²</span>
          </div>

          {/* PM2.5 Avg */}
          <div className="bg-[#051124] border border-slate-800/60 rounded-lg p-2.5 flex flex-col justify-between h-20 hover:border-slate-700/60 transition-colors">
            <span className="text-[9px] text-slate-400 font-sans leading-tight">PM2.5 Avg</span>
            <div className="text-center my-1">
              <span className="text-lg font-display font-bold text-sky-400">78</span>
            </div>
            <span className="text-[8px] text-slate-500 font-mono text-center">µg/m³</span>
          </div>

          {/* Data Sources */}
          <div className="bg-[#051124] border border-slate-800/60 rounded-lg p-2.5 flex flex-col justify-between h-20 hover:border-slate-700/60 transition-colors">
            <span className="text-[9px] text-slate-400 font-sans leading-tight">Data Sources</span>
            <div className="text-center my-1">
              <span className="text-lg font-display font-bold text-emerald-400">7 / 7</span>
            </div>
            <span className="text-[8px] text-emerald-400 font-mono text-center font-bold">Online</span>
          </div>
        </div>
      </div>

      {/* 2. AQI TREND (INDIA) */}
      <div className="bg-[#051124]/40 border border-slate-800/60 rounded-xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-mono font-bold text-slate-300 tracking-wider uppercase">AQI Trend (India)</h3>
          <div className="relative inline-block">
            <select
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value)}
              className="appearance-none bg-[#030914] border border-slate-800 rounded px-2 py-0.5 pr-6 text-[10px] font-mono text-slate-300 outline-none cursor-pointer"
            >
              <option>7 Days</option>
              <option>30 Days</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1.5 pointer-events-none" />
          </div>
        </div>

        {/* Custom High-Quality Sparkline SVG Chart */}
        <div className="relative h-20 bg-[#030914]/60 border border-slate-900/60 rounded-lg overflow-hidden p-1 flex flex-col justify-between">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            
            {/* Horizontal Grid lines */}
            <line x1="0" y1="20" x2="320" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="45" x2="320" y2="45" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />

            {/* Filled Area beneath trend curve */}
            <polygon
              points={`20,${svgHeight} ${pointsString} 300,${svgHeight}`}
              fill="url(#orangeGrad)"
            />

            {/* Smooth trend curve line */}
            <polyline
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              points={pointsString}
            />

            {/* Glowing active point at the end */}
            <circle cx="300" cy="45" r="4" fill="#f97316" className="animate-pulse" />
            <circle cx="300" cy="45" r="2" fill="#ffffff" />
          </svg>

          {/* Sparkline Axis labels */}
          <div className="flex justify-between px-2 text-[8px] font-mono text-slate-500 mt-1">
            <span>01 May</span>
            <span>03 May</span>
            <span>05 May</span>
            <span>07 May</span>
          </div>
        </div>
      </div>

      {/* 3. TOP 5 MOST POLLUTED CITIES */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase">Top 5 Most Polluted Cities</h3>
        
        <div className="space-y-1.5">
          {[
            { rank: 1, name: "Bhiwadi, Rajasthan", value: 423, color: "bg-purple-600/30 text-purple-400 border-purple-500/30" },
            { rank: 2, name: "Delhi, Delhi", value: 401, color: "bg-purple-600/30 text-purple-400 border-purple-500/30" },
            { rank: 3, name: "Ghaziabad, UP", value: 371, color: "bg-red-600/30 text-red-400 border-red-500/30" },
            { rank: 4, name: "Noida, UP", value: 353, color: "bg-red-600/30 text-red-400 border-red-500/30" },
            { rank: 5, name: "Patna, Bihar", value: 332, color: "bg-red-600/30 text-red-400 border-red-500/30" }
          ].map((city) => (
            <div 
              key={city.rank}
              onClick={() => onSelectCity?.(city.name)}
              className="flex items-center justify-between bg-[#051124] hover:bg-[#071731] border border-slate-900/40 rounded-lg p-2 text-xs transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center font-mono text-[10px] font-bold border border-orange-500/20">
                  {city.rank}
                </span>
                <span className="text-slate-200 font-sans font-medium group-hover:text-white truncate max-w-[170px]">
                  {city.name}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${city.color}`}>
                {city.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SATELLITE STATUS SECTION */}
      <div className="bg-[#051124]/30 border border-slate-800/40 rounded-xl p-3 space-y-2.5">
        <h3 className="text-[11px] font-mono font-bold text-slate-300 tracking-wider uppercase">Satellite Status</h3>
        
        <div className="space-y-1.5 text-[10px] font-mono">
          {[
            { name: "INSAT-3D", role: "AOD", status: "Online" },
            { name: "Sentinel-5P", role: "Gases", status: "Online" },
            { name: "MODIS", role: "Fire", status: "Online" },
            { name: "VIIRS", role: "Fire", status: "Online" },
            { name: "ERA5", role: "Weather", status: "Online" },
            { name: "CPCB", role: "Stations", status: "Online" },
            { name: "GFS", role: "Forecast", status: "Online" }
          ].map((sat, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-slate-900/60 last:border-0">
              <span className="text-slate-300 font-bold">{sat.name}</span>
              <span className="text-slate-500">{sat.role}</span>
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-[9.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{sat.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
