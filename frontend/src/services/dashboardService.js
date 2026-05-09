// frontend/src/services/dashboardService.js
import api from '../utils/api';

export const getDashboardStats = async () => {
    try {
        const response = await api.get('/dashboard/stats');
        return response.data;
    } catch (error) {
        return {
            totalEmployees: 562,
            presentToday: 542,
            onLeave: 20,
            dividends: 5245,
            totalRevenue: 953.55
        };
    }
};

export const getEmployeesByDepartment = async () => {
    try {
        const response = await api.get('/dashboard/departments');
        return response.data;
    } catch (error) {
        return [
            { name: 'Kinh Doanh', count: 120, percentage: 100, color: '#4a80f0' },
            { name: 'Công nghệ', count: 95, percentage: 79, color: '#5c9ef0' },
            { name: 'Marketing', count: 78, percentage: 65, color: '#6fb0f5' },
            { name: 'Kế toán', count: 62, percentage: 52, color: '#8bc3f8' },
            { name: 'Tài chính', count: 58, percentage: 48, color: '#a5d4fa' },
            { name: 'Hành chính', count: 45, percentage: 38, color: '#c0e5fc' }
        ];
    }
};

export const getRecentActivities = async (range = 'monthly') => {
    try {
        const response = await api.get(`/dashboard/activities?range=${range}`);
        return response.data;
    } catch (error) {
        const activities = {
            monthly: [
                { icon: '👤', title: 'New employee Nguyen Van A joined', time: '2 hours ago', trend: null },
                { icon: '📊', title: 'Salary report for September generated', time: '5 hours ago', trend: null },
                { icon: '🎉', title: 'Employee work anniversary: Tran Thi B', time: '1 day ago', trend: null },
                { icon: '📈', title: 'Q3 dividend announced', time: '2 days ago', trend: 12 },
                { icon: '👥', title: 'Department meeting scheduled', time: '3 days ago', trend: null },
                { icon: '💰', title: 'Payroll processed for October', time: '5 days ago', trend: 8 }
            ],
            weekly: [
                { icon: '👤', title: 'New employee joined', time: '2 days ago', trend: null },
                { icon: '📊', title: 'Weekly report generated', time: '3 days ago', trend: 5 },
            ],
            daily: [
                { icon: '👤', title: 'Morning check-in completed', time: '2 hours ago', trend: null },
                { icon: '📊', title: 'Daily sales report', time: '5 hours ago', trend: 3 },
            ]
        };
        return activities[range] || activities.monthly;
    }
};

export const getDividends = async () => {
    try {
        const response = await api.get('/dashboard/dividends');
        return response.data;
    } catch (error) {
        return [
            { code: 'AD-001245', title: '50% OFF Floor Lamp Get it Now!', date: 'January 25, 2021', growth: 2 },
            { code: 'AD-001246', title: 'Special Bonus for Employees', date: 'February 10, 2021', growth: 5 },
            { code: 'AD-001247', title: 'Q1 Dividend Distribution', date: 'March 15, 2021', growth: 3 }
        ];
    }
};

export const getSalaryTrend = async (range) => {
    try {
        const response = await api.get(`/dashboard/salary-trend?range=${range}`);
        return response.data;
    } catch (error) {
        return {
            total: 867123,
            growth: 9,
            data: [30, 45, 50, 65, 70, 85, 90, 88, 92, 95, 98, 100]
        };
    }
};