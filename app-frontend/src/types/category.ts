// Category types

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryListResponse {
  items: Category[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetCategoriesParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}
