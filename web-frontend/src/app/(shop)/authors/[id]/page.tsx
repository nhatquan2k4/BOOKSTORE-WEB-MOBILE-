"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useParams } from "next/navigation";

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

export default function AuthorDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<"books" | "about">("books");
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "price-asc" | "price-desc">("newest");
  const itemsPerPage = 8;

  // Mock data
  const author = {
    id: params.id as string,
    name: "James Clear",
    avatar: "/image/anh.png",
    coverImage: "/image/anh.png",
    bio: "James Clear là tác giả của cuốn sách bán chạy số 1 New York Times - Atomic Habits. Cuốn sách đã bán được hơn 15 triệu bản trên toàn thế giới và được dịch ra hơn 50 ngôn ngữ.",
    birthYear: 1986,
    nationality: "Mỹ",
    website: "jamesclear.com",
    bookCount: 12,
    followers: 45600,
    totalRating: 4.8,
    categories: ["Kỹ năng sống", "Tự phát triển", "Kinh doanh"],
    awards: [
      "New York Times Bestseller",
      "Wall Street Journal Bestseller",
      "USA Today Bestseller",
    ],
  };

  const books = [
    {
      id: "1",
      title: "Atomic Habits - Thói Quen Nguyên Tử",
      cover: "/image/anh.png",
      price: 195000,
      originalPrice: 250000,
      rating: 4.9,
      reviewCount: 3456,
      stock: 120,
    },
    {
      id: "2",
      title: "Clear Thinking",
      cover: "/image/anh.png",
      price: 245000,
      originalPrice: 320000,
      rating: 4.7,
      reviewCount: 1234,
      stock: 85,
    },
    {
      id: "3",
      title: "Nguyên Lý Thành Công",
      cover: "/image/anh.png",
      price: 175000,
      originalPrice: 220000,
      rating: 4.8,
      reviewCount: 892,
      stock: 45,
    },
    {
      id: "4",
      title: "Tư Duy Nhanh Và Chậm",
      cover: "/image/anh.png",
      price: 215000,
      originalPrice: 280000,
      rating: 4.9,
      reviewCount: 2145,
      stock: 95,
    },
    {
      id: "5",
      title: "7 Thói Quen Hiệu Quả",
      cover: "/image/anh.png",
      price: 165000,
      originalPrice: 210000,
      rating: 4.7,
      reviewCount: 1678,
      stock: 110,
    },
    {
      id: "6",
      title: "Đắc Nhân Tâm",
      cover: "/image/anh.png",
      price: 125000,
      originalPrice: 160000,
      rating: 4.8,
      reviewCount: 3421,
      stock: 150,
    },
    {
      id: "7",
      title: "Nghĩ Giàu Làm Giàu",
      cover: "/image/anh.png",
      price: 135000,
      originalPrice: 170000,
      rating: 4.6,
      reviewCount: 987,
      stock: 75,
    },
    {
      id: "8",
      title: "Càng Kỷ Luật Càng Tự Do",
      cover: "/image/anh.png",
      price: 155000,
      originalPrice: 195000,
      rating: 4.8,
      reviewCount: 1543,
      stock: 88,
    },
  ];

  const sortedBooks = [...books].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.reviewCount - a.reviewCount;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
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
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        <Image
          src={author.coverImage}
          alt="Cover"
          fill
          className="object-cover opacity-20"
        />
      </div>

      {/* Author Info */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-20 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative w-40 h-40 flex-shrink-0 mx-auto md:mx-0">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  fill
                  className="object-cover rounded-full ring-4 ring-white"
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{author.name}</h1>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                      {author.categories.map((cat) => (
                        <Badge key={cat} variant="default">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsFollowing(!isFollowing)}
                    variant={isFollowing ? "outline" : "primary"}
                    size="md"
                  >
                    {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 justify-center md:justify-start text-sm mb-4">
                  <div>
                    <span className="font-bold text-lg">{author.bookCount}</span>
                    <span className="text-gray-600 ml-1">tác phẩm</span>
                  </div>
                  <div>
                    <span className="font-bold text-lg">
                      {formatNumber(author.followers)}
                    </span>
                    <span className="text-gray-600 ml-1">người theo dõi</span>
                  </div>
                  <div>
                    <span className="font-bold text-lg">{author.totalRating}</span>
                    <span className="text-yellow-400 ml-1">★</span>
                    <span className="text-gray-600 ml-1">đánh giá</span>
                  </div>
                </div>

                {/* Short Bio */}
                <p className="text-gray-600 line-clamp-2">{author.bio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b flex gap-8 px-6">
            <button
              onClick={() => setActiveTab("books")}
              className={`relative py-4 text-sm font-medium transition-colors ${
                activeTab === "books" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Tác phẩm
              {activeTab === "books" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`relative py-4 text-sm font-medium transition-colors ${
                activeTab === "about" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Giới thiệu
              {activeTab === "about" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "books" ? (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold">
                    Tác phẩm ({sortedBooks.length})
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
                      <span className="font-semibold">{Math.min(endIndex, sortedBooks.length)}</span> /{" "}
                      <span className="font-semibold">{sortedBooks.length}</span>
                    </div>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "newest" | "popular" | "price-asc" | "price-desc")}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="popular">Bán chạy</option>
                      <option value="price-asc">Giá tăng dần</option>
                      <option value="price-desc">Giá giảm dần</option>
                    </select>
                  </div>
                </div>

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

                        {book.stock < 50 && (
                          <div className="absolute top-2 left-2">
                            <Badge className="text-xs bg-red-500 text-white font-bold">
                              Sắp hết
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition-colors">
                          {book.title}
                        </h3>

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

                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <p className="text-blue-600 font-bold text-sm">{formatPrice(book.price)}</p>
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

                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Biography */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Tiểu sử</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{author.bio}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Năm sinh:</span>
                      <span className="ml-2 font-medium">{author.birthYear}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quốc tịch:</span>
                      <span className="ml-2 font-medium">{author.nationality}</span>
                    </div>
                    {author.website && (
                      <div>
                        <span className="text-gray-600">Website:</span>
                        <a
                          href={`https://${author.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          {author.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Awards */}
                {author.awards.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Giải thưởng & Danh hiệu</h3>
                    <ul className="space-y-2">
                      {author.awards.map((award, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-700">
                          <svg
                            className="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {award}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
