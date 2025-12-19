import axiosInstance, { handleApiError } from '@/lib/axios';
// Import DTO từ types chung của dự án
// Lưu ý: Đảm bảo file dtos.ts có các interface tương ứng
import { CartDto } from '@/types/dtos';

// Route chuẩn từ Controller: [Route("api/[controller]")] -> /api/cart
const CART_BASE_URL = '/api/cart';

// DTOs định nghĩa cục bộ hoặc import từ types/dtos
export interface AddToCartDto {
  bookId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  bookId: string; // Backend yêu cầu BookId, không phải CartItemId
  quantity: number;
}

export interface RemoveFromCartDto {
  bookId: string; // Backend yêu cầu BookId
}

export const cartService = {
  /**
   * Lấy giỏ hàng của người dùng hiện tại
   * URL: GET /api/cart
   */
  async getMyCart(): Promise<CartDto | null> {
    try {
      // Backend trả về trực tiếp object CartDto hoặc { Message, Cart: null }
      const response = await axiosInstance.get<CartDto | { Cart: CartDto | null }>(CART_BASE_URL);
      
      // Xử lý trường hợp trả về { Cart: ... }
      if ('Cart' in response.data) {
          return (response.data as any).Cart;
      }
      return response.data as CartDto;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy số lượng items trong giỏ hàng
   * URL: GET /api/cart/count
   */
  async getCartItemCount(): Promise<number> {
    try {
      const response = await axiosInstance.get<{ itemCount: number }>(`${CART_BASE_URL}/count`);
      // Backend trả về { ItemCount: ... } (PascalCase) hoặc { itemCount: ... }
      return (response.data as any).ItemCount ?? response.data.itemCount ?? 0;
    } catch (error) {
      return 0; // Trả về 0 thay vì throw lỗi để UI không bị crash
    }
  },

  /**
   * Thêm sách vào giỏ hàng
   * URL: POST /api/cart/add
   * Body: { bookId, quantity }
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
   * URL: PUT /api/cart/update-quantity
   * Body: { bookId, quantity } (LƯU Ý: Dùng BookId, không dùng CartItemId)
   */
  async updateCartItemQuantity(bookId: string, quantity: number): Promise<CartDto> {
    try {
      const response = await axiosInstance.put<CartDto>(`${CART_BASE_URL}/update-quantity`, {
        bookId, // Backend cần BookId để tìm item
        quantity,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa item khỏi giỏ hàng
   * URL: DELETE /api/cart/remove
   * Body: { bookId } (LƯU Ý: Axios delete cần config data body)
   */
  async removeCartItem(bookId: string): Promise<CartDto> {
    try {
      // Backend dùng [HttpDelete("remove")] với [FromBody] RemoveFromCartDto
      // Axios delete cú pháp: delete(url, { data: body })
      const response = await axiosInstance.delete<CartDto>(`${CART_BASE_URL}/remove`, {
        data: { bookId } 
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa toàn bộ giỏ hàng
   * URL: DELETE /api/cart/clear
   */
  async clearCart(): Promise<void> {
    try {
      await axiosInstance.delete(`${CART_BASE_URL}/clear`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Validate giỏ hàng trước khi thanh toán
   * URL: GET /api/cart/validate-checkout
   */
  async validateCheckout(): Promise<{ isValid: boolean; message: string }> {
    try {
      const response = await axiosInstance.get<{ isValid: boolean; message: string }>(`${CART_BASE_URL}/validate-checkout`);
      // Backend trả về PascalCase { IsValid, Message }
      return {
          isValid: (response.data as any).IsValid ?? response.data.isValid,
          message: (response.data as any).Message ?? response.data.message
      };
    } catch (error) {
      return { isValid: false, message: "Lỗi kiểm tra giỏ hàng" };
    }
  }
};