import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', 
  withCredentials: true,
});



api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});




export default api;
export const getUsers = (search?: string) => api.get(`/user${search ? `?search=${search}` : ''}`);
export const createUser = (data: any) => api.post('/user', data);
export const updateUser = (id: string, data: any) => api.put(`/user/${id}`, data);
export const deleteUser = (id: string) => api.delete(`/user/${id}`);
export const toggleStatus = (id: string, status: boolean) => api.patch(`/user/${id}/status`, { isActive: status });

export const getService = (search?: string) => api.get(`/service${search ? `?search=${search}` : ''}`);
export const createService = (data: any) => api.post('/service', data);
export const updateService = (id: string, data: any) => api.put(`/service/${id}`, data);
export const deleteService = (id: string) => api.delete(`/service/${id}`);