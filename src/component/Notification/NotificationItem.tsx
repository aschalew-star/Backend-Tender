import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  FileText, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import {type Notification } from '../type/Notifications';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
  index: number;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onToggleRead,
  onDelete,
  index
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'tender':
        return <FileText className="w-5 h-5" />;
      case 'payment':
        return <CreditCard className="w-5 h-5" />;
      case 'system':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tender':
        return 'text-blue-600 bg-blue-100';
      case 'payment':
        return 'text-green-600 bg-green-100';
      case 'system':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'Just now';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.isRead ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div className={`flex-shrink-0 p-2 rounded-full ${getTypeColor(notification.type)}`}>
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Message */}
              <p className={`text-sm leading-relaxed ${
                !notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'
              }`}>
                {notification.message}
              </p>

              {/* Tender Info */}
              {notification.tender && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-800">
                    {notification.tender.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {notification.tender.category?.name}
                  </p>
                </div>
              )}

              {/* Time and Type */}
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(notification.createdat)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getTypeColor(notification.type)}`}>
                  {notification.type}
                </span>
              </div>
            </div>

            {/* Unread Indicator */}
            {!notification.isRead && (
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleRead();
          }}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
        >
          {notification.isRead ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </motion.button>
        
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Delete notification"
        >
          <Trash2 className="w-3 h-3" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default NotificationItem;