import React, { useState, useEffect } from 'react';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/departments')
            .then(res => res.json())
            .then(data => {
                setDepartments(data);
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
                        <th>Tên Phòng ban</th>
                        <th>Ngày đồng bộ</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map(dept => (
                        <tr key={dept.DepartmentID}>
                            <td>{dept.DepartmentID}</td>
                            <td>{dept.DepartmentName}</td>
                            <td>{new Date(dept.SyncedAt).toLocaleString('vi-VN')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Departments;
