// app/books/[id]/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, use, useRef, useEffect } from "react";

// ============================================================================
// TYPES
// ============================================================================
type Params = { id: string };

type CommentItem = {
  id: string;
  author: string;
  content: string;
  createdAt: string; // ISO string
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

// ============================================================================
// MOCK DATA - XÓA TOÀN BỘ SECTION NÀY KHI NỐI API THẬT
// ============================================================================

// Mock book detail data
const MOCK_BOOK = {
  id: 1232132312,
  title: "101 cách cua đổ đại lão hàng xóm",
  author: "Đồng Vu",
  category: "Tiểu thuyết",
  publisher: "NXB Lao Động",
  price: 100000,
  originalPrice: 150000,
  rating: 4.3,
  reviewCount: 128,
  stock: 12,
  year: 2021,
  weight: 500,
  size: "30 x 15 x 3 cm",
  language: "Tiếng Việt",
  cover: "/image/anh.png",
  description: `Tống Thiên Thị luôn cảm thấy hàng xóm mới tới là người không dễ sống chung, bởi hắn không chỉ lạnh lùng mà lời nói ra cũng chẳng dễ lọt tai. Mãi cho đến một ngày cô bị hàng xóm chặn trên hành lang.

Đôi mắt của luật sư Ôn sáng quắc: "Trăm nhân ắt có quả, tôi chính là quả của em."

Tống Thiên Thị nhìn người đàn ông ăn mặc chỉnh tề trước mặt, đột nhiên thay đổi quan điểm về anh.

...

Cô cho rằng cô có thể yêu đương với luật sư nhưng kết hôn thì không thể, bởi về sau cãi nhau thì chắc chắn cô không thể thắng hắn, hơn nữa, có khi lúc ly hôn đối phương không cần thuê luật sư cũng có thể tiễn cô ra khỏi nhà ngay lập tức.

Nghe xong lý do cô cự tuyệt, luật sư Ôn bình thản: "Nếu em không thích thân phận luật sư thì tôi có thể đổi thành thân phận chồng em."`,
};

// Mock suggested books (Có thể bạn thích)
const MOCK_SUGGESTED_BOOKS = [
  { id: "s1", title: "Tôi thấy hoa vàng trên cỏ xanh", cover: "/image/anh.png" },
  { id: "s2", title: "Tháng năm rực rỡ", cover: "/image/anh.png" },
  { id: "s3", title: "Người lái đò sông Đà", cover: "/image/anh.png" },
  { id: "s4", title: "Dế mèn phiêu lưu ký", cover: "/image/anh.png" },
  { id: "s5", title: "Tuổi thơ dữ dội", cover: "/image/anh.png" },
  { id: "s6", title: "Số đỏ", cover: "/image/anh.png" },
  { id: "s7", title: "Chí Phèo", cover: "/image/anh.png" },
  { id: "s8", title: "Lão Hạc", cover: "/image/anh.png" },
  { id: "s9", title: "Bố Già", cover: "/image/anh.png" },
  { id: "s10", title: "Tuổi trẻ đáng giá bao nhiêu", cover: "/image/anh.png" },
  { id: "s11", title: "Đắc nhân tâm", cover: "/image/anh.png" },
  { id: "s12", title: "Nhà giả kim", cover: "/image/anh.png" },
];

// Mock popular books (Sách được đọc nhiều nhất)
const MOCK_POPULAR_BOOKS = [
  { id: "p1", title: "Bố Già", cover: "/image/anh.png" },
  { id: "p2", title: "Tuổi trẻ đáng giá bao nhiêu", cover: "/image/anh.png" },
  { id: "p3", title: "Đắc nhân tâm", cover: "/image/anh.png" },
  { id: "p4", title: "Nhà giả kim", cover: "/image/anh.png" },
  { id: "p5", title: "Càng kỷ luật càng tự do", cover: "/image/anh.png" },
  { id: "p6", title: "Nghĩ giàu làm giàu", cover: "/image/anh.png" },
  { id: "p7", title: "7 thói quen hiệu quả", cover: "/image/anh.png" },
  { id: "p8", title: "Quẳng gánh lo đi mà vui sống", cover: "/image/anh.png" },
];

// Mock related books (Cùng tác giả)
const MOCK_RELATED_BOOKS = [
  { id: "r1", title: "Tôi thấy hoa vàng trên cỏ xanh", cover: "/image/anh.png" },
  { id: "r2", title: "Tháng năm rực rỡ", cover: "/image/anh.png" },
  { id: "r3", title: "Người lái đò sông Đà", cover: "/image/anh.png" },
  { id: "r4", title: "Dế mèn phiêu lưu ký", cover: "/image/anh.png" },
  { id: "r5", title: "Tuổi thơ dữ dội", cover: "/image/anh.png" },
  { id: "r6", title: "Số đỏ", cover: "/image/anh.png" },
  { id: "r7", title: "Chí Phèo", cover: "/image/anh.png" },
  { id: "r8", title: "Lão Hạc", cover: "/image/anh.png" },
  { id: "r9", title: "Bố Già", cover: "/image/anh.png" },
  { id: "r10", title: "Tuổi trẻ đáng giá bao", cover: "/image/anh.png" },
  { id: "r11", title: "Đắc nhân tâm", cover: "/image/anh.png" },
  { id: "r12", title: "Nhà giả kim", cover: "/image/anh.png" },
];

// Mock initial reviews data
const MOCK_INITIAL_REVIEWS: Review[] = [
  {
    id: "rv3",
    author: "Phạm Long",
    text: "Nội dung dí dỏm, đọc giải trí rất ok.",
    rating: 4,
    likes: 5,
    dislikes: 0,
    userVote: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 phút trước
  },
  {
    id: "rv2",
    author: "Trần Thị Loan",
    text: "Đóng gói cẩn thận, giao hàng nhanh",
    rating: 5,
    likes: 7,
    dislikes: 0,
    userVote: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 giờ trước
  },
  {
    id: "rv1",
    author: "Nguyễn Văn Hùng",
    text: "Sách rất hay và ý nghĩa",
    rating: 5,
    likes: 12,
    dislikes: 1,
    userVote: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 ngày trước
  },
];

// Mock initial comments data (nested structure)
const MOCK_INITIAL_COMMENTS: CommentItem[] = [
  {
    id: "c3",
    author: "Phạm Thảo",
    content: "Cốt truyện dễ thương, đọc rất nhẹ nhàng.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 phút trước
    replies: [
      {
        id: "c3r1",
        author: "Minh Hoàng",
        content: "Đồng ý, đọc buổi tối rất thư giãn.",
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 phút trước
        replies: [
          {
            id: "c3r1r1",
            author: "Lan Anh",
            content: "Mình cũng hay đọc trước khi ngủ, rất hay!",
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 phút trước
            replies: [
              {
                id: "c3r1r1r1",
                author: "Minh Hoàng",
                content: "Đúng rồi, giúp ngủ ngon hơn nữa 😊",
                createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 phút trước
                replies: [],
              },
            ],
          },
        ],
      },
      {
        id: "c3r2",
        author: "Thu Hà",
        content: "Mình cũng nghĩ vậy, phong cách viết rất nhẹ nhàng.",
        createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 phút trước
        replies: [],
      },
    ],
  },
  {
    id: "c2",
    author: "Trung Kiên",
    content: "Giao hàng nhanh, sách mới tinh.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 giờ trước
    replies: [
      {
        id: "c2r1",
        author: "Admin",
        content: "Cảm ơn bạn đã ủng hộ shop! ❤️",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 giờ trước
        replies: [],
      },
    ],
  },
  {
    id: "c1",
    author: "Lan Anh",
    content: "Nội dung vui nhưng đoạn cuối hơi vội.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 ngày trước
    replies: [],
  },
];

// ============================================================================

//Các hàm tiện ích
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

// Component đệ quy để render comments và replies
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
    <div className={`${depth > 0 ? "mt-3 border-l-2 border-gray-300 pl-3" : ""}`}>
      <div className="rounded-lg border border-gray-200 p-3">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium">{comment.author}</span>
          <span className="text-gray-500">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="whitespace-pre-line text-sm text-gray-800">
          {comment.content}
        </p>

        {/* Nút trả lời - ẩn nếu đã đạt max depth */}
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

        {/* Ô trả lời */}
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

      {/* Render các replies đệ quy */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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

export default function BookDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params);

  // -------- UI States --------
  const [activeTab, setActiveTab] = useState<"desc" | "review" | "comments">("desc");
  const [descExpanded, setDescExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Refs và states cho "Có thể bạn thích"
  const likeRef = useRef<HTMLDivElement>(null);
  const [canPrevLike, setCanPrevLike] = useState(false);
  const [canNextLike, setCanNextLike] = useState(true);

  // Refs và states cho "Sách được đọc nhiều nhất"
  const popularRef = useRef<HTMLDivElement>(null);
  const [canPrevPopular, setCanPrevPopular] = useState(false);
  const [canNextPopular, setCanNextPopular] = useState(true);

  // Refs và states cho "Cùng tác giả"
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
    // Cập nhật arrows cho "Có thể bạn thích"
    updateArrowsLike();
    const roLike = new ResizeObserver(updateArrowsLike);
    if (likeRef.current) roLike.observe(likeRef.current);

    // Cập nhật arrows cho "Sách được đọc nhiều nhất"
    updateArrowsPopular();
    const roPopular = new ResizeObserver(updateArrowsPopular);
    if (popularRef.current) roPopular.observe(popularRef.current);

    // Cập nhật arrows cho "Cùng tác giả"
    updateArrowsAuthor();
    const roAuthor = new ResizeObserver(updateArrowsAuthor);
    if (authorRef.current) roAuthor.observe(authorRef.current);

    return () => {
      roLike.disconnect();
      roPopular.disconnect();
      roAuthor.disconnect();
    };
  }, []);

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

  // ============================================================================
  // DATA - Thay thế bằng API calls khi nối backend
  // ============================================================================
  
  //Replace with API call - GET /api/books/:id
  const book = MOCK_BOOK;
  
  //Replace with API call - GET /api/books/suggested
  const suggestedBooks = MOCK_SUGGESTED_BOOKS;
  
  //Replace with API call - GET /api/books/popular
  const popularBooks = MOCK_POPULAR_BOOKS;
  
  //Replace with API call - GET /api/books/by-author/:authorId
  const relatedBooks = MOCK_RELATED_BOOKS;
  
  //Replace with API call - GET /api/reviews/:bookId
  const [reviews, setReviews] = useState<Review[]>(MOCK_INITIAL_REVIEWS);

  function handleVote(reviewId: string, vote: "up" | "down") {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        if (r.userVote === vote) {
          return {
            ...r,
            userVote: null,
            likes: vote === "up" ? r.likes - 1 : r.likes,
            dislikes: vote === "down" ? r.dislikes - 1 : r.dislikes,
          };
        }
        if (vote === "up") {
          return {
            ...r,
            userVote: "up",
            likes: r.likes + 1,
            dislikes: r.userVote === "down" ? r.dislikes - 1 : r.dislikes,
          };
        }
        return {
          ...r,
          userVote: "down",
          dislikes: r.dislikes + 1,
          likes: r.userVote === "up" ? r.likes - 1 : r.likes,
        };
      })
    );
  }

  // TODO: Replace with API call - GET /api/comments/:bookId
  const [comments, setComments] = useState<CommentItem[]>(MOCK_INITIAL_COMMENTS);

  const [visibleCommentCount, setVisibleCommentCount] = useState(3);
  const [newComment, setNewComment] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});

  function totalComments(list: CommentItem[]): number {
    return list.reduce((sum, c) => sum + 1 + totalComments(c.replies ?? []), 0);
  }

  function addNewComment() {
    if (!newComment.trim()) return;
    setComments((prev) => [
      { id: crypto.randomUUID(), author: "Bạn đọc", content: newComment.trim(), createdAt: new Date().toISOString(), replies: [] },
      ...prev,
    ]);
    setNewComment("");
  }

  function toggleReply(id: string) {
    setReplyOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function updateReplyDraft(id: string, val: string) {
    setReplyDrafts((prev) => ({ ...prev, [id]: val }));
  }

  function addReply(parentId: string) {
    const text = (replyDrafts[parentId] ?? "").trim();
    if (!text) return;

    const addToTree = (nodes: CommentItem[]): CommentItem[] =>
      nodes.map((n) => {
        if (n.id === parentId) {
          const newReply: CommentItem = {
            id: crypto.randomUUID(),
            author: "Bạn đọc",
            content: text,
            createdAt: new Date().toISOString(),
            replies: [],
          };
          return { ...n, replies: [newReply, ...(n.replies ?? [])] };
        }
        if (n.replies?.length) return { ...n, replies: addToTree(n.replies) };
        return n;
      });

    setComments((prev) => addToTree(prev));
    setReplyDrafts((prev) => ({ ...prev, [parentId]: "" }));
    setReplyOpen((prev) => ({ ...prev, [parentId]: false }));
  }

  // danh sách theo thời gian mới → cũ
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const visibleComments = sortedComments.slice(0, visibleCommentCount);
  const canLoadMore = visibleCommentCount < sortedComments.length;
  const commentCountLabel = totalComments(comments);
  const totalReviews = reviews.length;
  const [newReview, setNewReview] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5); // Mặc định 5 sao

  function addNewReview() {
    const text = newReview.trim();
    if (!text) return;

    const newItem: Review = {
      id: crypto.randomUUID(),
      author: "Bạn đọc",
      text,
      rating: newReviewRating,
      likes: 0,
      dislikes: 0,
      userVote: null,
      createdAt: new Date().toISOString(),
    };

    // Cập nhật danh sách reviews
    const updatedReviews = [newItem, ...reviews];
    setReviews(updatedReviews);

    // Tính lại rating trung bình của sách
    const totalRating = updatedReviews.reduce((sum, rv) => sum + rv.rating, 0);
    const newAverageRating = totalRating / updatedReviews.length;
    
    // Cập nhật book rating (làm tròn 1 chữ số thập phân)
    book.rating = Math.round(newAverageRating * 10) / 10;
    book.reviewCount = updatedReviews.length;

    // Reset form
    setNewReview("");
    setNewReviewRating(5); // Reset về 5 sao
  }

  // Mô tả: rút gọn + xem thêm
  const DESC_LIMIT = 300;
  const isLongDesc = book.description.length > DESC_LIMIT;
  const shortDesc = isLongDesc ? book.description.substring(0, DESC_LIMIT) + "..." : book.description;

