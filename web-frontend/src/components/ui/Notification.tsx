'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from './Badge';
import { notificationService } from '@/services/notification.service';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'review' | 'order_created' | 'payment_success' | 'order_shipped' | 'order_completed' | 'rental_success' | 'rental_renewed' | 'rental_returned';
  isRead: boolean;
  createdAt: Date;
  link?: string;
  image?: string;
}

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDelete: (id: string) => void;
}

export function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDelete,
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: NotificationItem['type']) => {
    // Map backend types to display types
    const iconType = type.startsWith('order_') || type.startsWith('payment_') ? 'order' : 
                     type.startsWith('rental_') ? 'order' : type;
    
    switch (iconType) {
      case 'order':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'promotion':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
            <path d="m15 9-6 6"/>
            <path d="M9 9h.01"/>
            <path d="M15 15h.01"/>
          </svg>
        );
      case 'review':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        );
    }
  };

  const getIconColor = (type: NotificationItem['type']) => {
    // Map backend types to display colors
    const colorType = type.startsWith('order_') || type.startsWith('payment_') ? 'order' : 
                      type.startsWith('rental_') ? 'order' : type;
    
    switch (colorType) {
      case 'order':
        return 'bg-blue-100 text-blue-600';
      case 'promotion':
        return 'bg-green-100 text-green-600';
      case 'review':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="absolute left-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900">Thông báo</h3>
          {unreadCount > 0 && (
            <Badge variant="danger" className="text-xs">
              {unreadCount} mới
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
          >
            Đánh dấu đã đọc tất cả
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={onClearAll}
            disabled={notifications.length === 0}
            className="text-xs text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">Chưa có thông báo</p>
            <p className="text-gray-400 text-xs mt-1">Thông báo của bạn sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`w-full px-4 py-3 transition-colors ${
                  notification.isRead ? '' : 'bg-blue-50'
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      {notification.isRead ? null : (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-1"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        {formatTime(notification.createdAt)}
                      </p>
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notification.id);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            title="Đánh dấu đã đọc"
                          >
                            Đã đọc
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                          }}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                          title="Xóa thông báo"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Link 
            href="/account/notifications" 
            className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-1 hover:bg-blue-50 rounded transition"
          >
            Xem tất cả thông báo
          </Link>
        </div>
      )}
    </div>
  );
}

// Hook để quản lý notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      // Chỉ fetch khi user đã login (có token)
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await notificationService.getMyNotifications(1, 20);
        
        // Transform API data to component format
        // Safely handle undefined or null items
        const items = response?.items || [];
        const transformedNotifications: NotificationItem[] = items.map((item: any) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          type: (item.type || 'system') as NotificationItem['type'],
          isRead: item.isRead,
          createdAt: new Date(item.createdAt),
          link: item.link,
        }));

        setNotifications(transformedNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds (only if logged in)
    const pollInterval = setInterval(() => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        fetchNotifications();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      const success = await notificationService.deleteAllNotifications();
      if (success) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to clear all:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const success = await notificationService.deleteNotification(id);
      if (success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const addNotification = (notification: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
    addNotification,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    loading,
  };
}
