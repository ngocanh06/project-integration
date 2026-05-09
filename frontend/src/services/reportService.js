// frontend/src/services/reportService.js
import api from '../utils/api';

// HR Reports
export const getEmployeeCount = async () => {
    try {
        const response = await api.get('/reports/hr/employee-count');
        return response.data;
    } catch (error) {
        console.error('Error fetching employee count:', error);
        throw error;
    }
};

export const getGenderDistribution = async () => {
    try {
        const response = await api.get('/reports/hr/gender-distribution');
        return response.data;
    } catch (error) {
        console.error('Error fetching gender distribution:', error);
        throw error;
    }
};

export const getDepartmentDistribution = async () => {
    try {
        const response = await api.get('/reports/hr/department-distribution');
        return response.data;
    } catch (error) {
        console.error('Error fetching department distribution:', error);
        throw error;
    }
};

// Payroll Reports
export const getTotalSalaryCost = async (year = null, month = null) => {
    try {
        let url = '/reports/payroll/total-cost';
        const params = [];
        if (year) params.push(`year=${year}`);
        if (month) params.push(`month=${month}`);
        if (params.length) url += `?${params.join('&')}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching total salary cost:', error);
        throw error;
    }
};

export const getSalaryByDepartment = async (year = null, month = null) => {
    try {
        let url = '/reports/payroll/by-department';
        const params = [];
        if (year) params.push(`year=${year}`);
        if (month) params.push(`month=${month}`);
        if (params.length) url += `?${params.join('&')}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching salary by department:', error);
        throw error;
    }
};

export const getSalaryTrend = async (year) => {
    try {
        const response = await api.get(`/reports/payroll/trend?year=${year}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching salary trend:', error);
        throw error;
    }
};

// Attendance Reports
export const getLeaveAbsenceRate = async (year = null, month = null) => {
    try {
        let url = '/reports/attendance/leave-rate';
        const params = [];
        if (year) params.push(`year=${year}`);
        if (month) params.push(`month=${month}`);
        if (params.length) url += `?${params.join('&')}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching leave/absence rate:', error);
        throw error;
    }
};

export const getMonthlyAttendanceSummary = async (year) => {
    try {
        const response = await api.get(`/reports/attendance/monthly-summary?year=${year}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching monthly attendance summary:', error);
        throw error;
    }
};

// Dividend Reports
export const getTotalDividends = async (year = null) => {
    try {
        let url = '/reports/dividends/total';
        if (year) url += `?year=${year}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching total dividends:', error);
        throw error;
    }
};

export const getDividendsPerEmployee = async (year = null) => {
    try {
        let url = '/reports/dividends/per-employee';
        if (year) url += `?year=${year}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching dividends per employee:', error);
        throw error;
    }
};

export const getAttendanceStats = async () => {
    try {
        const response = await api.get('/attendance/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching attendance stats:', error);
        return { total_leave: 0, total_absent: 0 };
    }
};