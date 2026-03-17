import { useMemo } from 'react';
import { AlertCircle, CheckCircle2, Info, Zap, Droplets, Activity, LayoutGrid, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ValidationResult, HealthScoreResult } from '../services/validationService';
import HistoryChart from './HistoryChart';

interface Props {
  result: ValidationResult;
  testLogs: any[];
  healthScore?: HealthScoreResult;
}

export default function ValidationReport({ result, testLogs, healthScore }: Props) {
  const radarData = useMemo(() => [
    { subject: 'Chimica', A: result.checks.chemical.status === 'ok' ? 100 : 20, fullMark: 100 },
    { subject: 'Luce', A: result.checks.lighting.status === 'ok' ? 100 : 20, fullMark: 100 },
    { subject: 'Alghe', A: result.checks.algae.status === 'ok' ? 100 : 50, fullMark: 100 },
    { subject: 'Etologia', A: result.checks.ethological.status === 'ok' ? 100 : 20, fullMark: 100 },
    { subject: 'Sessi', A: result.checks.sexRatio.status === 'ok' ? 100 : result.checks.sexRatio.status === 'warning' ? 50 : 20, fullMark: 100 },
    { subject: 'Carico', A: result.checks.load.status === 'ok' ? 100 : 50, fullMark: 100 },
  ], [result]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ottimale': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Errore Critico': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Status */}
      <div className={`p-5 rounded-2xl border ${getStatusColor(result.status)} flex items-center justify-between shadow-lg shadow-black/20`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <ShieldCheck size={32} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-xl uppercase tracking-tighter">
              Biological Guardian Analysis
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 text-white uppercase tracking-widest">
                {result.ecosystemType}
              </span>
              <p className="text-xs font-medium opacity-90 italic">"La vita dei tuoi pesci dipende dal mio sguardo."</p>
            </div>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] uppercase font-bold opacity-50">Data Analisi</p>
          <p className="text-xs font-mono">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* 1. ANALISI BIOTIPO */}
      <div className="bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <LayoutGrid size={80} />
        </div>
        <h4 className="text-xs font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
          <Info size={14} /> 1. ANALISI BIOTIPO
        </h4>
        <p className="text-lg font-bold text-white leading-tight">
          {result.biotypeAnalysis}
        </p>
      </div>

      {/* 2. STATO DI SALUTE & CONSIGLIO SALVAVITA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-zinc-800/50 p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center relative">
          <h4 className="text-xs font-bold text-white/40 uppercase mb-4 absolute top-4 left-4 tracking-widest">
            2. STATO DI SALUTE
          </h4>
          <div className="relative mt-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/5"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke={healthScore?.color || '#818cf8'}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * (healthScore?.score || 0)) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{healthScore?.score || 0}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase">Punti</span>
            </div>
          </div>
          <p className="mt-4 font-bold text-sm uppercase tracking-widest" style={{ color: healthScore?.color }}>
            {healthScore?.status || 'ANALISI...'}
          </p>
        </div>

        {/* Life Saving Advice */}
        <div className="md:col-span-2 bg-red-500/10 p-6 rounded-2xl border border-red-500/20 flex flex-col justify-center relative">
          <h4 className="text-xs font-bold text-red-400 uppercase mb-4 absolute top-4 left-4 tracking-widest">
            3. CONSIGLIO SALVAVITA
          </h4>
          <div className="flex items-start gap-5 mt-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-500/20">
              <Zap size={32} />
            </div>
            <div>
              <p className="text-xl font-black text-white leading-tight mb-2 italic">
                "{result.lifeSavingAdvice}"
              </p>
              <p className="text-xs text-red-300/60 font-medium uppercase tracking-wider">Azione prioritaria richiesta ora</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
          <span className="text-[10px] uppercase text-white/40 font-bold">Volume Netto</span>
          <p className="text-xl font-bold text-white">
            {result.technicalData.netVolume > 0 ? `${result.technicalData.netVolume.toFixed(1)}L` : '--- L'}
          </p>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
          <span className="text-[10px] uppercase text-white/40 font-bold">Lumen/Litro</span>
          <p className="text-xl font-bold text-white">
            {result.technicalData.lumenPerLiter > 0 ? `${result.technicalData.lumenPerLiter.toFixed(1)} lm/L` : 'Seleziona Lampada'}
          </p>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
          <span className="text-[10px] uppercase text-white/40 font-bold">CO2 Disciolta</span>
          <p className="text-xl font-bold text-white">
            {result.technicalData.co2 > 0 ? `${result.technicalData.co2.toFixed(1)} mg/L` : '--- mg/L'}
          </p>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
          <span className="text-[10px] uppercase text-white/40 font-bold">Peso Totale</span>
          <p className="text-xl font-bold text-white">
            {result.technicalData.totalWeight > 0 ? `~${result.technicalData.totalWeight.toFixed(0)} kg` : '~ 0 kg'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 h-[300px]">
          <h4 className="text-xs font-bold text-white/40 uppercase mb-4 flex items-center gap-2 tracking-widest">
            <Activity size={14} /> BILANCIO BIOLOGICO
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#ffffff10" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 10 }} />
              <Radar
                name="Setup"
                dataKey="A"
                stroke="#818cf8"
                fill="#818cf8"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 flex flex-col">
          <h4 className="text-xs font-bold text-white/40 uppercase mb-4 flex items-center gap-2 tracking-widest">
            <Info size={14} /> DETTAGLIO INCOMPATIBILITÀ
          </h4>
          <div className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
            {result.explanation.length > 0 ? (
              result.explanation.map((exp, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`text-sm p-3 rounded-xl border ${
                    exp.includes('🛑') ? 'bg-red-500/10 border-red-500/20 text-red-200' : 
                    exp.includes('⚠️') ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 
                    'bg-white/5 border-white/5 text-white/80'
                  }`}
                >
                  {exp}
                </motion.div>
              ))
            ) : (
              <div className="text-sm text-emerald-400/80 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                ✅ Nessun rischio biologico immediato rilevato.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Advice Section REMOVED - Integrated into Life Saving Advice */}

      {/* Suggested Chart Section */}
      {result.suggestedChart && (
        <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
          <h4 className="text-xs font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2">
            <Zap size={14} /> Grafico Consigliato per il Report
          </h4>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-white font-bold">{result.suggestedChart}</p>
              <p className="text-xs text-white/60">
                {result.suggestedChart === 'Intersezione Range' && 'Visualizza la sovrapposizione dei parametri chimici ideali per le tue specie.'}
                {result.suggestedChart === 'Triangolo Alghe' && 'Analizza il rapporto tra Luce, CO2 e Nutrienti per prevenire infestazioni.'}
                {result.suggestedChart === 'Ciclo Azoto' && 'Monitora la maturazione biologica del filtro e la conversione dei nitriti.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Swimming Zones Map */}
      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5">
        <h4 className="text-xs font-bold text-white/40 uppercase mb-4 flex items-center gap-2 tracking-widest">
          <LayoutGrid size={14} /> ANALISI ZONE DI NUOTO
        </h4>
        <div className="relative h-48 w-full bg-indigo-950/30 rounded-xl border border-white/5 overflow-hidden flex flex-col">
          {/* Superficie */}
          <div className={`flex-1 border-b border-white/5 flex items-center justify-between px-6 transition-colors ${
            result.zoneAnalysis.superficie.status === 'Rosso' ? 'bg-red-500/10' : 
            result.zoneAnalysis.superficie.status === 'Giallo' ? 'bg-amber-500/10' : 'bg-emerald-500/5'
          }`}>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Superficie</span>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-white/60">{result.zoneAnalysis.superficie.count} Pesci</span>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                result.zoneAnalysis.superficie.status === 'Rosso' ? 'bg-red-500/20 text-red-400' : 
                result.zoneAnalysis.superficie.status === 'Giallo' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {result.zoneAnalysis.superficie.status}
              </span>
            </div>
          </div>
          
          {/* Centro */}
          <div className={`flex-1 border-b border-white/5 flex items-center justify-between px-6 transition-colors ${
            result.zoneAnalysis.centro.status === 'Rosso' ? 'bg-red-500/10' : 
            result.zoneAnalysis.centro.status === 'Giallo' ? 'bg-amber-500/10' : 'bg-emerald-500/5'
          }`}>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Centro</span>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-white/60">{result.zoneAnalysis.centro.count} Pesci</span>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                result.zoneAnalysis.centro.status === 'Rosso' ? 'bg-red-500/20 text-red-400' : 
                result.zoneAnalysis.centro.status === 'Giallo' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {result.zoneAnalysis.centro.status}
              </span>
            </div>
          </div>

          {/* Fondo */}
          <div className={`flex-1 flex items-center justify-between px-6 transition-colors ${
            result.zoneAnalysis.fondo.status === 'Rosso' ? 'bg-red-500/10' : 
            result.zoneAnalysis.fondo.status === 'Giallo' ? 'bg-amber-500/10' : 'bg-emerald-500/5'
          }`}>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Fondo</span>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-white/60">{result.zoneAnalysis.fondo.count} Pesci</span>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                result.zoneAnalysis.fondo.status === 'Rosso' ? 'bg-red-500/20 text-red-400' : 
                result.zoneAnalysis.fondo.status === 'Giallo' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {result.zoneAnalysis.fondo.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Suggestions Section (Biological Guardian Feature) */}
      {result.purchaseSuggestions.length > 0 && (
        <div className="bg-indigo-900/20 p-5 rounded-2xl border border-indigo-500/30">
          <h4 className="text-xs font-bold text-indigo-300 uppercase mb-4 flex items-center gap-2 tracking-widest">
            <Zap size={14} /> 4. COMPLETA IL TUO ECOSISTEMA
          </h4>
          <div className="space-y-4">
            {result.purchaseSuggestions.map((sug, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white bg-indigo-500 px-2 py-0.5 rounded uppercase tracking-widest">
                      {sug.zone}
                    </span>
                    <span className="text-lg font-black text-white tracking-tight">{sug.fishName}</span>
                  </div>
                  <ShieldCheck size={18} className="text-indigo-400" />
                </div>
                <p className="text-sm text-white/80 leading-relaxed italic border-l-2 border-indigo-500/50 pl-4 py-1">
                  "{sug.motivation}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Chart Section */}
      <div className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5">
        <h4 className="text-xs font-bold text-white/40 uppercase mb-4 flex items-center gap-2">
          <Activity size={14} /> Andamento Parametri
        </h4>
        <div className="h-64 w-full">
          <HistoryChart data={testLogs} />
        </div>
      </div>
    </div>
  );
}
