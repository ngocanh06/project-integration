import axios from 'axios';
import { getStoredToken } from '../utils/tokenStorage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const authService = {
  /**
   * Register new user
   */
  register: async (fullName, businessEmail, password, confirmPassword, systemRole = 'user') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        full_name: fullName,
        business_email: businessEmail,
        password: password,
        confirm_password: confirmPassword,
        system_role: systemRole
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email,
        password: password
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const token = getStoredToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email: email
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify reset code
   */
  verifyResetCode: async (email, resetCode) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-reset-code`, {
        email: email,
        reset_code: resetCode
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password with code
   */
  resetPassword: async (email, resetCode, newPassword, confirmPassword) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        email: email,
        reset_code: resetCode,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password (requires authentication)
   */
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const token = getStoredToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user profile (requires authentication)
   */
  getUserProfile: async () => {
    try {
      const token = getStoredToken();
      const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;
