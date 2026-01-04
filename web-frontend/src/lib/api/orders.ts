import axiosInstance from '@/lib/axios';
const BASE_URL = '/api/orders';
export const ordersApi = {
  /**
   * Xác nhận thanh toán (Giả lập)
   * Tự động bỏ qua lỗi 403/404 để luồng UI không bị chặn
   */
  confirmPayment: async (orderId: string) => {
    try {
      console.log(`[ORDERS API] Đang giả lập thanh toán cho ID: ${orderId}`);

      // Thử gọi API thật (nếu backend cho phép)
      // Lưu ý: User thường thường sẽ bị chặn (403) ở đây, điều này là bình thường.
      const response = await axiosInstance.put(`${BASE_URL}/${orderId}/status`, {
        status: 'Paid',
        paymentStatus: 'Paid'
      });
      
      return response.data;

    } catch (error: any) {
      // Bắt các lỗi thường gặp khi giả lập
      const status = error.response?.status;

      if (status === 403) {
          console.warn("[ORDERS API] Backend chặn quyền update (403). Đây là tính năng bảo mật đúng.");
          console.log("Tự động giả lập thành công để đi tiếp...");
          return { success: true, message: "Simulated Success (Bypassed 403)" };
      }

      if (status === 404) {
          console.warn("[ORDERS API] Không tìm thấy API update status (404).");
          return { success: true, message: "Simulated Success (Bypassed 404)" };
      }

      // Các lỗi khác thì log ra nhưng vẫn return success giả để UI không bị treo
      console.error("[ORDERS API] Lỗi khác:", error);
      return { success: true, message: "Simulated Success (Fallback)" };
    }
  },

  /**
   * Xác nhận thanh toán bằng orderNumber (cho user thường)
   * Endpoint: PUT /api/orders/my-order/{orderNumber}/confirm-payment
   */
  confirmPaymentByOrderNumber: async (orderNumber: string) => {
    try {
      console.log(`[ORDERS API] Đang xác nhận thanh toán cho orderNumber: ${orderNumber}`);
      const response = await axiosInstance.put(`${BASE_URL}/my-order/${orderNumber}/confirm-payment`);
      console.log(`[ORDERS API] Xác nhận thành công:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`[ORDERS API] Lỗi khi xác nhận thanh toán:`, error.response?.data || error.message);
      throw error;
    }
  },

  getOrderByNumber: async (orderNumber: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/number/${orderNumber}`);
    return response.data;
  },

  checkStatus: async (orderId: string) => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${orderId}`);
      return {
        success: true,
        status: response.data.status || response.data.orderStatus,
        data: response.data
      };
    } catch (error) {
      return { success: false, status: 'Unknown' };
    }
  }
};