'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';

type BookFormat = 'ebook' | 'physical';
type ReadingStatus = 'reading' | 'completed' | 'not-started' | 'want-to-read';

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  cover: string;
  format: BookFormat;
  status: ReadingStatus;
  progress?: number;
  currentPage?: number;
  totalPages: number;
  rating?: number;
  purchasedAt: string;
  startDate?: string;
  lastRead?: string;
  downloadLinks?: string[];
  genre: string;
  estimatedTimeLeft?: string;
  notes?: string;
}

const initialLibrary: LibraryBook[] = [
  {
    id: 'LIB-001',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    cover: '/image/anh.png',
    format: 'ebook',
    status: 'reading',
    progress: 65,
    currentPage: 260,
    totalPages: 400,
    rating: 5,
    purchasedAt: '2024-10-15T10:00:00',
    startDate: '2024-10-15',
    lastRead: '2024-11-06',
    genre: 'Lập trình',
    estimatedTimeLeft: '3 giờ',
    notes: 'Chương về functions rất hay!',
    downloadLinks: ['PDF', 'EPUB'],
  },
  {
    id: 'LIB-002',
    title: 'Đắc nhân tâm',
    author: 'Dale Carnegie',
    cover: '/image/anh.png',
    format: 'ebook',
    status: 'completed',
    progress: 100,
    currentPage: 320,
    totalPages: 320,
    rating: 5,
    purchasedAt: '2024-09-01T10:00:00',
    startDate: '2024-09-01',
    lastRead: '2024-10-20',
    genre: 'Kỹ năng sống',
    notes: 'Sách rất hay, đã đọc xong!',
    downloadLinks: ['PDF', 'EPUB'],
  },
  {
    id: 'LIB-003',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    cover: '/image/anh.png',
    format: 'ebook',
    status: 'want-to-read',
    progress: 0,
    currentPage: 0,
    totalPages: 352,
    purchasedAt: '2024-10-01T10:00:00',
    genre: 'Lập trình',
    notes: 'Muốn đọc sau khi hoàn thành Clean Code',
    downloadLinks: ['PDF'],
  },
  {
    id: 'LIB-004',
    title: 'Design Patterns',
    author: 'Gang of Four',
    cover: '/image/anh.png',
    format: 'ebook',
    status: 'reading',
    progress: 45,
    currentPage: 180,
    totalPages: 400,
    rating: 4,
    purchasedAt: '2024-10-01T10:00:00',
    startDate: '2024-10-01',
    lastRead: '2024-11-05',
    genre: 'Lập trình',
    estimatedTimeLeft: '5 giờ',
    notes: 'Các pattern rất hữu ích',
    downloadLinks: ['EPUB'],
  },
  {
    id: 'LIB-005',
    title: 'Tuổi trẻ đáng giá bao nhiêu',
    author: 'Rosie Nguyễn',
    cover: '/image/anh.png',
    format: 'physical',
    status: 'completed',
    progress: 100,
    currentPage: 280,
    totalPages: 280,
    rating: 4,
    purchasedAt: '2024-08-15T10:00:00',
    startDate: '2024-08-15',
    lastRead: '2024-09-10',
    genre: 'Kỹ năng sống',
    notes: 'Truyền động lực rất tốt',
  },
  {
    id: 'LIB-006',
    title: 'Refactoring',
    author: 'Martin Fowler',
    cover: '/image/anh.png',
    format: 'ebook',
    status: 'want-to-read',
    progress: 0,
    currentPage: 0,
    totalPages: 448,
    purchasedAt: '2024-09-11T10:00:00',
    genre: 'Lập trình',
    downloadLinks: ['PDF'],
  },
  {
    id: 'LIB-007',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    cover: '/image/anh.png',
    format: 'physical',
    status: 'reading',
    progress: 30,
    currentPage: 360,
    totalPages: 1200,
    rating: 5,
    purchasedAt: '2024-09-15T10:00:00',
    startDate: '2024-09-15',
    lastRead: '2024-11-04',
    genre: 'Lập trình',
    estimatedTimeLeft: '20 giờ',
    notes: 'Sách khó nhưng rất chi tiết',
  },
  {
    id: 'LIB-008',
    title: 'Nhà giả kim',
    author: 'Paulo Coelho',
    cover: '/image/anh.png',
    format: 'physical',
    status: 'completed',
    progress: 100,
    currentPage: 208,
    totalPages: 208,
    rating: 5,
    purchasedAt: '2024-07-20T10:00:00',
    startDate: '2024-07-20',
    lastRead: '2024-08-05',
    genre: 'Văn học',
    notes: 'Câu chuyện ý nghĩa về hành trình tìm kiếm ước mơ',
  },
];

