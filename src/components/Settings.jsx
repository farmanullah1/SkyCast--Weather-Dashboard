import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Download, Sliders, Zap, Wind, Eye } from 'lucide-react';
import Modal from './Modal';

const Settings = ({ isOpen, onClose, settings, updateSetting, onExport, activeTheme, onSelectTheme }) => {
  const themes = [
    { id: 'cyan', name: 'Cyan', color: '#81ecec', glow: 'rgba(129, 236, 236, 0.3)' },
    { id: 'amber', name: 'Amber', color: '#fd9644', glow: 'rgba(253, 150, 100, 0.3)' },
    { id: 'emerald', name: 'Emerald', color: '#2ecc71', glow: 'rgba(46, 204, 113, 0.3)' },
    { id: 'lavender', name: 'Lavender', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)' },
    { id: 'crimson', name: 'Crimson', color: '#ff7675', glow: 'rgba(255, 118, 117, 0.3)' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="App Settings">
      <div className="settings-container">
        <div className="settings-group">
          <h4 className="settings-sub">Visual Effects</h4>
          
          <div className="setting-item">
            <div className="setting-info">
              <Zap size={18} className="setting-icon" />
              <span>3D Tilt Effects</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.tiltEnabled} 
                onChange={(e) => updateSetting('tiltEnabled', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <Wind size={18} className="setting-icon" />
              <span>Atmosphere Particles</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.atmosphereEnabled} 
                onChange={(e) => updateSetting('atmosphereEnabled', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <Eye size={18} className="setting-icon" />
              <span>Motion Reduction</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.reducedMotion} 
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        <div className="settings-group" style={{ marginTop: '10px' }}>
          <h4 className="settings-sub">Dashboard Theme</h4>
          <div className="theme-selector-grid" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                className={`theme-pill-btn ${activeTheme === t.id ? 'active' : ''}`}
                style={{
                  flex: '1 1 calc(33.33% - 8px)',
                  padding: '10px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  background: activeTheme === t.id ? t.color : 'rgba(255,255,255,0.02)',
                  color: activeTheme === t.id ? '#020617' : 'white',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  transition: 'all 0.25s ease',
                  boxShadow: activeTheme === t.id ? `0 0 12px ${t.glow}` : 'none'
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-actions">
           <button className="export-btn" onClick={onExport}>
             <Download size={18} />
             Export Weather Report (PNG)
           </button>
        </div>
      </div>
    </Modal>
  );
};

export default Settings;
