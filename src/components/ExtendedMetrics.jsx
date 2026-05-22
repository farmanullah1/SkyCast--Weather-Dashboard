import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Sunrise, Sunset, Eye, Wind, Activity } from 'lucide-react';
import Modal from './Modal';

const ExtendedMetrics = ({ current }) => {
  const [isAQIModalOpen, setIsAQIModalOpen] = useState(false);

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
      desc: current.aqi === 1 ? 'Good' : current.aqi === 2 ? 'Fair' : 'Poor',
      clickable: !!current.pollutants
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

  const pollutantLabels = {
    co: 'Carbon Monoxide',
    no2: 'Nitrogen Dioxide',
    o3: 'Ozone',
    so2: 'Sulfur Dioxide',
    pm2_5: 'PM 2.5',
    pm10: 'PM 10'
  };

  return (
    <div className="extended-metrics">
      <h3 className="section-title">Extended Details</h3>
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <motion.div 
            key={index}
            whileHover={{ y: -5 }}
            className={`metric-card glass-morphism ${metric.clickable ? 'clickable' : ''}`}
            onClick={() => metric.clickable && setIsAQIModalOpen(true)}
          >
            <div className="metric-header">
              <span className="metric-icon">{metric.icon}</span>
              <span className="metric-label">{metric.label}</span>
            </div>
            <div className="metric-body">
              <span className="metric-value">{metric.value}</span>
              <span className="metric-desc">{metric.desc}</span>
            </div>
            {metric.clickable && <span className="click-hint">View Details</span>}
          </motion.div>
        ))}
      </div>

      <Modal 
        isOpen={isAQIModalOpen} 
        onClose={() => setIsAQIModalOpen(false)} 
        title="Air Quality Breakdown"
      >
        <div className="pollutant-grid">
          {current.pollutants && Object.entries(current.pollutants).map(([key, val]) => (
            <div key={key} className="pollutant-card glass-morphism">
              <span className="pollutant-label">{pollutantLabels[key] || key}</span>
              <div className="pollutant-body">
                <span className="pollutant-value">{val}</span>
                <span className="pollutant-unit">μg/m³</span>
              </div>
            </div>
          ))}
        </div>
        <p className="aqi-footer-note">* Based on US EPA standard index.</p>
      </Modal>
    </div>
  );
};

export default ExtendedMetrics;
