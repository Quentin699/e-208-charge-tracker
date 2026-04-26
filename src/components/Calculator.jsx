import React, { useState, useEffect } from 'react';
import { useChargeData } from '../context/ChargeContext';
import { Zap, Battery, ArrowRight, Euro, Gauge, Leaf } from 'lucide-react';

export default function Calculator() {
  const { settings, addChargeToHistory } = useChargeData();
  const [startPercent, setStartPercent] = useState(22);
  const [endPercent, setEndPercent] = useState(100);
  const [isOffPeak, setIsOffPeak] = useState(true);

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
      startPercent,
      endPercent,
      isOffPeak,
      ...results
    });
    // Visual feedback could be added here
  };

  return (
    <div className="calculator-container animate-fade-in">
      <div className="glass-card p-6">
        <div className="header-flex mb-6">
          <h2 className="title-glow">Charge Calculator</h2>
          <Battery className="icon-accent" size={28} />
        </div>

        <div className="inputs-grid">
          <div className="input-group">
            <label>Start Battery (%)</label>
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
            <label>End Battery (%)</label>
            <input 
              type="number" 
              min="0" max="100" 
              value={endPercent}
              onChange={(e) => setEndPercent(Number(e.target.value))}
              className="glass-input"
            />
          </div>
        </div>

        <div className="rate-toggle mt-6">
          <button 
            className={`toggle-btn ${isOffPeak ? 'active-off-peak' : ''}`}
            onClick={() => setIsOffPeak(true)}
          >
            <Zap size={18} /> Off-Peak ({settings.offPeakRate}€)
          </button>
          <button 
            className={`toggle-btn ${!isOffPeak ? 'active-peak' : ''}`}
            onClick={() => setIsOffPeak(false)}
          >
            <Zap size={18} /> Peak ({settings.peakRate}€)
          </button>
        </div>

        <div className="results-panel mt-6">
          <div className="result-main">
            <span className="result-label">Estimated Cost</span>
            <span className="result-value cost-value">{results.cost.toFixed(2)} €</span>
          </div>

          <div className="results-grid mt-4">
            <div className="result-item">
              <Battery size={18} className="text-muted" />
              <div className="result-text">
                <span className="val">+{results.energyAdded.toFixed(1)} kWh</span>
                <span className="lbl">Added to Battery</span>
              </div>
            </div>
            <div className="result-item">
              <Zap size={18} className="text-muted" />
              <div className="result-text">
                <span className="val">{results.energyDrawn.toFixed(1)} kWh</span>
                <span className="lbl">Drawn (incl. {settings.chargingLossFactor}% loss)</span>
              </div>
            </div>
            <div className="result-item">
              <Gauge size={18} className="text-muted" />
              <div className="result-text">
                <span className="val">+{results.addedRange.toFixed(0)} km</span>
                <span className="lbl">Estimated Range</span>
              </div>
            </div>
            <div className="result-item text-green">
              <Leaf size={18} />
              <div className="result-text">
                <span className="val">+{results.savings.toFixed(2)} €</span>
                <span className="lbl">Savings vs. Gas</span>
              </div>
            </div>
          </div>
        </div>

        <button className="btn-primary mt-6 w-full" onClick={handleSave}>
          Save to History
        </button>
      </div>
    </div>
  );
}
