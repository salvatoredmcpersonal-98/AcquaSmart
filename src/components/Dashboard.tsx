import { useState, useRef, useMemo, useEffect, useLayoutEffect, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Droplets, Thermometer, TestTube2, GripVertical, Fish, Leaf, Bell, AlertCircle, Lamp, Box, ShieldCheck, CheckCircle2, LayoutGrid, Plus, Activity, Info, X } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import usePersistentState from '../hooks/usePersistentState';
import { useElementWidth } from '../hooks/useElementWidth';
import useLongPress from '../hooks/useLongPress';
import LogTestModal from './LogTestModal';
import InhabitantsModal from './InhabitantsModal';
import RemindersModal from './RemindersModal';
import AccessoriesModal from './AccessoriesModal';
import WaterChemistryModal from './WaterChemistryModal';
import ValidationReport from './ValidationReport';
import HistoryChart from './HistoryChart';
import { Responsive } from 'react-grid-layout';
import { validateSetup, calculateHealthScore } from '../services/validationService';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';

interface StatCardProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: string | number | React.ReactNode;
  colorClass: string;
  onClick?: () => void;
  onInfoClick?: () => void;
  isEditMode: boolean;
  centered?: boolean;
}

const StatCard = memo(({ icon, label, value, colorClass, onClick = undefined, onInfoClick, isEditMode, centered = false }: StatCardProps) => {
  const interactiveClasses = onClick ? "cursor-pointer hover:bg-white/10 transition-colors duration-200" : "";

  const infoButton = onInfoClick && !isEditMode && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onInfoClick();
      }}
      className="absolute top-2 right-2 p-1.5 text-white/20 hover:text-white transition-colors z-[30] group/info"
    >
      <Info size={14} className="group-hover/info:scale-110 transition-transform" />
    </button>
  );

  const content = (
    <div className={`flex flex-col h-full ${centered ? 'items-center justify-center text-center' : 'justify-between text-left'}`}>
      <div className={`flex ${centered ? 'flex-col items-center gap-1' : 'items-center gap-3'}`}>
        <div className={`${centered ? 'w-10 h-10 sm:w-12 sm:h-12 mb-1' : 'w-10 h-10 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center ${colorClass} shrink-0`}>
          {icon}
        </div>
        <span className="text-white/70 text-xs sm:text-sm lg:text-base font-semibold tracking-wide truncate">{label}</span>
      </div>
      <div className={`${centered ? 'text-xl sm:text-2xl lg:text-4xl mt-1' : 'text-xl sm:text-2xl lg:text-4xl'} font-bold text-white tracking-tight`}>{value}</div>
    </div>
  );

  if (onClick) {
    return (
      <div className="relative w-full h-full">
        {infoButton}
        <motion.button 
          type="button"
          onTap={() => onClick()}
          className={`w-full h-full p-3 lg:p-4 flex flex-col outline-none border-none bg-transparent text-left appearance-none select-none z-10 ${interactiveClasses}`}
        >
          {content}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full p-3 lg:p-4 flex flex-col">
      {infoButton}
      {content}
    </div>
  );
});

