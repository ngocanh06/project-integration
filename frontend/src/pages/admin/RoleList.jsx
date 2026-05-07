import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roleService from '../../services/roleService';
import { useRole } from '../../hooks/useRole';
import '../admin/Admin.css';

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = useRole();

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    fetchRoles();
  }, [isAdmin, navigate]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAllRoles();
      setRoles(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load roles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleService.deleteRole(roleId);
        setRoles(roles.filter(r => r.role_id !== roleId));
      } catch (err) {
        setError('Failed to delete role');
      }
    }
  };

  const filteredRoles = roles.filter(role =>
    role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="loading">Loading roles...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Role Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/admin/roles/add')}
        >
          + Add New Role
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search by role name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredRoles.length === 0 ? (
        <div className="empty-state">No roles found</div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map(role => (
                <tr key={role.role_id}>
                  <td className="font-weight-bold">{role.role_name}</td>
                  <td>{role.description || '-'}</td>
                  <td>
                    <span className="badge">{role.permissions?.length || 0} permissions</span>
                  </td>
                  <td>{new Date(role.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="btn btn-small btn-info"
                      onClick={() => navigate(`/admin/roles/${role.role_id}`)}
                    >
                      Manage Permissions
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(role.role_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoleList;
