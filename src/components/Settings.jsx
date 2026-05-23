import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Download, Sliders, Zap, Wind, Eye } from 'lucide-react';
import Modal from './Modal';

const Settings = ({ isOpen, onClose, settings, updateSetting, onExport }) => {
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
