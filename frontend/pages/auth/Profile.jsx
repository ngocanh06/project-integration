import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getUserProfile();
        if (response.status === 200) {
          setProfile(response.data);
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        setError('An error occurred while loading profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  if (loading) {
    return <div className="profile-container"><div className="loading">Loading profile...</div></div>;
  }

  if (error) {
    return <div className="profile-container"><div className="alert alert-error">{error}</div></div>;
  }

  if (!profile) {
    return <div className="profile-container"><div className="alert alert-error">Profile not found</div></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-section">
            <h2>Account Information</h2>
            
            <div className="profile-info-group">
              <label>Full Name</label>
              <p>{profile.full_name}</p>
            </div>

            <div className="profile-info-group">
              <label>Email</label>
              <p>{profile.email}</p>
            </div>

            <div className="profile-info-group">
              <label>System Role</label>
              <p className="role-badge">{profile.system_role}</p>
            </div>

            <div className="profile-info-group">
              <label>Account Status</label>
              <p className={profile.is_active ? 'status-active' : 'status-inactive'}>
                {profile.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>

            <div className="profile-info-group">
              <label>Member Since</label>
              <p>{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>

            <div className="profile-info-group">
              <label>Last Updated</label>
              <p>{new Date(profile.updated_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="profile-section">
            <h2>Security</h2>
            
            <div className="security-actions">
              <button
                className="btn btn-primary"
                onClick={handleChangePassword}
              >
                Change Password
              </button>
            </div>

            <div className="security-info">
              <h3>Password Requirements</h3>
              <ul>
                <li>At least 8 characters long</li>
                <li>Contains uppercase letters</li>
                <li>Contains lowercase letters</li>
                <li>Contains numbers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
