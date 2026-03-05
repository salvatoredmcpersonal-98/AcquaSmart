import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Droplets, Thermometer, TestTube2, GripVertical, Fish, Leaf } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import usePersistentState from '../hooks/usePersistentState';
import { useElementWidth } from '../hooks/useElementWidth';
import LogTestModal from './LogTestModal';
import InhabitantsModal from './InhabitantsModal';
import HistoryChart from './HistoryChart';
import { Responsive } from 'react-grid-layout';

const StatCard = ({ icon, label, value, colorClass, onClick = undefined, isEditMode, centered = false }) => {
  const interactiveClasses = (onClick && !isEditMode) ? "cursor-pointer hover:bg-white/10 transition-colors duration-200" : "";

  const content = (
    <div className={`flex flex-col h-full ${centered ? 'items-center justify-center text-center' : 'justify-between text-left'}`}>
      <div className={`flex ${centered ? 'flex-col items-center gap-1' : 'items-center gap-2 lg:gap-3'}`}>
        <div className={`${centered ? 'w-10 h-10 sm:w-12 sm:h-12 mb-1' : 'w-8 h-8 lg:w-10 lg:h-10'} rounded-full flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
        <span className="text-white/60 text-[11px] sm:text-xs lg:text-sm font-medium">{label}</span>
      </div>
      <p className={`${centered ? 'text-2xl sm:text-3xl lg:text-4xl mt-1' : 'text-xl sm:text-2xl lg:text-3xl'} font-bold text-white`}>{value}</p>
    </div>
  );

  if (onClick) {
    return (
      <div 
        role="button"
        tabIndex={0}
        onClick={(e) => {
          if (isEditMode) return;
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (isEditMode) return;
            e.preventDefault();
            onClick();
          }
        }}
        className={`w-full h-full p-3 lg:p-4 flex flex-col outline-none z-10 ${interactiveClasses} ${isEditMode ? 'cursor-default' : 'cursor-pointer'}`}
      >
        {content}
      </div>
    );
  }

  return (
    <div className="w-full h-full p-3 lg:p-4 flex flex-col">
      {content}
    </div>
  );
};

export default function Dashboard({ testLogs, onLogTest, handleDeleteTestLog, onResetHistory, inhabitants, onUpdateInhabitants }) {
  const { t } = useTranslation();
  const { formatCurrency, formatTemperature } = useLocale();
  const [editingParam, setEditingParam] = useState(null);
  const [showInhabitantsModal, setShowInhabitantsModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const gridRef = useRef(null);
  const gridWidth = useElementWidth(gridRef);

  const defaultLayouts = {
    lg: [
      { i: 'health', x: 0, y: 0, w: 12, h: 3, minW: 4, minH: 3 },
      { i: 'inventory', x: 0, y: 3, w: 6, h: 1, minW: 2, minH: 1 },
      { i: 'nitrates', x: 6, y: 3, w: 6, h: 1, minW: 2, minH: 1 },
      { i: 'temp', x: 0, y: 4, w: 6, h: 1, minW: 2, minH: 1 },
      { i: 'ph', x: 6, y: 4, w: 6, h: 1, minW: 2, minH: 1 },
      { i: 'inhabitants', x: 0, y: 5, w: 12, h: 2, minW: 4, minH: 2 },
      { i: 'chart', x: 0, y: 7, w: 12, h: 3, minW: 4, minH: 2 },
    ],
    md: [
      { i: 'health', x: 0, y: 0, w: 12, h: 3, minW: 4, minH: 2 },
      { i: 'inventory', x: 0, y: 3, w: 6, h: 1, minW: 3, minH: 1 },
      { i: 'nitrates', x: 6, y: 3, w: 6, h: 1, minW: 3, minH: 1 },
      { i: 'temp', x: 0, y: 4, w: 6, h: 1, minW: 3, minH: 1 },
      { i: 'ph', x: 6, y: 4, w: 6, h: 1, minW: 3, minH: 1 },
      { i: 'inhabitants', x: 0, y: 5, w: 12, h: 2, minW: 4, minH: 2 },
      { i: 'chart', x: 0, y: 7, w: 12, h: 2, minW: 4, minH: 2 },
    ],
    sm: [
      { i: 'health', x: 0, y: 0, w: 6, h: 3, minW: 6, minH: 3 },
      { i: 'inventory', x: 0, y: 3, w: 3, h: 1, minW: 3, minH: 1 },
      { i: 'nitrates', x: 3, y: 3, w: 3, h: 1, minW: 3, minH: 1 },
      { i: 'temp', x: 0, y: 4, w: 3, h: 1, minW: 3, minH: 1 },
      { i: 'ph', x: 3, y: 4, w: 3, h: 1, minW: 3, minH: 1 },
      { i: 'inhabitants', x: 0, y: 5, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'chart', x: 0, y: 7, w: 6, h: 2, minW: 4, minH: 2 },
    ],
    xs: [
      { i: 'health', x: 0, y: 0, w: 6, h: 3, minW: 6, minH: 3 },
      { i: 'inventory', x: 0, y: 3, w: 3, h: 1, minW: 3, minH: 1 },
      { i: 'nitrates', x: 3, y: 3, w: 3, h: 1, minW: 3, minH: 1 },
      { i: 'temp', x: 0, y: 4, w: 3, h: 1, minW: 3, minH: 1 },
      { i: 'ph', x: 3, y: 4, w: 3, h: 1, minW: 3, minH: 1 },
      { i: 'inhabitants', x: 0, y: 5, w: 6, h: 2, minW: 4, minH: 2 },
      { i: 'chart', x: 0, y: 7, w: 6, h: 2, minW: 4, minH: 2 },
    ],
    xxs: [
      { i: 'health', x: 0, y: 0, w: 6, h: 3, minW: 6, minH: 3 },
      { i: 'inventory', x: 0, y: 3, w: 6, h: 1, minW: 6, minH: 1 },
      { i: 'nitrates', x: 0, y: 4, w: 6, h: 1, minW: 6, minH: 1 },
      { i: 'temp', x: 0, y: 5, w: 6, h: 1, minW: 6, minH: 1 },
      { i: 'ph', x: 0, y: 6, w: 6, h: 1, minW: 6, minH: 1 },
      { i: 'inhabitants', x: 0, y: 7, w: 6, h: 2, minW: 6, minH: 2 },
      { i: 'chart', x: 0, y: 9, w: 6, h: 3, minW: 6, minH: 2 },
    ]
  };

  const [layouts, setLayouts] = usePersistentState('dashboardLayouts_v5', defaultLayouts);

  const onLayoutChange = (layout: any, newLayouts: any) => {
    setLayouts(newLayouts);
  };

  const latestLog = testLogs?.[0] || {};
  const inventoryValue = 148.50; // Mock data

  const ResponsiveGridLayout = Responsive as any;

  const handleLongPress = (e?: any) => {
    if (!isEditMode) {
      if (e && e.stopPropagation) e.stopPropagation();
      if (e && e.preventDefault) e.preventDefault();
      setIsEditMode(true);
      if (navigator.vibrate) {
        navigator.vibrate(60);
      }
    }
  };

  // Helper for items that aren't StatCards (Health and Chart)
  const useLongPressLogic = () => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    const start = (e: any) => {
      if (isEditMode) return;
      // We don't preventDefault here yet to allow normal clicks
      timerRef.current = setTimeout(() => {
        handleLongPress(e);
      }, 800);
    };
    
    const stop = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    
    return {
      onPointerDown: start,
      onPointerUp: stop,
      onPointerLeave: stop,
      onPointerCancel: stop
    };
  };

  const healthLongPress = useLongPressLogic();
  const chartLongPress = useLongPressLogic();
  const tempLongPress = useLongPressLogic();
  const phLongPress = useLongPressLogic();
  const nitratesLongPress = useLongPressLogic();
  const inventoryLongPress = useLongPressLogic();
  const inhabitantsLongPress = useLongPressLogic();

  return (
    <>
      <div className="p-6 text-white animate-fade-in">
        <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold">{t('dashboard_title')}</h1>
          {isEditMode && (
            <button 
              onClick={() => setIsEditMode(false)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-500/20 transition-all animate-bounce-in z-50 active:scale-95"
            >
              {t('common_save') || 'Fine'}
            </button>
          )}
        </div>
        
        <div ref={gridRef}>
          {gridWidth > 0 && (
            <ResponsiveGridLayout 
              className="layout"
              layouts={layouts}
              onLayoutChange={onLayoutChange}
              breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
              cols={{lg: 12, md: 12, sm: 6, xs: 6, xxs: 6}}
              rowHeight={90}
              width={gridWidth}
              draggableHandle=".drag-handle"
              draggableCancel="button"
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
              <div key="health" 
                className={`bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center min-w-[150px] relative group overflow-hidden transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10' : ''}`}
                {...healthLongPress}
              >
                {isEditMode && (
                  <div className="drag-handle absolute top-0 right-0 p-3 opacity-100 cursor-grab active:cursor-grabbing text-emerald-400 z-30 touch-action-none">
                    <GripVertical size={20} />
                  </div>
                )}
                <p className="text-xs sm:text-sm md:text-base text-white/60 mb-2">{t('dashboard_health_score')}</p>
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 border-emerald-400 flex items-center justify-center my-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-400">92</span>
                </div>
                <p className="text-[11px] sm:text-xs md:text-sm text-white/50 mt-2">Ottimo stato</p>
              </div>
              
              <div key="temp" 
                className={`bg-white/5 border border-white/10 rounded-2xl relative group overflow-hidden transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10' : ''}`}
                {...tempLongPress}
              >
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
                />
              </div>

              <div key="ph" 
                className={`bg-white/5 border border-white/10 rounded-2xl relative group overflow-hidden transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10' : ''}`}
                {...phLongPress}
              >
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
                />
              </div>

              <div key="nitrates" 
                className={`bg-white/5 border border-white/10 rounded-2xl relative group overflow-hidden transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10' : ''}`}
                {...nitratesLongPress}
              >
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
                />
              </div>

              <div key="inventory" 
                className={`bg-white/5 border border-white/10 rounded-2xl relative group overflow-hidden transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10' : ''}`}
                {...inventoryLongPress}
              >
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
                />
              </div>

              <div key="inhabitants" 
                className={`bg-white/5 border border-white/10 rounded-2xl relative group overflow-hidden transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10' : ''}`}
                {...inhabitantsLongPress}
              >
                {isEditMode && (
                  <div className="drag-handle absolute top-0 right-0 p-3 opacity-100 cursor-grab active:cursor-grabbing text-emerald-400 z-30 touch-action-none">
                    <GripVertical size={20} />
                  </div>
                )}
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => !isEditMode && setShowInhabitantsModal(true)}
                  className={`w-full h-full p-4 flex items-center justify-around ${!isEditMode ? 'cursor-pointer hover:bg-white/10' : ''} transition-colors duration-200`}
                >
                  {/* Plants Section */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                      <Leaf size={24} className="text-emerald-400" />
                    </div>
                    <span className="text-white/60 text-xs font-medium uppercase tracking-wider">{t('inhabitants_plants') || 'Piante'}</span>
                    <p className="text-3xl font-bold text-white mt-1">
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
                    <p className="text-3xl font-bold text-white mt-1">
                      {inhabitants.fish.reduce((acc, f) => acc + (f.quantity || 1), 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div key="chart" 
                className={`bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4 flex flex-col min-w-[150px] relative group overflow-hidden transition-all duration-200 ${isEditMode ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10' : ''}`}
                {...chartLongPress}
              >
                 {isEditMode && (
                  <div className="drag-handle absolute top-0 right-0 p-3 opacity-100 cursor-grab active:cursor-grabbing text-emerald-400 z-30 touch-action-none">
                    <GripVertical size={20} />
                  </div>
                 )}
                 <h2 className="text-lg md:text-xl font-bold mb-2 text-white/90 px-2 pt-1">{t('chart_title')}</h2>
                 <div className="flex-grow w-full h-full">
                    <HistoryChart data={testLogs} />
                 </div>
              </div>
            </ResponsiveGridLayout>
          )}
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
    </>
  );
}
