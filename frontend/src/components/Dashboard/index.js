import React from 'react';
import { Users, DollarSign, UserPlus, Clock } from 'lucide-react';
import './Dashboard.scss';

const Dashboard = () => {
  const stats = [
    { title: 'Tổng nhân viên', value: '1,248', icon: <Users size={24} />, color: 'blue', trend: '+12%' },
    { title: 'Quỹ lương tháng', value: '2.4B VNĐ', icon: <DollarSign size={24} />, color: 'green', trend: '+5.4%' },
    { title: 'Nhân viên mới', value: '24', icon: <UserPlus size={24} />, color: 'purple', trend: '+2' },
    { title: 'Chờ duyệt lương', value: '12', icon: <Clock size={24} />, color: 'orange', trend: 'Cần xử lý' },
  ];

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className={`stat-card stat-card--${stat.color}`}>
            <div className="stat-card__header">
              <div className="stat-card__icon">{stat.icon}</div>
              <span className="stat-card__trend">{stat.trend}</span>
            </div>
            <div className="stat-card__body">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;