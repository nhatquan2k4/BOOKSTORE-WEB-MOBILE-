'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';

type BookFormat = 'ebook' | 'physical';
type ReadingStatus = 'reading' | 'completed' | 'not-started';

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  cover: string;
  format: BookFormat;
  status: ReadingStatus;
  progress?: number;
  purchasedAt: string;
  downloadLinks?: string[];
}

const initialLibrary: LibraryBook[] = [
  {
    id: 'LIB-001',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    cover: '/image/anh.png',
    format: 'ebook',
    status: 'reading',
    progress: 45,
    purchasedAt: '2024-11-04T10:00:00',
    downloadLinks: ['PDF', 'EPUB'],
  },
  {
    id: 'LIB-002',
    title: 'Design Patterns',
    author: 'Gang of Four',
    cover: '/image/anh.png',
    format: 'ebook',
    status: 'completed',
    progress: 100,
    purchasedAt: '2024-10-20T10:00:00',
    downloadLinks: ['PDF'],
  },
  {
    id: 'LIB-003',
    title: 'Refactoring',
    author: 'Martin Fowler',
    cover: '/image/anh.png',
    format: 'physical',
    status: 'not-started',
    purchasedAt: '2024-09-11T10:00:00',
  },
  {
    id: 'LIB-004',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    cover: '/image/anh.png',
    format: 'ebook',
    status: 'reading',
    progress: 70,
    purchasedAt: '2024-11-01T10:00:00',
    downloadLinks: ['EPUB'],
  },
];

const statusConfig: Record<
  ReadingStatus,
  { label: string; color: string; icon: JSX.Element }
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
};

export default function LibraryPage() {
  const [filter, setFilter] = useState<'all' | 'reading' | 'ebook' | 'physical'>(
    'all'
  );
  const [library, setLibrary] = useState<LibraryBook[]>(initialLibrary);

  const updateReadingProgress = (bookId: string, newPercent: number) => {
    setLibrary((prev) =>
      prev.map((book) => {
        if (book.id !== bookId) return book;
        if (book.format !== 'ebook') return book;

        const percent = Math.max(0, Math.min(100, Math.floor(newPercent)));
        let nextStatus: ReadingStatus = book.status;

        if (percent >= 100) nextStatus = 'completed';
        else if (percent > 0) nextStatus = 'reading';
        else nextStatus = 'not-started';

        return { ...book, progress: percent, status: nextStatus };
      })
    );
  };

  const filteredBooks = library.filter((book) => {
    if (filter === 'all') return true;
    if (filter === 'reading') return book.status === 'reading';
    if (filter === 'ebook') return book.format === 'ebook';
    if (filter === 'physical') return book.format === 'physical';
    return true;
  });

  const handleRead = (bookId: string) => {
    alert(`Mở đọc sách ${bookId}`);
    updateReadingProgress(bookId, 60);
  };

  const handleDownload = (bookId: string, format: string) => {
    alert(`Tải ${format} cho sách ${bookId}`);
  };

  const totalBooks = library.length;
  const totalCompleted = library.filter((b) => b.status === 'completed').length;
  const totalReading = library.filter((b) => b.status === 'reading').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Tổng số sách</p><p className="text-2xl font-bold">{totalBooks}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Đã hoàn thành</p><p className="text-2xl font-bold">{totalCompleted}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Đang đọc</p><p className="text-2xl font-bold">{totalReading}</p></CardContent></Card>
        </div>

        {/* Filter */}
        <Card className="w-fit">
          <CardContent className="p-1 flex gap-2">
            <Button size="sm" variant={filter === 'all' ? 'primary' : 'ghost'} onClick={() => setFilter('all')}>Tất cả ({totalBooks})</Button>
            <Button size="sm" variant={filter === 'reading' ? 'primary' : 'ghost'} onClick={() => setFilter('reading')}>Đang đọc</Button>
            <Button size="sm" variant={filter === 'ebook' ? 'primary' : 'ghost'} onClick={() => setFilter('ebook')}>eBook</Button>
            <Button size="sm" variant={filter === 'physical' ? 'primary' : 'ghost'} onClick={() => setFilter('physical')}>Sách giấy</Button>
          </CardContent>
        </Card>

        {/* List */}
        {filteredBooks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold">Chưa có sách nào</h3>
              <p className="text-gray-500 mt-1">Các sách bạn mua sẽ xuất hiện tại đây</p>
              <Button className="mt-3">Mua sách ngay</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map((book) => (
              <Card key={book.id}>
                <CardContent className="p-4 flex gap-4">
                  <div className="relative w-20 h-28 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={book.cover} alt={book.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{book.title}</h3>
                        <p className="text-sm text-gray-500">{book.author}</p>
                      </div>
                      <Badge className={book.format === 'ebook' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                        {book.format === 'ebook' ? 'eBook' : 'Sách giấy'}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <Badge className={statusConfig[book.status].color + ' flex items-center gap-1'}>
                        {statusConfig[book.status].icon}
                        {statusConfig[book.status].label}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Mua: {new Date(book.purchasedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    {book.format === 'ebook' && typeof book.progress === 'number' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Tiến độ đọc</span>
                          <span>{book.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${book.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions - chỉnh cùng hàng */}
                    <div className="mt-4 flex items-center gap-2 flex-wrap md:flex-nowrap">
                      {book.format === 'ebook' ? (
                        <>
                          <Button size="sm" onClick={() => handleRead(book.id)} className="flex items-center gap-1">
                            {/* <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 7v14" />
                              <path d="M16 12h2" />
                              <path d="M16 8h2" />
                              <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                              <path d="M6 12h2" />
                              <path d="M6 8h2" />
                            </svg> */}
                            Đọc ngay
                          </Button>
                          {book.downloadLinks?.map((f) => (
                            <Button
                              key={f}
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(book.id, f)}
                              className="flex items-center gap-1"
                            >
                              <svg
                                className="w-4 h-4"
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
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700 flex items-center gap-1">
                          Đã mua
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
