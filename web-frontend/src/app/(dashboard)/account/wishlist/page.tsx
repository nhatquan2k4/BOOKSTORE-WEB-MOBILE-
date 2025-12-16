'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  EmptyState,
  Alert,
} from '@/components/ui';
import { wishlistService, bookService, cartService } from '@/services';
import type { BookDto } from '@/types/dtos';

interface WishlistBook extends BookDto {
  addedDate?: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistBooks, setWishlistBooks] = useState<WishlistBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load wishlist books
  useEffect(() => {
    loadWishlistBooks();
    
    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      loadWishlistBooks();
    };
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, []);

  const loadWishlistBooks = async () => {
    try {
      setLoading(true);
      
      // Fetch wishlist items from API
      const wishlistItems = await wishlistService.getWishlist();
      
      if (wishlistItems.length === 0) {
        setWishlistBooks([]);
        setLoading(false);
        return;
      }

      // Extract book IDs and fetch details
      const bookIds = wishlistItems.map(item => item.bookId);
      const bookPromises = bookIds.map(id => bookService.getBookById(id));
      const books = await Promise.all(bookPromises);
      
      setWishlistBooks(books.filter(Boolean) as WishlistBook[]);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách yêu thích' });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (bookId: string) => {
    try {
      await wishlistService.removeFromWishlist(bookId);
      setMessage({ type: 'success', text: 'Đã xóa khỏi danh sách yêu thích' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      setMessage({ type: 'error', text: 'Không thể xóa khỏi danh sách yêu thích' });
    }
  };

  const addToCart = async (bookId: string) => {
    try {
      await cartService.addToCart({ bookId, quantity: 1 });
      setMessage({ type: 'success', text: 'Đã thêm vào giỏ hàng' });
      setTimeout(() => setMessage(null), 2000);
      
      // Trigger cart update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setMessage({ type: 'error', text: 'Không thể thêm vào giỏ hàng' });
    }
  };

  const addAllToCart = async () => {
    try {
      setLoadingAll(true);
      
      for (const book of wishlistBooks) {
        await cartService.addToCart({ bookId: book.id, quantity: 1 });
      }
      
      setMessage({ type: 'success', text: 'Đã thêm tất cả vào giỏ hàng' });
      setTimeout(() => setMessage(null), 2000);
      
      // Trigger cart update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Failed to add all to cart:', error);
      setMessage({ type: 'error', text: 'Không thể thêm tất cả vào giỏ hàng' });
    } finally {
      setLoadingAll(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const totalValue = wishlistBooks.reduce((sum, book) => {
    return sum + (book.discountPrice || book.currentPrice || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sách yêu thích</h1>
          <p className="text-gray-600 mt-1">{wishlistBooks.length} sản phẩm</p>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert variant={message.type === 'success' ? 'success' : 'danger'} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        {wishlistBooks.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                title="Danh sách yêu thích trống"
                description="Hãy thêm những cuốn sách bạn thích vào đây."
                action={{
                  label: 'Khám phá sách',
                  onClick: () => router.push('/books'),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Book List */}
            <div className="grid gap-4">
              {wishlistBooks.map((book) => {
                const price = book.discountPrice || book.currentPrice || 0;
                const originalPrice = book.currentPrice || 0;
                const hasDiscount = book.discountPrice && book.discountPrice < originalPrice;
                const discount = hasDiscount 
                  ? Math.round(((originalPrice - price) / originalPrice) * 100)
                  : 0;

                return (
                  <Card key={book.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Book Image */}
                        <Link href={`/books/${book.id}`} className="flex-shrink-0">
                          <div className="relative w-24 h-32 rounded overflow-hidden">
                            <Image
                              src={book.images?.[0]?.imageUrl || '/image/anh.png'}
                              alt={book.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </Link>

                        {/* Book Info */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/books/${book.id}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-2">
                              {book.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            {book.authorNames?.join(', ') || 'Chưa cập nhật'}
                          </p>
                          
                          {/* Rating */}
                          {book.averageRating && book.averageRating > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                              </svg>
                              <span className="text-sm font-medium">{book.averageRating.toFixed(1)}</span>
                              <span className="text-sm text-gray-500">({book.totalReviews || 0})</span>
                            </div>
                          )}

                          {/* Price */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-red-600">
                              {formatPrice(price)}
                            </span>
                            {hasDiscount && (
                              <>
                                <span className="text-sm text-gray-400 line-through">
                                  {formatPrice(originalPrice)}
                                </span>
                                <Badge variant="danger" className="text-xs">
                                  -{discount}%
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => addToCart(book.id)}
                          >
                            Thêm vào giỏ
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromWishlist(book.id)}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Summary */}
            <Card>
              <CardContent className="flex items-center justify-between py-5">
                <div>
                  <p className="text-gray-600">Tổng giá trị danh sách</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatPrice(totalValue)}
                  </p>
                </div>
                <Button onClick={addAllToCart} disabled={loadingAll}>
                  {loadingAll ? 'Đang thêm...' : 'Thêm tất cả vào giỏ'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
