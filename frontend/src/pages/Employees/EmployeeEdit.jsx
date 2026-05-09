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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <input 
                                type="date" 
                                name="DateOfBirth" 
                                value={formData.DateOfBirth} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Giới tính</label>
                            <select name="Gender" value={formData.Gender} onChange={handleChange}>
                                <option value="">Chọn giới tính</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input 
                                type="tel" 
                                name="PhoneNumber" 
                                value={formData.PhoneNumber} 
                                onChange={handleChange} 
                            />
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
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày vào làm *</label>
                            <input 
                                type="date" 
                                name="HireDate" 
                                value={formData.HireDate} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Phòng ban</label>
                            <select name="DepartmentID" value={formData.DepartmentID} onChange={handleChange}>
                                <option value="">Chọn phòng ban</option>
                                {departments.map(dept => (
                                    <option key={dept.DepartmentID} value={dept.DepartmentID}>
                                        {dept.DepartmentName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Chức vụ</label>
                            <select name="PositionID" value={formData.PositionID} onChange={handleChange}>
                                <option value="">Chọn chức vụ</option>
                                {positions.map(pos => (
                                    <option key={pos.PositionID} value={pos.PositionID}>
                                        {pos.PositionName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select name="Status" value={formData.Status} onChange={handleChange}>
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