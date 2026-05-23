import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain } from 'lucide-react';
import './index.css';
import html2canvas from 'html2canvas';

// Components
import Header from './components/Header';
import RecentSearches from './components/RecentSearches';
import WeatherAlerts from './components/WeatherAlerts';
import PinnedCities from './components/PinnedCities';
import Atmosphere from './components/Atmosphere';
import SunTrack from './components/SunTrack';
import TiltCard from './components/TiltCard';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import ExtendedMetrics from './components/ExtendedMetrics';
import WeatherInsights from './components/WeatherInsights';
import WeatherChart from './components/WeatherChart';
import WeatherMap from './components/WeatherMap';
import FiveDayForecast from './components/FiveDayForecast';
import WeatherSkeleton from './components/WeatherSkeleton';
import Toast from './components/Toast';
import Footer from './components/Footer';
import Settings from './components/Settings';

// Services
import { fetchFromOWM, fetchFromWAPI } from './services/weatherService';

function App() {
  const [query, setQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [unit, setUnit] = useState(() => localStorage.getItem('weather-unit') || 'c');
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recent-searches');
    return saved ? JSON.parse(saved) : [];
  });
  const [apiSource, setApiSource] = useState('');
  const [pinnedCities, setPinnedCities] = useState(() => {
    const saved = localStorage.getItem('pinned-cities');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app-settings');
    return saved ? JSON.parse(saved) : {
      tiltEnabled: true,
      atmosphereEnabled: true,
      reducedMotion: false
    };
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const updateSetting = (key, value) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('app-settings', JSON.stringify(updated));
      return updated;
    });
  };

  const handleExport = async () => {
    const element = document.getElementById('capture-area');
    if (!element) return;
    
    setIsSettingsOpen(false);
    
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(element, {
          backgroundColor: '#020617',
          scale: 2,
          useCORS: true,
          logging: false,
        });
        
        const link = document.createElement('a');
        link.download = `SkyCast-Report-${weatherData.location.name}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Export failed:", err);
        setError("Failed to generate weather report image.");
      }
    }, 300);
  };

  const togglePinCity = (cityName) => {
    setPinnedCities((prev) => {
      let updated;
      const exists = prev.some(c => c.toLowerCase() === cityName.toLowerCase());
      if (exists) {
        updated = prev.filter(c => c.toLowerCase() !== cityName.toLowerCase());
      } else {
        updated = [...prev, cityName];
      }
      localStorage.setItem('pinned-cities', JSON.stringify(updated));
      return updated;
    });
  };

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
        setIsInitialLoad(false);
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
      setIsInitialLoad(false);

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
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 20 }
    }
  };

  return (
    <div className="app-container" id={isSettingsOpen ? "" : "capture-area"}>
      {/* Background Animated Elements */}
      <motion.div 
        className="bg-elements"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <motion.div className="orb orb-1" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 8 }}/>
        <motion.div className="orb orb-2" animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 12 }}/>
      </motion.div>

      <AnimatePresence>
        {isInitialLoad && loading ? (
          <motion.div 
            key="splash"
            className="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
             <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="splash-logo"
             >
               <CloudRain size={80} color="var(--accent-color)" />
               <h1 className="splash-title">SkyCast</h1>
             </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {weatherData && settings.atmosphereEnabled && (
        <Atmosphere 
          condition={weatherData.current.conditionType} 
          isDay={weatherData.current.isDay} 
        />
      )}

      <Header 
        query={query}
        setQuery={setQuery}
        handleSearch={handleSearch}
        handleGeolocation={handleGeolocation}
        loading={loading}
        unit={unit}
        handleUnitToggle={handleUnitToggle}
        fetchWeather={fetchWeather}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <RecentSearches 
        searches={recentSearches}
        onSearch={(city) => fetchWeather(city)}
        onRemove={handleRemoveRecent}
        onClear={handleClearRecent}
      />

      <PinnedCities 
        pinnedCities={pinnedCities}
        onRemove={togglePinCity}
        onSelect={(city) => fetchWeather(city)}
        unit={unit}
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <WeatherSkeleton key="skeleton" />
        ) : weatherData ? (
          <motion.main 
            key="content"
            variants={settings.reducedMotion ? {} : containerVariants}
            initial="hidden"
            animate="visible"
            className="main-grid"
          >
            <div className="main-section">
              <motion.div variants={itemVariants}>
                <WeatherAlerts alerts={weatherData.alerts} />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                {settings.tiltEnabled ? (
                  <TiltCard>
                    <CurrentWeather 
                      weatherData={weatherData} 
                      showTemp={showTemp} 
                      apiSource={apiSource} 
                      isPinned={pinnedCities.some(c => c.toLowerCase() === weatherData.location.name.toLowerCase())}
                      onTogglePin={togglePinCity}
                    >
                      <HourlyForecast 
                        hourly={weatherData.hourly} 
                        showTemp={showTemp} 
                      />
                      <WeatherInsights current={weatherData.current} />
                      <ExtendedMetrics current={weatherData.current} />
                      <SunTrack current={weatherData.current} />
                      <WeatherChart hourly={weatherData.hourly} unit={unit} />
                    </CurrentWeather>
                  </TiltCard>
                ) : (
                  <CurrentWeather 
                    weatherData={weatherData} 
                    showTemp={showTemp} 
                    apiSource={apiSource} 
                    isPinned={pinnedCities.some(c => c.toLowerCase() === weatherData.location.name.toLowerCase())}
                    onTogglePin={togglePinCity}
                  >
                    <HourlyForecast 
                      hourly={weatherData.hourly} 
                      showTemp={showTemp} 
                    />
                    <WeatherInsights current={weatherData.current} />
                    <ExtendedMetrics current={weatherData.current} />
                    <SunTrack current={weatherData.current} />
                    <WeatherChart hourly={weatherData.hourly} unit={unit} />
                  </CurrentWeather>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <WeatherMap location={weatherData.location} />
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              {settings.tiltEnabled ? (
                <TiltCard>
                  <FiveDayForecast 
                    forecast={weatherData.forecast} 
                    showTemp={showTemp} 
                  />
                </TiltCard>
              ) : (
                <FiveDayForecast 
                  forecast={weatherData.forecast} 
                  showTemp={showTemp} 
                />
              )}
            </motion.div>
          </motion.main>
        ) : null}
      </AnimatePresence>

      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        updateSetting={updateSetting}
        onExport={handleExport}
      />

      <Toast message={error} onClose={() => setError(null)} />
      <Footer />
    </div>
  );
}

export default App;
