"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

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
  stock: number;
  isBestseller?: boolean;
  isNew?: boolean;
};

type SortOption = "popular" | "price-asc" | "price-desc" | "rating" | "name";
type PriceRange =
  | "all"
  | "under-100k"
  | "100k-300k"
  | "300k-500k"
  | "over-500k";

const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "Atomic Habits - Thói Quen Nguyên Tử",
    author: "James Clear",
    category: "Kỹ năng sống",
    price: 195000,
    originalPrice: 250000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 3456,
    stock: 120,
    isBestseller: true,
  },
  {
    id: "2",
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    category: "Kỹ năng sống",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 5678,
    stock: 230,
    isBestseller: true,
  },
  {
    id: "3",
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    category: "Văn học",
    price: 85000,
    originalPrice: 110000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4321,
    stock: 180,
    isBestseller: true,
  },
  {
    id: "4",
    title: "Sapiens: Lược Sử Loài Người",
    author: "Yuval Noah Harari",
    category: "Khoa học",
    price: 280000,
    originalPrice: 350000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3421,
    stock: 90,
    isBestseller: true,
  },
  {
    id: "5",
    title: "Chiến Tranh Tiền Tệ",
    author: "Song Hongbing",
    category: "Kinh tế",
    price: 165000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1876,
    stock: 45,
  },
  {
    id: "6",
    title: "Mắt Biếc",
    author: "Nguyễn Nhật Ánh",
    category: "Văn học",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3987,
    stock: 150,
    isNew: true,
  },
  {
    id: "7",
    title: "Tư Duy Nhanh Và Chậm",
    author: "Daniel Kahneman",
    category: "Tâm lý học",
    price: 245000,
    originalPrice: 310000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1234,
    stock: 60,
  },
  {
    id: "8",
    title: "Nghĩ Giàu Làm Giàu",
    author: "Napoleon Hill",
    category: "Kinh doanh",
    price: 115000,
    originalPrice: 145000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 1987,
    stock: 110,
  },
  {
    id: "9",
    title: "7 Thói Quen Hiệu Quả",
    author: "Stephen Covey",
    category: "Kỹ năng sống",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2345,
    stock: 95,
  },
  {
    id: "10",
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Lập trình",
    price: 350000,
    originalPrice: 450000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1234,
    stock: 45,
    isBestseller: true,
  },
  {
    id: "11",
    title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
    author: "Nguyễn Nhật Ánh",
    category: "Văn học",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4567,
    stock: 140,
    isNew: true,
  },
  {
    id: "12",
    title: "Homo Deus: Lược Sử Tương Lai",
    author: "Yuval Noah Harari",
    category: "Khoa học",
    price: 295000,
    originalPrice: 370000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2987,
    stock: 75,
  },
  {
    id: "13",
    title: "The Lean Startup",
    author: "Eric Ries",
    category: "Kinh doanh",
    price: 185000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 876,
    stock: 55,
  },
  {
    id: "14",
    title: "Càng Bình Tĩnh Càng Hạnh Phúc",
    author: "Megumi",
    category: "Tâm lý học",
    price: 98000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 2134,
    stock: 180,
    isNew: true,
  },
  {
    id: "15",
    title: "Đừng Bao Giờ Đi Ăn Một Mình",
    author: "Keith Ferrazzi",
    category: "Kỹ năng sống",
    price: 155000,
    originalPrice: 195000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 876,
    stock: 70,
  },
  {
    id: "16",
    title: "Nghệ Thuật Bán Hàng Vĩ Đại",
    author: "Brian Tracy",
    category: "Kinh doanh",
    price: 168000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 876,
    stock: 85,
  },
  {
    id: "17",
    title: "Số Đỏ",
    author: "Vũ Trọng Phụng",
    category: "Văn học",
    price: 115000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2345,
    stock: 95,
  },
  {
    id: "18",
    title: "Truyện Kiều",
    author: "Nguyễn Du",
    category: "Văn học",
    price: 185000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4567,
    stock: 110,
  },
  {
    id: "19",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Kỹ năng sống",
    price: 175000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1987,
    stock: 65,
  },
  {
    id: "20",
    title: "Design Patterns",
    author: "Gang of Four",
    category: "Lập trình",
    price: 420000,
    originalPrice: 500000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 856,
    stock: 35,
  },
  {
    id: "21",
    title: "Kinh Tế Học Vi Mô",
    author: "N. Gregory Mankiw",
    category: "Kinh tế",
    price: 275000,
    originalPrice: 340000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1987,
    stock: 50,
  },
  {
    id: "22",
    title: "Tuyển Tập Thơ Xuân Diệu",
    author: "Xuân Diệu",
    category: "Văn học",
    price: 145000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 1234,
    stock: 80,
  },
  {
    id: "23",
    title: "Psychology of Money",
    author: "Morgan Housel",
    category: "Kinh tế",
    price: 195000,
    originalPrice: 245000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2876,
    stock: 90,
    isNew: true,
  },
  {
    id: "24",
    title: "Cây Cam Ngọt Của Tôi",
    author: "José Mauro de Vasconcelos",
    category: "Văn học",
    price: 135000,
    originalPrice: 170000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3456,
    stock: 120,
  },
];

