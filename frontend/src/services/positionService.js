// frontend/src/services/positionService.js
import api from '../utils/api';

export const getPositions = async () => {
    try {
        const response = await api.get('/positions');
        return response.data;
    } catch (error) {
        console.error('Error fetching positions:', error);
        throw error;
    }
};

export const getPositionById = async (id) => {
    try {
        const response = await api.get(`/positions/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching position:', error);
        throw error;
    }
};

export const addPosition = async (positionData) => {
    try {
        const response = await api.post('/positions', positionData);
        return response.data;
    } catch (error) {
        console.error('Error adding position:', error);
        throw error;
    }
};

export const updatePosition = async (id, positionData) => {
    try {
        const response = await api.put(`/positions/${id}`, positionData);
        return response.data;
    } catch (error) {
        console.error('Error updating position:', error);
        throw error;
    }
};

export const deletePosition = async (id) => {
    try {
        const response = await api.delete(`/positions/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting position:', error);
        throw error;
    }
};