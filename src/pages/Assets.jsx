import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAssets, deleteAsset } from '../services/assetService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { user } = useAuth();

  const canCreate = user?.role === 'system_admin';
  const canDelete = user?.role === 'system_admin';

  const fetchAssets = useCallback(async () => {
    try {
      const data = await getAssets();
      setAssets(data);
    } catch {
      setError('Failed to load assets.');
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssets();
  }, [fetchAssets]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await deleteAsset(id);
      fetchAssets();
    } catch {
      alert('Failed to delete asset.');
    }
  };

  const statusColor = {
    available: 'bg-green-500/20 text-green-400',
    in_use: 'bg-blue-500/20 text-blue-400',
    under_maintenance: 'bg-yellow-500/20 text-yellow-400',
    retired: 'bg-gray-500/20 text-gray-400',
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.assetTag && asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Assets</h1>
          {canCreate && (
            <Link
              to="/assets/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              + Add Asset
            </Link>
          )}
        </div>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, serial number, or asset tag..."
            className="flex-1 px-3 py-2 rounded bg-gray-800 text-white text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 text-white text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="under_maintenance">Under Maintenance</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-400">Loading assets...</p>
        ) : filteredAssets.length === 0 ? (
          <p className="text-gray-400">No assets found.</p>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300 text-sm">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset._id} className="border-t border-gray-700 text-gray-200 text-sm">
                    <td className="px-4 py-3">{asset.name}</td>
                    <td className="px-4 py-3">{asset.category}</td>
                    <td className="px-4 py-3">{asset.department}</td>
                    <td className="px-4 py-3">{asset.location}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${statusColor[asset.status]}`}>
                        {asset.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-3">
                      <Link
                        to={`/assets/${asset._id}`}
                        className="text-blue-400 hover:underline"
                      >
                        View
                      </Link>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(asset._id)}
                          className="text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Assets;
