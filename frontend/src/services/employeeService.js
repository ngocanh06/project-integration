import axios from 'axios';

const API_URL = 'http://localhost:5000/api/employees';

export const getEmployees = async (search = '', deptId = '', posId = '', status = '') => {
    const response = await axios.get(`${API_URL}/?search=${search}&department_id=${deptId}&position_id=${posId}&status=${status}`);
    return response.data;
};

export const getEmployeeById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createEmployee = async (data) => {
    const response = await axios.post(`${API_URL}/`, data);
    return response.data;
};

export const updateEmployee = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteEmployee = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
