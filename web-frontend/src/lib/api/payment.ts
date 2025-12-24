import axiosInstance from '@/lib/axios';

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
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  message?: string;
}

export const paymentApi = {
  createQR: async (data: CreateQRRequest): Promise<CreateQRResponse> => {
    try {
      console.log('[PAYMENT API] Creating QR with data:', data);
      
      // --- ĐÃ XÓA ĐOẠN VALIDATE UUID ĐỂ CHẤP NHẬN MÃ ORD-... ---

      console.log('[PAYMENT API] Sending request to /api/payment/qr');

      const response = await axiosInstance.post('/api/payment/qr', {
        orderId: data.orderId,
        amount: Number(data.amount),
        description: data.description
      });
      
      console.log('[PAYMENT API] Response received:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('[PAYMENT API] ❌ QR creation error:', error);
      throw new Error(error.response?.data?.message || 'Lỗi tạo mã QR');
    }
  },

  checkStatus: async (orderId: string): Promise<CheckPaymentStatusResponse> => {
    try {
      // Encode orderId để tránh lỗi nếu mã có ký tự đặc biệt
      const safeOrderId = encodeURIComponent(orderId);
      const response = await axiosInstance.get(`/api/payment/status/${safeOrderId}`);
      
      const status = response.data.status?.toLowerCase() || 'pending';
      
      return {
        success: true,
        status: status,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Check status error:', error);
      return {
        success: false,
        status: 'pending',
        message: 'Đang chờ thanh toán...',
      };
    }
  },
};

export default paymentApi;