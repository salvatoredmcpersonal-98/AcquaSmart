import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, Bell, Calendar, Clock, CheckCircle2, AlertCircle, Droplets, Leaf, Sparkles, TestTube2, Waves, Info, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FISH_MASTER_DATA } from '../constants/masterData';

const TASK_SUGGESTIONS = [
  { name: 'task_suggestion_water_topup', icon: '💧', lucide: Droplets },
  { name: 'task_suggestion_fertilizer', icon: '🌱', lucide: Leaf },
  { name: 'task_suggestion_water_change', icon: '✨', lucide: Sparkles },
  { name: 'task_suggestion_water_test', icon: '🧪', lucide: TestTube2 },
  { name: 'task_suggestion_filter_cleaning', icon: '🧼', lucide: Waves },
  { name: 'task_suggestion_fish_breeding', icon: '🤰', lucide: Heart },
  { name: 'task_suggestion_other', icon: '📝', lucide: Info },
];

export default function RemindersModal({ reminders, onUpdate, onClose, initialFilter = 'all' }) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFrequency, setNewFrequency] = useState(7);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSpecies, setSelectedSpecies] = useState('');

  const isNotificationMode = initialFilter === 'overdue';

  useEffect(() => {
    if (newTask === 'task_suggestion_fish_breeding' && selectedSpecies) {
      const species = FISH_MASTER_DATA.find(f => f.name === selectedSpecies);
      if (species && species.breeding) {
        setNewDescription(species.breeding.description);
        setNewFrequency(species.breeding.days);
      }
    }
  }, [newTask, selectedSpecies]);

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

    const newReminder = {
      id: Date.now(),
      task: taskName,
      description: newDescription,
      frequency: newFrequency,
      lastDone: start.toISOString(),
      nextDue: new Date(start.getTime() + newFrequency * 24 * 60 * 60 * 1000).toISOString()
    };

    onUpdate([newReminder, ...reminders]);
    setNewTask('');
    setNewDescription('');
    setNewFrequency(7);
    setSelectedSpecies('');
    setShowAddForm(false);
  };

  const handleMarkDone = (id: number) => {
    const updated = reminders.map(r => {
      if (r.id === id) {
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
  };

  const handleRemoveReminder = (id: number) => {
    onUpdate(reminders.filter(r => r.id !== id));
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
                      {t('add_reminder_form_title')}
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
                      onClick={() => setShowAddForm(false)}
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
                        <button 
                          onClick={() => handleRemoveReminder(reminder.id)}
                          className="text-white/10 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
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
