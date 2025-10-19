// Trang chi tiết sách
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, use } from "react";

type Params = { id: string };

export default function BookDetailPage({ params }: { params: Promise<Params> }) {
  // Lấy id từ route (client component dùng experimental hook use())
  const { id } = use(params);

  const [activeTab, setActiveTab] = useState<"desc" | "review">("desc");
  const [descExpanded, setDescExpanded] = useState(false);

  // mock data (sau này bạn fetch từ API dựa trên id)
  const book = {
    id,
    title: "101 cách vượt qua dỗi hờn hàng xóm",
    author: "Đồng Vu",
    publisher: "NXB Trẻ",
    price: 100000,
    stock: 12,
    language: "Tiếng Việt",
    cover: "/image/anh.png",
    description: `Tống Thiên Thị luôn cảm thấy hàng xóm mới tới là người không dễ sống chung, bởi hắn không chỉ lạnh lùng mà lời nói ra cũng chẳng dễ lọt tai. Mãi cho đến một ngày cô bị hàng xóm chặn trên hành lang.

Đôi mắt của luật sư Ôn sáng quắc: "Trăm nhân ắt có quả, tôi chính là quả của em."

Tống Thiên Thị nhìn người đàn ông ăn mặc chỉnh tề trước mặt, đột nhiên thay đổi quan điểm về anh.

...

Cô cho rằng cô có thể yêu đương với luật sư nhưng kết hôn thì không thể, bởi về sau cãi nhau thì chắc chắn cô không thể thắng hắn, hơn nữa, có khi lúc ly hôn đối phương không cần thuê luật sư cũng có thể tiễn cô ra khỏi nhà ngay lập tức.

Nghe xong lý do cô cự tuyệt, luật sư Ôn bình thản: "Nếu em không thích thân phận luật sư thì tôi có thể đổi thành thân phận chồng em."`,
  };

  const relatedBooks = [
    { id: "r1", title: "Tôi thấy hoa vàng trên cỏ xanh", cover: "/image/anh.png" },
    { id: "r2", title: "Tháng năm rực rỡ", cover: "/image/anh.png" },
    { id: "r3", title: "Người lái đò sông Đà", cover: "/image/anh.png" },
  ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  // Cấu hình rút gọn mô tả (đổi con số nếu muốn)
  const DESC_LIMIT = 300;
  const isLongDesc = book.description.length > DESC_LIMIT;
  const shortDesc = isLongDesc ? book.description.substring(0, DESC_LIMIT) + "..." : book.description;

  return (
    <div className="container mx-auto px-6 py-10 text-slate-800 dark:text-slate-100">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-600">
          Trang chủ
        </Link>{" "}
        /{" "}
        <Link href="/books" className="hover:text-blue-600">
          Sách
        </Link>{" "}
        / <span className="font-medium text-slate-700">{book.title}</span>
      </nav>

      {/* Nội dung chính */}
      <div className="grid grid-cols-1 gap-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 lg:grid-cols-2">
        <div className="flex justify-center">
          <Image
            src={book.cover}
            alt={book.title}
            width={400}
            height={600}
            className="rounded-xl object-cover"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-semibold">{book.title}</h1>
          <p className="text-sm text-slate-500">Tác giả: {book.author}</p>
          <p className="text-sm text-slate-500">Nhà xuất bản: {book.publisher}</p>

          <div className="flex items-center gap-4">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(book.price)}</p>
            <p className="font-medium text-green-600">{book.stock > 0 ? "Còn hàng" : "Hết hàng"}</p>
          </div>

          <div className="mt-4 flex gap-3">
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Mua ngay
            </button>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              🛒 Thêm vào giỏ hàng
            </button>
            <button className="rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600">
              📖 Thuê e-book
            </button>
            <button className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50">
              ❤️ Yêu thích
            </button>
          </div>

          {/* Thông tin chi tiết */}
          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold">Thông tin chi tiết</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <strong>Ngôn ngữ:</strong> {book.language}
              </li>
              <li>
                <strong>Nhà xuất bản:</strong> {book.publisher}
              </li>
              <li>
                <strong>Tình trạng:</strong> {book.stock > 0 ? "Còn hàng" : "Hết hàng"}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs: Mô tả / Bình luận */}
      <div className="mt-10">
        <div className="mb-4 flex border-b">
          <button
            onClick={() => setActiveTab("desc")}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === "desc" ? "border-blue-600 text-blue-600" : "border-transparent"
            }`}
          >
            Mô tả sản phẩm
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === "review" ? "border-blue-600 text-blue-600" : "border-transparent"
            }`}
          >
            Đánh giá
          </button>
        </div>

        {/* MÔ TẢ (ẩn bớt + xem thêm) */}
        {activeTab === "desc" && (
          <div className="relative rounded-xl bg-white p-6 dark:bg-slate-900">
            <p className="whitespace-pre-line text-sm leading-relaxed">
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

        {/* ĐÁNH GIÁ */}
        {activeTab === "review" && (
          <div className="space-y-3 rounded-xl bg-white p-6 dark:bg-slate-900">
            <div className="rounded-lg border p-3">
              <p className="font-medium">Nguyễn Văn A</p>
              <p className="text-sm text-slate-500">Sách rất hay và ý nghĩa</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-medium">Trần Thị B</p>
              <p className="text-sm text-slate-500">Đóng gói cẩn thận, giao hàng nhanh</p>
            </div>
          </div>
        )}
      </div>

      {/* Sách liên quan */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Sách liên quan</h2>

        <div className="flex gap-4 overflow-x-auto pb-3">
          {relatedBooks.map((b) => (
            <div
              key={b.id}
              className="flex h-[260px] w-[150px] min-w-[150px] flex-col rounded-xl bg-white p-3 transition hover:shadow-md dark:bg-slate-900"
            >
              {/* Khung ảnh cố định */}
              <div className="h-[180px] w-full overflow-hidden rounded-lg">
                <Image
                  src={b.cover}
                  alt={b.title}
                  width={150}
                  height={180}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Tiêu đề: xuống dòng tối đa 2 dòng */}
              <p className="clamp-2 mt-2 text-center text-sm leading-tight">{b.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-400">
        © 2025 BookStore - Mua & Thuê Sách Trực Tuyến
      </footer>
    </div>
  );
}
