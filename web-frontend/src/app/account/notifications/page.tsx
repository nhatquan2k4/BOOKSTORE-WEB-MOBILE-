"use client";

import { useNotifications } from '@/components/ui/Notification';
import { Badge } from '@/components/ui';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        Thông báo
        {unreadCount > 0 && (
          <Badge variant="danger" className="text-xs">{unreadCount} mới</Badge>
        )}
      </h1>
      <div className="flex gap-2 mb-6">
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
        >
          Đánh dấu đã đọc tất cả
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={clearAll}
          disabled={notifications.length === 0}
          className="text-xs text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
        >
          Xóa tất cả
        </button>
      </div>
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
        <div className="divide-y divide-gray-100 bg-white rounded-lg shadow border border-gray-200">
          {[...notifications].map((notification) => (
            <button
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors ${notification.isRead ? '' : 'bg-blue-50'}`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                  {/* Icon theo loại thông báo */}
                  {notification.type === 'order' && (
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  )}
                  {notification.type === 'promotion' && (
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="M9 9h.01" /><path d="M15 15h.01" /></svg>
                  )}
                  {notification.type === 'review' && (
                    <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 17.75L18.2 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.44 4.73L5.8 21z" /></svg>
                  )}
                  {notification.type === 'system' && (
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8h.01" /></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={`text-base font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notification.title}</h4>
                    {!notification.isRead && <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-1"></div>}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                  <p className="text-xs text-gray-400">{notification.createdAt.toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
