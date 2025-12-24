"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useParams } from "next/navigation";
import { authorService, bookService } from "@/services"; 
import { formatPrice, resolveBookPrice } from "@/lib/price";
import { normalizeImageUrl } from "@/lib/imageUtils";
import type { AuthorDto, BookDto } from "@/types/dtos";

// --- PLACEHOLDERS ---
const NoImagePlaceholder = () => (
  <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
    <span className="text-[10px] mt-1 font-medium">No Cover</span>
  </div>
);

const NoAvatarPlaceholder = () => (
  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400 border-4 border-white">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  </div>
);

const formatNumber = (num: number) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const calculateDiscount = (original: number, current: number) => {
  if (original <= 0 || current <= 0 || current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
};

export default function AuthorDetailPage() {
  const params = useParams();
  const authorId = params?.id as string;

  const [activeTab, setActiveTab] = useState<"books" | "about">("books");
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "price-asc" | "price-desc">("newest");
  const itemsPerPage = 8;

  // Data State
  const [author, setAuthor] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!authorId) return;

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // 1. Get Author Detail từ API
            const authorData: AuthorDto = await authorService.getAuthorById(authorId);
            
            // 2. Lấy danh sách sách và Lọc theo tác giả để đếm số lượng
            const booksRes = await bookService.getBooks({ pageNumber: 1, pageSize: 100 }); 
            const allBooks = booksRes.items || [];
            
            // Logic đếm số lượng sách (Filter client-side)
            const authorBooks = allBooks.filter((b: BookDto) => 
                b.authorIds?.includes(authorId) || b.authorNames?.includes(authorData.name)
            );

            // Cập nhật state tác giả với số lượng sách chính xác
            setAuthor({
                id: authorData.id,
                name: authorData.name,
                avatar: normalizeImageUrl(authorData.avartarUrl),
                coverImage: null, 
                bio: authorData.bio || "Chưa có thông tin giới thiệu về tác giả này.",
                birthYear: "---",
                nationality: "Việt Nam",
                website: "",
                bookCount: authorBooks.length, // <--- Đếm số lượng sách tại đây
                followers: 0,
                totalRating: 0,
                categories: ["Tác giả"],
                awards: [],
            });

            // Map dữ liệu sách để hiển thị
            const mappedBooks = authorBooks.map((b: BookDto) => {
                const priceInfo = resolveBookPrice(b);
                return {
                    id: b.id,
                    title: b.title,
                    cover: normalizeImageUrl(b.coverImage),
                    price: priceInfo.finalPrice,
                    originalPrice: priceInfo.originalPrice,
                    rating: b.averageRating || 0,
                    reviewCount: b.totalReviews || 0,
                    stock: b.stockQuantity || 0
                };
            });
            setBooks(mappedBooks);

        } catch (error) {
            console.error("Lỗi tải thông tin tác giả:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [authorId]);

  // --- Sorting Logic ---
  const sortedBooks = [...books].sort((a, b) => {
    switch (sortBy) {
      case "popular": return b.reviewCount - a.reviewCount;
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "newest": default: return 0;
    }
  });

  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = sortedBooks.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (!author) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Không tìm thấy tác giả</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image Placeholder */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Author Info */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-20 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative w-40 h-40 flex-shrink-0 mx-auto md:mx-0">
                {author.avatar ? (
                    <Image
                      src={author.avatar}
                      alt={author.name}
                      fill
                      className="object-cover rounded-full ring-4 ring-white"
                      unoptimized
                    />
                ) : (
                    <NoAvatarPlaceholder />
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{author.name}</h1>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                      {author.categories.map((cat: string) => (
                        <Badge key={cat} variant="default">{cat}</Badge>
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

                <div className="flex flex-wrap gap-6 justify-center md:justify-start text-sm mb-4">
                  <div><span className="font-bold text-lg">{author.bookCount}</span><span className="text-gray-600 ml-1">tác phẩm</span></div>
                  <div><span className="font-bold text-lg">{formatNumber(author.followers)}</span><span className="text-gray-600 ml-1">người theo dõi</span></div>
                  <div><span className="font-bold text-lg">{author.totalRating || 0}</span><span className="text-yellow-400 ml-1">★</span><span className="text-gray-600 ml-1">đánh giá</span></div>
                </div>

                <p className="text-gray-600 line-clamp-2">{author.bio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b flex gap-8 px-6">
            <button onClick={() => setActiveTab("books")} className={`relative py-4 text-sm font-medium transition-colors ${activeTab === "books" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}>
              Tác phẩm
              {activeTab === "books" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
            <button onClick={() => setActiveTab("about")} className={`relative py-4 text-sm font-medium transition-colors ${activeTab === "about" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}>
              Giới thiệu
              {activeTab === "about" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
          </div>

          <div className="p-6">
            {activeTab === "books" ? (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold">Tác phẩm ({books.length})</h2>
                  <div className="flex items-center gap-4">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="popular">Bán chạy</option>
                      <option value="price-asc">Giá tăng dần</option>
                      <option value="price-desc">Giá giảm dần</option>
                    </select>
                  </div>
                </div>

                {paginatedBooks.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">Tác giả chưa có sách nào trên hệ thống.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {paginatedBooks.map((book) => (
                        <Link key={book.id} href={`/books/${book.id}`} className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group">
                        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                            {book.cover ? (
                                <Image
                                src={book.cover}
                                alt={book.title}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                unoptimized
                                />
                            ) : (
                                <NoImagePlaceholder />
                            )}

                            {book.stock < 5 && (
                            <div className="absolute top-2 left-2">
                                <Badge className="text-xs bg-red-500 text-white font-bold">Sắp hết</Badge>
                            </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition-colors">{book.title}</h3>
                            <div className="flex items-center gap-1 pt-1">
                            <span className="text-xs font-bold text-gray-700">{book.rating}</span><span className="text-yellow-400">★</span>
                            <span className="text-xs text-gray-500">({book.reviewCount})</span>
                            </div>
                            
                            {/* GIÁ TIỀN MÀU ĐỎ */}
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <p className="text-red-600 font-bold text-sm">{formatPrice(book.price)}</p>
                            {book.originalPrice && book.originalPrice > book.price && (
                                <>
                                <p className="text-xs text-gray-400 line-through">{formatPrice(book.originalPrice)}</p>
                                <Badge variant="danger" className="text-xs font-bold">-{calculateDiscount(book.originalPrice, book.price)}%</Badge>
                                </>
                            )}
                            </div>
                        </div>
                        </Link>
                    ))}
                    </div>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    <Button variant="outline" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Trước</Button>
                    <span className="flex items-center px-4 font-medium">Trang {currentPage} / {totalPages}</span>
                    <Button variant="outline" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Sau</Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Biography */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Tiểu sử</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{author.bio}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">Năm sinh:</span><span className="ml-2 font-medium">{author.birthYear}</span></div>
                    <div><span className="text-gray-600">Quốc tịch:</span><span className="ml-2 font-medium">{author.nationality}</span></div>
                    {author.website && (
                      <div><span className="text-gray-600">Website:</span><a href={`https://${author.website}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">{author.website}</a></div>
                    )}
                  </div>
                </div>

                {/* Awards */}
                {author.awards.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Giải thưởng & Danh hiệu</h3>
                    <ul className="space-y-2">
                      {author.awards.map((award: string, index: number) => (
                        <li key={index} className="flex items-center gap-3 text-gray-700">
                          <span className="text-yellow-500">🏆</span>
                          {award}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}