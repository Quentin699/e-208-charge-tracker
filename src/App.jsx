import React, { useState } from 'react';
import { ChargeProvider } from './context/ChargeContext';
import Calculator from './components/Calculator';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { Calculator as CalcIcon, Activity, Settings as SettingsIcon, Zap } from 'lucide-react';
import './index.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('calculator');

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
          <CalcIcon size={18} /> <span className="tab-label">Calculator</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Activity size={18} /> <span className="tab-label">Dashboard</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={18} /> <span className="tab-label">Settings</span>
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
