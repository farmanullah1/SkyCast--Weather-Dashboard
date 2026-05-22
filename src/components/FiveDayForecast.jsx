import React from 'react';
import { motion } from 'framer-motion';

const FiveDayForecast = ({ forecast, showTemp }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.section variants={itemVariants} className="forecast-section glass-card">
      <h3 className="section-title">5-Day Forecast</h3>
      <div className="forecast-list">
        {forecast.map((day, index) => (
          <motion.div 
            whileHover={{ scale: 1.02, x: 5 }}
            key={index} 
            className="forecast-item glass-morphism"
          >
            <span className="forecast-day">{day.dateFormatted}</span>
            <div className="forecast-condition">
              <img src={day.iconUrl} alt={day.desc} width="40" height="40" />
              <span className="forecast-desc">{day.desc}</span>
            </div>
            <div className="forecast-temps">
              <span className="temp-high">{showTemp(day.maxC)}°</span>
              <span className="temp-low">{showTemp(day.minC)}°</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default FiveDayForecast;
