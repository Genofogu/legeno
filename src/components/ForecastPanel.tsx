import React, { useState } from "react";
import { defaultForecastTrend } from "../data";
import { BrainCircuit, Cpu, CalendarClock, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

export default function ForecastPanel() {
  const [selectedState, setSelectedState] = useState("Delhi (NCT)");
  const [timeHorizon, setTimeHorizon] = useState<"24H" | "3D" | "7D">("7D");
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  const forecastStates = ["Delhi (NCT)", "Punjab", "Maharashtra"];
  const forecastTrend = defaultForecastTrend[selectedState] || [];

  // Decides slice based on selected time horizon
  const displayTrends = timeHorizon === "24H" 
    ? forecastTrend.slice(0, 2) 
    : timeHorizon === "3D" 
    ? forecastTrend.slice(0, 3) 
    : forecastTrend;

  // Custom vector coordinate mapping calculations for SVG graph rendering
  // width=550, height=180. x steps: 550 / (len - 1), y values: scaled to [20, 160] range
  const width = 550;
  const height = 180;
  const maxVal = 400; // AQI upper limit scale

  const points = displayTrends.map((d, index) => {
    const xStep = width / Math.max(displayTrends.length - 1, 1);
    const x = index * xStep;
    const y = height - (d.aqi / maxVal) * (height - 30) - 15;
    const yLower = height - (d.lowerBound / maxVal) * (height - 30) - 15;
    const yUpper = height - (d.upperBound / maxVal) * (height - 30) - 15;
    return { x, y, yLower, yUpper, data: d };
  });

  // Poly-path coordinates for shaded Confidence Area
  // Top boundary left-to-right, then bottom boundary right-to-left
  const confidencePathPoints = [
    ...points.map(p => `${p.x},${p.yUpper}`),
    ...[...points].reverse().map(p => `${p.x},${p.yLower}`)
  ].join(" ");

  // Line path
  const linePath = points.map(p => `${p.x},${p.y}`).join(" L ");

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 select-none">
      
      {/* Header section with deep learning badges */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#071B36] border border-slate-800 p-5 rounded-xl">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-isro-orange uppercase font-bold">Predictive AI Platform</span>
            <span className="text-[9px] font-mono bg-sky-blue/10 text-sky-blue border border-sky-blue/20 px-1.5 py-0.2 rounded-full flex items-center gap-1 animate-pulse">
              <Sparkles className="w-2.5 h-2.5 text-sky-blue" />
              CNN-LSTM Active
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mt-1">Satellite-Driven Atmospheric Forecasting</h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Neural predictive models correlating historical aerosol optical depth, Sentinel-5P tropospheric gas columns, surface meteorological vectors (ERA5), and seasonal crop residual schedules to generate predictive pollution trend corridors.
          </p>
        </div>

        {/* Accuracy and latency statistics */}
        <div className="flex gap-4">
          <div className="bg-[#040d1a]/80 border border-slate-800 p-3 rounded-lg text-left w-36">
            <p className="text-[9px] font-mono text-slate-400 uppercase">Model R² Accuracy</p>
            <p className="text-xl font-mono font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <Cpu className="w-5 h-5 text-emerald-400" />
              94.2%
            </p>
          </div>
          <div className="bg-[#040d1a]/80 border border-slate-800 p-3 rounded-lg text-left w-32">
            <p className="text-[9px] font-mono text-slate-400 uppercase">Training Epochs</p>
            <p className="text-xl font-mono font-bold text-white mt-0.5">
              500 <span className="text-xs text-slate-500">steps</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Forecast Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph & controls */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 space-y-5">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* State selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Target Region:</span>
              <div className="flex bg-[#040d1a] p-0.5 rounded border border-slate-800">
                {forecastStates.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedState(s);
                      setHoveredPoint(null);
                    }}
                    className={`px-3 py-1 rounded text-xs font-sans font-semibold transition-all cursor-pointer ${
                      selectedState === s ? "bg-isro-orange text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Time selection tabs */}
            <div className="flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4 text-sky-blue" />
              <div className="flex bg-[#040d1a] p-0.5 rounded border border-slate-800">
                {["24H", "3D", "7D"].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTimeHorizon(t as any);
                      setHoveredPoint(null);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                      timeHorizon === t ? "bg-sky-blue text-slate-900 font-bold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Predictive Vector Line Graph */}
          <div className="bg-[#040d1a]/80 rounded-xl p-5 border border-slate-900 relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase">AQI Predictive Corridor & Confidence Interval</span>
              <div className="flex items-center gap-4 text-[9px] font-mono text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-isro-orange inline-block" /> AI Prediction
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-isro-orange/10 border border-isro-orange/20 inline-block" /> Confidence Interval
                </span>
              </div>
            </div>

            <div className="relative h-[200px] w-full flex items-center justify-center">
              {/* Plot canvas */}
              <svg className="w-full h-full overflow-visible">
                {/* Confidence shaded polygon */}
                {points.length > 1 && (
                  <polygon
                    points={confidencePathPoints}
                    fill="rgba(255, 107, 0, 0.08)"
                    stroke="rgba(255, 107, 0, 0.15)"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )}

                {/* Grid guidelines */}
                <line x1="0" y1={height - 15} x2={width} y2={height - 15} stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.02)" />
                <line x1="0" y1="15" x2={width} y2="15" stroke="rgba(255,255,255,0.02)" />

                {/* Projected curve line */}
                {points.length > 1 && (
                  <path
                    d={`M ${linePath}`}
                    fill="none"
                    stroke="#FF6B00"
                    strokeWidth="2"
                    className="drop-shadow-[0_0_4px_rgba(255,107,0,0.5)]"
                  />
                )}

                {/* Curve coordinates interactive dot markers */}
                {points.map((p, index) => (
                  <g key={index}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="#FF6B00"
                      stroke="#040D1A"
                      strokeWidth="1.5"
                      className="cursor-pointer hover:scale-125 transition-transform"
                      onMouseEnter={() => setHoveredPoint({ ...p, index })}
                    />
                    {/* Interval vertical ticks */}
                    <line
                      x1={p.x}
                      y1={p.yLower}
                      x2={p.x}
                      y2={p.yUpper}
                      stroke="rgba(255,107,0,0.3)"
                      strokeWidth="1"
                    />
                  </g>
                ))}
              </svg>

              {/* Dynamic hover statistics box */}
              {hoveredPoint && (
                <div 
                  className="absolute bg-[#071b36] border border-isro-orange/50 p-2.5 rounded shadow-lg text-left text-[10px] font-mono"
                  style={{
                    left: `${Math.min(hoveredPoint.x + 10, width - 110)}px`,
                    top: `${Math.min(hoveredPoint.y - 45, height - 60)}px`
                  }}
                >
                  <p className="text-white font-bold">{hoveredPoint.data.time}</p>
                  <p className="text-isro-orange font-bold mt-0.5">AQI: {hoveredPoint.data.aqi}</p>
                  <p className="text-slate-400">CI Range: {hoveredPoint.data.lowerBound} - {hoveredPoint.data.upperBound}</p>
                </div>
              )}
            </div>

            {/* Bottom Timeline labels */}
            <div className="flex justify-between mt-3 text-[9px] font-mono text-slate-500">
              {displayTrends.map((d, index) => (
                <span key={index}>{d.time.replace(" (Tomorrow)", "")}</span>
              ))}
            </div>

          </div>

        </div>

        {/* Right side: LSTM structural block */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-isro-orange" />
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">Predictive Network Architecture</span>
            </div>

            <div className="space-y-3 font-sans text-xs text-left">
              <div className="bg-[#040d1a]/60 border border-slate-900 p-3 rounded-lg">
                <span className="text-[10px] font-mono font-bold text-sky-blue uppercase block mb-1">CNN Convolutional Layers</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Extract deep geographic features, spatial aerosol gradients, and local terrain parameters from satellite images.
                </p>
              </div>

              <div className="bg-[#040d1a]/60 border border-slate-900 p-3 rounded-lg">
                <span className="text-[10px] font-mono font-bold text-isro-orange uppercase block mb-1">LSTM Temporal Gating</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Processes multi-day sequence dependencies to encapsulate meteorological inertia, pressure troughs, and transport offsets.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-lg flex gap-2.5 mt-5">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="text-left font-sans">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">Forecast Warning</span>
              <p className="text-[10px] text-slate-300 leading-relaxed mt-0.5">
                Volatiles and PM2.5 columns over Delhi NCT are predicted to elevate in 72 hours due to atmospheric stagnant wind boundary drops.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
