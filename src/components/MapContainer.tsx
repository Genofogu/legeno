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
  RotateCcw
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

    // DRAW DYNAMIC HEATMAP METRICS (AQI, PM2.5, NO2, SO2, CO, O3, HCHO, Temp, Rain, Humidity)
    const interpolationLayers = ["AQI", "PM2.5", "NO2", "SO2", "CO", "O3", "HCHO", "Temp", "Rain", "Humidity"];
    if (interpolationLayers.includes(activeLayer)) {
      ctx.globalAlpha = 0.42; // Soft 40-45% opacity for transparent, natural blend overlay (allows terrain visibility underneath)
      ctx.globalCompositeOperation = "screen"; // natural overlay screen blending

      const points: { lat: number; lng: number; val: number }[] = [];

      // Collect states' centroids data
      statesData.forEach(state => {
        const coords = stateCentroids[state.id];
        if (coords) {
          let val = state.aqi;
          if (activeLayer === "PM2.5") val = state.pm25;
          else if (activeLayer === "NO2") val = state.no2;
          else if (activeLayer === "SO2") val = state.so2;
          else if (activeLayer === "CO") val = state.co * 100; // scale up
          else if (activeLayer === "O3") val = state.o3;
          else if (activeLayer === "HCHO") val = state.hcho * 100;
          else if (activeLayer === "Temp") val = state.temp;
          else if (activeLayer === "Rain") val = state.rainfall * 10;
          else if (activeLayer === "Humidity") val = state.humidity;

          points.push({ lat: coords.lat, lng: coords.lng, val });
        }

        // Add corresponding cities data points for higher fidelity local spatial density
        if (state.cities) {
          state.cities.forEach(city => {
            const coords = cityCoordinates[city.name];
            if (coords) {
              let val = city.aqi;
              if (activeLayer === "PM2.5") val = city.pm25;
              else if (activeLayer === "NO2") val = city.no2;
              else if (activeLayer === "SO2") val = city.so2;
              else if (activeLayer === "CO") val = city.co * 100;
              else if (activeLayer === "HCHO") val = city.hcho * 100;

              points.push({ lat: coords.lat, lng: coords.lng, val });
            }
          });
        }
      });

      // Render custom interpolations as overlapping radial gradients
      points.forEach(pt => {
        try {
          const pos = map.latLngToContainerPoint(L.latLng(pt.lat, pt.lng));
          const zoom = map.getZoom();
          
          // Localized hotspots: scale radius by pollution intensity so clean zones are tiny/invisible, 
          // and only major polluted zones (like Delhi, Punjab, Mumbai, Kolkata) get a beautiful soft glow
          let baseRadius = 190; // Reduced base blur radius by about 30% for cleaner local spots (Windy/NASA observatory look)
          let scaleFactor = 1.0;

          if (activeLayer === "AQI" || activeLayer === "PM2.5") {
            if (pt.val > 250) {
              scaleFactor = 1.0; // High pollution (Delhi NCR, Punjab, Haryana, Western UP, etc.)
            } else if (pt.val > 150) {
              scaleFactor = 0.72; // Moderate pollution (Kolkata, Mumbai, Ahmedabad)
            } else if (pt.val > 100) {
              scaleFactor = 0.52; // Mild pollution (Hyderabad)
            } else {
              scaleFactor = 0.18; // Clean regions (Sikkim, Kerala) - shrunk massively to stay highly localized and subtle
            }
          } else {
            scaleFactor = Math.min(1.0, Math.max(0.25, pt.val / 150));
          }

          const radius = baseRadius * scaleFactor * Math.pow(1.22, zoom - 5);

          const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);

          let colors: string[] = [];

          if (activeLayer === "AQI" || activeLayer === "PM2.5") {
            if (pt.val > 300) {
              colors = ["rgba(244, 63, 94, 0.45)", "rgba(244, 63, 94, 0.18)", "rgba(249, 115, 22, 0.04)", "rgba(0, 0, 0, 0)"];
            } else if (pt.val > 200) {
              colors = ["rgba(249, 115, 22, 0.40)", "rgba(245, 158, 11, 0.15)", "rgba(16, 185, 129, 0.03)", "rgba(0, 0, 0, 0)"];
            } else if (pt.val > 100) {
              colors = ["rgba(245, 158, 11, 0.35)", "rgba(16, 185, 129, 0.06)", "rgba(0, 0, 0, 0)"];
            } else {
              colors = ["rgba(16, 185, 129, 0.15)", "rgba(16, 185, 129, 0.02)", "rgba(0, 0, 0, 0)"];
            }
          } else if (activeLayer === "NO2") {
            colors = ["rgba(6, 182, 212, 0.40)", "rgba(6, 182, 212, 0.10)", "rgba(0, 0, 0, 0)"];
          } else if (activeLayer === "SO2") {
            colors = ["rgba(234, 179, 8, 0.40)", "rgba(234, 179, 8, 0.10)", "rgba(0, 0, 0, 0)"];
          } else if (activeLayer === "CO") {
            colors = ["rgba(239, 68, 68, 0.40)", "rgba(249, 115, 22, 0.10)", "rgba(0, 0, 0, 0)"];
          } else if (activeLayer === "O3") {
            colors = ["rgba(147, 51, 234, 0.40)", "rgba(236, 72, 153, 0.10)", "rgba(0, 0, 0, 0)"];
          } else if (activeLayer === "HCHO") {
            colors = ["rgba(236, 72, 153, 0.40)", "rgba(6, 182, 212, 0.10)", "rgba(0, 0, 0, 0)"];
          } else if (activeLayer === "Temp") {
            if (pt.val > 35) {
              colors = ["rgba(239, 68, 68, 0.40)", "rgba(249, 115, 22, 0.15)", "rgba(0, 0, 0, 0)"];
            } else if (pt.val > 30) {
              colors = ["rgba(245, 158, 11, 0.35)", "rgba(59, 130, 246, 0.08)", "rgba(0, 0, 0, 0)"];
            } else {
              colors = ["rgba(59, 130, 246, 0.35)", "rgba(147, 51, 234, 0.08)", "rgba(0, 0, 0, 0)"];
            }
          } else if (activeLayer === "Rain") {
            colors = ["rgba(59, 130, 246, 0.40)", "rgba(6, 182, 212, 0.12)", "rgba(0, 0, 0, 0)"];
          } else if (activeLayer === "Humidity") {
            colors = ["rgba(6, 182, 212, 0.40)", "rgba(29, 78, 216, 0.10)", "rgba(0, 0, 0, 0)"];
          }

          if (colors.length >= 2) {
            grad.addColorStop(0, colors[0]);
            if (colors.length === 3) {
              grad.addColorStop(0.4, colors[1]);
              grad.addColorStop(1, colors[2]);
            } else if (colors.length === 4) {
              grad.addColorStop(0.2, colors[1]);
              grad.addColorStop(0.6, colors[2]);
              grad.addColorStop(1, colors[3]);
            } else {
              grad.addColorStop(1, colors[1]);
            }
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        } catch (e) {
          // ignore offscreen projection errors
        }
      });
    }

    // DRAW ACTIVE FIRE PIXELS LAYER (MODIS / VIIRS representation)
    if (activeLayer === "Fires" || activeLayer === "AQI") {
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";

      const pulseScale = 1 + 0.32 * Math.sin(Date.now() / 140); // fast alerting pulse

      fireEvents.forEach(fire => {
        try {
          const pos = map.latLngToContainerPoint(L.latLng(fire.lat, fire.lng));

          // Pulsing halo
          ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 6 * pulseScale, 0, Math.PI * 2);
          ctx.stroke();

          // Internal amber core
          ctx.fillStyle = "#f97316";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Spark center
          ctx.fillStyle = "#fef08a";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      });
    }

    // DRAW WIND PARTICLES ANIMATION
    if (activeLayer === "Wind") {
      ctx.globalAlpha = 0.85;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#38bdf8";

      windParticles.current.forEach(p => {
        try {
          const pos = map.latLngToContainerPoint(L.latLng(p.lat, p.lng));

          // Draw head dot
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 1.8, 0, Math.PI * 2);
          ctx.fill();

          // Draw tiny vector direction line (Tail)
          ctx.strokeStyle = "rgba(56, 189, 248, 0.28)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          const rad = (p.angle * Math.PI) / 180;
          ctx.lineTo(pos.x - Math.cos(rad) * 9, pos.y - Math.sin(rad) * 9);
          ctx.stroke();
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
        // Draw dotted geodesic path
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(projPts[0].x, projPts[0].y);
        ctx.lineTo(projPts[1].x, projPts[1].y);
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // Draw distance tag in center of the line
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

      // Draw anchor nodes
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
    { id: "AQI", name: "AQI Heatmap", icon: Gauge, color: "text-orange-400" },
    { id: "PM2.5", name: "PM2.5 Densities", icon: Activity, color: "text-rose-400" },
    { id: "NO2", name: "NO₂ Nitrogen", icon: Sparkles, color: "text-cyan-400" },
    { id: "SO2", name: "SO₂ Sulfur", icon: Sparkles, color: "text-yellow-400" },
    { id: "CO", name: "CO Carbon", icon: Sparkles, color: "text-red-400" },
    { id: "O3", name: "O₃ Ozone", icon: Sparkles, color: "text-violet-400" },
    { id: "HCHO", name: "HCHO Formaldehyde", icon: Sparkles, color: "text-pink-400" },
    { id: "Fires", name: "Thermal Hotspots", icon: Flame, color: "text-amber-500 animate-pulse" },
    { id: "Wind", name: "Wind Particle Flow", icon: Wind, color: "text-sky-400" },
    { id: "Temp", name: "Temperature", icon: Thermometer, color: "text-orange-500" },
    { id: "Rain", name: "Rainfall Radar", icon: CloudRain, color: "text-blue-400" },
    { id: "Humidity", name: "Humidity", icon: Droplets, color: "text-teal-400" }
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
