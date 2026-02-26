import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Trash2 } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';

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

export default function LogTestModal({ parameter, testLogs, onClose, onLogTest, onDeleteLog, onResetHistory }) {
    const { t } = useTranslation();
    const { locale, formatTemperature } = useLocale();
    const [value, setValue] = useState('');

    const paramConfig = {
        temp: { title: t('log_temp_title'), label: t('log_test_temp'), unit: locale.temperature.label, formatter: formatTemperature },
        ph: { title: t('log_ph_title'), label: 'pH', unit: '', formatter: (val) => val?.toFixed(1) },
        nitrates: { title: t('log_nitrates_title'), label: t('log_test_nitrates'), unit: 'mg/L', formatter: (val) => val ? `${val} mg/L` : '' },
    };

    const config = paramConfig[parameter];

    const handleSubmit = (e) => {
        e.preventDefault();
        let processedValue = parseFloat(value);
        if (parameter === 'temp' && locale.temperature.unit === 'F') {
            processedValue = (processedValue - 32) * 5/9;
        }
        onLogTest({ [parameter]: processedValue });
        setValue(''); // Clear input after submission
    };
    
    const handleReset = () => {
        // The window.confirm was blocking the state update cycle in some cases.
        // Making the action immediate is more robust.
        onResetHistory(parameter);
    }

    if (!config) return null;

    const relevantLogs = testLogs.filter(log => log[parameter] !== null && typeof log[parameter] !== 'undefined').slice(0, 5);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-zinc-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm m-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">{config.title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                        <X size={20} className="text-white/70" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField 
                        label={config.label}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        unit={config.unit}
                        autoFocus={true}
                    />
                    <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors duration-200 text-white font-bold py-3 rounded-xl !mt-6">
                        {t('log_test_button')}
                    </button>
                </form>

                {relevantLogs.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <h3 className="text-lg font-semibold text-white/80 mb-2">{t('log_history_title')}</h3>
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {relevantLogs.map(log => (
                                <li key={log.timestamp} className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                    <div>
                                        <span className="font-medium">{config.formatter(log[parameter])}</span>
                                        <span className="text-xs text-white/50 ml-2">{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                    <button type="button" onClick={() => onDeleteLog(log.timestamp)} className="p-1 text-red-400/70 hover:text-red-400 hover:bg-red-500/20 rounded-full">
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button type="button" onClick={handleReset} className="w-full text-center text-sm text-red-400/80 hover:text-red-400 mt-4 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                            {t('reset_history_button')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
