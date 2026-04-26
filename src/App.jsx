import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, Droplets, Wind, Thermometer, CloudRain, AlertCircle, Cloud, Sun, Moon, CloudLightning, CloudSnow } from 'lucide-react';
import './index.css';

const API_KEY = 'bf2acb8e9feb96662538e68b25f29874';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

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

  // Fetch Weather Data (OpenWeatherMap)
  const fetchWeather = useCallback(async (searchQuery, isCoords = false) => {
    if (!searchQuery && !isCoords) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let currentUrl = '';
      let forecastUrl = '';
      
      if (isCoords) {
        const [lat, lon] = searchQuery.split(',');
        currentUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      } else {
        currentUrl = `${BASE_URL}/weather?q=${searchQuery}&appid=${API_KEY}&units=metric`;
        forecastUrl = `${BASE_URL}/forecast?q=${searchQuery}&appid=${API_KEY}&units=metric`;
      }

      const [currentRes, forecastRes] = await Promise.all([
        fetch(currentUrl),
        fetch(forecastUrl)
      ]);

      if (!currentRes.ok || !forecastRes.ok) {
        throw new Error(currentRes.status === 404 ? 'City not found. Please try again.' : 'Failed to fetch weather data.');
      }

      const current = await currentRes.json();
      const forecast = await forecastRes.json();
      
      const data = { current, forecast };
      setWeatherData(data);
      
      const isDay = current.weather[0].icon.includes('d');
      updateBackground(current.weather[0].id, isDay);
      
      // Cache valid search
      if (current.name) {
        setRecentSearches(prev => {
          const newSearches = [current.name, ...prev.filter(item => item !== current.name)].slice(0, 5);
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

  // Convert Celsius to Fahrenheit if needed
  const convertTemp = (tempC) => {
    if (unit === 'f') {
      return (tempC * 9/5) + 32;
    }
    return tempC;
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
        fetchWeather(`${latitude},${longitude}`, true);
      },
      (err) => {
        setLoading(false);
        setError('Location access denied or unavailable.');
      }
    );
  };

  // Dynamic Background
  const updateBackground = (code, isDay) => {
    // OpenWeatherMap condition codes
    let bgClass = '';
    if (code >= 200 && code < 300) {
      bgClass = 'weather-rainy'; // Thunderstorm
    } else if (code >= 300 && code < 600) {
      bgClass = 'weather-rainy'; // Drizzle / Rain
    } else if (code >= 600 && code < 700) {
      bgClass = 'weather-snowy'; // Snow
    } else if (code >= 700 && code < 800) {
      bgClass = isDay ? 'weather-cloudy-day' : 'weather-cloudy-night'; // Atmosphere (fog, mist)
    } else if (code === 800) {
      bgClass = isDay ? 'weather-clear-day' : 'weather-clear-night'; // Clear
    } else if (code > 800) {
      bgClass = isDay ? 'weather-cloudy-day' : 'weather-cloudy-night'; // Clouds
    } else {
      bgClass = isDay ? 'weather-clear-day' : 'weather-clear-night'; // Fallback
    }

    document.body.className = bgClass;
  };

  // Process 5-day forecast from 3-hour data
  const getDailyForecast = (list) => {
    const dailyData = {};
    list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          min: item.main.temp_min,
          max: item.main.temp_max,
          icon: item.weather[0].icon,
          desc: item.weather[0].description,
          dt: item.dt
        };
      } else {
        if (item.main.temp_min < dailyData[date].min) dailyData[date].min = item.main.temp_min;
        if (item.main.temp_max > dailyData[date].max) dailyData[date].max = item.main.temp_max;
        // Prefer icon from midday if available (around 12:00:00)
        if (item.dt_txt.includes('12:00:00')) {
          dailyData[date].icon = item.weather[0].icon;
          dailyData[date].desc = item.weather[0].description;
        }
      }
    });

    return Object.values(dailyData).slice(0, 5); // Return 5 days
  };

  // Process next 6 hourly forecasts
  const getHourlyForecast = (list) => {
    return list.slice(0, 6);
  };

  const formatDate = (unixTime) => {
    const options = { weekday: 'long' };
    return new Date(unixTime * 1000).toLocaleDateString('en-US', options);
  };

  const formatHour = (unixTime) => {
    return new Date(unixTime * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  const getIconUrl = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

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
                <h2 className="city-name">{weatherData.current.name}</h2>
                <p className="date-time">{weatherData.current.sys.country} • {new Date(weatherData.current.dt * 1000).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
              </div>
            </div>

            <div className="weather-main">
              <div className="weather-condition">
                <img src={getIconUrl(weatherData.current.weather[0].icon)} alt={weatherData.current.weather[0].description} width="80" height="80" />
                <span className="weather-desc">{weatherData.current.weather[0].description}</span>
              </div>
              <div className="temperature">
                {Math.round(convertTemp(weatherData.current.main.temp))}°
              </div>
            </div>

            <div className="weather-details">
              <div className="detail-item">
                <Thermometer className="detail-icon" size={24} />
                <div className="detail-info">
                  <span className="detail-label">Feels Like</span>
                  <span className="detail-value">{Math.round(convertTemp(weatherData.current.main.feels_like))}°</span>
                </div>
              </div>
              <div className="detail-item">
                <Droplets className="detail-icon" size={24} />
                <div className="detail-info">
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{weatherData.current.main.humidity}%</span>
                </div>
              </div>
              <div className="detail-item">
                <Wind className="detail-icon" size={24} />
                <div className="detail-info">
                  <span className="detail-label">Wind</span>
                  {/* OWM wind speed is meter/sec in metric */}
                  <span className="detail-value">{Math.round(weatherData.current.wind.speed * 3.6)} km/h</span>
                </div>
              </div>
            </div>
            
            {/* Hourly Forecast Bonus */}
            {weatherData.forecast && weatherData.forecast.list && (
               <div className="hourly-section">
                  <h3 style={{fontSize: '1.1rem', marginBottom: '12px', marginTop: '16px'}}>Upcoming Forecast</h3>
                  <div className="hourly-forecast">
                    {getHourlyForecast(weatherData.forecast.list).map((hour, index) => (
                      <div key={index} className="hourly-item">
                        <span className="hourly-time">{formatHour(hour.dt)}</span>
                        <img src={getIconUrl(hour.weather[0].icon)} alt={hour.weather[0].description} width="40" height="40" />
                        <span className="hourly-temp">{Math.round(convertTemp(hour.main.temp))}°</span>
                      </div>
                    ))}
                  </div>
               </div>
            )}
          </section>

          {/* Right Column: 5-Day Forecast */}
          {weatherData.forecast && weatherData.forecast.list && (
            <section className="forecast-section glass-card">
              <h3>5-Day Forecast</h3>
              <div className="forecast-list">
                {getDailyForecast(weatherData.forecast.list).map((day, index) => (
                  <div key={index} className="forecast-item">
                    <span className="forecast-day">{index === 0 ? 'Today' : formatDate(day.dt)}</span>
                    <div className="forecast-condition">
                      <img src={getIconUrl(day.icon)} alt={day.desc} width="32" height="32" />
                      <span style={{textTransform: 'capitalize'}}>{day.desc}</span>
                    </div>
                    <div className="forecast-temps">
                      <span className="temp-high">{Math.round(convertTemp(day.max))}°</span>
                      <span className="temp-low">{Math.round(convertTemp(day.min))}°</span>
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
