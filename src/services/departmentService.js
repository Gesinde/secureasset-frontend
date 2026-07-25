import api from './api';

export const getDepartments = async (includeInactive = false) => {
  const response = await api.get(`/departments${includeInactive ? '?includeInactive=true' : ''}`);
  return response.data;
};

export const createDepartment = async (name) => {
  const response = await api.post('/departments', { name });
  return response.data;
};

export const updateDepartment = async (id, name) => {
  const response = await api.put(`/departments/${id}`, { name });
  return response.data;
};

export const setDepartmentActiveStatus = async (id, isActive) => {
  const response = await api.put(`/departments/${id}/status`, { isActive });
  return response.data;
};
