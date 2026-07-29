import { useState, useEffect } from 'react';
import { getPermissions } from '../services/permissionService';
import Navbar from '../components/Navbar';

function PermissionsView() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPermissions()
      .then(setPermissions)
      .catch(() => setError('Failed to load permissions.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Role Permissions</h1>
        <p className="text-gray-500 text-sm mb-6">
          Read-only view of which roles can perform which actions. To change these, edit the
          allowedRoles for a permission directly in the database.
        </p>

        {error && <p className="text-red-400 mb-4">{error}</p>}
       {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : permissions.length === 0 ? (
          <p className="text-gray-400">No permissions configured.</p>
        ) : (
          <div className="hidden md:block bg-gray-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300 text-sm">
                <tr>
                  <th className="px-4 py-3">Permission</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Allowed Roles</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((p) => (
                  <tr key={p._id} className="border-t border-gray-700 text-gray-200 text-sm">
                    <td className="px-4 py-3 font-mono text-xs">{p.key}</td>
                    <td className="px-4 py-3 text-gray-400">{p.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.allowedRoles.map((r) => (
                          <span key={r} className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded">
                            {r.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {permissions.map((p) => (
            <div key={p._id} className="bg-gray-800 rounded-lg p-4">
              <p className="text-white font-mono text-xs mb-1">{p.key}</p>
              <p className="text-gray-400 text-xs mb-2">{p.description}</p>
              <div className="flex flex-wrap gap-1">
                {p.allowedRoles.map((r) => (
                  <span key={r} className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded">
                    {r.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PermissionsView;
