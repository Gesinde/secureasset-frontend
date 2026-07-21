import api from './api';

export const getTransfers = async () => {
  const response = await api.get('/transfers');
  return response.data;
};

export const createTransfer = async (data) => {
  const response = await api.post('/transfers', data);
  return response.data;
};

export const respondToTransfer = async (id, decision, reason) => {
  const response = await api.put(`/transfers/${id}/respond`, { decision, reason });
  return response.data;
};
