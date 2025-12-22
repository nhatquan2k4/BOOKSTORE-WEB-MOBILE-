// Home Page - Trang chủ
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge, Button } from "@/components/ui";
import { bookService, categoryService } from "@/services";
import type { BookDto, CategoryDto } from "@/types/dtos";
import { resolveBookPrice, formatPrice } from "@/lib/price";

// Helper format tiền
const formatVnd = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

// Helper tính % giảm giá
const calculateDiscount = (original: number, current: number) => {
  if (original <= 0 || current <= 0 || current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
};

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = [
    "/image/banner1.jpg",
    "/image/banner2.jpg",
    "/image/banner3.png",
    "/image/banner4.png",
    "/image/banner5.png",
  ];

  // API data state
  const [featuredBooksData, setFeaturedBooksData] = useState<BookDto[]>([]);
  const [popularBooksData, setPopularBooksData] = useState<BookDto[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Carousel logic for featured books
  const featuredRef = useRef<HTMLDivElement>(null);
  const [canPrevFeatured, setCanPrevFeatured] = useState(false);
  const [canNextFeatured, setCanNextFeatured] = useState(true);

  // Carousel logic for popular books
  const popularRef = useRef<HTMLDivElement>(null);
  const [canPrevPopular, setCanPrevPopular] = useState(false);
  const [canNextPopular, setCanNextPopular] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [featuredRes, popularRes, categoriesRes] = await Promise.all([
          bookService.getBestSellingBooks(12),
          bookService.getMostViewedBooks(12),
          categoryService.getCategories(1, 8),
        ]);

        console.log("Featured books response:", featuredRes);
        console.log("Popular books response:", popularRes);
        console.log("Categories response:", categoriesRes);

        setFeaturedBooksData(Array.isArray(featuredRes) ? featuredRes : []);
        setPopularBooksData(Array.isArray(popularRes) ? popularRes : []);
        setCategoriesData(categoriesRes?.items || []);
        
        console.log("State updated - Featured:", featuredRes?.length, "Popular:", popularRes?.length, "Categories:", categoriesRes?.items?.length);
      } catch (error) {
        console.error("Error fetching home page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Use API data only
  const displayFeaturedBooks = featuredBooksData;
  const displayPopularBooks = popularBooksData;
  const displayCategories = categoriesData;

  const updateArrowsFeatured = () => {
    if (!featuredRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = featuredRef.current;
    setCanPrevFeatured(scrollLeft > 5);
    setCanNextFeatured(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const updateArrowsPopular = () => {
    if (!popularRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = popularRef.current;
    setCanPrevPopular(scrollLeft > 5);
    setCanNextPopular(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scrollByStepFeatured = (dir: "left" | "right") => {
    if (!featuredRef.current) return;
    const step = 350;
    const delta = dir === "left" ? -step : step;
    featuredRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  const scrollByStepPopular = (dir: "left" | "right") => {
    if (!popularRef.current) return;
    const step = 350;
    const delta = dir === "left" ? -step : step;
    popularRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  useEffect(() => {
    const featuredRefCurrent = featuredRef.current;
    const popularRefCurrent = popularRef.current;

    if (featuredRefCurrent) {
      updateArrowsFeatured();
      featuredRefCurrent.addEventListener("scroll", updateArrowsFeatured);
    }

    if (popularRefCurrent) {
      updateArrowsPopular();
      popularRefCurrent.addEventListener("scroll", updateArrowsPopular);
    }

    return () => {
      if (featuredRefCurrent) {
        featuredRefCurrent.removeEventListener("scroll", updateArrowsFeatured);
      }
      if (popularRefCurrent) {
        popularRefCurrent.removeEventListener("scroll", updateArrowsPopular);
      }
    };
  }, []);

  // Auto slideshow for hero background
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden">
        {/* Background Slideshow */}
        <div className="absolute inset-0">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={img}
                alt={`Hero background ${idx + 1}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          ))}
          {/* Gradient overlay - lighter for better image visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          {/* Subtle dark overlay */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10 z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge variant="success" className="mb-6 inline-block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline mr-1"
              >
                <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
              </svg>
              Giảm giá đến 50% - Ưu đãi có hạn!
            </Badge>

            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Khám phá thế giới tri thức
            </h1>
            <p className="text-xl mb-12 text-blue-100">
              Hơn 10,000+ đầu sách từ các tác giả nổi tiếng thế giới. Mua sách
              giấy hoặc thuê eBook - trải nghiệm đọc không giới hạn!
            </p>

            <div className="flex gap-4 justify-center">
              <Link href="/discovernow">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
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
                    className="mr-2"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                  </svg>
                  Khám phá ngay
                </Button>
              </Link>
              <Link href="/rent">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white/10"
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
                    className="mr-2"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                    <path d="M8 7h8" />
                    <path d="M8 11h8" />
                  </svg>
                  Thuê eBook
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Danh mục nổi bật</h2>
            <Link href="/categories">
              <Button variant="ghost" size="sm">
                Xem tất cả
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
                  className="ml-1"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeleton for categories
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="h-48 rounded-lg bg-gray-200 animate-pulse"></div>
              ))
            ) : (
              displayCategories.slice(0, 8).map((cat, index) => {
                // Use array index for color rotation (stable across any ID format)
                const colorClasses = [
                  "from-blue-500 to-cyan-500",
                  "from-purple-500 to-pink-500",
                  "from-orange-500 to-red-500",
                  "from-green-500 to-teal-500",
                  "from-indigo-500 to-purple-500",
                  "from-pink-500 to-rose-500",
                  "from-yellow-500 to-orange-500",
                  "from-cyan-500 to-blue-500",
                ];
                const colorClass = colorClasses[index % colorClasses.length];

                // Fallback images for categories (UI-only enhancement)
                const catName = cat.name || "";
                const categoryImages: Record<string, string> = {
                  "lập trình": "/image/lap_trinh.jpg",
                  "programming": "/image/lap_trinh.jpg",
                  "kinh doanh": "/image/kinh_doanh.jpg",
                  "business": "/image/kinh_doanh.jpg",
                  "thiết kế": "/image/thiet_ke.jpg",
                  "design": "/image/thiet_ke.jpg",
                  "khoa học": "/image/khoa_hoc.png",
                  "science": "/image/khoa_hoc.png",
                  "văn học": "/image/van_hoc.jpg",
                  "literature": "/image/van_hoc.jpg",
                  "kỹ năng sống": "/image/ky_nang_song.jpg",
                  "life skills": "/image/ky_nang_song.jpg",
                  "thiếu nhi": "/image/thieu_nhi.jpg",
                  "children": "/image/thieu_nhi.jpg",
                  "ngoại ngữ": "/image/ngoai_ngu.jpg",
                  "foreign languages": "/image/ngoai_ngu.jpg",
                };
                const catImage = categoryImages[catName.toLowerCase()] || "/image/anh.png";

                return (
                  <Link key={cat.id} href={`/categories/${cat.id}`}>
                    <div className="relative h-48 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                      {/* Background Image with Overlay */}
                      <div className="absolute inset-0">
                        <Image
                          src={catImage}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover blur-[1px] group-hover:scale-110 transition-transform duration-300"
                        />
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-20`}
                        ></div>
                        <div className="absolute inset-0 bg-black/5"></div>
                      </div>

                      {/* Content */}
                      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center shadow-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white drop-shadow-md"
                          >
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                          </svg>
                        </div>

                        <div>
                          <h3 className="font-bold text-xl mb-2 text-white drop-shadow-lg">
                            {cat.name}
                          </h3>
                          <Badge
                            variant="default"
                            className="text-xs bg-white/95 text-gray-900 border-white/60 shadow-md"
                          >
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(cat as any).description || "Khám phá ngay"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Sách nổi bật</h2>
            <Link
              href="/featured"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              <span>Xem tất cả</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="relative">
            {/* Nút trái */}
            <Button
              type="button"
              onClick={() => scrollByStepFeatured("left")}
              disabled={!canPrevFeatured}
              variant="secondary"
              size="sm"
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 shadow-lg disabled:opacity-30"
              aria-label="Xem trước"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>

            {/* Dải sách */}
            <div
              ref={featuredRef}
              onScroll={updateArrowsFeatured}
              className="flex gap-5 overflow-x-auto pb-4 pr-4 pl-10 md:pl-12 md:pr-12 scroll-smooth
                        [-ms-overflow-style:none] [scrollbar-width:none] 
                        [&::-webkit-scrollbar]:hidden"
              style={{ overflowX: "auto" }}
            >
              {loading ? (
                // Loading skeleton for featured books
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="w-[260px] min-w-[260px] rounded-2xl bg-white shadow-md overflow-hidden">
                    <div className="w-full aspect-[4/5] bg-gray-200 animate-pulse"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : displayFeaturedBooks.length === 0 ? (
                <div className="w-full text-center py-8 text-gray-500">
                  Không có sách nổi bật.
                </div>
              ) : (
                displayFeaturedBooks.map((book) => {
                  const priceInfo = resolveBookPrice(book);
                  const bookCover = book.coverImage || "/image/anh.png";
                  const bookAuthor = book.authorNames && book.authorNames.length > 0 ? book.authorNames.join(", ") : "Chưa cập nhật";
                  const bookRating = book.averageRating ?? 0;
                  const bookReviews = book.totalReviews ?? 0;

                  return (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="flex w-[260px] min-w-[260px] flex-col rounded-2xl bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)]
                                 border border-pink-50 overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(15,23,42,0.16)] group"
                    >
                      {/* Ảnh sách full khung */}
                      <div className="relative w-full aspect-[4/5]">
                        <Image
                          src={bookCover}
                          alt={book.title}
                          fill
                          sizes="260px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Badge level + mới 2024 giống mẫu */}
                        {book.isAvailable && (
                          <div className="absolute top-2 left-2 flex items-center gap-1">
                            <Badge className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-600 text-white shadow">
                              Advanced
                            </Badge>
                          </div>
                        )}

                        <div className="absolute top-2 right-2">
                          <Badge className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow">
                            MỚI 2024
                          </Badge>
                        </div>
                      </div>

                      {/* Nội dung */}
                      <div className="p-3 flex flex-col gap-1 flex-1">
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-600">{bookAuthor}</p>

                        {/* Rating */}
                        {bookRating > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-600">
                            <span className="text-yellow-400">★</span>
                            <span className="font-semibold">
                              {bookRating.toFixed(1)}
                            </span>
                            <span className="text-gray-400">
                              ({bookReviews.toLocaleString()})
                            </span>
                          </div>
                        )}

                        {/* Giá: Giá giảm - Giá gốc - % giảm */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <p className="text-red-600 font-bold text-sm">
                            {formatPrice(priceInfo.finalPrice)}
                          </p>
                          {priceInfo.hasDiscount && (
                            <>
                              <p className="text-xs text-gray-400 line-through">
                                {formatPrice(priceInfo.originalPrice)}
                              </p>
                              <span className="inline-flex items-center rounded-full bg-red-50 text-red-600 text-[11px] font-semibold px-2 py-0.5 whitespace-nowrap">
                                -{priceInfo.discountPercent}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Nút phải */}
            <Button
              type="button"
              onClick={() => scrollByStepFeatured("right")}
              disabled={!canNextFeatured}
              variant="secondary"
              size="sm"
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 shadow-lg disabled:opacity-30"
              aria-label="Xem tiếp"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>

            {/* Gradient overlay */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-gray-50 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-gray-50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Sách được đọc nhiều nhất */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Sách được đọc nhiều nhất</h2>
            <Link
              href="/most-read"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              <span>Xem tất cả</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="relative">
            {/* Nút trái */}
            <Button
              type="button"
              onClick={() => scrollByStepPopular("left")}
              disabled={!canPrevPopular}
              variant="secondary"
              size="sm"
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 shadow-lg disabled:opacity-30"
              aria-label="Xem trước"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>

            {/* Dải sách */}
            <div
              ref={popularRef}
              onScroll={updateArrowsPopular}
              className="flex gap-5 overflow-x-auto pb-4 pr-4 pl-10 md:pl-12 md:pr-12 scroll-smooth
                        [-ms-overflow-style:none] [scrollbar-width:none]
                        [&::-webkit-scrollbar]:hidden"
              style={{ overflowX: "auto" }}
            >
              {loading ? (
                // Loading skeleton for popular books
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="w-[260px] min-w-[260px] rounded-2xl bg-white shadow-md overflow-hidden">
                    <div className="w-full aspect-[4/5] bg-gray-200 animate-pulse"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : displayPopularBooks.length === 0 ? (
                <div className="w-full text-center py-8 text-gray-500">
                  Không có sách phổ biến.
                </div>
              ) : (
                displayPopularBooks.map((book) => {
                  const priceInfo = resolveBookPrice(book);
                  const bookCover = book.coverImage || "/image/anh.png";
                  const bookAuthor = book.authorNames && book.authorNames.length > 0 ? book.authorNames.join(", ") : "Chưa cập nhật";
                  const bookRating = book.averageRating ?? 0;
                  const bookReviews = book.totalReviews ?? 0;

                  return (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="flex w-[260px] min-w-[260px] flex-col rounded-2xl bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)]
                                 border border-pink-50 overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(15,23,42,0.16)] group"
                    >
                      {/* Ảnh sách */}
                      <div className="relative w-full aspect-[4/5]">
                        <Image
                          src={bookCover}
                          alt={book.title}
                          fill
                          sizes="260px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        <div className="absolute top-2 right-2">
                          <Badge className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow">
                            MỚI 2024
                          </Badge>
                        </div>
                      </div>

                      {/* Nội dung */}
                      <div className="p-3 flex flex-col gap-1 flex-1">
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-600">{bookAuthor}</p>

                        {/* Rating */}
                        {bookRating > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-600">
                            <span className="text-yellow-400">★</span>
                            <span className="font-semibold">
                              {bookRating.toFixed(1)}
                            </span>
                            <span className="text-gray-400">
                              ({bookReviews.toLocaleString()})
                            </span>
                          </div>
                        )}

                        {/* Giá: Giá giảm - Giá gốc - % giảm */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <p className="text-red-600 font-bold text-sm">
                            {formatPrice(priceInfo.finalPrice)}
                          </p>
                          {priceInfo.hasDiscount && (
                            <>
                              <p className="text-xs text-gray-400 line-through">
                                {formatPrice(priceInfo.originalPrice)}
                              </p>
                              <span className="inline-flex items-center rounded-full bg-red-50 text-red-600 text-[11px] font-semibold px-2 py-0.5 whitespace-nowrap">
                                -{priceInfo.discountPercent}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Nút phải */}
            <Button
              type="button"
              onClick={() => scrollByStepPopular("right")}
              disabled={!canNextPopular}
              variant="secondary"
              size="sm"
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 shadow-lg disabled:opacity-30"
              aria-label="Xem tiếp"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>

            {/* Gradient overlay */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent" />
          </div>
        </div>
      </section>

      {/* Free Shipping Banner */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative">
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
              </div>

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-8 py-5">
                {/* Left side - Icon & Text */}
                <div className="flex items-center gap-4 text-white">
                  {/* Icon with animation */}
                  <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                      <path d="M15 18H9" />
                      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                      <circle cx="17" cy="18" r="2" />
                      <circle cx="7" cy="18" r="2" />
                    </svg>
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-0.5">
                      Miễn phí vận chuyển
                    </h3>
                    <p className="text-sm md:text-base text-white/90 font-medium">
                      Cho đơn hàng từ{" "}
                      <span className="font-bold text-yellow-200">
                        500.000₫
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right side - Badge */}
                <div className="flex items-center gap-3">
                  <Badge
                    variant="default"
                    className="bg-white text-emerald-600 font-bold text-sm px-4 py-2 shadow-lg border-0"
                  >
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
                      className="inline mr-1.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Áp dụng toàn quốc
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rental CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="warning" className="mb-6 inline-block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline mr-1"
            >
              <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
            </svg>
            Ưu đãi đặc biệt
          </Badge>

          <h2 className="text-5xl font-bold mb-4">
            Thuê eBook - Tiết kiệm hơn
          </h2>
          <p className="text-2xl mb-8 text-purple-100">
            Chỉ từ 10.000₫ - Đọc không giới hạn trên mọi thiết bị
          </p>

          <div className="flex gap-4 justify-center items-center mb-8">
            <Badge variant="success" className="text-base px-4 py-2">
              ✓ Không quảng cáo
            </Badge>
            <Badge variant="success" className="text-base px-4 py-2">
              ✓ Tải offline
            </Badge>
            <Badge variant="success" className="text-base px-4 py-2">
              ✓ Hủy bất kỳ lúc nào
            </Badge>
          </div>

          <Link href="/rental">
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
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
                className="mr-2"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                <path d="M8 7h8" />
                <path d="M8 11h8" />
              </svg>
              Dùng thử ngay - Miễn phí 7 ngày
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}