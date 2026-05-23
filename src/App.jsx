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
import CompareCities from './components/CompareCities';

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
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('app-theme') || 'cyan');

  const themeColors = {
    cyan: { color: '#81ecec', glow: 'rgba(129, 236, 236, 0.3)' },
    amber: { color: '#fd9644', glow: 'rgba(253, 150, 100, 0.3)' },
    emerald: { color: '#2ecc71', glow: 'rgba(46, 204, 113, 0.3)' },
    lavender: { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)' },
    crimson: { color: '#ff7675', glow: 'rgba(255, 118, 117, 0.3)' }
  };

  useEffect(() => {
    const selected = themeColors[activeTheme] || themeColors.cyan;
    document.documentElement.style.setProperty('--accent-color', selected.color);
    document.documentElement.style.setProperty('--accent-glow', selected.glow);
    localStorage.setItem('app-theme', activeTheme);
  }, [activeTheme]);

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

  useEffect(() => {
    fetchWeather('London');
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  };

  const BentoWrapper = ({ children, className = "", tilt = settings.tiltEnabled }) => (
    <motion.div variants={itemVariants} className={className}>
      {tilt ? <TiltCard>{children}</TiltCard> : children}
    </motion.div>
  );

  return (
    <div className="app-container" id={isSettingsOpen ? "" : "capture-area"}>
      <motion.div className="bg-elements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
        <motion.div className="orb orb-1" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 8 }}/>
        <motion.div className="orb orb-2" animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 12 }}/>
      </motion.div>

      <AnimatePresence>
        {isInitialLoad && loading ? (
          <motion.div key="splash" className="splash-screen" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.8 }}>
             <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="splash-logo">
               <CloudRain size={80} color="var(--accent-color)" />
               <h1 className="splash-title">SkyCast</h1>
             </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {weatherData && settings.atmosphereEnabled && (
        <Atmosphere condition={weatherData.current.conditionType} isDay={weatherData.current.isDay} />
      )}

      <Header 
        query={query} setQuery={setQuery} handleSearch={handleSearch} handleGeolocation={handleGeolocation} 
        loading={loading} unit={unit} handleUnitToggle={handleUnitToggle} fetchWeather={fetchWeather}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
      />

      <RecentSearches 
        searches={recentSearches} onSearch={(city) => fetchWeather(city)} 
        onRemove={handleRemoveRecent} onClear={handleClearRecent}
      />

      <PinnedCities 
        pinnedCities={pinnedCities} onRemove={togglePinCity} 
        onSelect={(city) => fetchWeather(city)} unit={unit}
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <WeatherSkeleton key="skeleton" />
        ) : weatherData ? (
          <motion.main 
            key="content" variants={settings.reducedMotion ? {} : containerVariants} 
            initial="hidden" animate="visible" className="bento-grid"
          >
            {/* 1. Alerts - Full Width */}
            {weatherData.alerts.length > 0 && (
              <motion.div variants={itemVariants} className="bento-item alerts-full">
                <WeatherAlerts alerts={weatherData.alerts} />
              </motion.div>
            )}

            {/* 2. Main Weather Card */}
            <BentoWrapper className="bento-item current-main">
              <CurrentWeather 
                weatherData={weatherData} showTemp={showTemp} apiSource={apiSource} 
                isPinned={pinnedCities.some(c => c.toLowerCase() === weatherData.location.name.toLowerCase())}
                onTogglePin={togglePinCity}
              />
            </BentoWrapper>

            {/* 3. 5-Day Forecast - Vertical Sidebar */}
            <BentoWrapper className="bento-item forecast-vertical">
              <FiveDayForecast forecast={weatherData.forecast} showTemp={showTemp} />
            </BentoWrapper>

            {/* 4. Hourly Trends */}
            <BentoWrapper className="bento-item hourly-trends">
              <HourlyForecast hourly={weatherData.hourly} showTemp={showTemp} />
            </BentoWrapper>

            {/* 5. Insights */}
            <BentoWrapper className="bento-item insights-card">
              <WeatherInsights current={weatherData.current} />
            </BentoWrapper>

            {/* 6. Chart */}
            <BentoWrapper className="bento-item chart-full">
              <WeatherChart hourly={weatherData.hourly} unit={unit} />
            </BentoWrapper>

            {/* 7. Extended Metrics */}
            <BentoWrapper className="bento-item metrics-full">
              <ExtendedMetrics current={weatherData.current} />
            </BentoWrapper>

            {/* 8. Sun Track */}
            <BentoWrapper className="bento-item sun-track">
              <SunTrack current={weatherData.current} />
            </BentoWrapper>

            {/* 9. Interactive Map */}
            <motion.div variants={itemVariants} className="bento-item map-full">
              <WeatherMap location={weatherData.location} />
            </motion.div>

          </motion.main>
        ) : null}
      </AnimatePresence>

      <Settings 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} 
        settings={settings} updateSetting={updateSetting} onExport={handleExport}
        activeTheme={activeTheme} onSelectTheme={setActiveTheme}
      />

      <CompareCities
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        currentCity={weatherData?.location?.name}
        currentData={weatherData}
        unit={unit}
      />

      <Toast message={error} onClose={() => setError(null)} />
      <Footer />
    </div>
  );
}

export default App;
