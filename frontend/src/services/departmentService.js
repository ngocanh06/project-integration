// frontend/src/services/departmentService.js
import api from '../utils/api';

export const getDepartments = async () => {
    try {
        const response = await api.get('/departments');
        return response.data;
    } catch (error) {
        console.error('Error fetching departments:', error);
        throw error;
    }
};

export const getDepartmentById = async (id) => {
    try {
        const response = await api.get(`/departments/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching department:', error);
        throw error;
    }
};

export const addDepartment = async (departmentData) => {
    try {
        const response = await api.post('/departments', departmentData);
        return response.data;
    } catch (error) {
        console.error('Error adding department:', error);
        throw error;
    }
};

export const updateDepartment = async (id, departmentData) => {
    try {
        const response = await api.put(`/departments/${id}`, departmentData);
        return response.data;
    } catch (error) {
        console.error('Error updating department:', error);
        throw error;
    }
};

export const deleteDepartment = async (id) => {
    try {
        const response = await api.delete(`/departments/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting department:', error);
        throw error;
    }
};