'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Button,
  Badge,
} from '@/components/ui';
import { rentalService } from '@/services/rental.service';
import { orderService } from '@/services/order.service';

// --- TYPES ---
// Định nghĩa lại BookRentalDto cho khớp hoàn toàn với C# (camelCase khi về JSON)
interface BookRentalDto {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;        // Khớp C# BookTitle
  bookISBN?: string;
  bookCoverImage?: string;  // Khớp C# BookCoverImage
  rentalPlanId: string;
  rentalPlanName: string;
  durationDays: number;     // hoặc DurationDays tùy backend config
  price?: number;
  startDate: string;
  endDate: string;
  isReturned: boolean;      // Khớp C# IsReturned
  isRenewed?: boolean;
  status: string;           // Khớp C# Status ("Active", "Expired")
  daysRemaining: number;
  isExpired?: boolean;
  canRead: boolean;
}

type BookFormat = 'ebook' | 'physical';
type ReadingStatus = 'reading' | 'completed' | 'expired' | 'purchased';

interface LibraryBook {
  id: string;  // Composite ID cho React key: "rental-{rentalId}" hoặc "purchase-{orderId}-{bookId}"
  bookId: string;  // Actual book ID để navigate
  title: string;
  author: string;
  cover: string;
  format: BookFormat;
  status: ReadingStatus;
  progress: number;
  currentPage: number;
  totalPages: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  downloadLinks?: string[];
  genre: string;
  type: 'rental' | 'purchase'; // Phân biệt sách thuê hay mua
  orderId?: string; // ID đơn hàng (nếu là purchase)
  rentalPlanInfo?: string; // Thông tin gói thuê: "Thuê 7 ngày", "Thuê 30 ngày", "Mua vĩnh viễn"
  rentalDuration?: number; // Số ngày thuê
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<ReadingStatus>('reading');
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchMyLibrary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Lấy sách thuê từ Rental Service (Backend đã tính toán StartDate, EndDate, DurationDays)
        const rentalList = await rentalService.getMyRentals(false); 

        // 2. Lấy sách đã mua từ Order Service
        const orderResponse: any = await orderService.getMyOrders({ 
          status: 'all',
          pageNumber: 1,
          pageSize: 100 
        });
        
        const orderList = Array.isArray(orderResponse?.items) ? orderResponse.items : [];

        // Filter orders that are paid/completed
        const paidOrders = orderList.filter((order: any) => 
          ['Paid', 'Completed', 'Shipped'].includes(order.status)
        );

        const allBooks: LibraryBook[] = [];

        // 3. Map sách thuê
        if (Array.isArray(rentalList)) {
          const rentalBooks: LibraryBook[] = rentalList.map((rental: any) => {
            // Backend trả về DurationDays và RentalPlanName (xử lý cả camelCase và PascalCase)
            const duration = rental.durationDays || rental.DurationDays || 0;
            const planName = rental.rentalPlanName || rental.RentalPlanName || 'Gói thuê';
            
            let status: ReadingStatus = 'reading';
            let progress = 0;

            if (rental.isReturned || rental.IsReturned) {
              status = 'completed';
              progress = 100;
            } else if (rental.status === 'Expired' || rental.Status === 'Expired') {
              status = 'expired';
              progress = 100;
            } else {
              status = 'reading';
              progress = Math.floor(Math.random() * 80) + 10; 
            }
            
            return {
              id: `rental-${rental.id || rental.Id}`,  // Unique key: rental-{rentalId}
              bookId: rental.bookId || rental.BookId,  // Actual book ID
              title: rental.bookTitle || rental.BookTitle,
              author: 'Tác giả', 
              cover: rental.bookCoverImage || rental.BookCoverImage || '/image/anh.png', 
              format: 'ebook',
              status: status,
              progress: progress,
              currentPage: 0,
              totalPages: 300,
              startDate: rental.startDate || rental.StartDate,
              endDate: rental.endDate || rental.EndDate,
              daysRemaining: rental.daysRemaining || rental.DaysRemaining || 0,
              genre: planName,
              downloadLinks: (rental.canRead || rental.CanRead) ? ['PDF'] : [],
              type: 'rental',
              rentalPlanInfo: duration > 0 ? `Thuê ${duration} ngày` : planName,
              rentalDuration: duration,
            };
          });
          allBooks.push(...rentalBooks);
        }

