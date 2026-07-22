import { useState, useEffect, useCallback } from 'react';
import { getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest } from '../services/maintenanceService';
import { getAssets } from '../services/assetService';
import { getUsers } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const COLUMNS = [
  { key: 'pending', label: 'Pending' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
];

const PRIORITY_COLOR = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
};

function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ assetId: '', description: '', priority: 'medium' });
  const [assigningId, setAssigningId] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const canRaise = ['system_admin', 'department_head', 'department_staff', 'maintenance_officer'].includes(user?.role);
  const canManage = ['system_admin', 'maintenance_officer', 'maintenance_technician'].includes(user?.role);
  const canAssign = ['system_admin', 'maintenance_officer'].includes(user?.role);

  const fetchData = useCallback(async () => {
    try {
      const reqData = await getMaintenanceRequests();
      setRequests(reqData);
      if (canRaise) {
        const assetData = await getAssets();
        setAssets(assetData);
      }
      if (canAssign) {
        const techData = await getUsers({ role: 'maintenance_technician' });
        setTechnicians(techData);
      }
    } catch {
      setError('Failed to load maintenance requests.');
    } finally {
      setLoading(false);
    }
  }, [canRaise, canAssign]);

   
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaintenanceRequest(formData);
      setFormData({ assetId: '', description: '', priority: 'medium' });
      setShowForm(false);
      fetchData();
    } catch {
      alert('Failed to raise request.');
    }
  };

  const handleAssign = async (id, technicianId) => {
    try {
      await updateMaintenanceRequest(id, { assignedTechnician: technicianId });
      setAssigningId(null);
      fetchData();
    } catch {
      alert('Failed to assign technician.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateMaintenanceRequest(id, { status });
      fetchData();
    } catch {
      alert('Failed to update status.');
    }
  };

  const requestsByColumn = (columnKey) => requests.filter((r) => r.status === columnKey);

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
                  <option key={asset._id} value={asset._id}>{asset.name} ({asset.serialNumber})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
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
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold">
              Submit Request
            </button>
          </form>
        )}

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <div key={col.key} className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-gray-300 text-sm font-semibold mb-3 flex justify-between">
                  {col.label}
                  <span className="text-gray-500">{requestsByColumn(col.key).length}</span>
                </h3>
                <div className="space-y-2">
                  {requestsByColumn(col.key).map((req) => (
                    <div key={req._id} className="bg-gray-800 rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-white font-medium">{req.asset?.name}</p>
                        <span className={`px-2 py-0.5 rounded text-xs ${PRIORITY_COLOR[req.priority]}`}>
                          {req.priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-2">{req.description}</p>
                      {req.assignedTechnician && (
                        <p className="text-gray-500 text-xs mb-2">→ {req.assignedTechnician.name}</p>
                      )}

                      {canAssign && req.status === 'pending' && (
                        <div>
                          {assigningId === req._id ? (
                            <select
                              onChange={(e) => handleAssign(req._id, e.target.value)}
                              className="w-full text-xs bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
                              defaultValue=""
                            >
                              <option value="" disabled>Choose technician</option>
                              {technicians.map((t) => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                              ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => setAssigningId(req._id)}
                              className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded w-full"
                            >
                              Assign Technician
                            </button>
                          )}
                        </div>
                      )}

                      {canManage && req.status === 'assigned' && (
                        <button
                          onClick={() => handleStatusChange(req._id, 'in_progress')}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded w-full"
                        >
                          Start Work
                        </button>
                      )}
                      {canManage && req.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusChange(req._id, 'resolved')}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded w-full"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  ))}
                  {requestsByColumn(col.key).length === 0 && (
                    <p className="text-gray-600 text-xs italic">No requests</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Maintenance;
