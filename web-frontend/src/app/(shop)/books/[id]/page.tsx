// // app/books/[id]/page.tsx
// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useState, useRef, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { Button, Badge, Alert } from "@/components/ui";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
// import { Breadcrumb } from "@/components/ui/Breadcrumb";
// // Đảm bảo bạn đã export reviewService và commentService trong file services của bạn
// import { bookService, cartService, wishlistService, reviewService, commentService } from "@/services";
// import type { BookDetailDto, BookDto } from "@/types/dtos";
// import { useAuth } from "@/contexts";
// import { resolveBookPrice, formatPrice } from "@/lib/price";
// import { normalizeImageUrl } from "@/lib/imageUtils";

// // ============================================================================
// // TYPES (Cập nhật để khớp với logic ghép API)
// // ============================================================================
// type Params = { id: string };

// type CommentItem = {
//   id: string;
//   author: string;
//   content: string;
//   createdAt: string; 
//   replies?: CommentItem[];
//   parentId?: string | null;
// };

// type Review = {
//   id: string;
//   author: string;
//   text: string;
//   rating: number;
//   likes: number; // API C# chưa có like review, tạm thời để 0 hoặc xử lý ở frontend
//   dislikes: number;
//   userVote: "up" | "down" | null;
//   createdAt: string;
// };

// type CarouselBook = {
//   id: string;
//   title: string;
//   author: string;
//   price: number;
//   originalPrice: number;
//   cover: string;
//   rating: number;
//   reviews: number;
//   hot?: boolean;
// };

// // ============================================================================
// // Các hàm tiện ích chung (GIỮ NGUYÊN)
// // ============================================================================
// function timeAgo(iso: string) {
//   const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });
//   const diff = Date.now() - new Date(iso).getTime();
//   const units: [Intl.RelativeTimeFormatUnit, number][] = [
//     ["year", 1000 * 60 * 60 * 24 * 365],
//     ["month", 1000 * 60 * 60 * 24 * 30],
//     ["day", 1000 * 60 * 60 * 24],
//     ["hour", 1000 * 60 * 60],
//     ["minute", 1000 * 60],
//     ["second", 1000],
//   ];
//   for (const [unit, ms] of units) {
//     const val = Math.floor(diff / ms);
//     if (Math.abs(val) >= 1) return rtf.format(-val, unit);
//   }
//   return rtf.format(0, "second");
// }

// const formatCurrency = (amount: number) =>
//   new Intl.NumberFormat("vi-VN", {
//     style: "currency",
//     currency: "VND",
//   }).format(amount);

// const calculateDiscountPercent = (original: number, price: number) => {
//   if (original <= 0 || price <= 0 || price >= original) return 0;
//   return Math.round(((original - price) / original) * 100);
// };

// // Component đệ quy để render comments và replies (GIỮ NGUYÊN UI)
// function CommentTree({
//   comment,
//   depth = 0,
//   replyOpen,
//   replyDrafts,
//   toggleReply,
//   updateReplyDraft,
//   addReply,
// }: {
//   comment: CommentItem;
//   depth?: number;
//   replyOpen: Record<string, boolean>;
//   replyDrafts: Record<string, string>;
//   toggleReply: (id: string) => void;
//   updateReplyDraft: (id: string, val: string) => void;
//   addReply: (parentId: string) => void;
// }) {
//   const maxDepth = 5;
//   const isMaxDepth = depth >= maxDepth;

//   return (
//     <div className={depth > 0 ? "mt-3 border-l-2 border-gray-300 pl-3" : ""}>
//       <div className="rounded-lg border border-gray-200 p-3">
//         <div className="mb-1 flex items-center justify-between text-sm">
//           <span className="font-medium">{comment.author}</span>
//           <span className="text-gray-500">{timeAgo(comment.createdAt)}</span>
//         </div>
//         <p className="whitespace-pre-line text-sm text-gray-800">
//           {comment.content}
//         </p>

//         {!isMaxDepth && (
//           <div className="mt-2">
//             <button
//               onClick={() => toggleReply(comment.id)}
//               className="text-sm font-medium text-blue-600 hover:underline"
//             >
//               {replyOpen[comment.id] ? "Đóng trả lời" : "Trả lời"}
//             </button>
//           </div>
//         )}

//         {replyOpen[comment.id] && (
//           <div className="mt-3 flex items-start gap-2">
//             <input
//               value={replyDrafts[comment.id] ?? ""}
//               onChange={(e) => updateReplyDraft(comment.id, e.target.value)}
//               placeholder="Viết phản hồi…"
//               className="h-[40px] flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none ring-blue-100 focus:ring-4"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" && !e.shiftKey) {
//                   e.preventDefault();
//                   addReply(comment.id);
//                 }
//               }}
//             />
//             <button
//               onClick={() => addReply(comment.id)}
//               className="h-[40px] shrink-0 rounded-lg bg-blue-600 px-3 text-white transition hover:bg-blue-700 active:scale-95"
//             >
//               Gửi
//             </button>
//           </div>
//         )}
//       </div>

//       {comment.replies && comment.replies.length > 0 && (
//         <div className="space-y-3">
//           {comment.replies
//             .sort(
//               (a, b) =>
//                 new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//             )
//             .map((reply) => (
//               <CommentTree
//                 key={reply.id}
//                 comment={reply}
//                 depth={depth + 1}
//                 replyOpen={replyOpen}
//                 replyDrafts={replyDrafts}
//                 toggleReply={toggleReply}
//                 updateReplyDraft={updateReplyDraft}
//                 addReply={addReply}
//               />
//             ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // Card dùng cho 3 carousel phía dưới (GIỮ NGUYÊN UI)
// function CarouselBookCard({ book }: { book: CarouselBook }) {
//   const hasDiscount =
//     book.originalPrice > 0 && book.originalPrice > book.price;

//   return (
//     <Link
//       href={`/books/${book.id}`}
//       className="flex w-[260px] min-w-[260px] flex-col rounded-2xl bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)]
//                   border border-pink-50 overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(15,23,42,0.16)] group"
//     >
//       <div className="relative w-full aspect-[4/5]">
//         {book.cover ? (
//           <Image
//             src={book.cover}
//             alt={book.title}
//             fill
//             sizes="260px"
//             className="object-cover group-hover:scale-105 transition-transform duration-300"
//             unoptimized
//           />
//         ) : (
//           <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//           </div>
//         )}

//         {book.hot && (
//           <div className="absolute top-2 left-2 flex items-center gap-1">
//             <Badge className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-600 text-white shadow">
//               Advanced
//             </Badge>
//           </div>
//         )}

//         <div className="absolute top-2 right-2">
//           <Badge className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow">
//             MỚI 2024
//           </Badge>
//         </div>
//       </div>

//       <div className="p-3 flex flex-col gap-1 flex-1">
//         <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
//         <p className="text-xs text-gray-600">{book.author}</p>

//         {book.rating > 0 && book.reviews > 0 ? (
//           <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-600">
//             <span className="text-yellow-400">★</span>
//             <span className="font-semibold">{book.rating.toFixed(1)}</span>
//             <span className="text-gray-400">
//               ({book.reviews.toLocaleString()})
//             </span>
//           </div>
//         ) : (
//           <div className="mt-2 text-[11px] text-gray-400">Đang cập nhật</div>
//         )}

//         <div className="mt-2 flex items-center gap-2 flex-wrap">
//           <p className="text-red-600 font-bold text-sm">
//             {formatCurrency(book.price)}
//           </p>
//           {hasDiscount && (
//             <>
//               <p className="text-xs text-gray-400 line-through">
//                 {formatCurrency(book.originalPrice)}
//               </p>
//               <span className="inline-flex items-center rounded-full bg-red-50 text-red-600 text-[11px] font-semibold px-2 py-0.5 whitespace-nowrap">
//                 -{calculateDiscountPercent(book.originalPrice, book.price)}%
//               </span>
//             </>
//           )}
//         </div>
//       </div>
//     </Link>
//   );
// }

// // ============================================================================

// export default function BookDetailPage() {
//   const params = useParams();
//   const id = params?.id as string;
//   const router = useRouter();
   
//   // -------- API States --------
//   const [book, setBook] = useState<BookDetailDto | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // Carousel Data
//   const [suggestedBooks, setSuggestedBooks] = useState<CarouselBook[]>([]);
//   const [popularBooks, setPopularBooks] = useState<CarouselBook[]>([]);
//   const [relatedBooks, setRelatedBooks] = useState<CarouselBook[]>([]);

//   // Review & Comment Data (Thay thế Mock Data)
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [comments, setComments] = useState<CommentItem[]>([]);
//   const [reviewStats, setReviewStats] = useState<any>(null); // Để lưu stats từ API

//   // -------- UI States --------
//   const [activeTab, setActiveTab] = useState<"desc" | "review" | "comments">("desc");
//   const [descExpanded, setDescExpanded] = useState(false);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isSaved, setIsSaved] = useState(false);
//   const [isAddingToCart, setIsAddingToCart] = useState(false);
//   const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
//   const [cartMessage, setCartMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

//   const { isLoggedIn, user } = useAuth(); // Lấy user từ context để post review/comment

//   // Refs và states cho Carousel
//   const likeRef = useRef<HTMLDivElement>(null);
//   const [canPrevLike, setCanPrevLike] = useState(false);
//   const [canNextLike, setCanNextLike] = useState(true);

//   const popularRef = useRef<HTMLDivElement>(null);
//   const [canPrevPopular, setCanPrevPopular] = useState(false);
//   const [canNextPopular, setCanNextPopular] = useState(true);

//   const authorRef = useRef<HTMLDivElement>(null);
//   const [canPrevAuthor, setCanPrevAuthor] = useState(false);
//   const [canNextAuthor, setCanNextAuthor] = useState(true);

//   function updateArrowsLike() {
//     const el = likeRef.current;
//     if (!el) return;
//     const { scrollLeft, scrollWidth, clientWidth } = el;
//     setCanPrevLike(scrollLeft > 0);
//     setCanNextLike(scrollLeft + clientWidth < scrollWidth - 1);
//   }

//   function updateArrowsPopular() {
//     const el = popularRef.current;
//     if (!el) return;
//     const { scrollLeft, scrollWidth, clientWidth } = el;
//     setCanPrevPopular(scrollLeft > 0);
//     setCanNextPopular(scrollLeft + clientWidth < scrollWidth - 1);
//   }

//   function updateArrowsAuthor() {
//     const el = authorRef.current;
//     if (!el) return;
//     const { scrollLeft, scrollWidth, clientWidth } = el;
//     setCanPrevAuthor(scrollLeft > 0);
//     setCanNextAuthor(scrollLeft + clientWidth < scrollWidth - 1);
//   }

//   useEffect(() => {
//     // Chỉ observe nếu có ref (khi có sách)
//     const roLike = new ResizeObserver(updateArrowsLike);
//     if (likeRef.current) roLike.observe(likeRef.current);

