// Catalog DTOs - Books, Authors, Publishers, Categories, Book Images

// Book DTOs
export interface BookDto {
  id: string;
  title: string;
  isbn: string;
  publicationYear: number;
  language: string;
  pageCount: number;
  isAvailable: boolean;
  publisherId: string;
  publisherName: string;
  bookFormatId?: string;
  bookFormatName?: string;
  authorNames: string[];
  categoryNames: string[];
  currentPrice?: number;
  discountPrice?: number;
  stockQuantity?: number;
  averageRating?: number;
  totalReviews: number;
}

export interface BookDetailDto {
  id: string;
  title: string;
  isbn: string;
  description?: string;
  publicationYear: number;
  language: string;
  edition?: string;
  pageCount: number;
  isAvailable: boolean;
  publisher: PublisherDto;
  bookFormat?: BookFormatDto;
  authors: AuthorDto[];
  categories: CategoryDto[];
  images: BookImageDto[];
  files: BookFileDto[];
  metadata: BookMetadataDto[];
}

export interface CreateBookDto {
  title: string;
  isbn: string;
  description?: string;
  publicationYear: number;
  language: string;
  edition?: string;
  pageCount: number;
  isAvailable: boolean;
  publisherId: string;
  bookFormatId?: string;
  authorIds: string[];
  categoryIds: string[];
}

export interface UpdateBookDto {
  id: string;
  title: string;
  isbn: string;
  description?: string;
  publicationYear: number;
  language: string;
  edition?: string;
  pageCount: number;
  isAvailable: boolean;
  publisherId: string;
  bookFormatId?: string;
  authorIds: string[];
  categoryIds: string[];
}

export interface BookFormatDto {
  id: string;
  formatType: string;
  description?: string;
}

export interface BookFileDto {
  id: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  isPreview: boolean;
  bookId: string;
  book?: BookDto;
}

export interface BookMetadataDto {
  id: string;
  key: string;
  value: string;
  bookId: string;
  book?: BookDto;
}

// Author DTOs
export interface AuthorDto {
  id: string;
  name: string;
  avartarUrl?: string;
  bookCount: number;
}

// Publisher DTOs
export interface PublisherDto {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phoneNumber?: string;
  bookCount: number;
}

// Category DTOs
export interface CategoryDto {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  bookCount: number;
  subCategoriesCount: number;
}

export interface CategoryTreeDto {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  bookCount: number;
  level: number;
  subCategories: CategoryTreeDto[];
}

// Book Image DTOs
export interface BookImageDto {
  id: string;
  imageUrl: string;
  isCover: boolean;
  displayOrder: number;
  bookId: string;
}
