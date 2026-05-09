// frontend/src/pages/Dividends/DividendList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaSearch, FaChevronLeft, FaChevronRight, 
    FaArrowUp, FaArrowDown, FaDownload
} from 'react-icons/fa';
import { getDividends } from '../../services/dividendService';
import { getEmployees } from '../../services/employeeService';
import '../../styles/dividend.css';

const DividendList = () => {
    const [dividends, setDividends] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [sortField, setSortField] = useState('DividendDate');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const years = ['2023', '2024', '2025', '2026'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [divData, empData] = await Promise.all([
                getDividends(),
                getEmployees()
            ]);
            setDividends(divData);
            setEmployees(empData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleFilter = async () => {
        setLoading(true);
        try {
            const data = await getDividends(selectedYear, selectedEmployee);
            setDividends(data);
        } catch (error) {
            console.error('Failed to fetch filtered data:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setSelectedYear('');
        setSelectedEmployee('');
        fetchData();
    };

    const exportToCSV = () => {
        const dataToExport = sortedDividends.map(div => ({
            'ID': div.DividendID,
            'Nhân viên': div.FullName,
            'Phòng ban': div.DepartmentName,
            'Số tiền': div.DividendAmount,
            'Ngày chi trả': div.DividendDate
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
        link.setAttribute('download', `co_tuc_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Filter by search term
    const filteredDividends = dividends.filter(div => {
        const matchesSearch = searchTerm === '' || 
            div.FullName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Sort
    const sortedDividends = [...filteredDividends].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (sortField === 'FullName') {
            aVal = aVal?.toLowerCase() || '';
            bVal = bVal?.toLowerCase() || '';
        }
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedDividends.length / itemsPerPage);
    const paginatedDividends = sortedDividends.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="dividend-page">
            <div className="dividend-container">
                <div className="page-header-dividend">
                    <h1>Danh sách cổ tức</h1>
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
                        <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                            <option value="">Tất cả nhân viên</option>
                            {employees.map(emp => (
                                <option key={emp.EmployeeID} value={emp.EmployeeID}>{emp.FullName}</option>
                            ))}
                        </select>
                        <button className="btn-filter" onClick={handleFilter}>Lọc</button>
                        <button className="btn-reset" onClick={resetFilters}>Reset</button>
                        <button className="btn-export" onClick={exportToCSV}>Xuất CSV</button>
                    </div>
                </div>

                <div className="table-container-dividend">
                    {loading ? (
                        <div className="loading-spinner">Đang tải...</div>
                    ) : (
                        <table className="dividend-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('DividendID')}>
                                        ID {sortField === 'DividendID' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th onClick={() => handleSort('FullName')}>
                                        Nhân viên {sortField === 'FullName' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th>Phòng ban</th>
                                    <th onClick={() => handleSort('DividendAmount')}>
                                        Số tiền {sortField === 'DividendAmount' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th onClick={() => handleSort('DividendDate')}>
                                        Ngày chi trả {sortField === 'DividendDate' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDividends.map(div => (
                                    <tr key={div.DividendID}>
                                        <td>{div.DividendID}</td>
                                        <td>{div.FullName}</td>
                                        <td>{div.DepartmentName}</td>
                                        <td className="amount-cell">{formatCurrency(div.DividendAmount)}</td>
                                        <td>{div.DividendDate}</td>
                                    </tr>
                                ))}
                                {paginatedDividends.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="no-data">Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
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

export default DividendList;