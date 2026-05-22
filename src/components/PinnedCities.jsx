import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, PinOff, Cloud, Thermometer, Wind, X } from 'lucide-react';
import { fetchFromOWM } from '../services/weatherService';

const PinnedCities = ({ pinnedCities, onRemove, onSelect, unit }) => {
  const [cityData, setCityData] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      const newData = {};
      for (const city of pinnedCities) {
        try {
          const data = await fetchFromOWM(city);
          newData[city] = data;
        } catch (err) {
          console.error(`Failed to fetch pinned city: ${city}`, err);
        }
      }
      setCityData(newData);
    };

    if (pinnedCities.length > 0) {
      fetchAllData();
    }
  }, [pinnedCities]);

  const c2f = (c) => Math.round((c * 9/5) + 32);
  const displayTemp = (c) => unit === 'f' ? c2f(c) : Math.round(c);

  if (pinnedCities.length === 0) return null;

  return (
    <div className="pinned-cities-section">
      <h3 className="section-title">
        <Pin size={20} className="pin-icon-fixed" />
        Pinned Locations
      </h3>
      <div className="pinned-grid">
        <AnimatePresence>
          {pinnedCities.map((city) => {
            const data = cityData[city];
            return (
              <motion.div 
                key={city}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ y: -5 }}
                className="pinned-card glass-morphism"
              >
                <div className="pinned-header">
                  <span className="pinned-name" onClick={() => onSelect(city)}>{city}</span>
                  <button className="unpin-btn" onClick={() => onRemove(city)}>
                    <X size={14} />
                  </button>
                </div>
                
                {data ? (
                  <div className="pinned-body" onClick={() => onSelect(city)}>
                    <div className="pinned-main">
                      <img src={data.current.iconUrl} alt="weather" width="40" height="40" />
                      <span className="pinned-temp">{displayTemp(data.current.tempC)}°</span>
                    </div>
                    <div className="pinned-footer">
                      <span className="pinned-desc">{data.current.desc}</span>
                      <div className="pinned-stats">
                         <div className="p-stat"><Wind size={12} /> {Math.round(data.current.windKph)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pinned-loading">Updating...</div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PinnedCities;
