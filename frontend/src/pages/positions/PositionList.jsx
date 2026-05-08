import React, { useState, useEffect } from 'react';
import { getPositions, createPosition, updatePosition, deletePosition, getPositionStats } from '../../services/positionService';
import { Plus, Edit3, Trash2, Search, Filter, Download, Briefcase, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import Modal from '../../components/Modal';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import '../../styles/CorpManager.css';
import './PositionList.css';

const ITEMS_PER_PAGE = 15;

const PositionList = () => {
    const [positions, setPositions] = useState([]);
    const [stats, setStats] = useState({ total_positions: 0, total_employees: 0, filled_percent: 0, vacant: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPos, setCurrentPos] = useState({ PositionName: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [posData, statsData] = await Promise.all([
                getPositions(),
                getPositionStats()
            ]);
            setPositions(posData);
            setStats(statsData);
        } catch (error) {
            console.error("Error fetching positions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setCurrentPos({ PositionName: '' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEdit = (pos) => {
        setCurrentPos(pos);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa chức vụ này?")) {
            try {
                await deletePosition(id);
                fetchData();
            } catch (error) {
                console.error("Delete error:", error);
                const msg = error.response?.data?.error || "Lỗi khi xóa chức vụ. Có thể chức vụ đang được sử dụng.";
                alert(`⚠️ ${msg}`);
            }
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const name = currentPos.PositionName?.trim();
        if (!name) {
            alert("Vui lòng nhập tên chức vụ");
            return;
        }

        setSaving(true);
        try {
            const payload = { PositionName: name };
            
            if (isEditing && currentPos.PositionID) {
                await updatePosition(currentPos.PositionID, payload);
            } else {
                await createPosition(payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Submit error:", error);
            const msg = error.response?.data?.error || "Lỗi khi lưu dữ liệu. Vui lòng kiểm tra kết nối CSDL.";
            alert(`⚠️ ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    const filteredPositions = positions.filter(p =>
        p.PositionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `POS-${String(p.PositionID).padStart(3, '0')}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToExcel = () => {
        const dataToExport = positions.map(p => ({
            "ID": `POS-${String(p.PositionID).padStart(3, '0')}`,
            "Tên chức vụ": p.PositionName,
            "Số lượng nhân viên": p.EmployeeCount || 0
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Positions");
        XLSX.writeFile(wb, "Danh sach chuc vu.xlsx");
        setShowExportMenu(false);
    };

    const exportToPDF = async () => {
        const element = document.querySelector('.pos-cards-grid');
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
            pdf.save("Danh sach chuc vu.pdf");
        } catch (error) {
            console.error("PDF Export error:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(filteredPositions.length / ITEMS_PER_PAGE));
    const paginated = filteredPositions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="corp-container">
            {/* Page Header */}
            <div className="corp-page-header">
                <div className="corp-header-info">
                    <h1>Positions</h1>
                    <p>Manage job titles and role classifications</p>
                </div>
                <button className="btn-add-primary" onClick={handleAdd}>
                    <Plus size={18} /> ADD POSITION
                </button>
            </div>

            {/* Stats Row */}
            <div className="corp-stats-row">
                <div className="corp-stat-card">
                    <div className="corp-stat-icon blue">
                        <Briefcase size={24} color="#2563eb" />
                    </div>
                    <div className="corp-stat-details">
                        <span className="corp-stat-label">TOTAL ROLES</span>
                        <div className="corp-stat-value-row">
                            <span className="corp-stat-value">{stats.total_positions}</span>
                        </div>
                        <span className="corp-stat-subtext">Active classifications</span>
                    </div>
                </div>

                <div className="corp-stat-card">
                    <div className="corp-stat-icon green">
                        <CheckCircle size={24} color="#16a34a" />
                    </div>
                    <div className="corp-stat-details">
                        <span className="corp-stat-label">FILLED RATE</span>
                        <div className="corp-stat-value-row">
                            <span className="corp-stat-value pos-filled-rate">{stats.filled_percent}%</span>
                        </div>
                        <div className="corp-progress-bar">
                            <div className="corp-progress-fill pos-progress-green" style={{ width: `${stats.filled_percent}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="corp-stat-card">
                    <div className="corp-stat-icon orange-light">
                        <Clock size={24} color="#d97706" />
                    </div>
                    <div className="corp-stat-details">
                        <span className="corp-stat-label">OPEN VACANCIES</span>
                        <div className="corp-stat-value-row">
                            <span className="corp-stat-value">{stats.vacant}</span>
                        </div>
                        <span className="corp-stat-subtext">Priority hiring</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="corp-toolbar">
                <h2>Position Structure</h2>
                <div className="corp-toolbar-actions">
                    <div className="corp-search-box">
                        <Search size={16} className="corp-search-icon" />
                        <input
                            type="text"
                            placeholder="Search positions..."
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

            {/* Positions Grid — 5 columns, compact cards */}
            {loading ? (
                <div className="corp-loading">
                    <div className="corp-spinner"></div>
                    <span>Loading positions...</span>
                </div>
            ) : filteredPositions.length === 0 ? (
                <div className="corp-empty">
                    <Briefcase size={48} color="#cbd5e1" />
                    <p>Không có chức vụ nào. Hãy thêm chức vụ mới!</p>
                </div>
            ) : (
                <div className="pos-cards-grid">
                    {paginated.map((pos) => (
                        <div key={pos.PositionID} className="pos-card">
                            <div className="pos-card-actions">
                                <button className="action-btn edit" onClick={() => handleEdit(pos)} title="Sửa">
                                    <Edit3 size={13} />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(pos.PositionID)} title="Xóa">
                                    <Trash2 size={13} />
                                </button>
                            </div>

                            <span className="pos-badge">
                                #{`POS-${String(pos.PositionID).padStart(3, '0')}`}
                            </span>

                            <h3 className="pos-name">{pos.PositionName}</h3>

                            <div className="pos-footer">
                                <span className="pos-staff-label">Current Staff</span>
                                <span className={`pos-staff-count ${(pos.EmployeeCount || 0) > 0 ? 'has-staff' : ''}`}>
                                    {pos.EmployeeCount || 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && filteredPositions.length > ITEMS_PER_PAGE && (
                <div className="corp-pagination">
                    <span className="pagination-info">
                        Showing {paginated.length} of {filteredPositions.length} positions
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
                title={isEditing ? "Chỉnh sửa chức vụ" : "Thêm chức vụ mới"}
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
                        <label>Tên chức vụ</label>
                        <input
                            type="text"
                            value={currentPos.PositionName}
                            onChange={(e) => setCurrentPos({ ...currentPos, PositionName: e.target.value })}
                            placeholder="Ví dụ: Lập trình viên, Kế toán, Giám đốc..."
                            required
                            autoFocus
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PositionList;
