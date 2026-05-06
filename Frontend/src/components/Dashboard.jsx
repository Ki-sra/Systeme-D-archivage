import React, { useState } from 'react';
import {
  FileBox,
  CheckCircle,
  AlertTriangle,
  FileText,
  Plus,
  Download,
} from 'lucide-react';

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ title, value, trend, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
            trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {trend}
        </span>
      )}
    </div>
    <p className="text-secondary text-xs font-semibold uppercase tracking-wider">{title}</p>
    <h3 className="text-2xl font-bold text-primary mt-1 tracking-tight">
      {value ?? '—'}
    </h3>
  </div>
);

// Month labels for the chart x-axis (static UI, not data)
const MONTHS = ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC'];

// ── Main Component ────────────────────────────────────────────────────────────

export const Dashboard = ({ onNavigate }) => {
  // Stats — will be populated from API
  const [stats, setStats] = useState({
    totalPV: null,
    archivingRate: null,
    missingDocs: null,
  });

  // Chart data — array of { month, value } objects from API
  const [chartData, setChartData] = useState([]);

  // Recent activities — will be populated from API
  const [recentActivities, setRecentActivities] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Tableau de bord</h1>
          <p className="text-secondary mt-1">Résumé analytique et statistiques de gestion des documents.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-white text-primary font-bold text-xs uppercase tracking-wider hover:bg-surface-container-low transition-colors">
            <Download size={16} />
            Exporter
          </button>
          <button
            onClick={() => onNavigate?.('add')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary-container transition-colors shadow-lg shadow-primary/10"
          >
            <Plus size={16} />
            Nouveau PV
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total des PV"
          value={stats.totalPV}
          icon={FileBox}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Taux d'archivage"
          value={stats.archivingRate}
          icon={CheckCircle}
          colorClass="bg-green-50 text-green-600"
        />
        <StatCard
          title="Documents manquants"
          value={stats.missingDocs}
          icon={AlertTriangle}
          colorClass="bg-red-50 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Annual Activity Chart */}
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-lg font-bold text-primary">Activité Annuelle</h3>
              <select className="bg-surface-container-low border-none rounded text-[10px] font-bold py-1.5 pl-3 pr-8 text-primary focus:ring-0">
                <option>Derniers 12 mois</option>
              </select>
            </div>

            {chartData.length === 0 ? (
              /* Empty state — no chart data yet */
              <div className="h-64 flex flex-col items-center justify-center text-secondary gap-3">
                <div className="grid grid-cols-12 gap-3 w-full items-end h-40">
                  {MONTHS.map((m) => (
                    <div
                      key={m}
                      className="flex-1 rounded-t-sm bg-surface-container-highest/40"
                      style={{ height: '20%' }}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-outline-variant mt-2">
                  Aucune donnée disponible
                </p>
              </div>
            ) : (
              <div className="h-64 flex items-end gap-3 pb-4 px-2">
                {chartData.map((item, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all duration-500 cursor-pointer group relative ${
                      item.value > 70 ? 'bg-primary' : 'bg-surface-container'
                    }`}
                    style={{ height: `${item.value}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      {item.count} PV
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between text-[10px] font-extrabold text-outline-variant mt-2 px-1 tracking-tighter">
              {MONTHS.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-6">
            <h3 className="text-lg font-bold text-primary mb-6">Activités Récentes</h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-surface-container-low rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-secondary gap-2">
                <FileText size={32} className="text-outline-variant" />
                <p className="text-xs font-bold uppercase tracking-widest">Aucune activité récente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-3 hover:bg-surface-container-low rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary">{act.title}</p>
                      <p className="text-xs text-secondary">{act.user} • {act.time}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${act.color}`}>
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-primary text-white p-6 rounded-xl shadow-lg">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2">Métrique Clé</p>
            <p className="text-3xl font-black tracking-tight">
              {stats.archivingRate ?? '—'}
            </p>
            <p className="text-xs mt-2 opacity-80">Taux de numérisation</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
            <p className="text-blue-700 text-sm font-bold">
              📊 Statistiques en détail disponibles dans la section Recherche Avancée
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
