import axiosInstance, { handleApiError } from '@/lib/axios';
import { OrderDto, CreateRentalOrderDto, OrderResponseDto } from '@/types/dtos';

const BASE_URL = '/api/orders';

export const orderService = {
  /**
   * Lấy danh sách đơn hàng của tôi
   */
  async getMyOrders(params: { status?: string; pageNumber?: number; pageSize?: number; type?: string }) {
    try {
      const queryParams: any = {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
      };

      if (params.status && params.status !== 'all') {
        queryParams.status = params.status;
      }
      
      if (params.type) {
        queryParams.type = params.type;
      }

      const response = await axiosInstance.get<{ 
        items: OrderDto[], 
        totalCount: number, 
        pageNumber: number, 
        totalPages: number 
      }>(`${BASE_URL}/my-orders`, { params: queryParams });
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy chi tiết đơn hàng
   */
  async getOrderById(id: string) {
    try {
      const response = await axiosInstance.get<OrderDto>(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(id: string, reason: string = "") {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * --- TẠO ĐƠN HÀNG THƯỜNG (MUA SÁCH) ---
   * Dùng cho trang Checkout
   */
  async createOrder(data: any): Promise<OrderDto> {
    try {
      console.log('[ORDER SERVICE] Calling POST /api/orders with data:', JSON.stringify(data, null, 2));
      console.log('[ORDER SERVICE] Full URL:', `${BASE_URL}`);
      
      // POST /api/orders
      const response = await axiosInstance.post<OrderDto>(`${BASE_URL}`, data);
      
      console.log('[ORDER SERVICE] Success! Response:', response);
      console.log('[ORDER SERVICE] Response data:', response.data);
      console.log('[ORDER SERVICE] Response status:', response.status);
      
      return response.data;
    } catch (error) {
      console.error('[ORDER SERVICE] Error caught:', error);
      if (error && typeof error === 'object') {
        console.error('[ORDER SERVICE] Error details:', {
          message: (error as any).message,
          response: (error as any).response,
          request: (error as any).request,
          config: (error as any).config
        });
      }
      return handleApiError(error);
    }
  },

  /**
   * --- Tạo đơn thuê sách ---
   */
  async createRentalOrder(data: CreateRentalOrderDto): Promise<OrderResponseDto> {
    try {
      const response = await axiosInstance.post<OrderResponseDto>(`${BASE_URL}/rental`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * --- Tạo đơn hàng từ giỏ hàng (Legacy - nếu backend hỗ trợ endpoint riêng) ---
   */
  async createOrderFromCart(data: { 
    address: {
      recipientName: string;
      recipientPhone: string;
      street: string;
      city: string;
      district?: string;
      ward?: string;
      note?: string;
    };
    couponId?: string;
  }) {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/from-cart`, {
        address: data.address,
        couponId: data.couponId || null
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
};