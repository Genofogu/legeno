import React from "react";
import { FileText, Download, ShieldCheck, Mail, Printer, AlertCircle } from "lucide-react";

export default function ReportsPanel() {
  const reportsList = [
    {
      id: "R1",
      title: "CPCB National Air Quality Summary",
      type: "Official Briefing",
      date: "June 30, 2026",
      desc: "Comprehensive surface AQI statistics and NCAP compliance review for key metropolitan cities."
    },
    {
      id: "R2",
      title: "Crop Residuary Fire Emissions Briefing",
      type: "Scientific Report",
      date: "June 28, 2026",
      desc: "MODIS & VIIRS active fire counts and quantitative particulate emission payloads for downwind states."
    },
    {
      id: "R3",
      title: "TROPOMI Tropospheric HCHO Hotspots Audit",
      type: "Remote Sensing Audit",
      date: "June 25, 2026",
      desc: "Geospatial analysis of volatile formaldehyde columns over petroleum corridors and coal fields."
    }
  ];

  const handleSimulatedDownload = (reportTitle: string) => {
    alert(`Generating high-fidelity bulletin: "${reportTitle}". Preparing PDF metadata. Download initiated successfully!`);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 select-none">
      
      {/* Header telemetry board */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#071B36] border border-slate-800 p-5 rounded-xl text-left">
        <div>
          <span className="text-xs font-mono tracking-widest text-isro-orange uppercase font-bold">Government Bulletins</span>
          <h2 className="text-2xl font-display font-bold text-white mt-0.5">Atmospheric Reports & Bulletins Generator</h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Generate and export verified environmental reports ready for submitting to the Central Pollution Control Board (CPCB), state pollution agencies, and disaster coordination portals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reports Directory list */}
        <div className="lg:col-span-2 space-y-4 text-left">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-isro-orange" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Reports Directory</span>
          </div>

          <div className="space-y-3">
            {reportsList.map((rep) => (
              <div key={rep.id} className="p-4 rounded-xl bg-[#040d1a]/80 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-sky-blue bg-sky-blue/10 px-1.5 py-0.2 rounded uppercase">
                      {rep.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{rep.date}</span>
                  </div>
                  <h3 className="text-sm font-sans font-bold text-white">{rep.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">{rep.desc}</p>
                </div>

                <button
                  onClick={() => handleSimulatedDownload(rep.title)}
                  className="px-3.5 py-2 bg-gradient-to-tr from-isro-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-xs text-white rounded-lg font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shrink-0"
                >
                  <Download className="w-4 h-4 text-white" />
                  PDF Export
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Right side notification center */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-isro-orange" />
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">Verification Standards</span>
            </div>

            <div className="bg-[#040d1a]/60 border border-slate-900 p-3 rounded-lg text-[11px] text-slate-300 font-sans leading-relaxed">
              <span className="text-[10px] font-mono font-bold text-sky-blue block uppercase mb-1">NRSC-CPCB Data Fusion</span>
              All exported statistics undergo dual validation against ground-based CPCB analyzers (using Federal Reference Methods) and Sentinel-5P column density calculations.
            </div>

            <div className="bg-[#040d1a]/60 border border-slate-900 p-3 rounded-lg text-[11px] text-slate-300 font-sans leading-relaxed">
              <span className="text-[10px] font-mono font-bold text-isro-orange block uppercase mb-1">NCAP Reporting Template</span>
              Compliance metrics conform with the Ministry of Environment, Forest and Climate Change (MoEFCC) National Clean Air Programme auditing standards.
            </div>
          </div>

          <div className="bg-sky-500/10 border border-sky-500/20 p-3.5 rounded-lg flex gap-2 mt-5">
            <AlertCircle className="w-4 h-4 text-sky-blue shrink-0" />
            <p className="text-[10px] text-slate-300 font-sans text-left leading-relaxed">
              Report files are signed cryptographically with ISRO NRSC telemetry master key vectors.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
