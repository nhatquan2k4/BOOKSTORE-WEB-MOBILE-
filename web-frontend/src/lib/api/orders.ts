// Orders API
import api from './axios';
import { API_ENDPOINTS } from './endpoints';
import type { Order, PlaceOrderRequest, PlaceOrderResponse } from '@/types/order';

export const ordersApi = {
  /**
   * Place a new order
   */
  placeOrder: async (data: PlaceOrderRequest): Promise<PlaceOrderResponse> => {
    return api.post(API_ENDPOINTS.ORDERS.BASE, data);
  },

  /**
   * Get order by ID
   */
  getById: async (id: string): Promise<Order> => {
    return api.get(API_ENDPOINTS.ORDERS.BY_ID(id));
  },

  /**
   * Get all orders by user ID
   */
  getByUserId: async (userId: string): Promise<Order[]> => {
    return api.get(API_ENDPOINTS.ORDERS.BY_USER(userId));
  },

  /**
   * Cancel an order
   */
  cancel: async (id: string): Promise<Order> => {
    return api.patch(API_ENDPOINTS.ORDERS.CANCEL(id));
  },
};
