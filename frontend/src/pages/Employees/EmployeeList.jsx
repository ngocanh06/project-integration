// frontend/src/pages/Employees/EmployeeList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaPlus, FaEdit, FaTrash, FaSearch, 
    FaFilter, FaDownload, FaChevronLeft, 
    FaChevronRight, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { getEmployees, deleteEmployee } from '../../services/employeeService';
import { getDepartments } from '../../services/departmentService';
import '../../styles/employee.css';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortField, setSortField] = useState('EmployeeID');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const statuses = ['Đang làm việc', 'Nghỉ phép', 'Thử việc', 'Nghỉ việc'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [emps, depts] = await Promise.all([
                getEmployees(),
                getDepartments()
            ]);
            setEmployees(emps);
            setDepartments(depts);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedEmployee) {
            try {
                await deleteEmployee(selectedEmployee.EmployeeID);
                fetchData();
                setShowDeleteModal(false);
                setSelectedEmployee(null);
            } catch (error) {
                console.error('Delete failed:', error);
                alert(error.response?.data?.error || 'Cannot delete employee with existing records');
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

    // Export to CSV
    const exportToCSV = () => {
        const dataToExport = sortedEmployees.map(emp => ({
            'ID': emp.EmployeeID,
            'Họ tên': emp.FullName,
            'Phòng ban': emp.DepartmentName || '',
            'Chức vụ': emp.PositionName || '',
            'Email': emp.Email || '',
            'Trạng thái': emp.Status || ''
        }));
        
        if (dataToExport.length === 0) {
            alert('Không có dữ liệu để xuất');
            return;
        }
        
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
        link.setAttribute('download', `nhan_vien_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    // Filter employees
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = searchTerm === '' || 
            emp.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.EmployeeID?.toString().includes(searchTerm) ||
            emp.Email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDept === '' || emp.DepartmentID === parseInt(selectedDept);
        const matchesStatus = selectedStatus === '' || emp.Status === selectedStatus;
        return matchesSearch && matchesDept && matchesStatus;
    });

    // Sort employees
    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
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
    const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
    const paginatedEmployees = sortedEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'Đang làm việc': return 'status-active';
            case 'Nghỉ phép': return 'status-leave';
            case 'Thử việc': return 'status-trial';
            case 'Nghỉ việc': return 'status-inactive';
            default: return 'status-active';
        }
    };

    return (
        <div className="employee-page">
            <div className="employee-container">
                <div className="page-header-employee">
                    <h1>Employee Management</h1>
                    <Link to="/employees/add" className="btn-add">
                        <FaPlus /> Add Employee
                    </Link>
                </div>

                <div className="filters-bar">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name, ID or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                            <option value="">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.DepartmentID} value={dept.DepartmentID}>{dept.DepartmentName}</option>
                            ))}
                        </select>
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                            <option value="">All Status</option>
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <button className="btn-filter"><FaFilter /> Filter</button>
                        <button className="btn-export" onClick={exportToCSV}><FaDownload /> Export</button>
                    </div>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="loading-spinner">Loading...</div>
                    ) : (
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('EmployeeID')}>
                                        ID {sortField === 'EmployeeID' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th onClick={() => handleSort('FullName')}>
                                        Name {sortField === 'FullName' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th>Department</th>
                                    <th>Position</th>
                                    <th>Email</th>
                                    <th onClick={() => handleSort('Status')}>
                                        Status {sortField === 'Status' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedEmployees.map(emp => (
                                    <tr key={emp.EmployeeID}>
                                        <td>{emp.EmployeeID}</td>
                                        <td className="employee-name-cell">
                                            {emp.FullName}
                                        </td>
                                        <td>{emp.DepartmentName || '-'}</td>
                                        <td>{emp.PositionName || '-'}</td>
                                        <td>{emp.Email || '-'}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(emp.Status)}`}>
                                                {emp.Status || 'Đang làm việc'}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <Link to={`/employees/edit/${emp.EmployeeID}`} className="btn-edit">
                                                <FaEdit />
                                            </Link>
                                            <button 
                                                className="btn-delete" 
                                                onClick={() => {
                                                    setSelectedEmployee(emp);
                                                    setShowDeleteModal(true);
                                                }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                                <FaChevronLeft /> Previous
                            </button>
                            <span className="page-info">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                                Next <FaChevronRight />
                            </button>
                        </div>
                    )}
                </div>

                {showDeleteModal && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete <strong>{selectedEmployee?.FullName}</strong>?</p>
                            <p className="warning-text">This action cannot be undone. Employees with salary or dividend records cannot be deleted.</p>
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

export default EmployeeList;