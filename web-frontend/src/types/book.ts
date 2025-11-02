// Book Types
export interface Book {
  id: string;
  title: string;
  isbn: string;
  description?: string;
  publicationYear: number;
  language: string;
  isAvailable: boolean;
  edition?: string;
  pageCount: number;
  
  // Relations
  publisherId: string;
  publisher: Publisher;
  bookFormatId?: string;
  bookFormat?: BookFormat;
  
  // Many-to-Many
  bookAuthors: BookAuthor[];
  bookCategories: BookCategory[];
  
  // Images & Files
  images: BookImage[];
  files: BookFile[];
  metadata: BookMetadata[];
  
  // Computed (from backend)
  authors?: Author[];
  categories?: Category[];
  coverImage?: string;
  price?: number;
  discountPrice?: number;
  stockQuantity?: number;
}

export interface Publisher {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phoneNumber?: string;
}

export interface Author {
  id: string;
  name: string;
  biography?: string;
  avartarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface BookFormat {
  id: string;
  name: string; // "Hardcover", "Paperback", "eBook", "Audiobook"
  description?: string;
}

export interface BookAuthor {
  bookId: string;
  authorId: string;
  author?: Author;
}

export interface BookCategory {
  bookId: string;
  categoryId: string;
  category?: Category;
}

export interface BookImage {
  id: string;
  bookId: string;
  imageUrl: string;
  isCover: boolean;
  displayOrder: number;
}

export interface BookFile {
  id: string;
  bookId: string;
  fileUrl: string;
  fileType: string; // "PDF", "EPUB", "MOBI"
  fileSize: number;
  mimeType: string;
}

export interface BookMetadata {
  id: string;
  bookId: string;
  key: string;
  value: string;
}

// API Request/Response Types
export interface GetBooksParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  categoryId?: string;
  authorId?: string;
  publisherId?: string;
  isAvailable?: boolean;
}

export interface GetBooksResponse {
  items: Book[];
  totalCount: number;
  page: number;
  pageSize: number;
}
