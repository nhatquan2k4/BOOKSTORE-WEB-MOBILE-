import apiClient from '../utils/apiClient';

export interface OrderStatus {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  status: string; // Pending, Confirmed, Shipping, Delivered, Cancelled
  totalAmount: number;
  finalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    bookTitle: string;
    quantity: number;
    unitPrice: number;
  }>;
  address: {
    recipientName: string;
    phoneNumber: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    note?: string;
  };
}

export interface UpdateOrderStatusDto {
  orderId: string;
  newStatus: string;
  note?: string;
}

const orderManagementService = {
  // Lấy tất cả đơn hàng (Admin)
  async getAllOrders(params?: { status?: string; pageNumber?: number; pageSize?: number }) {
    const response = await apiClient.get<{
      items: OrderStatus[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>('/orders', { params });
    return response.data;
  },

  // Lấy đơn hàng theo status
  async getOrdersByStatus(status: string, pageNumber: number = 1, pageSize: number = 10) {
    return this.getAllOrders({ status, pageNumber, pageSize });
  },

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(data: UpdateOrderStatusDto) {
    const response = await apiClient.put<OrderStatus>('/orders/status', data);
    return response.data;
  },

  // Xác nhận đơn hàng (Pending → Confirmed)
  async confirmOrder(orderId: string, note?: string) {
    return this.updateOrderStatus({
      orderId,
      newStatus: 'Confirmed',
      note: note || 'Đơn hàng đã được xác nhận bởi Admin'
    });
  },

  // Đánh dấu đang giao hàng (Confirmed → Shipping)
  async markAsShipping(orderId: string, note?: string) {
    return this.updateOrderStatus({
      orderId,
      newStatus: 'Shipping',
      note: note || 'Đơn hàng đang được giao'
    });
  },

  // Đánh dấu đã giao (Shipping → Delivered)
  async markAsDelivered(orderId: string, note?: string) {
    return this.updateOrderStatus({
      orderId,
      newStatus: 'Delivered',
      note: note || 'Đơn hàng đã được giao thành công'
    });
  },

  // Hủy đơn hàng
  async cancelOrder(orderId: string, reason: string) {
    const response = await apiClient.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  }
};

export default orderManagementService;
