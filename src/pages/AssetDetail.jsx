import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAssetById } from '../services/assetService';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { assignCustodian, acceptCustody } from '../services/assetService';
import { getUsers } from '../services/userService';

const daysSince = (dateString) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedCustodian, setSelectedCustodian] = useState('');
  const { user } = useAuth();
  const canEdit = user?.role === 'system_admin' || (user?.role === 'department_head' && user?.department === asset?.department);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const data = await getAssetById(id);
        setAsset(data);
      } catch  {
        setError('Failed to load asset.');
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  useEffect(() => {
  if (asset && canEdit) {
    getUsers({ department: asset.department }).then(setStaffList).catch(() => {});
  }
}, [asset, canEdit]);

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = asset.qrCodeImage;
    link.download = `${asset.name.replace(/\s+/g, '_')}_QR.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <p className="text-gray-400 p-8">Loading...</p>
      </div>
    );
  }

  const handleAssignCustodian = async () => {
  try {
    const updated = await assignCustodian(asset._id, selectedCustodian);
    setAsset(updated);
    setShowAssignForm(false);
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to assign custodian.');
  }
};

const handleAcceptCustody = async () => {
  try {
    const updated = await acceptCustody(asset._id);
    setAsset(updated);
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to accept custody.');
  }
};

const isMyCustody = asset?.custodian?._id === user?.id;

  if (error || !asset) {
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
      <div className="p-8 max-w-3xl mx-auto">
        
        <Link to="/assets" className="text-blue-400 hover:underline text-sm">
           ← Back to Assets
        </Link>
        {canEdit && (
        <Link to={`/assets/${asset._id}/edit`} className="text-blue-400 hover:underline text-sm ml-4">
          Edit Asset
        </Link>
      )}

        <div className="bg-gray-800 rounded-lg p-6 mt-4 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-4">{asset.name}</h1>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <dt className="text-gray-400">Category</dt>
                <dd className="text-white">{asset.category}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <dt className="text-gray-400">Serial Number</dt>
                <dd className="text-white">{asset.serialNumber}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <dt className="text-gray-400">Department</dt>
                <dd className="text-white">{asset.department}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <dt className="text-gray-400">Location</dt>
                <dd className="text-white">{asset.location}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <dt className="text-gray-400">Status</dt>
                <dd className="text-white">{asset.status.replace('_', ' ')}</dd>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Custodian</p>
                {asset.custodian ? (
                  <div>
                    <p className="text-white text-sm">{asset.custodian.name} ({asset.custodian.role})</p>
                    <p className="text-gray-500 text-xs">
                      {asset.custodianAcceptedAt
                        ? `Accepted ${new Date(asset.custodianAcceptedAt).toLocaleDateString()}`
                        : 'Awaiting acceptance'}
                    </p>
                    {isMyCustody && !asset.custodianAcceptedAt && (
                      <button
                        onClick={handleAcceptCustody}
                        className="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded"
                      >
                        Accept Custody
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No custodian assigned</p>
                )}

                {canEdit && (
                  <div className="mt-3">
                    {showAssignForm ? (
                      <div className="flex gap-2">
                        <select
                          value={selectedCustodian}
                          onChange={(e) => setSelectedCustodian(e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded bg-gray-700 text-white text-xs border border-gray-600"
                        >
                          <option value="">Select staff member</option>
                          {staffList.map((s) => (
                            <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                          ))}
                        </select>
                        <button
                          onClick={handleAssignCustodian}
                          disabled={!selectedCustodian}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50"
                        >
                          Assign
                        </button>
                        <button onClick={() => setShowAssignForm(false)} className="text-gray-400 text-xs">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAssignForm(true)}
                        className="text-blue-400 hover:underline text-xs"
                      >
                        {asset.custodian ? 'Reassign Custodian' : 'Assign Custodian'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between border-b border-gray-700 pb-2">
                <dt className="text-gray-400">Created</dt>
                <dd className="text-white">{new Date(asset.createdAt).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Last Verified</dt>
                <dd className={asset.lastVerifiedAt && daysSince(asset.lastVerifiedAt) > 90 ? 'text-yellow-400' : 'text-white'}>
                  {asset.lastVerifiedAt
                    ? `${new Date(asset.lastVerifiedAt).toLocaleDateString()} (${daysSince(asset.lastVerifiedAt)} days ago)`
                    : 'Never verified'}
                </dd>
              </div>
            </dl>
          </div>

          {asset.qrCodeImage && (
            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg">
              <img src={asset.qrCodeImage} alt="Asset QR Code" className="w-40 h-40" />
              <button
                onClick={handleDownloadQR}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
              >
                Download QR
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssetDetail;
