// frontend/src/services/alertService.js
import api from '../utils/api';

export const getAnniversaryAlerts = async () => {
    try {
        const response = await api.get('/alerts/anniversary');
        return response.data;
    } catch (error) {
        console.error('Error fetching anniversary alerts:', error);
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