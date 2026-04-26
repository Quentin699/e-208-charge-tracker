import React, { createContext, useState, useEffect, useContext } from 'react';

const ChargeContext = createContext();

const DEFAULT_SETTINGS = {
  batteryCapacity: 48.1, // e-208 Phase 2 net capacity
  offPeakRate: 0.1438, // User's custom rate
  peakRate: 0.1798, // User's custom rate
  consumption: 15, // kWh/100km
  chargingLossFactor: 10, // % loss
  gasPricePerLiter: 1.80, // For comparison
  gasConsumption: 6.0 // L/100km
};

export const ChargeProvider = ({ children }) => {
  // Load settings from local storage or use defaults
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ev-settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  // Load history from local storage
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('ev-history');
    return saved ? JSON.parse(saved) : [];
  });

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem('ev-settings', JSON.stringify(settings));
  }, [settings]);

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem('ev-history', JSON.stringify(history));
  }, [history]);

  const addChargeToHistory = (chargeData) => {
    setHistory(prev => [
      { id: Date.now(), date: new Date().toISOString(), ...chargeData },
      ...prev
    ]);
  };

  const deleteCharge = (id) => {
    setHistory(prev => prev.filter(charge => charge.id !== id));
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <ChargeContext.Provider value={{
      settings,
      updateSettings,
      history,
      addChargeToHistory,
      deleteCharge
    }}>
      {children}
    </ChargeContext.Provider>
  );
};

export const useChargeData = () => useContext(ChargeContext);
