import React, { useState, useEffect } from 'react';
import { createEmployee } from '../../services/employeeService';
import { getDepartments } from '../../services/departmentService';
import { getPositions } from '../../services/positionService';
import './EmployeeForm.css';

const EmployeeAdd = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        FullName: '',
        DateOfBirth: '',
        Gender: 'Nam',
        PhoneNumber: '',
        Email: '',
        HireDate: '',
        DepartmentID: '',
        PositionID: '',
        Status: 'Đang làm việc'
    });
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const [depts, poss] = await Promise.all([getDepartments(), getPositions()]);
            setDepartments(depts);
            setPositions(poss);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clean up data before sending
        const payload = {
            ...formData,
            DepartmentID: formData.DepartmentID === "" ? null : parseInt(formData.DepartmentID),
            PositionID: formData.PositionID === "" ? null : parseInt(formData.PositionID)
        };

        try {
            await createEmployee(payload);
            alert("Thêm nhân viên thành công!");
            if (onSave) onSave();
        } catch (error) {
            console.error("Add error:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response && error.response.data.error) {
                alert("Lỗi CSDL: " + error.response.data.error);
            } else {
                alert("Lỗi khi thêm nhân viên");
            }
        }
    };

    return (
        <div className="employee-form-container">
            <h2>Thêm Nhân viên Mới</h2>
            <form onSubmit={handleSubmit} className="modern-form">
                <div className="form-group">
                    <label>Họ và tên</label>
                    <input name="FullName" value={formData.FullName} onChange={handleChange} />
                    {errors.FullName && <span className="error">{errors.FullName}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Ngày sinh</label>
                        <input type="date" name="DateOfBirth" value={formData.DateOfBirth} onChange={handleChange} />
                        {errors.DateOfBirth && <span className="error">{errors.DateOfBirth}</span>}
                    </div>
                    <div className="form-group">
                        <label>Giới tính</label>
                        <select name="Gender" value={formData.Gender} onChange={handleChange}>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                        </select>
                        {errors.Gender && <span className="error">{errors.Gender}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} />
                        {errors.PhoneNumber && <span className="error">{errors.PhoneNumber}</span>}
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="Email" value={formData.Email} onChange={handleChange} />
                        {errors.Email && <span className="error">{errors.Email}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Ngày vào làm</label>
                        <input type="date" name="HireDate" value={formData.HireDate} onChange={handleChange} />
                        {errors.HireDate && <span className="error">{errors.HireDate}</span>}
                    </div>
                    <div className="form-group">
                        <label>Trạng thái</label>
                        <select name="Status" value={formData.Status} onChange={handleChange}>
                            <option value="Đang làm việc">Đang làm việc</option>
                            <option value="Nghỉ phép">Nghỉ phép</option>
                            <option value="Thử việc">Thử việc</option>
                        </select>
                        {errors.Status && <span className="error">{errors.Status}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Phòng ban</label>
                        <select name="DepartmentID" value={formData.DepartmentID} onChange={handleChange}>
                            <option value="">Chọn phòng ban</option>
                            {departments.map(d => <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Chức vụ</label>
                        <select name="PositionID" value={formData.PositionID} onChange={handleChange}>
                            <option value="">Chọn chức vụ</option>
                            {positions.map(p => <option key={p.PositionID} value={p.PositionID}>{p.PositionName}</option>)}
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-save">Lưu lại</button>
                    <button type="button" className="btn-cancel" onClick={onCancel}>Hủy bỏ</button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeAdd;
