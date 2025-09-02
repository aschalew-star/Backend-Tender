import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import {type Notification } from '../type/Notifications';

interface ToastNotification extends Notification {
  id: number;
  timestamp: number;
}

const NotificationToast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { notification } = event.detail;
      const toast: ToastNotification = {
        ...notification,
        timestamp: Date.now()
      };
      
      setToasts(prev => [toast, ...prev].slice(0, 5)); // Keep max 5 toasts
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.timestamp !== toast.timestamp));
      }, 5000);
    };

    window.addEventListener('show-toast', handleShowToast as EventListener);
    
    return () => {
      window.removeEventListener('show-toast', handleShowToast as EventListener);
    };
  }, []);

  const removeToast = (timestamp: number) => {
    setToasts(prev => prev.filter(t => t.timestamp !== timestamp));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tender':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-green-600" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'tender':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200';
      case 'payment':
        return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200';
      case 'system':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.timestamp}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`max-w-sm p-4 rounded-xl shadow-lg border backdrop-blur-sm ${getBackgroundColor(toast.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(toast.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                  {toast.message}
                </p>
                
                {toast.tender && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {toast.tender.title}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 bg-white/70 rounded-full capitalize">
                    {toast.type}
                  </span>
                </div>
              </div>
              
              <motion.button
                onClick={() => removeToast(toast.timestamp)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            
            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-xl"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: "linear" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;