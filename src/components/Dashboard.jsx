import React, { useMemo } from 'react';
import { useChargeData } from '../context/ChargeContext';
import { Activity, Trash2, Calendar, TrendingDown, Battery } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { history, deleteCharge } = useChargeData();

  const stats = useMemo(() => {
    if (history.length === 0) return { totalCost: 0, totalSavings: 0, avgCost: 0, totalKwh: 0 };
    
    const totalCost = history.reduce((acc, curr) => acc + curr.cost, 0);
    const totalSavings = history.reduce((acc, curr) => acc + curr.savings, 0);
    const totalKwh = history.reduce((acc, curr) => acc + curr.energyDrawn, 0);
    
    return {
      totalCost,
      totalSavings,
      avgCost: totalCost / history.length,
      totalKwh
    };
  }, [history]);

  const chartData = useMemo(() => {
    // Group by day for the chart
    const last7Days = history.slice(0, 7).reverse();
    return last7Days.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      cost: item.cost,
      savings: item.savings
    }));
  }, [history]);

  return (
    <div className="dashboard-container animate-fade-in mt-6">
      
      {/* Stats Summary */}
      <div className="stats-grid mb-6">
        <div className="glass-card p-6 stat-card">
          <div className="stat-header">
            <span className="text-muted">Dépenses totales</span>
            <Activity className="icon-accent" size={20} />
          </div>
          <div className="stat-value">{stats.totalCost.toFixed(2)} €</div>
        </div>
        <div className="glass-card p-6 stat-card text-green">
          <div className="stat-header">
            <span className="text-muted">Économies totales vs Essence</span>
            <TrendingDown size={20} />
          </div>
          <div className="stat-value">+{stats.totalSavings.toFixed(2)} €</div>
        </div>
        <div className="glass-card p-6 stat-card">
          <div className="stat-header">
            <span className="text-muted">Énergie totale consommée</span>
            <Battery className="icon-accent" size={20} />
          </div>
          <div className="stat-value">{stats.totalKwh.toFixed(1)} kWh</div>
        </div>
      </div>

      {/* Chart Section */}
      {history.length > 0 && (
        <div className="glass-card p-6 mb-6">
          <h3 className="section-title mb-6"><Activity size={18} /> Coût des 7 dernières charges</h3>
          <div className="chart-wrapper" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Coût (€)" />
                <Bar dataKey="savings" fill="#10b981" radius={[4, 4, 0, 0]} name="Économies (€)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="glass-card p-6">
        <h3 className="section-title mb-6"><Calendar size={18} /> Historique des charges</h3>
        
        {history.length === 0 ? (
          <div className="text-muted text-center py-6">Aucune charge enregistrée pour le moment.</div>
        ) : (
          <div className="history-list">
            {history.map(item => (
              <div key={item.id} className="history-item">
                <div className="history-info">
                  <div className="history-date">
                    {new Date(item.date).toLocaleString('en-GB', { 
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                  <div className="history-details text-muted">
                    {item.startPercent}% → {item.endPercent}% • {item.isOffPeak ? 'Heures Creuses' : 'Heures Pleines'}
                  </div>
                </div>
                <div className="history-actions">
                  <div className="history-cost">{item.cost.toFixed(2)} €</div>
                  <button className="btn-icon text-muted" onClick={() => deleteCharge(item.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
