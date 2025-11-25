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
  tools?: string[];
};

type SortOption = "popular" | "rating" | "price-asc" | "price-desc" | "name";
type SubCategory = "all" | "ui-ux" | "graphic" | "web" | "product" | "brand" | "motion";

const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    subcategory: "ui-ux",
    price: 285000,
    originalPrice: 350000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 3456,
    stock: 65,
    tools: ["Figma", "Sketch"],
  },
  {
    id: "2",
    title: "Refactoring UI",
    author: "Adam Wathan & Steve Schoger",
    subcategory: "ui-ux",
    price: 395000,
    originalPrice: 480000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 2876,
    stock: 42,
    tools: ["Tailwind CSS"],
  },
  {
    id: "3",
    title: "Thiết Kế Logo - Nghệ Thuật Branding",
    author: "Nguyễn Văn A",
    subcategory: "brand",
    price: 245000,
    originalPrice: 310000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1654,
    stock: 55,
    tools: ["Illustrator"],
  },
  {
    id: "4",
    title: "Photoshop CC - Từ Cơ Bản Đến Nâng Cao",
    author: "Trần Minh B",
    subcategory: "graphic",
    price: 195000,
    originalPrice: 245000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2134,
    stock: 78,
    tools: ["Photoshop"],
  },
  {
    id: "5",
    title: "Responsive Web Design with HTML5 and CSS",
    author: "Ben Frain",
    subcategory: "web",
    price: 325000,
    originalPrice: 400000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1987,
    stock: 48,
    tools: ["HTML", "CSS"],
  },
  {
    id: "6",
    title: "UX Design Essentials - Adobe XD",
    author: "Chris Minnick",
    subcategory: "ui-ux",
    price: 275000,
    originalPrice: 340000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1543,
    stock: 52,
    tools: ["Adobe XD"],
  },
  {
    id: "7",
    title: "Illustrator CC - Thiết Kế Vector",
    author: "Lê Thị C",
    subcategory: "graphic",
    price: 215000,
    originalPrice: 270000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1876,
    stock: 62,
    tools: ["Illustrator"],
  },
  {
    id: "8",
    title: "Product Design - From Idea to Market",
    author: "Laura Klein",
    subcategory: "product",
    price: 355000,
    originalPrice: 440000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1432,
    stock: 38,
    tools: ["Figma", "Miro"],
  },
  {
    id: "9",
    title: "Brand Identity Design",
    author: "Alina Wheeler",
    subcategory: "brand",
    price: 385000,
    originalPrice: 475000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 2345,
    stock: 32,
  },
  {
    id: "10",
    title: "After Effects - Motion Graphics",
    author: "Mark Christiansen",
    subcategory: "motion",
    price: 425000,
    originalPrice: 520000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1765,
    stock: 28,
    tools: ["After Effects"],
  },
  {
    id: "11",
    title: "Figma for UI/UX Design",
    author: "Thomas Lowry",
    subcategory: "ui-ux",
    price: 295000,
    originalPrice: 360000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 2987,
    stock: 58,
    tools: ["Figma"],
  },
  {
    id: "12",
    title: "Typography Essentials",
    author: "Ina Saltz",
    subcategory: "graphic",
    price: 265000,
    originalPrice: 330000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1234,
    stock: 45,
  },
  {
    id: "13",
    title: "Web Design with Figma",
    author: "Mizko",
    subcategory: "web",
    price: 315000,
    originalPrice: 390000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1654,
    stock: 42,
    tools: ["Figma"],
  },
  {
    id: "14",
    title: "The Product Book",
    author: "Product School",
    subcategory: "product",
    price: 365000,
    originalPrice: 450000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2134,
    stock: 35,
  },
  {
    id: "15",
    title: "InDesign CC - Layout Design",
    author: "Ngô Văn D",
    subcategory: "graphic",
    price: 235000,
    originalPrice: 290000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 987,
    stock: 52,
    tools: ["InDesign"],
  },
  {
    id: "16",
    title: "Cinema 4D - 3D Motion Graphics",
    author: "Chris Schmidt",
    subcategory: "motion",
    price: 445000,
    originalPrice: 540000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 1543,
    stock: 25,
    tools: ["Cinema 4D"],
  },
  {
    id: "17",
    title: "Color Theory for Designers",
    author: "Jim Krause",
    subcategory: "graphic",
    price: 185000,
    originalPrice: 230000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1432,
    stock: 68,
  },
  {
    id: "18",
    title: "Building Design Systems",
    author: "Sarrah Vesselov & Taurie Davis",
    subcategory: "ui-ux",
    price: 375000,
    originalPrice: 460000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1876,
    stock: 38,
  },
];

const SUBCATEGORIES = [
  { id: "all", name: "Tất cả"},
  { id: "ui-ux", name: "UI/UX Design"},
  { id: "graphic", name: "Graphic Design" },
  { id: "web", name: "Web Design" },
  { id: "product", name: "Product Design" },
  { id: "brand", name: "Branding" },
  { id: "motion", name: "Motion Graphics" },
];

export default function DesignBooksPage() {
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
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-pink-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách thiết kế</span>
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
              className="text-pink-600"
            >
              <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
              <path d="m14 7 3 3" />
              <path d="M5 6v4" />
              <path d="M19 14v4" />
              <path d="M10 2v2" />
              <path d="M7 8H3" />
              <path d="M21 16h-4" />
              <path d="M11 3H9" />
            </svg>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Sách Thiết Kế
            </h1>
          </div>
          <p className="text-gray-700 text-lg font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/></svg>
            {MOCK_BOOKS.length} cuốn sách thiết kế - Sáng tạo không giới hạn
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Chuyên mục:</h3>
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
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
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
              <label htmlFor="sort-design" className="sr-only">
                Sắp xếp
              </label>
              <select
                id="sort-design"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
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
              className="group bg-white rounded-xl p-3 shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-pink-300"
            >
              <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {book.tools && book.tools.length > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge className="text-xs bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg">
                      {book.tools[0]}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-pink-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 font-medium">{book.author}</p>
                <p className="text-xs text-pink-600 font-semibold">
                  {SUBCATEGORIES.find((c) => c.id === book.subcategory)?.name}
                </p>

                {book.tools && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {book.tools.slice(0, 2).map((tool) => (
                      <span
                        key={tool}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}

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

        <div className="mt-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/></svg>
              Khám Phá Nghệ Thuật Thiết Kế
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Nguyên lý cơ bản</h3>
                <p className="text-sm opacity-90">Nắm vững nền tảng thiết kế chuyên nghiệp</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Công cụ hiện đại</h3>
                <p className="text-sm opacity-90">Figma, Adobe XD, Photoshop, Illustrator</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Thực chiến dự án</h3>
                <p className="text-sm opacity-90">Áp dụng vào dự án thực tế ngay</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
