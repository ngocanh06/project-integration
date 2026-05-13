// frontend/src/pages/Attendance/AttendanceEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import { getAttendanceById, updateAttendance } from '../../services/attendanceService';
import '../../styles/attendance.css';

const AttendanceEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [formData, setFormData] = useState({
        FullName: '',
        AttendanceMonth: '',
        WorkDays: 0,
        AbsentDays: 0,
        LeaveDays: 0
    });

    useEffect(() => {
        if (id) {
            fetchAttendance();
        }
    }, [id]);

    const fetchAttendance = async () => {
        setFetching(true);
        try {
            const data = await getAttendanceById(id);
            if (data && !data.error) {
                setFormData({
                    FullName: data.FullName || '',
                    AttendanceMonth: data.AttendanceMonth ? String(data.AttendanceMonth).slice(0, 7) : '',
                    WorkDays: data.WorkDays || 0,
                    AbsentDays: data.AbsentDays || 0,
                    LeaveDays: data.LeaveDays || 0
                });
            } else {
                setError(data?.error || 'Không tìm thấy dữ liệu chấm công');
            }
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
            setError('Lỗi khi tải dữ liệu chấm công từ hệ thống.');
        } finally {
            setFetching(false);
        }
    };

    const validateField = (name, value) => {
        let err = '';
        const numVal = parseFloat(value);
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
        ['WorkDays', 'AbsentDays', 'LeaveDays'].forEach(key => {
            if (!validateField(key, formData[key])) isValid = false;
        });

        if (!isValid) {
            setError('Vui lòng kiểm tra lại các trường dữ liệu');
            return;
        }

        const total = (formData.WorkDays || 0) + (formData.AbsentDays || 0) + (formData.LeaveDays || 0);
        if (total > 31) {
            setError('Tổng số ngày trong tháng không được vượt quá 31');
            return;
        }

        setLoading(true);
        try {
            await updateAttendance(id, {
                WorkDays: formData.WorkDays,
                AbsentDays: formData.AbsentDays,
                LeaveDays: formData.LeaveDays
            });
            navigate('/attendance');
        } catch (err) {
            console.error('Update failed:', err);
            const msg = err.response?.data?.error || err.message || 'Lỗi khi cập nhật';
            setError(typeof msg === 'string' ? msg : 'Lỗi hệ thống');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="loading-spinner" style={{padding: '20px', textAlign: 'center'}}>Đang tải dữ liệu...</div>;

    return (
        <div className="attendance-page">
            <div className="attendance-container">
                <div className="form-header-attendance">
                    <h1>Edit Attendance Record</h1>
                    <Link to="/attendance" className="btn-back">
                        <FaTimes /> Cancel
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="attendance-form">
                    {error && <div className="error-message" style={{color: 'red', marginBottom: '15px'}}>{String(error)}</div>}

                    <div className="form-row">
                        <div className="form-group">
                            <label>Employee</label>
                            <input type="text" value={formData.FullName} disabled style={{backgroundColor: '#f5f5f5'}} />
                        </div>
                        <div className="form-group">
                            <label>Month</label>
                            <input type="text" value={formData.AttendanceMonth} disabled style={{backgroundColor: '#f5f5f5'}} />
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
                            <label>Absent Days *</label>
                            <input 
                                type="number" 
                                name="AbsentDays" 
                                value={formData.AbsentDays} 
                                onChange={handleChange}
                                max="31" step="0.5"
                                required
                            />
                            {fieldErrors.AbsentDays && <span className="field-error">{fieldErrors.AbsentDays}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Leave Days *</label>
                            <input 
                                type="number" 
                                name="LeaveDays" 
                                value={formData.LeaveDays} 
                                onChange={handleChange}
                                max="31" step="0.5"
                                required
                            />
                            {fieldErrors.LeaveDays && <span className="field-error">{fieldErrors.LeaveDays}</span>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={loading}>
                            <FaSave /> {loading ? 'Updating...' : 'Update Attendance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttendanceEdit;
