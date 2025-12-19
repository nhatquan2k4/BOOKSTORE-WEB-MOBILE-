// src/types/dtos.ts

// --- COMMON ---
export interface PagedResult<T> {
  items?: T[]; // Một số backend trả về 'items', số khác trả về trực tiếp data trong 'data'
  comments?: T[]; // Controller của bạn trả về { comments: [], pagination: {} }
  reviews?: T[];  // Controller của bạn trả về { reviews: [], pagination: {} }
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// --- REVIEW DTOs ---
export interface ReviewListDto {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewDto extends ReviewListDto {
  bookId?: string;
  status?: string;
  isEdited?: boolean;
  updatedAt?: string;
  approvedAt?: string;
}

export interface CreateReviewDto {
  rating: number;
  title: string;
  content: string;
}

export interface UpdateReviewDto {
  rating: number;
  title: string;
  content: string;
}

export interface ReviewStatisticsDto {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

// --- COMMENT DTOs ---
export interface CommentDto {
  id: string;
  userId: string;
  userName: string; // Map từ User.FullName
  content: string;
  parentCommentId?: string | null;
  replyCount?: number;
  isEdited?: boolean;
  createdAt: string;
  replies?: CommentDto[]; // Frontend tự xử lý hiển thị cây
}

export interface CreateCommentDto {
  content: string;
  parentCommentId?: string | null;
}