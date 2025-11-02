// Common API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Pagination Params
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// Sort Params
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
