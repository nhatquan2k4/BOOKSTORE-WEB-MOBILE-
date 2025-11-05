"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const trendingBooks = [
  {
    id: 1,
    title: "Clean Code",
    author: "Robert C. Martin",
    price: 350000,
    originalPrice: 450000,
    rating: 4.8,
    image: "/image/anh.png",
    hot: true,
  },
  {
    id: 2,
    title: "Design Patterns",
    author: "Gang of Four",
    price: 420000,
    originalPrice: 520000,
    rating: 4.9,
    image: "/image/anh.png",
    hot: true,
  },
  {
    id: 3,
    title: "The Pragmatic Programmer",
    author: "Andy Hunt",
    price: 380000,
    originalPrice: 480000,
    rating: 4.7,
    image: "/image/anh.png",
    hot: false,
  },
  {
    id: 4,
    title: "Refactoring",
    author: "Martin Fowler",
    price: 400000,
    originalPrice: 500000,
    rating: 4.8,
    image: "/image/anh.png",
    hot: true,
  },
  {
    id: 5,
    title: "Head First Design Patterns",
    author: "Eric Freeman",
    price: 360000,
    originalPrice: 460000,
    rating: 4.6,
    image: "/image/anh.png",
    hot: false,
  },
  {
    id: 6,
    title: "Code Complete",
    author: "Steve McConnell",
    price: 450000,
    originalPrice: 550000,
    rating: 4.9,
    image: "/image/anh.png",
    hot: true,
  },
  {
    id: 7,
    title: "The Clean Coder",
    author: "Robert C. Martin",
    price: 340000,
    originalPrice: 440000,
    rating: 4.7,
    image: "/image/anh.png",
    hot: false,
  },
  {
    id: 8,
    title: "Working Effectively with Legacy Code",
    author: "Michael Feathers",
    price: 390000,
    originalPrice: 490000,
    rating: 4.6,
    image: "/image/anh.png",
    hot: false,
  },
];

const newArrivals = [
  {
    id: 1,
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    price: 320000,
    rating: 4.5,
    image: "/image/anh.png",
  },
  {
    id: 2,
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    price: 350000,
    rating: 4.8,
    image: "/image/anh.png",
  },
  {
    id: 3,
    title: "Eloquent JavaScript",
    author: "Marijn Haverbeke",
    price: 310000,
    rating: 4.7,
    image: "/image/anh.png",
  },
  {
    id: 4,
    title: "Learning React",
    author: "Alex Banks",
    price: 380000,
    rating: 4.6,
    image: "/image/anh.png",
  },
  {
    id: 5,
    title: "Node.js Design Patterns",
    author: "Mario Casciaro",
    price: 400000,
    rating: 4.7,
    image: "/image/anh.png",
  },
  {
    id: 6,
    title: "TypeScript Deep Dive",
    author: "Basarat Ali Syed",
    price: 360000,
    rating: 4.8,
    image: "/image/anh.png",
  },
];

export default function DiscoverNowPage() {
  const trendingRef = useRef<HTMLDivElement>(null);
  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeftTrending, setCanScrollLeftTrending] = useState(false);
  const [canScrollRightTrending, setCanScrollRightTrending] = useState(true);
  const [canScrollLeftNewArrivals, setCanScrollLeftNewArrivals] = useState(false);
  const [canScrollRightNewArrivals, setCanScrollRightNewArrivals] = useState(true);

  const updateArrowsTrending = () => {
    const container = trendingRef.current;
    if (!container) return;
    setCanScrollLeftTrending(container.scrollLeft > 0);
    setCanScrollRightTrending(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  const updateArrowsNewArrivals = () => {
    const container = newArrivalsRef.current;
    if (!container) return;
    setCanScrollLeftNewArrivals(container.scrollLeft > 0);
    setCanScrollRightNewArrivals(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const trendingContainer = trendingRef.current;
    const newArrivalsContainer = newArrivalsRef.current;

    if (trendingContainer) {
      updateArrowsTrending();
      trendingContainer.addEventListener("scroll", updateArrowsTrending);
    }

    if (newArrivalsContainer) {
      updateArrowsNewArrivals();
      newArrivalsContainer.addEventListener("scroll", updateArrowsNewArrivals);
    }

    return () => {
      if (trendingContainer) {
        trendingContainer.removeEventListener("scroll", updateArrowsTrending);
      }
      if (newArrivalsContainer) {
        newArrivalsContainer.removeEventListener("scroll", updateArrowsNewArrivals);
      }
    };
  }, []);

  const scrollByStepTrending = (direction: "left" | "right") => {
    const container = trendingRef.current;
    if (!container) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollByStepNewArrivals = (direction: "left" | "right") => {
    const container = newArrivalsRef.current;
    if (!container) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
              Khám phá ngay
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Hành Trình Tri Thức Bắt Đầu Tại Đây
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Khám phá hàng nghìn đầu sách chất lượng cao từ các thể loại đa dạng. 
              Nâng cao kiến thức, phát triển kỹ năng và mở rộng tầm nhìn của bạn.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Sách Thịnh Hành</h2>
            <Link
              href="/books?filter=trending"
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
              onClick={() => scrollByStepTrending("left")}
              disabled={!canScrollLeftTrending}
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
              ref={trendingRef}
              onScroll={updateArrowsTrending}
              className="flex gap-4 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth
                        [-ms-overflow-style:none] [scrollbar-width:none] 
                        [&::-webkit-scrollbar]:hidden"
              style={{ overflowX: "auto" }}
            >
              {trendingBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex h-[320px] w-[180px] min-w-[180px] flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
                >
                  <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                    <Image
                      src={book.image}
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
                    {book.hot && (
                      <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                        </svg>
                        HOT
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
              onClick={() => scrollByStepTrending("right")}
              disabled={!canScrollRightTrending}
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
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Sách Mới Ra Mắt</h2>
            <Link
              href="/books?filter=new"
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
              onClick={() => scrollByStepNewArrivals("left")}
              disabled={!canScrollLeftNewArrivals}
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
              ref={newArrivalsRef}
              onScroll={updateArrowsNewArrivals}
              className="flex gap-4 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth
                        [-ms-overflow-style:none] [scrollbar-width:none] 
                        [&::-webkit-scrollbar]:hidden"
              style={{ overflowX: "auto" }}
            >
              {newArrivals.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex h-[320px] w-[180px] min-w-[180px] flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
                >
                  <div className="relative h-[220px] w-full overflow-hidden rounded-lg mb-3">
                    <Image
                      src={book.image}
                      alt={book.title}
                      fill
                      sizes="180px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 right-2 text-xs bg-green-500 text-white font-semibold shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
                      </svg>
                      MỚI
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">{book.author}</p>
                  <div className="flex items-center gap-2 mt-auto">
                    <p className="text-blue-600 font-bold text-sm">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Nút phải */}
            <Button
              type="button"
              onClick={() => scrollByStepNewArrivals("right")}
              disabled={!canScrollRightNewArrivals}
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
          </div>
        </div>
      </section>
    </div>
  );
}
