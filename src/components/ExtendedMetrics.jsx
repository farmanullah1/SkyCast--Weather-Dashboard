import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Sunrise, Sunset, Eye, Wind, Activity, Droplets } from 'lucide-react';
import Modal from './Modal';

const ExtendedMetrics = ({ current }) => {
  const [isAQIModalOpen, setIsAQIModalOpen] = useState(false);

  const getCardinalDirection = (deg) => {
    if (deg === undefined || deg === null) return 'N/A';
    const val = Math.floor((deg / 22.5) + 0.5);
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
  };

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
      icon: (
        <div className="wind-compass-dial" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" style={{ transform: `rotate(${current.windDegree || 0}deg)`, transition: 'transform 1s cubic-bezier(0.25, 0.8, 0.25, 1)' }}>
            <polygon points="12,3 15,10 12,8 9,10" fill="var(--accent-color)" />
            <polygon points="12,21 15,14 12,16 9,14" fill="rgba(255,255,255,0.3)" />
          </svg>
        </div>
      ),
      desc: `Dir: ${getCardinalDirection(current.windDegree)} (${current.windDegree || 0}°)`
    },
    {
      label: 'Pressure',
      value: `${current.pressureMb} mb`,
      icon: <Activity size={20} />,
      desc: 'Atmospheric'
    },
    {
      label: 'Dew Point',
      value: `${current.dewPointC}°C`,
      icon: <Droplets size={20} />,
      desc: 'Humidity'
    },
    {
      label: 'Moon Phase',
      value: current.moon_phase,
      icon: <div className="moon-icon-placeholder" />, 
      desc: `${current.moon_illumination}% Illum.`
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
