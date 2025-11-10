// Payment API

// Types
export interface CreateQRRequest {
  amount: number;
  orderId: string;
  type: 'rent' | 'buy';
  bookId?: string;
  planId?: string;
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
   * Create VietQR payment QR code
   */
  createQR: async (data: CreateQRRequest): Promise<CreateQRResponse> => {
    const response = await fetch('/api/payment/vietqr/create-qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Không thể tạo mã QR');
    }

    return response.json();
  },

  /**
   * Check payment status (placeholder - requires real backend)
   * TODO: Implement real payment verification when backend is ready
   */
  checkStatus: async (): Promise<CheckPaymentStatusResponse> => {
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
