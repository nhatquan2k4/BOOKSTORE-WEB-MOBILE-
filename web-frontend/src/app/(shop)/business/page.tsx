"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

type Book = {
  id: string;
  title: string;
  author: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  cover: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isBestseller?: boolean;
};

type SortOption = "popular" | "rating" | "price-asc" | "price-desc" | "name";
type SubCategory = "all" | "startup" | "marketing" | "leadership" | "strategy" | "sales" | "finance";

const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "Từ Tốt Đến Vĩ Đại",
    author: "Jim Collins",
    subcategory: "leadership",
    price: 165000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3456,
    stock: 85,
    isBestseller: true,
  },
  {
    id: "2",
    title: "The Lean Startup",
    author: "Eric Ries",
    subcategory: "startup",
    price: 185000,
    originalPrice: 230000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1876,
    stock: 55,
    isBestseller: true,
  },
  {
    id: "3",
    title: "Nghĩ Giàu Làm Giàu",
    author: "Napoleon Hill",
    subcategory: "strategy",
    price: 115000,
    originalPrice: 145000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 1987,
    stock: 110,
  },
  {
    id: "4",
    title: "Nghệ Thuật Bán Hàng Vĩ Đại",
    author: "Brian Tracy",
    subcategory: "sales",
    price: 168000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 876,
    stock: 85,
    isBestseller: true,
  },
  {
    id: "5",
    title: "Chiến Lược Đại Dương Xanh",
    author: "W. Chan Kim & Renée Mauborgne",
    subcategory: "strategy",
    price: 195000,
    originalPrice: 245000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2134,
    stock: 65,
  },
  {
    id: "6",
    title: "Thế Giới Phẳng",
    author: "Thomas L. Friedman",
    subcategory: "strategy",
    price: 215000,
    originalPrice: 270000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1654,
    stock: 45,
  },
  {
    id: "7",
    title: "Khởi Nghiệp Tinh Gọn",
    author: "Ash Maurya",
    subcategory: "startup",
    price: 175000,
    originalPrice: 220000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 987,
    stock: 70,
  },
  {
    id: "8",
    title: "Marketing 4.0",
    author: "Philip Kotler",
    subcategory: "marketing",
    price: 225000,
    originalPrice: 280000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2345,
    stock: 55,
    isBestseller: true,
  },
  {
    id: "9",
    title: "Làm Chủ Doanh Nghiệp",
    author: "Michael E. Gerber",
    subcategory: "leadership",
    price: 155000,
    originalPrice: 195000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1432,
    stock: 75,
  },
  {
    id: "10",
    title: "Những Người Xuất Chúng",
    author: "Malcolm Gladwell",
    subcategory: "strategy",
    price: 135000,
    originalPrice: 170000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1876,
    stock: 90,
  },
  {
    id: "11",
    title: "Zero to One",
    author: "Peter Thiel",
    subcategory: "startup",
    price: 195000,
    originalPrice: 245000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2567,
    stock: 50,
    isBestseller: true,
  },
  {
    id: "12",
    title: "Quản Trị Marketing Căn Bản",
    author: "Philip Kotler",
    subcategory: "marketing",
    price: 245000,
    originalPrice: 310000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 3456,
    stock: 42,
  },
  {
    id: "13",
    title: "Nghệ Thuật Đàm Phán",
    author: "Chris Voss",
    subcategory: "sales",
    price: 185000,
    originalPrice: 230000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1987,
    stock: 68,
  },
  {
    id: "14",
    title: "Tài Chính Doanh Nghiệp",
    author: "Aswath Damodaran",
    subcategory: "finance",
    price: 275000,
    originalPrice: 340000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1234,
    stock: 38,
  },
  {
    id: "15",
    title: "Lãnh Đạo Không Chức Danh",
    author: "Robin Sharma",
    subcategory: "leadership",
    price: 145000,
    originalPrice: 185000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1654,
    stock: 82,
  },
  {
    id: "16",
    title: "The Hard Thing About Hard Things",
    author: "Ben Horowitz",
    subcategory: "startup",
    price: 205000,
    originalPrice: 255000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1543,
    stock: 48,
  },
  {
    id: "17",
    title: "Positioning: Trận Chiến Trong Tâm Trí",
    author: "Al Ries & Jack Trout",
    subcategory: "marketing",
    price: 165000,
    originalPrice: 205000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2134,
    stock: 62,
  },
  {
    id: "18",
    title: "Phân Tích Tài Chính Doanh Nghiệp",
    author: "Trần Ngọc Thơ",
    subcategory: "finance",
    price: 195000,
    originalPrice: 240000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 876,
    stock: 52,
  },
];

const SUBCATEGORIES = [
  { id: "all", name: "Tất cả"},
  { id: "startup", name: "Khởi nghiệp" },
  { id: "marketing", name: "Marketing" },
  { id: "leadership", name: "Lãnh đạo" },
  { id: "strategy", name: "Chiến lược" },
  { id: "sales", name: "Bán hàng" },
  { id: "finance", name: "Tài chính" },
];

export default function BusinessBooksPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  const filteredBooks =
    selectedSubcategory === "all"
      ? MOCK_BOOKS
      : MOCK_BOOKS.filter((book) => book.subcategory === selectedSubcategory);

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.reviewCount - a.reviewCount;
      case "rating":
        return b.rating - a.rating;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-indigo-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách kinh doanh</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Sách Kinh Doanh
            </h1>
          </div>
          <p className="text-gray-700 text-lg font-medium flex items-center gap-2">
            {MOCK_BOOKS.length} cuốn sách kinh doanh - Bí quyết thành công trong sự nghiệp
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Lĩnh vực:</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {SUBCATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedSubcategory(cat.id as SubCategory);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedSubcategory === cat.id
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
              <span className="font-semibold">{Math.min(endIndex, sortedBooks.length)}</span> /{" "}
              <span className="font-semibold">{sortedBooks.length}</span>
            </div>

            <div>
              <label htmlFor="sort-business" className="sr-only">
                Sắp xếp
              </label>
              <select
                id="sort-business"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {paginatedBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group bg-white rounded-xl p-3 shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-indigo-300"
            >
              <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {book.isBestseller && (
                  <div className="absolute top-2 right-2">
                    <Badge className="text-xs bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold shadow-lg flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      BEST
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-indigo-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 font-medium">{book.author}</p>
                <p className="text-xs text-indigo-600 font-semibold">
                  {SUBCATEGORIES.find((c) => c.id === book.subcategory)?.name}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <p className="text-red-600 font-bold text-sm">{formatPrice(book.price)}</p>
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
                  <span className="text-xs font-bold text-gray-700">{book.rating}</span>
                  <span className="text-xs text-gray-500">({book.reviewCount})</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mb-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
              Xây Dựng Sự Nghiệp Thành Công
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Tư duy chiến lược</h3>
                <p className="text-sm opacity-90">Học từ những CEO và doanh nhân hàng đầu</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Kỹ năng thực chiến</h3>
                <p className="text-sm opacity-90">Áp dụng ngay vào công việc và kinh doanh</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Thành công bền vững</h3>
                <p className="text-sm opacity-90">Xây dựng nền tảng phát triển lâu dài</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
