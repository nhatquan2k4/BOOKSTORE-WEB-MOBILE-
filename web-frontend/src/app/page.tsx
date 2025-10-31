// Home Page - Trang chủ
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge, Button } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/Card";

const featuredBooks = [
  {
    id: 1,
    title: "Clean Code",
    author: "Robert C. Martin",
    price: 350000,
    originalPrice: 450000,
    cover: "/image/anh.png",
    rating: 4.8,
    reviews: 1234,
  },
  {
    id: 2,
    title: "Design Patterns",
    author: "Gang of Four",
    price: 280000,
    originalPrice: 0,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 856,
  },
  {
    id: 3,
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    price: 320000,
    originalPrice: 400000,
    cover: "/image/anh.png",
    rating: 4.7,
    reviews: 645,
  },
  {
    id: 4,
    title: "Refactoring",
    author: "Martin Fowler",
    price: 290000,
    originalPrice: 0,
    cover: "/image/anh.png",
    rating: 4.6,
    reviews: 432,
  },
  {
    id: 5,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    price: 450000,
    originalPrice: 550000,
    cover: "/image/anh.png",
    rating: 4.9,
    reviews: 1567,
  },
  {
    id: 6,
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    price: 180000,
    originalPrice: 0,
    cover: "/image/anh.png",
    rating: 4.5,
    reviews: 892,
  },
];

const categories = [
  { id: 1, name: "Lập trình", count: 1234, color: "from-blue-500 to-cyan-500" },
  { id: 2, name: "Kinh doanh", count: 856, color: "from-purple-500 to-pink-500" },
  { id: 3, name: "Thiết kế", count: 645, color: "from-orange-500 to-red-500" },
  { id: 4, name: "Khoa học", count: 432, color: "from-green-500 to-teal-500" },
  { id: 5, name: "Văn học", count: 1567, color: "from-indigo-500 to-purple-500" },
  { id: 6, name: "Kỹ năng sống", count: 892, color: "from-pink-500 to-rose-500" },
  { id: 7, name: "Thiếu nhi", count: 543, color: "from-yellow-500 to-orange-500" },
  { id: 8, name: "Ngoại ngữ", count: 721, color: "from-cyan-500 to-blue-500" },
];

const popularBooks = [
  { id: "p1", title: "Bố Già", author: "Mario Puzo", price: 120000, originalPrice: 150000, cover: "/image/anh.png" },
  { id: "p2", title: "Tuổi trẻ đáng giá bao nhiêu", author: "Rosie Nguyễn", price: 85000, originalPrice: 0, cover: "/image/anh.png" },
  { id: "p3", title: "Đắc nhân tâm", author: "Dale Carnegie", price: 95000, originalPrice: 120000, cover: "/image/anh.png" },
  { id: "p4", title: "Nhà giả kim", author: "Paulo Coelho", price: 78000, originalPrice: 0, cover: "/image/anh.png" },
  { id: "p5", title: "Càng kỷ luật càng tự do", author: "Jocko Willink", price: 110000, originalPrice: 135000, cover: "/image/anh.png" },
  { id: "p6", title: "Nghĩ giàu làm giàu", author: "Napoleon Hill", price: 125000, originalPrice: 0, cover: "/image/anh.png" },
  { id: "p7", title: "7 thói quen hiệu quả", author: "Stephen Covey", price: 140000, originalPrice: 180000, cover: "/image/anh.png" },
  { id: "p8", title: "Quẳng gánh lo đi mà vui sống", author: "Dale Carnegie", price: 88000, originalPrice: 105000, cover: "/image/anh.png" },
  { id: "p9", title: "Sapiens: Lược sử loài người", author: "Yuval Noah Harari", price: 195000, originalPrice: 250000, cover: "/image/anh.png" },
  { id: "p10", title: "Homo Deus", author: "Yuval Noah Harari", price: 185000, originalPrice: 0, cover: "/image/anh.png" },
  { id: "p11", title: "Atomic Habits", author: "James Clear", price: 160000, originalPrice: 195000, cover: "/image/anh.png" },
  { id: "p12", title: "Deep Work", author: "Cal Newport", price: 145000, originalPrice: 175000, cover: "/image/anh.png" },
];