//     const roPopular = new ResizeObserver(updateArrowsPopular);
//     if (popularRef.current) roPopular.observe(popularRef.current);

//     const roAuthor = new ResizeObserver(updateArrowsAuthor);
//     if (authorRef.current) roAuthor.observe(authorRef.current);

//     // Call update initial
//     updateArrowsLike();
//     updateArrowsPopular();
//     updateArrowsAuthor();

//     return () => {
//       roLike.disconnect();
//       roPopular.disconnect();
//       roAuthor.disconnect();
//     };
//   }, [suggestedBooks, popularBooks, relatedBooks]); // Chạy lại khi data thay đổi

//   function scrollByStepLike(dir: "left" | "right") {
//     const el = likeRef.current;
//     if (!el) return;
//     const step = Math.round(el.clientWidth * 0.9);
//     el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
//   }

//   function scrollByStepPopular(dir: "left" | "right") {
//     const el = popularRef.current;
//     if (!el) return;
//     const step = Math.round(el.clientWidth * 0.9);
//     el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
//   }

//   function scrollByStepAuthor(dir: "left" | "right") {
//     const el = authorRef.current;
//     if (!el) return;
//     const step = Math.round(el.clientWidth * 0.9);
//     el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
//   }

//   const transformBookDto = (dto: BookDto): CarouselBook => {
//     const priceInfo = resolveBookPrice(dto);
//     return {
//       id: dto.id,
//       title: dto.title,
//       author: dto.authorNames?.[0] || "Tác giả không xác định",
//       price: priceInfo.finalPrice,
//       originalPrice: priceInfo.originalPrice,
//       cover: normalizeImageUrl(dto.coverImage) || "/image/anh.png",
//       rating: dto.averageRating || 0,
//       reviews: dto.totalReviews || 0,
//       hot: priceInfo.hasDiscount,
//     };
//   };

//   // =====================================================================
//   // Fetch data from API
//   // =====================================================================
//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         setLoading(true);
//         // 1. Fetch Book Detail
//         const bookData = await bookService.getBookById(id);
//         setBook(bookData);
//         setIsLiked(false);
        
//         // 2. Fetch Suggested Books (Newest)
//         const newest = await bookService.getNewestBooks(8);
//         setSuggestedBooks(newest.map(transformBookDto));
        
//         // 3. Fetch Popular Books (Most Viewed)
//         const mostViewed = await bookService.getMostViewedBooks(8);
//         setPopularBooks(mostViewed.map(transformBookDto));
        
//         // 4. Fetch Related Books (Same Author) - Logic từ câu trả lời trước
//         if (bookData.authors && bookData.authors.length > 0) {
//            const authorId = bookData.authors[0].id;
//            const byAuthor = await bookService.getBooksByAuthor(authorId, 12);
//            const filtered = byAuthor.filter(b => b.id !== id);
//            setRelatedBooks(filtered.map(transformBookDto));
//         } else if (bookData.categories && bookData.categories.length > 0) {
//            const byCat = await bookService.getBooksByCategory(bookData.categories[0].id, 12);
//            const filtered = byCat.filter(b => b.id !== id);
//            setRelatedBooks(filtered.map(transformBookDto));
//         }

//         // 5. Fetch Reviews & Stats
//         fetchReviewsData();

//         // 6. Fetch Comments
//         fetchCommentsData();

//       } catch (error) {
//         console.error("Error fetching book detail:", error);
//         setError("Không tìm thấy thông tin sách. Vui lòng thử lại sau.");
//       } finally {
//         setLoading(false);
//       }
//     };
     
//     if (id) fetchAllData();
//   }, [id]);

//   // --- API Functions for Reviews & Comments ---

//   const fetchReviewsData = async () => {
//       try {
//           // Giả sử API: reviewService.getBookReviews(id, page, size) trả về { reviews, totalCount }
//           const res = await reviewService.getBookReviews(id, 1, 20); 
//           const reviewList = (res as any).reviews || res.items || [];
//           const mappedReviews: Review[] = reviewList.map((r: any) => ({
//               id: r.id,
//               author: r.userName || "Người dùng", // Mapping từ C# ReviewDto
//               text: r.content,
//               rating: r.rating,
//               likes: 0, // C# chưa có cột Like review, để default
//               dislikes: 0,
//               userVote: null,
//               createdAt: r.createdAt
//           }));
//           setReviews(mappedReviews);

//           // Get Stats (nếu cần hiển thị rating chính xác hơn từ ReviewService)
//           const stats = await reviewService.getBookReviewStatistics(id);
//           setReviewStats(stats);
//       } catch (e) { console.error("Error loading reviews", e); }
//   }

//   const fetchCommentsData = async () => {
//       try {
//           // Giả sử API: commentService.getBookComments(id, page, size) trả về { comments, totalCount }
//           const res = await commentService.getBookComments(id, 1, 20);
          
//           // Map từ C# CommentDto sang CommentItem
//           // Lưu ý: C# Service GetBookCommentsAsync trả về comment phẳng (flat), cần xử lý UI
//           // Ở đây giả định UI CommentTree hỗ trợ nesting nếu bạn build cây từ flat list
//           // Hoặc API trả về cây. Tạm thời map trực tiếp.
//           const commentList = (res as any).comments || res.items || [];
//           const mappedComments: CommentItem[] = commentList.map((c: any) => ({
//               id: c.id,
//               author: c.userName || "Người dùng",
//               content: c.content,
//               createdAt: c.createdAt,
//               replies: [] // Sẽ load replies sau hoặc map nếu API trả về
//           }));
//           setComments(mappedComments);
//       } catch (e) { console.error("Error loading comments", e); }
//   }

//   // ... (Code getMetadataValue, displayBook giữ nguyên)
//   const getMetadataValue = (key: string, defaultValue: any = null) => {
//     const metadataItem = book?.metadata?.find(m => m.key.toLowerCase() === key.toLowerCase());
//     return metadataItem?.value || defaultValue;
//   };

//   const displayBook = book ? (() => {
//     const priceInfo = resolveBookPrice(book);
//     // Ưu tiên dùng số liệu từ ReviewService nếu đã load xong
//     const finalReviewCount = reviewStats ? reviewStats.totalReviews : (book.totalReviews || 0);
//     const finalRating = reviewStats ? reviewStats.averageRating : (book.averageRating || 0);

//     return {
//       id: book.id,
//       title: book.title,
//       author: book.authors && book.authors.length > 0 ? book.authors.map(a => a.name).join(", ") : "Tác giả không xác định",
//       category: book.categories && book.categories.length > 0 ? book.categories.map(c => c.name).join(", ") : "Chưa phân loại",
//       publisher: book.publisher?.name || "NXB",
//       price: priceInfo.finalPrice,
//       originalPrice: priceInfo.originalPrice,
//       rating: finalRating,
//       reviewCount: finalReviewCount, 
//       stock: book.stockQuantity || 0,
//       year: book.publicationYear || new Date().getFullYear(),
//       weight: parseInt(getMetadataValue("weight", "500")),
//       size: `${book.pageCount || 0} trang`,
//       language: book.language || "Tiếng Việt",
//       cover: normalizeImageUrl(
//         (book.images && book.images.length > 0 ? book.images.find(img => img.isCover)?.imageUrl : null) || 
//         (book.images && book.images.length > 0 ? book.images[0].imageUrl : null)
//       ) || "/image/anh.png",
//       description: book.description || "Chưa có mô tả",
//       isbn: book.isbn || "",
//       edition: book.edition || "",
//     };
//   })() : null;

//   // Sử dụng biến này cho UI
//   const totalReviews = displayBook?.reviewCount || 0;

//   // Logic Review (Ghép API Create)
//   const [newReview, setNewReview] = useState("");
//   const [newReviewRating, setNewReviewRating] = useState(5);

//   async function addNewReview() {
//     const text = newReview.trim();
//     if (!text) return;
    
//     if (!isLoggedIn) {
//         setCartMessage({ type: 'error', text: 'Vui lòng đăng nhập để đánh giá' });
//         return;
//     }

//     try {
//         // Gọi API: reviewService.createReview
//         await reviewService.createReview(id, {
//             rating: newReviewRating,
//             title: "Đánh giá sách", // C# CreateReviewDto yêu cầu Title
//             content: text
//         });
        
//         // Reload lại danh sách review sau khi post thành công
//         await fetchReviewsData(); 
        
//         setNewReview("");
//         setNewReviewRating(5);
//         setCartMessage({ type: 'success', text: 'Gửi đánh giá thành công!' });
//         setTimeout(() => setCartMessage(null), 3000);
//     } catch (err: any) {
//         // Xử lý lỗi từ backend (ví dụ: chưa mua sách)
//         const msg = err.response?.data?.message || err.message || "Lỗi khi gửi đánh giá";
//         setCartMessage({ type: 'error', text: msg });
//         setTimeout(() => setCartMessage(null), 3000);
//     }
//   }

//   // Logic Comment (Ghép API Create)
//   const [visibleCommentCount, setVisibleCommentCount] = useState(3);
//   const [newComment, setNewComment] = useState("");
//   const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
//   const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});

//   function totalComments(list: CommentItem[]): number {
//     return list.reduce(
//       (sum, c) => sum + 1 + totalComments(c.replies ?? []),
//       0
//     );
//   }

//   async function addNewComment() {
//     if (!newComment.trim()) return;
//     if (!isLoggedIn) {
//         setCartMessage({ type: 'error', text: 'Vui lòng đăng nhập để bình luận' });
//         return;
//     }

//     try {
//         // Gọi API: commentService.createCommentOnBookAsync
//         await commentService.createComment({
//             bookId: id,
//             content: newComment.trim(),
//             parentCommentId: null // Comment gốc
//         });
//         await fetchCommentsData(); // Reload
//         setNewComment("");
//     } catch (err) {
//         console.error(err);
//         setCartMessage({ type: 'error', text: 'Lỗi gửi bình luận' });
//     }
//   }

//   function toggleReply(id: string) {
//     setReplyOpen((prev) => ({ ...prev, [id]: !prev[id] }));
//   }

//   function updateReplyDraft(id: string, val: string) {
//     setReplyDrafts((prev) => ({ ...prev, [id]: val }));
//   }

//   async function addReply(parentId: string) {
//     const text = (replyDrafts[parentId] ?? "").trim();
//     if (!text) return;
//     if (!isLoggedIn) {
//         setCartMessage({ type: 'error', text: 'Vui lòng đăng nhập để trả lời' });
//         return;
//     }

//     try {
//         // Gọi API: commentService.createCommentOnBookAsync (reply)
//         await commentService.createComment({
//             bookId: id,
//             content: text,
//             parentCommentId: parentId
//         });
        
//         // Cần reload lại comment hoặc load riêng reply của parent đó
//         // Ở đây reload toàn bộ cho đơn giản theo UI hiện tại
//         await fetchCommentsData();

