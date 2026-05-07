import { useState, useContext, createContext, useEffect } from 'react';
import authService from '../services/authService';
import { getStoredToken, storeToken, removeToken, getStoredUser, storeUser, removeUser } from '../utils/tokenStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = getStoredToken();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const register = async (fullName, businessEmail, password, confirmPassword, systemRole = 'user') => {
    try {
      const response = await authService.register(
        fullName,
        businessEmail,
        password,
        confirmPassword,
        systemRole
      );

      if (response.status === 200) {
        return {
          success: true,
          message: 'Registration successful'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      if (response.status === 200) {
        const userData = {
          user_id: response.data.user_id,
          email: response.data.email,
          full_name: response.data.full_name,
          system_role: response.data.system_role
        };

        storeToken(response.data.access_token, response.data.refresh_token);
        storeUser(userData);
        setUser(userData);
        setIsAuthenticated(true);

        return {
          success: true,
          message: 'Login successful'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      removeUser();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await authService.changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );

      if (response.status === 200) {
        return {
          success: true,
          message: response.data.message || 'Password changed successfully'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to change password'
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
