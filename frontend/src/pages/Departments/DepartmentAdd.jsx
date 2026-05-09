// frontend/src/pages/Departments/DepartmentAdd.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import { addDepartment } from '../../services/departmentService';
import '../../styles/department.css';

const DepartmentAdd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        DepartmentName: ''
    });
    const [error, setError] = useState('');

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
            await addDepartment(formData);
            navigate('/departments');
        } catch (error) {
            console.error('Add failed:', error);
            setError(error.response?.data?.msg || 'Failed to add department');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="department-page">
            <div className="department-container">
                <div className="form-header-department">
                    <h1>Add New Department</h1>
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
                            <FaSave /> {loading ? 'Saving...' : 'Save Department'}
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

export default DepartmentAdd;