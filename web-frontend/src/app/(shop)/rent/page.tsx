'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Badge, Input, Breadcrumb} from '@/components/ui';
import { bookService } from '@/services';
import type { BookDto } from '@/types/dtos';

/**
 * Hàm tính toán giá thuê sách dựa trên giá mua và số ngày thuê
 * @param bookPrice - Giá mua sách
 * @param days - Số ngày thuê
 * @returns totalRent - Tổng tiền thuê
 * 
 * Logic:
 * - 3 ngày: 10,000đ (cố định cho mọi sách)
 * - 7 ngày: 3% giá sách
 * - 15 ngày: 5% giá sách (tiết kiệm 10%)
 * - 30 ngày: 9% giá sách (tiết kiệm 20%)
 * - 60 ngày: 15% giá sách (tiết kiệm 30%)
 * - 90 ngày: 21% giá sách (tiết kiệm 35%)
 * - 180 ngày: 34% giá sách (tiết kiệm 50% - PHỔ BIẾN)
 * - 365 ngày: 51% giá sách (tiết kiệm 60%)
 */
function calculateRentalPrice(bookPrice: number, days: number): number {
  // Gói 3 ngày cố định
  if (days === 3) return 10000;
  
  // Các gói khác tính theo % giá sách
  const rentalRates: { [key: number]: number } = {
    7: 0.03,    // 3%
    15: 0.05,   // 5%
    30: 0.09,   // 9%
    60: 0.15,   // 15%
    90: 0.21,   // 21%
    180: 0.34,  // 34%
    365: 0.51,  // 51%
  };
  
  const rate = rentalRates[days];
  if (!rate) return 0;
  
  return Math.round(bookPrice * rate);
}

