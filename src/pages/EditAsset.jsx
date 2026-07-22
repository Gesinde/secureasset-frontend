import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssetById, updateAsset } from '../services/assetService';
import { DEPARTMENTS } from '../utils/departments';
import Navbar from '../components/Navbar';

function EditAsset() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const data = await getAssetById(id);
        setFormData({
          name: data.name || '',
          category: data.category || '',
          serialNumber: data.serialNumber || '',
          assetTag: data.assetTag || '',
          department: data.department || '',
          location: data.location || '',
          status: data.status || 'available',
          condition: data.condition || 'good',
          vendor: data.vendor || '',
          description: data.description || '',
        });
      } catch {
        setError('Failed to load asset.');
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateAsset(id, formData);
      navigate(`/assets/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update asset.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <p className="text-gray-400 p-8">Loading...</p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <p className="text-red-400 p-8">{error || 'Asset not found.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Edit Asset</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Asset Name</label>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange} required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Category</label>
            <input
              type="text" name="category" value={formData.category} onChange={handleChange} required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Serial Number</label>
            <input
              type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Asset Tag</label>
            <input
              type="text" name="assetTag" value={formData.assetTag} onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="e.g. CU-CS-0001"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Department</label>
            <select
              name="department" value={formData.department} onChange={handleChange} required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Location</label>
            <input
              type="text" name="location" value={formData.location} onChange={handleChange} required
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Status</label>
              <select
                name="status" value={formData.status} onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Condition</label>
              <select
                name="condition" value={formData.condition} onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="condemned">Condemned</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Vendor</label>
            <input
              type="text" name="vendor" value={formData.vendor} onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Description</label>
            <textarea
              name="description" value={formData.description} onChange={handleChange} rows={2}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button" onClick={() => navigate(`/assets/${id}`)}
              className="text-gray-400 hover:text-white text-sm px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAsset;
