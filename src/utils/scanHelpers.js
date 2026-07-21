// Extracts the asset ID from a scanned QR value.
// Your QR codes encode a full URL like https://secureasset.vercel.app/verify/<id>
// or http://localhost:5173/verify/<id> — this grabs whatever comes after the last "/"
export const extractAssetIdFromScan = (scannedText) => {
  try {
    const parts = scannedText.trim().split('/');
    return parts[parts.length - 1];
  } catch {
    return null;
  }
};

const CACHE_KEY = 'secureasset_recent_scans';
const MAX_CACHE_SIZE = 20;

// Reads the full offline cache (array of recently scanned assets)
export const getOfflineCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Adds/updates one asset in the cache, keeping only the most recent MAX_CACHE_SIZE entries
export const saveToOfflineCache = (asset) => {
  const cache = getOfflineCache();
  const filtered = cache.filter((item) => item._id !== asset._id);
  const updated = [{ ...asset, cachedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_CACHE_SIZE);
  localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
};

// Looks up one asset from the cache by ID (used when offline)
export const getFromOfflineCache = (assetId) => {
  const cache = getOfflineCache();
  return cache.find((item) => item._id === assetId) || null;
};