export default function Dashboard({ 
  testLogs, 
  onLogTest, 
  handleDeleteTestLog, 
  onResetHistory, 
  inhabitants, 
  onUpdateInhabitants, 
  reminders, 
  onUpdateReminders, 
  accessories = [], 
  onUpdateAccessories, 
  tanks = [], 
  currentTankIndex = 0,
  onSetCurrentTankIndex,
  onAddNewTank,
  showRemindersInitial, 
  onCloseRemindersInitial,
  isBasicMode = false,
  onShowPaywall,
  setIsEditingTank,
  onMaintenanceAction,
  currentTank,
  maintenanceLogs = []
}) {
  const { t } = useTranslation();
  const { formatCurrency, formatTemperature } = useLocale();
  const [showTankSelector, setShowTankSelector] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const [showInhabitantsModal, setShowInhabitantsModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [remindersFilter, setRemindersFilter] = useState<'all' | 'overdue'>('all');
  const [showAccessoriesModal, setShowAccessoriesModal] = useState(false);
  const [showWaterChemistryModal, setShowWaterChemistryModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showInfoParam, setShowInfoParam] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Hide AI Consultant when any editing/config modal is open, EXCEPT for the validation report
    setIsEditingTank(!!editingParam || showInhabitantsModal || showRemindersModal || showAccessoriesModal || showWaterChemistryModal);
    return () => setIsEditingTank(false);
  }, [editingParam, showInhabitantsModal, showRemindersModal, showAccessoriesModal, setIsEditingTank]);

  useEffect(() => {
    if (showRemindersInitial) {
      setRemindersFilter('overdue');
      setShowRemindersModal(true);
      onCloseRemindersInitial();
    }
  }, [showRemindersInitial, onCloseRemindersInitial]);

  const tankVolume = currentTank?.volume || 0;
  const [direction, setDirection] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridWidth = useElementWidth(gridRef, [currentTankIndex]);

  const dragX = useMotionValue(0);
  const nextLabelOpacity = useTransform(dragX, [-100, 0], [1, 0]);
  const prevLabelOpacity = useTransform(dragX, [0, 100], [0, 1]);
  const labelScale = useTransform(dragX, [-100, 100], [1, 1]);

  useEffect(() => {
    dragX.set(0);
    setIsReady(false);
  }, [currentTankIndex, dragX]);

  useEffect(() => {
    if (gridWidth > 0) {
      setIsReady(true);
    }
  }, [gridWidth]);

  const handleDragEnd = useCallback((event: any, info: any) => {
    const threshold = 100;
    if (info.offset.x < -threshold) {
      // Swipe Left (Next)
      if (currentTankIndex < tanks.length - 1) {
        dragX.set(0);
        setDirection(1);
        onSetCurrentTankIndex(currentTankIndex + 1);
      } else {
        dragX.set(0);
        onAddNewTank();
      }
    } else if (info.offset.x > threshold) {
      // Swipe Right (Previous)
      if (currentTankIndex > 0) {
        dragX.set(0);
        setDirection(-1);
        onSetCurrentTankIndex(currentTankIndex - 1);
      } else {
        dragX.set(0);
      }
    } else {
      dragX.set(0);
    }
  }, [currentTankIndex, tanks.length, onSetCurrentTankIndex, onAddNewTank, dragX]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : (direction < 0 ? '-100%' : 0),
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : (direction < 0 ? '100%' : 0),
      opacity: 0
    })
  };

  const defaultLayouts = {
    lg: [
      { i: 'reminders', x: 0, y: 0, w: 12, h: 2, minW: 4, minH: 2 },
      { i: 'waterChemistry', x: 0, y: 2, w: 12, h: 2, minW: 4, minH: 2 },
      { i: 'inhabitants', x: 0, y: 4, w: 12, h: 2, minW: 4, minH: 2 },
      { i: 'accessories', x: 0, y: 6, w: 6, h: 2, minW: 3, minH: 2 },
      { i: 'inventory', x: 6, y: 6, w: 6, h: 2, minW: 3, minH: 2 },
    ],
    md: [
      { i: 'reminders', x: 0, y: 0, w: 12, h: 2, minW: 4, minH: 2 },
      { i: 'waterChemistry', x: 0, y: 2, w: 12, h: 2, minW: 4, minH: 2 },
      { i: 'inhabitants', x: 0, y: 4, w: 12, h: 2, minW: 4, minH: 2 },
      { i: 'accessories', x: 0, y: 6, w: 6, h: 2, minW: 3, minH: 2 },
      { i: 'inventory', x: 6, y: 6, w: 6, h: 2, minW: 3, minH: 2 },
    ],
    sm: [
      { i: 'reminders', x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'waterChemistry', x: 0, y: 2, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'inhabitants', x: 0, y: 4, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'accessories', x: 0, y: 6, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'inventory', x: 0, y: 8, w: 6, h: 2, minW: 4, minH: 2 },
    ],
    xs: [
      { i: 'reminders', x: 0, y: 0, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'waterChemistry', x: 0, y: 2, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'inhabitants', x: 0, y: 4, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'accessories', x: 0, y: 6, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'inventory', x: 0, y: 8, w: 6, h: 2, minW: 6, minH: 2 },
    ],
    xxs: [
      { i: 'reminders', x: 0, y: 0, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'waterChemistry', x: 0, y: 2, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'inhabitants', x: 0, y: 4, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'accessories', x: 0, y: 6, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'inventory', x: 0, y: 8, w: 6, h: 2, minW: 6, minH: 2 },
    ]
  };

  const [layouts, setLayouts] = usePersistentState(`dashboardLayouts_v7_${currentTank?.id || 'default'}`, defaultLayouts);

  const onLayoutChange = (layout: any, newLayouts: any) => {
    if (isEditMode) {
      setLayouts(newLayouts);
    }
  };

  const currentLayouts = useMemo(() => {
    const processedLayouts = {};
    Object.keys(layouts).forEach(key => {
      processedLayouts[key] = layouts[key].map(item => ({
        ...item,
        static: !isEditMode
      }));
    });
    return processedLayouts;
  }, [layouts, isEditMode]);

  const tankLogs = useMemo(() => 
    testLogs.filter(log => log.tankId === currentTank?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), 
    [testLogs, currentTank?.id]
  );
  const latestLog = tankLogs[0] || {};
  
  const validationResult = useMemo(() => {
    if (!currentTank) return null;
    const parseParam = (val: any) => {
      if (val === null || val === undefined || val === '') return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    };

    return validateSetup(
      currentTank,
      accessories,
      inhabitants,
      {
        ph: parseParam(latestLog.ph),
        kh: parseParam(latestLog.kh),
        temp: parseParam(latestLog.temp) ?? currentTank?.baseTemp,
        gh: parseParam(latestLog.gh),
        nitrates: parseParam(latestLog.nitrates),
        po4: parseParam(latestLog.po4),
        nh4: parseParam(latestLog.nh4),
        no2: parseParam(latestLog.no2),
        cu: parseParam(latestLog.cu)
      }
    );
  }, [currentTank, accessories, inhabitants, latestLog]);

  const healthScore = useMemo(() => {
    if (!validationResult) return { 
      score: 100, 
      status: 'OTTIMO' as const, 
      color: '#00FF00', 
      riskFactors: [],
      quickAdvice: t('dashboard_health_excellent_advice')
    };
    return calculateHealthScore(
      testLogs, 
      reminders, 
      validationResult, 
      {
        ...inhabitants,
        waterParams: {
          ph: latestLog.ph,
          kh: latestLog.kh,
          temp: latestLog.temp,
          gh: latestLog.gh,
          nitrates: latestLog.nitrates
        }
      },
      maintenanceLogs
    );
  }, [testLogs, reminders, validationResult, inhabitants, latestLog, maintenanceLogs]);

  const inventoryValue = useMemo(() => {
    const fishValue = inhabitants.fish.reduce((acc, f) => acc + (f.price * (f.quantity || 1)), 0);
    const plantsValue = inhabitants.plants.reduce((acc, p) => acc + (p.price * (p.quantity || 1)), 0);
    const accessoriesValue = accessories.reduce((acc, a) => acc + a.price, 0);
    return fishValue + plantsValue + accessoriesValue;
  }, [inhabitants, accessories]);

  const ResponsiveGridLayout = Responsive as any;

