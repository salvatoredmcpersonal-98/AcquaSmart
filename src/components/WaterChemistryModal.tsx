import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, TestTube2, AlertTriangle, CheckCircle2, Info, Droplets, Thermometer, Zap, Activity, ShieldAlert, ClipboardList, TrendingUp, Gauge, History, Trash2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calculateNH3Toxicity, analyzeRedfieldRatio, calculateCO2, getCO2Status, calculateCorrection } from '../services/waterChemistryService';
import { getTroubleshootingAnalysis, validateSetup } from '../services/validationService';

interface WaterChemistryModalProps {
  testLogs: any[];
  onLogTest: (data: any) => void;
  onDeleteLog: (id: string) => void;
  onResetHistory: (param?: string) => void;
  onClose: () => void;
  tank: any;
  accessories: any[];
  inhabitants: { fish: any[]; plants: any[]; hardscape?: any[] };
}

const InputField = ({ label, value, onChange, unit, placeholder = "0.0" }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{label}</label>
    </div>
    <div className="relative">
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm placeholder-white/20 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none transition-all"
      />
      {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20 uppercase">{unit}</span>}
    </div>
  </div>
);

export default function WaterChemistryModal({ testLogs, onLogTest, onDeleteLog, onResetHistory, onClose, tank, accessories, inhabitants }: WaterChemistryModalProps) {
  const { t } = useTranslation();
  const latestLog = testLogs[0] || {};

  const [values, setValues] = useState({
    ph: latestLog.ph?.toString() || '',
    kh: latestLog.kh?.toString() || '',
    gh: latestLog.gh?.toString() || '',
    temp: latestLog.temp?.toString() || '',
    no3: latestLog.nitrates?.toString() || '',
    po4: latestLog.po4?.toString() || '',
    nh4: latestLog.nh4?.toString() || '',
    no2: latestLog.no2?.toString() || '',
    cu: latestLog.cu?.toString() || '',
    k: latestLog.k?.toString() || '',
    fe: latestLog.fe?.toString() || '',
  });

  const [activeTab, setActiveTab] = useState<'input' | 'analysis'>('input');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const hasChanges = useMemo(() => {
    return Object.entries(values).some(([key, val]) => {
      const latestVal = latestLog[key === 'no3' ? 'nitrates' : key]?.toString() || '';
      return val !== latestVal;
    });
  }, [values, latestLog]);

  useEffect(() => {
    setValues({
      ph: latestLog.ph?.toString() || '',
      kh: latestLog.kh?.toString() || '',
      gh: latestLog.gh?.toString() || '',
      temp: latestLog.temp?.toString() || '',
      no3: latestLog.nitrates?.toString() || '',
      po4: latestLog.po4?.toString() || '',
      nh4: latestLog.nh4?.toString() || '',
      no2: latestLog.no2?.toString() || '',
      cu: latestLog.cu?.toString() || '',
      k: latestLog.k?.toString() || '',
      fe: latestLog.fe?.toString() || '',
    });
  }, [latestLog.ph, latestLog.kh, latestLog.gh, latestLog.temp, latestLog.nitrates, latestLog.po4, latestLog.nh4, latestLog.no2, latestLog.cu, latestLog.k, latestLog.fe]);

  const analysis = useMemo(() => {
    const ph = parseFloat(values.ph);
    const kh = parseFloat(values.kh);
    const gh = parseFloat(values.gh);
    const temp = parseFloat(values.temp) || tank?.baseTemp || 25;
    const no3 = parseFloat(values.no3);
    const po4 = parseFloat(values.po4);
    const nh4 = parseFloat(values.nh4);
    const no2 = parseFloat(values.no2);
    const cu = parseFloat(values.cu);
    const k = parseFloat(values.k);
    const fe = parseFloat(values.fe);

    const numericValues: Record<string, number | undefined> = {};
    Object.entries(values).forEach(([key, val]) => {
      if (val !== '') {
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) {
          numericValues[key === 'no3' ? 'nitrates' : key] = parsed;
        }
      }
    });

    // Use validateSetup to get deduced style and technical data
    const validation = validateSetup(
      tank, 
      accessories,
      {
        fish: inhabitants.fish || [],
        plants: inhabitants.plants || [],
        hardscape: inhabitants.hardscape || []
      },
      numericValues
    );
    const tankStyle = validation.deducedStyle || 'Comunità';
    const netVolume = validation.technicalData.netVolume;
    const lumenPerLiter = validation.technicalData.lumenPerLiter;
    const hasCO2 = accessories.some(a => a.type === 'CO2' && a.status === 'Attivo');

    const troubleshooting = getTroubleshootingAnalysis(
      numericValues, 
      tankStyle, 
      netVolume, 
      inhabitants, 
      validation.technicalData.plantDensity,
      lumenPerLiter,
      hasCO2
    );

    const results: any[] = [];
    const missions: string[] = [];
    let emergency = troubleshooting.status === 'Emergenza';

    // Map troubleshooting problems to results
    troubleshooting.problems.forEach(p => {
      results.push({
        param: p.param,
        value: p.value,
        status: p.priority === 1 ? 'CRITICAL' : 'WARNING',
        message: p.diagnosis,
        solution: p.solution,
        action: p.action,
        proTip: p.proTip,
        icon: p.priority === 1 ? <ShieldAlert className="text-red-400" /> : <AlertTriangle className="text-amber-400" />
      });
      missions.push(`${p.solution}. ${p.action}`);
    });

    // Keep existing specific analysis if not covered by troubleshooting
    // (Though troubleshooting covers most now)
    
    // 1. NH3 Toxicity (already in troubleshooting level 1)
    
    // 4. Redfield Ratio (already in troubleshooting level 3)

    // 5. CO2
    if (!isNaN(ph) && !isNaN(kh)) {
      const co2 = calculateCO2(ph, kh);
      const co2Status = getCO2Status(co2);
      if (!results.some(r => r.param === 'CO2')) {
        results.push({
          param: 'CO2',
          value: co2,
          status: co2Status.status === 'IDEAL' ? 'OPTIMAL' : 'WARNING',
          message: co2Status.advice,
          icon: co2Status.status === 'IDEAL' ? <CheckCircle2 className="text-emerald-400" /> : <AlertTriangle className="text-amber-400" />
        });
      }
    }

    return { results, missions, emergency, troubleshooting };
  }, [values, tank, t]);

  const handleSave = () => {
    const numericValues = {};
    Object.entries(values).forEach(([key, val]) => {
      if (val !== '') {
        numericValues[key === 'no3' ? 'nitrates' : key] = parseFloat(val);
      }
    });
    onLogTest(numericValues);
    // Removed onClose() to keep the window open as requested
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <TestTube2 className="text-emerald-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{t('water_chemistry_title')}</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">{t('water_chemistry_expert_analysis_subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-white/10 transition-colors">
            <X size={24} className="text-white/40" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 bg-black/20 mx-6 mt-6 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'input' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'}`}
          >
            <ClipboardList size={16} />
            {t('inhabitants_add_new')}
          </button>
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'analysis' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white/60'}`}
          >
            <Activity size={16} />
            {t('water_chemistry_analysis')}
            {analysis.emergency && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'input' && (
              <motion.div 
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InputField label="Temp" value={values.temp} onChange={(v) => setValues({...values, temp: v})} unit="°C" />
                  <InputField label="pH" value={values.ph} onChange={(v) => setValues({...values, ph: v})} unit="" />
                  <InputField label="KH" value={values.kh} onChange={(v) => setValues({...values, kh: v})} unit="°d" />
                  <InputField label="GH" value={values.gh} onChange={(v) => setValues({...values, gh: v})} unit="°d" />
                  <InputField label="NO3" value={values.no3} onChange={(v) => setValues({...values, no3: v})} unit="mg/L" />
                  <InputField label="PO4" value={values.po4} onChange={(v) => setValues({...values, po4: v})} unit="mg/L" />
                  <InputField label="NH4" value={values.nh4} onChange={(v) => setValues({...values, nh4: v})} unit="mg/L" />
                  <InputField label="NO2" value={values.no2} onChange={(v) => setValues({...values, no2: v})} unit="mg/L" />
                  <InputField label="Cu" value={values.cu} onChange={(v) => setValues({...values, cu: v})} unit="mg/L" />
                  <InputField label="K" value={values.k} onChange={(v) => setValues({...values, k: v})} unit="mg/L" />
                  <InputField label="Fe" value={values.fe} onChange={(v) => setValues({...values, fe: v})} unit="mg/L" />
                </div>

                {/* History Section at the bottom of Input Tab */}
                <div className="pt-8 border-t border-white/5 space-y-6">
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <History size={16} className={isHistoryExpanded ? "text-emerald-400" : "text-white/40"} />
                      <h3 className={`text-[10px] font-black uppercase tracking-widest ${isHistoryExpanded ? "text-white" : "text-white/40"}`}>
                        {t('water_chemistry_history')}
                      </h3>
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform duration-300 ${isHistoryExpanded ? "rotate-180 text-emerald-400" : "text-white/20"}`} 
                      />
                    </button>
                    {testLogs.length > 0 && isHistoryExpanded && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Reset all clicked - immediate action');
                          onResetHistory();
                        }}
                        className="relative z-50 text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-300 transition-colors flex items-center gap-1 p-2 bg-red-500/5 rounded-lg border border-red-500/10"
                      >
                        <Trash2 size={12} />
                        {t('water_chemistry_reset_all')}
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {isHistoryExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {testLogs.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                              <History size={24} className="text-white/10" />
                            </div>
                            <p className="text-white/20 text-xs font-medium">{t('water_chemistry_no_history')}</p>
                          </div>
                        ) : (
                          <div className="space-y-4 pb-4">
                            {testLogs.map((log) => (
                              <div key={log.timestamp} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 group hover:bg-white/[0.04] transition-all">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex flex-col">
                                    <span className="text-white font-bold text-sm">
                                      {new Date(log.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    <span className="text-white/30 text-[10px] uppercase font-bold tracking-wider">
                                      {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('Delete log clicked - immediate action:', log.timestamp);
                                      onDeleteLog(log.timestamp);
                                    }}
                                    className="relative z-50 p-2.5 bg-red-500/5 hover:bg-red-500/20 text-white/20 hover:text-red-400 rounded-xl border border-white/5 hover:border-red-500/20 transition-all"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {Object.entries(log).map(([key, val]) => {
                                    if (['id', 'timestamp', 'tankId'].includes(key) || val === undefined || val === null) return null;
                                    const label = key === 'nitrates' ? 'NO3' : key.toUpperCase();
                                    return (
                                      <div key={key} className="bg-white/5 rounded-lg p-2 flex flex-col">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">{label}</span>
                                        <span className="text-xs font-bold text-white/80">{String(val)}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div 
                key="analysis"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {analysis.results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Info size={32} className="text-white/20" />
                    </div>
                    <p className="text-white/40 font-medium">{t('water_chemistry_expert_analysis_empty')}</p>
                  </div>
                ) : (
                  <>
                    {/* Troubleshooting Engine Header */}
                    <div className={`p-6 rounded-[2rem] border flex flex-col gap-4 ${
                      analysis.troubleshooting.status === 'Emergenza' ? 'bg-red-500/10 border-red-500/20' :
                      analysis.troubleshooting.status === 'Squilibrio Rilevato' ? 'bg-amber-500/10 border-amber-500/20' :
                      'bg-emerald-500/10 border-emerald-500/20'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                          analysis.troubleshooting.status === 'Emergenza' ? 'bg-red-500 shadow-red-500/20' :
                          analysis.troubleshooting.status === 'Squilibrio Rilevato' ? 'bg-amber-500 shadow-amber-500/20' :
                          'bg-emerald-500 shadow-emerald-500/20'
                        }`}>
                          <Zap className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className={`font-black uppercase tracking-widest text-sm ${
                            analysis.troubleshooting.status === 'Emergenza' ? 'text-red-400' :
                            analysis.troubleshooting.status === 'Squilibrio Rilevato' ? 'text-amber-400' :
                            'text-emerald-400'
                          }`}>STATO: {analysis.troubleshooting.status}</h3>
                          <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Troubleshooting Engine v2.0</p>
                        </div>
                      </div>
                    </div>

                    {/* Results Grid */}
                    <div className="grid grid-cols-1 gap-4">
                      {analysis.results.map((res, idx) => (
                        <div key={idx} className={`p-6 rounded-[2rem] border flex flex-col gap-4 transition-all ${
                          res.status === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' :
                          res.status === 'WARNING' ? 'bg-amber-500/5 border-amber-500/20' :
                          'bg-emerald-500/5 border-emerald-500/20'
                        }`}>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                              {res.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{res.param}</span>
                                <span className={`text-xs font-bold ${
                                  res.status === 'CRITICAL' ? 'text-red-400' :
                                  res.status === 'WARNING' ? 'text-amber-400' :
                                  'text-emerald-400'
                                }`}>{res.value}</span>
                              </div>
                              <h4 className="text-white font-bold text-base">PROBLEMA: {res.message}</h4>
                            </div>
                          </div>
                          
                          {(res.solution || res.action) && (
                            <div className="pl-14 space-y-3">
                              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Cosa fare ora:</p>
                                <p className="text-white/90 text-sm leading-relaxed font-medium">
                                  {res.solution} {res.action}
                                </p>
                              </div>
                              {res.proTip && (
                                <div className="flex items-start gap-3 px-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                                  <p className="text-indigo-300/80 text-[11px] font-medium italic leading-relaxed">
                                    <span className="font-black uppercase tracking-tighter mr-1">Consiglio Pro:</span>
                                    {res.proTip}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Recovery Mission */}
                    {analysis.missions.length > 0 && (
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <ClipboardList className="text-indigo-400" size={20} />
                          <h3 className="text-indigo-400 font-black uppercase tracking-widest text-sm">{t('water_chemistry_recovery_mission')}</h3>
                        </div>
                        <ul className="space-y-3">
                          {analysis.missions.map((m, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-white/70 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className={`w-full transition-all duration-200 text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl flex items-center justify-center gap-3 ${
              hasChanges 
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-[0.98]' 
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 size={20} />
            {t('water_chemistry_save')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
