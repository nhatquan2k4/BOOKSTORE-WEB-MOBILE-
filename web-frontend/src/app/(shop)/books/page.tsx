"use client";

import { useState, useEffect, useRef } from "react"; 
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { bookService, categoryService } from "@/services";
import { BookDto, CategoryDto } from "@/types/dtos";
import { resolveBookPrice } from "@/lib/price";
import { normalizeImageUrl, getBookCoverUrl } from "@/lib/imageUtils";

// --- HELPER: Format Giá ---
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// --- COMPONENT: Khung xám thay thế (Placeholder) ---
const NoImagePlaceholder = () => (
  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

// --- COMPONENT: BOOK ITEM ---
const BookItem = ({ book, coverUrl }: { book: BookDto; coverUrl?: string | null }) => {
  const priceInfo = resolveBookPrice(book);
  
  // Debug log
  console.log('Book coverImage:', book.coverImage);
  // If a coverUrl prop is provided (fetched), prefer it; otherwise normalize DTO value
  const computedCover = coverUrl ?? normalizeImageUrl(book.coverImage);
  
  const authorName = book.authorNames?.[0] || "Tác giả ẩn danh";
  const isBestseller = (book.totalReviews || 0) > 50;
  const stockQuantity = book.stockQuantity ?? 0;

  return (
    <Link
      href={`/books/${book.id}`}
      className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg hover:-translate-y-1 group border border-transparent hover:border-blue-100"
    >
      {/* Book Cover */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3 shadow-inner bg-gray-100">
        
        {computedCover ? (
          <Image
            src={computedCover}
            alt={book.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <NoImagePlaceholder />
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {isBestseller && (
            <Badge className="text-[10px] bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-md px-2 py-0.5">
              HOT
            </Badge>
          )}
          {stockQuantity === 0 ? (
            <Badge variant="danger" className="text-[10px] font-bold px-2 py-0.5">HẾT HÀNG</Badge>
          ) : stockQuantity > 0 && stockQuantity < 10 ? (
            <Badge variant="warning" className="text-[10px] font-bold px-2 py-0.5">Còn {stockQuantity}</Badge>
          ) : null}
        </div>
      </div>

      {/* Book Info */}
      <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors min-h-[40px]" title={book.title}>
        {book.title}
      </h3>
      <p className="text-xs text-gray-600 mb-2">{authorName}</p>

      {/* Rating */}
      {book.averageRating && book.averageRating > 0 && book.totalReviews ? (
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-xs font-semibold text-gray-700">{book.averageRating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({book.totalReviews})</span>
        </div>
      ) : (
        <div className="text-xs text-gray-400 mb-2">Đang cập nhật</div>
      )}

      {/* Price */}
      <div className="flex items-center gap-2 flex-wrap mt-auto">
        <p className="text-red-600 font-bold text-sm">
          {formatPrice(priceInfo.finalPrice)}
        </p>
        {priceInfo.hasDiscount && (
          <>
            <p className="text-xs text-gray-400 line-through">
              {formatPrice(priceInfo.originalPrice)}
            </p>
            <span className="inline-flex items-center rounded-full bg-red-50 text-red-600 text-[10px] font-semibold px-1.5 py-0.5">
              -{Math.round(((priceInfo.originalPrice - priceInfo.finalPrice) / priceInfo.originalPrice) * 100)}%
            </span>
          </>
        )}
      </div>
    </Link>
  );
};

// --- MAIN PAGE ---
type SortOption = "popular" | "price-asc" | "price-desc" | "rating" | "name";
type PriceRange = "all" | "under-100k" | "100k-300k" | "300k-500k" | "over-500k";

export default function AllBooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [books, setBooks] = useState<BookDto[]>([]);
  // Map of bookId -> coverUrl (string|null)
  const [bookCovers, setBookCovers] = useState<Record<string, string | null>>({});
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [totalBooksInDb, setTotalBooksInDb] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, allBooksRes] = await Promise.all([
            categoryService.getCategories(1, 100),
            bookService.getBooks({ pageSize: 1 })
        ]);
        setCategories(catRes.items || []);
        setTotalBooksInDb(allBooksRes.totalCount || 0);
      } catch (err) {
        console.error("Init data error:", err);
      }
    };
    fetchData();
  }, []);

  // 2. Fetch Category Counts
  useEffect(() => {
    if (categories.length === 0) return;
    const fetchCounts = async () => {
        const counts: Record<string, number> = {};
        await Promise.all(
            categories.map(async (cat) => {
            try {
                const res = await bookService.getBooks({ categoryId: cat.id, pageSize: 1 });
                counts[cat.id] = res.totalCount || 0;
            } catch (e) { counts[cat.id] = 0; }
            })
        );
        setCategoryCounts(counts);
    };
    fetchCounts();
  }, [categories]);

  // 3. Fetch Books
  useEffect(() => {
  const fetchBooks = async () => {
      setLoading(true);
      try {
        const params: any = {
          pageNumber: 1,
          pageSize: 1000, 
          searchTerm: searchQuery || undefined,
        };
        if (selectedCategoryId !== "all") params.categoryId = selectedCategoryId;
        
        switch (sortBy) {
          case "price-asc": params.sortBy = "price"; break;
          case "price-desc": params.sortBy = "price_desc"; break;
          case "rating": params.sortBy = "rating"; break;
          case "name": params.sortBy = "title"; break;
          default: break;
        }

        const res = await bookService.getBooks(params);
        if (res.items) {
          setBooks(res.items);
          setTotalItems(res.totalCount || 0);
        } else {
          setBooks([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Error loading books:", error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => fetchBooks(), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategoryId, sortBy]);

  

  // Click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic
  const filteredBooks = books.filter((book) => {
    const { finalPrice: price } = resolveBookPrice(book);
    switch (priceRange) {
      case "under-100k": return price < 100000;
      case "100k-300k": return price >= 100000 && price < 300000;
      case "300k-500k": return price >= 300000 && price < 500000;
      case "over-500k": return price >= 500000;
      default: return true;
    }
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayBooks = filteredBooks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  // Fetch cover URLs for books currently displayed on the page
  useEffect(() => {
    const fetchCovers = async () => {
      const visibleBooks = displayBooks;
      const promises = visibleBooks.map(async (b) => {
        try {
          const url = await getBookCoverUrl(b.id);
          return { id: b.id, url };
        } catch (err) {
          console.error(`Failed to fetch cover for ${b.id}:`, err);
          return { id: b.id, url: null };
        }
      });

      const results = await Promise.all(promises);
      setBookCovers((prev) => {
        const next = { ...prev };
        results.forEach((r) => (next[r.id] = r.url));
        return next;
      });
    };

    // Only fetch when we have books to show
    if (displayBooks.length > 0) {
      fetchCovers();
    }
  }, [displayBooks]);

  useEffect(() => { setCurrentPage(1); }, [priceRange, selectedCategoryId, searchQuery, sortBy]);

  // --- HANDLERS (Đã thêm phần bị thiếu) ---
  const handleCategoryChange = (val: string) => {
    setSelectedCategoryId(val);
    setCurrentPage(1);
    setIsCategoryOpen(false);
  };

  const handlePriceRangeChange = (val: PriceRange) => {
    setPriceRange(val);
  };

  // <-- FIX LỖI REFERENCE ERROR TẠI ĐÂY -->
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedCategoryName = selectedCategoryId === "all" 
    ? `Tất cả (${totalBooksInDb})` 
    : categories.find(c => c.id === selectedCategoryId)?.name || "Chọn danh mục";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          {" / "}
          <span className="font-medium text-gray-800">Tất cả sách</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            Tất cả sách
          </h1>
          <p className="text-gray-600 text-lg">
            {loading ? "Đang tải..." : `Khám phá ${totalItems} đầu sách từ nhiều thể loại khác nhau`}
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Tìm kiếm sách, tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`w-full px-4 py-2 border rounded-lg bg-white text-left flex justify-between items-center ${isCategoryOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}`}
              >
                <span className="truncate text-gray-700">{selectedCategoryName}</span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isCategoryOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                  <div className="p-2 space-y-1">
                    <button onClick={() => { setSelectedCategoryId("all"); setIsCategoryOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm flex justify-between ${selectedCategoryId === "all" ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}>
                      <span>Tất cả</span><span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{totalBooksInDb}</span>
                    </button>
                    {categories.map((cat) => (
                      <button key={cat.id} onClick={() => { setSelectedCategoryId(cat.id); setIsCategoryOpen(false); }} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm flex justify-between ${selectedCategoryId === cat.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}>
                        <span>{cat.name}</span><span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{categoryCounts[cat.id] || '-'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mức giá</label>
              <div className="relative">
                <select value={priceRange} onChange={(e) => handlePriceRangeChange(e.target.value as PriceRange)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer">
                  <option value="all">Tất cả mức giá</option>
                  <option value="under-100k">Dưới 100k</option>
                  <option value="100k-300k">100k - 300k</option>
                  <option value="300k-500k">300k - 500k</option>
                  <option value="over-500k">Trên 500k</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></div>
              </div>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sắp xếp</label>
              <div className="relative">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer">
                  <option value="popular">Phổ biến nhất</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="name">Tên A-Z</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 text-sm text-gray-600">
          Hiển thị <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(endIndex, filteredBooks.length)}</span> trong tổng số <span className="font-semibold">{filteredBooks.length}</span> sách
        </div>

        {/* --- BOOK LIST --- */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-white rounded-xl shadow-sm animate-pulse p-3"><div className="w-full h-3/4 bg-gray-200 rounded-lg mb-3"></div><div className="h-4 bg-gray-200 w-3/4"></div></div>
            ))}
          </div>
        ) : displayBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {displayBooks.map((book) => (
              <BookItem key={book.id} book={book} coverUrl={bookCovers[book.id]} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sách</h3>
            <p className="text-gray-600 mb-4">Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác</p>
            <Button onClick={() => { setSearchQuery(""); setSelectedCategoryId("all"); setPriceRange("all"); setCurrentPage(1); }} variant="primary" size="md">Xóa bộ lọc</Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center mb-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </main>
  );
}