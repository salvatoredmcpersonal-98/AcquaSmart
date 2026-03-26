import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Beaker, Box, ArrowLeft, X, Lamp, Layout, Thermometer, Search } from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { TANK_SUGGESTIONS, LAMP_SUGGESTIONS } from '../constants/filters';

const InputField = ({ icon, placeholder, value, onChange, type = 'text', required = true }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
      {icon}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
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
  const [showInitialConfigModal, setShowInitialConfigModal] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showTankModal, setShowTankModal] = useState(false);
  const [showLampModal, setShowLampModal] = useState(false);
  const [selectedTank, setSelectedTank] = useState(null);
  const [selectedLamp, setSelectedLamp] = useState(null);
  const [customLampWatt, setCustomLampWatt] = useState('');
  const [customLampLumen, setCustomLampLumen] = useState('');
  const [volume, setVolume] = useState('');
  const [dimL, setDimL] = useState('');
  const [dimW, setDimW] = useState('');
  const [dimH, setDimH] = useState('');
  const [edgeGap, setEdgeGap] = useState('2');
  const [surroundingEnv, setSurroundingEnv] = useState<string | null>(null);
  const [volumeFilter, setVolumeFilter] = useState<number | null>(null);
  const [tankSearch, setTankSearch] = useState('');
  const [error, setError] = useState('');

  const isTropical = temp >= 22;

  const allTanks = useMemo(() => Object.values(TANK_SUGGESTIONS).flat(), []);
  const filteredTanks = useMemo(() => {
    let result = allTanks;
    
    if (tankSearch) {
      const search = tankSearch.toLowerCase();
      result = result.filter(tank => 
        tank.model.toLowerCase().includes(search) ||
        tank.recommendedVolume?.toLowerCase().includes(search)
      );
    }

    if (!volumeFilter) return result;
    
    return result.filter(tank => {
      const vol = parseInt(tank.recommendedVolume?.replace(/[^\d]/g, '') || '0');
      if (volumeFilter === 30) return vol <= 30;
      if (volumeFilter === 60) return vol > 30 && vol <= 60;
      if (volumeFilter === 120) return vol > 60 && vol <= 120;
      if (volumeFilter === 240) return vol > 120 && vol <= 240;
      if (volumeFilter === 241) return vol > 240;
      return true;
    });
  }, [allTanks, volumeFilter, tankSearch]);
  const allLamps = useMemo(() => Object.values(LAMP_SUGGESTIONS).flat(), []);

  const isCustomTank = selectedTank?.model === t('add_tank_custom_aquarium');
  const isCustomLamp = selectedLamp?.model === t('add_tank_custom_lamp');

  useEffect(() => {
    if (selectedTank && dimL && dimW && dimH) {
      const l = parseFloat(dimL);
      const w = parseFloat(dimW);
      const h = parseFloat(dimH);
      const gap = parseFloat(edgeGap) || 0;
      
      if (!isNaN(l) && !isNaN(w) && !isNaN(h)) {
        const calculatedVolume = (l * w * (h - gap)) / 1000;
        setVolume(Math.max(0, Math.round(calculatedVolume)).toString());
      }
    }
  }, [selectedTank, dimL, dimW, dimH, edgeGap]);

  const handleTankSelect = (tank) => {
    setSelectedTank(tank);
    setVolumeFilter(null);
    setTankSearch('');
    if (tank.recommendedVolume) {
      setVolume(tank.recommendedVolume.replace(/[^\d]/g, ''));
    }

    // Extract dimensions if available
    if (tank.dimensions) {
      const dims = tank.dimensions.match(/(\d+)\s*[x*]\s*(\d+)\s*[x*]\s*(\d+)/);
      if (dims) {
        setDimL(dims[1]);
        setDimW(dims[2]);
        setDimH(dims[3]);
      } else {
        const parts = tank.dimensions.split(/[x*]/).map(p => p.trim().replace(/[^\d]/g, ''));
        if (parts[0]) setDimL(parts[0]);
        if (parts[1]) setDimW(parts[1]);
        if (parts[2]) setDimH(parts[2]);
      }
    } else {
      setDimL('');
      setDimW('');
      setDimH('');
    }
    
    // Auto-extract lamp if included
    if (tank.includedLampModel) {
      const foundLamp = allLamps.find(l => l.model === tank.includedLampModel);
      if (foundLamp) {
        setSelectedLamp(foundLamp);
      } else {
        setSelectedLamp({ model: tank.includedLampModel, category: 'Inclusa', watt: 0, lumen: 0 });
      }
    }
    setShowTankModal(false);
    
    // Open initial configuration modal
    setShowInitialConfigModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedTank) {
      setError(t('add_tank_select_aquarium_error') || 'Seleziona un modello di acquario');
      return;
    }

    if (!isConfigured) {
      setError(t('add_tank_config_incomplete_error') || 'Configurazione incompleta');
      setShowInitialConfigModal(true);
      return;
    }

    if (!type) {
      setError(t('add_tank_select_type_error'));
      return;
    }

    if (!selectedTank) {
      setError(t('add_tank_select_aquarium_error') || 'Seleziona un modello di acquario');
      return;
    }

    if (!isConfigured && isCustomTank) {
      setError(t('add_tank_config_incomplete_error'));
      return;
    }
    
    const isDuplicate = existingTanks.some(
      tank => tank.name.toLowerCase().trim() === name.toLowerCase().trim()
    );

    if (isDuplicate) {
      setError(t('tank_name_duplicate_error'));
      return;
    }

    if (name && type && volume && surroundingEnv) {
      const initialAccessories = [];
      
      if (selectedTank) {
        initialAccessories.push({
          name: selectedTank.model,
          type: 'tank',
          model: selectedTank.model,
          brand: selectedTank.model.split(' ')[0],
          price: selectedTank.minPrice || 0,
          dimensions: `${dimL} x ${dimW} x ${dimH} cm`
        });
      }

      if (selectedLamp && selectedLamp.model !== t('add_tank_no_lamp')) {
        const isCustom = selectedLamp.model === t('add_tank_custom_lamp');
        initialAccessories.push({
          name: selectedLamp.model,
          type: 'lamp',
          model: selectedLamp.model,
          brand: selectedLamp.model.split(' ')[0],
          watt: isCustom ? (parseFloat(customLampWatt) || 0) : (selectedLamp.watt || 0),
          lumen: isCustom ? (parseFloat(customLampLumen) || 0) : (selectedLamp.lumen || 0),
          price: selectedLamp.minPrice || 0
        });
      }

      onTankAdded({ 
        name: name.trim(), 
        type: t(`tank_type_${type}`), 
        volume: parseInt(volume, 10),
        baseTemp: temp,
        surroundingEnv: surroundingEnv
      }, initialAccessories);
    } else if (!isConfigured) {
      setError(t('add_tank_config_incomplete_error'));
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

            {/* Aquarium Type */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTypeModal(true)}
                className={`w-full flex items-center justify-between bg-white/5 border rounded-xl py-3 px-4 text-white hover:bg-white/10 transition-colors ${type ? 'border-emerald-500/50' : 'border-white/20'}`}
              >
                <div className="flex items-center gap-4">
                  <Beaker size={20} className={type ? 'text-emerald-400' : 'text-white/40'} />
                  <div className="text-left">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-bold">{t('add_tank_type_label')}</p>
                    <p className="text-sm font-medium">
                      {type ? t(`tank_type_${type}`) : t('add_tank_choose_type_placeholder')}
                    </p>
                  </div>
                </div>
                <div className="text-white/50">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </button>
            </div>

            {/* Aquarium Selection */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTankModal(true)}
                className={`w-full flex items-center justify-between bg-white/5 border rounded-xl py-3 px-4 text-white hover:bg-white/10 transition-colors ${selectedTank ? 'border-emerald-500/50' : 'border-white/20'}`}
              >
                <div className="flex items-center gap-4">
                  <Layout size={20} className={selectedTank ? 'text-emerald-400' : 'text-white/40'} />
                  <div className="text-left">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-bold">{t('add_tank_aquarium_model_label')}</p>
                    <p className="text-sm font-medium">
                      {selectedTank ? selectedTank.model : t('add_tank_select_aquarium')}
                    </p>
                  </div>
                </div>
                <div className="text-white/50">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </button>
            </div>

            {selectedTank && isConfigured && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between group cursor-pointer"
                onClick={() => setShowInitialConfigModal(true)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Thermometer size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{t('add_tank_config_summary')}</p>
                    <p className="text-xs font-medium text-white/80">
                      {dimL}x{dimW}x{dimH}cm • {volume}L • {surroundingEnv ? t(`add_tank_env_${surroundingEnv}`) : ''}
                    </p>
                  </div>
                </div>
                <button type="button" className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Layout size={14} />
                </button>
              </motion.div>
            )}

            {/* Lamp Selection */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLampModal(true)}
                className={`w-full flex items-center justify-between bg-white/5 border rounded-xl py-3 px-4 text-white hover:bg-white/10 transition-colors ${selectedLamp ? 'border-emerald-500/50' : 'border-white/20'}`}
              >
                <div className="flex items-center gap-4">
                  <Lamp size={20} className={selectedLamp ? 'text-emerald-400' : 'text-white/40'} />
                  <div className="text-left">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-bold">{t('add_tank_lamp_model_label')}</p>
                    <p className="text-sm font-medium">
                      {selectedLamp ? selectedLamp.model : t('add_tank_select_lamp')}
                    </p>
                  </div>
                </div>
                <div className="text-white/50">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </button>
              {!selectedLamp && (
                <p className="text-[10px] text-orange-400/80 mt-1 pl-1 italic">
                  {t('add_tank_lamp_recommendation')}
                </p>
              )}
            </div>

            {isCustomLamp && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl overflow-hidden"
              >
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  {t('add_tank_custom_lamp_details_title')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-bold pl-1">{t('lamp_watt_label')}</label>
                    <input 
                      type="number"
                      value={customLampWatt}
                      onChange={(e) => setCustomLampWatt(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-bold pl-1">{t('lamp_lumen_label')}</label>
                    <input 
                      type="number"
                      value={customLampLumen}
                      onChange={(e) => setCustomLampLumen(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors duration-200 text-white font-bold py-3 rounded-xl !mt-8 shadow-lg shadow-emerald-500/20">
              {t('save_tank_button')}
            </button>
          </form>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {/* Initial Configuration Modal (Environment + Dimensions) */}
          {showInitialConfigModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  if (type && dimL && dimW && dimH) {
                    setIsConfigured(true);
                    setShowInitialConfigModal(false);
                  }
                }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-sm bg-zinc-900 border border-emerald-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden p-6 flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{t('add_tank_config_type_title')}</h3>
                    <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">{t('add_tank_surrounding_env_label')}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (type && dimL && dimW && dimH) {
                        setIsConfigured(true);
                        setShowInitialConfigModal(false);
                      } else {
                        setShowInitialConfigModal(false);
                      }
                    }}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X size={20} className="text-white/40" />
                  </button>
                </div>

                <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar pb-4">
                  {/* Dimensions Section */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold pl-1">{t('accessories_dimensions_label')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-white/30 uppercase font-bold pl-1">{t('tank_length_label')}</label>
                        <input 
                          type="number"
                          value={dimL}
                          onChange={(e) => setDimL(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-white/30 uppercase font-bold pl-1">{t('tank_width_label')}</label>
                        <input 
                          type="number"
                          value={dimW}
                          onChange={(e) => setDimW(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-white/30 uppercase font-bold pl-1">{t('tank_height_label')}</label>
                        <input 
                          type="number"
                          value={dimH}
                          onChange={(e) => setDimH(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] text-white/30 uppercase font-bold pl-1">{t('add_tank_edge_gap_label')}</label>
                        <span className="text-[10px] text-emerald-400 font-bold">{edgeGap} cm</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={edgeGap}
                        onChange={(e) => setEdgeGap(e.target.value)}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Surrounding Environment Section */}
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold pl-1">{t('add_tank_surrounding_env_label') || 'Ambiente'}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'dark_room', icon: '🌑', label: t('add_tank_env_dark_room') || 'Stanza Buia' },
                        { id: 'bright_room', icon: '☀️', label: t('add_tank_env_bright_room') || 'Stanza Luminosa' },
                        { id: 'direct_sunlight', icon: '🪟', label: t('add_tank_env_direct_sunlight') || 'Finestra' }
                      ].map((env) => (
                        <button
                          key={env.id}
                          type="button"
                          onClick={() => {
                            setSurroundingEnv(env.id);
                            if (error) setError('');
                          }}
                          className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                            surroundingEnv === env.id 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                              : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                            surroundingEnv === env.id ? 'bg-emerald-500/20' : 'bg-white/5'
                          }`}>
                            {env.icon}
                          </div>
                          <p className="text-[8px] font-bold uppercase tracking-tight text-center leading-tight">
                            {env.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-auto">
                  <button
                    type="button"
                    disabled={!dimL || !dimW || !dimH || !surroundingEnv}
                    onClick={() => {
                      setIsConfigured(true);
                      setShowInitialConfigModal(false);
                    }}
                    className={`w-full font-bold py-4 rounded-2xl transition-all text-sm ${
                      (dimL && dimW && dimH && surroundingEnv)
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/30' 
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    {t('add_tank_confirm_button')}
                  </button>
                  {volume && (
                    <p className="text-2xl text-emerald-400 text-center mt-4 font-bold tracking-wide">
                      {t('add_tank_calculated_volume', { volume })}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Tank Type Modal */}
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
                    <div className="grid grid-cols-3 gap-1.5">
                      {['saltwater', 'freshwater', 'brackish'].map((tKey) => (
                        <button
                          key={tKey}
                          type="button"
                          onClick={() => {
                            setType(tKey);
                            if (error) setError('');
                          }}
                          className={`p-2 rounded-xl border transition-all text-center text-[10px] font-bold uppercase ${
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

                  <div className="space-y-4">
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
                  </div>

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

          {/* Aquarium Selection Modal */}
          {showTankModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowTankModal(false);
                  setVolumeFilter(null);
                  setTankSearch('');
                }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-5 flex flex-col max-h-[80vh]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{t('add_tank_aquarium_model_label')}</h3>
                  <button onClick={() => {
                    setShowTankModal(false);
                    setVolumeFilter(null);
                    setTankSearch('');
                  }}>
                    <X size={20} className="text-white/40" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search size={14} className="text-white/20" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cerca modello..."
                      value={tankSearch}
                      onChange={(e) => setTankSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    {tankSearch && (
                      <button 
                        onClick={() => setTankSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Volume Filter */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Filtra per Volume (L)</p>
                    {volumeFilter && (
                      <button 
                        onClick={() => setVolumeFilter(null)}
                        className="text-[9px] text-emerald-400 font-bold uppercase hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '≤30', value: 30 },
                      { label: '31-60', value: 60 },
                      { label: '61-120', value: 120 },
                      { label: '121-240', value: 240 },
                      { label: '>240', value: 241 }
                    ].map((f) => (
                      <button
                        key={f.label}
                        onClick={() => setVolumeFilter(f.value)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                          volumeFilter === f.value
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {filteredTanks.length > 0 ? (
                    filteredTanks.map((tank, idx) => (
                      <button
                        key={`${tank.model}-${idx}`}
                        onClick={() => handleTankSelect(tank)}
                        className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <p className="font-bold text-sm">{tank.model}</p>
                        <p className="text-[10px] text-white/40">{tank.dimensions} • {tank.recommendedVolume}</p>
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-sm text-white/20 font-medium">Nessun modello trovato</p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedTank({ model: t('add_tank_custom_aquarium') });
                      setShowTankModal(false);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <p className="font-bold text-sm">{t('add_tank_custom_aquarium')}</p>
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Lamp Selection Modal */}
          {showLampModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLampModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-5 flex flex-col max-h-[80vh]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{t('add_tank_lamp_model_label')}</h3>
                  <button onClick={() => setShowLampModal(false)}>
                    <X size={20} className="text-white/40" />
                  </button>
                </div>
                <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  <button
                    onClick={() => {
                      setSelectedLamp({ model: t('add_tank_no_lamp'), watt: 0, lumen: 0 });
                      setShowLampModal(false);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <p className="font-bold text-sm">{t('add_tank_no_lamp')}</p>
                  </button>
                  {allLamps.map((lamp, idx) => (
                    <button
                      key={`${lamp.model}-${idx}`}
                      onClick={() => {
                        setSelectedLamp(lamp);
                        setShowLampModal(false);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <p className="font-bold text-sm">{lamp.model}</p>
                      <p className="text-[10px] text-white/40">{lamp.watt}W • {lamp.lumen}lm</p>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedLamp({ model: t('add_tank_custom_lamp'), watt: 0, lumen: 0 });
                      setShowLampModal(false);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <p className="font-bold text-sm">{t('add_tank_custom_lamp')}</p>
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
