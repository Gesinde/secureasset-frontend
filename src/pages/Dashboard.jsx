import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logoutUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={logoutUser}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
        >
          Logout
        </button>
      </div>
      <p className="text-gray-300">Welcome, {user?.name} ({user?.role})</p>
      <p className="text-gray-400 text-sm mt-2">Department: {user?.department}</p>
    </div>
  );
}

export default Dashboard;
