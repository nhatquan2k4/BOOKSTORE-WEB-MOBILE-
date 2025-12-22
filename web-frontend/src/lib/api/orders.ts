import axiosInstance from '@/lib/axios';

export interface UpdateOrderStatusDto {
  orderId: string;
  status: string;
  note?: string;
}

export const ordersApi = {
  /**
   * Xác nhận thanh toán đơn hàng (Admin only - nhưng dùng cho test)
   */
  confirmPayment: async (orderNumber: string): Promise<any> => {
    try {
      console.log('[ORDERS API] Confirming payment for order:', orderNumber);
      
      // Encode orderNumber để tránh lỗi nếu mã có ký tự đặc biệt
      const safeOrderNumber = encodeURIComponent(orderNumber);
      
      // First, get the order to get its GUID
      const order = await ordersApi.getOrderByNumber(orderNumber);
      console.log('[ORDERS API] Order retrieved:', order);
      
      // Then confirm payment using the GUID
      const response = await axiosInstance.put(`/api/orders/${order.id}/confirm-payment`);
      
      console.log('[ORDERS API] Payment confirmed:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[ORDERS API] ❌ Confirm payment error:', error);
      throw new Error(error.response?.data?.message || 'Lỗi xác nhận thanh toán');
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  updateStatus: async (dto: UpdateOrderStatusDto): Promise<any> => {
    try {
      console.log('[ORDERS API] Updating order status:', dto);
      const response = await axiosInstance.put('/api/orders/status', dto);
      console.log('[ORDERS API] Status updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[ORDERS API] ❌ Update status error:', error);
      throw new Error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  },

  /**
   * Lấy thông tin đơn hàng bằng GUID
   */
  getOrder: async (orderId: string): Promise<any> => {
    try {
      const safeOrderId = encodeURIComponent(orderId);
      const response = await axiosInstance.get(`/api/orders/${safeOrderId}`);
      return response.data;
    } catch (error: any) {
      console.error('[ORDERS API] ❌ Get order error:', error);
      throw new Error(error.response?.data?.message || 'Lỗi lấy thông tin đơn hàng');
    }
  },

  /**
   * Lấy thông tin đơn hàng bằng Order Number (ORD-...)
   */
  getOrderByNumber: async (orderNumber: string): Promise<any> => {
    try {
      const safeOrderNumber = encodeURIComponent(orderNumber);
      const response = await axiosInstance.get(`/api/orders/order-number/${safeOrderNumber}`);
      return response.data;
    } catch (error: any) {
      console.error('[ORDERS API] ❌ Get order by number error:', error);
      throw new Error(error.response?.data?.message || 'Lỗi lấy thông tin đơn hàng');
    }
  },
};

export default ordersApi;
