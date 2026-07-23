import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import { getScanMapPoints } from '../services/mapService';
import { getIncidents } from '../services/securityService';
import Navbar from '../components/Navbar';

// Fix Leaflet's default marker icon path issue with bundlers like Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Matches backend/config/campusBoundary.js - if you update that file with real
// coordinates, update these four numbers to match
const BOUNDARY = { NORTH: 6.5339, SOUTH: 6.5239, EAST: 3.1408, WEST: 3.1308 };
const CENTER = [(BOUNDARY.NORTH + BOUNDARY.SOUTH) / 2, (BOUNDARY.EAST + BOUNDARY.WEST) / 2];

const INCIDENT_STATUS_COLOR = {
  open: 'text-red-400',
  investigating: 'text-yellow-400',
  resolved: 'text-green-400',
};

function SecurityMap() {
  const [points, setPoints] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pointData, incidentData] = await Promise.all([getScanMapPoints(), getIncidents()]);
        setPoints(pointData);
        setIncidents(incidentData);
      } catch {
        setError('Failed to load map data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Security Map</h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-400">Loading map...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden" style={{ height: '500px' }}>
              <MapContainer center={CENTER} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Rectangle
                  bounds={[[BOUNDARY.SOUTH, BOUNDARY.WEST], [BOUNDARY.NORTH, BOUNDARY.EAST]]}
                  pathOptions={{ color: '#3b82f6', weight: 2, fillOpacity: 0.05 }}
                />
                {points.map((p) => (
                  <Marker key={p._id} position={[p.gpsLat, p.gpsLng]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{p.asset?.name}</p>
                        <p>{p.isOffCampus ? '⚠️ Off-campus scan' : 'On-campus scan'}</p>
                        <p className="text-gray-500">{p.scannedBy?.name || 'Anonymous'}</p>
                        <p className="text-gray-500 text-xs">{new Date(p.timestamp).toLocaleString()}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 max-h-[500px] overflow-y-auto">
              <h3 className="text-gray-300 text-sm font-semibold mb-3">
                Security Incidents ({incidents.length})
              </h3>
              {incidents.length === 0 ? (
                <p className="text-gray-500 text-sm">No incidents reported.</p>
              ) : (
                <div className="space-y-3">
                  {incidents.map((inc) => (
                    <div key={inc._id} className="border-b border-gray-700 pb-3">
                      <div className="flex justify-between items-start">
                        <p className="text-white text-sm font-medium">
                          {inc.asset?.name || 'General incident'}
                        </p>
                        <span className={`text-xs ${INCIDENT_STATUS_COLOR[inc.status]}`}>
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">{inc.location}</p>
                      <p className="text-gray-500 text-xs mt-1">{inc.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-4 text-xs text-gray-500">
          <span>📍 {points.filter((p) => !p.isOffCampus).length} on-campus scans</span>
          <span>⚠️ {points.filter((p) => p.isOffCampus).length} off-campus scans</span>
        </div>
      </div>
    </div>
  );
}

export default SecurityMap;
