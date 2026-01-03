import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/notifications';

export const notificationService = {
  async getMyNotifications(page = 1, pageSize = 10, isRead?: boolean) {
    try {
      // Backend Route: [HttpGet("my")] -> /api/notifications/my
      const params: any = { page, pageSize };
      if (isRead !== undefined) {
        params.isRead = isRead;
      }
      const response = await axiosInstance.get(`${BASE_URL}/my`, { params });
      return response.data;
    } catch (error) {
      // Trả về dữ liệu rỗng thay vì ném lỗi để không làm crash trang web
      console.error("Lỗi lấy thông báo:", error);
      return { items: [], totalCount: 0 }; 
    }
  },

  async getRecentNotifications(count = 5) {
    try {
      // Backend Route: [HttpGet("recent")] -> /api/notifications/recent
      const response = await axiosInstance.get(`${BASE_URL}/recent`, {
        params: { count }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy thông báo gần nhất:", error);
      return [];
    }
  },

  async getNotificationById(id: string) {
    try {
      // Backend Route: [HttpGet("{id}")] -> /api/notifications/{id}
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy chi tiết thông báo:", error);
      return null;
    }
  },

  async getUnreadCount() {
    try {
      // Backend Route: [HttpGet("unread-count")] -> /api/notifications/unread-count
      const response = await axiosInstance.get(`${BASE_URL}/unread-count`);
      return response.data; // { unreadCount: number }
    } catch (error) {
      console.error("Lỗi lấy số thông báo chưa đọc:", error);
      return { unreadCount: 0 };
    }
  },

  async markAsRead(id: string) {
    try {
      await axiosInstance.put(`${BASE_URL}/${id}/read`);
      return true;
    } catch (error) {
      return false;
    }
  },

  async markAllAsRead() {
    try {
      await axiosInstance.put(`${BASE_URL}/read-all`);
      return true;
    } catch (error) {
      return false;
    }
  },

  async deleteNotification(id: string) {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
      return true;
    } catch (error) {
      console.error("Lỗi xóa thông báo:", error);
      return false;
    }
  },

  async deleteAllNotifications() {
    try {
      await axiosInstance.delete(`${BASE_URL}/delete-all`);
      return true;
    } catch (error) {
      console.error("Lỗi xóa tất cả thông báo:", error);
      return false;
    }
  }
};