import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-300">Welcome, {user?.name}</p>
        <p className="text-gray-400 text-sm mt-1">
          Role: {user?.role} · Department: {user?.department}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;

