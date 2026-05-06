import React, { useState } from 'react';
import { Sidebar, TopBar } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { DocumentsList } from './components/DocumentsList';
import { AddPV } from './components/AddPV';
import { AdvancedSearch } from './components/AdvancedSearch';
import { ActivityLog } from './components/ActivityLog';
import { PvDetail } from './components/PvDetail';
import { UserManagement } from './components/UserManagement';
import { Settings } from './components/Settings';
import Login from './components/Login';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [user, setUser]           = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedPvId, setSelectedPvId] = useState(null);

  const handleLogin  = (userData) => { setUser(userData); setActivePage('dashboard'); };
  const handleLogout = () => { setUser(null); };

  const openPvDetail = (pvId) => { setSelectedPvId(pvId); setActivePage('pv-detail'); };
  const closePvDetail = () => { setSelectedPvId(null); setActivePage('documents'); };

  if (!user) return <Login onLogin={handleLogin} />;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'documents': return <DocumentsList onViewPv={openPvDetail} />;
      case 'add':       return <AddPV onNavigate={setActivePage} />;
      case 'search':    return <AdvancedSearch onViewPv={openPvDetail} />;
      case 'activity':  return <ActivityLog />;
      case 'pv-detail': return <PvDetail pvId={selectedPvId} onBack={closePvDetail} />;
      case 'users':     return <UserManagement />;
      case 'settings':  return <Settings />;
      default:          return <Dashboard />;
    }
  };

  const getPageLabel = () => {
    switch (activePage) {
      case 'dashboard': return 'Tableau de bord';
      case 'documents': return 'Documents PV';
      case 'add':       return 'Nouvel Ajout';
      case 'search':    return 'Recherche Avancée';
      case 'activity':  return "Journal d'activité";
      case 'pv-detail': return 'Détail du document';
      case 'users':     return 'Gestion des utilisateurs';
      case 'settings':  return 'Paramètres';
      default:          return '';
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar activePage={activePage} onPageChange={setActivePage} user={user} onLogout={handleLogout} />

      <main className="flex-1 ml-[260px] min-h-screen flex flex-col">
        <TopBar activeLabel={getPageLabel()} user={user} onLogout={handleLogout} />

        <div className="p-8 lg:p-12 max-w-[1440px] mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="px-12 py-6 border-t border-outline-variant/20 flex justify-between items-center bg-white/50">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest italic">
            Confidentialité & Sécurité des données institutionnelles garanties.
          </p>
          <div className="flex gap-6">
            <button className="text-[10px] font-black text-secondary hover:text-primary transition-colors uppercase tracking-widest">Support</button>
            <button className="text-[10px] font-black text-secondary hover:text-primary transition-colors uppercase tracking-widest">Documentation</button>
          </div>
        </footer>
      </main>
    </div>
  );
}
