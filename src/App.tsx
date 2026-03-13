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
  const initialInhabitants = {
    fish: [
      { id: 1, name: 'Neon Tetra', quantity: 10, price: 1.5 },
      { id: 2, name: 'Guppy', quantity: 5, price: 2.5 },
      { id: 3, name: 'Molly', quantity: 4, price: 3.0 },
      { id: 4, name: 'Platy', quantity: 6, price: 2.5 },
      { id: 5, name: 'Corydoras', quantity: 4, price: 4.5 },
      { id: 6, name: 'Angelfish', quantity: 2, price: 8.0 },
      { id: 7, name: 'Betta Splendens', quantity: 1, price: 12.0 },
      { id: 8, name: 'Zebra Danio', quantity: 8, price: 1.5 },
      { id: 9, name: 'Cherry Barb', quantity: 6, price: 2.0 },
      { id: 10, name: 'Dwarf Gourami', quantity: 2, price: 6.0 }
    ],
    plants: [
      { id: 11, name: 'Anubias', quantity: 3, price: 8.0 },
      { id: 12, name: 'Java Fern', quantity: 2, price: 7.0 },
      { id: 13, name: 'Amazon Sword', quantity: 1, price: 6.0 },
      { id: 14, name: 'Vallisneria', quantity: 5, price: 4.0 },
      { id: 15, name: 'Cryptocoryne', quantity: 4, price: 5.0 },
      { id: 16, name: 'Java Moss', quantity: 2, price: 6.0 },
      { id: 17, name: 'Hornwort', quantity: 3, price: 3.0 },
      { id: 18, name: 'Water Wisteria', quantity: 2, price: 5.0 },
      { id: 19, name: 'Bacopa Caroliniana', quantity: 4, price: 4.0 },
      { id: 20, name: 'Ludwigia Repens', quantity: 3, price: 5.0 }
    ],
    hardscape: [
      { id: 21, name: 'ADA Amazonia Ver.2 (9L)', quantity: 1, price: 45.0 },
      { id: 22, name: 'Seiryu Stone (Set 10kg)', quantity: 1, price: 40.0 },
      { id: 23, name: 'Radice Red Moor (M)', quantity: 1, price: 15.0 }
    ]
  };
  const [inhabitants, setInhabitants] = usePersistentState('userInhabitants_v4', initialInhabitants);
  const [accessories, setAccessories] = usePersistentState('userAccessories_v1', []);
  const [reminders, setReminders] = usePersistentState('userReminders_v1', [
    { id: 1, task: 'Cambio Acqua', lastDone: new Date().toISOString(), frequency: 7, nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 2, task: 'Pulizia Filtro', lastDone: new Date().toISOString(), frequency: 30, nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 3, task: 'Fertilizzazione', lastDone: new Date().toISOString(), frequency: 3, nextDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() }
  ]);
  const trialState = useTrial();

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTanks([]); // This will also clear it from localStorage via the hook
    setTestLogs([]);
    setInhabitants({ fish: [], plants: [], hardscape: [] });
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

  const onUpdateInhabitants = (newInhabitants) => {
    setInhabitants(newInhabitants);
  };

  const onUpdateReminders = (newReminders) => {
    setReminders(newReminders);
  };

  const onUpdateAccessories = (newAccessories) => {
    setAccessories(newAccessories);
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
          inhabitants={inhabitants}
          onUpdateInhabitants={onUpdateInhabitants}
          reminders={reminders}
          onUpdateReminders={onUpdateReminders}
          accessories={accessories}
          onUpdateAccessories={onUpdateAccessories}
          tanks={tanks}
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
