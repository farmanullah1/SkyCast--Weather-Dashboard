import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Atmosphere = ({ condition, isDay }) => {
  const particles = useMemo(() => {
    let count = 0;
    let type = 'none';

    if (condition === 'rainy' || condition === 'stormy') {
      count = 40;
      type = 'rain';
    } else if (condition === 'snowy') {
      count = 30;
      type = 'snow';
    } else if (condition === 'clear' && isDay) {
      count = 15;
      type = 'sparkle';
    }

    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      size: type === 'rain' ? Math.random() * 2 + 1 : Math.random() * 4 + 2
    }));
  }, [condition, isDay]);

  if (particles.length === 0) return null;

  const isRain = condition === 'rainy' || condition === 'stormy';
  const isSnow = condition === 'snowy';

  return (
    <div className="atmosphere-overlay">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`particle ${isRain ? 'rain' : isSnow ? 'snow' : 'sparkle'}`}
          initial={{ 
            top: isRain || isSnow ? "-10%" : `${p.y}%`, 
            left: `${p.x}%`,
            opacity: 0 
          }}
          animate={{ 
            top: isRain || isSnow ? "110%" : [`${p.y}%`, `${p.y - 5}%`, `${p.y}%`],
            opacity: [0, 0.4, 0],
            scale: isSnow ? [1, 1.2, 1] : 1
          }}
          transition={{
            duration: isRain ? 1 : isSnow ? 6 : 4,
            repeat: Infinity,
            delay: p.delay,
            ease: isRain ? "linear" : "easeInOut"
          }}
          style={{
            width: isRain ? '1px' : `${p.size}px`,
            height: isRain ? '20px' : `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
};

export default Atmosphere;
