import axios from 'axios';

const API_URL = 'http://localhost:5000/api/positions';

export const getPositions = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getPositionById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createPosition = async (data) => {
    const response = await axios.post(`${API_URL}/`, data);
    return response.data;
};

export const updatePosition = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deletePosition = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const getPositionStats = async () => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
};
