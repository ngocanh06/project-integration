// frontend/src/pages/Admin/PermissionList.jsx
import React, { useState, useEffect } from 'react';
import { 
    FaLock, FaRedo, FaSearch, FaChevronDown, FaChevronUp,
    FaUsers, FaBuilding, FaBriefcase, FaMoneyBillWave, 
    FaCalendarAlt, FaGift, FaChartBar, FaUserCog, 
    FaShieldAlt, FaClipboardList, FaBell, FaUserTag
} from 'react-icons/fa';
import api from '../../utils/api';
import '../../styles/admin.css';

const GROUP_ICONS = {
    employees:   <FaUsers />,
    departments: <FaBuilding />,
    positions:   <FaUserTag />,
    payroll:     <FaMoneyBillWave />,
    attendance:  <FaCalendarAlt />,
    dividends:   <FaGift />,
    reports:     <FaChartBar />,
    users:       <FaUserCog />,
    roles:       <FaShieldAlt />,
    audit:       <FaClipboardList />,
    alerts:      <FaBell />,
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
    create: { label: 'Tạo mới', cls: 'badge-success' },
    read:   { label: 'Xem',     cls: 'badge-primary' },
    update: { label: 'Sửa',     cls: 'badge-warning' },
    delete: { label: 'Xóa',     cls: 'badge-danger' },
    approve: { label: 'Duyệt',  cls: 'badge-info' },
    export: { label: 'Xuất',    cls: 'badge-secondary' },
};

function PermGroup({ group, defaultOpen }) {
    const [open, setOpen] = useState(defaultOpen || false);
    const icon = GROUP_ICONS[group.resource] || <FaLock />;
    const color = GROUP_COLORS[group.resource] || '#64748b';

    return (
        <div className="perm-group-card">
            <div className="perm-group-header" onClick={() => setOpen(v => !v)}>
                <div className="perm-group-title">
                    <div className="perm-group-icon" style={{ background: `${color}18`, color }}>
                        {icon}
                    </div>
                    {group.resource_label}
                    <span className="badge badge-secondary" style={{ marginLeft: 4 }}>{group.count}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{group.count} quyền</span>
                    {open ? <FaChevronUp style={{ color: '#94a3b8' }} /> : <FaChevronDown style={{ color: '#94a3b8' }} />}
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
    const [groups, setGroups] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [totalPerms, setTotal] = useState(0);

    const fetchPerms = async () => {
        setLoading(true);
        try {
            const res = await api.get('/permissions');
            const data = res.data.data;
            setGroups(data);
            setFiltered(data);
            setTotal(data.reduce((s, g) => s + g.count, 0));
        } catch (e) {
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
                         p.resource?.toLowerCase().includes(q) ||
                         p.action?.toLowerCase().includes(q)
                ),
            }))
            .filter(g => g.permissions.length > 0 || g.resource_label.toLowerCase().includes(q));
        setFiltered(f);
    }, [search, groups]);

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1><FaLock /> Danh mục Quyền hạn</h1>
                    <p>Tra cứu toàn bộ quyền hạn trong hệ thống, phân loại theo nhóm chức năng</p>
                </div>
                <button className="btn btn-secondary" onClick={fetchPerms}>
                    <FaRedo /> Làm mới
                </button>
            </div>

            {/* Stats */}
            <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon purple"><FaLock /></div>
                    <div className="admin-stat-info">
                        <div className="admin-stat-value">{totalPerms}</div>
                        <div className="admin-stat-label">Tổng quyền hạn</div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon blue"><FaLock /></div>
                    <div className="admin-stat-info">
                        <div className="admin-stat-value">{groups.length}</div>
                        <div className="admin-stat-label">Nhóm chức năng</div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon green"><FaLock /></div>
                    <div className="admin-stat-info">
                        <div className="admin-stat-value">{filtered.reduce((s, g) => s + g.count, 0)}</div>
                        <div className="admin-stat-label">Kết quả hiển thị</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="admin-toolbar" style={{ marginBottom: 20 }}>
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm quyền hạn theo tên, nhóm, thao tác..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="admin-alert error">{error}</div>}

            {loading ? (
                <div className="admin-loading">
                    <div className="spinner" />Đang tải quyền hạn...
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <FaLock />
                    <p>Không tìm thấy quyền hạn phù hợp</p>
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