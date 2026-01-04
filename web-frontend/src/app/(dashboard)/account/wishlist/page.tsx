'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  Badge,
  Button,
  Alert,
} from '@/components/ui';
import { wishlistService, bookService, cartService } from '@/services';
import type { BookDto } from '@/types/dtos';
import { resolveBookPrice, formatPrice } from '@/lib/price';
import { normalizeImageUrl } from '@/lib/imageUtils';

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
    
    const handleWishlistUpdate = () => {
      loadWishlistBooks();
    };
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, []);

  const loadWishlistBooks = async () => {
    try {
      setLoading(true);
      
      const response = await wishlistService.getMyWishlist();
      const items = Array.isArray(response) ? response : (response.items || []);

      if (items.length === 0) {
        setWishlistBooks([]);
        return;
      }

      // Map dữ liệu (nếu backend trả về ID thì fetch, nếu trả về object thì dùng luôn)
      const bookPromises = items.map((item: any) => {
          if (item.title) return Promise.resolve(item);
          const id = item.bookId || item.id; 
          return bookService.getBookById(id).catch(() => null); 
      });

      const books = await Promise.all(bookPromises);
      setWishlistBooks(books.filter(Boolean) as WishlistBook[]);

    } catch (error) {
      console.error('Failed to load wishlist:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách yêu thích' });
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý điều hướng thông minh (Quay lại hoặc về trang chủ sách)
  const handleContinueShopping = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/books');
    }
  };

  const removeFromWishlist = async (bookId: string) => {
    try {
      await wishlistService.removeFromWishlist(bookId);
      setWishlistBooks(prev => prev.filter(b => b.id !== bookId));
      
      setMessage({ type: 'success', text: 'Đã xóa khỏi danh sách yêu thích' });
      
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('wishlistUpdated'));
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      setMessage({ type: 'error', text: 'Không thể xóa khỏi danh sách yêu thích' });
    }
  };

  const addToCart = async (bookId: string) => {
    // 1. Tìm sách để kiểm tra tồn kho (Logic fix)
    const book = wishlistBooks.find(b => b.id === bookId);
    
    if (!book || (book.stockQuantity || 0) <= 0) {
        setMessage({ type: 'error', text: 'Sản phẩm này đã hết hàng, không thể thêm vào giỏ.' });
        setTimeout(() => setMessage(null), 3000);
        return;
    }

    try {
      await cartService.addToCart({ bookId, quantity: 1 });
      setMessage({ type: 'success', text: 'Đã thêm vào giỏ hàng' });
      setTimeout(() => setMessage(null), 3000);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setMessage({ type: 'error', text: 'Không thể thêm vào giỏ hàng' });
    }
  };

  const addAllToCart = async () => {
    // 2. Lọc sách CÒN HÀNG (Logic fix)
    const availableBooks = wishlistBooks.filter(book => (book.stockQuantity || 0) > 0);

    if (availableBooks.length === 0) {
        setMessage({ type: 'error', text: 'Tất cả sách trong danh sách yêu thích đều đã hết hàng.' });
        setTimeout(() => setMessage(null), 3000);
        return;
    }

    try {
      setLoadingAll(true);
      
      // Chỉ chạy vòng lặp với sách còn hàng
      const promises = availableBooks.map(book => 
          cartService.addToCart({ bookId: book.id, quantity: 1 })
            .catch(err => console.error(`Failed to add book ${book.id}`, err))
      );
      
      await Promise.all(promises);
      
      // Thông báo thông minh hơn
      const failedCount = wishlistBooks.length - availableBooks.length;
      if (failedCount > 0) {
          setMessage({ type: 'success', text: `Đã thêm ${availableBooks.length} cuốn vào giỏ. (${failedCount} cuốn hết hàng đã bị bỏ qua)` });
      } else {
          setMessage({ type: 'success', text: 'Đã thêm tất cả vào giỏ hàng' });
      }

      setTimeout(() => setMessage(null), 4000);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Failed to add all to cart:', error);
      setMessage({ type: 'error', text: 'Có lỗi khi thêm vào giỏ hàng' });
    } finally {
      setLoadingAll(false);
    }
  };

  const totalValue = wishlistBooks.reduce((sum, book) => {
    const { finalPrice } = resolveBookPrice(book);
    return sum + finalPrice;
  }, 0);

  // Kiểm tra xem có ít nhất 1 cuốn sách còn hàng không
  const hasAnyStock = wishlistBooks.some(b => (b.stockQuantity || 0) > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sách yêu thích</h1>
            <p className="text-gray-600 mt-1">{wishlistBooks.length} sản phẩm</p>
          </div>
          {/* Fix: Dùng handleContinueShopping thay vì router.push cứng */}
          {wishlistBooks.length > 0 && (
              <Button onClick={handleContinueShopping} variant="outline" size="sm">
                  Tiếp tục xem sách
              </Button>
          )}
        </div>

        {/* Message Alert */}
        {message && (
          <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-5">
            <Alert variant={message.type === 'success' ? 'success' : 'danger'} onClose={() => setMessage(null)} className="shadow-lg min-w-[300px]">
                {message.text}
            </Alert>
          </div>
        )}

        {wishlistBooks.length === 0 ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Danh sách yêu thích trống</h3>
              <p className="text-gray-500 mt-2 mb-6 max-w-sm">
                Bạn chưa lưu cuốn sách nào. Hãy dạo qua cửa hàng và thả tim cho những cuốn sách bạn thích nhé!
              </p>
              {/* Fix: Dùng handleContinueShopping */}
              <Button onClick={handleContinueShopping} size="lg">
                Khám phá sách ngay
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Book List */}
            <div className="lg:col-span-2 space-y-4">
              {wishlistBooks.map((book) => {
                const priceInfo = resolveBookPrice(book);
                const isOutOfStock = (book.stockQuantity || 0) <= 0;

                return (
                  <Card key={book.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4 sm:gap-6">
                        <Link href={`/books/${book.id}`} className="flex-shrink-0 group">
                          <div className="relative w-24 h-36 sm:w-32 sm:h-48 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                            <Image
                              src={normalizeImageUrl(book.images?.find(i => i.isCover)?.imageUrl || book.images?.[0]?.imageUrl) || '/image/anh.png'}
                              alt={book.title}
                              fill
                              unoptimized
                              sizes="(max-width: 768px) 100px, 150px"
                              className={`object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                              onError={(e) => {
                                const img = e?.currentTarget as HTMLImageElement | null;
                                if (img) img.src = '/image/anh.png';
                              }}
                            />
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex-1">
                              <Link href={`/books/${book.id}`}>
                                <h3 className="font-semibold text-gray-900 text-lg hover:text-blue-600 transition line-clamp-2 mb-1">
                                  {book.title}
                                </h3>
                              </Link>
                              <p className="text-sm text-gray-500 mb-2">
                                {book.authorNames?.join(', ') || 'Tác giả chưa cập nhật'}
                              </p>
                              
                              <div className="flex items-center gap-1 mb-2">
                                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                                <span className="text-sm font-medium text-gray-700">{book.averageRating?.toFixed(1) || 0}</span>
                                <span className="text-xs text-gray-400">({book.totalReviews || 0} đánh giá)</span>
                              </div>

                              <div className="mb-2">
                                  {isOutOfStock ? (
                                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">Hết hàng</span>
                                  ) : (
                                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Còn hàng</span>
                                  )}
                              </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
                             <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-red-600">
                                  {formatPrice(priceInfo.finalPrice)}
                                </span>
                                {priceInfo.hasDiscount && (
                                  <>
                                    <span className="text-sm text-gray-400 line-through">
                                      {formatPrice(priceInfo.originalPrice)}
                                    </span>
                                    <Badge variant="danger" size="sm">
                                      -{priceInfo.discountPercent}%
                                    </Badge>
                                  </>
                                )}
                             </div>

                             <div className="flex items-center gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => removeFromWishlist(book.id)}
                                    className="text-gray-500 hover:text-red-600 hover:border-red-200"
                                    title="Xóa"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </Button>
                                <Button 
                                    size="sm" 
                                    onClick={() => addToCart(book.id)}
                                    disabled={isOutOfStock} // Disable nút nếu hết hàng
                                >
                                    Thêm vào giỏ
                                </Button>
                             </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Tóm tắt danh sách</h3>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Số lượng:</span>
                            <span className="font-medium">{wishlistBooks.length} cuốn</span>
                        </div>
                        <div className="flex justify-between items-center mb-6 pt-2 border-t">
                            <span className="text-gray-900 font-semibold">Tạm tính:</span>
                            <span className="text-xl font-bold text-red-600">{formatPrice(totalValue)}</span>
                        </div>
                        
                        <Button 
                            className="w-full" 
                            size="sm" 
                            onClick={addAllToCart} 
                            // Fix Logic: Disabled nếu đang load HOẶC không có sách HOẶC tất cả sách đều hết hàng
                            disabled={loadingAll || wishlistBooks.length === 0 || !hasAnyStock}
                        >
                            {loadingAll ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                // Hiển thị text khác nếu hết sạch hàng
                                !hasAnyStock ? 'Hết hàng toàn bộ' : 'Thêm tất cả vào giỏ'
                            )}
                        </Button>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                            * Giá và tình trạng sách có thể thay đổi khi thanh toán.
                        </p>
                    </CardContent>
                </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}