import React, { useState } from 'react';
import { 
  TrendingUp, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff
} from 'lucide-react';
import './Login.scss';

function Login({ onLogin }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) {
      onLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-decor">
        <div className="login-bg-blur-1"></div>
        <div className="login-bg-blur-2"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <TrendingUp size={32} />
          </div>
          <h1 className="login-title">HRPro Core</h1>
          <p className="login-subtitle">
            {isLoginView 
              ? 'Chào mừng bạn quay trở lại' 
              : 'Bắt đầu quản lý nhân sự chuyên nghiệp'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLoginView && (
            <div className="login-form-group">
              <label className="login-label">Họ và tên</label>
              <div className="login-input-wrapper">
                <User className="login-input-icon" size={18} />
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required={!isLoginView}
                  placeholder="Nhập tên của bạn" 
                  className="login-input"
                />
              </div>
            </div>
          )}

          <div className="login-form-group">
            <label className="login-label">Email công việc</label>
            <div className="login-input-wrapper">
              <Mail className="login-input-icon" size={18} />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="email@company.com" 
                className="login-input"
              />
            </div>
          </div>

          <div className="login-form-group">
            <div className="login-label-row">
              <label className="login-label">Mật khẩu</label>
              {isLoginView && (
                <button type="button" className="login-forgot-link">
                  Quên mật khẩu?
                </button>
              )}
            </div>
            <div className="login-input-wrapper">
              <Lock className="login-input-icon" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••" 
                className="login-input"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn">
            {isLoginView ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="login-divider">
          <div className="login-divider-line">
            <hr />
          </div>
          <div className="login-divider-text">
            <span>Hoặc tiếp tục với</span>
          </div>
        </div>

        <div className="login-social-buttons">
          <button className="login-social-btn">
            G
          </button>
          <button className="login-social-btn">
            GH
          </button>
        </div>

        <div className="login-footer">
          {isLoginView ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          <button 
            onClick={() => setIsLoginView(!isLoginView)}
            className="login-toggle-btn"
          >
            {isLoginView ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;