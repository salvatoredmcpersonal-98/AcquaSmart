import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, Bell, Calendar, Clock, CheckCircle2, AlertCircle, Droplets, Leaf, Sparkles, TestTube2, Waves, Info, Heart, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FISH_MASTER_DATA } from '../constants/masterData';
import { parseDimensions, calculateEvaporation } from '../services/waterChemistryService';

const TASK_SUGGESTIONS = [
  { name: 'task_suggestion_water_topup', icon: '💧', lucide: Droplets },
  { name: 'task_suggestion_fertilizer', icon: '🌱', lucide: Leaf },
  { name: 'task_suggestion_water_change', icon: '✨', lucide: Sparkles },
  { name: 'task_suggestion_water_test', icon: '🧪', lucide: TestTube2 },
  { name: 'task_suggestion_filter_cleaning', icon: '🧼', lucide: Waves },
  { name: 'task_suggestion_fish_breeding', icon: '🤰', lucide: Heart },
  { name: 'task_suggestion_other', icon: '📝', lucide: Info },
];

export default function RemindersModal({ tank, reminders, onUpdate, onMaintenanceAction, onClose, initialFilter = 'all', accessories = [], validationResult = null }) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFrequency, setNewFrequency] = useState(7);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [showEvapInput, setShowEvapInput] = useState(false);
  const [evapCm, setEvapCm] = useState('');
  const [activeReminderId, setActiveReminderId] = useState<number | null>(null);
  const [editingReminderId, setEditingReminderId] = useState<number | null>(null);

  const isNotificationMode = initialFilter === 'overdue';

  useEffect(() => {
    if (newTask === 'task_suggestion_fish_breeding' && selectedSpecies) {
      const species = FISH_MASTER_DATA.find(f => f.name === selectedSpecies);
      if (species && species.breeding) {
        setNewDescription(species.breeding.description);
        setNewFrequency(species.breeding.days);
      }
    } else if (newTask === 'task_suggestion_water_topup') {
      const tankAccessory = accessories.find(a => a.type === 'tank');
      if (tankAccessory?.isOpen) {
        setNewFrequency(3);
      } else {
        setNewFrequency(7);
      }
    }
  }, [newTask, selectedSpecies, accessories]);

  const isOverdue = (nextDue: string) => {
    return new Date(nextDue) < new Date();
  };

  const filteredReminders = isNotificationMode 
    ? reminders.filter(r => isOverdue(r.nextDue))
    : reminders;

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const start = new Date(startDate);
    const taskName = newTask === 'task_suggestion_fish_breeding' && selectedSpecies 
      ? `${t('task_suggestion_fish_breeding')}: ${selectedSpecies}` 
      : (t(newTask) === newTask ? newTask : t(newTask));

    if (editingReminderId) {
      const updated = reminders.map(r => {
        if (r.id === editingReminderId) {
          const start = new Date(startDate);
          return {
            ...r,
            task: taskName,
            description: newDescription,
            frequency: newFrequency,
            nextDue: new Date(start.getTime() + newFrequency * 24 * 60 * 60 * 1000).toISOString()
          };
        }
        return r;
      });
      onUpdate(updated);
    } else {
      const start = new Date(startDate);
      const newReminder = {
        id: Date.now(),
        task: taskName,
        description: newDescription,
        frequency: newFrequency,
        lastDone: start.toISOString(),
        nextDue: new Date(start.getTime() + newFrequency * 24 * 60 * 60 * 1000).toISOString()
      };
      onUpdate([newReminder, ...reminders]);
    }

    setNewTask('');
    setNewDescription('');
    setNewFrequency(7);
    setSelectedSpecies('');
    setEditingReminderId(null);
    setShowAddForm(false);
  };

  const handleEditReminder = (reminder: any) => {
    setEditingReminderId(reminder.id);
    
    // Try to find if it was a suggestion
    const suggestion = TASK_SUGGESTIONS.find(s => t(s.name) === reminder.task || s.name === reminder.task);
    if (suggestion) {
      setNewTask(suggestion.name);
    } else if (reminder.task.startsWith(t('task_suggestion_fish_breeding'))) {
      setNewTask('task_suggestion_fish_breeding');
      const speciesName = reminder.task.split(': ')[1];
      setSelectedSpecies(speciesName || '');
    } else {
      setNewTask(reminder.task);
    }

    setNewDescription(reminder.description);
    setNewFrequency(reminder.frequency);
    // For start date, we use the date that would result in the current nextDue
    const nextDueDate = new Date(reminder.nextDue);
    const calculatedStartDate = new Date(nextDueDate.getTime() - reminder.frequency * 24 * 60 * 60 * 1000);
    setStartDate(calculatedStartDate.toISOString().split('T')[0]);
    setShowAddForm(true);
  };

  const handleMarkDone = (id: number) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder?.task === t('task_suggestion_water_topup') || reminder?.task === 'Rabbocco acqua') {
      setActiveReminderId(id);
      setShowEvapInput(true);
      return;
    }

    const updated = reminders.map(r => {
      if (r.id === id) {
        const now = new Date();
        // Log the maintenance action for non-water-topup tasks
        onMaintenanceAction(tank.id, r.task, { 
          completedAt: now.toISOString(),
          frequency: r.frequency
        });
        return {
          ...r,
          lastDone: now.toISOString(),
          nextDue: new Date(now.getTime() + r.frequency * 24 * 60 * 60 * 1000).toISOString()
        };
      }
      return r;
    });
    onUpdate(updated);
  };

  const handleRemoveReminder = (id: number) => {
    onUpdate(reminders.filter(r => r.id !== id));
  };

  const handleConfirmRefill = () => {
    if (!activeReminderId || !evapCm) return;

    const reminder = reminders.find(r => r.id === activeReminderId);
    if (!reminder) return;

    const tankAccessory = accessories.find(a => a.type === 'tank');
    const dims = parseDimensions(tankAccessory?.dimensions || tank.dimensions);
    
    const finalLength = dims.length || 0;
    const finalWidth = dims.width || 0;
    
    const result = calculateEvaporation(finalLength, finalWidth, tank.volume, parseFloat(evapCm));

    // Log the maintenance action with +5 health bonus
    onMaintenanceAction(tank.id, 'Water Top-up', { 
      evaporationHeight: parseFloat(evapCm),
      litersAdded: result.liters,
      healthBonus: 5,
      dimensionsUsed: `${finalLength}x${finalWidth}`
    });

    // Update reminder
    const updated = reminders.map(r => {
      if (r.id === activeReminderId) {
        const now = new Date();
        return {
          ...r,
          lastDone: now.toISOString(),
          nextDue: new Date(now.getTime() + r.frequency * 24 * 60 * 60 * 1000).toISOString()
        };
      }
      return r;
    });

    onUpdate(updated);
    setShowEvapInput(false);
    setEvapCm('');
    setActiveReminderId(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
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
              <div className="bg-emerald-500/20 p-2 rounded-xl">
                <Bell className="text-emerald-400" size={20} />
              </div>
              {isNotificationMode ? t('notifications_center_title') : t('reminders_modal_title')}
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
            {showEvapInput && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-indigo-500/10 border border-indigo-500/30 p-5 rounded-2xl mb-6 space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400">
                      <Droplets size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t('task_suggestion_water_topup')}</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setShowEvapInput(false);
                      setEvapCm('');
                      setActiveReminderId(null);
                    }}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/40"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/70 mb-2">{t('evaporation_refill_prompt')}</p>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={evapCm}
                        onChange={(e) => setEvapCm(e.target.value)}
                        placeholder="es. 1.5"
                        className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                        autoFocus
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold uppercase">cm</span>
                    </div>
                  </div>

                  {(() => {
                    const tankAccessory = accessories.find(a => a.type === 'tank');
                    const dims = parseDimensions(tankAccessory?.dimensions || tank.dimensions);
                    const hasDimensions = dims.length > 0 && dims.width > 0;

                    if (!hasDimensions && evapCm && parseFloat(evapCm) > 0) {
                      return (
                        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3">
                          <div className="flex gap-2 items-center text-amber-400">
                            <AlertCircle size={16} />
                            <p className="text-xs font-bold uppercase tracking-wider">Dimensioni Mancanti</p>
                          </div>
                          <p className="text-[11px] text-white/60 leading-relaxed">
                            Non abbiamo le dimensioni della base del tuo acquario per calcolare i litri esatti. 
                            Puoi aggiungerle nella sezione <strong>Accessori</strong> aggiungendo un accessorio di tipo "Aquarium" con le relative dimensioni (es. 60x30x35).
                          </p>
                        </div>
                      );
                    }

                    if (evapCm && parseFloat(evapCm) > 0 && hasDimensions) {
                      const result = calculateEvaporation(dims.length, dims.width, tank.volume, parseFloat(evapCm));
                      const isOpen = tankAccessory?.isOpen;

                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <div className="bg-indigo-500/20 p-4 rounded-xl border border-indigo-500/30 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Volume da aggiungere</span>
                              <span className="text-xl font-black text-white">{result.liters} <span className="text-sm font-normal text-white/60">Litri</span></span>
                            </div>
                            
                            <div className="h-px bg-indigo-500/20 w-full" />
                            
                            <div className="flex gap-3 items-start">
                              <div className="bg-white/10 p-1.5 rounded-lg text-white">
                                <Sparkles size={14} />
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-white">Tipo di acqua consigliato</p>
                                <p className="text-[11px] text-indigo-200/70 leading-relaxed">
                                  Usa esclusivamente <strong>Acqua d'Osmosi (RO)</strong>. L'evaporazione rimuove solo acqua pura, lasciando i sali in vasca. Aggiungere acqua di rubinetto aumenterebbe pericolosamente la durezza (GH/KH).
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                            <p className="text-[10px] text-white/40 leading-relaxed italic">
                              {isOpen ? t('evaporation_advice_open') : t('evaporation_advice_closed')}
                            </p>
                          </div>

                          <button
                            onClick={handleConfirmRefill}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={18} />
                            {t('confirm_refill_button')}
                          </button>
                        </motion.div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </motion.div>
            )}

            {!isNotificationMode && (
              showAddForm ? (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddReminder}
                  className="bg-white/5 p-4 rounded-2xl border border-emerald-500/30 mb-6 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2 ml-1">
                      {editingReminderId ? t('edit_reminder_form_title') : t('add_reminder_form_title')}
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {TASK_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion.name}
                          type="button"
                          onClick={() => {
                            setNewTask(suggestion.name);
                            if (suggestion.name !== 'task_suggestion_fish_breeding') {
                              setSelectedSpecies('');
                            }
                          }}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-xs font-medium ${
                            newTask === suggestion.name 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                          }`}
                        >
                          <span>{suggestion.icon}</span>
                          {t(suggestion.name)}
                        </button>
                      ))}
                    </div>

                    {newTask === 'task_suggestion_fish_breeding' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 space-y-3"
                      >
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 ml-1">
                            {t('select_species_label')}
                          </label>
                          <select
                            value={selectedSpecies}
                            onChange={(e) => setSelectedSpecies(e.target.value)}
                            className="w-full bg-white/5 border border-emerald-500/30 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="bg-zinc-900">{t('select_species_placeholder')}</option>
                            {FISH_MASTER_DATA.filter(f => f.breeding).map(fish => (
                              <option key={fish.name} value={fish.name} className="bg-zinc-900">
                                {fish.name} ({fish.breeding?.type})
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedSpecies && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex gap-3 items-start"
                          >
                            <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400 mt-0.5">
                              <Info size={14} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-emerald-400">{t('breeding_info_title')}</p>
                              <p className="text-[11px] text-white/70 leading-relaxed">
                                {FISH_MASTER_DATA.find(f => f.name === selectedSpecies)?.breeding?.description}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {newTask === 'task_suggestion_water_topup' && accessories.find(a => a.type === 'tank')?.isOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl flex gap-3 items-start mb-3"
                      >
                        <div className="bg-orange-500/20 p-1.5 rounded-lg text-orange-400 mt-0.5">
                          <AlertCircle size={14} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-orange-400">{t('accessories_tank_open_label')}</p>
                          <p className="text-[11px] text-white/70 leading-relaxed">
                            {t('evaporation_open_tank_warning')}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <input 
                      type="text"
                      value={t(newTask) === newTask ? newTask : t(newTask)}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder={t('custom_task_placeholder')}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 ml-1">
                      {t('description_label')}
                    </label>
                    <textarea 
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder={t('description_placeholder')}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm resize-none h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 ml-1">
                      {t('start_date_label')}
                    </label>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 ml-1">
                      {t('frequency_label')}
                    </label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range"
                        min="1"
                        max="60"
                        value={newFrequency}
                        onChange={(e) => setNewFrequency(parseInt(e.target.value))}
                        className="flex-grow accent-emerald-500"
                      />
                      <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg font-bold min-w-[60px] text-center">
                        {newFrequency} {t('frequency_unit')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingReminderId(null);
                        setNewTask('');
                        setNewDescription('');
                        setNewFrequency(7);
                        setSelectedSpecies('');
                      }}
                      className="flex-1 py-3 rounded-xl font-bold text-white/60 hover:bg-white/5 transition-colors"
                    >
                      {t('cancel_button')}
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      {t('save_button')}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.button 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowAddForm(true)}
                  className="w-full bg-white/5 border border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-white/40 hover:text-emerald-400 mb-6 group"
                >
                  <Plus size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="font-bold">{t('new_reminder_button')}</span>
                </motion.button>
              )
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {filteredReminders.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/40 italic">
                  {isNotificationMode ? t('no_urgent_notifications') : t('no_reminders_set')}
                </p>
              </div>
            ) : (
              filteredReminders.map((reminder) => {
                const overdue = isOverdue(reminder.nextDue);
                const suggestion = TASK_SUGGESTIONS.find(s => s.name === reminder.task);
                const Icon = suggestion?.lucide || Bell;

                return (
                  <motion.div
                    key={reminder.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`bg-white/5 border ${overdue ? 'border-red-500/30 bg-red-500/5' : 'border-white/5'} p-4 rounded-2xl group transition-all`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-xl h-fit ${overdue ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base flex items-center gap-2">
                            {reminder.task}
                            {overdue && <AlertCircle size={14} className="text-red-400 animate-pulse" />}
                          </h4>
                          {reminder.description && (
                            <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{reminder.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Clock size={10} /> {t('every_days', { days: reminder.frequency })}
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${overdue ? 'text-red-400' : 'text-white/30'}`}>
                              <Calendar size={10} /> {t('expires_label')} {formatDate(reminder.nextDue)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!isNotificationMode && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleEditReminder(reminder)}
                            className="text-white/10 hover:text-indigo-400 p-1 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleRemoveReminder(reminder.id)}
                            className="text-white/10 hover:text-red-400 p-1 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleMarkDone(reminder.id)}
                      className={`w-full mt-2 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                        overdue 
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                          : 'bg-white/10 text-white hover:bg-emerald-500 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                      {isNotificationMode ? t('done_button') : t('mark_as_done_button')}
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
