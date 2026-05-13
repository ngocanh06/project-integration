// frontend/src/services/alertService.js
import api from '../utils/api';

export const getAnniversaryAlerts = async () => {
    try {
        const response = await api.get('/alerts/anniversary');
        console.log('Anniversary alerts response:', response.data);
        // Backend trả về array trực tiếp hoặc { status, data }
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        return data;
    } catch (error) {
        console.error('Error fetching anniversary alerts:', error);
        console.error('Response:', error.response?.data);
        return [];
    }
};

export const getExcessiveLeaveAlerts = async (month = null, threshold = 20) => {
    try {
        let url = '/alerts/excessive-leave';
        const params = [];
        if (month) params.push(`month=${month}`);
        params.push(`threshold=${threshold}`);
        if (params.length) url += `?${params.join('&')}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching excessive leave alerts:', error);
        return [];
    }
};

export const getSalaryDiscrepancyAlerts = async (month = null, threshold = 15) => {
    try {
        let url = '/alerts/salary-discrepancy';
        const params = [];
        if (month) params.push(`month=${month}`);
        params.push(`threshold=${threshold}`);
        if (params.length) url += `?${params.join('&')}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching salary discrepancy alerts:', error);
        return [];
    }
};

export const getAllAlerts = async () => {
    try {
        const response = await api.get('/alerts/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching all alerts:', error);
        return [];
    }
};