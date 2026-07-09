import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAssetById } from '../services/assetService';
import { useAuth } from '../context/AuthContext';

function Verify() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const data = await getAssetById(id);
        setAsset(data);
      } catch (err) {
        setError('Asset not found or could not be verified.');
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const statusColor = {
    available: 'bg-green-500/20 text-green-400 border-green-500',
    in_use: 'bg-blue-500/20 text-blue-400 border-blue-500',
    under_maintenance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
    retired: 'bg-gray-500/20 text-gray-400 border-gray-500',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Verifying asset...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md">
          <div className="text-red-400 text-5xl mb-4">✕</div>
          <h1 className="text-xl font-bold text-white mb-2">Verification Failed</h1>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-green-400 text-5xl mb-2">✓</div>
          <h1 className="text-lg font-semibold text-gray-300">Verified Asset</h1>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-4">{asset.name}</h2>

        <div className={`text-center px-3 py-1.5 rounded border text-sm mb-6 ${statusColor[asset.status]}`}>
          {asset.status.replace('_', ' ').toUpperCase()}
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <dt className="text-gray-400">Serial Number</dt>
            <dd className="text-white">{asset.serialNumber}</dd>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <dt className="text-gray-400">Category</dt>
            <dd className="text-white">{asset.category}</dd>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <dt className="text-gray-400">Department</dt>
            <dd className="text-white">{asset.department}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Location</dt>
            <dd className="text-white">{asset.location}</dd>
          </div>
        </dl>

        {user && (
          <Link
            to={`/assets/${asset._id}`}
            className="block text-center mt-6 text-blue-400 hover:underline text-sm"
          >
            View full asset details →
          </Link>
        )}
      </div>
    </div>
  );
}

export default Verify;
