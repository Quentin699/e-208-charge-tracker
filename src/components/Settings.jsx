import React from 'react';
import { useChargeData } from '../context/ChargeContext';
import { Settings as SettingsIcon, Euro, Battery, Zap, Car } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings } = useChargeData();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateSettings({ [name]: Number(value) });
  };

  return (
    <div className="settings-container animate-fade-in mt-6">
      <div className="glass-card p-6">
        <div className="header-flex mb-6">
          <h2 className="title-glow">Settings</h2>
          <SettingsIcon className="icon-accent" size={28} />
        </div>

        <div className="settings-grid">
          {/* Electricity Rates */}
          <div className="settings-section">
            <h3 className="section-title"><Euro size={18} /> Electricity Rates (€/kWh)</h3>
            <div className="input-group mt-4">
              <label>Off-Peak Rate (Heures Creuses)</label>
              <input 
                type="number" step="0.0001"
                name="offPeakRate"
                value={settings.offPeakRate}
                onChange={handleChange}
                className="glass-input"
              />
            </div>
            <div className="input-group mt-4">
              <label>Peak Rate (Heures Pleines)</label>
              <input 
                type="number" step="0.0001"
                name="peakRate"
                value={settings.peakRate}
                onChange={handleChange}
                className="glass-input"
              />
            </div>
          </div>

          {/* Vehicle Settings */}
          <div className="settings-section">
            <h3 className="section-title"><Car size={18} /> Vehicle Details</h3>
            <div className="input-group mt-4">
              <label>Battery Capacity (kWh) - e-208 Phase 2</label>
              <input 
                type="number" step="0.1"
                name="batteryCapacity"
                value={settings.batteryCapacity}
                onChange={handleChange}
                className="glass-input"
              />
            </div>
            <div className="input-group mt-4">
              <label>Average Consumption (kWh/100km)</label>
              <input 
                type="number" step="0.1"
                name="consumption"
                value={settings.consumption}
                onChange={handleChange}
                className="glass-input"
              />
            </div>
          </div>

          {/* Charging Physics */}
          <div className="settings-section">
            <h3 className="section-title"><Zap size={18} /> Charging Setup</h3>
            <div className="input-group mt-4">
              <label>Network Loss Factor (%)</label>
              <input 
                type="number" step="1"
                name="chargingLossFactor"
                value={settings.chargingLossFactor}
                onChange={handleChange}
                className="glass-input"
              />
            </div>
          </div>

          {/* Gas Comparison */}
          <div className="settings-section">
            <h3 className="section-title"><Euro size={18} /> Gas Comparison</h3>
            <div className="input-group mt-4">
              <label>Gas Price (€/L)</label>
              <input 
                type="number" step="0.01"
                name="gasPricePerLiter"
                value={settings.gasPricePerLiter}
                onChange={handleChange}
                className="glass-input"
              />
            </div>
            <div className="input-group mt-4">
              <label>Gas Car Consumption (L/100km)</label>
              <input 
                type="number" step="0.1"
                name="gasConsumption"
                value={settings.gasConsumption}
                onChange={handleChange}
                className="glass-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
