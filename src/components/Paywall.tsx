import { useTranslation } from 'react-i18next';
import { Check, Hand, Calendar, Search, RefreshCw, PiggyBank, LifeBuoy, Fish, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface PaywallProps {
  tankType?: string;
  onContinueBasic?: () => void;
}

export default function Paywall({ tankType, onContinueBasic }: PaywallProps) {
  const { t } = useTranslation();

  const isSaltwater = tankType === 'saltwater' || tankType === 'Acqua Marina';
  
  const heroImage = isSaltwater 
    ? "https://images.unsplash.com/photo-1546024023-f0ff871233e4?q=80&w=1920&auto=format&fit=crop" // Saltwater reef
    : "https://images.unsplash.com/photo-1524704659694-9f75c92f79f1?q=80&w=1920&auto=format&fit=crop"; // Freshwater planted tank with tetras

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col overflow-y-auto pb-10">
      {/* Hero Section */}
      <div className="relative h-[45vh] w-full shrink-0">
        <img 
          src={heroImage} 
          alt="Aquarium" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40" />
        
        <div className="absolute bottom-8 left-6 right-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold leading-tight max-w-sm"
          >
            Proteggi il tuo investimento e la<br />
            la vita nel tuo acquario.
          </motion.h1>
        </div>
      </div>

      {/* Plans Section */}
      <div className="px-6 -mt-4 relative z-10 flex flex-col gap-4 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Piano Essential */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-800/50 border border-white/5 rounded-3xl p-6 flex flex-col"
          >
            <div className="mb-4">
              <Hand className="text-amber-500/60 mb-2" size={32} strokeWidth={1.5} />
              <h3 className="text-xl font-bold">Piano Essential</h3>
              <p className="text-lg font-medium text-white/90">- 2,50€ <span className="text-sm text-white/40">/ mese</span></p>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <Calendar size={18} className="text-white/40" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <Search size={18} className="text-white/40" />
              </div>
            </div>

            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                Manutenzione Manuale
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                Database Base
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                Database
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                Senza Prevenzione
              </li>
            </ul>
          </motion.div>

          {/* Piano Smart Guardian */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-800/50 border-2 border-emerald-500/50 rounded-3xl p-6 flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 bg-emerald-500 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider">
              <Star size={10} fill="currentColor" />
              Scelta Sicura
            </div>

            <div className="mb-4">
              <ShieldCheck className="text-emerald-400 mb-2" size={32} strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-emerald-400">Piano Smart Guardian</h3>
              <p className="text-lg font-medium text-white/90">- 3,99€ <span className="text-sm text-white/40">/ mese</span></p>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">IL PIÙ CHEELTO</p>
            </div>

            <ul className="space-y-3 text-sm text-white/90 mb-6">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                Algoritmo Predittiv di Salute
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                Automationi Ciclo Manutenzion
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                Protezion Capitale
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                Guida all'Acquisto
              </li>
            </ul>

            <div className="flex gap-3 mt-auto">
              <RefreshCw size={18} className="text-emerald-400/40" />
              <PiggyBank size={18} className="text-orange-400/40" />
              <LifeBuoy size={18} className="text-blue-400/40" />
              <Fish size={18} className="text-pink-400/40" />
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 text-white font-bold py-4 rounded-2xl text-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
            Attiva Protezione Totale
          </button>
          
          <button 
            onClick={onContinueBasic}
            className="text-white/40 hover:text-white/60 transition-colors text-sm font-medium"
          >
            Oppure continua con il piano Basic
          </button>
        </div>
      </div>
    </div>
  );
}
