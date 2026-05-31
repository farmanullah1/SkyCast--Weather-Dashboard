import React, { useState, useEffect, useCallback, FormEvent, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain } from 'lucide-react';
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
import Weather3DStage from './components/Weather3DStage';
import FiveDayForecast from './components/FiveDayForecast';
import WeatherSkeleton from './components/WeatherSkeleton';
import Toast from './components/Toast';
import Footer from './components/Footer';
import Settings from './components/Settings';
import CompareCities from './components/CompareCities';
import GoogleCalendarSync from './components/GoogleCalendarSync';
import ComfortIndices from './components/ComfortIndices';
import AQIMonitor from './components/AQIMonitor';

// Services
import { fetchFromOWM, fetchFromWAPI } from './services/weatherService';

export default function App() {
  const [query, setQuery] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [unit, setUnit] = useState<'c' | 'f'>(() => (localStorage.getItem('weather-unit') || 'c') as 'c' | 'f');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recent-searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn("Failed to parse recent searches", e);
    }
    return [];
  });
  const [apiSource, setApiSource] = useState('');
  const [pinnedCities, setPinnedCities] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pinned-cities');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn("Failed to parse pinned cities", e);
    }
    return [];
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app-settings');
    const defaultSettings = {
      tiltEnabled: true,
      atmosphereEnabled: true,
      reducedMotion: false,
      autoThemeEnabled: true,
      forceLightTheme: false,
      audioAlertsEnabled: true,
      ambientSoundsEnabled: true
    };
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('app-theme') || 'cyan');

  // Time-based automatic theme switching and manual light mode handler
  useEffect(() => {
    if (settings.autoThemeEnabled) {
      if (weatherData && weatherData.current) {
        if (weatherData.current.isDay) {
          document.body.classList.add('light-theme');
        } else {
          document.body.classList.remove('light-theme');
        }
      } else {
        document.body.classList.remove('light-theme');
      }
    } else {
      if (settings.forceLightTheme) {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    }
  }, [weatherData, settings.autoThemeEnabled, settings.forceLightTheme]);

  const themeColors: Record<string, { color: string; glow: string }> = {
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

  const updateSetting = (key: string, value: boolean) => {
    setSettings((prev: any) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('app-settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Trigger audio cue when a new high-severity weather alert is loaded and audio is enabled
  useEffect(() => {
    if (!weatherData) return;
    
    const originalAlerts = weatherData.alerts || [];
    const hasHighSeverity = originalAlerts.some((alert: any) => {
      const sev = (alert.severity || '').toLowerCase();
      return sev === 'extreme' || sev === 'severe' || sev === 'high' || sev === 'critical' || sev === 'danger';
    });

    if (hasHighSeverity && settings.audioAlertsEnabled) {
      const alertKey = `played-${weatherData.location.name}-${originalAlerts.map((a: any) => a.headline).join('_')}`;
      const lastKey = localStorage.getItem('last-played-alert-key');
      
      if (alertKey !== lastKey) {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            const now = ctx.currentTime;
            
            const beep = (time: number, freq: number, dur: number) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(freq, time);
              
              gain.gain.setValueAtTime(0, time);
              gain.gain.linearRampToValueAtTime(0.12, time + 0.05);
              gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
              
              osc.connect(gain);
              gain.connect(ctx.destination);
              
              osc.start(time);
              osc.stop(time + dur);
            };
            
            beep(now, 850, 0.22);
            beep(now + 0.28, 850, 0.22);
            beep(now + 0.56, 850, 0.35);
          }
        } catch (err) {
          console.warn("Could not play severe alert beep", err);
        }
        localStorage.setItem('last-played-alert-key', alertKey);
      }
    }
  }, [weatherData, settings.audioAlertsEnabled]);

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

  const togglePinCity = (cityName: string) => {
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

  const addToRecentSearches = (cityName: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== cityName.toLowerCase());
      const updated = [cityName, ...filtered].slice(0, 5);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveRecent = (cityName: string) => {
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

  const fetchWeather = useCallback(async (searchQuery: string, isCoords = false) => {
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
    } catch (err: any) {
      setError(err.message === 'City not found' ? err.message : 'Unable to fetch weather from both APIs. Please check your keys or connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather('Hala');
  }, [fetchWeather]);

  const handleUnitToggle = (newUnit: 'c' | 'f') => {
    setUnit(newUnit);
    localStorage.setItem('weather-unit', newUnit);
  };

  const c2f = (c: number) => (c * 9/5) + 32;
  const showTemp = (c: number) => unit === 'f' ? Math.round(c2f(c)) : Math.round(c);

  const handleSearch = (e: FormEvent) => {
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

  const updateBackground = (type: string, isDay: boolean) => {
    const timeClass = isDay ? 'day' : 'night';
    
    // Select and remove any existing weather condition classes safely
    const previousWeatherClasses = Array.from(document.body.classList).filter(c => c.startsWith('weather-'));
    previousWeatherClasses.forEach(c => document.body.classList.remove(c));
    
    // Add the fresh correct one
    document.body.classList.add(`weather-${type}-${timeClass}`);
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

  const BentoWrapper = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );

  return (
    <div className="app-container" id={isSettingsOpen ? "" : "capture-area"}>
      <motion.div className="bg-elements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
        <motion.div className="orb orb-1" animate={{ scale: [1, 1.25, 1], opacity: [0.45, 0.65, 0.45] }} transition={{ repeat: Infinity, duration: 11 }}/>
        <motion.div className="orb orb-2" animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.55, 0.35] }} transition={{ repeat: Infinity, duration: 15 }}/>
        <motion.div className="orb orb-3" animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 19 }}/>
        <motion.div className="orb orb-4" animate={{ scale: [1, 1.4, 1], opacity: [0.25, 0.45, 0.25] }} transition={{ repeat: Infinity, duration: 23 }}/>
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
        currentCondition={weatherData?.current?.conditionType}
        isDay={weatherData?.current?.isDay}
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
            {(weatherData.alerts?.length > 0 || (weatherData.current?.pollutants && (Number(weatherData.current.aqi) >= 3 || Number(weatherData.current.pollutants.pm2_5) > 35 || Number(weatherData.current.pollutants.pm10) > 50))) && (
              <motion.div variants={itemVariants} className="bento-item alerts-full">
                <WeatherAlerts alerts={weatherData.alerts} aqi={weatherData.current.aqi} pollutants={weatherData.current.pollutants} />
              </motion.div>
            )}

            {/* 2. Main Weather Card */}
            {settings.tiltEnabled ? (
              <BentoWrapper className="bento-item current-main">
                <TiltCard>
                  <CurrentWeather 
                    weatherData={weatherData} showTemp={showTemp} apiSource={apiSource} 
                    isPinned={pinnedCities.some(c => c.toLowerCase() === weatherData.location.name.toLowerCase())}
                    onTogglePin={togglePinCity}
                  />
                </TiltCard>
              </BentoWrapper>
            ) : (
              <BentoWrapper className="bento-item current-main">
                <CurrentWeather 
                  weatherData={weatherData} showTemp={showTemp} apiSource={apiSource} 
                  isPinned={pinnedCities.some(c => c.toLowerCase() === weatherData.location.name.toLowerCase())}
                  onTogglePin={togglePinCity}
                />
              </BentoWrapper>
            )}

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
              <WeatherInsights current={weatherData.current} locationName={weatherData.location.name} forecast={weatherData.forecast} unit={unit} />
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

            {/* Google Calendar Integration */}
            <BentoWrapper className="bento-item calendar-sync-bento">
              <GoogleCalendarSync weatherData={weatherData} unit={unit.toUpperCase()} />
            </BentoWrapper>

            {/* Comfort & Lifestyle Indices */}
            <BentoWrapper className="bento-item comfort-bento">
              <ComfortIndices current={weatherData.current} />
            </BentoWrapper>

            {/* High-Purity Air Quality Monitor */}
            <BentoWrapper className="bento-item aqi-bento">
              <AQIMonitor 
                aqi={weatherData.current.aqi} 
                pollutants={weatherData.current.pollutants} 
                tempC={weatherData.current.tempC} 
                windSpeedKph={weatherData.current.windKph} 
              />
            </BentoWrapper>

            {/* 9. Interactive Map */}
            <motion.div variants={itemVariants} className="bento-item map-full">
              <WeatherMap location={weatherData.location} />
            </motion.div>

            {/* 10. 3D Simulator */}
            <motion.div variants={itemVariants} className="bento-item map-full">
              <Weather3DStage 
                condition={weatherData.current.conditionType} 
                isDay={weatherData.current.isDay} 
                temp={weatherData.current.tempC} 
                windSpeed={weatherData.current.windKph} 
                cityName={weatherData.location.name}
                region={weatherData.location.region || weatherData.location.country}
                ambientSoundsEnabled={settings.ambientSoundsEnabled}
              />
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
