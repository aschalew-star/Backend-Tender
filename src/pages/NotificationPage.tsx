import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Filter, Search, Calendar, Archive, Trash2, Settings, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationItem from '../component/Notification/NotificationItem';

// Static mock data
const staticNotifications = [
  {
    id: 1,
    message: "New tender available: Construction Project",
    type: "tender",
    isRead: false,
    createdAt: "2025-08-30T10:00:00Z",
    tender: { title: "Construction Project", category: { name: "Construction" } }
  },
  {
    id: 2,
    message: "Payment processed successfully",
    type: "payment",
    isRead: true,
    createdAt: "2025-08-29T15:30:00Z"
  },
  {
    id: 3,
    message: "System maintenance scheduled",
    type: "system",
    isRead: false,
    createdAt: "2025-08-28T09:00:00Z"
  }
];

const staticPendingNotifications = [
  {
    id: 4,
    message: "Upcoming tender deadline reminder",
    type: "tender",
    notifyAt: "2025-09-01T12:00:00Z",
    tender: { title: "Bridge Construction", category: { name: "Infrastructure" } }
  }
];

// Define TypeScript interfaces for type safety
interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  tender?: {
    title: string;
    category: { name: string };
  };
}

interface PendingNotification {
  id: number;
  message: string;
  type: string;
  notifyAt: string;
  tender?: {
    title: string;
    category: { name: string };
  };
}

// Mock fetch function to simulate API call
const mockFetch = <T,>(data: T, delay = 500): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

// Custom hook for notifications with mock fetch
const useNotifications = (userId: number) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<PendingNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mockFetch<Notification[]>(staticNotifications);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Simulate fetching pending notifications
  const loadPendingNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mockFetch<PendingNotification[]>(staticPendingNotifications);
      setPendingNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending notifications');
    } finally {
      setLoading(false);
    }
  };

  // Simulate marking a notification as read
  const markAsRead = async (id: number) => {
    try {
      await mockFetch({ success: true });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Simulate marking a notification as unread
  const markAsUnread = async (id: number) => {
    try {
      await mockFetch({ success: true });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: false } : n))
      );
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to mark as unread:', err);
    }
  };

  // Simulate marking all notifications as read
  const markAllAsRead = async () => {
    try {
      await mockFetch({ success: true });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Simulate deleting a notification
  const deleteNotification = async (id: number) => {
    try {
      await mockFetch({ success: true });
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => prev - (notifications.find(n => n.id === id)?.isRead ? 0 : 1));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return {
    notifications,
    pendingNotifications,
    unreadCount,
    isConnected,
    loading,
    error,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
    loadPendingNotifications,
  };
};

const NotificationPage: React.FC = () => {
  const [currentUser] = useState({ id: 1, type: 'customer' });
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const {
    notifications,
    pendingNotifications,
    unreadCount,
    isConnected,
    loading,
    error,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
    loadPendingNotifications,
  } = useNotifications(currentUser.id);

  useEffect(() => {
    loadNotifications();
    loadPendingNotifications();
  }, [loadNotifications, loadPendingNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'read' && notification.isRead) ||
      (filter === 'tender' && notification.type === 'tender') ||
      (filter === 'payment' && notification.type === 'payment') ||
      (filter === 'system' && notification.type === 'system');

    const matchesSearch =
      searchQuery === '' ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.tender?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleNotificationClick = (notificationId: number, isRead: boolean) => {
    if (!isRead) markAsRead(notificationId);
  };

  const handleSelectNotification = (notificationId: number) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications([]);
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.isRead) markAsRead(id);
    });
    setSelectedNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-8 h-8 text-blue-500" />
                Notifications
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-600">
                <span className={`flex items-center gap-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                <span>•</span>
                <span className="font-medium">{unreadCount} unread</span>
                <span>•</span>
                <span>{notifications.length} total</span>
                {pendingNotifications.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{pendingNotifications.length} scheduled</span>
                  </>
                )}
              </div>
            </div>
            <Link to="/NotificationSettings">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center p-6">
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        )}
        {error && (
          <div className="text-center p-6 text-red-600">
            <p>{error}</p>
            <button
              onClick={() => {
                loadNotifications();
                loadPendingNotifications();
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-gray-100"
            >
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {['all', 'unread', 'read', 'tender', 'payment', 'system'].map((filterType) => (
                    <motion.button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 text-sm rounded-xl capitalize transition-all duration-200 ${
                        filter === filterType
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filterType === 'all' ? `All (${notifications.length})` :
                       filterType === 'unread' ? `Unread (${unreadCount})` :
                       filterType === 'read' ? `Read (${notifications.length - unreadCount})` :
                       filterType}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Select all</span>
                  </label>
                  {selectedNotifications.length > 0 && (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBulkMarkAsRead}
                        className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as read ({selectedNotifications.length})
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete ({selectedNotifications.length})
                      </motion.button>
                    </div>
                  )}
                </div>
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    Mark all read
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Notifications List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                    <p className="text-sm text-gray-500">
                      {searchQuery ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => handleSelectNotification(notification.id)}
                          className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <NotificationItem
                          notification={notification}
                          onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                          onToggleRead={() =>
                            notification.isRead
                              ? markAsUnread(notification.id)
                              : markAsRead(notification.id)
                          }
                          onDelete={() => deleteNotification(notification.id)}
                          index={index}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Pending Notifications */}
            {pendingNotifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Scheduled Notifications</h3>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                      {pendingNotifications.length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Upcoming notifications based on your schedule</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {pendingNotifications.map((pending, index) => (
                    <motion.div
                      key={pending.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex-shrink-0 p-2 bg-orange-100 rounded-full"
                        >
                          <Calendar className="w-4 h-4 text-orange-600" />
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium">{pending.message}</p>
                          {pending.tender && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-800">{pending.tender.title}</p>
                              <p className="text-xs text-gray-500">{pending.tender.category?.name}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Scheduled for {new Date(pending.notifyAt).toLocaleString()}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full capitalize">
                              {pending.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;