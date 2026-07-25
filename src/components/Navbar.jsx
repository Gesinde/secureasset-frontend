import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

function Navbar() {
  const { user, logoutUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const canViewAudit = ['system_admin', 'auditor'].includes(user.role);
  const canViewSecurity = ['system_admin', 'security_officer', 'auditor'].includes(user.role);
  const isAdmin = user.role === 'system_admin';

  const links = [
    { to: '/assets', label: 'Assets', show: true },
    { to: '/scan', label: 'Scan', show: true },
    { to: '/maintenance', label: 'Maintenance', show: true },
    { to: '/security', label: 'Security', show: canViewSecurity },
    { to: '/security-map', label: 'Map', show: canViewSecurity },
    { to: '/audit', label: 'Audit Log', show: canViewAudit },
    { to: '/transfers', label: 'Transfers', show: true },
    { to: '/users', label: 'Users', show: isAdmin },
    { to: '/departments', label: 'Departments', show: isAdmin },
    { to: '/admin', label: 'Dashboard', show: isAdmin },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
      <div className="flex justify-between items-center">
        <Link to="/dashboard" className="text-gray-900 dark:text-white font-bold text-lg">
          SecureAsset
        </Link>

        {/* Desktop links - hidden below md breakpoint */}
        <div className="hidden md:flex items-center gap-5 flex-wrap">
          {links.filter((l) => l.show).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {user.name} <span className="text-gray-400 dark:text-gray-500">({user.role})</span>
            </span>
            <button
              onClick={logoutUser}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile: bell always visible, plus hamburger toggle */}
          <div className="md:hidden flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 dark:text-gray-200 text-xl"
              aria-label="Toggle menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3">
          {links.filter((l) => l.show).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {user.name} <span className="text-gray-400 dark:text-gray-500">({user.role})</span>
              </span>
            </div>
            <button
              onClick={logoutUser}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
