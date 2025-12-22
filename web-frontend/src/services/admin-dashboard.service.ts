import axiosInstance, { handleApiError } from '@/lib/axios';

const ADMIN_DASHBOARD_BASE_URL = '/api/admin/dashboard';

export interface RevenueParams {
  from?: string;
  to?: string;
}

export interface TopSellingParams {
  from?: string;
  to?: string;
  top?: number;
}

export const adminDashboardService = {
  /**
   * Lấy thống kê doanh thu
   */
  async getRevenue(params?: RevenueParams): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${ADMIN_DASHBOARD_BASE_URL}/revenue`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách sách bán chạy nhất
   */
  async getTopSellingBooks(params?: TopSellingParams): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${ADMIN_DASHBOARD_BASE_URL}/top-selling-books`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách sách được xem nhiều nhất
   */
  async getBookViews(params?: TopSellingParams): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${ADMIN_DASHBOARD_BASE_URL}/book-views`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy thống kê đơn hàng
   */
  async getOrderStats(params?: RevenueParams): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${ADMIN_DASHBOARD_BASE_URL}/order-stats`, { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy audit logs
   */
  async getAuditLogs(pageNumber: number = 1, pageSize: number = 20): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${ADMIN_DASHBOARD_BASE_URL}/audit-logs`, {
        params: { pageNumber, pageSize },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
