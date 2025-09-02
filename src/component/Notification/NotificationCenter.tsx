import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, X, CheckCheck, Trash2, Filter, Search } from 'lucide-react';
import { useNotifications } from './UseNotification';
import NotificationItem from './NotificationItem';
import NotificationPreferences from './NotificationPreference';
import NotificationToast from './NotificationToast';

interface NotificationCenterProps {
  userId?: number;
  customerId?: number;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId, customerId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    loadNotifications
  } = useNotifications(userId, customerId);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'tender' && notification.type === 'tender') ||
      (filter === 'payment' && notification.type === 'payment') ||
      (filter === 'system' && notification.type === 'system');
    
    const matchesSearch = searchQuery === '' || 
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.tender?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <motion.button
          onClick={toggleNotificationCenter}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-6 h-6" />
          
          {/* Connection Status Indicator */}
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          
          {/* Unread Count Badge */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-4 top-16 w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-500">
                      {unreadCount} unread • {isConnected ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => setShowPreferences(!showPreferences)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Settings className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="mt-3 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <div className="flex gap-1">
                      {['all', 'unread', 'tender', 'payment', 'system'].map((filterType) => (
                        <button
                          key={filterType}
                          onClick={() => setFilter(filterType)}
                          className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                            filter === filterType
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {filterType}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {unreadCount > 0 && (
                  <div className="mt-3 flex gap-2">
                    <motion.button
                      onClick={markAllAsRead}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CheckCheck className="w-4 h-4" />
                      Mark all read
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Preferences Panel */}
              <AnimatePresence>
                {showPreferences && (
                  <NotificationPreferences
                    onClose={() => setShowPreferences(false)}
                    userId={userId}
                    customerId={customerId}
                  />
                )}
              </AnimatePresence>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto max-h-96">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 text-center text-gray-500"
                    >
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">No notifications found</p>
                    </motion.div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredNotifications.map((notification, index) => (
                        <NotificationItem
                          key={notification.id}
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
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <NotificationToast />
    </>
  );
};

export default NotificationCenter;