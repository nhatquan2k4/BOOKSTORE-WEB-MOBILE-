"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

const collections = [
  {
    id: 1,
    title: "Lập Trình",
    description: "Nâng cao kỹ năng coding",
    bookCount: 1234,
    cover: "/image/anh.png",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Kinh Doanh",
    description: "Bí quyết thành công",
    bookCount: 856,
    cover: "/image/anh.png",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "Thiết Kế",
    description: "Sáng tạo nghệ thuật",
    bookCount: 543,
    cover: "/image/anh.png",
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: 4,
    title: "Khoa Học",
    description: "Khám phá tri thức",
    bookCount: 789,
    cover: "/image/anh.png",
    gradient: "from-green-500 to-teal-500",
  },
  {
    id: 5,
    title: "Văn Học",
    description: "Đắm chìm trong văn chương",
    bookCount: 1045,
    cover: "/image/anh.png",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    id: 6,
    title: "Kỹ Năng Sống",
    description: "Phát triển bản thân",
    bookCount: 678,
    cover: "/image/anh.png",
    gradient: "from-pink-500 to-rose-500",
  },
];

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
            <div className="flex gap-4 justify-center">
              <Link href="/books">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Xem tất cả sách
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                </Button>
              </Link>
              <Link href="/books?sale=true">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Ưu đãi đặc biệt
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Bộ Sưu Tập Nổi Bật</h2>
            <p className="text-xl text-gray-600">Khám phá các chủ đề phong phú và đa dạng</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link 
                key={collection.id} 
                href={`/books?category=${collection.title}`}
                className="group"
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <div className="relative h-48">
                    <Image
                      src={collection.cover}
                      alt={collection.title}
                      fill
                      className="object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-80 group-hover:opacity-90 transition-opacity`}></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                      {/* <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                      </svg> */}
                      <h3 className="text-2xl font-bold mb-2">{collection.title}</h3>
                      <p className="text-white/90 text-center mb-2">{collection.description}</p>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {collection.bookCount.toLocaleString()} sách
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Sách Thịnh Hành</h2>
              <p className="text-gray-600">Những đầu sách được yêu thích nhất</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollByStepTrending("left")}
                disabled={!canScrollLeftTrending}
                className="disabled:opacity-30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollByStepTrending("right")}
                disabled={!canScrollRightTrending}
                className="disabled:opacity-30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Button>
            </div>
          </div>

          <div
            ref={trendingRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {trendingBooks.map((book) => (
              <Link key={book.id} href={`/books/${book.id}`} className="group flex-shrink-0 w-64">
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={book.image}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                    {book.hot && (
                      <Badge className="absolute top-3 right-3 bg-red-500 text-white border-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                        </svg>
                        HOT
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={i < Math.floor(book.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                      <span className="text-sm text-gray-600 ml-1">{book.rating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-red-600">
                          {book.price.toLocaleString()}đ
                        </span>
                        <span className="text-sm text-gray-400 line-through ml-2">
                          {book.originalPrice.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Sách Mới Ra Mắt</h2>
              <p className="text-gray-600">Cập nhật những đầu sách mới nhất</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollByStepNewArrivals("left")}
                disabled={!canScrollLeftNewArrivals}
                className="disabled:opacity-30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scrollByStepNewArrivals("right")}
                disabled={!canScrollRightNewArrivals}
                className="disabled:opacity-30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Button>
            </div>
          </div>

          <div
            ref={newArrivalsRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {newArrivals.map((book) => (
              <Link key={book.id} href={`/books/${book.id}`} className="group flex-shrink-0 w-64">
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={book.image}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-3 right-3 bg-green-500 text-white border-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      Mới
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={i < Math.floor(book.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                      <span className="text-sm text-gray-600 ml-1">{book.rating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">
                        {book.price.toLocaleString()}đ
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Đăng Ký Nhận Thông Tin</h2>
          <p className="text-xl mb-8 text-white/90">
            Nhận thông báo về sách mới và ưu đãi đặc biệt
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email của bạn"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Đăng ký
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
