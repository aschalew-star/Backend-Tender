import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Eye,
  EyeOff,
  Trash2,
  CheckCheck,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  userId?: number | null;
  customerId?: number | null;
}

// A new interface to match the combined backend response
interface ApiResponse {
  status: string;
  data: Notification[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  stats: {
    total: number;
    read: number;
    unread: number;
    system: number;
  };
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stats state, now populated from the single API call
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    read: 0,
    unread: 0,
    system: 0,
  });

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        searchTerm,
        filterType,
        filterRead,
      });

      // Corrected API endpoint for consistency
      const response = await fetch(`http://localhost:4000/api/notification/all?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      // We now expect the combined ApiResponse
      const data: ApiResponse = await response.json();
      
      // Set the notifications and pagination data
      setNotifications(data.data);
      setTotalPages(data.totalPages || 1);
      
      // Update the stats state with the new stats object from the response
      setNotificationStats(data.stats);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // The separate fetchNotificationStats function is no longer needed
  // and is removed from the component.

  // This useEffect now only needs to call the single fetch function.
  useEffect(() => {
    fetchNotifications();
  }, [searchTerm, filterType, filterRead, page]);

  const getNotificationIcon = (type: string) => {
    const iconConfig = {
      payment: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      tender: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
      system: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      user: { icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' }
    };

    const config = iconConfig[type as keyof typeof iconConfig] || iconConfig.system;
    const Icon = config.icon;

    return (
      <div className={`p-2 rounded-full ${config.bg}`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { bg: 'bg-red-100', text: 'text-red-800' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      low: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  // The unread count is now directly from the stats object, which is more accurate.
  const unreadCount = notificationStats.unread;

  // Corrected parameter name and logic to toggle the read status
  const handleMarkAsRead = async (id: number, isRead: boolean) => {
    try {
      const response=await fetch(`http://localhost:4000/api/notification/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // The body now correctly uses the 'isRead' parameter
        body: JSON.stringify({ isRead: !isRead }),
      });
      console.log(response)

      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Corrected API endpoint for consistency
      await fetch(`http://localhost:4000/api/notification/mark-all-read`, { method: 'PUT' });
      fetchNotifications();

    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await fetch(`http://localhost:4000/api/notification/${id}`, { method: 'DELETE' });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with the latest activities and alerts.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Header, now for notifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'All Notifications', count: notificationStats.total, color: 'blue', icon: Bell },
          { label: 'Unread', count: notificationStats.unread, color: 'yellow', icon: EyeOff },
          { label: 'Read', count: notificationStats.read, color: 'green', icon: Eye },
          { label: 'System', count: notificationStats.system, color: 'purple', icon: AlertCircle },
        ].map(({ label, count, color, icon: Icon }, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-transform duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${color}-500`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="payment">Payments</option>
                <option value="tender">Tenders</option>
                <option value="user">Users</option>
                <option value="system">System</option>
              </select>
              <select
                value={filterRead}
                onChange={(e) => {
                  setFilterRead(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[200px]">
        {loading && (
          <div className="p-8 text-center text-gray-500">Loading notifications...</div>
        )}
        {error && (
          <div className="p-8 text-center text-red-500">Error: {error}</div>
        )}
        {!loading && !error && (
          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-500">No notifications match your current filters.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            {notification.priority && getPriorityBadge(notification.priority)}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-400">{formatTimestamp(notification.createdat)}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead ? (
                            <button
                              // Correctly passing both arguments to handleMarkAsRead
                              onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              // Correctly passing both arguments to handleMarkAsRead
                              onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Mark as unread"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            // Removing the unnecessary isRead parameter from the call
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-3">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">{page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
