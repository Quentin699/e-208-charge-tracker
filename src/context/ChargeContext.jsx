import React, { createContext, useState, useEffect, useContext } from 'react';

const ChargeContext = createContext();

const DEFAULT_SETTINGS = {
  batteryCapacity: 48.1, // e-208 Phase 2 net capacity
  offPeakRate: 0.1438, // User's custom rate
  peakRate: 0.1798, // User's custom rate
  consumption: 15, // kWh/100km
  chargingLossFactor: 10, // % loss
  gasPricePerLiter: 1.80, // For comparison
  gasConsumption: 6.0, // L/100km
  co2PerLiterGas: 2.3 // kg CO2 per liter of gasoline
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
      { id: Date.now(), ...chargeData },
      ...prev
    ]);
  };

  const updateCharge = (id, updates) => {
    setHistory(prev => prev.map(charge =>
      charge.id === id ? { ...charge, ...updates } : charge
    ));
  };

  const deleteCharge = (id) => {
    setHistory(prev => prev.filter(charge => charge.id !== id));
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Date', 'Départ %', 'Arrivée %', 'Tarif', 'Énergie (kWh)', 'Coût (€)', 'Économies vs Essence (€)', 'Autonomie ajoutée (km)'];
    const rows = history.map(h => [
      new Date(h.date).toLocaleString('fr-FR'),
      h.startPercent,
      h.endPercent,
      h.isOffPeak ? 'Heures Creuses' : 'Heures Pleines',
      h.energyDrawn?.toFixed(2),
      h.cost?.toFixed(2),
      h.savings?.toFixed(2),
      h.addedRange?.toFixed(0)
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `e208-charges-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ChargeContext.Provider value={{
      settings,
      updateSettings,
      history,
      addChargeToHistory,
      updateCharge,
      deleteCharge,
      exportCSV
    }}>
      {children}
    </ChargeContext.Provider>
  );
};

export const useChargeData = () => useContext(ChargeContext);
