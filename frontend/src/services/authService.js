// frontend/src/services/authService.js
const API_URL = "http://localhost:5000/api";

export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        console.log('Login response:', data);
        
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
        }
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                full_name: userData.full_name,
                username: userData.username,
                email: userData.email,
                password: userData.password
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.msg || "Đăng ký thất bại");
        }
        
        return data;
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        return JSON.parse(userStr);
    }
    return null;
};

export const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const isAuthenticated = () => {
    return !!getToken();
};