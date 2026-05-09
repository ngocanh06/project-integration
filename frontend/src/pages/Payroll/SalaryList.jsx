// frontend/src/pages/Payroll/SalaryList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaPlus, FaEdit, FaTrash, FaSearch, 
    FaChevronLeft, FaChevronRight, FaArrowUp, FaArrowDown,
    FaDownload, FaChartLine
} from 'react-icons/fa';
import { getPayroll, deleteSalary } from '../../services/payrollService';
import { getEmployees } from '../../services/employeeService';
import { getDepartments } from '../../services/departmentService';
import '../../styles/payroll.css';

const SalaryList = () => {
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [sortField, setSortField] = useState('SalaryMonth');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const months = [
        '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
        '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12',
        '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [salaryData, empData, deptData] = await Promise.all([
                getPayroll(),
                getEmployees(),
                getDepartments()
            ]);
            setSalaries(salaryData);
            setEmployees(empData);
            setDepartments(deptData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedRecord) {
            try {
                await deleteSalary(selectedRecord.SalaryID);
                fetchData();
                setShowDeleteModal(false);
                setSelectedRecord(null);
            } catch (error) {
                console.error('Delete failed:', error);
                alert(error.response?.data?.error || 'Cannot delete salary record');
            }
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
            const data = await getPayroll(selectedMonth, selectedEmployee, selectedDepartment);
            setSalaries(data);
        } catch (error) {
            console.error('Failed to fetch filtered data:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setSelectedMonth('');
        setSelectedEmployee('');
        setSelectedDepartment('');
        fetchData();
    };

    const filteredSalaries = salaries.filter(record => {
        const matchesSearch = searchTerm === '' || 
            record.FullName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const sortedSalaries = [...filteredSalaries].sort((a, b) => {
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

    const totalPages = Math.ceil(sortedSalaries.length / itemsPerPage);
    const paginatedSalaries = sortedSalaries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const exportToCSV = () => {
        const dataToExport = sortedSalaries.map(record => ({
            'ID': record.SalaryID,
            'Nhân viên': record.FullName,
            'Phòng ban': record.DepartmentName || '',
            'Tháng': record.SalaryMonth,
            'Lương cơ bản': record.BaseSalary,
            'Thưởng': record.Bonus,
            'Khấu trừ': record.Deductions,
            'Thực lĩnh': record.NetSalary
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
        link.setAttribute('download', `bang_luong_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="payroll-page">
            <div className="payroll-container">
                <div className="page-header-payroll">
                    <h1>Salary Management</h1>
                    <Link to="/payroll/add" className="btn-add">
                        <FaPlus /> Add Salary
                    </Link>
                </div>

                <div className="filters-bar-payroll">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by employee name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                            <option value="">All Months</option>
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
                            <option value="">All Employees</option>
                            {employees.map(emp => (
                                <option key={emp.EmployeeID} value={emp.EmployeeID}>{emp.FullName}</option>
                            ))}
                        </select>
                        <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.DepartmentID} value={dept.DepartmentID}>{dept.DepartmentName}</option>
                            ))}
                        </select>
                        <button className="btn-filter" onClick={handleFilter}>Filter</button>
                        <button className="btn-reset" onClick={resetFilters}>Reset</button>
                        <button className="btn-export" onClick={exportToCSV}>Export CSV</button>
                    </div>
                </div>

                <div className="table-container-payroll">
                    {loading ? (
                        <div className="loading-spinner">Loading...</div>
                    ) : (
                        <table className="payroll-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('SalaryID')}>ID</th>
                                    <th onClick={() => handleSort('FullName')}>Employee</th>
                                    <th>Department</th>
                                    <th onClick={() => handleSort('SalaryMonth')}>Month</th>
                                    <th onClick={() => handleSort('BaseSalary')}>Base Salary</th>
                                    <th onClick={() => handleSort('Bonus')}>Bonus</th>
                                    <th onClick={() => handleSort('Deductions')}>Deductions</th>
                                    <th onClick={() => handleSort('NetSalary')}>Net Salary</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedSalaries.map(record => (
                                    <tr key={record.SalaryID}>
                                        <td>{record.SalaryID}</td>
                                        <td>{record.FullName}</td>
                                        <td>{record.DepartmentName || '-'}</td>
                                        <td>{record.SalaryMonth}</td>
                                        <td className="salary-cell">{formatCurrency(record.BaseSalary)}</td>
                                        <td className="bonus-cell">{formatCurrency(record.Bonus)}</td>
                                        <td className="deduction-cell">{formatCurrency(record.Deductions)}</td>
                                        <td className="net-salary-cell">{formatCurrency(record.NetSalary)}</td>
                                        <td className="actions-cell">
                                            <Link to={`/payroll/history/${record.EmployeeID}`} className="btn-history" title="View History">
                                                <FaChartLine />
                                            </Link>
                                            
                                        </td>
                                    </tr>
                                ))}
                                {paginatedSalaries.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="no-data">No salary records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="pagination-payroll">
                        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete salary record for <strong>{selectedRecord?.FullName}</strong>?</p>
                            <p className="warning-text">This action cannot be undone.</p>
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button className="btn-confirm-delete" onClick={handleDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalaryList;