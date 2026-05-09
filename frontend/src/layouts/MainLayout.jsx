// frontend/src/layouts/MainLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine,
    faBuilding,
    faUsers,
    faCalendarAlt,
    faMoneyBillWave,
    faFileAlt,
    faEllipsisH,
    faQuestionCircle,
    faComments,
    faCog,
    faChevronDown,
    faChevronRight,
    faUserTag,
    faGift
} from '@fortawesome/free-solid-svg-icons';
import Header from './Header';
import '../styles/dashboard.css';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expanded, setExpanded] = useState({
        employee: false,
        attendance: false,
        report: false,
        dividend: false
    });
    const [openMenus, setOpenMenus] = useState({
        employee: false,
        attendance: false,
        report: false,
        dividend: false
    });
    const location = useLocation();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleMenu = (menu) => {
        setExpanded({
            ...expanded,
            [menu]: !expanded[menu]
        });
    };

    return (
        <div className="dashboard-app">
            <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

            <div className="dashboard-layout">
                {/* Sidebar */}
                <div className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
                    <ul className="nav-items">
                        <li className={location.pathname === '/dashboard' ? 'active' : ''}>
                            <Link to="/dashboard">
                                <FontAwesomeIcon icon={faChartLine} />
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li className={location.pathname === '/departments' ? 'active' : ''}>
                            <Link to="/departments">
                                <FontAwesomeIcon icon={faBuilding} />
                                <span>Department</span>
                            </Link>
                        </li>

                        <li className={location.pathname === '/positions' || location.pathname.startsWith('/positions/') ? 'active' : ''}>
                            <Link to="/positions">
                                <FontAwesomeIcon icon={faUserTag} />
                                <span>Position</span>
                            </Link>
                        </li>


                        {/* Employee - có dropdown */}
                        <li>
                            <div className="nav-item-parent" onClick={() => toggleMenu('employee')}>
                                <FontAwesomeIcon icon={faUsers} />
                                <span>Employee</span>
                                <FontAwesomeIcon
                                    icon={expanded.employee ? faChevronDown : faChevronRight}
                                    className="nav-arrow"
                                />
                            </div>
                            {expanded.employee && (
                                <ul className="nav-submenu">
                                    <li><Link to="/employees"><span className="submenu-icon">▸</span> Employee List</Link></li>
                                    <li><Link to="/employees/add"><span className="submenu-icon">▸</span> Add Employee</Link></li>
                                </ul>
                            )}
                        </li>

                        {/* Attendance - có dropdown */}
                        <li>
                            <div className="nav-item-parent" onClick={() => toggleMenu('attendance')}>
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                <span>Attendance</span>
                                <FontAwesomeIcon
                                    icon={expanded.attendance ? faChevronDown : faChevronRight}
                                    className="nav-arrow"
                                />
                            </div>
                            {expanded.attendance && (
                                <ul className="nav-submenu">
                                    <li><Link to="/attendance"><span className="submenu-icon">▸</span> Attendance List</Link></li>
                                    <li><Link to="/attendance/analytics"><span className="submenu-icon">▸</span> Attendance Analytics</Link></li>
                                </ul>
                            )}
                        </li>
                        <li>
                            <Link to="/payroll">
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                                <span>Salary</span>
                            </Link>
                        </li>
                        {/* Report - có dropdown */}
                        <li>
                            <div className="nav-item-parent" onClick={() => toggleMenu('report')}>
                                <FontAwesomeIcon icon={faFileAlt} />
                                <span>Report</span>
                                <FontAwesomeIcon
                                    icon={expanded.report ? faChevronDown : faChevronRight}
                                    className="nav-arrow"
                                />
                            </div>
                            {expanded.report && (
                                <ul className="nav-submenu">
                                    <li><Link to="/reports/hr"><span className="submenu-icon">▸</span> HR Report</Link></li>
                                    <li><Link to="/reports/payroll"><span className="submenu-icon">▸</span> Payroll Report</Link></li>
                                    <li><Link to="/reports/attendance"><span className="submenu-icon">▸</span> Attendance Report</Link></li>
                                    <li><Link to="/reports/dividends"><span className="submenu-icon">▸</span> Dividends Report</Link></li>
                                </ul>
                            )}
                        </li>

                        {/* Dividends - giống hệt Employee, Attendance, Report */}
                        <li>
                            <div className="nav-item-parent" onClick={() => toggleMenu('dividend')}>
                                <FontAwesomeIcon icon={faGift} />
                                <span>Dividends</span>
                                <FontAwesomeIcon
                                    icon={expanded.dividend ? faChevronDown : faChevronRight}
                                    className="nav-arrow"
                                />
                            </div>
                            {expanded.dividend && (
                                <ul className="nav-submenu">
                                    <li><Link to="/dividends"><span className="submenu-icon">▸</span> Dividend List</Link></li>
                                    <li><Link to="/dividends/per-employee"><span className="submenu-icon">▸</span> Per Employee</Link></li>
                                </ul>
                            )}
                        </li>


                        <li>
                            <span>
                                <FontAwesomeIcon icon={faEllipsisH} />
                                <span>Others</span>
                            </span>
                        </li>
                        <li>
                            <span>
                                <FontAwesomeIcon icon={faQuestionCircle} />
                                <span>Guide</span>
                            </span>
                        </li>
                        <li>
                            <span>
                                <FontAwesomeIcon icon={faComments} />
                                <span>Messenger</span>
                            </span>
                        </li>
                        <li>
                            <span>
                                <FontAwesomeIcon icon={faCog} />
                                <span>Settings</span>
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Nội dung thay đổi theo route */}
                <div className="main-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;