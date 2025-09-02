export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdat: string;
  userId?: number;
  customerId?: number;
  tenderId?: number;
  tender?: {
    id: number;
    title: string;
    category: {
      name: string;
    };
  };
}

export interface PendingNotification {
  id: number;
  message: string;
  type: string;
  notifyAt: string;
  tenderId: number;
  tender: {
    id: number;
    title: string;
    category: {
      name: string;
    };
  };
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  morningTime: string;
  afternoonTime: string;
  eveningTime: string;
  categories: string[];
  regions: string[];
}