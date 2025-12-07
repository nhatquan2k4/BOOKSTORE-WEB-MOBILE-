// Checkout DTOs
export interface CheckoutRequestDto {
  userId: string;
  address: CreateOrderAddressDto;
  couponCode?: string;
  provider: string;
  paymentMethod: string;
  note?: string;
}

export interface CheckoutResultDto {
  success: boolean;
  message: string;
  order?: OrderDto;
  payment?: PaymentTransactionDto;
  paymentUrl?: string;
  qrCodeUrl?: string;
}

// Ordering DTOs
export interface OrderDto {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  couponCode?: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItemDto[];
  address: OrderAddressDto;
  statusLogs: OrderStatusLogDto[];
}

export interface OrderItemDto {
  id: string;
  orderId: string;
  bookId: string;
  bookTitle: string;
  bookISBN: string;
  bookImageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderAddressDto {
  id: string;
  orderId: string;
  recipientName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  note?: string;
}

export interface OrderStatusLogDto {
  id: string;
  orderId: string;
  fromStatus: string;
  toStatus: string;
  note?: string;
  changedBy: string;
  changedAt: string;
}

export interface CreateOrderDto {
  userId: string;
  items: CreateOrderItemDto[];
  address: CreateOrderAddressDto;
  couponId?: string;
  couponCode?: string;
}

export interface CreateOrderItemDto {
  bookId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderAddressDto {
  recipientName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  note?: string;
}

// Payment DTOs
export interface PaymentTransactionDto {
  id: string;
  orderId: string;
  orderNumber: string;
  provider: string;
  transactionCode: string;
  paymentMethod: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
}

export interface CreatePaymentDto {
  orderId: string;
  provider: string;
  paymentMethod: string;
  amount: number;
}

export interface UpdatePaymentStatusDto {
  paymentId: string;
  transactionCode: string;
  newStatus: string;
  paidAt?: string;
}

export interface PaymentCallbackDto {
  transactionCode: string;
  status: string;
  amount: number;
  paidAt: string;
  message?: string;
}
