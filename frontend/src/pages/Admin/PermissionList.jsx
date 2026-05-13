// frontend/src/pages/Admin/PermissionList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/admin.css';

// Import Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';

const GROUP_ICONS = {
  employees:   'fas fa-users',
  departments: 'fas fa-building',
  positions:   'fas fa-briefcase',
  payroll:     'fas fa-money-bill-wave',
  attendance:  'fas fa-calendar-alt',
  dividends:   'fas fa-gift',
  reports:     'fas fa-chart-bar',
  users:       'fas fa-user-cog',
  roles:       'fas fa-shield-alt',
  audit:       'fas fa-clipboard-list',
  alerts:      'fas fa-bell',
};

const GROUP_COLORS = {
  employees:   '#3b82f6',
  departments: '#8b5cf6',
  positions:   '#06b6d4',
  payroll:     '#10b981',
  attendance:  '#f97316',
  dividends:   '#ec4899',
  reports:     '#f59e0b',
  users:       '#ef4444',
  roles:       '#6366f1',
  audit:       '#64748b',
  alerts:      '#dc2626',
};

const ACTION_BADGES = {
  create: { label:'Tạo mới', cls:'badge-success'  },
  read:   { label:'Xem',     cls:'badge-primary'  },
  update: { label:'Sửa',     cls:'badge-warning'  },
  delete: { label:'Xóa',     cls:'badge-danger'   },
  approve:{ label:'Duyệt',   cls:'badge-info'     },
  export: { label:'Xuất',    cls:'badge-secondary'},
};

function PermGroup({ group, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false);
  const iconClass = GROUP_ICONS[group.resource] || 'fas fa-tag';
  const color = GROUP_COLORS[group.resource] || '#64748b';

  return (
    <div className="perm-group-card">
      <div className="perm-group-header" onClick={() => setOpen(v => !v)}>
        <div className="perm-group-title">
          <div className="perm-group-icon" style={{background:`${color}18`, color}}>
            <i className={iconClass}></i>
          </div>
          {group.resource_label}
          <span className="badge badge-secondary" style={{marginLeft:4}}>{group.count}</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{fontSize:12, color:'#94a3b8'}}>{group.count} quyền</span>
          {open ? (
            <i className="fas fa-chevron-up" style={{color:'#94a3b8'}}></i>
          ) : (
            <i className="fas fa-chevron-down" style={{color:'#94a3b8'}}></i>
          )}
        </div>
      </div>

      {open && (
        <table className="perm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thao tác</th>
              <th>Mô tả quyền hạn</th>
            </tr>
          </thead>
          <tbody>
            {group.permissions.map(p => {
              const ab = ACTION_BADGES[p.action] || { label: p.action, cls: 'badge-secondary' };
              return (
                <tr key={p.permission_id}>
                  <td><span className="perm-code">#{p.permission_id}</span></td>
                  <td>
                    <span className={`badge ${ab.cls}`}>{ab.label}</span>
                  </td>
                  <td>{p.description || `${p.action} ${p.resource}`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function PermissionList() {
  const [groups, setGroups]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [totalPerms, setTotal] = useState(0);

  const fetchPerms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/permissions');
      const data = res.data.data;
      setGroups(data);
      setFiltered(data);
      setTotal(data.reduce((s, g) => s + g.count, 0));
    } catch (e) {
      console.error('Error fetching permissions:', e);
      setError(e.response?.data?.msg || 'Không tải được danh sách quyền hạn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPerms(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(groups); return; }
    const q = search.toLowerCase();
    const f = groups
      .map(g => ({
        ...g,
        permissions: g.permissions.filter(
          p => p.description?.toLowerCase().includes(q) ||
               p.resource?.toLowerCase().includes(q)   ||
               p.action?.toLowerCase().includes(q)
        ),
      }))
      .filter(g => g.permissions.length > 0 || g.resource_label.toLowerCase().includes(q));
    setFiltered(f);
  }, [search, groups]);

  const displayedPerms = filtered.reduce((s, g) => s + g.count, 0);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1><i className="fas fa-lock"></i> Danh mục Quyền hạn</h1>
          <p>Tra cứu toàn bộ quyền hạn trong hệ thống, phân loại theo nhóm chức năng</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchPerms}>
          <i className="fas fa-redo-alt"></i> Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats" style={{gridTemplateColumns:'repeat(3,1fr)', marginBottom:24}}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <i className="fas fa-lock"></i>
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{totalPerms}</div>
            <div className="admin-stat-label">Tổng quyền hạn</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <i className="fas fa-layer-group"></i>
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{groups.length}</div>
            <div className="admin-stat-label">Nhóm chức năng</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <i className="fas fa-search"></i>
          </div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{displayedPerms}</div>
            <div className="admin-stat-label">Kết quả hiển thị</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="admin-toolbar" style={{marginBottom:20}}>
        <div className="search-box">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text" 
            placeholder="Tìm quyền hạn theo tên, nhóm, thao tác..."
            value={search} 
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button 
              className="clear-search"
              onClick={() => setSearch('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '0 8px'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="admin-alert error">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      {loading ? (
        <div className="admin-loading">
          <i className="fas fa-spinner fa-pulse"></i> Đang tải quyền hạn...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-lock" style={{fontSize: 48, marginBottom: 16, opacity: 0.5}}></i>
          <p>Không tìm thấy quyền hạn phù hợp</p>
          {search && (
            <button 
              className="btn btn-secondary" 
              onClick={() => setSearch('')}
              style={{marginTop: 12}}
            >
              <i className="fas fa-times"></i> Xóa tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <div className="perm-groups">
          {filtered.map((g, i) => (
            <PermGroup key={g.resource} group={g} defaultOpen={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}