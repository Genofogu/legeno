import React, { useState } from "react";
import { 
  Search, 
  Calendar, 
  Bell, 
  User, 
  Compass, 
  Satellite,
  Menu,
  X,
  HelpCircle,
  Clock,
  Play,
  Orbit
} from "lucide-react";

interface Alert {
  id: string;
  type: "AQI" | "HCHO" | "FIRE" | "WIND";
  message: string;
  time: string;
  level: "CRITICAL" | "WARNING" | "INFO";
}

interface NavbarProps {
  onSearch: (query: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedSatellite: string;
  setSelectedSatellite: (satId: string) => void;
  alerts: Alert[];
  onDismissAlert: (id: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Navbar({
  onSearch,
  selectedDate,
  setSelectedDate,
  selectedSatellite,
  setSelectedSatellite,
  alerts,
  onDismissAlert,
  isSidebarOpen,
  onToggleSidebar
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const satelliteOptions = [
    { id: "all", label: "All Sensors Merged" },
    { id: "sentinel5p", label: "Sentinel-5P TROPOMI" },
    { id: "insat3d", label: "INSAT-3D Imager" },
    { id: "modis", label: "Aqua/Terra MODIS" },
    { id: "viirs", label: "Suomi NPP VIIRS" },
  ];

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#020712] flex items-center justify-between px-6 shrink-0 relative z-40 select-none">
      
      {/* Left side: AstraAQI Brand Logo & Subtitle */}
      <div className="flex items-center gap-4">
        {/* Burger Menu Button (Visible on mobile/tablet, hidden on desktop to match mockup perfectly) */}
        <button
          id="burger-menu-btn"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-300 hover:text-white transition-colors cursor-pointer flex md:hidden items-center justify-center shrink-0"
          title={isSidebarOpen ? "Collapse navigation" : "Expand navigation"}
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-orange-500 transition-transform duration-200" />
          ) : (
            <Menu className="w-5 h-5 text-slate-300 transition-transform duration-200" />
          )}
        </button>

        {/* Brand identity: Logo, Name & Tagline */}
        <div className="flex items-center gap-3">
          {/* Custom vector aerospace logo mimicking the mockup exactly */}
          <div className="relative flex items-center justify-center w-9 h-9">
            <svg className="w-8 h-8 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="50" cy="55" rx="35" ry="12" transform="rotate(-15 50 55)" stroke="url(#orbitGrad)" strokeWidth="3" fill="none" />
              <path d="M50 15 L62 70 L50 58 L38 70 Z" fill="url(#rocketGrad)" />
              <path d="M50 15 L50 58 L38 70 Z" fill="#b45309" opacity="0.3" />
              <defs>
                <linearGradient id="rocketGrad" x1="50" y1="15" x2="50" y2="70" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
                <linearGradient id="orbitGrad" x1="15" y1="55" x2="85" y2="55" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline font-sans leading-none">
              <span className="text-[19px] font-bold tracking-tight text-white">Astra</span>
              <span className="text-[19px] font-extrabold text-[#ff9933] ml-[1px]">AQI</span>
            </div>
            <span className="text-[9px] font-semibold text-slate-400 tracking-wider mt-0.5 leading-none">
              Satellite Air Quality Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* Center-left Controls: Highly Polished Search Input */}
      <div className="flex-1 max-w-sm ml-6 hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="flex items-center w-full bg-[#040D1A]/90 border border-slate-800/80 rounded-lg overflow-hidden focus-within:border-sky-500/50 transition-all shadow-inner">
            <div className="pl-3 pr-2 flex items-center justify-center text-slate-500 shrink-0">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search City / State / District"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch(e.target.value);
              }}
              className="w-full bg-transparent py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-sans font-medium"
            />
            <div className="h-5 w-[1px] bg-slate-800/80 shrink-0" />
            <button type="submit" className="px-3.5 py-2 text-slate-400 hover:text-white transition-colors shrink-0 hover:bg-slate-800/20">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Center-right Controls: Unified Period/Date Selector & Now Button */}
      <div className="flex items-center gap-2">
        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#040D1A]/90 border border-slate-800/85 rounded-lg px-3 py-1.5 hover:border-slate-700 transition-all cursor-pointer relative group">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full z-10"
              style={{ colorScheme: "dark" }}
            />
            <span className="text-[11px] text-slate-200 font-sans font-semibold select-none pr-4">
              {selectedDate ? (() => {
                try {
                  const d = new Date(selectedDate);
                  if (isNaN(d.getTime())) return "07 May 2026";
                  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                } catch {
                  return "07 May 2026";
                }
              })() : "07 May 2026"}
            </span>
            <span className="text-[8px] text-slate-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-slate-300 transition-colors">▼</span>
          </div>
        </div>

        {/* NOW Button */}
        <button 
          onClick={() => setSelectedDate("2026-07-01")}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#040D1A]/95 hover:bg-sky-500/10 text-sky-400 border border-slate-800/85 rounded-lg text-[11px] font-bold transition-all cursor-pointer hover:border-sky-500/30"
        >
          <Clock className="w-3.5 h-3.5 text-sky-400 animate-pulse" style={{ animationDuration: "3s" }} />
          <span>Now</span>
        </button>
      </div>

      {/* Right Side Controls: Divider | Live status | Notification Bell | Help | Avatar */}
      <div className="flex items-center gap-4">
        
        {/* Vertical divider */}
        <div className="h-6 w-[1px] bg-slate-800/80 shrink-0" />

        {/* Live status feed */}
        <div className="flex items-center gap-2.5 text-left shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0 shadow-lg shadow-emerald-500/40" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-wide leading-none">Live</span>
            <span className="text-[8.5px] font-mono text-slate-500 mt-1 leading-none">Data Updated: 10:32 AM IST</span>
          </div>
        </div>

        {/* Notification/Alerts Center */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="relative p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            )}
          </button>

          {/* Alerts Dropdown Panel */}
          {isAlertsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-[#071b36] border border-slate-800 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-800 bg-[#040a15] flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">Platform Alerts</span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {alerts.length} Active
                </span>
              </div>
              
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 font-sans">
                    No active telemetry anomalies.
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="p-3 hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          alert.level === "CRITICAL" 
                            ? "bg-rose-500/15 text-rose-400" 
                            : alert.level === "WARNING" 
                            ? "bg-amber-500/15 text-amber-400" 
                            : "bg-sky-500/15 text-sky-400"
                        }`}>
                          {alert.level}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{alert.time}</span>
                      </div>
                      <p className="text-xs text-slate-200 font-sans mb-2">{alert.message}</p>
                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="text-[10px] font-mono text-[#ff9933] hover:text-white transition-colors cursor-pointer"
                      >
                        Acknowledge & clear
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Circle Button */}
        <button 
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all cursor-pointer shrink-0"
          title="System Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Premium Profile Avatar Image matching mockup precisely */}
        <div className="flex items-center shrink-0">
          <div className="relative group cursor-pointer">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-700/80 hover:border-orange-500 transition-colors bg-slate-900 shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" 
                alt="genofogu" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Active Green Badge */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#020712] rounded-full" />
          </div>
        </div>

      </div>

    </header>
  );
}