//         setReplyDrafts((prev) => ({ ...prev, [parentId]: "" }));
//         setReplyOpen((prev) => ({ ...prev, [parentId]: false }));
//     } catch (err) {
//         console.error(err);
//         setCartMessage({ type: 'error', text: 'Lỗi gửi câu trả lời' });
//     }
//   }

//   const sortedComments = [...comments]; // API thường đã sort theo ngày, nếu chưa thì sort lại
//   const visibleComments = sortedComments.slice(0, visibleCommentCount);
//   const canLoadMore = visibleCommentCount < sortedComments.length;
//   const commentCountLabel = totalComments(comments);

//   const DESC_LIMIT = 300;
//   const isLongDesc = (displayBook?.description?.length || 0) > DESC_LIMIT;
//   const shortDesc = isLongDesc
//     ? (displayBook?.description || "").substring(0, DESC_LIMIT) + "..."
//     : (displayBook?.description || "");

//   // ... (Giữ nguyên Star components)
//   const Star = ({ filled = false }: { filled?: boolean }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
//       <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
//     </svg>
//   );

//   const StarHalf = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star-half">
//       <defs><clipPath id="half"><rect x="0" y="0" width="12" height="24" /></clipPath></defs>
//       <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" clipPath="url(#half)" />
//       <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" fill="none" />
//     </svg>
//   );

//   function RatingStars({ rating }: { rating: number }) {
//     const rounded = Math.round(rating * 2) / 2;
//     const full = Math.floor(rounded);
//     const hasHalf = rounded - full === 0.5;
//     return (
//       <div className="flex items-center text-yellow-400">
//         {Array.from({ length: 5 }).map((_, i) => {
//           if (i < full) return <Star key={i} filled />;
//           if (i === full && hasHalf) return <StarHalf key={i} />;
//           return <Star key={i} filled={false} />;
//         })}
//       </div>
//     );
//   }

//   // ... (Giữ nguyên các hàm handleToggleWishlist, handleAddToCart, handleBuyNow, handleShareToFacebook)
//   async function handleToggleWishlist() {
//     try {
//       setIsTogglingWishlist(true);
//       const isNowInWishlist = await wishlistService.toggleWishlist(id);
//       setIsLiked(isNowInWishlist);
//       setCartMessage({ type: 'success', text: isNowInWishlist ? 'Đã thêm vào danh sách yêu thích!' : 'Đã xóa khỏi danh sách yêu thích!' });
//       setTimeout(() => { setCartMessage(null); }, 2000);
//     } catch (error) { console.error('Failed to toggle wishlist:', error); setCartMessage({ type: 'error', text: 'Không thể cập nhật danh sách yêu thích' }); } finally { setIsTogglingWishlist(false); }
//   }

//   async function handleAddToCart() {
//     if (!isLoggedIn) {
//       setCartMessage({ type: 'error', text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng' });
//       setTimeout(() => { router.push('/auth/login?redirect=/books/' + id); }, 1500);
//       return;
//     }
//     if (!book || !displayBook) return;
//     try {
//       setIsAddingToCart(true);
//       setCartMessage(null);
//       await cartService.addToCart({ bookId: id, quantity: 1, });
//       setCartMessage({ type: 'success', text: 'Đã thêm sách vào giỏ hàng!' });
//       setTimeout(() => { setCartMessage(null); }, 3000);
//       if (typeof window !== 'undefined') { window.dispatchEvent(new Event('cartUpdated')); }
//     } catch (error) { console.error('Failed to add to cart:', error); setCartMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không thể thêm sản phẩm vào giỏ hàng.' }); setTimeout(() => { setCartMessage(null); }, 3000); } finally { setIsAddingToCart(false); }
//   }

//   function handleBuyNow() {
//     if (!isLoggedIn) {
//       setCartMessage({ type: 'error', text: 'Vui lòng đăng nhập để mua hàng' });
//       setTimeout(() => { router.push('/auth/login?redirect=/books/' + id); }, 1500);
//       return;
//     }
//     if (!book || !displayBook) return;
    
//     // 1. Thêm vào giỏ hàng
//     handleAddToCart(); 
    
//     // 2. Chuyển hướng đến trang Giỏ hàng với tham số buy_now để Cart biết cần tick chọn sách nào
//     setTimeout(() => {
//       // SỬA DÒNG NÀY: Thay vì push '/checkout', hãy push về '/cart' kèm query param
//       router.push(`/cart?buy_now=${id}`);
//     }, 800); 
//   }

//   function handleShareToFacebook() {
//     if (!displayBook) return;
//     const url = typeof window !== "undefined" ? window.location.href : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/books/${id}`;
//     const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
//     if (typeof navigator !== "undefined" && (navigator as any).share) { (navigator as any).share({ title: "Chia sẻ sách", text: displayBook.title, url }).catch(() => window.open(fbShare, "_blank", "noopener,noreferrer")); } else { window.open(fbShare, "_blank", "noopener,noreferrer"); }
//   }

//   if (loading) {
//     return (
//       <main className="min-h-screen bg-gray-50">
//         <div className="container mx-auto px-6 py-10">
//           <div className="animate-pulse space-y-8">
//             <div className="h-8 w-64 rounded bg-gray-200"></div>
//             <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
//               <div className="h-96 rounded-xl bg-gray-200"></div>
//               <div className="space-y-4">
//                 <div className="h-8 w-3/4 rounded bg-gray-200"></div>
//                 <div className="h-6 w-1/2 rounded bg-gray-200"></div>
//                 <div className="h-6 w-2/3 rounded bg-gray-200"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   if (!book || !displayBook) {
//     return (
//       <main className="min-h-screen bg-gray-50">
//         <div className="container mx-auto px-6 py-10">
//           <div className="rounded-2xl bg-white p-8 text-center shadow-md">
//             <p className="text-lg text-gray-600">
//               {error || "Không tìm thấy thông tin sách"}
//             </p>
//             {error && (
//               <p className="mt-2 text-sm text-gray-500">
//                 Vui lòng kiểm tra console để xem chi tiết lỗi
//               </p>
//             )}
//           </div>
//         </div>
//       </main>
//     );
//   }

//   const hasMainDiscount = displayBook.originalPrice > 0 && displayBook.originalPrice > displayBook.price;
//   const mainDiscountPercent = hasMainDiscount ? calculateDiscountPercent(displayBook.originalPrice, displayBook.price) : 0;

//   return (
//     <main className="min-h-screen bg-gray-50">
//       <Breadcrumb items={[
//         { label: 'Sách', href: '/books' },
//         { label: displayBook.title }
//       ]} />
//       <div className="container mx-auto px-6 py-10 text-gray-900">

//         {cartMessage && (
//           <div className="mb-4">
//             <Alert variant={cartMessage.type === 'success' ? 'success' : 'danger'} onClose={() => setCartMessage(null)}>
//               {cartMessage.text}
//             </Alert>
//           </div>
//         )}

//         <div className="grid grid-cols-1 gap-8 rounded-2xl bg-white p-6 shadow-md lg:grid-cols-2">
//           <div className="flex justify-center">
//             {displayBook.cover ? (
//               <Image
//                 src={displayBook.cover}
//                 alt={displayBook.title}
//                 width={400}
//                 height={600}
//                 className="rounded-xl object-cover"
//                 unoptimized
//               />
//             ) : (
//               <div className="w-[400px] h-[600px] bg-gray-200 rounded-xl flex items-center justify-center">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//               </div>
//             )}
//           </div>

//           <div className="space-y-4">
//             <h1 className="text-3xl font-semibold">{displayBook.title}</h1>

//             <div className="flex items-center gap-2">
//               <RatingStars rating={displayBook.rating} />
//               <span className="text-sm text-slate-500">
//                 {displayBook.rating.toFixed(1)} / 5 •{" "}
//                 {/* HIỂN THỊ TOTAL REVIEW TỪ API */}
//                 {totalReviews.toLocaleString("vi-VN")} đánh giá
//               </span>
//             </div>

//             <p className="text-sm text-slate-500">Tác giả: {displayBook.author}</p>
//             <p className="text-sm text-slate-500">Nhà xuất bản: {displayBook.publisher}</p>
            
//             {/* Hiển thị số lượng tồn kho */}
//             {/* <div className="rounded-lg bg-slate-50 border border-slate-200 p-3"> */}
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium text-grey-600">Số lượng còn lại:</span>
//                 <span className={`text-lg font-bold ${
//                   displayBook.stock === 0 ? 'text-red-600' : 
//                   displayBook.stock < 10 ? 'text-amber-600' : 
//                   'text-green-600'
//                 }`}>
//                   {displayBook.stock === 0 ? 'Hết hàng' : `${displayBook.stock} cuốn`}
//                 </span>
//               </div>
//             {/* </div> */}

//             <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
//               <p className="text-2xl font-bold text-red-600">
//                 {formatCurrency(displayBook.price)}
//               </p>

//               {hasMainDiscount && (
//                 <>
//                   <p className="text-sm text-gray-400 line-through">
//                     {formatCurrency(displayBook.originalPrice)}
//                   </p>
//                   <span className="inline-flex items-center rounded-full bg-red-50 text-red-600 text-xs font-semibold px-2 py-0.5">
//                     -{mainDiscountPercent}%
//                   </span>
//                 </>
//               )}

//               {displayBook.stock === 0 ? (
//                 <Badge variant="danger" size="sm">
//                   HẾT HÀNG
//                 </Badge>
//               ) : displayBook.stock < 10 ? (
//                 <Badge variant="warning" size="sm">
//                   Còn {displayBook.stock} cuốn
//                 </Badge>
//               ) : (
//                 <Badge variant="success" size="sm">
//                   Còn hàng
//                 </Badge>
//               )}
//             </div>

//             {displayBook.stock > 0 && displayBook.stock < 10 && (
//               <Alert variant="warning">
//                 <div className="flex items-center gap-2">
//                   <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                   </svg>
//                   <span>Chỉ còn {displayBook.stock} cuốn! Đặt hàng ngay để không bỏ lỡ</span>
//                 </div>
//               </Alert>
//             )}

//             <div className="mt-4 flex flex-wrap items-center gap-3">
//               <Button variant="danger" className="shadow-sm" onClick={handleBuyNow} disabled={displayBook.stock === 0}>
//                 Mua ngay
//               </Button>

//               <Button variant="primary" className="shadow-sm" onClick={handleAddToCart} disabled={displayBook.stock === 0 || isAddingToCart}>
//                 {isAddingToCart ? (
//                   <>
//                     <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     <span>Đang thêm...</span>
//                   </>
//                 ) : (
//                   <>
//                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart">
//                       <circle cx="8" cy="21" r="1" />
//                       <circle cx="19" cy="21" r="1" />
//                       <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
//                     </svg>
//                     <span>Thêm vào giỏ hàng</span>
//                   </>
//                 )}
//               </Button>

//               <Link href={`/rent/${id}`}>
//                 <Button className="bg-amber-500 shadow-sm hover:bg-amber-600">
//                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open">
//                     <path d="M12 7v14" />
//                     <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
//                   </svg>
//                   <span>Thuê e-book</span>
//                 </Button>
//               </Link>

