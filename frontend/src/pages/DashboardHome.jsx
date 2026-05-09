// frontend/src/pages/DashboardHome.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faUsers,
  faMoneyBillWave,
  faDownload,
  faChevronDown,
  faArrowUp,
  faBoxArchive,
  faEye,
  faUserPlus,
  faFileAlt,
  faGift,
  faUserClock,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { getEmployeeCount, getDepartmentDistribution, getSalaryByDepartment, getTotalDividends } from '../services/reportService';
import { getPayrollSummary } from '../services/payrollService';
import { getAttendanceStats } from '../services/attendanceService';
import '../styles/dashboard.css';

const DashboardHome = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('monthly');
    
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [departmentData, setDepartmentData] = useState([]);
    const [salaryByDept, setSalaryByDept] = useState([]);
    const [payrollSummary, setPayrollSummary] = useState(null);
    const [dividendsTotal, setDividendsTotal] = useState(0);
    const [attendanceStats, setAttendanceStats] = useState({ total_leave: 0, total_absent: 0 });
    
    const recentActivities = [
        { id: 1, title: 'Nhân viên mới gia nhập', date: '2 giờ trước', icon: faUserPlus, insight: '+2%' },
        { id: 2, title: 'Báo cáo lương tháng 9', date: '5 giờ trước', icon: faFileAlt, insight: '+5%' },
        { id: 3, title: 'Kỷ niệm làm việc', date: '1 ngày trước', icon: faGift, insight: '+3%' },
        { id: 4, title: 'Cổ tức quý 3', date: '2 ngày trước', icon: faMoneyBillWave, insight: '+2%' },
        { id: 5, title: 'Họp phòng ban', date: '3 ngày trước', icon: faBuilding, insight: '0%' },
        { id: 6, title: 'Chấm công tháng 9', date: '5 ngày trước', icon: faUserClock, insight: '+8%' }
    ];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const empCount = await getEmployeeCount();
            setTotalEmployees(empCount.total_employees || 0);
            
            const deptDist = await getDepartmentDistribution();
            setDepartmentData(deptDist || []);
            
            const salaryDept = await getSalaryByDepartment(2024);
            setSalaryByDept(salaryDept || []);
            
            const payroll = await getPayrollSummary(null, 2024);
            setPayrollSummary(payroll);
            
            const divTotal = await getTotalDividends(2024);
            setDividendsTotal(divTotal.total_dividends || 0);
            
            const attendStats = await getAttendanceStats();
            setAttendanceStats(attendStats || { total_leave: 0, total_absent: 0 });
            
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0 ₫';
        if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B ₫`;
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(0)}M ₫`;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getMaxSalary = () => {
        if (!salaryByDept.length) return 1;
        return Math.max(...salaryByDept.map(d => d.total_net));
    };

    if (loading) {
        return <div className="loading-spinner">Đang tải dữ liệu...</div>;
    }

    return (
        <>
            {/* 3 thẻ thống kê */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Tổng nhân viên</span>
                        <div className="stat-icon blue">
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                    </div>
                    <div className="stat-value">{totalEmployees}</div>
                    <div className="stat-change positive">
                        <FontAwesomeIcon icon={faArrowUp} /> +12%
                        <span className="stat-sub">tháng trước</span>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Nghỉ phép</span>
                        <div className="stat-icon orange">
                            <FontAwesomeIcon icon={faUserClock} />
                        </div>
                    </div>
                    <div className="stat-value">{attendanceStats.total_leave}</div>

                </div>
                
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>Tổng chi phí lương</span>
                        <div className="stat-icon green">
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                        </div>
                    </div>
                    <div className="stat-value">{formatCurrency(payrollSummary?.summary?.total_net_salary || 0)}</div>
                    <div className="stat-change positive">
                        <FontAwesomeIcon icon={faArrowUp} /> +9%
                        <span className="stat-sub">TB: {formatCurrency(payrollSummary?.summary?.avg_salary || 0)}</span>
                    </div>
                </div>
            </div>

            {/* 2 cột - Nhân viên theo phòng ban và Lương theo phòng ban */}
            <div className="two-columns">
                {/* Left: Nhân viên theo phòng ban */}
                <div className="card">
                    <h3 className="card-title">
                        <FontAwesomeIcon icon={faBuilding} /> Nhân viên theo phòng ban
                    </h3>
                    {departmentData.map((dept, idx) => {
                        const percentage = (dept.count / totalEmployees) * 100;
                        return (
                            <div key={idx} className="dept-item">
                                <span className="dept-name">{dept.department}</span>
                                <div className="dept-bar-wrapper">
                                    <div className="dept-bar" style={{ width: `${percentage}%`, backgroundColor: '#3b82f6' }}></div>
                                </div>
                                <span className="dept-count">{dept.count}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Right: Lương theo phòng ban (Salary by Department) */}
                <div className="card">
                    <h3 className="card-title">
                        <FontAwesomeIcon icon={faMoneyBillWave} /> Lương theo phòng ban
                    </h3>
                    {salaryByDept.map((dept, idx) => {
                        const maxSalary = getMaxSalary();
                        const percentage = (dept.total_net / maxSalary) * 100;
                        return (
                            <div key={idx} className="dept-item">
                                <span className="dept-name">{dept.department}</span>
                                <div className="dept-bar-wrapper">
                                    <div className="dept-bar" style={{ width: `${percentage}%`, backgroundColor: '#10b981' }}></div>
                                </div>
                                <span className="dept-count">{formatCurrency(dept.total_net)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Hàng dưới cùng - Hoạt động gần đây */}
            <div className="bottom-row">
                <div className="card">
                    <div className="activity-header">
                        <h3><FontAwesomeIcon icon={faEye} /> Hoạt động gần đây</h3>
                        <button className="month-selector">Tháng này <FontAwesomeIcon icon={faChevronDown} size="xs" /></button>
                    </div>
                    <div className="activity-list">
                        {recentActivities.map(act => (
                            <div key={act.id} className="activity-item">
                                <div className="activity-icon">
                                    <FontAwesomeIcon icon={act.icon} />
                                </div>
                                <div className="activity-info">
                                    <div className="activity-title">{act.title}</div>
                                    <div className="activity-date">{act.date}</div>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="tab-buttons">
                        <button className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => setActiveTab('monthly')}>Tháng</button>
                        <button className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTab('weekly')}>Tuần</button>
                        <button className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>Ngày</button>
                    </div>
                    <div className="dividend-block">
                        <div className="dividend-icon">
                            <FontAwesomeIcon icon={faGift} />
                        </div>
                        <div className="dividend-text">
                            <h4>Cổ tức</h4>
                            <div className="dividend-value">{formatCurrency(dividendsTotal)}</div>
                        </div>
                    </div>
                    <div className="divider"></div>
                    <div className="annual-section">
                        <h4><FontAwesomeIcon icon={faCalendarAlt} /> Hàng năm</h4>
                        <div className="months-list">
                            {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map((month, i) => (
                                <span key={i} className="month-pill">{month}</span>
                            ))}
                        </div>
                    </div>
                    <div className="download-row">
                        <button className="download-btn">
                            <FontAwesomeIcon icon={faDownload} /> Tải CSV
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardHome;