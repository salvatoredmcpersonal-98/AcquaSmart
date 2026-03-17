import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Paywall from './components/Paywall';
import Settings from './components/Settings';
import AddTank from './components/AddTank';
import { useTrial } from './hooks/useTrial';
import usePersistentState from './hooks/usePersistentState';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = usePersistentState('isAuthenticated', false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [tanks, setTanks] = usePersistentState('userTanks_v2', []);
  const [currentTankIndex, setCurrentTankIndex] = usePersistentState('currentTankIndex', 0);
  const [isAddingNewTank, setIsAddingNewTank] = useState(false);
  const [testLogs, setTestLogs] = usePersistentState('userTestLogs_v3', []);
  const initialInhabitants = {
    fish: [],
    plants: [],
    hardscape: []
  };
  const [inhabitantsByTank, setInhabitantsByTank] = usePersistentState('userInhabitants_v6', {});
  const [accessories, setAccessories] = usePersistentState('userAccessories_v3', []);
  const [reminders, setReminders] = usePersistentState('userReminders_v3', []);
  const trialState = useTrial();

  const [showRemindersFromHeader, setShowRemindersFromHeader] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTanks([]); // This will also clear it from localStorage via the hook
    setTestLogs([]);
    setInhabitantsByTank({});
    setAccessories([]);
    setReminders([]);
  };

  const handleShowReminders = () => {
    setCurrentPage('dashboard');
    setShowRemindersFromHeader(true);
  };

  const handleTankAdded = (newTank) => {
    const updatedTanks = [...tanks, { ...newTank, id: Date.now() }];
    setTanks(updatedTanks);
    setCurrentTankIndex(updatedTanks.length - 1);
    setIsAddingNewTank(false);
  };

  const handleTestLogged = (partialLog) => {
    const currentTankId = tanks[currentTankIndex]?.id;
    if (!currentTankId) return;

    setTestLogs(prevLogs => {
      // Ensure we get the latest log by sorting by timestamp
      const tankLogs = prevLogs
        .filter(log => log.tankId === currentTankId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      const latestLog = tankLogs[0] || { temp: null, ph: null, nitrates: null, kh: null };
      const newLog = {
        ...latestLog,
        ...partialLog,
        tankId: currentTankId,
        timestamp: new Date().toISOString(),
      };
      return [newLog, ...prevLogs];
    });
  };

  const handleDeleteTestLog = (timestamp) => {
    setTestLogs(prevLogs => prevLogs.filter(log => log.timestamp !== timestamp));
  };

  const onResetHistory = (parameter) => {
    const currentTankId = tanks[currentTankIndex]?.id;
    if (!currentTankId) return;

    setTestLogs(prevLogs => {
      const updatedLogs = prevLogs.map(log => {
        if (log.tankId === currentTankId) {
          return {
            ...log,
            [parameter]: null,
          };
        }
        return log;
      });
      const cleanedLogs = updatedLogs.filter(
        log => log.temp != null || log.ph != null || log.nitrates != null
      );
      return cleanedLogs;
    });
  };

  const onUpdateInhabitants = (newInhabitants) => {
    const currentTankId = tanks[currentTankIndex]?.id;
    if (!currentTankId) return;
    setInhabitantsByTank(prev => ({
      ...prev,
      [currentTankId]: newInhabitants
    }));
  };

  const onUpdateReminders = (newReminders) => {
    const currentTankId = tanks[currentTankIndex]?.id;
    if (!currentTankId) return;
    
    // We store all reminders in one array, but they have tankId
    setReminders(prevReminders => {
      const otherTanksReminders = prevReminders.filter(r => r.tankId !== currentTankId);
      const updatedReminders = newReminders.map(r => ({ ...r, tankId: currentTankId }));
      return [...otherTanksReminders, ...updatedReminders];
    });
  };

  const onUpdateAccessories = (newAccessories) => {
    const currentTankId = tanks[currentTankIndex]?.id;
    if (!currentTankId) return;

    setAccessories(prevAccessories => {
      const otherTanksAccessories = prevAccessories.filter(a => a.tankId !== currentTankId);
      const updatedAccessories = newAccessories.map(a => ({ ...a, tankId: currentTankId }));
      return [...otherTanksAccessories, ...updatedAccessories];
    });
  };

  const handleDeleteTank = (tankId) => {
    if (tanks.length <= 1) return;
    
    const newTanks = tanks.filter(t => t.id !== tankId);
    setTanks(newTanks);
    setTestLogs(prevLogs => prevLogs.filter(l => l.tankId !== tankId));
    setAccessories(prevAcc => prevAcc.filter(a => a.tankId !== tankId));
    setReminders(prevRem => prevRem.filter(r => r.tankId !== tankId));
    setInhabitantsByTank(prev => {
      const newMap = { ...prev };
      delete (newMap as any)[tankId];
      return newMap;
    });
    
    // Adjust current index if the deleted tank was the current one or after it
    if (currentTankIndex >= newTanks.length) {
      setCurrentTankIndex(Math.max(0, newTanks.length - 1));
    }
  };

  const renderPage = () => {
    if ((tanks.length === 0 || isAddingNewTank) && !trialState.isReadOnly) {
      return (
        <motion.div
          key="add-tank"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col"
        >
          <AddTank 
            onTankAdded={handleTankAdded} 
            onLogout={handleLogout} 
            onCancel={tanks.length > 0 ? () => setIsAddingNewTank(false) : undefined}
            existingTanks={tanks}
          />
        </motion.div>
      );
    }

    if (trialState.isReadOnly) {
      return (
        <motion.div
          key="paywall"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col"
        >
          <Paywall />
        </motion.div>
      );
    }

    // Ensure currentTankIndex is valid
    const safeIndex = Math.min(Math.max(0, currentTankIndex), Math.max(0, tanks.length - 1));
    const currentTank = tanks[safeIndex] || tanks[0];
    const currentTankId = currentTank?.id;
    
    // Sort logs by timestamp to ensure [0] is always the latest
    const currentTestLogs = testLogs
      .filter(log => log.tankId === currentTankId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
    const currentInhabitants = (inhabitantsByTank as any)[currentTankId] || initialInhabitants;
    const currentAccessories = accessories.filter(a => a.tankId === currentTankId);
    const currentReminders = reminders.filter(r => r.tankId === currentTankId);

    return (
      <motion.div
        key={`${currentPage}-${currentTankId}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="flex-1 flex flex-col"
      >
        {currentPage === 'settings' ? (
          <Settings 
            onBack={() => setCurrentPage('dashboard')} 
            onLogout={handleLogout} 
            tanks={tanks}
            onDeleteTank={handleDeleteTank}
          />
        ) : (
          <Dashboard 
            key={`dashboard-${currentTankId}`}
            testLogs={currentTestLogs} 
            onLogTest={handleTestLogged} 
            handleDeleteTestLog={handleDeleteTestLog}
            onResetHistory={onResetHistory}
            inhabitants={currentInhabitants}
            onUpdateInhabitants={onUpdateInhabitants}
            reminders={currentReminders}
            onUpdateReminders={onUpdateReminders}
            accessories={currentAccessories}
            onUpdateAccessories={onUpdateAccessories}
            tanks={tanks}
            currentTankIndex={safeIndex}
            onSetCurrentTankIndex={setCurrentTankIndex}
            onAddNewTank={() => setIsAddingNewTank(true)}
            showRemindersInitial={showRemindersFromHeader}
            onCloseRemindersInitial={() => setShowRemindersFromHeader(false)}
          />
        )}
      </motion.div>
    );
  };

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Login onLogin={handleLogin} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans selection:bg-emerald-500/30">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header 
          onSettingsClick={() => setCurrentPage('settings')} 
          onLogoClick={() => setCurrentPage('dashboard')}
          onRemindersClick={() => {
            setCurrentPage('dashboard');
            setShowRemindersFromHeader(true);
          }}
          reminders={reminders}
        />
      </div>
      <main className="flex-1 pt-[65px] flex flex-col">
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>
    </div>
  );
}
