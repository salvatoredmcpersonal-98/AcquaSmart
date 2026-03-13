import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, Fish, Leaf, Search, DollarSign, Grid, Info, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HARDSCAPE_SUGGESTIONS } from '../constants/filters';

const SUGGESTIONS = {
  fish: [
    { name: 'Neon (P. innesi)', price: 1.5, image: 'https://res.cloudinary.com/dtprzblbm/image/upload/v1772709529/Il-pesce-neon-Paracheiridon-Innesi_wb2cbe.jpg' },
    { name: 'Cardinali (P. axelrodi)', price: 2.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_cardinal_tetra' },
    { name: 'Scalare', price: 8.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_angelfish' },
    { name: 'Discus', price: 45.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_discus' },
    { name: 'Ramirezi', price: 12.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_ramirezi' },
    { name: 'Corydoras (Tutti)', price: 4.5, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_corydoras' },
    { name: 'Ancistrus', price: 7.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_pleco' },
    { name: 'Otocinclus', price: 4.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_otocinclus' },
    { name: 'Guppy', price: 2.5, image: 'https://res.cloudinary.com/dtprzblbm/image/upload/v1772709324/images_yn2plm.webp' },
    { name: 'Platy/Portaspada', price: 2.5, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_platy' },
    { name: 'Molly (Black/Balloon)', price: 3.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_molly' },
    { name: 'Betta Splendens', price: 12.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_betta' },
    { name: 'Trichogaster (Gourami)', price: 6.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_dwarf_gourami' },
    { name: 'Rasbora Heteromorpha', price: 2.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_cherry_barb' },
    { name: 'Danio Rerio (Zebra)', price: 1.5, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/fish_zebra_danio' },
    { name: 'Ciclidi Malawi (Mbuma)', price: 15.0, image: 'https://picsum.photos/seed/malawi/300/200' },
    { name: 'Ciclidi Tanganica', price: 18.0, image: 'https://picsum.photos/seed/tanganica/300/200' },
    { name: 'Caridina (Red Cherry)', price: 3.0, image: 'https://picsum.photos/seed/shrimp_red/300/200' },
    { name: 'Caridina (Japonica)', price: 5.0, image: 'https://picsum.photos/seed/shrimp_amano/300/200' }
  ],
  plants: [
    { name: 'Anubias', price: 8.0, image: 'https://res.cloudinary.com/dtprzblbm/image/upload/v1772710024/Anubias_h7mosc.webp' },
    { name: 'Java Fern', price: 7.0, image: 'https://res.cloudinary.com/dtprzblbm/image/upload/v1772710180/microsorum-pteropus_ntpz0g.webp' },
    { name: 'Amazon Sword', price: 6.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/plant_amazon_sword' },
    { name: 'Vallisneria', price: 4.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/plant_vallisneria' },
    { name: 'Cryptocoryne', price: 5.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/plant_crypt' },
    { name: 'Java Moss', price: 6.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/plant_java_moss' },
    { name: 'Hornwort', price: 3.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/plant_hornwort' },
    { name: 'Water Wisteria', price: 5.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/plant_wisteria' },
    { name: 'Bacopa Caroliniana', price: 4.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/plant_bacopa' },
    { name: 'Ludwigia Repens', price: 5.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/plant_ludwigia' },
    { name: 'Monte Carlo', price: 7.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/plant_monte_carlo' },
    { name: 'Dwarf Hairgrass', price: 6.0, image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300,h_200,g_auto/plant_hairgrass' }
  ],
  hardscape: [
    ...HARDSCAPE_SUGGESTIONS.substrates.map(s => ({ name: s.model, price: s.minPrice, image: 'https://picsum.photos/seed/substrate/300/200' })),
    ...HARDSCAPE_SUGGESTIONS.woods.map(s => ({ name: s.model, price: s.minPrice, image: 'https://picsum.photos/seed/wood/300/200' })),
    ...HARDSCAPE_SUGGESTIONS.rocks.map(s => ({ name: s.model, price: s.minPrice, image: 'https://picsum.photos/seed/rock/300/200' }))
  ]
};

export default function InhabitantsModal({ inhabitants, onUpdate, onClose }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'fish' | 'plants' | 'hardscape'>('fish');
  const [showGallery, setShowGallery] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [itemSexes, setItemSexes] = useState<Record<string, 'M' | 'F' | 'N/A'>>({});

  const filteredSuggestions = useMemo(() => {
    const suggestions = SUGGESTIONS[activeTab];
    if (!searchQuery) return suggestions;
    return suggestions.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, activeTab]);

  const handleAddItem = (suggestion: { name: string, price: number }) => {
    const quantity = itemQuantities[suggestion.name] || 1;
    const sex = activeTab === 'fish' ? (itemSexes[suggestion.name] || 'N/A') : 'N/A';
    const updated = { ...inhabitants };
    updated[activeTab] = [...updated[activeTab], { 
      id: Date.now(), 
      name: suggestion.name, 
      quantity,
      price: suggestion.price,
      sex
    }];
    onUpdate(updated);
    
    // Reset state for this item
    setItemQuantities(prev => ({ ...prev, [suggestion.name]: 1 }));
    setItemSexes(prev => ({ ...prev, [suggestion.name]: 'N/A' }));
  };

  const updateSex = (name: string, sex: 'M' | 'F' | 'N/A') => {
    setItemSexes(prev => ({
      ...prev,
      [name]: sex
    }));
  };

  const updateQuantity = (name: string, delta: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [name]: Math.max(1, (prev[name] || 1) + delta)
    }));
  };

  const handleRemoveItem = (id: number) => {
    const updated = { ...inhabitants };
    updated[activeTab] = updated[activeTab].filter(item => item.id !== id);
    onUpdate(updated);
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
        className="relative bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Fish className="text-emerald-400" />
              Allestimento Acquario
            </h2>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white active:bg-white/20"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <div className="flex bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('fish')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all active:scale-[0.98] ${
                  activeTab === 'fish' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/60 hover:text-white'
                }`}
              >
                <Fish size={18} />
                {t('inhabitants_fish') || 'Pesci'}
              </button>
              <button
                onClick={() => setActiveTab('plants')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all active:scale-[0.98] ${
                  activeTab === 'plants' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/60 hover:text-white'
                }`}
              >
                <Leaf size={18} />
                {t('inhabitants_plants') || 'Piante'}
              </button>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('hardscape')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all active:scale-[0.98] ${
                  activeTab === 'hardscape' ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/60 hover:text-white'
                }`}
              >
                <Box size={18} />
                Base e Hardscape
              </button>
            </div>
          </div>

          <div className="mb-6">
            <button 
              onClick={() => setShowGallery(true)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex flex-col items-center justify-center gap-1 font-bold active:scale-[0.97]"
            >
              <div className="flex items-center gap-2">
                <Plus size={24} />
                <span className="text-lg">{t('add_new_inhabitant') || 'Aggiungi Nuovo'}</span>
              </div>
              <span className="text-[10px] opacity-60 uppercase tracking-widest font-medium">Sfoglia il catalogo completo</span>
            </button>
          </div>

          <div className="max-h-[350px] overflow-y-auto pr-1 -mr-1 custom-scrollbar touch-pan-y">
            <AnimatePresence mode="popLayout">
              {inhabitants[activeTab].length === 0 ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-white/40 py-8 italic"
                >
                  {t('inhabitants_empty') || 'Nessun elemento aggiunto'}
                </motion.p>
              ) : (
                <div className="space-y-2">
                  {inhabitants[activeTab].map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl group hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg text-xs font-bold min-w-[30px] text-center">
                          {item.quantity}x
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{item.name}</span>
                            {item.sex && item.sex !== 'N/A' && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                                item.sex === 'M' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                              }`}>
                                {item.sex}
                              </span>
                            )}
                          </div>
                          {item.price > 0 && (
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                              €{(item.price * item.quantity).toFixed(2)} total
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-white/20 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGallery(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full max-h-[90vh] sm:max-h-[80vh]"
            >
              <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <Grid className="text-emerald-400" />
                      {activeTab === 'fish' ? t('fish_catalog') || 'Catalogo Pesci' : 
                       activeTab === 'plants' ? t('plants_catalog') || 'Catalogo Piante' : 
                       t('hardscape_catalog') || 'Catalogo Hardscape'}
                    </h3>
                    <p className="text-white/40 text-[10px] sm:text-xs mt-1">{t('catalog_subtitle') || 'Seleziona quantità e aggiungi al tuo acquario'}</p>
                  </div>
                  <button 
                    onClick={() => setShowGallery(false)}
                    className="p-2.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white active:bg-white/20"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search_catalog_placeholder') || 'Cerca nel catalogo...'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm sm:text-base"
                  />
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                </div>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar touch-pan-y">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredSuggestions.map((s, i) => (
                    <motion.div
                      key={i}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={s.image} 
                          alt={s.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                          <span className="text-emerald-400 font-bold text-xs">€{s.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col gap-4">
                        <h4 className="text-white font-bold text-base truncate">{s.name}</h4>
                        
                        {activeTab === 'fish' && (
                          <div className="flex flex-col gap-2">
                            <p className="text-[10px] uppercase font-bold text-white/40">Sesso:</p>
                            <div className="flex gap-2">
                              {['M', 'F', 'N/A'].map((sex) => (
                                <button
                                  key={sex}
                                  onClick={() => updateSex(s.name, sex as any)}
                                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                    (itemSexes[s.name] || 'N/A') === sex 
                                      ? 'bg-emerald-500 text-white shadow-lg' 
                                      : 'bg-white/5 text-white/40 hover:text-white/60'
                                  }`}
                                >
                                  {sex === 'N/A' ? 'Indefinito' : sex === 'M' ? 'Maschio' : 'Femmina'}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                            <button 
                              onClick={() => updateQuantity(s.name, -1)}
                              className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:bg-white/20"
                            >
                              -
                            </button>
                            <span className="w-10 text-center text-white font-bold text-sm">
                              {itemQuantities[s.name] || 1}
                            </span>
                            <button 
                              onClick={() => updateQuantity(s.name, 1)}
                              className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:bg-white/20"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleAddItem(s)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 font-bold text-sm active:scale-95"
                          >
                            <Plus size={16} />
                            {t('add_button') || 'Aggiungi'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
