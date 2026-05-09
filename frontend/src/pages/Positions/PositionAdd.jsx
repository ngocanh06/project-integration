// frontend/src/pages/Positions/PositionAdd.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import { addPosition } from '../../services/positionService';
import '../../styles/position.css';

const PositionAdd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        PositionName: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.PositionName.trim()) {
            setError('Vui lòng nhập tên chức vụ');
            return;
        }
        
        setLoading(true);
        try {
            await addPosition(formData);
            navigate('/positions');
        } catch (error) {
            setError(error.response?.data?.error || 'Thêm chức vụ thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="position-page">
            <div className="position-container">
                <div className="form-header-position">
                    <h1>Thêm chức vụ mới</h1>
                    <Link to="/positions" className="btn-back">
                        <FaTimes /> Hủy
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="position-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group-position">
                        <label>Tên chức vụ *</label>
                        <input
                            type="text"
                            name="PositionName"
                            value={formData.PositionName}
                            onChange={handleChange}
                            placeholder="Nhập tên chức vụ"
                            required
                        />
                    </div>

                    <div className="form-actions-position">
                        <button type="submit" className="btn-submit" disabled={loading}>
                            <FaSave /> {loading ? 'Đang lưu...' : 'Lưu chức vụ'}
                        </button>
                        <Link to="/positions" className="btn-cancel">Hủy</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PositionAdd;