// frontend/src/pages/Admin/UserAdd.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../utils/api';
import '../../styles/admin.css';

const ROLES = [
  { value: 2, label: 'HR Manager' },
  { value: 3, label: 'Kế toán (Payroll Manager)' },
  { value: 4, label: 'Nhân viên' },
];

export default function UserAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    full_name: '', role_id: 4, is_active: 1,
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState({ msg: '', type: '' });
  const [showPwd, setShowPwd] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim())        e.username = 'Vui lòng nhập tên đăng nhập';
    else if (form.username.length < 3) e.username = 'Tên đăng nhập tối thiểu 3 ký tự';
    if (!form.email.trim())           e.email    = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.password.trim())        e.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
    setErrors(er => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await api.post('/admin/users', { ...form, role_id: Number(form.role_id) });
      setToast({ msg: 'Tạo tài khoản thành công!', type: 'success' });
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      setToast({ msg: err.response?.data?.msg || 'Tạo tài khoản thất bại', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1><FaPlus />Thêm tài khoản mới</h1>
          <p>Tạo tài khoản người dùng và phân quyền vai trò trong hệ thống</p>
        </div>
        <Link to="/admin/users" className="btn btn-secondary"><FaArrowLeft />Quay lại</Link>
      </div>

      {toast.msg && (
        <div className={`admin-alert ${toast.type}`}>
          {toast.type === 'success' ? <FaCheck /> : <FaTimes />}
          {toast.msg}
        </div>
      )}

      <div style={{background:'#fff', borderRadius:18, padding:'32px', border:'1px solid #e2e8f0', maxWidth:660}}>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Tên đăng nhập *</label>
              <input name="username" value={form.username} onChange={handleChange}
                className={errors.username ? 'error' : ''} placeholder="vd: nguyen.van.a" />
              {errors.username && <span className="form-error">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className={errors.email ? 'error' : ''} placeholder="email@example.com" />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Họ và tên</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nguyễn Văn A" />
            </div>
            <div className="form-group">
              <label>Mật khẩu *</label>
              <div style={{position:'relative'}}>
                <input name="password" type={showPwd ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  className={errors.password ? 'error' : ''} placeholder="Tối thiểu 6 ký tự"
                  style={{width:'100%', paddingRight:40}} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:'#94a3b8'}}>
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vai trò</label>
              <select name="role_id" value={form.role_id} onChange={handleChange}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <span className="form-hint">Vai trò Admin không thể gán từ đây</span>
            </div>
            <div className="form-group" style={{justifyContent:'center'}}>
              <label>Trạng thái tài khoản</label>
              <div style={{display:'flex', alignItems:'center', gap:12, marginTop:8}}>
                <label className="toggle-switch">
                  <input type="checkbox" name="is_active"
                    checked={form.is_active === 1}
                    onChange={e => setForm(f => ({...f, is_active: e.target.checked ? 1 : 0}))} />
                  <span className="toggle-slider" />
                </label>
                <span style={{fontSize:13, color: form.is_active ? '#10b981' : '#94a3b8', fontWeight:600}}>
                  {form.is_active ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                </span>
              </div>
            </div>
          </div>

          <div style={{display:'flex', gap:12, justifyContent:'flex-end', paddingTop:8}}>
            <Link to="/admin/users" className="btn btn-secondary">Hủy</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{width:16,height:16}} />Đang tạo...</> : <><FaCheck />Tạo tài khoản</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
