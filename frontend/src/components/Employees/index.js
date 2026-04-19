import React, { useState } from 'react';
import { Filter, UserPlus, Search } from 'lucide-react';
import './Employees.scss';

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const employees = [
    { id: 'NV001', name: 'Nguyễn Văn A', role: 'Kỹ sư phần mềm', dept: 'IT', status: 'Đang làm việc' },
    { id: 'NV002', name: 'Trần Thị B', role: 'Chuyên viên Tuyển dụng', dept: 'HR', status: 'Đang làm việc' },
    { id: 'NV003', name: 'Lê Văn C', role: 'Kế toán trưởng', dept: 'Tài chính', status: 'Nghỉ phép' },
  ];

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employees">
      <div className="employees__header">
        <div>
          <h2>Danh sách nhân viên</h2>
          <p>Quản lý thông tin hồ sơ nhân sự</p>
        </div>
        <div className="employees__actions">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-filter">
            <Filter size={16} /> Lọc
          </button>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <UserPlus size={16} /> Thêm nhân viên
          </button>
        </div>
      </div>

      <div className="employees__table">
        <table>
          <thead>
            <tr>
              <th>Mã số</th>
              <th>Họ tên</th>
              <th>Chức vụ</th>
              <th>Phòng ban</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.role}</td>
                <td>{emp.dept}</td>
                <td>
                  <span className={`status status--${emp.status === 'Đang làm việc' ? 'active' : 'inactive'}`}>
                    {emp.status}
                  </span>
                </td>
                <td>
                  <button className="btn-action">Sửa</button>
                  <button className="btn-action btn-action--danger">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm nhân viên */}
      {showModal && (
        <div className="modal">
          <div className="modal__content">
            <h3>Thêm nhân viên mới</h3>
            <form>
              <input type="text" placeholder="Họ tên" />
              <input type="text" placeholder="Chức vụ" />
              <input type="text" placeholder="Phòng ban" />
              <select>
                <option>Đang làm việc</option>
                <option>Nghỉ phép</option>
              </select>
              <div className="modal__actions">
                <button type="button" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;