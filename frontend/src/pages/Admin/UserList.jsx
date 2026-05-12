// frontend/src/pages/Admin/UserList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers, FaPlus, FaEdit, FaTrash, FaSearch,
  FaCheck, FaTimes, FaRedo, FaUserShield
} from 'react-icons/fa';
import api from '../../utils/api';
import '../../styles/admin.css';

const ROLE_MAP = {
  1: { label: 'Admin',       cls: 'badge-danger'   },
  2: { label: 'HR Manager',  cls: 'badge-primary'  },
  3: { label: 'Kế toán',     cls: 'badge-success'  },
  4: { label: 'Nhân viên',   cls: 'badge-secondary'},
};

export default function UserList() {
  const [users, setUsers]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('');
  const [statusFilter, setStatus] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [toast, setToast]       = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (e) {
      setError(e.response?.data?.msg || 'Không tải được danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    let data = [...users];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(u =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q)
      );
    }
    if (roleFilter) data = data.filter(u => String(u.role_id) === roleFilter);
    if (statusFilter !== '') data = data.filter(u => String(u.is_active) === statusFilter);
    setFiltered(data);
  }, [users, search, roleFilter, statusFilter]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/admin/users/${deleteModal.user_id}`);
      showToast('Đã xóa tài khoản thành công');
      setDeleteModal(null);
      fetchUsers();
    } catch (e) {
      showToast('Lỗi: ' + (e.response?.data?.msg || e.message));
    }
  };

  const statsTotal   = users.length;
  const statsActive  = users.filter(u => u.is_active).length;
  const statsAdmins  = users.filter(u => u.role_id === 1).length;
  const statsNew     = users.filter(u => {
    const d = new Date(u.created_at);
    const now = new Date();
    return (now - d) < 7 * 24 * 3600 * 1000;
  }).length;

  return (
    <div className="admin-page">
      {toast && <div className="admin-alert success" style={{position:'fixed',top:20,right:20,zIndex:9999,minWidth:280}}><FaCheck />{toast}</div>}

      <div className="admin-header">
        <div className="admin-header-left">
          <h1><FaUsers />Quản lý Tài khoản</h1>
          <p>Xem, thêm mới và chỉnh sửa tài khoản người dùng trong hệ thống</p>
        </div>
        <div className="admin-header-right">
          <button className="btn btn-secondary" onClick={fetchUsers}><FaRedo />Làm mới</button>
          <Link to="/admin/users/add" className="btn btn-primary"><FaPlus />Thêm tài khoản</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue"><FaUsers /></div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{statsTotal}</div>
            <div className="admin-stat-label">Tổng tài khoản</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green"><FaCheck /></div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{statsActive}</div>
            <div className="admin-stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon red"><FaTimes /></div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{statsTotal - statsActive}</div>
            <div className="admin-stat-label">Bị vô hiệu hóa</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple"><FaUserShield /></div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{statsAdmins}</div>
            <div className="admin-stat-label">Quản trị viên</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text" placeholder="Tìm theo tên, email, username..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={roleFilter} onChange={e => setRole(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          {Object.entries(ROLE_MAP).map(([id, r]) => (
            <option key={id} value={id}>{r.label}</option>
          ))}
        </select>
        <select className="filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="1">Đang hoạt động</option>
          <option value="0">Vô hiệu hóa</option>
        </select>
      </div>

      {/* Error */}
      {error && <div className="admin-alert error"><FaTimes />{error}</div>}

      {/* Table */}
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading"><div className="spinner" />Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><FaUsers /><p>Không tìm thấy tài khoản nào</p></div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tài khoản</th>
                  <th>Email</th>
                  <th>Họ tên</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th style={{textAlign:'center'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const role = ROLE_MAP[u.role_id] || { label: u.role_name || '—', cls: 'badge-secondary' };
                  return (
                    <tr key={u.user_id}>
                      <td style={{color:'#94a3b8', fontWeight:600}}>{i + 1}</td>
                      <td>
                        <div style={{fontWeight:600, color:'#0f172a'}}>{u.username}</div>
                        <div style={{fontSize:'11px', color:'#94a3b8'}}>ID: {u.user_id}</div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.full_name || '—'}</td>
                      <td><span className={`badge ${role.cls}`}>{role.label}</span></td>
                      <td>
                        {u.is_active
                          ? <span className="badge badge-success"><span className="audit-status-dot success" />Hoạt động</span>
                          : <span className="badge badge-danger"><span className="audit-status-dot error" />Vô hiệu hóa</span>
                        }
                      </td>
                      <td style={{color:'#64748b', fontSize:'12px'}}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td>
                        <div style={{display:'flex', gap:'6px', justifyContent:'center'}}>
                          <Link to={`/admin/users/edit/${u.user_id}`} className="btn btn-sm btn-secondary" title="Chỉnh sửa"><FaEdit /></Link>
                          <button
                            className="btn btn-sm btn-danger btn-icon"
                            title="Xóa"
                            onClick={() => setDeleteModal(u)}
                            disabled={u.role_id === 1}
                          ><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="admin-pagination">
              <span className="pagination-info">Hiển thị {filtered.length} / {users.length} tài khoản</span>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:400}}>
            <div className="modal-header">
              <h3><FaTrash style={{color:'#ef4444'}} />Xác nhận xóa</h3>
              <button className="modal-close" onClick={() => setDeleteModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc muốn xóa tài khoản <strong>{deleteModal.username}</strong>?</p>
              <p style={{fontSize:'12px', color:'#94a3b8', marginTop:'8px'}}>Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDelete}>Xóa tài khoản</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
