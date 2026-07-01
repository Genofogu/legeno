import React, { useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";

interface DashboardOverviewProps {
  onSelectCity?: (cityName: string) => void;
}

export default function DashboardOverview({ onSelectCity }: DashboardOverviewProps) {
  const [trendPeriod, setTrendPeriod] = useState("7 Days");

  // Sparkline coordinates for the Orange AQI trend curve (matching mockup dates 01 May to 07 May)
  const sparklinePoints = [
    { label: "01 May", val: 150 },
    { label: "02 May", val: 210 },
    { label: "03 May", val: 195 },
    { label: "04 May", val: 215 },
    { label: "05 May", val: 228 },
    { label: "06 May", val: 190 },
    { label: "07 May", val: 196 }
  ];

  // Map data to SVG viewport
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
    <div className="w-[360px] h-full overflow-y-auto bg-[#020712] border-l border-slate-900 flex flex-col p-5 space-y-6 select-none shrink-0 custom-scrollbar">
      
      {/* 1. NATIONAL OVERVIEW SECTION */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-sans font-bold text-white tracking-wider uppercase">National Overview</h3>
        </div>

        {/* 2x3 Metric Bento Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Avg AQI */}
          <div className="bg-[#030a16] border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between h-20">
            <span className="text-[9px] text-slate-400 font-sans leading-tight">Avg AQI (India)</span>
            <div className="text-center">
              <span className="text-2xl font-sans font-extrabold text-[#f97316]">196</span>
            </div>
            <span className="text-[9px] text-[#f97316] font-sans text-center font-bold">Poor</span>
          </div>

          {/* Max AQI */}
          <div className="bg-[#030a16] border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between h-20">
            <span className="text-[9px] text-slate-400 font-sans leading-tight">Max AQI (Today)</span>
            <div className="text-center">
              <span className="text-2xl font-sans font-extrabold text-[#ef4444]">412</span>
            </div>
            <span className="text-[9px] text-[#ef4444] font-sans text-center font-bold">Severe</span>
          </div>

          {/* Active Fires */}
          <div className="bg-[#030a16] border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between h-20">
            <span className="text-[9px] text-slate-400 font-sans leading-tight">Active Fires</span>
            <div className="text-center">
              <span className="text-2xl font-sans font-extrabold text-[#f97316]">1256</span>
            </div>
            <span className="text-[9px] text-[#f97316] font-sans text-center font-bold">High</span>
          </div>

          {/* HCHO Average */}
          <div className="bg-[#030a16] border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between h-20">
            <span className="text-[9px] text-slate-400 font-sans leading-tight font-medium">HCHO Avg (India)</span>
            <div className="text-center">
              <span className="text-lg font-sans font-extrabold text-[#38bdf8]">2.35</span>
            </div>
            <span className="text-[7.5px] text-slate-500 font-sans text-center truncate">×10¹⁵ molec/cm²</span>
          </div>

          {/* PM2.5 Avg */}
          <div className="bg-[#030a16] border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between h-20">
            <span className="text-[9px] text-slate-400 font-sans leading-tight font-medium">PM2.5 Avg</span>
            <div className="text-center">
              <span className="text-lg font-sans font-extrabold text-[#38bdf8]">78</span>
            </div>
            <span className="text-[8px] text-slate-500 font-sans text-center truncate">µg/m³</span>
          </div>

          {/* Data Sources */}
          <div className="bg-[#030a16] border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between h-20">
            <span className="text-[9px] text-slate-400 font-sans leading-tight font-medium">Data Sources</span>
            <div className="text-center">
              <span className="text-lg font-sans font-extrabold text-[#10b981]">7 / 7</span>
            </div>
            <span className="text-[8px] text-[#10b981] font-sans text-center font-bold">Online</span>
          </div>
        </div>
      </div>

      {/* 2. AQI TREND (INDIA) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-sans font-bold text-white tracking-wider uppercase">AQI Trend (India)</h3>
          <div className="relative inline-block">
            <select
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value)}
              className="appearance-none bg-[#030a16] border border-slate-800 rounded px-2.5 py-1 pr-7 text-[10px] font-sans font-bold text-slate-300 outline-none cursor-pointer"
            >
              <option>7 Days</option>
              <option>30 Days</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1.5 pointer-events-none" />
          </div>
        </div>

        {/* Custom High-Quality Sparkline SVG Chart */}
        <div className="relative h-32 bg-[#030a16] border border-slate-800/80 rounded-xl overflow-hidden p-2.5 flex flex-col justify-between">
          <svg className="w-full h-24">
            <defs>
              <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            
            {/* Horizontal Grid lines */}
            <line x1="0" y1="10" x2="340" y2="10" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="30" x2="340" y2="30" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="50" x2="340" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="0" y1="70" x2="340" y2="70" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />

            {/* Filled Area beneath trend curve */}
            <polygon
              points={`20,80 ${pointsString} 300,80`}
              fill="url(#orangeGrad)"
            />

            {/* Smooth trend curve line */}
            <polyline
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
              points={pointsString}
            />

            {/* Glowing active dots along the line */}
            {sparklinePoints.map((p, i) => {
              const x = (i / (sparklinePoints.length - 1)) * (svgWidth - 40) + 20;
              const y = svgHeight - ((p.val - minVal) / (maxVal - minVal)) * (svgHeight - 20) - 10;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="3" fill="#f97316" />
                  <circle cx={x} cy={y} r="1.5" fill="#ffffff" />
                </g>
              );
            })}
          </svg>

          {/* Sparkline Axis labels */}
          <div className="flex justify-between px-2.5 text-[9px] font-mono text-slate-500 border-t border-slate-800/40 pt-1.5">
            <span>01 May</span>
            <span>03 May</span>
            <span>05 May</span>
            <span>07 May</span>
          </div>
        </div>
      </div>

      {/* 3. TOP 5 MOST POLLUTED CITIES */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-sans font-bold text-white tracking-wider uppercase">Top 5 Most Polluted Cities</h3>
        
        <div className="space-y-2.5 pl-1">
          {[
            { rank: 1, name: "Bhiwadi, Rajasthan", value: 423, color: "bg-[#a855f7] text-white" },
            { rank: 2, name: "Delhi, Delhi", value: 401, color: "bg-[#a855f7] text-white" },
            { rank: 3, name: "Ghaziabad, UP", value: 371, color: "bg-[#ef4444] text-white" },
            { rank: 4, name: "Noida, UP", value: 353, color: "bg-[#ef4444] text-white" },
            { rank: 5, name: "Patna, Bihar", value: 332, color: "bg-[#ef4444] text-white" }
          ].map((city) => (
            <div 
              key={city.rank}
              onClick={() => onSelectCity?.(city.name)}
              className="flex items-center justify-between text-xs transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-[#f97316] text-xs w-4">
                  {city.rank}
                </span>
                <span className="text-slate-300 font-sans font-medium group-hover:text-white truncate max-w-[200px]">
                  {city.name}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md ${city.color}`}>
                {city.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SATELLITE STATUS SECTION */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-sans font-bold text-white tracking-wider uppercase">Satellite Status</h3>
        
        <div className="bg-[#030a16] border border-slate-800/80 rounded-xl p-4 space-y-2.5 text-xs font-mono">
          {[
            { name: "INSAT-3D", role: "AOD", status: "Online" },
            { name: "Sentinel-5P", role: "Gases", status: "Online" },
            { name: "MODIS", role: "Fire", status: "Online" },
            { name: "VIIRS", role: "Fire", status: "Online" },
            { name: "ERA5", role: "Weather", status: "Online" },
            { name: "CPCB", role: "Stations", status: "Online" },
            { name: "GFS", role: "Forecast", status: "Online" }
          ].map((sat, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/30 last:border-0 pb-1.5 last:pb-0">
              <span className="text-slate-200 font-bold">{sat.name}</span>
              <span className="text-slate-500 text-[10px]">{sat.role}</span>
              <div className="flex items-center gap-1.5 text-[#10b981] font-bold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                <span>{sat.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
