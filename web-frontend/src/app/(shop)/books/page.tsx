// app/books/page.tsx - Trang hiển thị tất cả sách
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Badge, Alert, Input, Breadcrumb } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

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
  stock: number;
  isBestseller?: boolean;
  isNew?: boolean;
};

type SortOption = "latest" | "popular" | "price-low" | "price-high" | "rating";
type ViewMode = "grid" | "list";

// ============================================================================
// MOCK DATA - Replace with real API
// ============================================================================
const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    category: "Lập trình",
    price: 350000,
    originalPrice: 450000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1234,
    stock: 45,
    isBestseller: true,
    isNew: false,
  },
  {
    id: "2",
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Gang of Four",
    category: "Lập trình",
    price: 280000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 856,
    stock: 23,
    isBestseller: true,
  },
  {
    id: "3",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    category: "Lập trình",
    price: 320000,
    originalPrice: 400000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 645,
    stock: 8,
    isNew: true,
  },
  {
    id: "4",
    title: "Refactoring: Improving the Design of Existing Code",
    author: "Martin Fowler",
    category: "Lập trình",
    price: 290000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 432,
    stock: 67,
  },
  {
    id: "5",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    category: "Khoa học máy tính",
    price: 450000,
    originalPrice: 550000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 1567,
    stock: 15,
    isBestseller: true,
  },
  {
    id: "6",
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    category: "Lập trình",
    price: 180000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 892,
    stock: 34,
    isNew: true,
  },
  {
    id: "7",
    title: "Eloquent JavaScript",
    author: "Marijn Haverbeke",
    category: "Lập trình",
    price: 250000,
    originalPrice: 300000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 723,
    stock: 2,
  },
  {
    id: "8",
    title: "Head First Design Patterns",
    author: "Eric Freeman",
    category: "Lập trình",
    price: 380000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 934,
    stock: 56,
    isBestseller: true,
  },
  {
    id: "9",
    title: "Code Complete",
    author: "Steve McConnell",
    category: "Lập trình",
    price: 420000,
    originalPrice: 500000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 1123,
    stock: 12,
  },
  {
    id: "10",
    title: "The Art of Computer Programming",
    author: "Donald Knuth",
    category: "Khoa học máy tính",
    price: 680000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 567,
    stock: 0,
  },
  {
    id: "11",
    title: "Cracking the Coding Interview",
    author: "Gayle Laakmann McDowell",
    category: "Lập trình",
    price: 340000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2134,
    stock: 78,
    isNew: true,
  },
  {
    id: "12",
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    category: "Lập trình",
    price: 220000,
    originalPrice: 280000,
    cover: "/image/anh.png",
    rating: 4.4,
    reviewCount: 456,
    stock: 23,
  },
];

