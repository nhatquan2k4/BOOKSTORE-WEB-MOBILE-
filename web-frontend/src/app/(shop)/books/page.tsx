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
  isBestseller?: boolean;
  isNew?: boolean;
};

type SortOption = "popular" | "price-asc" | "price-desc" | "rating" | "name";
type PriceRange = "all" | "under-100k" | "100k-300k" | "300k-500k" | "over-500k";

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
    isBestseller: true,
  },
  {
    id: "2",
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    category: "Kỹ năng sống",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 5678,
    stock: 230,
    isBestseller: true,
  },
  {
    id: "3",
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    category: "Văn học",
    price: 85000,
    originalPrice: 110000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4321,
    stock: 180,
    isBestseller: true,
  },
  {
    id: "4",
    title: "Sapiens: Lược Sử Loài Người",
    author: "Yuval Noah Harari",
    category: "Khoa học",
    price: 280000,
    originalPrice: 350000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3421,
    stock: 90,
    isBestseller: true,
  },
  {
    id: "5",
    title: "Chiến Tranh Tiền Tệ",
    author: "Song Hongbing",
    category: "Kinh tế",
    price: 165000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1876,
    stock: 45,
  },
  {
    id: "6",
    title: "Mắt Biếc",
    author: "Nguyễn Nhật Ánh",
    category: "Văn học",
    price: 95000,
    originalPrice: 120000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3987,
    stock: 150,
    isNew: true,
  },
  {
    id: "7",
    title: "Tư Duy Nhanh Và Chậm",
    author: "Daniel Kahneman",
    category: "Tâm lý học",
    price: 245000,
    originalPrice: 310000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1234,
    stock: 60,
  },
  {
    id: "8",
    title: "Nghĩ Giàu Làm Giàu",
    author: "Napoleon Hill",
    category: "Kinh doanh",
    price: 115000,
    originalPrice: 145000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 1987,
    stock: 110,
  },
  {
    id: "9",
    title: "7 Thói Quen Hiệu Quả",
    author: "Stephen Covey",
    category: "Kỹ năng sống",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 2345,
    stock: 95,
  },
  {
    id: "10",
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Lập trình",
    price: 350000,
    originalPrice: 450000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1234,
    stock: 45,
    isBestseller: true,
  },
  {
    id: "11",
    title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
    author: "Nguyễn Nhật Ánh",
    category: "Văn học",
    price: 125000,
    originalPrice: 160000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4567,
    stock: 140,
    isNew: true,
  },
  {
    id: "12",
    title: "Homo Deus: Lược Sử Tương Lai",
    author: "Yuval Noah Harari",
    category: "Khoa học",
    price: 295000,
    originalPrice: 370000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2987,
    stock: 75,
  },
  {
    id: "13",
    title: "The Lean Startup",
    author: "Eric Ries",
    category: "Kinh doanh",
    price: 185000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 876,
    stock: 55,
  },
  {
    id: "14",
    title: "Càng Bình Tĩnh Càng Hạnh Phúc",
    author: "Megumi",
    category: "Tâm lý học",
    price: 98000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 2134,
    stock: 180,
    isNew: true,
  },
  {
    id: "15",
    title: "Đừng Bao Giờ Đi Ăn Một Mình",
    author: "Keith Ferrazzi",
    category: "Kỹ năng sống",
    price: 155000,
    originalPrice: 195000,
    cover: "/image/anh.png",
    rating: 4.5,
    reviewCount: 876,
    stock: 70,
  },
  {
    id: "16",
    title: "Nghệ Thuật Bán Hàng Vĩ Đại",
    author: "Brian Tracy",
    category: "Kinh doanh",
    price: 168000,
    originalPrice: 210000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 876,
    stock: 85,
  },
  {
    id: "17",
    title: "Số Đỏ",
    author: "Vũ Trọng Phụng",
    category: "Văn học",
    price: 115000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviewCount: 2345,
    stock: 95,
  },
  {
    id: "18",
    title: "Truyện Kiều",
    author: "Nguyễn Du",
    category: "Văn học",
    price: 185000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 4567,
    stock: 110,
  },
  {
    id: "19",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Kỹ năng sống",
    price: 175000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 1987,
    stock: 65,
  },
  {
    id: "20",
    title: "Design Patterns",
    author: "Gang of Four",
    category: "Lập trình",
    price: 420000,
    originalPrice: 500000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 856,
    stock: 35,
  },
  {
    id: "21",
    title: "Kinh Tế Học Vi Mô",
    author: "N. Gregory Mankiw",
    category: "Kinh tế",
    price: 275000,
    originalPrice: 340000,
    cover: "/image/anh.png",
    rating: 4.6,
    reviewCount: 1987,
    stock: 50,
  },
  {
    id: "22",
    title: "Tuyển Tập Thơ Xuân Diệu",
    author: "Xuân Diệu",
    category: "Văn học",
    price: 145000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviewCount: 1234,
    stock: 80,
  },
  {
    id: "23",
    title: "Psychology of Money",
    author: "Morgan Housel",
    category: "Kinh tế",
    price: 195000,
    originalPrice: 245000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 2876,
    stock: 90,
    isNew: true,
  },
  {
    id: "24",
    title: "Cây Cam Ngọt Của Tôi",
    author: "José Mauro de Vasconcelos",
    category: "Văn học",
    price: 135000,
    originalPrice: 170000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviewCount: 3456,
    stock: 120,
  },
];

