import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Filter,
  Eye,
  EyeOff,
  Trash2,
  CheckCheck,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Notifications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'payment',
      title: 'Payment Approval Required',
      message: 'New payment of $299.99 from John Smith requires approval',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      priority: 'high',
      userId: 101,
      customerId: 501
    },
    {
      id: 2,
      type: 'tender',
      title: 'New Tender Published',
      message: 'Road Construction Project Phase 2 has been published successfully',
      timestamp: '2024-01-15T09:15:00Z',
      isRead: true,
      priority: 'medium',
      userId: 102,
      customerId: null
    },
    {
      id: 3,
      type: 'system',
      title: 'System Maintenance Scheduled',
      message: 'System maintenance is scheduled for tonight at 2:00 AM',
      timestamp: '2024-01-15T08:45:00Z',
      isRead: false,
      priority: 'low',
      userId: null,
      customerId: null
    },
    {
      id: 4,
      type: 'user',
      title: 'New User Registration',
      message: 'Sarah Johnson has registered as a new customer',
      timestamp: '2024-01-14T16:20:00Z',
      isRead: true,
      priority: 'medium',
      userId: null,
      customerId: 502
    },
    {
      id: 5,
      type: 'tender',
      title: 'Bidding Period Closing Soon',
      message: 'IT Equipment Procurement bidding closes in 2 days',
      timestamp: '2024-01-14T14:30:00Z',
      isRead: false,
      priority: 'high',
      userId: 103,
      customerId: null
    },
    {
      id: 6,
      type: 'payment',
      title: 'Payment Rejected',
      message: 'Payment from Emma Wilson has been rejected due to insufficient funds',
      timestamp: '2024-01-14T11:15:00Z',
      isRead: true,
      priority: 'medium',
      userId: 101,
      customerId: 503
    }
  ];

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

    const config = priorityConfig[priority as keyof typeof priorityConfig];

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

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'read' && notification.isRead) ||
                       (filterRead === 'unread' && !notification.isRead);
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: number) => {
    console.log('Marking notification as read:', id);
  };

  const handleMarkAllAsRead = () => {
    console.log('Marking all notifications as read');
  };

  const handleDeleteNotification = (id: number) => {
    console.log('Deleting notification:', id);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
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
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
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
                onChange={(e) => setFilterRead(e.target.value)}
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

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">No notifications match your current filters.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
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
                          {getPriorityBadge(notification.priority)}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-400">{formatTimestamp(notification.timestamp)}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead ? (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Mark as read"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Mark as unread"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                        <button
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
      </div>
    </div>
  );
};

export default Notifications;