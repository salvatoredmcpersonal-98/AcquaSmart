import { useState, useMemo } from 'react';
import { X, Plus, Trash2, Lamp, Filter, Box, Ruler, DollarSign, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FILTER_SUGGESTIONS, TANK_SUGGESTIONS, LAMP_SUGGESTIONS, Suggestion } from '../constants/filters';

export default function AccessoriesModal({ accessories, onUpdate, onClose, tankVolume = 0 }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [customName, setCustomName] = useState('');
  const [newType, setNewType] = useState('lamp'); // lamp, filter, tank, other
  const [newDimensions, setNewDimensions] = useState('');
  const [newPrice, setNewPrice] = useState(0);

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
    return [...volumeBased, ...LAMP_SUGGESTIONS.premium];
  }, [tankVolume]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setNewName(suggestion.model);
    setNewPrice(suggestion.minPrice);
    if (suggestion.dimensions) {
      setNewDimensions(suggestion.dimensions);
    }
  };

  const handleAddAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newName === 'custom' ? customName : newName;
    
    if (!finalName.trim()) return;

    const suggestion = (newType === 'filter' ? suggestedFilters : 
                        newType === 'tank' ? suggestedTanks : 
                        suggestedLamps).find(s => s.model === newName);

    const newAccessory = {
      id: Date.now(),
      name: finalName,
      type: newType,
      dimensions: newDimensions,
      price: Number(newPrice) || 0,
      lumen: suggestion?.lumen,
      watt: suggestion?.watt
    };

    onUpdate([newAccessory, ...accessories]);
    setNewName('');
    setCustomName('');
    setNewType('lamp');
    setNewDimensions('');
    setNewPrice(0);
    setShowAddForm(false);
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
                <Lamp className="text-indigo-400" size={20} />
              </div>
              Accessori
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
                      Tipo
                    </label>
                    <select 
                      value={newType}
                      onChange={(e) => {
                        setNewType(e.target.value);
                        setNewName('');
                        setCustomName('');
                        setNewDimensions('');
                        setNewPrice(0);
                      }}
                      className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                    >
                      <option value="lamp">Lampada</option>
                      <option value="filter">Filtro</option>
                      <option value="tank">Acquario</option>
                      <option value="other">Altro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                      Nome Accessorio
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
                            {newType === 'filter' ? 'Seleziona un filtro consigliato...' : 
                             newType === 'tank' ? 'Seleziona un acquario consigliato...' : 
                             'Seleziona una lampada consigliata...'}
                          </option>
                          {(newType === 'filter' ? suggestedFilters : 
                            newType === 'tank' ? suggestedTanks : 
                            suggestedLamps).map((s) => (
                            <option key={s.model} value={s.model}>
                              {s.model} {s.category ? `(${s.category})` : s.type ? `(${s.type})` : ''} - {s.priceRange}
                            </option>
                          ))}
                          <option value="custom">-- Altro (Inserimento manuale) --</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
                        
                        {newName === 'custom' && (
                          <input 
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder={
                              newType === 'filter' ? "Inserisci nome filtro..." : 
                              newType === 'tank' ? "Inserisci nome acquario..." : 
                              "Inserisci nome lampada..."
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
                        placeholder="es. Lampada LED 20W"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                        autoFocus
                      />
                    )}
                  </div>

                  {(newType === 'tank' || newType === 'lamp') && (
                    <div>
                      <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                        Dimensioni {newType === 'lamp' ? '(es. 30 x 5 x 1 cm)' : '(es. 60x30x35)'}
                      </label>
                      <div className="relative">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                        <input 
                          type="text"
                          value={newDimensions}
                          onChange={(e) => setNewDimensions(e.target.value)}
                          placeholder={newType === 'lamp' ? "Dimensioni lampada" : "Lunghezza x Larghezza x Altezza"}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                      Prezzo (€)
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
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-white/60 hover:bg-white/5 transition-colors"
                  >
                    Annulla
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                  >
                    Salva
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
                <span className="font-bold">Aggiungi Accessorio</span>
              </motion.button>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {accessories.length === 0 ? (
              <div className="text-center py-12">
                <Lamp size={48} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/40 italic">Nessun accessorio aggiunto</p>
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
                        {accessory.dimensions && (
                          <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                            <Ruler size={10} /> {accessory.dimensions}
                          </p>
                        )}
                        <p className="text-sm font-bold text-indigo-400 mt-1">
                          € {accessory.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveAccessory(accessory.id)}
                      className="text-white/10 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
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
