// Payment API
import axiosInstance from '@/lib/axios';

// Types
export interface CreateQRRequest {
  orderId: string;
  amount: number;
  description?: string;
}

export interface CreateQRResponse {
  success: boolean;
  qrCodeUrl: string;
  orderId: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
}

export interface CheckPaymentStatusResponse {
  success: boolean;
  status: 'pending' | 'paid' | 'failed';
  transaction?: {
    id: string;
    amount: number;
    content: string;
    time: string;
  };
  message?: string;
}

/**
 * Payment API methods
 */
export const paymentApi = {
  /**
   * Create VietQR payment QR code from real backend
   */
  createQR: async (data: CreateQRRequest): Promise<CreateQRResponse> => {
    try {
      const response = await axiosInstance.post('/api/payment/qr', {
        orderId: data.orderId,
        amount: data.amount,
        description: data.description
      });
      
      return response.data;
    } catch (error: any) {
      console.error('QR creation error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.Message || error.response?.data?.message || 'Không thể tạo mã QR thanh toán');
    }
  },

  /**
   * Check payment status (placeholder - requires real backend)
   * TODO: Implement real payment verification when backend is ready
   */
  checkStatus: async (orderId: string): Promise<CheckPaymentStatusResponse> => {
    // TODO: Replace with real API call when backend is ready
    // For now, return pending status
    return {
      success: true,
      status: 'pending',
      message: 'Chức năng kiểm tra tự động chưa khả dụng',
    };
  },
};

export default paymentApi;
