import React, { useEffect, useState, useRef } from 'react';
import { animate } from 'framer-motion';

const Counter = ({ value, duration = 0.8 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const from = prevValueRef.current;
    const controls = animate(from, value, {
      duration: duration,
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      ease: "easeOut"
    });

    prevValueRef.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

export default Counter;
