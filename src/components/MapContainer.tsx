import React, { useState, useEffect, useRef } from "react";
import { StateData, FireEvent, PollutantType } from "../types";
import { mapStateAnchors } from "../data";
import { 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Wind, 
  Flame, 
  Layers, 
  Sun, 
  Moon, 
  Compass,
  TrendingUp,
  MapPin,
  Gauge,
  Activity,
  Sliders,
  CloudRain,
  Thermometer,
  Droplets,
  Zap,
  Maximize2,
  Minimize2,
  Database,
  Radio,
  CheckCircle2,
  Ruler,
  Navigation
} from "lucide-react";

interface MapContainerProps {
  statesData: StateData[];
  fireEvents: FireEvent[];
  selectedState: StateData | null;
  onSelectState: (state: StateData) => void;
  activeLayer: string;
  selectedSatellite: string;
}

export default function MapContainer({
  statesData,
  fireEvents,
  selectedState,
  onSelectState,
  activeLayer: initialActiveLayer,
  selectedSatellite
}: MapContainerProps) {
  // Coordinate & layer controls
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDrag, setIsDrag] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Custom interactive features
  const [dayMode, setDayMode] = useState(false); // true: Satellite RGB, false: Dark IR Cyber Mode (default)
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [activeLayer, setActiveLayer] = useState<string>(initialActiveLayer || "AQI");
  const [is3D, setIs3D] = useState(false); // 3D Perspective Tilt Toggle
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false); // Geodesic Measurement tool
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number; name?: string }[]>([]);
  const [mouseCoords, setMouseCoords] = useState({ lat: 21.1458, lon: 79.0882 }); // Nagpur default center
  const [showBoundaries, setShowBoundaries] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.3, 4));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.3, 0.75));
  const handleReset = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIs3D(false);
    setIsMeasuring(false);
    setMeasurePoints([]);
  };

  // Center mapping coordinates for auto-pan
  const stateCenters: Record<string, { x: number; y: number }> = {
    "DL": { x: 178, y: 174 },
    "JK": { x: 130, y: 68 },
    "LA": { x: 180, y: 55 },
    "HP": { x: 155, y: 98 },
    "UK": { x: 190, y: 130 },
    "PB": { x: 125, y: 120 },
    "HR": { x: 145, y: 150 },
    "RJ": { x: 110, y: 220 },
    "GJ": { x: 75, y: 290 },
    "MH": { x: 170, y: 360 },
    "KA": { x: 160, y: 460 },
    "TN": { x: 190, y: 520 },
    "KL": { x: 155, y: 520 },
    "TS": { x: 210, y: 410 },
    "AP": { x: 230, y: 450 },
    "MP": { x: 180, y: 280 },
    "UP": { x: 230, y: 200 },
    "BR": { x: 320, y: 220 },
    "JH": { x: 310, y: 270 },
    "WB": { x: 340, y: 300 },
    "OR": { x: 290, y: 330 },
    "CG": { x: 240, y: 310 },
    "SK": { x: 350, y: 200 },
    "AS": { x: 400, y: 220 },
    "ML": { x: 380, y: 240 },
    "NL": { x: 440, y: 210 },
    "MN": { x: 440, y: 240 },
    "TR": { x: 390, y: 270 },
    "MZ": { x: 420, y: 280 },
    "AR": { x: 430, y: 180 },
    "GA": { x: 120, y: 440 },
    "AN": { x: 395, y: 500 },
    "LD": { x: 88, y: 520 }
  };

  // Center map on selected state
  useEffect(() => {
    if (selectedState && stateCenters[selectedState.id]) {
      const center = stateCenters[selectedState.id];
      setPanOffset({
        x: 250 - center.x * 1.6,
        y: 290 - center.y * 1.6
      });
      setZoomScale(1.6);
    }
  }, [selectedState]);

  // Synchronize initial prop
  useEffect(() => {
    if (initialActiveLayer) {
      setActiveLayer(initialActiveLayer);
    }
  }, [initialActiveLayer]);

  // Mouse drag panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking a button or panel, don't drag
    if ((e.target as HTMLElement).closest(".pointer-events-auto")) return;
    
    setIsDrag(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Coordinate tracking calculation
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left - panOffset.x) / zoomScale;
      const relativeY = (e.clientY - rect.top - panOffset.y) / zoomScale;
      
      // Map SVG coords (0-500, 0-580) to India WGS-84 bounding box (Lon: 68-98E, Lat: 8-38N)
      const lon = Math.min(Math.max(68.7 + (relativeX / 500) * (97.2 - 68.7), 65), 100);
      const lat = Math.min(Math.max(37.6 - (relativeY / 580) * (37.6 - 8.4), 5), 40);
      setMouseCoords({ lat, lon });
    }

    if (!isDrag) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDrag(false);

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.05;
    setZoomScale(prev => {
      const next = prev - e.deltaY * zoomIntensity * 0.01;
      return Math.min(Math.max(next, 0.75), 4);
    });
  };

  // Double click to place measurement point or zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isMeasuring && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left - panOffset.x) / zoomScale;
      const relativeY = (e.clientY - rect.top - panOffset.y) / zoomScale;
      
      if (relativeX >= 0 && relativeX <= 500 && relativeY >= 0 && relativeY <= 580) {
        // Find nearest city or label
        let pointName = `Point ${measurePoints.length + 1}`;
        let minDist = 9999;
        
        mapCities.forEach(city => {
          const d = Math.hypot(city.x - relativeX, city.y - relativeY);
          if (d < minDist && d < 20) {
            minDist = d;
            pointName = city.name;
          }
        });

        if (measurePoints.length >= 2) {
          setMeasurePoints([{ x: relativeX, y: relativeY, name: pointName }]);
        } else {
          setMeasurePoints(prev => [...prev, { x: relativeX, y: relativeY, name: pointName }]);
        }
      }
    } else {
      // Standard zoom in
      setZoomScale(prev => Math.min(prev + 0.5, 4));
    }
  };

  // Fullscreen toggler
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Geodesic distance calculation between 2 SVG points
  const calculateDistance = () => {
    if (measurePoints.length < 2) return 0;
    const p1 = measurePoints[0];
    const p2 = measurePoints[1];
    
    // Convert SVG pixels to degrees
    const lon1 = 68.7 + (p1.x / 500) * (97.2 - 68.7);
    const lat1 = 37.6 - (p1.y / 580) * (37.6 - 8.4);
    const lon2 = 68.7 + (p2.x / 500) * (97.2 - 68.7);
    const lat2 = 37.6 - (p2.y / 580) * (37.6 - 8.4);

    // Haversine formula
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Indian State boundary polylines (from high detail references)
  const statePolygons = [
    { id: "LA", name: "Ladakh", points: "155,20 185,25 200,45 208,65 192,85 170,80 152,58" },
    { id: "JK", name: "Jammu & Kashmir", points: "110,48 135,32 155,20 152,58 170,80 152,98 128,95 108,78" },
    { id: "HP", name: "Himachal Pradesh", points: "128,95 152,98 170,80 178,88 185,110 165,115 150,110" },
    { id: "UK", name: "Uttarakhand", points: "165,115 185,110 205,122 215,142 195,152 178,142 172,125" },
    { id: "PB", name: "Punjab", points: "102,108 128,95 150,110 148,135 125,145 105,138" },
    { id: "HR", name: "Haryana", points: "125,145 148,135 150,110 165,115 172,125 178,142 182,158 185,188 165,192 145,188 132,175" },
    { id: "DL", name: "Delhi", points: "175,170 182,170 182,178 175,178" },
    { id: "RJ", name: "Rajasthan", points: "35,195 102,148 102,108 105,138 125,145 132,175 145,188 165,192 152,218 168,235 145,268 112,278 45,255" },
    { id: "GJ", name: "Gujarat", points: "10,268 45,255 112,278 115,302 98,335 72,345 65,322 50,320 52,300 15,290" },
    { id: "UP", name: "Uttar Pradesh", points: "178,142 195,152 215,142 245,155 272,172 312,215 305,238 275,252 248,245 222,232 188,232 165,192 185,188" },
    { id: "BR", name: "Bihar", points: "312,215 365,222 375,255 350,265 328,260 305,238" },
    { id: "JH", name: "Jharkhand", points: "305,238 328,260 350,265 362,285 355,302 335,310 288,300 275,252" },
    { id: "WB", name: "West Bengal", points: "350,265 362,285 355,302 368,295 368,328 335,335 335,310" },
    { id: "OR", name: "Odisha", points: "275,252 288,300 335,310 335,335 295,372 262,352 245,315" },
    { id: "CG", name: "Chhattisgarh", points: "222,232 248,245 275,252 245,315 262,352 248,375 228,372 215,350 215,310" },
    { id: "MP", name: "Madhya Pradesh", points: "112,278 145,268 168,235 152,218 165,192 188,232 222,232 215,310 215,350 178,350 155,322 115,302" },
    { id: "MH", name: "Maharashtra", points: "98,335 115,302 155,322 178,350 215,350 228,372 212,410 185,412 145,410 120,388 125,350" },
    { id: "TS", name: "Telangana", points: "215,350 228,372 248,375 225,432 185,438 185,412 212,410" },
    { id: "AP", name: "Andhra Pradesh", points: "185,438 225,432 248,375 262,352 245,315 262,352 295,372 248,460 205,515 178,515 170,475 185,472" },
    { id: "KA", name: "Karnataka", points: "120,388 145,410 185,412 185,438 185,472 170,475 175,510 142,510 125,455 121,448" },
    { id: "GO", name: "Goa", points: "121,444 125,444 125,448 121,448" },
    { id: "KL", name: "Kerala", points: "142,510 152,510 158,550 145,550 135,528" },
    { id: "TN", name: "Tamil Nadu", points: "175,510 205,515 182,558 158,550 152,510" },
    { id: "SK", name: "Sikkim", points: "342,192 355,192 355,200 342,200" },
    { id: "AR", name: "Arunachal Pradesh", points: "395,200 435,188 448,208 418,218 395,215" },
    { id: "AS", name: "Assam", points: "372,212 395,215 418,218 410,232 395,232 372,235" },
    { id: "ML", name: "Meghalaya", points: "372,235 395,232 395,242 372,242" },
    { id: "NL", name: "Nagaland", points: "428,215 445,215 440,228 428,228" },
    { id: "MN", name: "Manipur", points: "428,228 440,228 435,248 425,248" },
    { id: "TR", name: "Tripura", points: "385,258 395,258 395,272 385,272" },
    { id: "MZ", name: "Mizoram", points: "418,248 425,248 420,280 412,280" },
    { id: "LD", name: "Lakshadweep", points: "85,520 90,520 90,525 85,525" },
    { id: "AN", name: "Andaman & Nicobar", points: "395,490 400,490 400,515 395,515" }
  ];

  // Neighbor countries configurations
  const neighborCountries = [
    { name: "PAKISTAN", points: "5,120 50,110 90,115 102,148 35,195 45,255 10,268 0,268" },
    { name: "CHINA", points: "185,25 250,50 345,110 345,195 312,215 272,172 245,155 215,142 205,122 185,110 178,88" },
    { name: "NEPAL", points: "215,142 245,155 272,172 312,215 305,200 245,145" },
    { name: "BHUTAN", points: "355,200 372,200 372,212 355,212" },
    { name: "BANGLADESH", points: "328,260 350,265 368,248 368,295 355,302" },
    { name: "MYANMAR", points: "435,225 450,225 450,300 428,272" },
    { name: "SRI LANKA", points: "178,575 185,575 188,590 175,590" }
  ];

  // Dynamic Cities on the map
  const mapCities = [
    { name: "New Delhi", id: "DL", x: 178, y: 174, isCapital: true },
    { name: "Srinagar", id: "JK", x: 130, y: 68, isCapital: false },
    { name: "Leh", id: "LA", x: 180, y: 55, isCapital: false },
    { name: "Jaipur", id: "RJ", x: 95, y: 210, isCapital: false },
    { name: "Mumbai", id: "MH", x: 155, y: 355, isCapital: false },
    { name: "Bengaluru", id: "KA", x: 145, y: 465, isCapital: false },
    { name: "Chennai", id: "TN", x: 178, y: 515, isCapital: false },
    { name: "Kolkata", id: "WB", x: 345, y: 315, isCapital: false },
    { name: "Patna", id: "BR", x: 325, y: 228, isCapital: false },
    { name: "Bhopal", id: "MP", x: 170, y: 275, isCapital: false },
    { name: "Guwahati", id: "AS", x: 395, y: 232, isCapital: false },
    { name: "Ahmedabad", id: "GJ", x: 65, y: 285, isCapital: false },
    { name: "Lucknow", id: "UP", x: 232, y: 202, isCapital: false },
    { name: "Bhubaneswar", id: "OR", x: 298, y: 340, isCapital: false }
  ];

  // Wind Flow Vector Fields
  const windVectors = [
    { x1: 50, y1: 150, x2: 120, y2: 180 },
    { x1: 60, y1: 220, x2: 140, y2: 240 },
    { x1: 80, y1: 340, x2: 170, y2: 360 },
    { x1: 110, y1: 440, x2: 190, y2: 450 },
    { x1: 200, y1: 220, x2: 280, y2: 240 },
    { x1: 190, y1: 300, x2: 270, y2: 320 },
    { x1: 320, y1: 180, x2: 380, y2: 200 },
    { x1: 360, y1: 240, x2: 420, y2: 250 }
  ];

  // Top 5 Polluted Cities ranking
  const topPollutedCities = [
    { rank: 1, name: "Bhiwadi, Rajasthan", score: 423, status: "Severe" },
    { rank: 2, name: "Delhi, Delhi", score: 401, status: "Severe" },
    { rank: 3, name: "Ghaziabad, UP", score: 371, status: "Very Poor" },
    { rank: 4, name: "Noida, UP", score: 353, status: "Very Poor" },
    { rank: 5, name: "Patna, Bihar", score: 332, status: "Very Poor" }
  ];

  // Platform analytics calculations
  const nationalAvgAqi = Math.round(statesData.reduce((sum, s) => sum + s.aqi, 0) / Math.max(statesData.length, 1));
  const maxAqiVal = Math.max(...statesData.map(s => s.aqi));
  const activeFiresCount = fireEvents.length + 1214; // Combined ground sensors
  const hchoAvg = (statesData.reduce((sum, s) => sum + s.hcho, 0) / statesData.length).toFixed(2);
  const pm25Avg = Math.round(statesData.reduce((sum, s) => sum + s.pm25, 0) / statesData.length);

  return (
    <div 
      ref={containerRef}
      id="gis-map-container" 
      className="relative w-full h-full bg-[#040D1A] overflow-hidden flex select-none"
      onWheel={handleWheel}
    >
      {/* 1. Main Map Canvas area (taking 100% full bleed of the workspace) */}
      <div
        id="gis-canvas"
        className={`w-full h-full relative cursor-grab active:cursor-grabbing transition-colors duration-1000 overflow-hidden flex items-center justify-center ${
          dayMode 
            ? "bg-[#0b1c34]" 
            : "bg-[#030a14]"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:35px_35px] pointer-events-none" />

        {/* Dynamic Scan Line effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-blue/3 to-transparent w-full h-1/2 animate-pulse pointer-events-none" style={{ animationDuration: "8s" }} />

        {/* Orbit track simulation line */}
        <div className="absolute w-[700px] h-[700px] rounded-full border border-dashed border-sky-blue/5 pointer-events-none animate-spin" style={{ animationDuration: "160s" }} />

        {/* 3D Map Transform wrapper */}
        <div
          id="india-gis-root"
          className="relative transition-all duration-300 ease-out origin-center"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale}) ${
              is3D ? "perspective(800px) rotateX(32deg) rotateY(-4deg) rotateZ(3deg)" : ""
            }`,
            width: "500px",
            height: "580px"
          }}
        >
          {/* Base SVG Map */}
          <svg
            viewBox="0 0 500 580"
            className="w-full h-full drop-shadow-[0_16px_32px_rgba(0,0,0,0.9)]"
          >
            <defs>
              {/* Heatmap Plume Gradients (Vibrant atmospheric blending) */}
              <radialGradient id="delhiPlume" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E11D48" stopOpacity="0.85" />
                <stop offset="25%" stopColor="#BE123C" stopOpacity="0.75" />
                <stop offset="55%" stopColor="#EA580C" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="stubblePlume" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#9333EA" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#E11D48" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#EA580C" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="mumbaiPlume" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EA580C" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#EAB308" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="cleanPlume" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#059669" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="industrialSo2Plume" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EAB308" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#CA8A04" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>

              {/* Atmospheric aerosol clouds gradient */}
              <radialGradient id="cloudGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                <stop offset="40%" stopColor="rgba(240,248,255,0.4)" />
                <stop offset="100%" stopColor="rgba(240,248,255,0)" />
              </radialGradient>
            </defs>

            {/* A. HIGH-RESOLUTION NASA SATELLITE BASEMAP */}
            <image
              href="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Satellite_image_of_India_in_May_2004.jpg/1024px-Satellite_image_of_India_in_May_2004.jpg"
              x="-60"
              y="-42"
              width="620"
              height="650"
              preserveAspectRatio="none"
              opacity="0.9"
              style={{
                filter: dayMode 
                  ? "none" 
                  : "brightness(0.48) contrast(1.15) saturate(0.9) hue-rotate(185deg) sepia(0.08)"
              }}
            />

            {/* B. GIS Marginal Grid Lines (Latitude/Longitude Coordinates) */}
            <g id="lat-long-grids" opacity="0.18">
              {/* Latitudes */}
              <line x1="15" y1="105" x2="485" y2="105" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />
              <line x1="15" y1="180" x2="485" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />
              <line x1="15" y1="255" x2="485" y2="255" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />
              <line x1="15" y1="330" x2="485" y2="330" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />
              <line x1="15" y1="405" x2="485" y2="405" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />
              <line x1="15" y1="480" x2="485" y2="480" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />
              <line x1="15" y1="555" x2="485" y2="555" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />

              {/* Longitudes */}
              <line x1="80" y1="15" x2="80" y2="565" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />
              <line x1="140" y1="15" x2="140" y2="565" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />
              <line x1="200" y1="15" x2="200" y2="565" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />
              <line x1="260" y1="15" x2="260" y2="565" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />
              <line x1="320" y1="15" x2="320" y2="565" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />
              <line x1="380" y1="15" x2="380" y2="565" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="2,2" />
            </g>

            {/* Coordinates marginal text */}
            <g id="marginal-labels" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="JetBrains Mono" pointerEvents="none">
              <text x="8" y="107" textAnchor="start">35°N</text>
              <text x="8" y="182" textAnchor="start">30°N</text>
              <text x="8" y="257" textAnchor="start">25°N</text>
              <text x="8" y="332" textAnchor="start">20°N</text>
              <text x="8" y="407" textAnchor="start">15°N</text>
              <text x="8" y="482" textAnchor="start">10°N</text>
              <text x="8" y="557" textAnchor="start">5°N</text>

              <text x="80" y="575" textAnchor="middle">70°E</text>
              <text x="140" y="575" textAnchor="middle">75°E</text>
              <text x="200" y="575" textAnchor="middle">80°E</text>
              <text x="260" y="575" textAnchor="middle">85°E</text>
              <text x="320" y="575" textAnchor="middle">90°E</text>
              <text x="380" y="575" textAnchor="middle">95°E</text>
            </g>

            {/* C. DYNAMIC ATMOSPHERIC HEATMAP OVERLAY (Smooth concentrations blending) */}
            <g id="atmospheric-heatmap-plumes" opacity="0.60" className="pointer-events-none mix-blend-screen">
              {/* Render dynamic spatial heatmaps depending on the selected layer */}
              {(activeLayer === "AQI" || activeLayer === "PM2.5") && (
                <>
                  {/* Punjab/Haryana Stubble Burn Cell Hotspot */}
                  <circle cx="125" cy="120" r="55" fill="url(#stubblePlume)" className="animate-pulse" style={{ animationDuration: "5s" }} />
                  {/* Delhi NCR Core Hyper-cell */}
                  <circle cx="178" cy="174" r="45" fill="url(#delhiPlume)" className="animate-pulse" style={{ animationDuration: "3.5s" }} />
                  {/* Indo-Gangetic Plains continuous plume (UP/Bihar) */}
                  <ellipse cx="260" cy="205" rx="90" ry="32" transform="rotate(-12 260 205)" fill="url(#delhiPlume)" />
                  <circle cx="320" cy="220" r="38" fill="url(#delhiPlume)" />
                  {/* Mumbai / Ahmedabad Moderate hot zones */}
                  <circle cx="155" cy="355" r="42" fill="url(#mumbaiPlume)" />
                  <circle cx="65" cy="285" r="35" fill="url(#mumbaiPlume)" />
                  {/* Southern pristine air masses */}
                  <circle cx="160" cy="460" r="80" fill="url(#cleanPlume)" />
                  <circle cx="190" cy="520" r="90" fill="url(#cleanPlume)" />
                  {/* North East clean air masses */}
                  <ellipse cx="400" cy="220" rx="75" ry="40" fill="url(#cleanPlume)" />
                </>
              )}

              {activeLayer === "NO₂" && (
                <>
                  {/* Dense urban emission nodes */}
                  <circle cx="178" cy="174" r="30" fill="url(#delhiPlume)" />
                  <circle cx="155" cy="355" r="28" fill="url(#delhiPlume)" />
                  <circle cx="345" cy="315" r="25" fill="url(#delhiPlume)" />
                  <circle cx="145" cy="465" r="22" fill="url(#mumbaiPlume)" />
                  <circle cx="178" cy="515" r="20" fill="url(#mumbaiPlume)" />
                  {/* Moderate corridors */}
                  <circle cx="232" cy="202" r="20" fill="url(#mumbaiPlume)" />
                  <circle cx="95" cy="210" r="18" fill="url(#mumbaiPlume)" />
                </>
              )}

              {activeLayer === "SO₂" && (
                <>
                  {/* Power plants & Refinery Hotspots (Singrauli, Dhanbad, Mundra) */}
                  <circle cx="310" cy="270" r="35" fill="url(#delhiPlume)" /> {/* Dhanbad, Coal Hub */}
                  <circle cx="180" cy="280" r="28" fill="url(#industrialSo2Plume)" /> {/* MP Industrial */}
                  <circle cx="75" cy="290" r="32" fill="url(#industrialSo2Plume)" /> {/* Jamnagar, Refinery */}
                  <circle cx="155" cy="355" r="22" fill="url(#industrialSo2Plume)" />
                  <circle cx="178" cy="515" r="24" fill="url(#delhiPlume)" /> {/* Neyveli */}
                </>
              )}

              {activeLayer === "CO" && (
                <>
                  {/* Vehicular congestion plumes */}
                  <circle cx="178" cy="174" r="42" fill="url(#delhiPlume)" />
                  <circle cx="155" cy="355" r="38" fill="url(#delhiPlume)" />
                  <ellipse cx="260" cy="205" rx="60" ry="20" transform="rotate(-12 260 205)" fill="url(#mumbaiPlume)" />
                  <circle cx="145" cy="465" r="28" fill="url(#mumbaiPlume)" />
                </>
              )}

              {activeLayer === "O₃" && (
                <>
                  {/* Photochemical deserts/plains high solar load */}
                  <ellipse cx="110" cy="220" rx="75" ry="40" fill="url(#industrialSo2Plume)" /> {/* Rajasthan */}
                  <circle cx="180" cy="280" r="60" fill="url(#mumbaiPlume)" /> {/* Central Plains */}
                  <circle cx="178" cy="174" r="30" fill="url(#delhiPlume)" />
                </>
              )}

              {activeLayer === "HCHO" && (
                <>
                  {/* Formaldehyde: high over bio-canopies & stubble smoke */}
                  <circle cx="125" cy="120" r="50" fill="url(#stubblePlume)" /> {/* Punjab stubble */}
                  <ellipse cx="400" cy="220" rx="80" ry="38" fill="url(#delhiPlume)" /> {/* North East forests */}
                  <ellipse cx="160" cy="460" rx="35" ry="70" transform="rotate(-5 160 460)" fill="url(#delhiPlume)" /> {/* Western Ghats */}
                  <circle cx="180" cy="280" r="45" fill="url(#mumbaiPlume)" /> {/* Central MP forest belt */}
                </>
              )}

              {activeLayer === "Fires" && (
                <>
                  {/* Thermal infrared heat clusters */}
                  <circle cx="125" cy="120" r="35" fill="url(#delhiPlume)" className="animate-pulse" />
                  <circle cx="145" cy="150" r="20" fill="url(#delhiPlume)" />
                  <circle cx="180" cy="280" r="22" fill="url(#mumbaiPlume)" />
                </>
              )}

              {activeLayer === "Rain" && (
                <>
                  {/* Heavy precipitation plumes */}
                  <ellipse cx="155" cy="520" rx="30" ry="75" transform="rotate(-5 155 520)" fill="url(#cleanPlume)" /> {/* Western Ghats */}
                  <ellipse cx="400" cy="220" rx="60" ry="30" fill="url(#cleanPlume)" /> {/* Cherrapunji/NE */}
                </>
              )}

              {activeLayer === "Temp" && (
                <>
                  {/* Thermal mapping infrared overlay */}
                  <ellipse cx="110" cy="220" rx="85" ry="45" fill="url(#delhiPlume)" /> {/* Thar Desert heatdome */}
                  <circle cx="180" cy="280" r="90" fill="url(#mumbaiPlume)" />
                  {/* Himalayan cold cover */}
                  <ellipse cx="180" cy="55" rx="90" ry="25" fill="url(#cleanPlume)" />
                </>
              )}

              {activeLayer === "Humidity" && (
                <>
                  {/* Marine coastal high humidity cells */}
                  <ellipse cx="155" cy="520" rx="40" ry="120" fill="url(#cleanPlume)" />
                  <circle cx="178" cy="515" r="50" fill="url(#cleanPlume)" />
                  <circle cx="345" cy="315" r="48" fill="url(#cleanPlume)" />
                </>
              )}
            </g>

            {/* D. GEOPOLITICAL STATE BOUNDARIES (Thin elegant lines overlaid) */}
            {showBoundaries && (
              <g id="states-group">
                {statePolygons.map((poly) => {
                  const stateMeta = statesData.find(s => s.id === poly.id);
                  const isSelected = selectedState?.id === poly.id;
                  const isHovered = hoveredState?.id === poly.id;
                  
                  return (
                    <polygon
                      key={poly.id}
                      id={`state-boundary-${poly.id}`}
                      points={poly.points}
                      className="transition-all duration-300 cursor-pointer hover:brightness-110"
                      fill={isSelected ? "rgba(41, 182, 246, 0.14)" : isHovered ? "rgba(255, 255, 255, 0.08)" : "rgba(0,0,0,0)"}
                      stroke={isSelected ? "#FF6B00" : isHovered ? "#29B6F6" : "rgba(255,255,255,0.4)"}
                      strokeWidth={isSelected ? 1.6 : isHovered ? 1.0 : 0.4}
                      filter={isSelected ? "drop-shadow(0 0 4px rgba(255,107,0,0.6))" : ""}
                      onMouseEnter={() => {
                        if (stateMeta) setHoveredState(stateMeta);
                      }}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => {
                        if (stateMeta) onSelectState(stateMeta);
                      }}
                    />
                  );
                })}
              </g>
            )}

            {/* E. SUB-CONTINENTAL NEIGHBOURING COUNTRIES (Background Framing) */}
            <g id="neighbouring-countries">
              {neighborCountries.map((country, idx) => (
                <g key={idx}>
                  <polygon
                    points={country.points}
                    fill="rgba(0, 0, 0, 0.18)"
                    stroke="rgba(255, 255, 255, 0.18)"
                    strokeWidth="0.5"
                    strokeDasharray="2,3"
                    className="pointer-events-none"
                  />
                  {/* Clean cartographic label in country center */}
                  <text
                    x={country.name === "CHINA" ? 310 : country.name === "PAKISTAN" ? 40 : country.name === "MYANMAR" ? 445 : country.name === "NEPAL" ? 260 : country.name === "BANGLADESH" ? 340 : country.name === "BHUTAN" ? 363 : 182}
                    y={country.name === "CHINA" ? 85 : country.name === "PAKISTAN" ? 170 : country.name === "MYANMAR" ? 260 : country.name === "NEPAL" ? 172 : country.name === "BANGLADESH" ? 275 : country.name === "BHUTAN" ? 208 : 585}
                    fontSize="6"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    fill="rgba(255,255,255,0.25)"
                    textAnchor="middle"
                    pointerEvents="none"
                    letterSpacing="1.2"
                  >
                    {country.name}
                  </text>
                </g>
              ))}
            </g>

            {/* F. ATMOSPHERIC DRIFTING CLOUDS LAYER */}
            <g id="cloud-layer" opacity="0.18" className="pointer-events-none">
              <ellipse cx="120" cy="140" rx="80" ry="30" fill="url(#cloudGrad)" className="animate-pulse" style={{ animationDuration: "14s" }} />
              <ellipse cx="380" cy="380" rx="110" ry="45" fill="url(#cloudGrad)" className="animate-pulse" style={{ animationDuration: "19s" }} />
              <ellipse cx="280" cy="110" rx="60" ry="22" fill="url(#cloudGrad)" className="animate-pulse" style={{ animationDuration: "11s" }} />
            </g>

            {/* G. WIND STREAM FLOW LAYER */}
            {(activeLayer === "Wind" || activeLayer === "HCHO" || activeLayer === "AQI") && (
              <g id="wind-vectors">
                {windVectors.map((w, index) => (
                  <g key={index}>
                    {/* Animated flow curve */}
                    <path
                      d={`M ${w.x1} ${w.y1} Q ${(w.x1 + w.x2)/2 + 10} ${(w.y1 + w.y2)/2 - 10} ${w.x2} ${w.y2}`}
                      className="wind-dash-flow"
                      fill="none"
                      stroke="#29B6F6"
                      strokeWidth="0.8"
                      opacity="0.45"
                    />
                    <circle cx={w.x2} cy={w.y2} r="1" fill="#29B6F6" opacity="0.8" />
                  </g>
                ))}
              </g>
            )}

            {/* H. THERMAL ANOMALIES (MODIS/VIIRS Active Fires) */}
            {(activeLayer === "Fires" || activeLayer === "AQI") && (
              <g id="thermal-fire-markers">
                {fireEvents.map((fire) => {
                  const pixelX = fire.lng * 12 - 760;
                  const pixelY = -fire.lat * 15 + 630;
                  
                  // Filter values out of viewport
                  if (pixelX < 10 || pixelX > 490 || pixelY < 10 || pixelY > 570) return null;
                  
                  return (
                    <g key={fire.id}>
                      <circle
                        cx={pixelX}
                        cy={pixelY}
                        r="6"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="0.5"
                        className="animate-pulse"
                        opacity="0.7"
                      />
                      <circle
                        cx={pixelX}
                        cy={pixelY}
                        r="1.8"
                        fill="#FF6B00"
                        className="animate-pulse-glow"
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* I. GIS CITY PIN OVERLAYS */}
            <g id="gis-city-pins">
              {mapCities.map((city, idx) => {
                const stateMeta = statesData.find(s => s.id === city.id);
                const isHovered = hoveredState?.id === city.id;
                
                return (
                  <g
                    key={idx}
                    transform={`translate(${city.x}, ${city.y})`}
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      if (stateMeta) setHoveredState(stateMeta);
                    }}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => {
                      if (stateMeta) onSelectState(stateMeta);
                    }}
                  >
                    {city.isCapital ? (
                      <g>
                        <circle cx="0" cy="0" r="5" fill="rgba(225, 29, 72, 0.25)" className="animate-ping" />
                        <polygon
                          points="0,-4 1.2,-1.2 4,-1.2 1.6,0.8 2.8,3.6 0,2 -2.8,3.6 -1.6,0.8 -4,-1.2 -1.2,-1.2"
                          fill="#E11D48"
                          stroke="#ffffff"
                          strokeWidth="0.5"
                        />
                      </g>
                    ) : (
                      <g>
                        <circle cx="0" cy="0" r="2" fill="#ffffff" stroke="#29B6F6" strokeWidth="0.6" />
                        <circle cx="0" cy="0" r="0.6" fill="#040D1A" />
                      </g>
                    )}

                    {/* Highly crisp labels */}
                    <text
                      x="4"
                      y="1.5"
                      fontSize="4.5"
                      fontFamily="Inter"
                      fontWeight="600"
                      fill={isHovered ? "#FF6B00" : "rgba(255,255,255,0.75)"}
                      textAnchor="start"
                      className="pointer-events-none drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.9)]"
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* J. GEODESIC DISTANCE MEASUREMENT DRAWING */}
            {isMeasuring && measurePoints.length > 0 && (
              <g id="distance-measure-render">
                {measurePoints.map((pt, idx) => (
                  <g key={idx} transform={`translate(${pt.x}, ${pt.y})`}>
                    <circle cx="0" cy="0" r="6" fill="rgba(41, 182, 246, 0.3)" stroke="#29B6F6" strokeWidth="1" className="animate-ping" />
                    <circle cx="0" cy="0" r="2.5" fill="#29B6F6" stroke="#ffffff" strokeWidth="0.8" />
                    <text x="5" y="-5" fontSize="5" fontFamily="JetBrains Mono" fill="#29B6F6" fontWeight="bold" className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                      {pt.name}
                    </text>
                  </g>
                ))}

                {measurePoints.length === 2 && (
                  <g>
                    <line
                      x1={measurePoints[0].x}
                      y1={measurePoints[0].y}
                      x2={measurePoints[1].x}
                      y2={measurePoints[1].y}
                      stroke="#29B6F6"
                      strokeWidth="1.2"
                      strokeDasharray="3,3"
                      className="animate-pulse"
                    />
                    <g transform={`translate(${(measurePoints[0].x + measurePoints[1].x)/2}, ${(measurePoints[0].y + measurePoints[1].y)/2 - 8})`}>
                      <rect
                        x="-30"
                        y="-7"
                        width="60"
                        height="13"
                        rx="3"
                        fill="#040D1A"
                        stroke="#29B6F6"
                        strokeWidth="0.8"
                      />
                      <text
                        fontSize="6"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                        fill="#ffffff"
                        textAnchor="middle"
                        y="1.5"
                      >
                        {calculateDistance()} km
                      </text>
                    </g>
                  </g>
                )}
              </g>
            )}

            {/* K. OCEAN LABELS */}
            <g id="ocean-labels" fill="rgba(255,255,255,0.22)" fontSize="7" fontWeight="bold" fontFamily="Inter" pointerEvents="none" letterSpacing="1.8">
              <text x="60" y="475" textAnchor="middle" transform="rotate(-10 60 475)" className="italic">Arabian Sea</text>
              <text x="340" y="475" textAnchor="middle" transform="rotate(10 340 475)" className="italic">Bay of Bengal</text>
              <text x="220" y="565" textAnchor="middle" className="italic text-[8px] tracking-[2.5px]">INDIAN OCEAN</text>
            </g>

            {/* L. GIS NEAT FRAME BORDER */}
            <rect x="2" y="2" width="496" height="576" rx="4" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" pointerEvents="none" />
          </svg>
        </div>
      </div>

      {/* 2. LEFT SIDE FLOATING ACTION CONTROLS */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2.5 pointer-events-auto">
        {/* Navigation / Compass widget */}
        <div className="bg-[#071B36]/90 border border-slate-800/80 rounded-xl p-2.5 flex flex-col items-center shadow-2xl backdrop-blur-md glow-orange">
          <div 
            className="w-10 h-10 rounded-full border border-slate-700/60 bg-[#040D1A] flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={handleReset}
            title="Recenter & Realign North"
            style={{ transform: `rotate(${-panOffset.x/8}deg)` }}
          >
            <Compass className="w-5.5 h-5.5 text-isro-orange" />
          </div>
          <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase tracking-widest font-bold">Compass</span>
        </div>

        {/* Map view modes control board */}
        <div className="bg-[#071B36]/90 border border-slate-800/80 rounded-xl p-1 flex flex-col items-center gap-1 shadow-2xl backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Zoom In (Wheel scroll up)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Zoom Out (Wheel scroll down)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Reset Map State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="w-6 h-[1px] bg-slate-800" />

          {/* 3D Perspective Toggle Button */}
          <button
            onClick={() => setIs3D(!is3D)}
            className={`p-2 rounded-lg cursor-pointer transition-all ${
              is3D 
                ? "bg-isro-orange/20 text-isro-orange glow-orange" 
                : "hover:bg-slate-800/60 text-slate-400 hover:text-white"
            }`}
            title="Toggle 3D Flight Tilt"
          >
            <Navigation className={`w-4 h-4 ${is3D ? "rotate-45" : ""}`} />
          </button>

          {/* Geodesic Measurement Tool */}
          <button
            onClick={() => {
              setIsMeasuring(!isMeasuring);
              setMeasurePoints([]);
            }}
            className={`p-2 rounded-lg cursor-pointer transition-all ${
              isMeasuring 
                ? "bg-sky-blue/20 text-sky-blue glow-blue" 
                : "hover:bg-slate-800/60 text-slate-400 hover:text-white"
            }`}
            title="Ruler / Geodesic Distance Tool"
          >
            <Ruler className="w-4 h-4" />
          </button>

          {/* Boundaries toggler */}
          <button
            onClick={() => setShowBoundaries(!showBoundaries)}
            className={`p-2 rounded-lg cursor-pointer transition-all ${
              showBoundaries 
                ? "text-sky-blue" 
                : "text-slate-500 hover:text-slate-300"
            }`}
            title="Toggle State Borders"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-slate-800/60 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* RGB vs Dark IR Mode selector */}
        <button
          onClick={() => setDayMode(!dayMode)}
          className="bg-[#071B36]/90 border border-slate-800 p-2.5 rounded-xl text-slate-300 hover:text-white shadow-2xl backdrop-blur-md cursor-pointer flex flex-col items-center gap-1 group glow-blue"
        >
          {dayMode ? <Sun className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" /> : <Moon className="w-5 h-5 text-sky-300 group-hover:scale-110 transition-transform" />}
          <span className="font-mono text-[8px] tracking-wider uppercase font-bold text-center mt-0.5">
            {dayMode ? "RGB Natural" : "IR CYBER"}
          </span>
        </button>

        {/* Distance measure banner */}
        {isMeasuring && (
          <div className="bg-[#040D1A]/95 border border-sky-blue/40 px-3 py-2 rounded-xl text-[10px] font-mono text-sky-blue flex flex-col gap-1 shadow-2xl backdrop-blur-md animate-pulse">
            <span className="font-bold flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> Distance Mode</span>
            <span>Double-click on 2 cities/points to measure true distance.</span>
            {measurePoints.length > 0 && (
              <span className="text-white mt-1">Anchored: {measurePoints.length}/2</span>
            )}
          </div>
        )}
      </div>

      {/* 3. RIGHT PANEL (Floating Dashboard cards over full-bleed map) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-4 w-[350px] max-h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden pr-1.5 cursor-default select-none pointer-events-auto text-left scrollbar-thin">
        
        {/* CARD 1: National Overview */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Radio className="w-24 h-24 text-sky-blue animate-pulse" />
          </div>

          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-sky-blue" />
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">National Overview</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-green bg-emerald-green/10 px-1.5 py-0.2 rounded border border-emerald-green/20">
              Synced
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-[#040d1a]/70 border border-slate-900 rounded-lg p-2 flex flex-col justify-between h-18">
              <span className="text-[8px] font-mono text-slate-400 uppercase leading-none">Avg AQI</span>
              <span className="text-xl font-display font-extrabold text-orange-400 mt-1">{nationalAvgAqi}</span>
              <span className="text-[7.5px] font-mono text-orange-400 bg-orange-500/10 px-1 py-0.2 rounded font-bold w-fit mt-0.5 leading-none">
                Poor
              </span>
            </div>

            <div className="bg-[#040d1a]/70 border border-slate-900 rounded-lg p-2 flex flex-col justify-between h-18">
              <span className="text-[8px] font-mono text-slate-400 uppercase leading-none">Max AQI</span>
              <span className="text-xl font-display font-extrabold text-rose-500 mt-1">{maxAqiVal}</span>
              <span className="text-[7.5px] font-mono text-rose-500 bg-rose-500/10 px-1 py-0.2 rounded font-bold w-fit mt-0.5 leading-none">
                Severe
              </span>
            </div>

            <div className="bg-[#040d1a]/70 border border-slate-900 rounded-lg p-2 flex flex-col justify-between h-18">
              <span className="text-[8px] font-mono text-slate-400 uppercase leading-none">Active Fires</span>
              <span className="text-xl font-display font-extrabold text-amber-500 mt-1 animate-pulse-glow">{activeFiresCount}</span>
              <span className="text-[7.5px] font-mono text-amber-500 bg-amber-500/10 px-1 py-0.2 rounded font-bold w-fit mt-0.5 leading-none">
                High
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#040d1a]/70 border border-slate-900 rounded-lg p-2 flex flex-col justify-between h-18">
              <span className="text-[8px] font-mono text-slate-400 uppercase leading-none">HCHO Avg</span>
              <span className="text-xs font-mono font-bold text-sky-blue mt-1.5">{hchoAvg}</span>
              <span className="text-[7.5px] font-mono text-slate-400 leading-none">
                ×10¹⁵ mol/cm²
              </span>
            </div>

            <div className="bg-[#040d1a]/70 border border-slate-900 rounded-lg p-2 flex flex-col justify-between h-18">
              <span className="text-[8px] font-mono text-slate-400 uppercase leading-none">PM2.5 Avg</span>
              <span className="text-sm font-mono font-bold text-slate-200 mt-1.5">{pm25Avg}</span>
              <span className="text-[7.5px] font-mono text-slate-400 leading-none">
                μg/m³
              </span>
            </div>

            <div className="bg-[#040d1a]/70 border border-slate-900 rounded-lg p-2 flex flex-col justify-between h-18">
              <span className="text-[8px] font-mono text-slate-400 uppercase leading-none">Sources</span>
              <span className="text-sm font-mono font-bold text-emerald-green mt-1.5">7 / 7</span>
              <span className="text-[7.5px] font-mono text-emerald-green leading-none">
                Online
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: AQI Trend (Animated Sparkline Chart) */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 shadow-2xl backdrop-blur-md text-left">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-isro-orange" />
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">AQI Trend (India)</span>
            </div>
            <span className="text-[8px] font-mono text-slate-400">7 Days</span>
          </div>

          <div className="h-28 relative flex items-end w-full">
            {/* Ambient Chart BG and Sparkline rendered inside responsive SVG */}
            <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />

              {/* Shaded Area */}
              <path
                d="M 10 90 L 10 70 Q 50 40 90 62 T 170 50 T 250 68 L 290 55 L 290 90 Z"
                fill="url(#chartGlow)"
              />

              {/* Sparkline curve */}
              <path
                d="M 10 70 Q 50 40 90 62 T 170 50 T 250 68 L 290 55"
                fill="none"
                stroke="#FF6B00"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-pulse"
                style={{ filter: "drop-shadow(0 2px 4px rgba(255,107,0,0.4))" }}
              />

              {/* Data Node Points */}
              <circle cx="10" cy="70" r="3" fill="#040D1A" stroke="#FF6B00" strokeWidth="1.5" />
              <circle cx="90" cy="62" r="3" fill="#040D1A" stroke="#FF6B00" strokeWidth="1.5" />
              <circle cx="170" cy="50" r="3" fill="#040D1A" stroke="#FF6B00" strokeWidth="1.5" />
              <circle cx="250" cy="68" r="3" fill="#040D1A" stroke="#FF6B00" strokeWidth="1.5" />
              <circle cx="290" cy="55" r="3.5" fill="#FF6B00" stroke="#ffffff" strokeWidth="1.5" />

              {/* Interactive labels */}
              <text x="10" y="99" fontSize="6.5" fill="rgba(255,255,255,0.4)" fontFamily="JetBrains Mono" textAnchor="middle">01 May</text>
              <text x="100" y="99" fontSize="6.5" fill="rgba(255,255,255,0.4)" fontFamily="JetBrains Mono" textAnchor="middle">03 May</text>
              <text x="200" y="99" fontSize="6.5" fill="rgba(255,255,255,0.4)" fontFamily="JetBrains Mono" textAnchor="middle">05 May</text>
              <text x="290" y="99" fontSize="6.5" fill="rgba(255,255,255,0.4)" fontFamily="JetBrains Mono" textAnchor="middle">07 May</text>

              {/* Live value bubble */}
              <text x="290" y="44" fontSize="7.5" fontWeight="bold" fill="#ffffff" fontFamily="JetBrains Mono" textAnchor="middle" className="drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.9)]">196</text>
            </svg>
          </div>
        </div>

        {/* CARD 3: Top Polluted Cities ranking */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 shadow-2xl backdrop-blur-md text-left">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-3">
            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Top 5 Polluted Cities</span>
            <span className="text-[8px] font-mono text-rose-400 font-bold uppercase animate-pulse">Alert High</span>
          </div>

          <div className="space-y-2">
            {topPollutedCities.map((city) => (
              <div 
                key={city.rank} 
                className="flex items-center justify-between p-2 rounded-lg bg-[#040D1A]/80 border border-slate-900 hover:border-isro-orange/50 transition-all cursor-pointer group"
                onClick={() => {
                  // Find corresponding state (Rajasthan or Delhi)
                  const matchingStateId = city.name.includes("Rajasthan") ? "RJ" : city.name.includes("Delhi") ? "DL" : "UP";
                  const s = statesData.find(x => x.id === matchingStateId);
                  if (s) onSelectState(s);
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded bg-[#071b36] border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-center group-hover:border-isro-orange transition-colors">
                    {city.rank}
                  </span>
                  <span className="text-xs font-sans font-semibold text-slate-200 group-hover:text-white transition-colors">{city.name}</span>
                </div>
                
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded text-white ${
                  city.score > 400 
                    ? "bg-rose-600/35 text-rose-300 border border-rose-500/30" 
                    : "bg-orange-600/35 text-orange-300 border border-orange-500/30"
                }`}>
                  {city.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 4: Satellite Status */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 shadow-2xl backdrop-blur-md text-left">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-blue" />
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">Satellite Status</span>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-green">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-green animate-pulse" /> Live Link
            </span>
          </div>

          <div className="space-y-1.5 text-[10px] font-mono">
            <div className="flex items-center justify-between py-1 border-b border-slate-900/60">
              <span className="text-slate-400">INSAT-3D</span>
              <span className="text-slate-300">AOD</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-green animate-pulse" />
                <span className="text-emerald-green font-bold">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-900/60">
              <span className="text-slate-400">Sentinel-5P</span>
              <span className="text-slate-300">Gases</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-green animate-pulse" />
                <span className="text-emerald-green font-bold">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-900/60">
              <span className="text-slate-400">MODIS</span>
              <span className="text-slate-300">Fire</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-green animate-pulse" />
                <span className="text-emerald-green font-bold">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-900/60">
              <span className="text-slate-400">VIIRS</span>
              <span className="text-slate-300">Fire</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-green animate-pulse" />
                <span className="text-emerald-green font-bold">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-900/60">
              <span className="text-slate-400">ERA5</span>
              <span className="text-slate-300">Weather</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-green animate-pulse" />
                <span className="text-emerald-green font-bold">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-900/60">
              <span className="text-slate-400">CPCB</span>
              <span className="text-slate-300">Stations</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-green animate-pulse" />
                <span className="text-emerald-green font-bold">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">GFS</span>
              <span className="text-slate-300">Forecast</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-green animate-pulse" />
                <span className="text-emerald-green font-bold">Online</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. FLOATING GLASS BOTTOM LAYER SWITCHER (Rounded glass buttons that glow when active) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-[90%] max-w-[720px] select-none">
        <div className="glass-panel p-2.5 rounded-2xl border border-slate-700/50 flex items-center justify-between gap-1.5 shadow-2xl backdrop-blur-xl">
          
          <button
            onClick={() => setActiveLayer("AQI")}
            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
              activeLayer === "AQI" 
                ? "bg-isro-orange/15 border border-isro-orange/45 text-white glow-orange" 
                : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Gauge className={`w-4 h-4 ${activeLayer === "AQI" ? "text-isro-orange" : "text-slate-400"}`} />
            <span className="text-[8.5px] font-mono mt-1 font-bold">AQI</span>
          </button>

          <button
            onClick={() => setActiveLayer("PM2.5")}
            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
              activeLayer === "PM2.5" 
                ? "bg-rose-500/15 border border-rose-500/45 text-white glow-red" 
                : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Activity className={`w-4 h-4 ${activeLayer === "PM2.5" ? "text-rose-400" : "text-slate-400"}`} />
            <span className="text-[8.5px] font-mono mt-1 font-bold">PM2.5</span>
          </button>

          <button
            onClick={() => setActiveLayer("NO₂")}
            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
              activeLayer === "NO₂" 
                ? "bg-sky-blue/15 border border-sky-blue/45 text-white glow-blue" 
                : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Compass className={`w-4 h-4 ${activeLayer === "NO₂" ? "text-sky-blue" : "text-slate-400"}`} />
            <span className="text-[8.5px] font-mono mt-1 font-bold">NO₂</span>
          </button>

          <button
            onClick={() => setActiveLayer("SO₂")}
            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
              activeLayer === "SO₂" 
                ? "bg-yellow-500/15 border border-yellow-500/45 text-white glow-orange" 
                : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Sliders className={`w-4 h-4 ${activeLayer === "SO₂" ? "text-yellow-400" : "text-slate-400"}`} />
            <span className="text-[8.5px] font-mono mt-1 font-bold">SO₂</span>
          </button>

          <button
            onClick={() => setActiveLayer("CO")}
            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
              activeLayer === "CO" 
                ? "bg-orange-500/15 border border-orange-500/45 text-white glow-orange" 
                : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Wind className={`w-4 h-4 ${activeLayer === "CO" ? "text-orange-400" : "text-slate-400"}`} />
            <span className="text-[8.5px] font-mono mt-1 font-bold">CO</span>
          </button>

          <button
            onClick={() => setActiveLayer("O₃")}
            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
              activeLayer === "O₃" 
                ? "bg-indigo-500/15 border border-indigo-500/45 text-white glow-blue" 
                : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Sun className={`w-4 h-4 ${activeLayer === "O₃" ? "text-indigo-400" : "text-slate-400"}`} />
            <span className="text-[8.5px] font-mono mt-1 font-bold">O₃</span>
          </button>

          <button
            onClick={() => setActiveLayer("HCHO")}
            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
              activeLayer === "HCHO" 
                ? "bg-pink-500/15 border border-pink-500/45 text-white glow-red" 
                : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Layers className={`w-4 h-4 ${activeLayer === "HCHO" ? "text-pink-400" : "text-slate-400"}`} />
            <span className="text-[8.5px] font-mono mt-1 font-bold">HCHO</span>
          </button>

          <button
            onClick={() => setActiveLayer("Fires")}
            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
              activeLayer === "Fires" 
                ? "bg-[#EF4444]/15 border border-[#EF4444]/45 text-white glow-red" 
                : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Flame className={`w-4 h-4 ${activeLayer === "Fires" ? "text-rose-500 animate-pulse" : "text-slate-400"}`} />
            <span className="text-[8.5px] font-mono mt-1 font-bold">Fires</span>
          </button>

          <button
            onClick={() => setActiveLayer("Wind")}
            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
              activeLayer === "Wind" 
                ? "bg-[#29B6F6]/15 border border-[#29B6F6]/45 text-white glow-blue" 
                : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Wind className={`w-4 h-4 ${activeLayer === "Wind" ? "text-sky-blue" : "text-slate-400"}`} />
            <span className="text-[8.5px] font-mono mt-1 font-bold">Wind</span>
          </button>

          <button
            onClick={() => setActiveLayer("Rain")}
            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
              activeLayer === "Rain" 
                ? "bg-blue-500/15 border border-blue-500/45 text-white glow-blue" 
                : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <CloudRain className={`w-4 h-4 ${activeLayer === "Rain" ? "text-blue-400" : "text-slate-400"}`} />
            <span className="text-[8.5px] font-mono mt-1 font-bold">Rain</span>
          </button>

          <button
            onClick={() => setActiveLayer("Temp")}
            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
              activeLayer === "Temp" 
                ? "bg-red-500/15 border border-red-500/45 text-white glow-red" 
                : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Thermometer className={`w-4 h-4 ${activeLayer === "Temp" ? "text-red-400" : "text-slate-400"}`} />
            <span className="text-[8.5px] font-mono mt-1 font-bold">Temp</span>
          </button>

          <button
            onClick={() => setActiveLayer("Humidity")}
            className={`flex-1 flex flex-col items-center py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
              activeLayer === "Humidity" 
                ? "bg-teal-500/15 border border-teal-500/45 text-white glow-blue" 
                : "border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Droplets className={`w-4 h-4 ${activeLayer === "Humidity" ? "text-teal-400" : "text-slate-400"}`} />
            <span className="text-[8.5px] font-mono mt-1 font-bold">Humidity</span>
          </button>

        </div>
      </div>

      {/* 5. HOVER DETAILS / METADATA TOOLTIP OVERLAY (Bottom Left) */}
      {hoveredState && (
        <div className="absolute bottom-6 left-6 z-20 glass-panel p-4 rounded-xl border border-sky-blue/30 w-64 pointer-events-none shadow-2xl backdrop-blur-md text-left">
          <div className="flex justify-between items-center mb-1.5 border-b border-slate-800 pb-1.5">
            <span className="text-sm font-display font-bold text-white">{hoveredState.name}</span>
            <span className="text-[8px] font-mono text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800 uppercase tracking-wider">
              ISRO Ref
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] font-mono">
            <div className="bg-[#040d1a]/80 p-1.5 rounded border border-slate-900">
              <p className="text-[8px] text-slate-400 uppercase">Surface AQI</p>
              <p className={`font-bold text-xs mt-0.5 ${
                hoveredState.aqi > 250 ? "text-rose-500" : hoveredState.aqi > 150 ? "text-orange-500" : "text-emerald-green"
              }`}>
                {hoveredState.aqi}
              </p>
            </div>

            <div className="bg-[#040d1a]/80 p-1.5 rounded border border-slate-900">
              <p className="text-[8px] text-slate-400 uppercase">HCHO Column</p>
              <p className="font-bold text-xs text-sky-blue mt-0.5">
                {hoveredState.hcho} <span className="text-[7px] text-slate-400">mol/cm²</span>
              </p>
            </div>

            <div className="bg-[#040d1a]/80 p-1.5 rounded border border-slate-900">
              <p className="text-[8px] text-slate-400 uppercase">Active Fires</p>
              <p className="font-bold text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                {hoveredState.fireCount}
              </p>
            </div>

            <div className="bg-[#040d1a]/80 p-1.5 rounded border border-slate-900">
              <p className="text-[8px] text-slate-400 uppercase">Wind Vector</p>
              <p className="font-bold text-[9px] text-slate-200 mt-0.5">
                {hoveredState.windDir}° | {hoveredState.windSpeed} km/h
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. COORD TRACKER STATUS BAR (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-none flex flex-col gap-1 items-end bg-[#040D1A]/90 border border-slate-800 px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-300">
          <Navigation className="w-3 h-3 text-sky-blue rotate-45" />
          <span>LAT: <strong className="text-white">{mouseCoords.lat.toFixed(4)}° N</strong></span>
          <span className="text-slate-600">|</span>
          <span>LON: <strong className="text-white">{mouseCoords.lon.toFixed(4)}° E</strong></span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono text-slate-500">
          <span>Scale: 1 : 4,200,000</span>
          <span>•</span>
          <span>Proj: Lambert Conformal</span>
        </div>
      </div>

    </div>
  );
}
