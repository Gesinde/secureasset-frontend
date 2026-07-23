import api from './api';

export const getScanMapPoints = async () => {
  const response = await api.get('/map/scan-points');
  return response.data;
};
