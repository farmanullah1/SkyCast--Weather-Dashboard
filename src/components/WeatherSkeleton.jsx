import React from 'react';
import { motion } from 'framer-motion';

const WeatherSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bento-grid"
    >
      {/* 1. Main Current Weather Card Skeleton */}
      <div className="bento-item current-main glass-card">
        <div className="location-info">
          <div style={{ width: '100%' }}>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-subtitle"></div>
          </div>
        </div>
        <div className="weather-main" style={{ width: '100%' }}>
          <div className="skeleton skeleton-icon"></div>
          <div className="skeleton skeleton-temp"></div>
        </div>
        <div className="weather-details" style={{ width: '100%', marginTop: '20px' }}>
          <div className="skeleton skeleton-detail"></div>
          <div className="skeleton skeleton-detail"></div>
          <div className="skeleton skeleton-detail"></div>
        </div>
      </div>

      {/* 2. 5-Day Forecast Sidebar Skeleton */}
      <div className="bento-item forecast-vertical glass-card">
        <div className="skeleton" style={{ height: '24px', width: '150px', marginBottom: '20px' }}></div>
        <div className="forecast-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton skeleton-forecast-item"></div>
          ))}
        </div>
      </div>

      {/* 3. Hourly Forecast Skeleton */}
      <div className="bento-item hourly-trends glass-card">
        <div className="skeleton" style={{ height: '24px', width: '150px', marginBottom: '16px' }}></div>
        <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton skeleton-hourly-item"></div>
          ))}
        </div>
      </div>

      {/* 4. Insights Skeleton */}
      <div className="bento-item insights-card glass-card">
        <div className="skeleton" style={{ height: '24px', width: '120px', marginBottom: '16px' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton" style={{ height: '54px', width: '100%', borderRadius: '20px' }}></div>
          <div className="skeleton" style={{ height: '54px', width: '100%', borderRadius: '20px' }}></div>
          <div className="skeleton" style={{ height: '54px', width: '100%', borderRadius: '20px' }}></div>
        </div>
      </div>

      {/* 5. Chart Skeleton */}
      <div className="bento-item chart-full glass-card">
        <div className="skeleton" style={{ height: '24px', width: '180px', marginBottom: '20px' }}></div>
        <div className="skeleton" style={{ height: '200px', width: '100%', borderRadius: '24px' }}></div>
      </div>

      {/* 6. Extended Metrics Skeleton */}
      <div className="bento-item metrics-full glass-card">
        <div className="skeleton" style={{ height: '24px', width: '160px', marginBottom: '20px' }}></div>
        <div className="metrics-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: '110px', borderRadius: '22px' }}></div>
          ))}
        </div>
      </div>

      {/* 7. Sun Track Skeleton */}
      <div className="bento-item sun-track glass-card">
        <div className="skeleton" style={{ height: '24px', width: '130px', marginBottom: '20px' }}></div>
        <div className="skeleton" style={{ height: '120px', width: '100%', borderRadius: '24px' }}></div>
      </div>

      {/* 8. Map Skeleton */}
      <div className="bento-item map-full glass-card">
        <div className="skeleton" style={{ height: '24px', width: '150px', marginBottom: '20px' }}></div>
        <div className="skeleton" style={{ height: '350px', width: '100%', borderRadius: '24px' }}></div>
      </div>
    </motion.div>
  );
};

export default WeatherSkeleton;
