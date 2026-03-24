import { useState, useRef, useMemo, useEffect, useLayoutEffect, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Droplets, Thermometer, TestTube2, GripVertical, Fish, Leaf, Bell, AlertCircle, Lamp, Box, ShieldCheck, CheckCircle2, LayoutGrid, Plus, Activity } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import usePersistentState from '../hooks/usePersistentState';
import { useElementWidth } from '../hooks/useElementWidth';
import useLongPress from '../hooks/useLongPress';
import LogTestModal from './LogTestModal';
import InhabitantsModal from './InhabitantsModal';
import RemindersModal from './RemindersModal';
import AccessoriesModal from './AccessoriesModal';
import ValidationReport from './ValidationReport';
import HistoryChart from './HistoryChart';
import { Responsive } from 'react-grid-layout';
import { validateSetup, calculateHealthScore } from '../services/validationService';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { X } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: string | number | React.ReactNode;
  colorClass: string;
  onClick?: () => void;
  isEditMode: boolean;
  centered?: boolean;
}

const StatCard = memo(({ icon, label, value, colorClass, onClick = undefined, isEditMode, centered = false }: StatCardProps) => {
  const interactiveClasses = onClick ? "cursor-pointer hover:bg-white/10 transition-colors duration-200" : "";

  const content = (
    <div className={`flex flex-col h-full ${centered ? 'items-center justify-center text-center' : 'justify-between text-left'}`}>
      <div className={`flex ${centered ? 'flex-col items-center gap-1' : 'items-center gap-3'}`}>
        <div className={`${centered ? 'w-10 h-10 sm:w-12 sm:h-12 mb-1' : 'w-10 h-10 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center ${colorClass} shrink-0`}>
          {icon}
        </div>
        <span className="text-white/70 text-xs sm:text-sm lg:text-base font-semibold tracking-wide truncate">{label}</span>
      </div>
      <p className={`${centered ? 'text-xl sm:text-2xl lg:text-4xl mt-1' : 'text-xl sm:text-2xl lg:text-4xl'} font-bold text-white tracking-tight whitespace-nowrap overflow-hidden text-ellipsis`}>{value}</p>
    </div>
  );

  if (onClick) {
    return (
      <motion.button 
        type="button"
        onTap={(e) => {
          onClick();
        }}
        className={`w-full h-full p-3 lg:p-4 flex flex-col outline-none border-none bg-transparent text-left appearance-none select-none z-10 ${interactiveClasses}`}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <div className="w-full h-full p-3 lg:p-4 flex flex-col">
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
  onShowPaywall
}) {
  const { t } = useTranslation();
  const { formatCurrency, formatTemperature } = useLocale();
  const [showTankSelector, setShowTankSelector] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const [showInhabitantsModal, setShowInhabitantsModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [remindersFilter, setRemindersFilter] = useState<'all' | 'overdue'>('all');
  const [showAccessoriesModal, setShowAccessoriesModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (showRemindersInitial) {
      setRemindersFilter('overdue');
      setShowRemindersModal(true);
      onCloseRemindersInitial();
    }
  }, [showRemindersInitial, onCloseRemindersInitial]);

  const currentTank = tanks[currentTankIndex] || tanks[0];
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
      { i: 'temp', x: 0, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
      { i: 'ph', x: 4, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
      { i: 'nitrates', x: 8, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
      { i: 'kh', x: 0, y: 4, w: 4, h: 2, minW: 2, minH: 2 },
      { i: 'inhabitants', x: 4, y: 4, w: 8, h: 2, minW: 4, minH: 2 },
      { i: 'accessories', x: 0, y: 6, w: 6, h: 2, minW: 3, minH: 2 },
      { i: 'inventory', x: 6, y: 6, w: 6, h: 2, minW: 3, minH: 2 },
    ],
    md: [
      { i: 'reminders', x: 0, y: 0, w: 12, h: 2, minW: 4, minH: 2 },
      { i: 'temp', x: 0, y: 2, w: 6, h: 2, minW: 3, minH: 2 },
      { i: 'ph', x: 6, y: 2, w: 6, h: 2, minW: 3, minH: 2 },
      { i: 'nitrates', x: 0, y: 4, w: 6, h: 2, minW: 3, minH: 2 },
      { i: 'kh', x: 6, y: 4, w: 6, h: 2, minW: 3, minH: 2 },
      { i: 'inhabitants', x: 0, y: 6, w: 12, h: 2, minW: 4, minH: 2 },
      { i: 'accessories', x: 0, y: 8, w: 6, h: 2, minW: 3, minH: 2 },
      { i: 'inventory', x: 6, y: 8, w: 6, h: 2, minW: 3, minH: 2 },
    ],
    sm: [
      { i: 'reminders', x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'temp', x: 0, y: 2, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'ph', x: 0, y: 4, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'nitrates', x: 0, y: 6, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'kh', x: 0, y: 8, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'inhabitants', x: 0, y: 10, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'accessories', x: 0, y: 12, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'inventory', x: 0, y: 14, w: 6, h: 2, minW: 4, minH: 2 },
    ],
    xs: [
      { i: 'reminders', x: 0, y: 0, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'temp', x: 0, y: 2, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'ph', x: 0, y: 4, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'nitrates', x: 0, y: 6, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'kh', x: 0, y: 8, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'inhabitants', x: 0, y: 10, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'accessories', x: 0, y: 12, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'inventory', x: 0, y: 14, w: 6, h: 2, minW: 6, minH: 2 },
    ],
    xxs: [
      { i: 'reminders', x: 0, y: 0, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'temp', x: 0, y: 2, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'ph', x: 0, y: 4, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'nitrates', x: 0, y: 6, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'kh', x: 0, y: 8, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'inhabitants', x: 0, y: 10, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'accessories', x: 0, y: 12, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'inventory', x: 0, y: 14, w: 6, h: 2, minW: 6, minH: 2 },
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

  const latestLog = testLogs?.[0] || {};
  
  const validationResult = useMemo(() => {
    if (!currentTank) return null;
    return validateSetup(
      currentTank,
      accessories,
      inhabitants,
      {
        ph: latestLog.ph || 7,
        kh: latestLog.kh || 6,
        temp: latestLog.temp || 25,
        gh: 10,
        nitrates: latestLog.nitrates || 0
      }
    );
  }, [currentTank, accessories, inhabitants, latestLog]);

  const healthScore = useMemo(() => {
    if (!validationResult) return { 
      score: 100, 
      status: 'OTTIMO' as const, 
      color: '#00FF00', 
      riskFactors: [],
      quickAdvice: "L'ecosistema è in equilibrio. Continua con la manutenzione regolare."
    };
    return calculateHealthScore(
      testLogs, 
      reminders, 
      validationResult, 
      {
        ...inhabitants,
        waterParams: {
          ph: latestLog.ph || 7,
          kh: latestLog.kh || 6,
          temp: latestLog.temp || 25,
          gh: 10,
          nitrates: latestLog.nitrates || 0
        }
      }
    );
  }, [testLogs, reminders, validationResult, inhabitants, latestLog]);

  const inventoryValue = useMemo(() => {
    const fishValue = inhabitants.fish.reduce((acc, f) => acc + (f.price * (f.quantity || 1)), 0);
    const plantsValue = inhabitants.plants.reduce((acc, p) => acc + (p.price * (p.quantity || 1)), 0);
    const accessoriesValue = accessories.reduce((acc, a) => acc + a.price, 0);
    return fishValue + plantsValue + accessoriesValue;
  }, [inhabitants, accessories]);

  const ResponsiveGridLayout = Responsive as any;

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
  const tempLongPress = useLongPress(() => handleLongPress());
  const phLongPress = useLongPress(() => handleLongPress());
  const nitratesLongPress = useLongPress(() => handleLongPress());
  const khLongPress = useLongPress(() => handleLongPress());
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
                  aggiungi acquario
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
                className="flex items-center group"
              >
                <h1 className="text-xl sm:text-2xl font-medium text-white/60 uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                  {currentTank?.name}
                </h1>
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
                          <span className="font-bold uppercase tracking-wider text-xs">Nuovo Acquario</span>
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
                  title="Analisi Setup"
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
                    label="Promemoria" 
                    value={mostUrgentReminder ? (
                      <span className="flex flex-col items-center">
                        <span className="truncate leading-tight">{mostUrgentReminder.task}</span>
                        <span className="text-[10px] sm:text-xs opacity-50 font-medium mt-0.5">
                          Scade: {new Date(mostUrgentReminder.nextDue).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </span>
                      </span>
                    ) : 'Nessuno'} 
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

              <div key="temp" 
                className={`relative group touch-pan-y ${isEditMode ? 'z-30 touch-none' : ''}`}
                {...tempLongPress}
              >
                <div className={`w-full h-full bg-white/5 border border-white/10 rounded-2xl transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02] animate-wiggle bg-white/10' : ''}`}>
                  {isEditMode && (
                    <div className="drag-handle absolute top-0 right-0 p-3 opacity-100 cursor-grab active:cursor-grabbing text-emerald-400 z-30 touch-action-none">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <StatCard 
                    icon={<Thermometer size={20} className="text-red-300" />} 
                    label={t('log_test_temp')} 
                    value={latestLog.temp ? formatTemperature(latestLog.temp) : '--'} 
                    colorClass="bg-red-500/20" 
                    onClick={() => setEditingParam('temp')}
                    isEditMode={isEditMode}
                    centered={true}
                  />
                </div>
              </div>

              <div key="ph" 
                className={`relative group touch-pan-y ${isEditMode ? 'z-30 touch-none' : ''}`}
                {...phLongPress}
              >
                <div className={`w-full h-full bg-white/5 border border-white/10 rounded-2xl transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02] animate-wiggle bg-white/10' : ''}`}>
                  {isEditMode && (
                    <div className="drag-handle absolute top-0 right-0 p-3 opacity-100 cursor-grab active:cursor-grabbing text-emerald-400 z-30 touch-action-none">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <StatCard 
                    icon={<TestTube2 size={20} className="text-sky-300" />} 
                    label="pH" 
                    value={latestLog.ph || '--'} 
                    colorClass="bg-sky-500/20" 
                    onClick={() => setEditingParam('ph')}
                    isEditMode={isEditMode}
                    centered={true}
                  />
                </div>
              </div>

              <div key="nitrates" 
                className={`relative group touch-pan-y ${isEditMode ? 'z-30 touch-none' : ''}`}
                {...nitratesLongPress}
              >
                <div className={`w-full h-full bg-white/5 border border-white/10 rounded-2xl transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02] animate-wiggle bg-white/10' : ''}`}>
                  {isEditMode && (
                    <div className="drag-handle absolute top-0 right-0 p-3 opacity-100 cursor-grab active:cursor-grabbing text-emerald-400 z-30 touch-action-none">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <StatCard 
                    icon={<Droplets size={20} className="text-amber-300" />} 
                    label={t('log_test_nitrates')} 
                    value={latestLog.nitrates ? `${latestLog.nitrates} mg/L` : '--'} 
                    colorClass="bg-amber-500/20" 
                    onClick={() => setEditingParam('nitrates')}
                    isEditMode={isEditMode}
                    centered={true}
                  />
                </div>
              </div>

              <div key="kh" 
                className={`relative group touch-pan-y ${isEditMode ? 'z-30 touch-none' : ''}`}
                {...khLongPress}
              >
                <div className={`w-full h-full bg-white/5 border border-white/10 rounded-2xl transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02] animate-wiggle bg-white/10' : ''}`}>
                  {isEditMode && (
                    <div className="drag-handle absolute top-0 right-0 p-3 opacity-100 cursor-grab active:cursor-grabbing text-emerald-400 z-30 touch-action-none">
                      <GripVertical size={20} />
                    </div>
                  )}
                  <StatCard 
                    icon={<Droplets size={20} className="text-indigo-300" />} 
                    label={t('log_test_kh')} 
                    value={latestLog.kh ? `${latestLog.kh} °dKH` : '--'} 
                    colorClass="bg-indigo-500/20" 
                    onClick={() => setEditingParam('kh')}
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
                      <span className="text-white/60 text-xs font-medium uppercase tracking-wider">{t('inhabitants_plants') || 'Piante'}</span>
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
                      <span className="text-white/60 text-xs font-medium uppercase tracking-wider">{t('inhabitants_fish') || 'Pesci'}</span>
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
                      <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Allestimento</span>
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
                    label="Accessori" 
                    value={accessories.length > 0 ? `${accessories.length} Elementi` : 'Nessuno'} 
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

    {editingParam && (
        <LogTestModal 
          parameter={editingParam}
          testLogs={testLogs}
          onClose={() => setEditingParam(null)} 
          onLogTest={onLogTest} 
          onDeleteLog={handleDeleteTestLog}
          onResetHistory={onResetHistory}
        />
      )}

      {showInhabitantsModal && (
        <InhabitantsModal 
          inhabitants={inhabitants}
          onUpdate={onUpdateInhabitants}
          onClose={() => setShowInhabitantsModal(false)}
        />
      )}

      {showRemindersModal && (
        <RemindersModal 
          reminders={reminders}
          onUpdate={onUpdateReminders}
          onClose={() => {
            setShowRemindersModal(false);
            setRemindersFilter('all');
          }}
          initialFilter={remindersFilter}
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
                  Report Validazione Biologica
                </h2>
                <button onClick={() => setShowValidationModal(false)} className="text-white/40 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <ValidationReport result={validationResult} testLogs={testLogs} healthScore={healthScore} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
