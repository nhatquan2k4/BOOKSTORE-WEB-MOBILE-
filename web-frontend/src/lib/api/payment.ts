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
      
      // Validate UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data.orderId)) {
        console.error('[PAYMENT API] Invalid UUID:', data.orderId);
        throw new Error('OrderId phải là UUID hợp lệ');
      }

      console.log('[PAYMENT API] UUID validation passed');
      console.log('[PAYMENT API] Sending request to /api/payment/qr');

      const response = await axiosInstance.post('/api/payment/qr', {
        orderId: data.orderId,
        amount: Number(data.amount),
        description: data.description
      });
      
      console.log('[PAYMENT API] Response received:', response);
      console.log('[PAYMENT API] Response data:', response.data);
      console.log('[PAYMENT API] Response status:', response.status);
      
      return response.data;
    } catch (error: any) {
      console.error('[PAYMENT API] ❌ QR creation error:', error);
      console.error('[PAYMENT API] Error response:', error.response);
      console.error('[PAYMENT API] Error data:', error.response?.data);
      console.error('[PAYMENT API] Error status:', error.response?.status);
      console.error('[PAYMENT API] Error message:', error.message);
      throw new Error(error.response?.data?.message || 'Lỗi tạo mã QR');
    }
  },

  checkStatus: async (orderId: string): Promise<CheckPaymentStatusResponse> => {
    try {
      const response = await axiosInstance.get(`/api/payment/status/${orderId}`);
      
      // Chuẩn hóa status về lowercase để dễ so sánh
      const status = response.data.status?.toLowerCase() || 'pending';
      
      return {
        success: true,
        status: status,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Check status error:', error);
      
      // --- DEV MODE ONLY: GIẢ LẬP THANH TOÁN THÀNH CÔNG ---
      // Nếu bạn đang chạy localhost và muốn test luồng success mà không cần webhook
      // Hãy bỏ comment dòng dưới đây để giả lập là đã thanh toán sau khi gọi API lỗi
      
      // return { success: true, status: 'paid', message: 'Giả lập thành công' }; 

      return {
        success: false,
        status: 'pending',
        message: 'Đang chờ thanh toán...',
      };
    }
  },
};

export default paymentApi;