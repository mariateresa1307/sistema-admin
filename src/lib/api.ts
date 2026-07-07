import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', 
  withCredentials: true,
});

function format(message: Array<string>|string) {
  if(Array.isArray(message) ) {
    return message.map(m => `${m}. \n`);
  }
  return message;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use((response) => response, // Pass successful responses through
  (error) => {
    // Customize the alert message based on the error
    let message = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // other than 2xx
      if (error.response.status === 401) {
        message = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      } else if (error.response.status === 404) {
        message = 'El recurso solicitado no fue encontrado.';
      } else if (error.response.data && error.response.data.message) {
        message = error.response.data.message; // Use API provided error
      }
    } else if (error.request) {
      // The request was made but no response was received (Network/CORS error)
      message = 'Error de red. Revisa tu conexión a internet.';
    }

    // Trigger a global notification handled by the app's NotificationProvider
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: format(message), severity: 'error' } }));
    }

    // Reject the promise so the specific API call knows it failed
    return Promise.reject(error);
  })




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
export const getTickets = (params: any) => api.get('/tickets', { params })
export const getTicketsStats = () => api.get('/tickets/stats')

export const getMiscellaneous = (params: any) => api.get('/miscellaneous', { params });
export const createMiscellaneous = (data: any) => api.post('/miscellaneous', data);
export const updateMiscellaneous = (id: string, data: any) => api.put(`/miscellaneous/${id}`, data);
export const deleteMiscellaneous = (id: string) => api.delete(`/miscellaneous/${id}`);export const getMiscellaneousWithParent = (id: string) => api.get(`/miscellaneous/${id}/with-parent`);