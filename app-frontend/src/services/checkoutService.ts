// Checkout Service - API calls for checkout process
import { api } from './apiClient';

export interface CheckoutAddress {
  recipientName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  note?: string;
}

export interface CheckoutRequest {
  userId?: string; // Will be set by backend
  address: CheckoutAddress;
  couponCode?: string;
  paymentMethod: string; // "Online" or "COD"
  provider?: string; // "VietQR", etc
  note?: string;
}

export interface CheckoutResult {
  success: boolean;
  message: string;
  orderId?: string;
  orderCode?: string;
  totalAmount?: number;
  paymentInfo?: {
    qrCodeUrl?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    transferContent?: string;
    amount?: number;
  };
}

export interface PaymentCallback {
  transactionCode: string;
  orderId: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED';
  message?: string;
}

/**
 * Process checkout - create order and payment
 */
export const processCheckout = async (request: CheckoutRequest): Promise<CheckoutResult> => {
  try {
    const response = await api.post<any>('/api/Checkout/process', request);
    
    console.log('🔄 Processing checkout response...');
    
    // Backend returns: { success, order, payment, qrCodeUrl, paymentUrl }
    // Frontend expects: { success, orderId, orderCode, paymentInfo }
    
    let backendResponse = response;
    if (response?.data && !response?.success) {
      backendResponse = response.data;
    }
    
    // Transform backend response to frontend format
    const result: CheckoutResult = {
      success: backendResponse.success || false,
      message: backendResponse.message || '',
      orderId: backendResponse.order?.id,
      orderCode: backendResponse.order?.orderNumber,
      totalAmount: backendResponse.order?.finalAmount,
    };
    
    // Map payment info if exists (for Online payment)
    if (backendResponse.qrCodeUrl || backendResponse.payment) {
      result.paymentInfo = {
        qrCodeUrl: backendResponse.qrCodeUrl,
        bankName: 'VietQR',
        accountNumber: '1234567890',
        accountName: 'BOOKSTORE SYSTEM',
        transferContent: backendResponse.payment?.transactionCode || 'Thanh toan don hang',
        amount: backendResponse.payment?.amount || backendResponse.order?.finalAmount,
      };
    }
    
    console.log('✅ Transformed result:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error: any) {
    console.error('Error processing checkout:', error);
    throw error;
  }
};

/**
 * Handle payment callback (simulate successful payment)
 */
export const handlePaymentCallback = async (callback: PaymentCallback): Promise<any> => {
  try {
    const response = await api.post<any>('/api/Checkout/payment-callback', callback);
    return response;
  } catch (error: any) {
    console.error('Error handling payment callback:', error);
    throw error;
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (orderId: string): Promise<any> => {
  try {
    const response = await api.get<any>(`/api/Checkout/payment-status/${orderId}`);
    return response;
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};

/**
 * Get checkout preview
 */
export const getCheckoutPreview = async (couponCode?: string): Promise<any> => {
  try {
    const response = await api.get<any>('/api/Checkout/preview', {
      params: { couponCode }
    });
    return response;
  } catch (error: any) {
    console.error('Error getting checkout preview:', error);
    throw error;
  }
};

const checkoutService = {
  processCheckout,
  handlePaymentCallback,
  getPaymentStatus,
  getCheckoutPreview,
};

export default checkoutService;
