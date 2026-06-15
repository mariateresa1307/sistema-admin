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
export const getUsers = (search?: string, params?: any) => api.get(`/user${search ? `?search=${search}` : ''}`, { params });
export const createUser = (data: any) => api.post('/user', data);
export const updateUser = (id: string, data: any) => api.put(`/user/${id}`, data);
export const deleteUser = (id: string) => api.delete(`/user/${id}`);
export const toggleStatus = (id: string, status: boolean) => api.patch(`/user/${id}/status`, { isActive: status });

export const getService = (params?: any) => api.get(`/services`, {params});
export const createService = (data: any) => api.post('/services', data);
export const updateService = (data: any, id: string, ) => api.put(`/services/${id}`, data);
export const deleteService = (id: string) => api.delete(`/services/${id}`);

export const saveTicket = (data: any) => api.post('/tickets', data);
export const getTickets= (params: any) => api.get('/tickets', { params })
export const getMiscellaneous = (params: any) => api.get('/miscellaneous', { params })  