// frontend/src/pages/Departments/DepartmentList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaPlus, FaEdit, FaTrash, FaSearch, 
    FaChevronLeft, FaChevronRight, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { getDepartments, deleteDepartment } from '../../services/departmentService';
import '../../styles/department.css';

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('DepartmentID');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedDepartment) {
            try {
                await deleteDepartment(selectedDepartment.DepartmentID);
                fetchDepartments();
                setShowDeleteModal(false);
                setSelectedDepartment(null);
            } catch (error) {
                console.error('Delete failed:', error);
                alert(error.response?.data?.msg || 'Cannot delete department with employees');
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

    // Filter departments
    const filteredDepartments = departments.filter(dept => {
        const matchesSearch = searchTerm === '' || 
            dept.DepartmentName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Sort departments
    const sortedDepartments = [...filteredDepartments].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedDepartments.length / itemsPerPage);
    const paginatedDepartments = sortedDepartments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="department-page">
            <div className="department-container">
                {/* Page Header */}
                <div className="page-header-department">
                    <h1>Department Management</h1>
                    <Link to="/departments/add" className="btn-add">
                        <FaPlus /> Add Department
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="search-bar-department">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by department name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Departments Table */}
                <div className="table-container-department">
                    {loading ? (
                        <div className="loading-spinner">Loading...</div>
                    ) : (
                        <table className="department-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('DepartmentID')}>
                                        ID {sortField === 'DepartmentID' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th onClick={() => handleSort('DepartmentName')}>
                                        Department Name {sortField === 'DepartmentName' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDepartments.map(dept => (
                                    <tr key={dept.DepartmentID}>
                                        <td>{dept.DepartmentID}</td>
                                        <td className="department-name-cell">
                                            <span>{dept.DepartmentName}</span>
                                        </td>
                                        <td className="actions-cell">
                                            <Link to={`/departments/edit/${dept.DepartmentID}`} className="btn-edit">
                                                <FaEdit />
                                            </Link>
                                            <button 
                                                className="btn-delete" 
                                                onClick={() => {
                                                    setSelectedDepartment(dept);
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-department">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <FaChevronLeft /> Previous
                            </button>
                            <span className="page-info">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next <FaChevronRight />
                            </button>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete <strong>{selectedDepartment?.DepartmentName}</strong>?</p>
                            <p className="warning-text">This action cannot be undone. Departments with employees cannot be deleted.</p>
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

export default DepartmentList;