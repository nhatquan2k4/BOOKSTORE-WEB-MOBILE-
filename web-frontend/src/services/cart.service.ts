import axiosInstance, { handleApiError } from '@/lib/axios';
import { CartDto, CartItemDto, CreateCartDto, UpdateCartDto } from '@/types/dtos';

const CART_BASE_URL = '/api/cart';

export interface AddToCartDto {
  userId?: string;
  bookId: string;
  quantity: number;
}

export const cartService = {
  /**
   * Lấy giỏ hàng của người dùng hiện tại
   */
  async getMyCart(): Promise<CartDto | null> {
    try {
      const response = await axiosInstance.get<{ cart: CartDto | null }>(CART_BASE_URL);
      return response.data.cart;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy giỏ hàng theo ID
   */
  async getCartById(id: string): Promise<CartDto> {
    try {
      const response = await axiosInstance.get<CartDto>(`${CART_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy số lượng items trong giỏ hàng
   */
  async getCartItemCount(): Promise<number> {
    try {
      const response = await axiosInstance.get<{ itemCount: number }>(`${CART_BASE_URL}/count`);
      return response.data.itemCount;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy tổng tiền trong giỏ hàng
   */
  async getCartTotal(): Promise<number> {
    try {
      const response = await axiosInstance.get<{ totalAmount: number }>(`${CART_BASE_URL}/total`);
      return response.data.totalAmount;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Thêm sách vào giỏ hàng
   */
  async addToCart(dto: AddToCartDto): Promise<CartDto> {
    try {
      const response = await axiosInstance.post<CartDto>(`${CART_BASE_URL}/add`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật số lượng item trong giỏ hàng
   */
  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartDto> {
    try {
      const response = await axiosInstance.put<CartDto>(`${CART_BASE_URL}/update-quantity`, {
        cartItemId,
        quantity,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa item khỏi giỏ hàng
   */
  async removeCartItem(cartItemId: string): Promise<CartDto> {
    try {
      const response = await axiosInstance.delete<CartDto>(`${CART_BASE_URL}/remove/${cartItemId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa toàn bộ giỏ hàng
   */
  async clearCart(): Promise<void> {
    try {
      await axiosInstance.delete(`${CART_BASE_URL}/clear`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đồng bộ giỏ hàng từ local storage (khi đăng nhập)
   */
  async syncCart(items: { bookId: string; quantity: number }[]): Promise<CartDto> {
    try {
      const response = await axiosInstance.post<CartDto>(`${CART_BASE_URL}/sync`, { items });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
