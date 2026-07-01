import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { StateData, FireEvent } from "../types";
import { 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  MapPin, 
  Layers, 
  Flame, 
  Wind, 
  Ruler, 
  Maximize2, 
  Minimize2, 
  Search, 
  Eye, 
  EyeOff, 
  Activity,
  Gauge,
  Thermometer,
  CloudRain,
  Droplets,
  HelpCircle,
  Sparkles,
  RotateCcw,
  Globe,
  Cloud,
  Calendar,
  Clock
} from "lucide-react";

// Real geographic centroids of Indian States for GIS flight paths
const stateCentroids: Record<string, { lat: number; lng: number }> = {
  "DL": { lat: 28.6139, lng: 77.2090 },
  "PB": { lat: 31.1471, lng: 75.3412 },
  "HR": { lat: 29.0588, lng: 76.0856 },
  "UP": { lat: 26.8467, lng: 80.9462 },
  "MH": { lat: 19.7515, lng: 75.7139 },
  "GJ": { lat: 22.2587, lng: 71.1924 },
  "KA": { lat: 15.3173, lng: 75.7139 },
  "TN": { lat: 11.1271, lng: 78.6569 },
  "KL": { lat: 10.8505, lng: 76.2711 },
  "TS": { lat: 18.1124, lng: 79.0193 },
  "AP": { lat: 15.9129, lng: 79.7400 },
  "MP": { lat: 22.9734, lng: 78.6569 },
  "BR": { lat: 25.0961, lng: 85.3131 },
  "JH": { lat: 23.6102, lng: 85.2799 },
  "WB": { lat: 22.9868, lng: 87.8550 },
  "OR": { lat: 20.9517, lng: 83.3074 },
  "CG": { lat: 21.2787, lng: 81.8661 },
  "JK": { lat: 33.7782, lng: 76.5762 },
  "LA": { lat: 34.1526, lng: 77.5771 },
  "HP": { lat: 31.1048, lng: 77.1734 },
  "UK": { lat: 30.0668, lng: 79.0193 },
  "SK": { lat: 27.5330, lng: 88.5122 },
  "AS": { lat: 26.2006, lng: 92.9376 },
  "ML": { lat: 25.4670, lng: 91.3662 },
  "NL": { lat: 26.1584, lng: 94.5624 },
  "MN": { lat: 24.6637, lng: 93.9063 },
  "TR": { lat: 23.9408, lng: 91.9882 },
  "MZ": { lat: 23.1645, lng: 92.9376 },
  "AR": { lat: 28.2180, lng: 94.7278 },
  "GA": { lat: 15.2993, lng: 74.1240 },
  "AN": { lat: 11.7401, lng: 92.6586 },
  "LD": { lat: 10.5667, lng: 72.6369 }
};

// Real geographic coordinates of major monitoring cities in India
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  // Delhi NCT
  "Anand Vihar": { lat: 28.6465, lng: 77.3162 },
  "Punjabi Bagh": { lat: 28.6675, lng: 77.1350 },
  "Mandir Marg": { lat: 28.6339, lng: 77.2010 },
  "RK Puram": { lat: 28.5660, lng: 77.1741 },
  // Punjab
  "Ludhiana": { lat: 30.9010, lng: 75.8573 },
  "Amritsar": { lat: 31.6340, lng: 74.8723 },
  "Patiala": { lat: 30.3398, lng: 76.3869 },
  "Jalandhar": { lat: 31.3260, lng: 75.5762 },
  // Haryana
  "Gurugram": { lat: 28.4595, lng: 77.0266 },
  "Faridabad": { lat: 28.4089, lng: 77.3178 },
  "Panipat": { lat: 29.3909, lng: 76.9635 },
  "Rohtak": { lat: 28.8955, lng: 76.6066 },
  // Uttar Pradesh
  "Kanpur": { lat: 26.4499, lng: 80.3319 },
  "Lucknow": { lat: 26.8467, lng: 80.9462 },
  "Noida": { lat: 28.5355, lng: 77.3910 },
  "Varanasi": { lat: 25.3176, lng: 82.9739 },
  // Maharashtra
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  "Thane": { lat: 19.2183, lng: 72.9781 },
  "Nagpur": { lat: 21.1458, lng: 79.0882 },
  // Gujarat
  "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "Jamnagar": { lat: 22.4707, lng: 70.0577 },
  "Surat": { lat: 21.1702, lng: 72.8311 },
  "Vadodara": { lat: 22.3072, lng: 73.1812 },
  // Karnataka
  "Bengaluru": { lat: 12.9716, lng: 77.5946 },
  "Mysuru": { lat: 12.2958, lng: 76.6394 },
  "Mangaluru": { lat: 12.9141, lng: 74.8560 },
  "Hubballi": { lat: 15.3647, lng: 75.1240 },
  // Tamil Nadu
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Coimbatore": { lat: 11.0168, lng: 76.9558 },
  "Madurai": { lat: 9.9252, lng: 78.1198 },
  "Trichy": { lat: 10.7905, lng: 78.7047 },
  // West Bengal
  "Kolkata": { lat: 22.5726, lng: 88.3639 },
  "Asansol": { lat: 23.6740, lng: 86.9520 },
  "Haldia": { lat: 22.0641, lng: 88.0700 },
  "Siliguri": { lat: 26.7271, lng: 88.3953 },
  // Madhya Pradesh
  "Singrauli": { lat: 24.1959, lng: 82.6687 },
  "Indore": { lat: 22.7196, lng: 75.8577 },
  "Bhopal": { lat: 23.2599, lng: 77.4126 },
  "Gwalior": { lat: 26.2183, lng: 78.1828 },
  // Rajasthan
  "Jaipur": { lat: 26.9124, lng: 75.7873 },
  "Jodhpur": { lat: 26.2389, lng: 73.0243 },
  "Kota": { lat: 25.2138, lng: 75.8648 },
  "Udaipur": { lat: 24.5854, lng: 73.7125 },
  // Andhra Pradesh
  "Visakhapatnam": { lat: 17.6868, lng: 83.2185 },
  "Vijayawada": { lat: 16.5062, lng: 80.6480 },
  "Tirupati": { lat: 13.6288, lng: 79.4192 },
  "Guntur": { lat: 16.3067, lng: 80.4365 },
  // Telangana
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Warangal": { lat: 17.9689, lng: 79.5941 },
  "Ramagundam": { lat: 18.8034, lng: 79.4475 },
  "Nizamabad": { lat: 18.6725, lng: 78.0941 },
  // Odisha
  "Bhubaneswar": { lat: 20.2961, lng: 85.8245 },
  "Cuttack": { lat: 20.4625, lng: 85.8830 },
  "Rourkela": { lat: 22.2604, lng: 84.8536 },
  "Puri": { lat: 19.8135, lng: 85.8312 },
  // Jharkhand
  "Ranchi": { lat: 23.3441, lng: 85.3090 },
  "Jamshedpur": { lat: 22.8046, lng: 86.2029 },
  "Dhanbad": { lat: 23.7957, lng: 86.4304 },
  // Bihar
  "Patna": { lat: 25.5941, lng: 85.1376 },
  "Gaya": { lat: 24.7914, lng: 84.9994 },
  "Muzaffarpur": { lat: 26.1196, lng: 85.3910 },
  // Kerala
  "Thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
  "Kochi": { lat: 9.9312, lng: 76.2673 },
  "Kozhikode": { lat: 11.2588, lng: 75.7804 },
  // Jammu & Kashmir & Ladakh
  "Srinagar": { lat: 34.0837, lng: 74.7973 },
  "Jammu": { lat: 32.7266, lng: 74.8570 },
  "Leh": { lat: 34.1526, lng: 77.5771 },
  // North East
  "Guwahati": { lat: 26.1445, lng: 91.7362 },
  "Shillong": { lat: 25.5788, lng: 91.8831 },
  "Imphal": { lat: 24.8170, lng: 93.9368 },
  "Aizawl": { lat: 23.7307, lng: 92.7173 },
  "Kohima": { lat: 25.6751, lng: 94.1113 },
  "Itanagar": { lat: 27.0844, lng: 93.6053 },
  "Gangtok": { lat: 27.3314, lng: 88.6138 },
  "Agartala": { lat: 23.8315, lng: 91.2868 },
  // Goa
  "Panaji": { lat: 15.4909, lng: 73.8278 }
};

// Fuzzy matcher to link online GeoJSON properties to our state profiles spelling-insensitively
function normalizeStateName(name: string): string {
  if (!name) return "";
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (n.includes("delhi")) return "DL";
  if (n.includes("punjab")) return "PB";
  if (n.includes("haryana")) return "HR";
  if (n.includes("uttarpradesh")) return "UP";
  if (n.includes("maharashtra")) return "MH";
  if (n.includes("gujarat")) return "GJ";
  if (n.includes("karnataka")) return "KA";
  if (n.includes("tamilnadu")) return "TN";
  if (n.includes("kerala")) return "KL";
  if (n.includes("telangana")) return "TS";
  if (n.includes("andhrapradesh")) return "AP";
  if (n.includes("madhyapradesh")) return "MP";
  if (n.includes("bihar")) return "BR";
  if (n.includes("jharkhand")) return "JH";
  if (n.includes("westbengal")) return "WB";
  if (n.includes("odisha") || n.includes("orissa")) return "OR";
  if (n.includes("chhattisgarh")) return "CG";
  if (n.includes("jammu") || n.includes("kashmir")) return "JK";
  if (n.includes("ladakh")) return "LA";
  if (n.includes("himachal")) return "HP";
  if (n.includes("uttarakhand")) return "UK";
  if (n.includes("sikkim")) return "SK";
  if (n.includes("assam")) return "AS";
  if (n.includes("meghalaya")) return "ML";
  if (n.includes("nagaland")) return "NL";
  if (n.includes("manipur")) return "MN";
  if (n.includes("tripura")) return "TR";
  if (n.includes("mizoram")) return "MZ";
  if (n.includes("arunachal")) return "AR";
  if (n.includes("goa")) return "GA";
  if (n.includes("andaman")) return "AN";
  if (n.includes("lakshadweep")) return "LD";
  return name;
}

