// Home Page - Trang chủ
"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Chào mừng đến với BookStore
            </h1>
            <p className="text-xl mb-8">
              Khám phá hàng ngàn đầu sách từ các tác giả nổi tiếng.
              Mua sách giấy hoặc thuê eBook - trải nghiệm đọc không giới hạn!
            </p>
            <div className="flex gap-4">
              <Link
                href="/books"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Khám phá sách
              </Link>
              <Link
                href="/rental"
                className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Thuê eBook
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Danh mục nổi bật</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["Văn học", "Kinh tế", "Kỹ năng sống", "Thiếu nhi"].map((cat) => (
              <div
                key={cat}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              >
                <h3 className="font-semibold text-lg">{cat}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Sách nổi bật</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Link
                key={i}
                href={`/books/${i}`}
                className="group"
              >
                <div className="bg-gray-200 aspect-[3/4] rounded-lg mb-3 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 group-hover:scale-105 transition" />
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                  Tên sách {i}
                </h3>
                <p className="text-blue-600 font-bold">100.000₫</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* eBook Rental */}
      <section className="py-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Thuê eBook - Tiết kiệm hơn</h2>
          <p className="text-xl mb-8">
            Chỉ từ 10.000₫/tháng - Đọc không giới hạn
          </p>
          <Link
            href="/rental"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Xem ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
