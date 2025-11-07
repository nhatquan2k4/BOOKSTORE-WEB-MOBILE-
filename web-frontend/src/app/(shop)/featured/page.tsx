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
  category: string;
  price: number;
  originalPrice?: number;
  cover: string;
  rating: number;
  reviewCount: number;
  stock: number;
  featuredReason: string;
  highlight?: string;
};

type SortOption = "featured" | "rating" | "price-asc" | "price-desc" | "name";

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
    featuredReason: "Bán chạy nhất 2024",
    highlight: "🏆 Best Seller",
  },
  {
    id: "2",
    title: "Sapiens: Lược Sử Loài Người",
    author: "Yuval Noah Harari",
    category: "Khoa học",
    price: 280000,
    originalPrice: 350000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4521,
    stock: 95,
    featuredReason: "Được đề xuất bởi Bill Gates",
    highlight: "⭐ Đề xuất",
  },
  {
    id: "3",
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    category: "Kỹ năng sống",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 5678,
    stock: 230,
    featuredReason: "Kinh điển về giao tiếp",
    highlight: "📚 Kinh điển",
  },
  {
    id: "4",
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Lập trình",
    price: 350000,
    originalPrice: 450000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 2134,
    stock: 45,
    featuredReason: "Must-read cho lập trình viên",
    highlight: "💻 Essential",
  },
  {
    id: "5",
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    category: "Văn học",
    price: 85000,
    originalPrice: 110000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4321,
    stock: 180,
    featuredReason: "Văn học hiện đại xuất sắc",
    highlight: "❤️ Được yêu thích",
  },
  {
    id: "6",
    title: "Tư Duy Nhanh Và Chậm",
    author: "Daniel Kahneman",
    category: "Tâm lý học",
    price: 245000,
    originalPrice: 310000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2876,
    stock: 60,
    featuredReason: "Nobel Prize Winner",
    highlight: "🏅 Giải Nobel",
  },
  {
    id: "7",
    title: "Homo Deus: Lược Sử Tương Lai",
    author: "Yuval Noah Harari",
    category: "Khoa học",
    price: 295000,
    originalPrice: 370000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3987,
    stock: 75,
    featuredReason: "Tầm nhìn về tương lai nhân loại",
    highlight: "🔮 Tương lai",
  },
  {
    id: "8",
    title: "Nghĩ Giàu Làm Giàu",
    author: "Napoleon Hill",
    category: "Kinh doanh",
    price: 115000,
    originalPrice: 145000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1987,
    stock: 110,
    featuredReason: "Bí quyết thành công từ Carnegie",
    highlight: "💰 Thành công",
  },
  {
    id: "9",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Kỹ năng sống",
    price: 175000,
    originalPrice: 220000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2456,
    stock: 85,
    featuredReason: "Làm việc hiệu quả trong thời đại số",
    highlight: "⚡ Hiệu suất",
  },
  {
    id: "10",
    title: "Design Patterns",
    author: "Gang of Four",
    category: "Lập trình",
    price: 420000,
    originalPrice: 500000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 1856,
    stock: 35,
    featuredReason: "Bible của Software Design",
    highlight: "📖 Bible",
  },
  {
    id: "11",
    title: "Psychology of Money",
    author: "Morgan Housel",
    category: "Kinh tế",
    price: 195000,
    originalPrice: 245000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3234,
    stock: 90,
    featuredReason: "Best Finance Book 2024",
    highlight: "💎 Tài chính",
  },
  {
    id: "12",
    title: "Mắt Biếc",
    author: "Nguyễn Nhật Ánh",
    category: "Văn học",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4567,
    stock: 150,
    featuredReason: "Hiện tượng văn học Việt Nam",
    highlight: "🇻🇳 Việt Nam",
  },
  {
    id: "13",
    title: "The Lean Startup",
    author: "Eric Ries",
    category: "Kinh doanh",
    price: 185000,
    originalPrice: 230000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 1876,
    stock: 55,
    featuredReason: "Khởi nghiệp thời đại mới",
    highlight: "🚀 Startup",
  },
  {
    id: "14",
    title: "Chiến Tranh Tiền Tệ",
    author: "Song Hongbing",
    category: "Kinh tế",
    price: 165000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2345,
    stock: 45,
    featuredReason: "Hiểu rõ hệ thống tài chính toàn cầu",
    highlight: "🌍 Toàn cầu",
  },
  {
    id: "15",
    title: "7 Thói Quen Hiệu Quả",
    author: "Stephen Covey",
    category: "Kỹ năng sống",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 3456,
    stock: 95,
    featuredReason: "Top Leadership Book",
    highlight: "👔 Lãnh đạo",
  },
  {
    id: "16",
    title: "Càng Bình Tĩnh Càng Hạnh Phúc",
    author: "Megumi",
    category: "Tâm lý học",
    price: 98000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2987,
    stock: 180,
    featuredReason: "Sống an nhiên trong thời hiện đại",
    highlight: "🧘 An nhiên",
  },
  {
    id: "17",
    title: "Đừng Bao Giờ Đi Ăn Một Mình",
    author: "Keith Ferrazzi",
    category: "Kỹ năng sống",
    price: 155000,
    originalPrice: 195000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1654,
    stock: 70,
    featuredReason: "Nghệ thuật networking đỉnh cao",
    highlight: "🤝 Networking",
  },
  {
    id: "18",
    title: "Cây Cam Ngọt Của Tôi",
    author: "José Mauro de Vasconcelos",
    category: "Văn học",
    price: 135000,
    originalPrice: 170000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3876,
    stock: 120,
    featuredReason: "Câu chuyện cảm động nhất thế kỷ",
    highlight: "😢 Cảm động",
  },
];

