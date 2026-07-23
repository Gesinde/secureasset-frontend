import api from './api';

export const openSession = async (department) => {
  const response = await api.post('/audit-sessions', department ? { department } : {});
  return response.data;
};

export const getMyOpenSession = async () => {
  const response = await api.get('/audit-sessions/mine');
  return response.data;
};

export const getSessions = async () => {
  const response = await api.get('/audit-sessions');
  return response.data;
};

export const closeSession = async (id) => {
  const response = await api.put(`/audit-sessions/${id}/close`);
  return response.data;
};
