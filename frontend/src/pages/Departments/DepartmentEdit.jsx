// frontend/src/pages/Departments/DepartmentEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import { getDepartmentById, updateDepartment } from '../../services/departmentService';
import '../../styles/department.css';

const DepartmentEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        DepartmentName: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDepartment();
    }, [id]);

    const fetchDepartment = async () => {
        setFetching(true);
        try {
            const data = await getDepartmentById(id);
            setFormData({
                DepartmentName: data.DepartmentName || ''
            });
        } catch (error) {
            console.error('Failed to fetch department:', error);
            setError('Department not found');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.DepartmentName.trim()) {
            setError('Department name is required');
            return;
        }
        
        setLoading(true);
        try {
            await updateDepartment(id, formData);
            navigate('/departments');
        } catch (error) {
            console.error('Update failed:', error);
            setError(error.response?.data?.msg || 'Failed to update department');
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

    return (
        <div className="department-page">
            <div className="department-container">
                <div className="form-header-department">
                    <h1>Edit Department</h1>
                    <button className="btn-back" onClick={() => navigate('/departments')}>
                        <FaTimes /> Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="department-form">
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="form-group-department">
                        <label>Department Name *</label>
                        <input
                            type="text"
                            name="DepartmentName"
                            value={formData.DepartmentName}
                            onChange={handleChange}
                            placeholder="Enter department name"
                            required
                        />
                    </div>

                    <div className="form-actions-department">
                        <button type="submit" className="btn-submit" disabled={loading}>
                            <FaSave /> {loading ? 'Saving...' : 'Update Department'}
                        </button>
                        <button type="button" className="btn-cancel" onClick={() => navigate('/departments')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DepartmentEdit;