// ==========================================
// METEOROLOGICAL GIS RASTER GENERATION SYSTEM
// ==========================================

// Procedural high-resolution elevation model of India (meters)
function getElevation(lat: number, lng: number): number {
  let elev = 0;
  
  // Himalayas (North/Northeast Range)
  if (lat > 26.5 && lng > 71.0 && lng < 98.0) {
    const ridgeLat = 37.5 - 0.45 * (lng - 70.0);
    const distToRidge = Math.abs(lat - ridgeLat);
    if (lat > 29.0 || (lat > 26.0 && lng > 88.0)) {
      elev += Math.max(0, 5800 - distToRidge * 1100);
      
      // Ridge noise / mountain fractal texture
      const noise = Math.sin(lat * 2.8) * Math.cos(lng * 2.8) * 350 + Math.sin(lat * 6.5) * Math.cos(lng * 6.5) * 120;
      elev += noise;
    }
  }

  // Western Ghats (Coastline mountains, lat 8.5 to 21.0)
  if (lng >= 72.8 && lng <= 75.5 && lat >= 8.5 && lat <= 21.0) {
    const distToGhats = Math.abs(lng - (73.4 + (lat - 8.5) * 0.04));
    if (distToGhats < 1.1) {
      elev += Math.max(0, 1600 - distToGhats * 1500);
      elev += Math.sin(lat * 3.5) * 120;
    }
  }

  // Deccan Plateau (South-Central sub-continent)
  if (lat > 10.0 && lat < 24.0 && lng > 74.0 && lng < 82.0) {
    elev += 450 + Math.sin(lat * 0.6) * Math.cos(lng * 0.6) * 180;
  }

  // Eastern Ghats (scattered hill networks)
  if (lng >= 77.0 && lng <= 84.0 && lat >= 11.0 && lat <= 22.0) {
    const hillNoise = Math.max(0, Math.sin(lat * 1.8) * Math.cos(lng * 1.8)) * 550;
    elev += hillNoise;
  }

  return Math.max(0, elev);
}

// Precise shoreline detection factor to isolate water (Arabian Sea, Bay of Bengal)
function getWaterFactor(lat: number, lng: number): number {
  if (lng < 68.0) return 1.0;
  if (lat < 5.0) return 1.0;

  // West Coast shoreline approximation
  let westCoastLng = 77.0;
  if (lat >= 8.0 && lat < 15.0) {
    westCoastLng = 77.0 - ((lat - 8.0) / 7.0) * 3.5;
  } else if (lat >= 15.0 && lat < 19.0) {
    westCoastLng = 73.5 - ((lat - 15.0) / 4.0) * 0.7;
  } else if (lat >= 19.0 && lat < 21.0) {
    westCoastLng = 72.8 - ((lat - 19.0) / 2.0) * 0.6;
  } else if (lat >= 21.0 && lat < 24.0) {
    westCoastLng = 72.2 - ((lat - 21.0) / 3.0) * 3.7;
  } else {
    westCoastLng = 68.5;
  }

  // East Coast shoreline approximation
  let eastCoastLng = 77.0;
  if (lat >= 8.0 && lat < 10.0) {
    eastCoastLng = 77.0 + ((lat - 8.0) / 2.0) * 2.8;
  } else if (lat >= 10.0 && lat < 13.0) {
    eastCoastLng = 79.8 + ((lat - 10.0) / 3.0) * 0.4;
  } else if (lat >= 13.0 && lat < 17.0) {
    eastCoastLng = 80.2 + ((lat - 13.0) / 4.0) * 2.0;
  } else if (lat >= 17.0 && lat < 20.0) {
    eastCoastLng = 82.2 + ((lat - 17.0) / 3.0) * 4.0;
  } else if (lat >= 20.0 && lat < 22.0) {
    eastCoastLng = 86.2 + ((lat - 20.0) / 2.0) * 2.8;
  } else {
    eastCoastLng = 89.0;
  }

  // Arabian Sea
  if (lng < westCoastLng) {
    const dist = westCoastLng - lng;
    return Math.min(1.0, dist / 1.3);
  }

  // Bay of Bengal
  if (lng > eastCoastLng && lat < 22.5) {
    const dist = lng - eastCoastLng;
    return Math.min(1.0, dist / 1.3);
  }

  return 0.0;
}

// Calculate interpolated geological-terrain-aware temperature at any point
function calculateMeteorologicalTemperature(
  lat: number,
  lng: number,
  timelineIndex: number,
  stations: { lat: number; lng: number; temp: number }[]
): number {
  // 1. Inverse Distance Weighting interpolation from weather stations
  let totalWeight = 0;
  let weightedTempSum = 0;

  for (let i = 0; i < stations.length; i++) {
    const st = stations[i];
    const dy = lat - st.lat;
    const dx = lng - st.lng;
    const distSq = dy * dy + dx * dx + 0.01; // epsilon to prevent division by zero
    const weight = 1 / Math.pow(distSq, 1.35); // IDW power 1.35 for smooth physical fields

    weightedTempSum += st.temp * weight;
    totalWeight += weight;
  }

  let baseTemp = totalWeight > 0 ? (weightedTempSum / totalWeight) : 28.0;

  // 2. Coastal & Marine adjustment (water is more thermally stable)
  const waterFactor = getWaterFactor(lat, lng);
  if (waterFactor > 0.0) {
    const marineBase = 27.8 + Math.sin(lat * 0.12) * 1.2;
    baseTemp = baseTemp * (1.0 - waterFactor) + marineBase * waterFactor;
  }

  // 3. Elevation Lapse Cooling (approx. -6.5°C decrease per 1000m of elevation)
  const elevation = getElevation(lat, lng);
  if (elevation > 0) {
    baseTemp -= 0.0065 * elevation;
  }

  // 4. Thar Desert Local Thermal Anomaly (extreme heating)
  if (lat >= 23.5 && lat <= 29.5 && lng >= 69.0 && lng <= 76.5) {
    const dLat = lat - 26.5;
    const dLng = lng - 72.8;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < 3.8) {
      const heatIntensity = (3.8 - dist) / 3.8;
      baseTemp += heatIntensity * 6.2; // up to +6.2°C extra heat in desert core
    }
  }

  // 5. Valley / River Basin floor microclimate cooling (e.g. Ganges valley)
  const gangesLat = 30.0 - 0.28 * (lng - 78);
  if (lng > 77 && lng < 88 && lat > 22 && lat < 31) {
    const distToRiver = Math.abs(lat - gangesLat);
    if (distToRiver < 0.5) {
      baseTemp -= (0.5 - distToRiver) * 1.8; // cooling along river bottom
    }
  }

  // Sunderbans canopy cooling
  if (lat >= 21.2 && lat <= 23.0 && lng >= 87.5 && lng <= 90.5) {
    baseTemp -= 1.6;
  }

  // 6. Forecast Timeline Frame Simulation
  let forecastAdjustment = 0;
  if (timelineIndex === 1) {
    // Afternoon heat wave propagation
    forecastAdjustment = 2.4;
    if (lng < 75 && lat > 24) forecastAdjustment += 1.6; // extra desert heating
  } else if (timelineIndex === 2) {
    // Monsoon front precipitation cooling sweeping from Southwest
    const distToKochi = Math.sqrt(Math.pow(lat - 9.9, 2) + Math.pow(lng - 76.2, 2));
    if (distToKochi < 14) {
      forecastAdjustment = -4.5 * (1.0 - distToKochi / 14);
    } else {
      forecastAdjustment = -1.2;
    }
  } else if (timelineIndex === 3) {
    // Overnight radiative surface cooling
    forecastAdjustment = -3.8;
    if (elevation > 1500) forecastAdjustment -= 2.2; // faster mountain cooling
  }

  baseTemp += forecastAdjustment;

  return baseTemp;
}

// Convert temperature values to continuous meteorological color scale matching professional weather maps
function getTemperatureColor(temp: number): { r: number; g: number; b: number } {
  const t = Math.max(-15, Math.min(45, temp));
  
  // Continuous Color Scale: Dark Blue -> Blue -> Cyan -> Green -> Yellow -> Orange -> Red -> Purple
  const stops = [
    { val: -15, r: 24,  g: 10,  b: 64 },   // Deep Dark Blue/Violet (Extreme frost)
    { val: -5,  r: 46,  g: 16,  b: 101 },  // Violet-Blue
    { val: 0,   r: 30,  g: 64,  b: 175 },  // Dark Blue
    { val: 10,  r: 59,  g: 130, b: 246 },  // Blue (Cold)
    { val: 18,  r: 6,   g: 182, b: 212 },  // Cyan (Cool)
    { val: 24,  r: 34,  g: 197, b: 94 },   // Green (Mild/Comfortable)
    { val: 30,  r: 234, g: 179, b: 8 },    // Yellow (Warm)
    { val: 35,  r: 249, g: 115, b: 22 },   // Orange (Hot)
    { val: 40,  r: 220, g: 38,  b: 38 },   // Red (Extreme heat)
    { val: 45,  r: 168, g: 85,  b: 247 }   // Purple/Magenta (Dangerous heat dome)
  ];

  let lower = stops[0];
  let upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].val && t <= stops[i+1].val) {
      lower = stops[i];
      upper = stops[i+1];
      break;
    }
  }

  const range = upper.val - lower.val;
  const factor = range === 0 ? 0 : (t - lower.val) / range;
  
  return {
    r: Math.round(lower.r + (upper.r - lower.r) * factor),
    g: Math.round(lower.g + (upper.g - lower.g) * factor),
    b: Math.round(lower.b + (upper.b - lower.b) * factor)
  };
}

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
  // Layer & view controls
  const [activeLayer, setActiveLayer] = useState<string>(initialActiveLayer || "AQI");
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [dayMode, setDayMode] = useState(true); // true: Normal RGB Satellite (Default), false: Soft Enhanced Satellite
  const [is3D, setIs3D] = useState(false); // Perspective Tilt Toggle
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [mouseCoords, setMouseCoords] = useState({ lat: 21.1458, lon: 79.0882 });
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [timelineIndex, setTimelineIndex] = useState<number>(0);
  const [timelineIsPlaying, setTimelineIsPlaying] = useState<boolean>(true);
  const [selectedFire, setSelectedFire] = useState<any>(null);

  // Auto-play interval for timeline-based sensors (PM2.5, Forecast, Rain, Clouds)
  useEffect(() => {
    if (!timelineIsPlaying) return;
    const interval = setInterval(() => {
      setTimelineIndex((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, [timelineIsPlaying]);

  // Search feature state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  // State boundary GeoJSON loaded dynamically
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Animated wind flow state (80 particles distributed across India)
  const windParticles = useRef<{ lat: number; lng: number; speed: number; angle: number }[]>([]);

  // Initialize wind particles once on mount
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        lat: 8 + Math.random() * 30,
        lng: 68 + Math.random() * 30,
        speed: 8 + Math.random() * 15,
        angle: 190 + Math.random() * 80 // Westerly wind vector
      });
    }
    windParticles.current = particles;
  }, []);

  // Fetch official India States boundary GeoJSON at start
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/unmesh-m/india-geojson/master/india_states.geojson")
      .then(res => {
        if (!res.ok) throw new Error("Could not load GIS state boundaries.");
        return res.json();
      })
      .then(data => {
        setGeoJsonData(data);
      })
      .catch(err => {
        console.warn("Fuzzy falling back on dynamic overlay boundaries.", err);
      });
  }, []);

  // Canvas drawing orchestrator
  const drawCanvasOverlay = () => {
    const canvas = canvasRef.current;
    const map = mapRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flush previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const zoom = map.getZoom();

    // Layer 1: Satellite Map (id: "Sat")
    // Natural satellite imagery. No overlays drawn on the canvas.
    if (activeLayer === "Sat") {
      return; 
    }

    // Layer 2: AQI Heatmap (id: "AQI")
    if (activeLayer === "AQI") {
      ctx.globalAlpha = 0.42; 
      ctx.globalCompositeOperation = "screen";

      const points: { lat: number; lng: number; val: number }[] = [];
      statesData.forEach(state => {
        const coords = stateCentroids[state.id];
        if (coords) {
          points.push({ lat: coords.lat, lng: coords.lng, val: state.aqi });
        }
        if (state.cities) {
          state.cities.forEach(city => {
            const cityCoords = cityCoordinates[city.name];
            if (cityCoords) {
              points.push({ lat: cityCoords.lat, lng: cityCoords.lng, val: city.aqi });
            }
          });
        }
      });

      points.forEach(pt => {
        try {
          const pos = map.latLngToContainerPoint(L.latLng(pt.lat, pt.lng));
          let baseRadius = 180;
          let scaleFactor = 1.0;
          if (pt.val > 250) scaleFactor = 1.0;
          else if (pt.val > 150) scaleFactor = 0.72;
          else if (pt.val > 100) scaleFactor = 0.52;
          else scaleFactor = 0.18;

          const radius = baseRadius * scaleFactor * Math.pow(1.22, zoom - 5);
          const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);

          let colors = ["rgba(16, 185, 129, 0.15)", "rgba(16, 185, 129, 0.02)", "rgba(0, 0, 0, 0)"];
          if (pt.val > 300) {
            colors = ["rgba(147, 51, 234, 0.45)", "rgba(244, 63, 94, 0.20)", "rgba(249, 115, 22, 0.05)", "rgba(0, 0, 0, 0)"];
          } else if (pt.val > 200) {
            colors = ["rgba(239, 68, 68, 0.40)", "rgba(249, 115, 22, 0.15)", "rgba(245, 158, 11, 0.04)", "rgba(0, 0, 0, 0)"];
          } else if (pt.val > 150) {
            colors = ["rgba(249, 115, 22, 0.38)", "rgba(245, 158, 11, 0.12)", "rgba(16, 185, 129, 0.02)", "rgba(0, 0, 0, 0)"];
          } else if (pt.val > 100) {
            colors = ["rgba(245, 158, 11, 0.32)", "rgba(16, 185, 129, 0.05)", "rgba(0, 0, 0, 0)"];
          }

          grad.addColorStop(0, colors[0]);
          grad.addColorStop(0.3, colors[1]);
          if (colors.length === 4) {
            grad.addColorStop(0.7, colors[2]);
            grad.addColorStop(1, colors[3]);
          } else {
            grad.addColorStop(1, colors[2]);
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      });
    }

    // Layer 3: PM2.5 (id: "PM2.5")
    if (activeLayer === "PM2.5") {
      ctx.globalAlpha = 0.45;
      ctx.globalCompositeOperation = "screen";

      const points: { lat: number; lng: number; val: number }[] = [];
      statesData.forEach(state => {
        const coords = stateCentroids[state.id];
        if (coords) {
          // Adjust concentration according to the active timeline step (simulate day forecast fluctuations)
          let timeMultiplier = [0.85, 1.25, 1.10, 0.70][timelineIndex];
          points.push({ lat: coords.lat, lng: coords.lng, val: state.pm25 * timeMultiplier });
        }
      });

      points.forEach(pt => {
        try {
          const pos = map.latLngToContainerPoint(L.latLng(pt.lat, pt.lng));
          let baseRadius = 200;
          let scaleFactor = 1.0;
          if (pt.val > 100) scaleFactor = 1.1;
          else if (pt.val > 50) scaleFactor = 0.85;
          else if (pt.val > 25) scaleFactor = 0.6;
          else if (pt.val > 10) scaleFactor = 0.4;
          else scaleFactor = 0.2;

          const radius = baseRadius * scaleFactor * Math.pow(1.22, zoom - 5);
          const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);

          // Legend color scheme: Green -> Yellow -> Orange -> Red -> Purple
          let colors = ["rgba(16, 185, 129, 0.4)", "rgba(16, 185, 129, 0.05)", "rgba(0, 0, 0, 0)"];
          if (pt.val > 100) { // Purple (100+)
            colors = ["rgba(168, 85, 247, 0.45)", "rgba(168, 85, 247, 0.15)", "rgba(239, 68, 68, 0.03)", "rgba(0, 0, 0, 0)"];
          } else if (pt.val > 50) { // Red (50-100)
            colors = ["rgba(239, 68, 68, 0.42)", "rgba(239, 68, 68, 0.12)", "rgba(249, 115, 22, 0.02)", "rgba(0, 0, 0, 0)"];
          } else if (pt.val > 25) { // Orange (25-50)
            colors = ["rgba(249, 115, 22, 0.38)", "rgba(245, 158, 11, 0.10)", "rgba(16, 185, 129, 0.01)", "rgba(0, 0, 0, 0)"];
          } else if (pt.val > 10) { // Yellow (10-25)
            colors = ["rgba(234, 179, 8, 0.32)", "rgba(16, 185, 129, 0.03)", "rgba(0, 0, 0, 0)"];
          }

          grad.addColorStop(0, colors[0]);
          grad.addColorStop(0.3, colors[1]);
          if (colors.length === 4) {
            grad.addColorStop(0.7, colors[2]);
            grad.addColorStop(1, colors[3]);
          } else {
            grad.addColorStop(1, colors[2]);
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      });
    }

    // Layer 4: NO₂ Column Density (id: "NO2")
    if (activeLayer === "NO2") {
      ctx.globalAlpha = 0.45;
      ctx.globalCompositeOperation = "screen";

      // 1. Plot core emissions at centroids and cities
      statesData.forEach(state => {
        const coords = stateCentroids[state.id];
        if (coords) {
          try {
            const pos = map.latLngToContainerPoint(L.latLng(coords.lat, coords.lng));
            const radius = 130 * Math.pow(1.2, zoom - 5);
            const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
            grad.addColorStop(0, "rgba(6, 182, 212, 0.42)"); // Blue-green
            grad.addColorStop(0.5, "rgba(16, 185, 129, 0.10)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fill();
          } catch (e) {}
        }
      });

      // 2. Highlight key heavy transport corridors with active neon flow lines (Windy style)
      const routes = [
        [{ lat: 28.6, lng: 77.2 }, { lat: 26.4, lng: 80.3 }, { lat: 25.5, lng: 85.1 }, { lat: 22.5, lng: 88.3 }], // NH-19
        [{ lat: 28.6, lng: 77.2 }, { lat: 23.0, lng: 72.5 }, { lat: 19.07, lng: 72.87 }], // NH-48 North
        [{ lat: 19.07, lng: 72.87 }, { lat: 18.5, lng: 73.8 }, { lat: 15.3, lng: 75.1 }, { lat: 12.97, lng: 77.59 }], // NH-48 South
        [{ lat: 12.97, lng: 77.59 }, { lat: 13.08, lng: 80.27 }] // Bengaluru-Chennai
      ];

      ctx.strokeStyle = "rgba(234, 179, 8, 0.28)"; 
      ctx.lineWidth = 2.0;
      routes.forEach(route => {
        try {
          ctx.beginPath();
          const start = map.latLngToContainerPoint(L.latLng(route[0].lat, route[0].lng));
          ctx.moveTo(start.x, start.y);
          for (let i = 1; i < route.length; i++) {
            const pt = map.latLngToContainerPoint(L.latLng(route[i].lat, route[i].lng));
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();

          // Moving tracer dot
          const segmentCount = route.length - 1;
          const time = (Date.now() / 2500) % segmentCount;
          const index = Math.floor(time);
          const fraction = time - index;
          
          const p1 = map.latLngToContainerPoint(L.latLng(route[index].lat, route[index].lng));
          const p2 = map.latLngToContainerPoint(L.latLng(route[index+1].lat, route[index+1].lng));
          
          const dotX = p1.x + (p2.x - p1.x) * fraction;
          const dotY = p1.y + (p2.y - p1.y) * fraction;

          ctx.fillStyle = "#fbbf24";
          ctx.shadowColor = "#fbbf24";
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; 
        } catch (e) {}
      });
    }

    // Layer 5: SO₂ Plume Map (id: "SO2")
    if (activeLayer === "SO2") {
      ctx.globalAlpha = 0.52;
      ctx.globalCompositeOperation = "screen";

      // Sulfur Dioxide coal powerplant hubs + volcano plume
      const sources = [
        { name: "Singrauli Super Thermal", lat: 24.19, lng: 82.66, plumeSize: 220, color: "rgba(234, 179, 8, 0.35)" },
        { name: "Neyveli Lignite Plant", lat: 11.53, lng: 79.48, plumeSize: 180, color: "rgba(249, 115, 22, 0.32)" },
        { name: "Mundra Coal Port", lat: 22.82, lng: 69.73, plumeSize: 190, color: "rgba(234, 179, 8, 0.30)" },
        { name: "Barren Island Active Volcano", lat: 12.278, lng: 93.858, plumeSize: 280, color: "rgba(239, 68, 68, 0.42)" }
      ];

      sources.forEach(src => {
        try {
          const origin = map.latLngToContainerPoint(L.latLng(src.lat, src.lng));
          
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.fillText("▲", origin.x, origin.y + 3);

          const driftAngle = -Math.PI / 6; // slow northeast wind drift
          const size = src.plumeSize * Math.pow(1.18, zoom - 5);

          const grad = ctx.createRadialGradient(
            origin.x, origin.y, 1, 
            origin.x + Math.cos(driftAngle) * (size * 0.4), origin.y + Math.sin(driftAngle) * (size * 0.4), 
            size
          );
          grad.addColorStop(0, src.color);
          grad.addColorStop(0.5, "rgba(245, 158, 11, 0.08)");
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(origin.x, origin.y, size, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      });
    }

    // Layer 6: CO Dispersion (id: "CO")
    if (activeLayer === "CO") {
      ctx.globalAlpha = 0.38;
      ctx.globalCompositeOperation = "screen";

      const time = Date.now() / 1500;
      const points = [
        { lat: 21.14, lng: 79.08, radius: 450 },
        { lat: 26.84, lng: 80.94, radius: 350 },
        { lat: 19.07, lng: 72.87, radius: 300 }
      ];

      points.forEach((pt, i) => {
        try {
          const offset = Math.sin(time + i) * 20;
          const pos = map.latLngToContainerPoint(L.latLng(pt.lat, pt.lng));
          const r = (pt.radius + offset) * Math.pow(1.18, zoom - 5);
          
          const grad = ctx.createRadialGradient(pos.x, pos.y, r * 0.1, pos.x + offset, pos.y + offset, r);
          grad.addColorStop(0, "rgba(239, 68, 68, 0.35)");
          grad.addColorStop(0.4, "rgba(249, 115, 22, 0.12)");
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      });
    }

    // Layer 7: Ozone Layer (id: "O3")
    if (activeLayer === "O3") {
      ctx.globalAlpha = 0.40;
      ctx.globalCompositeOperation = "screen";

      const time = Date.now() / 3200;
      const regions = [
        { lat: 28.0, lng: 75.0, r: 500, color: "rgba(147, 51, 234, 0.32)" }, 
        { lat: 15.0, lng: 82.0, r: 600, color: "rgba(6, 182, 212, 0.28)" }, 
        { lat: 10.0, lng: 76.0, r: 400, color: "rgba(16, 185, 129, 0.24)" }  
      ];

      regions.forEach((reg, i) => {
        try {
          const pos = map.latLngToContainerPoint(L.latLng(reg.lat, reg.lng));
          const pulse = reg.r * (1 + 0.12 * Math.cos(time + i)) * Math.pow(1.16, zoom - 5);
          
          const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pulse);
          grad.addColorStop(0, reg.color);
          grad.addColorStop(0.6, "rgba(234, 179, 8, 0.05)");
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pulse, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      });
    }

    // Layer 8: HCHO Formaldehyde (id: "HCHO")
    if (activeLayer === "HCHO") {
      ctx.globalAlpha = 0.50;
      ctx.globalCompositeOperation = "screen";

      const fires = [
        { name: "Amritsar Cropland", lat: 31.63, lng: 74.87, power: 1.0 },
        { name: "Ludhiana Farm Belt", lat: 30.90, lng: 75.85, power: 0.95 },
        { name: "Bhopal Deciduous Canopy", lat: 23.25, lng: 77.41, power: 0.70 },
        { name: "Kolkata Sundarbans", lat: 22.1, lng: 88.6, power: 0.65 }
      ];

      fires.forEach((fire, i) => {
        try {
          const pos = map.latLngToContainerPoint(L.latLng(fire.lat, fire.lng));
          const pulse = 1 + 0.25 * Math.sin(Date.now() / 180 + i);
          const r = 140 * fire.power * pulse * Math.pow(1.18, zoom - 5);

          const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r);
          grad.addColorStop(0, "rgba(236, 72, 153, 0.45)"); 
          grad.addColorStop(0.5, "rgba(249, 115, 22, 0.12)"); 
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      });
    }

    // Layer 9: Thermal Fires - NASA FIRMS style (id: "Fires")
    if (activeLayer === "Fires") {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";

      const timeSec = Date.now() / 200;

      fireEvents.forEach(fire => {
        try {
          const pos = map.latLngToContainerPoint(L.latLng(fire.lat, fire.lng));
          const pulse = 1 + 0.3 * Math.sin(timeSec + fire.confidence);

          ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 8 * pulse, 0, Math.PI * 2);
          ctx.stroke();

          // Animated Fire outer shape
          ctx.fillStyle = "#ef4444"; 
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y - 7 * pulse);
          ctx.bezierCurveTo(pos.x + 4, pos.y - 3, pos.x + 5, pos.y, pos.x + 3, pos.y + 4);
          ctx.bezierCurveTo(pos.x, pos.y + 7, pos.x - 3, pos.y + 7, pos.x - 5, pos.y + 4);
          ctx.bezierCurveTo(pos.x - 6, pos.y, pos.x - 3, pos.y - 3, pos.x, pos.y - 7 * pulse);
          ctx.fill();

          // Amber inner core
          ctx.fillStyle = "#f97316";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y + 2, 2.5 * pulse, 0, Math.PI * 2);
          ctx.fill();

          // Hot white-yellow spark
          ctx.fillStyle = "#fef08a";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y + 2, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      });
    }

    // Layer 10: Wind Particles & Streamlines (id: "Wind")
    if (activeLayer === "Wind") {
      ctx.globalAlpha = 0.88;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#38bdf8";

      // 1. Draw streamlines background guides
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 1.8;
      const flowLines = [
        [{ lat: 10, lng: 68 }, { lat: 15, lng: 74 }, { lat: 21, lng: 82 }, { lat: 25, lng: 89 }],
        [{ lat: 13, lng: 70 }, { lat: 18, lng: 77 }, { lat: 24, lng: 85 }, { lat: 28, lng: 92 }],
        [{ lat: 8, lng: 73 }, { lat: 12, lng: 80 }, { lat: 17, lng: 87 }, { lat: 22, lng: 94 }],
        [{ lat: 16, lng: 69 }, { lat: 22, lng: 76 }, { lat: 28, lng: 83 }, { lat: 31, lng: 90 }]
      ];

      flowLines.forEach(line => {
        try {
          ctx.beginPath();
          const start = map.latLngToContainerPoint(L.latLng(line[0].lat, line[0].lng));
          ctx.moveTo(start.x, start.y);
          for (let i = 1; i < line.length; i++) {
            const pt = map.latLngToContainerPoint(L.latLng(line[i].lat, line[i].lng));
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();
        } catch (e) {}
      });

      // 2. Draw moving streamline particles with trailing vectors
      windParticles.current.forEach(p => {
        try {
          const pos = map.latLngToContainerPoint(L.latLng(p.lat, p.lng));

          ctx.fillStyle = "rgba(56, 189, 248, 0.95)";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2.0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "rgba(56, 189, 248, 0.42)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          const rad = (p.angle * Math.PI) / 180;
          const tx = pos.x - Math.cos(rad) * 12;
          const ty = pos.y - Math.sin(rad) * 12;
          ctx.lineTo(tx, ty);
          ctx.stroke();

          ctx.fillStyle = "rgba(56, 189, 248, 0.7)";
          ctx.beginPath();
          ctx.arc(pos.x + Math.cos(rad) * 4, pos.y + Math.sin(rad) * 4, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      });
    }

    // Layer 11: Temperature Map Raster (id: "Temp")
    if (activeLayer === "Temp") {
      ctx.globalAlpha = 0.54; // Keep satellite terrain, coastlines and topography visible underneath
      ctx.globalCompositeOperation = "source-over";

      const mapWidth = canvas.width;
      const mapHeight = canvas.height;

      // Create an offscreen canvas for fast pixel-level meteorological interpolation
      // Using a factor of 6 produces a high-resolution, perfectly interpolated continuous raster field
      const scale = 6;
      const ow = Math.ceil(mapWidth / scale);
      const oh = Math.ceil(mapHeight / scale);

      const offscreen = document.createElement("canvas");
      offscreen.width = ow;
      offscreen.height = oh;
      const octx = offscreen.getContext("2d");

      if (octx) {
        const imgData = octx.createImageData(ow, oh);
        const data = imgData.data;

        // Cache station centroids to avoid repeatedly looking up objects in the hot pixel loop
        const cachedStations = statesData.map(state => {
          const coords = stateCentroids[state.id];
          return {
            lat: coords ? coords.lat : 21.0,
            lng: coords ? coords.lng : 79.0,
            temp: state.temp
          };
        }).filter(st => st.lat !== 21.0 || st.lng !== 79.0);

        // Render each pixel of our meteorological raster
        for (let y = 0; y < oh; y++) {
          for (let x = 0; x < ow; x++) {
            // Find map LatLng for this exact offscreen pixel
            const containerPoint = L.point(x * scale + scale / 2, y * scale + scale / 2);
            const latlng = map.containerPointToLatLng(containerPoint);
            const lat = latlng.lat;
            const lng = latlng.lng;

            // Calculate precise terrain-and-marine aware temperature
            const finalTemp = calculateMeteorologicalTemperature(lat, lng, timelineIndex, cachedStations);

            // Get professional meteorological continuous color Stop
            const col = getTemperatureColor(finalTemp);

            // Set pixel colors
            const idx = (y * ow + x) * 4;
            data[idx] = col.r;
            data[idx + 1] = col.g;
            data[idx + 2] = col.b;
            data[idx + 3] = 255; // Solid opacity in offscreen, blended on draw
          }
        }
        octx.putImageData(imgData, 0, 0);

        // Draw upscaled raster on main canvas with beautiful bilinear interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(offscreen, 0, 0, mapWidth, mapHeight);
      }

      // Draw crisp, readable professional station temperature labels
      ctx.globalAlpha = 1.0; // full opacity for labels
      statesData.forEach(state => {
        const coords = stateCentroids[state.id];
        if (coords) {
          try {
            const pos = map.latLngToContainerPoint(L.latLng(coords.lat, coords.lng));
            
            // Only draw inside viewport bounds
            if (pos.x >= 0 && pos.x <= mapWidth && pos.y >= 0 && pos.y <= mapHeight) {
              // Draw small professional weather dot
              ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
              ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
              ctx.shadowBlur = 3;
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
              ctx.fill();

              // Draw temperature value with robust dark outline for maximum legibility
              ctx.fillStyle = "#ffffff";
              ctx.font = "bold 11px monospace";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              
              // Shadow outline
              ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
              ctx.lineWidth = 2.5;
              ctx.strokeText(`${Math.round(state.temp)}°`, pos.x, pos.y - 12);
              ctx.fillText(`${Math.round(state.temp)}°`, pos.x, pos.y - 12);
              
              // Reset shadow
              ctx.shadowBlur = 0;
            }
          } catch (e) {}
        }
      });
    }

    // Layer 12: Weather Radar & Precipitation (id: "Rain")
    if (activeLayer === "Rain") {
      ctx.globalAlpha = 0.58;
      ctx.globalCompositeOperation = "screen";

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radarRadius = Math.max(canvas.width, canvas.height) * 0.8;
      const sweepAngle = (Date.now() / 2400) % (Math.PI * 2);

      ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepAngle) * radarRadius, centerY + Math.sin(sweepAngle) * radarRadius);
      ctx.stroke();

      const monsoonCells = [
        { lat: 14.0, lng: 74.0, power: 1.2, r: 180 }, 
        { lat: 21.0, lng: 86.5, power: 0.9, r: 160 }, 
        { lat: 26.0, lng: 92.5, power: 1.5, r: 210 }  
      ];

      monsoonCells.forEach((cell, i) => {
        try {
          const driftX = Math.sin(Date.now() / 6000 + i) * 15;
          const driftY = (Date.now() / 3000 + i * 50) % 40 - 20;

          const pos = map.latLngToContainerPoint(L.latLng(cell.lat, cell.lng));
          const adjustedX = pos.x + driftX;
          const adjustedY = pos.y + driftY;

          const size = cell.r * Math.pow(1.15, zoom - 5);
          const grad = ctx.createRadialGradient(adjustedX, adjustedY, 0, adjustedX, adjustedY, size);

          let colors = ["rgba(16, 185, 129, 0.45)", "rgba(16, 185, 129, 0.12)", "rgba(0, 0, 0, 0)"];
          if (cell.power > 1.3) { 
            colors = ["rgba(239, 68, 68, 0.62)", "rgba(234, 179, 8, 0.28)", "rgba(16, 185, 129, 0.08)", "rgba(0, 0, 0, 0)"];
          } else if (cell.power > 1.0) { 
            colors = ["rgba(234, 179, 8, 0.52)", "rgba(16, 185, 129, 0.22)", "rgba(0, 0, 0, 0)"];
          }

          grad.addColorStop(0, colors[0]);
          grad.addColorStop(0.3, colors[1]);
          if (colors.length === 4) {
            grad.addColorStop(0.6, colors[2]);
            grad.addColorStop(1, colors[3]);
          } else {
            grad.addColorStop(1, colors[2]);
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(adjustedX, adjustedY, size, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      });
    }

    // Layer 13: Humidity Raster (id: "Humidity")
    if (activeLayer === "Humidity") {
      ctx.globalAlpha = 0.55;
      ctx.globalCompositeOperation = "screen";

      statesData.forEach(state => {
        const coords = stateCentroids[state.id];
        if (coords) {
          try {
            const pos = map.latLngToContainerPoint(L.latLng(coords.lat, coords.lng));
            const r = 240 * Math.pow(1.16, zoom - 5);
            const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r);

            let startColor = "rgba(16, 185, 129, 0.42)"; 
            if (state.humidity > 80) { 
              startColor = "rgba(29, 78, 216, 0.48)";
            } else if (state.humidity < 40) { 
              startColor = "rgba(234, 179, 8, 0.32)";
            }

            grad.addColorStop(0, startColor);
            grad.addColorStop(0.5, "rgba(16, 185, 129, 0.08)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
            ctx.fill();
          } catch (e) {}
        }
      });
    }

    // Layer 14: Barometric Pressure Isobars (id: "Pressure")
    if (activeLayer === "Pressure") {
      ctx.globalAlpha = 0.85;
      ctx.globalCompositeOperation = "source-over";

      const centerCoords = { lat: 21.1458, lng: 79.0882 };
      try {
        const pos = map.latLngToContainerPoint(L.latLng(centerCoords.lat, centerCoords.lng));
        const radii = [120, 240, 360, 480, 600];
        const pressureVals = ["1004 hPa", "1006 hPa", "1008 hPa", "1010 hPa", "1012 hPa"];

        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.lineWidth = 1.0;
        ctx.setLineDash([6, 5]);

        radii.forEach((r, idx) => {
          const scaledR = r * Math.pow(1.1, zoom - 5);
          
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, scaledR, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
          ctx.font = "8px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          const textAngle = -Math.PI / 4 + idx * 0.15; 
          const lx = pos.x + Math.cos(textAngle) * scaledR;
          const ly = pos.y + Math.sin(textAngle) * scaledR;

          ctx.fillText(pressureVals[idx], lx, ly);
        });

        ctx.setLineDash([]); 

        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("L", pos.x, pos.y - 5);
        ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
        ctx.font = "bold 8px monospace";
        ctx.fillText("1002 hPa", pos.x, pos.y + 12);

      } catch (e) {}
    }

    // Layer 15: Satellite Cloud Cover (id: "Clouds")
    if (activeLayer === "Clouds") {
      ctx.globalAlpha = 0.52;
      ctx.globalCompositeOperation = "source-over";

      const time = Date.now() / 12000;
      const clouds = [
        { lat: 10, lng: 70, size: 280, power: 0.8 },
        { lat: 16, lng: 75, size: 380, power: 1.1 },
        { lat: 22, lng: 82, size: 420, power: 0.9 },
        { lat: 26, lng: 88, size: 300, power: 1.2 },
        { lat: 14, lng: 85, size: 320, power: 0.7 }
      ];

      clouds.forEach((cloud, i) => {
        try {
          const speedFactor = 0.15;
          const driftLat = (time * speedFactor + i * 2) % 35;
          const driftLng = (time * speedFactor * 1.5 + i * 3) % 35;
          
          const adjustedLat = 6 + driftLat;
          const adjustedLng = 65 + driftLng;

          const pos = map.latLngToContainerPoint(L.latLng(adjustedLat, adjustedLng));
          const size = cloud.size * Math.pow(1.15, zoom - 5);

          const grad = ctx.createRadialGradient(pos.x, pos.y, size * 0.1, pos.x, pos.y, size);
          grad.addColorStop(0, "rgba(255, 255, 255, 0.55)"); 
          grad.addColorStop(0.4, "rgba(241, 245, 249, 0.35)"); 
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      });
    }

    // Layer 16: Air Mass Trajectory (id: "AirMass")
    if (activeLayer === "AirMass") {
      ctx.globalAlpha = 0.90;
      ctx.globalCompositeOperation = "source-over";

      const hubs = [
        { name: "Mumbai Inlet", start: { lat: 8, lng: 60 }, control: { lat: 13, lng: 66 }, end: { lat: 19.07, lng: 72.87 } },
        { name: "Ganges Valley Pathway", start: { lat: 21, lng: 88 }, control: { lat: 24, lng: 84 }, end: { lat: 28.6, lng: 77.2 } },
        { name: "Bengal Monsoon Hub", start: { lat: 6, lng: 82 }, control: { lat: 14, lng: 86 }, end: { lat: 22.5, lng: 88.3 } }
      ];

      hubs.forEach((hub, idx) => {
        try {
          const p1 = map.latLngToContainerPoint(L.latLng(hub.start.lat, hub.start.lng));
          const cp = map.latLngToContainerPoint(L.latLng(hub.control.lat, hub.control.lng));
          const p2 = map.latLngToContainerPoint(L.latLng(hub.end.lat, hub.end.lng));

          ctx.strokeStyle = idx % 2 === 0 ? "rgba(16, 185, 129, 0.45)" : "rgba(6, 182, 212, 0.45)";
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(cp.x, cp.y, p2.x, p2.y);
          ctx.stroke();
          ctx.setLineDash([]); 

          const t = (Date.now() / 3200 + idx * 0.3) % 1.0;
          const ax = (1-t)*(1-t)*p1.x + 2*(1-t)*t*cp.x + t*t*p2.x;
          const ay = (1-t)*(1-t)*p1.y + 2*(1-t)*t*cp.y + t*t*p2.y;

          ctx.fillStyle = idx % 2 === 0 ? "#10b981" : "#06b6d4";
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; 
        } catch (e) {}
      });
    }

    // Layer 17: Timeline Forecast Predictions (id: "Forecast")
    if (activeLayer === "Forecast") {
      ctx.globalAlpha = 0.45;
      ctx.globalCompositeOperation = "screen";

      const sources = [
        { lat: 28.6, lng: 77.2, baseRadius: 110, name: "NCR Expansion" }, 
        { lat: 22.5, lng: 88.3, baseRadius: 100, name: "Kolkata Expansion" }, 
        { lat: 19.0, lng: 72.8, baseRadius: 90, name: "Mumbai Expansion" } 
      ];

      sources.forEach(src => {
        try {
          const pos = map.latLngToContainerPoint(L.latLng(src.lat, src.lng));
          
          const dispersionSpreadFactor = 1.0 + timelineIndex * 0.45;
          const radius = src.baseRadius * dispersionSpreadFactor * Math.pow(1.15, zoom - 5);

          const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
          grad.addColorStop(0, "rgba(147, 51, 234, 0.45)"); 
          grad.addColorStop(0.4, "rgba(239, 68, 68, 0.18)"); 
          grad.addColorStop(0.8, "rgba(249, 115, 22, 0.05)"); 
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "rgba(168, 85, 247, 0.65)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          const arrowX = pos.x + Math.cos(-Math.PI / 4) * (radius * 0.7);
          const arrowY = pos.y + Math.sin(-Math.PI / 4) * (radius * 0.7);
          ctx.lineTo(arrowX, arrowY);
          ctx.stroke();

          ctx.fillStyle = "rgba(168, 85, 247, 0.8)";
          ctx.beginPath();
          ctx.arc(arrowX, arrowY, 3, 0, Math.PI * 2);
          ctx.fill();

        } catch (e) {}
      });
    }

    // DRAW MEASURE DISTANCE OVERLAY
    if (isMeasuring && measurePoints.length > 0) {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";

      const projPts = measurePoints.map(pt => {
        try {
          return map.latLngToContainerPoint(L.latLng(pt.lat, pt.lng));
        } catch (e) {
          return null;
        }
      }).filter(p => p !== null) as L.Point[];

      if (projPts.length === 2) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(projPts[0].x, projPts[0].y);
        ctx.lineTo(projPts[1].x, projPts[1].y);
        ctx.stroke();
        ctx.setLineDash([]); 

        const midX = (projPts[0].x + projPts[1].x) / 2;
        const midY = (projPts[0].y + projPts[1].y) / 2;
        const dist = calculateGeodesicDistance();

        ctx.fillStyle = "#040D1A";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1;

        const label = `${dist} km`;
        ctx.font = "bold 10px monospace";
        const width = ctx.measureText(label).width + 12;

        ctx.beginPath();
        ctx.roundRect(midX - width / 2, midY - 9, width, 18, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, midX, midY);
      }

      projPts.forEach((pos, idx) => {
        const pulse = 1 + 0.2 * Math.sin(Date.now() / 180 + idx);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6.5 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };

  // Distance calculation (Haversine Formula)
  const calculateGeodesicDistance = () => {
    if (measurePoints.length !== 2) return "0";
    const [p1, p2] = measurePoints;
    const R = 6371; // Earth Radius in km
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Wind Particle flow tick loop
  useEffect(() => {
    let frameId: number;

    const tick = () => {
      if (activeLayer === "Wind") {
        windParticles.current.forEach(p => {
          const latDelta = p.speed * 0.00008;
          const rad = (p.angle * Math.PI) / 180;

          p.lat += Math.sin(rad) * latDelta;
          p.lng += Math.cos(rad) * latDelta;

          // Wrap out of bounds back to India coordinate box
          if (p.lat < 6 || p.lat > 37 || p.lng < 67 || p.lng > 98) {
            p.lat = 7 + Math.random() * 29;
            p.lng = 68 + Math.random() * 29;
            p.speed = 8 + Math.random() * 15;
            p.angle = 190 + Math.random() * 80;
          }
        });
      }

      drawCanvasOverlay();
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [activeLayer, statesData, fireEvents, isMeasuring, measurePoints]);

  // Map initialization & mounting
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Instantiate native Leaflet Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    });

    // Fit India boundaries perfectly so it occupies approximately 70-80% of the screen
    const indiaBounds = L.latLngBounds(
      [6.5, 67.5], // Southwest (Sri Lanka / Southern Ocean)
      [36.0, 97.5] // Northeast (Himalayas / Arunachal Pradesh)
    );
    map.fitBounds(indiaBounds, { padding: [10, 10] });

    mapRef.current = map;

    // 1. Satellite Base Layer (Esri World Imagery Tiles - Free & Public)
    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 18,
        minZoom: 4,
        className: "satellite-tiles"
      }
    );
    satelliteLayer.addTo(map);

    // 2. High-Contrast Reference Cities & Places Labels (Esri Places Layer)
    const labelLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 18,
        minZoom: 4,
        opacity: 0.95, // High opacity so country borders and labels are perfectly crisp and readable
        className: "label-tiles"
      }
    );
    labelLayer.addTo(map);

    // Dynamic sizing of overlay canvas
    const fitCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas && mapContainerRef.current) {
        canvas.width = mapContainerRef.current.clientWidth;
        canvas.height = mapContainerRef.current.clientHeight;
        drawCanvasOverlay();
      }
    };

    // Keep Canvas overlay synchronized during pans, zooms, and resizes
    map.on("move", drawCanvasOverlay);
    map.on("zoom", drawCanvasOverlay);
    map.on("viewreset", drawCanvasOverlay);

    // Track mouse position coordinate readout
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      setMouseCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
    });

    // Custom measure click tracking
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (!isMeasuring) return;
      setMeasurePoints(prev => {
        if (prev.length >= 2) {
          return [{ lat: e.latlng.lat, lng: e.latlng.lng }];
        }
        return [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }];
      });
    });

    const observer = new ResizeObserver(() => fitCanvas());
    observer.observe(mapContainerRef.current);

    fitCanvas();

    return () => {
      map.remove();
      mapRef.current = null;
      observer.disconnect();
    };
  }, [isMeasuring]);

  // Sync GeoJSON boundaries with state details & highlights
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    if (!geoJsonData || !showBoundaries) return;

    // Render thin elegant white/cyan borders for state lines
    const boundaries = L.geoJSON(geoJsonData, {
      style: (feature) => {
        const stateName = feature?.properties?.NAME_1 || feature?.properties?.ST_NM || "";
        const stateCode = normalizeStateName(stateName);
        const isSelected = selectedState && selectedState.id === stateCode;

        return {
          color: isSelected ? "#FF6B00" : "rgba(255, 255, 255, 0.65)",
          weight: isSelected ? 2.5 : 0.7,
          fillColor: isSelected ? "rgba(255, 107, 0, 0.06)" : "rgba(0, 0, 0, 0)",
          fillOpacity: isSelected ? 0.06 : 0
        };
      },
      onEachFeature: (feature, layer) => {
        const stateName = feature?.properties?.NAME_1 || feature?.properties?.ST_NM || "";
        const stateCode = normalizeStateName(stateName);
        const stateMeta = statesData.find(s => s.id === stateCode);

        layer.on({
          mouseover: (e) => {
            if (stateMeta) setHoveredState(stateMeta);
            const path = e.target;
            path.setStyle({
              color: selectedState?.id === stateCode ? "#FF6B00" : "rgba(255, 255, 255, 0.95)",
              weight: selectedState?.id === stateCode ? 2.5 : 1.2,
              fillColor: selectedState?.id === stateCode ? "rgba(255, 107, 0, 0.08)" : "rgba(255, 255, 255, 0.04)",
              fillOpacity: 0.04
            });
          },
          mouseout: (e) => {
            setHoveredState(null);
            const path = e.target;
            const isSelected = selectedState && selectedState.id === stateCode;
            path.setStyle({
              color: isSelected ? "#FF6B00" : "rgba(255, 255, 255, 0.65)",
              weight: isSelected ? 2.5 : 0.7,
              fillColor: isSelected ? "rgba(255, 107, 0, 0.06)" : "rgba(0, 0, 0, 0)",
              fillOpacity: isSelected ? 0.06 : 0
            });
          },
          click: () => {
            if (stateMeta) {
              onSelectState(stateMeta);
            }
          }
        });
      }
    });

    boundaries.addTo(map);
    geoJsonLayerRef.current = boundaries;

  }, [geoJsonData, showBoundaries, selectedState, statesData]);

  // Center flyTo map if external props state is selected
  useEffect(() => {
    if (selectedState && mapRef.current) {
      const coords = stateCentroids[selectedState.id];
      if (coords) {
        mapRef.current.flyTo([coords.lat, coords.lng], 6, {
          animate: true,
          duration: 1.5
        });
      }
    }
  }, [selectedState]);

  // Map search flyTo coordinator
  const handleLocationSearch = (coords: { lat: number; lng: number }, type: string, stateId?: string) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([coords.lat, coords.lng], type === "state" ? 6 : 9, {
      animate: true,
      duration: 1.8
    });
    setSearchQuery("");
    setSearchFocused(false);

    if (stateId) {
      const match = statesData.find(s => s.id === stateId);
      if (match) onSelectState(match);
    }
  };

  const searchableLocations = [
    ...statesData.map(s => ({ name: s.name, type: "state", id: s.id, coords: stateCentroids[s.id] })),
    ...Object.entries(cityCoordinates).map(([name, coords]) => {
      // Find parent state id
      const parentState = statesData.find(s => s.cities?.some(c => c.name === name));
      return { name, type: "city", id: parentState?.id, coords };
    })
  ].filter(item => item.coords);

  const filteredLocations = searchableLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  // Map action triggers
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleRecenter = () => {
    if (mapRef.current) {
      const indiaBounds = L.latLngBounds([6.5, 67.5], [36.0, 97.5]);
      mapRef.current.flyToBounds(indiaBounds, { padding: [10, 10], duration: 1.5 });
    }
  };
  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 10);
        },
        err => console.warn("Geolocation denied", err)
      );
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error("Fullscreen err", err));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const layersList = [
    { id: "Sat", name: "Satellite Map", icon: Globe, color: "text-emerald-500" },
    { id: "AQI", name: "AQI Heatmap", icon: Gauge, color: "text-orange-400" },
    { id: "PM2.5", name: "PM2.5 concentration", icon: Activity, color: "text-rose-400" },
    { id: "NO2", name: "NO₂ Column Density", icon: Sparkles, color: "text-cyan-400" },
    { id: "SO2", name: "SO₂ Plume Map", icon: Sparkles, color: "text-yellow-400" },
    { id: "CO", name: "CO Concentration", icon: Sparkles, color: "text-red-400" },
    { id: "O3", name: "O₃ Ozone Layer", icon: Sparkles, color: "text-violet-400" },
    { id: "HCHO", name: "HCHO Formaldehyde", icon: Sparkles, color: "text-pink-400" },
    { id: "Fires", name: "Thermal Fires (FIRMS)", icon: Flame, color: "text-amber-500 animate-pulse" },
    { id: "Wind", name: "Wind Flow Particles", icon: Wind, color: "text-sky-400" },
    { id: "Temp", name: "Temperature Raster", icon: Thermometer, color: "text-orange-500" },
    { id: "Rain", name: "Precipitation Radar", icon: CloudRain, color: "text-blue-400" },
    { id: "Humidity", name: "Humidity Index", icon: Droplets, color: "text-teal-400" },
    { id: "Pressure", name: "Pressure Isobars", icon: Compass, color: "text-indigo-400" },
    { id: "Clouds", name: "Satellite Clouds", icon: Cloud, color: "text-slate-300 animate-pulse" },
    { id: "AirMass", name: "Air Mass Trajectory", icon: Compass, color: "text-emerald-400" },
    { id: "Forecast", name: "Timeline Forecast", icon: Clock, color: "text-purple-400" }
  ];

  return (
    <div className="relative w-full h-full text-white font-sans overflow-hidden bg-[#030914] flex flex-col">
      {/* 1. NATIVE GIS ENGINE CANVAS WRAPPER */}
      <div 
        ref={mapContainerRef} 
        className={`w-full h-full relative transition-all duration-75 ${
          dayMode ? "gis-day-mode" : "gis-ir-cyber-mode"
        }`}
        style={{
          transform: is3D ? "perspective(1000px) rotateX(25deg) rotateY(-1.5deg)" : "none",
          transformOrigin: "center bottom",
          transition: "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Dynamic High-Performance Custom Heatmap Overlay */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 pointer-events-none z-[450] w-full h-full"
        />
      </div>

      {/* CSS Filter injection to enhance Esri Satellite imagery to bright realistic daytime styles */}
      <style>{`
        /* Target ONLY satellite tiles to preserve crisp/readable labels & borders */
        .gis-day-mode .satellite-tiles {
          filter: brightness(1.20) contrast(1.15) saturate(1.05) !important;
        }
        .gis-ir-cyber-mode .satellite-tiles {
          filter: brightness(1.10) contrast(1.08) saturate(1.02) !important;
        }
        .label-tiles {
          filter: none !important;
        }
        .leaflet-container {
          background: #0a2540 !important; /* Deep sea-blue base background underneath tiles */
        }
      `}</style>

      {/* 2. FLOATING HUD: TOP SEARCH PANEL */}
      <div className="absolute top-4 left-4 z-[500] w-72">
        <div className="bg-[#040D1A]/90 border border-slate-800/80 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800/50">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Indian City or State..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="bg-transparent text-xs text-white placeholder-slate-500 border-none outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-[10px] text-slate-500 hover:text-white">
                Clear
              </button>
            )}
          </div>

          {searchFocused && (searchQuery || filteredLocations.length > 0) && (
            <div className="max-h-56 overflow-y-auto bg-[#040D1A]/95 p-1 flex flex-col gap-0.5 border-t border-slate-800/50">
              {filteredLocations.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLocationSearch(item.coords, item.type, item.type === "state" ? item.id : undefined)}
                  className="w-full text-left px-3 py-2 text-[11px] text-slate-300 hover:bg-slate-800/60 rounded-lg flex items-center justify-between transition-colors"
                >
                  <span className="font-medium text-white">{item.name}</span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded">
                    {item.type}
                  </span>
                </button>
              ))}
              {filteredLocations.length === 0 && (
                <div className="text-center py-4 text-[10px] text-slate-500">
                  No spatial points found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. FLOATING HUD: LEFT NAVIGATION TOOLBAR */}
      <div className="absolute top-4 right-4 md:right-auto md:left-4 md:top-20 z-[500] flex flex-col gap-2">
        <div className="bg-[#040D1A]/90 border border-slate-800/80 rounded-xl p-1.5 shadow-2xl backdrop-blur-md flex flex-row md:flex-col gap-1.5">
          <button 
            onClick={handleRecenter}
            className="p-2 hover:bg-slate-800/60 rounded-lg text-slate-300 hover:text-white transition-all duration-200"
            title="Recenter Map North (India)"
          >
            <Compass className="w-4 h-4 text-sky-blue" />
          </button>
          
          <button 
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-800/60 rounded-lg text-slate-300 hover:text-white transition-all duration-200"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-800/60 rounded-lg text-slate-300 hover:text-white transition-all duration-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="w-px md:w-full h-auto md:h-px bg-slate-800/50" />

          <button 
            onClick={handleLocateUser}
            className="p-2 hover:bg-slate-800/60 rounded-lg text-slate-300 hover:text-sky-400 transition-all duration-200"
            title="Locate Me"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
          </button>

          <button 
            onClick={() => {
              setIsMeasuring(!isMeasuring);
              setMeasurePoints([]);
            }}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isMeasuring 
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/40" 
                : "hover:bg-slate-800/60 text-slate-300 hover:text-white"
            }`}
            title="Measure Geodesic Distance (Click 2 locations)"
          >
            <Ruler className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setShowBoundaries(!showBoundaries)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              showBoundaries 
                ? "text-sky-400" 
                : "text-slate-500 hover:text-white"
            }`}
            title="Toggle State Boundaries"
          >
            {showBoundaries ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setDayMode(!dayMode)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              dayMode ? "text-emerald-400" : "text-sky-400"
            }`}
            title="Toggle Realistic Sat / Soft Terrain Map Styles"
          >
            <span className="text-[10px] font-mono font-bold">{dayMode ? "SAT" : "SOFT"}</span>
          </button>

          <button 
            onClick={() => setIs3D(!is3D)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              is3D 
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/40" 
                : "hover:bg-slate-800/60 text-slate-300 hover:text-white"
            }`}
            title="Toggle 3D Flight Tilt"
          >
            <span className="text-[10px] font-mono font-bold">3D</span>
          </button>

          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-slate-800/60 rounded-lg text-slate-300 hover:text-white transition-all duration-200"
            title="Fullscreen Map"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. FLOATING HUD: RIGHT SATELLITE SENSOR / LAYER CONTROLS */}
      <div className="absolute top-20 right-4 z-[500] w-64 max-h-[82%] overflow-y-auto hidden md:block">
        <div className="bg-[#040D1A]/90 border border-slate-800/80 rounded-xl p-4 shadow-2xl backdrop-blur-md space-y-3.5">
          <div className="flex items-center gap-1.5 border-b border-slate-800/50 pb-2">
            <Layers className="w-4 h-4 text-sky-blue" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Atmospheric Sensors</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {layersList.map((layer) => {
              const Icon = layer.icon;
              const isSelected = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => {
                    setActiveLayer(layer.id);
                    if (layer.id === "Wind") {
                      // refresh wind particle coordinates
                      windParticles.current.forEach(p => {
                        p.lat = 8 + Math.random() * 30;
                        p.lng = 68 + Math.random() * 30;
                      });
                    }
                  }}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 text-[11px] rounded-lg border transition-all duration-200 ${
                    isSelected
                      ? "bg-slate-900 border-sky-500/40 text-white shadow-lg shadow-sky-500/5"
                      : "bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${layer.color}`} />
                    <span className="font-medium">{layer.name}</span>
                  </div>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. FLOATING HUD: STATE DETAIL PREVIEW ON HOVER */}
      {hoveredState && (
        <div className="absolute bottom-16 left-4 z-[500] w-72 bg-[#040D1A]/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-lg animate-fade-in pointer-events-none">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-display font-extrabold text-white">{hoveredState.name}</h4>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              hoveredState.aqi > 300 
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                : hoveredState.aqi > 200 
                ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}>
              AQI: {hoveredState.aqi}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-800/50 pt-2.5">
            <div>
              <span className="text-slate-500 block">PM2.5 Column:</span>
              <span className="text-slate-200">{hoveredState.pm25} µg/m³</span>
            </div>
            <div>
              <span className="text-slate-500 block">NO₂ Troposphere:</span>
              <span className="text-slate-200">{hoveredState.no2} ppb</span>
            </div>
            <div>
              <span className="text-slate-500 block">SO₂ Index:</span>
              <span className="text-slate-200">{hoveredState.so2} ppb</span>
            </div>
            <div>
              <span className="text-slate-500 block">Temperature:</span>
              <span className="text-slate-200">{hoveredState.temp}°C</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 italic mt-2 leading-normal border-t border-slate-800/30 pt-2">
            Click state boundary to lock details telemetry
          </p>
        </div>
      )}

      {/* 8. HIGH-PERFORMANCE METEOROLOGICAL GIS LEGEND & TIMELINE HUD (Bottom Center) */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[500] w-full max-w-xl px-4 pointer-events-auto">
        <div className="bg-[#040D1A]/95 border border-slate-800/90 rounded-2xl p-4 shadow-2xl backdrop-blur-md space-y-3 text-xs">
          
          {/* Legend Title & active details */}
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
              <span className="font-mono font-bold text-white uppercase tracking-wider">
                {layersList.find(l => l.id === activeLayer)?.name || "GIS Layer"}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Status: <span className="text-emerald-400 font-bold">ONLINE</span>
            </span>
          </div>

          {/* Render layer-specific legend palettes */}
          {activeLayer === "Sat" && (
            <div className="text-slate-300 text-[11px] leading-relaxed">
              🌍 <strong className="text-white">Natural RGB Orthorectified Composite</strong>.
              Showing active geopolitical boundaries, high-resolution national terrain grids, arterial roadways, labels, and major municipalities. No filtering active.
            </div>
          )}

          {activeLayer === "AQI" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Good (0-50)</span>
                <span>Moderate (51-100)</span>
                <span>Poor (101-200)</span>
                <span>Severe (201-300)</span>
                <span>Hazardous (300+)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-500 via-rose-500 to-purple-600 border border-slate-900" />
            </div>
          )}

          {activeLayer === "PM2.5" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0-10 µg/m³</span>
                <span>10-25</span>
                <span>25-50</span>
                <span>50-100</span>
                <span>100+ µg/m³</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 via-orange-400 via-rose-500 to-purple-500 border border-slate-900" />
            </div>
          )}

          {activeLayer === "NO2" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.0 DU (Clean)</span>
                <span>0.15</span>
                <span>0.30</span>
                <span>0.45</span>
                <span>0.60+ DU (Industrial)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 via-yellow-400 via-orange-400 to-red-500 border border-slate-900" />
              <p className="text-[10px] text-amber-400 italic font-mono leading-tight">
                ⚠️ Traffic corridors and dense industrial petrochemical hubs highlighted in yellow/red.
              </p>
            </div>
          )}

          {activeLayer === "SO2" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Low Plume</span>
                <span>Refineries</span>
                <span>Coal Power plants</span>
                <span>Volcanic plumes</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-yellow-500/20 via-yellow-400 via-orange-500 to-rose-600 border border-slate-900" />
              <p className="text-[10px] text-slate-300 font-mono">
                ▲ Markers represent super-critical thermal coal sites and active tectonic volcano cones.
              </p>
            </div>
          )}

          {activeLayer === "CO" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.05 ppm</span>
                <span>0.25</span>
                <span>0.50</span>
                <span>1.00</span>
                <span>2.00+ ppm</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-500/10 via-orange-400/40 via-red-500 to-red-700 border border-slate-900" />
            </div>
          )}

          {activeLayer === "O3" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>180 DU (Thin)</span>
                <span>240</span>
                <span>300 (Average)</span>
                <span>360</span>
                <span>420+ DU (Thick)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 via-emerald-400 via-yellow-400 to-orange-500 border border-slate-900" />
            </div>
          )}

          {activeLayer === "HCHO" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Baseline</span>
                <span>Mild Canopy</span>
                <span>Agricultural Burning</span>
                <span>Active Crop Fires</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-pink-500/10 via-pink-400 via-orange-400 to-yellow-400 border border-slate-900" />
            </div>
          )}

          {activeLayer === "Fires" && (
            <div className="space-y-2 font-mono">
              <div className="flex items-center gap-2 text-amber-500 text-[11px] font-bold">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                <span>NASA FIRMS - VIIRS/MODIS Thermal Hotspots</span>
              </div>
              <p className="text-[10px] text-slate-300">
                Active thermal anomalies are displayed as flickering fire markers. Select an active hotspot below to drill into the live fire telemetry.
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-slate-800/40">
                <div>
                  <label className="text-slate-500 block">Select hotspot:</label>
                  <select 
                    className="bg-slate-950 border border-slate-800 text-slate-200 p-1 rounded w-full outline-none text-[10px]"
                    onChange={(e) => {
                      const fire = fireEvents.find(f => f.id === e.target.value);
                      if (fire) {
                        setSelectedFire(fire);
                        mapRef.current?.flyTo([fire.lat, fire.lng], 8);
                      }
                    }}
                    value={selectedFire?.id || ""}
                  >
                    <option value="">-- Choose Active Fire --</option>
                    {fireEvents.map(f => (
                      <option key={f.id} value={f.id}>{f.district}, {f.state} ({f.sensor})</option>
                    ))}
                  </select>
                </div>
                {selectedFire ? (
                  <div className="bg-orange-950/20 border border-orange-500/20 p-2 rounded text-[9px] text-orange-300">
                    <div><strong>FRP:</strong> {selectedFire.frp} MW</div>
                    <div><strong>Area:</strong> {selectedFire.burnArea} ha</div>
                    <div><strong>Confidence:</strong> {selectedFire.confidence}%</div>
                    <div><strong>Sensor:</strong> {selectedFire.sensor}</div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center border border-dashed border-slate-800 text-slate-500 italic p-2 rounded text-[9px]">
                    No fire selected
                  </div>
                )}
              </div>
            </div>
          )}

          {activeLayer === "Wind" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 km/h (Calm)</span>
                <span>15 km/h</span>
                <span>30 km/h</span>
                <span>45 km/h</span>
                <span>60+ km/h (Gale)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-sky-950 via-sky-600 via-cyan-400 via-teal-300 to-white border border-slate-900" />
              <p className="text-[10px] text-slate-400 italic">
                💨 Streamlines represent air current vectors. Flow speed correlates to local barometric pressure variance.
              </p>
            </div>
          )}

          {activeLayer === "Temp" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-10°C</span>
                <span>10°C</span>
                <span>25°C</span>
                <span>35°C</span>
                <span>45°C+</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-500 via-green-400 via-yellow-400 via-orange-500 to-purple-600 border border-slate-900" />
            </div>
          )}

          {activeLayer === "Rain" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.1 mm/h (Drizzle)</span>
                <span>2.0 mm/h</span>
                <span>10.0 mm/h</span>
                <span>30.0 mm/h+ (Storm)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 via-orange-500 to-rose-600 border border-slate-900" />
            </div>
          )}

          {activeLayer === "Humidity" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Dry (0%)</span>
                <span>30%</span>
                <span>60%</span>
                <span>80%</span>
                <span>Saturated (100%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-yellow-600 via-emerald-400 via-blue-500 to-blue-800 border border-slate-900" />
            </div>
          )}

          {activeLayer === "Pressure" && (
            <div className="space-y-2 text-[11px] text-slate-300 font-mono">
              <div className="flex justify-between">
                <span>L (Low: 996 hPa)</span>
                <span>1004 hPa</span>
                <span>1012 hPa</span>
                <span>H (High: 1020 hPa)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-rose-500 via-slate-600 via-slate-400 to-blue-500 border border-slate-900" />
            </div>
          )}

          {activeLayer === "Clouds" && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% Cover</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100% (Overcast)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-slate-950 via-slate-700 via-slate-400 to-white border border-slate-900" />
            </div>
          )}

          {activeLayer === "AirMass" && (
            <div className="space-y-2 leading-relaxed">
              <div className="flex items-center gap-2 text-emerald-400 font-mono">
                <Compass className="w-4 h-4" />
                <span>Kinetic Air Parcel Trajectories</span>
              </div>
              <p className="text-[10px] text-slate-300">
                Showing the three-dimensional forward and backward transport pathways of air parcels over 72 hours, computed using HYSPLIT models.
              </p>
            </div>
          )}

          {activeLayer === "Forecast" && (
            <div className="space-y-2 leading-relaxed">
              <div className="flex items-center gap-2 text-purple-400 font-mono">
                <Clock className="w-4 h-4" />
                <span>AI Predictive Pollution Transport Model</span>
              </div>
              <p className="text-[10px] text-slate-300">
                Contaminant plume expansion predictions computed via weather forecast feedback grids. Use the play bar below to advance predictions.
              </p>
            </div>
          )}

          {/* Timeline slider for layers that support time steps */}
          {["PM2.5", "Rain", "Clouds", "Forecast"].includes(activeLayer) && (
            <div className="border-t border-slate-800/60 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[10px]">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setTimelineIsPlaying(!timelineIsPlaying)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 text-sky-400 font-bold transition"
                >
                  {timelineIsPlaying ? "⏸ PAUSE" : "▶ PLAY"}
                </button>
                <span className="text-slate-400">Time:</span>
                <span className="text-white font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                  {["+0h (Current)", "+24h (Tomorrow)", "+48h (Day 2)", "+72h (Day 3)"][timelineIndex]}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                {[0, 1, 2, 3].map(step => (
                  <button
                    key={step}
                    onClick={() => {
                      setTimelineIndex(step);
                      setTimelineIsPlaying(false);
                    }}
                    className={`flex-1 sm:flex-initial px-2 py-0.5 rounded border text-center transition-all ${
                      timelineIndex === step 
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold" 
                        : "bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {["Now", "+24h", "+48h", "+72h"][step]}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 6. COORD TRACKER STATUS BAR (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-[500] pointer-events-auto flex items-center gap-4 bg-[#040D1A]/90 border border-slate-800/80 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-300">
          <Compass className="w-3.5 h-3.5 text-sky-blue animate-spin-slow" />
          <span>LAT: <strong className="text-white">{mouseCoords.lat.toFixed(4)}° N</strong></span>
          <span className="text-slate-600">|</span>
          <span>LON: <strong className="text-white">{mouseCoords.lon.toFixed(4)}° E</strong></span>
        </div>

        {isMeasuring && (
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-sky-400 animate-pulse border-l border-slate-800/80 pl-4">
            <Ruler className="w-3 h-3 text-sky-400" />
            <span>MEASURE ACTIVE: <strong className="text-white">{calculateGeodesicDistance()} km</strong></span>
          </div>
        )}
      </div>

      {/* 7. QUICK MOBILE SENSOR TABS SWITCHER (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-[500] md:hidden">
        <div className="bg-[#040D1A]/90 border border-slate-800/80 rounded-xl p-1.5 flex gap-1 shadow-2xl backdrop-blur-md">
          {layersList.slice(0, 4).map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded transition-all ${
                activeLayer === layer.id 
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {layer.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
