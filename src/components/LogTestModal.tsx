import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Trash2, Sparkles } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { motion, AnimatePresence } from 'motion/react';
import { parseDimensions } from '../services/waterChemistryService';

const InputField = ({ label, value, onChange, unit, autoFocus = false }) => (
    <div>
        <label className="block text-sm font-medium text-white/70 mb-1">{label}</label>
        <div className="relative">
            <input
                type="number"
                step="0.1"
                value={value}
                onChange={onChange}
                required
                autoFocus={autoFocus}
                className="w-full bg-white/5 border border-white/20 rounded-xl py-3 px-4 text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-shadow"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/50">{unit}</span>
        </div>
    </div>
);

export default function LogTestModal({ parameter, testLogs, onClose, onLogTest, onDeleteLog, onResetHistory, onMaintenanceAction = null, tank = null, accessories = [], validationResult = null }) {
    const { t } = useTranslation();
    const { locale, formatTemperature } = useLocale();
    const [value, setValue] = useState('');

    const paramConfig = {
        temp: { title: t('log_temp_title'), label: t('log_test_temp'), unit: locale.temperature.label, formatter: formatTemperature },
        ph: { title: t('log_ph_title'), label: 'pH', unit: '', formatter: (val) => val?.toFixed(1) },
        nitrates: { title: t('log_nitrates_title'), label: t('log_test_nitrates'), unit: 'mg/L', formatter: (val) => val ? `${val} mg/L` : '' },
        kh: { title: t('log_kh_title'), label: 'KH', unit: '°dKH', formatter: (val) => val ? `${val} °dKH` : '' },
        gh: { title: t('log_gh_title'), label: 'GH', unit: '°dGH', formatter: (val) => val ? `${val} °dGH` : '' },
    };

    const config = paramConfig[parameter];

    const handleSubmit = (e) => {
        e.preventDefault();
        let processedValue = parseFloat(value);
        if (parameter === 'temp' && locale.temperature.unit === 'F') {
            processedValue = (processedValue - 32) * 5/9;
        }

        onLogTest({ [parameter]: processedValue });
        
        // Log the maintenance action
        if (onMaintenanceAction && tank) {
            onMaintenanceAction(tank.id, `Water Test: ${parameter}`, { 
                value: processedValue,
                unit: config.unit
            });
        }
        
        setValue(''); // Clear input after submission
        onClose(); // Close modal after submission
    };
    
    const handleReset = () => {
        // The window.confirm was blocking the state update cycle in some cases.
        // Making the action immediate is more robust.
        onResetHistory(parameter);
    }

    if (!config) return null;

    const relevantLogs = testLogs.filter(log => log[parameter] !== null && typeof log[parameter] !== 'undefined').slice(0, 5);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-zinc-800 border border-white/10 rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">{config.title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
                        <X size={24} className="text-white/70" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <InputField 
                        label={config.label}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        unit={config.unit}
                        autoFocus={true}
                    />

                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200 text-white font-bold py-4 rounded-2xl !mt-8 shadow-lg shadow-emerald-500/20">
                        {t('log_test_button')}
                    </button>
                </form>

                {relevantLogs.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <h3 className="text-lg font-semibold text-white/80 mb-4">{t('log_history_title')}</h3>
                        <ul className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar touch-pan-y">
                            {relevantLogs.map(log => (
                                <li key={log.timestamp} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white">{config.formatter(log[parameter])}</span>
                                        <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                    <button type="button" onClick={() => onDeleteLog(log.timestamp)} className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-full active:bg-red-500/20 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button type="button" onClick={handleReset} className="w-full text-center text-xs text-red-400/60 hover:text-red-400 mt-6 p-2 rounded-lg hover:bg-red-500/5 transition-colors uppercase tracking-widest font-bold">
                            {t('reset_history_button')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
