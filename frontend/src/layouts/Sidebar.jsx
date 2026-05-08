import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Grid, Briefcase, Users, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <aside className="corp-sidebar">
            {/* Logo */}
            <div className="corp-sidebar-logo">
                <div className="corp-logo-icon">
                    <LayoutDashboard size={18} color="white" />
                </div>
                <div className="corp-logo-text">
                    <span className="corp-logo-name">CorpManager</span>
                    <span className="corp-logo-sub">HR Administration</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="corp-sidebar-nav">
                <Link
                    to="/employees"
                    className={`corp-nav-item ${isActive('/employees') ? 'active' : ''}`}
                >
                    <Users size={18} />
                    <span>Employees</span>
                </Link>
                <Link
                    to="/departments"
                    className={`corp-nav-item ${isActive('/departments') ? 'active' : ''}`}
                >
                    <Grid size={18} />
                    <span>Departments</span>
                </Link>
                <Link
                    to="/positions"
                    className={`corp-nav-item ${isActive('/positions') ? 'active' : ''}`}
                >
                    <Briefcase size={18} />
                    <span>Positions</span>
                </Link>
            </nav>

            {/* Bottom actions */}
            <div className="corp-sidebar-bottom">
                <div className="corp-nav-divider" />
                <Link to="#" className="corp-nav-item">
                    <Settings size={18} />
                    <span>Settings</span>
                </Link>
                <button className="corp-nav-item corp-logout-btn" onClick={onLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
