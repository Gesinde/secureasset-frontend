import api from './api';

export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/users${params ? `?${params}` : ''}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post('/users', data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const setUserActiveStatus = async (id, isActive) => {
  const response = await api.put(`/users/${id}/status`, { isActive });
  return response.data;
};
