import React from 'react';
import { motion } from 'framer-motion';

const HourlyForecast = ({ hourly, showTemp }) => {
  return (
    <div className="hourly-section">
      <h3 className="section-title">Today's Forecast</h3>
      <div className="hourly-forecast">
        {hourly.map((hour, index) => (
          <motion.div 
            whileHover={{ y: -5 }} 
            key={index} 
            className="hourly-item glass-morphism"
          >
            <span className="hourly-time">{index === 0 ? 'Now' : hour.hourFormatted}</span>
            <img src={hour.iconUrl} alt="hourly" width="48" height="48" />
            <span className="hourly-temp">{showTemp(hour.tempC)}°</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecast;
