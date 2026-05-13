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
    const [fieldErrors, setFieldErrors] = useState({});
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

    const validateField = (name, value) => {
        let error = '';
        if (name === 'FullName' && !value.trim()) error = 'Họ tên là bắt buộc';
        if (name === 'Email') {
            if (!value.trim()) error = 'Email là bắt buộc';
            else if (!/\S+@\S+\.\S+/.test(value)) error = 'Email không hợp lệ';
        }
        if (name === 'HireDate' && !value) error = 'Ngày vào làm là bắt buộc';
        if (name === 'Gender' && !value) error = 'Vui lòng chọn giới tính';
        if (name === 'DepartmentID' && !value) error = 'Vui lòng chọn phòng ban';
        if (name === 'PositionID' && !value) error = 'Vui lòng chọn chức vụ';
        if (name === 'PhoneNumber' && value && !/^\d{10,11}$/.test(value)) {
            error = 'Số điện thoại phải là 10-11 chữ số';
        }
        if (name === 'DateOfBirth' && value) {
            const age = new Date().getFullYear() - new Date(value).getFullYear();
            if (age < 18) error = 'Nhân viên phải từ 18 tuổi trở lên';
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
        
        // Validate all fields
        let isValid = true;
        Object.keys(formData).forEach(key => {
            if (!validateField(key, formData[key])) isValid = false;
        });

        if (!isValid) {
            setError('Vui lòng kiểm tra lại thông tin nhập liệu');
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
                            <input 
                                type="text" 
                                name="FullName" 
                                value={formData.FullName} 
                                onChange={handleChange} 
                                className={fieldErrors.FullName ? 'input-error' : ''}
                                required 
                            />
                            {fieldErrors.FullName && <span className="field-error">{fieldErrors.FullName}</span>}
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input 
                                type="date" 
                                name="DateOfBirth" 
                                value={formData.DateOfBirth} 
                                onChange={handleChange} 
                                className={fieldErrors.DateOfBirth ? 'input-error' : ''}
                            />
                            {fieldErrors.DateOfBirth && <span className="field-error">{fieldErrors.DateOfBirth}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Gender *</label>
                            <select 
                                name="Gender" 
                                value={formData.Gender} 
                                onChange={handleChange} 
                                className={fieldErrors.Gender ? 'input-error' : ''}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Nam">Male</option>
                                <option value="Nữ">Female</option>
                                <option value="Khác">Other</option>
                            </select>
                            {fieldErrors.Gender && <span className="field-error">{fieldErrors.Gender}</span>}
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input 
                                type="tel" 
                                name="PhoneNumber" 
                                value={formData.PhoneNumber} 
                                onChange={handleChange} 
                                className={fieldErrors.PhoneNumber ? 'input-error' : ''}
                                placeholder="e.g. 0987654321"
                            />
                            {fieldErrors.PhoneNumber && <span className="field-error">{fieldErrors.PhoneNumber}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email *</label>
                            <input 
                                type="email" 
                                name="Email" 
                                value={formData.Email} 
                                onChange={handleChange} 
                                className={fieldErrors.Email ? 'input-error' : ''}
                                required 
                            />
                            {fieldErrors.Email && <span className="field-error">{fieldErrors.Email}</span>}
                        </div>
                        <div className="form-group">
                            <label>Hire Date *</label>
                            <input 
                                type="date" 
                                name="HireDate" 
                                value={formData.HireDate} 
                                onChange={handleChange} 
                                className={fieldErrors.HireDate ? 'input-error' : ''}
                                required 
                            />
                            {fieldErrors.HireDate && <span className="field-error">{fieldErrors.HireDate}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Department *</label>
                            <select 
                                name="DepartmentID" 
                                value={formData.DepartmentID} 
                                onChange={handleChange} 
                                className={fieldErrors.DepartmentID ? 'input-error' : ''}
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.DepartmentID} value={dept.DepartmentID}>{dept.DepartmentName}</option>
                                ))}
                            </select>
                            {fieldErrors.DepartmentID && <span className="field-error">{fieldErrors.DepartmentID}</span>}
                        </div>
                        <div className="form-group">
                            <label>Position *</label>
                            <select 
                                name="PositionID" 
                                value={formData.PositionID} 
                                onChange={handleChange} 
                                className={fieldErrors.PositionID ? 'input-error' : ''}
                                required
                            >
                                <option value="">Select Position</option>
                                {positions.map(pos => (
                                    <option key={pos.PositionID} value={pos.PositionID}>{pos.PositionName}</option>
                                ))}
                            </select>
                            {fieldErrors.PositionID && <span className="field-error">{fieldErrors.PositionID}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Status *</label>
                            <select name="Status" value={formData.Status} onChange={handleChange} required>
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