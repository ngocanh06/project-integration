import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Giả lập đăng nhập thành công
        if (username === 'admin' && password === 'admin') {
            onLogin();
        } else {
            alert('Sai tài khoản hoặc mật khẩu (admin/admin)');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>HRPro Core</h2>
                <p>Đăng nhập hệ thống quản lý</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Tài khoản</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Nhập tài khoản"
                        />
                    </div>
                    <div className="input-group">
                        <label>Mật khẩu</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Nhập mật khẩu"
                        />
                    </div>
                    <button type="submit" className="login-btn">Đăng nhập</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
