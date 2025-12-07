import axiosInstance, { handleApiError } from '@/lib/axios';
import { NotificationDto, CreateNotificationDto, NotificationListDto, UnreadCountDto } from '@/types/dtos';

const NOTIFICATION_BASE_URL = '/api/notifications';

export const notificationService = {
  /**
   * Lấy danh sách thông báo của user hiện tại
   */
  async getMyNotifications(pageNumber: number = 1, pageSize: number = 20): Promise<{ items: NotificationListDto[]; totalCount: number }> {
    try {
      const response = await axiosInstance.get<{ items: NotificationListDto[]; totalCount: number }>(
        NOTIFICATION_BASE_URL,
        { params: { pageNumber, pageSize } }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await axiosInstance.get<UnreadCountDto>(`${NOTIFICATION_BASE_URL}/unread-count`);
      return response.data.unreadCount;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đánh dấu đã đọc một thông báo
   */
  async markAsRead(id: string): Promise<void> {
    try {
      await axiosInstance.put(`${NOTIFICATION_BASE_URL}/${id}/read`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đánh dấu tất cả đã đọc
   */
  async markAllAsRead(): Promise<void> {
    try {
      await axiosInstance.put(`${NOTIFICATION_BASE_URL}/read-all`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa thông báo
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${NOTIFICATION_BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa tất cả thông báo đã đọc
   */
  async deleteAllRead(): Promise<void> {
    try {
      await axiosInstance.delete(`${NOTIFICATION_BASE_URL}/read`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};
