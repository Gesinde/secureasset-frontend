import { useState, useEffect } from 'react';
import { getTransfers, createTransfer, respondToTransfer } from '../services/transferService';
import { getAssets } from '../services/assetService';
import { getUsers } from '../services/userService';
import { DEPARTMENTS } from '../utils/departments';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const STAGE_LABELS = {
  pending_sender_hod: 'Awaiting sender HOD approval',
  pending_recipient: 'Awaiting recipient acceptance',
  pending_recipient_hod: 'Awaiting recipient HOD approval',
  completed: 'Completed',
  rejected: 'Rejected',
};

const STAGE_COLOR = {
  pending_sender_hod: 'bg-yellow-500/20 text-yellow-400',
  pending_recipient: 'bg-yellow-500/20 text-yellow-400',
  pending_recipient_hod: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ assetId: '', toDepartment: '', recipientId: '', reason: '' });
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const { user } = useAuth();

  const canRequest = ['system_admin', 'department_head', 'department_staff'].includes(user?.role);

  const fetchData = async () => {
    try {
      const [transferData, assetData] = await Promise.all([getTransfers(), getAssets()]);
      setTransfers(transferData);
      setAssets(assetData);
    } catch (err) {
      setError('Failed to load transfers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When destination department changes, load that department's users as possible recipients
  useEffect(() => {
    if (!formData.toDepartment) {
      setRecipients([]);
      return;
    }
    getUsers({ department: formData.toDepartment }).then(setRecipients).catch(() => setRecipients([]));
  }, [formData.toDepartment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTransfer(formData);
      setFormData({ assetId: '', toDepartment: '', recipientId: '', reason: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create transfer.');
    }
  };

  const handleApprove = async (id) => {
    try {
      await respondToTransfer(id, 'approve');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve.');
    }
  };

  const handleReject = async (id) => {
    try {
      await respondToTransfer(id, 'reject', rejectReason);
      setRejectingId(null);
      setRejectReason('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject.');
    }
  };

  // Can THIS user act on THIS transfer, given its current stage? (mirrors backend STAGE_CONFIG)
  const canActOn = (transfer) => {
    if (transfer.status === 'completed' || transfer.status === 'rejected') return false;
    if (user.role === 'system_admin') return true;
    if (transfer.status === 'pending_sender_hod') {
      return user.role === 'department_head' && user.department === transfer.fromDepartment;
    }
    if (transfer.status === 'pending_recipient') {
      return user.id === transfer.recipient?._id;
    }
    if (transfer.status === 'pending_recipient_hod') {
      return user.role === 'department_head' && user.department === transfer.toDepartment;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Asset Transfers</h1>
          {canRequest && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              {showForm ? 'Cancel' : '+ Request Transfer'}
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
                {assets.map((a) => (
                  <option key={a._id} value={a._id}>{a.name} ({a.serialNumber}) — {a.department}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Destination Department</label>
              <select
                value={formData.toDepartment}
                onChange={(e) => setFormData({ ...formData, toDepartment: e.target.value, recipientId: '' })}
                required
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Recipient</label>
              <select
                value={formData.recipientId}
                onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                required
                disabled={!formData.toDepartment}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">Select recipient</option>
                {recipients.map((r) => (
                  <option key={r._id} value={r._id}>{r.name} ({r.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
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
        ) : transfers.length === 0 ? (
          <p className="text-gray-400">No transfers found.</p>
        ) : (
          <div className="space-y-3">
            {transfers.map((t) => (
              <div key={t._id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-semibold">{t.asset?.name} ({t.asset?.serialNumber})</p>
                    <p className="text-gray-400 text-sm">{t.fromDepartment} → {t.toDepartment}</p>
                    <p className="text-gray-300 text-sm mt-1">{t.reason}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Requested by {t.requestedBy?.name} · Recipient: {t.recipient?.name}
                    </p>
                    {t.status === 'rejected' && (
                      <p className="text-red-400 text-xs mt-1">Reason: {t.rejectionReason}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${STAGE_COLOR[t.status]}`}>
                    {STAGE_LABELS[t.status]}
                  </span>
                </div>

                {canActOn(t) && (
                  <div className="mt-3">
                    {rejectingId === t._id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection"
                          className="flex-1 px-3 py-1.5 rounded bg-gray-700 text-white text-xs border border-gray-600"
                        />
                        <button
                          onClick={() => handleReject(t._id)}
                          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => setRejectingId(null)}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(t._id)}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(t._id)}
                          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
                        >
                          Reject
                        </button>
                      </div>
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

export default Transfers;

