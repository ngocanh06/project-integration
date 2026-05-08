import axios from 'axios';

const API_URL = 'http://localhost:5000/api/dividends';

export const getDividends = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getDividendById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createDividend = async (data) => {
    const response = await axios.post(`${API_URL}/`, data);
    return response.data;
};

export const updateDividend = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteDividend = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
