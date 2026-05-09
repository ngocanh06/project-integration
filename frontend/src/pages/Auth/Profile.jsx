// frontend/src/pages/auth/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { getToken, getCurrentUser } from '../../services/authService';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const currentUser = getCurrentUser();
            const response = await api.get('/auth/profile', {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setUser(response.data.user);
            setFormData({
                full_name: response.data.user.full_name || '',
                email: response.data.user.email || '',
                phone: response.data.user.phone || ''
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/auth/profile', formData, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setUser(response.data.user);
            setEditMode(false);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <h2>My Profile</h2>
                    {!editMode && (
                        <button onClick={() => setEditMode(true)}>Edit Profile</button>
                    )}
                </div>
                
                {!editMode ? (
                    <div className="profile-info">
                        <div className="info-row">
                            <label>Username:</label>
                            <span>{user?.username}</span>
                        </div>
                        <div className="info-row">
                            <label>Full Name:</label>
                            <span>{user?.full_name || 'Not set'}</span>
                        </div>
                        <div className="info-row">
                            <label>Email:</label>
                            <span>{user?.email}</span>
                        </div>
                        <div className="info-row">
                            <label>Role:</label>
                            <span>{user?.role_name || 'Employee'}</span>
                        </div>
                        <div className="info-links">
                            <Link to="/change-password">Change Password</Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;