import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, LogOut, Trash2, Box, X, AlertTriangle, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EditTankModal from './EditTankModal';

const languages = [
  { code: 'it', name: 'Italiano' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'zh', name: '中文' },
];

// Mock user data for display purposes
const mockUser = {
  name: 'Mario Rossi',
  email: 'mario.rossi@example.com',
};

export default function Settings({ onBack, onLogout, tanks = [], onDeleteTank, onUpdateTank }) {
  const { t, i18n } = useTranslation();
  const [tankToDelete, setTankToDelete] = useState(null);
  const [tankToEdit, setTankToEdit] = useState(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleDeleteConfirm = () => {
    if (tankToDelete) {
      onDeleteTank(tankToDelete.id);
      setTankToDelete(null);
    }
  };

  return (
    <div className="p-6 text-white animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">{t('settings_title')}</h1>
      </div>

      {/* Profile Section */}
      <div className="bg-zinc-800/50 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3"><User size={22} /> {t('profile_title')}</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-lg">{mockUser.name}</p>
            <p className="text-sm text-white/60">{mockUser.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <LogOut size={16} />
            {t('logout_button')}
          </button>
        </div>
      </div>

      {/* Manage Tanks Section */}
      <div className="bg-zinc-800/50 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3"><Box size={22} /> Gestione Acquari</h2>
        <div className="space-y-3">
          {tanks.map((tank) => (
            <div key={tank.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="font-bold">{tank.name}</p>
                <p className="text-xs text-white/40 uppercase tracking-wider">{tank.volume} Litri • {tank.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setTankToEdit(tank)}
                  className="p-2 text-white/20 hover:text-emerald-400 transition-colors"
                  title="Modifica"
                >
                  <Settings2 size={18} />
                </button>
                {tanks.length > 1 && (
                  <button 
                    onClick={() => setTankToDelete(tank)}
                    className="p-2 text-white/20 hover:text-red-400 transition-colors"
                    title="Elimina"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Language Section */}
      <div className="bg-zinc-800/50 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">{t('language_selection')}</h2>
        <div className="relative">
          <select
            value={i18n.language.split('-')[0]} // Handle cases like en-US
            onChange={(e) => changeLanguage(e.target.value)}
            className="w-full appearance-none bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-shadow cursor-pointer"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-zinc-800 text-white">
                {lang.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {/* Edit Tank Modal */}
      <AnimatePresence>
        {tankToEdit && (
          <EditTankModal 
            tank={tankToEdit}
            onUpdate={onUpdateTank}
            onDelete={onDeleteTank}
            onClose={() => setTankToEdit(null)}
            existingTanks={tanks}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {tankToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6 text-red-400">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Elimina Acquario</h3>
                  <p className="text-sm text-white/60">L'azione è irreversibile</p>
                </div>
              </div>

              <p className="text-white/80 mb-8 leading-relaxed">
                Sei sicuro di voler eliminare l'acquario <span className="text-white font-bold">"{tankToDelete.name}"</span>? 
                Tutti i dati associati, inclusi i log dei test e gli abitanti, verranno persi definitivamente.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setTankToDelete(null)}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20"
                >
                  Elimina
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

