import api from './api';

export const getIncidents = async () => {
  const response = await api.get('/security');
  return response.data;
};

export const createIncident = async (data) => {
  const response = await api.post('/security', data);
  return response.data;
};

export const updateIncident = async (id, data) => {
  const response = await api.put(`/security/${id}`, data);
  return response.data;
};
