import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY is not set. AstraAQI AI Assistant will run in fallback simulation mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System Instruction for AstraAQI Environmental Intelligence AI Assistant
const SYSTEM_INSTRUCTION = `
You are AstraAQI AI, an elite atmospheric scientist, GIS remote sensing expert, and intelligent assistant created for AstraAQI (India's premier Satellite-Based Air Quality Intelligence Platform), modeled after ISRO National Remote Sensing Centre (NRSC) workflows.

Your capabilities include:
1. Explaining Satellite Sensors:
   - Sentinel-5P (TROPOMI): Captures high-res columns of HCHO (formaldehyde), NO2, SO2, CO, and O3.
   - INSAT-3D/3DR (Imager/Sounder): Tracks meteorological features, aerosols, temperature, and humidity.
   - MODIS & VIIRS: Active fire detections, Fire Radiative Power (FRP), smoke plume tracking, and burn area estimates.
   - ERA5 Reanalysis: Surface winds and vertical atmospheric motion.
2. Explaining Air Pollution Dynamics in India:
   - Stubble burning (biomass fires) in Punjab/Haryana during Oct-Nov causing severe PM2.5 spikes.
   - Formaldehyde (HCHO) hotspots over industrial belts (Singrauli, Kutch, Jamnagar, Korba) and secondary atmospheric chemistry.
   - Meteorological trapping (inversion layers) during winters over the Indo-Gangetic Plains.
3. Providing action-oriented recommendations for CPCB, disaster response, health agencies, and policy makers.

Guidelines:
- Keep answers concise (under 250 words) and structured with professional markdown.
- Ensure scientific credibility combined with accessible action recommendations.
- If a user asks questions like "Predict tomorrow AQI" or "Which city has highest AQI today?", provide high-fidelity atmospheric insights alongside the platform's simulated readings (e.g., Delhi AQI ~340, Punjab fires under observation).
`;

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Chat with Gemini API endpoint
app.post("/api/gemini/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  const ai = getAiClient();
  if (!ai) {
    // Elegant fallback simulation if API key is missing
    return res.json({
      text: `### Atmospheric Intelligence Briefing (AstraAQI Offline Simulator)

AstraAQI is currently operating in offline mode. Here is a scientific analysis based on current climatology and satellite data feeds:

1. **Formaldehyde (HCHO) Hotspots**: Elevated columns (HCHO columns > 1.8 × 10¹⁶ molec/cm²) are persistent over the **Kothagudem-Talcher industrial belt** and **Singrauli thermal cluster**. This indicates intense volatile organic compound (VOC) emissions from industrial fuel combustion.
2. **Biomass Burn Transport**: The prevailing westerly winds at 850 hPa are creating an atmospheric transport channel, dispersing aerosols downwind across the Indo-Gangetic Plains.
3. **Recommended Action**: Environmental enforcement agencies should deploy ground-based mobile VOC sniffers to check heavy industrial estates and trigger CPCB Stage II GRAP protocols where local AQI exceeds 300.

*To activate the real-time Gemini AI Assistant, please configure the \`GEMINI_API_KEY\` in your platform secrets.*`
    });
  }

  try {
    // Construct chat contents including history
    // Since we want to use the streamlined chat API, we can either construct a prompt with history, 
    // or use chats.create. Let's use ai.models.generateContent with systemInstruction directly.
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      });
    }
    
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || "No response received." });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to communicate with AI model.", details: error.message });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    // Integrate Vite Dev Server in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AstraAQI Server listening at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

start();
