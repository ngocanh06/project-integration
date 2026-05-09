// frontend/src/pages/Attendance/AttendanceList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaPlus, FaEdit, FaTrash, FaSearch, 
    FaChevronLeft, FaChevronRight, FaArrowUp, FaArrowDown,
    FaDownload
} from 'react-icons/fa';
import { getAttendance, deleteAttendance } from '../../services/attendanceService';
import { getEmployees } from '../../services/employeeService';
import '../../styles/attendance.css';

const AttendanceList = () => {
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [sortField, setSortField] = useState('AttendanceMonth');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Lấy danh sách tháng cho filter
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
            const [attData, empData] = await Promise.all([
                getAttendance(),
                getEmployees()
            ]);
            setAttendance(attData);
            setEmployees(empData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedRecord) {
            try {
                await deleteAttendance(selectedRecord.AttendanceID);
                fetchData();
                setShowDeleteModal(false);
                setSelectedRecord(null);
            } catch (error) {
                console.error('Delete failed:', error);
                alert(error.response?.data?.error || 'Cannot delete attendance record');
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

    const handleFilter = () => {
        fetchFilteredData();
    };

    const fetchFilteredData = async () => {
        setLoading(true);
        try {
            const data = await getAttendance(selectedMonth, selectedEmployee);
            setAttendance(data);
        } catch (error) {
            console.error('Failed to fetch filtered data:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setSelectedMonth('');
        setSelectedEmployee('');
        fetchData();
    };

    // Filter by search term
    const filteredAttendance = attendance.filter(record => {
        const matchesSearch = searchTerm === '' || 
            record.FullName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Sort
    const sortedAttendance = [...filteredAttendance].sort((a, b) => {
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
    const totalPages = Math.ceil(sortedAttendance.length / itemsPerPage);
    const paginatedAttendance = sortedAttendance.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Export CSV
    const exportToCSV = () => {
        const dataToExport = sortedAttendance.map(record => ({
            'ID': record.AttendanceID,
            'Nhân viên': record.FullName,
            'Tháng': record.AttendanceMonth,
            'Ngày công': record.WorkDays,
            'Nghỉ không phép': record.AbsentDays,
            'Nghỉ phép': record.LeaveDays
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
        link.setAttribute('download', `cham_cong_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="attendance-page">
            <div className="attendance-container">
                <div className="page-header-attendance">
                    <h1>Attendance Management</h1>
                    <Link to="/attendance/add" className="btn-add">
                        <FaPlus /> Add Attendance
                    </Link>
                </div>

                <div className="filters-bar-attendance">
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
                        <button className="btn-filter" onClick={handleFilter}><FaSearch /> Filter</button>
                        <button className="btn-reset" onClick={resetFilters}>Reset</button>
                        <button className="btn-export" onClick={exportToCSV}><FaDownload /> Export</button>
                    </div>
                </div>

                <div className="table-container-attendance">
                    {loading ? (
                        <div className="loading-spinner">Loading...</div>
                    ) : (
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('AttendanceID')}>
                                        ID {sortField === 'AttendanceID' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th onClick={() => handleSort('FullName')}>
                                        Employee {sortField === 'FullName' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th onClick={() => handleSort('AttendanceMonth')}>
                                        Month {sortField === 'AttendanceMonth' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th onClick={() => handleSort('WorkDays')}>
                                        Work Days {sortField === 'WorkDays' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th onClick={() => handleSort('AbsentDays')}>
                                        Absent {sortField === 'AbsentDays' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th onClick={() => handleSort('LeaveDays')}>
                                        Leave {sortField === 'LeaveDays' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAttendance.map(record => (
                                    <tr key={record.AttendanceID}>
                                        <td>{record.AttendanceID}</td>
                                        <td className="employee-name-cell">
                                            {record.FullName}
                                        </td>
                                        <td>{record.AttendanceMonth}</td>
                                        <td className="work-days-cell">{record.WorkDays}</td>
                                        <td className="absent-days-cell">{record.AbsentDays}</td>
                                        <td className="leave-days-cell">{record.LeaveDays}</td>
                                        <td className="actions-cell">
                                            <Link to={`/attendance/edit/${record.AttendanceID}`} className="btn-edit">
                                                <FaEdit />
                                            </Link>
                                            <button 
                                                className="btn-delete" 
                                                onClick={() => {
                                                    setSelectedRecord(record);
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
                        <div className="pagination-attendance">
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
                            <p>Are you sure you want to delete attendance record for <strong>{selectedRecord?.FullName}</strong>?</p>
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

export default AttendanceList;