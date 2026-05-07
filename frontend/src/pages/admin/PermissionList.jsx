import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roleService from '../../services/roleService';
import { useRole } from '../../hooks/useRole';
import '../admin/Admin.css';

const PermissionList = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [resources, setResources] = useState([]);
  const navigate = useNavigate();
  const { isAdmin } = useRole();

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    fetchPermissions();
  }, [isAdmin, navigate]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAllPermissions();
      const permsData = response.data.data || [];
      setPermissions(permsData);
      
      // Extract unique resources
      const uniqueResources = [...new Set(permsData.map(p => p.resource))];
      setResources(uniqueResources);
      
      setError('');
    } catch (err) {
      setError('Failed to load permissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (permissionId) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await roleService.deletePermission(permissionId);
        setPermissions(permissions.filter(p => p.permission_id !== permissionId));
      } catch (err) {
        setError('Failed to delete permission');
      }
    }
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.permission_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesResource = filterResource === '' || permission.resource === filterResource;
    return matchesSearch && matchesResource;
  });

  if (loading) return <div className="loading">Loading permissions...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Permission Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/admin/permissions/add')}
        >
          + Add New Permission
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search by permission name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterResource}
          onChange={(e) => setFilterResource(e.target.value)}
          className="filter-select"
        >
          <option value="">All Resources</option>
          {resources.map(resource => (
            <option key={resource} value={resource}>{resource}</option>
          ))}
        </select>
      </div>

      {filteredPermissions.length === 0 ? (
        <div className="empty-state">No permissions found</div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Permission Name</th>
                <th>Resource</th>
                <th>Action</th>
                <th>Description</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.map(permission => (
                <tr key={permission.permission_id}>
                  <td className="font-weight-bold">{permission.permission_name}</td>
                  <td>
                    <span className="badge badge-info">{permission.resource}</span>
                  </td>
                  <td>
                    <span className="badge badge-warning">{permission.action}</span>
                  </td>
                  <td>{permission.description || '-'}</td>
                  <td>{new Date(permission.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(permission.permission_id)}
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

export default PermissionList;
