import api from './api';

export const getAssets = async () => {
  const response = await api.get('/assets');
  return response.data;
};

export const getAssetById = async (id) => {
  const response = await api.get(`/assets/${id}`);
  return response.data;
};

export const createAsset = async (assetData) => {
  const response = await api.post('/assets', assetData);
  return response.data;
};

export const updateAsset = async (id, assetData) => {
  const response = await api.put(`/assets/${id}`, assetData);
  return response.data;
};

export const deleteAsset = async (id) => {
  const response = await api.delete(`/assets/${id}`);
  return response.data;
};
