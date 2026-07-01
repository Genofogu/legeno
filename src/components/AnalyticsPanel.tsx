import React, { useState } from "react";
import { windRoseData, correlationMatrix, stateProgressComparison, scatterFireVsHcho } from "../data";
import { BarChart3, Wind, LayoutGrid, Award, Sliders, Info, LineChart } from "lucide-react";

export default function AnalyticsPanel() {
  const [activeTab, setActiveTab] = useState<"CIRCULATION" | "CORRELATION" | "NCAP" | "SCATTER">("CIRCULATION");
  const [hoveredCell, setHoveredCell] = useState<any | null>(null);

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 select-none">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#071B36] border border-slate-800 p-5 rounded-xl">
        <div className="text-left">
          <span className="text-xs font-mono tracking-widest text-isro-orange uppercase font-bold">Atmospheric Diagnostics</span>
          <h2 className="text-2xl font-display font-bold text-white mt-0.5">Scientific Air Quality Analytics</h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Multi-variate correlation registers examining wind vector distributions, National Clean Air Programme (NCAP) reduction indexes, and industrial thermal plume metrics.
          </p>
        </div>

        {/* Analytical Tab filter controls */}
        <div className="flex bg-[#040d1a] p-1 rounded-lg border border-slate-800 shrink-0">
          {[
            { id: "CIRCULATION", label: "Wind Rose Circulation", icon: Wind },
            { id: "CORRELATION", label: "Plume Correlation Matrix", icon: LayoutGrid },
            { id: "NCAP", label: "State NCAP Targets", icon: Award },
            { id: "SCATTER", label: "Fire vs HCHO Scatter", icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? "bg-isro-orange text-white font-bold glow-orange" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xl:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Diagnostic Chart Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Interactive Chart Canvas */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 min-h-[360px] flex flex-col justify-between">
          
          {activeTab === "CIRCULATION" && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-display font-bold text-white">Wind Rose: Polar Distribution</h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Continuous angular tracking of regional wind frequencies and speed channels.</p>
              </div>

              {/* Vector Polar Plot */}
              <div className="flex justify-center items-center py-4 relative">
                <svg className="w-64 h-64 overflow-visible">
                  {/* Concentric polar circles */}
                  <circle cx="128" cy="128" r="30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <circle cx="128" cy="128" r="60" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <circle cx="128" cy="128" r="90" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <circle cx="128" cy="128" r="115" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

                  {/* Cross guidelines */}
                  <line x1="128" y1="10" x2="128" y2="246" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <line x1="10" y1="128" x2="246" y2="128" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

                  {/* Directional labels */}
                  <text x="128" y="18" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">N</text>
                  <text x="128" y="244" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">S</text>
                  <text x="242" y="131" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono" textAnchor="start">E</text>
                  <text x="14" y="131" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono" textAnchor="end">W</text>

                  {/* Stylized Wind Rose Spokes based on frequency */}
                  {windRoseData.map((w, index) => {
                    const angles: Record<string, number> = {
                      N: 270, NE: 315, E: 0, SE: 45, S: 90, SW: 135, W: 180, NW: 225
                    };
                    const angle = angles[w.dir];
                    const rad = (angle * Math.PI) / 180;
                    
                    // Bar length based on frequency
                    const r = w.frequency * 4;
                    const x2 = 128 + Math.cos(rad) * r;
                    const y2 = 128 + Math.sin(rad) * r;
                    
                    return (
                      <g key={index}>
                        <line
                          x1="128"
                          y1="128"
                          x2={x2}
                          y2={y2}
                          stroke={w.frequency > 15 ? "#FF6B00" : "#29B6F6"}
                          strokeWidth={w.frequency > 15 ? "8" : "5"}
                          strokeLinecap="round"
                          opacity="0.8"
                          className="hover:opacity-100 transition-opacity"
                        />
                        <circle cx={x2} cy={y2} r="2" fill="#ffffff" />
                      </g>
                    );
                  })}
                </svg>

                {/* Legend indicator */}
                <div className="absolute right-0 bottom-0 bg-[#040d1a] border border-slate-900 p-2.5 rounded text-[10px] font-mono text-slate-400 space-y-1">
                  <p className="text-white font-bold">WIND VELOCITY</p>
                  <p className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 bg-isro-orange inline-block rounded" /> High (&gt; 15 km/h)</p>
                  <p className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 bg-sky-blue inline-block rounded" /> Moderate (5 - 15)</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "CORRELATION" && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-display font-bold text-white">Atmospheric Chemical Correlation Matrix</h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Mathematical coefficients correlating formaldehyde column density against active fires and industrial parameters.</p>
              </div>

              {/* Heatmap correlation grid */}
              <div className="flex flex-col items-center py-2 relative">
                <div className="grid grid-cols-5 gap-1.5 w-full max-w-lg">
                  {correlationMatrix.map((row, rIdx) => (
                    <React.Fragment key={rIdx}>
                      {Object.entries(row).map(([key, val], cIdx) => {
                        if (key === "param") {
                          return (
                            <div key={cIdx} className="flex items-center justify-start text-[9px] font-mono font-semibold text-slate-400 h-10 pr-2">
                              {val as string}
                            </div>
                          );
                        }
                        
                        const num = val as number;
                        const isPrimary = num === 1.0;
                        const bgShade = isPrimary 
                          ? "rgba(255, 107, 0, 0.9)" 
                          : num > 0.7 
                          ? "rgba(255, 107, 0, 0.65)" 
                          : num > 0.3 
                          ? "rgba(41, 182, 246, 0.45)" 
                          : num < 0 
                          ? "rgba(244, 63, 94, 0.25)" 
                          : "rgba(30, 41, 59, 0.2)";

                        return (
                          <div
                            key={cIdx}
                            className="h-10 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-white cursor-pointer hover:scale-105 transition-transform"
                            style={{ backgroundColor: bgShade }}
                            onMouseEnter={() => setHoveredCell({ r: row.param, c: key, val: num })}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2)}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>

                {/* Correlation hover details */}
                {hoveredCell && (
                  <div className="absolute bottom-[-10px] bg-[#040d1a] border border-isro-orange/40 p-2 rounded text-[10px] font-mono text-slate-300">
                    <span className="text-white font-bold">{hoveredCell.r}</span> × <span className="text-sky-blue font-bold">{hoveredCell.c}</span>:{" "}
                    <strong className="text-isro-orange">{hoveredCell.val > 0 ? `+${hoveredCell.val}` : hoveredCell.val}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "NCAP" && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-display font-bold text-white">National Clean Air Programme (NCAP) Reduction Progress</h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Comparative reduction index versus NCAP targets (aiming for 20-30% particulate reductions).</p>
              </div>

              {/* State Horizontal target progress charts */}
              <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                {stateProgressComparison.map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-300 font-bold">{s.state}</span>
                      <span className="text-slate-400">Target: {s.target}% | <strong className="text-emerald-400">Achieved: {s.achieved}%</strong></span>
                    </div>
                    {/* Double progress bar: Achieved vs Target */}
                    <div className="w-full bg-[#040d1a] h-2.5 rounded-full overflow-hidden relative border border-slate-900">
                      {/* Target boundary marker */}
                      <div className="absolute bg-sky-blue/30 h-full rounded-full" style={{ width: `${s.target * 3}%` }} />
                      {/* Achieved indicator */}
                      <div className="absolute bg-gradient-to-r from-isro-orange to-emerald-400 h-full rounded-full" style={{ width: `${s.achieved * 3}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "SCATTER" && (
            <div className="space-y-4 text-left">
              <div>
                <h3 className="text-sm font-display font-bold text-white">Scatter Plot: Fire Radiative Power vs HCHO Index</h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">Plotting NASA thermal FRP values against formaldehyde column density registers.</p>
              </div>

              {/* Scatter Dot Layout */}
              <div className="flex justify-center items-center py-2">
                <svg className="w-full h-44 overflow-visible border-b border-l border-slate-800">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.02)" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.02)" />
                  
                  {/* Scatter plots dots mapping */}
                  {scatterFireVsHcho.map((pt, idx) => {
                    const cx = (pt.frp / 250) * 450 + 20;
                    const cy = 176 - (pt.hcho / 4.5) * 150;
                    
                    return (
                      <g key={idx}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r="5"
                          fill={pt.status === "Active" ? "#FF6B00" : "#29B6F6"}
                          stroke="#040D1A"
                          strokeWidth="1.5"
                          className="hover:scale-150 transition-transform cursor-pointer"
                        />
                        <text x={cx + 8} y={cy + 3} fill="rgba(255,255,255,0.5)" fontSize="6" fontFamily="monospace">
                          {pt.name.split(" ")[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

        </div>

        {/* Right side helper card */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4 text-left">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block font-semibold">Analytical Insights</span>
            
            <div className="bg-[#040d1a]/60 border border-slate-900 p-3 rounded-lg">
              <span className="text-[10px] font-mono font-bold text-isro-orange block uppercase mb-1">Volatiles & Fire Correlation</span>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                A strong linear correlation of <strong>+0.72</strong> exists between crop residuary burning and HCHO columns, highlighting how smoke particles accelerate volatile reactions.
              </p>
            </div>

            <div className="bg-[#040d1a]/60 border border-slate-900 p-3 rounded-lg">
              <span className="text-[10px] font-mono font-bold text-sky-blue block uppercase mb-1">NCAP Goals Evaluation</span>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Karnataka and Tamil Nadu lead NCAP compliance parameters, achieving over <strong>80%</strong> of targeted air pollution reduction goals.
              </p>
            </div>
          </div>

          <div className="bg-[#040d1a] border border-slate-800 p-3 rounded-lg flex items-center gap-2.5 mt-4">
            <Info className="w-4 h-4 text-sky-blue shrink-0" />
            <p className="text-[10px] text-slate-400 font-mono text-left">
              Data synchronized under geostationary INSAT metadata standards.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
