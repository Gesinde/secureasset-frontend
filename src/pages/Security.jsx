import { useState, useEffect } from 'react';
import { getIncidents, createIncident, updateIncident } from '../services/securityService';
import { getAssets } from '../services/assetService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Security() {
  const [incidents, setIncidents] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ assetId: '', description: '', location: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();

  const canReport = ['system_admin', 'security_officer'].includes(user?.role);
  const canUpdate = ['system_admin', 'security_officer'].includes(user?.role);

  const statusColor = {
    open: 'bg-red-500/20 text-red-400',
    investigating: 'bg-yellow-500/20 text-yellow-400',
    resolved: 'bg-green-500/20 text-green-400',
  };

  const fetchData = async () => {
    try {
      const incidentData = await getIncidents();
      setIncidents(incidentData);
      if (canReport) {
        const assetData = await getAssets();
        setAssets(assetData);
      }
    } catch (err) {
      setError('Failed to load security incidents.');
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
      await createIncident(formData);
      setFormData({ assetId: '', description: '', location: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert('Failed to report incident.');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateIncident(id, { status });
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
          <h1 className="text-2xl font-bold text-white">Security Incidents</h1>
          {canReport && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              {showForm ? 'Cancel' : '+ Report Incident'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-6 space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Related Asset (optional)</label>
              <select
                value={formData.assetId}
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="">No specific asset</option>
                {assets.map((asset) => (
                  <option key={asset._id} value={asset._id}>
                    {asset.name} ({asset.serialNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="e.g. CS Lab 1"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Describe the incident..."
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              Submit Report
            </button>
          </form>
        )}

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : incidents.length === 0 ? (
          <p className="text-gray-400">No security incidents reported.</p>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <div key={incident._id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    {incident.asset && (
                      <p className="text-white font-semibold">
                        {incident.asset.name} · {incident.asset.serialNumber}
                      </p>
                    )}
                    <p className="text-gray-400 text-sm">{incident.location}</p>
                    <p className="text-gray-300 text-sm mt-2">{incident.description}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Reported by {incident.reportedBy?.name} ({incident.reportedBy?.role})
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${statusColor[incident.status]}`}>
                    {incident.status}
                  </span>
                </div>

                {canUpdate && incident.status !== 'resolved' && (
                  <div className="mt-3 flex gap-2">
                    {incident.status === 'open' && (
                      <button
                        onClick={() => handleStatusChange(incident._id, 'investigating')}
                        className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                      >
                        Mark Investigating
                      </button>
                    )}
                    {incident.status === 'investigating' && (
                      <button
                        onClick={() => handleStatusChange(incident._id, 'resolved')}
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

export default Security;
