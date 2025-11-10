// Rental Types (eBook)
import type { Book } from './book';

export interface Rental {
  id: string;
  userId: string;
  bookId: string;
  book?: Book;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  price: number;
  returnedAt?: string;
}

export type RentalStatus = "Active" | "Expired" | "Returned" | "Cancelled";

export interface RentalPeriod {
  id: string;
  name: string; // "1 tháng", "3 tháng", "6 tháng", "1 năm"
  months: number;
  price: number;
  discountPercent?: number;
}

// API Request Types
export interface CreateRentalRequest {
  userId: string;
  bookId: string;
  periodId: string;
}
