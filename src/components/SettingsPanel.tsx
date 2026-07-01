import React, { useState } from "react";
import { Sliders, Bell, Cpu, ShieldCheck, Info } from "lucide-react";

export default function SettingsPanel() {
  const [aqiThreshold, setAqiThreshold] = useState(250);
  const [hchoThreshold, setHchoThreshold] = useState(2.0);
  const [refreshInterval, setRefreshInterval] = useState(15);
  const [smartWarnings, setSmartWarnings] = useState(true);

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 select-none">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#071B36] border border-slate-800 p-5 rounded-xl text-left">
        <div>
          <span className="text-xs font-mono tracking-widest text-isro-orange uppercase font-bold">System Configuration</span>
          <h2 className="text-2xl font-display font-bold text-white mt-0.5">Control Center Settings</h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Modify satellite telemetry scanning bounds, CPCB emergency warning triggers, and AI forecast model sequences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings controllers */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 space-y-5 text-left">
          
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-4 h-4 text-isro-orange" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Alert Threshold & Triggers</span>
          </div>

          <div className="space-y-4">
            
            {/* AQI Alert Threshold */}
            <div className="p-4 rounded-xl bg-[#040d1a]/80 border border-slate-900 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white font-bold">Surface AQI Warning Trigger</span>
                <span className="text-isro-orange font-bold font-mono">{aqiThreshold} AQI</span>
              </div>
              <input
                type="range"
                min="100"
                max="400"
                value={aqiThreshold}
                onChange={(e) => setAqiThreshold(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-isro-orange"
              />
              <p className="text-[10px] text-slate-400">Triggers an emergency warning if metropolitan ground station levels exceed this threshold.</p>
            </div>

            {/* HCHO Alert Threshold */}
            <div className="p-4 rounded-xl bg-[#040d1a]/80 border border-slate-900 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white font-bold">Sentinel-5P HCHO Hotspot Trigger</span>
                <span className="text-sky-blue font-bold font-mono">{hchoThreshold.toFixed(1)} × 10¹⁶ mol/cm²</span>
              </div>
              <input
                type="range"
                min="10"
                max="35"
                value={hchoThreshold * 10}
                onChange={(e) => setHchoThreshold(Number(e.target.value) / 10)}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-blue"
              />
              <p className="text-[10px] text-slate-400">Triggers volatile column density alarms when Sentinel-5P tropospheric levels exceed this range.</p>
            </div>

            {/* Satellite Scanning Interval */}
            <div className="p-4 rounded-xl bg-[#040d1a]/80 border border-slate-900 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-white font-bold">INSAT-3D Continuous Scan Interval</span>
                <span className="text-emerald-400 font-bold font-mono">{refreshInterval} Minutes</span>
              </div>
              <div className="flex gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setRefreshInterval(mins)}
                    className={`px-3 py-1.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                      refreshInterval === mins ? "bg-emerald-500 text-slate-900 font-bold" : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {mins} MINS
                  </button>
                ))}
              </div>
            </div>

            {/* Predictive Smart Warnings */}
            <div className="p-4 rounded-xl bg-[#040d1a]/80 border border-slate-900 flex justify-between items-center">
              <div>
                <span className="text-xs text-white font-bold block">Smart Wind-Aerosol Predictive Warnings</span>
                <span className="text-[10px] text-slate-400">Deploy machine learning analysis to alert downwind states regarding crop residue emissions.</span>
              </div>
              <input
                type="checkbox"
                checked={smartWarnings}
                onChange={(e) => setSmartWarnings(e.target.checked)}
                className="w-5 h-5 accent-isro-orange cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Right side diagnostics */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-isro-orange" />
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">System Status Diagnostic</span>
            </div>

            <div className="space-y-2.5 font-mono text-[10px] text-slate-300">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span>Drizzle Engine:</span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span>Vite Middleware:</span>
                <span className="text-emerald-400 font-bold">STABLE</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span>FRP Burn Algorithm:</span>
                <span className="text-emerald-400 font-bold">v3.1 MOD14</span>
              </div>
              <div className="flex justify-between">
                <span>NCAP Progress Tracking:</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="bg-[#040d1a] border border-slate-800 p-3.5 rounded-lg flex gap-2.5 mt-6">
            <Info className="w-4 h-4 text-sky-blue shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              System credentials and sensor authentication vectors are managed securely inside AstraAQI secure server files.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
