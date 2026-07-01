import React, { useState, useEffect } from "react";
import { FireEvent } from "../types";
import { Flame, Play, Pause, ChevronRight, Activity, CloudSun, AlertCircle, FileSpreadsheet } from "lucide-react";

interface FireDetectionPanelProps {
  fireEvents: FireEvent[];
}

export default function FireDetectionPanel({ fireEvents }: FireDetectionPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [selectedSensor, setSelectedSensor] = useState<"ALL" | "VIIRS" | "MODIS">("ALL");

  // Playback timer simulating historical remote sensing scans
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime((prev) => (prev + 1) % fireEvents.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, fireEvents]);

  // Filters fire events based on sensor type
  const filteredFires = fireEvents.filter(
    (fire) => selectedSensor === "ALL" || fire.sensor === selectedSensor
  );

  // Totals calculations
  const totalFires = filteredFires.length;
  const totalFRP = filteredFires.reduce((sum, f) => sum + f.frp, 0);
  const totalBurnArea = filteredFires.reduce((sum, f) => sum + f.burnArea, 0);
  const totalEmissionsCO2 = filteredFires.reduce((sum, f) => sum + f.emissions.co2, 0);

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 select-none">
      
      {/* Header telemetry board */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#071B36] border border-slate-800 p-5 rounded-xl">
        <div>
          <span className="text-xs font-mono tracking-widest text-isro-orange uppercase font-bold">MODIS / VIIRS Sensor Feeds</span>
          <h2 className="text-2xl font-display font-bold text-white mt-0.5">Active Thermal Anomalies & Biomass Burning</h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Real-time tracking of agricultural crop residual burns (stubble burning) and forest fires across India, measuring Fire Radiative Power (FRP) and calculating downwind particulate and trace gas payloads.
          </p>
        </div>

        {/* Live counter cards */}
        <div className="flex gap-4">
          <div className="bg-[#040d1a]/80 border border-slate-800 p-3 rounded-lg text-left w-32">
            <p className="text-[9px] font-mono text-slate-400 uppercase">Active Fires</p>
            <p className="text-xl font-mono font-bold text-isro-orange flex items-center gap-1.5 mt-0.5 animate-pulse">
              <Flame className="w-5 h-5 text-isro-orange" />
              {totalFires}
            </p>
          </div>
          <div className="bg-[#040d1a]/80 border border-slate-800 p-3 rounded-lg text-left w-36">
            <p className="text-[9px] font-mono text-slate-400 uppercase">Total Power (FRP)</p>
            <p className="text-xl font-mono font-bold text-white mt-0.5">
              {totalFRP.toFixed(1)} <span className="text-[10px] text-sky-blue">MW</span>
            </p>
          </div>
        </div>
      </div>

      {/* Historical Playback & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Playback Controls & Stats */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Historical Playback & Emissions Ledger</span>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">Sensor:</span>
                <div className="flex bg-[#040d1a] p-0.5 rounded border border-slate-800">
                  {["ALL", "VIIRS", "MODIS"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSensor(s as any)}
                      className={`px-2 py-1 rounded text-[9px] font-mono transition-all cursor-pointer ${
                        selectedSensor === s ? "bg-isro-orange text-white font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Playback Progress Tracker */}
            <div className="bg-[#040d1a]/80 border border-slate-900 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-gradient-to-tr from-isro-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full text-white cursor-pointer shadow-lg active:scale-95 transition-all flex items-center justify-center shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div className="w-full space-y-1.5 text-left">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>ORBITAL SCROLLBACK TRANSCRIPTS</span>
                  <span className="text-sky-blue font-bold">
                    {filteredFires[playbackTime] ? filteredFires[playbackTime].district + ", " + filteredFires[playbackTime].state : "Seeking Constellation..."}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-isro-orange h-full rounded-full transition-all duration-300"
                    style={{ width: `${((playbackTime + 1) / Math.max(filteredFires.length, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Estimated Emissions metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#040d1a]/40 p-3.5 rounded-lg border border-slate-900 text-left">
                <span className="text-[9px] font-mono text-slate-400 uppercase">CO₂ Carbon Dioxide</span>
                <p className="text-base font-mono font-bold text-slate-200 mt-1">
                  {totalEmissionsCO2.toFixed(1)} <span className="text-xs text-slate-500">tonnes</span>
                </p>
                <div className="w-full bg-slate-950 h-1 rounded-full mt-2">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: "65%" }} />
                </div>
              </div>

              <div className="bg-[#040d1a]/40 p-3.5 rounded-lg border border-slate-900 text-left">
                <span className="text-[9px] font-mono text-slate-400 uppercase">CO Carbon Monoxide</span>
                <p className="text-base font-mono font-bold text-slate-200 mt-1">
                  {(totalFires * 6.8).toFixed(1)} <span className="text-xs text-slate-500">tonnes</span>
                </p>
                <div className="w-full bg-slate-950 h-1 rounded-full mt-2">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div className="bg-[#040d1a]/40 p-3.5 rounded-lg border border-slate-900 text-left">
                <span className="text-[9px] font-mono text-slate-400 uppercase">PM2.5 Primary Aerosols</span>
                <p className="text-base font-mono font-bold text-slate-200 mt-1">
                  {(totalFires * 3.1).toFixed(1)} <span className="text-xs text-slate-500">tonnes</span>
                </p>
                <div className="w-full bg-slate-950 h-1 rounded-full mt-2">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: "55%" }} />
                </div>
              </div>
            </div>

          </div>

          {/* List of active fire markers */}
          <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-[#040d1a] flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Active Satellite Detections</span>
              <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                Telemetry Confirmed
              </span>
            </div>

            <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
              {filteredFires.map((fire, idx) => (
                <div key={fire.id} className="p-3.5 flex flex-wrap justify-between items-center hover:bg-slate-800/20 transition-all gap-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 animate-pulse">
                      <Flame className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-sans font-bold text-white">
                        District {fire.district}, {fire.state}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400">
                        {fire.sensor} Scan | Lat {fire.lat}°N, Lng {fire.lng}°E
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-left">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Confidence</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{fire.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Thermal Power</span>
                      <span className="text-xs font-mono font-bold text-white">{fire.frp} MW</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Burn Area</span>
                      <span className="text-xs font-mono font-bold text-sky-blue">{fire.burnArea} Ha</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right side: Analytical context & advisories */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block font-semibold">Atmospheric Dispersion Impacts</span>
            
            <div className="bg-[#040d1a]/60 border border-slate-900 p-3 rounded-lg text-left">
              <span className="text-[10px] font-mono font-bold text-isro-orange block uppercase mb-1">Punjab Downwind Transport</span>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Prevailing NW winds transport particulate loads down the Indus-Gangetic Plain. This meteorology traps smoke plumes directly over NCR, creating extreme winter pollution inversion caps.
              </p>
            </div>

            <div className="bg-[#040d1a]/60 border border-slate-900 p-3 rounded-lg text-left">
              <span className="text-[10px] font-mono font-bold text-sky-blue block uppercase mb-1">MODIS Burn Algorithms</span>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                MOD14/MYD14 thermal algorithms utilize middle infrared (3.9µm) spectral bands to differentiate smoldering fires from heavy agricultural ash.
              </p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-lg flex gap-2.5 mt-6">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Emergency Dispatch Trigger</span>
              <p className="text-[10px] text-slate-300 font-sans mt-0.5 leading-relaxed">
                When active fire detections with confidence values &gt;90% emerge near urban perimeters, automatic SMS warnings are generated for district foresters and agricultural block officers.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
