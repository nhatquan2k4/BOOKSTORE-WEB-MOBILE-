import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/notifications';

export const notificationService = {
  async getMyNotifications(page = 1, pageSize = 10) {
    try {
      // Backend Route: [HttpGet("my")] -> /api/notifications/my
      const response = await axiosInstance.get(`${BASE_URL}/my`, {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      // Trả về dữ liệu rỗng thay vì ném lỗi để không làm crash trang web
      console.error("Lỗi lấy thông báo:", error);
      return { items: [], totalCount: 0, unreadCount: 0 }; 
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
  }
};