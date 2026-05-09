import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Download, FileText, Eye,
  ChevronLeft, ChevronRight, Database,
  LayoutGrid, AlertTriangle, X,
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';

// ── Constants ─────────────────────────────────────────────────────
const NIVEAUX = ['Technicien Spécialisé', 'Technicien', 'Qualification', 'Spécialisation'];

const currentYear = new Date().getFullYear();
const ACADEMIC_YEARS = Array.from({ length: 10 }, (_, i) => {
  const y = currentYear - i;
  return `${y}-${y + 1}`;
});

const STATUS_OPTIONS = [
  { value: 'BROUILLON',         label: 'Brouillon',         color: 'bg-slate-400'  },
  { value: 'EN_ATTENTE',        label: 'En attente',        color: 'bg-amber-400'  },
  { value: 'VALIDE_PAPIER',     label: 'Validé papier',     color: 'bg-blue-400'   },
  { value: 'ARCHIVE_NUMERIQUE', label: 'Archivé numérique', color: 'bg-violet-500' },
  { value: 'ARCHIVE_COMPLET',   label: 'Archive complète',  color: 'bg-green-500'  },
];

const TYPE_OPTIONS = [
  { value: 'PV_FF',  label: 'PV-FF — Fin de Formation'      },
  { value: 'PV_CC',  label: 'PV-CC — Contrôles Continus'    },
  { value: 'PV_EFM', label: 'PV-EFM — Examen Fin de Module' },
];

const STATUS_BADGE = {
  BROUILLON:         'bg-slate-100 text-slate-600',
  EN_ATTENTE:        'bg-amber-50 text-amber-700',
  VALIDE_PAPIER:     'bg-blue-50 text-blue-700',
  ARCHIVE_NUMERIQUE: 'bg-violet-50 text-violet-700',
  ARCHIVE_COMPLET:   'bg-green-50 text-green-700',
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const docTitle = (doc) => {
  if (doc.type === 'PV_FF')  return `${doc.filiere ?? '—'} · G${doc.groupe ?? ''}`;
  if (doc.type === 'PV_CC')  return `${doc.module ?? '—'} · ${doc.semester ?? ''}`;
  if (doc.type === 'PV_EFM') return `${doc.module ?? '—'} · ${doc.session ?? ''}`;
  return `PV #${doc.id}`;
};

// ── Field components ───────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <label className="text-[10px] font-black text-secondary tracking-widest px-1 uppercase">{children}</label>
);
const inputCls  = 'w-full py-3 border border-outline-variant/50 rounded-xl bg-surface-container-low/30 text-sm font-bold focus:ring-2 focus:ring-primary outline-none px-3';
const selectCls = `${inputCls} appearance-none cursor-pointer`;

