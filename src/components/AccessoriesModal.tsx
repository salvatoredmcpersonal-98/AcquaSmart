import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, Lamp, Filter, Box, Ruler, DollarSign, ChevronDown, Sun, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FILTER_SUGGESTIONS, TANK_SUGGESTIONS, LAMP_SUGGESTIONS, Suggestion } from '../constants/filters';

export default function AccessoriesModal({ accessories, onUpdate, onClose, tankVolume = 0 }) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [customName, setCustomName] = useState('');
  const [newType, setNewType] = useState('tank'); // tank, lamp, filter, other
  const [dimL, setDimL] = useState('');
  const [dimW, setDimW] = useState('');
  const [dimH, setDimH] = useState('');
  const [newPrice, setNewPrice] = useState(0);
  const [newDescription, setNewDescription] = useState('');
  const [newLumen, setNewLumen] = useState('');
  const [newWatt, setNewWatt] = useState('');
  const [newLightingHours, setNewLightingHours] = useState(8);
  const [newEnvironment, setNewEnvironment] = useState('dark');
  const [newIsOpen, setNewIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const suggestedFilters = useMemo(() => {
    if (tankVolume <= 60) return FILTER_SUGGESTIONS.nano;
    if (tankVolume <= 150) return FILTER_SUGGESTIONS.medium;
    if (tankVolume <= 300) return FILTER_SUGGESTIONS.large;
    return FILTER_SUGGESTIONS.xl;
  }, [tankVolume]);

  const suggestedTanks = useMemo(() => {
    if (tankVolume <= 40) return TANK_SUGGESTIONS.nano;
    if (tankVolume <= 120) return TANK_SUGGESTIONS.medium;
    if (tankVolume <= 350) return TANK_SUGGESTIONS.large;
    return TANK_SUGGESTIONS.scaper;
  }, [tankVolume]);

  const suggestedLamps = useMemo(() => {
    const volumeBased = (() => {
      if (tankVolume <= 50) return LAMP_SUGGESTIONS.nano;
      if (tankVolume <= 150) return LAMP_SUGGESTIONS.medium;
      if (tankVolume <= 350) return LAMP_SUGGESTIONS.large;
      return [];
    })();
    
    // Always include premium/suspension systems as they are relevant for any size (especially scaping)
    const combined = [...volumeBased, ...LAMP_SUGGESTIONS.premium];
    
    // Filter out duplicates by model name
    return combined.filter((lamp, index, self) => 
      index === self.findIndex((l) => l.model === lamp.model)
    );
  }, [tankVolume]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setNewName(suggestion.model);
    setNewPrice(suggestion.minPrice);
    if (suggestion.dimensions) {
      const dims = suggestion.dimensions.match(/(\d+)\s*[x*]\s*(\d+)\s*[x*]\s*(\d+)/);
      if (dims) {
        setDimL(dims[1]);
        setDimW(dims[2]);
        setDimH(dims[3]);
      } else {
        // Fallback if regex fails but string exists
        const parts = suggestion.dimensions.split(/[x*]/).map(p => p.trim().replace(/[^\d]/g, ''));
        if (parts[0]) setDimL(parts[0]);
        if (parts[1]) setDimW(parts[1]);
        if (parts[2]) setDimH(parts[2]);
      }
    } else {
      setDimL('');
      setDimW('');
      setDimH('');
    }
    if (suggestion.isOpen !== undefined) {
      setNewIsOpen(suggestion.isOpen);
    }
  };

  const handleAddAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newName === 'custom' ? customName : newName;
    
    if (!finalName.trim()) return;

    const dimensions = dimL && dimW && dimH ? `${dimL}x${dimW}x${dimH}` : '';

    const suggestion = (newType === 'filter' ? suggestedFilters : 
                        newType === 'tank' ? suggestedTanks : 
                        suggestedLamps).find(s => s.model === newName);

    const accessoryData = {
      name: finalName,
      type: newType,
      dimensions,
      description: newDescription,
      price: Number(newPrice) || 0,
      isOpen: newType === 'tank' ? newIsOpen : undefined,
      lumen: newName === 'custom' ? (Number(newLumen) || undefined) : suggestion?.lumen,
      watt: newName === 'custom' ? (Number(newWatt) || undefined) : suggestion?.watt,
      lightingHours: newType === 'lamp' ? newLightingHours : undefined,
      environment: newType === 'lamp' ? newEnvironment : undefined
    };

    if (editingId) {
      onUpdate(accessories.map(a => a.id === editingId ? { ...a, ...accessoryData } : a));
    } else {
      onUpdate([{ id: Date.now() + Math.random(), ...accessoryData }, ...accessories]);
    }

    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setCustomName('');
    setNewType('tank');
    setDimL('');
    setDimW('');
    setDimH('');
    setNewPrice(0);
    setNewDescription('');
    setNewLumen('');
    setNewWatt('');
    setNewLightingHours(8);
    setNewEnvironment('dark');
    setNewIsOpen(false);
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEditAccessory = (accessory: any) => {
    setEditingId(accessory.id);
    setNewType(accessory.type);
    
    // Check if it's a suggestion or custom
    const allSuggestions = [...suggestedFilters, ...suggestedTanks, ...suggestedLamps];
    const suggestion = allSuggestions.find(s => s.model === accessory.name);
    
    if (suggestion) {
      setNewName(accessory.name);
    } else {
      setNewName('custom');
      setCustomName(accessory.name);
    }

    if (accessory.dimensions) {
      const dims = accessory.dimensions.split('x');
      if (dims.length === 3) {
        setDimL(dims[0]);
        setDimW(dims[1]);
        setDimH(dims[2]);
      }
    } else {
      setDimL('');
      setDimW('');
      setDimH('');
    }

    setNewPrice(accessory.price);
    setNewDescription(accessory.description || '');
    setNewLumen(accessory.lumen?.toString() || '');
    setNewWatt(accessory.watt?.toString() || '');
    setNewLightingHours(accessory.lightingHours || 8);
    setNewEnvironment(accessory.environment || 'dark');
    setNewIsOpen(accessory.isOpen || false);
    setShowAddForm(true);
  };

  const handleRemoveAccessory = (id: number) => {
    onUpdate(accessories.filter(a => a.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lamp': return <Lamp size={18} />;
      case 'filter': return <Filter size={18} />;
      case 'tank': return <Box size={18} />;
      default: return <Plus size={18} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-5 sm:p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <div className="bg-indigo-500/20 p-2 rounded-xl">
                {editingId ? <Edit2 className="text-indigo-400" size={20} /> : <Lamp className="text-indigo-400" size={20} />}
              </div>
              {editingId ? t('accessories_edit_title') : t('accessories_title')}
            </h2>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white active:bg-white/20"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-grow">
          <AnimatePresence mode="popLayout">
            {showAddForm ? (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddAccessory}
                className="bg-white/5 p-4 rounded-2xl border border-indigo-500/30 mb-6 space-y-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                      {t('accessories_type_label')}
                    </label>
                    <select 
                      value={newType}
                      onChange={(e) => {
                        setNewType(e.target.value);
                        setNewName('');
                        setCustomName('');
                        setDimL('');
                        setDimW('');
                        setDimH('');
                        setNewPrice(0);
                        setNewDescription('');
                        setNewLumen('');
                        setNewWatt('');
                      }}
                      className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                    >
                      <option value="tank">{t('accessories_type_tank')}</option>
                      <option value="lamp">{t('accessories_type_lamp')}</option>
                      <option value="filter">{t('accessories_type_filter')}</option>
                      <option value="other">{t('accessories_type_other')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                      {t('accessories_name_label')}
                    </label>
                    {newType === 'filter' || newType === 'tank' || newType === 'lamp' ? (
                      <div className="relative">
                        <select 
                          value={newName}
                          onChange={(e) => {
                            const currentSuggestions = 
                              newType === 'filter' ? suggestedFilters : 
                              newType === 'tank' ? suggestedTanks : 
                              suggestedLamps;
                            const suggestion = currentSuggestions.find(s => s.model === e.target.value);
                            if (suggestion) {
                              handleSelectSuggestion(suggestion);
                            } else {
                              setNewName(e.target.value);
                            }
                          }}
                          className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm appearance-none cursor-pointer"
                        >
                          <option value="">
                            {newType === 'filter' ? t('accessories_select_filter') : 
                             newType === 'tank' ? t('accessories_select_tank') : 
                             t('accessories_select_lamp')}
                          </option>
                          {(newType === 'filter' ? suggestedFilters : 
                            newType === 'tank' ? suggestedTanks : 
                            suggestedLamps).map((s) => (
                            <option key={s.model} value={s.model}>
                              {s.model} {s.category ? `(${s.category})` : s.type ? `(${s.type})` : ''} - {s.priceRange}
                            </option>
                          ))}
                          <option value="custom">{t('accessories_custom_option')}</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
                        
                        {newName === 'custom' && (
                          <input 
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder={
                              newType === 'filter' ? t('accessories_placeholder_filter') : 
                              newType === 'tank' ? t('accessories_placeholder_tank') : 
                              t('accessories_placeholder_lamp')
                            }
                            className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                            autoFocus
                          />
                        )}
                      </div>
                    ) : (
                      <input 
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={t('accessories_placeholder_generic')}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                        autoFocus
                      />
                    )}
                  </div>

                  {newType === 'lamp' && (
                    <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-white/40 uppercase tracking-wider">
                            {t('add_tank_lighting_hours_label')}
                          </label>
                          <span className="text-indigo-400 font-bold text-sm">{newLightingHours}h</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="12" 
                          step="0.5"
                          value={newLightingHours}
                          onChange={(e) => setNewLightingHours(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-[9px] text-white/30 px-1">
                          <span>1h</span>
                          <span>6h</span>
                          <span>12h</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-wider">
                          {t('add_tank_environment_label')}
                        </label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {[
                            { id: 'dark', label: t('environment_dark') },
                            { id: 'bright', label: t('environment_bright') },
                            { id: 'sunlight', label: t('environment_sunlight') }
                          ].map((env) => (
                            <button
                              key={env.id}
                              type="button"
                              onClick={() => setNewEnvironment(env.id)}
                              className={`p-2.5 rounded-xl border transition-all text-left text-sm ${
                                newEnvironment === env.id 
                                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' 
                                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                              }`}
                            >
                              {env.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {newType === 'lamp' && newName === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                          {t('lamp_lumen_label')}
                        </label>
                        <input 
                          type="number"
                          value={newLumen}
                          onChange={(e) => setNewLumen(e.target.value)}
                          placeholder="es. 1200"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                          {t('lamp_watt_label')}
                        </label>
                        <input 
                          type="number"
                          value={newWatt}
                          onChange={(e) => setNewWatt(e.target.value)}
                          placeholder="es. 15"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {(newType === 'tank' || newType === 'lamp') && (
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                        {t('accessories_dimensions_label')} (cm)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="relative">
                          <input 
                            type="number"
                            value={dimL}
                            onChange={(e) => setDimL(e.target.value)}
                            placeholder="L"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm text-center"
                          />
                          <span className="absolute -top-2 left-2 px-1 bg-zinc-900 text-[8px] text-white/40 font-bold uppercase">{t('accessories_dim_length')}</span>
                        </div>
                        <div className="relative">
                          <input 
                            type="number"
                            value={dimW}
                            onChange={(e) => setDimW(e.target.value)}
                            placeholder="P"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm text-center"
                          />
                          <span className="absolute -top-2 left-2 px-1 bg-zinc-900 text-[8px] text-white/40 font-bold uppercase">{t('accessories_dim_width')}</span>
                        </div>
                        <div className="relative">
                          <input 
                            type="number"
                            value={dimH}
                            onChange={(e) => setDimH(e.target.value)}
                            placeholder="H"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm text-center"
                          />
                          <span className="absolute -top-2 left-2 px-1 bg-zinc-900 text-[8px] text-white/40 font-bold uppercase">{t('accessories_dim_height')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {newType === 'tank' && (
                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                      <div>
                        <p className="text-sm font-bold text-white">{t('accessories_tank_open_label')}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">{t('accessories_tank_open_desc')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewIsOpen(!newIsOpen)}
                        className={`w-12 h-6 rounded-full transition-all relative ${newIsOpen ? 'bg-indigo-500' : 'bg-white/10'}`}
                      >
                        <motion.div 
                          animate={{ x: newIsOpen ? 26 : 2 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                      {t('accessories_description_label')}
                    </label>
                    <textarea 
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder={t('accessories_placeholder_description')}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm resize-none h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                      {t('accessories_price_label')}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                      <input 
                        type="number"
                        step="0.01"
                        value={newPrice}
                        onChange={(e) => setNewPrice(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 rounded-xl font-bold text-white/60 hover:bg-white/5 transition-colors"
                  >
                    {t('accessories_cancel_button')}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                  >
                    {editingId ? t('accessories_update_button') : t('accessories_save_button')}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowAddForm(true)}
                className="w-full bg-white/5 border border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-white/40 hover:text-indigo-400 mb-6 group"
              >
                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-bold">{t('accessories_add_button')}</span>
              </motion.button>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {accessories.length === 0 ? (
              <div className="text-center py-12">
                <Lamp size={48} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/40 italic">{t('accessories_empty_message')}</p>
              </div>
            ) : (
              accessories.map((accessory) => (
                <motion.div
                  key={accessory.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/5 border border-white/5 p-4 rounded-2xl group transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-xl h-fit bg-indigo-500/20 text-indigo-400">
                        {getTypeIcon(accessory.type)}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-base">{accessory.name}</h4>
                        {accessory.description && (
                          <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{accessory.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {accessory.type === 'lamp' && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {accessory.lightingHours && (
                                <p className="text-[10px] text-indigo-400 flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-md font-bold">
                                  <Lamp size={10} /> {accessory.lightingHours}h {t('add_tank_lighting_hours_label').toLowerCase()}
                                </p>
                              )}
                              {accessory.environment && (
                                <p className="text-[10px] text-indigo-400 flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-md font-bold">
                                  <Sun size={10} /> {t(`environment_${accessory.environment}`)}
                                </p>
                              )}
                            </div>
                          )}
                          {accessory.dimensions && (
                            <p className="text-[10px] text-white/40 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                              <Ruler size={10} /> {accessory.dimensions}
                            </p>
                          )}
                          {accessory.type === 'tank' && (
                            <p className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${accessory.isOpen ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {accessory.isOpen ? t('accessories_tank_open_status') : t('accessories_tank_closed_status')}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-bold text-indigo-400 mt-1">
                          € {accessory.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEditAccessory(accessory)}
                        className="text-white/10 hover:text-indigo-400 p-1.5 transition-colors rounded-lg hover:bg-white/5"
                        title={t('accessories_edit_button')}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleRemoveAccessory(accessory.id)}
                        className="text-white/10 hover:text-red-400 p-1.5 transition-colors rounded-lg hover:bg-white/5"
                        title={t('accessories_remove_button')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
