import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shirt, Footprints, Info } from 'lucide-react';

const WeatherInsights = ({ current }) => {
  const { tempC, humidity, desc, uvIndex, windKph } = current;

  const getAdvice = () => {
    let advice = {
      clothing: "Casual comfort",
      activity: "Great for outdoors",
      caution: "No major concerns"
    };

    if (tempC < 10) advice.clothing = "Heavy coat & layers";
    else if (tempC < 20) advice.clothing = "Light jacket or sweater";
    else if (tempC > 30) advice.clothing = "Breathable linen or cotton";

    if (uvIndex >= 6) advice.caution = "High UV: Apply sunscreen!";
    if (humidity > 80) advice.caution = "High humidity: Stay hydrated.";
    if (windKph > 40) advice.activity = "Windy: Avoid cycling or high paths.";

    if (desc.includes('rain') || desc.includes('drizzle')) {
      advice.clothing += " + Umbrella";
      advice.activity = "Indoor activities recommended";
    }

    return advice;
  };

  const advice = getAdvice();

  return (
    <div className="weather-insights">
      <h3 className="section-title">SkyCast Insights</h3>
      <div className="insights-grid">
        <motion.div whileHover={{ scale: 1.02 }} className="insight-card glass-morphism">
          <Shirt size={24} className="insight-icon" />
          <div className="insight-info">
            <span className="insight-label">Clothing</span>
            <span className="insight-value">{advice.clothing}</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="insight-card glass-morphism">
          <Footprints size={24} className="insight-icon" />
          <div className="insight-info">
            <span className="insight-label">Activity</span>
            <span className="insight-value">{advice.activity}</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="insight-card glass-morphism warning">
          <Info size={24} className="insight-icon" />
          <div className="insight-info">
            <span className="insight-label">Watch Out</span>
            <span className="insight-value">{advice.caution}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WeatherInsights;