export default function FeaturedBooksPage() {
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  const sortedBooks = [...MOCK_BOOKS].sort((a, b) => {
    switch (sortBy) {
      case "featured":
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
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-orange-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Sách nổi bật</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
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
                className="text-orange-600"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-white"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Sách Nổi Bật
            </h1>
          </div>
          <p className="text-gray-700 text-lg font-medium">
            ⭐ {MOCK_BOOKS.length} đầu sách được chọn lọc kỹ càng - Những tác phẩm xuất sắc nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-3xl font-bold mb-1">{MOCK_BOOKS.length}</div>
            <div className="text-sm opacity-90">Sách nổi bật</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold mb-1">
              {(
                MOCK_BOOKS.reduce((acc, book) => acc + book.rating, 0) / MOCK_BOOKS.length
              ).toFixed(1)}
            </div>
            <div className="text-sm opacity-90">Đánh giá trung bình</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-2">💬</div>
            <div className="text-3xl font-bold mb-1">
              {(
                MOCK_BOOKS.reduce((acc, book) => acc + book.reviewCount, 0) / 1000
              ).toFixed(0)}
              K+
            </div>
            <div className="text-sm opacity-90">Lượt đánh giá</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold mb-1">
              {MOCK_BOOKS.filter((b) => b.originalPrice).length}
            </div>
            <div className="text-sm opacity-90">Đang giảm giá</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
              <span className="font-semibold">{Math.min(endIndex, sortedBooks.length)}</span> trong
              tổng số <span className="font-semibold">{sortedBooks.length}</span> sách
            </div>

            <div>
              <label htmlFor="sort-featured" className="sr-only">
                Sắp xếp
              </label>
              <select
                id="sort-featured"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="featured">🏆 Nổi bật nhất</option>
                <option value="rating">⭐ Đánh giá cao</option>
                <option value="price-asc">💰 Giá tăng dần</option>
                <option value="price-desc">💎 Giá giảm dần</option>
                <option value="name">📚 Tên A-Z</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {paginatedBooks.map((book, index) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group bg-white rounded-xl p-3 shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-orange-300"
            >
              <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {index < 3 && (
                  <div className="absolute top-2 left-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                    {index + 1}
                  </div>
                )}

                <div className="absolute top-2 right-2">
                  <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg">
                    {book.highlight}
                  </Badge>
                </div>

                {book.originalPrice && (
                  <Badge variant="danger" className="absolute bottom-2 left-2 text-xs font-bold">
                    -{calculateDiscount(book.originalPrice, book.price)}%
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-orange-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 font-medium">{book.author}</p>
                <p className="text-xs text-orange-600 font-semibold">{book.category}</p>

                <div className="bg-orange-50 rounded-md p-2 mt-2">
                  <p className="text-xs text-orange-800 font-medium line-clamp-2">
                    💡 {book.featuredReason}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <p className="text-orange-600 font-bold text-sm">{formatPrice(book.price)}</p>
                  {book.originalPrice && (
                    <p className="text-xs text-gray-400 line-through">
                      {formatPrice(book.originalPrice)}
                    </p>
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

        <div className="mt-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3">🎉 Tại Sao Chọn Sách Nổi Bật?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="font-bold text-lg mb-2">Được Chọn Lọc</h3>
                <p className="text-sm opacity-90">
                  Mỗi cuốn sách được đánh giá kỹ lưỡng bởi chuyên gia
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-bold text-lg mb-2">Chất Lượng Đảm Bảo</h3>
                <p className="text-sm opacity-90">
                  Đánh giá cao từ hàng nghìn độc giả trên toàn quốc
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-4xl mb-3">💎</div>
                <h3 className="font-bold text-lg mb-2">Giá Trị Lâu Dài</h3>
                <p className="text-sm opacity-90">
                  Kiến thức và trải nghiệm đọc đáng giá cho cuộc sống
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
