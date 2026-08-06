import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/authService';
import Navbar from '../components/Navbar';

function Profile() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSaving(true);

    try {
      await changePassword(currentPassword, newPassword);

      setMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to change password.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />

      <div className="p-8 max-w-lg mx-auto">

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          My Account
        </h1>


        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-none rounded-lg p-6 mb-6">

          <h2 className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-4">
            Account Information
          </h2>

          <dl className="space-y-2 text-sm">

            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <dt className="text-gray-500 dark:text-gray-400">
                Name
              </dt>

              <dd className="text-gray-900 dark:text-white">
                {user?.name}
              </dd>
            </div>


            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <dt className="text-gray-500 dark:text-gray-400">
                Role
              </dt>

              <dd className="text-gray-900 dark:text-white">
                {user?.role?.replace('_', ' ')}
              </dd>
            </div>


            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">
                Department
              </dt>

              <dd className="text-gray-900 dark:text-white">
                {user?.department}
              </dd>
            </div>

          </dl>

        </div>


        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-none rounded-lg p-6">

          <h2 className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-4">
            Change Password
          </h2>


          {message && (
            <div className="bg-green-500/10 border border-green-500 text-green-600 dark:text-green-400 text-sm p-3 rounded mb-4">
              {message}
            </div>
          )}


          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 text-sm p-3 rounded mb-4">
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>


            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>


            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm mb-1">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>


            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Change Password'}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}

export default Profile;
