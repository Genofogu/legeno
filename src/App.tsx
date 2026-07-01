import React, { useState } from "react";
import { Page, StateData, FireEvent, AlertItem } from "./types";
import { initialStatesData, mockFireEvents, initialAlerts } from "./data";

// Component imports
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import MapContainer from "./components/MapContainer";
import DashboardOverview from "./components/DashboardOverview";
import StateDetailsPanel from "./components/StateDetailsPanel";
import HotspotsPanel from "./components/HotspotsPanel";
import FireDetectionPanel from "./components/FireDetectionPanel";
import ForecastPanel from "./components/ForecastPanel";
import AnalyticsPanel from "./components/AnalyticsPanel";
import SatelliteExplorerPanel from "./components/SatelliteExplorerPanel";
import ReportsPanel from "./components/ReportsPanel";
import SettingsPanel from "./components/SettingsPanel";
import AiAssistant from "./components/AiAssistant";

// Icon imports
import { 
  Satellite, 
  Flame, 
  ShieldAlert, 
  Gauge, 
  Compass,
  Bell
} from "lucide-react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState("2026-06-30");
  const [selectedSatellite, setSelectedSatellite] = useState("sentinel5p");
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [statesData, setStatesData] = useState<StateData[]>(initialStatesData);

  // Satellite Transceiver feeds
  const satelliteStatus = [
    { id: "S1", name: "Sentinel-5P", status: "NOMINAL" as const, signal: 94 },
    { id: "S2", name: "INSAT-3D", status: "NOMINAL" as const, signal: 82 },
    { id: "S3", name: "MODIS (Terra)", status: "NOMINAL" as const, signal: 78 }
  ];

  // Stats counters calculated dynamically
  const activeFiresCount = mockFireEvents.length;
  const nationalAvgAqi = Math.round(statesData.reduce((sum, s) => sum + s.aqi, 0) / Math.max(statesData.length, 1));
  const highestAqiState = statesData.reduce((max, s) => s.aqi > max.aqi ? s : max, statesData[0] || initialStatesData[0]);

  return (
    <div className="w-full h-screen bg-[#040d1a] text-slate-100 flex overflow-hidden font-sans select-none antialiased">
      
      {/* 1. Left Navigation Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={(page) => {
          setCurrentPage(page);
          // Auto close detail panel if switching pages to maintain neatness
          setSelectedState(null);
          // Auto close sidebar after navigation on mobile viewports
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Workspace Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* 2. Top Navigation Bar */}
        <Navbar 
          onSearch={(query) => {
            if (!query.trim()) {
              setStatesData(initialStatesData);
              return;
            }
            const filtered = initialStatesData.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
            setStatesData(filtered);
          }}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedSatellite={selectedSatellite}
          setSelectedSatellite={setSelectedSatellite}
          alerts={alerts}
          onDismissAlert={(id) => {
            setAlerts(prev => prev.filter(a => a.id !== id));
          }}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />

        {/* 3. Conditional Page Render Engine */}
        <div className="flex-1 flex overflow-hidden relative bg-[#030914]">
          
          {currentPage === Page.Dashboard && (
            <div className="flex-1 flex overflow-hidden relative">
              <div className="flex-1 relative h-full overflow-hidden">
                <MapContainer 
                  statesData={statesData}
                  fireEvents={mockFireEvents}
                  selectedState={selectedState}
                  onSelectState={(state) => setSelectedState(state)}
                  activeLayer="AQI"
                  selectedSatellite={selectedSatellite}
                />
              </div>
              <DashboardOverview 
                onSelectCity={(cityName) => {
                  // find corresponding state data and select it
                  const stateFound = statesData.find(s => cityName.toLowerCase().includes(s.name.toLowerCase()));
                  if (stateFound) {
                    setSelectedState(stateFound);
                  }
                }}
              />
            </div>
          )}

          {currentPage === Page.IndiaMap && (
            <div className="flex-1 relative w-full h-full overflow-hidden">
              <MapContainer 
                statesData={statesData}
                fireEvents={mockFireEvents}
                selectedState={selectedState}
                onSelectState={(state) => setSelectedState(state)}
                activeLayer="AQI"
                selectedSatellite={selectedSatellite}
              />
            </div>
          )}

          {currentPage === Page.HchoHotspots && (
            <HotspotsPanel statesData={statesData} fireEvents={mockFireEvents} />
          )}

          {currentPage === Page.FireDetection && (
            <FireDetectionPanel fireEvents={mockFireEvents} />
          )}

          {currentPage === Page.Forecast && (
            <ForecastPanel />
          )}

          {currentPage === Page.Analytics && (
            <AnalyticsPanel />
          )}

          {currentPage === Page.SatelliteLayers && (
            <SatelliteExplorerPanel />
          )}

          {currentPage === Page.Reports && (
            <ReportsPanel />
          )}

          {currentPage === Page.Alerts && (
            <div className="flex-1 overflow-y-auto p-6 bg-[#030914] space-y-6">
              {/* Header */}
              <div className="flex flex-col gap-1 border-b border-slate-800/60 pb-4">
                <h1 className="text-xl font-bold font-sans text-white flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-orange-500 animate-pulse" />
                  National Air Quality & Thermal Hazard Alerts
                </h1>
                <p className="text-xs text-slate-400">
                  Real-time ISRO NRSC telemetry and multi-spectral satellite hazard notifications.
                </p>
              </div>

              {/* Alerts List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts.map((alert) => {
                  const levelColors = {
                    CRITICAL: "border-red-500/30 bg-red-950/20 text-red-200",
                    WARNING: "border-amber-500/30 bg-amber-950/20 text-amber-200",
                    INFO: "border-sky-500/30 bg-sky-950/20 text-sky-200",
                  };
                  return (
                    <div 
                      key={alert.id}
                      className={`p-5 border rounded-xl flex flex-col gap-3.5 transition-all hover:bg-slate-900/20 ${levelColors[alert.level] || "border-slate-800 bg-slate-950/40 text-slate-200"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-black/40 px-2.5 py-1 rounded-md">
                          {alert.level}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{alert.time}</span>
                      </div>
                      <p className="text-xs leading-relaxed font-sans font-medium">{alert.message}</p>
                      <button 
                        onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                        className="self-start text-[11px] font-bold text-sky-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Acknowledge & Clear
                      </button>
                    </div>
                  );
                })}
                {alerts.length === 0 && (
                  <div className="col-span-full text-center p-12 border border-dashed border-slate-800 rounded-2xl text-slate-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No active atmospheric alerts detected at this time.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentPage === Page.Settings && (
            <SettingsPanel />
          )}

          {/* Detailed State Inspector Slide-Out Panel overlay */}
          {selectedState && (
            <StateDetailsPanel 
              state={selectedState} 
              onClose={() => setSelectedState(null)} 
            />
          )}

        </div>

      </div>

      {/* 4. Floating Intelligent Chat Assistant */}
      <AiAssistant />

    </div>
  );
}
