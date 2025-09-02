import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './UseSocket';
import type{ Notification, PendingNotification, NotificationPreferences } from '../type/Notifications';

const SOCKET_URL = 'ws://localhost:3001'; // Update with your server URL

export const useNotifications = (userId?: number, customerId?: number) => {
  const { socket, isConnected, emit, on } = useSocket(SOCKET_URL);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<PendingNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    morningTime: '09:00',
    afternoonTime: '14:00',
    eveningTime: '18:00',
    categories: [],
    regions: []
  });

  // Join user room on connection
  useEffect(() => {
    if (isConnected && (userId || customerId)) {
      const userType = userId ? 'user' : 'customer';
      const id = userId || customerId;
      emit('join-room', { userType, id });
    }
  }, [isConnected, userId, customerId, emit]);

  // Listen for new notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Play sound if enabled
      if (preferences.soundEnabled) {
        playNotificationSound(notification.type);
      }
      
      // Show toast notification
      showToastNotification(notification);
    };

    const handleNotificationUpdate = (updatedNotification: Notification) => {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === updatedNotification.id ? updatedNotification : notif
        )
      );
    };

    const handleBulkNotifications = (notifs: Notification[]) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
    };

    const removeListener1 = on('new-notification', handleNewNotification);
    const removeListener2 = on('notification-updated', handleNotificationUpdate);
    const removeListener3 = on('notifications-loaded', handleBulkNotifications);

    return () => {
      removeListener1?.();
      removeListener2?.();
      removeListener3?.();
    };
  }, [socket, preferences.soundEnabled, on]);

  const playNotificationSound = (type: string) => {
    const audio = new Audio();
    switch (type) {
      case 'tender':
        audio.src = '/sounds/tender-notification.mp3';
        break;
      case 'payment':
        audio.src = '/sounds/payment-notification.mp3';
        break;
      default:
        audio.src = '/sounds/default-notification.mp3';
    }
    audio.play().catch(console.error);
  };

  const showToastNotification = (notification: Notification) => {
    // Dispatch custom event for toast system
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { notification }
    }));
  };

  const markAsRead = useCallback((notificationId: number) => {
    emit('mark-as-read', { notificationId });
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [emit]);

  const markAsUnread = useCallback((notificationId: number) => {
    emit('mark-as-unread', { notificationId });
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: false } : notif
      )
    );
    setUnreadCount(prev => prev + 1);
  }, [emit]);

  const markAllAsRead = useCallback(() => {
    emit('mark-all-as-read', { userId, customerId });
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  }, [emit, userId, customerId]);

  const deleteNotification = useCallback((notificationId: number) => {
    emit('delete-notification', { notificationId });
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
    });
  }, [emit, notifications]);

  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    emit('update-preferences', {
      userId,
      customerId,
      preferences: updatedPreferences
    });
  }, [preferences, emit, userId, customerId]);

  const loadNotifications = useCallback(() => {
    emit('load-notifications', { userId, customerId });
  }, [emit, userId, customerId]);

  const loadPendingNotifications = useCallback(() => {
    emit('load-pending-notifications', { userId, customerId });
  }, [emit, userId, customerId]);

  return {
    notifications,
    pendingNotifications,
    unreadCount,
    isConnected,
    preferences,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    loadNotifications,
    loadPendingNotifications
  };
};