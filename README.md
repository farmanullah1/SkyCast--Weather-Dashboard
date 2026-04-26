# SkyCast - Weather Dashboard

A fully functional, modern Weather Dashboard built with React, Vite, and OpenWeatherMap API. Features include real-time weather data, a 5-day forecast, hourly forecast, dynamic backgrounds, temperature unit toggling, and geolocation support.

## Features
- **Search by City**: Instantly view weather for any city worldwide.
- **Current Weather**: Displays temperature, feels-like, humidity, wind, and conditions.
- **Forecast**: Includes a 5-day daily forecast and a 3-hour interval hourly forecast.
- **Unit Toggle**: Switch seamlessly between Celsius (°C) and Fahrenheit (°F). Persists across page reloads.
- **Geolocation**: Use your device's location to fetch local weather.
- **Dynamic Backgrounds**: The background dynamically changes based on the current weather condition and time of day.
- **Modern UI**: Clean, glassmorphism design with responsive layout.

## Setup Instructions

### 1. Obtain a Free API Key
To run this application, you need an API key from OpenWeatherMap:
1. Go to [OpenWeatherMap.org](https://openweathermap.org/).
2. Sign up for a free account.
3. Navigate to your dashboard to copy your API key.

### 2. Configuration
The application uses the API key directly in `src/App.jsx` for ease of demonstration, but for production, you should use environment variables.
1. Create a `.env` file in the root directory.
2. Add your key: `VITE_OPENWEATHER_API_KEY=your_api_key_here`
3. Update `src/App.jsx` to use `import.meta.env.VITE_OPENWEATHER_API_KEY` instead of the hardcoded key.

### 3. Installation
1. Clone the repository.
2. Run `npm install` to install dependencies (including `lucide-react`).
3. Run `npm run dev` to start the development server.

## Deployment

### GitHub Pages
This project is pre-configured for GitHub Pages deployment.
1. Update `package.json` with your repository URL in the `homepage` field.
2. Ensure `vite.config.js` has the correct `base` path (e.g., `/SkyCast--Weather-Dashboard/`).
3. Run `npm run deploy`. This script builds the app and publishes the `dist` folder to the `gh-pages` branch.

### Vercel
1. Push your code to GitHub.
2. Connect the repository to Vercel.
3. Vercel will automatically detect Vite and configure the build settings. Add the environment variable if needed and deploy.

## Technical Explanations

### Dynamic Background
The dynamic background works by mapping the weather condition codes provided by OpenWeatherMap to specific CSS classes (`weather-clear-day`, `weather-cloudy-night`, `weather-rainy`, etc.). In `src/App.jsx`, the `updateBackground` function evaluates the `code` and the time of day (`isDay`) to determine the appropriate class. This class is then applied to the `document.body`. The CSS handles smooth transitions using gradients for a seamless visual experience.

### Unit Switching
Temperature unit switching is managed via a React `useState` hook (`unit`), which toggles between `'c'` and `'f'`. 
The API fetches data in metric units (Celsius). When the user toggles the unit to Fahrenheit, the frontend dynamically converts the values before rendering. The current preference is also saved to `localStorage` (`weather-unit`), ensuring the user's choice persists across page reloads.