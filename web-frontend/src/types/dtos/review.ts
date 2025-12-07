// Review DTOs
export interface ReviewDto {
  id: string;
  userId: string;
  userName: string;
  bookId: string;
  bookTitle: string;
  orderId?: string;
  rating: number;
  title?: string;
  content: string;
  status: string;
  isVerifiedPurchase: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
}

export interface ReviewListDto {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  content: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface CreateReviewDto {
  rating: number;
  title?: string;
  content: string;
}

export interface UpdateReviewDto {
  rating: number;
  title?: string;
  content: string;
}

export interface QuickRatingDto {
  rating: number;
}

export interface UpdateReviewStatusDto {
  reason?: string;
}

export interface ReviewStatisticsDto {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}
