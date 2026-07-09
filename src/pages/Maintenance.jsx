import { useState, useEffect } from 'react';
import { getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest } from '../services/maintenanceService';
import { getAssets } from '../services/assetService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ assetId: '', description: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();

  const canRaise = ['system_admin', 'department_head', 'department_staff', 'maintenance_officer'].includes(user?.role);
  const canUpdate = ['system_admin', 'maintenance_officer', 'maintenance_technician'].includes(user?.role);

  const statusColor = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    resolved: 'bg-green-500/20 text-green-400',
  };

  const fetchData = async () => {
    try {
      const reqData = await getMaintenanceRequests();
      setRequests(reqData);
      if (canRaise) {
        const assetData = await getAssets();
        setAssets(assetData);
      }
    } catch (err) {
      setError('Failed to load maintenance requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaintenanceRequest(formData);
      setFormData({ assetId: '', description: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert('Failed to raise request.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateMaintenanceRequest(id, { status });
      fetchData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Maintenance Requests</h1>
          {canRaise && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              {showForm ? 'Cancel' : '+ Raise Request'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-6 space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Asset</label>
              <select
                value={formData.assetId}
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                required
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select asset</option>
                {assets.map((asset) => (
                  <option key={asset._id} value={asset._id}>
                    {asset.name} ({asset.serialNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Describe the issue..."
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              Submit Request
            </button>
          </form>
        )}

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-400">No maintenance requests found.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req._id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-semibold">{req.asset?.name}</p>
                    <p className="text-gray-400 text-sm">{req.asset?.serialNumber} · {req.asset?.department}</p>
                    <p className="text-gray-300 text-sm mt-2">{req.description}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Raised by {req.raisedBy?.name} ({req.raisedBy?.role})
                      {req.assignedTechnician && ` · Assigned to ${req.assignedTechnician.name}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${statusColor[req.status]}`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>

                {canUpdate && req.status !== 'resolved' && (
                  <div className="mt-3 flex gap-2">
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(req._id, 'in_progress')}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {req.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(req._id, 'resolved')}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Maintenance;
