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
    faGift,
    faUserShield,
    faUsersCog,
    faLock,
    faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import Header from './Header';
import { getCurrentUser } from '../services/authService';
import '../styles/dashboard.css';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expanded, setExpanded] = useState({
        employee: false,
        attendance: false,
        report: false,
        dividend: false,
        admin: false
    });
    const [openMenus, setOpenMenus] = useState({
        employee: false,
        attendance: false,
        report: false,
        dividend: false
    });
    const location = useLocation();
    
    const currentUser = getCurrentUser();
    const roleId = Number(currentUser?.role || currentUser?.role_id);
    const isAdmin = roleId === 1;
    const isHR = roleId === 2;
    const isPayroll = roleId === 3;
    const isEmployee = roleId === 4;

    // Determine visibility
    const canSeeSystem = isAdmin;
    const canSeeHRCore = isHR;
    const canSeePayrollCore = isPayroll;
    const canSeeGeneral = isHR || isPayroll || isEmployee; // Everyone except strict Admin can see general lists
    const canSeeReports = isHR || isPayroll;

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
                        {/* Dashboard - Ẩn khi Admin */}
                        {!isAdmin && (
                            <li className={location.pathname === '/dashboard' ? 'active' : ''}>
                                <Link to="/dashboard">
                                    <FontAwesomeIcon icon={faChartLine} />
                                    <span>Dashboard</span>
                                </Link>
                            </li>
                        )}

                        {/* Department/Position - Only HR */}
                        {isHR && (
                            <>
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
                            </>
                        )}


                        {/* Employee Menu */}
                        {canSeeGeneral && (
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
                                        {isHR && <li><Link to="/employees/add"><span className="submenu-icon">▸</span> Add Employee</Link></li>}
                                    </ul>
                                )}
                            </li>
                        )}

                        {/* Attendance Menu */}
                        {canSeeGeneral && (
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
                                        {isHR && <li><Link to="/attendance/analytics"><span className="submenu-icon">▸</span> Attendance Analytics</Link></li>}
                                    </ul>
                                )}
                            </li>
                        )}

                        {/* Salary Menu */}
                        {canSeeGeneral && (
                            <li>
                                <Link to="/payroll">
                                    <FontAwesomeIcon icon={faMoneyBillWave} />
                                    <span>Salary</span>
                                </Link>
                            </li>
                        )}

                        {/* Report Menu */}
                        {canSeeReports && (
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
                                        {isHR && (
                                            <>
                                                <li><Link to="/reports/hr"><span className="submenu-icon">▸</span> HR Report</Link></li>
                                                <li><Link to="/reports/attendance"><span className="submenu-icon">▸</span> Attendance Report</Link></li>
                                            </>
                                        )}
                                        {isPayroll && (
                                            <>
                                                <li><Link to="/reports/payroll"><span className="submenu-icon">▸</span> Payroll Report</Link></li>
                                                <li><Link to="/reports/dividends"><span className="submenu-icon">▸</span> Dividends Report</Link></li>
                                            </>
                                        )}
                                    </ul>
                                )}
                            </li>
                        )}

                        {/* Dividends */}
                        {canSeeGeneral && (
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
                                        {isPayroll && <li><Link to="/dividends/per-employee"><span className="submenu-icon">▸</span> Per Employee</Link></li>}
                                    </ul>
                                )}
                            </li>
                        )}

                        {isAdmin && (
                            <li>
                                <div className="nav-item-parent" onClick={() => toggleMenu('admin')}>
                                    <FontAwesomeIcon icon={faUserShield} style={{color: '#f43f5e'}} />
                                    <span style={{color: '#f43f5e', fontWeight: 600}}>Quản trị hệ thống</span>
                                    <FontAwesomeIcon
                                        icon={expanded.admin ? faChevronDown : faChevronRight}
                                        className="nav-arrow"
                                    />
                                </div>
                                {expanded.admin && (
                                    <ul className="nav-submenu">
                                        <li><Link to="/admin/users"><span className="submenu-icon">▸</span> <FontAwesomeIcon icon={faUsersCog} style={{marginRight: 6, fontSize: 11}} /> Tài khoản</Link></li>
                                        <li><Link to="/admin/roles"><span className="submenu-icon">▸</span> <FontAwesomeIcon icon={faUserShield} style={{marginRight: 6, fontSize: 11}} /> Vai trò</Link></li>
                                        <li><Link to="/admin/permissions"><span className="submenu-icon">▸</span> <FontAwesomeIcon icon={faLock} style={{marginRight: 6, fontSize: 11}} /> Quyền hạn</Link></li>
                                        <li><Link to="/admin/audit-logs"><span className="submenu-icon">▸</span> <FontAwesomeIcon icon={faClipboardList} style={{marginRight: 6, fontSize: 11}} /> Nhật ký</Link></li>
                                    </ul>
                                )}
                            </li>
                        )}


                        {!isAdmin && (
                            <>
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
                            </>
                        )}
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