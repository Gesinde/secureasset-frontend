import { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getStats } from '../services/adminService';
import Navbar from '../components/Navbar';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#06b6d4'];

const MetricCard = ({ label, value, accent }) => (
    <div className="bg-gray-800 rounded-lg p-5">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent || 'text-white'}`}>{value}</p>
    </div>
  );

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch {
      setError('Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  }, []);

   
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <p className="text-gray-400 p-8">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <p className="text-red-400 p-8">{error}</p>
      </div>
    );
  }

  const statusData = Object.entries(stats.assetsByStatus).map(([name, count]) => ({ name: name.replace('_', ' '), count }));
  const maintenanceData = Object.entries(stats.maintenanceByStatus).map(([name, count]) => ({ name: name.replace('_', ' '), count }));


  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Assets" value={stats.totalAssets} />
          <MetricCard label="Open Security Incidents" value={stats.openSecurityIncidents} accent={stats.openSecurityIncidents > 0 ? 'text-red-400' : 'text-green-400'} />
          <MetricCard label="Pending Transfers" value={stats.pendingTransfers} accent="text-yellow-400" />
          <MetricCard label="Active Users" value={`${stats.activeUsers} / ${stats.totalUsers}`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-5">
            <h3 className="text-gray-300 text-sm font-semibold mb-4">Assets by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.assetsByCategory} dataKey="count" nameKey="name" outerRadius={70} label>
                  {stats.assetsByCategory.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800 rounded-lg p-5">
            <h3 className="text-gray-300 text-sm font-semibold mb-4">Assets by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800 rounded-lg p-5">
            <h3 className="text-gray-300 text-sm font-semibold mb-4">Maintenance by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={maintenanceData}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