const PARAM_INFO = {
  temp: {
    title: 'Temperatura',
    description: 'La temperatura influisce sul metabolismo di pesci e piante. Ogni specie ha un intervallo ottimale per vivere in salute.',
    howToMeasure: 'Usa un termometro per acquari (a vetro, adesivo o digitale) posizionato in un punto con buona circolazione d\'acqua, lontano dal riscaldatore.'
  },
  ph: {
    title: 'pH',
    description: 'Misura l\'acidità o l\'alcalinità dell\'acqua su una scala da 0 a 14. Un pH stabile è fondamentale per evitare stress osmotico ai pesci.',
    howToMeasure: 'Si misura con test a reagente liquido (più precisi), strisce reattive o misuratori elettronici (piaccametro) che richiedono calibrazione periodica.'
  },
  nitrates: {
    title: 'Nitrati (NO3)',
    description: 'Prodotto finale del ciclo dell\'azoto. Sebbene meno tossici dell\'ammoniaca, livelli elevati (>20-40 mg/L) indicano la necessità di un cambio d\'acqua.',
    howToMeasure: 'Usa test a reagente liquido specifici. Agita bene i flaconi seguendo le istruzioni, poiché i reagenti dei nitrati tendono a sedimentare.'
  },
  kh: {
    title: 'KH (Durezza Carbonatica)',
    description: 'Rappresenta la capacità tampone dell\'acqua. Un KH adeguato (solitamente >4) impedisce sbalzi improvvisi e pericolosi del pH.',
    howToMeasure: 'Si misura con test a reagente a gocce. Conta quante gocce servono per far virare il colore del campione: ogni goccia corrisponde a 1 grado tedesco (°dKH).'
  },
  gh: {
    title: 'GH (Durezza Totale)',
    description: 'Misura la concentrazione di sali di calcio e magnesio. È fondamentale per l\'osmoregolazione e la salute generale di pesci e invertebrati.',
    howToMeasure: 'Si misura con test a reagente a gocce, in modo identico al KH. Il viraggio del colore indica il valore della durezza totale in gradi tedeschi (°dGH).'
  },
  nh4: {
    title: 'Ammonio (NH4+)',
    description: 'L\'ammonio è la forma meno tossica dell\'ammoniaca, ma può trasformarsi in ammoniaca tossica (NH3) a pH elevati.',
    howToMeasure: 'Usa test a reagente liquido. È fondamentale monitorarlo durante l\'avvio dell\'acquario o in caso di picchi di inquinamento.'
  },
  no2: {
    title: 'Nitriti (NO2)',
    description: 'Estremamente tossici per i pesci, i nitriti impediscono il trasporto di ossigeno nel sangue. Devono essere sempre a zero.',
    howToMeasure: 'Usa test a reagente liquido. In caso di presenza di nitriti, è necessario intervenire immediatamente con cambi d\'acqua.'
  },
  cu: {
    title: 'Rame (Cu)',
    description: 'Il rame è letale per gli invertebrati (gamberetti, lumache) anche in piccole dosi. Può derivare da tubature o medicinali.',
    howToMeasure: 'Usa test a reagente specifici per il rame, specialmente se intendi inserire caridine o lumache.'
  },
  po4: {
    title: 'Fosfati (PO4)',
    description: 'Nutriente per le piante, ma se in eccesso rispetto ai nitrati può causare esplosioni algali (alghe a pennello o cianobatteri).',
    howToMeasure: 'Usa test a reagente liquido. Il rapporto ideale con i nitrati (Redfield) è fondamentale per l\'equilibrio.'
  },
  k: {
    title: 'Potassio (K)',
    description: 'Macronutriente essenziale per le piante. Una carenza causa buchi nelle foglie vecchie e arresto della crescita.',
    howToMeasure: 'Usa test a reagente specifici per il potassio. È uno dei nutrienti più difficili da bilanciare senza test.'
  },
  fe: {
    title: 'Ferro (Fe)',
    description: 'Micronutriente fondamentale per la fotosintesi e il colore rosso delle piante. Deve essere presente in tracce.',
    howToMeasure: 'Usa test a reagente per il ferro chelato. Un eccesso può favorire le alghe filamentose.'
  }
};

  const handleLongPress = useCallback((action?: () => void) => {
    if (!isEditMode) {
      setIsEditMode(true);
      if (action) action();
      if (navigator.vibrate) {
        navigator.vibrate(60);
      }
    }
  }, [isEditMode]);

  const healthLongPress = useLongPress(() => handleLongPress());
  const waterChemistryLongPress = useLongPress(() => handleLongPress());
  const inventoryLongPress = useLongPress(() => handleLongPress());
  const inhabitantsLongPress = useLongPress(() => handleLongPress());
  const remindersLongPress = useLongPress(() => handleLongPress());
  const accessoriesLongPress = useLongPress(() => handleLongPress());

  const overdueReminders = useMemo(() => {
    return reminders.filter(r => new Date(r.nextDue) < new Date()).length;
  }, [reminders]);

  const mostUrgentReminder = useMemo(() => {
    if (reminders.length === 0) return null;
    // Sort by nextDue date
    const sorted = [...reminders].sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime());
    return sorted[0];
  }, [reminders]);

  return (
    <>
      <div className="relative overflow-y-auto bg-zinc-950 min-h-[calc(100vh-65px)] flex flex-col custom-scrollbar">
        {/* Peek Labels */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Next Tank / Add Tank (Right Side) */}
          <motion.div 
            style={{ opacity: nextLabelOpacity, scale: labelScale }}
            className="fixed right-0 top-[65px] bottom-0 w-24 flex items-center justify-center pointer-events-none z-50"
          >
            {currentTankIndex < tanks.length - 1 ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-white/40 font-black text-2xl mb-2">→</span>
                <span className="[writing-mode:vertical-rl] rotate-180 text-white/40 font-black uppercase tracking-[0.4em] text-xs whitespace-nowrap">
                  {tanks[currentTankIndex + 1].name}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-emerald-400 font-black text-2xl mb-2">+</span>
                <span className="[writing-mode:vertical-rl] rotate-180 text-emerald-400 font-black uppercase tracking-[0.4em] text-xs whitespace-nowrap">
                  {t('dashboard_add_tank_peek')}
                </span>
              </div>
            )}
          </motion.div>

          {/* Previous Tank (Left Side) */}
          {currentTankIndex > 0 && (
            <motion.div 
              style={{ opacity: prevLabelOpacity, scale: labelScale }}
              className="fixed left-0 top-[65px] bottom-0 w-24 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-white/40 font-black text-2xl mb-2">←</span>
                <span className="[writing-mode:vertical-rl] text-white/40 font-black uppercase tracking-[0.4em] text-xs whitespace-nowrap">
                  {tanks[currentTankIndex - 1].name}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex-1 relative grid grid-cols-1 grid-rows-1">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div 
              key={currentTankIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 400, damping: 40, mass: 0.8 },
                opacity: { duration: 0.15 }
              }}
              className="col-start-1 row-start-1 text-white touch-pan-y relative z-10 w-full flex flex-col items-center"
              drag={isEditMode ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              style={{ x: dragX }}
              onDragEnd={handleDragEnd}
            >
              <div className="p-4 sm:p-6 w-full max-w-5xl mx-auto">
          <div className="flex flex-col items-center mb-12 px-4 sm:px-0">
            <div className="relative">
              <button 
                onClick={() => setShowTankSelector(!showTankSelector)}
                className="flex flex-col items-center group"
              >
                <h1 className="text-xl sm:text-2xl font-medium text-white/60 uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                  {currentTank?.name}
                </h1>
                {currentTank?.type && (
                  <p className="text-[10px] sm:text-xs text-white/40 uppercase tracking-[0.2em] font-bold mt-1 group-hover:text-white/60 transition-colors">
                    {currentTank.type}
                  </p>
                )}
              </button>

              <AnimatePresence>
                {showTankSelector && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowTankSelector(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-2">
                        {tanks.map((tank, index) => (
                          <button
                            key={tank.id}
                            onClick={() => {
                              setDirection(0);
                              onSetCurrentTankIndex(index);
                              setShowTankSelector(false);
                            }}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                              index === currentTankIndex ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5 text-white/60'
                            }`}
                          >
                            <span className="font-medium truncate">{tank.name}</span>
                            {index === currentTankIndex && <CheckCircle2 size={16} />}
                          </button>
                        ))}
                        <div className="h-px bg-white/5 my-2" />
                        <button
                          onClick={() => {
                            onAddNewTank();
                            setShowTankSelector(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-500/10 text-emerald-400 transition-all"
                        >
                          <Plus size={18} />
                          <span className="font-bold uppercase tracking-wider text-xs">{t('dashboard_new_tank_button')}</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div className="h-px w-24 bg-white/10 mb-8" />
            
            {/* Tank Indicators */}
            {tanks.length > 1 && (
              <div className="flex gap-2 mb-8">
                {tanks.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentTankIndex ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-center gap-8 w-full">
            <h2 className="text-sm sm:text-base font-bold text-emerald-400 uppercase tracking-[0.3em]">
              {t('dashboard_title')}
            </h2>
            
            <div className="flex gap-3">
              {!isEditMode && (
                <button 
                  onClick={() => isBasicMode ? onShowPaywall() : setShowValidationModal(true)}
                  className={`p-2.5 rounded-xl transition-all active:scale-95 ${
                    validationResult?.status === 'Errore Critico' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' :
                    validationResult?.status === 'Warning' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' :
                    'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  }`}
                  title={t('dashboard_analysis_setup')}
                >
                  <ShieldCheck size={20} />
                </button>
              )}
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-2.5 rounded-xl transition-all active:scale-95 ${
                  isEditMode ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
                title={isEditMode ? t('save_layout') : t('edit_layout')}
              >
                {isEditMode ? <CheckCircle2 size={20} /> : <LayoutGrid size={20} />}
              </button>
            </div>
          </div>
        </div>
        
        <div ref={gridRef} className="w-full min-h-[500px]">
          {isReady && gridWidth > 0 && (
            <ResponsiveGridLayout 
              key={isEditMode ? 'edit' : 'view'}
              className="layout"
              layouts={currentLayouts}
              onLayoutChange={onLayoutChange}
              breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
              cols={{lg: 12, md: 12, sm: 6, xs: 6, xxs: 6}}
              rowHeight={90}
              width={gridWidth}
              draggableHandle=".drag-handle"
              draggableCancel="button, [role='button'], input, textarea, a"
              isDraggable={isEditMode}
              isResizable={isEditMode}
              preventCollision={false}
              compactType="vertical"
              margin={[16, 16]}
            containerPadding={{
              lg: [24, 24],
              md: [24, 24],
              sm: [16, 16],
              xs: [16, 16],
              xxs: [12, 12]
            }}
            useCSSTransforms={true}
          >
              <div key="reminders" 
                className={`relative group touch-pan-y ${isEditMode ? 'z-30 touch-none' : ''}`}
                {...remindersLongPress}
              >
                <div className={`w-full h-full bg-white/5 border border-white/10 rounded-2xl transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02] animate-wiggle bg-white/10' : ''}`}>
                  {isEditMode && (
                    <div className="drag-handle absolute top-0 right-0 p-3 opacity-100 cursor-grab active:cursor-grabbing text-emerald-400 z-30 touch-action-none">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <StatCard 
                    icon={<Bell size={20} className={overdueReminders > 0 ? "text-red-400 animate-pulse" : "text-emerald-300"} />} 
                    label={t('dashboard_reminders')} 
                    value={mostUrgentReminder ? (
                      <span className="flex flex-col items-center">
                        <span className="truncate leading-tight">{mostUrgentReminder.task}</span>
                        <span className="text-[10px] sm:text-xs opacity-50 font-medium mt-0.5">
                          {t('expires_on')}: {new Date(mostUrgentReminder.nextDue).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </span>
                      </span>
                    ) : t('none')} 
                    colorClass={overdueReminders > 0 ? "bg-red-500/20" : "bg-emerald-500/20"} 
                    onClick={() => setShowRemindersModal(true)}
                    isEditMode={isEditMode}
                    centered={true}
                  />
                  {overdueReminders > 0 && !isEditMode && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                        !
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div key="waterChemistry" 
                className={`relative group touch-pan-y ${isEditMode ? 'z-30 touch-none' : ''}`}
                {...waterChemistryLongPress}
              >
                <div className={`w-full h-full bg-white/5 border border-white/10 rounded-2xl transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02] animate-wiggle bg-white/10' : ''}`}>
                  {isEditMode && (
                    <div className="drag-handle absolute top-0 right-0 p-3 opacity-100 cursor-grab active:cursor-grabbing text-emerald-400 z-30 touch-action-none">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <StatCard 
                    icon={<TestTube2 size={20} className="text-emerald-300" />} 
                    label={t('water_chemistry_title')} 
                    value={
                      <div className="grid grid-cols-6 gap-x-3 gap-y-1 w-full mt-2">
                        {[
                          { key: 'temp', label: 'T' },
                          { key: 'ph', label: 'pH' },
                          { key: 'kh', label: 'KH' },
                          { key: 'gh', label: 'GH' },
                          { key: 'nitrates', label: 'NO3' },
                          { key: 'po4', label: 'PO4' },
                          { key: 'nh4', label: 'NH4' },
                          { key: 'no2', label: 'NO2' },
                          { key: 'cu', label: 'Cu' },
                          { key: 'k', label: 'K' },
                          { key: 'fe', label: 'Fe' }
                        ].map(param => (
                          <div key={param.key} className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[11px] font-black text-white/30 uppercase shrink-0">{param.label}</span>
                            <span className="text-[13px] font-bold text-white/80 truncate">
                              {latestLog[param.key] !== undefined && latestLog[param.key] !== null ? latestLog[param.key] : '--'}
                            </span>
                          </div>
                        ))}
                      </div>
                    } 
                    colorClass="bg-emerald-500/20" 
                    onClick={() => setShowWaterChemistryModal(true)}
                    isEditMode={isEditMode}
                    centered={true}
                  />
                </div>
              </div>

              <div key="inhabitants" 
                className={`relative group touch-pan-y ${isEditMode ? 'z-30 touch-none' : ''}`}
                {...inhabitantsLongPress}
              >
                <div className={`w-full h-full bg-white/5 border border-white/10 rounded-2xl transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02] animate-wiggle bg-white/10' : ''}`}>
                  {isEditMode && (
                    <div className="drag-handle absolute top-0 right-0 p-3 opacity-100 cursor-grab active:cursor-grabbing text-emerald-400 z-30 touch-action-none">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <motion.div 
                    role="button"
                    tabIndex={0}
                    onTap={() => setShowInhabitantsModal(true)}
                    className={`w-full h-full p-4 flex items-center justify-around cursor-pointer hover:bg-white/10 transition-colors duration-200`}
                  >
                    {/* Plants Section */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                        <Leaf size={24} className="text-emerald-400" />
                      </div>
                      <span className="text-white/60 text-xs font-medium uppercase tracking-wider">{t('inhabitants_plants')}</span>
                      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                        {inhabitants.plants.reduce((acc, p) => acc + (p.quantity || 1), 0)}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-16 w-px bg-white/10" />

                    {/* Fish Section */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                        <Fish size={24} className="text-orange-400" />
                      </div>
                      <span className="text-white/60 text-xs font-medium uppercase tracking-wider">{t('inhabitants_fish')}</span>
                      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                        {inhabitants.fish.reduce((acc, f) => acc + (f.quantity || 1), 0)}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-16 w-px bg-white/10" />

                    {/* Hardscape Section */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center mb-2">
                        <Box size={24} className="text-sky-400" />
                      </div>
                      <span className="text-white/60 text-xs font-medium uppercase tracking-wider">{t('dashboard_hardscape_label')}</span>
                      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                        {inhabitants.hardscape?.reduce((acc, h) => acc + (h.quantity || 1), 0) || 0}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div key="accessories" 
                className={`relative group touch-pan-y ${isEditMode ? 'z-30 touch-none' : ''}`}
                {...accessoriesLongPress}
              >
                <div className={`w-full h-full bg-white/5 border border-white/10 rounded-2xl transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02] animate-wiggle bg-white/10' : ''}`}>
                  {isEditMode && (
                    <div className="drag-handle absolute top-0 right-0 p-3 opacity-100 cursor-grab active:cursor-grabbing text-emerald-400 z-30 touch-action-none">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <StatCard 
                    icon={<Lamp size={20} className="text-indigo-300" />} 
                    label={t('dashboard_accessories')} 
                    value={accessories.length > 0 ? t('elements_count', { count: accessories.length }) : t('none')} 
                    colorClass="bg-indigo-500/20" 
                    onClick={() => setShowAccessoriesModal(true)}
                    isEditMode={isEditMode}
                    centered={true}
                  />
                </div>
              </div>

              <div key="inventory" 
                className={`relative group touch-pan-y ${isEditMode ? 'z-30 touch-none' : ''}`}
                {...inventoryLongPress}
              >
                <div className={`w-full h-full bg-white/5 border border-white/10 rounded-2xl transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02] animate-wiggle bg-white/10' : ''}`}>
                  {isEditMode && (
                    <div className="drag-handle absolute top-0 right-0 p-3 opacity-100 cursor-grab active:cursor-grabbing text-emerald-400 z-30 touch-action-none">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <StatCard 
                    icon={<DollarSign size={20} className="text-lime-300" />} 
                    label={t('inventory_total_value')} 
                    value={formatCurrency(inventoryValue)} 
                    colorClass="bg-lime-500/20"
                    isEditMode={isEditMode}
                    centered={true}
                  />
                </div>
              </div>
            </ResponsiveGridLayout>
          )}
        </div>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
  </div>

      {showInfoParam && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInfoParam(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400">
                  <Info size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">{PARAM_INFO[showInfoParam].title}</h3>
              </div>
              <button 
                onClick={() => setShowInfoParam(null)}
                className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} className="text-white/40" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-black">{t('dashboard_info_what_is')}</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  {PARAM_INFO[showInfoParam].description}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">{t('dashboard_info_how_to_measure')}</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  {PARAM_INFO[showInfoParam].howToMeasure}
                </p>
              </div>

              <button
                onClick={() => setShowInfoParam(null)}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors mt-4"
              >
                {t('close')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {editingParam && (
          <LogTestModal 
            parameter={editingParam}
            testLogs={testLogs}
            onClose={() => setEditingParam(null)} 
            onLogTest={onLogTest} 
            onDeleteLog={handleDeleteTestLog}
            onResetHistory={onResetHistory}
            onMaintenanceAction={onMaintenanceAction}
            tank={currentTank}
            accessories={accessories}
            validationResult={validationResult}
          />
        )}

      {showInhabitantsModal && (
        <InhabitantsModal 
          inhabitants={inhabitants}
          onUpdate={onUpdateInhabitants}
          onClose={() => setShowInhabitantsModal(false)}
          latestLog={latestLog}
        />
      )}

      {showRemindersModal && (
          <RemindersModal 
            tank={currentTank}
            reminders={reminders}
            onUpdate={onUpdateReminders}
            onMaintenanceAction={onMaintenanceAction}
            onClose={() => {
              setShowRemindersModal(false);
              setRemindersFilter('all');
            }}
            initialFilter={remindersFilter}
            accessories={accessories}
            validationResult={validationResult}
          />
      )}

      {showAccessoriesModal && (
        <AccessoriesModal 
          accessories={accessories}
          onUpdate={onUpdateAccessories}
          onClose={() => setShowAccessoriesModal(false)}
          tankVolume={tankVolume}
        />
      )}

      {showWaterChemistryModal && (
        <WaterChemistryModal 
          testLogs={tankLogs}
          onLogTest={onLogTest}
          onDeleteLog={handleDeleteTestLog}
          onResetHistory={onResetHistory}
          onClose={() => setShowWaterChemistryModal(false)}
          tank={currentTank}
          accessories={accessories}
          inhabitants={inhabitants}
        />
      )}

      <AnimatePresence>
        {showValidationModal && validationResult && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowValidationModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="text-indigo-400" />
                  {t('validation_report_modal_title')}
                </h2>
                <button onClick={() => setShowValidationModal(false)} className="text-white/40 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <ValidationReport 
                  result={validationResult} 
                  testLogs={testLogs} 
                  healthScore={healthScore} 
                  tank={currentTank}
                  accessories={accessories}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
