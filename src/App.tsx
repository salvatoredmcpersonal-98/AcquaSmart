import { useState } from 'react';
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
  const [tanks, setTanks] = usePersistentState('userTanks', []);
  const [testLogs, setTestLogs] = usePersistentState('userTestLogs', []);
  const trialState = useTrial();

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTanks([]); // This will also clear it from localStorage via the hook
    setTestLogs([]);
  };

  const handleTankAdded = (newTank) => {
    setTanks([{ ...newTank, id: Date.now() }, ...tanks]);
  };

  const handleTestLogged = (partialLog) => {
    setTestLogs(prevLogs => {
      const latestLog = prevLogs[0] || { temp: null, ph: null, nitrates: null };
      const newLog = {
        ...latestLog,
        ...partialLog,
        timestamp: new Date().toISOString(),
      };
      return [newLog, ...prevLogs];
    });
  };

  const handleDeleteTestLog = (timestamp) => {
    setTestLogs(prevLogs => prevLogs.filter(log => log.timestamp !== timestamp));
  };

  const onResetHistory = (parameter) => {
    setTestLogs(prevLogs => {
      const updatedLogs = prevLogs.map(log => ({
        ...log,
        [parameter]: null,
      }));
      const cleanedLogs = updatedLogs.filter(
        log => log.temp != null || log.ph != null || log.nitrates != null
      );
      return cleanedLogs;
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'settings':
        return <Settings onBack={() => setCurrentPage('dashboard')} onLogout={handleLogout} />;
      case 'dashboard':
      default:
        return <Dashboard 
          testLogs={testLogs} 
          onLogTest={handleTestLogged} 
          handleDeleteTestLog={handleDeleteTestLog}
          onResetHistory={onResetHistory}
        />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (tanks.length === 0 && !trialState.isReadOnly) {
    return <AddTank onTankAdded={handleTankAdded} />;
  }

  if (trialState.isReadOnly) {
    return <Paywall />;
  }

  return (
    <div className="min-h-screen bg-zinc-800">
      <Header onNavigate={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
    </div>
  );
}
