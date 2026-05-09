// frontend/src/layouts/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaTachometerAlt, 
    FaUsers, 
    // FaBuilding, 
    // FaUserTie, 
    FaMoneyBillWave, 
    FaCalendarCheck, 
    FaChartBar, 
    FaGift, 
    FaBell, 
    FaUserCog,
    FaSignOutAlt,
    FaChevronDown,
    FaChevronRight
} from 'react-icons/fa';

const Sidebar = () => {
    const location = useLocation();
    const [expanded, setExpanded] = useState({
        employee: true,
        attendance: false,
        salary: false,
        report: false
    });

    const toggleMenu = (menu) => {
        setExpanded({
            ...expanded,
            [menu]: !expanded[menu]
        });
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Department</h2>
            </div>

            <nav className="sidebar-nav">
                {/* Dashboard */}
                <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                    <FaTachometerAlt className="nav-icon" />
                    <span>HR System</span>
                </Link>

                {/* Employee Menu */}
                <div className="nav-group">
                    <div className={`nav-item parent ${expanded.employee ? 'expanded' : ''}`} onClick={() => toggleMenu('employee')}>
                        <FaUsers className="nav-icon" />
                        <span>Employee</span>
                        {expanded.employee ? <FaChevronDown className="arrow" /> : <FaChevronRight className="arrow" />}
                    </div>
                    {expanded.employee && (
                        <div className="nav-submenu">
                            <Link to="/employees" className="nav-subitem">Employee List</Link>
                            <Link to="/employees/add" className="nav-subitem">Add Employee</Link>
                            <Link to="/departments" className="nav-subitem">Departments</Link>
                            <Link to="/positions" className="nav-subitem">Positions</Link>
                        </div>
                    )}
                </div>

                {/* Attendance Menu */}
                <div className="nav-group">
                    <div className={`nav-item parent ${expanded.attendance ? 'expanded' : ''}`} onClick={() => toggleMenu('attendance')}>
                        <FaCalendarCheck className="nav-icon" />
                        <span>Attendance</span>
                        {expanded.attendance ? <FaChevronDown className="arrow" /> : <FaChevronRight className="arrow" />}
                    </div>
                    {expanded.attendance && (
                        <div className="nav-submenu">
                            <Link to="/attendance" className="nav-subitem">Attendance List</Link>
                            <Link to="/attendance/analytics" className="nav-subitem">Analytics</Link>
                        </div>
                    )}
                </div>

                {/* Salary Menu */}
                <div className="nav-group">
                    <div className={`nav-item parent ${expanded.salary ? 'expanded' : ''}`} onClick={() => toggleMenu('salary')}>
                        <FaMoneyBillWave className="nav-icon" />
                        <span>Salary</span>
                        {expanded.salary ? <FaChevronDown className="arrow" /> : <FaChevronRight className="arrow" />}
                    </div>
                    {expanded.salary && (
                        <div className="nav-submenu">
                            <Link to="/payroll" className="nav-subitem">Salary List</Link>
                            <Link to="/payroll/history" className="nav-subitem">Salary History</Link>
                        </div>
                    )}
                </div>

                {/* Report Menu */}
                <div className="nav-group">
                    <div className={`nav-item parent ${expanded.report ? 'expanded' : ''}`} onClick={() => toggleMenu('report')}>
                        <FaChartBar className="nav-icon" />
                        <span>Report</span>
                        {expanded.report ? <FaChevronDown className="arrow" /> : <FaChevronRight className="arrow" />}
                    </div>
                    {expanded.report && (
                        <div className="nav-submenu">
                            <Link to="/reports/hr" className="nav-subitem">HR Report</Link>
                            <Link to="/reports/payroll" className="nav-subitem">Payroll Report</Link>
                            <Link to="/reports/attendance" className="nav-subitem">Attendance Report</Link>
                            <Link to="/reports/dividends" className="nav-subitem">Dividends Report</Link>
                        </div>
                    )}
                </div>

                {/* Dividends */}
                <Link to="/dividends" className={`nav-item ${isActive('/dividends') ? 'active' : ''}`}>
                    <FaGift className="nav-icon" />
                    <span>Dividends</span>
                </Link>

                {/* Alerts */}
                <Link to="/alerts" className={`nav-item ${isActive('/alerts') ? 'active' : ''}`}>
                    <FaBell className="nav-icon" />
                    <span>Alerts</span>
                </Link>

                {/* Others / Settings */}
                <div className="nav-group">
                    <div className="nav-item parent" onClick={() => toggleMenu('others')}>
                        <FaUserCog className="nav-icon" />
                        <span>Others</span>
                        <FaChevronRight className="arrow" />
                    </div>
                </div>
            </nav>

            {/* Footer Section */}
            <div className="sidebar-footer">
                <div className="nav-item">
                    <FaUserCog className="nav-icon" />
                    <span>Guide</span>
                </div>
                <div className="nav-item">
                    <FaUserCog className="nav-icon" />
                    <span>Messenger</span>
                </div>
                <div className="nav-item logout">
                    <FaSignOutAlt className="nav-icon" />
                    <span>Settings</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;