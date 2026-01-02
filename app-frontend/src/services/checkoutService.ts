// Checkout Service - API calls for checkout process
import { api } from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import type {
  CheckoutAddress,
  CheckoutRequest,
  CheckoutResult,
  PaymentCallback,
} from '../types/checkout';

/**
 * Process checkout - create order and payment
 */
export const processCheckout = async (request: CheckoutRequest): Promise<CheckoutResult> => {
  try {
    const response = await api.post<any>(API_ENDPOINTS.CHECKOUT.PROCESS, request);
    
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
    const response = await api.post<any>(API_ENDPOINTS.CHECKOUT.PAYMENT_CALLBACK, callback);
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
    const response = await api.get<any>(API_ENDPOINTS.CHECKOUT.PAYMENT_STATUS(orderId));
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
    const response = await api.get<any>(API_ENDPOINTS.CHECKOUT.PREVIEW, {
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
