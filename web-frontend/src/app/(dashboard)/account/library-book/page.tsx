'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Button,
  Badge,
} from '@/components/ui';
import { rentalService } from '@/services/rental.service';

// --- TYPES ---
// Định nghĩa lại BookRentalDto cho khớp hoàn toàn với C# (camelCase khi về JSON)
interface BookRentalDto {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;        // Khớp C# BookTitle
  bookISBN?: string;
  bookCoverImage?: string;  // Khớp C# BookCoverImage
  rentalPlanName: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  isReturned: boolean;      // Khớp C# IsReturned
  status: string;           // Khớp C# Status ("Active", "Expired")
  daysRemaining: number;
  canRead: boolean;
}

type BookFormat = 'ebook' | 'physical';
type ReadingStatus = 'reading' | 'completed' | 'expired';

interface LibraryBook {
  id: string;
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
        
        // 1. Gọi API
        const response: any = await rentalService.getMyRentals(false); 
        
        // 2. Xử lý mảng an toàn
        const rentalList = Array.isArray(response) 
            ? response 
            : (response?.items || response?.data || []);

        if (!Array.isArray(rentalList)) {
            setLibrary([]);
            return;
        }

        // 3. Map DTO từ C# sang UI Model
        const books: LibraryBook[] = rentalList.map((rental: BookRentalDto) => {
          // Logic xác định trạng thái
          let status: ReadingStatus = 'reading';
          let progress = 0;

          if (rental.isReturned) {
            status = 'completed';
            progress = 100;
          } else if (rental.status === 'Expired') {
            status = 'expired';
            progress = 100; // Hoặc xử lý khác tùy bạn
          } else {
            status = 'reading';
            // Giả lập tiến độ vì DTO chưa có trường Progress
            // Nếu muốn chuẩn, bạn cần thêm `ReadingProgress` vào Backend
            progress = Math.floor(Math.random() * 80) + 10; 
          }
          
          return {
            id: rental.bookId, // Dùng BookId để link tới trang chi tiết sách
            title: rental.bookTitle,
            // Lưu ý: DTO C# thiếu Author, tạm thời hardcode hoặc lấy từ Book Service khác
            author: 'Tác giả', 
            // Map đúng trường BookCoverImage
            cover: rental.bookCoverImage || '/image/anh.png', 
            format: 'ebook',
            status: status,
            progress: progress,
            currentPage: 0,
            totalPages: 300, // Mock
            startDate: rental.startDate,
            endDate: rental.endDate,
            daysRemaining: rental.daysRemaining,
            genre: rental.rentalPlanName, // Tạm dùng tên gói thuê làm thể loại
            downloadLinks: rental.canRead ? ['PDF'] : [],
          };
        });
        
        setLibrary(books);
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
    return library.filter(book => book.status === activeTab);
  }, [activeTab, library]);

  // --- HANDLERS ---
  const handleRead = (bookId: string) => {
    // Chuyển hướng sang trang đọc sách
    window.location.href = `/books/${bookId}/read`;
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
            Đang đọc
            {activeTab === 'reading' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'completed' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đã trả / Hoàn thành
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
                    <Link href={`/books/${book.id}`}>
                        <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition">
                        {book.title}
                        </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                    
                    {/* Badge trạng thái */}
                    <div className="flex gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">{book.genre}</Badge>
                        {book.daysRemaining <= 3 && book.status === 'reading' && (
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
                        {book.status === 'reading' ? (
                            <Button size="sm" className="w-full" onClick={() => handleRead(book.id)}>
                                Đọc ngay
                            </Button>
                        ) : (
                            <Button size="sm" variant="outline" className="w-full" onClick={() => window.location.href = `/books/${book.id}`}>
                                Xem lại sách
                            </Button>
                        )}
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Hết hạn: {formatDate(book.endDate)}
                    </p>
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