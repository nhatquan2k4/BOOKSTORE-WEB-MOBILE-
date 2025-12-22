"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { bookService } from "@/services";
import type { BookDto } from "@/types/dtos";
import { resolveBookPrice } from "@/lib/price";

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
  duration?: string;
  students?: number;
};

type SortOption = "popular" | "rating" | "price-asc" | "price-desc" | "students";
type SubCategory = "all" | "web-dev" | "data-science" | "business" | "marketing" | "design" | "language";

const SUBCATEGORIES = [
  { id: "all", name: "Tất cả"},
  { id: "web-dev", name: "Web Development"},
  { id: "data-science", name: "Data Science"},
  { id: "business", name: "Kinh doanh"},
  { id: "marketing", name: "Marketing"},
  { id: "design", name: "Thiết kế"},
  { id: "language", name: "Ngoại ngữ"},
];

const OLD_MOCK = [
  {
    id: "3",
    title: "Digital Marketing Masterclass",
    author: "Phil Ebiner",
    subcategory: "marketing",
    price: 495000,
    originalPrice: 620000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 5432,
    stock: 999,
    duration: "25 giờ",
    students: 87000,
  },
  {
    id: "4",
    title: "UI/UX Design với Figma - Từ Zero đến Hero",
    author: "Daniel Schifano",
    subcategory: "design",
    price: 525000,
    originalPrice: 660000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4321,
    stock: 999,
    duration: "32 giờ",
    students: 76000,
  },
  {
    id: "5",
    title: "Complete Business Management Course",
    author: "Chris Haroun",
    subcategory: "business",
    price: 575000,
    originalPrice: 720000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3987,
    stock: 999,
    duration: "45 giờ",
    students: 65000,
  },
  {
    id: "6",
    title: "React - The Complete Guide 2024",
    author: "Maximilian Schwarzmüller",
    subcategory: "web-dev",
    price: 615000,
    originalPrice: 770000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 7654,
    stock: 999,
    duration: "48 giờ",
    students: 112000,
  },
  {
    id: "7",
    title: "English Speaking Complete Course",
    author: "TJ Walker",
    subcategory: "language",
    price: 445000,
    originalPrice: 560000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 3456,
    stock: 999,
    duration: "28 giờ",
    students: 54000,
  },
  {
    id: "8",
    title: "AWS Certified Solutions Architect",
    author: "Stephane Maarek",
    subcategory: "web-dev",
    price: 695000,
    originalPrice: 870000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 5678,
    stock: 999,
    duration: "35 giờ",
    students: 92000,
  },
  {
    id: "9",
    title: "Excel - Từ Cơ Bản Đến Nâng Cao",
    author: "Kyle Pew",
    subcategory: "business",
    price: 395000,
    originalPrice: 495000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 4321,
    stock: 999,
    duration: "22 giờ",
    students: 68000,
  },
  {
    id: "10",
    title: "Deep Learning A-Z™",
    author: "Kirill Eremenko",
    subcategory: "data-science",
    price: 725000,
    originalPrice: 920000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 6789,
    stock: 999,
    duration: "41 giờ",
    students: 85000,
  },
  {
    id: "11",
    title: "SEO & Content Marketing 2024",
    author: "ClickMinded",
    subcategory: "marketing",
    price: 515000,
    originalPrice: 650000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2987,
    stock: 999,
    duration: "24 giờ",
    students: 47000,
  },
  {
    id: "12",
    title: "Adobe Photoshop CC - Toàn Tập",
    author: "Phil Ebiner",
    subcategory: "design",
    price: 485000,
    originalPrice: 610000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 4567,
    stock: 999,
    duration: "30 giờ",
    students: 72000,
  },
  {
    id: "13",
    title: "IELTS Speaking Band 8+",
    author: "IELTS Advantage",
    subcategory: "language",
    price: 465000,
    originalPrice: 585000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3654,
    stock: 999,
    duration: "26 giờ",
    students: 62000,
  },
  {
    id: "14",
    title: "Node.js - Xây Dựng RESTful API",
    author: "Andrew Mead",
    subcategory: "web-dev",
    price: 585000,
    originalPrice: 730000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 5432,
    stock: 999,
    duration: "36 giờ",
    students: 78000,
  },
  {
    id: "15",
    title: "Financial Analysis & Modeling",
    author: "365 Careers",
    subcategory: "business",
    price: 625000,
    originalPrice: 780000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3876,
    stock: 999,
    duration: "33 giờ",
    students: 56000,
  },
  {
    id: "16",
    title: "TensorFlow Developer Certificate",
    author: "Andrei Neagoie",
    subcategory: "data-science",
    price: 685000,
    originalPrice: 860000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4987,
    stock: 999,
    duration: "39 giờ",
    students: 67000,
  },
  {
    id: "17",
    title: "Facebook Ads & Instagram Marketing",
    author: "Isaac Rudansky",
    subcategory: "marketing",
    price: 535000,
    originalPrice: 670000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 3234,
    stock: 999,
    duration: "27 giờ",
    students: 59000,
  },
  {
    id: "18",
    title: "Motion Graphics with After Effects",
    author: "Alan Ayoubi",
    subcategory: "design",
    price: 565000,
    originalPrice: 710000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2876,
    stock: 999,
    duration: "31 giờ",
    students: 44000,
  },
];

