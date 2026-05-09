// frontend/src/pages/Positions/PositionDelete.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaTrash, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { getPositionById, deletePosition } from '../../services/positionService';
import '../../styles/position.css';

const PositionDelete = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [position, setPosition] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPosition();
    }, [id]);

    const fetchPosition = async () => {
        setFetching(true);
        try {
            const data = await getPositionById(id);
            setPosition(data);
        } catch (error) {
            console.error('Failed to fetch position:', error);
            setError('Không tìm thấy chức vụ');
        } finally {
            setFetching(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deletePosition(id);
            navigate('/positions');
        } catch (error) {
            console.error('Delete failed:', error);
            setError(error.response?.data?.error || 'Không thể xóa chức vụ này vì đang có nhân viên');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="loading-spinner">Đang tải...</div>;
    }

    if (error && !position) {
        return (
            <div className="position-page">
                <div className="position-container">
                    <div className="error-container">
                        <p>{error}</p>
                        <Link to="/positions" className="btn-back">Quay lại</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="position-page">
            <div className="position-container">
                <div className="form-header-position">
                    <h1>Xóa chức vụ</h1>
                    <Link to="/positions" className="btn-back">
                        <FaArrowLeft /> Hủy
                    </Link>
                </div>

                <div className="delete-confirmation-card">
                    <div className="delete-warning-icon">
                        <FaTrash size={48} />
                    </div>
                    <h3>Bạn có chắc chắn?</h3>
                    <p>Bạn sắp xóa chức vụ <strong>"{position?.PositionName}"</strong></p>
                    <p className="warning-text">Hành động này không thể hoàn tác. Chức vụ đang có nhân viên không thể xóa.</p>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="delete-actions">
                        <Link to="/positions" className="btn-cancel-delete">
                            <FaTimes /> Hủy
                        </Link>
                        <button 
                            className="btn-confirm-delete-position" 
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <FaTrash /> {loading ? 'Đang xóa...' : 'Xóa chức vụ'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PositionDelete;