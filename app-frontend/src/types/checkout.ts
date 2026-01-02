// Checkout types

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
