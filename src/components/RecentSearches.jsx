import React from 'react';
import { motion } from 'framer-motion';
import { History, X } from 'lucide-react';

const RecentSearches = ({ searches, onSearch, onRemove, onClear }) => {
  if (searches.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="recent-searches"
    >
      <div className="recent-header">
        <span className="recent-title">
          <History size={14} />
          Recent Searches
        </span>
        <button className="clear-all" onClick={onClear}>Clear All</button>
      </div>
      <div className="recent-list">
        {searches.map((city) => (
          <motion.div 
            key={city}
            layout
            className="recent-item glass-morphism"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span onClick={() => onSearch(city)} className="recent-city-name">{city}</span>
            <button className="remove-btn" onClick={() => onRemove(city)}>
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentSearches;
