// Order types

export interface OrderAddress {
  recipientName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  note?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  bookId: string;
  bookTitle: string;
  bookIsbn: string;
  bookImageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  provider: string;
  transactionCode: string;
  paymentMethod: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  totalAmount: number;
  shippingFee?: number;
  discountAmount: number;
  finalAmount: number;
  address: OrderAddress;
  items: OrderItem[];
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  paymentTransaction?: PaymentTransaction;
  couponCode?: string | null;
  note?: string;
  cancelReason?: string;
}

export interface OrderListResponse {
  items: Order[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: string;
  note?: string;
  changedAt: string;
  changedBy?: string;
}

export interface CancelOrderRequest {
  reason: string;
}
