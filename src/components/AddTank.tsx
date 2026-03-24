import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Beaker, Box, ArrowLeft, X } from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';

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

export default function AddTank({ onTankAdded, onLogout, onCancel, existingTanks = [] }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [temp, setTemp] = useState(25);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [volume, setVolume] = useState('');
  const [error, setError] = useState('');

  const isTropical = temp >= 22;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!type) {
      setError(t('add_tank_select_type_error'));
      return;
    }
    
    const isDuplicate = existingTanks.some(
      tank => tank.name.toLowerCase().trim() === name.toLowerCase().trim()
    );

    if (isDuplicate) {
      setError(t('tank_name_duplicate_error'));
      return;
    }

    if (name && type && volume) {
      onTankAdded({ 
        name: name.trim(), 
        type: `${t(`tank_type_${type}`)} (${isTropical ? t('tank_type_tropical') : t('tank_type_cold')})`, 
        volume: parseInt(volume, 10),
        baseTemp: temp
      });
    }
  };

  const dragX = useMotionValue(0);
  const labelOpacity = useTransform(dragX, [0, 100], [0, 1]);
  const labelScale = useTransform(dragX, [0, 100], [0.5, 1]);

  const handleDragEnd = (event, info) => {
    if (onCancel && info.offset.x > 100) {
      onCancel();
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-zinc-950">
      {/* Back Peek Label */}
      {onCancel && (
        <motion.div 
          style={{ opacity: labelOpacity, scale: labelScale }}
          className="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center z-0 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/40 font-black text-2xl mb-2">←</span>
            <span className="[writing-mode:vertical-rl] text-white/40 font-black uppercase tracking-[0.4em] text-xs whitespace-nowrap">
              {t('add_tank_back_peek')}
            </span>
          </div>
        </motion.div>
      )}

      <motion.div 
        className="min-h-screen text-white flex flex-col items-center justify-center p-4 touch-none relative z-10"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        style={{ x: dragX }}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
      >
        <div className="w-full max-w-md">
          <button 
            onClick={onCancel || onLogout}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>{onCancel ? t('cancel') : t('back_to_login')}</span>
          </button>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold">{t('add_tank_title')}</h1>
            <p className="text-white/60 mt-2">{t('add_tank_subtitle')}</p>
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
              <button
                type="button"
                onClick={() => setShowTypeModal(true)}
                className="w-full flex items-center justify-between bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Beaker size={20} className="text-white/40" />
                  <div className="text-left">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-bold">{t('add_tank_type_label')}</p>
                    <p className="text-sm font-medium">
                      {type ? `${t(`tank_type_${type}`)} (${isTropical ? t('tank_type_tropical') : t('tank_type_cold')})` : t('add_tank_choose_type_placeholder')}
                    </p>
                  </div>
                </div>
                <div className="text-white/50">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </button>
            </div>

            <InputField 
              icon={<Droplets size={20} className="text-white/40" />} 
              placeholder={t('tank_volume_label')}
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />

            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors duration-200 text-white font-bold py-3 rounded-xl !mt-8 shadow-lg shadow-emerald-500/20">
              {t('save_tank_button')}
            </button>
          </form>
        </div>

        <AnimatePresence>
          {showTypeModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTypeModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{t('add_tank_config_type_title')}</h3>
                  <button 
                    onClick={() => setShowTypeModal(false)}
                    className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X size={20} className="text-white/40" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{t('add_tank_water_type_label')}</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {['freshwater', 'saltwater', 'brackish'].map((tKey) => (
                        <button
                          key={tKey}
                          type="button"
                          onClick={() => {
                            setType(tKey);
                            if (error) setError('');
                          }}
                          className={`p-2.5 rounded-xl border transition-all text-left text-sm ${
                            type === tKey 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {t(`tank_type_${tKey}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {type && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{t('add_tank_base_temp_label')}</p>
                            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1">
                              <input 
                                type="number" 
                                min="10" 
                                max="35" 
                                step="0.1"
                                value={temp}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (!isNaN(val)) setTemp(val);
                                }}
                                onBlur={() => {
                                  setTemp(Math.min(35, Math.max(10, temp)));
                                }}
                                className="w-12 bg-transparent text-emerald-400 font-bold text-sm outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="text-emerald-400 font-bold text-sm">°C</span>
                            </div>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="35" 
                            step="0.1"
                            value={temp}
                            onChange={(e) => setTemp(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                          <div className="flex justify-between text-[9px] text-white/30 px-1">
                            <span>10°C</span>
                            <span>22°C</span>
                            <span>35°C</span>
                          </div>
                        </div>

                        <div className={`p-3 rounded-xl border transition-colors ${
                          isTropical ? 'bg-orange-500/10 border-orange-500/20' : 'bg-blue-500/10 border-blue-500/20'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                              isTropical ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {isTropical ? '🔥' : '❄️'}
                            </div>
                            <div>
                              <p className="text-xs font-bold">
                                {isTropical ? t('add_tank_tropical_title') : t('add_tank_cold_title')}
                              </p>
                              <p className="text-[10px] text-white/60 leading-tight">
                                {isTropical 
                                  ? t('add_tank_tropical_desc') 
                                  : t('add_tank_cold_desc')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="button"
                    disabled={!type}
                    onClick={() => setShowTypeModal(false)}
                    className={`w-full font-bold py-2.5 rounded-xl transition-colors text-sm ${
                      type 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    {t('add_tank_confirm_button')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
