import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, CloudRain, MapPinIcon, Settings as SettingsIcon, ArrowLeftRight } from 'lucide-react';
import { fetchCitySuggestions } from '../services/weatherService';
import VoiceSearch from './VoiceSearch';

const Header = ({ query, setQuery, handleSearch, handleGeolocation, loading, unit, handleUnitToggle, fetchWeather, onOpenSettings, onOpenCompare }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 3) {
        const results = await fetchCitySuggestions(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSelectCity = (city) => {
    const cityStr = `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`;
    setQuery(cityStr);
    setShowSuggestions(false);
    fetchWeather(cityStr);
  };

  return (
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

      <div className="search-wrapper" ref={dropdownRef}>
        <form onSubmit={handleSearch} className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search for a city..."
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 3 && setShowSuggestions(true)}
              disabled={loading}
              aria-label="Search for a city"
              aria-autocomplete="list"
              aria-controls="suggestions-list"
              aria-expanded={showSuggestions}
            />
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="icon-btn" disabled={loading || !query.trim()} aria-label="Submit search">
            <Search size={20} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="icon-btn" onClick={handleGeolocation} disabled={loading} title="Use My Location" aria-label="Use my current location">
            <MapPin size={20} />
          </motion.button>
          <VoiceSearch onResult={(res) => { setQuery(res); fetchWeather(res); }} disabled={loading} />
        </form>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.ul 
              id="suggestions-list"
              role="listbox"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="suggestions-dropdown glass-morphism"
            >
              {suggestions.map((city, idx) => (
                <li key={idx} role="option" onClick={() => onSelectCity(city)} className="suggestion-item">
                  <MapPinIcon size={16} className="item-icon" />
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

      <div className="header-right">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="icon-btn compare-btn"
          onClick={onOpenCompare}
          title="Compare Cities"
          style={{ marginRight: '4px' }}
        >
          <ArrowLeftRight size={20} />
        </motion.button>

        <div className="unit-toggle">
          <button className={`unit-btn ${unit === 'c' ? 'active' : ''}`} onClick={() => handleUnitToggle('c')}>°C</button>
          <button className={`unit-btn ${unit === 'f' ? 'active' : ''}`} onClick={() => handleUnitToggle('f')}>°F</button>
        </div>
        
        <motion.button 
          whileHover={{ rotate: 90 }} 
          className="icon-btn settings-btn" 
          onClick={onOpenSettings}
          title="Settings"
        >
          <SettingsIcon size={20} />
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Header;
