// frontend/src/pages/Audit/AuditLogs.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaClipboardList, FaSearch, FaRedo, FaCheck, FaTimes,
  FaFilter, FaCalendarAlt, FaUser, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import auditService from '../../services/auditService';
import '../../styles/admin.css';

const STATUS_MAP = {
  success: { label: 'Thành công', cls: 'badge-success', dot: 'success' },
  error:   { label: 'Lỗi',        cls: 'badge-danger',  dot: 'error'   },
  failed:  { label: 'Thất bại',   cls: 'badge-danger',  dot: 'error'   },
};

const ACTION_MAP = {
  LOGIN:         { label: 'Đăng nhập',   color: '#3b82f6' },
  LOGOUT:        { label: 'Đăng xuất',  color: '#64748b' },
  CREATE:        { label: 'Tạo mới',    color: '#10b981' },
  UPDATE:        { label: 'Cập nhật',   color: '#f97316' },
  DELETE:        { label: 'Xóa',        color: '#ef4444' },
  VIEW:          { label: 'Xem',        color: '#8b5cf6' },
  REGISTER:      { label: 'Đăng ký',    color: '#06b6d4' },
  RESET_PASSWORD:{ label: 'Đặt lại MK', color: '#ec4899' },
};

function ActionBadge({ action }) {
  const meta = ACTION_MAP[action] || { label: action, color: '#64748b' };
  return (
    <span style={{
      padding:'3px 9px', borderRadius:6,
      fontSize:11, fontWeight:700, fontFamily:'monospace',
      background: meta.color + '18', color: meta.color,
      border: `1px solid ${meta.color}30`,
    }}>
      {meta.label || action}
    </span>
  );
}

export default function AuditLogs() {
  const [logs, setLogs]       = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Filters
  const [search, setSearch]       = useState('');
  const [actionF, setActionF]     = useState('');
  const [statusF, setStatusF]     = useState('');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [actions, setActions]     = useState([]);

  // Pagination
  const [page, setPage]         = useState(1);
  const [perPage]               = useState(20);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await auditService.getAuditLogs({
        page, 
        per_page: perPage,
        search,
        action: actionF,
        status: statusF,
        date_from: dateFrom,
        date_to: dateTo
      });
      const d = data;
      setLogs(d.data);
      setTotal(d.total);
      setTotalPages(d.total_pages);
      setActions(d.actions || []);
    } catch (e) {
      setError(e.response?.data?.msg || 'Không tải được nhật ký hệ thống');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, actionF, statusF, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await auditService.getAuditStats();
      setStats(data);
    } catch {}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); }, [search, actionF, statusF, dateFrom, dateTo]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleReset = () => {
    setSearch(''); setActionF(''); setStatusF('');
    setDateFrom(''); setDateTo(''); setPage(1);
  };

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', { hour12: false });
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1><FaClipboardList />Nhật ký Hệ thống</h1>
          <p>Theo dõi toàn bộ hoạt động của người dùng: ai làm gì, lúc nào, kết quả ra sao</p>
        </div>
        <button className="btn btn-secondary" onClick={() => { fetchLogs(); fetchStats(); }}>
          <FaRedo />Làm mới
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-icon blue"><FaClipboardList /></div>
            <div className="admin-stat-info">
              <div className="admin-stat-value">{stats.total.toLocaleString()}</div>
              <div className="admin-stat-label">Tổng nhật ký</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon green"><FaCheck /></div>
            <div className="admin-stat-info">
              <div className="admin-stat-value">{stats.success.toLocaleString()}</div>
              <div className="admin-stat-label">Thành công</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon red"><FaTimes /></div>
            <div className="admin-stat-info">
              <div className="admin-stat-value">{stats.errors.toLocaleString()}</div>
              <div className="admin-stat-label">Lỗi / Thất bại</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon orange"><FaCalendarAlt /></div>
            <div className="admin-stat-info">
              <div className="admin-stat-value">{stats.today.toLocaleString()}</div>
              <div className="admin-stat-label">Hôm nay</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="admin-toolbar">
        <div className="search-box" style={{flex:2}}>
          <FaSearch className="search-icon" />
          <input
            type="text" placeholder="Tìm theo username, hành động, tài nguyên..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={actionF} onChange={e => setActionF(e.target.value)}>
          <option value="">Tất cả hành động</option>
          {actions.map(a => (
            <option key={a} value={a}>{ACTION_MAP[a]?.label || a}</option>
          ))}
        </select>
        <select className="filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="success">Thành công</option>
          <option value="error">Lỗi</option>
          <option value="failed">Thất bại</option>
        </select>
        <input
          className="date-input" type="date" value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          title="Từ ngày"
        />
        <input
          className="date-input" type="date" value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          title="Đến ngày"
        />
        <button className="btn btn-secondary btn-sm" onClick={handleReset}>
          <FaFilter />Xóa bộ lọc
        </button>
      </div>

      {error && <div className="admin-alert error"><FaTimes />{error}</div>}

      {/* Table */}
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading"><div className="spinner" />Đang tải nhật ký...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <FaClipboardList />
            <p>Không có nhật ký nào phù hợp với bộ lọc</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Người dùng</th>
                  <th>Hành động</th>
                  <th>Tài nguyên</th>
                  <th>Trạng thái</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const st = STATUS_MAP[log.status] || STATUS_MAP['error'];
                  return (
                    <tr key={log.log_id}>
                      <td>
                        <div style={{fontWeight:600, fontSize:12, color:'#0f172a'}}>
                          {log.created_at ? new Date(log.created_at).toLocaleDateString('vi-VN') : '—'}
                        </div>
                        <div style={{fontSize:11, color:'#94a3b8'}}>
                          {log.created_at ? new Date(log.created_at).toLocaleTimeString('vi-VN') : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <div style={{
                            width:30, height:30, borderRadius:'50%',
                            background:'linear-gradient(135deg,#3b82f6,#6366f1)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            color:'#fff', fontSize:12, fontWeight:700, flexShrink:0,
                          }}>
                            {log.username?.charAt(0)?.toUpperCase() || <FaUser />}
                          </div>
                          <div>
                            <div style={{fontWeight:600, fontSize:13}}>{log.username || '—'}</div>
                            <div style={{fontSize:11, color:'#94a3b8'}}>ID: {log.user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td><ActionBadge action={log.action} /></td>
                      <td>
                        {log.resource && (
                          <span style={{fontSize:12, color:'#475569'}}>
                            {log.resource}
                            {log.resource_id && <span style={{color:'#94a3b8'}}> #{log.resource_id}</span>}
                          </span>
                        )}
                        {!log.resource && <span style={{color:'#cbd5e1'}}>—</span>}
                      </td>
                      <td>
                        <span className={`badge ${st.cls}`}>
                          <span className={`audit-status-dot ${st.dot}`} />
                          {st.label}
                        </span>
                        {log.error_message && (
                          <div style={{fontSize:10, color:'#ef4444', marginTop:3}} title={log.error_message}>
                            {log.error_message.substring(0, 40)}{log.error_message.length > 40 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td style={{fontSize:12, color:'#94a3b8', fontFamily:'monospace'}}>
                        {log.ip_address || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="admin-pagination">
              <span className="pagination-info">
                Hiển thị {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} / {total.toLocaleString()} nhật ký
              </span>
              <div className="pagination-btns">
                <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  <FaChevronLeft />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = page <= 3 ? i + 1 : page - 2 + i;
                  if (p > totalPages) return null;
                  return (
                    <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  );
                })}
                <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                  <FaChevronRight />
                </button>
                <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
