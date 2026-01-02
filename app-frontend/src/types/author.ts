// Author types

export interface Author {
  id: string;
  name: string;
  bio?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthorListResponse {
  items: Author[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface GetAuthorsParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}
