'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';
import { notificationService } from '@/services/notification.service';

type NotificationType = 'order' | 'promotion' | 'review' | 'system' | 'payment';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

const notificationTypeConfig: Record<
  NotificationType,
  {
    label: string;
    bgColor: string;
    textColor: string;
    icon: React.ReactElement;
  }
> = {
  order: {
    label: 'Đơn hàng',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
    ),
  },
  promotion: {
    label: 'Khuyến mãi',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="M9 9h.01" />
        <path d="M15 15h.01" />
      </svg>
    ),
  },
  review: {
    label: 'Đánh giá',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  payment: {
    label: 'Thanh toán',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  system: {
    label: 'Hệ thống',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<NotificationType | 'all'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const notifResponse = await notificationService.getMyNotifications(1, 50);

        // Transform API data to component format
        // Safely handle undefined or null items
        const items = notifResponse?.items || [];
        const transformedNotifications: Notification[] = items.map((item) => ({
          id: item.id,
          type: (item.type || 'system') as NotificationType,
          title: item.title,
          message: item.message,
          isRead: item.isRead,
          createdAt: item.createdAt,
          actionUrl: item.link,
        }));

        setNotifications(transformedNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        // Keep empty array if API fails
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const displayUnreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'all') return notifications;
    return notifications.filter((n) => n.type === selectedFilter);
  }, [notifications, selectedFilter]);

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
      await notificationService.deleteAllRead();
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (error) {
      console.error('Failed to clear all:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-gray-200"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 rounded-lg bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <svg className="w-7 h-7 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              Thông báo
              {displayUnreadCount > 0 && (
                <Badge variant="danger" className="text-sm">
                  {displayUnreadCount} mới
                </Badge>
              )}
            </h1>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={markAllAsRead}
                disabled={displayUnreadCount === 0}
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Đọc tất cả
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearAll}
                disabled={notifications.length === 0}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                Xóa tất cả
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              size="sm"
              variant={selectedFilter === 'all' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('all')}
            >
              Tất cả ({notifications.length})
            </Button>
            {Object.entries(notificationTypeConfig).map(([key, config]) => {
              const count = notifications.filter((n) => n.type === key).length;
              return (
                <Button
                  key={key}
                  size="sm"
                  variant={selectedFilter === key ? 'primary' : 'ghost'}
                  onClick={() => setSelectedFilter(key as NotificationType)}
                >
                  {config.label} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                <path d="M4 2 2 4" />
                <path d="M22 2l-2 2" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có thông báo
              </h3>
              <p className="text-gray-500 text-sm">
                Thông báo của bạn sẽ xuất hiện ở đây
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const config = notificationTypeConfig[notification.type];
              return (
                <div
                key={notification.id}
                onClick={() => {
                  markAsRead(notification.id);
                  setSelectedNotification(notification);
                }}
              >
                <Card
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    !notification.isRead
                      ? 'border-l-4 border-l-blue-500 bg-blue-50/30'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} ${config.textColor} flex items-center justify-center`}>
                        {config.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className={`${config.bgColor} ${config.textColor} text-xs`}>
                            {config.label}
                          </Badge>
                          <button
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNotification(notification);
                            }}
                          >
                            Xem chi tiết
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              );
            })}
          </div>
        )}

        {/* Modal chi tiết thông báo */}
        {selectedNotification && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNotification(null)}
          >
            <div 
              className="max-w-2xl w-full"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Card className="max-h-[80vh] overflow-y-auto">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-full ${notificationTypeConfig[selectedNotification.type].bgColor} ${notificationTypeConfig[selectedNotification.type].textColor} flex items-center justify-center`}>
                      {notificationTypeConfig[selectedNotification.type].icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedNotification.title}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${notificationTypeConfig[selectedNotification.type].bgColor} ${notificationTypeConfig[selectedNotification.type].textColor}`}>
                          {notificationTypeConfig[selectedNotification.type].label}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(selectedNotification.createdAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
                  >
                    <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {selectedNotification.message}
                  </p>
                </div>

                {/* Action Button */}
                {selectedNotification.actionUrl && (
                  <div className="mt-6 flex gap-3">
                    <a
                      href={selectedNotification.actionUrl}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-center"
                    >
                      Xem chi tiết
                    </a>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedNotification(null)}
                      className="px-6"
                    >
                      Đóng
                    </Button>
                  </div>
                )}
                {!selectedNotification.actionUrl && (
                  <div className="mt-6">
                    <Button
                      variant="primary"
                      onClick={() => setSelectedNotification(null)}
                      className="w-full"
                    >
                      Đóng
                    </Button>
                  </div>
                )}
              </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
