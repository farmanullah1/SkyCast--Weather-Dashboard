import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Sunrise, Sunset, Eye, Wind, Activity } from 'lucide-react';

const ExtendedMetrics = ({ current }) => {
  const metrics = [
    {
      label: 'UV Index',
      value: current.uvIndex,
      icon: <Sun size={20} />,
      desc: current.uvIndex <= 2 ? 'Low' : current.uvIndex <= 5 ? 'Moderate' : 'High'
    },
    {
      label: 'AQI',
      value: current.aqi || 'N/A',
      icon: <Activity size={20} />,
      desc: current.aqi === 1 ? 'Good' : current.aqi === 2 ? 'Fair' : 'Poor'
    },
    {
      label: 'Sunrise',
      value: current.sunrise,
      icon: <Sunrise size={20} />,
      desc: 'Local Time'
    },
    {
      label: 'Sunset',
      value: current.sunset,
      icon: <Sunset size={20} />,
      desc: 'Local Time'
    },
    {
      label: 'Visibility',
      value: `${current.visibility} km`,
      icon: <Eye size={20} />,
      desc: current.visibility >= 10 ? 'Clear' : 'Hazy'
    },
    {
      label: 'Wind Speed',
      value: `${Math.round(current.windKph)} km/h`,
      icon: <Wind size={20} />,
      desc: 'Breeze'
    }
  ];

  return (
    <div className="extended-metrics">
      <h3 className="section-title">Extended Details</h3>
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <motion.div 
            key={index}
            whileHover={{ y: -5 }}
            className="metric-card glass-morphism"
          >
            <div className="metric-header">
              <span className="metric-icon">{metric.icon}</span>
              <span className="metric-label">{metric.label}</span>
            </div>
            <div className="metric-body">
              <span className="metric-value">{metric.value}</span>
              <span className="metric-desc">{metric.desc}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExtendedMetrics;
