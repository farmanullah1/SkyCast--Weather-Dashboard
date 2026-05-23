import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, ArrowLeftRight, Flame, Droplet, Wind, ShieldAlert, Sparkles } from 'lucide-react';
import Modal from './Modal';
import { fetchCitySuggestions, fetchFromOWM, fetchFromWAPI } from '../services/weatherService';

const CompareCities = ({ isOpen, onClose, currentCity, currentData, unit }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length >= 3) {
        const results = await fetchCitySuggestions(query.trim());
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = async (city) => {
    const cityStr = `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`;
    setQuery(cityStr);
    setShowSuggestions(false);
    setLoading(true);
    setError(null);
    setCompareData(null);

    try {
      try {
        const data = await fetchFromOWM(cityStr);
        setCompareData(data);
      } catch (owmErr) {
        console.warn("OWM comparison fetch failed, trying fallback...", owmErr);
        const data = await fetchFromWAPI(cityStr);
        setCompareData(data);
      }
    } catch (err) {
      console.error(err);
      setError("Could not retrieve weather data for comparison.");
    } finally {
      setLoading(false);
    }
  };

  const c2f = (c) => (c * 9/5) + 32;
  const displayTemp = (c) => unit === 'f' ? Math.round(c2f(c)) : Math.round(c);

  const getDifferentialAnalysis = () => {
    if (!compareData) return '';
    const tempDiff = compareData.current.tempC - currentData.current.tempC;
    const humDiff = compareData.current.humidity - currentData.current.humidity;
    
    let tempText = '';
    if (Math.abs(tempDiff) < 1) tempText = 'has a similar temperature';
    else if (tempDiff > 0) tempText = `is warmer by ${Math.round(Math.abs(tempDiff))}°${unit.toUpperCase()}`;
    else tempText = `is cooler by ${Math.round(Math.abs(tempDiff))}°${unit.toUpperCase()}`;

    let humText = '';
    if (Math.abs(humDiff) < 5) humText = 'nearly identical humidity';
    else if (humDiff > 0) humText = `higher humidity (+${Math.round(Math.abs(humDiff))}%)`;
    else humText = `lower humidity (-${Math.round(Math.abs(humDiff))}%)`;

    return `${compareData.location.name} ${tempText} and experiences ${humText} compared to ${currentData.location.name}.`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compare Cities">
      <div className="compare-container">
        {/* Search input to select compare city */}
        <div className="search-wrapper" ref={dropdownRef} style={{ maxWidth: '100%', marginBottom: '20px' }}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search city to compare..."
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 3 && setShowSuggestions(true)}
              disabled={loading}
            />
          </div>

          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="suggestions-dropdown glass-morphism"
                style={{ width: '100%' }}
              >
                {suggestions.map((city, idx) => (
                  <li key={idx} onClick={() => handleSelectCity(city)} className="suggestion-item">
                    <MapPin size={16} className="item-icon" />
                    <div className="item-text">
                      <span className="city-name-small">{city.name}</span>
                      <span className="city-region">{city.state ? `${city.state}, ` : ''}{city.country}</span>
                    </div>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Loading and Error states */}
        {loading && (
          <div className="compare-loader" style={{ textAlign: 'center', padding: '30px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <ArrowLeftRight size={32} color="var(--accent-color)" />
            </motion.div>
            <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Loading comparisons...</p>
          </div>
        )}

        {error && <div className="compare-error" style={{ color: '#ff7675', fontWeight: 700, textAlign: 'center', padding: '10px' }}>{error}</div>}

        {/* Side-by-Side comparison dashboard */}
        {compareData && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="comparison-dashboard"
          >
            {/* Header side-by-side tags */}
            <div className="comp-header-row">
              <div className="comp-header-card glass-morphism active-city">
                <span className="comp-label">Current</span>
                <span className="comp-city-title">{currentData.location.name}</span>
                <div className="comp-main-stat">
                  <img src={currentData.current.iconUrl} alt="weather" width="48" height="48" />
                  <span className="comp-degree">{displayTemp(currentData.current.tempC)}°</span>
                </div>
              </div>

              <div className="comp-versus-orb">
                <ArrowLeftRight size={18} />
              </div>

              <div className="comp-header-card glass-morphism target-city">
                <span className="comp-label">Compare</span>
                <span className="comp-city-title">{compareData.location.name}</span>
                <div className="comp-main-stat">
                  <img src={compareData.current.iconUrl} alt="weather" width="48" height="48" />
                  <span className="comp-degree">{displayTemp(compareData.current.tempC)}°</span>
                </div>
              </div>
            </div>

            {/* Differential Advisory Card */}
            <div className="comp-advisory glass-morphism">
              <Sparkles size={20} className="comp-advisory-icon" />
              <p className="comp-advisory-text">{getDifferentialAnalysis()}</p>
            </div>

            {/* Metrics Comparisons with relative progress bars */}
            <div className="comp-metrics-list">
              {/* Temperature Bar */}
              <div className="comp-metric-bar-group">
                <div className="comp-bar-labels">
                  <span className="comp-bar-name"><Flame size={16} /> Temperature</span>
                  <span className="comp-bar-values">{displayTemp(currentData.current.tempC)}° vs {displayTemp(compareData.current.tempC)}°</span>
                </div>
                <div className="comp-progress-track">
                  {/* Two comparative bars */}
                  <div className="comp-progress-val current-bar" style={{ width: `${Math.min(100, Math.max(10, ((currentData.current.tempC + 10) / 50) * 100))}%` }}></div>
                  <div className="comp-progress-val target-bar" style={{ width: `${Math.min(100, Math.max(10, ((compareData.current.tempC + 10) / 50) * 100))}%` }}></div>
                </div>
              </div>

              {/* Humidity Bar */}
              <div className="comp-metric-bar-group">
                <div className="comp-bar-labels">
                  <span className="comp-bar-name"><Droplet size={16} /> Humidity</span>
                  <span className="comp-bar-values">{currentData.current.humidity}% vs {compareData.current.humidity}%</span>
                </div>
                <div className="comp-progress-track">
                  <div className="comp-progress-val current-bar" style={{ width: `${currentData.current.humidity}%` }}></div>
                  <div className="comp-progress-val target-bar" style={{ width: `${compareData.current.humidity}%` }}></div>
                </div>
              </div>

              {/* Wind Speed Bar */}
              <div className="comp-metric-bar-group">
                <div className="comp-bar-labels">
                  <span className="comp-bar-name"><Wind size={16} /> Wind Speed</span>
                  <span className="comp-bar-values">{Math.round(currentData.current.windKph)} vs {Math.round(compareData.current.windKph)} km/h</span>
                </div>
                <div className="comp-progress-track">
                  <div className="comp-progress-val current-bar" style={{ width: `${Math.min(100, (currentData.current.windKph / 60) * 100)}%` }}></div>
                  <div className="comp-progress-val target-bar" style={{ width: `${Math.min(100, (compareData.current.windKph / 60) * 100)}%` }}></div>
                </div>
              </div>

              {/* Air Quality (if available) */}
              {currentData.current.aqi !== 'N/A' && compareData.current.aqi !== 'N/A' && (
                <div className="comp-metric-bar-group">
                  <div className="comp-bar-labels">
                    <span className="comp-bar-name"><ShieldAlert size={16} /> AQI (EPA index)</span>
                    <span className="comp-bar-values">{currentData.current.aqi} vs {compareData.current.aqi}</span>
                  </div>
                  <div className="comp-progress-track">
                    <div className="comp-progress-val current-bar" style={{ width: `${(currentData.current.aqi / 6) * 100}%` }}></div>
                    <div className="comp-progress-val target-bar" style={{ width: `${(compareData.current.aqi / 6) * 100}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
};

export default CompareCities;
