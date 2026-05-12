// frontend/src/pages/Admin/RoleList.jsx
import React, { useState, useEffect } from 'react';
import {
    FaUserShield, FaRedo, FaCheckCircle, FaLock,
    FaUsers, FaCalculator, FaUserTie, FaChevronDown, FaChevronUp,
    FaBuilding, FaBriefcase, FaMoneyBillWave, FaCalendarAlt,
    FaGift, FaChartBar, FaUserCog, FaClipboardList, FaBell, FaUserTag
} from 'react-icons/fa';
import api from '../../utils/api';
import '../../styles/admin.css';

const RESOURCE_ICONS = {
    employees:   <FaUsers />,
    departments: <FaBuilding />,
    positions:   <FaUserTag />,
    payroll:     <FaMoneyBillWave />,
    attendance:  <FaCalendarAlt />,
    dividends:   <FaGift />,
    reports:     <FaChartBar />,
    users:       <FaUserCog />,
    roles:       <FaUserShield />,
    audit:       <FaClipboardList />,
    alerts:      <FaBell />,
};

const RESOURCE_LABELS = {
    employees:   'Nhân sự',
    departments: 'Phòng ban',
    positions:   'Chức vụ',
    payroll:     'Lương',
    attendance:  'Chấm công',
    dividends:   'Cổ tức',
    reports:     'Báo cáo',
    users:       'Tài khoản',
    roles:       'Vai trò',
    audit:       'Nhật ký',
    alerts:      'Cảnh báo',
};

const ACTION_LABELS = {
    create: 'Tạo mới',
    read:   'Xem',
    update: 'Chỉnh sửa',
    delete: 'Xóa',
    approve: 'Duyệt',
    export: 'Xuất',
};

const ACTION_COLORS = {
    create: '#10b981',
    read:   '#3b82f6',
    update: '#f59e0b',
    delete: '#ef4444',
    approve: '#8b5cf6',
    export: '#64748b',
};

function RoleCard({ role }) {
    const [expanded, setExpanded] = useState(false);

    // Group permissions by resource
    const grouped = {};
    (role.permissions || []).forEach(p => {
        if (!grouped[p.resource]) grouped[p.resource] = [];
        grouped[p.resource].push(p);
    });

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
                <div className={`role-card-icon ${role.color}`} style={{ backgroundColor: `${getRoleColor(role.color)}15`, color: getRoleColor(role.color) }}>
                    {role.color === 'danger' && <FaUserShield />}
                    {role.color === 'primary' && <FaUsers />}
                    {role.color === 'success' && <FaCalculator />}
                    {role.color === 'info' && <FaUserTie />}
                    {!role.color && <FaUserShield />}
                </div>
            </div>

            <div className="role-perm-count">
                <FaCheckCircle style={{ color: '#10b981' }} />
                <strong>{role.perm_count}</strong> quyền hạn được cấp
            </div>

            {/* Preview chips */}
            <div className="role-perms-list" style={{ maxHeight: expanded ? 'none' : 80, overflow: 'hidden' }}>
                {Object.entries(grouped).map(([res, perms]) => (
                    <span key={res} className="perm-chip">
                        {RESOURCE_ICONS[res]} {RESOURCE_LABELS[res] || res} ({perms.length})
                    </span>
                ))}
            </div>

            {/* Expand button */}
            <button
                className="role-expand-btn"
                onClick={() => setExpanded(v => !v)}
            >
                {expanded ? <><FaChevronUp /> Thu gọn</> : <><FaChevronDown /> Xem chi tiết quyền</>}
            </button>

            {expanded && (
                <div className="role-perms-detail">
                    {Object.entries(grouped).map(([res, perms]) => (
                        <div key={res} className="perm-group-detail">
                            <div className="perm-group-title">
                                {RESOURCE_ICONS[res]} {RESOURCE_LABELS[res] || res}
                            </div>
                            <div className="perm-group-actions">
                                {perms.map(p => (
                                    <span key={p.permission_id} className="perm-action-badge" style={{ backgroundColor: `${ACTION_COLORS[p.action]}15`, color: ACTION_COLORS[p.action] }}>
                                        <FaLock style={{ fontSize: 9 }} />
                                        {ACTION_LABELS[p.action] || p.action}
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
        try {
            const res = await api.get('/roles');
            setRoles(res.data);
        } catch (e) {
            setError(e.response?.data?.msg || 'Không tải được danh sách vai trò');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRoles(); }, []);

    const totalPerms = roles.reduce((s, r) => s + (r.perm_count || 0), 0);

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1><FaUserShield /> Vai trò &amp; Quyền hạn</h1>
                    <p>Xem và quản lý các vai trò và quyền hạn được phân công trong hệ thống</p>
                </div>
                <button className="btn btn-secondary" onClick={fetchRoles}>
                    <FaRedo /> Làm mới
                </button>
            </div>

            {/* Summary stats */}
            <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon purple"><FaUserShield /></div>
                    <div className="admin-stat-info">
                        <div className="admin-stat-value">{roles.length}</div>
                        <div className="admin-stat-label">Vai trò trong hệ thống</div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon blue"><FaCheckCircle /></div>
                    <div className="admin-stat-info">
                        <div className="admin-stat-value">{totalPerms}</div>
                        <div className="admin-stat-label">Tổng quyền được cấp</div>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon green"><FaLock /></div>
                    <div className="admin-stat-info">
                        <div className="admin-stat-value">RBAC</div>
                        <div className="admin-stat-label">Phân quyền dựa theo vai trò</div>
                    </div>
                </div>
            </div>

            {error && <div className="admin-alert error">{error}</div>}

            {loading ? (
                <div className="admin-loading">
                    <div className="spinner" /> Đang tải vai trò...
                </div>
            ) : (
                <div className="roles-grid">
                    {roles.map(role => <RoleCard key={role.role_id} role={role} />)}
                </div>
            )}
        </div>
    );
}