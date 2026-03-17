import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, Bell, Calendar, Clock, CheckCircle2, AlertCircle, Droplets, Leaf, Sparkles, TestTube2, Waves, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TASK_SUGGESTIONS = [
  { name: 'Rabbocco acqua', icon: '💧', lucide: Droplets },
  { name: 'Fertilizzante', icon: '🌱', lucide: Leaf },
  { name: 'Cambio acqua', icon: '✨', lucide: Sparkles },
  { name: 'Controllo Valori', icon: '🧪', lucide: TestTube2 },
  { name: 'Pulizia Filtro', icon: '🧼', lucide: Waves },
  { name: 'Altro', icon: '📝', lucide: Info },
];

export default function RemindersModal({ reminders, onUpdate, onClose, initialFilter = 'all' }) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFrequency, setNewFrequency] = useState(7);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const isNotificationMode = initialFilter === 'overdue';

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
    const newReminder = {
      id: Date.now(),
      task: newTask,
      description: newDescription,
      frequency: newFrequency,
      lastDone: start.toISOString(),
      nextDue: new Date(start.getTime() + newFrequency * 24 * 60 * 60 * 1000).toISOString()
    };

    onUpdate([newReminder, ...reminders]);
    setNewTask('');
    setNewDescription('');
    setNewFrequency(7);
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
              {isNotificationMode ? 'Centro Notifiche' : 'Promemoria'}
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
                      Scegli un'operazione
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {TASK_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion.name}
                          type="button"
                          onClick={() => setNewTask(suggestion.name)}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-xs font-medium ${
                            newTask === suggestion.name 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                          }`}
                        >
                          <span>{suggestion.icon}</span>
                          {suggestion.name}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Oppure scrivi qui..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 ml-1">
                      Descrizione (opzionale)
                    </label>
                    <textarea 
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Aggiungi dettagli..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm resize-none h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-1.5 ml-1">
                      Data di inizio
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
                      Ogni quanti giorni?
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
                        {newFrequency} gg
                      </span>
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
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
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
                  className="w-full bg-white/5 border border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-white/40 hover:text-emerald-400 mb-6 group"
                >
                  <Plus size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="font-bold">Nuovo Promemoria</span>
                </motion.button>
              )
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {filteredReminders.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/40 italic">
                  {isNotificationMode ? 'Nessun avviso urgente' : 'Nessun promemoria impostato'}
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
                              <Clock size={10} /> Ogni {reminder.frequency} gg
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${overdue ? 'text-red-400' : 'text-white/30'}`}>
                              <Calendar size={10} /> Scade: {formatDate(reminder.nextDue)}
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
                      {isNotificationMode ? 'Eseguito' : 'Segna come fatto'}
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
