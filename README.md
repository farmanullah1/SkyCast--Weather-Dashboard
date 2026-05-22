# 🌤️ SkyCast - Professional Weather Dashboard

SkyCast is a modern, high-performance weather dashboard built with **React 19**, **Vite**, and **Framer Motion**. It features a robust dual-API fallback system, real-time data visualization, and an immersive "glassmorphic" UI designed for clarity and visual impact.

> **Developer:** Farmanullah Ansari | Full Stack Software Engineer  
> **Portfolio:** [https://farmanullah1.github.io/My-Portfolio](https://farmanullah1.github.io/My-Portfolio)  
> **LinkedIn:** [https://www.linkedin.com/in/farmanullah-ansari/](https://www.linkedin.com/in/farmanullah-ansari/)  
> **GitHub:** [https://github.com/farmanullah1](https://github.com/farmanullah1)

---

## ✨ Key Features

- **🛡️ Dual-API Resiliency**: A smart fallback system that switches between **OpenWeatherMap** and **WeatherAPI** automatically if one provider is unavailable or hits rate limits.
- **📊 Interactive Data Visualization**: Beautiful temperature trend charts powered by `recharts`.
- **⚡ Skeleton Loaders**: Shimmering placeholders that match the UI layout for a smooth, high-perceived-performance loading experience.
- **💾 Persistent History**: "Recent Searches" feature that saves your last 5 searched cities in `localStorage`.
- **🌡️ Comprehensive Metrics**: Detailed weather data including UV Index, Air Quality (AQI), Sunrise/Sunset, Visibility, and Wind Speed.
- **🎨 Dynamic UI**: Glassmorphic design with animated backgrounds that change based on current weather conditions and time of day.
- **📱 Responsive & Animated**: Fully responsive layout with fluid animations powered by `framer-motion` and `lucide-react` icons.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS (Custom Vanilla CSS Implementation)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Deployment**: GitHub Pages

---

## 🚀 Getting Started

### 1. Prerequisites
You will need API keys from:
- [OpenWeatherMap](https://openweathermap.org/)
- [WeatherAPI](https://www.weatherapi.com/)

### 2. Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root and add your keys:
   ```env
   VITE_OWM_API_KEY=your_key_here
   VITE_WAPI_KEY=your_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

- `src/components/`: Reusable UI components (Header, WeatherChart, RecentSearches, etc.).
- `src/services/`: Weather fetching and data normalization logic.
- `src/assets/`: Static images and icons.

---

## 📜 License

This project is open-source and available under the MIT License.
