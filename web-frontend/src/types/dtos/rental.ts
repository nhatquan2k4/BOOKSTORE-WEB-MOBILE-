// Thêm vào cuối file src/types/dtos.ts

export interface CreateBookRentalDto {
  bookId: string;
  rentalPlanId: string;
  paymentTransactionCode?: string;
}

export interface RenewBookRentalDto {
  rentalPlanId: string;
  paymentTransactionCode?: string;
}

// Giả định BookRentalDto trả về từ Backend
export interface BookRentalDto {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookCover?: string;
  rentalPlanId: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: string; // 'Active', 'Expired', 'Returned', etc.
  returnedDate?: string;
  isOverdue: boolean;
}