import api from './api';

export const getPublicAsset = async (id) => {
  const response = await api.get(`/public/asset/${id}`);
  return response.data;
};

export const logScan = async (data) => {
  const response = await api.post('/scan-log', data);
  return response.data;
};

export const recordScanAction = async (data) => {
  const response = await api.post('/scan-action', data);
  return response.data;
};

export const getScanLogsForAsset = async (assetId) => {
  const response = await api.get(`/scan-log/${assetId}`);
  return response.data;
};
