// Order Types
import type { Book } from './book';

export interface Order {
  id: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  orderNumber: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
  cancelledAt?: string;

  // Relations
  items: OrderItem[];
  address: OrderAddress;
  paymentTransaction?: PaymentTransaction;
  couponId?: string;
  coupon?: Coupon;
}

export type OrderStatus =
  | "PendingPayment"
  | "Paid"
  | "Processing"
  | "Shipped"
  | "Completed"
  | "Cancelled"
  | "Refunded";

export interface OrderItem {
  id: string;
  orderId: string;
  bookId: string;
  book?: Book;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderAddress {
  id: string;
  orderId: string;
  recipientName: string;
  phoneNumber: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  transactionCode: string;
  paymentMethod: string;
  qrCodeUrl?: string;
  requestedAt: string;
  processedAt?: string;
}

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Cancelled";

export interface Coupon {
  id: string;
  code: string;
  discountValue: number;
  discountType: "Percentage" | "FixedAmount";
  minOrderAmount: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
}

// API Types
export interface PlaceOrderRequest {
  userId: string;
  items: Array<{
    bookId: string;
    quantity: number;
  }>;
  shippingAddress: Omit<OrderAddress, "id" | "orderId">;
  couponCode?: string;
}

export interface PlaceOrderResponse {
  order: Order;
  qrCodeUrl: string;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
}
