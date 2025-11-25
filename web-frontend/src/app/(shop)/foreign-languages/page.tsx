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
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  hasAudio?: boolean;
};

type SortOption = "popular" | "rating" | "price-asc" | "price-desc" | "level";
type SubCategory = "all" | "english" | "japanese" | "korean" | "chinese" | "french" | "german";

const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "English Grammar in Use",
    author: "Raymond Murphy",
    subcategory: "english",
    price: 245000,
    originalPrice: 310000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 5678,
    stock: 85,
    level: "B1",
    hasAudio: true,
  },
  {
    id: "2",
    title: "IELTS Cambridge 15 - Academic",
    author: "Cambridge University Press",
    subcategory: "english",
    price: 325000,
    originalPrice: 410000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 4321,
    stock: 92,
    level: "B2",
    hasAudio: true,
  },
  {
    id: "3",
    title: "Minna no Nihongo - Sơ Cấp 1",
    author: "3A Network",
    subcategory: "japanese",
    price: 195000,
    originalPrice: 245000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3456,
    stock: 78,
    level: "A1",
    hasAudio: true,
  },
  {
    id: "4",
    title: "Korean Grammar in Use - Beginning",
    author: "Ahn Jean-myung",
    subcategory: "korean",
    price: 285000,
    originalPrice: 360000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2987,
    stock: 65,
    level: "A1",
    hasAudio: true,
  },
  {
    id: "5",
    title: "HSK Standard Course 4 - Tiếng Trung",
    author: "Beijing Language and Culture University Press",
    subcategory: "chinese",
    price: 235000,
    originalPrice: 295000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2134,
    stock: 58,
    level: "B1",
    hasAudio: true,
  },
  {
    id: "6",
    title: "Le Nouveau Taxi! 1 - Tiếng Pháp",
    author: "Hachette Livre",
    subcategory: "french",
    price: 275000,
    originalPrice: 345000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1765,
    stock: 48,
    level: "A1",
    hasAudio: true,
  },
  {
    id: "7",
    title: "Menschen A2 - Tiếng Đức",
    author: "Hueber Verlag",
    subcategory: "german",
    price: 295000,
    originalPrice: 370000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1543,
    stock: 42,
    level: "A2",
    hasAudio: true,
  },
  {
    id: "8",
    title: "Oxford Advanced Learner's Dictionary",
    author: "Oxford University Press",
    subcategory: "english",
    price: 385000,
    originalPrice: 480000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4567,
    stock: 95,
    level: "C1",
  },
  {
    id: "9",
    title: "TOEIC Official Test-Preparation Guide",
    author: "ETS",
    subcategory: "english",
    price: 345000,
    originalPrice: 430000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3876,
    stock: 72,
    level: "B2",
    hasAudio: true,
  },
  {
    id: "10",
    title: "Soumatome N3 - Kanji",
    author: "Ask Publishing",
    subcategory: "japanese",
    price: 165000,
    originalPrice: 205000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2456,
    stock: 68,
    level: "B1",
  },
  {
    id: "11",
    title: "TOPIK Essential Grammar - Intermediate",
    author: "Darakwon",
    subcategory: "korean",
    price: 255000,
    originalPrice: 320000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2134,
    stock: 55,
    level: "B1",
    hasAudio: true,
  },
  {
    id: "12",
    title: "HSK 6 - Đề Thi Thử",
    author: "Beijing Language University",
    subcategory: "chinese",
    price: 295000,
    originalPrice: 370000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1654,
    stock: 38,
    level: "C1",
    hasAudio: true,
  },
  {
    id: "13",
    title: "Alter Ego+ B2 - Tiếng Pháp",
    author: "Hachette FLE",
    subcategory: "french",
    price: 325000,
    originalPrice: 405000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1432,
    stock: 35,
    level: "B2",
    hasAudio: true,
  },
  {
    id: "14",
    title: "Studio 21 B1 - Tiếng Đức",
    author: "Cornelsen Verlag",
    subcategory: "german",
    price: 315000,
    originalPrice: 395000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1234,
    stock: 42,
    level: "B1",
    hasAudio: true,
  },
  {
    id: "15",
    title: "Tactics for Listening - Expanding",
    author: "Jack Richards",
    subcategory: "english",
    price: 215000,
    originalPrice: 270000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2876,
    stock: 82,
    level: "B1",
    hasAudio: true,
  },
  {
    id: "16",
    title: "Genki II - Japanese Workbook",
    author: "The Japan Times",
    subcategory: "japanese",
    price: 245000,
    originalPrice: 310000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2987,
    stock: 58,
    level: "A2",
  },
  {
    id: "17",
    title: "Yonsei Korean 3 - Textbook",
    author: "Yonsei University Press",
    subcategory: "korean",
    price: 275000,
    originalPrice: 345000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1876,
    stock: 48,
    level: "B1",
    hasAudio: true,
  },
  {
    id: "18",
    title: "Integrated Chinese Level 2",
    author: "Cheng & Tsui",
    subcategory: "chinese",
    price: 265000,
    originalPrice: 330000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1765,
    stock: 52,
    level: "A2",
    hasAudio: true,
  },
];

const SUBCATEGORIES = [
  { id: "all", name: "Tất cả"},
  { id: "english", name: "Tiếng Anh"},
  { id: "japanese", name: "Tiếng Nhật"},
  { id: "korean", name: "Tiếng Hàn"},
  { id: "chinese", name: "Tiếng Trung"},
  { id: "french", name: "Tiếng Pháp"},
  { id: "german", name: "Tiếng Đức"},
];

export default function LanguageBooksPage() {
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
      case "level":
        return a.level.localeCompare(b.level);
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case "A1":
      case "A2":
        return "bg-green-100 text-green-700";
      case "B1":
      case "B2":
        return "bg-blue-100 text-blue-700";
      case "C1":
      case "C2":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-teal-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách ngoại ngữ</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Sách Ngoại Ngữ
            </h1>
          </div>
          <p className="text-gray-700 text-lg font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            {MOCK_BOOKS.length} giáo trình ngoại ngữ - Chuẩn quốc tế từ A1-C2
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Ngôn ngữ:</h3>
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
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg"
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
              <label htmlFor="sort-language" className="sr-only">
                Sắp xếp
              </label>
              <select
                id="sort-language"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="level">Theo trình độ</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {paginatedBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group bg-white rounded-xl p-3 shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-teal-300"
            >
              <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />

                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-bold ${getLevelColor(
                      book.level
                    )}`}
                  >
                    {book.level}
                  </div>
                  {book.hasAudio && (
                    <Badge className="text-xs bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>
                      AUDIO
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-teal-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 font-medium">{book.author}</p>
                <p className="text-xs text-teal-600 font-semibold">
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

        <div className="mt-12 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              Học Ngoại Ngữ Hiệu Quả
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Giáo trình chuẩn</h3>
                <p className="text-sm opacity-90">Theo tiêu chuẩn CEFR quốc tế A1-C2</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Tài liệu Audio</h3>
                <p className="text-sm opacity-90">Luyện nghe và phát âm chuẩn xác</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Thi chứng chỉ</h3>
                <p className="text-sm opacity-90">IELTS, TOEIC, JLPT, HSK, TOPIK</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
