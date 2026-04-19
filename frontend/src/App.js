import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <Employees />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <nav className="sidebar">
        <button onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button onClick={() => setActiveTab('employees')}>Nhân viên</button>
        <button onClick={() => setIsAuthenticated(false)}>Đăng xuất</button>
      </nav>
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
