/**
 * Custom hooks for fetching and managing book data
 */

import { useState, useEffect } from 'react';
import { bookService, categoryService } from '@/services';

export interface Book {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  category?: string;
  categoryId?: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  cover: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  description?: string;
  isBestseller?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  count?: number;
  image?: string;
  color?: string;
  href?: string;
}

/**
 * Fetch featured/hot books from API
 */
export function useFeaturedBooks(limit: number = 6) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        // Try to get featured books or bestsellers
        const response = await bookService.getBooks({
          pageNumber: 1,
          pageSize: limit,
        });

        // Transform API data to match UI format
        const transformedBooks: Book[] = (response.items || []).map((book) => ({
          id: book.id || book.bookId,
          title: book.title || book.name,
          author: book.authorName || book.author || 'Unknown Author',
          authorId: book.authorId,
          price: book.price || book.salePrice || 0,
          originalPrice: book.originalPrice || book.regularPrice,
          salePrice: book.salePrice,
          cover: book.imageUrl || book.coverImage || book.thumbnailUrl || '/image/anh.png',
          rating: book.rating || book.averageRating || 4.5,
          reviewCount: book.reviewCount || book.totalReviews || 0,
          stock: book.stock || book.quantity || 0,
          isFeatured: book.isFeatured || book.isHot,
          isBestseller: book.isBestseller || book.isPopular,
        }));

        setBooks(transformedBooks);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured books:', err);
        setError(err instanceof Error ? err.message : 'Failed to load books');
        // Keep empty array on error - will use fallback in component
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [limit]);

  return { books, loading, error };
}

/**
 * Fetch categories from API
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const response = await categoryService.getCategories(1, 100);

        // Transform API data
        const transformedCategories: Category[] = (response.items || []).map((cat) => ({
          id: cat.id || cat.categoryId,
          name: cat.name || cat.categoryName,
          description: cat.description,
          count: cat.bookCount || cat.totalBooks || 0,
          image: cat.imageUrl || cat.image,
          href: `/books?category=${cat.id}`,
        }));

        setCategories(transformedCategories);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

/**
 * Fetch books with filters and pagination
 */
export function useBooks(params?: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  authorId?: string;
  publisherId?: string;
  search?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const response = await bookService.getBooks({
          pageNumber: params?.page || 1,
          pageSize: params?.pageSize || 20,
          categoryId: params?.categoryId,
          authorId: params?.authorId,
          publisherId: params?.publisherId,
          searchTerm: params?.search,
        });

        // Transform API data
        const transformedBooks: Book[] = (response.items || []).map((book) => ({
          id: book.id || book.bookId,
          title: book.title || book.name,
          author: book.authorName || book.author || 'Unknown Author',
          authorId: book.authorId,
          category: book.categoryName || book.category,
          categoryId: book.categoryId,
          price: book.price || book.salePrice || 0,
          originalPrice: book.originalPrice || book.regularPrice,
          salePrice: book.salePrice,
          cover: book.imageUrl || book.coverImage || book.thumbnailUrl || '/image/anh.png',
          rating: book.rating || book.averageRating || 0,
          reviewCount: book.reviewCount || book.totalReviews || 0,
          stock: book.stock || book.quantity || 0,
          description: book.description,
          isBestseller: book.isBestseller || book.isPopular,
          isNew: book.isNew,
          isFeatured: book.isFeatured,
        }));

        setBooks(transformedBooks);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || transformedBooks.length);
        setError(null);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err instanceof Error ? err.message : 'Failed to load books');
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.page, params?.pageSize, params?.categoryId, params?.authorId, params?.publisherId, params?.search, params?.sortBy]);

  return { books, totalPages, totalCount, loading, error };
}

/**
 * Fetch single book by ID
 */
export function useBook(bookId: string | null) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) {
      setLoading(false);
      return;
    }

    async function fetchBook() {
      try {
        setLoading(true);
        const response = await bookService.getBookById(bookId!);

        // Transform API data
        const book: Book = {
          id: response.id || response.bookId,
          title: response.title || response.name,
          author: response.authorName || response.author || 'Unknown Author',
          authorId: response.authorId,
          category: response.categoryName || response.category,
          categoryId: response.categoryId,
          price: response.price || response.salePrice || 0,
          originalPrice: response.originalPrice || response.regularPrice,
          salePrice: response.salePrice,
          cover: response.imageUrl || response.coverImage || '/image/anh.png',
          rating: response.rating || response.averageRating || 0,
          reviewCount: response.reviewCount || response.totalReviews || 0,
          stock: response.stock || response.quantity || 0,
          description: response.description,
          isBestseller: response.isBestseller,
          isNew: response.isNew,
          isFeatured: response.isFeatured,
        };

        setBook(book);
        setError(null);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError(err instanceof Error ? err.message : 'Failed to load book');
        setBook(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [bookId]);

  return { book, loading, error };
}
