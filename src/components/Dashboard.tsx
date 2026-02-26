import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Droplets, Thermometer, TestTube2 } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import usePersistentState from '../hooks/usePersistentState';
import { useElementWidth } from '../hooks/useElementWidth';
import LogTestModal from './LogTestModal';
import HistoryChart from './HistoryChart';
import { Responsive } from 'react-grid-layout';

const StatCard = ({ icon, label, value, colorClass, onClick }) => {
  const commonClasses = "bg-white/5 border border-white/10 rounded-2xl p-3 lg:p-4 w-full h-full flex flex-col text-left justify-between min-w-[150px]";
  const interactiveClasses = "hover:bg-white/10 transition-colors duration-200";

  const content = (
    <>
      <div className="flex items-center gap-2 lg:gap-3">
        <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
        <span className="text-white/60 text-[11px] sm:text-xs lg:text-sm">{label}</span>
      </div>
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{value}</p>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={`${commonClasses} ${interactiveClasses} interactive-stat-card`}>
        {content}
      </button>
    );
  }

  return (
    <div className={commonClasses}>
      {content}
    </div>
  );
};

export default function Dashboard({ testLogs, onLogTest, handleDeleteTestLog, onResetHistory }) {
  const { t } = useTranslation();
  const { formatCurrency, formatTemperature } = useLocale();
  const [editingParam, setEditingParam] = useState(null);
  const gridRef = useRef(null);
  const gridWidth = useElementWidth(gridRef);

  const defaultLayouts = {
    lg: [
      { i: 'temp', x: 0, y: 0, w: 3, h: 1, minW: 2, minH: 1, static: false },
      { i: 'ph', x: 3, y: 0, w: 3, h: 1, minW: 2, minH: 1, static: false },
      { i: 'nitrates', x: 6, y: 0, w: 3, h: 1, minW: 2, minH: 1, static: false },
      { i: 'inventory', x: 9, y: 0, w: 3, h: 1, minW: 2, minH: 1, static: false },
      { i: 'health', x: 0, y: 1, w: 6, h: 3, minW: 4, minH: 3, static: false },
      { i: 'chart', x: 6, y: 1, w: 6, h: 3, minW: 4, minH: 2, static: false },
    ],
    md: [
      { i: 'temp', x: 0, y: 0, w: 4, h: 1, minW: 3, minH: 1, static: false },
      { i: 'ph', x: 4, y: 0, w: 4, h: 1, minW: 3, minH: 1, static: false },
      { i: 'nitrates', x: 8, y: 0, w: 4, h: 1, minW: 3, minH: 1, static: false },
      { i: 'inventory', x: 0, y: 1, w: 4, h: 1, minW: 3, minH: 1, static: false },
      { i: 'health', x: 4, y: 1, w: 8, h: 2, minW: 4, minH: 2, static: false },
      { i: 'chart', x: 0, y: 2, w: 12, h: 2, minW: 4, minH: 2, static: false },
    ],
    sm: [
      { i: 'temp', x: 0, y: 0, w: 3, h: 1, minW: 3, minH: 1, static: false },
      { i: 'ph', x: 3, y: 0, w: 3, h: 1, minW: 3, minH: 1, static: false },
      { i: 'nitrates', x: 0, y: 1, w: 3, h: 1, minW: 3, minH: 1, static: false },
      { i: 'inventory', x: 3, y: 1, w: 3, h: 1, minW: 3, minH: 1, static: false },
      { i: 'health', x: 0, y: 2, w: 6, h: 3, minW: 6, minH: 3, static: false },
      { i: 'chart', x: 0, y: 5, w: 6, h: 2, minW: 4, minH: 2, static: false },
    ]
  };

  const [layouts, setLayouts] = usePersistentState('dashboardLayouts', defaultLayouts);

  const onLayoutChange = (layout, newLayouts) => {
    setLayouts(newLayouts);
  };

  const latestLog = testLogs?.[0] || {};
  const inventoryValue = 148.50; // Mock data

  return (
    <>
      <div className="p-6 text-white animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t('dashboard_title')}</h1>
        </div>
        
        <div ref={gridRef}>
          {gridWidth > 0 && (
            <Responsive 
              className="layout"
              layouts={layouts}
              onLayoutChange={onLayoutChange}
              breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
              cols={{lg: 12, md: 12, sm: 6, xs: 6, xxs: 6}}
              rowHeight={90}
              width={gridWidth}
              compactType="horizontal"
              preventCollision={true}
            >
              <div key="health" className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center min-w-[150px]">
                <p className="text-xs sm:text-sm md:text-base text-white/60 mb-2">{t('dashboard_health_score')}</p>
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 border-emerald-400 flex items-center justify-center my-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-400">92</span>
                </div>
                <p className="text-[11px] sm:text-xs md:text-sm text-white/50 mt-2">Ottimo stato</p>
              </div>
              <div key="temp">
                 <StatCard icon={<Thermometer size={20} className="text-red-300" />} label={t('log_test_temp')} value={latestLog.temp ? formatTemperature(latestLog.temp) : '--'} colorClass="bg-red-500/20" onClick={() => setEditingParam('temp')} />
              </div>
              <div key="ph">
                <StatCard icon={<TestTube2 size={20} className="text-sky-300" />} label="pH" value={latestLog.ph || '--'} colorClass="bg-sky-500/20" onClick={() => setEditingParam('ph')} />
              </div>
              <div key="nitrates">
                <StatCard icon={<Droplets size={20} className="text-amber-300" />} label={t('log_test_nitrates')} value={latestLog.nitrates ? `${latestLog.nitrates} mg/L` : '--'} colorClass="bg-amber-500/20" onClick={() => setEditingParam('nitrates')} />
              </div>
              <div key="inventory">
                <StatCard icon={<DollarSign size={20} className="text-lime-300" />} label={t('inventory_total_value')} value={formatCurrency(inventoryValue)} colorClass="bg-lime-500/20" />
              </div>
              <div key="chart" className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4 flex flex-col min-w-[150px]">
                 <h2 className="text-lg md:text-xl font-bold mb-2 text-white/90 px-2 pt-1">{t('chart_title')}</h2>
                 <div className="flex-grow w-full h-full">
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
