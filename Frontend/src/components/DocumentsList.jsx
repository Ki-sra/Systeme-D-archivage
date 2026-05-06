import React, { useState } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  FileText,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { motion } from 'motion/react';

const StatusBadge = ({ status }) => {
  const styles = {
    'Scanné': 'bg-green-50 text-green-700 border-green-200',
    'Papier uniquement': 'bg-amber-50 text-amber-700 border-amber-200',
    'Manquant': 'bg-red-50 text-red-700 border-red-200',
    'En attente': 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] ?? 'bg-surface-container text-secondary border-outline-variant'}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'Scanné' ? 'bg-green-500' : status === 'Manquant' ? 'bg-red-500' : status === 'En attente' ? 'bg-blue-500' : 'bg-amber-500'}`} />
      {status}
    </span>
  );
};

export const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tighter uppercase">Documents PV</h1>
          <p className="text-secondary text-sm font-medium mt-1">Gestion complète des archives documentaires et scans.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par ID, titre..."
              className="pl-10 pr-4 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-primary-container outline-none appearance-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/60 bg-white text-secondary hover:text-primary hover:bg-surface-container-low rounded-lg font-bold text-[10px] uppercase tracking-[0.15em] transition-all">
            <Filter size={16} />
            Filtres
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-outline-variant shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/30">
                <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-[0.2em]">Document</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-[0.2em]">Filière & Groupe</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-[0.2em]">Date & Session</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-[0.2em] text-center">Statut</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-secondary tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-10 bg-surface-container-low rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-secondary">
                      <FileText size={40} className="text-outline-variant" />
                      <p className="text-sm font-bold uppercase tracking-widest">Aucun document trouvé</p>
                      <p className="text-xs font-medium text-outline">Les documents apparaîtront ici une fois chargés depuis l'API.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc, idx) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-surface-container-low/30 transition-colors group cursor-default"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary border border-outline-variant/20">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-primary tracking-tight">{doc.title}</p>
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-tighter">REF: {doc.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-on-surface tracking-tight">{doc.filiere}</p>
                      <p className="text-[11px] font-medium text-secondary">{doc.academicLevel} • G{doc.groupe}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-secondary">
                        <Clock size={14} />
                        <span className="text-xs font-semibold">{doc.addedDate}</span>
                      </div>
                      <span className="text-[10px] font-bold text-primary-container px-2 py-0.5 bg-surface-container rounded mt-1 inline-block uppercase">
                        {doc.session} {doc.year}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-full transition-all"><Eye size={18} /></button>
                        <button className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-full transition-all"><Download size={18} /></button>
                        <div className="h-6 w-px bg-outline-variant/30 mx-1" />
                        <button className="p-2 text-secondary hover:text-primary hover:bg-surface-container-low rounded-full transition-all"><MoreVertical size={18} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 border-t border-outline-variant/20 bg-surface-container-low/20 flex items-center justify-between">
          <p className="text-[11px] font-bold text-secondary uppercase tracking-widest">
            {totalCount === 0
              ? 'Aucun document'
              : `Affichage de ${(currentPage - 1) * 10 + 1} à ${Math.min(currentPage * 10, totalCount)} sur ${totalCount} documents`}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 border border-outline-variant rounded bg-white text-secondary hover:text-primary disabled:opacity-30 transition-all">
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 flex items-center justify-center rounded text-[11px] font-black transition-all ${p === currentPage ? 'bg-primary text-white shadow-md' : 'border border-outline-variant hover:bg-surface-container-low text-secondary'}`}>{p}</button>
              ))}
              {totalPages > 3 && <span className="w-8 h-8 flex items-center justify-center text-outline-variant">…</span>}
            </div>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 border border-outline-variant rounded bg-white text-secondary hover:text-primary disabled:opacity-30 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
