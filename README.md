# SkyCast - Weather Dashboard

A fully functional, modern, and animated Weather Dashboard built with React, Vite, Framer Motion, OpenWeatherMap, and WeatherAPI. Features include real-time weather data, a 5-day forecast, hourly forecast, stunning dynamic backgrounds, temperature unit toggling, and geolocation support.

## Features
- **Dual API Fallback System**: Seamlessly fetches from OpenWeatherMap. If the key is unauthorized or fails, it automatically falls back to WeatherAPI without the user noticing!
- **Stunning Animations**: Uses `framer-motion` for crazy but amazing UI transitions, floating background orbs, and springy interactive elements.
- **Search by City**: Instantly view weather for any city worldwide.
- **Current Weather**: Displays temperature, feels-like, humidity, wind, and conditions.
- **Forecast**: Includes a 5-day daily forecast and an hourly forecast for the next 6 hours.
- **Unit Toggle**: Switch seamlessly between Celsius (°C) and Fahrenheit (°F). Persists across page reloads.
- **Geolocation**: Use your device's location to fetch local weather.
- **Dynamic Backgrounds**: The background and glassmorphism elements dynamically change based on the current weather condition and time of day.
- **Modern UI**: Clean, extreme glassmorphism design with responsive layout and gorgeous native weather icons.
- **SEO Optimized**: Includes meta tags and OpenGraph tags for perfect social sharing.

## Setup Instructions

### 1. Obtain Free API Keys
To run this application optimally, you should have keys for both APIs:
1. **OpenWeatherMap**: Go to [OpenWeatherMap.org](https://openweathermap.org/) and sign up.
2. **WeatherAPI**: Go to [WeatherAPI.com](https://www.weatherapi.com/) and sign up.

### 2. Configuration
The application uses the API keys directly in `src/App.jsx` for ease of demonstration. For production, use environment variables:
1. Create a `.env` file in the root directory.
2. Add your keys: 
   ```env
   VITE_OWM_API_KEY=your_owm_key
   VITE_WAPI_KEY=your_wapi_key
   ```
3. Update `src/App.jsx` to use `import.meta.env.VITE_OWM_API_KEY` instead of hardcoded strings.

### 3. Installation
1. Clone the repository.
2. Run `npm install` to install dependencies (including `lucide-react` and `framer-motion`).
3. Run `npm run dev` to start the development server.

## Deployment

### GitHub Pages
This project is pre-configured for GitHub Pages deployment.
1. Update `package.json` with your repository URL in the `homepage` field.
2. Ensure `vite.config.js` has the correct `base` path.
3. Run `npm run deploy`. This script builds the app and publishes the `dist` folder to the `gh-pages` branch.

## Technical Explanations

### Dual API Normalization
The dashboard is built to be resilient. `App.jsx` features a primary fetch call to OpenWeatherMap and a fallback fetch call to WeatherAPI. Because both APIs have entirely different JSON schemas, the app uses custom mapping functions (`fetchFromOWM` and `fetchFromWAPI`) to normalize their responses into a single common JavaScript object format. This allows the UI components to remain totally agnostic of which API supplied the data.

### Dynamic Background & Animations
The dynamic background works by mapping the weather condition codes to specific CSS classes (`weather-clear-day`, `weather-stormy-night`, etc.). We use CSS gradients and `framer-motion` to inject floating, animated light orbs in the background. The CSS handles smooth 1.5s transitions between gradients when the weather condition changes.

### Unit Switching
Temperature unit switching is managed via a React `useState` hook (`unit`), toggling between `'c'` and `'f'`. 
Data is stored internally in Metric (Celsius). When toggled to Fahrenheit, the frontend dynamically maps the values using mathematical formulas before rendering. The preference is stored in `localStorage`.