import React from 'react';
import {
  BarChart3, FileText, PlusCircle, Search,
  History, Settings, Menu, Bell, LogOut, User,
} from 'lucide-react';
import { motion } from 'motion/react';

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

// ── Menu items with role restrictions ────────────────────────────
// allowedRoles: undefined = tous, sinon liste des rôles autorisés
const ALL_MENU_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord',   icon: BarChart3  },
  { id: 'documents', label: 'Documents PV',       icon: FileText   },
  {
    id: 'add',
    label: 'Nouvel Ajout',
    icon: PlusCircle,
    allowedRoles: ['admin', 'gestionnaire', 'archiviste'], // consultant ❌
  },
  { id: 'search',   label: 'Recherche Avancée',  icon: Search  },
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
        <img
          src="/src/assets/OFPPT-Mini-Logo.png"
          alt="OFPPT Logo"
          className="w-10 h-10 object-contain"
        />
        <div>
          <p className="text-lg font-bold text-primary leading-none">Système PV</p>
          <p className="text-[10px] text-secondary font-medium mt-1 uppercase tracking-wider">
            Archivage Institutionnel
          </p>
        </div>
      </div>

      {/* Nav items */}
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
export const TopBar = ({ activeLabel, user, onLogout }) => {
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-outline-variant bg-white/80 backdrop-blur-md flex justify-between items-center px-8 h-16">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-primary lg:hidden">
          <Menu size={20} />
        </button>
        <img
          src="/src/assets/Ofppt-logo-horizontal.png"
          alt="OFPPT Logo"
          className="h-8 object-contain"
        />
        <div className="h-4 w-px bg-outline-variant/50 hidden md:block" />
        <span className="text-sm font-semibold text-secondary hidden md:block">{activeLabel}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder="Recherche rapide..."
            className="pl-10 pr-4 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-full text-sm w-64 focus:ring-2 focus:ring-primary-container focus:bg-white outline-none transition-all"
          />
        </div>

        <button className="p-2 text-secondary hover:bg-surface-container-high rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/30">
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