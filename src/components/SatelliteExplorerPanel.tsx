import React, { useState } from "react";
import { initialSatelliteLayers } from "../data";
import { Compass, Download, Eye, FileJson, Layers, Sliders, Info, SplitSquareVertical } from "lucide-react";

export default function SatelliteExplorerPanel() {
  const [layers, setLayers] = useState(initialSatelliteLayers);
  const [leftSensor, setLeftSensor] = useState("sentinel5p");
  const [rightSensor, setRightSensor] = useState("modis");
  const [timelinePeriod, setTimelinePeriod] = useState("2026-06-30");

  const handleOpacityChange = (id: string, opacity: number) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, opacity } : l));
  };

  const toggleLayerActive = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l));
  };

  // Triggers simulated GeoJSON downloading
  const triggerDownloadGeoJSON = () => {
    const geojsonData = {
      type: "FeatureCollection",
      metadata: {
        platform: "AstraAQI Satellite Fusion Module",
        sensor_left: leftSensor,
        sensor_right: rightSensor,
        timestamp: new Date().toISOString()
      },
      features: [
        {
          type: "Feature",
          properties: { region: "Indo-Gangetic Plain", hcho_column: 2.8, fire_count: 42 },
          geometry: { type: "Polygon", coordinates: [[[74.0, 30.0], [77.0, 30.0], [77.0, 28.0], [74.0, 28.0], [74.0, 30.0]]] }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(geojsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AstraAQI_Satellite_${leftSensor}_${timelinePeriod}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 select-none">
      
      {/* Header telemetry board */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#071B36] border border-slate-800 p-5 rounded-xl">
        <div className="text-left">
          <span className="text-xs font-mono tracking-widest text-isro-orange uppercase font-bold">Spaceborne Spectrophotometry</span>
          <h2 className="text-2xl font-display font-bold text-white mt-0.5">Satellite Data Explorer & Sensor Fusion</h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Directly cross-analyze spectral layers from geostationary (INSAT-3D) and polar-orbiting (Sentinel-5P) assets. Configure layer opacities and fuse indices to track transport plumes.
          </p>
        </div>

        {/* Download triggers */}
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={triggerDownloadGeoJSON}
            className="px-4 py-2 bg-gradient-to-tr from-sky-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-xs text-slate-900 rounded-lg font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <FileJson className="w-4 h-4 text-slate-900" />
            Download GeoJSON Map
          </button>
        </div>
      </div>

      {/* Dual Comparison Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sliders Control Deck */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 space-y-5 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-4 h-4 text-isro-orange" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Multi-Sensor Opacity Controllers</span>
          </div>

          <div className="space-y-4">
            {layers.map((layer) => (
              <div key={layer.id} className="p-3.5 rounded-lg bg-[#040d1a]/80 border border-slate-900 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLayerActive(layer.id)}
                      className={`p-1 rounded hover:bg-slate-800 cursor-pointer ${layer.isActive ? "text-isro-orange" : "text-slate-500"}`}
                      title={layer.isActive ? "Disable Layer" : "Enable Layer"}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className="text-xs font-sans font-bold text-white">{layer.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{layer.parameter} | Agency: {layer.agency}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-sky-blue bg-sky-blue/10 px-1.5 py-0.5 rounded uppercase">
                    Res: {layer.resolution}
                  </span>
                </div>

                {/* Opacity slider */}
                {layer.isActive && (
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-slate-500">OPACITY:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer.opacity * 100}
                      onChange={(e) => handleOpacityChange(layer.id, Number(e.target.value) / 100)}
                      className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-isro-orange"
                    />
                    <span className="text-[10px] font-mono text-isro-orange font-bold w-8 text-right">
                      {(layer.opacity * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Dual Split Side panel */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SplitSquareVertical className="w-5 h-5 text-isro-orange" />
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">Fused Sensor Diagnostics</span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="bg-[#040d1a]/60 border border-slate-900 p-3 rounded-lg space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-sky-blue block uppercase">Primary Comparative Node</span>
                <select
                  value={leftSensor}
                  onChange={(e) => setLeftSensor(e.target.value)}
                  className="w-full bg-[#071b36] border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
                >
                  {layers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <p className="text-[10px] text-slate-400">
                  Displays core tropospheric trace gases, formaldehyde distributions, and molecular densities.
                </p>
              </div>

              <div className="bg-[#040d1a]/60 border border-slate-900 p-3 rounded-lg space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-isro-orange block uppercase">Secondary Cross Node</span>
                <select
                  value={rightSensor}
                  onChange={(e) => setRightSensor(e.target.value)}
                  className="w-full bg-[#071b36] border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
                >
                  {layers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <p className="text-[10px] text-slate-400">
                  Overlays active thermal FRP markers, particulate models, and 850 hPa vertical wind fields.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-sky-500/10 border border-sky-500/20 p-3.5 rounded-lg flex gap-2.5 mt-5">
            <Info className="w-5 h-5 text-sky-blue shrink-0" />
            <div className="text-left font-sans">
              <span className="text-[10px] font-mono font-bold text-sky-blue uppercase">Geospatial Sync</span>
              <p className="text-[10px] text-slate-300 leading-relaxed mt-0.5">
                All coordinates are mapped onto standard WGS-84 projections to maintain zero-pixel deviation across MODIS and TROPOMI channels.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
