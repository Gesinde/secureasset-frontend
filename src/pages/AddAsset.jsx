import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAsset } from '../services/assetService';
import Navbar from '../components/Navbar';

const DEPARTMENTS = [
  'Economics', 'Political Science', 'Sociology', 'Mass Communication',
  'Accounting', 'Business Administration', 'Banking and Finance',
  'Computer Science', 'Biology', 'Chemistry', 'Physics',
  'Microbiology', 'Biochemistry', 'Mathematics'
];

function AddAsset() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    serialNumber: '',
    department: '',
    location: '',
    status: 'available',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const asset = await createAsset(formData);
      navigate(`/assets/${asset._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Add New Asset</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Asset Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="e.g. HP LaserJet Printer"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Electronics, Furniture"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Serial Number</label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="e.g. HP-2024-001"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="e.g. CS Lab 1"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="under_maintenance">Under Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Asset'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddAsset;
