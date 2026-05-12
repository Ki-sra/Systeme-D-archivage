import React, { useState, useEffect, useRef, useCallback } from 'react';
import ofpptMiniLogo from '../assets/OFPPT-Mini-Logo.png';
import {
  BarChart3, FileText, PlusCircle, Search,
  History, Settings, Menu, Bell, LogOut, User,
  AlertTriangle, CheckCircle2, Clock, Info, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../services/api';

// ── Role display helpers ──────────────────────────────────────────
const ROLE_STYLES = {
  admin:        'bg-purple-100 text-purple-700',
  gestionnaire: 'bg-blue-100 text-blue-700',
  archiviste:   'bg-green-100 text-green-700',
  consultant:   'bg-amber-100 text-amber-700',
};

const ROLE_LABELS = {
  admin:        'Administrateur',
  gestionnaire: 'Gestionnaire',
  archiviste:   'Archiviste',
  consultant:   'Consultant',
};

// ── Notification icon + color mapping ────────────────────────────
const ALERT_CONFIG = {
  created:        { icon: FileText,      color: 'text-blue-500',   bg: 'bg-blue-50'   },
  status_changed: { icon: CheckCircle2,  color: 'text-green-500',  bg: 'bg-green-50'  },
  missing:        { icon: AlertTriangle, color: 'text-amber-500',  bg: 'bg-amber-50'  },
  reminder:       { icon: Clock,         color: 'text-purple-500', bg: 'bg-purple-50' },
  info:           { icon: Info,          color: 'text-slate-400',  bg: 'bg-slate-50'  },
};

const fmtRelative = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return "À l'instant";
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
};

// ── NotificationBell component ────────────────────────────────────
const NotificationBell = ({ onNavigate }) => {
  const [open, setOpen]             = useState(false);
  const [notifications, setNotifs]  = useState([]);
  const [unreadCount, setUnread]    = useState(0);
  const [loading, setLoading]       = useState(false);
  const dropdownRef                 = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifs(data.notifications ?? []);
      setUnread(data.unread_count ?? 0);
    } catch {
      /* silently ignore — don't block UX */
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount + poll every 60 s
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleMarkRead = async (n) => {
    if (n.type === 'notification' && !n.read) {
      await api.patch(`/notifications/${n.id}/read`).catch(() => {});
      setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
      setUnread((c) => Math.max(0, c - 1));
    }
    if (n.pv_id && onNavigate) onNavigate(n.pv_id);
    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifs((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell trigger button */}
      <button
        id="topbar-notifications-btn"
        onClick={() => { setOpen((o) => !o); if (!open) fetchNotifications(); }}
        className="p-2 text-secondary hover:bg-surface-container-high rounded-full relative transition-colors"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white px-0.5 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            exit={{    opacity: 0, y: -8, scale: 0.96  }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-12 w-[360px] bg-white rounded-2xl shadow-2xl border border-outline-variant/40 z-50 overflow-hidden"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30 bg-surface-container-low/60">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-primary" />
                <span className="text-sm font-bold text-primary">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
                    {unreadCount} non lues
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-primary font-semibold hover:underline"
                  >
                    Tout marquer lu
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 hover:bg-surface-container rounded-full text-secondary transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[400px] overflow-y-auto divide-y divide-outline-variant/20">
              {loading && notifications.length === 0 ? (
                <div className="py-10 text-center text-secondary text-sm">Chargement…</div>
              ) : notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3 text-secondary">
                  <Bell size={30} className="opacity-20" />
                  <p className="text-sm font-medium">Aucune notification</p>
                  <p className="text-xs opacity-60">Vous êtes à jour !</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const cfg  = ALERT_CONFIG[n.alert_type] ?? ALERT_CONFIG.info;
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleMarkRead(n)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-container-low/60 transition-colors ${
                        !n.read ? 'bg-primary/[0.025]' : ''
                      }`}
                    >
                      {/* Icon badge */}
                      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${cfg.bg}`}>
                        <Icon size={14} className={cfg.color} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold leading-tight ${!n.read ? 'text-primary' : 'text-secondary'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-secondary mt-0.5 leading-snug line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-outline mt-1">{fmtRelative(n.created_at)}</p>
                      </div>

                      {/* Unread dot */}
                      {!n.read && (
                        <span className="mt-2.5 flex-shrink-0 w-1.5 h-1.5 bg-primary rounded-full" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Sidebar menu items with role restrictions ─────────────────────
const ALL_MENU_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord',  icon: BarChart3 },
  { id: 'documents', label: 'Documents PV',      icon: FileText  },
  {
    id: 'add',
    label: 'Nouvel Ajout',
    icon: PlusCircle,
    allowedRoles: ['admin', 'gestionnaire', 'archiviste'],
  },
  { id: 'search', label: 'Recherche Avancée', icon: Search },
  {
    id: 'activity',
    label: "Journal d'activité",
    icon: History,
    allowedRoles: ['admin', 'gestionnaire'],
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: User,
    allowedRoles: ['admin'],
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    allowedRoles: ['admin'],
  },
];

// ── Sidebar ───────────────────────────────────────────────────────
export const Sidebar = ({ activePage, onPageChange, user, onLogout }) => {
  const role = user?.role;

  const menuItems = ALL_MENU_ITEMS.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(role)
  );

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] border-r border-outline-variant bg-white flex flex-col py-4 z-50">
      {/* Logo */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <img src={ofpptMiniLogo} alt="OFPPT Logo" className="w-10 h-10 object-contain" />
        <div>
          <p className="text-lg font-bold text-primary leading-none">Système PV</p>
          <p className="text-[10px] text-secondary font-medium mt-1 uppercase tracking-wider">
            Archivage Institutionnel
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 relative group ${
                isActive
                  ? 'bg-surface-container-high text-primary'
                  : 'text-secondary hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
              <item.icon
                size={20}
                className={isActive ? 'text-primary' : 'text-secondary group-hover:text-primary'}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="mt-auto px-4 pt-4 border-t border-outline-variant/30 space-y-3">
        {user?.role && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ROLE_STYLES[role] ?? 'bg-surface-container text-secondary'}`}>
            {ROLE_LABELS[role] ?? role}
          </span>
        )}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-black flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary truncate">{user?.name ?? 'Utilisateur'}</p>
            <p className="text-[10px] text-secondary truncate">{user?.email ?? ''}</p>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            title="Se déconnecter"
            className="p-2 text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

// ── TopBar ────────────────────────────────────────────────────────
export const TopBar = ({ activeLabel, user, onLogout, onNavigate }) => {
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-outline-variant bg-white/80 backdrop-blur-md flex justify-between items-center px-8 h-16">
      {/* Left: page title */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-primary lg:hidden">
          <Menu size={20} />
        </button>
        <span className="text-sm font-semibold text-secondary hidden md:block">{activeLabel}</span>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-3">
        <NotificationBell onNavigate={onNavigate} />

        <div className="flex items-center gap-2 pl-3 border-l border-outline-variant/30">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-primary leading-none">{user?.name ?? 'Utilisateur'}</p>
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">En ligne</p>
          </div>
          <button
            id="topbar-logout-btn"
            onClick={onLogout}
            title="Se déconnecter"
            className="ml-1 p-1.5 text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};