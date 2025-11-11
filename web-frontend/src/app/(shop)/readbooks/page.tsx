// Read Books Page - Thư viện đọc của tôi
"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui";

// Types
interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  progress: number; // 0-100%
  currentPage: number;
  totalPages: number;
  rating?: number;
  startDate: string;
  lastRead: string;
  status: "reading" | "completed" | "want-to-read";
  genre: string;
  estimatedTimeLeft?: string;
  notes?: string;
}

// Mock data
const myBooks: Book[] = [
  {
    id: 1,
    title: "Clean Code",
    author: "Robert C. Martin",
    cover: "/image/anh.png",
    progress: 65,
    currentPage: 260,
    totalPages: 400,
    rating: 5,
    startDate: "2024-10-15",
    lastRead: "2024-11-06",
    status: "reading",
    genre: "Lập trình",
    estimatedTimeLeft: "3 giờ",
    notes: "Chương về functions rất hay!"
  },
  {
    id: 2,
    title: "Đắc nhân tâm",
    author: "Dale Carnegie",
    cover: "/image/anh.png",
    progress: 100,
    currentPage: 320,
    totalPages: 320,
    rating: 5,
    startDate: "2024-09-01",
    lastRead: "2024-10-20",
    status: "completed",
    genre: "Kỹ năng sống",
    notes: "Sách rất hay, đã đọc xong!"
  },
  {
    id: 3,
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    cover: "/image/anh.png",
    progress: 0,
    currentPage: 0,
    totalPages: 352,
    startDate: "",
    lastRead: "",
    status: "want-to-read",
    genre: "Lập trình",
    notes: "Muốn đọc sau khi hoàn thành Clean Code"
  },
  {
    id: 4,
    title: "Design Patterns",
    author: "Gang of Four",
    cover: "/image/anh.png",
    progress: 45,
    currentPage: 180,
    totalPages: 400,
    rating: 4,
    startDate: "2024-10-01",
    lastRead: "2024-11-05",
    status: "reading",
    genre: "Lập trình",
    estimatedTimeLeft: "5 giờ",
    notes: "Các pattern rất hữu ích"
  },
  {
    id: 5,
    title: "Tuổi trẻ đáng giá bao nhiêu",
    author: "Rosie Nguyễn",
    cover: "/image/anh.png",
    progress: 100,
    currentPage: 280,
    totalPages: 280,
    rating: 4,
    startDate: "2024-08-15",
    lastRead: "2024-09-10",
    status: "completed",
    genre: "Kỹ năng sống",
    notes: "Truyền động lực rất tốt"
  },
  {
    id: 6,
    title: "Refactoring",
    author: "Martin Fowler",
    cover: "/image/anh.png",
    progress: 0,
    currentPage: 0,
    totalPages: 448,
    startDate: "",
    lastRead: "",
    status: "want-to-read",
    genre: "Lập trình",
    notes: ""
  },
  {
    id: 7,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    cover: "/image/anh.png",
    progress: 30,
    currentPage: 360,
    totalPages: 1200,
    rating: 5,
    startDate: "2024-09-15",
    lastRead: "2024-11-04",
    status: "reading",
    genre: "Lập trình",
    estimatedTimeLeft: "20 giờ",
    notes: "Sách khó nhưng rất chi tiết"
  },
  {
    id: 8,
    title: "Nhà giả kim",
    author: "Paulo Coelho",
    cover: "/image/anh.png",
    progress: 100,
    currentPage: 208,
    totalPages: 208,
    rating: 5,
    startDate: "2024-07-20",
    lastRead: "2024-08-05",
    status: "completed",
    genre: "Văn học",
    notes: "Câu chuyện ý nghĩa về hành trình tìm kiếm ước mơ"
  },
  {
    id: 9,
    title: "Sapiens: Lược sử loài người",
    author: "Yuval Noah Harari",
    cover: "/image/anh.png",
    progress: 55,
    currentPage: 275,
    totalPages: 500,
    rating: 5,
    startDate: "2024-10-10",
    lastRead: "2024-11-06",
    status: "reading",
    genre: "Khoa học",
    estimatedTimeLeft: "6 giờ",
    notes: "Góc nhìn mới về lịch sử nhân loại"
  },
  {
    id: 10,
    title: "Homo Deus",
    author: "Yuval Noah Harari",
    cover: "/image/anh.png",
    progress: 0,
    currentPage: 0,
    totalPages: 464,
    startDate: "",
    lastRead: "",
    status: "want-to-read",
    genre: "Khoa học",
    notes: "Đọc sau khi hoàn thành Sapiens"
  },
  {
    id: 11,
    title: "7 thói quen hiệu quả",
    author: "Stephen Covey",
    cover: "/image/anh.png",
    progress: 100,
    currentPage: 380,
    totalPages: 380,
    rating: 5,
    startDate: "2024-06-01",
    lastRead: "2024-07-15",
    status: "completed",
    genre: "Kỹ năng sống",
    notes: "Must read cho phát triển bản thân"
  },
  {
    id: 12,
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    cover: "/image/anh.png",
    progress: 80,
    currentPage: 240,
    totalPages: 300,
    rating: 4,
    startDate: "2024-10-20",
    lastRead: "2024-11-06",
    status: "reading",
    genre: "Lập trình",
    estimatedTimeLeft: "2 giờ",
    notes: "JavaScript deep dive tuyệt vời"
  },
  {
    id: 13,
    title: "Nghĩ giàu làm giàu",
    author: "Napoleon Hill",
    cover: "/image/anh.png",
    progress: 0,
    currentPage: 0,
    totalPages: 320,
    startDate: "",
    lastRead: "",
    status: "want-to-read",
    genre: "Kinh doanh",
    notes: "Bạn bè giới thiệu"
  },
  {
    id: 14,
    title: "Bố già",
    author: "Mario Puzo",
    cover: "/image/anh.png",
    progress: 100,
    currentPage: 448,
    totalPages: 448,
    rating: 5,
    startDate: "2024-05-10",
    lastRead: "2024-06-20",
    status: "completed",
    genre: "Văn học",
    notes: "Kiệt tác văn học!"
  },
  {
    id: 15,
    title: "Quẳng gánh lo đi mà vui sống",
    author: "Dale Carnegie",
    cover: "/image/anh.png",
    progress: 0,
    currentPage: 0,
    totalPages: 352,
    startDate: "",
    lastRead: "",
    status: "want-to-read",
    genre: "Kỹ năng sống",
    notes: ""
  },
];

