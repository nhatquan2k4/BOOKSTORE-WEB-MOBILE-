/**
 * Notification Service
 * API calls for notification management
 */

import { api } from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import type {
  NotificationDto,
  NotificationListDto,
  GetUserNotificationsResponse,
  GetNotificationsParams,
  UnreadCountDto,
  NotificationResponse,
  DeleteNotificationResponse,
  MarkAsReadResponse,
} from '../types/notification';

/**
 * Get current user's notifications with pagination
 */
export const getMyNotifications = async (
  params?: GetNotificationsParams
): Promise<GetUserNotificationsResponse> => {
  try {
    console.log('🔔 Fetching notifications from API...', params);
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
    
    const url = `${API_ENDPOINTS.NOTIFICATIONS.MY}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<GetUserNotificationsResponse>(url);
    
    console.log('✅ Notifications fetched:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching notifications:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get recent notifications (default: 5 latest)
 */
export const getRecentNotifications = async (
  count: number = 5
): Promise<NotificationListDto[]> => {
  try {
    console.log('🔔 Fetching recent notifications...');
    
    const url = `${API_ENDPOINTS.NOTIFICATIONS.RECENT}?count=${count}`;
    const response = await api.get<NotificationListDto[]>(url);
    
    console.log('✅ Recent notifications fetched:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching recent notifications:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (
  id: string
): Promise<NotificationDto | null> => {
  try {
    console.log('🔔 Fetching notification by ID:', id);
    
    const response = await api.get<NotificationDto>(
      API_ENDPOINTS.NOTIFICATIONS.GET_BY_ID(id)
    );
    
    console.log('✅ Notification fetched:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching notification:', error);
    console.error('Error details:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  id: string
): Promise<boolean> => {
  try {
    console.log('✅ Marking notification as read:', id);
    
    const response = await api.put<MarkAsReadResponse>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id)
    );
    
    console.log('✅ Notification marked as read:', response);
    return true;
  } catch (error: any) {
    console.error('❌ Error marking notification as read:', error);
    console.error('Error details:', error.response?.data || error.message);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    console.log('✅ Marking all notifications as read...');
    
    const response = await api.put<MarkAsReadResponse>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ
    );
    
    console.log('✅ All notifications marked as read:', response);
    return true;
  } catch (error: any) {
    console.error('❌ Error marking all notifications as read:', error);
    console.error('Error details:', error.response?.data || error.message);
    return false;
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadNotificationsCount = async (): Promise<number> => {
  try {
    console.log('🔔 Fetching unread notifications count...');
    
    const response = await api.get<UnreadCountDto>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    
    console.log('✅ Unread count:', response.unreadCount);
    return response.unreadCount;
  } catch (error: any) {
    console.error('❌ Error fetching unread count:', error);
    console.error('Error details:', error.response?.data || error.message);
    return 0;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id: string): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting notification:', id);
    
    const response = await api.delete<DeleteNotificationResponse>(
      API_ENDPOINTS.NOTIFICATIONS.DELETE(id)
    );
    
    console.log('✅ Notification deleted:', response);
    return true;
  } catch (error: any) {
    console.error('❌ Error deleting notification:', error);
    console.error('Error details:', error.response?.data || error.message);
    return false;
  }
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting all notifications...');
    
    const response = await api.delete<DeleteNotificationResponse>(
      API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL
    );
    
    console.log('✅ All notifications deleted:', response);
    return true;
  } catch (error: any) {
    console.error('❌ Error deleting all notifications:', error);
    console.error('Error details:', error.response?.data || error.message);
    return false;
  }
};

/**
 * Create a test notification (for testing purposes)
 */
export const createTestNotification = async (): Promise<NotificationDto | null> => {
  try {
    console.log('🧪 Creating test notification...');
    
    const response = await api.post<NotificationResponse>(
      API_ENDPOINTS.NOTIFICATIONS.CREATE_TEST
    );
    
    console.log('✅ Test notification created:', response);
    return response.notification || null;
  } catch (error: any) {
    console.error('❌ Error creating test notification:', error);
    console.error('Error details:', error.response?.data || error.message);
    return null;
  }
};

// Export all functions as a default object for convenience
export default {
  getMyNotifications,
  getRecentNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  deleteNotification,
  deleteAllNotifications,
  createTestNotification,
};
