import React, { useMemo, useState } from 'react';
import { useChargeData } from '../context/ChargeContext';
import { Activity, Trash2, Calendar, TrendingDown, Battery, Leaf, Car, Download, ChevronDown, Globe, Zap } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function Dashboard() {
  const { history, deleteCharge, settings, exportCSV } = useChargeData();
  const [chartPeriod, setChartPeriod] = useState('total'); // 'week', 'month', 'total'
  const [showAllHistory, setShowAllHistory] = useState(false);

  // ── CORE STATS ──
  const stats = useMemo(() => {
    if (history.length === 0) return {
      totalCost: 0, totalSavings: 0, avgCost: 0, totalKwh: 0,
      totalRange: 0, totalCharges: 0, costPerKm: 0, gasCostPerKm: 0,
      co2Saved: 0, treesEquivalent: 0
    };
    
    const totalCost = history.reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const totalSavings = history.reduce((acc, curr) => acc + (curr.savings || 0), 0);
    const totalKwh = history.reduce((acc, curr) => acc + (curr.energyDrawn || 0), 0);
    const totalRange = history.reduce((acc, curr) => acc + (curr.addedRange || 0), 0);
    const totalGasCost = history.reduce((acc, curr) => acc + (curr.gasCost || 0), 0);
    
    // CO2 saved: liters of gas avoided * 2.3 kg CO2/L
    const totalGasLiters = totalRange > 0 ? (totalRange / 100) * settings.gasConsumption : 0;
    const co2Saved = totalGasLiters * (settings.co2PerLiterGas || 2.3);
    const treesEquivalent = co2Saved / 22; // ~22 kg CO2 absorbed per tree per year

    const costPerKm = totalRange > 0 ? (totalCost / totalRange) * 100 : 0; // €/100km
    const gasCostPerKm = totalRange > 0 ? (totalGasCost / totalRange) * 100 : 0;
    
    return {
      totalCost,
      totalSavings,
      avgCost: totalCost / history.length,
      totalKwh,
      totalRange,
      totalCharges: history.length,
      costPerKm,
      gasCostPerKm,
      co2Saved,
      treesEquivalent
    };
  }, [history, settings]);

  // ── FILTERED DATA FOR COMPARISON CHART ──
  const comparisonData = useMemo(() => {
    if (history.length === 0) return [];

    const now = new Date();
    let filteredHistory = [...history];

    if (chartPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredHistory = history.filter(h => new Date(h.date) >= weekAgo);
    } else if (chartPeriod === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filteredHistory = history.filter(h => new Date(h.date) >= monthAgo);
    }

    // Group by day
    const grouped = {};
    filteredHistory.forEach(item => {
      const day = new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      if (!grouped[day]) {
        grouped[day] = { date: day, electric: 0, essence: 0, savings: 0 };
      }
      grouped[day].electric += item.cost || 0;
      grouped[day].essence += item.gasCost || 0;
      grouped[day].savings += item.savings || 0;
    });

    return Object.values(grouped).reverse();
  }, [history, chartPeriod]);

  // ── MONTHLY TREND DATA ──
  const trendData = useMemo(() => {
    if (history.length === 0) return [];

    const grouped = {};
    history.forEach(item => {
      const month = new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      if (!grouped[month]) {
        grouped[month] = { month, cost: 0, savings: 0, charges: 0 };
      }
      grouped[month].cost += item.cost || 0;
      grouped[month].savings += item.savings || 0;
      grouped[month].charges += 1;
    });

    return Object.values(grouped).reverse();
  }, [history]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="chart-tooltip-value">
            {entry.name} : {entry.value.toFixed(2)} €
          </p>
        ))}
      </div>
    );
  };

  const displayedHistory = showAllHistory ? history : history.slice(0, 5);

  return (
    <div className="dashboard-container animate-fade-in mt-6">
      
      {/* ── STATS GRID ── */}
      <div className="stats-grid mb-6">
        <div className="glass-card p-6 stat-card">
          <div className="stat-header">
            <span className="text-muted">Nombre de charges</span>
            <Zap className="icon-accent" size={20} />
          </div>
          <div className="stat-value">{stats.totalCharges}</div>
        </div>
        <div className="glass-card p-6 stat-card">
          <div className="stat-header">
            <span className="text-muted">Dépenses totales</span>
            <Activity className="icon-accent" size={20} />
          </div>
          <div className="stat-value">{stats.totalCost.toFixed(2)} €</div>
        </div>
        <div className="glass-card p-6 stat-card text-green">
          <div className="stat-header">
            <span className="text-muted">Économies vs Essence</span>
            <TrendingDown size={20} />
          </div>
          <div className="stat-value">+{stats.totalSavings.toFixed(2)} €</div>
        </div>
        <div className="glass-card p-6 stat-card">
          <div className="stat-header">
            <span className="text-muted">Énergie consommée</span>
            <Battery className="icon-accent" size={20} />
          </div>
          <div className="stat-value">{stats.totalKwh.toFixed(1)} kWh</div>
        </div>
      </div>

      {/* ── SECOND ROW: KM, COST/KM, CO2 ── */}
      <div className="stats-grid mb-6">
        <div className="glass-card p-6 stat-card">
          <div className="stat-header">
            <span className="text-muted">km totaux estimés</span>
            <Car className="icon-accent" size={20} />
          </div>
          <div className="stat-value">{stats.totalRange.toFixed(0)} km</div>
        </div>
        <div className="glass-card p-6 stat-card">
          <div className="stat-header">
            <span className="text-muted">Coût / 100 km</span>
            <Activity className="icon-accent" size={20} />
          </div>
          <div className="stat-value-row">
            <div className="cost-compare">
              <span className="cost-ev">⚡ {stats.costPerKm.toFixed(2)} €</span>
              <span className="cost-vs">vs</span>
              <span className="cost-gas">⛽ {stats.gasCostPerKm.toFixed(2)} €</span>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 stat-card stat-card-eco">
          <div className="stat-header">
            <span className="text-muted">CO₂ économisé</span>
            <Globe size={20} className="icon-green" />
          </div>
          <div className="stat-value text-green">{stats.co2Saved.toFixed(1)} kg</div>
          <div className="stat-sub text-muted">
            ≈ {stats.treesEquivalent.toFixed(1)} 🌳 / an
          </div>
        </div>
      </div>

      {/* ── COMPARISON CHART: Essence vs Électrique ── */}
      {history.length > 0 && (
        <div className="glass-card p-6 mb-6">
          <div className="chart-header">
            <h3 className="section-title">
              <Activity size={18} /> Électrique vs Essence
            </h3>
            <div className="period-toggle">
              <button
                className={`period-btn ${chartPeriod === 'week' ? 'active' : ''}`}
                onClick={() => setChartPeriod('week')}
              >
                Semaine
              </button>
              <button
                className={`period-btn ${chartPeriod === 'month' ? 'active' : ''}`}
                onClick={() => setChartPeriod('month')}
              >
                Mois
              </button>
              <button
                className={`period-btn ${chartPeriod === 'total' ? 'active' : ''}`}
                onClick={() => setChartPeriod('total')}
              >
                Total
              </button>
            </div>
          </div>
          {comparisonData.length > 0 ? (
            <div className="chart-wrapper" style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={comparisonData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" stroke="#86868b" fontSize={12} />
                  <YAxis stroke="#86868b" fontSize={12} tickFormatter={(v) => `${v.toFixed(0)}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="electric" fill="#0071e3" radius={[6, 6, 0, 0]} name="Électrique (€)" />
                  <Bar dataKey="essence" fill="#ff9500" radius={[6, 6, 0, 0]} name="Essence (€)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-muted text-center py-6">Aucune charge sur cette période.</div>
          )}
        </div>
      )}

      {/* ── MONTHLY TREND LINE CHART ── */}
      {trendData.length > 1 && (
        <div className="glass-card p-6 mb-6">
          <h3 className="section-title mb-6">
            <TrendingDown size={18} /> Tendance mensuelle
          </h3>
          <div className="chart-wrapper" style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" stroke="#86868b" fontSize={12} />
                <YAxis stroke="#86868b" fontSize={12} tickFormatter={(v) => `${v.toFixed(0)}€`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#0071e3" strokeWidth={2.5} dot={{ r: 4, fill: '#0071e3' }} name="Coût (€)" />
                <Line type="monotone" dataKey="savings" stroke="#34c759" strokeWidth={2.5} dot={{ r: 4, fill: '#34c759' }} name="Économies (€)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── HISTORY LIST ── */}
      <div className="glass-card p-6">
        <div className="chart-header mb-6">
          <h3 className="section-title">
            <Calendar size={18} /> Historique des charges
          </h3>
          {history.length > 0 && (
            <button className="btn-export" onClick={exportCSV}>
              <Download size={16} /> Exporter CSV
            </button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="text-muted text-center py-6">Aucune charge enregistrée pour le moment.</div>
        ) : (
          <>
            <div className="history-list">
              {displayedHistory.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-info">
                    <div className="history-date">
                      {new Date(item.date).toLocaleString('fr-FR', { 
                        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                    <div className="history-details text-muted">
                      {item.startPercent}% → {item.endPercent}% • {item.isOffPeak ? 'HC' : 'HP'} • +{item.addedRange?.toFixed(0) || 0} km
                    </div>
                  </div>
                  <div className="history-actions">
                    <div className="history-costs">
                      <span className="history-cost">{item.cost?.toFixed(2)} €</span>
                      <span className="history-saving text-green">−{item.savings?.toFixed(2)} €</span>
                    </div>
                    <button className="btn-icon text-muted" onClick={() => deleteCharge(item.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {history.length > 5 && (
              <button
                className="btn-show-more mt-4"
                onClick={() => setShowAllHistory(!showAllHistory)}
              >
                <ChevronDown size={16} className={showAllHistory ? 'rotate-180' : ''} />
                {showAllHistory ? 'Voir moins' : `Voir tout (${history.length} charges)`}
              </button>
            )}
          </>
        )}
      </div>

    </div>
  );
}
