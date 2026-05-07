import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ChangePassword from './pages/auth/ChangePassword';
import Profile from './pages/auth/Profile';
import Success from './pages/auth/Success';
// Admin Pages
import UserList from './pages/admin/UserList';
import UserAdd from './pages/admin/UserAdd';
import UserEdit from './pages/admin/UserEdit';
import RoleList from './pages/admin/RoleList';
import PermissionList from './pages/admin/PermissionList';
import './App.css';
import './styles/auth.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if already authenticated)
const PublicRouteComponent = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.system_role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRouteComponent>
            <Login />
          </PublicRouteComponent>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRouteComponent>
            <Register />
          </PublicRouteComponent>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRouteComponent>
            <ForgotPassword />
          </PublicRouteComponent>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRouteComponent>
            <ResetPassword />
          </PublicRouteComponent>
        }
      />
      <Route
        path="/account-created"
        element={
          <PublicRouteComponent>
            <Success
              title="ACCOUNT CREATED"
              message="Your account has been successfully created. An admin will review your request and send you further instructions via email."
              nextText="Go to Login"
              nextPath="/login"
              showSecondaryAction={true}
              secondaryText="Return to Home"
              secondaryPath="/"
            />
          </PublicRouteComponent>
        }
      />
      <Route
        path="/password-reset-success"
        element={
          <PublicRouteComponent>
            <Success
              title="Password Reset Successful"
              message="Your password has been successfully reset. You can now log in with your new password."
              nextText="Go to Login"
              nextPath="/login"
              showSecondaryAction={false}
            />
          </PublicRouteComponent>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UserList />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users/add"
        element={
          <AdminRoute>
            <UserAdd />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users/:userId/edit"
        element={
          <AdminRoute>
            <UserEdit />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <AdminRoute>
            <RoleList />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/permissions"
        element={
          <AdminRoute>
            <PermissionList />
          </AdminRoute>
        }
      />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
