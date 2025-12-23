// Rental-specific DTOs
// DTO cho Gói thuê (Được tính toán từ Backend)
export interface RentalPlanDto {
  id: number;
  days: number;
  durationLabel: string;
  price: number;
  savingsPercentage: number;
  isPopular: boolean;
}

// DTO gửi đi để tạo đơn thuê
export interface CreateRentalOrderDto {
  bookId: string;
  days: number; // 3, 7, 30...
}

// DTO để tạo thuê sách
export interface CreateBookRentalDto {
  bookId: string;
  days: number; // Số ngày thuê: 3, 7, 30...
  paymentMethod?: string;
}

// DTO để gia hạn thuê sách
export interface RenewBookRentalDto {
  rentalId: string;
  additionalDays: number;
  paymentMethod?: string;
}

// DTO thông tin thuê sách
export interface BookRentalDto {
  id: string;
  bookId: string;
  bookTitle?: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: string; // Active, Returned, Overdue, etc.
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
}

// DTO nhận về sau khi tạo đơn
export interface OrderResponseDto {
  success: boolean;
  orderId: string;
  orderNumber: string;
  amount: number;
  message: string;
}