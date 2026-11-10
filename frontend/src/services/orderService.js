import axios from 'axios';
import { adminHeaders } from './api';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders`;

export const createOrder = async (orderData) => {
  const response = await axios.post(API_URL, orderData);
  return response.data;
};

export const getAllOrders = async () => {
  const response = await axios.get(API_URL, { headers: adminHeaders() });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, { headers: adminHeaders() });
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/${id}/status`, { status }, { headers: adminHeaders() });
  return response.data;
};

