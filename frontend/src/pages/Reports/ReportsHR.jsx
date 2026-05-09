// frontend/src/pages/Reports/ReportsHR.jsx
import React, { useState, useEffect } from 'react';
import { FaUsers, FaFemale, FaMale, FaBuilding } from 'react-icons/fa';
import { getEmployeeCount, getGenderDistribution, getDepartmentDistribution } from '../../services/reportService';
import '../../styles/reports.css';

const ReportsHR = () => {
    const [loading, setLoading] = useState(true);
    const [employeeCount, setEmployeeCount] = useState(0);
    const [genderData, setGenderData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [count, gender, dept] = await Promise.all([
                getEmployeeCount(),
                getGenderDistribution(),
                getDepartmentDistribution()
            ]);
            setEmployeeCount(count.total_employees);
            setGenderData(gender);
            setDepartmentData(dept);
        } catch (error) {
            console.error('Failed to fetch HR reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTotalByGender = (gender) => {
        const item = genderData.find(g => g.gender === gender);
        return item ? item.count : 0;
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="reports-page">
            <div className="reports-header">
                <h1>HR Reports</h1>
            </div>

            <div className="reports-summary">
                <div className="summary-card">
                    <div className="summary-icon blue">
                        <FaUsers size={28} />
                    </div>
                    <div className="summary-info">
                        <h3>Total Employees</h3>
                        <p className="summary-value">{employeeCount}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon pink">
                        <FaFemale size={28} />
                    </div>
                    <div className="summary-info">
                        <h3>Female</h3>
                        <p className="summary-value">{getTotalByGender('Nữ')}</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon blue-light">
                        <FaMale size={28} />
                    </div>
                    <div className="summary-info">
                        <h3>Male</h3>
                        <p className="summary-value">{getTotalByGender('Nam')}</p>
                    </div>
                </div>
            </div>

            <div className="reports-section">
                <h2><FaBuilding /> Department Distribution</h2>
                <div className="table-container">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>Employee Count</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departmentData.map((dept, idx) => (
                                <tr key={idx}>
                                    <td>{dept.department}</td>
                                    <td className="count-cell">{dept.count}</td>
                                    <td className="percent-cell">
                                        {Math.round((dept.count / employeeCount) * 100)}%
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${(dept.count / employeeCount) * 100}%` }}></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="reports-section">
                <h2>Gender Distribution</h2>
                <div className="gender-chart">
                    {genderData.map((item, idx) => (
                        <div key={idx} className="gender-item">
                            <span className="gender-label">{item.gender}</span>
                            <div className="gender-bar-wrapper">
                                <div 
                                    className="gender-bar" 
                                    style={{ width: `${(item.count / employeeCount) * 100}%` }}
                                >
                                    <span>{item.count}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportsHR;