import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markAsRead } from '../services/notificationService';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      // silent fail - notification bell shouldn't interrupt the rest of the app
    }
  }, []);

   
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = async (n) => {
    if (!n.read) {
      await markAsRead(n._id);
      fetchNotifications();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-gray-300 hover:text-white text-sm"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-700 text-white text-sm font-semibold">
            Notifications
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm">No notifications</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleClick(n)}
                className={`block w-full text-left p-3 border-b border-gray-700 text-xs hover:bg-gray-700 ${n.read ? 'text-gray-500' : 'text-white'}`}
              >
                <p>{n.message}</p>
                <p className="text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
