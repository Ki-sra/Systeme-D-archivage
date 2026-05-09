import React, { useState, useEffect, useCallback } from 'react';
import {
  User, FileText, Trash2, Edit3, Plus, Eye,
  BarChart, ChevronDown, Download, Search,
  LogIn, LogOut, Upload, CheckCircle, X,
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';

// ── Action icon/color map ─────────────────────────────────────────
const ACTION_MAP = {
  CREATE:   { label: 'Ajout',          icon: Plus,         color: 'bg-green-500'  },
  UPDATE:   { label: 'Modification',   icon: Edit3,        color: 'bg-blue-500'   },
  DELETE:   { label: 'Suppression',    icon: Trash2,       color: 'bg-red-500'    },
  VIEW:     { label: 'Consultation',   icon: Eye,          color: 'bg-slate-400'  },
  UPLOAD:   { label: 'Upload fichier', icon: Upload,       color: 'bg-violet-500' },
  VALIDATE: { label: 'Validation',     icon: CheckCircle,  color: 'bg-emerald-500'},
  LOGIN:    { label: 'Connexion',      icon: LogIn,        color: 'bg-primary'    },
  LOGOUT:   { label: 'Déconnexion',    icon: LogOut,       color: 'bg-outline'    },
};

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

const fmtDate = (iso) => {
  if (!iso) return '';
  const d    = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};

// Group flat logs by date label
const groupByDate = (logs) => {
  const groups = {};
  logs.forEach((log) => {
    const label = fmtDate(log.created_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(log);
  });
  return Object.entries(groups).map(([date, items]) => ({ date, items }));
};

// ── ActivityItem ──────────────────────────────────────────────────
const ActivityItem = ({ log }) => {
  const mapped = ACTION_MAP[log.action] ?? { label: log.action, icon: FileText, color: 'bg-outline' };
  const Icon   = mapped.icon;
  return (
    <div className="flex items-start group relative">
      <div className="w-12 text-right mr-8 pt-1.5 flex-shrink-0">
        <span className="text-xs font-black text-primary/40 tracking-tighter">{fmtTime(log.created_at)}</span>
      </div>
      <div className={`w-12 h-12 rounded-full ${mapped.color} flex items-center justify-center text-white flex-shrink-0 relative z-10`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 ml-8 pt-1">
        <div className="bg-white border border-outline-variant p-4 rounded-xl group-hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-black text-primary tracking-tight">{mapped.label}</p>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{log.user?.role ?? ''}</span>
          </div>
          <p className="text-xs text-secondary font-medium mt-0.5">{log.user?.name ?? '—'}</p>
          {log.target_label && (
            <p className="text-xs font-bold text-primary-container bg-surface-container px-2 py-1 rounded w-fit mt-2 truncate max-w-xs">
              {log.target_label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
export const ActivityLog = () => {
  const [logs,         setLogs]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [hasMore,      setHasMore]      = useState(false);
  const [totalCount,   setTotalCount]   = useState(0);

  // Filters
  const [search,    setSearch]    = useState('');
  const [action,    setAction]    = useState('');
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');

  const fetchLogs = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, per_page: 20 };
      if (search)   params.search    = search;
      if (action)   params.action    = action;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo)   params.date_to   = dateTo;

      const { data } = await api.get('/activity-logs', { params });

      setTotalCount(data.total);
      setHasMore(data.current_page < data.last_page);
      setCurrentPage(data.current_page);
      setLogs((prev) => append ? [...prev, ...data.data] : data.data);
    } catch {
      setError('Impossible de charger le journal d\'activité.');
    } finally {
      setLoading(false);
    }
  }, [search, action, dateFrom, dateTo]);

  // Initial fetch + filter changes
  useEffect(() => { fetchLogs(1, false); }, [action, dateFrom, dateTo]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchLogs(1, false), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleLoadMore = () => fetchLogs(currentPage + 1, true);

  const handleReset = () => {
    setSearch(''); setAction(''); setDateFrom(''); setDateTo('');
  };

  const hasFilters = search || action || dateFrom || dateTo;
  const activityGroups = groupByDate(logs);

  // Export — download as JSON (PDF export → Phase 7)
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `activity-log-${new Date().toISOString().slice(0,10)}.json`;
    link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tighter uppercase">Journal d'activité</h1>
          <p className="text-secondary text-sm font-medium mt-1">
            Historique complet des actions effectuées sur la plateforme.
            {totalCount > 0 && <span className="ml-2 font-black text-primary">{totalCount} entrées</span>}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={logs.length === 0}
          className="flex items-center gap-2 px-6 py-3 border border-outline-variant bg-white text-secondary hover:text-primary transition-all rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm disabled:opacity-40"
        >
          <Download size={16} />
          Exporter le log
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-secondary tracking-widest px-1 uppercase">Recherche</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Document, action…"
                className="w-full pl-8 pr-3 py-2.5 border border-outline-variant/50 rounded-lg bg-surface-container-low/30 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Action type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-secondary tracking-widest px-1 uppercase flex items-center gap-1">
              <BarChart size={12} /> Type d'action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full py-2.5 border border-outline-variant/50 rounded-lg bg-surface-container-low/30 text-sm font-bold focus:ring-2 focus:ring-primary outline-none px-3 appearance-none cursor-pointer"
            >
              <option value="">Toutes</option>
              {Object.entries(ACTION_MAP).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-secondary tracking-widest px-1 uppercase">Date de début</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full py-2.5 border border-outline-variant/50 rounded-lg bg-surface-container-low/30 text-sm font-bold focus:ring-2 focus:ring-primary outline-none px-3"
            />
          </div>

          {/* Date to */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-secondary tracking-widest px-1 uppercase">Date de fin</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full py-2.5 border border-outline-variant/50 rounded-lg bg-surface-container-low/30 text-sm font-bold focus:ring-2 focus:ring-primary outline-none px-3"
            />
          </div>
        </div>

        {hasFilters && (
          <button onClick={handleReset} className="flex items-center gap-1 text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors">
            <X size={12} /> Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">{error}</div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-outline-variant shadow-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/20">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest">Chronologie des actions</h3>
        </div>

        <div className="relative p-8">
          <div className="absolute left-[71px] top-0 bottom-0 w-px bg-outline-variant/30" />

          {loading && logs.length === 0 ? (
            <div className="space-y-8">
              {[1,2,3].map((i) => (
                <div key={i} className="flex items-start gap-8">
                  <div className="w-12 h-4 bg-surface-container-low rounded animate-pulse" />
                  <div className="w-12 h-12 rounded-full bg-surface-container-low animate-pulse flex-shrink-0" />
                  <div className="flex-1 h-20 bg-surface-container-low rounded-xl animate-pulse ml-8" />
                </div>
              ))}
            </div>
          ) : activityGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-secondary">
              <FileText size={40} className="text-outline-variant" />
              <p className="text-sm font-bold uppercase tracking-widest">Aucune activité enregistrée</p>
              <p className="text-xs font-medium text-outline">
                {hasFilters ? 'Essayez de modifier vos filtres.' : 'Les actions apparaîtront ici au fur et à mesure.'}
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {activityGroups.map((group) => (
                <div key={group.date}>
                  <div className="flex items-center gap-8 mb-8">
                    <div className="w-12 text-right flex-shrink-0">
                      <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{group.date}</span>
                    </div>
                    <div className="h-px flex-1 bg-outline-variant/20" />
                  </div>
                  <div className="space-y-8">
                    {group.items.map((log) => (
                      <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                        <ActivityItem log={log} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
              {/* Loading more spinner */}
              {loading && logs.length > 0 && (
                <div className="flex justify-center py-4">
                  <svg className="animate-spin w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Load more */}
        <div className="p-6 flex justify-center border-t border-outline-variant/20 bg-surface-container-low/10">
          <button
            onClick={handleLoadMore}
            disabled={!hasMore || loading}
            className="px-8 py-3 bg-white border border-outline-variant/50 text-primary rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-surface hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Charger plus d'activité
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};