const CATEGORIES = [
  "Tất cả",
  "Lập trình",
  "Khoa học máy tính",
  "Kinh doanh",
  "Thiết kế",
  "Kỹ năng sống",
  "Văn học",
  "Thiếu nhi",
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function BooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [showFilters, setShowFilters] = useState(true);

  const itemsPerPage = 12;

  // Filter books
  const filteredBooks = MOCK_BOOKS.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Tất cả" || book.category === selectedCategory;
    const matchesPrice =
      book.price >= priceRange[0] && book.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.reviewCount - a.reviewCount;
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = sortedBooks.slice(startIndex, startIndex + itemsPerPage);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Tất cả sách" }]} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tất cả sách</h1>
          <p className="text-gray-600">
            Khám phá {MOCK_BOOKS.length} đầu sách từ các tác giả nổi tiếng
          </p>
        </div>

        {/* Alert - Free shipping */}
        <Alert variant="info" className="mb-6">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
              <path d="M15 18H9" />
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
              <circle cx="17" cy="18" r="2" />
              <circle cx="7" cy="18" r="2" />
            </svg>
            <span>
              <strong>Miễn phí vận chuyển</strong> cho đơn hàng từ 500.000₫
            </span>
          </div>
        </Alert>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên sách, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant="primary"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar - Filters */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="8" height="18" x="3" y="3" rx="1" />
                        <path d="M7 3v18" />
                        <path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z" />
                      </svg>
                      Danh mục sách
                    </h3>
                    <div className="space-y-1.5">
                      {CATEGORIES.map((cat) => {
                        const count = cat === "Tất cả"
                          ? MOCK_BOOKS.length
                          : MOCK_BOOKS.filter((b) => b.category === cat).length;
                        const isActive = selectedCategory === cat;

                        return (
                          <Button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setCurrentPage(1);
                            }}
                            className={`
                              w-full group relative overflow-hidden
                              rounded-xl px-4 py-3 
                              transition-all duration-200
                              ${isActive
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                                : "bg-white hover:bg-gray-50 text-gray-700 hover:shadow-md border border-gray-100"
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* Category Icon */}
                                <div className={`
                                  w-8 h-8 rounded-full flex items-center justify-center
                                  transition-colors
                                  ${isActive
                                    ? "bg-white/20"
                                    : "bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200"
                                  }
                                `}>
                                  {cat === "Tất cả" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "text-white" : "text-blue-600"}>
                                      <rect width="18" height="18" x="3" y="3" rx="2" />
                                      <path d="M7 7v10" />
                                      <path d="M11 7v10" />
                                      <path d="m15 7 2 10" />
                                    </svg>
                                  ) : cat === "Lập trình" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "text-white" : "text-blue-600"}>
                                      <polyline points="16 18 22 12 16 6" />
                                      <polyline points="8 6 2 12 8 18" />
                                    </svg>
                                  ) : cat === "Khoa học máy tính" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "text-white" : "text-blue-600"}>
                                      <rect width="14" height="8" x="5" y="2" rx="2" />
                                      <rect width="20" height="8" x="2" y="14" rx="2" />
                                      <path d="M6 18h2" />
                                      <path d="M12 18h6" />
                                    </svg>
                                  ) : cat === "Kinh doanh" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "text-white" : "text-blue-600"}>
                                      <line x1="12" x2="12" y1="2" y2="22" />
                                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                  ) : cat === "Thiết kế" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "text-white" : "text-blue-600"}>
                                      <path d="m15 5 4 4" />
                                      <path d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13" />
                                      <path d="m8 6 2-2" />
                                      <path d="m2 22 5.5-1.5L21.17 6.83a2.82 2.82 0 0 0-4-4L3.5 16.5Z" />
                                      <path d="m18 16 2-2" />
                                      <path d="m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17" />
                                    </svg>
                                  ) : cat === "Kỹ năng sống" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "text-white" : "text-blue-600"}>
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
                                  ) : cat === "Văn học" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "text-white" : "text-blue-600"}>
                                      <path d="m16 6 4 14" />
                                      <path d="M12 6v14" />
                                      <path d="M8 8v12" />
                                      <path d="M4 4v16" />
                                    </svg>
                                  ) : cat === "Thiếu nhi" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "text-white" : "text-blue-600"}>
                                      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                                      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
                                      <path d="M15 13a2 2 0 0 1-3 0" />
                                      <path d="M9 9h.01" />
                                      <path d="M15 9h.01" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "text-white" : "text-blue-600"}>
                                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                                    </svg>
                                  )}
                                </div>

                                {/* Category Name */}
                                <span className={`font-medium ${isActive ? "text-white" : "text-gray-900 group-hover:text-blue-600"}`}>
                                  {cat}
                                </span>
                              </div>

                              {/* Count Badge */}
                              <Badge
                                variant={isActive ? "default" : "info"}
                                className={`
                                  text-xs font-semibold
                                  ${isActive
                                    ? "bg-white/20 text-white border-white/30"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                  }
                                `}
                              >
                                {count}
                              </Badge>
                            </div>

                            {/* Active Indicator */}
                            {isActive && (
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" x2="12" y1="2" y2="22" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      Khoảng giá
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: "Dưới 200.000₫", range: [0, 200000] as [number, number], icon: "💰" },
                        { label: "200.000₫ - 400.000₫", range: [200000, 400000] as [number, number], icon: "💵" },
                        { label: "Trên 400.000₫", range: [400000, 1000000] as [number, number], icon: "💎" },
                        { label: "Tất cả", range: [0, 1000000] as [number, number], icon: "🎯" },
                      ].map((item, idx) => {
                        const isActive = priceRange[0] === item.range[0] && priceRange[1] === item.range[1];
                        return (
                          <label
                            key={idx}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg cursor-pointer
                              transition-all duration-200 border
                              ${isActive
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-sm"
                                : "bg-white hover:bg-gray-50 border-gray-200 hover:border-green-200"
                              }
                            `}
                          >
                            <input
                              type="radio"
                              name="price"
                              checked={isActive}
                              onChange={() => setPriceRange(item.range)}
                              className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-2"
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <span className={`text-sm font-medium ${isActive ? "text-green-900" : "text-gray-700"}`}>
                                {item.label}
                              </span>
                              {isActive && (
                                <Badge variant="success" className="text-xs">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </Badge>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      Bộ lọc nhanh
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="warning" className="cursor-pointer flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
                        </svg>
                        Bestseller
                      </Badge>
                      <Badge variant="success" className="cursor-pointer flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="m15 9-6 6" />
                          <path d="m9 9 6 6" />
                        </svg>
                        Mới nhất
                      </Badge>
                      <Badge variant="danger" className="cursor-pointer flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                          <path d="m15 9-6 6" />
                          <path d="M9 9h.01" />
                          <path d="M15 15h.01" />
                        </svg>
                        Giảm giá
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="info">
                    {filteredBooks.length} kết quả
                  </Badge>
                  {selectedCategory !== "Tất cả" && (
                    <Badge variant="default">{selectedCategory}</Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="info">
                      Tìm kiếm: &quot;{searchQuery}&quot;;
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                  >
                    <option value="latest">Mới nhất</option>
                    <option value="popular">Phổ biến nhất</option>
                    <option value="rating">Đánh giá cao</option>
                    <option value="price-low">Giá thấp đến cao</option>
                    <option value="price-high">Giá cao đến thấp</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "primary" : "secondary"}
                      onClick={() => setViewMode("grid")}
                      size="sm"
                    >
                      ⊞
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "primary" : "secondary"}
                      onClick={() => setViewMode("list")}
                      size="sm"
                    >
                      ☰
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Books Grid/List */}
            {paginatedBooks.length === 0 ? (
              <EmptyState
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                  </svg>
                }
                title="Không tìm thấy sách"
                description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                action={{
                  label: "Xóa bộ lọc",
                  onClick: () => {
                    setSearchQuery("");
                    setSelectedCategory("Tất cả");
                    setPriceRange([0, 1000000]);
                  }
                }}
              />
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                      : "space-y-4"
                  }
                >
                  {paginatedBooks.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className={
                        viewMode === "grid"
                          ? "group"
                          : "flex gap-4 bg-white rounded-lg shadow-sm hover:shadow-lg transition-all p-4"
                      }
                    >
                      {viewMode === "grid" ? (
                        /* Grid View */
                        <Card hover className="h-full">
                          <CardContent className="p-4">
                            {/* Book Cover */}
                            <div className="relative aspect-[3/4] mb-3 bg-gray-200 rounded-lg overflow-hidden">
                              <Image
                                src={book.cover}
                                alt={book.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {/* Badges */}
                              <div className="absolute top-2 left-2 flex flex-col gap-1">
                                {book.originalPrice && (
                                  <Badge variant="danger" className="text-xs">
                                    -{calculateDiscount(book.originalPrice, book.price)}%
                                  </Badge>
                                )}
                                {book.isBestseller && (
                                  <Badge variant="warning" className="text-xs flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
                                    </svg>
                                    Hot
                                  </Badge>
                                )}
                                {book.isNew && (
                                  <Badge variant="success" className="text-xs flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-icon lucide-book">
                                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                                    </svg>
                                    Mới
                                  </Badge>
                                )}
                              </div>
                              {/* Stock Badge */}
                              {book.stock === 0 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Badge variant="default">Hết hàng</Badge>
                                </div>
                              )}
                              {book.stock > 0 && book.stock <= 5 && (
                                <Badge
                                  variant="danger"
                                  className="absolute bottom-2 right-2 text-xs"
                                >
                                  Còn {book.stock}
                                </Badge>
                              )}
                            </div>

                            {/* Book Info */}
                            <div>
                              <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {book.title}
                              </h3>
                              <p className="text-xs text-gray-600 mb-2">
                                {book.author}
                              </p>

                              {/* Rating */}
                              <div className="flex items-center gap-1 mb-2">
                                <span className="text-yellow-500 text-sm">★</span>
                                <span className="text-xs font-medium text-gray-700">
                                  {book.rating}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({book.reviewCount})
                                </span>
                              </div>

                              {/* Price */}
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-blue-600">
                                  {formatPrice(book.price)}
                                </span>
                                {book.originalPrice && (
                                  <span className="text-xs text-gray-400 line-through">
                                    {formatPrice(book.originalPrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        /* List View */
                        <>
                          {/* Book Cover */}
                          <div className="relative w-32 h-44 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={book.cover}
                              alt={book.title}
                              fill
                              className="object-cover"
                            />
                            {book.originalPrice && (
                              <Badge
                                variant="danger"
                                className="absolute top-2 left-2 text-xs"
                              >
                                -{calculateDiscount(book.originalPrice, book.price)}%
                              </Badge>
                            )}
                          </div>

                          {/* Book Info */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start gap-2 mb-2">
                                <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors flex-1">
                                  {book.title}
                                </h3>
                                <div className="flex gap-1">
                                  {book.isBestseller && (
                                    <Badge variant="warning" className="text-xs">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
                                      </svg>
                                    </Badge>
                                  )}
                                  {book.isNew && (
                                    <Badge variant="success" className="text-xs">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="m15 9-6 6" />
                                        <path d="m9 9 6 6" />
                                      </svg>
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 mb-2">{book.author}</p>
                              <Badge variant="default" className="mb-3">
                                {book.category}
                              </Badge>

                              {/* Rating */}
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500">★</span>
                                  <span className="font-medium text-gray-700">
                                    {book.rating}
                                  </span>
                                </div>
                                <span className="text-gray-500">
                                  ({book.reviewCount} đánh giá)
                                </span>
                              </div>
                            </div>

                            {/* Price & Stock */}
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-bold text-blue-600">
                                    {formatPrice(book.price)}
                                  </span>
                                  {book.originalPrice && (
                                    <span className="text-gray-400 line-through">
                                      {formatPrice(book.originalPrice)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div>
                                {book.stock === 0 ? (
                                  <Badge variant="default">Hết hàng</Badge>
                                ) : book.stock <= 5 ? (
                                  <Badge variant="danger">
                                    Còn {book.stock} cuốn
                                  </Badge>
                                ) : (
                                  <Badge variant="success">Còn hàng</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
              </svg>,
              label: "Tổng số sách",
              value: MOCK_BOOKS.length
            },
            {
              icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
              </svg>,
              label: "Bestsellers",
              value: MOCK_BOOKS.filter((b) => b.isBestseller).length,
            },
            {
              icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>,
              label: "Sách mới",
              value: MOCK_BOOKS.filter((b) => b.isNew).length,
            },
            {
              icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>,
              label: "Đánh giá TB",
              value: (
                MOCK_BOOKS.reduce((sum, b) => sum + b.rating, 0) /
                MOCK_BOOKS.length
              ).toFixed(1),
            },
          ].map((stat, idx) => (
            <Card key={idx} hover>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
