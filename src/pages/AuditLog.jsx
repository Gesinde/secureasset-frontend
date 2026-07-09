import { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/auditService';
import Navbar from '../components/Navbar';

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getAuditLogs();
        setLogs(data);
      } catch (err) {
        setError('Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const actionColor = (action) => {
    if (action.includes('CREATED') || action.includes('RAISED') || action.includes('REPORTED')) {
      return 'bg-green-500/20 text-green-400';
    }
    if (action.includes('UPDATED')) {
      return 'bg-blue-500/20 text-blue-400';
    }
    if (action.includes('DELETED')) {
      return 'bg-red-500/20 text-red-400';
    }
    return 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Audit Log</h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-400">No audit log entries found.</p>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300 text-sm">
                <tr>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Performed By</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-t border-gray-700 text-gray-200 text-sm">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${actionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.performedBy?.name} <span className="text-gray-500">({log.performedBy?.role})</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{log.details}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(log.timestamp).toLocaleString()}
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

export default AuditLog;
