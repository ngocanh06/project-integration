import axios from "axios";

const API_URL = "http://localhost:5000/api/payrolls";

export const getPayrolls = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};