        // 4. Map sách đã mua
        paidOrders.forEach((order: any) => {
          if (Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              allBooks.push({
                id: `purchase-${order.id}-${item.bookId}`,  // Unique key: purchase-{orderId}-{bookId}
                bookId: item.bookId,  // Actual book ID
                title: item.bookTitle || 'Sách',
                author: 'Tác giả',
                cover: item.bookImageUrl || '/image/anh.png',
                format: 'ebook',
                status: 'purchased',
                progress: 0,
                currentPage: 0,
                totalPages: 300,
                startDate: order.createdAt,
                endDate: '', // Sách mua không có hạn
                daysRemaining: 999,
                genre: 'Đã mua',
                downloadLinks: ['PDF', 'EPUB'],
                type: 'purchase',
                orderId: order.id,
                rentalPlanInfo: 'Mua vĩnh viễn',
                rentalDuration: 0,
              });
            });
          }
        });
        
        setLibrary(allBooks);
      } catch (err) {
        console.error('Error fetching library:', err);
        setError('Không thể tải thư viện sách.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyLibrary();
  }, []);

  // --- FILTER ---
  const filteredBooks = useMemo(() => {
    if (activeTab === 'purchased') {
      return library.filter(book => book.type === 'purchase');
    }
    return library.filter(book => book.status === activeTab);
  }, [activeTab, library]);

  // --- HANDLERS ---
  const handleRead = (book: LibraryBook) => {
    // Sử dụng bookId thực tế từ object
    window.location.href = `/books/${book.bookId}/read`;
  };

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch { return dateString; }
  }, []);

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Thư viện của tôi</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1">
          <button
            onClick={() => setActiveTab('reading')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'reading' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đang thuê
            {activeTab === 'reading' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
          </button>
          <button
            onClick={() => setActiveTab('purchased')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'purchased' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đã mua
            {activeTab === 'purchased' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'completed' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đã trả
            {activeTab === 'completed' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'expired' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Hết hạn
            {activeTab === 'expired' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
          </button>
        </div>

        {error && <div className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</div>}

        {/* List */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">Không có sách nào trong mục này.</p>
            <Link href="/rent" className="text-blue-600 font-medium mt-2 inline-block hover:underline">
              Thuê sách mới ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex hover:shadow-md transition">
                {/* Ảnh bìa */}
                <div className="relative w-32 h-44 flex-shrink-0 bg-gray-100">
                  <Image 
                    src={book.cover} 
                    alt={book.title} 
                    fill 
                    className="object-cover" 
                  />
                </div>

                {/* Nội dung */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/books/${book.bookId}`}>
                        <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition">
                        {book.title}
                        </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                    
                    {/* Badge trạng thái */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {book.rentalPlanInfo && (
                            <Badge 
                                className={`text-xs font-semibold ${
                                    book.type === 'purchase' 
                                        ? 'bg-green-100 text-green-700 border-green-300' 
                                        : 'bg-blue-100 text-blue-700 border-blue-300'
                                }`}
                            >
                                {book.rentalPlanInfo}
                            </Badge>
                        )}
                        {book.daysRemaining <= 3 && book.status === 'reading' && book.type === 'rental' && (
                            <Badge variant="warning" className="text-xs text-orange-600 bg-orange-50 border-orange-200">
                                Hết hạn sau {book.daysRemaining} ngày
                            </Badge>
                        )}
                    </div>
                  </div>

                  {/* Actions & Progress */}
                  <div>
                    {book.status === 'reading' && (
                        <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Tiến độ</span>
                                <span>{book.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${book.progress}%` }}></div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {(book.status === 'reading' || book.type === 'purchase') ? (
                            <Button size="sm" className="w-full" onClick={() => handleRead(book)}>
                                Đọc ngay
                            </Button>
                        ) : (
                            <Button size="sm" variant="outline" className="w-full" onClick={() => window.location.href = `/books/${book.bookId}`}>
                                Xem lại sách
                            </Button>
                        )}
                    </div>
                    
                    {book.type === 'rental' && book.endDate && (
                      <div className="mt-2 text-center">
                        <p className="text-xs text-gray-600 font-medium">
                          Gói: {book.rentalPlanInfo}
                        </p>
                        <p className="text-xs text-gray-400">
                          Hết hạn: {formatDate(book.endDate)}
                        </p>
                      </div>
                    )}
                    {book.type === 'purchase' && (
                      <p className="text-xs text-green-600 mt-2 text-center font-medium">
                          ✓ Sở hữu vĩnh viễn • Mua ngày {formatDate(book.startDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}