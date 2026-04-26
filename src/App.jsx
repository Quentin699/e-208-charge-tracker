import React, { useState } from 'react';
import { ChargeProvider } from './context/ChargeContext';
import Calculator from './components/Calculator';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { Calculator as CalcIcon, Activity, Settings as SettingsIcon, Zap } from 'lucide-react';
import { useChargeData } from './context/ChargeContext';
import './index.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('calculator');
  const { isLoaded } = useChargeData();

  if (!isLoaded) {
    return (
      <div className="container flex items-center justify-center h-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="logo-icon" style={{ animation: 'pulse 2s infinite' }}>
          <Zap size={48} fill="currentColor" className="text-blue-500" />
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Connexion au cloud...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header mb-6">
        <div className="logo">
          <div className="logo-icon">
            <Zap size={24} fill="currentColor" />
          </div>
          <h1>e-208 Charge Tracker</h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="glass-card nav-tabs mb-6">
        <button 
          className={`nav-tab ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          <CalcIcon size={18} /> <span className="tab-label">Calculateur</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity size={18} /> <span className="tab-label">Tableau de bord</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={18} /> <span className="tab-label">Paramètres</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main>
        {activeTab === 'calculator' && <Calculator />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ChargeProvider>
      <AppContent />
    </ChargeProvider>
  );
}

export default App;
