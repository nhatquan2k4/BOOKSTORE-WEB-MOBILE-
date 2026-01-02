import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import type {
  OrderAddress,
  OrderItem,
  PaymentTransaction,
  Order,
  OrderListResponse,
  OrderStatusHistory,
  CancelOrderRequest,
} from '../types/order';

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

    return await apiClient.get(`${API_ENDPOINTS.ORDERS.MY_ORDERS}?${queryParams.toString()}`);
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order> {
    return await apiClient.get(API_ENDPOINTS.ORDERS.GET_BY_ID(orderId));
  },

  // Get order by order number
  async getOrderByOrderNumber(orderNumber: string): Promise<Order> {
    return await apiClient.get(API_ENDPOINTS.ORDERS.GET_BY_ORDER_NUMBER(orderNumber));
  },

  // Get order status history
  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return await apiClient.get(API_ENDPOINTS.ORDERS.STATUS_HISTORY(orderId));
  },

  // Cancel order
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    return await apiClient.put(API_ENDPOINTS.ORDERS.CANCEL(orderId), { reason });
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
    return await apiClient.post(API_ENDPOINTS.ORDERS.CREATE_RENTAL, {
      bookId,
      days,
    });
  },
};

export default orderService;
