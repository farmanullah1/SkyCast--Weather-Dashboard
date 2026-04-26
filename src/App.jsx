import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, Droplets, Wind, Thermometer, CloudRain, AlertCircle, Cloud, Sun, Moon, CloudLightning, CloudSnow } from 'lucide-react';
import './index.css';

const API_KEY = '76979e2b7f574734975110457262604';
const BASE_URL = 'https://api.weatherapi.com/v1';

// Component for Toast Error
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="toast">
      <AlertCircle size={20} />
      <span>{message}</span>
    </div>
  );
};

function App() {
  const [query, setQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState(() => localStorage.getItem('weather-unit') || 'c'); // 'c' or 'f'
  const [recentSearches, setRecentSearches] = useState(() => JSON.parse(localStorage.getItem('recent-searches')) || []);

  // Fetch Weather Data
  const fetchWeather = useCallback(async (searchQuery) => {
    if (!searchQuery) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${searchQuery}&days=5&aqi=no&alerts=no`);
      
      if (!response.ok) {
        throw new Error(response.status === 400 || response.status === 404 ? 'City not found. Please try again.' : 'Failed to fetch weather data.');
      }

      const data = await response.json();
      setWeatherData(data);
      updateBackground(data.current.condition.code, data.current.is_day);
      
      // Cache valid search
      if (data.location && data.location.name) {
        setRecentSearches(prev => {
          const newSearches = [data.location.name, ...prev.filter(item => item !== data.location.name)].slice(0, 5);
          localStorage.setItem('recent-searches', JSON.stringify(newSearches));
          return newSearches;
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchWeather('London'); // Default city
  }, [fetchWeather]);

  // Handle Unit Toggle
  const handleUnitToggle = (newUnit) => {
    setUnit(newUnit);
    localStorage.setItem('weather-unit', newUnit);
  };

  // Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchWeather(query.trim());
    }
  };

  // Handle Geolocation
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(`${latitude},${longitude}`);
      },
      (err) => {
        setLoading(false);
        setError('Location access denied or unavailable.');
      }
    );
  };

  // Dynamic Background
  const updateBackground = (code, isDay) => {
    // WeatherAPI codes: https://www.weatherapi.com/docs/weather_conditions.json
    let bgClass = '';
    if (code === 1000) {
      bgClass = isDay ? 'weather-clear-day' : 'weather-clear-night';
    } else if ([1003, 1006, 1009].includes(code)) {
      bgClass = isDay ? 'weather-cloudy-day' : 'weather-cloudy-night';
    } else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243].includes(code)) {
      bgClass = 'weather-rainy';
    } else if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255].includes(code)) {
      bgClass = 'weather-snowy';
    } else {
      bgClass = isDay ? 'weather-cloudy-day' : 'weather-cloudy-night'; // default fallback
    }

    document.body.className = bgClass;
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: 'long' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatHour = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  // Get matching icon (fallback to API icon)
  const getWeatherIcon = (code, isDay, className = "") => {
    if (code === 1000) return isDay ? <Sun className={className} /> : <Moon className={className} />;
    if ([1003, 1006, 1009].includes(code)) return <Cloud className={className} />;
    if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243].includes(code)) return <CloudRain className={className} />;
    if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255].includes(code)) return <CloudSnow className={className} />;
    if ([1087, 1273, 1276].includes(code)) return <CloudLightning className={className} />;
    return <Cloud className={className} />; // fallback
  };

  return (
    <div className="app-container fade-in">
      {/* Header & Controls */}
      <header className="app-header glass-card">
        <div className="brand">
          <CloudRain size={32} />
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
          <button type="submit" className="icon-btn" disabled={loading || !query.trim()} aria-label="Search">
            <Search size={20} />
          </button>
          <button type="button" className="icon-btn" onClick={handleGeolocation} disabled={loading} title="Use My Location" aria-label="Use My Location">
            <MapPin size={20} />
          </button>
        </form>

        <div className="unit-toggle">
          <button 
            className={`unit-btn ${unit === 'c' ? 'active' : ''}`}
            onClick={() => handleUnitToggle('c')}
          >
            °C
          </button>
          <button 
            className={`unit-btn ${unit === 'f' ? 'active' : ''}`}
            onClick={() => handleUnitToggle('f')}
          >
            °F
          </button>
        </div>
      </header>

      {/* Main Content */}
      {loading ? (
        <div className="loader-container glass-card">
          <Loader2 className="spinner" size={48} />
          <p>Fetching weather data...</p>
        </div>
      ) : weatherData ? (
        <main className="main-grid fade-in">
          {/* Left Column: Current Weather */}
          <section className="current-weather glass-card">
            <div className="location-info">
              <div>
                <h2 className="city-name">{weatherData.location.name}</h2>
                <p className="date-time">{weatherData.location.country} • {new Date(weatherData.location.localtime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
              </div>
            </div>

            <div className="weather-main">
              <div className="weather-condition">
                <img src={weatherData.current.condition.icon} alt={weatherData.current.condition.text} width="80" height="80" />
                <span className="weather-desc">{weatherData.current.condition.text}</span>
              </div>
              <div className="temperature">
                {unit === 'c' ? Math.round(weatherData.current.temp_c) : Math.round(weatherData.current.temp_f)}°
              </div>
            </div>

            <div className="weather-details">
              <div className="detail-item">
                <Thermometer className="detail-icon" size={24} />
                <div className="detail-info">
                  <span className="detail-label">Feels Like</span>
                  <span className="detail-value">{unit === 'c' ? Math.round(weatherData.current.feelslike_c) : Math.round(weatherData.current.feelslike_f)}°</span>
                </div>
              </div>
              <div className="detail-item">
                <Droplets className="detail-icon" size={24} />
                <div className="detail-info">
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{weatherData.current.humidity}%</span>
                </div>
              </div>
              <div className="detail-item">
                <Wind className="detail-icon" size={24} />
                <div className="detail-info">
                  <span className="detail-label">Wind</span>
                  <span className="detail-value">{Math.round(weatherData.current.wind_kph)} km/h</span>
                </div>
              </div>
            </div>
            
            {/* Hourly Forecast Bonus */}
            {weatherData.forecast && weatherData.forecast.forecastday[0] && (
               <div className="hourly-section">
                  <h3 style={{fontSize: '1.1rem', marginBottom: '12px', marginTop: '16px'}}>Today's Forecast</h3>
                  <div className="hourly-forecast">
                    {weatherData.forecast.forecastday[0].hour
                      .filter(hour => new Date(hour.time).getTime() >= new Date(weatherData.location.localtime).getTime() - 3600000)
                      .slice(0, 6)
                      .map((hour, index) => (
                        <div key={index} className="hourly-item">
                          <span className="hourly-time">{index === 0 ? 'Now' : formatHour(hour.time)}</span>
                          <img src={hour.condition.icon} alt={hour.condition.text} width="40" height="40" />
                          <span className="hourly-temp">{unit === 'c' ? Math.round(hour.temp_c) : Math.round(hour.temp_f)}°</span>
                        </div>
                      ))
                    }
                  </div>
               </div>
            )}
          </section>

          {/* Right Column: 5-Day Forecast */}
          {weatherData.forecast && (
            <section className="forecast-section glass-card">
              <h3>5-Day Forecast</h3>
              <div className="forecast-list">
                {weatherData.forecast.forecastday.map((day, index) => (
                  <div key={index} className="forecast-item">
                    <span className="forecast-day">{index === 0 ? 'Today' : formatDate(day.date)}</span>
                    <div className="forecast-condition">
                      <img src={day.day.condition.icon} alt={day.day.condition.text} width="32" height="32" />
                      <span>{day.day.condition.text}</span>
                    </div>
                    <div className="forecast-temps">
                      <span className="temp-high">{unit === 'c' ? Math.round(day.day.maxtemp_c) : Math.round(day.day.maxtemp_f)}°</span>
                      <span className="temp-low">{unit === 'c' ? Math.round(day.day.mintemp_c) : Math.round(day.day.mintemp_f)}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      ) : null}

      <Toast message={error} onClose={() => setError(null)} />
    </div>
  );
}

export default App;
