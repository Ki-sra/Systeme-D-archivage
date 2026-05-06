import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  FileText,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  Database,
  LayoutGrid,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'motion/react';

// ── Sub-components ────────────────────────────────────────────────────────────

const SearchField = ({ label, placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-secondary tracking-widest px-1 uppercase">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full py-3 border border-outline-variant/50 rounded-xl bg-surface-container-low/30 text-sm font-bold focus:ring-2 focus:ring-primary outline-none px-3"
    />
  </div>
);

const SearchSelect = ({ label, options }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-secondary tracking-widest px-1 uppercase">{label}</label>
    <select className="w-full py-3 border border-outline-variant/50 rounded-xl bg-surface-container-low/30 text-sm font-bold focus:ring-2 focus:ring-primary outline-none px-3 appearance-none cursor-pointer">
      {options.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const StatusCell = ({ status }) => {
  const map = {
    'Scanné':          'bg-green-50 text-green-700',
    'Papier':          'bg-amber-50 text-amber-700',
    'Manquant':        'bg-red-50 text-red-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-[0.1em] ${map[status] ?? 'bg-surface-container text-secondary'}`}>
      {status}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

// Status filter options (UI-only, labels fixed; API will use values)
const STATUS_FILTERS = [
  { label: 'Scanné',           color: 'bg-green-500' },
  { label: 'Papier uniquement', color: 'bg-amber-500' },
  { label: 'Manquant',          color: 'bg-red-500'   },
];

export const AdvancedSearch = () => {
  // Search / filter state
  const [globalQuery, setGlobalQuery]     = useState('');
  const [sortBy, setSortBy]               = useState('date_desc');
  const [statusFilters, setStatusFilters] = useState({
    'Scanné': true,
    'Papier uniquement': true,
    'Manquant': true,
  });

  // Results state — will be populated from API
  const [results, setResults]       = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading]       = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  // Total archived count (from API summary)
  const [archivedTotal, setArchivedTotal] = useState(null);

  const toggleStatus = (label) => {
    setStatusFilters((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary tracking-tighter uppercase">Recherche Avancée</h1>
          <p className="text-secondary text-sm font-medium">Accédez rapidement à l'ensemble des archives documentaires du système.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-outline-variant/60 text-secondary hover:text-primary rounded-xl font-bold text-[10px] uppercase tracking-[0.15em] transition-all">
            <LayoutGrid size={16} />
            Exporter Excel
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-primary-container transition-all shadow-lg shadow-primary/20">
            <FileText size={16} />
            Exporter PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
            <h3 className="text-lg font-black text-primary tracking-tight uppercase flex items-center gap-3 mb-8">
              <Filter size={20} />
              Filtres
            </h3>

            <div className="space-y-8">
              <SearchField
                label="RECHERCHE GLOBALE"
                placeholder="Nom, ID, Cours..."
                value={globalQuery}
                onChange={setGlobalQuery}
              />

              {/* Year range — static UI, will be wired to filter state */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary tracking-widest px-1">PLAGE D'ANNÉE</label>
                <div className="flex items-center gap-3">
                  <select className="flex-1 py-3 border border-outline-variant/50 rounded-xl bg-surface-container-low/30 text-sm font-bold focus:ring-2 focus:ring-primary outline-none px-3 appearance-none cursor-pointer">
                    <option value="">De…</option>
                  </select>
                  <span className="text-outline">—</span>
                  <select className="flex-1 py-3 border border-outline-variant/50 rounded-xl bg-surface-container-low/30 text-sm font-bold focus:ring-2 focus:ring-primary outline-none px-3 appearance-none cursor-pointer">
                    <option value="">À…</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SearchSelect label="NIVEAU" options={['Tous']} />
                <SearchSelect label="GROUPE" options={['Tous']} />
              </div>

              <SearchSelect label="FILIÈRE" options={['Toutes']} />

              {/* Status checkboxes */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-secondary tracking-widest px-1 uppercase">ÉTAT DE L'ARCHIVE</label>
                <div className="space-y-1">
                  {STATUS_FILTERS.map((s) => (
                    <label
                      key={s.label}
                      className="flex items-center gap-3 p-2.5 hover:bg-surface-container-low/50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-outline-variant/30 group"
                    >
                      <input
                        type="checkbox"
                        checked={statusFilters[s.label] ?? false}
                        onChange={() => toggleStatus(s.label)}
                        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-bold text-secondary group-hover:text-primary tracking-tight transition-colors">
                        {s.label}
                      </span>
                      <div className={`ml-auto w-2 h-2 rounded-full ${s.color}`} />
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full bg-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-container transition-all">
                Appliquer les filtres
              </button>
            </div>
          </div>

          {/* Archived total card */}
          <div className="bg-primary-container text-white p-8 rounded-2xl flex items-center justify-between border border-primary relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] opacity-50 mb-1">Total Archivé</p>
              <p className="text-3xl font-black tracking-tighter">{archivedTotal ?? '—'}</p>
            </div>
            <Database size={48} className="opacity-10 absolute -right-4 top-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
          </div>
        </aside>

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-secondary">
              <strong className="text-primary font-black">{totalCount}</strong> résultat{totalCount !== 1 ? 's' : ''}
              {globalQuery && <> pour <span className="italic text-primary font-bold">"{globalQuery}"</span></>}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-secondary tracking-widest uppercase">Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-xs font-black text-primary p-0 focus:ring-0 cursor-pointer uppercase tracking-wider underline underline-offset-4 decoration-2 appearance-none"
              >
                <option value="date_desc">Date (Récents)</option>
                <option value="name_asc">Nom (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low/30 border-b border-outline-variant/30">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-widest">Document / ID</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-widest">Filière & Niveau</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-widest text-center">Statut</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {loading ? (
                    [1, 2, 3, 4].map((i) => (
                      <tr key={i}>
                        <td colSpan={4} className="px-6 py-4">
                          <div className="h-10 bg-surface-container-low rounded-lg animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : results.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-secondary">
                          <Search size={40} className="text-outline-variant" />
                          <p className="text-sm font-bold uppercase tracking-widest">Aucun résultat</p>
                          <p className="text-xs font-medium text-outline">
                            Appliquez des filtres pour lancer une recherche.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    results.map((doc, idx) => (
                      <motion.tr
                        key={doc.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="hover:bg-surface-container-low/20 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.status === 'Manquant' ? 'bg-red-50 text-red-500' : 'bg-surface-container-low text-primary'}`}>
                              {doc.status === 'Manquant' ? <AlertTriangle size={20} /> : <FileText size={20} />}
                            </div>
                            <div>
                              <p className="text-sm font-black text-primary tracking-tight">{doc.title}</p>
                              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">ID: #{doc.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-primary tracking-tight">{doc.filiere}</p>
                          <p className="text-[11px] font-medium text-secondary tracking-tighter">{doc.level} - {doc.groupe}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusCell status={doc.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-secondary hover:text-primary transition-colors"><Eye size={18} /></button>
                            <button className="p-2 text-secondary hover:text-primary transition-colors"><Download size={18} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-8 py-5 border-t border-outline-variant/20 bg-surface-container-low/20 flex items-center justify-end gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 border border-outline-variant rounded bg-white text-secondary hover:text-primary disabled:opacity-30 transition-all">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 flex items-center justify-center rounded text-[11px] font-black transition-all ${p === currentPage ? 'bg-primary text-white shadow-md' : 'border border-outline-variant hover:bg-surface-container-low text-secondary'}`}>{p}</button>
                ))}
                {totalPages > 3 && <span className="w-8 h-8 flex items-center justify-center text-outline-variant">…</span>}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 border border-outline-variant rounded bg-white text-secondary hover:text-primary disabled:opacity-30 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
