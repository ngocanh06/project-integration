// frontend/src/pages/Departments/DepartmentDelete.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaTrash, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { getDepartmentById, deleteDepartment } from '../../services/departmentService';
import '../../styles/department.css';

const DepartmentDelete = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [department, setDepartment] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDepartment();
    }, [id]);

    const fetchDepartment = async () => {
        setFetching(true);
        try {
            const data = await getDepartmentById(id);
            setDepartment(data);
        } catch (error) {
            console.error('Failed to fetch department:', error);
            setError('Department not found');
        } finally {
            setFetching(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteDepartment(id);
            navigate('/departments');
        } catch (error) {
            console.error('Delete failed:', error);
            setError(error.response?.data?.msg || 'Cannot delete department with employees');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="department-page">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    if (error && !department) {
        return (
            <div className="department-page">
                <div className="error-container">
                    <p>{error}</p>
                    <Link to="/departments" className="btn-back">Back to Departments</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="department-page">
            <div className="department-container">
                <div className="form-header-department">
                    <h1>Delete Department</h1>
                    <Link to="/departments" className="btn-back">
                        <FaArrowLeft /> Cancel
                    </Link>
                </div>

                <div className="delete-confirmation-card">
                    <div className="delete-warning-icon">
                        <FaTrash size={48} />
                    </div>
                    <h3>Are you sure?</h3>
                    <p>You are about to delete department <strong>"{department?.DepartmentName}"</strong></p>
                    <p className="warning-text">This action cannot be undone. Departments that have employees cannot be deleted.</p>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="delete-actions">
                        <Link to="/departments" className="btn-cancel-delete">
                            <FaTimes /> Cancel
                        </Link>
                        <button 
                            className="btn-confirm-delete-department" 
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <FaTrash /> {loading ? 'Deleting...' : 'Yes, Delete Department'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentDelete;