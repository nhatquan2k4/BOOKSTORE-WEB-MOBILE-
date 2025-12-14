// Rental DTOs
export interface BookRentalDto {
  id: string;
  userId: string;
  userEmail: string;
  bookId: string;
  bookTitle: string;
  bookISBN?: string;
  bookCoverImage?: string;
  rentalPlanId: string;
  rentalPlanName: string;
  durationDays: number;
  price: number;
  startDate: string;
  endDate: string;
  isReturned: boolean;
  isRenewed: boolean;
  status: string;
  daysRemaining: number;
  isExpired: boolean;
  canRead: boolean;
}

export interface RentalPlanDto {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  description?: string;
}

export interface CreateBookRentalDto {
  userId: string;
  bookId: string;
  rentalPlanId: string;
}

export interface EbookAccessDto {
  bookId: string;
  userId: string;
  hasAccess: boolean;
  expiresAt?: string;
}
