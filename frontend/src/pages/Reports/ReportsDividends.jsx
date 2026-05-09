// frontend/src/pages/Reports/ReportsDividends.jsx
import React, { useState, useEffect } from 'react';
import { FaGift, FaUsers } from 'react-icons/fa';
import { getTotalDividends, getDividendsPerEmployee } from '../../services/reportService';
import '../../styles/reports.css';

const ReportsDividends = () => {
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(2024);
    const [totalDividends, setTotalDividends] = useState(null);
    const [dividendsPerEmployee, setDividendsPerEmployee] = useState([]);

    const years = [2023, 2024, 2025];

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [total, perEmp] = await Promise.all([
                getTotalDividends(selectedYear),
                getDividendsPerEmployee(selectedYear)
            ]);
            setTotalDividends(total);
            setDividendsPerEmployee(perEmp);
        } catch (error) {
            console.error('Failed to fetch dividends reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="reports-page">
            <div className="reports-header">
                <h1>Dividends Reports</h1>
                <div className="filter-group">
                    <label>Year:</label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="reports-summary">
                <div className="summary-card">
                    <div className="summary-icon purple">
                        <FaGift size={28} />
                    </div>
                    <div className="summary-info">
                        <h3>Total Dividends</h3>
                        <p className="summary-value">{formatCurrency(totalDividends?.total_dividends || 0)}</p>
                        <span className="summary-sub">For year {selectedYear}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon blue">
                        <FaUsers size={28} />
                    </div>
                    <div className="summary-info">
                        <h3>Employees Received</h3>
                        <p className="summary-value">{totalDividends?.employee_count || 0}</p>
                        <span className="summary-sub">Total records: {totalDividends?.total_records || 0}</span>
                    </div>
                </div>
            </div>

            <div className="reports-section">
                <h2><FaGift /> Dividends per Employee</h2>
                <div className="table-container">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Employee Name</th>
                                <th>Department</th>
                                <th>Total Dividends</th>
                                <th>Times Received</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dividendsPerEmployee.length > 0 ? (
                                dividendsPerEmployee.map((emp, idx) => (
                                    <tr key={idx}>
                                        <td>{emp.EmployeeID}</td>
                                        <td>{emp.FullName}</td>
                                        <td>{emp.DepartmentName}</td>
                                        <td className="amount-cell">{formatCurrency(emp.total_dividends)}</td>
                                        <td className="count-cell">{emp.dividend_count}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">No dividend data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsDividends;