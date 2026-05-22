import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, CloudRain } from 'lucide-react';

const Header = ({ query, setQuery, handleSearch, handleGeolocation, loading, unit, handleUnitToggle }) => {
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
  );
};

export default Header;
