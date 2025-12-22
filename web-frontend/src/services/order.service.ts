import axiosInstance, { handleApiError, PagedResult } from '@/lib/axios';
import {
  OrderDto,
  CreateOrderDto,
  OrderItemDto,
  OrderStatusLogDto,
} from '@/types/dtos';

const ORDER_BASE_URL = '/api/orders';

export interface GetOrdersParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
}

export const orderService = {
  /**
   * Lấy tất cả đơn hàng (Admin only)
   */
  async getAllOrders(params: GetOrdersParams = {}): Promise<PagedResult<OrderDto>> {
    try {
      const response = await axiosInstance.get<PagedResult<OrderDto>>(ORDER_BASE_URL, {
        params: {
          pageNumber: params.pageNumber || 1,
          pageSize: params.pageSize || 10,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy chi tiết đơn hàng theo ID
   */
  async getOrderById(id: string): Promise<OrderDto> {
    try {
      const response = await axiosInstance.get<OrderDto>(`${ORDER_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy đơn hàng theo mã đơn hàng
   */
  async getOrderByOrderNumber(orderNumber: string): Promise<OrderDto> {
    try {
      const response = await axiosInstance.get<OrderDto>(`${ORDER_BASE_URL}/order-number/${orderNumber}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại
   */
  async getMyOrders(params: GetOrdersParams = {}): Promise<PagedResult<OrderDto>> {
    try {
      const response = await axiosInstance.get<PagedResult<OrderDto>>(`${ORDER_BASE_URL}/my-orders`, {
        params: {
          pageNumber: params.pageNumber || 1,
          pageSize: params.pageSize || 10,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách đơn hàng của một user (Admin only)
   */
  async getOrdersByUserId(userId: string, params: GetOrdersParams = {}): Promise<PagedResult<OrderDto>> {
    try {
      const response = await axiosInstance.get<PagedResult<OrderDto>>(`${ORDER_BASE_URL}/user/${userId}`, {
        params: {
          pageNumber: params.pageNumber || 1,
          pageSize: params.pageSize || 10,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo đơn hàng mới
   */
  async createOrder(dto: CreateOrderDto): Promise<OrderDto> {
    try {
      const response = await axiosInstance.post<OrderDto>(ORDER_BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng (Admin only)
   */
  async updateOrderStatus(id: string, status: string, note?: string): Promise<OrderDto> {
    try {
      const response = await axiosInstance.put<OrderDto>(`${ORDER_BASE_URL}/${id}/status`, {
        status,
        note,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(id: string, reason?: string): Promise<OrderDto> {
    try {
      const response = await axiosInstance.post<OrderDto>(`${ORDER_BASE_URL}/${id}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy lịch sử trạng thái đơn hàng
   */
  async getOrderStatusHistory(orderId: string): Promise<OrderStatusLogDto[]> {
    try {
      const response = await axiosInstance.get<OrderStatusLogDto[]>(
        `${ORDER_BASE_URL}/${orderId}/status-history`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xác nhận đã nhận hàng
   */
  async confirmReceived(orderId: string): Promise<OrderDto> {
    try {
      const response = await axiosInstance.post<OrderDto>(`${ORDER_BASE_URL}/${orderId}/confirm-received`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
