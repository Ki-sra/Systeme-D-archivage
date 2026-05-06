import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Download,
  CheckCircle,
  Clock,
  Upload,
  Trash2,
  Edit3,
  AlertTriangle,
  File,
  Eye,
  ChevronRight,
  User,
  Calendar,
  MapPin,
  BookOpen,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';

// ── Status lifecycle definition ───────────────────────────────────
const LIFECYCLE = [
  { key: 'BROUILLON',          label: 'Brouillon',          color: 'bg-slate-400'  },
  { key: 'EN_ATTENTE',         label: 'En attente',         color: 'bg-amber-400'  },
  { key: 'VALIDE_PAPIER',      label: 'Validé (papier)',    color: 'bg-blue-400'   },
  { key: 'ARCHIVE_NUMERIQUE',  label: 'Archivé numérique',  color: 'bg-violet-500' },
  { key: 'ARCHIVE_COMPLET',    label: 'Archive complète',   color: 'bg-green-500'  },
];

const STATUS_BADGE = {
  BROUILLON:          'bg-slate-100 text-slate-600 border-slate-200',
  EN_ATTENTE:         'bg-amber-50 text-amber-700 border-amber-200',
  VALIDE_PAPIER:      'bg-blue-50 text-blue-700 border-blue-200',
  ARCHIVE_NUMERIQUE:  'bg-violet-50 text-violet-700 border-violet-200',
  ARCHIVE_COMPLET:    'bg-green-50 text-green-700 border-green-200',
};

// ── Sub-components ────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary flex-shrink-0 mt-0.5">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[10px] font-black text-outline uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-on-surface mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

const StatusTimeline = ({ currentStatus }) => {
  const currentIdx = LIFECYCLE.findIndex((s) => s.key === currentStatus);
  return (
    <div className="flex items-center gap-0">
      {LIFECYCLE.map((step, idx) => {
        const done    = idx <= currentIdx;
        const current = idx === currentIdx;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                done
                  ? `${step.color} border-transparent text-white`
                  : 'bg-surface-container border-outline-variant text-outline'
              } ${current ? 'ring-4 ring-offset-2 ring-primary/20' : ''}`}>
                {done ? <CheckCircle size={16} /> : <Clock size={14} />}
              </div>
              <p className={`text-[9px] font-black uppercase tracking-wider text-center w-16 leading-tight ${
                done ? 'text-primary' : 'text-outline'
              }`}>
                {step.label}
              </p>
            </div>
            {idx < LIFECYCLE.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 mx-1 ${idx < currentIdx ? 'bg-primary' : 'bg-outline-variant/30'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
export const PvDetail = ({ pvId, onBack }) => {
  // Document data — will be fetched from API by pvId
  const [document, setDocument] = useState(null);

  // Files attached to this PV — from API
  const [files, setFiles] = useState([]);

  // Activity history for this PV — from API
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);

  // Placeholder for when data hasn't loaded yet
  const status = document?.status ?? 'BROUILLON';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="p-2 border border-outline-variant rounded-xl bg-white text-secondary hover:text-primary hover:bg-surface-container-low transition-all flex-shrink-0 mt-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-outline mb-1">
            <button onClick={onBack} className="text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors">
              Documents PV
            </button>
            <ChevronRight size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {document?.id ? `REF: #${document.id}` : 'Détail du document'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">
            {document?.title ?? 'Chargement…'}
          </h1>
          {document?.status && (
            <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_BADGE[document.status]}`}>
              {LIFECYCLE.find((s) => s.key === document.status)?.label ?? document.status}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant bg-white text-secondary hover:text-primary hover:bg-surface-container-low rounded-xl font-bold text-xs uppercase tracking-wider transition-all">
            <Edit3 size={16} />
            Modifier
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary-container transition-all shadow-lg shadow-primary/10">
            <CheckCircle size={16} />
            Valider
          </button>
        </div>
      </div>

      {/* Status timeline */}
      <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
        <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-8">
          Cycle de vie du document
        </h3>
        <StatusTimeline currentStatus={status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Info + Files */}
        <div className="lg:col-span-8 space-y-8">

          {/* Document metadata */}
          <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6">
              Informations académiques
            </h3>

            {loading ? (
              <div className="grid grid-cols-2 gap-6">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="h-12 bg-surface-container-low rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoRow icon={FileText}  label="Type de PV"         value={document?.type} />
                <InfoRow icon={Calendar}  label="Année universitaire" value={document?.academic_year} />
                <InfoRow icon={BookOpen}  label="Filière"             value={document?.filiere} />
                <InfoRow icon={Users}     label="Niveau & Groupe"     value={document ? `${document.niveau} — ${document.groupe ?? 'N/A'}` : null} />
                <InfoRow icon={Clock}     label="Session"             value={document?.session} />
                <InfoRow icon={MapPin}    label="Localisation physique" value={document?.physical_location} />
                <InfoRow icon={User}      label="Créé par"            value={document?.creator?.name} />
                <InfoRow icon={Calendar}  label="Date de création"    value={document?.created_at} />
              </div>
            )}
          </div>

          {/* Uploaded files */}
          <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-primary uppercase tracking-widest">
                Scans & Fichiers ({files.length})
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary-container transition-all shadow-sm">
                <Upload size={16} />
                Ajouter un scan
              </button>
            </div>

            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 border-2 border-dashed border-outline-variant/40 rounded-2xl">
                <File size={36} className="text-outline-variant" />
                <p className="text-sm font-bold text-secondary uppercase tracking-widest">
                  Aucun fichier joint
                </p>
                <p className="text-xs text-outline font-medium">
                  Les scans apparaîtront ici une fois uploadés.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl group hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-primary truncate">{file.original_name}</p>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mt-0.5">
                        {file.file_type?.toUpperCase()} • {(file.file_size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-secondary hover:text-primary transition-colors"><Eye size={16} /></button>
                      <button className="p-1.5 text-secondary hover:text-primary transition-colors"><Download size={16} /></button>
                      <button className="p-1.5 text-secondary hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: History */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6">
              Historique des actions
            </h3>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-secondary">
                <Clock size={28} className="text-outline-variant" />
                <p className="text-xs font-bold uppercase tracking-widest">Aucune action</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-outline-variant/30" />
                <div className="space-y-6">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 relative z-10">
                        <Clock size={14} className="text-secondary" />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-xs font-black text-primary">{entry.action}</p>
                        <p className="text-[10px] font-medium text-secondary">{entry.user?.name}</p>
                        <p className="text-[10px] font-bold text-outline mt-1">{entry.created_at}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle size={16} />
              <h3 className="text-xs font-black uppercase tracking-widest">Zone de danger</h3>
            </div>
            <p className="text-xs font-medium text-red-600 leading-relaxed">
              La suppression d'un document est irréversible.
            </p>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-300 bg-white text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
              <Trash2 size={14} />
              Supprimer ce PV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