const statusConfig: Record<
  ReadingStatus,
  { label: string; color: string; icon: React.ReactElement }
> = {
  reading: {
    label: 'Đang đọc',
    color: 'bg-blue-100 text-blue-700',
    icon: (
      <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 6v6l3 3" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  completed: {
    label: 'Hoàn thành',
    color: 'bg-green-100 text-green-700',
    icon: (
      <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
  'not-started': {
    label: 'Chưa đọc',
    color: 'bg-gray-100 text-gray-700',
    icon: (
      <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 6v6" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  'want-to-read': {
    label: 'Muốn đọc',
    color: 'bg-purple-100 text-purple-700',
    icon: (
      <svg
        className="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14m-7-7h14" />
      </svg>
    ),
  },
};

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<ReadingStatus>('reading');
  const [sortBy, setSortBy] = useState<'lastRead' | 'progress' | 'title'>('lastRead');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'ebook' | 'physical'>('all');
  const [library, setLibrary] = useState<LibraryBook[]>(initialLibrary);

  // Get unique genres
  const genres = useMemo(() => {
    const uniqueGenres = Array.from(new Set(library.map(book => book.genre)));
    return ['all', ...uniqueGenres];
  }, [library]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let filtered = library.filter(book => book.status === activeTab);
    
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    if (formatFilter !== 'all') {
      filtered = filtered.filter(book => book.format === formatFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'lastRead':
          if (activeTab === 'want-to-read') return a.title.localeCompare(b.title);
          return new Date(b.lastRead || b.purchasedAt).getTime() - new Date(a.lastRead || a.purchasedAt).getTime();
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [activeTab, sortBy, selectedGenre, formatFilter, library]);

  // Statistics
  const stats = useMemo(() => {
    const reading = library.filter(b => b.status === 'reading');
    const completed = library.filter(b => b.status === 'completed');
    const wantToRead = library.filter(b => b.status === 'want-to-read');
    
    const totalPagesRead = completed.reduce((sum, book) => sum + book.totalPages, 0);
    const avgRating = completed.filter(b => b.rating).reduce((sum, b) => sum + (b.rating || 0), 0) / completed.filter(b => b.rating).length;

    return {
      total: library.length,
      reading: reading.length,
      completed: completed.length,
      wantToRead: wantToRead.length,
      totalPagesRead,
      avgRating: avgRating.toFixed(1),
    };
  }, [library]);

  const updateReadingProgress = (bookId: string, newPercent: number) => {
    setLibrary((prev) =>
      prev.map((book) => {
        if (book.id !== bookId) return book;

        const percent = Math.max(0, Math.min(100, Math.floor(newPercent)));
        let nextStatus: ReadingStatus = book.status;

        if (percent >= 100) nextStatus = 'completed';
        else if (percent > 0) nextStatus = 'reading';
        else nextStatus = 'not-started';

        return { ...book, progress: percent, status: nextStatus };
      })
    );
  };

  const handleRead = (bookId: string) => {
    window.location.href = `/books/${bookId}/read`;
  };

  const handleDownload = (bookId: string, format: string) => {
    alert(`Tải ${format} cho sách ${bookId}`);
  };

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 inline-flex gap-2">
          <Button
            onClick={() => setActiveTab('reading')}
            variant={activeTab === 'reading' ? 'primary' : 'outline'}
            size="md"
            className={activeTab === 'reading' ? 'shadow-md' : ''}
          >
            Đang đọc ({stats.reading})
          </Button>
          <Button
            onClick={() => setActiveTab('completed')}
            variant={activeTab === 'completed' ? 'primary' : 'outline'}
            size="md"
            className={activeTab === 'completed' ? 'bg-green-600 hover:bg-green-700 shadow-md' : ''}
          >
            Đã đọc ({stats.completed})
          </Button>
          <Button
            onClick={() => setActiveTab('want-to-read')}
            variant={activeTab === 'want-to-read' ? 'primary' : 'outline'}
            size="md"
            className={activeTab === 'want-to-read' ? 'bg-gray-600 hover:bg-gray-700 shadow-md' : ''}
          >
            Muốn đọc ({stats.wantToRead})
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sắp xếp:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {activeTab !== 'want-to-read' && (
                  <option value="lastRead">Đọc gần nhất</option>
                )}
                {activeTab === 'reading' && (
                  <option value="progress">Tiến độ</option>
                )}
                <option value="title">Tên sách</option>
              </select>
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Thể loại:</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre === 'all' ? 'Tất cả' : genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Định dạng:</label>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="ebook">eBook</option>
                <option value="physical">Sách giấy</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-600">
              Hiển thị <span className="font-semibold">{filteredBooks.length}</span> sách
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="M8 7h6M8 11h4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có sách nào</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'reading' && 'Bạn chưa đang đọc sách nào. Hãy bắt đầu đọc một cuốn sách mới!'}
              {activeTab === 'completed' && 'Bạn chưa hoàn thành sách nào. Hãy tiếp tục đọc!'}
              {activeTab === 'want-to-read' && 'Bạn chưa có sách nào trong danh sách muốn đọc.'}
            </p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Khám phá sách mới
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Book Cover */}
                    <Link href={`/books/${book.id}`} className="shrink-0">
                      <div className="relative w-24 h-32 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                        <Image
                          src={book.cover}
                          alt={book.title}
                          fill
                          sizes="96px"
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </Link>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/books/${book.id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-purple-600 transition line-clamp-2 mb-1">
                          {book.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="default" className="text-xs">
                          {book.genre}
                        </Badge>
                        <Badge className={book.format === 'ebook' ? 'bg-purple-100 text-purple-700 text-xs' : 'bg-blue-100 text-blue-700 text-xs'}>
                          {book.format === 'ebook' ? 'eBook' : 'Sách giấy'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar (for reading books) */}
                  {book.status === 'reading' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">
                          Trang {book.currentPage}/{book.totalPages}
                        </span>
                        <span className="font-semibold text-purple-600">
                          {book.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                      {book.estimatedTimeLeft && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          <span>Còn khoảng {book.estimatedTimeLeft}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed Info */}
                  {book.status === 'completed' && (
                    <div className="mt-4 space-y-2">
                      {book.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < book.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {book.rating}/5
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span>Hoàn thành: {formatDate(book.lastRead || book.purchasedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </svg>
                        <span>{book.totalPages} trang</span>
                      </div>
                    </div>
                  )}

                  {/* Want to Read Info */}
                  {book.status === 'want-to-read' && (
                    <div className="mt-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </svg>
                        <span>{book.totalPages} trang</span>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                    {book.startDate && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        <span>Bắt đầu: {formatDate(book.startDate)}</span>
                      </div>
                    )}
                    {book.lastRead && book.status !== 'want-to-read' && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span>Đọc lần cuối: {formatDate(book.lastRead)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      <span>Mua: {formatDate(book.purchasedAt)}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {book.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-yellow-800 mb-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        <span>Ghi chú:</span>
                      </div>
                      <div className="text-xs text-yellow-700">{book.notes}</div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {book.status === 'reading' && book.format === 'ebook' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleRead(book.id)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          Tiếp tục đọc
                        </Button>
                        {book.downloadLinks?.map((f) => (
                          <Button
                            key={f}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(book.id, f)}
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <path d="m7 10 5 5 5-5" />
                              <path d="M12 15V3" />
                            </svg>
                            {f}
                          </Button>
                        ))}
                      </>
                    )}
                    {book.status === 'reading' && book.format === 'physical' && (
                      <Link
                        href={`/books/${book.id}/read`}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium text-center"
                      >
                        Tiếp tục đọc
                      </Link>
                    )}
                    {book.status === 'completed' && (
                      <>
                        <Link
                          href={`/books/${book.id}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-center"
                        >
                          Xem chi tiết
                        </Link>
                        {book.format === 'ebook' && book.downloadLinks?.map((f) => (
                          <Button
                            key={f}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(book.id, f)}
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <path d="m7 10 5 5 5-5" />
                              <path d="M12 15V3" />
                            </svg>
                            {f}
                          </Button>
                        ))}
                      </>
                    )}
                    {book.status === 'want-to-read' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            updateReadingProgress(book.id, 1);
                            setActiveTab('reading');
                          }}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          Bắt đầu đọc
                        </Button>
                        {book.format === 'ebook' && book.downloadLinks?.map((f) => (
                          <Button
                            key={f}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(book.id, f)}
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <path d="m7 10 5 5 5-5" />
                              <path d="M12 15V3" />
                            </svg>
                            {f}
                          </Button>
                        ))}
                      </>
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
