// frontend/src/pages/Admin/RoleList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/admin.css';

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';

const ACTION_LABELS = {
  create: 'Tạo mới',
  read: 'Xem',
  update: 'Chỉnh sửa',
  delete: 'Xóa',
  approve: 'Duyệt',
  export: 'Xuất',
};

const RESOURCE_LABELS = {
  employees: 'Nhân sự',
  departments: 'Phòng ban',
  positions: 'Chức vụ',
  payroll: 'Lương',
  attendance: 'Chấm công',
  dividends: 'Cổ tức',
  reports: 'Báo cáo',
  users: 'Tài khoản',
  roles: 'Vai trò',
  audit: 'Nhật ký',
  alerts: 'Cảnh báo',
};

const RESOURCE_ICONS = {
  employees: 'fas fa-users',
  departments: 'fas fa-building',
  positions: 'fas fa-briefcase',
  payroll: 'fas fa-money-bill-wave',
  attendance: 'fas fa-calendar-alt',
  dividends: 'fas fa-gift',
  reports: 'fas fa-chart-bar',
  users: 'fas fa-user-cog',
  roles: 'fas fa-shield-alt',
  audit: 'fas fa-clipboard-list',
  alerts: 'fas fa-bell',
};

const ACTION_COLORS = {
  create: '#10b981',
  read: '#3b82f6',
  update: '#f59e0b',
  delete: '#ef4444',
  approve: '#8b5cf6',
  export: '#64748b',
};

function RoleCard({ role }) {
  const [expanded, setExpanded] = useState(false);

  // Group permissions by resource và loại bỏ action trùng lặp
  const grouped = {};
  (role.permissions || []).forEach(p => {
    if (!grouped[p.resource]) {
      grouped[p.resource] = new Set();
    }
    grouped[p.resource].add(p.action);
  });

  const getRoleIcon = (color) => {
    switch(color) {
      case 'danger': return 'fas fa-shield-alt';
      case 'primary': return 'fas fa-users';
      case 'success': return 'fas fa-calculator';
      case 'info': return 'fas fa-user-tie';
      default: return 'fas fa-shield-alt';
    }
  };

  const getRoleColor = (color) => {
    switch(color) {
      case 'danger': return '#ef4444';
      case 'primary': return '#3b82f6';
      case 'success': return '#10b981';
      case 'info': return '#06b6d4';
      default: return '#64748b';
    }
  };

  return (
    <div className="role-card" style={{ borderTop: `4px solid ${getRoleColor(role.color)}` }}>
      <div className="role-card-header">
        <div>
          <div className="role-card-title">{role.display_name}</div>
          <div className="role-card-desc">{role.description}</div>
        </div>
        <div className="role-card-icon" style={{
          backgroundColor: `${getRoleColor(role.color)}15`,
          color: getRoleColor(role.color)
        }}>
          <i className={getRoleIcon(role.color)}></i>
        </div>
      </div>

      <div className="role-perm-count">
        <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
        <strong>{role.perm_count}</strong> quyền hạn được cấp
      </div>

      {/* Preview chips */}
      <div className="role-perms-list" style={{ maxHeight: expanded ? 'none' : 80, overflow: 'hidden' }}>
        {Object.entries(grouped).map(([res, actions]) => (
          <span key={res} className="perm-chip">
            <i className={RESOURCE_ICONS[res] || 'fas fa-tag'} style={{ marginRight: 4 }}></i>
            {RESOURCE_LABELS[res] || res} ({actions.size})
          </span>
        ))}
      </div>

      {/* Expand detail */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="role-expand-btn"
        style={{
          marginTop: 12, width: '100%', padding: '8px',
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: 8, cursor: 'pointer', fontSize: 12,
          color: '#64748b', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        {expanded ? (
          <><i className="fas fa-chevron-up"></i> Thu gọn</>
        ) : (
          <><i className="fas fa-chevron-down"></i> Xem chi tiết quyền</>
        )}
      </button>

      {expanded && (
        <div style={{ marginTop: 14 }}>
          {Object.entries(grouped).map(([res, actions]) => (
            <div key={res} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className={RESOURCE_ICONS[res] || 'fas fa-tag'}></i>
                {RESOURCE_LABELS[res] || res}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Array.from(actions).map((action, idx) => (
                  <span key={idx} style={{
                    padding: '4px 10px', borderRadius: 6,
                    fontSize: 11, fontWeight: 500,
                    backgroundColor: `${ACTION_COLORS[action]}15`,
                    color: ACTION_COLORS[action],
                    border: `1px solid ${ACTION_COLORS[action]}30`,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <i className="fas fa-lock" style={{ fontSize: 9 }}></i>
                    {ACTION_LABELS[action] || action}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoleList() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/roles');
      console.log('API Response:', res.data);
      if (res.data && res.data.status === 'success') {
        setRoles(res.data.data || []);
      } else if (Array.isArray(res.data?.data)) {
        setRoles(res.data.data);
      } else {
        setRoles([]);
      }
    } catch (e) {
      console.error('Error fetching roles:', e);
      console.error('Response:', e.response?.data);
      const errorMsg = e.response?.data?.msg || e.message || 'Không tải được danh sách vai trò';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const totalPerms = Array.isArray(roles) ? roles.reduce((s, r) => s + (r.perm_count || 0), 0) : 0;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1><i className="fas fa-shield-alt"></i> Vai trò &amp; Quyền hạn</h1>
          <p>Xem và quản lý các vai trò và quyền hạn được phân công trong hệ thống</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchRoles}>
          <i className="fas fa-redo-alt"></i> Làm mới
        </button>
      </div>

      {/* Summary stats */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <i className="fas fa-shield-alt"></i>
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{roles.length}</div>
            <div className="admin-stat-label">Vai trò trong hệ thống</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{totalPerms}</div>
            <div className="admin-stat-label">Tổng quyền được cấp</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <i className="fas fa-lock"></i>
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">RBAC</div>
            <div className="admin-stat-label">Phân quyền dựa theo vai trò</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="admin-alert error">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      {loading ? (
        <div className="admin-loading">
          <i className="fas fa-spinner fa-pulse"></i> Đang tải vai trò...
        </div>
      ) : (
        <div className="roles-grid">
          {roles.map(role => <RoleCard key={role.role_id} role={role} />)}
        </div>
      )}
    </div>
  );
}