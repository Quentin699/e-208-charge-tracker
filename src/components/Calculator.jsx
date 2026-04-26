import React, { useState, useEffect } from 'react';
import { useChargeData } from '../context/ChargeContext';
import { Zap, Battery, ArrowRight, Euro, Gauge, Leaf, Calendar } from 'lucide-react';

export default function Calculator() {
  const { settings, addChargeToHistory } = useChargeData();
  const [startPercent, setStartPercent] = useState(22);
  const [endPercent, setEndPercent] = useState(100);
  const [isOffPeak, setIsOffPeak] = useState(true);
  const [chargeDate, setChargeDate] = useState(() => {
    const now = new Date();
    // Format as local datetime string for input
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [saved, setSaved] = useState(false);

  const [results, setResults] = useState({
    energyAdded: 0,
    energyDrawn: 0,
    cost: 0,
    addedRange: 0,
    gasCost: 0,
    savings: 0
  });

  useEffect(() => {
    // Calculations
    const diffPercent = Math.max(0, endPercent - startPercent);
    
    // Energy added to battery
    const energyAdded = (diffPercent / 100) * settings.batteryCapacity;
    
    // Energy drawn from grid (including losses)
    const lossMultiplier = 1 + (settings.chargingLossFactor / 100);
    const energyDrawn = energyAdded * lossMultiplier;

    // Cost
    const rate = isOffPeak ? settings.offPeakRate : settings.peakRate;
    const cost = energyDrawn * rate;

    // Range added
    const addedRange = (energyAdded / settings.consumption) * 100;

    // Savings vs Gas
    const gasLitersNeeded = (addedRange / 100) * settings.gasConsumption;
    const gasCost = gasLitersNeeded * settings.gasPricePerLiter;
    const savings = Math.max(0, gasCost - cost);

    setResults({
      energyAdded,
      energyDrawn,
      cost,
      addedRange,
      gasCost,
      savings,
      diffPercent
    });
  }, [startPercent, endPercent, isOffPeak, settings]);

  const handleSave = () => {
    addChargeToHistory({
      date: new Date(chargeDate).toISOString(),
      startPercent,
      endPercent,
      isOffPeak,
      ...results
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Battery gauge rendering
  const gaugeWidth = 100;
  const startFill = Math.min(startPercent, 100);
  const endFill = Math.min(endPercent, 100);

  return (
    <div className="calculator-container animate-fade-in">
      <div className="glass-card p-6">
        <div className="header-flex mb-6">
          <h2 className="title-glow">Calculateur de charge</h2>
          <Battery className="icon-accent" size={28} />
        </div>

        {/* Battery Gauge Visualization */}
        <div className="battery-gauge-container mb-6">
          <div className="battery-gauge">
            <div className="battery-gauge-body">
              {/* Background fill (start %) */}
              <div
                className="battery-gauge-fill battery-gauge-start"
                style={{ width: `${startFill}%` }}
              />
              {/* Charging fill (end %) */}
              <div
                className="battery-gauge-fill battery-gauge-end"
                style={{ width: `${endFill}%` }}
              />
              {/* Percentage labels */}
              <div className="battery-gauge-labels">
                <span className="battery-label-start">{startPercent}%</span>
                <span className="battery-label-arrow">⚡</span>
                <span className="battery-label-end">{endPercent}%</span>
              </div>
            </div>
            <div className="battery-gauge-tip" />
          </div>
        </div>

        <div className="inputs-grid">
          <div className="input-group">
            <label>Batterie au départ (%)</label>
            <input 
              type="number" 
              min="0" max="100" 
              value={startPercent}
              onChange={(e) => setStartPercent(Number(e.target.value))}
              className="glass-input"
            />
          </div>
          <div className="icon-center">
            <ArrowRight size={24} className="text-muted" />
          </div>
          <div className="input-group">
            <label>Batterie à l'arrivée (%)</label>
            <input 
              type="number" 
              min="0" max="100" 
              value={endPercent}
              onChange={(e) => setEndPercent(Number(e.target.value))}
              className="glass-input"
            />
          </div>
        </div>

        {/* Date Picker */}
        <div className="input-group mt-6">
          <label className="date-label">
            <Calendar size={16} className="text-muted" />
            Date et heure de la charge
          </label>
          <input
            type="datetime-local"
            value={chargeDate}
            onChange={(e) => setChargeDate(e.target.value)}
            className="glass-input"
          />
        </div>

        <div className="rate-toggle mt-6">
          <button 
            className={`toggle-btn ${isOffPeak ? 'active-off-peak' : ''}`}
            onClick={() => setIsOffPeak(true)}
          >
            <Zap size={18} /> Heures Creuses ({settings.offPeakRate}€)
          </button>
          <button 
            className={`toggle-btn ${!isOffPeak ? 'active-peak' : ''}`}
            onClick={() => setIsOffPeak(false)}
          >
            <Zap size={18} /> Heures Pleines ({settings.peakRate}€)
          </button>
        </div>

        <div className="results-panel mt-6">
          <div className="result-main">
            <span className="result-label">Coût estimé</span>
            <span className="result-value cost-value">{results.cost.toFixed(2)} €</span>
          </div>

          <div className="results-grid mt-4">
            <div className="result-item">
              <Battery size={18} className="text-muted" />
              <div className="result-text">
                <span className="val">+{results.energyAdded.toFixed(1)} kWh</span>
                <span className="lbl">Ajouté à la batterie</span>
              </div>
            </div>
            <div className="result-item">
              <Zap size={18} className="text-muted" />
              <div className="result-text">
                <span className="val">{results.energyDrawn.toFixed(1)} kWh</span>
                <span className="lbl">Consommé (incl. {settings.chargingLossFactor}% perte)</span>
              </div>
            </div>
            <div className="result-item">
              <Gauge size={18} className="text-muted" />
              <div className="result-text">
                <span className="val">+{results.addedRange.toFixed(0)} km</span>
                <span className="lbl">Autonomie estimée</span>
              </div>
            </div>
            <div className="result-item text-green">
              <Leaf size={18} />
              <div className="result-text">
                <span className="val">+{results.savings.toFixed(2)} €</span>
                <span className="lbl">Économies vs Essence</span>
              </div>
            </div>
          </div>
        </div>

        <button
          className={`btn-primary mt-6 w-full ${saved ? 'btn-saved' : ''}`}
          onClick={handleSave}
        >
          {saved ? '✓ Enregistré !' : 'Enregistrer dans l\'historique'}
        </button>
      </div>
    </div>
  );
}
