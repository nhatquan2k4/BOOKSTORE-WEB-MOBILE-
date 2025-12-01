"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useParams } from "next/navigation";

const formatVnd = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

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
    },
    {
      id: "2",
      title: "Clear Thinking",
      cover: "/image/anh.png",
      price: 245000,
      originalPrice: 320000,
      rating: 4.7,
      reviewCount: 1234,
    },
  ];

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
        <div className="border-b mb-8">
          <div className="flex gap-8">
            <Button
              onClick={() => setActiveTab("books")}
              variant={activeTab === "books" ? "primary" : "outline"}
              size="md"
              className={`pb-4 border-b-2 ${
                activeTab === "books"
                  ? "border-blue-600"
                  : "border-transparent"
              }`}
            >
              Tác phẩm ({author.bookCount})
            </Button>
            <Button
              onClick={() => setActiveTab("about")}
              variant={activeTab === "about" ? "primary" : "outline"}
              size="md"
              className={`pb-4 border-b-2 ${
                activeTab === "about"
                  ? "border-blue-600"
                  : "border-transparent"
              }`}
            >
              Giới thiệu
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "books" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pb-12">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group"
              >
                <div className="relative aspect-[3/4] mb-3">
                  <Image
                    src={book.cover}
                    alt={book.title}
                    fill
                    className="object-cover rounded-lg group-hover:scale-105 transition shadow-sm"
                  />
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-600">
                  {book.title}
                </h3>
                <div className="flex items-center gap-1 text-xs mb-2">
                  <span className="text-yellow-400">★</span>
                  <span className="font-medium">{book.rating}</span>
                  <span className="text-gray-400">({book.reviewCount})</span>
                </div>
                <p className="font-bold text-red-600">{formatVnd(book.price)}</p>
                {book.originalPrice && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatVnd(book.originalPrice)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl pb-12">
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Tiểu sử</h2>
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

            {author.awards.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Giải thưởng & Danh hiệu</h2>
                <ul className="space-y-2">
                  {author.awards.map((award, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-gray-700">{award}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
