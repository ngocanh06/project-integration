import React, { useState, useEffect } from 'react';

const Positions = () => {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/positions')
            .then(res => res.json())
            .then(data => {
                setPositions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Đang tải dữ liệu...</div>;

    return (
        <div className="table-container">
            <table className="custom-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Chức vụ</th>
                        <th>Ngày đồng bộ</th>
                    </tr>
                </thead>
                <tbody>
                    {positions.map(pos => (
                        <tr key={pos.PositionID}>
                            <td>{pos.PositionID}</td>
                            <td>{pos.PositionName}</td>
                            <td>{new Date(pos.SyncedAt).toLocaleString('vi-VN')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Positions;
