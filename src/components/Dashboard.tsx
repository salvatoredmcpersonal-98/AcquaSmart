import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Droplets, Thermometer, TestTube2, Check } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import usePersistentState from '../hooks/usePersistentState';
import { useElementWidth } from '../hooks/useElementWidth';
import LogTestModal from './LogTestModal';
import HistoryChart from './HistoryChart';
import { Responsive } from 'react-grid-layout';

// Interfaccia semplificata per StatCard
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass?: string;
  onClick?: () => void;
  isEditMode?: boolean;
}

function StatCard({ icon, label, value, colorClass, onClick, isEditMode }: StatCardProps) {
  return (
    <div
      className={`stat-card relative bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center h-full ${colorClass || ''} ${isEditMode ? 'edit-mode-active' : ''}`}
      onClick={onClick}
    >
      {icon && <div className="mb-2">{icon}</div>}
      <p className="text-xs text-white/60 mb-2 stat-label">{label}</p>
      <span className="text-3xl font-bold text-white stat-value">{value}</span>
    </div>
  );
}

export function Dashboard({ testLogs, onLogTest, handleDeleteTestLog, onResetHistory }: any) {
  const { t } = useTranslation();
  const { formatCurrency, formatTemperature } = useLocale();
  const [editingParam, setEditingParam] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false); // Stato per il layout
  const gridRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<any>(null);
  const gridWidth = useElementWidth(gridRef);

  // Gestione Long Press per attivare lo spostamento
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // non chiamare preventDefault qui
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    // idem
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const defaultLayouts = {
    lg: [
      { i: 'temp', x: 0, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
      { i: 'ph', x: 3, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
      { i: 'nitrates', x: 6, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
      { i: 'inventory', x: 9, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
      { i: 'health', x: 0, y: 1, w: 6, h: 3, minW: 4, minH: 3 },
      { i: 'chart', x: 6, y: 1, w: 6, h: 3, minW: 4, minH: 2 },
    ],
    md: [
      { i: 'temp', x: 0, y: 0, w: 4, h: 1 },
      { i: 'ph', x: 4, y: 0, w: 4, h: 1 },
      { i: 'nitrates', x: 8, y: 0, w: 4, h: 1 },
      { i: 'inventory', x: 0, y: 1, w: 4, h: 1 },
      { i: 'health', x: 4, y: 1, w: 8, h: 2 },
      { i: 'chart', x: 0, y: 2, w: 12, h: 2 },
    ],
    sm: [
      { i: 'temp', x: 0, y: 0, w: 3, h: 1 },
      { i: 'ph', x: 3, y: 0, w: 3, h: 1 },
      { i: 'nitrates', x: 0, y: 1, w: 3, h: 1 },
      { i: 'inventory', x: 3, y: 1, w: 3, h: 1 },
      { i: 'health', x: 0, y: 2, w: 6, h: 3 },
      { i: 'chart', x: 0, y: 5, w: 6, h: 2 },
    ]
  };

  const [layouts, setLayouts] = usePersistentState('dashboardLayouts', defaultLayouts);

  const latestLog = testLogs?.[0] || {};
  const inventoryValue = 148.50;

  return (
    <>
      <div 
        className="p-6 text-white animate-fade-in"
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t('dashboard_title')}</h1>
          {editMode && (
            <button 
              onClick={() => setEditMode(false)}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce"
            >
              <Check size={16} /> {t('save_layout', 'Fatto')}
            </button>
          )}
        </div>
        
        <div ref={gridRef}>
          {gridWidth > 0 && (
            <Responsive 
              className="layout"
              layouts={layouts as any}
              onLayoutChange={(l, all) => setLayouts(all as any)}
              breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
              cols={{lg: 12, md: 12, sm: 6, xs: 6, xxs: 6}}
              rowHeight={90}
              width={gridWidth}
              // Queste prop usano il trucco {...} per evitare errori TS
              {...({
                isDraggable: editMode,
                isResizable: editMode
              } as any)}
              draggableCancel=".nodrag"
            >
              <div key="health">
                <div className={`bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center h-full ${editMode ? 'edit-mode-active' : ''}`}>
                  <p className="text-xs text-white/60 mb-2">{t('dashboard_health_score')}</p>
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-400 flex items-center justify-center">
                    <span className="text-3xl font-bold text-emerald-400">92</span>
                  </div>
                </div>
              </div>

              <div key="temp">
                 <StatCard isEditMode={editMode} icon={<Thermometer size={20} className="text-red-300" />} label={t('log_test_temp')} value={latestLog.temp ? formatTemperature(latestLog.temp) : '--'} colorClass="bg-red-500/20" onClick={() => setEditingParam('temp')} />
              </div>

              <div key="ph">
                <StatCard isEditMode={editMode} icon={<TestTube2 size={20} className="text-sky-300" />} label="pH" value={latestLog.ph || '--'} colorClass="bg-sky-500/20" onClick={() => setEditingParam('ph')} />
              </div>

              <div key="nitrates">
                <StatCard isEditMode={editMode} icon={<Droplets size={20} className="text-amber-300" />} label={t('log_test_nitrates')} value={latestLog.nitrates ? `${latestLog.nitrates} mg/L` : '--'} colorClass="bg-amber-500/20" onClick={() => setEditingParam('nitrates')} />
              </div>

              <div key="inventory">
                <StatCard isEditMode={editMode} icon={<DollarSign size={20} className="text-lime-300" />} label={t('inventory_total_value')} value={formatCurrency(inventoryValue)} colorClass="bg-lime-500/20" />
              </div>

              <div key="chart" className={`bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4 flex flex-col h-full ${editMode ? 'edit-mode-active' : ''}`}>
                 <h2 className="text-lg font-bold mb-2 text-white/90">{t('chart_title')}</h2>
                 <div className="flex-grow w-full h-full nodrag">
                    <HistoryChart data={testLogs} />
                 </div>
              </div>
            </Responsive>
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
    </>
  );
}