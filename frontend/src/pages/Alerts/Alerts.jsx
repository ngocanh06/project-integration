// frontend/src/pages/Alerts/Alerts.jsx
import React, { useState, useEffect } from 'react';
import { FaBell, FaBirthdayCake, FaUmbrellaBeach, FaExclamationTriangle, FaSync, FaEye } from 'react-icons/fa';
import { getAllAlerts, getAnniversaryAlerts, getExcessiveLeaveAlerts, getSalaryDiscrepancyAlerts } from '../../services/alertService';
import '../../styles/alerts.css';

const Alerts = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({
        anniversary: 0,
        excessive_leave: 0,
        salary_discrepancy: 0
    });

    useEffect(() => {
        fetchAlerts();
    }, [activeTab]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            let data = [];
            if (activeTab === 'all') {
                data = await getAllAlerts();
            } else if (activeTab === 'anniversary') {
                data = await getAnniversaryAlerts();
            } else if (activeTab === 'excessive_leave') {
                data = await getExcessiveLeaveAlerts();
            } else if (activeTab === 'salary_discrepancy') {
                data = await getSalaryDiscrepancyAlerts();
            }
            
            setAlerts(data || []);
            
            // Update stats
            const anniversaryData = await getAnniversaryAlerts();
            const excessiveData = await getExcessiveLeaveAlerts();
            const salaryData = await getSalaryDiscrepancyAlerts();
            
            setStats({
                anniversary: anniversaryData?.length || 0,
                excessive_leave: excessiveData?.length || 0,
                salary_discrepancy: salaryData?.length || 0
            });
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAlertIcon = (type) => {
        switch(type) {
            case 'anniversary': return <FaBirthdayCake />;
            case 'excessive_leave': return <FaUmbrellaBeach />;
            case 'salary_discrepancy': return <FaExclamationTriangle />;
            default: return <FaBell />;
        }
    };

    const getAlertClass = (type) => {
        switch(type) {
            case 'anniversary': return 'alert-anniversary';
            case 'excessive_leave': return 'alert-excessive';
            case 'salary_discrepancy': return 'alert-salary';
            default: return '';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return <div className="loading-spinner">Đang tải cảnh báo...</div>;
    }

    return (
        <div className="alerts-page">
            <div className="alerts-header">
                <h1><FaBell /> Cảnh báo & Thông báo</h1>
                <button className="btn-refresh" onClick={fetchAlerts}>
                    <FaSync /> Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="alerts-stats">
                <div className="stat-card" onClick={() => setActiveTab('anniversary')}>
                    <div className="stat-icon anniversary">
                        <FaBirthdayCake />
                    </div>
                    <div className="stat-info">
                        <h3>Kỷ niệm làm việc</h3>
                        <p className="stat-count">{stats.anniversary}</p>
                    </div>
                </div>
                <div className="stat-card" onClick={() => setActiveTab('excessive_leave')}>
                    <div className="stat-icon excessive">
                        <FaUmbrellaBeach />
                    </div>
                    <div className="stat-info">
                        <h3>Nghỉ quá nhiều</h3>
                        <p className="stat-count">{stats.excessive_leave}</p>
                    </div>
                </div>
                <div className="stat-card" onClick={() => setActiveTab('salary_discrepancy')}>
                    <div className="stat-icon salary">
                        <FaExclamationTriangle />
                    </div>
                    <div className="stat-info">
                        <h3>Lương bất thường</h3>
                        <p className="stat-count">{stats.salary_discrepancy}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="alerts-tabs">
                <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    Tất cả ({alerts.length})
                </button>
                <button className={`tab ${activeTab === 'anniversary' ? 'active' : ''}`} onClick={() => setActiveTab('anniversary')}>
                    Kỷ niệm ({stats.anniversary})
                </button>
                <button className={`tab ${activeTab === 'excessive_leave' ? 'active' : ''}`} onClick={() => setActiveTab('excessive_leave')}>
                    Nghỉ quá nhiều ({stats.excessive_leave})
                </button>
                <button className={`tab ${activeTab === 'salary_discrepancy' ? 'active' : ''}`} onClick={() => setActiveTab('salary_discrepancy')}>
                    Lương bất thường ({stats.salary_discrepancy})
                </button>
            </div>

            {/* Alerts List */}
            <div className="alerts-list">
                {alerts.length > 0 ? (
                    alerts.map((alert, index) => (
                        <div key={index} className={`alert-item ${getAlertClass(alert.type)}`}>
                            <div className="alert-icon">
                                {getAlertIcon(alert.type)}
                            </div>
                            <div className="alert-content">
                                <div className="alert-title">{alert.title}</div>
                                <div className="alert-message">{alert.message}</div>
                                {alert.type === 'anniversary' && (
                                    <div className="alert-detail">
                                        <span className="detail-label">Nhân viên:</span> {alert.employee_name}
                                        <span className="detail-label">Số năm:</span> {alert.years} năm
                                    </div>
                                )}
                                {alert.type === 'excessive_leave' && (
                                    <div className="alert-detail">
                                        <span className="detail-label">Nhân viên:</span> {alert.employee_name}
                                        <span className="detail-label">Nghỉ:</span> {alert.total_off} ngày
                                        <span className="detail-label">Tháng:</span> {alert.month}
                                    </div>
                                )}
                                {alert.type === 'salary_discrepancy' && (
                                    <div className="alert-detail">
                                        <span className="detail-label">Nhân viên:</span> {alert.employee_name}
                                        <span className="detail-label">Thay đổi:</span> {alert.change_percent}%
                                        <span className="detail-label">Từ:</span> {formatCurrency(alert.previous_salary)}
                                        <span className="detail-label">Đến:</span> {formatCurrency(alert.current_salary)}
                                    </div>
                                )}
                                <div className="alert-date">{alert.created_at || new Date().toLocaleDateString()}</div>
                            </div>
                            <div className="alert-status">
                                <span className="status-badge">Mới</span>
                                <button className="btn-view">
                                    <FaEye /> Xem
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-alerts">
                        <FaBell size={48} />
                        <p>Không có cảnh báo nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;