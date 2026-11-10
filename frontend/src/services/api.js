import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 20000 });
let adminToken = '';
export function setAdminToken(value) { adminToken = value; }
export function adminHeaders() { return { Authorization: `Bearer ${adminToken}` }; }

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && error.config?.headers?.Authorization) {
    setAdminToken('');
    window.dispatchEvent(new Event('admin-session-expired'));
  }
  return Promise.reject(error);
});
