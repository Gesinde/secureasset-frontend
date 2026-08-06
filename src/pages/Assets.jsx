import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAssets, deleteAsset } from '../services/assetService';
import { useAuth } from '../context/AuthContext';
import { exportToCSV } from '../utils/csvExport';
import Navbar from '../components/Navbar';

function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const statusColor = {
    available: 'bg-green-500/20 text-green-600 dark:text-green-400',
    in_use: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    under_maintenance: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    retired: 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
  };

  const filteredAssets = assets
    .filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.assetTag && asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = !statusFilter || asset.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const aVal = (a[sortField] || '').toString().toLowerCase();
      const bVal = (b[sortField] || '').toString().toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assets</h1>
          <div className="flex gap-3">
            <button
              onClick={() => exportToCSV(filteredAssets, `assets-${new Date().toISOString().split('T')[0]}.csv`)}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded text-sm font-semibold"
            >
              Export CSV
            </button>
            {canCreate && (
              <Link
                to="/assets/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
              >
                + Add Asset
              </Link>
            )}
          </div>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, serial number, or asset tag..."
            className="flex-1 min-w-[200px] px-3 py-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="under_maintenance">Under Maintenance</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        {error && <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading assets...</p>
        ) : filteredAssets.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No assets found.</p>
        ) : (
          <>
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('name')}>
                      Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('category')}>
                      Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('department')}>
                      Department {sortField === 'department' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('location')}>
                      Location {sortField === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('status')}>
                      Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => (
                    <tr key={asset._id} className="border-t border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm">
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
                        <Link to={`/assets/${asset._id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          View
                        </Link>
                        {canDelete && (
                          <button onClick={() => handleDelete(asset._id)} className="text-red-600 dark:text-red-400 hover:underline">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {filteredAssets.map((asset) => (
                <div key={asset._id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-gray-900 dark:text-white font-semibold text-sm">{asset.name}</p>
                    <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${statusColor[asset.status]}`}>
                      {asset.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{asset.category}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{asset.department} · {asset.location}</p>
                  <div className="flex gap-4 mt-3">
                    <Link to={`/assets/${asset._id}`} className="text-blue-600 dark:text-blue-400 text-xs">
                      View
                    </Link>
                    {canDelete && (
                      <button onClick={() => handleDelete(asset._id)} className="text-red-600 dark:text-red-400 text-xs">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Assets;
