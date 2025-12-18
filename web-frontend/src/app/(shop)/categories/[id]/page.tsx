// app/books/[id]/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Badge, Alert } from "@/components/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { bookService, cartService, wishlistService } from "@/services";
import type { BookDetailDto, BookDto } from "@/types/dtos";
import { useAuth } from "@/contexts";
import { resolveBookPrice, formatPrice } from "@/lib/price";

// ============================================================================
// TYPES (Chỉ giữ lại Type, xóa Mock Data)
// ============================================================================
type CommentItem = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  replies?: CommentItem[];
};

type Review = {
  id: string;
  author: string;
  text: string;
  rating: number;
  likes: number;
  dislikes: number;
  userVote: "up" | "down" | null;
  createdAt: string;
};

type CarouselBook = {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice: number;
  cover: string;
  rating: number;
  reviews: number;
  hot?: boolean;
};

// ============================================================================
// UTILS
// ============================================================================
function timeAgo(iso: string) {
  const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });
  const diff = Date.now() - new Date(iso).getTime();
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ];
  for (const [unit, ms] of units) {
    const val = Math.floor(diff / ms);
    if (Math.abs(val) >= 1) return rtf.format(-val, unit);
  }
  return rtf.format(0, "second");
}

const calculateDiscountPercent = (original: number, price: number) => {
  if (original <= 0 || price <= 0 || price >= original) return 0;
  return Math.round(((original - price) / original) * 100);
};

