// frontend/src/services/employeeService.js
import api from '../utils/api';

export const getEmployees = async () => {
    try {
        const response = await api.get('/employees');
        return response.data;
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
};

export const getEmployeeById = async (id) => {
    try {
        const response = await api.get(`/employees/${id}`);
        console.log('API response:', response);  // Debug
        console.log('Data:', response.data);     // Debug
        return response.data;
    } catch (error) {
        console.error('Error in getEmployeeById:', error);
        console.error('Error response:', error.response);
        throw error;
    }
};

export const addEmployee = async (employeeData) => {
    try {
        const response = await api.post('/employees', employeeData);
        return response.data;
    } catch (error) {
        console.error('Error adding employee:', error);
        throw error;
    }
};

export const updateEmployee = async (id, employeeData) => {
    try {
        const response = await api.put(`/employees/${id}`, employeeData);
        return response.data;
    } catch (error) {
        console.error('Error updating employee:', error);
        throw error;
    }
};

export const deleteEmployee = async (id) => {
    try {
        const response = await api.delete(`/employees/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting employee:', error);
        throw error;
    }
};