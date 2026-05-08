import React, { useState, useEffect } from 'react';
import { getEmployees, deleteEmployee } from '../../services/employeeService';
import { getDepartments } from '../../services/departmentService';
import { getPositions } from '../../services/positionService';
import DataTable from '../../components/DataTable';
import EmployeeAdd from './EmployeeAdd';
import EmployeeEdit from './EmployeeEdit';
import { Search, Plus, Edit3, Trash2, RefreshCw, FileText, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import axios from 'axios';
import './EmployeeList.css';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedPos, setSelectedPos] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const columns = [
        { key: 'EmployeeID', label: 'Mã nhân viên', render: (item) => String(item.EmployeeID).padStart(4, '0') },
        { 
            key: 'FullName', 
            label: 'Họ và tên', 
            render: (item) => (
                <div className="user-info-cell">
                    <div className="user-avatar">
                        {item.FullName ? item.FullName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="user-details">
                        <span className="user-fullname">{item.FullName}</span>
                        <span className="user-contact">{item.Email}</span>
                    </div>
                </div>
            ) 
        },
        { key: 'PhoneNumber', label: 'Số điện thoại', render: (item) => item.PhoneNumber || '—' },
        { key: 'DepartmentName', label: 'Phòng ban' },
        { key: 'PositionName', label: 'Chức vụ' },
        { key: 'HireDate', label: 'Ngày vào làm', render: (item) => item.HireDate ? new Date(item.HireDate).toLocaleDateString('vi-VN') : '' },
        { 
            key: 'Status', 
            label: 'Trạng thái', 
            render: (item) => (
                <span className={`status-badge ${item.Status === 'Đang làm việc' ? 'active' : item.Status === 'Thử việc' ? 'probation' : 'leave'}`}>
                    {item.Status}
                </span>
            )
        },
    ];

    useEffect(() => {
        fetchDepartments();
        fetchPositions();
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [searchTerm, selectedDept, selectedPos, selectedStatus]);

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data.map(d => ({ id: d.DepartmentID, name: d.DepartmentName })));
        } catch (error) {
            console.error("Lỗi khi tải phòng ban:", error);
        }
    };

    const fetchPositions = async () => {
        try {
            const data = await getPositions();
            setPositions(data.map(p => ({ id: p.PositionID, name: p.PositionName })));
        } catch (error) {
            console.error("Lỗi khi tải chức vụ:", error);
        }
    };

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await getEmployees(searchTerm, selectedDept, selectedPos, selectedStatus);
            setEmployees(data);
            setSelectedIds([]); // Reset selection when data changes
        } catch (error) {
            console.error("Lỗi khi tải nhân viên:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(employees.map(emp => emp.EmployeeID));
        } else {
            setSelectedIds([]);
        }
    };

    const handleEditSelected = () => {
        if (selectedIds.length === 0) {
            alert("Vui lòng chọn một nhân viên để cập nhật!");
            return;
        }
        if (selectedIds.length > 1) {
            alert("Chỉ được chọn 1 nhân viên để sửa đổi!");
            return;
        }
        
        const empToEdit = employees.find(emp => emp.EmployeeID === selectedIds[0]);
        if (empToEdit) {
            setEditingEmployee(empToEdit);
            setShowEditForm(true);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) {
            alert("Vui lòng chọn nhân viên để xóa!");
            return;
        }

        if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} nhân viên đã chọn?`)) {
            try {
                await Promise.all(selectedIds.map(id => deleteEmployee(id)));
                alert("Đã xóa nhân viên thành công!");
                fetchEmployees();
            } catch (error) {
                console.error("Lỗi khi xóa nhân viên:", error);
                alert("Có lỗi xảy ra khi xóa nhân viên.");
            }
        }
    };

    const exportToExcel = () => {
        const dataToExport = employees.map(emp => ({
            "Mã nhân viên": emp.EmployeeID,
            "Họ và tên": emp.FullName,
            "Email": emp.Email,
            "Số điện thoại": emp.PhoneNumber,
            "Phòng ban": emp.DepartmentName || "N/A",
            "Chức vụ": emp.PositionName || "N/A",
            "Ngày vào làm": emp.HireDate ? new Date(emp.HireDate).toLocaleDateString('vi-VN') : "",
            "Trạng thái": emp.Status
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Danh sách nhân viên");
        XLSX.writeFile(wb, "Danh sach nhan vien.xlsx");
    };

    const exportToPDF = async () => {
        const element = document.getElementById('employee-table-container');
        if (!element) return;

        setShowExportMenu(false);
        setLoading(true);

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Danh_sach_nhan_vien_${Date.now()}.pdf`);
        } catch (error) {
            console.error("Lỗi khi xuất PDF:", error);
            alert("Có lỗi xảy ra khi xuất PDF");
        } finally {
            setLoading(false);
        }
    };

    const exportToExcelWithMenu = () => {
        exportToExcel();
        setShowExportMenu(false);
    };

    const handleSyncPayroll = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/payroll/sync');
            alert(response.data.message);
        } catch (error) {
            console.error("Lỗi khi đồng bộ:", error);
            alert("Có lỗi xảy ra khi đồng bộ.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="employee-list-page">
            <div className="controls-toolbar">
                <div className="filters-group">
                    <div className="search-input-wrapper">
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm nhân viên..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="filter-dropdown">
                        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                            <option value="">Phòng ban</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-dropdown">
                        <select value={selectedPos} onChange={(e) => setSelectedPos(e.target.value)}>
                            <option value="">Chức vụ</option>
                            {positions.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-dropdown">
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                            <option value="">Trạng thái</option>
                            <option value="Đang làm việc">Đang làm việc</option>
                            <option value="Thử việc">Thử việc</option>
                            <option value="Nghỉ phép">Nghỉ phép</option>
                        </select>
                    </div>
                </div>

                <div className="actions-group">
                    <button className="btn-action btn-add" onClick={() => setShowAddForm(true)}>
                        <Plus size={18} /> <span>Thêm nhân viên</span>
                    </button>
                    <button className="btn-action btn-edit" onClick={handleEditSelected} disabled={selectedIds.length !== 1}>
                        <Edit3 size={18} /> <span>Cập nhật</span>
                    </button>
                    <button className="btn-action btn-delete" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
                        <Trash2 size={18} /> <span>Xóa</span>
                    </button>
                    
                    <div className="export-dropdown-wrapper">
                        <button className="btn-action btn-export" onClick={() => setShowExportMenu(!showExportMenu)}>
                            <FileText size={18} /> <span>Xuất báo cáo</span> <ChevronDown size={14} />
                        </button>
                        {showExportMenu && (
                            <div className="export-menu">
                                <div className="export-item" onClick={exportToExcelWithMenu}>
                                    <img src="https://img.icons8.com/color/48/000000/microsoft-excel-2019--v1.png" alt="Excel" className="export-icon" />
                                    <span>Xuất Excel (.xlsx)</span>
                                </div>
                                <div className="export-item" onClick={exportToPDF}>
                                    <img src="https://img.icons8.com/color/48/000000/pdf.png" alt="PDF" className="export-icon" />
                                    <span>Xuất PDF (.pdf)</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="btn-action btn-sync" onClick={handleSyncPayroll}>
                        <RefreshCw size={18} /> <span>Đồng bộ</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loader">Đang tải...</div>
            ) : (
                <div id="employee-table-container">
                    <DataTable 
                        columns={columns} 
                        data={employees} 
                        selectable={true}
                        selectedIds={selectedIds}
                        onToggleSelect={handleToggleSelect}
                        onSelectAll={handleSelectAll}
                    />
                </div>
            )}

            {/* Modal cho Thêm Nhân Viên */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <EmployeeAdd 
                            onSave={() => {
                                setShowAddForm(false);
                                fetchEmployees();
                            }} 
                            onCancel={() => setShowAddForm(false)} 
                        />
                    </div>
                </div>
            )}

            {/* Modal cho Sửa Nhân Viên */}
            {showEditForm && editingEmployee && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <EmployeeEdit 
                            employee={editingEmployee}
                            onSave={() => {
                                setShowEditForm(false);
                                setEditingEmployee(null);
                                fetchEmployees();
                            }} 
                            onCancel={() => {
                                setShowEditForm(false);
                                setEditingEmployee(null);
                            }} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;
