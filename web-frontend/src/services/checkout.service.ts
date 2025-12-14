import axiosInstance, { handleApiError } from '@/lib/axios';
import {
  CheckoutRequestDto,
  CheckoutResultDto,
  PaymentTransactionDto,
  CreatePaymentDto,
  UpdatePaymentStatusDto,
  PaymentCallbackDto,
} from '@/types/dtos';

const CHECKOUT_BASE_URL = '/api/checkout';
const PAYMENT_BASE_URL = '/api/payment';

export const checkoutService = {
  /**
   * Preview checkout - Xem trước thông tin thanh toán
   */
  async previewCheckout(dto: CheckoutRequestDto): Promise<CheckoutResultDto> {
    try {
      const response = await axiosInstance.post<CheckoutResultDto>(`${CHECKOUT_BASE_URL}/preview`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tiến hành checkout và tạo đơn hàng
   */
  async checkout(dto: CheckoutRequestDto): Promise<CheckoutResultDto> {
    try {
      const response = await axiosInstance.post<CheckoutResultDto>(CHECKOUT_BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Validate coupon code
   */
  async validateCoupon(couponCode: string, totalAmount: number): Promise<{ isValid: boolean; discount: number; message: string }> {
    try {
      const response = await axiosInstance.post<{ isValid: boolean; discount: number; message: string }>(
        `${CHECKOUT_BASE_URL}/validate-coupon`,
        { couponCode, totalAmount }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Payment service for checkout flow
export const checkoutPaymentService = {
  /**
   * Lấy thông tin giao dịch thanh toán
   */
  async getPaymentTransaction(id: string): Promise<PaymentTransactionDto> {
    try {
      const response = await axiosInstance.get<PaymentTransactionDto>(`${PAYMENT_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy giao dịch thanh toán theo orderId
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentTransactionDto> {
    try {
      const response = await axiosInstance.get<PaymentTransactionDto>(`${PAYMENT_BASE_URL}/order/${orderId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo giao dịch thanh toán mới
   */
  async createPayment(dto: CreatePaymentDto): Promise<PaymentTransactionDto> {
    try {
      const response = await axiosInstance.post<PaymentTransactionDto>(PAYMENT_BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật trạng thái thanh toán
   */
  async updatePaymentStatus(dto: UpdatePaymentStatusDto): Promise<PaymentTransactionDto> {
    try {
      const response = await axiosInstance.put<PaymentTransactionDto>(`${PAYMENT_BASE_URL}/status`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xử lý callback từ payment gateway
   */
  async handlePaymentCallback(dto: PaymentCallbackDto): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post<{ success: boolean; message: string }>(
        `${PAYMENT_BASE_URL}/callback`,
        dto
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Verify payment status
   */
  async verifyPayment(transactionCode: string): Promise<{ isPaid: boolean; status: string }> {
    try {
      const response = await axiosInstance.get<{ isPaid: boolean; status: string }>(
        `${PAYMENT_BASE_URL}/verify/${transactionCode}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
