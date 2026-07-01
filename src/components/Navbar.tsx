import React, { useState } from "react";
import { 
  Search, 
  Calendar, 
  Bell, 
  User, 
  SearchCode, 
  Compass, 
  Database,
  Satellite,
  Volume2
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
}

export default function Navbar({
  onSearch,
  selectedDate,
  setSelectedDate,
  selectedSatellite,
  setSelectedSatellite,
  alerts,
  onDismissAlert
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
    <header className="h-16 border-b border-slate-800 bg-[#071B36]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 relative z-40 select-none">
      
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center w-80 relative">
        <input
          type="text"
          placeholder="Search Indian States or Cities..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch(e.target.value);
          }}
          className="w-full bg-[#040d1a]/80 border border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-isro-orange transition-all font-sans"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
      </form>

      {/* Center Controls: Date, Satellite Selectors */}
      <div className="flex items-center gap-4">
        
        {/* Satellite Quick Selector */}
        <div className="flex items-center gap-2 bg-[#040d1a]/60 border border-slate-800 rounded-lg px-2.5 py-1">
          <Satellite className="w-3.5 h-3.5 text-sky-blue" />
          <span className="text-[10px] font-mono text-slate-400">Sensor:</span>
          <select
            value={selectedSatellite}
            onChange={(e) => setSelectedSatellite(e.target.value)}
            className="bg-transparent text-xs text-slate-200 border-0 focus:outline-none focus:ring-0 font-mono pr-2"
          >
            {satelliteOptions.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#040d1a] text-white text-xs">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#040d1a]/60 border border-slate-800 rounded-lg px-2.5 py-1">
          <Calendar className="w-3.5 h-3.5 text-isro-orange" />
          <span className="text-[10px] font-mono text-slate-400">Period:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs text-slate-200 border-0 focus:outline-none focus:ring-0 font-mono"
            style={{ colorScheme: "dark" }}
          />
        </div>

        {/* Geospatial Coordinate Anchor */}
        <div className="hidden lg:flex items-center gap-1.5 font-mono text-[10px] text-slate-400 bg-[#040d1a]/40 px-2 py-1 rounded">
          <Compass className="w-3 h-3 text-sky-blue" />
          <span>IN-NW: 20.5937° N, 78.9629° E</span>
        </div>
      </div>

      {/* Right Side: Alerts, User Profile */}
      <div className="flex items-center gap-4">
        
        {/* Alerts Center */}
        <div className="relative">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="relative p-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer text-slate-300 hover:text-white"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600 animate-pulse glow-red" />
            )}
          </button>

          {/* Alerts Dropdown Panel */}
          {isAlertsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-[#071b36] border border-slate-800 rounded-lg shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-800 bg-[#040d1a] flex items-center justify-between">
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
                        className="text-[10px] font-mono text-isro-orange hover:text-white transition-colors cursor-pointer"
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

        {/* User Identity Banner */}
        <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <User className="w-4 h-4 text-sky-blue" />
          </div>
          <div className="hidden sm:block text-left select-none">
            <div className="text-xs font-sans font-semibold text-white">Dr. K. Sharma</div>
            <div className="text-[9px] font-mono text-slate-400 tracking-wider">NRSC Specialist</div>
          </div>
        </div>

      </div>

    </header>
  );
}