const benefits = [
  {
    
    title: "Miễn phí vận chuyển",
    description: "Cho đơn hàng từ 500.000₫",
  },
  {
    
    title: "Thanh toán an toàn",
    description: "Bảo mật thông tin 100%",
  },
  {
    
    title: "Đọc eBook",
    description: "Mọi lúc, mọi nơi",
  },
  {
    
    title: "Ưu đãi hấp dẫn",
    description: "Giảm giá lên đến 50%",
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = [
    "/image/anh.png",
    "/image/anh_di_cung_anh_sao_troi.png",
    "/image/thai_tu_nhap_vai.png",
    "/image/nhiep_chinh_vuong_diet_hoa_dao.png",
    "/image/khoi_nguon_phuc_lac.png",
  ];

  // Carousel logic for featured books
  const featuredRef = useRef<HTMLDivElement>(null);
  const [canPrevFeatured, setCanPrevFeatured] = useState(false);
  const [canNextFeatured, setCanNextFeatured] = useState(true);

  // Carousel logic for popular books
  const popularRef = useRef<HTMLDivElement>(null);
  const [canPrevPopular, setCanPrevPopular] = useState(false);
  const [canNextPopular, setCanNextPopular] = useState(true);

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
    const step = 300;
    const delta = dir === "left" ? -step : step;
    featuredRef.current.scrollBy({ left: delta, behavior: "smooth" });
  };

  const scrollByStepPopular = (dir: "left" | "right") => {
    if (!popularRef.current) return;
    const step = 300;
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
    }, 3000); // Change slide every 3 seconds

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
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/60 to-purple-600/60"></div>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>
              </svg>
              Giảm giá đến 50% - Ưu đãi có hạn!
            </Badge>
            
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Khám phá thế giới tri thức
            </h1>
            <p className="text-xl mb-12 text-blue-100">
              Hơn 10,000+ đầu sách từ các tác giả nổi tiếng thế giới.
              Mua sách giấy hoặc thuê eBook - trải nghiệm đọc không giới hạn!
            </p>
            
            <div className="flex gap-4 justify-center">
              <Link href="/books">
                <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
                  </svg>
                  Khám phá ngay
                </Button>
              </Link>
              <Link href="/rental">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
                    <path d="M8 7h8"/>
                    <path d="M8 11h8"/>
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
            <Link href="/books">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} href={`/books?category=${cat.name}`}>
                <div className="relative h-48 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  {/* Background Image with Overlay - Full size and blurred */}
                  <div className="absolute inset-0">
                    <Image
                      src="/image/anh.png"
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover blur-sm group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Lighter Gradient Overlay - reduced opacity */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-30`}></div>
                    {/* Lighter dark overlay */}
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-md">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
                      </svg>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-white drop-shadow-lg">{cat.name}</h3>
                      <Badge variant="default" className="text-xs bg-white/95 text-gray-900 border-white/60 shadow-md">
                        {cat.count} sách
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Sách nổi bật</h2>
            <Link
              href="/books?filter=featured"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              <span>Xem tất cả</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </Button>

            {/* Dải sách */}
            <div
              ref={featuredRef}
              onScroll={updateArrowsFeatured}
              className="flex gap-4 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth
                        [-ms-overflow-style:none] [scrollbar-width:none] 
                        [&::-webkit-scrollbar]:hidden"
              style={{ overflowX: "auto" }}
            >
              {featuredBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex h-[320px] w-[180px] min-w-[180px] flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
                >
                  <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                    <Image
                      src={book.cover}
                      alt={book.title}
                      fill
                      sizes="180px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {book.originalPrice > 0 && (
                      <Badge variant="danger" className="absolute top-2 left-2 text-xs">
                        -{Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">{book.author}</p>
                  <div className="flex items-center gap-2 mt-auto">
                    <p className="text-blue-600 font-bold text-sm">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
                    </p>
                    {book.originalPrice > 0 && (
                      <p className="text-xs text-gray-400 line-through">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.originalPrice)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
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
              href="/books?filter=popular"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              <span>Xem tất cả</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </Button>

            {/* Dải sách */}
            <div
              ref={popularRef}
              onScroll={updateArrowsPopular}
              className="flex gap-4 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth
                        [-ms-overflow-style:none] [scrollbar-width:none] 
                        [&::-webkit-scrollbar]:hidden"
              style={{ overflowX: "auto" }}
            >
              {popularBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex h-[320px] w-[180px] min-w-[180px] flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
                >
                  <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                    <Image
                      src={book.cover}
                      alt={book.title}
                      fill
                      sizes="180px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {book.originalPrice > 0 && (
                      <Badge variant="danger" className="absolute top-2 left-2 text-xs">
                        -{Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}%
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">{book.author}</p>
                  <div className="flex items-center gap-2 mt-auto">
                    <p className="text-blue-600 font-bold text-sm">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
                    </p>
                    {book.originalPrice > 0 && (
                      <p className="text-xs text-gray-400 line-through">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.originalPrice)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                      <path d="M15 18H9"/>
                      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                      <circle cx="17" cy="18" r="2"/>
                      <circle cx="7" cy="18" r="2"/>
                    </svg>
                  </div>
                  
                  {/* Text */}
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-0.5">
                      Miễn phí vận chuyển
                    </h3>
                    <p className="text-sm md:text-base text-white/90 font-medium">
                      Cho đơn hàng từ <span className="font-bold text-yellow-200">500.000₫</span>
                    </p>
                  </div>
                </div>
                
                {/* Right side - Badge */}
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="bg-white text-emerald-600 font-bold text-sm px-4 py-2 shadow-lg border-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    Áp dụng toàn quốc
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="warning" className="mb-6 inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
              <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>
            </svg>
            Ưu đãi đặc biệt
          </Badge>
          
          <h2 className="text-5xl font-bold mb-4">Thuê eBook - Tiết kiệm hơn</h2>
          <p className="text-2xl mb-8 text-purple-100">
            Chỉ từ 10.000₫/tháng - Đọc không giới hạn trên mọi thiết bị
          </p>
          
          <div className="flex gap-4 justify-center items-center mb-8">
            <Badge variant="success" className="text-base px-4 py-2">✓ Không quảng cáo</Badge>
            <Badge variant="success" className="text-base px-4 py-2">✓ Tải offline</Badge>
            <Badge variant="success" className="text-base px-4 py-2">✓ Hủy bất kỳ lúc nào</Badge>
          </div>
          
          <Link href="/rental">
            <Button variant="primary" size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
                <path d="M8 7h8"/>
                <path d="M8 11h8"/>
              </svg>
              Dùng thử ngay - Miễn phí 7 ngày
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <Card key={idx} hover className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl">
                    {idx === 0 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                        <path d="M15 18H9"/>
                        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                        <circle cx="17" cy="18" r="2"/>
                        <circle cx="7" cy="18" r="2"/>
                      </svg>
                    )}
                    {idx === 1 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    )}
                    {idx === 2 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
                        <path d="M8 7h8"/>
                        <path d="M8 11h8"/>
                      </svg>
                    )}
                    {idx === 3 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                        <path d="m15 9-6 6"/>
                        <path d="M9 9h.01"/>
                        <path d="M15 15h.01"/>
                      </svg>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>  
    </div>
  );
}