/**
 * Tạo danh sách các gói thuê cho một cuốn sách
 * @param bookPrice - Giá mua sách
 * @returns Mảng các gói thuê với giá tính toán
 * @internal Dùng cho trang chi tiết sách thuê
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateRentalPlans(bookPrice: number) {
  return [
    { id: 1, duration: "3 ngày", days: 3, price: calculateRentalPrice(bookPrice, 3), discount: 0, popular: false },
    { id: 2, duration: "7 ngày", days: 7, price: calculateRentalPrice(bookPrice, 7), discount: 0, popular: false },
    { id: 3, duration: "15 ngày", days: 15, price: calculateRentalPrice(bookPrice, 15), discount: 10, popular: false },
    { id: 4, duration: "30 ngày", days: 30, price: calculateRentalPrice(bookPrice, 30), discount: 20, popular: false },
    { id: 5, duration: "60 ngày", days: 60, price: calculateRentalPrice(bookPrice, 60), discount: 30, popular: false },
    { id: 6, duration: "90 ngày", days: 90, price: calculateRentalPrice(bookPrice, 90), discount: 35, popular: false },
    { id: 7, duration: "180 ngày", days: 180, price: calculateRentalPrice(bookPrice, 180), discount: 50, popular: true },
    { id: 8, duration: "1 năm (365 ngày)", days: 365, price: calculateRentalPrice(bookPrice, 365), discount: 60, popular: false },
  ];
}

interface RentableBook {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: string;
  rating: number;
  reviews: number;
  purchasePrice: number;
  format: string;
  startPrice: number;
  popularPrice: number;
}

const sortOptions = [
  { value: "popular", label: "Phổ biến nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "rating", label: "Đánh giá cao" },
];

export default function RentPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [activeHero, setActiveHero] = useState(0);
  const [rentableBooks, setRentableBooks] = useState<RentableBook[]>([]);
  const [categories, setCategories] = useState<string[]>(["Tất cả"]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await bookService.getBooks({
          pageNumber: 1,
          pageSize: 50, // Lấy nhiều sách cho trang thuê
        });
        
        if (response.items && response.items.length > 0) {
          const transformed: RentableBook[] = response.items.map((book: BookDto) => {
            const purchasePrice = book.currentPrice || 0;
            return {
              id: book.id,
              title: book.title,
              author: book.authorNames?.[0] || "Tác giả không xác định",
              cover: book.coverImage || "/image/anh.png",
              category: book.categoryNames?.[0] || "Chưa phân loại",
              rating: book.averageRating || 0,
              reviews: book.totalReviews || 0,
              purchasePrice: purchasePrice,
              format: "ePub, PDF",
              startPrice: calculateRentalPrice(purchasePrice, 3),
              popularPrice: calculateRentalPrice(purchasePrice, 180),
            };
          });
          setRentableBooks(transformed);
          setTotalItems(response.totalCount || 0);
          
          // Extract unique categories
          const uniqueCategories = ["Tất cả", ...new Set(transformed.map(b => b.category))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setRentableBooks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooks();
  }, []);

  const filteredBooks = rentableBooks.filter(book => {
    const matchCategory = selectedCategory === "Tất cả" || book.category === selectedCategory;
    const matchSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Hero carousel
  const heroBooks = rentableBooks.slice(0, 6);

  const handleNextHero = () => {
    setActiveHero((prev) => (prev + 1) % heroBooks.length);
  };

  const handlePrevHero = () => {
    setActiveHero((prev) => (prev - 1 + heroBooks.length) % heroBooks.length);
  };

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHero((prev) => (prev + 1) % heroBooks.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [heroBooks.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Thuê eBook" }]} />
      
      {/* Hero Section - Similar to DiscoverNow */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-10 md:gap-6 items-center">
          {loading ? (
            <>
              {/* left skeleton */}
              <div className="md:w-1/2 z-10 animate-pulse">
                <div className="h-6 w-40 bg-white/10 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-white/10 rounded mb-3"></div>
                <div className="h-12 bg-white/10 rounded mb-4"></div>
                <div className="h-20 bg-white/10 rounded mb-6"></div>
                <div className="flex gap-3">
                  <div className="h-10 w-32 bg-white/10 rounded-full"></div>
                  <div className="h-10 w-48 bg-white/10 rounded-full"></div>
                </div>
              </div>
              {/* right skeleton */}
              <div className="md:w-1/2 relative h-[400px] md:h-[420px] w-full">
                <div className="absolute top-4 right-0 w-[260px] h-[360px] md:w-[280px] md:h-[380px] bg-white/10 rounded-3xl animate-pulse"></div>
              </div>
            </>
          ) : heroBooks.length > 0 ? (
            <>
              {/* left */}
              <div className="md:w-1/2 z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide mb-4">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Thuê eBook tiết kiệm
                </div>

                <p className="text-sm text-white/70 mb-3">Sách điện tử / {heroBooks[activeHero]?.category || "Lập trình"}</p>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                  {heroBooks[activeHero]?.title || "Thuê eBook - Tri thức trong tầm tay"}
                </h1>

                <p className="text-sm md:text-base text-white/75 mb-6 line-clamp-4 md:line-clamp-5 max-w-xl">
                  Truy cập hàng ngàn đầu sách điện tử với chi phí thấp. Đọc không giới hạn, học không ngừng nghỉ! Chỉ từ 10,000₫ cho 3 ngày thuê.
                </p>

            <div className="flex gap-3 items-center">
              <Link
                href={`/rent/${heroBooks[activeHero]?.id || 1}`}
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5"
              >
                Thuê ngay
              </Link>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
                Thêm vào yêu thích
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div>
                <div className="text-2xl font-bold mb-1">5000+</div>
                <div className="text-white/60 text-xs">eBook có sẵn</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">Từ 10K</div>
                <div className="text-white/60 text-xs">Cho 3 ngày</div>
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">60%</div>
                <div className="text-white/60 text-xs">Tiết kiệm tối đa</div>
              </div>
            </div>
          </div>

          {/* right - Book carousel */}
          <div className="md:w-1/2 relative h-[400px] md:h-[420px] w-full">
            {heroBooks.map((book, index) => {
              const offset = index - activeHero;
              const isActive = index === activeHero;
              return (
                <div
                  key={book.id}
                  className="absolute top-4 right-0 w-[260px] h-[360px] md:w-[280px] md:h-[380px] rounded-3xl overflow-hidden bg-slate-700/30 border border-white/10 shadow-2xl backdrop-blur"
                  style={{
                    transform: `translateX(${offset * -110}px) translateY(${
                      Math.abs(offset) * 14
                    }px) scale(${1 - Math.abs(offset) * 0.04})`,
                    opacity: Math.abs(offset) > 2 ? 0 : 1,
                    zIndex: 40 - Math.abs(offset),
                    transition: "all 0.35s ease",
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image src={book.cover} alt={book.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/0 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-xs text-white/60 mb-1">eBook</p>
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">
                        {book.title}
                      </h3>
                      <p className="text-[10px] text-white/50 line-clamp-1">{book.author}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-emerald-400">
                          Từ {book.startPrice.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute top-3 left-3 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-semibold text-slate-950">
                      Tiết kiệm
                    </div>
                  )}
                </div>
              );
            })}

            {/* arrows */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              <button
                onClick={handlePrevHero}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center border border-white/10"
                aria-label="Previous"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={handleNextHero}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center border border-white/10"
                aria-label="Next"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* dots */}
            <div className="absolute bottom-2 right-0 flex gap-2">
              {heroBooks.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveHero(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeHero ? "w-6 bg-white" : "w-2 bg-white/40"
                  }`}
                  aria-label={`Chuyển tới slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
            </>
          ) : null}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
              <div className="flex-1 w-full md:max-w-md">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sách, tác giả..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 whitespace-nowrap">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm font-medium"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "primary" : "outline"}
                  size="sm"
                  className={`whitespace-nowrap ${
                    selectedCategory === category ? 'shadow-lg' : ''
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mb-6">
              <p className="text-gray-600">
                Tìm thấy <span className="font-semibold text-gray-900">{filteredBooks.length}</span> sách 
                {selectedCategory === "Tất cả" && ` (Tổng: ${totalItems})`}
              </p>
            </div>
          )}

          {/* Books Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
              <Link
                key={book.id}
                href={`/rent/${book.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <Image
                    src={book.cover}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="success" className="bg-green-500 text-white text-xs">
                      eBook
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition shadow-lg">
                      <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <Badge variant="default" className="text-xs bg-blue-50 text-blue-700">
                      {book.category}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                    {book.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">{book.author}</p>

                  {book.rating > 0 && book.reviews > 0 ? (
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm font-medium text-gray-900">{book.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-gray-500">({book.reviews})</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 mb-3">
                      Đang cập nhật
                    </div>
                  )}

                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Thuê từ</div>
                        <div className="font-bold text-blue-600 text-lg">
                          {book.startPrice.toLocaleString('vi-VN')}₫
                          <span className="text-xs font-normal text-gray-500">/3 ngày</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-0.5">Phổ biến</div>
                        <div className="font-semibold text-gray-900">
                          {book.popularPrice.toLocaleString('vi-VN')}₫
                          <span className="text-xs text-gray-500">/180 ngày</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm py-2"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredBooks.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sách</h3>
              <p className="text-gray-600 mb-6">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Tất cả");
                }}
                variant="outline"
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Bắt đầu hành trình học tập của bạn ngay hôm nay!</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Hàng ngàn đầu sách đang chờ bạn khám phá. Thuê ngay với giá ưu đãi!
          </p>
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg"
          >
            Khám phá ngay
          </Button>
        </div>
      </section>
    </div>
  );
}
