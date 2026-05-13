// frontend/src/pages/Attendance/AttendanceAdd.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import { addAttendance } from '../../services/attendanceService';
import { getEmployees } from '../../services/employeeService';
import '../../styles/attendance.css';

const AttendanceAdd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [formData, setFormData] = useState({
        EmployeeID: '',
        AttendanceMonth: new Date().toISOString().slice(0, 7),
        WorkDays: 0,
        AbsentDays: 0,
        LeaveDays: 0
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const data = await getEmployees();
            if (Array.isArray(data)) {
                setEmployees(data);
            } else {
                console.error('Data employees không phải là mảng:', data);
                setEmployees([]);
            }
        } catch (err) {
            console.error('Failed to fetch employees:', err);
            setError('Không thể tải danh sách nhân viên. Vui lòng kiểm tra kết nối.');
        }
    };

    const validateField = (name, value) => {
        let err = '';
        const numVal = parseFloat(value);

        if (name === 'EmployeeID' && !value) err = 'Vui lòng chọn nhân viên';
        if (name === 'AttendanceMonth' && !value) err = 'Vui lòng chọn tháng';
        
        if (name === 'WorkDays' || name === 'AbsentDays' || name === 'LeaveDays') {
            if (value === '' || value === null) err = 'Trường này là bắt buộc';
            else if (isNaN(numVal)) err = 'Vui lòng nhập số hợp lệ';
            else if (numVal < 0) err = 'Giá trị không được âm';
            else if (numVal > 31) err = 'Giá trị không được vượt quá 31';
        }

        setFieldErrors(prev => ({ ...prev, [name]: err }));
        return err === '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        validateField(name, value);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let isValid = true;
        ['EmployeeID', 'AttendanceMonth', 'WorkDays'].forEach(key => {
            if (!validateField(key, formData[key])) isValid = false;
        });

        if (!isValid) {
            setError('Vui lòng kiểm tra lại thông tin các trường bắt buộc');
            return;
        }

        const total = (formData.WorkDays || 0) + (formData.AbsentDays || 0) + (formData.LeaveDays || 0);
        if (total > 31) {
            setError('Tổng số ngày trong tháng không được vượt quá 31');
            return;
        }

        setLoading(true);
        try {
            await addAttendance({
                ...formData,
                AttendanceMonth: `${formData.AttendanceMonth}-01`
            });
            navigate('/attendance');
        } catch (err) {
            console.error('Add failed:', err);
            const msg = err.response?.data?.error || err.message || 'Lỗi khi thêm bản ghi';
            setError(typeof msg === 'string' ? msg : 'Lỗi hệ thống');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="attendance-page">
            <div className="attendance-container">
                <div className="form-header-attendance">
                    <h1>Add Attendance Record</h1>
                    <Link to="/attendance" className="btn-back">
                        <FaTimes /> Cancel
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="attendance-form">
                    {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{String(error)}</div>}

                    <div className="form-row">
                        <div className="form-group">
                            <label>Employee *</label>
                            <select
                                name="EmployeeID"
                                value={formData.EmployeeID}
                                onChange={handleChange}
                                className={fieldErrors.EmployeeID ? 'input-error' : ''}
                                required
                            >
                                <option value="">Select Employee</option>
                                {Array.isArray(employees) && employees.map(emp => (
                                    <option key={emp.EmployeeID} value={emp.EmployeeID}>
                                        {emp.FullName} (ID: {emp.EmployeeID})
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.EmployeeID && <span className="field-error">{fieldErrors.EmployeeID}</span>}
                        </div>
                        <div className="form-group">
                            <label>Month *</label>
                            <input
                                type="month"
                                name="AttendanceMonth"
                                value={formData.AttendanceMonth}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Work Days *</label>
                            <input 
                                type="number" 
                                name="WorkDays" 
                                value={formData.WorkDays} 
                                onChange={handleChange}
                                max="31" step="0.5"
                                required
                            />
                            {fieldErrors.WorkDays && <span className="field-error">{fieldErrors.WorkDays}</span>}
                        </div>
                        <div className="form-group">
                            <label>Absent Days</label>
                            <input 
                                type="number" 
                                name="AbsentDays" 
                                value={formData.AbsentDays} 
                                onChange={handleChange}
                                max="31" step="0.5"
                            />
                            {fieldErrors.AbsentDays && <span className="field-error">{fieldErrors.AbsentDays}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Leave Days</label>
                            <input 
                                type="number" 
                                name="LeaveDays" 
                                value={formData.LeaveDays} 
                                onChange={handleChange}
                                max="31" step="0.5"
                            />
                            {fieldErrors.LeaveDays && <span className="field-error">{fieldErrors.LeaveDays}</span>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={loading}>
                            <FaSave /> {loading ? 'Saving...' : 'Save Attendance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttendanceAdd;
