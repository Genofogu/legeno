import React, { useState, useEffect, useRef } from "react";
import { StateData, FireEvent } from "../types";
import { Compass, Flame, Shield, HelpCircle, Eye, Calendar, Play, Pause, ChevronRight } from "lucide-react";

interface HotspotsPanelProps {
  statesData: StateData[];
  fireEvents: FireEvent[];
}

export default function HotspotsPanel({ statesData, fireEvents }: HotspotsPanelProps) {
  const [selectedSeason, setSelectedSeason] = useState("Post-Monsoon (Oct-Nov)");
  const [timeStep, setTimeStep] = useState(2); // Current timeline slider
  const [isPlaying, setIsPlaying] = useState(true);
  const [showFires, setShowFires] = useState(true);
  const [showWindVectors, setShowWindVectors] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const seasons = [
    "Winter (Dec-Feb)",
    "Pre-Monsoon (Mar-May)",
    "Monsoon (Jun-Sep)",
    "Post-Monsoon (Oct-Nov)"
  ];

  const timeTimeline = [
    "08:00 AM (Sentinel-5P Orbit A)",
    "11:30 AM (Geostationary Scan B)",
    "01:30 PM (TROPOMI Master Feed)",
    "04:00 PM (Aerosol Dispersal Peak)",
    "08:30 PM (Nighttime IR Retrospective)"
  ];

  // Hotspot registry representing real industrial HCHO clusters over India
  const hotspotsList = [
    { name: "Jamnagar Petrochemical Corridor", state: "Gujarat", val: 3.8, desc: "Refinery volatile venting & dense industrial VOC columns" },
    { name: "Singrauli Thermal Power Cluster", state: "Madhya Pradesh", val: 3.9, desc: "Coal combustion, gaseous emissions & high aerosol index" },
    { name: "Korba Industrial Valley", state: "Chhattisgarh", val: 3.9, desc: "Smelter complexes, coal mining & heavy thermal loads" },
    { name: "Kothagudem-Talcher Metallurgical Belt", state: "Odisha / Telangana", val: 3.8, desc: "Steel plants, thermal coal extraction and fuel burning" }
  ];

  // Continuous animation loop simulating atmospheric HCHO dispersion with particle waves
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = 300);

    // Particle class for dispersion waves
    class PlumeParticle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      color: string;

      constructor(startX: number, startY: number, windAngle: number) {
        this.x = startX;
        this.y = startY;
        this.size = Math.random() * 8 + 4;
        
        // Convert wind angle to speed vectors
        const rad = (windAngle * Math.PI) / 180;
        const windSpeedMultiplier = 2.5 + Math.random() * 2;
        this.speedX = Math.cos(rad) * windSpeedMultiplier;
        this.speedY = Math.sin(rad) * windSpeedMultiplier;
        
        this.alpha = 1;
        this.color = Math.random() > 0.4 ? "rgba(244, 63, 94," : "rgba(234, 179, 8,"; // Pink and Yellow plume
      }

      update() {
        this.x += this.speedX + (Math.random() - 0.5) * 1.5;
        this.y += this.speedY + (Math.random() - 0.5) * 1.5;
        this.alpha -= 0.012;
        this.size += 0.25;
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx!.save();
        ctx!.beginPath();
        const grad = ctx!.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        grad.addColorStop(0, `${this.color}${this.alpha})`);
        grad.addColorStop(1, `${this.color}0)`);
        ctx!.fillStyle = grad;
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
    }

    let particles: PlumeParticle[] = [];

    // Core emitter centers matching the hotspots
    const emitters = [
      { x: width * 0.2, y: height * 0.4, name: "Jamnagar" },
      { x: width * 0.5, y: height * 0.45, name: "Singrauli" },
      { x: width * 0.6, y: height * 0.65, name: "Korba" },
      { x: width * 0.45, y: height * 0.75, name: "Talcher" }
    ];

    const animate = () => {
      // Clear with atmospheric dark shade
      ctx.fillStyle = "rgba(4, 13, 26, 0.2)";
      ctx.fillRect(0, 0, width, height);

      // Draw gridlines
      ctx.strokeStyle = "rgba(255,255,255,0.02)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Prevailing winds depend on season
      let windAngle = 10; // degrees
      if (selectedSeason.includes("Post-Monsoon")) windAngle = 15; // NW to SE drift
      if (selectedSeason.includes("Monsoon")) windAngle = -45; // SW to NE drift

      if (isPlaying) {
        emitters.forEach(emitter => {
          if (Math.random() > 0.55) {
            particles.push(new PlumeParticle(emitter.x, emitter.y, windAngle));
          }
        });
      }

      // Update and draw particles
      particles.forEach((p, idx) => {
        p.update();
        p.draw();
        if (p.alpha <= 0) {
          particles.splice(idx, 1);
        }
      });

      // Draw emitters
      emitters.forEach(emitter => {
        ctx.beginPath();
        ctx.arc(emitter.x, emitter.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#F43F5E";
        ctx.shadowColor = "#F43F5E";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Pulse ring
        ctx.beginPath();
        ctx.arc(emitter.x, emitter.y, 10 + (Date.now() % 1000) / 100, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(244, 63, 94, 0.4)";
        ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "9px monospace";
        ctx.fillText(emitter.name, emitter.x - 20, emitter.y - 12);
      });

      // Wind transport arrows
      if (showWindVectors) {
        ctx.strokeStyle = "rgba(41, 182, 246, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 40; i < width; i += 120) {
          for (let j = 40; j < height; j += 80) {
            const rad = (windAngle * Math.PI) / 180;
            ctx.moveTo(i, j);
            ctx.lineTo(i + Math.cos(rad) * 20, j + Math.sin(rad) * 20);
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedSeason, isPlaying, showWindVectors]);

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#071B36] border border-slate-800 p-5 rounded-xl">
        <div>
          <span className="text-xs font-mono tracking-widest text-isro-orange uppercase font-bold">Sentinel-5P Trace Gases</span>
          <h2 className="text-2xl font-display font-bold text-white mt-0.5">Formaldehyde (HCHO) Column Hotspots</h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Atmospheric Formaldehyde (HCHO) serves as a key indicator of chemical reactivity in the troposphere, originating from industrial organic compounds (VOCs), oil refining, coal power, and heavy biomass crop residual fires.
          </p>
        </div>

        {/* CPCB standard indicator */}
        <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-center gap-3">
          <Shield className="w-5 h-5 text-rose-500" />
          <div className="text-left font-sans">
            <p className="text-[9px] font-mono text-rose-400 font-bold uppercase">CPCB Safeguard limit</p>
            <p className="text-xs text-slate-300">Target columns &lt; 1.5 × 10¹⁶ molec/cm²</p>
          </div>
        </div>
      </div>

      {/* Dispersion Simulator Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Plume Simulation Panel */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-blue" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">TROPOMI Plume Dispersal Model (Simulated)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  title={isPlaying ? "Pause Dispersion" : "Play Dispersion"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-sky-blue" /> : <Play className="w-4 h-4 text-isro-orange" />}
                </button>
              </div>
            </div>

            <div className="w-full h-[300px] rounded-lg overflow-hidden border border-slate-900 bg-[#040d1a] relative">
              <canvas ref={canvasRef} className="w-full h-full block" />
              
              {/* Compass Indicator */}
              <div className="absolute top-4 right-4 bg-slate-950/80 p-2 rounded border border-slate-800 text-[10px] font-mono text-slate-300">
                <p>WIND DIRECTION</p>
                <p className="text-isro-orange font-bold uppercase">
                  {selectedSeason.includes("Post-Monsoon") ? "Northwesterly (NW)" : "Southwesterly (SW)"}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline and Season Controller */}
          <div className="mt-5 space-y-4 pt-4 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              {/* Seasons filter chips */}
              <div className="flex flex-wrap gap-1.5">
                {seasons.map((season) => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={`px-3 py-1.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                      selectedSeason === season 
                        ? "bg-isro-orange text-white font-bold glow-orange" 
                        : "bg-slate-900/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    {season}
                  </button>
                ))}
              </div>

              {/* Dynamic toggles */}
              <div className="flex gap-3 text-[10px] font-mono">
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWindVectors}
                    onChange={(e) => setShowWindVectors(e.target.checked)}
                    className="accent-isro-orange"
                  />
                  <span>Show Vectors</span>
                </label>
              </div>
            </div>

            {/* Time period timeline slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>SCENE PLAYBACK TIMELINE</span>
                <span className="text-isro-orange font-bold">{timeTimeline[timeStep]}</span>
              </div>
              <input
                type="range"
                min="0"
                max={timeTimeline.length - 1}
                value={timeStep}
                onChange={(e) => setTimeStep(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-isro-orange"
              />
            </div>
          </div>

        </div>

        {/* Hotspots details panel */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block mb-3 font-semibold">Active Industrial Clusters</span>
            
            <div className="space-y-3.5">
              {hotspotsList.map((hotspot, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#040d1a]/60 border border-slate-900 hover:border-slate-800 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-sans font-bold text-white">{hotspot.name}</span>
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded">
                      {hotspot.val}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">{hotspot.state}</p>
                  <p className="text-[10px] font-sans text-slate-300 mt-1 leading-relaxed">
                    {hotspot.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-lg flex gap-2.5 mt-5">
            <HelpCircle className="w-5 h-5 text-sky-blue shrink-0" />
            <div className="text-left">
              <span className="text-[10px] font-mono font-bold text-sky-blue uppercase">Scientific context</span>
              <p className="text-[10px] text-slate-300 font-sans mt-0.5 leading-relaxed">
                TROPOMI measuring devices map solar backscatter radiation in the UV spectra to resolve columns of formaldehyde with pristine geographic fidelity.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
