import axiosInstance, { handleApiError } from '@/lib/axios';
import { OrderDto } from '@/types/dtos';

// Route chuẩn dựa trên OrdersController bạn đã gửi
const BASE_URL = '/api/orders'; 

export const orderService = {
  /**
   * Lấy danh sách đơn hàng của tôi
   * URL: GET /api/orders/my-orders
   */
  async getMyOrders(params: { status?: string; pageNumber?: number; pageSize?: number; type?: string }) {
    try {
      // Logic xử lý param: Nếu status là 'all' hoặc rỗng thì xóa đi để Backend lấy tất cả
      const queryParams: any = {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
      };

      if (params.status && params.status !== 'all') {
        queryParams.status = params.status;
      }
      
      // Nếu sau này backend hỗ trợ lọc type (Physical/Digital) thì dùng dòng này
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
  }
};