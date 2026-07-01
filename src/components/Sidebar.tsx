import React from "react";
import { Page } from "../types";
import { 
  LayoutGrid, 
  Map, 
  Droplet, 
  Flame, 
  Cloud, 
  BarChart3, 
  Satellite, 
  ClipboardList, 
  Bell, 
  Settings, 
  Info,
  X 
} from "lucide-react";

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ currentPage, setCurrentPage, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { page: Page.Dashboard, label: "Dashboard", icon: LayoutGrid },
    { page: Page.IndiaMap, label: "India AQI Map", icon: Map },
    { page: Page.HchoHotspots, label: "HCHO Hotspots", icon: Droplet },
    { page: Page.FireDetection, label: "Fire Detection", icon: Flame },
    { page: Page.Forecast, label: "Forecast", icon: Cloud },
    { page: Page.Analytics, label: "Analytics", icon: BarChart3 },
    { page: Page.SatelliteLayers, label: "Satellite Layers", icon: Satellite },
    { page: Page.Reports, label: "Reports", icon: ClipboardList },
    { page: Page.Alerts, label: "Alerts", icon: Bell },
    { page: Page.Settings, label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[990] md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside 
        id="sidebar-panel" 
        className={`fixed md:relative inset-y-0 left-0 z-[1000] bg-[#020712] border-r border-slate-800/50 flex flex-col justify-between select-none shrink-0 transition-all duration-300 ease-in-out ${
          isOpen 
            ? "translate-x-0 w-[240px] opacity-100" 
            : "-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:pointer-events-none md:border-r-0"
        } ${isOpen ? "shadow-2xl shadow-black/80 md:shadow-none" : ""}`}
      >
        {/* Main Navigation links */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Mobile close button (hidden on desktop) */}
          <div className="md:hidden flex justify-end p-3 border-b border-slate-800/40">
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="p-3 space-y-1.5 pt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  id={`nav-link-${item.page.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => {
                    setCurrentPage(item.page);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-[13px] font-sans font-medium transition-all duration-200 group relative ${
                    isActive 
                      ? "bg-[#0c1a30] text-white font-bold" 
                      : "text-slate-400 hover:bg-slate-900/40 hover:text-white"
                  }`}
                >
                  {/* Selected Vertical Accent Bar on the Left */}
                  {isActive && (
                    <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] bg-sky-500 rounded-r" />
                  )}

                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* AIR QUALITY INDEX (AQI) Legend & About Box exactly as shown in mockup */}
        <div className="p-4 border-t border-slate-800/30 space-y-5 bg-[#020712]/90">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Air Quality Index (AQI)
            </span>
            <div className="space-y-2 text-[11px] font-sans">
              {[
                { label: "Good", range: "0 - 50", color: "bg-[#128807]" },
                { label: "Satisfactory", range: "51 - 100", color: "bg-[#84cc16]" },
                { label: "Moderate", range: "101 - 200", color: "bg-[#eab308]" },
                { label: "Poor", range: "201 - 300", color: "bg-[#f97316]" },
                { label: "Very Poor", range: "301 - 400", color: "bg-[#ef4444]" },
                { label: "Severe", range: "401 - 500", color: "bg-[#9f1239]" }
              ].map((lvl, index) => (
                <div key={index} className="grid grid-cols-[16px_1.2fr_1.5fr] items-center py-0.5 leading-none">
                  <span className={`h-2.5 w-2.5 rounded-full ${lvl.color}`} />
                  <span className="text-white font-mono font-bold tracking-wide">{lvl.range}</span>
                  <span className="text-slate-400 text-right font-medium">{lvl.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* About AstraAQI Button Container */}
          <div className="border border-slate-800/80 rounded-xl p-3 bg-[#030914] hover:bg-slate-800/30 transition-all cursor-pointer flex items-center gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-sans font-medium text-slate-300 text-xs">About AstraAQI</span>
          </div>
        </div>
      </aside>
    </>
  );
}
