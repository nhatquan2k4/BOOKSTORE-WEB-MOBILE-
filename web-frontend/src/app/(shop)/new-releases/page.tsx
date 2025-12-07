// New Releases Page - Trang Sách Mới Ra Mắt
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  originalPrice: number;
  cover: string;
  rating: number;
  reviews: number;
  releaseDate: string;
  category: string;
  isNew: boolean;
}

const newReleases: Book[] = [
  {
    id: 1,
    title: "AI 2024: The Future is Now",
    author: "John Smith",
    price: 295000,
    originalPrice: 380000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 1234,
    releaseDate: "2024-11-20",
    category: "Công nghệ",
    isNew: true,
  },
  {
    id: 2,
    title: "Web Development Mastery",
    author: "Sarah Johnson",
    price: 325000,
    originalPrice: 420000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 987,
    releaseDate: "2024-11-18",
    category: "Lập trình",
    isNew: true,
  },
  {
    id: 3,
    title: "The Modern Entrepreneur",
    author: "Michael Chen",
    price: 185000,
    originalPrice: 240000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 756,
    releaseDate: "2024-11-15",
    category: "Kinh doanh",
    isNew: true,
  },
  {
    id: 4,
    title: "Data Science Fundamentals",
    author: "Emily Wang",
    price: 350000,
    originalPrice: 450000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 1456,
    releaseDate: "2024-11-12",
    category: "Khoa học dữ liệu",
    isNew: true,
  },
  {
    id: 5,
    title: "Mindful Living in 2024",
    author: "David Park",
    price: 165000,
    originalPrice: 220000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 892,
    releaseDate: "2024-11-10",
    category: "Kỹ năng sống",
    isNew: true,
  },
  {
    id: 6,
    title: "Blockchain Revolution",
    author: "Alex Thompson",
    price: 395000,
    originalPrice: 510000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 654,
    releaseDate: "2024-11-08",
    category: "Công nghệ",
    isNew: true,
  },
  {
    id: 7,
    title: "The Art of Negotiation",
    author: "Lisa Martinez",
    price: 175000,
    originalPrice: 230000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviews: 543,
    releaseDate: "2024-11-05",
    category: "Kỹ năng sống",
    isNew: true,
  },
  {
    id: 8,
    title: "Cloud Architecture Patterns",
    author: "Robert Lee",
    price: 425000,
    originalPrice: 550000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 876,
    releaseDate: "2024-11-03",
    category: "Lập trình",
    isNew: true,
  },
  {
    id: 9,
    title: "Marketing in the Digital Age",
    author: "Jennifer Kim",
    price: 195000,
    originalPrice: 260000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 678,
    releaseDate: "2024-11-01",
    category: "Marketing",
    isNew: true,
  },
  {
    id: 10,
    title: "Python for Everyone",
    author: "Tom Wilson",
    price: 285000,
    originalPrice: 370000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 1123,
    releaseDate: "2024-10-30",
    category: "Lập trình",
    isNew: true,
  },
  {
    id: 11,
    title: "Financial Freedom Guide",
    author: "Amanda Brown",
    price: 155000,
    originalPrice: 200000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviews: 445,
    releaseDate: "2024-10-28",
    category: "Tài chính",
    isNew: true,
  },
  {
    id: 12,
    title: "UX Design Principles",
    author: "Chris Anderson",
    price: 245000,
    originalPrice: 320000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 789,
    releaseDate: "2024-10-25",
    category: "Thiết kế",
    isNew: true,
  },
  {
    id: 13,
    title: "Leadership 2.0",
    author: "Patricia Garcia",
    price: 185000,
    originalPrice: 240000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 567,
    releaseDate: "2024-10-22",
    category: "Kinh doanh",
    isNew: true,
  },
  {
    id: 14,
    title: "Machine Learning Basics",
    author: "Kevin Zhang",
    price: 365000,
    originalPrice: 470000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 1345,
    releaseDate: "2024-10-20",
    category: "Khoa học dữ liệu",
    isNew: true,
  },
  {
    id: 15,
    title: "The Productivity System",
    author: "Rachel White",
    price: 145000,
    originalPrice: 190000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviews: 432,
    releaseDate: "2024-10-18",
    category: "Kỹ năng sống",
    isNew: true,
  },
  {
    id: 16,
    title: "React Native Complete Guide",
    author: "Daniel Kumar",
    price: 335000,
    originalPrice: 430000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 998,
    releaseDate: "2024-10-15",
    category: "Lập trình",
    isNew: true,
  },
  {
    id: 17,
    title: "Sustainable Business",
    author: "Sophia Taylor",
    price: 175000,
    originalPrice: 230000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviews: 523,
    releaseDate: "2024-10-12",
    category: "Kinh doanh",
    isNew: true,
  },
  {
    id: 18,
    title: "Cybersecurity Essentials",
    author: "Mark Johnson",
    price: 295000,
    originalPrice: 380000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 765,
    releaseDate: "2024-10-10",
    category: "Công nghệ",
    isNew: true,
  },
];

type SortOption = "newest" | "rating" | "price-asc" | "price-desc";

export default function NewReleasesPage() {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 18;

  // Sort books
  const sortedBooks = [...newReleases].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      case "rating":
        return b.rating - a.rating;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const displayedBooks = sortedBooks.slice(startIndex, startIndex + booksPerPage);
  const endIndex = startIndex + booksPerPage;

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
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách mới ra mắt</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Sách Mới Ra Mắt
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Khám phá {sortedBooks.length} đầu sách mới phát hành
          </p>
        </div>

        {/* Filters & Sort */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
            <span className="font-semibold">
              {Math.min(endIndex, sortedBooks.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-semibold">{sortedBooks.length}</span> sách
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {displayedBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
            >
              {/* Book Cover */}
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* NEW Badge */}
                {book.isNew && (
                  <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="inline-block mr-1"
                    >
                      <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
                    </svg>
                    MỚI
                  </Badge>
                )}
              </div>

              {/* Book Info */}
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-gray-600 mb-1">{book.author}</p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
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
                  ({book.reviews})
                </span>
              </div>

              {/* Price */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <p className="text-red-600 font-bold text-sm">
                  {formatPrice(book.price)}
                </p>
                {book.originalPrice && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <p className="text-xs text-gray-400 line-through">
                      {formatPrice(book.originalPrice)}
                    </p>
                    <Badge variant="danger" className="text-xs font-bold">
                      -{calculateDiscount(book.originalPrice, book.price)}%
                    </Badge>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              ← Trước
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "primary" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Sau <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
