// frontend/src/pages/Payroll/SalaryHistory.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';
import { getSalaryHistory } from '../../services/payrollService';
import '../../styles/payroll.css';

const SalaryHistory = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);
    const [employeeName, setEmployeeName] = useState('');

    useEffect(() => {
        fetchHistory();
    }, [id]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await getSalaryHistory(id);
            setHistory(data);
            if (data.length > 0) {
                setEmployeeName(data[0].FullName);
            }
        } catch (error) {
            console.error('Failed to fetch salary history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const exportToCSV = () => {
        const dataToExport = history.map(record => ({
            'Tháng': record.SalaryMonth,
            'Lương cơ bản': record.BaseSalary,
            'Thưởng': record.Bonus,
            'Khấu trừ': record.Deductions,
            'Thực lĩnh': record.NetSalary
        }));
        
        const headers = Object.keys(dataToExport[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of dataToExport) {
            const values = headers.map(header => {
                const value = row[header] || '';
                return value;
            });
            csvRows.push(values.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `lich_su_luong_${employeeName}_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="payroll-page">
            <div className="payroll-container">
                <div className="page-header-payroll">
                    <div className="header-left">
                        <Link to="/payroll" className="btn-back">
                            <FaArrowLeft /> Back
                        </Link>
                        <h1>Salary History: {employeeName}</h1>
                    </div>
                    <button className="btn-export" onClick={exportToCSV}>
                        <FaDownload /> Export CSV
                    </button>
                </div>

                <div className="table-container-payroll">
                    <table className="payroll-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Base Salary</th>
                                <th>Bonus</th>
                                <th>Deductions</th>
                                <th>Net Salary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(record => (
                                <tr key={record.SalaryID}>
                                    <td>{record.SalaryMonth}</td>
                                    <td className="salary-cell">{formatCurrency(record.BaseSalary)}</td>
                                    <td className="bonus-cell">{formatCurrency(record.Bonus)}</td>
                                    <td className="deduction-cell">{formatCurrency(record.Deductions)}</td>
                                    <td className="net-salary-cell">{formatCurrency(record.NetSalary)}</td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="no-data">No salary history found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalaryHistory;