import React, { useState } from "react";
import { Page, StateData, FireEvent, AlertItem } from "./types";
import { initialStatesData, mockFireEvents, initialAlerts } from "./data";

// Component imports
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import MapContainer from "./components/MapContainer";
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
  Compass
} from "lucide-react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
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
        }} 
        satelliteStatus={satelliteStatus}
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
        />

        {/* 3. Conditional Page Render Engine */}
        <div className="flex-1 flex overflow-hidden relative bg-[#030914]">
          
          {(currentPage === Page.Dashboard || currentPage === Page.IndiaMap) && (
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
