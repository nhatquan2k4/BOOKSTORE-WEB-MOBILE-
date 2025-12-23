import apiClient from './apiClient';

export interface OrderAddress {
  recipientName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  note?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  bookId: string;
  bookTitle: string;
  bookIsbn: string;
  bookImageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  provider: string;
  transactionCode: string;
  paymentMethod: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  totalAmount: number;
  shippingFee?: number;
  discountAmount: number;
  finalAmount: number;
  address: OrderAddress;
  items: OrderItem[];
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  paymentTransaction?: PaymentTransaction;
  couponCode?: string | null;
  note?: string;
  cancelReason?: string;
}

export interface OrderListResponse {
  items: Order[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: string;
  note?: string;
  changedAt: string;
  changedBy?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

const orderService = {
  // Get my orders with pagination and filtering
  async getMyOrders(params?: {
    status?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<OrderListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    return await apiClient.get(`/api/orders/my-orders?${queryParams.toString()}`);
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order> {
    return await apiClient.get(`/api/orders/${orderId}`);
  },

  // Get order by order number
  async getOrderByOrderNumber(orderNumber: string): Promise<Order> {
    return await apiClient.get(`/api/orders/order-number/${orderNumber}`);
  },

  // Get order status history
  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return await apiClient.get(`/api/orders/${orderId}/status-history`);
  },

  // Cancel order
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    return await apiClient.put(`/api/orders/${orderId}/cancel`, { reason });
  },

  // Check if order can be cancelled
  async canCancelOrder(orderId: string): Promise<boolean> {
    try {
      // If we can get order details and status is Pending or Confirmed, can cancel
      const order = await this.getOrderById(orderId);
      return ['Pending', 'Confirmed', 'Processing'].includes(order.status);
    } catch (error) {
      return false;
    }
  },

  // Create rental order (for book rental feature)
  async createRentalOrder(bookId: string, days: number): Promise<{
    success: boolean;
    orderId: string;
    orderNumber: string;
    amount: number;
    message: string;
  }> {
    return await apiClient.post('/api/orders/rental', {
      bookId,
      days,
    });
  },
};

export default orderService;
