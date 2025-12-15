import axiosInstance, { handleApiError, PagedResult } from '@/lib/axios';

const PAYMENT_BASE_URL = '/api/Payment';

export interface PaymentParams {
  orderId?: string;
  provider?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreatePaymentDto {
  orderId: string;
  amount: number;
  provider: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface UpdatePaymentStatusDto {
  paymentId: string;
  status: string;
  transactionCode?: string;
  paidAt?: string;
}

export interface PaymentCallbackDto {
  transactionCode: string;
  amount: number;
  status: string;
  provider: string;
  metadata?: Record<string, string>;
}

export const paymentService = {
  /**
   * Lấy thông tin payment transaction theo ID
   */
  async getPaymentById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${PAYMENT_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy payment transaction theo order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${PAYMENT_BASE_URL}/order/${orderId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy payment theo transaction code
   */
  async getPaymentByTransactionCode(transactionCode: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${PAYMENT_BASE_URL}/transaction/${transactionCode}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy payments theo provider
   */
  async getPaymentsByProvider(provider: string, params?: PaymentParams): Promise<PagedResult<unknown>> {
    try {
      const response = await axiosInstance.get(`${PAYMENT_BASE_URL}/by-provider`, {
        params: { provider, ...params },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy payments theo status
   */
  async getPaymentsByStatus(status: string, params?: PaymentParams): Promise<PagedResult<unknown>> {
    try {
      const response = await axiosInstance.get(`${PAYMENT_BASE_URL}/by-status`, {
        params: { status, ...params },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo payment mới
   */
  async createPayment(dto: CreatePaymentDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(PAYMENT_BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo payment cho order
   */
  async createPaymentForOrder(orderId: string, dto: Omit<CreatePaymentDto, 'orderId'>): Promise<unknown> {
    try {
      const response = await axiosInstance.post(`${PAYMENT_BASE_URL}/for-order/${orderId}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật trạng thái payment
   */
  async updatePaymentStatus(dto: UpdatePaymentStatusDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${PAYMENT_BASE_URL}/status`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Payment callback từ payment gateway
   */
  async handlePaymentCallback(dto: PaymentCallbackDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(`${PAYMENT_BASE_URL}/callback`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đánh dấu payment thành công
   */
  async markPaymentSuccess(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${PAYMENT_BASE_URL}/${id}/mark-success`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Đánh dấu payment thất bại
   */
  async markPaymentFailed(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${PAYMENT_BASE_URL}/${id}/mark-failed`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách payments pending đã quá hạn
   */
  async getExpiredPendingPayments(): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${PAYMENT_BASE_URL}/expired-pending`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Hủy các payments đã quá hạn
   */
  async cancelExpiredPayments(): Promise<{ canceledCount: number }> {
    try {
      const response = await axiosInstance.post(`${PAYMENT_BASE_URL}/cancel-expired`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Thống kê payments theo provider
   */
  async getPaymentStatisticsByProvider(from?: string, to?: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${PAYMENT_BASE_URL}/statistics/by-provider`, {
        params: { from, to },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Kiểm tra trạng thái transaction
   */
  async checkTransactionStatus(transactionCode: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${PAYMENT_BASE_URL}/check-transaction/${transactionCode}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
