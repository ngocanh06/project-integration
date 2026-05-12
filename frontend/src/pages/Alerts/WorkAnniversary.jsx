// frontend/src/pages/Alerts/WorkAnniversary.jsx
import React, { useState, useEffect } from 'react';
import { FaBirthdayCake, FaArrowLeft, FaGift, FaEnvelope, FaSync } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getAnniversaryAlerts } from '../../services/alertService';
import '../../styles/alerts.css';

const WorkAnniversary = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [anniversaries, setAnniversaries] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getAnniversaryAlerts();
            setAnniversaries(data || []);
        } catch (error) {
            console.error('Failed to fetch anniversaries:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải danh sách kỷ niệm...</p>
            </div>
        );
    }

    return (
        <div className="anniversary-page">
            <div className="page-header">
                <button className="btn-back" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Quay lại
                </button>
                <div className="header-title">
                    <h1><FaBirthdayCake className="icon-gold" /> Kỷ Niệm Ngày Làm Việc</h1>
                    <p>Danh sách nhân viên có ngày vào làm trùng với hôm nay</p>
                </div>
                <button className="btn-refresh-circle" onClick={fetchData}>
                    <FaSync />
                </button>
            </div>

            <div className="anniversary-container">
                {anniversaries.length > 0 ? (
                    <div className="table-responsive">
                        <table className="anniversary-table">
                            <thead>
                                <tr>
                                    <th>Id <FaArrowLeft style={{ transform: 'rotate(90deg)', fontSize: '10px' }} /></th>
                                    <th>Name</th>
                                    <th>Department</th>
                                    <th>Position</th>
                                    <th>Email</th>
                                    <th>Hire date</th>
                                    <th>Years worked</th>
                                    <th>Next anniversary in</th>
                                </tr>
                            </thead>
                            <tbody>
                                {anniversaries.map((item) => (
                                    <tr key={item.id} className={item.days_remaining === 0 ? 'today-row' : ''}>
                                        <td>{item.employee_id}</td>
                                        <td className="emp-name">
                                            <div className="name-with-avatar">
                                                {item.employee_name}
                                            </div>
                                        </td>
                                        <td>{item.department}</td>
                                        <td>{item.position}</td>
                                        <td>{item.email}</td>
                                        <td>{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                                        <td className="years-cell">
                                            <span className="years-badge">{item.years} Năm</span>
                                        </td>
                                        <td>
                                            {item.days_remaining === 0 ? (
                                                <span className="status-today">Hôm nay! 🎉</span>
                                            ) : (
                                                <div className="countdown-cell">
                                                    <span className="days-count">{item.days_remaining} ngày</span>
                                                    <span className="next-info">Kỷ niệm {item.years_next} năm</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="no-anniversary">
                        <FaBirthdayCake size={64} className="icon-empty" />
                        <h3>Hôm nay không có kỷ niệm nào</h3>
                        <p>Hãy kiểm tra lại vào ngày mai nhé!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkAnniversary;
