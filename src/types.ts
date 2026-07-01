export enum Page {
  Dashboard = "Dashboard",
  IndiaMap = "India AQI Map",
  HchoHotspots = "HCHO Hotspots",
  SatelliteLayers = "Satellite Layers",
  FireDetection = "Fire Detection",
  Forecast = "Forecast",
  Analytics = "Analytics",
  Reports = "Reports",
  Alerts = "Alerts",
  Settings = "Settings"
}

export type PollutantType = "PM2.5" | "PM10" | "NO2" | "SO2" | "CO" | "O3" | "HCHO";

export interface SatelliteLayer {
  id: string;
  name: string;
  sensor: string;
  agency: string;
  parameter: string;
  resolution: string;
  revisit: string;
  description: string;
  opacity: number;
  isActive: boolean;
}

export interface CityData {
  name: string;
  aqi: number;
  pm25: number;
  no2: number;
  so2: number;
  co: number;
  hcho: number;
}

export interface StateData {
  id: string;
  name: string;
  aqi: number;
  pm25: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  hcho: number; // 10^15 molec/cm2
  temp: number;
  humidity: number;
  rainfall: number;
  windDir: number; // degrees
  windSpeed: number; // km/h
  dominantPollutant: string;
  healthAdvisory: string;
  cities: CityData[];
  fireCount: number;
  ncapTarget: number; // target reduction %
  currentNcapReduction: number; // achieved %
  sdgProgress: number; // scale of 0 - 100
  hchoHotspot: boolean;
}

export interface FireEvent {
  id: string;
  lat: number;
  lng: number;
  sensor: "VIIRS" | "MODIS";
  confidence: number; // %
  frp: number; // MW (Fire Radiative Power)
  burnArea: number; // Hectares
  time: string;
  district: string;
  state: string;
  emissions: {
    co2: number; // tonnes
    co: number; // tonnes
    pm25: number; // tonnes
  };
}

export interface ForecastData {
  time: string;
  aqi: number;
  pm25: number;
  hcho: number;
  lowerBound: number;
  upperBound: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface AlertItem {
  id: string;
  type: "AQI" | "HCHO" | "FIRE" | "WIND";
  message: string;
  time: string;
  level: "CRITICAL" | "WARNING" | "INFO";
}
