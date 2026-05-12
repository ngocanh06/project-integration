// frontend/src/pages/Admin/UserEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaArrowLeft, FaCheck, FaTimes, FaSave, FaKey } from 'react-icons/fa';
import api from '../../utils/api';
import '../../styles/admin.css';

const ROLES = [
  { value: 1, label: 'Admin' },
  { value: 2, label: 'HR Manager' },
  { value: 3, label: 'Kế toán (Payroll Manager)' },
  { value: 4, label: 'Nhân viên' },
];

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]           = useState({ full_name:'', email:'', role_id:4, is_active:1 });
  const [original, setOriginal]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState({ msg:'', type:'' });
  const [errors, setErrors]       = useState({});
  const [pwdModal, setPwdModal]   = useState(false);
  const [newPwd, setNewPwd]       = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    api.get(`/admin/users/${id}`)
      .then(res => {
        const u = res.data.data;
        setOriginal(u);
        setForm({ full_name: u.full_name || '', email: u.email, role_id: u.role_id, is_active: u.is_active });
      })
      .catch(() => setToast({ msg:'Không tìm thấy tài khoản', type:'error' }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
    setErrors(er => ({ ...er, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())             e.email = 'Email không được để trống';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
    return e;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await api.put(`/admin/users/${id}`, { ...form, role_id: Number(form.role_id) });
      setToast({ msg:'Cập nhật thành công!', type:'success' });
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      setToast({ msg: err.response?.data?.msg || 'Cập nhật thất bại', type:'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPwd = async () => {
    if (newPwd.length < 6) {
      setToast({ msg:'Mật khẩu tối thiểu 6 ký tự', type:'error' });
      return;
    }
    setPwdLoading(true);
    try {
      await api.patch(`/admin/users/${id}/reset-password`, { new_password: newPwd });
      setToast({ msg:'Đặt lại mật khẩu thành công!', type:'success' });
      setPwdModal(false);
      setNewPwd('');
    } catch (err) {
      setToast({ msg: err.response?.data?.msg || 'Đặt lại mật khẩu thất bại', type:'error' });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return <div className="admin-loading"><div className="spinner" />Đang tải...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1><FaEdit />Chỉnh sửa tài khoản</h1>
          {original && <p>Đang chỉnh sửa: <strong>{original.username}</strong></p>}
        </div>
        <div className="admin-header-right">
          <button className="btn btn-secondary" onClick={() => setPwdModal(true)}><FaKey />Đặt lại mật khẩu</button>
          <Link to="/admin/users" className="btn btn-secondary"><FaArrowLeft />Quay lại</Link>
        </div>
      </div>

      {toast.msg && (
        <div className={`admin-alert ${toast.type}`}>
          {toast.type === 'success' ? <FaCheck /> : <FaTimes />}
          {toast.msg}
        </div>
      )}

      <div style={{background:'#fff', borderRadius:18, padding:'32px', border:'1px solid #e2e8f0', maxWidth:660}}>
        {original && (
          <div style={{display:'flex', alignItems:'center', gap:16, padding:'16px', background:'#f8fafc', borderRadius:12, marginBottom:24, border:'1px solid #e2e8f0'}}>
            <div style={{width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:18}}>
              {original.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{fontWeight:700, color:'#0f172a'}}>{original.username}</div>
              <div style={{fontSize:12, color:'#64748b'}}>ID: {original.user_id} • Tạo ngày {new Date(original.created_at).toLocaleDateString('vi-VN')}</div>
            </div>
          </div>
        )}

        <form className="admin-form" onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>Họ và tên</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nguyễn Văn A" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className={errors.email ? 'error' : ''} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vai trò</label>
              <select name="role_id" value={form.role_id} onChange={handleChange}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{justifyContent:'center'}}>
              <label>Trạng thái</label>
              <div style={{display:'flex', alignItems:'center', gap:12, marginTop:8}}>
                <label className="toggle-switch">
                  <input type="checkbox" name="is_active"
                    checked={form.is_active === 1 || form.is_active === true}
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
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner" style={{width:16,height:16}} />Đang lưu...</> : <><FaSave />Lưu thay đổi</>}
            </button>
          </div>
        </form>
      </div>

      {/* Reset Password Modal */}
      {pwdModal && (
        <div className="modal-overlay" onClick={() => setPwdModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:420}}>
            <div className="modal-header">
              <h3><FaKey style={{color:'#f97316'}} />Đặt lại mật khẩu</h3>
              <button className="modal-close" onClick={() => setPwdModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{fontSize:13, color:'#64748b', marginBottom:16}}>
                Nhập mật khẩu mới cho tài khoản <strong>{original?.username}</strong>
              </p>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPwdModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleResetPwd} disabled={pwdLoading}>
                {pwdLoading ? 'Đang xử lý...' : 'Xác nhận đặt lại'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
