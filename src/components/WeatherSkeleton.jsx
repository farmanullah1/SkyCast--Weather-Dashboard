import React from 'react';
import { motion } from 'framer-motion';

const WeatherSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="main-grid"
    >
      {/* Left Column Skeleton */}
      <section className="current-weather glass-card">
        <div className="location-info">
          <div style={{ width: '100%' }}>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-subtitle"></div>
          </div>
        </div>

        <div className="weather-main" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div className="skeleton skeleton-icon"></div>
          <div className="skeleton skeleton-temp"></div>
        </div>

        <div className="weather-details" style={{ width: '100%' }}>
          <div className="skeleton skeleton-detail"></div>
          <div className="skeleton skeleton-detail"></div>
          <div className="skeleton skeleton-detail"></div>
        </div>

        <div className="hourly-section" style={{ marginTop: '20px' }}>
          <div className="skeleton" style={{ height: '24px', width: '150px', marginBottom: '16px' }}></div>
          <div style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton skeleton-hourly-item"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Column Skeleton */}
      <section className="forecast-section glass-card">
        <div className="skeleton" style={{ height: '24px', width: '150px', marginBottom: '16px' }}></div>
        <div className="forecast-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton skeleton-forecast-item"></div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default WeatherSkeleton;