//               <Button onClick={handleToggleWishlist} variant="ghost" size="sm" disabled={isTogglingWishlist} aria-label={isLiked ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"} title={isLiked ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}>
//                 {isTogglingWishlist ? (
//                   <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                 ) : (
//                   <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? "red" : "none"} stroke={isLiked ? "red" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart transition-all">
//                     <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
//                   </svg>
//                 )}
//               </Button>

//               <Button onClick={() => setIsSaved((prev) => !prev)} variant="ghost" size="sm" aria-label="Lưu sách" title="Lưu sách">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={isSaved ? "gold" : "none"} stroke={isSaved ? "gold" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark">
//                   <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
//                 </svg>
//               </Button>

//               <Button onClick={handleShareToFacebook} variant="ghost" size="sm" aria-label="Chia sẻ Facebook" title="Chia sẻ Facebook">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2">
//                   <circle cx="18" cy="5" r="3" />
//                   <circle cx="6" cy="12" r="3" />
//                   <circle cx="18" cy="19" r="3" />
//                   <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
//                   <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
//                 </svg>
//               </Button>
//             </div>

//             {displayBook.price >= 500000 && (
//               <Alert variant="success">
//                 <div className="flex items-center gap-2">
//                   <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                   <span>Miễn phí vận chuyển cho đơn hàng này</span>
//                 </div>
//               </Alert>
//             )}

//             <Card className="mt-6">
//               <CardHeader>
//                 <CardTitle>Thông tin chi tiết sách</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ul className="space-y-3 text-sm">
//                   <li className="flex justify-between">
//                     <strong className="text-gray-600">Mã sách:</strong>
//                     <span>{displayBook.id}</span>
//                   </li>
//                   <li className="flex justify-between">
//                     <strong className="text-gray-600">Tác giả:</strong>
//                     <span>{displayBook.author}</span>
//                   </li>
//                   <li className="flex justify-between">
//                     <strong className="text-gray-600">Thể loại:</strong>
//                     <Badge variant="info" size="sm">
//                       {displayBook.category}
//                     </Badge>
//                   </li>
//                   <li className="flex justify-between">
//                     <strong className="text-gray-600">Nhà cung cấp:</strong>
//                     <span>BookStore</span>
//                   </li>
//                   <li className="flex justify-between">
//                     <strong className="text-gray-600">Ngôn ngữ:</strong>
//                     <span>{displayBook.language}</span>
//                   </li>
//                   <li className="flex justify-between">
//                     <strong className="text-gray-600">Nhà xuất bản:</strong>
//                     <span>{displayBook.publisher}</span>
//                   </li>
//                   <li className="flex justify-between">
//                     <strong className="text-gray-600">Năm xuất bản:</strong>
//                     <span>{displayBook.year}</span>
//                   </li>
//                   <li className="flex justify-between">
//                     <strong className="text-gray-600">Tình trạng:</strong>
//                     {displayBook.stock === 0 ? (
//                       <Badge variant="danger" size="sm">Hết hàng</Badge>
//                     ) : displayBook.stock < 10 ? (
//                       <Badge variant="warning" size="sm">Còn {displayBook.stock} cuốn</Badge>
//                     ) : (
//                       <Badge variant="success" size="sm">Còn hàng</Badge>
//                     )}
//                   </li>
//                   <li className="flex justify-between">
//                     <strong className="text-gray-600">Trọng lượng:</strong>
//                     <span>{displayBook.weight}g</span>
//                   </li>
//                   <li className="flex justify-between">
//                     <strong className="text-gray-600">Kích thước:</strong>
//                     <span>{displayBook.size}</span>
//                   </li>
//                 </ul>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         <div className="mt-10">
//           <div className="mb-4 flex border-b border-gray-200">
//             <Button
//               onClick={() => setActiveTab("desc")}
//               variant="ghost"
//               className={`border-b-2 rounded-none ${
//                 activeTab === "desc"
//                   ? "border-blue-600 text-blue-600"
//                   : "border-transparent text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               Mô tả sản phẩm
//             </Button>
//             <Button
//               onClick={() => setActiveTab("review")}
//               variant="ghost"
//               className={`border-b-2 rounded-none ${
//                 activeTab === "review"
//                   ? "border-blue-600 text-blue-600"
//                   : "border-transparent text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               {/* HIỂN THỊ TOTAL REVIEW TỪ API */}
//               Đánh giá & nhận xét ({totalReviews})
//             </Button>
//             <Button
//               onClick={() => setActiveTab("comments")}
//               variant="ghost"
//               className={`border-b-2 rounded-none ${
//                 activeTab === "comments"
//                   ? "border-blue-600 text-blue-600"
//                   : "border-transparent text-gray-600 hover:text-gray-800"
//               }`}
//             >
//               Bình luận ({commentCountLabel})
//             </Button>
//           </div>

//           {activeTab === "desc" && (
//             <div className="relative rounded-xl bg-white p-6 shadow-md">
//               <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
//                 {descExpanded ? displayBook.description : shortDesc}
//               </p>
//               {isLongDesc && (
//                 <Button
//                   onClick={() => setDescExpanded((v) => !v)}
//                   variant="ghost"
//                   size="sm"
//                   className="mt-3 h-auto p-0 text-blue-600 hover:underline"
//                   aria-expanded={descExpanded}
//                 >
//                   {descExpanded ? "Thu gọn" : "Xem thêm"}
//                 </Button>
//               )}
//             </div>
//           )}

//           {activeTab === "review" && (
//             <div className="space-y-6 rounded-xl bg-white p-6 shadow-md">
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
//                 <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6">
//                   <div className="text-5xl font-bold text-blue-600">
//                     {displayBook.rating.toFixed(1)}
//                   </div>
//                   <div className="mt-2 flex items-center gap-1">
//                     <RatingStars rating={displayBook.rating} />
//                   </div>
//                   <p className="mt-2 text-sm text-gray-600">
//                     {totalReviews} đánh giá
//                   </p>
//                 </div>

//                 <div className="col-span-2 space-y-2">
//                   {[5, 4, 3, 2, 1].map((star) => {
//                     // Nếu có reviewStats từ API thì dùng, không thì tính tạm từ list review hiện tại
//                     const count = reviews.filter(
//                       (r) => r.rating === star
//                     ).length;
//                     const percentage =
//                       reviews.length > 0 ? (count / reviews.length) * 100 : 0;
//                     return (
//                       <div key={star} className="flex items-center gap-3">
//                         <span className="flex w-12 items-center gap-1 text-sm font-medium">
//                           {star} <span className="text-yellow-400">★</span>
//                         </span>
//                         <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
//                           <div
//                             className="h-full bg-yellow-400 transition-all"
//                             style={{ width: `${percentage}%` }}
//                           />
//                         </div>
//                         <span className="w-12 text-right text-sm text-gray-600">
//                           {count}
//                         </span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               <div className="border-t pt-6">
//                 <h3 className="mb-4 text-lg font-semibold">
//                   Viết đánh giá của bạn
//                 </h3>

