import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', 
  withCredentials: true,
});

function format(message: Array<string>|string) {
  if(Array.isArray(message)) {
    return message.map(m => `${m}. \n`);
  }
  return message;
}


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  console.log('🔑 [API] Token enviado:', token ? '✅ SÍ' : '❌ NO');
  console.log('📍 [API] URL:', config.url);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
    
    if (error.response) {
      if (error.response.status === 401) {
        message = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        
        // Limpiar datos de sesión
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        
        // Redirigir al login (si no estás ya ahí)
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/';
        }
      } else if (error.response.status === 403) {
        message = 'No tienes permisos para realizar esta acción.';
      } else if (error.response.status === 404) {
        message = 'El recurso solicitado no fue encontrado.';
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      }
    } else if (error.request) {
      message = 'Error de red. Revisa tu conexión a internet.';
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-notification', { 
        detail: { message: format(message), severity: 'error' } 
      }));
    }

    return Promise.reject(error);
  }
);

export default api;
// ✅ AGREGAR: Función para obtener miscellaneous por ID
export const getMiscellaneousById = (id: string) => api.get(`/miscellaneous/${id}`);

// ENDPOINTS DE USUARIOS
export const getUsers = (search?: string, params?: any) => 
  api.get(`/user${search ? `?search=${search}` : ''}`, { params });
export const createUser = (data: any) => api.post('/user', data);
export const updateUser = (id: string, data: any) => api.put(`/user/${id}`, data);
export const deleteUser = (id: string) => api.delete(`/user/${id}`);
export const toggleStatus = (id: string, status: boolean) => 
  api.patch(`/user/${id}/status`, { isActive: status });

// ENDPOINTS DE SERVICIOS
export const getService = (params?: any) => api.get(`/services`, { params });
export const createService = (data: any) => api.post('/services', data);
export const updateService = (data: any, id: string) => api.put(`/services/${id}`, data);
export const deleteService = (id: string) => api.delete(`/services/${id}`);

// ENDPOINTS DE TICKETS
export const saveTicket = (data: any) => api.post('/tickets', data);
export const updateTicket = (id: string, data: any) => api.put(`/tickets/${id}`, data);
export const getTickets = (params: any) => api.get('/tickets', { params });
export const getTicketsStats = () => api.get('/tickets/stats');

// ENDPOINTS DE MISCELLANEOUS
export const getMiscellaneous = (params: any) => api.get('/miscellaneous', { params });
export const createMiscellaneous = (data: any) => api.post('/miscellaneous', data);
export const updateMiscellaneous = (id: string, data: any) => api.put(`/miscellaneous/${id}`, data);
export const deleteMiscellaneous = (id: string) => api.delete(`/miscellaneous/${id}`);
export const getMiscellaneousWithParent = (id: string) => api.get(`/miscellaneous/${id}/with-parent`);

// ENDPOINTS DE AUDITORÍA
export const getAuditLogs = (params?: any) => api.get('/audit', { params });
export const getAuditStats = (params?: any) => api.get('/audit/stats', { params });
export const createAuditLog = (data: any) => api.post('/audit/log', data);