// không dùng emoji nữa, chỉ giữ id + name
const CATEGORIES = [
  { id: "all", name: "Tất cả" },
  { id: "Văn học", name: "Văn học" },
  { id: "Kỹ năng sống", name: "Kỹ năng sống" },
  { id: "Kinh tế", name: "Kinh tế" },
  { id: "Kinh doanh", name: "Kinh doanh" },
  { id: "Khoa học", name: "Khoa học" },
  { id: "Lập trình", name: "Lập trình" },
  { id: "Tâm lý học", name: "Tâm lý học" },
];

// render icon svg theo category
const CategoryIcon = ({ id }: { id: string }) => {
  switch (id) {
    case "all":
      return (
        <svg
          className="inline-block mr-2"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      );
    case "Văn học":
      return (
        <svg
          className="inline-block mr-2"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5V5A2.5 2.5 0 0 1 6.5 2H20v17H6.5a2.5 2.5 0 1 0 0 5H20" />
        </svg>
      );
    case "Kỹ năng sống":
      return (
        <svg
          className="inline-block mr-2"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="m4.93 4.93 2.83 2.83" />
          <path d="m16.24 7.76 2.83-2.83" />
          <path d="m4.93 19.07 2.83-2.83" />
          <path d="m16.24 16.24 2.83 2.83" />
        </svg>
      );
    case "Kinh tế":
      return (
        <svg
          className="inline-block mr-2"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "Kinh doanh":
      return (
        <svg
          className="inline-block mr-2"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="15" width="7" height="6" rx="1" />
        </svg>
      );
    case "Khoa học":
      return (
        <svg
          className="inline-block mr-2"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82 8 8 0 0 1-2.75 2.75A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.51.42 8 8 0 0 1-3-.01A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.98.17 8 8 0 0 1-2.75-2.75A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.42-1.51 8 8 0 0 1 .01-3A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.17-1.98 8 8 0 0 1 2.75-2.75A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.51-.42 8 8 0 0 1 3 .01A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.98-.17 8 8 0 0 1 2.75 2.75A1.65 1.65 0 0 0 19.4 9c.41.42.6.99.49 1.56-.11.57-.11 1.17 0 1.74-.1.57.08 1.14.51 1.7Z" />
        </svg>
      );
    case "Lập trình":
      return (
        <svg
          className="inline-block mr-2"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 8-4 4 4 4" />
          <path d="m18 8 4 4-4 4" />
          <path d="m14.5 4-5 16" />
        </svg>
      );
    case "Tâm lý học":
      return (
        <svg
          className="inline-block mr-2"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 10a3 3 0 0 1 6 0v1h1a2 2 0 0 1 0 4h-1v3" />
          <path d="M12 19A7 7 0 1 1 5 5" />
        </svg>
      );
    default:
      return null;
  }
};

export default function AllBooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const searchedBooks = MOCK_BOOKS.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryBooks =
    selectedCategory === "all"
      ? searchedBooks
      : searchedBooks.filter((book) => book.category === selectedCategory);

  const priceFilteredBooks = categoryBooks.filter((book) => {
    switch (priceRange) {
      case "under-100k":
        return book.price < 100000;
      case "100k-300k":
        return book.price >= 100000 && book.price < 300000;
      case "300k-500k":
        return book.price >= 300000 && book.price < 500000;
      case "over-500k":
        return book.price >= 500000;
      default:
        return true;
    }
  });

  const sortedBooks = [...priceFilteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.reviewCount - a.reviewCount;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = sortedBooks.slice(startIndex, endIndex);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (range: PriceRange) => {
    setPriceRange(range);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return MOCK_BOOKS.length;
    return MOCK_BOOKS.filter((book) => book.category === categoryId).length;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Tất cả sách</span>
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
              className="text-blue-600"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900">Tất Cả Sách</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Khám phá {sortedBooks.length} đầu sách từ nhiều thể loại khác nhau
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sách, tác giả..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-5 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Danh mục:
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  variant={selectedCategory === cat.id ? "primary" : "outline"}
                  size="md"
                  className={selectedCategory === cat.id ? "shadow-lg" : ""}
                >
                  <CategoryIcon id={cat.id} />
                  {cat.name}
                  <span className="ml-2 text-xs opacity-75">
                    ({getCategoryCount(cat.id)})
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Price & Sort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price-range"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Khoảng giá:
              </label>
              <select
                id="price-range"
                value={priceRange}
                onChange={(e) =>
                  handlePriceRangeChange(e.target.value as PriceRange)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="under-100k">Dưới 100.000₫</option>
                <option value="100k-300k">100.000₫ - 300.000₫</option>
                <option value="300k-500k">300.000₫ - 500.000₫</option>
                <option value="over-500k">Trên 500.000₫</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sort-by"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Sắp xếp:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Result info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
            <span className="font-semibold">
              {Math.min(endIndex, sortedBooks.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-semibold">{sortedBooks.length}</span> sách
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
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
                className="text-orange-500"
              >
                <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
              </svg>
              <span className="text-gray-600">
                {MOCK_BOOKS.filter((b) => b.isBestseller).length} Best Seller
              </span>
            </div>
            <div className="flex items-center gap-2">
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
                className="text-green-500"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span className="text-gray-600">
                {MOCK_BOOKS.filter((b) => b.isNew).length} Sách mới
              </span>
            </div>
          </div>
        </div>

        {/* Books grid */}
        {paginatedBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {paginatedBooks.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
              >
                {/* Cover */}
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                  <Image
                    src={book.cover}
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Right badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {book.isBestseller && (
                      <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="inline-block mr-1"
                        >
                          <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
                        </svg>
                        HOT
                      </Badge>
                    )}
                    {book.isNew && (
                      <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg">
                        MỚI
                      </Badge>
                    )}
                  </div>

                  {/* stock badge */}
                  {book.stock < 10 && book.stock > 0 && (
                    <Badge
                      variant="warning"
                      className="absolute bottom-2 left-2 text-xs bg-amber-400 text-amber-900"
                    >
                      Chỉ còn {book.stock}
                    </Badge>
                  )}
                  {book.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="danger" className="text-sm font-bold">
                        HẾT HÀNG
                      </Badge>
                    </div>
                  )}

                  {/* bỏ badge giảm giá trên ảnh */}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600">{book.author}</p>
                  <p className="text-xs text-gray-500">{book.category}</p>

                  {/* Price */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <p className="text-red-600 font-bold text-sm">
                      {formatPrice(book.price)}
                    </p>
                    {book.originalPrice && (
                      <>
                        <p className="text-xs text-gray-400 line-through">
                          {formatPrice(book.originalPrice)}
                        </p>
                        <Badge variant="danger" className="text-xs font-bold">
                          -{calculateDiscount(book.originalPrice, book.price)}%
                        </Badge>
                      </>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 pt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-yellow-400"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-xs text-gray-600">{book.rating}</span>
                    <span className="text-xs text-gray-400">
                      ({book.reviewCount})
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy sách
            </h3>
            <p className="text-gray-600 mb-6">
              Không có sách nào phù hợp với bộ lọc của bạn.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setPriceRange("all");
                setCurrentPage(1);
              }}
              variant="primary"
              size="md"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mb-8">
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
