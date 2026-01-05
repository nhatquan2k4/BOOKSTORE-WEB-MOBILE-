// Notification Context - Manage in-app notifications with API integration
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadNotificationsCount,
} from '@/src/services/notificationService';
import type { NotificationListDto } from '@/src/types';
import { parseUTCToVietnamTime } from '@/src/utils/dateUtils';
import { generateUUID, isValidUUID } from '@/src/utils/uuidUtils';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'promotion' | 'system' | 'test';
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotif: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert API DTO to local Notification format
  const convertToNotification = (dto: NotificationListDto): Notification => {
    // Parse UTC date from backend and convert to local time
    console.log('🔄 Converting notification:', {
      id: dto.id,
      createdAt: dto.createdAt,
      type: typeof dto.createdAt,
    });
    
    const vietnamDate = parseUTCToVietnamTime(dto.createdAt);
    
    console.log('✅ Converted date:', {
      vietnamDate: vietnamDate.toISOString(),
      local: vietnamDate.toLocaleString('vi-VN'),
    });
    
    return {
      id: dto.id,
      title: dto.title,
      message: dto.message,
      type: dto.type as Notification['type'],
      timestamp: vietnamDate,
      read: dto.isRead,
      link: dto.link,
    };
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (isRefreshing = false) => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('🔔 Fetching notifications...');
      
      // Fetch notifications with pagination (get first 50)
      const response = await getMyNotifications({
        page: 1,
        pageSize: 50,
      });

      console.log('✅ Notifications response:', response);

      const convertedNotifications = response.items.map(convertToNotification);
      setNotifications(convertedNotifications);
      setUnreadCount(response.unreadCount);

    } catch (err: any) {
      console.error('❌ Error fetching notifications:', err);
      setError(err.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  // Add notification locally (for real-time events)
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateUUID(), // Use proper UUID instead of timestamp
      timestamp: new Date(),
      read: false,
    };

    console.log('➕ Adding local notification:', {
      id: newNotification.id,
      isValidUUID: isValidUUID(newNotification.id),
    });

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Mark as read with API sync
  const markAsRead = useCallback(async (id: string) => {
    try {
      console.log('✅ Marking notification as read:', id);
      console.log('📋 ID validation:', {
        id,
        type: typeof id,
        length: id.length,
        isValidUUID: isValidUUID(id),
      });
      
      // Validate GUID format
      if (!isValidUUID(id)) {
        console.error('❌ Invalid GUID format:', id);
        // If local notification (not from API), just update UI
        setNotifications(prev =>
          prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return;
      }
      
      // Optimistic update
      setNotifications(prev =>
        prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Sync with API
      const success = await markNotificationAsRead(id);
      
      if (!success) {
        console.warn('⚠️ Failed to mark as read on server, reverting...');
        // Revert on failure
        await fetchNotifications(true);
      }
    } catch (err) {
      console.error('❌ Error marking as read:', err);
      // Revert on error
      await fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // Mark all as read with API sync
  const markAllAsRead = useCallback(async () => {
    try {
      console.log('✅ Marking all notifications as read...');
      
      // Optimistic update
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);

      // Sync with API
      const success = await markAllNotificationsAsRead();
      
      if (!success) {
        console.warn('⚠️ Failed to mark all as read on server, reverting...');
        // Revert on failure
        await fetchNotifications(true);
      }
    } catch (err) {
      console.error('❌ Error marking all as read:', err);
      // Revert on error
      await fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // Delete notification with API sync
  const deleteNotif = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Deleting notification:', id);
      
      // Optimistic update
      const notifToDelete = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      if (notifToDelete && !notifToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Sync with API
      const success = await deleteNotification(id);
      
      if (!success) {
        console.warn('⚠️ Failed to delete on server, reverting...');
        // Revert on failure
        await fetchNotifications(true);
      }
    } catch (err) {
      console.error('❌ Error deleting notification:', err);
      // Revert on error
      await fetchNotifications(true);
    }
  }, [notifications, fetchNotifications]);

  // Clear all notifications with API sync
  const clearAll = useCallback(async () => {
    try {
      console.log('🗑️ Clearing all notifications...');
      
      // Optimistic update
      setNotifications([]);
      setUnreadCount(0);

      // Sync with API
      const success = await deleteAllNotifications();
      
      if (!success) {
        console.warn('⚠️ Failed to delete all on server, reverting...');
        // Revert on failure
        await fetchNotifications(true);
      }
    } catch (err) {
      console.error('❌ Error clearing all notifications:', err);
      // Revert on error
      await fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // Manual refresh
  const refresh = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotif,
        clearAll,
        unreadCount,
        loading,
        refreshing,
        error,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
