import api from './api';

export const getUsers = async (filters = {}) => {
  const response = await api.get('/users', { params: filters });
  return response.data;
};
