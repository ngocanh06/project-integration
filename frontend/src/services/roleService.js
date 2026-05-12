import axios from 'axios';
import { getStoredToken } from '../utils/tokenStorage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const roleService = {
  // ─── Role Operations ───────────────────────────────────────────────────

  /**
   * Get all roles
   */
  getAllRoles: async () => {
    try {
      const token = getStoredToken();
      const response = await axios.get(`${API_BASE_URL}/api/roles`, {
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
   * Get role by ID
   */
  getRoleById: async (roleId) => {
    try {
      const token = getStoredToken();
      const response = await axios.get(`${API_BASE_URL}/api/roles/${roleId}`, {
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
   * Create new role (Admin only)
   */
  createRole: async (roleName, description) => {
    try {
      const token = getStoredToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/roles`,
        {
          role_name: roleName,
          description
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
   * Update role (Admin only)
   */
  updateRole: async (roleId, roleName, description) => {
    try {
      const token = getStoredToken();
      const updateData = {};

      if (roleName) updateData.role_name = roleName;
      if (description) updateData.description = description;

      const response = await axios.put(
        `${API_BASE_URL}/api/roles/${roleId}`,
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
   * Delete role (Admin only)
   */
  deleteRole: async (roleId) => {
    try {
      const token = getStoredToken();
      const response = await axios.delete(`${API_BASE_URL}/api/roles/${roleId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ─── Role Permission Operations ────────────────────────────────────────

  /**
   * Get all permissions for a role
   */
  getRolePermissions: async (roleId) => {
    try {
      const token = getStoredToken();
      const response = await axios.get(`${API_BASE_URL}/api/roles/${roleId}/permissions`, {
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
   * Add permission to role (Admin only)
   */
  addPermissionToRole: async (roleId, permissionId) => {
    try {
      const token = getStoredToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/roles/${roleId}/permissions`,
        { permission_id: permissionId },
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
   * Remove permission from role (Admin only)
   */
  removePermissionFromRole: async (roleId, permissionId) => {
    try {
      const token = getStoredToken();
      const response = await axios.delete(
        `${API_BASE_URL}/api/roles/${roleId}/permissions/${permissionId}`,
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

  // ─── Permission Operations ─────────────────────────────────────────────

  /**
   * Get all permissions
   */
  getAllPermissions: async () => {
    try {
      const token = getStoredToken();
      const response = await axios.get(`${API_BASE_URL}/api/permissions`, {
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
   * Create new permission (Admin only)
   */
  createPermission: async (permissionName, resource, action, description) => {
    try {
      const token = getStoredToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/permissions`,
        {
          permission_name: permissionName,
          resource,
          action,
          description
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
   * Get permissions by resource
   */
  getPermissionsByResource: async (resource) => {
    try {
      const token = getStoredToken();
      const response = await axios.get(`${API_BASE_URL}/api/permissions/resource/${resource}`, {
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
   * Delete permission (Admin only)
   */
  deletePermission: async (permissionId) => {
    try {
      const token = getStoredToken();
      const response = await axios.delete(`${API_BASE_URL}/api/permissions/${permissionId}`, {
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

export default roleService;
