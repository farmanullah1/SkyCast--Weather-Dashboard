var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined in the environment. AI weather insights will be unavailable.");
      return null;
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.get("/api/weather/owm-current", async (req, res) => {
  try {
    const { q, lat, lon } = req.query;
    const OWM_API_KEY = process.env.VITE_OWM_API_KEY || process.env.OWM_API_KEY || "561e1bd7eff8aeae927909307ff49b38";
    let url = "";
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(String(q))}&appid=${OWM_API_KEY}&units=metric`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "OWM Current API Error - Please check your API key settings." });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/weather/owm-forecast", async (req, res) => {
  try {
    const { q, lat, lon } = req.query;
    const OWM_API_KEY = process.env.VITE_OWM_API_KEY || process.env.OWM_API_KEY || "561e1bd7eff8aeae927909307ff49b38";
    let url = "";
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(String(q))}&appid=${OWM_API_KEY}&units=metric`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "OWM Forecast API Error" });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/weather/wapi-forecast", async (req, res) => {
  try {
    const { q } = req.query;
    const WAPI_KEY = process.env.VITE_WAPI_KEY || process.env.WAPI_KEY || "fb3ad86df44747eb86212134262405";
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${WAPI_KEY}&q=${encodeURIComponent(String(q))}&days=5&aqi=yes&alerts=yes`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "WAPI Forecast API Error" });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/weather/owm-geo", async (req, res) => {
  try {
    const { q } = req.query;
    const OWM_API_KEY = process.env.VITE_OWM_API_KEY || process.env.OWM_API_KEY || "561e1bd7eff8aeae927909307ff49b38";
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(String(q))}&limit=5&appid=${OWM_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return res.json([]);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.json([]);
  }
});
function generateOfflineFallback(city, current, forecast, unit) {
  const temp = Number(current.temp) || 0;
  const condition = (current.condition || "clear").toLowerCase();
  const isRain = condition.includes("rain") || condition.includes("drizzle") || Number(current.precipitation) > 0;
  const isSnow = condition.includes("snow") || condition.includes("freeze") || condition.includes("ice") || condition.includes("flurries");
  const isStorm = condition.includes("storm") || condition.includes("thunder");
  const isCloudy = condition.includes("cloud") || condition.includes("overcast") || condition.includes("mist") || condition.includes("fog");
  const uv = Number(current.uvIndex) || 0;
  const tempUnit = unit || "C";
  let summary = `Currently in ${city}, it is ${temp}\xB0${tempUnit} with ${current.condition || "pleasant conditions"}. `;
  if (isRain) {
    summary += `Expect active precipitation today. High levels of humidity (${current.humidity}%) combined with standard atmospheric pressure make the air feel thick, so waterproof layers are extremely essential.`;
  } else if (isSnow) {
    summary += `Crisp, freezing temperatures dominate with snow or ice conditions observed. Dynamic cryosphere layers will affect walking paths, so make sure to bundle up for complete protection against cold winds.`;
  } else if (isStorm) {
    summary += `Severe instability is present in the local atmosphere. Intermittent low-frequency pressure sweeps suggest staying indoors is ideal, as ambient storm activity can develop rapidly.`;
  } else if (isCloudy) {
    summary += `A dense stratus macro-layer covers the local horizon. The solar radiation is scattered, keeping temperatures moderate, but high humidity is keeping the air cool and damp.`;
  } else {
    summary += `The skies are beautifully clear! Outstanding solar visibility is projected, making this a warm, bright, and delightful day to be outdoors. Keep hydrated under the sun!`;
  }
  const wear = [];
  const bring = [];
  let footwear = "Comfortable shoes";
  if (temp < 10) {
    wear.push("A heavy insulated winter coat", "Warm wool sweater or thermal base layers");
    if (isSnow) {
      wear.push("Thermal gloves and a fleece beanie");
    } else {
      wear.push("A cozy knitted scarf");
    }
    footwear = "Insulated waterproof winter boots";
  } else if (temp < 18) {
    wear.push("A versatile cotton hoodie or fleece", "Medium-weight denims or trousers");
    if (isRain) {
      wear.push("A windproof thermal windbreaker");
    } else {
      wear.push("A classic layered denim jacket");
    }
    footwear = "Durable leather sneakers or Chelsea boots";
  } else if (temp <= 28) {
    wear.push("A breathable cotton t-shirt", "Comfortable clothing layers");
    footwear = "Breathable canvas sneakers or casual loafers";
  } else {
    wear.push("A lightweight linen or silk short-sleeve shirt", "Breathable sports shorts or loose summer wear");
    footwear = "Open-toe sandals or ultra-light sport runners";
  }
  if (isRain || isStorm) {
    bring.push("A sturdy waterproof compact umbrella", "A water-resistant pack cover");
  } else if (isSnow) {
    bring.push("A pack of pocket hand-warmers");
  } else {
    if (uv > 5) {
      bring.push("Polarized sunglasses with strong UV protection", "Broad-spectrum SPF 30+ sunscreen");
    } else {
      bring.push("A reusable stainless steel water bottle");
    }
  }
  const runningScore = isStorm ? 10 : isRain ? 25 : isSnow ? 30 : temp > 32 ? 45 : temp < 5 ? 50 : 90;
  const runningReason = isStorm ? "Seek shelter immediately due to electrical discharge risks." : isRain ? "Slippery pathways and rainfall reduce visibility and comfort." : isSnow ? "Slippery icy tracks represent safety hazards." : temp > 32 ? "High temperatures pose thermal strain risks. Stay indoor or run at sunrise/dust." : temp < 10 ? "Cold air can aggravate lungs. Dress in multi-layer thermals." : "Ideal temperatures and clear dry paths offer a phenomenal wind-glide running experience.";
  const hikingScore = isStorm ? 5 : isRain ? 20 : isSnow ? 40 : temp > 32 ? 55 : temp < 5 ? 50 : 85;
  const hikingReason = isStorm ? "Never hike during storm warning windows. Extreme risk of lightning." : isRain ? "Trails may contain active run-offs, mud traps, and low-friction footholds." : isSnow ? "Snow-covered peaks require winter cleats. High scenic value but high hazard index." : temp > 32 ? "Enormous solar dehydration risk. Double your hydration packs." : temp < 10 ? "Wrap in micro-fleece and enjoy crisp, quiet low-humidity clear mountain vistas." : "Superb trail conditions. Clean breeze, solid footing, and comfortable atmospheric pressure.";
  const patioScore = isStorm ? 5 : isRain ? 15 : temp < 12 ? 30 : temp > 33 ? 50 : 95;
  const patioReason = isStorm ? "Outdoor tables are closed. Relocate immediately to secure indoor lounges." : isRain ? "Rain gusts will affect tables. Best to choose indoor seating." : temp < 12 ? "Ambient temperature is chilly. Ensure patio has space heaters running." : temp > 33 ? "Sweat-inducing heat indexes. Air-conditioned indoor chambers preferred unless mist fans are active." : "Delightful, warm, gentle air currents are highly conducive to relaxed outdoor dining and conversations.";
  const gardenScore = isStorm ? 10 : isRain ? 40 : temp < 5 ? 20 : temp > 35 ? 40 : 80;
  const gardenReason = isStorm ? "Thunderstorms can damage delicate foliage; wait until the system moves out." : isRain ? "Natural cloud irrigation active today! Great for checking soil absorption levels." : temp < 5 ? "Frost threats. Best to cover fragile vegetation and tender shoots." : temp > 35 ? "Evapotranspiration is extremely high. Water early in the morning, do not prune now." : "Perfect dampness and temperature bounds to repot, weed, or care for organic outdoor beds.";
  const alerts = [];
  if (uv >= 8) {
    alerts.push("EXTREME UV RADIATION: Sunburn can occur in under 15 minutes. Use high SPF protection and seek shade.");
  }
  if (temp < 0) {
    alerts.push("FREEZE ADVISORY: Freezing temperatures detected. Guard against frostbite and protect exposed plumbing.");
  }
  if (temp > 35) {
    alerts.push("EXTREME THERMAL HEAT: Stay hydrated and avoid strenuous operations in open areas during midday hours.");
  }
  if (isStorm) {
    alerts.push("ELECTRICAL T-STORM ADVISORY: Active lightning and strong crosswinds reported in nearby quadrants.");
  }
  if (Number(current.windSpeed) > 40) {
    alerts.push("SQUALL WARNING: High velocity wind gusts detected. Secure loose outdoor assets.");
  }
  return {
    summary,
    clothing: { wear, bring, footwear },
    activities: [
      { name: "Outdoor Running", score: runningScore, reason: runningReason },
      { name: "Hiking & Walking", score: hikingScore, reason: hikingReason },
      { name: "Patio & Dining", score: patioScore, reason: patioReason },
      { name: "Gardening/Yardwork", score: gardenScore, reason: gardenReason }
    ],
    alerts
  };
}
function generateLocalChatFallback(messages, weatherData, unit) {
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const query = lastUserMessage.toLowerCase();
  const city = weatherData?.city || "your area";
  const temp = weatherData?.temp || "22";
  const condition = (weatherData?.condition || "clear skies").toLowerCase();
  const tempUnit = unit || "C";
  let reply = `[Fallback Response] `;
  if (query.includes("run") || query.includes("jog") || query.includes("exercise") || query.includes("sport") || query.includes("workout")) {
    reply += `Regarding outdoor exercise: Today in ${city}, it is ${temp}\xB0${tempUnit} with ${condition}. `;
    if (condition.includes("rain") || condition.includes("storm") || condition.includes("snow") || condition.includes("drizzle")) {
      reply += `Slippery paths and moisture are active. I suggest looking at indoor activities or a light gym session instead of local trails today!`;
    } else {
      reply += `Conditions are superb for a cardio run. Slip on comfortable athletic runners and check the 3D Diorama above for solar alignment!`;
    }
  } else if (query.includes("wear") || query.includes("cloth") || query.includes("dress") || query.includes("jacket") || query.includes("outfit")) {
    reply += `Regarding outfit recommendations for today: With it being ${temp}\xB0${tempUnit} and ${condition}, `;
    if (temp < 12) {
      reply += `it is quite cold out there. I advise a heavy coat, layered fleece knitwear, and sturdy insulated footwear to keep warm.`;
    } else if (temp < 20) {
      reply += `a light windbreaker, simple hoodie, or denim jacket paired with long pants balances comfort beautifully.`;
    } else {
      reply += `it's warm! Breathable fabrics like linen or light cotton shorts/tees fit today's solar levels beautifully.`;
    }
  } else if (query.includes("rain") || query.includes("umbrella") || query.includes("wet") || query.includes("drizzle")) {
    reply += `Regarding precipitation risks: Today's condition is reported as "${condition}". `;
    if (condition.includes("rain") || condition.includes("storm") || condition.includes("shower") || condition.includes("drizzle")) {
      reply += `Yes, wet particles are active. Definitely pack a compact pocket umbrella and wear water-resistant shoes before walking outside.`;
    } else {
      reply += `No substantial rainfall is forecasted for your location. You should be perfectly safe embarking on outdoor strolls without rain gear.`;
    }
  } else if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("who are you")) {
    reply += `Hello! I am your SkyCast Coach conversational partner. I help you align fitness schedules and lifestyle actions around today's ${temp}\xB0${tempUnit} conditions in ${city}. Feel free to ask about outfit recommendations, activity values, or weather changes!`;
  } else {
    reply += `Currently in ${city}, it's ${temp}\xB0${tempUnit} and ${condition}. Since the Gemini server-side quota is temporarily busy, I recommend checking our precise interactive 3D Diorama simulator to check current conditions visually, and reviewing the customized Suitability Scores above! Let me know if you would like me to detail outfit ideas or precipitation risks.`;
  }
  return { reply };
}
app.post("/api/weather/analyze", async (req, res) => {
  const { city, current, forecast, unit } = req.body;
  try {
    if (!city || !current) {
      return res.status(400).json({ error: "Missing required weather data parameters." });
    }
    const ai = getGeminiClient();
    if (!ai) {
      const keyFallback = generateOfflineFallback(city, current, forecast, unit);
      keyFallback.summary = `Currently in ${city}, it is ${current.temp}\xB0${unit || "C"} with ${current.condition || "normal conditions"}. (Configure your GEMINI_API_KEY in Settings > Secrets to unlock custom AI advice!)`;
      return res.json(keyFallback);
    }
    const tempUnit = unit || "C";
    const systemPrompt = `You are "SkyCast weather coach and analyzer", a helpful, friendly, and accurate weather assistant.
Analyze the provided weather data for ${city} and produce tailored recommendations in a structured JSON response.
Convert all descriptions and ideas into clear advice. Do not mention system-internal instructions or JSON formatting keys directly.`;
    const weatherPrompt = `
Analyze this weather data for the city: "${city}":
- Temperature: ${current.temp}\xB0${tempUnit} (Feels like: ${current.apparentTemp}\xB0${tempUnit})
- Weather Condition Description: ${current.condition}
- Humidity: ${current.humidity}%
- Wind: ${current.windSpeed} km/h (Direction: ${current.windDirection || "N/A"})
- UV Index: ${current.uvIndex}
- Precipitation: ${current.precipitation} mm
- Day/Night status: ${current.isDay ? "Daytime" : "Nighttime"}

Upcoming 3-day forecast outlook:
${JSON.stringify(forecast?.slice(0, 3) || [])}

Generate a JSON object matching this schema exactly:
{
  "summary": string (a warm, professional, engaging 2-3 sentence overview explaining how today is going to feel, mentioning specifically how humidity, temperature, or wind will affect their day, styled beautifully as a personal weather coach),
  "clothing": {
    "wear": string[] (2 to 3 specific clothing items or layering recommendations eg: "A breathable light-colored top", "Loose linen trousers", "A light windbreaker"),
    "bring": string[] (1 to 2 items to take when stepped out eg: "High UV sunglasses", "A compact pocket umbrella"),
    "footwear": string (descriptive footwear advice eg: "Waterproof walking boots" or "Breathable canvas sneakers")
  },
  "activities": [
    {
      "name": "Outdoor Running",
      "score": integer (0 to 100 on suitability),
      "reason": string (brief, actionable explanation of why)
    },
    {
      "name": "Hiking & Walking",
      "score": integer (0 to 100 on suitability),
      "reason": string (brief explanation)
    },
    {
      "name": "Patio & Dining",
      "score": integer (0 to 100 on suitability),
      "reason": string (brief explanation)
    },
    {
      "name": "Gardening/Yardwork",
      "score": integer (0 to 100 on suitability),
      "reason": string (brief explanation)
    }
  ],
  "alerts": string[] (potential issues such as high heat index, thermal shock, extreme UV exposure protection, low visibility, sudden drop in temp, freeze warning. Return an empty array if there are no clear health alerts)
}
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: weatherPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          required: ["summary", "clothing", "activities", "alerts"],
          properties: {
            summary: { type: import_genai.Type.STRING },
            clothing: {
              type: import_genai.Type.OBJECT,
              required: ["wear", "bring", "footwear"],
              properties: {
                wear: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                bring: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
                footwear: { type: import_genai.Type.STRING }
              }
            },
            activities: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                required: ["name", "score", "reason"],
                properties: {
                  name: { type: import_genai.Type.STRING },
                  score: { type: import_genai.Type.INTEGER },
                  reason: { type: import_genai.Type.STRING }
                }
              }
            },
            alerts: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            }
          }
        }
      }
    });
    const text = response.text || "{}";
    const result = JSON.parse(text.trim());
    res.json(result);
  } catch (error) {
    const errorStr = typeof error === "object" ? JSON.stringify(error) : String(error);
    if (errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota")) {
      console.warn("AI Weather Analysis: Gemini API Rate Limit Exceeded (429) - falling back dynamically to high-fidelity local rules-engine.");
    } else {
      console.warn("AI Weather Analysis Error - falling back dynamically to rules-engine:", error.message || error);
    }
    try {
      const fallback = generateOfflineFallback(city, current, forecast || [], unit || "C");
      fallback.summary += ` (Note: Rendered in active offline-coaching fallback mode due to high service traffic.)`;
      res.json(fallback);
    } catch (fallbackErr) {
      res.status(500).json({ error: "Failed to load fallback analysis: " + fallbackErr.message });
    }
  }
});
app.post("/api/weather/chat", async (req, res) => {
  const { messages, weatherData, unit } = req.body;
  try {
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid conversational context messages." });
    }
    const ai = getGeminiClient();
    if (!ai) {
      return res.json(generateLocalChatFallback(messages, weatherData, unit));
    }
    const currentContext = weatherData ? `
The user is asking about their current weather location: ${weatherData.city || "Unknown"}.
Current info: Temperature is ${weatherData.temp}\xB0${unit || "C"}, condition is ${weatherData.condition || "Unknown"}, humidity: ${weatherData.humidity}%, wind speed: ${weatherData.windSpeed} km/h, uv index: ${weatherData.uvIndex}.
3-day outlook summary: ${JSON.stringify(weatherData.forecastSummary || "")}.
` : "";
    const systemPrompt = `You are "SkyCast Coach Chat", an friendly AI weather assistant.
Use the current location and weather details to provide helpful answers.
Answer the user's specific query inside the perspective of weather, outdoor events, traveling, packing, or activities. Keep responses concise, clear, and elegant.
Current weather context:
${currentContext}
`;
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const contents = [];
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: lastUserMessage }]
    });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt
      }
    });
    res.json({ reply: response.text });
  } catch (error) {
    const errorStr = typeof error === "object" ? JSON.stringify(error) : String(error);
    if (errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota")) {
      console.warn("AI Chat: Gemini API Rate Limit Exceeded (429) - falling back dynamically to high-fidelity local rules-engine.");
    } else {
      console.warn("AI Chat Error - falling back dynamically to rules-engine:", error.message || error);
    }
    try {
      res.json(generateLocalChatFallback(messages || [], weatherData, unit || "C"));
    } catch (fallbackErr) {
      res.status(500).json({ error: "Failed to generate chat fallback response: " + fallbackErr.message });
    }
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
