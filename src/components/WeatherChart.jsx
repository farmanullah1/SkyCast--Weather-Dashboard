import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WeatherChart = ({ hourly, unit }) => {
  const data = hourly.map(h => ({
    time: h.hourFormatted,
    temp: unit === 'f' ? Math.round((h.tempC * 9/5) + 32) : Math.round(h.tempC),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip glass-morphism" style={{ padding: '8px 12px', borderRadius: '12px' }}>
          <p className="label" style={{ margin: 0, fontWeight: 700 }}>{`${label} : ${payload[0].value}°${unit.toUpperCase()}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="weather-chart-container">
      <h3 className="section-title">24-Hour Trend</h3>
      <div className="chart-wrapper glass-morphism">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#81ecec" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#81ecec" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#81ecec" 
              fillOpacity={1} 
              fill="url(#colorTemp)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeatherChart;