const CATEGORIES = [
  { id: "all", name: "Tất cả", icon: "📚" },
  { id: "Văn học", name: "Văn học", icon: "📖" },
  { id: "Kỹ năng sống", name: "Kỹ năng sống", icon: "💡" },
  { id: "Kinh tế", name: "Kinh tế", icon: "💰" },
  { id: "Kinh doanh", name: "Kinh doanh", icon: "💼" },
  { id: "Khoa học", name: "Khoa học", icon: "🔬" },
  { id: "Lập trình", name: "Lập trình", icon: "💻" },
  { id: "Tâm lý học", name: "Tâm lý học", icon: "🧠" },
];

export default function AllBooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  const searchedBooks = MOCK_BOOKS.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryBooks =
    selectedCategory === "all"
      ? searchedBooks
      : searchedBooks.filter((book) => book.category === selectedCategory);

  const priceFilteredBooks = categoryBooks.filter((book) => {
    switch (priceRange) {
      case "under-100k":
        return book.price < 100000;
      case "100k-300k":
        return book.price >= 100000 && book.price < 300000;
      case "300k-500k":
        return book.price >= 300000 && book.price < 500000;
      case "over-500k":
        return book.price >= 500000;
      default:
        return true;
    }
  });

  const sortedBooks = [...priceFilteredBooks].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.reviewCount - a.reviewCount;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (range: PriceRange) => {
    setPriceRange(range);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return MOCK_BOOKS.length;
    return MOCK_BOOKS.filter((book) => book.category === categoryId).length;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Tất cả sách</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            <h1 className="text-4xl font-bold text-gray-900">Tất Cả Sách</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Khám phá {sortedBooks.length} đầu sách từ nhiều thể loại khác nhau
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sách, tác giả..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-5 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Danh mục:</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                  <span className="ml-2 text-xs opacity-75">
                    ({getCategoryCount(cat.id)})
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price-range" className="text-sm font-semibold text-gray-700 mb-2 block">
                Khoảng giá:
              </label>
              <select
                id="price-range"
                value={priceRange}
                onChange={(e) => handlePriceRangeChange(e.target.value as PriceRange)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="under-100k">Dưới 100.000₫</option>
                <option value="100k-300k">100.000₫ - 300.000₫</option>
                <option value="300k-500k">300.000₫ - 500.000₫</option>
                <option value="over-500k">Trên 500.000₫</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort-by" className="text-sm font-semibold text-gray-700 mb-2 block">
                Sắp xếp:
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
            <span className="font-semibold">{Math.min(endIndex, sortedBooks.length)}</span> trong
            tổng số <span className="font-semibold">{sortedBooks.length}</span> sách
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-orange-500"
              >
                <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
              </svg>
              <span className="text-gray-600">
                {MOCK_BOOKS.filter((b) => b.isBestseller).length} Best Seller
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span className="text-gray-600">
                {MOCK_BOOKS.filter((b) => b.isNew).length} Sách mới
              </span>
            </div>
          </div>
        </div>

        {paginatedBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {paginatedBooks.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group bg-white rounded-xl p-3 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                  <Image
                    src={book.cover}
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {book.isBestseller && (
                      <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="inline-block mr-1"
                        >
                          <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
                        </svg>
                        HOT
                      </Badge>
                    )}
                    {book.isNew && (
                      <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg">
                        MỚI
                      </Badge>
                    )}
                  </div>

                  {book.originalPrice && (
                    <Badge variant="danger" className="absolute top-2 left-2 text-xs">
                      -{calculateDiscount(book.originalPrice, book.price)}%
                    </Badge>
                  )}

                  {book.stock < 10 && book.stock > 0 && (
                    <Badge variant="warning" className="absolute bottom-2 left-2 text-xs">
                      Chỉ còn {book.stock}
                    </Badge>
                  )}
                  {book.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="danger" className="text-sm font-bold">
                        HẾT HÀNG
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px]">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600">{book.author}</p>
                  <p className="text-xs text-gray-500">{book.category}</p>

                  <div className="flex items-center gap-2 pt-1">
                    <p className="text-blue-600 font-bold text-sm">
                      {formatPrice(book.price)}
                    </p>
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
                    <span className="text-xs text-gray-600">{book.rating}</span>
                    <span className="text-xs text-gray-400">({book.reviewCount})</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy sách
            </h3>
            <p className="text-gray-600 mb-6">
              Không có sách nào phù hợp với bộ lọc của bạn.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setPriceRange("all");
                setCurrentPage(1);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xóa bộ lọc
            </button>
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

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/literature"
            className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl p-6 hover:shadow-xl transition-all"
          >
            <div className="text-4xl mb-2">📖</div>
            <h3 className="font-bold text-lg mb-1">Văn học</h3>
            <p className="text-sm opacity-90">
              {MOCK_BOOKS.filter((b) => b.category === "Văn học").length} đầu sách
            </p>
          </Link>
          <Link
            href="/life-skills"
            className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-6 hover:shadow-xl transition-all"
          >
            <div className="text-4xl mb-2">💡</div>
            <h3 className="font-bold text-lg mb-1">Kỹ năng sống</h3>
            <p className="text-sm opacity-90">
              {MOCK_BOOKS.filter((b) => b.category === "Kỹ năng sống").length} đầu sách
            </p>
          </Link>
          <Link
            href="/economics"
            className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl p-6 hover:shadow-xl transition-all"
          >
            <div className="text-4xl mb-2">💰</div>
            <h3 className="font-bold text-lg mb-1">Kinh tế</h3>
            <p className="text-sm opacity-90">
              {MOCK_BOOKS.filter((b) => b.category === "Kinh tế").length} đầu sách
            </p>
          </Link>
          <Link
            href="/new-arrivals"
            className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl p-6 hover:shadow-xl transition-all"
          >
            <div className="text-4xl mb-2">✨</div>
            <h3 className="font-bold text-lg mb-1">Sách mới</h3>
            <p className="text-sm opacity-90">
              {MOCK_BOOKS.filter((b) => b.isNew).length} đầu sách
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