export default function ReadBooksPage() {
  const [activeTab, setActiveTab] = useState<"reading" | "completed" | "want-to-read">("reading");
  const [sortBy, setSortBy] = useState<"lastRead" | "progress" | "title">("lastRead");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  // Get unique genres
  const genres = useMemo(() => {
    const uniqueGenres = Array.from(new Set(myBooks.map(book => book.genre)));
    return ["all", ...uniqueGenres];
  }, []);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let filtered = myBooks.filter(book => book.status === activeTab);
    
    if (selectedGenre !== "all") {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "lastRead":
          if (activeTab === "want-to-read") return a.title.localeCompare(b.title);
          return new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime();
        case "progress":
          return b.progress - a.progress;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [activeTab, sortBy, selectedGenre]);

  // Statistics
  const stats = useMemo(() => {
    const reading = myBooks.filter(b => b.status === "reading");
    const completed = myBooks.filter(b => b.status === "completed");
    const wantToRead = myBooks.filter(b => b.status === "want-to-read");
    
    const totalPagesRead = completed.reduce((sum, book) => sum + book.totalPages, 0);
    const avgRating = completed.filter(b => b.rating).reduce((sum, b) => sum + (b.rating || 0), 0) / completed.filter(b => b.rating).length;

    return {
      reading: reading.length,
      completed: completed.length,
      wantToRead: wantToRead.length,
      totalPagesRead,
      avgRating: avgRating.toFixed(1),
    };
  }, []);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "reading": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      case "want-to-read": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case "reading": return "Đang đọc";
      case "completed": return "Đã đọc";
      case "want-to-read": return "Muốn đọc";
      default: return "";
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold">Thư viện đọc của tôi</h1>
              <p className="text-white/80 mt-1">Quản lý và theo dõi tiến trình đọc sách</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-white/70 text-sm mb-1">Đang đọc</div>
              <div className="text-3xl font-bold">{stats.reading}</div>
              <div className="text-white/60 text-xs mt-1">cuốn sách</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-white/70 text-sm mb-1">Đã hoàn thành</div>
              <div className="text-3xl font-bold">{stats.completed}</div>
              <div className="text-white/60 text-xs mt-1">cuốn sách</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-white/70 text-sm mb-1">Muốn đọc</div>
              <div className="text-3xl font-bold">{stats.wantToRead}</div>
              <div className="text-white/60 text-xs mt-1">cuốn sách</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-white/70 text-sm mb-1">Tổng trang đã đọc</div>
              <div className="text-3xl font-bold">{stats.totalPagesRead.toLocaleString()}</div>
              <div className="text-white/60 text-xs mt-1">trang</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-white/70 text-sm mb-1">Đánh giá TB</div>
              <div className="text-3xl font-bold">{stats.avgRating} ⭐</div>
              <div className="text-white/60 text-xs mt-1">trên 5 sao</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 inline-flex gap-2">
          <button
            onClick={() => setActiveTab("reading")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === "reading"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            📖 Đang đọc ({stats.reading})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === "completed"
                ? "bg-green-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            ✅ Đã đọc ({stats.completed})
          </button>
          <button
            onClick={() => setActiveTab("want-to-read")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${
              activeTab === "want-to-read"
                ? "bg-gray-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            🔖 Muốn đọc ({stats.wantToRead})
          </button>
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
                {activeTab !== "want-to-read" && (
                  <option value="lastRead">Đọc gần nhất</option>
                )}
                {activeTab === "reading" && (
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
                    {genre === "all" ? "Tất cả" : genre}
                  </option>
                ))}
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
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có sách nào
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === "reading" && "Bạn chưa đang đọc sách nào. Hãy bắt đầu đọc một cuốn sách mới!"}
              {activeTab === "completed" && "Bạn chưa hoàn thành sách nào. Hãy tiếp tục đọc!"}
              {activeTab === "want-to-read" && "Bạn chưa có sách nào trong danh sách muốn đọc."}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <Badge variant="secondary" className="text-xs">
                        {book.genre}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar (for reading books) */}
                  {book.status === "reading" && (
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
                        <div className="text-xs text-gray-500 mt-1">
                          ⏱️ Còn khoảng {book.estimatedTimeLeft}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed Info */}
                  {book.status === "completed" && (
                    <div className="mt-4 space-y-2">
                      {book.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={i < book.rating! ? "text-yellow-400" : "text-gray-300"}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {book.rating}/5
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        ✅ Hoàn thành: {formatDate(book.lastRead)}
                      </div>
                      <div className="text-sm text-gray-600">
                        📖 {book.totalPages} trang
                      </div>
                    </div>
                  )}

                  {/* Want to Read Info */}
                  {book.status === "want-to-read" && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2">
                        📖 {book.totalPages} trang
                      </div>
                      <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium">
                        Bắt đầu đọc
                      </button>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                    {book.startDate && (
                      <div className="text-xs text-gray-500">
                        📅 Bắt đầu: {formatDate(book.startDate)}
                      </div>
                    )}
                    {book.lastRead && book.status !== "want-to-read" && (
                      <div className="text-xs text-gray-500">
                        🕒 Đọc lần cuối: {formatDate(book.lastRead)}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {book.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-xs font-medium text-yellow-800 mb-1">📝 Ghi chú:</div>
                      <div className="text-xs text-yellow-700">{book.notes}</div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    {book.status === "reading" && (
                      <>
                        <Link
                          href={`/books/${book.id}/read`}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium text-center"
                        >
                          Tiếp tục đọc
                        </Link>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                          ⚙️
                        </button>
                      </>
                    )}
                    {book.status === "completed" && (
                      <>
                        <Link
                          href={`/books/${book.id}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-center"
                        >
                          Xem chi tiết
                        </Link>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
                          📝 Review
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reading Challenge Section */}
        {activeTab === "reading" && (
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">🎯 Thử thách đọc sách 2024</h3>
                <p className="text-white/80">Đặt mục tiêu và theo dõi tiến trình của bạn</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{stats.completed}/50</div>
                <div className="text-white/80 text-sm">cuốn sách</div>
                <div className="mt-3">
                  <div className="w-48 h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${(stats.completed / 50) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-white/80 mt-2">
                    {Math.round((stats.completed / 50) * 100)}% hoàn thành
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
