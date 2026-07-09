import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAssetById } from '../services/assetService';
import Navbar from '../components/Navbar';

function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const data = await getAssetById(id);
        setAsset(data);
      } catch (err) {
        setError('Failed to load asset.');
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

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
              <div className="flex justify-between">
                <dt className="text-gray-400">Created</dt>
                <dd className="text-white">{new Date(asset.createdAt).toLocaleDateString()}</dd>
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
