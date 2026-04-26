import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, Droplets, Wind, Thermometer, AlertCircle, CloudRain, Sun, Cloud, CloudLightning, CloudSnow } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// API Keys
const OWM_API_KEY = 'bf2acb8e9feb96662538e68b25f29874';
const WAPI_KEY = '76979e2b7f574734975110457262604';

// Component for Toast Error
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="toast"
        >
          <AlertCircle size={20} />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Map code to general condition
const mapOWMCondition = (code) => {
  if (code >= 200 && code < 300) return 'stormy';
  if (code >= 300 && code < 600) return 'rainy';
  if (code >= 600 && code < 700) return 'snowy';
  if (code >= 700 && code < 800) return 'cloudy';
  if (code === 800) return 'clear';
  return 'cloudy';
};

const mapWAPICondition = (code) => {
  if (code === 1000) return 'clear';
  if ([1003, 1006, 1009].includes(code)) return 'cloudy';
  if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243].includes(code)) return 'rainy';
  if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255].includes(code)) return 'snowy';
  if ([1087, 1273, 1276].includes(code)) return 'stormy';
  return 'cloudy';
};

function App() {
  const [query, setQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState(() => localStorage.getItem('weather-unit') || 'c');
  const [apiSource, setApiSource] = useState('');

  // Fetch OpenWeatherMap
  const fetchFromOWM = async (searchQuery, isCoords) => {
    let currentUrl = '';
    let forecastUrl = '';
    if (isCoords) {
      const [lat, lon] = searchQuery.split(',');
      currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
    } else {
      currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchQuery}&appid=${OWM_API_KEY}&units=metric`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchQuery}&appid=${OWM_API_KEY}&units=metric`;
    }

    const [currentRes, forecastRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error(currentRes.status === 404 ? 'City not found' : 'OWM API Error');
    }

    const current = await currentRes.json();
    const forecast = await forecastRes.json();
    
    // Normalize Data
    const isDay = current.weather[0].icon.includes('d');
    
    // Process Forecast
    const dailyData = {};
    forecast.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = { minC: item.main.temp_min, maxC: item.main.temp_max, desc: item.weather[0].description, iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`, dt: item.dt };
      } else {
        if (item.main.temp_min < dailyData[date].minC) dailyData[date].minC = item.main.temp_min;
        if (item.main.temp_max > dailyData[date].maxC) dailyData[date].maxC = item.main.temp_max;
        if (item.dt_txt.includes('12:00:00')) {
          dailyData[date].iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
          dailyData[date].desc = item.weather[0].description;
        }
      }
    });

    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    
    return {
      location: {
        name: current.name,
        country: current.sys.country,
        localTimeFormatted: new Date(current.dt * 1000).toLocaleString('en-US', options)
      },
      current: {
        tempC: current.main.temp,
        feelsLikeC: current.main.feels_like,
        humidity: current.main.humidity,
        windKph: current.wind.speed * 3.6,
        desc: current.weather[0].description,
        iconUrl: `https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`,
        isDay: isDay,
        conditionType: mapOWMCondition(current.weather[0].id)
      },
      forecast: Object.values(dailyData).slice(0, 5).map((d, i) => ({
        dateFormatted: i === 0 ? 'Today' : new Date(d.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
        minC: d.minC,
        maxC: d.maxC,
        desc: d.desc,
        iconUrl: d.iconUrl
      })),
      hourly: forecast.list.slice(0, 6).map(h => ({
        hourFormatted: new Date(h.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
        tempC: h.main.temp,
        iconUrl: `https://openweathermap.org/img/wn/${h.weather[0].icon}@2x.png`
      }))
    };
  };

  // Fetch WeatherAPI (Fallback)
  const fetchFromWAPI = async (searchQuery, isCoords) => {
    const q = isCoords ? searchQuery : searchQuery;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${WAPI_KEY}&q=${q}&days=5&aqi=no&alerts=no`;
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(res.status === 400 || res.status === 404 ? 'City not found' : 'WAPI API Error');
    }
    
    const data = await res.json();
    
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };

    return {
      location: {
        name: data.location.name,
        country: data.location.country,
        localTimeFormatted: new Date(data.location.localtime).toLocaleString('en-US', options)
      },
      current: {
        tempC: data.current.temp_c,
        feelsLikeC: data.current.feelslike_c,
        humidity: data.current.humidity,
        windKph: data.current.wind_kph,
        desc: data.current.condition.text,
        iconUrl: data.current.condition.icon,
        isDay: data.current.is_day === 1,
        conditionType: mapWAPICondition(data.current.condition.code)
      },
      forecast: data.forecast.forecastday.map((d, i) => ({
        dateFormatted: i === 0 ? 'Today' : new Date(d.date).toLocaleDateString('en-US', { weekday: 'long' }),
        minC: d.day.mintemp_c,
        maxC: d.day.maxtemp_c,
        desc: d.day.condition.text,
        iconUrl: d.day.condition.icon
      })),
      hourly: data.forecast.forecastday[0].hour
        .filter(h => new Date(h.time).getTime() >= new Date(data.location.localtime).getTime() - 3600000)
        .slice(0, 6)
        .map(h => ({
          hourFormatted: new Date(h.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          tempC: h.temp_c,
          iconUrl: h.condition.icon
        }))
    };
  };

  const fetchWeather = useCallback(async (searchQuery, isCoords = false) => {
    if (!searchQuery && !isCoords) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Primary: Try OpenWeatherMap
      try {
        const normalizedData = await fetchFromOWM(searchQuery, isCoords);
        setWeatherData(normalizedData);
        setApiSource('OWM');
        updateBackground(normalizedData.current.conditionType, normalizedData.current.isDay);
        setLoading(false);
        return;
      } catch (owmErr) {
        console.warn("OpenWeatherMap failed, falling back to WeatherAPI...", owmErr);
      }

      // Fallback: Try WeatherAPI
      const normalizedData = await fetchFromWAPI(searchQuery, isCoords);
      setWeatherData(normalizedData);
      setApiSource('WeatherAPI');
      updateBackground(normalizedData.current.conditionType, normalizedData.current.isDay);

    } catch (err) {
      setError(err.message === 'City not found' ? err.message : 'Unable to fetch weather from both APIs. Please check your keys or connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchWeather('London'); // Default city
  }, [fetchWeather]);

  const handleUnitToggle = (newUnit) => {
    setUnit(newUnit);
    localStorage.setItem('weather-unit', newUnit);
  };

  const c2f = (c) => (c * 9/5) + 32;
  const showTemp = (c) => unit === 'f' ? Math.round(c2f(c)) : Math.round(c);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchWeather(query.trim());
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(`${latitude},${longitude}`, true);
      },
      () => {
        setLoading(false);
        setError('Location access denied or unavailable.');
      }
    );
  };

  const updateBackground = (type, isDay) => {
    const timeClass = isDay ? 'day' : 'night';
    document.body.className = `weather-${type}-${timeClass}`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="app-container">
      {/* Background Animated Elements */}
      <div className="bg-elements">
        <motion.div className="orb orb-1" animate={{ x: [0, 50, 0], y: [0, -50, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}/>
        <motion.div className="orb orb-2" animate={{ x: [0, -50, 0], y: [0, 50, 0] }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }}/>
      </div>

      <motion.header 
        className="app-header glass-card"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <div className="brand">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
             <CloudRain size={36} className="brand-icon" />
          </motion.div>
          <span>SkyCast</span>
        </div>

        <form onSubmit={handleSearch} className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search for a city..."
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="icon-btn" disabled={loading || !query.trim()}>
            <Search size={20} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="icon-btn" onClick={handleGeolocation} disabled={loading} title="Use My Location">
            <MapPin size={20} />
          </motion.button>
        </form>

        <div className="unit-toggle">
          <button className={`unit-btn ${unit === 'c' ? 'active' : ''}`} onClick={() => handleUnitToggle('c')}>°C</button>
          <button className={`unit-btn ${unit === 'f' ? 'active' : ''}`} onClick={() => handleUnitToggle('f')}>°F</button>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="loader-container glass-card"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
               <Loader2 size={64} className="spinner-icon" />
            </motion.div>
            <p>Gathering atmospheric data...</p>
          </motion.div>
        ) : weatherData ? (
          <motion.main 
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="main-grid"
          >
            {/* Left Column: Current Weather */}
            <motion.section variants={itemVariants} className="current-weather glass-card highlight-card">
              <div className="location-info">
                <div>
                  <h2 className="city-name">{weatherData.location.name}</h2>
                  <p className="date-time">{weatherData.location.country} • {weatherData.location.localTimeFormatted}</p>
                </div>
                {/* Debug API badge */}
                <div className="api-badge">via {apiSource}</div>
              </div>

              <div className="weather-main">
                <motion.div 
                  className="weather-condition"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <img src={weatherData.current.iconUrl} alt={weatherData.current.desc} className="main-icon" />
                  <span className="weather-desc">{weatherData.current.desc}</span>
                </motion.div>
                <div className="temperature">
                  {showTemp(weatherData.current.tempC)}°
                </div>
              </div>

              <div className="weather-details">
                <motion.div whileHover={{ scale: 1.05 }} className="detail-item">
                  <Thermometer className="detail-icon" size={24} />
                  <div className="detail-info">
                    <span className="detail-label">Feels Like</span>
                    <span className="detail-value">{showTemp(weatherData.current.feelsLikeC)}°</span>
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="detail-item">
                  <Droplets className="detail-icon" size={24} />
                  <div className="detail-info">
                    <span className="detail-label">Humidity</span>
                    <span className="detail-value">{weatherData.current.humidity}%</span>
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="detail-item">
                  <Wind className="detail-icon" size={24} />
                  <div className="detail-info">
                    <span className="detail-label">Wind</span>
                    <span className="detail-value">{Math.round(weatherData.current.windKph)} km/h</span>
                  </div>
                </motion.div>
              </div>
              
              <div className="hourly-section">
                <h3 className="section-title">Today's Forecast</h3>
                <div className="hourly-forecast">
                  {weatherData.hourly.map((hour, index) => (
                    <motion.div 
                      whileHover={{ y: -5 }} 
                      key={index} 
                      className="hourly-item glass-morphism"
                    >
                      <span className="hourly-time">{index === 0 ? 'Now' : hour.hourFormatted}</span>
                      <img src={hour.iconUrl} alt="hourly" width="48" height="48" />
                      <span className="hourly-temp">{showTemp(hour.tempC)}°</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Right Column: 5-Day Forecast */}
            <motion.section variants={itemVariants} className="forecast-section glass-card">
              <h3 className="section-title">5-Day Forecast</h3>
              <div className="forecast-list">
                {weatherData.forecast.map((day, index) => (
                  <motion.div 
                    whileHover={{ scale: 1.02, x: 5 }}
                    key={index} 
                    className="forecast-item glass-morphism"
                  >
                    <span className="forecast-day">{day.dateFormatted}</span>
                    <div className="forecast-condition">
                      <img src={day.iconUrl} alt={day.desc} width="40" height="40" />
                      <span className="forecast-desc">{day.desc}</span>
                    </div>
                    <div className="forecast-temps">
                      <span className="temp-high">{showTemp(day.maxC)}°</span>
                      <span className="temp-low">{showTemp(day.minC)}°</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </motion.main>
        ) : null}
      </AnimatePresence>

      <Toast message={error} onClose={() => setError(null)} />
    </div>
  );
}

export default App;
