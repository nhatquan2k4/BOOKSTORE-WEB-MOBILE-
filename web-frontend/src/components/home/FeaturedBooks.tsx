'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { bookService } from '@/services';
import type { BookDto } from '@/types/dtos';
import { Badge } from '@/components/ui';
import { resolveBookPrice, formatPrice } from '@/lib/price';

interface FeaturedBooksProps {
  limit?: number;
}

export function FeaturedBooks({ limit = 6 }: FeaturedBooksProps) {
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        const response = await bookService.getBooks({
          pageNumber: 1,
          pageSize: limit,
        });
        
        setBooks(response.items || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured books:', err);
        setError('Không thể tải sách');
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-80 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
            <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || 'Không có sách nào'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => {
        const priceInfo = resolveBookPrice(book);

        return (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="group block bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-80">
              <Image
                src={book.coverImage || "/image/anh.png"}
                alt={book.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {priceInfo.hasDiscount && priceInfo.discountPercent && (
                  <Badge variant="danger" className="font-semibold">
                    -{priceInfo.discountPercent}%
                  </Badge>
                )}
                {book.isAvailable && book.stockQuantity && book.stockQuantity < 10 && (
                  <Badge variant="warning">Còn {book.stockQuantity}</Badge>
                )}
              </div>

              {/* Quick actions - show on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                <button
                  className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    // Add to cart logic
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
                <button
                  className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    // Add to wishlist logic
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3">{book.authorNames.join(', ')}</p>

              {/* Rating */}
              {book.averageRating && book.averageRating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(book.averageRating!)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {book.averageRating.toFixed(1)} ({book.totalReviews})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(priceInfo.finalPrice)}
                </span>
                {priceInfo.hasDiscount && priceInfo.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(priceInfo.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
