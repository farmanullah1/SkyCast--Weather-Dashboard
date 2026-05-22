import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Wind, Share2, Pin, PinOff } from 'lucide-react';

const CurrentWeather = ({ weatherData, showTemp, apiSource, isPinned, onTogglePin, children }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleShare = async () => {
    const text = `Current weather in ${weatherData.location.name}: ${weatherData.current.desc}, ${showTemp(weatherData.current.tempC)}°. Check it out on SkyCast!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SkyCast Weather',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      alert('Weather details copied to clipboard!');
    }
  };

  return (
    <motion.section variants={itemVariants} className="current-weather glass-card highlight-card">
      <div className="location-info">
        <div>
          <h2 className="city-name">{weatherData.location.name}</h2>
          <p className="date-time">{weatherData.location.country} • {weatherData.location.localTimeFormatted}</p>
        </div>
        <div className="header-actions">
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }} 
            onClick={() => onTogglePin(weatherData.location.name)} 
            className={`action-btn ${isPinned ? 'active-pin' : ''}`}
            title={isPinned ? "Unpin City" : "Pin City"}
          >
            {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }} 
            onClick={handleShare} 
            className="action-btn"
            title="Share Weather"
          >
            <Share2 size={18} />
          </motion.button>
          <div className="api-badge">via {apiSource}</div>
        </div>
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
      
      {children}
    </motion.section>
  );
};

export default CurrentWeather;
