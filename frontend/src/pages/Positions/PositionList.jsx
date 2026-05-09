// frontend/src/pages/Positions/PositionList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaPlus, FaEdit, FaTrash, FaSearch, 
    FaChevronLeft, FaChevronRight, FaArrowUp, FaArrowDown, FaDownload
} from 'react-icons/fa';
import { getPositions } from '../../services/positionService';
import '../../styles/position.css';

const PositionList = () => {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('PositionID');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);

    useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        setLoading(true);
        try {
            const data = await getPositions();
            setPositions(data);
        } catch (error) {
            console.error('Failed to fetch positions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (pos) => {
        setSelectedPosition(pos);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (selectedPosition) {
            try {
                // Sử dụng deletePosition từ service (đã import)
                const { deletePosition } = await import('../../services/positionService');
                await deletePosition(selectedPosition.PositionID);
                fetchPositions();
                setShowDeleteModal(false);
                setSelectedPosition(null);
            } catch (error) {
                console.error('Delete failed:', error);
                alert(error.response?.data?.error || 'Không thể xóa chức vụ này vì đang có nhân viên');
            }
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const exportToCSV = () => {
        const dataToExport = sortedPositions.map(pos => ({
            'ID': pos.PositionID,
            'Position Name': pos.PositionName
        }));
        
        if (dataToExport.length === 0) {
            alert('Không có dữ liệu để xuất');
            return;
        }
        
        const headers = Object.keys(dataToExport[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of dataToExport) {
            const values = headers.map(header => {
                const value = row[header] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `chuc_vu_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    // Filter positions
    const filteredPositions = positions.filter(pos => {
        const matchesSearch = searchTerm === '' || 
            pos.PositionName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Sort positions
    const sortedPositions = [...filteredPositions].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedPositions.length / itemsPerPage);
    const paginatedPositions = sortedPositions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="position-page">
            <div className="position-container">
                {/* Page Header */}
                <div className="page-header-position">
                    <h1>Quản lý chức vụ</h1>
                    <Link to="/positions/add" className="btn-add">
                        <FaPlus /> Add Position
                    </Link>
                </div>

                {/* Search and Export Bar */}
                <div className="search-bar-position">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm chức vụ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-export" onClick={exportToCSV}>
                        <FaDownload /> Export
                    </button>
                </div>

                {/* Positions Table */}
                <div className="table-container-position">
                    {loading ? (
                        <div className="loading-spinner">Đang tải...</div>
                    ) : (
                        <table className="position-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('PositionID')}>
                                        ID {sortField === 'PositionID' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th onClick={() => handleSort('PositionName')}>
                                        Position Name {sortField === 'PositionName' && (sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />)}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPositions.map(pos => (
                                    <tr key={pos.PositionID}>
                                        <td>{pos.PositionID}</td>
                                        <td className="position-name-cell">
                                            {pos.PositionName}
                                        </td>
                                        <td className="actions-cell">
                                            <Link to={`/positions/edit/${pos.PositionID}`} className="btn-edit">
                                                <FaEdit />
                                            </Link>
                                            <button 
                                                className="btn-delete" 
                                                onClick={() => handleDeleteClick(pos)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedPositions.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="no-data">Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-position">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <FaChevronLeft /> Trước
                            </button>
                            <span className="page-info">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Sau <FaChevronRight />
                            </button>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Xác nhận xóa</h3>
                            <p>Bạn có chắc chắn muốn xóa <strong>{selectedPosition?.PositionName}</strong>?</p>
                            <p className="warning-text">Hành động này không thể hoàn tác. Chức vụ có nhân viên không thể xóa.</p>
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Hủy</button>
                                <button className="btn-confirm-delete" onClick={handleDelete}>Xóa</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PositionList;