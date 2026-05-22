import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Components
import Header from './components/Header';
import RecentSearches from './components/RecentSearches';
import WeatherAlerts from './components/WeatherAlerts';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import ExtendedMetrics from './components/ExtendedMetrics';
import WeatherChart from './components/WeatherChart';
import FiveDayForecast from './components/FiveDayForecast';
import WeatherSkeleton from './components/WeatherSkeleton';
import Toast from './components/Toast';
import Footer from './components/Footer';

// Services
import { fetchFromOWM, fetchFromWAPI } from './services/weatherService';

function App() {
  const [query, setQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState(() => localStorage.getItem('weather-unit') || 'c');
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recent-searches');
    return saved ? JSON.parse(saved) : [];
  });
  const [apiSource, setApiSource] = useState('');

  const addToRecentSearches = (cityName) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== cityName.toLowerCase());
      const updated = [cityName, ...filtered].slice(0, 5);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveRecent = (cityName) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== cityName);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
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
        if (!isCoords) addToRecentSearches(normalizedData.location.name);
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
      if (!isCoords) addToRecentSearches(normalizedData.location.name);

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

  return (
    <div className="app-container">
      {/* Background Animated Elements */}
      <div className="bg-elements">
        <motion.div className="orb orb-1" animate={{ x: [0, 50, 0], y: [0, -50, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}/>
        <motion.div className="orb orb-2" animate={{ x: [0, -50, 0], y: [0, 50, 0] }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }}/>
      </div>

      <Header 
        query={query}
        setQuery={setQuery}
        handleSearch={handleSearch}
        handleGeolocation={handleGeolocation}
        loading={loading}
        unit={unit}
        handleUnitToggle={handleUnitToggle}
        fetchWeather={fetchWeather}
      />

      <RecentSearches 
        searches={recentSearches}
        onSearch={(city) => fetchWeather(city)}
        onRemove={handleRemoveRecent}
        onClear={handleClearRecent}
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <WeatherSkeleton key="skeleton" />
        ) : weatherData ? (
          <motion.main 
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="main-grid"
          >
            <div className="main-section">
              <WeatherAlerts alerts={weatherData.alerts} />
              <CurrentWeather 
                weatherData={weatherData} 
                showTemp={showTemp} 
                apiSource={apiSource} 
              >
                <HourlyForecast 
                  hourly={weatherData.hourly} 
                  showTemp={showTemp} 
                />
                <ExtendedMetrics current={weatherData.current} />
                <WeatherChart hourly={weatherData.hourly} unit={unit} />
              </CurrentWeather>
            </div>

            <FiveDayForecast 
              forecast={weatherData.forecast} 
              showTemp={showTemp} 
            />
          </motion.main>
        ) : null}
      </AnimatePresence>

      <Toast message={error} onClose={() => setError(null)} />
      <Footer />
    </div>
  );
}

export default App;
