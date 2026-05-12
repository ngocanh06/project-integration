// frontend/src/pages/Employees/EmployeeAdd.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import { addEmployee } from '../../services/employeeService';
import { getDepartments } from '../../services/departmentService';
import { getPositions } from '../../services/positionService';
import '../../styles/employee.css';

const EmployeeAdd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        FullName: '',
        DateOfBirth: '',
        Gender: '',
        PhoneNumber: '',
        Email: '',
        HireDate: '',
        DepartmentID: '',
        PositionID: '',
        Status: 'Đang làm việc'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [depts, pos] = await Promise.all([
                getDepartments(),
                getPositions()
            ]);
            setDepartments(depts);
            setPositions(pos);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.FullName || !formData.Email || !formData.HireDate) {
            setError('Full Name, Email and Hire Date are required');
            return;
        }
        
        setLoading(true);
        try {
            await addEmployee(formData);
            navigate('/employees');
        } catch (error) {
            setError(error.response?.data?.msg || error.response?.data?.error || 'Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="employee-page">
            <div className="employee-container">
                <div className="form-header">
                    <h1>Add New Employee</h1>
                    <Link to="/employees" className="btn-back">
                        <FaTimes /> Cancel
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="employee-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input type="text" name="FullName" value={formData.FullName} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input type="date" name="DateOfBirth" value={formData.DateOfBirth} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Gender</label>
                            <select name="Gender" value={formData.Gender} onChange={handleChange}>
                                <option value="">Select Gender</option>
                                <option value="Nam">Male</option>
                                <option value="Nữ">Female</option>
                                <option value="Khác">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email *</label>
                            <input type="email" name="Email" value={formData.Email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Hire Date *</label>
                            <input type="date" name="HireDate" value={formData.HireDate} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Department</label>
                            <select name="DepartmentID" value={formData.DepartmentID} onChange={handleChange}>
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.DepartmentID} value={dept.DepartmentID}>{dept.DepartmentName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Position</label>
                            <select name="PositionID" value={formData.PositionID} onChange={handleChange}>
                                <option value="">Select Position</option>
                                {positions.map(pos => (
                                    <option key={pos.PositionID} value={pos.PositionID}>{pos.PositionName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Status</label>
                            <select name="Status" value={formData.Status} onChange={handleChange}>
                                <option value="Đang làm việc">Active</option>
                                <option value="Nghỉ phép">On Leave</option>
                                <option value="Thử việc">Probation</option>
                                <option value="Nghỉ việc">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={loading}>
                            <FaSave /> {loading ? 'Saving...' : 'Save Employee'}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeAdd;