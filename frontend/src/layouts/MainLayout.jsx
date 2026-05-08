import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import '../styles/MainLayout.css';

const MainLayout = ({ onLogout }) => {
    return (
        <div className="main-layout">
            <Sidebar onLogout={onLogout} />
            <div className="content-area">
                <Header onLogout={onLogout} />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
