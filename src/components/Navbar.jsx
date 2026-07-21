import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logoutUser } = useAuth();

  if (!user) return null;


  const canViewAudit = ['system_admin', 'auditor'].includes(user.role);
  const canViewSecurity = ['system_admin', 'security_officer', 'auditor'].includes(user.role);
  const canViewMaintenance = true; // all roles have some maintenance visibility

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-white font-bold text-lg">
            SecureAsset
          </Link>
          <Link to="/assets" className="text-gray-300 hover:text-white text-sm">
            Assets
          </Link>
          <Link to="/scan" className="text-gray-300 hover:text-white text-sm">
           Scan
          </Link>
          {canViewMaintenance && (
            <Link to="/maintenance" className="text-gray-300 hover:text-white text-sm">
              Maintenance
            </Link>
          )}
          {canViewSecurity && (
            <Link to="/security" className="text-gray-300 hover:text-white text-sm">
              Security
            </Link>
          )}
          {canViewAudit && (
            <Link to="/audit" className="text-gray-300 hover:text-white text-sm">
              Audit Log
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            {user.name} <span className="text-gray-500">({user.role})</span>
          </span>
          <button
            onClick={logoutUser}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

