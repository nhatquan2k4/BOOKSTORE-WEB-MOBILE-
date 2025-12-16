"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { bookService } from "@/services";
import type { BookDto } from "@/types/dtos";

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
  ageRange: string;
  isBestseller?: boolean;
};

type SortOption = "popular" | "rating" | "price-asc" | "price-desc" | "age";
type SubCategory = "all" | "picture" | "fairy-tale" | "education" | "comics" | "adventure" | "science";

const OLD_DATA = [
  {
    id: "1",
    title: "Đắc Nhân Tâm Dành Cho Tuổi Teen",
    author: "Dale Carnegie",
    subcategory: "education",
    price: 85000,
    originalPrice: 110000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3456,
    stock: 95,
    ageRange: "13-16",
    isBestseller: true,
  },
  {
    id: "2",
    title: "Nhật Ký Chú Bé Khờ - Tập 1",
    author: "Jeff Kinney",
    subcategory: "comics",
    price: 75000,
    originalPrice: 95000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 5678,
    stock: 125,
    ageRange: "8-12",
    isBestseller: true,
  },
  {
    id: "3",
    title: "Vừ Lì Chuyến Phiêu Lưu Kỳ Thú",
    author: "Vũ Trọng Phụng",
    subcategory: "adventure",
    price: 68000,
    originalPrice: 85000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2987,
    stock: 88,
    ageRange: "6-10",
  },
  {
    id: "4",
    title: "Sách Khoa Học Cho Bé - Vũ Trụ",
    author: "National Geographic Kids",
    subcategory: "science",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2134,
    stock: 72,
    ageRange: "8-12",
  },
  {
    id: "5",
    title: "Công Chúa Tóc Mây - Tranh Truyện",
    author: "Disney",
    subcategory: "picture",
    price: 55000,
    originalPrice: 70000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4321,
    stock: 145,
    ageRange: "3-6",
    isBestseller: true,
  },
  {
    id: "6",
    title: "Truyện Cổ Tích Việt Nam",
    author: "Nhiều Tác Giả",
    subcategory: "fairy-tale",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3876,
    stock: 105,
    ageRange: "5-10",
  },
  {
    id: "7",
    title: "Doraemon - Nobita Và Vương Quốc Robot",
    author: "Fujiko F. Fujio",
    subcategory: "comics",
    price: 22000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 6789,
    stock: 250,
    ageRange: "6-14",
    isBestseller: true,
  },
  {
    id: "8",
    title: "Sách Tô Màu Động Vật",
    author: "First News",
    subcategory: "education",
    price: 35000,
    originalPrice: 45000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1876,
    stock: 185,
    ageRange: "3-7",
  },
  {
    id: "9",
    title: "Harry Potter Và Hòn Đá Phù Thủy",
    author: "J.K. Rowling",
    subcategory: "adventure",
    price: 145000,
    originalPrice: 185000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 8765,
    stock: 95,
    ageRange: "10-16",
    isBestseller: true,
  },
  {
    id: "10",
    title: "Thỏ Bảy Màu - Câu Chuyện Cổ Tích",
    author: "Nguyễn Nhật Ánh",
    subcategory: "fairy-tale",
    price: 78000,
    originalPrice: 98000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3456,
    stock: 92,
    ageRange: "4-8",
  },
  {
    id: "11",
    title: "Khám Phá Thế Giới Khủng Long",
    author: "DK Publishing",
    subcategory: "science",
    price: 165000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 2876,
    stock: 68,
    ageRange: "7-12",
  },
  {
    id: "12",
    title: "Peppa Pig - Ngày Của Peppa",
    author: "Ladybird",
    subcategory: "picture",
    price: 48000,
    originalPrice: 60000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 4567,
    stock: 165,
    ageRange: "2-5",
  },
  {
    id: "13",
    title: "Conan - Thám Tử Lừng Danh (Tập 1)",
    author: "Aoyama Gosho",
    subcategory: "comics",
    price: 22000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 5432,
    stock: 220,
    ageRange: "10-16",
    isBestseller: true,
  },
  {
    id: "14",
    title: "365 Câu Chuyện Trước Giờ Ngủ",
    author: "Nhiều Tác Giả",
    subcategory: "fairy-tale",
    price: 115000,
    originalPrice: 145000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3987,
    stock: 85,
    ageRange: "3-8",
  },
  {
    id: "15",
    title: "Toán Tư Duy Cho Bé 5-6 Tuổi",
    author: "Nguyễn Quang Vinh",
    subcategory: "education",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2345,
    stock: 98,
    ageRange: "5-6",
  },
  {
    id: "16",
    title: "Percy Jackson Và Các Vị Thần Olympia",
    author: "Rick Riordan",
    subcategory: "adventure",
    price: 135000,
    originalPrice: 170000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4321,
    stock: 72,
    ageRange: "11-16",
  },
  {
    id: "17",
    title: "Cách Làm Thí Nghiệm Khoa Học Tại Nhà",
    author: "Robert Winston",
    subcategory: "science",
    price: 145000,
    originalPrice: 185000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1987,
    stock: 58,
    ageRange: "8-14",
  },
  {
    id: "18",
    title: "Bé Tập Đọc - Truyện Ngắn Có Tranh",
    author: "First News",
    subcategory: "picture",
    price: 65000,
    originalPrice: 82000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2654,
    stock: 125,
    ageRange: "4-7",
  },
];

