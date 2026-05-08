import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getDepartmentStats } from '../../services/departmentService';
import { Plus, Edit3, Trash2, Search, Filter, Download, Users, Building2, TrendingUp, ChevronDown, FileText } from 'lucide-react';
import Modal from '../../components/Modal';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import '../../styles/CorpManager.css';

const CARD_COLORS = ['#2563eb', '#7c3aed', '#ea580c', '#16a34a', '#db2777', '#0891b2'];
const STATUS_TAGS = [
    { label: 'Growth', color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Stable', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'High Vol.', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Optimized', color: '#8b5cf6', bg: '#f5f3ff' },
];

const ITEMS_PER_PAGE = 8;

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [stats, setStats] = useState({ total_employees: 0, total_departments: 0, budget_utilization: 88.4 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDept, setCurrentDept] = useState({ DepartmentName: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    useEffect(() => {
        fetchDepartments();
        fetchStats();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error("Error fetching departments:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await getDepartmentStats();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleAdd = () => {
        setCurrentDept({ DepartmentName: '' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEdit = (dept) => {
        setCurrentDept(dept);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) {
            try {
                const response = await deleteDepartment(id);
                fetchDepartments();
                fetchStats();
            } catch (error) {
                console.error("Delete error:", error);
                const msg = error.response?.data?.error || "Lỗi khi xóa phòng ban. Có thể phòng ban đang có nhân viên.";
                alert(`⚠️ ${msg}`);
            }
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        const name = currentDept.DepartmentName?.trim();
        if (!name) {
            alert("Vui lòng nhập tên phòng ban");
            return;
        }

        setSaving(true);
        try {
            const payload = { DepartmentName: name };
            
            if (isEditing && currentDept.DepartmentID) {
                await updateDepartment(currentDept.DepartmentID, payload);
            } else {
                await createDepartment(payload);
            }
            
            setIsModalOpen(false);
            fetchDepartments();
            fetchStats();
        } catch (error) {
            console.error("Save error:", error);
            const msg = error.response?.data?.error || "Lỗi khi lưu dữ liệu. Vui lòng thử lại.";
            alert(`⚠️ ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    const filteredDepts = departments.filter(d =>
        d.DepartmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `DEP-${String(d.DepartmentID).padStart(3, '0')}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredDepts.length / ITEMS_PER_PAGE));
    const paginatedDepts = filteredDepts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getCardColor = (index) => CARD_COLORS[index % CARD_COLORS.length];
    const getStatusTag = (index) => STATUS_TAGS[index % STATUS_TAGS.length];

    const exportToExcel = () => {
        const dataToExport = departments.map(d => ({
            "ID": `DEP-${String(d.DepartmentID).padStart(3, '0')}`,
            "Tên phòng ban": d.DepartmentName,
            "Số lượng nhân viên": d.EmployeeCount || 0,
            "Quản lý": d.ManagerName || "Chưa bổ nhiệm"
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Departments");
        XLSX.writeFile(wb, "Danh sach phong ban.xlsx");
        setShowExportMenu(false);
    };

    const exportToPDF = async () => {
        const element = document.querySelector('.corp-cards-grid');
        if (!element) return;
        setShowExportMenu(false);
        setLoading(true);
        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("Danh sach phong ban.pdf");
        } catch (error) {
            console.error("PDF Export error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="corp-container">
            {/* Page Header */}
            <div className="corp-page-header">
                <div className="corp-header-info">
                    <h1>Departments</h1>
                    <p>Manage organizational units, structure and department leads</p>
                </div>
                <button className="btn-add-primary" onClick={handleAdd}>
                    <Plus size={18} /> ADD DEPARTMENT
                </button>
            </div>

            {/* Stats Row */}
            <div className="corp-stats-row">
                <div className="corp-stat-card">
                    <div className="corp-stat-icon blue">
                        <Users size={24} color="#2563eb" />
                    </div>
                    <div className="corp-stat-details">
                        <span className="corp-stat-label">TOTAL EMPLOYEES</span>
                        <div className="corp-stat-value-row">
                            <span className="corp-stat-value">{stats.total_employees.toLocaleString()}</span>
                            <span className="corp-stat-growth">↑ 12%</span>
                        </div>
                        <div className="corp-stat-avatar-row">
                            {['4F46E5', '7C3AED', '2563EB'].map((color, i) => (
                                <img key={i} src={`https://ui-avatars.com/api/?name=U${i + 1}&background=${color}&color=fff&size=24`} alt="" className="stat-mini-avatar" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="corp-stat-card">
                    <div className="corp-stat-icon purple">
                        <Building2 size={24} color="#7c3aed" />
                    </div>
                    <div className="corp-stat-details">
                        <span className="corp-stat-label">ACTIVE UNITS</span>
                        <div className="corp-stat-value-row">
                            <span className="corp-stat-value">{stats.total_departments}</span>
                        </div>
                        <span className="corp-stat-subtext">Across 4 global regions</span>
                    </div>
                </div>

                <div className="corp-stat-card">
                    <div className="corp-stat-icon orange">
                        <TrendingUp size={24} color="#ea580c" />
                    </div>
                    <div className="corp-stat-details">
                        <span className="corp-stat-label">BUDGET UTILIZATION</span>
                        <div className="corp-stat-value-row">
                            <span className="corp-stat-value">{stats.budget_utilization}%</span>
                            <span className="corp-stat-subtext-right">Annual Goal</span>
                        </div>
                        <div className="corp-progress-bar">
                            <div className="corp-progress-fill" style={{ width: `${stats.budget_utilization}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="corp-toolbar">
                <h2>Organizational Structure</h2>
                <div className="corp-toolbar-actions">
                    <div className="corp-search-box">
                        <Search size={16} className="corp-search-icon" />
                        <input
                            type="text"
                            placeholder="Search departments, managers or IDs..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <button className="btn-outline"><Filter size={15} /> Filter</button>
                    <div className="export-dropdown-wrapper">
                        <button className="btn-outline" onClick={() => setShowExportMenu(!showExportMenu)}>
                            <Download size={15} /> Export <ChevronDown size={14} />
                        </button>
                        {showExportMenu && (
                            <div className="export-menu">
                                <div className="export-item" onClick={exportToExcel}>
                                    <img src="https://img.icons8.com/color/48/000000/microsoft-excel-2019--v1.png" alt="Excel" className="export-icon" />
                                    <span>Excel (.xlsx)</span>
                                </div>
                                <div className="export-item" onClick={exportToPDF}>
                                    <img src="https://img.icons8.com/color/48/000000/pdf.png" alt="PDF" className="export-icon" />
                                    <span>PDF (.pdf)</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="corp-loading">
                    <div className="corp-spinner"></div>
                    <span>Loading departments...</span>
                </div>
            ) : filteredDepts.length === 0 ? (
                <div className="corp-empty">
                    <Building2 size={48} color="#cbd5e1" />
                    <p>Không có phòng ban nào. Hãy thêm phòng ban mới!</p>
                </div>
            ) : (
                <div className="corp-cards-grid">
                    {paginatedDepts.map((dept, index) => {
                        const color = getCardColor(index);
                        const tag = getStatusTag(index);
                        return (
                            <div key={dept.DepartmentID} className="corp-dept-card">
                                <div className="card-top-border" style={{ background: color }}></div>

                                <div className="card-header-row">
                                    <span className="dept-badge" style={{ color, borderColor: `${color}40`, background: `${color}15` }}>
                                        #{`DEP-${String(dept.DepartmentID).padStart(3, '0')}`}
                                    </span>
                                    <div className="card-actions">
                                        <button className="action-btn edit" onClick={() => handleEdit(dept)} title="Sửa">
                                            <Edit3 size={14} />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(dept.DepartmentID)} title="Xóa">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="dept-name">{dept.DepartmentName}</h3>

                                <div className="dept-manager-section">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(dept.ManagerName || 'Manager')}&background=${color.replace('#', '')}&color=fff&size=40`}
                                        alt="Manager"
                                        className="manager-avatar"
                                    />
                                    <div className="manager-info">
                                        <span className="manager-label">MANAGER</span>
                                        <span className="manager-name">{dept.ManagerName || 'Chưa bổ nhiệm'}</span>
                                    </div>
                                </div>

                                <div className="dept-footer">
                                    <div className="headcount-info">
                                        <span className="headcount-label">HEADCOUNT</span>
                                        <span className="headcount-value">{dept.EmployeeCount || 0}</span>
                                    </div>
                                    <span className="status-tag" style={{ color: tag.color, background: tag.bg }}>
                                        {tag.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {!loading && filteredDepts.length > ITEMS_PER_PAGE && (
                <div className="corp-pagination">
                    <span className="pagination-info">
                        Showing {paginatedDepts.length} of {filteredDepts.length} departments
                    </span>
                    <div className="pagination-buttons">
                        <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
                footer={(
                    <>
                        <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                        <button className="btn-submit" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Đang lưu...' : (isEditing ? "Cập nhật" : "Thêm mới")}
                        </button>
                    </>
                )}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên phòng ban</label>
                        <input
                            type="text"
                            value={currentDept.DepartmentName}
                            onChange={(e) => setCurrentDept({ ...currentDept, DepartmentName: e.target.value })}
                            placeholder="Ví dụ: Kỹ thuật, Marketing..."
                            required
                            autoFocus
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DepartmentList;
