import { useState, useEffect, useCallback } from 'react';
import { getDepartments, createDepartment, updateDepartment, setDepartmentActiveStatus } from '../services/departmentService';
import Navbar from '../components/Navbar';

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await getDepartments(true); // includeInactive, so admins see deactivated ones too
      setDepartments(data);
    } catch {
      setError('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDepartments();
  }, [fetchDepartments]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createDepartment(newName);
      setNewName('');
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create department.');
    }
  };

  const startEditing = (dept) => {
    setEditingId(dept._id);
    setEditName(dept.name);
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateDepartment(id, editName);
      setEditingId(null);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update department.');
    }
  };

  const handleToggleActive = async (dept) => {
    const action = dept.isActive === false ? 'reactivate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} "${dept.name}"?`)) return;
    try {
      await setDepartmentActiveStatus(dept._id, dept.isActive === false ? true : false);
      fetchDepartments();
    } catch {
      alert(`Failed to ${action} department.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Department Management</h1>

        <form onSubmit={handleCreate} className="bg-gray-800 p-6 rounded-lg mb-6 flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            placeholder="New department name"
            className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold">
            Add
          </button>
        </form>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : departments.length === 0 ? (
          <p className="text-gray-400">No departments found.</p>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-gray-300 text-sm">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept._id} className="border-t border-gray-700 text-gray-200 text-sm">
                    {editingId === dept._id ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 rounded bg-gray-700 text-white text-xs border border-gray-600"
                          />
                        </td>
                        <td className="px-4 py-2">—</td>
                        <td className="px-4 py-2 space-x-2">
                          <button onClick={() => handleSaveEdit(dept._id)} className="text-green-400 hover:underline text-xs">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:underline text-xs">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">{dept.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${dept.isActive === false ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {dept.isActive === false ? 'Deactivated' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 space-x-3">
                          <button onClick={() => startEditing(dept)} className="text-blue-400 hover:underline text-xs">Rename</button>
                          <button onClick={() => handleToggleActive(dept)} className="text-yellow-400 hover:underline text-xs">
                            {dept.isActive === false ? 'Reactivate' : 'Deactivate'}
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

export default DepartmentManagement;