const SUBCATEGORIES = [
  { id: "all", name: "Tất cả"},
  { id: "picture", name: "Tranh Truyện"},
  { id: "fairy-tale", name: "Cổ Tích"},
  { id: "education", name: "Giáo Dục"},
  { id: "comics", name: "Truyện Tranh"},
  { id: "adventure", name: "Phiêu Lưu"},
  { id: "science", name: "Khoa Học"},
];

export default function ChildrenBooksPage() {
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
          const transformedBooks: Book[] = response.items.map((book: BookDto) => ({
            id: book.id,
            title: book.title,
            author: book.authorNames?.[0] || "Tác giả không xác định",
            subcategory: "all",
            price: book.discountPrice || book.currentPrice || 0,
            originalPrice: book.currentPrice,
            cover: "/image/anh.png",
            rating: book.averageRating || 0,
            reviewCount: book.totalReviews || 0,
            stock: book.stockQuantity || 0,
            ageRange: "3-6",
          }));
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
      case "age":
        return a.ageRange.localeCompare(b.ageRange);
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

  const calculateDiscount = (original: number, current: number) => {
    if (original <= 0 || current <= 0 || current >= original) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-orange-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách thiếu nhi</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
              Sách Thiếu Nhi
            </h1>
          </div>
          <p className="text-gray-700 text-lg font-medium flex items-center gap-2">
            {totalItems} cuốn sách thiếu nhi - Nuôi dưỡng trí tưởng tượng và khám phá
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Thể loại:</h3>
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
              <label htmlFor="sort-children" className="sr-only">
                Sắp xếp
              </label>
              <select
                id="sort-children"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="age">Theo độ tuổi</option>
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

                <div className="absolute top-2 left-2">
                  <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold">
                    {book.ageRange} tuổi
                  </Badge>
                </div>

                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {book.isBestseller && (
                    <Badge className="text-xs bg-gradient-to-r from-pink-500 to-red-600 text-white font-bold shadow-lg flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      HOT
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-orange-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 font-medium">{book.author}</p>
                <p className="text-xs text-orange-600 font-semibold">
                  {SUBCATEGORIES.find((c) => c.id === book.subcategory)?.name}
                </p>

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

        <div className="mt-12 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Lợi Ích Của Đọc Sách Thiếu Nhi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Phát triển tư duy</h3>
                <p className="text-sm opacity-90">Rèn luyện khả năng tư duy logic và sáng tạo</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0 3 3 3 3 0 0 0 3-3"/><path d="M19 5a3 3 0 0 0-3 3 3 3 0 0 0 3 3"/><path d="M12 11a3 3 0 0 0 3 3 3 3 0 0 0-3 3"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Trí tưởng tượng</h3>
                <p className="text-sm opacity-90">Khơi dậy sự sáng tạo và óc tưởng tượng phong phú</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Giáo dục đạo đức</h3>
                <p className="text-sm opacity-90">Hình thành nhân cách và giá trị sống tốt đẹp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
