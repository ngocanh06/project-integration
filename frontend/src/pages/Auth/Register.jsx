// frontend/src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';
import '../../styles/auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateField = (name, value) => {
        let err = '';
        if (name === 'fullName') {
            if (!value.trim()) err = 'Họ tên là bắt buộc';
            else if (value.trim().length < 2) err = 'Họ tên phải có ít nhất 2 ký tự';
        }
        if (name === 'username') {
            if (!value.trim()) err = 'Tên đăng nhập là bắt buộc';
            else if (value.trim().length < 3) err = 'Tên đăng nhập phải có ít nhất 3 ký tự';
        }
        if (name === 'email') {
            if (!value.trim()) err = 'Email là bắt buộc';
            else if (!/\S+@\S+\.\S+/.test(value)) err = 'Email không hợp lệ';
        }
        if (name === 'password') {
            if (!value) err = 'Mật khẩu là bắt buộc';
            else if (value.length < 6) err = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        if (name === 'confirmPassword') {
            if (value !== formData.password) err = 'Mật khẩu xác nhận không khớp';
        }

        setFieldErrors(prev => ({ ...prev, [name]: err }));
        return err === '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let isValid = true;
        Object.keys(formData).forEach(key => {
            if (!validateField(key, formData[key])) isValid = false;
        });

        if (!isValid) {
            setError('Vui lòng kiểm tra lại thông tin đăng ký');
            return;
        }

        setLoading(true);
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>CREATE ACCOUNT</h2>
                <p>Join our system today</p>

                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>FULL NAME</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Full name"
                            className={fieldErrors.fullName ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.fullName && <span className="field-error">{fieldErrors.fullName}</span>}
                    </div>

                    <div className="form-group">
                        <label>USERNAME</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Username"
                            className={fieldErrors.username ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
                    </div>

                    <div className="form-group">
                        <label>EMAIL</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className={fieldErrors.email ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label>PASSWORD</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className={fieldErrors.password ? 'input-error' : ''}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                        <line x1="2" y1="2" x2="22" y2="22" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label>CONFIRM PASSWORD</label>
                        <div className="password-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                className={fieldErrors.confirmPassword ? 'input-error' : ''}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                        <line x1="2" y1="2" x2="22" y2="22" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="signup-link">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;