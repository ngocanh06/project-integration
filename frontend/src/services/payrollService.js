// frontend/src/services/payrollService.js
import api from '../utils/api';

export const getPayroll = async (month = null, employeeId = null, departmentId = null) => {
    try {
        let url = '/payroll';
        const params = [];
        if (month) params.push(`month=${month}`);
        if (employeeId) params.push(`employee_id=${employeeId}`);
        if (departmentId) params.push(`department_id=${departmentId}`);
        if (params.length) url += `?${params.join('&')}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching payroll:', error);
        throw error;
    }
};

export const getSalaryHistory = async (employeeId) => {
    try {
        const response = await api.get(`/payroll/history/${employeeId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching salary history:', error);
        throw error;
    }
};

export const getSalaryById = async (id) => {
    try {
        const response = await api.get(`/payroll/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching salary:', error);
        throw error;
    }
};

export const getPayrollSummary = async (month = null, year = null) => {
    try {
        let url = '/payroll/summary';
        const params = [];
        if (month) params.push(`month=${month}`);
        if (year) params.push(`year=${year}`);
        if (params.length) url += `?${params.join('&')}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching payroll summary:', error);
        throw error;
    }
};

export const addSalary = async (salaryData) => {
    try {
        const response = await api.post('/payroll', salaryData);
        return response.data;
    } catch (error) {
        console.error('Error adding salary:', error);
        throw error;
    }
};

export const updateSalary = async (id, salaryData) => {
    try {
        const response = await api.put(`/payroll/${id}`, salaryData);
        return response.data;
    } catch (error) {
        console.error('Error updating salary:', error);
        throw error;
    }
};

export const deleteSalary = async (id) => {
    try {
        const response = await api.delete(`/payroll/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting salary:', error);
        throw error;
    }
};