import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/Shipments';

export interface CreateShipmentDto {
  orderId: string;
  shipperId: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
}

export interface UpdateShipmentDto {
  status?: 'Pending' | 'InTransit' | 'Delivered' | 'Cancelled' | 'Failed';
  actualDeliveryDate?: string;
  notes?: string;
  shipperId?: string;
}

export const shipmentsService = {
  /**
   * Lấy tất cả shipments
   */
  async getAllShipments(params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(BASE_URL, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo shipment mới
   */
  async createShipment(dto: CreateShipmentDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy shipment theo ID
   */
  async getShipmentById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật shipment
   */
  async updateShipment(id: string, dto: UpdateShipmentDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa shipment
   */
  async deleteShipment(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy shipments theo order
   */
  async getShipmentsByOrder(orderId: string): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/order/${orderId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy shipments theo shipper
   */
  async getShipmentsByShipper(shipperId: string, params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/shipper/${shipperId}`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy shipments theo trạng thái
   */
  async getShipmentsByStatus(status: string, params?: { page?: number; pageSize?: number }): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/status/${status}`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Track shipment theo tracking number
   */
  async trackShipment(trackingNumber: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/track/${trackingNumber}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật trạng thái shipment
   */
  async updateShipmentStatus(id: string, status: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đánh dấu shipment đã giao
   */
  async markAsDelivered(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}/delivered`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Hủy shipment
   */
  async cancelShipment(id: string, reason?: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy lịch sử shipment
   */
  async getShipmentHistory(id: string): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}/history`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
