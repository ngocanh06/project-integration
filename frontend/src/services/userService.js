import axios from 'axios';
import { getStoredToken } from '../utils/tokenStorage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const userService = {
  /**
   * Get all users (Admin only)
   */
  getAllUsers: async (skip = 0, limit = 100) => {
    try {
      const token = getStoredToken();
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        params: { skip, limit },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    try {
      const token = getStoredToken();
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new user (Admin only)
   */
  createUser: async (email, fullName, password, systemRole = 'user') => {
    try {
      const token = getStoredToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/users`,
        {
          email,
          full_name: fullName,
          password,
          system_role: systemRole
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
   * Update user (Admin only)
   */
  updateUser: async (userId, email, fullName, systemRole) => {
    try {
      const token = getStoredToken();
      const updateData = {};
      
      if (email) updateData.email = email;
      if (fullName) updateData.full_name = fullName;
      if (systemRole) updateData.system_role = systemRole;

      const response = await axios.put(
        `${API_BASE_URL}/api/users/${userId}`,
        updateData,
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
   * Delete user (Admin only)
   */
  deleteUser: async (userId) => {
    try {
      const token = getStoredToken();
      const response = await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get users by role
   */
  getUsersByRole: async (role) => {
    try {
      const token = getStoredToken();
      const response = await axios.get(`${API_BASE_URL}/api/users/role/${role}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change user password
   */
  changePassword: async (userId, oldPassword, newPassword, confirmPassword) => {
    try {
      const token = getStoredToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/users/${userId}/change-password`,
        {
          old_password: oldPassword,
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
  }
};

export default userService;
