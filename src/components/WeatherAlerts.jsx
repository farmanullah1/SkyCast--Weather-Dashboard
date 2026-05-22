import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';

const WeatherAlerts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="weather-alerts-container">
      {alerts.map((alert, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`alert-card ${alert.severity?.toLowerCase() || 'info'}`}
        >
          <div className="alert-header">
            <AlertTriangle size={20} className="alert-icon" />
            <span className="alert-headline">{alert.headline}</span>
          </div>
          <p className="alert-desc">{alert.desc}</p>
          {alert.areas && <span className="alert-areas">Affected: {alert.areas}</span>}
        </motion.div>
      ))}
    </div>
  );
};

export default WeatherAlerts;
