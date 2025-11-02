// Cart API
import api from './axios';
import { API_ENDPOINTS } from './endpoints';
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from '@/types/cart';

export const cartApi = {
  /**
   * Get cart by user ID
   */
  getByUserId: async (userId: string): Promise<Cart> => {
    return api.get(API_ENDPOINTS.CART.BY_USER(userId));
  },

  /**
   * Add item to cart
   */
  addItem: async (data: AddToCartRequest): Promise<Cart> => {
    return api.post(API_ENDPOINTS.CART.ADD_ITEM, data);
  },

  /**
   * Update cart item quantity
   */
  updateItem: async (id: string, data: UpdateCartItemRequest): Promise<Cart> => {
    return api.put(API_ENDPOINTS.CART.UPDATE_ITEM(id), data);
  },

  /**
   * Remove item from cart
   */
  removeItem: async (id: string): Promise<Cart> => {
    return api.delete(API_ENDPOINTS.CART.REMOVE_ITEM(id));
  },

  /**
   * Clear all items in cart
   */
  clear: async (userId: string): Promise<void> => {
    return api.delete(API_ENDPOINTS.CART.CLEAR(userId));
  },
};
