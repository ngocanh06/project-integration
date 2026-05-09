// frontend/src/services/attendanceService.js
import api from '../utils/api';

export const getAttendance = async (month = null, employeeId = null) => {
    try {
        let url = '/attendance';
        const params = [];
        if (month) params.push(`month=${month}`);
        if (employeeId) params.push(`employee_id=${employeeId}`);
        if (params.length) url += `?${params.join('&')}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching attendance:', error);
        throw error;
    }
};

export const getAttendanceById = async (id) => {
    try {
        const response = await api.get(`/attendance/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching attendance:', error);
        throw error;
    }
};

export const addAttendance = async (attendanceData) => {
    try {
        const response = await api.post('/attendance', attendanceData);
        return response.data;
    } catch (error) {
        console.error('Error adding attendance:', error);
        throw error;
    }
};

export const updateAttendance = async (id, attendanceData) => {
    try {
        const response = await api.put(`/attendance/${id}`, attendanceData);
        return response.data;
    } catch (error) {
        console.error('Error updating attendance:', error);
        throw error;
    }
};

export const deleteAttendance = async (id) => {
    try {
        const response = await api.delete(`/attendance/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting attendance:', error);
        throw error;
    }
};

export const getAttendanceSummary = async (month) => {
    try {
        const response = await api.get(`/attendance/summary?month=${month}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching attendance summary:', error);
        throw error;
    }
};

export const getAttendanceAnalytics = async (year = null, month = null) => {
    try {
        let url = '/attendance/analytics';
        const params = [];
        if (year) params.push(`year=${year}`);
        if (month) params.push(`month=${month}`);
        if (params.length) url += `?${params.join('&')}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching attendance analytics:', error);
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