import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DepartmentList from './pages/departments/DepartmentList';
import PositionList from './pages/positions/PositionList';
import EmployeeList from './pages/employees/EmployeeList';
import DividendList from './pages/dividends/DividendList';
import Login from './components/Login';
import './styles/global.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/departments" />}
        />

        <Route
          path="/"
          element={isAuthenticated ? <MainLayout onLogout={handleLogout} /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/departments" replace />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="positions" element={<PositionList />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="dividends" element={<DividendList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
