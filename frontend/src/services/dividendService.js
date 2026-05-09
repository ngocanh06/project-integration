// frontend/src/services/dividendService.js
import api from '../utils/api';

export const getDividends = async (year = null, employeeId = null) => {
    try {
        let url = '/dividends';
        const params = [];
        if (year) params.push(`year=${year}`);
        if (employeeId) params.push(`employee_id=${employeeId}`);
        if (params.length) url += `?${params.join('&')}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching dividends:', error);
        throw error;
    }
};

export const getDividendById = async (id) => {
    try {
        const response = await api.get(`/dividends/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching dividend:', error);
        throw error;
    }
};

export const addDividend = async (dividendData) => {
    try {
        const response = await api.post('/dividends', dividendData);
        return response.data;
    } catch (error) {
        console.error('Error adding dividend:', error);
        throw error;
    }
};

export const updateDividend = async (id, dividendData) => {
    try {
        const response = await api.put(`/dividends/${id}`, dividendData);
        return response.data;
    } catch (error) {
        console.error('Error updating dividend:', error);
        throw error;
    }
};

export const deleteDividend = async (id) => {
    try {
        const response = await api.delete(`/dividends/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting dividend:', error);
        throw error;
    }
};

export const getDividendSummary = async (year = null) => {
    try {
        let url = '/dividends/summary';
        if (year) url += `?year=${year}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching dividend summary:', error);
        throw error;
    }
};