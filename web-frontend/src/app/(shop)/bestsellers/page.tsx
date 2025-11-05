"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

// ============================================================================
// TYPES
// ============================================================================
type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  originalPrice?: number;
  cover: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  rank: number;
  lastSoldDate: Date; // Date of last sale for filtering
};

type TimeRange = "week" | "month" | "year" | "all";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
// Generate random date within a range
const getRandomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

// ============================================================================
// MOCK DATA - Replace with real API
// ============================================================================
const MOCK_BESTSELLERS: Book[] = [
  {
    id: "1",
    rank: 1,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    category: "Lập trình",
    price: 350000,
    originalPrice: 450000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1234,
    soldCount: 5432,
    lastSoldDate: getRandomDate(3), // Sold within last 3 days (this week)
  },
  {
    id: "2",
    rank: 2,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    category: "Khoa học máy tính",
    price: 450000,
    originalPrice: 550000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 1567,
    soldCount: 4821,
    lastSoldDate: getRandomDate(5), // Sold within last 5 days (this week)
  },
  {
    id: "3",
    rank: 3,
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Gang of Four",
    category: "Lập trình",
    price: 280000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 856,
    soldCount: 4123,
    lastSoldDate: getRandomDate(15), // Sold within last 15 days (this month)
  },
  {
    id: "4",
    rank: 4,
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    category: "Lập trình",
    price: 320000,
    originalPrice: 400000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 645,
    soldCount: 3876,
    lastSoldDate: getRandomDate(20), // Sold within last 20 days (this month)
  },
  {
    id: "5",
    rank: 5,
    title: "Head First Design Patterns",
    author: "Eric Freeman",
    category: "Lập trình",
    price: 380000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 934,
    soldCount: 3654,
    lastSoldDate: getRandomDate(10), // Sold within last 10 days (this month)
  },
  {
    id: "6",
    rank: 6,
    title: "Code Complete",
    author: "Steve McConnell",
    category: "Lập trình",
    price: 420000,
    originalPrice: 500000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 1123,
    soldCount: 3421,
    lastSoldDate: getRandomDate(7), // This week
  },
  {
    id: "7",
    rank: 7,
    title: "Refactoring: Improving the Design of Existing Code",
    author: "Martin Fowler",
    category: "Lập trình",
    price: 290000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 432,
    soldCount: 3198,
    lastSoldDate: getRandomDate(25), // This month
  },
  {
    id: "8",
    rank: 8,
    title: "Cracking the Coding Interview",
    author: "Gayle Laakmann McDowell",
    category: "Lập trình",
    price: 340000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2134,
    soldCount: 2987,
    lastSoldDate: getRandomDate(30), // This month
  },
  {
    id: "9",
    rank: 9,
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    category: "Lập trình",
    price: 180000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 892,
    soldCount: 2765,
    lastSoldDate: getRandomDate(60), // This year
  },
  {
    id: "10",
    rank: 10,
    title: "Eloquent JavaScript",
    author: "Marijn Haverbeke",
    category: "Lập trình",
    price: 250000,
    originalPrice: 300000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 723,
    soldCount: 2543,
    lastSoldDate: getRandomDate(90), // This year
  },
  {
    id: "11",
    rank: 11,
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    category: "Lập trình",
    price: 220000,
    originalPrice: 280000,
    cover: "/image/anh.png",
    rating: 4.4,
    reviewCount: 456,
    soldCount: 2321,
    lastSoldDate: getRandomDate(120), // This year
  },
  {
    id: "12",
    rank: 12,
    title: "The Art of Computer Programming",
    author: "Donald Knuth",
    category: "Khoa học máy tính",
    price: 680000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 567,
    soldCount: 2154,
    lastSoldDate: getRandomDate(150), // This year
  },
  {
    id: "13",
    rank: 13,
    title: "Sapiens: Lược Sử Loài Người",
    author: "Yuval Noah Harari",
    category: "Khoa học",
    price: 280000,
    originalPrice: 350000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3421,
    soldCount: 2098,
    lastSoldDate: getRandomDate(180), // This year
  },
  {
    id: "14",
    rank: 14,
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    category: "Kỹ năng sống",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 5678,
    soldCount: 1987,
    lastSoldDate: getRandomDate(200), // This year
  },
  {
    id: "15",
    rank: 15,
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    category: "Văn học",
    price: 85000,
    originalPrice: 110000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4321,
    soldCount: 1876,
    lastSoldDate: getRandomDate(250), // This year
  },
  {
    id: "16",
    rank: 16,
    title: "Tư Duy Nhanh Và Chậm",
    author: "Daniel Kahneman",
    category: "Tâm lý học",
    price: 245000,
    originalPrice: 310000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1234,
    soldCount: 1765,
    lastSoldDate: getRandomDate(300), // This year
  },
  {
    id: "17",
    rank: 17,
    title: "7 Thói Quen Hiệu Quả",
    author: "Stephen Covey",
    category: "Kỹ năng sống",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2345,
    soldCount: 1654,
    lastSoldDate: getRandomDate(330), // Older (all time)
  },
  {
    id: "18",
    rank: 18,
    title: "Atomic Habits",
    author: "James Clear",
    category: "Kỹ năng sống",
    price: 195000,
    originalPrice: 250000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 3456,
    soldCount: 1543,
    lastSoldDate: getRandomDate(360), // Older (all time)
  },
  {
    id: "19",
    rank: 19,
    title: "Nghĩ Giàu Làm Giàu",
    author: "Napoleon Hill",
    category: "Kinh doanh",
    price: 115000,
    originalPrice: 145000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 1987,
    soldCount: 1432,
    lastSoldDate: getRandomDate(400), // Older (all time)
  },
  {
    id: "20",
    rank: 20,
    title: "Quẳng Gánh Lo Đi Mà Vui Sống",
    author: "Dale Carnegie",
    category: "Kỹ năng sống",
    price: 98000,
    originalPrice: 125000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2876,
    soldCount: 1321,
    lastSoldDate: getRandomDate(450), // Older (all time)
  },
  {
    id: "21",
    rank: 21,
    title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    author: "Rosie Nguyễn",
    category: "Kỹ năng sống",
    price: 89000,
    originalPrice: 110000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 3210,
    soldCount: 1234,
    lastSoldDate: getRandomDate(500), // Older (all time)
  },
  {
    id: "22",
    rank: 22,
    title: "Cà Phê Cùng Tony",
    author: "Tony Buổi Sáng",
    category: "Kỹ năng sống",
    price: 105000,
    originalPrice: 135000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 2456,
    soldCount: 1198,
    lastSoldDate: getRandomDate(550), // Older (all time)
  },
  {
    id: "23",
    rank: 23,
    title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
    author: "Nguyễn Nhật Ánh",
    category: "Văn học",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4567,
    soldCount: 1156,
    lastSoldDate: getRandomDate(600), // Older (all time)
  },
  {
    id: "24",
    rank: 24,
    title: "Mắt Biếc",
    author: "Nguyễn Nhật Ánh",
    category: "Văn học",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3987,
    soldCount: 1087,
    lastSoldDate: getRandomDate(650), // Older (all time)
  },
  {
    id: "25",
    rank: 25,
    title: "Dế Mèn Phiêu Lưu Ký",
    author: "Tô Hoài",
    category: "Thiếu nhi",
    price: 78000,
    originalPrice: 95000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2345,
    soldCount: 1023,
    lastSoldDate: getRandomDate(700), // Older (all time)
  },
  {
    id: "26",
    rank: 26,
    title: "Bố Già",
    author: "Mario Puzo",
    category: "Văn học",
    price: 198000,
    originalPrice: 250000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 5432,
    soldCount: 987,
    lastSoldDate: getRandomDate(720), // Older (all time)
  },
  {
    id: "27",
    rank: 27,
    title: "Chiến Tranh Tiền Tệ",
    author: "Song Hongbing",
    category: "Kinh tế",
    price: 165000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1876,
    soldCount: 945,
    lastSoldDate: getRandomDate(750), // Older (all time)
  },
  {
    id: "28",
    rank: 28,
    title: "Khéo Ăn Nói Sẽ Có Được Thiên Hạ",
    author: "Trác Nhã",
    category: "Kỹ năng sống",
    price: 88000,
    originalPrice: 115000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 2123,
    soldCount: 912,
    lastSoldDate: getRandomDate(800), // Older (all time)
  },
  {
    id: "29",
    rank: 29,
    title: "Payback Time - Ngày Đòi Nợ",
    author: "Phil Town",
    category: "Đầu tư",
    price: 145000,
    originalPrice: 185000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1543,
    soldCount: 876,
    lastSoldDate: getRandomDate(850), // Older (all time)
  },
  {
    id: "30",
    rank: 30,
    title: "Homo Deus: Lược Sử Tương Lai",
    author: "Yuval Noah Harari",
    category: "Khoa học",
    price: 295000,
    originalPrice: 370000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2987,
    soldCount: 845,
    lastSoldDate: getRandomDate(900), // Older (all time)
  },
  {
    id: "31",
    rank: 31,
    title: "Không Diệt Không Sinh Đừng Sợ Hãi",
    author: "Thích Nhất Hạnh",
    category: "Tâm linh",
    price: 118000,
    originalPrice: 150000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 2654,
    soldCount: 812,
    lastSoldDate: getRandomDate(950), // Older (all time)
  },
  {
    id: "32",
    rank: 32,
    title: "Hạt Giống Tâm Hồn",
    author: "Jack Canfield",
    category: "Kỹ năng sống",
    price: 135000,
    originalPrice: 170000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 3124,
    soldCount: 789,
    lastSoldDate: getRandomDate(1000), // Older (all time)
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function BestsellersPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 14; // 2 rows x 7 books each

  // Filter books by time range
  const filterBooksByTimeRange = (books: Book[], range: TimeRange): Book[] => {
    const now = new Date();
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    
    return books.filter((book) => {
      const daysDifference = Math.floor((now.getTime() - book.lastSoldDate.getTime()) / millisecondsInDay);
      
      switch (range) {
        case "week":
          return daysDifference <= 7;
        case "month":
          return daysDifference <= 30;
        case "year":
          return daysDifference <= 365;
        case "all":
        default:
          return true;
      }
    });
  };

  // Get filtered books based on time range
  const filteredBooks = filterBooksByTimeRange(MOCK_BESTSELLERS, timeRange);

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  // Reset page when time range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [timeRange]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Calculate discount
  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  // Get rank badge color
  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (rank === 3) return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
    return "bg-gray-200 text-gray-700";
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách bán chạy</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-orange-500"
            >
              <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900">Sách Bán Chạy</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Top {MOCK_BESTSELLERS.length} cuốn sách được yêu thích nhất
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button
            variant={timeRange === "week" ? "primary" : "secondary"}
            onClick={() => setTimeRange("week")}
            className="rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            Tuần này
          </Button>
          <Button
            variant={timeRange === "month" ? "primary" : "secondary"}
            onClick={() => setTimeRange("month")}
            className="rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            Tháng này
          </Button>
          <Button
            variant={timeRange === "year" ? "primary" : "secondary"}
            onClick={() => setTimeRange("year")}
            className="rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            Năm nay
          </Button>
          <Button
            variant={timeRange === "all" ? "primary" : "secondary"}
            onClick={() => setTimeRange("all")}
            className="rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Mọi lúc
          </Button>
        </div>

        {/* Stats Banner */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Tổng lượt bán</p>
                <p className="text-3xl font-bold">
                  {filteredBooks.reduce((sum, book) => sum + book.soldCount, 0).toLocaleString()}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-30"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Tổng đánh giá</p>
                <p className="text-3xl font-bold">
                  {filteredBooks.reduce((sum, book) => sum + book.reviewCount, 0).toLocaleString()}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="opacity-30"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Đánh giá trung bình</p>
                <p className="text-3xl font-bold">
                  {filteredBooks.length > 0 
                    ? (
                        filteredBooks.reduce((sum, book) => sum + book.rating, 0) /
                        filteredBooks.length
                      ).toFixed(1)
                    : "0.0"
                  }{" "}
                  ⭐
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-30"
              >
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M12 2v2" />
                <path d="M12 22v-2" />
                <path d="m17 20.66-1-1.73" />
                <path d="M11 10.27 7 3.34" />
                <path d="m20.66 17-1.73-1" />
                <path d="m3.34 7 1.73 1" />
                <path d="M14 12h8" />
                <path d="M2 12h2" />
                <path d="m20.66 7-1.73 1" />
                <path d="m3.34 17 1.73-1" />
                <path d="m17 3.34-1 1.73" />
                <path d="m11 13.73-4 6.93" />
              </svg>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between px-2">
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold text-gray-900">{startIndex + 1}</span> -{" "}
            <span className="font-semibold text-gray-900">{Math.min(endIndex, MOCK_BESTSELLERS.length)}</span> trong tổng số{" "}
            <span className="font-semibold text-gray-900">{MOCK_BESTSELLERS.length}</span> sách
          </p>
          <p className="text-sm text-gray-500">
            Trang {currentPage} / {totalPages}
          </p>
        </div>

        {/* Bestsellers Grid - 2 rows of 7 books each */}
        <div className="space-y-8">
          {/* First Row */}
          <div className="flex flex-wrap gap-9 justify-start">
            {paginatedBooks.slice(0, 7).map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="flex h-[320px] w-[180px] flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group relative"
              >
                {/* Rank Badge */}
                <div
                  className={`absolute -top-2 -left-2 z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${getRankBadgeClass(
                    book.rank
                  )}`}
                >
                  {book.rank}
                </div>

                {/* Book Cover */}
                <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                  <Image
                    src={book.cover}
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Discount Badge - Top Left */}
                  {book.originalPrice && (
                    <Badge variant="danger" className="absolute top-2 left-2 text-xs">
                      -{calculateDiscount(book.originalPrice, book.price)}%
                    </Badge>
                  )}

                  {/* HOT Badge - Top Right (for top 10) */}
                  {book.rank <= 10 && (
                    <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg animate-pulse">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="inline-block mr-1"
                      >
                        <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
                      </svg>
                      HOT
                    </Badge>
                  )}

                  {/* Sold Count Badge - Bottom */}
                  <Badge className="absolute bottom-2 left-2 text-xs bg-black/70 text-white">
                    Đã bán: {book.soldCount.toLocaleString()}
                  </Badge>
                </div>

                {/* Book Info */}
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
                <p className="text-xs text-gray-600 mb-1">{book.author}</p>

                {/* Price */}
                <div className="flex items-center gap-2 mt-auto">
                  <p className="text-blue-600 font-bold text-sm">{formatPrice(book.price)}</p>
                  {book.originalPrice && (
                    <p className="text-xs text-gray-400 line-through">
                      {formatPrice(book.originalPrice)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Second Row */}
          <div className="flex flex-wrap gap-9 justify-start">
            {paginatedBooks.slice(7, 14).map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="flex h-[320px] w-[180px] flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group relative"
              >
              {/* Rank Badge */}
              <div
                className={`absolute -top-2 -left-2 z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${getRankBadgeClass(
                  book.rank
                )}`}
              >
                {book.rank}
              </div>

              {/* Book Cover */}
              <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Discount Badge - Top Left */}
                {book.originalPrice && (
                  <Badge variant="danger" className="absolute top-2 left-2 text-xs">
                    -{calculateDiscount(book.originalPrice, book.price)}%
                  </Badge>
                )}

                {/* HOT Badge - Top Right (for top 10) */}
                {book.rank <= 10 && (
                  <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg animate-pulse">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="inline-block mr-1"
                    >
                      <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
                    </svg>
                    HOT
                  </Badge>
                )}

                {/* Sold Count Badge - Bottom */}
                <Badge className="absolute bottom-2 left-2 text-xs bg-black/70 text-white">
                  Đã bán: {book.soldCount.toLocaleString()}
                </Badge>
              </div>

              {/* Book Info */}
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
              <p className="text-xs text-gray-600 mb-1">{book.author}</p>

              {/* Price */}
              <div className="flex items-center gap-2 mt-auto">
                <p className="text-blue-600 font-bold text-sm">{formatPrice(book.price)}</p>
                {book.originalPrice && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatPrice(book.originalPrice)}
                  </p>
                )}
              </div>
            </Link>
          ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </main>
  );
}
