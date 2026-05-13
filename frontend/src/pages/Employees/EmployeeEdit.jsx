// frontend/src/pages/Employees/EmployeeEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import { getEmployeeById, updateEmployee } from '../../services/employeeService';
import { getDepartments } from '../../services/departmentService';
import { getPositions } from '../../services/positionService';
import '../../styles/employee.css';

const EmployeeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
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
        Status: ''
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setFetching(true);
        try {
            // Lấy thông tin nhân viên theo ID
            const employee = await getEmployeeById(id);
            console.log('Employee data:', employee);
            
            // Kiểm tra nếu employee là object rỗng hoặc undefined
            if (!employee || Object.keys(employee).length === 0) {
                throw new Error('No data received');
            }
            
            // Format ngày tháng
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                return dateStr.split('T')[0]; // Chỉ lấy YYYY-MM-DD
            };
            
            // Lấy danh sách phòng ban và chức vụ
            const [depts, pos] = await Promise.all([
                getDepartments(),
                getPositions()
            ]);
            
            setFormData({
                FullName: employee.FullName || '',
                DateOfBirth: formatDate(employee.DateOfBirth),
                Gender: employee.Gender || '',
                PhoneNumber: employee.PhoneNumber || '',
                Email: employee.Email || '',
                HireDate: formatDate(employee.HireDate),
                DepartmentID: employee.DepartmentID || '',
                PositionID: employee.PositionID || '',
                Status: employee.Status || 'Đang làm việc'
            });
            
            setDepartments(depts);
            setPositions(pos);
            
            console.log('Form data set:', formData);
            
        } catch (error) {
            console.error('Fetch error:', error);
            setError('Không thể tải thông tin nhân viên: ' + error.message);
        } finally {
            setFetching(false);
        }
    };

    const validateField = (name, value) => {
        let error = '';
        if (name === 'FullName' && !value?.trim()) error = 'Họ tên là bắt buộc';
        if (name === 'Email') {
            if (!value?.trim()) error = 'Email là bắt buộc';
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
        setError('');
        try {
            await updateEmployee(id, formData);
            navigate('/employees');
        } catch (error) {
            console.error('Update failed:', error);
            setError(error.response?.data?.error || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="loading-spinner">Đang tải dữ liệu...</div>;
    }

    // Kiểm tra nếu không có dữ liệu
    if (!formData.FullName && !fetching) {
        return (
            <div className="employee-container">
                <div className="error-message">
                    Không tìm thấy thông tin nhân viên. Vui lòng quay lại.
                </div>
                <Link to="/employees" className="btn-back">Quay lại</Link>
            </div>
        );
    }

    return (
        <div className="employee-page">
            <div className="employee-container">
                <div className="form-header">
                    <h1>Chỉnh sửa nhân viên</h1>
                    <Link to="/employees" className="btn-back">
                        <FaTimes /> Hủy
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="employee-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-row">
                        <div className="form-group">
                            <label>Họ tên *</label>
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
                            <label>Ngày sinh</label>
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
                            <label>Giới tính *</label>
                            <select 
                                name="Gender" 
                                value={formData.Gender} 
                                onChange={handleChange} 
                                className={fieldErrors.Gender ? 'input-error' : ''}
                                required
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                            {fieldErrors.Gender && <span className="field-error">{fieldErrors.Gender}</span>}
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input 
                                type="tel" 
                                name="PhoneNumber" 
                                value={formData.PhoneNumber} 
                                onChange={handleChange} 
                                className={fieldErrors.PhoneNumber ? 'input-error' : ''}
                                placeholder="VD: 0987654321"
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
                            <label>Ngày vào làm *</label>
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
                            <label>Phòng ban *</label>
                            <select 
                                name="DepartmentID" 
                                value={formData.DepartmentID} 
                                onChange={handleChange} 
                                className={fieldErrors.DepartmentID ? 'input-error' : ''}
                                required
                            >
                                <option value="">Chọn phòng ban</option>
                                {departments.map(dept => (
                                    <option key={dept.DepartmentID} value={dept.DepartmentID}>
                                        {dept.DepartmentName}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.DepartmentID && <span className="field-error">{fieldErrors.DepartmentID}</span>}
                        </div>
                        <div className="form-group">
                            <label>Chức vụ *</label>
                            <select 
                                name="PositionID" 
                                value={formData.PositionID} 
                                onChange={handleChange} 
                                className={fieldErrors.PositionID ? 'input-error' : ''}
                                required
                            >
                                <option value="">Chọn chức vụ</option>
                                {positions.map(pos => (
                                    <option key={pos.PositionID} value={pos.PositionID}>
                                        {pos.PositionName}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.PositionID && <span className="field-error">{fieldErrors.PositionID}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Trạng thái *</label>
                            <select name="Status" value={formData.Status} onChange={handleChange} required>
                                <option value="Đang làm việc">Đang làm việc</option>
                                <option value="Nghỉ phép">Nghỉ phép</option>
                                <option value="Thử việc">Thử việc</option>
                                <option value="Nghỉ việc">Nghỉ việc</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={loading}>
                            <FaSave /> {loading ? 'Đang lưu...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeEdit;