// Analytics DTOs
export interface OrderStatsDto {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface RevenueDto {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface TopSellingBookDto {
  bookId: string;
  bookTitle: string;
  bookISBN: string;
  bookImageUrl?: string;
  totalSold: number;
  revenue: number;
}

export interface TopViewedBookDto {
  bookId: string;
  bookTitle: string;
  bookISBN: string;
  bookImageUrl?: string;
  viewCount: number;
}