// ============================================================================
// COMPONENT: CARD SÁCH (CAROUSEL)
// ============================================================================
function CarouselBookCard({ book }: { book: CarouselBook }) {
  const hasDiscount = book.originalPrice > 0 && book.originalPrice > book.price;

  return (
    <Link
      href={`/books/${book.id}`}
      className="flex w-[260px] min-w-[260px] flex-col rounded-2xl bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)]
                 border border-pink-50 overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(15,23,42,0.16)] group"
    >
      <div className="relative w-full aspect-[4/5]">
        <Image
          src={book.cover}
          alt={book.title}
          fill
          sizes="260px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {book.hot && (
          <div className="absolute top-2 right-2">
            <Badge className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white shadow">
              HOT
            </Badge>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px]" title={book.title}>
          {book.title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-1">{book.author}</p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <p className="text-red-600 font-bold text-sm">
            {formatPrice(book.price)}
          </p>
          {hasDiscount && (
            <>
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(book.originalPrice)}
              </p>
              <span className="inline-flex items-center rounded-full bg-red-50 text-red-600 text-[11px] font-semibold px-2 py-0.5 whitespace-nowrap">
                -{calculateDiscountPercent(book.originalPrice, book.price)}%
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================
export default function BookDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  // -------- API States (Khởi tạo là null hoặc mảng rỗng) --------
  const [book, setBook] = useState<BookDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carousel Data
  const [suggestedBooks, setSuggestedBooks] = useState<CarouselBook[]>([]);
  const [popularBooks, setPopularBooks] = useState<CarouselBook[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<CarouselBook[]>([]);

  // Review & Comment Data (API Only - Khởi tạo rỗng)
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);

  // -------- UI States --------
  const [activeTab, setActiveTab] = useState<"desc" | "review" | "comments">("desc");
  const [descExpanded, setDescExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [cartMessage, setCartMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Helper chuyển đổi DTO sang model Carousel
  const transformBookDto = (dto: BookDto): CarouselBook => {
    const priceInfo = resolveBookPrice(dto);
    return {
      id: dto.id,
      title: dto.title,
      author: dto.authorNames?.[0] || "Tác giả không xác định",
      price: priceInfo.finalPrice,
      originalPrice: priceInfo.originalPrice,
      cover: dto.coverImage || "/image/anh.png",
      rating: dto.averageRating || 0,
      reviews: dto.totalReviews || 0,
      hot: priceInfo.hasDiscount,
    };
  };

  // FETCH DATA TỪ API
  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch thông tin chi tiết sách
        const bookData = await bookService.getBookById(id);
        setBook(bookData);

        // 2. Fetch các danh sách gợi ý (Chạy song song)
        const [newestRes, mostViewedRes] = await Promise.all([
          bookService.getNewestBooks(8),
          bookService.getMostViewedBooks(8)
        ]);
        setSuggestedBooks(newestRes.map(transformBookDto));
        setPopularBooks(mostViewedRes.map(transformBookDto));

        // 3. Fetch sách liên quan (nếu có category)
        if (bookData.categories && bookData.categories.length > 0) {
          const relatedRes = await bookService.getBooksByCategory(bookData.categories[0].id, 12);
          setRelatedBooks(relatedRes.map(transformBookDto));
        }

        // 4. (TODO) Fetch Reviews & Comments từ API
        // Hiện tại chưa có endpoint nên để mảng rỗng.
        // Khi backend có, bạn thêm: const reviewsData = await reviewService.getReviews(id);
        // setReviews(reviewsData);

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải thông tin sách. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // Logic hiển thị Book (Single Source of Truth)
  const displayBook = book ? (() => {
    const priceInfo = resolveBookPrice(book);
    return {
      id: book.id,
      title: book.title,
      author: book.authors?.map(a => a.name).join(", ") || "Đang cập nhật",
      category: book.categories?.map(c => c.name).join(", ") || "Khác",
      publisher: book.publisher?.name || "NXB",
      price: priceInfo.finalPrice,
      originalPrice: priceInfo.originalPrice,
      rating: book.averageRating || 0,
      reviewCount: book.totalReviews || 0,
      stock: book.stockQuantity || 0,
      year: book.publicationYear || new Date().getFullYear(),
      weight: book.metadata?.find(m => m.key.toLowerCase() === "weight")?.value || "---",
      size: `${book.pageCount || 0} trang`,
      language: book.language || "Tiếng Việt",
      cover: book.images?.find(img => img.isCover)?.imageUrl || book.images?.[0]?.imageUrl || "/image/anh.png",
      description: book.description || "Chưa có mô tả chi tiết.",
    };
  })() : null;

  // Xử lý Wishlist
  const handleToggleWishlist = async () => {
    if (!isLoggedIn) {
       router.push('/auth/login');
       return;
    }
    try {
      setIsTogglingWishlist(true);
      const newStatus = await wishlistService.toggleWishlist(id);
      setIsLiked(newStatus);
      setCartMessage({ type: 'success', text: newStatus ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích' });
      setTimeout(() => setCartMessage(null), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  // Xử lý Giỏ hàng
  const handleAddToCart = async () => {
    if (!isLoggedIn) return router.push('/auth/login');
    try {
      setIsAddingToCart(true);
      await cartService.addToCart({ bookId: id, quantity: 1 });
      setCartMessage({ type: 'success', text: 'Đã thêm vào giỏ hàng!' });
      window.dispatchEvent(new Event('cartUpdated')); // Update Header Cart Count
      setTimeout(() => setCartMessage(null), 3000);
    } catch (e) {
      setCartMessage({ type: 'error', text: 'Lỗi thêm giỏ hàng' });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );

  if (error || !displayBook) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold text-red-600 mb-2">Đã có lỗi xảy ra</h2>
        <p className="text-gray-600">{error || "Không tìm thấy sách"}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    </div>
  );

  const hasMainDiscount = displayBook.originalPrice > 0 && displayBook.originalPrice > displayBook.price;
  const mainDiscountPercent = hasMainDiscount ? calculateDiscountPercent(displayBook.originalPrice, displayBook.price) : 0;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Breadcrumb items={[{ label: 'Sách', href: '/books' }, { label: displayBook.title }]} />
      
      <div className="container mx-auto px-4 py-8 text-gray-900">
        {cartMessage && (
           <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-right-5">
             <Alert variant={cartMessage.type === 'success' ? 'success' : 'danger'}>{cartMessage.text}</Alert>
           </div>
        )}

        {/* --- MAIN PRODUCT SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-sm mb-12">
            {/* Left: Images */}
            <div className="flex justify-center items-start">
               <div className="relative w-full max-w-[400px] aspect-[3/4] shadow-lg rounded-xl overflow-hidden">
                 <Image src={displayBook.cover} alt={displayBook.title} fill className="object-cover" priority />
               </div>
            </div>

            {/* Right: Info */}
            <div className="space-y-5">
               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{displayBook.title}</h1>
               
               <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-yellow-500 font-bold">
                    <span>{displayBook.rating.toFixed(1)}</span>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">{displayBook.reviewCount} đánh giá</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">Đã bán: 0</span>
               </div>

               <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 border-t border-b border-gray-100 py-4">
                  <p>Tác giả: <span className="text-blue-600 font-medium">{displayBook.author}</span></p>
                  <p>Nhà xuất bản: <span className="font-medium">{displayBook.publisher}</span></p>
                  <p>Năm xuất bản: <span className="font-medium">{displayBook.year}</span></p>
                  <p>Hình thức: <span className="font-medium">Bìa mềm</span></p>
               </div>

               <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-red-600">{formatPrice(displayBook.price)}</span>
                  {hasMainDiscount && (
                    <div className="flex flex-col mb-1">
                      <span className="text-sm text-gray-400 line-through">{formatPrice(displayBook.originalPrice)}</span>
                      <span className="text-xs font-bold text-red-500">Tiết kiệm {mainDiscountPercent}%</span>
                    </div>
                  )}
               </div>

               {/* Stock Status */}
               <div>
                  {displayBook.stock > 0 ? (
                    <Badge variant="success" className="bg-emerald-100 text-emerald-700">Còn hàng ({displayBook.stock})</Badge>
                  ) : (
                    <Badge variant="danger">Hết hàng</Badge>
                  )}
               </div>

               {/* Actions */}
               <div className="flex gap-4 pt-4">
                  <Button 
                    variant="danger" size="lg" className="flex-1 font-bold shadow-lg shadow-red-200"
                    disabled={displayBook.stock === 0}
                  >
                    MUA NGAY
                  </Button>
                  <Button 
                    variant="primary" size="lg" className="flex-1 font-bold shadow-lg shadow-blue-200"
                    onClick={handleAddToCart}
                    disabled={displayBook.stock === 0 || isAddingToCart}
                  >
                    {isAddingToCart ? 'Đang thêm...' : 'THÊM VÀO GIỎ'}
                  </Button>
                  <Button variant="outline" size="lg" className="px-3" onClick={handleToggleWishlist}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "red" : "none"} stroke={isLiked ? "red" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </Button>
               </div>
            </div>
        </div>

        {/* --- TABS (DESCRIPTION, REVIEW) --- */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-12 min-h-[300px]">
           <div className="flex border-b border-gray-200 mb-6">
              <button 
                onClick={() => setActiveTab('desc')}
                className={`pb-3 px-6 font-medium text-lg transition-colors border-b-2 ${activeTab === 'desc' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Mô tả sản phẩm
              </button>
              <button 
                onClick={() => setActiveTab('review')}
                className={`pb-3 px-6 font-medium text-lg transition-colors border-b-2 ${activeTab === 'review' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Đánh giá ({reviews.length})
              </button>
           </div>

           {activeTab === 'desc' && (
             <div className={`prose max-w-none text-gray-700 ${!descExpanded ? 'line-clamp-6' : ''}`}>
                <p className="whitespace-pre-line">{displayBook.description}</p>
                {/* Nếu description dài thì hiện nút xem thêm (Logic này bạn có thể thêm lại nếu muốn) */}
             </div>
           )}

           {activeTab === 'review' && (
             <div className="text-center py-10">
               {reviews.length === 0 ? (
                 <div className="text-gray-500">
                   <p>Chưa có đánh giá nào cho cuốn sách này.</p>
                   <p className="text-sm">Hãy là người đầu tiên đánh giá!</p>
                 </div>
               ) : (
                 // Render reviews list here when API is connected
                 <p>Danh sách đánh giá sẽ hiện ở đây</p>
               )}
             </div>
           )}
        </div>

        {/* --- CAROUSELS --- */}
        {/* Render Carousel Helper Component */}
        <BookCarouselSection title="Có thể bạn thích" books={suggestedBooks} />
        <BookCarouselSection title="Sách đọc nhiều" books={popularBooks} />
        <BookCarouselSection title="Cùng thể loại" books={relatedBooks} />
      </div>
    </main>
  );
}

// Sub-component để render Carousel cho gọn file
function BookCarouselSection({ title, books }: { title: string, books: CarouselBook[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  if (!books || books.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const step = 300;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="flex gap-2">
           <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">←</button>
           <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">→</button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 scroll-smooth no-scrollbar">
         {books.map(b => <CarouselBookCard key={b.id} book={b} />)}
      </div>
    </div>
  );
}