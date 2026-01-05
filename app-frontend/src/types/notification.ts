/**
 * Notification Types
 * Types for notification system
 */

// Notification DTO từ backend
export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// Notification List DTO
export interface NotificationListDto {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// Create Notification DTO
export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}

// Unread Count DTO
export interface UnreadCountDto {
  unreadCount: number;
}

// Get User Notifications Response
export interface GetUserNotificationsResponse {
  items: NotificationListDto[];
  totalCount: number;
  unreadCount: number;
}

// Get Notifications Params
export interface GetNotificationsParams {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
}

// Notification Types (enum-like)
export type NotificationType = 'order' | 'payment' | 'promotion' | 'system' | 'test';

// API Response wrappers
export interface NotificationResponse {
  message: string;
  notification?: NotificationDto;
}

export interface DeleteNotificationResponse {
  message: string;
}

export interface MarkAsReadResponse {
  message: string;
}
