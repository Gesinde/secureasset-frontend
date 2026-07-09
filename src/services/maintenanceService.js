import api from './api';

export const getMaintenanceRequests = async () => {
  const response = await api.get('/maintenance');
  return response.data;
};

export const createMaintenanceRequest = async (data) => {
  const response = await api.post('/maintenance', data);
  return response.data;
};

export const updateMaintenanceRequest = async (id, data) => {
  const response = await api.put(`/maintenance/${id}`, data);
  return response.data;
};
