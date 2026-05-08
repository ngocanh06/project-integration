import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';

const Header = ({ onLogout }) => {
    return (
        <header className="app-header">
            <div className="header-left">
                <div className="header-search">
                    <Search size={16} className="search-icon" />
                    <input type="text" placeholder="Search departments, managers or IDs..." />
                </div>
            </div>

            <div className="header-right">
                <div className="header-icons">
                    <button className="icon-btn" title="Notifications">
                        <Bell size={17} />
                        <span className="icon-badge">3</span>
                    </button>
                    <button className="icon-btn" title="Help">
                        <HelpCircle size={17} />
                    </button>
                </div>

                <div className="user-profile" onClick={onLogout} title="Logout">
                    <div className="user-info">
                        <p className="user-name">Admin User</p>
                        <p className="user-role">HR Manager</p>
                    </div>
                    <img
                        className="avatar"
                        src="https://ui-avatars.com/api/?name=Admin+User&background=002d5b&color=fff&size=40"
                        alt="Avatar"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
