import React from "react";
import { Page } from "../types";
import { 
  LayoutDashboard, 
  Map, 
  Flame, 
  TrendingUp, 
  BarChart3, 
  Layers, 
  FileText, 
  Settings, 
  Orbit, 
  Activity, 
  Compass,
  Radio,
  X
} from "lucide-react";

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  satelliteStatus: { id: string; name: string; status: "NOMINAL" | "STANDBY" | "OFFLINE"; signal: number }[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ currentPage, setCurrentPage, satelliteStatus, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { page: Page.Dashboard, label: "Mission Dashboard", icon: LayoutDashboard },
    { page: Page.IndiaMap, label: "India AQI Map", icon: Map },
    { page: Page.HchoHotspots, label: "HCHO Hotspots", icon: Compass },
    { page: Page.SatelliteLayers, label: "Satellite Explorer", icon: Layers },
    { page: Page.FireDetection, label: "Thermal Fires", icon: Flame },
    { page: Page.Forecast, label: "AI Forecast", icon: TrendingUp },
    { page: Page.Analytics, label: "Atmospheric Analytics", icon: BarChart3 },
    { page: Page.Reports, label: "Reports & Exports", icon: FileText },
    { page: Page.Settings, label: "Command Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[990] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside 
        id="sidebar-panel" 
        className={`fixed lg:relative inset-y-0 left-0 z-[1000] bg-[#040d1a] border-r border-slate-800 flex flex-col justify-between select-none shrink-0 transition-all duration-300 ease-in-out ${
          isOpen 
            ? "translate-x-0 w-64 opacity-100" 
            : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:pointer-events-none lg:border-r-0"
        } ${isOpen ? "shadow-2xl shadow-black/80 lg:shadow-none" : ""}`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-800/80 bg-gradient-to-b from-[#071B36] to-[#040d1a]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-tr from-isro-orange to-sky-blue overflow-hidden shadow-md shadow-isro-orange/10">
                  <Orbit className="w-5 h-5 text-white animate-spin" style={{ animationDuration: "25s" }} />
                  <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-xl tracking-wider text-white">ASTRA</span>
                    <span className="font-display font-extrabold text-xl text-isro-orange">AQI</span>
                  </div>
                  <p className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">ISRO Hackathon '26</p>
                </div>
              </div>

              {/* Close Sidebar Button on Mobile */}
              <button 
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                id={`nav-link-${item.page.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => setCurrentPage(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all duration-200 group ${
                  isActive 
                    ? "bg-isro-orange/10 border-l-2 border-isro-orange text-white font-medium" 
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-isro-orange" : "text-slate-400 group-hover:text-sky-blue"}`} />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-isro-orange animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Satellite Transceiver Status Panel */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-sky-blue animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">NRSC Sat Link</span>
          <span className="ml-auto text-[10px] font-mono text-emerald-green bg-emerald-green/10 px-1.5 py-0.5 rounded border border-emerald-green/20 animate-pulse">
            LIVE
          </span>
        </div>
        
        <div className="space-y-2 text-[10px] font-mono">
          {satelliteStatus.map((sat) => (
            <div key={sat.id} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
              <span className="text-slate-400 truncate max-w-[120px]" title={sat.name}>{sat.name}</span>
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${
                  sat.status === "NOMINAL" 
                    ? "bg-emerald-green animate-pulse" 
                    : sat.status === "STANDBY" 
                    ? "bg-yellow-500 animate-pulse" 
                    : "bg-rose-500"
                }`} />
                <span className={`font-bold ${
                  sat.status === "NOMINAL" ? "text-slate-300" : "text-slate-500"
                }`}>{sat.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-900 flex items-center justify-between text-[9px] font-mono text-slate-500">
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-sky-blue" />
            <span>Telemetry RSSI</span>
          </div>
          <span className="text-sky-blue font-bold">-68 dBm</span>
        </div>
      </div>
    </aside>
    </>
  );
}
