// frontend/src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';

const Login = () => {
    const [loginInput, setLoginInput] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateField = (name, value) => {
        let err = '';
        if (name === 'loginInput' && !value.trim()) err = 'Vui lòng nhập tên đăng nhập hoặc email';
        if (name === 'password' && !value) err = 'Vui lòng nhập mật khẩu';
        
        setFieldErrors(prev => ({ ...prev, [name]: err }));
        return err === '';
    };

    const validate = () => {
        let isValid = true;
        if (!validateField('loginInput', loginInput)) isValid = false;
        if (!validateField('password', password)) isValid = false;
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validate()) return;
        
        setLoading(true);

        try {
            // SỬA: chỉ gửi 2 tham số (username, password)
            const response = await login(loginInput, password);
            
            if (response.status === 'success' && response.token) {
                if (rememberMe) {
                    localStorage.setItem('token', response.token);
                } else {
                    sessionStorage.setItem('token', response.token);
                }
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // Redirect dựa trên role
                const roleId = response.user?.role;
                if (roleId === 1) {
                    // Admin -> Trang quản lý tài khoản
                    navigate('/admin/users');
                } else {
                    // Các role khác -> Dashboard
                    navigate('/dashboard');
                }
            } else {
                setError(response.msg || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to access your dashboard</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>USERNAME / EMAIL</label>
                        <input
                            type="text"
                            value={loginInput}
                            onChange={(e) => {
                                setLoginInput(e.target.value);
                                validateField('loginInput', e.target.value);
                            }}
                            placeholder="Enter username or email"
                            className={fieldErrors.loginInput ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.loginInput && <span className="field-error">{fieldErrors.loginInput}</span>}
                    </div>

                    <div className="form-group">
                        <label>PASSWORD</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    validateField('password', e.target.value);
                                }}
                                placeholder="Password"
                                className={fieldErrors.password ? 'input-error' : ''}
                                required
                            />
                            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
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
                    </div>

                    <div className="form-options">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="forgot-link">
                            Forgot Password?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="signup-link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;