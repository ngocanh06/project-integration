// frontend/src/layouts/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaBell, FaUserCircle, FaCog, 
    FaSignOutAlt, FaUser, FaChevronDown,
    FaSearch, FaBirthdayCake, FaUmbrellaBeach, FaExclamationTriangle
} from 'react-icons/fa';
import { getCurrentUser, logout } from '../services/authService';
import { getAllAlerts } from '../services/alertService';
import '../styles/header.css';

const Header = () => {
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    
    const notifRef = useRef(null);
    const userMenuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        fetchAlerts();
        
        // Refresh alerts every 5 minutes
        const interval = setInterval(fetchAlerts, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            const data = await getAllAlerts();
            setAlerts(data || []);
            setUnreadCount(data?.length || 0);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleName = (roleId) => {
        const roles = { 1: 'Admin', 2: 'HR Manager', 3: 'Payroll Manager', 4: 'Employee' };
        return roles[roleId] || 'Employee';
    };

    const getAlertIcon = (type) => {
        switch(type) {
            case 'anniversary': return <FaBirthdayCake size={12} />;
            case 'excessive_leave': return <FaUmbrellaBeach size={12} />;
            case 'salary_discrepancy': return <FaExclamationTriangle size={12} />;
            default: return <FaBell size={12} />;
        }
    };

    const getAlertColor = (type) => {
        switch(type) {
            case 'anniversary': return '#3b82f6';
            case 'excessive_leave': return '#ef4444';
            case 'salary_discrepancy': return '#f97316';
            default: return '#64748b';
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <h1 className="page-title">HR System</h1>
            </div>

            <div className="header-center">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search here..." 
                    />
                </div>
            </div>

            <div className="header-right">
                {/* Notifications with Alerts */}
                <div className="notif-wrapper" ref={notifRef}>
                    <button className="header-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                        <FaBell size={18} />
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </button>
                    
                    {notifOpen && (
                        <div className="notif-dropdown">
                            <div className="notif-header">
                                <h4>Thông báo</h4>
                                <Link to="/alerts" className="view-all" onClick={() => setNotifOpen(false)}>
                                    Xem tất cả
                                </Link>
                            </div>
                            <div className="notif-list">
                                {alerts.length > 0 ? (
                                    alerts.slice(0, 5).map((alert, idx) => (
                                        <Link 
                                            key={idx} 
                                            to="/alerts" 
                                            className="notif-item"
                                            onClick={() => setNotifOpen(false)}
                                        >
                                            <div className="notif-icon" style={{ backgroundColor: `${getAlertColor(alert.type)}20`, color: getAlertColor(alert.type) }}>
                                                {getAlertIcon(alert.type)}
                                            </div>
                                            <div className="notif-content">
                                                <p className="notif-title">{alert.title}</p>
                                                <p className="notif-message">{alert.message}</p>
                                                <span className="notif-time">Vừa xảy ra</span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="no-notif">
                                        <FaBell size={24} />
                                        <p>Không có thông báo mới</p>
                                    </div>
                                )}
                            </div>
                            {alerts.length > 5 && (
                                <div className="notif-footer">
                                    <Link to="/alerts" onClick={() => setNotifOpen(false)}>
                                        Xem thêm {alerts.length - 5} cảnh báo khác
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* User Avatar */}
                <div className="user-menu-wrapper" ref={userMenuRef}>
                    <button className="user-avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                        <div className="avatar">
                            <FaUserCircle size={32} />
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.full_name || user?.username || 'ngocanh136'}</span>
                            <span className="user-role">{getRoleName(user?.role || user?.role_id)}</span>
                        </div>
                        <FaChevronDown size={12} className="user-arrow" />
                    </button>
                    
                    {userMenuOpen && (
                        <div className="user-dropdown">
                            <div className="dropdown-header">
                                <FaUserCircle size={40} />
                                <div>
                                    <p className="dropdown-name">{user?.full_name || user?.username || 'ngocanh136'}</p>
                                    <p className="dropdown-email">{user?.email || 'user@company.com'}</p>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                <FaUser size={16} /> <span>My Profile</span>
                            </Link>
                            <Link to="/settings" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                <FaCog size={16} /> <span>Settings</span>
                            </Link>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <FaSignOutAlt size={16} /> <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;