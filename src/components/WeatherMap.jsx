import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Layers, MousePointer2 } from 'lucide-react';

// Fix for Leaflet default icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 10);
  return null;
};

const WeatherMap = ({ location }) => {
  const [layer, setLayer] = useState('precipitation_new');
  const OWM_API_KEY = import.meta.env.VITE_OWM_API_KEY;

  const layers = [
    { id: 'precipitation_new', label: 'Rain' },
    { id: 'clouds_new', label: 'Clouds' },
    { id: 'temp_new', label: 'Temp' },
    { id: 'wind_new', label: 'Wind' },
    { id: 'pressure_new', label: 'Pressure' }
  ];

  const position = [location.lat, location.lon];

  return (
    <div className="weather-map-container glass-card">
      <div className="map-header">
        <h3 className="section-title">
          <MousePointer2 size={20} />
          Interactive Radar
        </h3>
        <div className="layer-selector">
          {layers.map((l) => (
            <button 
              key={l.id} 
              className={`layer-btn ${layer === l.id ? 'active' : ''}`}
              onClick={() => setLayer(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="map-wrapper glass-morphism">
        <MapContainer center={position} zoom={10} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: '20px' }}>
          <ChangeView center={position} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <TileLayer
            url={`https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`}
          />
          <Marker position={position}>
            <Popup>
              {location.name}, {location.country}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default WeatherMap;