//                 <div className="mb-3 flex items-center gap-2">
//                   <span className="text-sm font-medium">
//                     Đánh giá của bạn:
//                   </span>
//                   <div className="flex gap-1">
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <button
//                         key={star}
//                         type="button"
//                         onClick={() => setNewReviewRating(star)}
//                         className="transition hover:scale-110"
//                       >
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="24"
//                           height="24"
//                           viewBox="0 0 24 24"
//                           fill={
//                             star <= newReviewRating ? "currentColor" : "none"
//                           }
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           className={
//                             star <= newReviewRating
//                               ? "text-yellow-400"
//                               : "text-gray-300"
//                           }
//                         >
//                           <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
//                         </svg>
//                       </button>
//                     ))}
//                     <span className="ml-2 text-sm text-gray-600">
//                       ({newReviewRating} sao)
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3">
//                   <textarea
//                     value={newReview}
//                     onChange={(e) => setNewReview(e.target.value)}
//                     placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách..."
//                     className="min-h-[84px] flex-1 rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none ring-blue-100 focus:ring-4"
//                   />
//                   <Button
//                     onClick={addNewReview}
//                     variant="primary"
//                     size="sm"
//                     className="shrink-0"
//                   >
//                     Gửi đánh giá
//                   </Button>
//                 </div>
//               </div>

//               <div className="space-y-4 border-t pt-6">
//                 <h3 className="text-lg font-semibold">Tất cả đánh giá</h3>
//                 {reviews.length === 0 ? (
//                     <p className="text-gray-500 italic">Chưa có đánh giá nào.</p>
//                 ) : (
//                     <div className="space-y-3">
//                     {reviews.map((rv) => (
//                         <div
//                         key={rv.id}
//                         className="rounded-lg border border-gray-200 p-4"
//                         >
//                         <div className="mb-2 flex items-start justify-between">
//                             <div className="flex-1">
//                             <div className="mb-1 flex items-center gap-2">
//                                 <p className="font-medium">{rv.author}</p>
//                                 <span className="text-gray-400">•</span>
//                                 <span className="text-sm text-gray-500">
//                                 {timeAgo(rv.createdAt)}
//                                 </span>
//                             </div>

//                             <div className="mb-2 flex items-center gap-2">
//                                 <div className="flex items-center gap-1">
//                                 {[1, 2, 3, 4, 5].map((star) => (
//                                     <svg
//                                     key={star}
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     width="16"
//                                     height="16"
//                                     viewBox="0 0 24 24"
//                                     fill={
//                                         star <= rv.rating
//                                         ? "currentColor"
//                                         : "none"
//                                     }
//                                     stroke="currentColor"
//                                     strokeWidth="2"
//                                     className={
//                                         star <= rv.rating
//                                         ? "text-yellow-400"
//                                         : "text-gray-300"
//                                     }
//                                     >
//                                     <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
//                                     </svg>
//                                 ))}
//                                 </div>
//                                 <Badge
//                                 variant={
//                                     rv.rating >= 4
//                                     ? "success"
//                                     : rv.rating >= 3
//                                     ? "warning"
//                                     : "danger"
//                                 }
//                                 size="sm"
//                                 >
//                                 {rv.rating} sao
//                                 </Badge>
//                             </div>

//                             <p className="text-sm text-gray-700">{rv.text}</p>
//                             </div>
//                         </div>
//                         </div>
//                     ))}
//                     </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {activeTab === "comments" && (
//             <div className="rounded-xl bg-white p-6 shadow-md">
//               <div className="mb-4 flex items-center justify-between">
//                 <h3 className="text-xl font-semibold">
//                   Bình luận ({commentCountLabel})
//                 </h3>
//               </div>

//               <div className="mb-6 flex items-start gap-3">
//                 <textarea
//                   value={newComment}
//                   onChange={(e) => setNewComment(e.target.value)}
//                   placeholder="Chia sẻ cảm nhận của bạn về cuốn sách..."
//                   className="min-h-[84px] flex-1 rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none ring-blue-100 focus:ring-4"
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" && e.ctrlKey) {
//                       e.preventDefault();
//                       addNewComment();
//                     }
//                   }}
//                 />
//                 <Button
//                   onClick={addNewComment}
//                   variant="primary"
//                   size="sm"
//                   className="shrink-0"
//                 >
//                   Gửi
//                 </Button>
//               </div>

//               {comments.length === 0 ? (
//                   <p className="text-gray-500 italic">Chưa có bình luận nào.</p>
//               ) : (
//                 <div className="space-y-4">
//                     {visibleComments.map((c) => (
//                     <CommentTree
//                         key={c.id}
//                         comment={c}
//                         depth={0}
//                         replyOpen={replyOpen}
//                         replyDrafts={replyDrafts}
//                         toggleReply={toggleReply}
//                         updateReplyDraft={updateReplyDraft}
//                         addReply={addReply}
//                     />
//                     ))}
//                 </div>
//               )}

//               {canLoadMore && (
//                 <div className="mt-4 flex justify-center">
//                   <Button
//                     onClick={() =>
//                       setVisibleCommentCount((n) =>
//                         Math.min(n + 3, sortedComments.length)
//                       )
//                     }
//                     variant="outline"
//                     size="sm"
//                   >
//                     Xem thêm bình luận
//                   </Button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* 1. Có thể bạn thích */}
//         <div className="mt-10">
//           <div className="mb-4 flex items-center justify-between px-1">
//             <h2 className="text-2xl font-semibold tracking-wide text-gray-800">
//               Có thể bạn thích
//             </h2>
//             {suggestedBooks.length > 0 && (
//                 <Link
//                 href="/books?filter=suggested"
//                 className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
//                 >
//                 <span>Xem tất cả</span>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//                 </Link>
//             )}
//           </div>

//           {/* Logic Empty State: Nếu không có sách, hiển thị thông báo */}
//           {suggestedBooks.length === 0 ? (
//               <div className="text-center py-8 text-gray-500 italic bg-white rounded-xl shadow-sm border border-gray-100">
//                   Không có sách gợi ý nào tại thời điểm này.
//               </div>
//           ) : (
//             <div className="relative">
//                 <Button
//                 type="button"
//                 onClick={() => scrollByStepLike("left")}
//                 disabled={!canPrevLike}
//                 variant="secondary"
//                 size="sm"
//                 className="absolute left-0 top-1/2 z-10 -translate-y-1/2 shadow"
//                 >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                     <path d="m15 18-6-6 6-6" />
//                 </svg>
//                 </Button>

//                 <div
//                 ref={likeRef}
//                 onScroll={updateArrowsLike}
//                 className="flex gap-5 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
//                 style={{ overflowX: "auto" }}
//                 >
//                 {suggestedBooks.map((b) => (
//                     <CarouselBookCard key={b.id} book={b} />
//                 ))}
//                 </div>

//                 <Button
//                 type="button"
//                 onClick={() => scrollByStepLike("right")}
//                 disabled={!canNextLike}
//                 variant="secondary"
//                 size="sm"
//                 className="absolute right-0 top-1/2 z-10 -translate-y-1/2 shadow"
//                 >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                     <path d="m9 18 6-6-6-6" />
//                 </svg>
//                 </Button>

//                 <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-gray-50 to-transparent" />
//                 <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 to-transparent" />
//             </div>
//           )}
//         </div>

//         {/* 2. Sách được đọc nhiều nhất */}
//         <div className="mt-10">
//           <div className="mb-4 flex items-center justify-between px-1">
//             <h2 className="text-2xl font-semibold tracking-wide text-gray-800">
//               Sách được đọc nhiều nhất
//             </h2>
//             {popularBooks.length > 0 && (
//                 <Link
//                 href="/books?filter=popular"
//                 className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
//                 >
//                 <span>Xem tất cả</span>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//                 </Link>
//             )}
//           </div>

//           {popularBooks.length === 0 ? (
//               <div className="text-center py-8 text-gray-500 italic bg-white rounded-xl shadow-sm border border-gray-100">
//                   Chưa có dữ liệu về sách đọc nhiều nhất.
//               </div>
//           ) : (
//             <div className="relative">
//                 <Button
//                 type="button"
//                 onClick={() => scrollByStepPopular("left")}
//                 disabled={!canPrevPopular}
//                 variant="secondary"
//                 size="sm"
//                 className="absolute left-0 top-1/2 z-10 -translate-y-1/2 shadow"
//                 >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                     <path d="m15 18-6-6 6-6" />
//                 </svg>
//                 </Button>

//                 <div
//                 ref={popularRef}
//                 onScroll={updateArrowsPopular}
//                 className="flex gap-5 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
//                 style={{ overflowX: "auto" }}
//                 >
//                 {popularBooks.map((b) => (
//                     <CarouselBookCard key={b.id} book={b} />
//                 ))}
//                 </div>

//                 <Button
//                 type="button"
//                 onClick={() => scrollByStepPopular("right")}
//                 disabled={!canNextPopular}
//                 variant="secondary"
//                 size="sm"
//                 className="absolute right-0 top-1/2 z-10 -translate-y-1/2 shadow"
//                 >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                     <path d="m9 18 6-6-6-6" />
//                 </svg>
//                 </Button>

//                 <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-gray-50 to-transparent" />
//                 <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 to-transparent" />
//             </div>
//           )}
//         </div>

//         {/* 3. Cùng tác giả */}
//         <div className="mt-10">
//           <div className="mb-4 flex items-center justify-between px-1">
//             <h2 className="text-2xl font-semibold tracking-wide text-gray-800">
//               Cùng tác giả
//             </h2>
//             {relatedBooks.length > 0 && (
//                 <Link
//                 href="/books?filter=related"
//                 className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
//                 >
//                 <span>Xem tất cả</span>
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//                 </Link>
//             )}
//           </div>

//           {relatedBooks.length === 0 ? (
//               <div className="text-center py-8 text-gray-500 italic bg-white rounded-xl shadow-sm border border-gray-100">
//                   Không tìm thấy sách khác cùng tác giả.
//               </div>
//           ) : (
//             <div className="relative">
//                 <Button
//                 type="button"
//                 onClick={() => scrollByStepAuthor("left")}
//                 disabled={!canPrevAuthor}
//                 variant="secondary"
//                 size="sm"
//                 className="absolute left-0 top-1/2 z-10 -translate-y-1/2 shadow"
//                 >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                     <path d="m15 18-6-6 6-6" />
//                 </svg>
//                 </Button>

//                 <div
//                 ref={authorRef}
//                 onScroll={updateArrowsAuthor}
//                 className="flex gap-5 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
//                 style={{ overflowX: "auto" }}
//                 >
//                 {relatedBooks.map((b) => (
//                     <CarouselBookCard key={b.id} book={b} />
//                 ))}
//                 </div>

//                 <Button
//                 type="button"
//                 onClick={() => scrollByStepAuthor("right")}
//                 disabled={!canNextAuthor}
//                 variant="secondary"
//                 size="sm"
//                 className="absolute right-0 top-1/2 z-10 -translate-y-1/2 shadow"
//                 >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                     <path d="m9 18 6-6-6-6" />
//                 </svg>
//                 </Button>

//                 <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-gray-50 to-transparent" />
//                 <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 to-transparent" />
//             </div>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }

// app/books/[id]/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Badge, Alert } from "@/components/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { bookService, cartService, wishlistService, reviewService, commentService } from "@/services";
import type { BookDetailDto, BookDto } from "@/types/dtos";
import { useAuth } from "@/contexts";
import { resolveBookPrice, formatPrice } from "@/lib/price";
import { normalizeImageUrl, getBookCoverUrl } from "@/lib/imageUtils";

// ============================================================================
// TYPES
// ============================================================================
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

type CommentItem = {
  id: string;
  author: string;
  content: string;
  createdAt: string; 
  replies?: CommentItem[];
  parentId?: string | null;
};

// ============================================================================
// HELPER FUNCTIONS
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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const calculateDiscountPercent = (original: number, price: number) => {
  if (original <= 0 || price <= 0 || price >= original) return 0;
  return Math.round(((original - price) / original) * 100);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// 1. Comment Tree Component
function CommentTree({
  comment,
  depth = 0,
  replyOpen,
  replyDrafts,
  toggleReply,
  updateReplyDraft,
  addReply,
}: {
  comment: CommentItem;
  depth?: number;
  replyOpen: Record<string, boolean>;
  replyDrafts: Record<string, string>;
  toggleReply: (id: string) => void;
  updateReplyDraft: (id: string, val: string) => void;
  addReply: (parentId: string) => void;
}) {
  const maxDepth = 5;
  const isMaxDepth = depth >= maxDepth;

  return (
    <div className={depth > 0 ? "mt-3 border-l-2 border-gray-300 pl-3" : ""}>
      <div className="rounded-lg border border-gray-200 p-3">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium">{comment.author}</span>
          <span className="text-gray-500">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="whitespace-pre-line text-sm text-gray-800">
          {comment.content}
        </p>

        {!isMaxDepth && (
          <div className="mt-2">
            <button
              onClick={() => toggleReply(comment.id)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {replyOpen[comment.id] ? "Đóng trả lời" : "Trả lời"}
            </button>
          </div>
        )}

        {replyOpen[comment.id] && (
          <div className="mt-3 flex items-start gap-2">
            <input
              value={replyDrafts[comment.id] ?? ""}
              onChange={(e) => updateReplyDraft(comment.id, e.target.value)}
              placeholder="Viết phản hồi…"
              className="h-[40px] flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none ring-blue-100 focus:ring-4"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  addReply(comment.id);
                }
              }}
            />
            <button
              onClick={() => addReply(comment.id)}
              className="h-[40px] shrink-0 rounded-lg bg-blue-600 px-3 text-white transition hover:bg-blue-700 active:scale-95"
            >
              Gửi
            </button>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .map((reply) => (
              <CommentTree
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                replyOpen={replyOpen}
                replyDrafts={replyDrafts}
                toggleReply={toggleReply}
                updateReplyDraft={updateReplyDraft}
                addReply={addReply}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// 2. Carousel Book Card Component
function CarouselBookCard({ book }: { book: CarouselBook }) {
  const hasDiscount =
    book.originalPrice > 0 && book.originalPrice > book.price;

  return (
    <Link
      href={`/books/${book.id}`}
      className="flex w-[260px] min-w-[260px] flex-col rounded-2xl bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)]
                  border border-pink-50 overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(15,23,42,0.16)] group"
    >
      <div className="relative w-full aspect-[4/5]">
        {book.cover ? (
          <Image
            src={book.cover}
            alt={book.title}
            fill
            sizes="260px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {book.hot && (
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

      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
        <p className="text-xs text-gray-600">{book.author}</p>

        {book.rating > 0 && book.reviews > 0 ? (
          <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-600">
            <span className="text-yellow-400">★</span>
            <span className="font-semibold">{book.rating.toFixed(1)}</span>
            <span className="text-gray-400">
              ({book.reviews.toLocaleString()})
            </span>
          </div>
        ) : (
          <div className="mt-2 text-[11px] text-gray-400">Đang cập nhật</div>
        )}

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <p className="text-red-600 font-bold text-sm">
            {formatCurrency(book.price)}
          </p>
          {hasDiscount && (
            <>
              <p className="text-xs text-gray-400 line-through">
                {formatCurrency(book.originalPrice)}
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

// 3. Stars Components
const Star = ({ filled = false }: { filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
    <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
  </svg>
);

const StarHalf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star-half">
    <defs><clipPath id="half"><rect x="0" y="0" width="12" height="24" /></clipPath></defs>
    <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" clipPath="url(#half)" />
    <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" fill="none" />
  </svg>
);

function RatingStars({ rating }: { rating: number }) {
  const rounded = Math.round(rating * 2) / 2;
  const full = Math.floor(rounded);
  const hasHalf = rounded - full === 0.5;
  return (
    <div className="flex items-center text-yellow-400">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <Star key={i} filled />;
        if (i === full && hasHalf) return <StarHalf key={i} />;
        return <Star key={i} filled={false} />;
      })}
    </div>
  );
}


// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function BookDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
    
  // -------- API States --------
  const [book, setBook] = useState<BookDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   
  // Carousel Data
  const [suggestedBooks, setSuggestedBooks] = useState<CarouselBook[]>([]);
  const [popularBooks, setPopularBooks] = useState<CarouselBook[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<CarouselBook[]>([]);

  // Review & Comment Data
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);

  // -------- UI States --------
  const [activeTab, setActiveTab] = useState<"desc" | "review" | "comments">("desc");
  const [descExpanded, setDescExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [cartMessage, setCartMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { isLoggedIn } = useAuth();

  // Refs và states cho Carousel
  const likeRef = useRef<HTMLDivElement>(null);
  const [canPrevLike, setCanPrevLike] = useState(false);
  const [canNextLike, setCanNextLike] = useState(true);

  const popularRef = useRef<HTMLDivElement>(null);
  const [canPrevPopular, setCanPrevPopular] = useState(false);
  const [canNextPopular, setCanNextPopular] = useState(true);

  const authorRef = useRef<HTMLDivElement>(null);
  const [canPrevAuthor, setCanPrevAuthor] = useState(false);
  const [canNextAuthor, setCanNextAuthor] = useState(true);

  function updateArrowsLike() {
    const el = likeRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrevLike(scrollLeft > 0);
    setCanNextLike(scrollLeft + clientWidth < scrollWidth - 1);
  }

  function updateArrowsPopular() {
    const el = popularRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrevPopular(scrollLeft > 0);
    setCanNextPopular(scrollLeft + clientWidth < scrollWidth - 1);
  }

  function updateArrowsAuthor() {
    const el = authorRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrevAuthor(scrollLeft > 0);
    setCanNextAuthor(scrollLeft + clientWidth < scrollWidth - 1);
  }

  useEffect(() => {
    const roLike = new ResizeObserver(updateArrowsLike);
    if (likeRef.current) roLike.observe(likeRef.current);

    const roPopular = new ResizeObserver(updateArrowsPopular);
    if (popularRef.current) roPopular.observe(popularRef.current);

    const roAuthor = new ResizeObserver(updateArrowsAuthor);
    if (authorRef.current) roAuthor.observe(authorRef.current);

    updateArrowsLike();
    updateArrowsPopular();
    updateArrowsAuthor();

    return () => {
      roLike.disconnect();
      roPopular.disconnect();
      roAuthor.disconnect();
    };
  }, [suggestedBooks, popularBooks, relatedBooks]);

  function scrollByStepLike(dir: "left" | "right") {
    const el = likeRef.current;
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  function scrollByStepPopular(dir: "left" | "right") {
    const el = popularRef.current;
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  function scrollByStepAuthor(dir: "left" | "right") {
    const el = authorRef.current;
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  }

  const transformBookDto = (dto: BookDto): CarouselBook => {
    const priceInfo = resolveBookPrice(dto);
    return {
      id: dto.id,
      title: dto.title,
      author: dto.authorNames?.[0] || "Tác giả không xác định",
      price: priceInfo.finalPrice,
      originalPrice: priceInfo.originalPrice,
      cover: normalizeImageUrl(dto.coverImage) || "/image/anh.png",
      rating: dto.averageRating || 0,
      reviews: dto.totalReviews || 0,
      hot: priceInfo.hasDiscount,
    };
  };

  // =====================================================================
  // Fetch data from API
  // =====================================================================
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Book Detail
        const bookData = await bookService.getBookById(id);
        setBook(bookData);
        setIsLiked(false);
        
        // 2. Fetch Suggested Books (Newest)
        const newest = await bookService.getNewestBooks(8);
        const suggested = newest.map(transformBookDto);
        // Fetch cover URLs for suggested books
        try {
          const suggestedCovers = await Promise.all(
            suggested.map(async (b) => ({ id: b.id, cover: await getBookCoverUrl(b.id) }))
          );
          const suggestedMap: Record<string, string | null> = {};
          suggestedCovers.forEach((c) => (suggestedMap[c.id] = c.cover));
          setSuggestedBooks(suggested.map((b) => ({ ...b, cover: suggestedMap[b.id] || b.cover })));
        } catch (e) {
          setSuggestedBooks(suggested);
        }
        
        // 3. Fetch Popular Books (Most Viewed)
        const mostViewed = await bookService.getMostViewedBooks(8);
        const popular = mostViewed.map(transformBookDto);
        try {
          const popularCovers = await Promise.all(
            popular.map(async (b) => ({ id: b.id, cover: await getBookCoverUrl(b.id) }))
          );
          const popularMap: Record<string, string | null> = {};
          popularCovers.forEach((c) => (popularMap[c.id] = c.cover));
          setPopularBooks(popular.map((b) => ({ ...b, cover: popularMap[b.id] || b.cover })));
        } catch (e) {
          setPopularBooks(popular);
        }
        
        // 4. Fetch Related Books (Same Author)
        if (bookData.authors && bookData.authors.length > 0) {
           const authorId = bookData.authors[0].id;
           const byAuthor = await bookService.getBooksByAuthor(authorId, 12);
           const filtered = byAuthor.filter(b => b.id !== id);
           const related = filtered.map(transformBookDto);
           try {
             const relatedCovers = await Promise.all(
               related.map(async (b) => ({ id: b.id, cover: await getBookCoverUrl(b.id) }))
             );
             const relatedMap: Record<string, string | null> = {};
             relatedCovers.forEach((c) => (relatedMap[c.id] = c.cover));
             setRelatedBooks(related.map((b) => ({ ...b, cover: relatedMap[b.id] || b.cover })));
           } catch (e) {
             setRelatedBooks(related);
           }
        } else if (bookData.categories && bookData.categories.length > 0) {
           const byCat = await bookService.getBooksByCategory(bookData.categories[0].id, 12);
           const filtered = byCat.filter(b => b.id !== id);
           const related = filtered.map(transformBookDto);
           try {
             const relatedCovers = await Promise.all(
               related.map(async (b) => ({ id: b.id, cover: await getBookCoverUrl(b.id) }))
             );
             const relatedMap: Record<string, string | null> = {};
             relatedCovers.forEach((c) => (relatedMap[c.id] = c.cover));
             setRelatedBooks(related.map((b) => ({ ...b, cover: relatedMap[b.id] || b.cover })));
           } catch (e) {
             setRelatedBooks(related);
           }
        }

        // 5. Fetch Reviews & Stats
        fetchReviewsData();

        // 6. Fetch Comments
        fetchCommentsData();

      } catch (error) {
        console.error("Error fetching book detail:", error);
        setError("Không tìm thấy thông tin sách. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
      
    if (id) fetchAllData();
  }, [id]);

  // --- API Functions for Reviews & Comments ---

  const fetchReviewsData = async () => {
      try {
          const res = await reviewService.getBookReviews(id, 1, 20); 
          const reviewList = (res as any).reviews || res.items || [];
          const mappedReviews: Review[] = reviewList.map((r: any) => ({
              id: r.id,
              author: r.userName || "Người dùng", 
              text: r.content,
              rating: r.rating,
              likes: 0,
              dislikes: 0,
              userVote: null,
              createdAt: r.createdAt
          }));
          setReviews(mappedReviews);

          const stats = await reviewService.getBookReviewStatistics(id);
          setReviewStats(stats);
      } catch (e) { console.error("Error loading reviews", e); }
  }

  const fetchCommentsData = async () => {
      try {
          const res = await commentService.getBookComments(id, 1, 20);
          
          const commentList = (res as any).comments || res.items || [];
          const mappedComments: CommentItem[] = commentList.map((c: any) => ({
              id: c.id,
              author: c.userName || "Người dùng",
              content: c.content,
              createdAt: c.createdAt,
              replies: [] 
          }));
          setComments(mappedComments);
      } catch (e) { console.error("Error loading comments", e); }
  }

  const getMetadataValue = (key: string, defaultValue: any = null) => {
    const metadataItem = book?.metadata?.find(m => m.key.toLowerCase() === key.toLowerCase());
    return metadataItem?.value || defaultValue;
  };

  const displayBook = book ? (() => {
    const priceInfo = resolveBookPrice(book);
    const finalReviewCount = reviewStats ? reviewStats.totalReviews : (book.totalReviews || 0);
    const finalRating = reviewStats ? reviewStats.averageRating : (book.averageRating || 0);

    return {
      id: book.id,
      title: book.title,
      author: book.authors && book.authors.length > 0 ? book.authors.map(a => a.name).join(", ") : "Tác giả không xác định",
      category: book.categories && book.categories.length > 0 ? book.categories.map(c => c.name).join(", ") : "Chưa phân loại",
      publisher: book.publisher?.name || "NXB",
      price: priceInfo.finalPrice,
      originalPrice: priceInfo.originalPrice,
      rating: finalRating,
      reviewCount: finalReviewCount, 
      stock: book.stockQuantity || 0,
      year: book.publicationYear || new Date().getFullYear(),
      weight: parseInt(getMetadataValue("weight", "500")),
      size: `${book.pageCount || 0} trang`,
      language: book.language || "Tiếng Việt",
      cover: normalizeImageUrl(
        (book.images && book.images.length > 0 ? book.images.find(img => img.isCover)?.imageUrl : null) || 
        (book.images && book.images.length > 0 ? book.images[0].imageUrl : null)
      ) || "/image/anh.png",
      description: book.description || "Chưa có mô tả",
      isbn: book.isbn || "",
      edition: book.edition || "",
    };
  })() : null;

  const totalReviews = displayBook?.reviewCount || 0;

  // Logic Review
  const [newReview, setNewReview] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);

  async function addNewReview() {
    const text = newReview.trim();
    if (!text) return;
    
    if (!isLoggedIn) {
        setCartMessage({ type: 'error', text: 'Vui lòng đăng nhập để đánh giá' });
        return;
    }

    try {
        await reviewService.createReview(id, {
            rating: newReviewRating,
            title: "Đánh giá sách",
            content: text
        });
        
        await fetchReviewsData(); 
        
        setNewReview("");
        setNewReviewRating(5);
        setCartMessage({ type: 'success', text: 'Gửi đánh giá thành công!' });
        setTimeout(() => setCartMessage(null), 3000);
    } catch (err: any) {
        const msg = err.response?.data?.message || err.message || "Lỗi khi gửi đánh giá";
        setCartMessage({ type: 'error', text: msg });
        setTimeout(() => setCartMessage(null), 3000);
    }
  }

  // Logic Comment
  const [visibleCommentCount, setVisibleCommentCount] = useState(3);
  const [newComment, setNewComment] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});

  function totalComments(list: CommentItem[]): number {
    return list.reduce(
      (sum, c) => sum + 1 + totalComments(c.replies ?? []),
      0
    );
  }

  async function addNewComment() {
    if (!newComment.trim()) return;
    if (!isLoggedIn) {
        setCartMessage({ type: 'error', text: 'Vui lòng đăng nhập để bình luận' });
        return;
    }

    try {
        await commentService.createComment({
            bookId: id,
            content: newComment.trim(),
            parentCommentId: null
        });
        await fetchCommentsData();
        setNewComment("");
    } catch (err) {
        console.error(err);
        setCartMessage({ type: 'error', text: 'Lỗi gửi bình luận' });
    }
  }

  function toggleReply(id: string) {
    setReplyOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function updateReplyDraft(id: string, val: string) {
    setReplyDrafts((prev) => ({ ...prev, [id]: val }));
  }

  async function addReply(parentId: string) {
    const text = (replyDrafts[parentId] ?? "").trim();
    if (!text) return;
    if (!isLoggedIn) {
        setCartMessage({ type: 'error', text: 'Vui lòng đăng nhập để trả lời' });
        return;
    }

    try {
        await commentService.createComment({
            bookId: id,
            content: text,
            parentCommentId: parentId
        });
        
        await fetchCommentsData();

        setReplyDrafts((prev) => ({ ...prev, [parentId]: "" }));
        setReplyOpen((prev) => ({ ...prev, [parentId]: false }));
    } catch (err) {
        console.error(err);
        setCartMessage({ type: 'error', text: 'Lỗi gửi câu trả lời' });
    }
  }

  const sortedComments = [...comments];
  const visibleComments = sortedComments.slice(0, visibleCommentCount);
  const canLoadMore = visibleCommentCount < sortedComments.length;
  const commentCountLabel = totalComments(comments);

  const DESC_LIMIT = 300;
  const isLongDesc = (displayBook?.description?.length || 0) > DESC_LIMIT;
  const shortDesc = isLongDesc
    ? (displayBook?.description || "").substring(0, DESC_LIMIT) + "..."
    : (displayBook?.description || "");

  async function handleToggleWishlist() {
    try {
      setIsTogglingWishlist(true);
      const isNowInWishlist = await wishlistService.toggleWishlist(id);
      setIsLiked(isNowInWishlist);
      setCartMessage({ type: 'success', text: isNowInWishlist ? 'Đã thêm vào danh sách yêu thích!' : 'Đã xóa khỏi danh sách yêu thích!' });
      setTimeout(() => { setCartMessage(null); }, 2000);
    } catch (error) { console.error('Failed to toggle wishlist:', error); setCartMessage({ type: 'error', text: 'Không thể cập nhật danh sách yêu thích' }); } finally { setIsTogglingWishlist(false); }
  }

  async function handleAddToCart() {
    if (!isLoggedIn) {
      setCartMessage({ type: 'error', text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng' });
      setTimeout(() => { router.push('/auth/login?redirect=/books/' + id); }, 1500);
      return;
    }
    if (!book || !displayBook) return;
    try {
      setIsAddingToCart(true);
      setCartMessage(null);
      await cartService.addToCart({ bookId: id, quantity: 1, });
      setCartMessage({ type: 'success', text: 'Đã thêm sách vào giỏ hàng!' });
      setTimeout(() => { setCartMessage(null); }, 3000);
      if (typeof window !== 'undefined') { window.dispatchEvent(new Event('cartUpdated')); }
    } catch (error) { console.error('Failed to add to cart:', error); setCartMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không thể thêm sản phẩm vào giỏ hàng.' }); setTimeout(() => { setCartMessage(null); }, 3000); } finally { setIsAddingToCart(false); }
  }

  // =====================================================================
  // LOGIC MUA NGAY (BUY NOW) - UPDATED
  // =====================================================================
  async function handleBuyNow() {
    if (!isLoggedIn) {
      setCartMessage({ type: 'error', text: 'Vui lòng đăng nhập để mua hàng' });
      setTimeout(() => { router.push('/auth/login?redirect=/books/' + id); }, 1500);
      return;
    }
    if (!book || !displayBook) return;
    
    try {
      // 1. Thêm vào giỏ hàng (Backend cần record để xử lý checkout)
      // Không cần hiện loading UI quá lâu, chỉ cần đảm bảo request gửi đi
      await cartService.addToCart({ bookId: id, quantity: 1 });
      
      // 2. Chuyển hướng THẲNG sang Checkout, kèm theo ID sách
      // Logic: Checkout chỉ xử lý item có ID này
      router.push(`/checkout?items=${id}`);
      
    } catch (error) {
      console.error('Failed to prepare buy now:', error);
      // Nếu lỗi (ví dụ item đã có trong giỏ), vẫn thử chuyển sang checkout
      router.push(`/checkout?items=${id}`);
    }
  }

  function handleShareToFacebook() {
    if (!displayBook) return;
    const url = typeof window !== "undefined" ? window.location.href : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/books/${id}`;
    const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    if (typeof navigator !== "undefined" && (navigator as any).share) { (navigator as any).share({ title: "Chia sẻ sách", text: displayBook.title, url }).catch(() => window.open(fbShare, "_blank", "noopener,noreferrer")); } else { window.open(fbShare, "_blank", "noopener,noreferrer"); }
  }

  // =====================================================================
  // RENDER MAIN PAGE
  // =====================================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-10">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 rounded bg-gray-200"></div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="h-96 rounded-xl bg-gray-200"></div>
              <div className="space-y-4">
                <div className="h-8 w-3/4 rounded bg-gray-200"></div>
                <div className="h-6 w-1/2 rounded bg-gray-200"></div>
                <div className="h-6 w-2/3 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!book || !displayBook) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-10">
          <div className="rounded-2xl bg-white p-8 text-center shadow-md">
            <p className="text-lg text-gray-600">
              {error || "Không tìm thấy thông tin sách"}
            </p>
            {error && (
              <p className="mt-2 text-sm text-gray-500">
                Vui lòng kiểm tra console để xem chi tiết lỗi
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  const hasMainDiscount = displayBook.originalPrice > 0 && displayBook.originalPrice > displayBook.price;
  const mainDiscountPercent = hasMainDiscount ? calculateDiscountPercent(displayBook.originalPrice, displayBook.price) : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <Breadcrumb items={[
        { label: 'Sách', href: '/books' },
        { label: displayBook.title }
      ]} />
      <div className="container mx-auto px-6 py-10 text-gray-900">

        {cartMessage && (
          <div className="mb-4">
            <Alert variant={cartMessage.type === 'success' ? 'success' : 'danger'} onClose={() => setCartMessage(null)}>
              {cartMessage.text}
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 rounded-2xl bg-white p-6 shadow-md lg:grid-cols-2">
          <div className="flex justify-center">
            {displayBook.cover ? (
              <Image
                src={displayBook.cover}
                alt={displayBook.title}
                width={400}
                height={600}
                className="rounded-xl object-cover"
                unoptimized
              />
            ) : (
              <div className="w-[400px] h-[600px] bg-gray-200 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold">{displayBook.title}</h1>

            <div className="flex items-center gap-2">
              <RatingStars rating={displayBook.rating} />
              <span className="text-sm text-slate-500">
                {displayBook.rating.toFixed(1)} / 5 •{" "}
                {totalReviews.toLocaleString("vi-VN")} đánh giá
              </span>
            </div>

            <p className="text-sm text-slate-500">Tác giả: {displayBook.author}</p>
            <p className="text-sm text-slate-500">Nhà xuất bản: {displayBook.publisher}</p>
            
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-grey-600">Số lượng còn lại:</span>
                <span className={`text-lg font-bold ${
                  displayBook.stock === 0 ? 'text-red-600' : 
                  displayBook.stock < 10 ? 'text-amber-600' : 
                  'text-green-600'
                }`}>
                  {displayBook.stock === 0 ? 'Hết hàng' : `${displayBook.stock} cuốn`}
                </span>
            </div>

            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(displayBook.price)}
              </p>

              {hasMainDiscount && (
                <>
                  <p className="text-sm text-gray-400 line-through">
                    {formatCurrency(displayBook.originalPrice)}
                  </p>
                  <span className="inline-flex items-center rounded-full bg-red-50 text-red-600 text-xs font-semibold px-2 py-0.5">
                    -{mainDiscountPercent}%
                  </span>
                </>
              )}

              {displayBook.stock === 0 ? (
                <Badge variant="danger" size="sm">
                  HẾT HÀNG
                </Badge>
              ) : displayBook.stock < 10 ? (
                <Badge variant="warning" size="sm">
                  Còn {displayBook.stock} cuốn
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  Còn hàng
                </Badge>
              )}
            </div>

            {displayBook.stock > 0 && displayBook.stock < 10 && (
              <Alert variant="warning">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Chỉ còn {displayBook.stock} cuốn! Đặt hàng ngay để không bỏ lỡ</span>
                </div>
              </Alert>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* NÚT MUA NGAY - GỌI HÀM MỚI */}
              <Button variant="danger" className="shadow-sm" onClick={handleBuyNow} disabled={displayBook.stock === 0}>
                Mua ngay
              </Button>

              <Button variant="primary" className="shadow-sm" onClick={handleAddToCart} disabled={displayBook.stock === 0 || isAddingToCart}>
                {isAddingToCart ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang thêm...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart">
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    <span>Thêm vào giỏ hàng</span>
                  </>
                )}
              </Button>

              <Link href={`/rent/${id}`}>
                <Button className="bg-amber-500 shadow-sm hover:bg-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open">
                    <path d="M12 7v14" />
                    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                  </svg>
                  <span>Thuê e-book</span>
                </Button>
              </Link>

              <Button onClick={handleToggleWishlist} variant="ghost" size="sm" disabled={isTogglingWishlist} aria-label={isLiked ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"} title={isLiked ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}>
                {isTogglingWishlist ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? "red" : "none"} stroke={isLiked ? "red" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart transition-all">
                    <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
                  </svg>
                )}
              </Button>

              <Button onClick={() => setIsSaved((prev) => !prev)} variant="ghost" size="sm" aria-label="Lưu sách" title="Lưu sách">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={isSaved ? "gold" : "none"} stroke={isSaved ? "gold" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </Button>

              <Button onClick={handleShareToFacebook} variant="ghost" size="sm" aria-label="Chia sẻ Facebook" title="Chia sẻ Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </Button>
            </div>

            {displayBook.price >= 500000 && (
              <Alert variant="success">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Miễn phí vận chuyển cho đơn hàng này</span>
                </div>
              </Alert>
            )}

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Thông tin chi tiết sách</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <strong className="text-gray-600">Mã sách:</strong>
                    <span>{displayBook.id}</span>
                  </li>
                  <li className="flex justify-between">
                    <strong className="text-gray-600">Tác giả:</strong>
                    <span>{displayBook.author}</span>
                  </li>
                  <li className="flex justify-between">
                    <strong className="text-gray-600">Thể loại:</strong>
                    <Badge variant="info" size="sm">
                      {displayBook.category}
                    </Badge>
                  </li>
                  <li className="flex justify-between">
                    <strong className="text-gray-600">Nhà cung cấp:</strong>
                    <span>BookStore</span>
                  </li>
                  <li className="flex justify-between">
                    <strong className="text-gray-600">Ngôn ngữ:</strong>
                    <span>{displayBook.language}</span>
                  </li>
                  <li className="flex justify-between">
                    <strong className="text-gray-600">Nhà xuất bản:</strong>
                    <span>{displayBook.publisher}</span>
                  </li>
                  <li className="flex justify-between">
                    <strong className="text-gray-600">Năm xuất bản:</strong>
                    <span>{displayBook.year}</span>
                  </li>
                  <li className="flex justify-between">
                    <strong className="text-gray-600">Tình trạng:</strong>
                    {displayBook.stock === 0 ? (
                      <Badge variant="danger" size="sm">Hết hàng</Badge>
                    ) : displayBook.stock < 10 ? (
                      <Badge variant="warning" size="sm">Còn {displayBook.stock} cuốn</Badge>
                    ) : (
                      <Badge variant="success" size="sm">Còn hàng</Badge>
                    )}
                  </li>
                  <li className="flex justify-between">
                    <strong className="text-gray-600">Trọng lượng:</strong>
                    <span>{displayBook.weight}g</span>
                  </li>
                  <li className="flex justify-between">
                    <strong className="text-gray-600">Kích thước:</strong>
                    <span>{displayBook.size}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-4 flex border-b border-gray-200">
            <Button
              onClick={() => setActiveTab("desc")}
              variant="ghost"
              className={`border-b-2 rounded-none ${
                activeTab === "desc"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Mô tả sản phẩm
            </Button>
            <Button
              onClick={() => setActiveTab("review")}
              variant="ghost"
              className={`border-b-2 rounded-none ${
                activeTab === "review"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Đánh giá & nhận xét ({totalReviews})
            </Button>
            <Button
              onClick={() => setActiveTab("comments")}
              variant="ghost"
              className={`border-b-2 rounded-none ${
                activeTab === "comments"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Bình luận ({commentCountLabel})
            </Button>
          </div>

          {activeTab === "desc" && (
            <div className="relative rounded-xl bg-white p-6 shadow-md">
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {descExpanded ? displayBook.description : shortDesc}
              </p>
              {isLongDesc && (
                <Button
                  onClick={() => setDescExpanded((v) => !v)}
                  variant="ghost"
                  size="sm"
                  className="mt-3 h-auto p-0 text-blue-600 hover:underline"
                  aria-expanded={descExpanded}
                >
                  {descExpanded ? "Thu gọn" : "Xem thêm"}
                </Button>
              )}
            </div>
          )}

          {activeTab === "review" && (
            <div className="space-y-6 rounded-xl bg-white p-6 shadow-md">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <div className="text-5xl font-bold text-blue-600">
                    {displayBook.rating.toFixed(1)}
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <RatingStars rating={displayBook.rating} />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {totalReviews} đánh giá
                  </p>
                </div>

                <div className="col-span-2 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(
                      (r) => r.rating === star
                    ).length;
                    const percentage =
                      reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="flex w-12 items-center gap-1 text-sm font-medium">
                          {star} <span className="text-yellow-400">★</span>
                        </span>
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-yellow-400 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-sm text-gray-600">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Viết đánh giá của bạn
                </h3>

                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Đánh giá của bạn:
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="transition hover:scale-110"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill={
                            star <= newReviewRating ? "currentColor" : "none"
                          }
                          stroke="currentColor"
                          strokeWidth="2"
                          className={
                            star <= newReviewRating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
                        </svg>
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      ({newReviewRating} sao)
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách..."
                    className="min-h-[84px] flex-1 rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none ring-blue-100 focus:ring-4"
                  />
                  <Button
                    onClick={addNewReview}
                    variant="primary"
                    size="sm"
                    className="shrink-0"
                  >
                    Gửi đánh giá
                  </Button>
                </div>
              </div>

              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold">Tất cả đánh giá</h3>
                {reviews.length === 0 ? (
                    <p className="text-gray-500 italic">Chưa có đánh giá nào.</p>
                ) : (
                    <div className="space-y-3">
                    {reviews.map((rv) => (
                        <div key={rv.id} className="rounded-lg border border-gray-200 p-4">
                            <div className="mb-2 flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        <p className="font-medium">{rv.author}</p>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-sm text-gray-500">
                                            {timeAgo(rv.createdAt)}
                                        </span>
                                    </div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={star <= rv.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={star <= rv.rating ? "text-yellow-400" : "text-gray-300"}>
                                                    <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
                                                </svg>
                                            ))}
                                        </div>
                                        <Badge variant={rv.rating >= 4 ? "success" : rv.rating >= 3 ? "warning" : "danger"} size="sm">
                                            {rv.rating} sao
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-700">{rv.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Bình luận ({commentCountLabel})
                </h3>
              </div>

              <div className="mb-6 flex items-start gap-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về cuốn sách..."
                  className="min-h-[84px] flex-1 rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none ring-blue-100 focus:ring-4"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      e.preventDefault();
                      addNewComment();
                    }
                  }}
                />
                <Button
                  onClick={addNewComment}
                  variant="primary"
                  size="sm"
                  className="shrink-0"
                >
                  Gửi
                </Button>
              </div>

              {comments.length === 0 ? (
                  <p className="text-gray-500 italic">Chưa có bình luận nào.</p>
              ) : (
                <div className="space-y-4">
                    {visibleComments.map((c) => (
                    <CommentTree
                        key={c.id}
                        comment={c}
                        depth={0}
                        replyOpen={replyOpen}
                        replyDrafts={replyDrafts}
                        toggleReply={toggleReply}
                        updateReplyDraft={updateReplyDraft}
                        addReply={addReply}
                    />
                    ))}
                </div>
              )}

              {canLoadMore && (
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={() =>
                      setVisibleCommentCount((n) =>
                        Math.min(n + 3, sortedComments.length)
                      )
                    }
                    variant="outline"
                    size="sm"
                  >
                    Xem thêm bình luận
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 1. Có thể bạn thích */}
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-2xl font-semibold tracking-wide text-gray-800">
              Có thể bạn thích
            </h2>
            {suggestedBooks.length > 0 && (
                <Link
                href="/books?filter=suggested"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                <span>Xem tất cả</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                </Link>
            )}
          </div>

          {suggestedBooks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 italic bg-white rounded-xl shadow-sm border border-gray-100">
                  Không có sách gợi ý nào tại thời điểm này.
              </div>
          ) : (
            <div className="relative">
                <Button
                type="button"
                onClick={() => scrollByStepLike("left")}
                disabled={!canPrevLike}
                variant="secondary"
                size="sm"
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 shadow"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                </svg>
                </Button>

                <div
                ref={likeRef}
                onScroll={updateArrowsLike}
                className="flex gap-5 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ overflowX: "auto" }}
                >
                {suggestedBooks.map((b) => (
                    <CarouselBookCard key={b.id} book={b} />
                ))}
                </div>

                <Button
                type="button"
                onClick={() => scrollByStepLike("right")}
                disabled={!canNextLike}
                variant="secondary"
                size="sm"
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 shadow"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                </svg>
                </Button>

                <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-gray-50 to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 to-transparent" />
            </div>
          )}
        </div>

        {/* 2. Sách được đọc nhiều nhất */}
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-2xl font-semibold tracking-wide text-gray-800">
              Sách được đọc nhiều nhất
            </h2>
            {popularBooks.length > 0 && (
                <Link
                href="/books?filter=popular"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                <span>Xem tất cả</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                </Link>
            )}
          </div>

          {popularBooks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 italic bg-white rounded-xl shadow-sm border border-gray-100">
                  Chưa có dữ liệu về sách đọc nhiều nhất.
              </div>
          ) : (
            <div className="relative">
                <Button
                type="button"
                onClick={() => scrollByStepPopular("left")}
                disabled={!canPrevPopular}
                variant="secondary"
                size="sm"
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 shadow"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                </svg>
                </Button>

                <div
                ref={popularRef}
                onScroll={updateArrowsPopular}
                className="flex gap-5 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ overflowX: "auto" }}
                >
                {popularBooks.map((b) => (
                    <CarouselBookCard key={b.id} book={b} />
                ))}
                </div>

                <Button
                type="button"
                onClick={() => scrollByStepPopular("right")}
                disabled={!canNextPopular}
                variant="secondary"
                size="sm"
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 shadow"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                </svg>
                </Button>

                <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-gray-50 to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 to-transparent" />
            </div>
          )}
        </div>

        {/* 3. Cùng tác giả */}
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-2xl font-semibold tracking-wide text-gray-800">
              Cùng tác giả
            </h2>
            {relatedBooks.length > 0 && (
                <Link
                href="/books?filter=related"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                <span>Xem tất cả</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                </Link>
            )}
          </div>

          {relatedBooks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 italic bg-white rounded-xl shadow-sm border border-gray-100">
                  Không tìm thấy sách khác cùng tác giả.
              </div>
          ) : (
            <div className="relative">
                <Button
                type="button"
                onClick={() => scrollByStepAuthor("left")}
                disabled={!canPrevAuthor}
                variant="secondary"
                size="sm"
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 shadow"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                </svg>
                </Button>

                <div
                ref={authorRef}
                onScroll={updateArrowsAuthor}
                className="flex gap-5 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ overflowX: "auto" }}
                >
                {relatedBooks.map((b) => (
                    <CarouselBookCard key={b.id} book={b} />
                ))}
                </div>

                <Button
                type="button"
                onClick={() => scrollByStepAuthor("right")}
                disabled={!canNextAuthor}
                variant="secondary"
                size="sm"
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 shadow"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                </svg>
                </Button>

                <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-gray-50 to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 to-transparent" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}


