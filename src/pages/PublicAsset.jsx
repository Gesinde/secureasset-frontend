import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicAsset } from '../services/scanService';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PublicAsset() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const data = await getPublicAsset(id);
        setAsset(data);
      } catch (err) {
        if (err.response?.status === 410) {
          setError(err.response.data.message);
        } else {
          setError('Asset not found.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const statusColor = {
    available: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500',
    in_use: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500',
    under_maintenance: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500',
    retired: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center max-w-md">
          <div className="text-red-500 dark:text-red-400 text-5xl mb-4">✕</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-blue-600 dark:text-blue-400 text-4xl mb-2">🏛️</div>
          <h1 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Verified University Property
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
          {asset.name}
        </h2>

        <div className={`text-center px-3 py-1.5 rounded border text-sm mb-6 ${statusColor[asset.status]}`}>
          {asset.status.replace('_', ' ').toUpperCase()}
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
            <dt className="text-gray-500 dark:text-gray-400">Category</dt>
            <dd className="text-gray-900 dark:text-white">{asset.category}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Department</dt>
            <dd className="text-gray-900 dark:text-white">{asset.department}</dd>
          </div>
        </dl>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-yellow-600 dark:text-yellow-400 text-xs font-semibold mb-1">
            ⚠️ If You Found This Item
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            This item is the property of Crawford University. If it was found outside the university
            premises, please return it to the nearest Crawford University security post, or hand it in
            to the nearest police station. Do not attempt to keep or resell this item — it is tagged
            and traceable to its registered department.
          </p>
        </div>

        {user && (
          <Link
            to={`/verify/${id}`}
            className="block text-center mt-4 text-blue-600 dark:text-blue-400 hover:underline text-xs"
          >
            Staff: View full verification details →
          </Link>
        )}
      </div>
    </div>
  );
}

export default PublicAsset;
