// frontend/src/pages/Reports/ReportsAttendance.jsx
import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaChartLine, FaBirthdayCake } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getLeaveAbsenceRate, getMonthlyAttendanceSummary } from '../../services/reportService';
import '../../styles/reports.css';

const ReportsAttendance = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(2024);
    const [leaveRate, setLeaveRate] = useState(null);
    const [monthlySummary, setMonthlySummary] = useState([]);

    const years = [2023, 2024, 2025];

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leave, monthly] = await Promise.all([
                getLeaveAbsenceRate(selectedYear),
                getMonthlyAttendanceSummary(selectedYear)
            ]);
            setLeaveRate(leave);
            setMonthlySummary(monthly);
        } catch (error) {
            console.error('Failed to fetch attendance reports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="reports-page">
            <div className="reports-header">
                <h1>Attendance Reports</h1>
                <div className="header-actions">
                    <button 
                        className="btn-anniversary-alert" 
                        onClick={() => navigate('/alerts/anniversary')}
                    >
                        <FaBirthdayCake /> Work Anniversary Alerts
                    </button>
                    <div className="filter-group">
                        <label>Year:</label>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="reports-summary">
                <div className="summary-card">
                    <div className="summary-icon red">
                        <FaCalendarAlt size={28} />
                    </div>
                    <div className="summary-info">
                        <h3>Leave Rate</h3>
                        <p className="summary-value">{leaveRate?.leave_rate || 0}%</p>
                        <span className="summary-sub">Total leave: {leaveRate?.total_leave || 0} days</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon orange">
                        <FaChartLine size={28} />
                    </div>
                    <div className="summary-info">
                        <h3>Absence Rate</h3>
                        <p className="summary-value">{leaveRate?.absence_rate || 0}%</p>
                        <span className="summary-sub">Total absent: {leaveRate?.total_absent || 0} days</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon green">
                        <FaCalendarAlt size={28} />
                    </div>
                    <div className="summary-info">
                        <h3>Total Work Days</h3>
                        <p className="summary-value">{leaveRate?.total_work_days || 0}</p>
                        <span className="summary-sub">Records: {leaveRate?.total_records || 0}</span>
                    </div>
                </div>
            </div>

            <div className="reports-section">
                <h2><FaChartLine /> Monthly Attendance Summary {selectedYear}</h2>
                <div className="table-container">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Work Days</th>
                                <th>Absent Days</th>
                                <th>Leave Days</th>
                                <th>Records</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlySummary.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.month}</td>
                                    <td className="work-cell">{item.total_work}</td>
                                    <td className="absent-cell">{item.total_absent}</td>
                                    <td className="leave-cell">{item.total_leave}</td>
                                    <td className="count-cell">{item.records}</td>
                                </tr>
                            ))}
                            {monthlySummary.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="no-data">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsAttendance;