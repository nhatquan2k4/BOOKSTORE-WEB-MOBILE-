// Book types matching backend DTOs

// Base Book type from BookDto (for list views)
export interface Book {
  id: string; // Guid from backend
  title: string;
  isbn: string;
  publicationYear: number;
  language: string;
  pageCount: number;
  isAvailable: boolean;
  
  // Publisher
  publisherId: string;
  publisherName: string;
  
  // Format
  bookFormatId?: string;
  bookFormatName?: string;
  
  // Authors & Categories (list of names)
  authorNames: string[];
  categoryNames: string[];
  
  // Pricing
  currentPrice?: number;
  discountPrice?: number;
  
  // Stock
  stockQuantity?: number;
  
  // Reviews
  averageRating?: number;
  totalReviews: number;
  
  // For UI display (optional, from images)
  cover?: string;
  coverImages?: string[];
}

// Detailed Book type from BookDetailDto (for detail view)
export interface BookDetail {
  id: string;
  title: string;
  isbn: string;
  description?: string;
  publicationYear: number;
  language: string;
  edition?: string;
  pageCount: number;
  isAvailable: boolean;
  
  publisher: Publisher;
  bookFormat?: BookFormat;
  authors: Author[];
  categories: Category[];
  images: BookImage[];
  files: BookFile[];
  metadata: BookMetadata[];
}

// Supporting types
export interface Publisher {
  id: string;
  name: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  foundedYear?: number;
}

export interface BookFormat {
  id: string;
  name: string;
  description?: string;
}

export interface Author {
  id: string;
  name: string;
  biography?: string;
  birthDate?: string;
  nationality?: string;
  email?: string;
  website?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  parentCategoryId?: string;
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
  fileType: string;
  fileSize: number;
  uploadDate: string;
}

export interface BookMetadata {
  id: string;
  bookId: string;
  key: string;
  value: string;
}

// API Request/Response types
export interface GetBooksParams {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string;
  authorId?: string;
  publisherId?: string;
  minPrice?: number;
  maxPrice?: number;
  language?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface BookListResponse {
  items: Book[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Helper function to convert Book to legacy Book format (for compatibility with existing components)
export const toDisplayBook = (book: Book): {
  id: number;
  title: string;
  author: string;
  cover: string;
  color?: string;
  rating?: number;
  reviewCount?: number;
  price?: number;
  description?: string;
  pages?: number;
  language?: string;
  publisher?: string;
} => ({
  id: parseInt(book.id.split('-')[0], 16), // Convert UUID to number for compatibility
  title: book.title,
  author: book.authorNames.join(', '),
  cover: book.cover || 'https://via.placeholder.com/160x240?text=No+Cover',
  rating: book.averageRating,
  reviewCount: book.totalReviews,
  price: book.discountPrice || book.currentPrice,
  pages: book.pageCount,
  language: book.language,
  publisher: book.publisherName,
});

// Helper to convert BookDetail to display format
export const toDisplayBookDetail = (book: BookDetail): any => ({
  id: book.id, // Keep original UUID string for API calls
  title: book.title,
  author: book.authors.map(a => a.name).join(', '),
  cover: book.images.find(img => img.isCover)?.imageUrl || book.images[0]?.imageUrl || 'https://via.placeholder.com/220x320?text=No+Cover',
  coverImages: book.images.sort((a, b) => a.displayOrder - b.displayOrder).map(img => img.imageUrl),
  description: book.description,
  pages: book.pageCount,
  language: book.language,
  publisher: book.publisher.name,
  rating: 0, // TODO: Get from reviews
  // derive price and currency from any attached fields
  price: (book as any).price ?? (book as any).currentPrice ?? (book as any).amount ?? 0,
  currency: (book as any).currency ?? 'VND',
});