// Rating stars (có nửa sao) 
  const Star = ({ filled = false }: { filled?: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-star"
    >
      <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
    </svg>
  );

  const StarHalf = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-star-half"
    >
      <defs>
        <clipPath id="half">
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
      </defs>
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

  // -------- Share Facebook --------
  function handleShareToFacebook() {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/books/${id}`;
    const fbShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      (navigator as any)
        .share({ title: "Chia sẻ sách", text: book.title, url })
        .catch(() => window.open(fbShare, "_blank", "noopener,noreferrer"));
    } else {
      window.open(fbShare, "_blank", "noopener,noreferrer");
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  return (
    <main className="min-h-screen bg-gray-50">
    <div className="container mx-auto px-6 py-10 text-gray-900">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">Trang chủ</Link>{" "}/{" "}
        <Link href="/books" className="hover:text-blue-600">Sách</Link>{" "}
        / <span className="font-medium text-gray-800">{book.title}</span>
      </nav>

      {/* Nội dung chính */}
      <div className="grid grid-cols-1 gap-8 rounded-2xl bg-white p-6 shadow-md lg:grid-cols-2">
        <div className="flex justify-center">
          <Image src={book.cover} alt={book.title} width={400} height={600} className="rounded-xl object-cover" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">{book.title}</h1>

          {/* Rating + tổng lượt đánh giá */}
          <div className="flex items-center gap-2">
            <RatingStars rating={book.rating} />
            <span className="text-sm text-slate-500">
              {book.rating.toFixed(1)} / 5 • {totalReviews.toLocaleString("vi-VN")} đánh giá
            </span>
          </div>

          <p className="text-sm text-slate-500">Tác giả: {book.author}</p>
          <p className="text-sm text-slate-500">Nhà xuất bản: {book.publisher}</p>

          {/* Giá + % giảm + tình trạng */}
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(book.price)}</p>
            <p className="text-sm text-gray-400 line-through">{formatCurrency(book.originalPrice)}</p>
            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
              -{Math.max(0, Math.round((1 - book.price / book.originalPrice) * 100))}%
            </span>
            <p className="text-sm font-medium text-green-600">{book.stock > 0 ? "Còn hàng" : "Hết hàng"}</p>
          </div>

          {/* Hàng nút hành động */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white shadow-sm transition hover:bg-red-700 active:scale-95">
              Mua ngay
            </button>

            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-700 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                   className="lucide lucide-shopping-cart">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span>Thêm vào giỏ hàng</span>
            </button>

            <button className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white shadow-sm transition hover:bg-amber-600 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                   className="lucide lucide-book-open">
                <path d="M12 7v14" />
                <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
              </svg>
              <span>Thuê e-book</span>
            </button>

            {/* Icon-only */}
            <button onClick={() => setIsLiked((prev) => !prev)} aria-label="Yêu thích" title="Yêu thích"
                    className="rounded-lg p-2.5 transition hover:bg-gray-100 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                   fill={isLiked ? "red" : "none"} stroke={isLiked ? "red" : "currentColor"}
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart">
                <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
              </svg>
            </button>

            <button onClick={() => setIsSaved((prev) => !prev)} aria-label="Lưu sách" title="Lưu sách"
                    className="rounded-lg p-2.5 transition hover:bg-gray-100 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                   fill={isSaved ? "gold" : "none"} stroke={isSaved ? "gold" : "currentColor"}
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </button>

            <button onClick={handleShareToFacebook} aria-label="Chia sẻ Facebook" title="Chia sẻ Facebook"
                    className="rounded-lg p-2.5 transition hover:bg-gray-100 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                   className="lucide lucide-share-2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>

          {/* Thông tin chi tiết */}
          <div className="mt-6">
            <h2 className="mb-5 text-2xl font-bold text-gray-800">Thông tin chi tiết sách</h2>
            <ul className="space-y-5 text-sm">
              <li><strong>Mã sách:</strong> {book.id}</li>
              <li><strong>Tác giả:</strong> {book.author}</li>
              <li><strong>Thể loại:</strong> {book.category}</li>
              <li><strong>Nhà cung cấp:</strong> BookStore</li>
              <li><strong>Ngôn ngữ:</strong> {book.language}</li>
              <li><strong>Nhà xuất bản:</strong> {book.publisher}</li>
              <li><strong>Năm xuất bản:</strong> {book.year}</li>
              <li><strong>Tình trạng:</strong> {book.stock > 0 ? "Còn hàng" : "Hết hàng"}</li>
              <li><strong>Trọng lượng (gram):</strong> {book.weight}</li>
              <li><strong>Kích thước:</strong> {book.size}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs: Mô tả / Đánh giá / Bình luận */}
      <div className="mt-10">
        <div className="mb-4 flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("desc")}
            className={`border-b-2 px-4 py-2 font-medium transition ${activeTab === "desc" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-800"}`}
          >
            Mô tả sản phẩm
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`border-b-2 px-4 py-2 font-medium transition ${activeTab === "review" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-800"}`}
          >
            Đánh giá & nhận xét ({totalReviews})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`border-b-2 px-4 py-2 font-medium transition ${activeTab === "comments" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-800"}`}
          >
            Bình luận ({commentCountLabel})
          </button>
        </div>

        {/* MÔ TẢ */}
        {activeTab === "desc" && (
          <div className="relative rounded-xl bg-white p-6 shadow-md">
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {descExpanded ? book.description : shortDesc}
            </p>
            {isLongDesc && (
              <button
                onClick={() => setDescExpanded((v) => !v)}
                className="mt-3 text-sm font-medium text-blue-600 hover:underline"
                aria-expanded={descExpanded}
              >
                {descExpanded ? "Thu gọn" : "Xem thêm"}
              </button>
            )}
          </div>
        )}

        {/* ĐÁNH GIÁ (chỉ hiển thị khi tab review đang chọn) */}
        {activeTab === "review" && (
          <div className="space-y-6 rounded-xl bg-white p-6 shadow-md">
            {/* Thống kê đánh giá */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Điểm trung bình */}
              <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6">
                <div className="text-5xl font-bold text-blue-600">{book.rating.toFixed(1)}</div>
                <div className="mt-2 flex items-center gap-1">
                  <RatingStars rating={book.rating} />
                </div>
                <p className="mt-2 text-sm text-gray-600">{totalReviews} đánh giá</p>
              </div>

              {/* Phân bố đánh giá */}
              <div className="col-span-2 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
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
                      <span className="w-12 text-right text-sm text-gray-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form thêm đánh giá */}
            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">Viết đánh giá của bạn</h3>
              
              {/* Chọn số sao */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-medium">Đánh giá của bạn:</span>
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
                        fill={star <= newReviewRating ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        className={star <= newReviewRating ? "text-yellow-400" : "text-gray-300"}
                      >
                        <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({newReviewRating} sao)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách..."
                  className="min-h-[84px] flex-1 rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none ring-blue-100 focus:ring-4"
                />
                <button
                  onClick={addNewReview}
                  className="h-[40px] shrink-0 rounded-lg bg-blue-600 px-4 text-white transition hover:bg-blue-700 active:scale-95"
                >
                  Gửi đánh giá
                </button>
              </div>
            </div>

            {/* Danh sách đánh giá */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Tất cả đánh giá</h3>
              <div className="space-y-3">
                {reviews.map((rv) => (
                <div key={rv.id} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="font-medium">{rv.author}</p>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{timeAgo(rv.createdAt)}</span>
                    </div>
                    
                    {/* Hiển thị số sao đánh giá */}
                    <div className="mb-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill={star <= rv.rating ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          className={star <= rv.rating ? "text-yellow-400" : "text-gray-300"}
                        >
                          <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm font-medium text-gray-700">({rv.rating} sao)</span>
                    </div>
                    
                    <p className="text-sm text-gray-700">{rv.text}</p>
                  </div>
                </div>

                {/* Like / Dislike */}
                <div className="mt-3 flex items-center gap-2 border-t pt-3">
                  <button
                    onClick={() => handleVote(rv.id, "up")}
                    aria-label="Hữu ích"
                    aria-pressed={rv.userVote === "up"}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm transition ${
                      rv.userVote === "up"
                        ? "bg-green-50 text-green-600 ring-1 ring-green-200"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {/* icon like */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                        fill={rv.userVote === "up" ? "currentColor" : "none"} stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-up">
                      <path d="M7 10v12" />
                      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                    </svg>
                    <span>{rv.likes}</span>
                  </button>

                  <button
                    onClick={() => handleVote(rv.id, "down")}
                    aria-label="Không hữu ích"
                    aria-pressed={rv.userVote === "down"}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm transition ${
                      rv.userVote === "down"
                        ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {/* icon dislike */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                        fill={rv.userVote === "down" ? "currentColor" : "none"} stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-down">
                      <path d="M17 14V2" />
                      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l-2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
                    </svg>
                    <span>{rv.dislikes}</span>
                  </button>
                </div>
              </div>
            ))}
              </div>
            </div>
          </div>
        )}


        {/* BÌNH LUẬN */}
        {activeTab === "comments" && (
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Bình luận ({commentCountLabel})</h3>
            </div>

            {/* Form thêm bình luận mới */}
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
              <button
                onClick={addNewComment}
                className="h-[40px] shrink-0 rounded-lg bg-blue-600 px-4 text-white transition hover:bg-blue-700 active:scale-95"
              >
                Gửi
              </button>
            </div>

            {/* Danh sách bình luận với component đệ quy */}
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

            {/* Xem thêm */}
            {canLoadMore && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setVisibleCommentCount((n) => Math.min(n + 3, sortedComments.length))}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-50"
                >
                  Xem thêm bình luận
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Có thể bạn thích */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-2xl font-semibold tracking-wide text-gray-800">
            Có thể bạn thích
          </h2>
          <Link
            href="/books?filter=suggested"
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
          <button
            type="button"
            onClick={() => scrollByStepLike("left")}
            disabled={!canPrevLike}
            className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 shadow 
                        ring-1 ring-gray-200 bg-white/95
                        hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Xem trước"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          {/* Dải sách */}
          <div
            ref={likeRef}
            onScroll={updateArrowsLike}
            className="flex gap-4 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth
                      [-ms-overflow-style:none] [scrollbar-width:none] 
                      [&::-webkit-scrollbar]:hidden"
            style={{ overflowX: "auto" }}
          >
            {suggestedBooks.map((b) => (
              <div
                key={b.id}
                className="flex h-[260px] w-[150px] min-w-[150px] flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                <div className="h-[180px] w-full overflow-hidden rounded-lg">
                  <Image
                    src={b.cover}
                    alt={b.title}
                    width={150}
                    height={180}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="line-clamp-2 mt-2 text-center text-sm leading-tight">{b.title}</p>
              </div>
            ))}
          </div>

          {/* Nút phải */}
          <button
            type="button"
            onClick={() => scrollByStepLike("right")}
            disabled={!canNextLike}
            className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 shadow 
                        ring-1 ring-gray-200 bg-white/95
                        hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Xem tiếp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>

          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-gray-50 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 to-transparent" />
        </div>
      </div>

      {/* Sách được đọc nhiều nhất */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-2xl font-semibold tracking-wide text-gray-800">
            Sách được đọc nhiều nhất
          </h2>
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
          <button
            type="button"
            onClick={() => scrollByStepPopular("left")}
            disabled={!canPrevPopular}
            className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 shadow 
                        ring-1 ring-gray-200 bg-white/95
                        hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Xem trước"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          {/* Dải sách */}
          <div
            ref={popularRef}
            onScroll={updateArrowsPopular}
            className="flex gap-4 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth
                      [-ms-overflow-style:none] [scrollbar-width:none] 
                      [&::-webkit-scrollbar]:hidden"
            style={{ overflowX: "auto" }}
          >
            {popularBooks.map((b) => (
              <div
                key={b.id}
                className="flex h-[260px] w-[150px] min-w-[150px] flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                <div className="h-[180px] w-full overflow-hidden rounded-lg">
                  <Image
                    src={b.cover}
                    alt={b.title}
                    width={150}
                    height={180}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="line-clamp-2 mt-2 text-center text-sm leading-tight">{b.title}</p>
              </div>
            ))}
          </div>

          {/* Nút phải */}
          <button
            type="button"
            onClick={() => scrollByStepPopular("right")}
            disabled={!canNextPopular}
            className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 shadow 
                        ring-1 ring-gray-200 bg-white/95
                        hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Xem tiếp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>

          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-gray-50 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 to-transparent" />
        </div>
      </div>
      
      
      {/* Cùng tác giả */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-2xl font-semibold tracking-wide text-gray-800">
            Cùng tác giả
          </h2>
          <Link
            href="/books?filter=related"
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
          <button
            type="button"
            onClick={() => scrollByStepAuthor("left")}
            disabled={!canPrevAuthor}
            className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 shadow 
                        ring-1 ring-gray-200 bg-white/95
                        hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Xem trước"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          {/* Dải sách */}
          <div
            ref={authorRef}
            onScroll={updateArrowsAuthor}
            className="flex gap-4 overflow-x-auto pb-3 pr-2 pl-10 md:pl-12 md:pr-12 scroll-smooth
                      [-ms-overflow-style:none] [scrollbar-width:none] 
                      [&::-webkit-scrollbar]:hidden"
            style={{ overflowX: "auto" }}
          >
            {relatedBooks.map((b) => (
              <div
                key={b.id}
                className="flex h-[260px] w-[150px] min-w-[150px] flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                <div className="h-[180px] w-full overflow-hidden rounded-lg">
                  <Image
                    src={b.cover}
                    alt={b.title}
                    width={150}
                    height={180}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="line-clamp-2 mt-2 text-center text-sm leading-tight">{b.title}</p>
              </div>
            ))}
          </div>

          {/* Nút phải */}
          <button
            type="button"
            onClick={() => scrollByStepAuthor("right")}
            disabled={!canNextAuthor}
            className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 shadow 
                        ring-1 ring-gray-200 bg-white/95
                        hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Xem tiếp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>

          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-gray-50 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 to-transparent" />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-gray-500">
        © 2025 BookStore - Mua & Thuê Sách Trực Tuyến
      </footer>
    </div>
    </main>
  );
}
