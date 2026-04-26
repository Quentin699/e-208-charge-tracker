import React, { createContext, useState, useEffect, useContext } from 'react';
import { evHistoryRef, evSettingsRef } from '../firebase';
import { onValue, set } from 'firebase/database';

const ChargeContext = createContext();

const DEFAULT_SETTINGS = {
  batteryCapacity: 48.1, // e-208 Phase 2 net capacity
  offPeakRate: 0.1438,
  peakRate: 0.1798,
  consumption: 15, // kWh/100km
  chargingLossFactor: 10, // % loss
  gasPricePerLiter: 1.80,
  gasConsumption: 6.0, // L/100km
  co2PerLiterGas: 2.3
};

export const ChargeProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Firebase listeners
  useEffect(() => {
    let settingsLoaded = false;
    let historyLoaded = false;

    const checkLoaded = () => {
      if (settingsLoaded && historyLoaded) {
        setIsLoaded(true);
      }
    };

    const unsubscribeSettings = onValue(evSettingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      } else {
        // First run, initialize default settings in Firebase
        set(evSettingsRef, DEFAULT_SETTINGS);
      }
      settingsLoaded = true;
      checkLoaded();
    });

    const unsubscribeHistory = onValue(evHistoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase might return an object instead of array if keys are missing
        const historyArray = Array.isArray(data) ? data : Object.values(data);
        // Sort descending by date (newest first)
        historyArray.sort((a, b) => b.id - a.id);
        setHistory(historyArray);
      } else {
        setHistory([]);
      }
      historyLoaded = true;
      checkLoaded();
    });

    return () => {
      unsubscribeSettings();
      unsubscribeHistory();
    };
  }, []);

  const addChargeToHistory = (chargeData) => {
    const newHistory = [
      { id: Date.now(), ...chargeData },
      ...history
    ];
    set(evHistoryRef, newHistory);
  };

  const updateCharge = (id, updates) => {
    const newHistory = history.map(charge =>
      charge.id === id ? { ...charge, ...updates } : charge
    );
    set(evHistoryRef, newHistory);
  };

  const deleteCharge = (id) => {
    const newHistory = history.filter(charge => charge.id !== id);
    set(evHistoryRef, newHistory);
  };

  const updateSettings = (newSettings) => {
    const nextSettings = { ...settings, ...newSettings };
    set(evSettingsRef, nextSettings);
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
      exportCSV,
      isLoaded
    }}>
      {children}
    </ChargeContext.Provider>
  );
};

export const useChargeData = () => useContext(ChargeContext);
