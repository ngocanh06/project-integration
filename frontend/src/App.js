import './App.css';
import Login from './components/Login';
import { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>HRPro Core Dashboard</h1>
        <p>Chào mừng bạn đến với hệ thống quản lý nhân sự!</p>
        <button onClick={handleLogout} className="logout-btn">
          Đăng xuất
        </button>
      </header>
    </div>
  );
}

export default App;
