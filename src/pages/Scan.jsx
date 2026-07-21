import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QrScanner from '../components/QrScanner';
import { useAuth } from '../context/AuthContext';
import { getAssetById } from '../services/assetService';
import { logScan, recordScanAction } from '../services/scanService';
import { extractAssetIdFromScan, saveToOfflineCache, getFromOfflineCache } from '../utils/scanHelpers';

const ACTIONS_BY_ROLE = {
  auditor: ['verified', 'missing', 'misplaced', 'damaged'],
  security_officer: ['movement_flagged'],
  department_staff: ['fault_reported'],
  department_head: ['fault_reported'],
  maintenance_officer: ['fault_reported'],
  maintenance_technician: ['fault_reported'],
  system_admin: ['verified', 'missing', 'misplaced', 'damaged', 'movement_flagged', 'fault_reported'],
};

const ACTION_LABELS = {
  verified: 'Mark Verified',
  missing: 'Report Missing',
  misplaced: 'Report Misplaced',
  damaged: 'Report Damaged',
  movement_flagged: 'Flag Movement',
  fault_reported: 'Report Fault',
};

function Scan() {
  const [scanning, setScanning] = useState(true);
  const [asset, setAsset] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [cachedAt, setCachedAt] = useState(null);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [manualId, setManualId] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const captureGps = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: null, lng: null });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: null, lng: null }), // permission denied or failed — proceed without GPS
        { timeout: 5000 }
      );
    });
  };

  const handleAssetId = async (assetId) => {
    setScanning(false);
    setError('');
    setActionMessage('');
    setIsCached(false);

    if (!navigator.onLine) {
      const cached = getFromOfflineCache(assetId);
      if (cached) {
        setAsset(cached);
        setIsCached(true);
        setCachedAt(cached.cachedAt);
      } else {
        setError("You're offline and this asset hasn't been scanned on this device before.");
      }
      return;
    }

    try {
      const data = await getAssetById(assetId);
      setAsset(data);
      saveToOfflineCache(data);

      const { lat, lng } = await captureGps();
      await logScan({ assetId, gpsLat: lat, gpsLng: lng, action: 'view_only' });
    } catch {
      setError('Asset not found or could not be loaded.');
    }
  };

  const handleScanSuccess = (decodedText) => {
    const assetId = extractAssetIdFromScan(decodedText);
    if (assetId) handleAssetId(assetId);
  };

  const handleManualLookup = (e) => {
    e.preventDefault();
    if (manualId.trim()) handleAssetId(manualId.trim());
  };

  const handleAction = async (action) => {
    try {
      await recordScanAction({ assetId: asset._id, action });
      setActionMessage(`Recorded: ${ACTION_LABELS[action]}`);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to record action.');
    }
  };

  const scanAnother = () => {
    setAsset(null);
    setError('');
    setActionMessage('');
    setScanning(true);
  };

  const allowedActions = ACTIONS_BY_ROLE[user?.role] || [];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Scan Asset</h1>

        {scanning && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <QrScanner onScanSuccess={handleScanSuccess} onScanError={setError} />
            <p className="text-gray-400 text-xs text-center mt-3">
              Point your camera at an asset's QR code
            </p>

            <form onSubmit={handleManualLookup} className="mt-4 flex gap-2">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Or enter asset ID manually"
                className="flex-1 px-3 py-2 rounded bg-gray-700 text-white text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
              >
                Look Up
              </button>
            </form>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded mt-4">
            {error}
          </div>
        )}

        {asset && (
          <div className="bg-gray-800 p-6 rounded-lg mt-4">
            {isCached && (
              <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-400 text-xs p-2 rounded mb-4">
                Offline — showing cached data from {new Date(cachedAt).toLocaleString()}
              </div>
            )}

            <h2 className="text-xl font-bold text-white mb-3">{asset.name}</h2>
            <dl className="space-y-1 text-sm mb-4">
              <div className="flex justify-between border-b border-gray-700 pb-1">
                <dt className="text-gray-400">Serial Number</dt>
                <dd className="text-white">{asset.serialNumber}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-1">
                <dt className="text-gray-400">Department</dt>
                <dd className="text-white">{asset.department}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Status</dt>
                <dd className="text-white">{asset.status?.replace('_', ' ')}</dd>
              </div>
            </dl>

            {allowedActions.length > 0 && !isCached && (
              <div className="flex flex-wrap gap-2 mb-4">
                {allowedActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleAction(action)}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded"
                  >
                    {ACTION_LABELS[action]}
                  </button>
                ))}
              </div>
            )}

            {actionMessage && (
              <p className="text-green-400 text-sm mb-4">{actionMessage}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={scanAnother}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
              >
                Scan Another
              </button>
              <button
                onClick={() => navigate(`/assets/${asset._id}`)}
                className="text-blue-400 hover:underline text-sm"
              >
                View Full Details →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Scan;
