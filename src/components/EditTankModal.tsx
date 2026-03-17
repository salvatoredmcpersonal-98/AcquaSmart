import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Beaker, Box, X, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const InputField = ({ icon, placeholder, value, onChange, type = 'text' }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
      {icon}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-shadow"
    />
  </div>
);

export default function EditTankModal({ tank, onUpdate, onDelete, onClose, existingTanks }) {
  const { t } = useTranslation();
  const [name, setName] = useState(tank.name);
  const [type, setType] = useState(tank.type);
  const [volume, setVolume] = useState(tank.volume.toString());
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isDuplicate = existingTanks.some(
      t => t.id !== tank.id && t.name.toLowerCase().trim() === name.toLowerCase().trim()
    );

    if (isDuplicate) {
      setError(t('tank_name_duplicate_error') || 'Un acquario con questo nome esiste già');
      return;
    }

    if (name && type && volume) {
      onUpdate({ ...tank, name: name.trim(), type, volume: parseInt(volume, 10) });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Modifica Acquario</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={24} className="text-white/40" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <InputField 
                icon={<Box size={20} className="text-white/40" />} 
                placeholder={t('tank_name_label')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
              />
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs font-medium pl-2"
                >
                  {error}
                </motion.p>
              )}
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Beaker size={20} className="text-white/40" />
              </div>
              <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-shadow cursor-pointer"
              >
                  <option value="freshwater" className="bg-zinc-800">{t('tank_type_freshwater')}</option>
                  <option value="saltwater" className="bg-zinc-800">{t('tank_type_saltwater')}</option>
                  <option value="brackish" className="bg-zinc-800">{t('tank_type_brackish')}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <InputField 
              icon={<Droplets size={20} className="text-white/40" />} 
              placeholder={t('tank_volume_label')}
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />

            <div className="flex flex-col gap-3 pt-4">
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors duration-200 text-white font-bold py-3 rounded-xl">
                Salva Modifiche
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Elimina Acquario
              </button>
            </div>
          </form>
        </div>

        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="absolute inset-0 bg-zinc-950 z-50 p-6 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sei sicuro?</h3>
              <p className="text-white/60 mb-8">
                Questa azione eliminerà definitivamente l'acquario "{tank.name}" e tutti i dati associati.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => {
                    onDelete(tank.id);
                    onClose();
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Sì, Elimina Definitivamente
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Annulla
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
