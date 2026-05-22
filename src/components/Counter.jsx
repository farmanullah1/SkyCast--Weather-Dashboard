import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

const Counter = ({ value, duration = 1 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: duration,
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      ease: "easeOut"
    });

    return () => controls.stop();
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

export default Counter;
