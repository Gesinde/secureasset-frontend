import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicAsset } from '../services/scanService';

function PublicAsset() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const data = await getPublicAsset(id);
        setAsset(data);
      } catch {
        setError('Asset not found.');
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
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md">
          <div className="text-red-400 text-5xl mb-4">✕</div>
          <h1 className="text-xl font-bold text-white mb-2">Not Found</h1>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-blue-400 text-4xl mb-2">🏛️</div>
          <h1 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Verified University Property
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-4">{asset.name}</h2>

        <div className={`text-center px-3 py-1.5 rounded border text-sm mb-6 ${statusColor[asset.status]}`}>
          {asset.status.replace('_', ' ').toUpperCase()}
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <dt className="text-gray-400">Category</dt>
            <dd className="text-white">{asset.category}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-400">Department</dt>
            <dd className="text-white">{asset.department}</dd>
          </div>
        </dl>

        <p className="text-gray-500 text-xs text-center mt-6">
          This is property of Crawford University. If found off-campus, please contact
          campus security.
        </p>
      </div>
    </div>
  );
}

export default PublicAsset;