// ── Main Component ─────────────────────────────────────────────────
export const AdvancedSearch = ({ onViewPv }) => {
  // Filter state
  const [globalQuery,   setGlobalQuery]   = useState('');
  const [pvType,        setPvType]        = useState('');
  const [niveau,        setNiveau]        = useState('');
  const [filiere,       setFiliere]       = useState('');
  const [groupe,        setGroupe]        = useState('');
  const [yearFrom,      setYearFrom]      = useState('');
  const [yearTo,        setYearTo]        = useState('');
  const [activeStatuses, setActiveStatuses] = useState(
    Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, true]))
  );
  const [sortBy, setSortBy] = useState('date_desc');

  // Results state
  const [results,      setResults]      = useState([]);
  const [totalCount,   setTotalCount]   = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [searched,     setSearched]     = useState(false); // did user search at least once?
  const [archivedTotal, setArchivedTotal] = useState(null);

  // Fetch archived total on mount
  useEffect(() => {
    api.get('/pv-documents', { params: { status: 'ARCHIVE_COMPLET', per_page: 1 } })
      .then(({ data }) => setArchivedTotal(data.total))
      .catch(() => {});
  }, []);

  // Build API params from filters
  const buildParams = useCallback((page = 1) => {
    const params = { page, per_page: 10 };
    if (globalQuery) params.search       = globalQuery;
    if (pvType)      params.type         = pvType;
    if (niveau)      params.niveau       = niveau;
    if (filiere)     params.filiere      = filiere;
    if (groupe)      params.groupe       = groupe;
    if (yearFrom)    params.academic_year = yearFrom; // filter by start year
    // Status: only send if not all selected
    const selectedStatuses = STATUS_OPTIONS
      .filter((s) => activeStatuses[s.value])
      .map((s) => s.value);
    if (selectedStatuses.length < STATUS_OPTIONS.length && selectedStatuses.length > 0) {
      params.status = selectedStatuses.join(',');
    }
    // Sort
    if (sortBy === 'date_desc') { params.sort = 'created_at'; params.direction = 'desc'; }
    if (sortBy === 'date_asc')  { params.sort = 'created_at'; params.direction = 'asc';  }
    return params;
  }, [globalQuery, pvType, niveau, filiere, groupe, yearFrom, activeStatuses, sortBy]);

  const fetchResults = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const { data } = await api.get('/pv-documents', { params: buildParams(page) });
      setResults(data.data);
      setTotalCount(data.total);
      setTotalPages(data.last_page);
      setCurrentPage(page);
    } catch {
      setError('Erreur lors de la recherche. Réessayez.');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // Re-fetch on page/sort change (only if already searched)
  useEffect(() => {
    if (searched) fetchResults(currentPage);
  }, [currentPage, sortBy]);

  const handleApply = () => { setCurrentPage(1); fetchResults(1); };

  const handleReset = () => {
    setGlobalQuery(''); setPvType(''); setNiveau('');
    setFiliere(''); setGroupe(''); setYearFrom(''); setYearTo('');
    setActiveStatuses(Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, true])));
    setSortBy('date_desc');
    setResults([]); setTotalCount(0); setTotalPages(1); setSearched(false);
  };

  const toggleStatus = (val) =>
    setActiveStatuses((prev) => ({ ...prev, [val]: !prev[val] }));

  const hasActiveFilters = globalQuery || pvType || niveau || filiere || groupe || yearFrom;

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary tracking-tighter uppercase">Recherche Avancée</h1>
          <p className="text-secondary text-sm font-medium">Accédez rapidement à l'ensemble des archives documentaires.</p>
        </div>
        <div className="flex gap-3">
          {/* Export buttons — Phase 7 */}
          <button disabled className="flex items-center gap-2 px-5 py-2.5 bg-white border border-outline-variant/60 text-secondary rounded-xl font-bold text-[10px] uppercase tracking-[0.15em] opacity-50 cursor-not-allowed">
            <LayoutGrid size={16} />
            Exporter Excel
          </button>
          <button disabled className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.15em] opacity-50 cursor-not-allowed shadow-lg shadow-primary/20">
            <FileText size={16} />
            Exporter PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Filter Sidebar ────────────────────────────────────── */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-primary tracking-tight uppercase flex items-center gap-3">
                <Filter size={20} />
                Filtres
              </h3>
              {hasActiveFilters && (
                <button onClick={handleReset} className="flex items-center gap-1 text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors">
                  <X size={12} /> Reset
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Global search */}
              <div className="space-y-1.5">
                <FieldLabel>Recherche globale</FieldLabel>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                  <input
                    type="text"
                    placeholder="Filière, module, groupe…"
                    value={globalQuery}
                    onChange={(e) => setGlobalQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                    className="w-full py-3 pl-9 pr-3 border border-outline-variant/50 rounded-xl bg-surface-container-low/30 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* Type PV */}
              <div className="space-y-1.5">
                <FieldLabel>Type de PV</FieldLabel>
                <select value={pvType} onChange={(e) => setPvType(e.target.value)} className={selectCls}>
                  <option value="">Tous les types</option>
                  {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Year range */}
              <div className="space-y-1.5">
                <FieldLabel>Année universitaire</FieldLabel>
                <div className="flex items-center gap-2">
                  <select value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} className={`${selectCls} flex-1`}>
                    <option value="">De…</option>
                    {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <span className="text-outline font-bold">—</span>
                  <select value={yearTo} onChange={(e) => setYearTo(e.target.value)} className={`${selectCls} flex-1`}>
                    <option value="">À…</option>
                    {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Niveau */}
              <div className="space-y-1.5">
                <FieldLabel>Niveau</FieldLabel>
                <select value={niveau} onChange={(e) => setNiveau(e.target.value)} className={selectCls}>
                  <option value="">Tous</option>
                  {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Filière */}
              <div className="space-y-1.5">
                <FieldLabel>Filière</FieldLabel>
                <input
                  type="text"
                  placeholder="Ex: Génie Informatique"
                  value={filiere}
                  onChange={(e) => setFiliere(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Groupe */}
              <div className="space-y-1.5">
                <FieldLabel>Groupe</FieldLabel>
                <input
                  type="text"
                  placeholder="Ex: G1"
                  value={groupe}
                  onChange={(e) => setGroupe(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Status checkboxes */}
              <div className="space-y-2">
                <FieldLabel>État de l'archive</FieldLabel>
                <div className="space-y-1">
                  {STATUS_OPTIONS.map((s) => (
                    <label key={s.value} className="flex items-center gap-3 p-2.5 hover:bg-surface-container-low/50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-outline-variant/30 group">
                      <input
                        type="checkbox"
                        checked={activeStatuses[s.value] ?? true}
                        onChange={() => toggleStatus(s.value)}
                        className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-bold text-secondary group-hover:text-primary tracking-tight transition-colors flex-1">
                        {s.label}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleApply}
                className="w-full bg-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-container transition-all flex items-center justify-center gap-2"
              >
                <Search size={16} />
                Appliquer les filtres
              </button>
            </div>
          </div>

          {/* Archived total card */}
          <div className="bg-primary-container text-white p-8 rounded-2xl flex items-center justify-between border border-primary relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] opacity-50 mb-1">Total Archivé</p>
              <p className="text-3xl font-black tracking-tighter">{archivedTotal ?? '—'}</p>
              <p className="text-[10px] opacity-50 mt-1 font-bold uppercase tracking-wider">Archives complètes</p>
            </div>
            <Database size={48} className="opacity-10 absolute -right-4 top-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
          </div>
        </aside>

        {/* ── Results Panel ─────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Results header */}
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-secondary">
              {searched ? (
                <>
                  <strong className="text-primary font-black">{totalCount}</strong>
                  {' '}résultat{totalCount !== 1 ? 's' : ''}
                  {globalQuery && <> pour <span className="italic text-primary font-bold">"{globalQuery}"</span></>}
                </>
              ) : (
                <span className="text-outline font-medium">Appliquez des filtres pour lancer une recherche.</span>
              )}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-secondary tracking-widest uppercase">Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); }}
                className="bg-transparent border-none text-xs font-black text-primary p-0 focus:ring-0 cursor-pointer uppercase tracking-wider underline underline-offset-4 decoration-2 appearance-none"
              >
                <option value="date_desc">Date (Récents)</option>
                <option value="date_asc">Date (Anciens)</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="bg-white border border-outline-variant rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low/30 border-b border-outline-variant/30">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-widest">Document</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-widest">Type</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-widest">Année</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-widest text-center">Statut</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {loading ? (
                    [1,2,3,4].map((i) => (
                      <tr key={i}>
                        <td colSpan={5} className="px-6 py-4">
                          <div className="h-10 bg-surface-container-low rounded-lg animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : !searched ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-secondary">
                          <Search size={40} className="text-outline-variant" />
                          <p className="text-sm font-bold uppercase tracking-widest">Prêt à rechercher</p>
                          <p className="text-xs font-medium text-outline">Configurez vos filtres et cliquez sur "Appliquer".</p>
                        </div>
                      </td>
                    </tr>
                  ) : results.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-secondary">
                          <Search size={40} className="text-outline-variant" />
                          <p className="text-sm font-bold uppercase tracking-widest">Aucun résultat</p>
                          <p className="text-xs font-medium text-outline">Essayez de modifier vos filtres.</p>
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
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
                              <FileText size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-primary tracking-tight max-w-[160px] truncate">{docTitle(doc)}</p>
                              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">#{doc.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-surface-container text-secondary">
                            {doc.type?.replace('_', '-')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-on-surface">{doc.academic_year ?? '—'}</p>
                          <p className="text-[10px] text-secondary font-medium">{fmtDate(doc.created_at)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-[0.1em] ${STATUS_BADGE[doc.status] ?? 'bg-surface-container text-secondary'}`}>
                            {STATUS_OPTIONS.find((s) => s.value === doc.status)?.label ?? doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onViewPv?.(doc.id)}
                              className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-full transition-all"
                              title="Voir le détail"
                            >
                              <Eye size={18} />
                            </button>
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
              <div className="px-8 py-5 border-t border-outline-variant/20 bg-surface-container-low/20 flex items-center justify-between">
                <p className="text-[11px] font-bold text-secondary uppercase tracking-widest">
                  {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, totalCount)} sur {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 border border-outline-variant rounded bg-white text-secondary hover:text-primary disabled:opacity-30 transition-all">
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 flex items-center justify-center rounded text-[11px] font-black transition-all ${p === currentPage ? 'bg-primary text-white shadow-md' : 'border border-outline-variant hover:bg-surface-container-low text-secondary'}`}>{p}</button>
                  ))}
                  {totalPages > 5 && <span className="w-8 h-8 flex items-center justify-center text-outline-variant">…</span>}
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 border border-outline-variant rounded bg-white text-secondary hover:text-primary disabled:opacity-30 transition-all">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};