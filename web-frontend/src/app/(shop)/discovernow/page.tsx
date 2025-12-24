"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { bookService } from "@/services";
import type { BookDto } from "@/types/dtos";
import { resolveBookPrice } from "@/lib/price";
import { normalizeImageUrl } from '@/lib/imageUtils';

// --- COMPONENT: Khung xám thay thế khi không có ảnh ---
const NoImagePlaceholder = ({ dark = false }: { dark?: boolean }) => (
  <div className={`w-full h-full flex flex-col items-center justify-center ${dark ? 'bg-slate-800 text-slate-500' : 'bg-gray-100 text-gray-400'}`}>
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
    <span className="text-[10px] mt-1 font-medium">No Cover</span>
  </div>
);

interface HeroBook {
  id: string;
  title: string;
  desc: string;
  image: string | null;
}

interface TrendingBook {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string | null;
  hot: boolean;
}

interface NewArrival {
  id: string;
  title: string;
  author: string;
  price: number;
  rating: number;
  image: string | null;
}

export default function DiscoverNowPage() {
  // hero state
  const [activeHero, setActiveHero] = useState(0);
  const [heroBooks, setHeroBooks] = useState<HeroBook[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<TrendingBook[]>([]);
  const [newArrivals, setNewArrivals] = useState<NewArrival[]>([]);
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);

  useEffect(() => {
    const fetchHeroBooks = async () => {
      try {
        setLoadingHero(true);
        const response = await bookService.getBooks({
          pageNumber: 1,
          pageSize: 10,
        });
        
        if (response.items && response.items.length > 0) {
          const transformed: HeroBook[] = response.items.map((book: BookDto) => ({
            id: book.id,
            title: book.title,
            desc: `${book.authorNames?.[0] || "Tác giả không xác định"} - ${book.categoryNames?.[0] || "Sách hay"}`,
            image: normalizeImageUrl(book.coverImage),
          }));
          setHeroBooks(transformed);
        }
      } catch (error) {
        console.error("Error fetching hero books:", error);
      } finally {
        setLoadingHero(false);
      }
    };

    const fetchTrendingBooks = async () => {
      try {
        setLoadingTrending(true);
        const response = await bookService.getBooks({
          pageNumber: 1,
          pageSize: 8,
        });
        
        if (response.items && response.items.length > 0) {
          const transformed: TrendingBook[] = response.items.map((book: BookDto) => {
            const priceInfo = resolveBookPrice(book);
            return {
              id: book.id,
              title: book.title,
              author: book.authorNames?.[0] || "Tác giả không xác định",
              price: priceInfo.finalPrice,
              originalPrice: priceInfo.hasDiscount ? priceInfo.originalPrice : undefined,
              rating: book.averageRating || 0,
              image: normalizeImageUrl(book.coverImage),
              hot: priceInfo.hasDiscount,
            };
          });
          setTrendingBooks(transformed);
        }
      } catch (error) {
        console.error("Error fetching trending books:", error);
      } finally {
        setLoadingTrending(false);
      }
    };

    const fetchNewArrivals = async () => {
      try {
        setLoadingNewArrivals(true);
        const response = await bookService.getBooks({
          pageNumber: 1,
          pageSize: 6,
        });
        
        if (response.items && response.items.length > 0) {
          const transformed: NewArrival[] = response.items.map((book: BookDto) => {
            const priceInfo = resolveBookPrice(book);
            return {
              id: book.id,
              title: book.title,
              author: book.authorNames?.[0] || "Tác giả không xác định",
              price: priceInfo.finalPrice,
              rating: book.averageRating || 0,
              image: normalizeImageUrl(book.coverImage),
            };
          });
          setNewArrivals(transformed);
        }
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoadingNewArrivals(false);
      }
    };

    fetchHeroBooks();
    fetchTrendingBooks();
    fetchNewArrivals();
  }, []);

  const handleNextHero = () => {
    setActiveHero((prev) => (prev + 1) % heroBooks.length);
  };

  const handlePrevHero = () => {
    setActiveHero((prev) => (prev - 1 + heroBooks.length) % heroBooks.length);
  };

  // tự động chuyển sau 3s
  useEffect(() => {
    if (heroBooks.length === 0) return;
    
    const timer = setInterval(() => {
      setActiveHero((prev) => (prev + 1) % heroBooks.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [heroBooks.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-10 md:gap-6 items-center">
          {loadingHero ? (
            <>
              {/* left skeleton */}
              <div className="md:w-1/2 z-10 animate-pulse">
                <div className="h-6 w-32 bg-white/10 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-white/10 rounded mb-3"></div>
                <div className="h-12 bg-white/10 rounded mb-4"></div>
                <div className="h-20 bg-white/10 rounded mb-6"></div>
                <div className="flex gap-3">
                  <div className="h-10 w-32 bg-white/10 rounded-full"></div>
                  <div className="h-10 w-40 bg-white/10 rounded-full"></div>
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
                  BookStore đề xuất
                </div>

                <p className="text-sm text-white/70 mb-3">Sách điện tử / Ngoại văn</p>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                  {heroBooks[activeHero]?.title}
                </h1>

                <p className="text-sm md:text-base text-white/75 mb-6 line-clamp-4 md:line-clamp-5 max-w-xl">
                  {heroBooks[activeHero]?.desc}
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
                  
                  // Lấy URL ảnh an toàn
                  const imageUrl = normalizeImageUrl(book.image);

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
                        {/* FIX: Render ảnh có điều kiện */}
                        {imageUrl ? (
                            <Image 
                                src={imageUrl} 
                                alt={book.title} 
                                fill 
                                className="object-cover" 
                                unoptimized // Quan trọng
                            />
                        ) : (
                            <NoImagePlaceholder dark={true} />
                        )}
                        
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
            </>
          ) : null}
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
          {loadingTrending ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="aspect-[2/3] bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trendingBooks.map((book) => {
                const discountPercent =
                  book.originalPrice && book.originalPrice > book.price
                    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
                    : null;
                
                // Lấy URL ảnh an toàn
                const imageUrl = normalizeImageUrl(book.image);

                return (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
                >
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                    {/* FIX: Render ảnh có điều kiện */}
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={book.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized // Quan trọng
                      />
                    ) : (
                      <NoImagePlaceholder />
                    )}

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
          )}
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
          {loadingNewArrivals ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="aspect-[2/3] bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.map((book) => {
                // Lấy URL ảnh an toàn
                const imageUrl = normalizeImageUrl(book.image);

                return (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
                >
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                  {/* FIX: Render ảnh có điều kiện */}
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized // Quan trọng
                    />
                  ) : (
                    <NoImagePlaceholder />
                  )}
                  
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
              );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}