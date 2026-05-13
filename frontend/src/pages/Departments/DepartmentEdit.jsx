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
    const [fieldErrors, setFieldErrors] = useState({});

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

    const validateField = (name, value) => {
        let error = '';
        if (name === 'DepartmentName') {
            if (!value.trim()) error = 'Tên phòng ban là bắt buộc';
            else if (value.trim().length < 3) error = 'Tên phòng ban phải có ít nhất 3 ký tự';
        }
        
        setFieldErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validateField(name, value);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateField('DepartmentName', formData.DepartmentName)) {
            setError('Vui lòng nhập tên phòng ban');
            return;
        }
        
        setLoading(true);
        try {
            await updateDepartment(id, formData);
            navigate('/departments');
        } catch (error) {
            console.error('Update failed:', error);
            setError(error.response?.data?.error || 'Failed to update department');
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
                            className={fieldErrors.DepartmentName ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.DepartmentName && <span className="field-error">{fieldErrors.DepartmentName}</span>}
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