import React, { useState } from 'react';
import {
  User,
  FileText,
  Trash2,
  Edit3,
  Plus,
  Eye,
  BarChart,
  ChevronDown,
  Download,
} from 'lucide-react';

// ── Sub-components ────────────────────────────────────────────────────────────

const FilterSelect = ({ label, icon: Icon, options }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-secondary tracking-widest px-1 uppercase flex items-center gap-2">
      <Icon size={16} />
      {label}
    </label>
    <select className="w-full py-2.5 border border-outline-variant/50 rounded-lg bg-surface-container-low/30 text-sm font-bold focus:ring-2 focus:ring-primary outline-none px-3 appearance-none cursor-pointer">
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const DateInput = ({ label }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-secondary tracking-widest px-1 uppercase">{label}</label>
    <input
      type="date"
      className="w-full py-2.5 border border-outline-variant/50 rounded-lg bg-surface-container-low/30 text-sm font-bold focus:ring-2 focus:ring-primary outline-none px-3"
    />
  </div>
);

// Icon map for action types — used when data arrives from API
const ACTION_ICONS = {
  Ajout:        { icon: Plus,   color: 'bg-green-500' },
  Modification: { icon: Edit3,  color: 'bg-blue-500'  },
  Suppression:  { icon: Trash2, color: 'bg-red-500'   },
  Consultation: { icon: Eye,    color: 'bg-secondary'  },
};

const ActivityItem = ({ user, action, target, time }) => {
  const { icon: Icon, color } = ACTION_ICONS[action] ?? { icon: FileText, color: 'bg-outline' };
  return (
    <div className="flex items-start group relative">
      <div className="w-12 text-right mr-8 pt-1.5">
        <span className="text-xs font-black text-primary/40 tracking-tighter">{time}</span>
      </div>
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white flex-shrink-0 relative z-10`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 ml-8 pt-1">
        <div className="bg-white border border-outline-variant p-4 rounded-xl group-hover:shadow-md transition-shadow">
          <p className="text-sm font-black text-primary tracking-tight">{action}</p>
          <p className="text-xs text-secondary font-medium">{user}</p>
          <p className="text-xs font-bold text-primary-container bg-surface-container px-2 py-1 rounded w-fit mt-2">
            {target}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export const ActivityLog = () => {
  // Activities — will be populated from API, grouped by date
  const [activityGroups, setActivityGroups] = useState([]);
  // e.g. [{ date: "Aujourd'hui", items: [...] }, { date: "Hier", items: [...] }]

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tighter uppercase">Journal d'activité</h1>
          <p className="text-secondary text-sm font-medium mt-1">
            Historique complet des actions effectuées sur la plateforme.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 border border-outline-variant bg-white text-secondary hover:text-primary transition-all rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm">
          <Download size={16} />
          Exporter le log
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-8 rounded-2xl border border-outline-variant shadow-sm">
        <FilterSelect label="Utilisateur"   icon={User}     options={['Tous']} />
        <FilterSelect label="Type d'action" icon={BarChart}  options={['Toutes', 'Ajout', 'Modification', 'Suppression']} />
        <DateInput label="Date de début" />
        <DateInput label="Date de fin" />
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-outline-variant shadow-lg overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/20">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest">Chronologie des actions</h3>
        </div>

        <div className="relative p-8">
          {/* Vertical timeline line */}
          <div className="absolute left-[71px] top-0 bottom-0 w-px bg-outline-variant/30" />

          {loading ? (
            /* Skeleton */
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
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
                Le journal d'activité apparaîtra ici une fois chargé depuis l'API.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {activityGroups.map((group) => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex items-center gap-8 mb-8">
                    <div className="w-12 text-right">
                      <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                        {group.date}
                      </span>
                    </div>
                    <div className="h-px flex-1 bg-outline-variant/20" />
                  </div>
                  <div className="space-y-8">
                    {group.items.map((act) => (
                      <ActivityItem key={act.id} {...act} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load more */}
        <div className="p-6 flex justify-center border-t border-outline-variant/20 bg-surface-container-low/10">
          <button
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