export default function CourseBooksPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await bookService.getBooks({
          pageNumber: currentPage,
          pageSize: itemsPerPage,
        });
        
        if (response.items && response.items.length > 0) {
          const transformedBooks: Book[] = response.items.map((book: BookDto) => {
            const priceInfo = resolveBookPrice(book);
            return {
              id: book.id,
              title: book.title,
              author: book.authorNames?.[0] || "Tác giả không xác định",
              subcategory: "all",
              price: priceInfo.finalPrice,
              originalPrice: priceInfo.hasDiscount ? priceInfo.originalPrice : undefined,
              cover: book.coverImage || "/image/anh.png",
              rating: book.averageRating || 0,
              reviewCount: book.totalReviews || 0,
              stock: book.stockQuantity || 0,
            };
          });
          setBooks(transformedBooks);
          setTotalItems(response.totalCount || 0);
        } else {
          setBooks([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setBooks([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [currentPage]);

  const filteredBooks =
    selectedSubcategory === "all"
      ? books
      : books.filter((book) => book.subcategory === selectedSubcategory);

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
      case "students":
        return (b.students || 0) - (a.students || 0);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = sortedBooks.slice(startIndex, endIndex);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatStudents = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K+`;
    }
    return count.toString();
  };

  const calculateDiscount = (original: number, current: number) => {
    if (original <= 0 || current <= 0 || current >= original) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalStudents = books.reduce((acc, book) => acc + (book.students || 0), 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-violet-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách khóa học</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
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
              className="text-violet-600"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Sách Khóa Học
            </h1>
          </div>
          <p className="text-gray-700 text-lg font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            {totalItems} khóa học chất lượng cao - {formatStudents(totalStudents)} học viên đã theo học
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Danh mục:</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {SUBCATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => {
                  setSelectedSubcategory(cat.id as SubCategory);
                  setCurrentPage(1);
                }}
                variant={selectedSubcategory === cat.id ? "primary" : "outline"}
                size="sm"
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
              <span className="font-semibold">{Math.min(endIndex, totalItems)}</span> /{" "}
              <span className="font-semibold">{totalItems}</span>
            </div>

            <div>
              <label htmlFor="sort-course" className="sr-only">
                Sắp xếp
              </label>
              <select
                id="sort-course"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="students">Nhiều học viên nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="aspect-[2/3] bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {paginatedBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-2 right-2">
                  <Badge className="text-xs bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-bold shadow-lg">
                    ONLINE
                  </Badge>
                </div>

                {book.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {book.duration}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-violet-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 font-medium">{book.author}</p>
                <p className="text-xs text-violet-600 font-semibold">
                  {SUBCATEGORIES.find((c) => c.id === book.subcategory)?.name}
                </p>

                {book.students && (
                  <div className="bg-violet-50 rounded px-2 py-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <p className="text-xs text-violet-700 font-bold">
                      {formatStudents(book.students)} học viên
                    </p>
                  </div>
                )}

                {book.rating > 0 && book.reviewCount > 0 ? (
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
                    <span className="text-xs font-bold text-gray-700">{book.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({book.reviewCount})</span>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 pt-1">
                    Đang cập nhật
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 flex-wrap">
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
              </div>
            </Link>
          ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mb-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              Học Online Hiệu Quả
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Truy cập mãi mãi</h3>
                <p className="text-sm opacity-90">Học mọi lúc, mọi nơi, không giới hạn</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Thực hành thực tế</h3>
                <p className="text-sm opacity-90">Dự án thực tế, bài tập có đáp án</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Chứng chỉ hoàn thành</h3>
                <p className="text-sm opacity-90">Thêm vào CV của bạn ngay</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
