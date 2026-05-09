// frontend/src/pages/Dividends/DividendPerEmployee.jsx
import React, { useState, useEffect } from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight, FaDownload } from 'react-icons/fa';
import api from '../../utils/api';
import '../../styles/dividend.css';

const DividendPerEmployee = () => {
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const years = ['2023', '2024', '2025', '2026'];

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = '/dividends';
            if (selectedYear) url += `?year=${selectedYear}`;
            const response = await api.get(url);
            const data = response.data;
            
            const employeeMap = new Map();
            data.forEach(div => {
                if (!employeeMap.has(div.EmployeeID)) {
                    employeeMap.set(div.EmployeeID, {
                        EmployeeID: div.EmployeeID,
                        FullName: div.FullName,
                        DepartmentName: div.DepartmentName || 'Chưa xác định',
                        TotalAmount: 0,
                        Count: 0,
                        LastDate: div.DividendDate
                    });
                }
                const emp = employeeMap.get(div.EmployeeID);
                emp.TotalAmount += div.DividendAmount;
                emp.Count += 1;
                if (div.DividendDate > emp.LastDate) {
                    emp.LastDate = div.DividendDate;
                }
            });
            
            setEmployees(Array.from(employeeMap.values()));
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const exportToCSV = () => {
        const dataToExport = filteredEmployees.map(emp => ({
            'ID': emp.EmployeeID,
            'Nhân viên': emp.FullName,
            'Phòng ban': emp.DepartmentName,
            'Tổng cổ tức': emp.TotalAmount,
            'Số lần nhận': emp.Count,
            'Lần cuối': emp.LastDate
        }));
        
        if (dataToExport.length === 0) {
            alert('Không có dữ liệu để xuất');
            return;
        }
        
        const headers = Object.keys(dataToExport[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of dataToExport) {
            const values = headers.map(header => {
                let value = row[header] || '';
                if (typeof value === 'string' && value.includes(',')) {
                    value = `"${value}"`;
                }
                return value;
            });
            csvRows.push(values.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `co_tuc_theo_nhan_vien_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    const filteredEmployees = employees.filter(emp =>
        emp.FullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return <div className="loading-spinner">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="dividend-page">
            <div className="dividend-container">
                <div className="page-header-dividend">
                    <h1>Cổ tức theo nhân viên</h1>
                </div>

                <div className="filters-bar-dividend">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên nhân viên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                            <option value="">Tất cả năm</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button className="btn-export" onClick={exportToCSV}>
                            <FaDownload /> Xuất CSV
                        </button>
                    </div>
                </div>

                <div className="table-container-dividend">
                    <table className="dividend-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nhân viên</th>
                                <th>Phòng ban</th>
                                <th>Tổng cổ tức</th>
                                <th>Số lần nhận</th>
                                <th>Lần cuối</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedEmployees.length > 0 ? (
                                paginatedEmployees.map(emp => (
                                    <tr key={emp.EmployeeID}>
                                        <td>{emp.EmployeeID}</td>
                                        <td>{emp.FullName}</td>
                                        <td>{emp.DepartmentName}</td>
                                        <td className="amount-cell">{formatCurrency(emp.TotalAmount)}</td>
                                        <td>{emp.Count}</td>
                                        <td>{emp.LastDate}</td>
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

                {totalPages > 1 && (
                    <div className="pagination-dividend">
                        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                            <FaChevronLeft /> Trước
                        </button>
                        <span>Trang {currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                            Sau <FaChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DividendPerEmployee;