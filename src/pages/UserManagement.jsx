import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, setUserActiveStatus } from '../services/userService';
import { DEPARTMENTS } from '../utils/departments';
import Navbar from '../components/Navbar';

const ROLES = [
  'system_admin', 'department_head', 'department_staff', 'auditor',
  'maintenance_officer', 'maintenance_technician', 'security_officer'
];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '', department: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', role: '', department: '' });

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

   
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      setFormData({ name: '', email: '', password: '', role: '', department: '' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user.');
    }
  };

  const startEditing = (u) => {
    setEditingId(u._id);
    setEditData({ name: u.name, role: u.role, department: u.department });
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateUser(id, editData);
      setEditingId(null);
      fetchUsers();
    } catch {
      alert('Failed to update user.');
    }
  };

  const handleToggleActive = async (u) => {
    const action = u.isActive === false ? 'reactivate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${u.name}?`)) return;
    try {
      await setUserActiveStatus(u._id, u.isActive === false ? true : false);
      fetchUsers();
    } catch {
      alert(`Failed to ${action} user.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold"
          >
            {showForm ? 'Cancel' : '+ Add User'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-gray-800 p-6 rounded-lg mb-6 space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Full Name</label>
              <input
                type="text" required value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Email</label>
              <input
                type="email" required value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Temporary Password</label>
              <input
                type="text" required value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="User should change this after first login"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Role</label>
                <select
                  required value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select role</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Department</label>
                <select
                  required value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold">
              Create User
            </button>
          </form>
        )}

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300 text-sm">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-gray-700 text-gray-200 text-sm">
                    {editingId === u._id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full px-2 py-1 rounded bg-gray-700 text-white text-xs border border-gray-600"
                          />
                        </td>
                        <td className="px-4 py-2 text-gray-500">{u.email}</td>
                        <td className="px-4 py-2">
                          <select
                            value={editData.role}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                            className="w-full px-2 py-1 rounded bg-gray-700 text-white text-xs border border-gray-600"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>{r.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={editData.department}
                            onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                            className="w-full px-2 py-1 rounded bg-gray-700 text-white text-xs border border-gray-600"
                          >
                            {DEPARTMENTS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">—</td>
                        <td className="px-4 py-2 space-x-2">
                          <button onClick={() => handleSaveEdit(u._id)} className="text-green-400 hover:underline text-xs">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:underline text-xs">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">{u.name}</td>
                        <td className="px-4 py-3 text-gray-400">{u.email}</td>
                        <td className="px-4 py-3">{u.role.replace('_', ' ')}</td>
                        <td className="px-4 py-3">{u.department}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${u.isActive === false ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {u.isActive === false ? 'Deactivated' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 space-x-3">
                          <button onClick={() => startEditing(u)} className="text-blue-400 hover:underline text-xs">Edit</button>
                          <button onClick={() => handleToggleActive(u)} className="text-yellow-400 hover:underline text-xs">
                            {u.isActive === false ? 'Reactivate' : 'Deactivate'}
                          </button>
                        </td>
                      </>
                    )}
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

export default UserManagement;
