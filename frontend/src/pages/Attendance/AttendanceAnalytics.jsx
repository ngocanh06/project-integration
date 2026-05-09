// frontend/src/pages/Attendance/AttendanceAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { FaChartLine, FaCalendarAlt, FaBuilding, FaUserClock, FaDownload, FaUsers } from 'react-icons/fa';
import { getAttendanceAnalytics } from '../../services/attendanceService';
import '../../styles/attendance.css';

const AttendanceAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [selectedYear, setSelectedYear] = useState(2024);
    const [selectedMonth, setSelectedMonth] = useState('');

    const years = [2023, 2024, 2025, 2026];
    const months = [
        { value: '', label: 'Tất cả' },
        { value: '1', label: 'Tháng 1' },
        { value: '2', label: 'Tháng 2' },
        { value: '3', label: 'Tháng 3' },
        { value: '4', label: 'Tháng 4' },
        { value: '5', label: 'Tháng 5' },
        { value: '6', label: 'Tháng 6' },
        { value: '7', label: 'Tháng 7' },
        { value: '8', label: 'Tháng 8' },
        { value: '9', label: 'Tháng 9' },
        { value: '10', label: 'Tháng 10' },
        { value: '11', label: 'Tháng 11' },
        { value: '12', label: 'Tháng 12' }
    ];

    useEffect(() => {
        fetchAnalytics();
    }, [selectedYear, selectedMonth]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const data = await getAttendanceAnalytics(selectedYear, selectedMonth);
            console.log('Dữ liệu từ API:', data);
            setAnalytics(data);
        } catch (error) {
            console.error('Lỗi fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!analytics || !analytics.raw_data) return;
        
        const dataToExport = analytics.raw_data.map(record => ({
            'Nhân viên': record.FullName,
            'Phòng ban': record.Department,
            'Tháng': record.Month,
            'Ngày công': record.WorkDays,
            'Nghỉ không phép': record.AbsentDays,
            'Nghỉ phép': record.LeaveDays
        }));
        
        const headers = Object.keys(dataToExport[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of dataToExport) {
            const values = headers.map(header => {
                const value = row[header] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `thong_ke_cham_cong_${selectedYear}${selectedMonth ? '_thang_' + selectedMonth : ''}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="loading-spinner">Đang tải dữ liệu...</div>;
    }

    if (!analytics || !analytics.summary) {
        return <div className="loading-spinner">Không có dữ liệu</div>;
    }

    return (
        <div className="attendance-analytics-page">
            <div className="attendance-container">
                <div className="page-header-attendance">
                    <h1>Thống kê chấm công</h1>
                    <div className="header-actions">
                        <button className="btn-export" onClick={exportToCSV}>
                            <FaDownload /> Xuất CSV
                        </button>
                    </div>
                </div>

                {/* Bộ lọc */}
                <div className="analytics-filters">
                    <div className="filter-group">
                        <label>Năm:</label>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Tháng:</label>
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                            {months.map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Thẻ tổng hợp */}
                <div className="analytics-summary">
                    <div className="summary-card">
                        <div className="summary-icon blue">
                            <FaUserClock size={24} />
                        </div>
                        <div className="summary-info">
                            <h3>Tổng số bản ghi</h3>
                            <p className="summary-value">{analytics.summary.total_records || 0}</p>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon green">
                            <FaChartLine size={24} />
                        </div>
                        <div className="summary-info">
                            <h3>Tổng ngày công</h3>
                            <p className="summary-value">{analytics.summary.total_work_days || 0}</p>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon red">
                            <FaBuilding size={24} />
                        </div>
                        <div className="summary-info">
                            <h3>Tổng nghỉ không phép</h3>
                            <p className="summary-value">{analytics.summary.total_absent_days || 0}</p>
                            <span className="summary-rate">({analytics.summary.absence_rate || 0}%)</span>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon orange">
                            <FaCalendarAlt size={24} />
                        </div>
                        <div className="summary-info">
                            <h3>Tổng nghỉ có phép</h3>
                            <p className="summary-value">{analytics.summary.total_leave_days || 0}</p>
                            <span className="summary-rate">({analytics.summary.leave_rate || 0}%)</span>
                        </div>
                    </div>
                </div>

                {/* Top 5 nhân viên nghỉ nhiều */}
                <div className="analytics-section">
                    <h2><FaUsers /> Top 5 nhân viên nghỉ nhiều nhất</h2>
                    <div className="table-container-attendance">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Nhân viên</th>
                                    <th>Tổng nghỉ không phép</th>
                                    <th>Tổng nghỉ có phép</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.top_absent_employees && analytics.top_absent_employees.length > 0 ? (
                                    analytics.top_absent_employees.map((emp, idx) => (
                                        <tr key={idx}>
                                            <td>{emp.FullName}</td>
                                            <td className="absent-cell">{emp.TotalAbsent || 0}</td>
                                            <td className="leave-cell">{emp.TotalLeave || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="no-data">Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Thống kê theo phòng ban */}
                <div className="analytics-section">
                    <h2><FaBuilding /> Thống kê theo phòng ban</h2>
                    <div className="table-container-attendance">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Phòng ban</th>
                                    <th>Số nhân viên</th>
                                    <th>Tổng nghỉ không phép</th>
                                    <th>Tổng nghỉ có phép</th>
                                    <th>TB nghỉ/người</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.department_analytics && analytics.department_analytics.length > 0 ? (
                                    analytics.department_analytics.map((dept, idx) => (
                                        <tr key={idx}>
                                            <td>{dept.department}</td>
                                            <td>{dept.employee_count}</td>
                                            <td className="absent-cell">{dept.total_absent || 0}</td>
                                            <td className="leave-cell">{dept.total_leave || 0}</td>
                                            <td>{dept.avg_absent || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-data">Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chi tiết dữ liệu */}
                <div className="analytics-section">
                    <h2>Chi tiết dữ liệu chấm công</h2>
                    <div className="table-container-attendance">
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Nhân viên</th>
                                    <th>Phòng ban</th>
                                    <th>Tháng</th>
                                    <th>Ngày công</th>
                                    <th>Nghỉ không phép</th>
                                    <th>Nghỉ phép</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.raw_data && analytics.raw_data.length > 0 ? (
                                    analytics.raw_data.map((record, idx) => (
                                        <tr key={idx}>
                                            <td>{record.FullName}</td>
                                            <td>{record.Department}</td>
                                            <td>{record.Month}</td>
                                            <td className="work-cell">{record.WorkDays || 0}</td>
                                            <td className="absent-cell">{record.AbsentDays || 0}</td>
                                            <td className="leave-cell">{record.LeaveDays || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-data">Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceAnalytics;