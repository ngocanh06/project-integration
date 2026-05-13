// frontend/src/pages/auth/ChangePassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { getToken } from '../../services/authService';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateField = (name, value) => {
        let err = '';
        if (name === 'currentPassword' && !value) err = 'Vui lòng nhập mật khẩu hiện tại';
        if (name === 'newPassword') {
            if (!value) err = 'Vui lòng nhập mật khẩu mới';
            else if (value.length < 6) err = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        }
        if (name === 'confirmPassword') {
            if (!value) err = 'Vui lòng xác nhận mật khẩu mới';
            else if (value !== newPassword) err = 'Mật khẩu xác nhận không khớp';
        }

        setFieldErrors(prev => ({ ...prev, [name]: err }));
        return err === '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate all fields
        let isValid = true;
        if (!validateField('currentPassword', currentPassword)) isValid = false;
        if (!validateField('newPassword', newPassword)) isValid = false;
        if (!validateField('confirmPassword', confirmPassword)) isValid = false;

        if (!isValid) {
            setError('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword
            }, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if (response.data.status === 'success') {
                setSuccess('Password changed successfully!');
                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-container">
            <div className="change-password-card">
                <h2>Change Password</h2>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                validateField('currentPassword', e.target.value);
                            }}
                            className={fieldErrors.currentPassword ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.currentPassword && <span className="field-error">{fieldErrors.currentPassword}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                validateField('newPassword', e.target.value);
                            }}
                            className={fieldErrors.newPassword ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.newPassword && <span className="field-error">{fieldErrors.newPassword}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                validateField('confirmPassword', e.target.value);
                            }}
                            className={fieldErrors.confirmPassword ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
                    </div>
                    
                    <button type="submit" className="btn-update" disabled={loading}>
                        {loading ? 'Đang cập nhật...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;