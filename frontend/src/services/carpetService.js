import { api, adminHeaders } from './api';
const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
export const getImageUrl = url => !url ? '' : url.startsWith('/uploads/') ? `${base}${url}` : url;
export const getAllCarpets = async () => (await api.get('/carpets')).data;
export const getCarpetById = async id => (await api.get(`/carpets/${id}`)).data;
function payload(form) {
  const data = new FormData();
  for (const field of ['title', 'price', 'description', 'category', 'country', 'material', 'dimensions']) data.append(field, form[field] ?? '');
  for (const file of form.images || []) data.append('images', file);
  return data;
}
export const createCarpet = async form => (await api.post('/carpets', payload(form), { headers: adminHeaders() })).data;
export const updateCarpet = async (id, form) => (await api.put(`/carpets/${id}`, payload(form), { headers: adminHeaders() })).data;
export const deleteCarpet = async id => (await api.delete(`/carpets/${id}`, { headers: adminHeaders() })).data;
