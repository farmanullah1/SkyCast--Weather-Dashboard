import React from 'react';
import { motion } from 'framer-motion';
import { Sunrise, Sunset, Sun } from 'lucide-react';

const SunTrack = ({ current }) => {
  const { sunriseEpoch, sunsetEpoch, localTimeEpoch, sunrise, sunset } = current;

  if (!sunriseEpoch || !sunsetEpoch || !localTimeEpoch) return null;

  const totalDaylight = sunsetEpoch - sunriseEpoch;
  const elapsed = localTimeEpoch - sunriseEpoch;
  
  // Progress from 0 to 1
  let progress = elapsed / totalDaylight;
  const isNight = progress < 0 || progress > 1;
  progress = Math.max(0, Math.min(1, progress));

  // Parabolic path: y = -4 * (x - 0.5)^2 + 1
  // x is progress, y is height
  const x = progress * 100;
  const y = (1 - (-4 * Math.pow(progress - 0.5, 2) + 1)) * 100;

  return (
    <div className="sun-track-container glass-morphism">
      <div className="sun-track-header">
        <span className="track-title">Daylight Progress</span>
        <span className="track-status">{isNight ? 'After Dark' : 'Sun is Up'}</span>
      </div>

      <div className="track-visual">
        <svg viewBox="0 0 100 50" className="track-svg">
          {/* Arc Background */}
          <path 
            d="M 5 45 A 45 40 0 0 1 95 45" 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="2" 
            strokeDasharray="2,2"
          />
          {/* Progress Path */}
          <motion.path 
            d="M 5 45 A 45 40 0 0 1 95 45" 
            fill="none" 
            stroke="var(--accent-color)" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* Sun Icon Positioning */}
          {!isNight && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
               {/* 
                  This is a simplification. For a real arc we'd use polar coordinates. 
                  Approximating position for now.
               */}
               <circle 
                cx={5 + (90 * progress)} 
                cy={45 - (40 * Math.sin(Math.PI * progress))} 
                r="3" 
                fill="var(--accent-color)"
                className="sun-point"
               />
            </motion.g>
          )}
        </svg>
      </div>

      <div className="track-footer">
        <div className="sun-time">
          <Sunrise size={16} className="sun-icon" />
          <div className="time-info">
            <span className="label">Sunrise</span>
            <span className="value">{sunrise}</span>
          </div>
        </div>
        <div className="sun-time">
          <Sunset size={16} className="sun-icon" />
          <div className="time-info">
            <span className="label">Sunset</span>
            <span className="value">{sunset}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SunTrack;
