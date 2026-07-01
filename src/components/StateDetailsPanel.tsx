import React from "react";
import { StateData } from "../types";
import { 
  X, 
  TrendingUp, 
  AlertTriangle, 
  Flame, 
  Wind, 
  ShieldAlert, 
  Download, 
  Radio,
  FileCheck2,
  TrendingDown,
  Navigation
} from "lucide-react";

interface StateDetailsPanelProps {
  state: StateData;
  onClose: () => void;
}

export default function StateDetailsPanel({ state, onClose }: StateDetailsPanelProps) {
  // Sparkline coordinates for simulated 7-day trend
  const sparklinePoints = state.aqi > 250 
    ? "0,40 20,30 40,55 60,20 80,15 100,5 120,12" // worsening
    : "0,25 20,35 40,30 60,40 80,45 100,50 120,52"; // stable/improving

  return (
    <div id="state-details-panel" className="w-80 h-full border-l border-slate-800 bg-[#071b36] flex flex-col justify-between select-none shrink-0 overflow-y-auto animate-slide-in">
      
      {/* Header Panel */}
      <div>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#040d1a]">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-sky-blue uppercase">Geospatial Inspector</span>
            <h3 className="text-sm font-display font-extrabold text-white">{state.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AQI Indicator Card */}
        <div className="p-4 border-b border-slate-800 bg-gradient-to-br from-[#071b36] to-[#040d1a]/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">CPCB Surface AQI</p>
              <h4 className={`text-4xl font-display font-extrabold ${
                state.aqi > 250 ? "text-rose-500" : state.aqi > 150 ? "text-orange-500" : "text-emerald-400"
              }`}>
                {state.aqi}
              </h4>
            </div>
            
            {/* Status pill */}
            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
              state.aqi > 250 
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse" 
                : state.aqi > 150 
                ? "bg-orange-500/10 text-orange-400 border-orange-500/30" 
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}>
              {state.aqi > 300 ? "HAZARDOUS" : state.aqi > 200 ? "VERY POOR" : state.aqi > 100 ? "MODERATE" : "GOOD"}
            </span>
          </div>

          {/* Sparkline Trend */}
          <div className="mt-4 flex items-center justify-between bg-[#040d1a]/40 p-2.5 rounded border border-slate-900">
            <div>
              <p className="text-[9px] font-mono text-slate-400 uppercase">7D Column Trend</p>
              <div className="flex items-center gap-1 mt-0.5">
                {state.aqi > 200 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[10px] font-mono text-rose-400 font-bold">Worsening (+4.8%)</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-mono text-emerald-300 font-bold">Improving (-2.1%)</span>
                  </>
                )}
              </div>
            </div>

            {/* Sparkline Vector */}
            <svg className="w-24 h-12">
              <path
                d={`M ${sparklinePoints}`}
                fill="none"
                stroke={state.aqi > 200 ? "#F43F5E" : "#10B981"}
                strokeWidth="2"
              />
              <circle cx="120" cy={state.aqi > 250 ? 12 : 52} r="3" fill={state.aqi > 200 ? "#F43F5E" : "#10B981"} />
            </svg>
          </div>
        </div>

        {/* Detailed Pollutants list */}
        <div className="p-4 border-b border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-3 font-semibold">TROPOMI Sensor Columns</span>
          
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-slate-400 font-medium">PM2.5 Column Density</span>
              <span className="font-mono font-bold text-white">{state.pm25} µg/m³</span>
            </div>
            <div className="w-full bg-[#040d1a] h-1.5 rounded-full overflow-hidden">
              <div className="bg-isro-orange h-full rounded-full" style={{ width: `${Math.min((state.pm25 / 200) * 100, 100)}%` }} />
            </div>

            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-slate-400 font-medium">NO₂ Tropospheric Column</span>
              <span className="font-mono font-bold text-white">{state.no2} µg/m³</span>
            </div>
            <div className="w-full bg-[#040d1a] h-1.5 rounded-full overflow-hidden">
              <div className="bg-sky-blue h-full rounded-full" style={{ width: `${Math.min((state.no2 / 100) * 100, 100)}%` }} />
            </div>

            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-slate-400 font-medium">SO₂ Column Density</span>
              <span className="font-mono font-bold text-white">{state.so2} µg/m³</span>
            </div>
            <div className="w-full bg-[#040d1a] h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min((state.so2 / 80) * 100, 100)}%` }} />
            </div>

            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-slate-400 font-medium">Formaldehyde (HCHO) Index</span>
              <span className="font-mono font-bold text-sky-blue">{state.hcho} ×10¹⁶ molec/cm²</span>
            </div>
            <div className="w-full bg-[#040d1a] h-1.5 rounded-full overflow-hidden">
              <div className="bg-pink-500 h-full rounded-full" style={{ width: `${Math.min((state.hcho / 4) * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Local CPCB Monitoring Stations (State Cities details) */}
        <div className="p-4 border-b border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2.5 font-semibold">Active Ground Stations</span>
          
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {state.cities.map((city, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#040d1a]/50 border border-slate-900 hover:border-slate-800 transition-colors">
                <span className="text-xs text-slate-300 font-sans font-medium truncate max-w-[120px]" title={city.name}>{city.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">AQI:</span>
                  <span className={`text-xs font-mono font-bold ${
                    city.aqi > 250 ? "text-rose-500" : city.aqi > 150 ? "text-orange-500" : "text-emerald-400"
                  }`}>{city.aqi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Fire events & Wind vectors */}
        <div className="p-4 border-b border-slate-800 grid grid-cols-2 gap-3 bg-[#040d1a]/30">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-isro-orange animate-pulse" />
            <div>
              <p className="text-[9px] font-mono text-slate-400">Crop Residue Fires</p>
              <p className="text-sm font-mono font-bold text-white">{state.fireCount} Detected</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-sky-blue" />
            <div>
              <p className="text-[9px] font-mono text-slate-400">Prevailing Winds</p>
              <p className="text-sm font-mono font-bold text-white">
                {state.windSpeed} <span className="text-[9px] text-slate-400">km/h</span>
              </p>
            </div>
          </div>
        </div>

        {/* Health Advisory Section */}
        <div className="p-4">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">Health Advisory</span>
              <p className="text-xs text-slate-300 font-sans mt-0.5 leading-relaxed">
                {state.healthAdvisory}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Trigger Button Panel */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 sticky bottom-0">
        <button
          onClick={() => alert(`CPCB Stage II emergency guidelines triggered for ${state.name}!`)}
          className="w-full py-2 bg-gradient-to-r from-isro-orange to-rose-600 hover:from-orange-600 hover:to-rose-700 text-xs text-white rounded-lg font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform"
        >
          <Radio className="w-4 h-4 animate-pulse" />
          Trigger CPCB GRAP Stage II
        </button>
      </div>

    </div>
  );
}
