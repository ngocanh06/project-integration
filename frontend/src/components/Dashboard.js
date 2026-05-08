import React, { useState } from 'react';
import Departments from './Departments';
import Positions from './Positions';
import { Users, Briefcase, LogOut, LayoutDashboard } from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('departments');

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>HRPro Core</h2>
                </div>
                <nav className="sidebar-nav">
                    <button 
                        className={activeTab === 'dashboard' ? 'active' : ''} 
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <LayoutDashboard size={20} /> Tổng quan
                    </button>
                    <button 
                        className={activeTab === 'departments' ? 'active' : ''} 
                        onClick={() => setActiveTab('departments')}
                    >
                        <Users size={20} /> Phòng ban
                    </button>
                    <button 
                        className={activeTab === 'positions' ? 'active' : ''} 
                        onClick={() => setActiveTab('positions')}
                    >
                        <Briefcase size={20} /> Chức vụ
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={onLogout} className="logout-btn">
                        <LogOut size={20} /> Đăng xuất
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="content-header">
                    <h1>{activeTab === 'departments' ? 'Quản lý Phòng ban' : activeTab === 'positions' ? 'Quản lý Chức vụ' : 'Tổng quan'}</h1>
                </header>
                <section className="content-body">
                    {activeTab === 'departments' && <Departments />}
                    {activeTab === 'positions' && <Positions />}
                    {activeTab === 'dashboard' && (
                        <div className="welcome-card">
                            <h3>Chào mừng trở lại!</h3>
                            <p>Chọn một mục bên trái để bắt đầu quản lý nhân sự.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
