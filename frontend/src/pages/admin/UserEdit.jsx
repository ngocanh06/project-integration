import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import userService from '../../services/userService';
import { useRole } from '../../hooks/useRole';
import '../admin/Admin.css';

const UserEdit = () => {
  const { userId } = useParams();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    systemRole: 'user'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = useRole();

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    fetchUser();
  }, [userId, isAdmin, navigate]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserById(userId);
      const user = response.data.data;
      setFormData({
        email: user.email,
        fullName: user.full_name,
        systemRole: user.system_role
      });
      setError('');
    } catch (err) {
      setError('Failed to load user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email || !formData.fullName) {
      setError('All fields are required');
      return;
    }

    setSubmitting(true);

    try {
      await userService.updateUser(
        userId,
        formData.email,
        formData.fullName,
        formData.systemRole
      );
      setSuccess('User updated successfully!');
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update user';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading user...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Edit User</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/admin/users')}
        >
          Back to Users
        </button>
      </div>

      <div className="form-card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="systemRole">Role *</label>
            <select
              id="systemRole"
              name="systemRole"
              value={formData.systemRole}
              onChange={handleChange}
              required
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/users')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEdit;
