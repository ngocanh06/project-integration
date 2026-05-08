import React, { useState, useEffect } from 'react';
import { getDividends, createDividend, deleteDividend } from '../../services/dividendService';
import { getEmployees } from '../../services/employeeService';
import DataTable from '../../components/DataTable';
import { Plus, Trash2, Search, DollarSign, Calendar, User } from 'lucide-react';
import '../employees/EmployeeList.css';

const DividendList = () => {
    const [dividends, setDividends] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    // Form state
    const [formData, setFormData] = useState({ EmployeeID: '', DividendAmount: '', DividendDate: '' });

    useEffect(() => {
        fetchDividends();
        fetchEmployees();
    }, []);

    const fetchDividends = async () => {
        setLoading(true);
        try {
            const data = await getDividends();
            setDividends(data);
        } catch (error) {
            console.error("Lỗi khi tải cổ tức:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const data = await getEmployees();
            setEmployees(data);
        } catch (error) {
            console.error("Lỗi khi tải nhân viên:", error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await createDividend(formData);
            alert("Thêm cổ tức thành công!");
            setShowAddForm(false);
            setFormData({ EmployeeID: '', DividendAmount: '', DividendDate: '' });
            fetchDividends();
        } catch (error) {
            alert("Lỗi khi thêm cổ tức");
        }
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return;
        if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
            try {
                await Promise.all(selectedIds.map(id => deleteDividend(id)));
                fetchDividends();
                setSelectedIds([]);
            } catch (error) {
                alert("Lỗi khi xóa");
            }
        }
    };

    const columns = [
        { key: 'DividendID', label: 'Mã GD', render: (item) => `#DIV-${item.DividendID}` },
        { 
            key: 'FullName', 
            label: 'Nhân viên',
            render: (item) => (
                <div className="user-info-cell">
                    <div className="user-avatar">{item.FullName?.charAt(0)}</div>
                    <div className="user-fullname">{item.FullName}</div>
                </div>
            )
        },
        { 
            key: 'DividendAmount', 
            label: 'Số tiền', 
            render: (item) => (
                <span className="amount-positive">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.DividendAmount)}
                </span>
            )
        },
        { 
            key: 'DividendDate', 
            label: 'Ngày chi trả', 
            render: (item) => new Date(item.DividendDate).toLocaleDateString('vi-VN') 
        },
        { 
            key: 'CreatedAt', 
            label: 'Ngày tạo', 
            render: (item) => new Date(item.CreatedAt).toLocaleString('vi-VN') 
        }
    ];

    const filteredData = dividends.filter(d => 
        d.FullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="employee-list-page">
            <div className="page-header-premium" style={{marginBottom: '20px'}}>
                <div className="header-info">
                    <h1>Quản lý Cổ tức (Dividends)</h1>
                    <p>Theo dõi và quản lý việc chi trả cổ tức cho nhân sự trong hệ thống.</p>
                </div>
            </div>

            <div className="controls-toolbar">
                <div className="filters-group">
                    <div className="search-input-wrapper">
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm theo tên nhân viên..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="actions-group">
                    <button className="btn-action btn-add" onClick={() => setShowAddForm(true)}>
                        <Plus size={18} /> <span>Thêm cổ tức</span>
                    </button>
                    <button className="btn-action btn-delete" onClick={handleDelete} disabled={selectedIds.length === 0}>
                        <Trash2 size={18} /> <span>Xóa</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loader">Đang tải...</div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredData} 
                    selectable={true}
                    selectedIds={selectedIds}
                    onToggleSelect={(id) => setSelectedIds(prev => 
                        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
                    )}
                    onSelectAll={(checked) => setSelectedIds(checked ? filteredData.map(d => d.DividendID) : [])}
                />
            )}

            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '500px'}}>
                        <div className="form-container">
                            <h2>Thêm Giao Dịch Cổ Tức</h2>
                            <form onSubmit={handleAdd}>
                                <div className="form-group">
                                    <label>Nhân viên</label>
                                    <select 
                                        required 
                                        value={formData.EmployeeID} 
                                        onChange={e => setFormData({...formData, EmployeeID: e.target.value})}
                                    >
                                        <option value="">Chọn nhân viên...</option>
                                        {employees.map(emp => (
                                            <option key={emp.EmployeeID} value={emp.EmployeeID}>{emp.FullName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Số tiền (VND)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={formData.DividendAmount} 
                                        onChange={e => setFormData({...formData, DividendAmount: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ngày chi trả</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={formData.DividendDate} 
                                        onChange={e => setFormData({...formData, DividendDate: e.target.value})}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>Hủy</button>
                                    <button type="submit" className="btn-save">Lưu</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DividendList;
