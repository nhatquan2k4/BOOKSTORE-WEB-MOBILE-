"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// 10 sách cho hero
const heroBooks = [
  {
    id: 1,
    title: "[Sách ngoại văn] The Garden Party, and Other Stories",
    desc: `"The Garden Party, and Other Stories" là tuyển tập truyện ngắn nổi bật của Katherine Mansfield, khắc họa cảm xúc tinh tế và những khoảnh khắc đời thường.`,
    image: "/image/anh.png",
  },
  {
    id: 2,
    title: "This Side of Paradise",
    desc: "Tác phẩm kinh điển về tuổi trẻ và khát vọng trong xã hội Mỹ đầu thế kỉ 20.",
    image: "/image/anh.png",
  },
  {
    id: 3,
    title: "Anne of the Island",
    desc: "Hành trình trưởng thành dịu dàng và giàu cảm xúc của Anne Shirley.",
    image: "/image/anh.png",
  },
  {
    id: 4,
    title: "Pride and Prejudice",
    desc: "Câu chuyện tình yêu, giai cấp và định kiến xã hội Anh thế kỉ 19.",
    image: "/image/anh.png",
  },
  {
    id: 5,
    title: "The Great Gatsby",
    desc: "Bức tranh hào nhoáng nhưng trống rỗng của kỉ nguyên Jazz.",
    image: "/image/anh.png",
  },
  {
    id: 6,
    title: "Little Women",
    desc: "Tình cảm gia đình và hành trình trưởng thành của bốn chị em.",
    image: "/image/anh.png",
  },
  {
    id: 7,
    title: "Wuthering Heights",
    desc: "Mối tình dữ dội và ám ảnh trên đồng hoang nước Anh.",
    image: "/image/anh.png",
  },
  {
    id: 8,
    title: "Jane Eyre",
    desc: "Một trong những tiểu thuyết nữ quyền sớm và nổi bật.",
    image: "/image/anh.png",
  },
  {
    id: 9,
    title: "A Tale of Two Cities",
    desc: "Câu chuyện cảm động trong bối cảnh cách mạng Pháp.",
    image: "/image/anh.png",
  },
  {
    id: 10,
    title: "The Picture of Dorian Gray",
    desc: "Tác phẩm đầy chất triết lí về cái đẹp và sự suy đồi.",
    image: "/image/anh.png",
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
  // hero state
  const [activeHero, setActiveHero] = useState(0);

  const handleNextHero = () => {
    setActiveHero((prev) => (prev + 1) % heroBooks.length);
  };

  const handlePrevHero = () => {
    setActiveHero((prev) => (prev - 1 + heroBooks.length) % heroBooks.length);
  };

  // tự động chuyển sau 3s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHero((prev) => (prev + 1) % heroBooks.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-10 md:gap-6 items-center">
          {/* left */}
          <div className="md:w-1/2 z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              BookStore đề xuất
            </div>

            <p className="text-sm text-white/70 mb-3">Sách điện tử / Ngoại văn</p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              {heroBooks[activeHero].title}
            </h1>

            <p className="text-sm md:text-base text-white/75 mb-6 line-clamp-4 md:line-clamp-5 max-w-xl">
              {heroBooks[activeHero].desc}
            </p>

            <div className="flex gap-3 items-center">
              <Link
                href={`/discovernow/${heroBooks[activeHero]?.id || 1}`}
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5"
              >
                Khám phá ngay
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
          </div>

          {/* right */}
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
                    <Image src={book.image} alt={book.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/0 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-xs text-white/60 mb-1">Sách ngoại văn</p>
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">
                        {book.title}
                      </h3>
                      <p className="text-[10px] text-white/50 line-clamp-2">{book.desc}</p>
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute top-3 left-3 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-semibold text-slate-950">
                      Đang nổi bật
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
        </div>
      </section>

      {/* SÁCH THỊNH HÀNH */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Sách Thịnh Hành</h2>
            <Link
              href="/trending"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingBooks.map((book) => {
              const discountPercent =
                book.originalPrice && book.originalPrice > book.price
                  ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
                  : null;

              return (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
                >
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                    <Image
                      src={book.image}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {book.hot && (
                      <Badge className="absolute top-2 right-2 text-xs bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg animate-pulse">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="mr-1"
                        >
                          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                        </svg>
                        HOT
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
                  <p className="text-xs text-gray-600 mb-1">{book.author}</p>

                  {/* giá */}
                  <div className="flex items-center gap-2 mt-auto">
                    <p className="text-red-600 font-bold text-sm">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(book.price)}
                    </p>

                    {book.originalPrice && (
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-gray-400 line-through">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(book.originalPrice)}
                        </p>
                        {discountPercent && (
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            -{discountPercent}%
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SÁCH MỚI RA MẮT */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Sách Mới Ra Mắt</h2>
            <Link
              href="/new-releases"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                  <Image
                    src={book.image}
                    alt={book.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 right-2 text-xs bg-green-500 text-white font-semibold shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="mr-1"
                    >
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    MỚI
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
                <p className="text-xs text-gray-600 mb-1">{book.author}</p>
                <div className="mt-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-red-600 font-bold text-sm">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(book.price)}
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                    Mới ra mắt
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
