"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const categories = [
  {
    id: 1,
    name: "Lập trình",
    count: 1234,
    color: "from-blue-500 to-cyan-500",
    image: "/image/lap_trinh.jpg",
    href: "/books?category=Lập trình",
    description: "Khám phá thế giới lập trình từ cơ bản đến nâng cao với hàng ngàn đầu sách chất lượng",
    icon: "code",
  },
  {
    id: 2,
    name: "Kinh doanh",
    count: 856,
    color: "from-purple-500 to-pink-500",
    image: "/image/kinh_doanh.jpg",
    href: "/books?category=Kinh doanh",
    description: "Nâng cao kỹ năng kinh doanh và quản trị doanh nghiệp hiệu quả",
    icon: "briefcase",
  },
  {
    id: 3,
    name: "Thiết kế",
    count: 645,
    color: "from-orange-500 to-red-500",
    image: "/image/thiet_ke.jpg",
    href: "/books?category=Thiết kế",
    description: "Phát triển tư duy sáng tạo và kỹ năng thiết kế chuyên nghiệp",
    icon: "palette",
  },
  {
    id: 4,
    name: "Khoa học",
    count: 432,
    color: "from-green-500 to-teal-500",
    image: "/image/khoa_hoc.png",
    href: "/books?category=Khoa học",
    description: "Khám phá những kiến thức khoa học hấp dẫn và bổ ích",
    icon: "atom",
  },
  {
    id: 5,
    name: "Văn học",
    count: 1567,
    color: "from-indigo-500 to-purple-500",
    image: "/image/van_hoc.jpg",
    href: "/books?category=Văn học",
    description: "Đắm chìm trong thế giới văn chương đa dạng và phong phú",
    icon: "book-open",
  },
  {
    id: 6,
    name: "Kỹ năng sống",
    count: 892,
    color: "from-pink-500 to-rose-500",
    image: "/image/ky_nang_song.jpg",
    href: "/books?category=Kỹ năng sống",
    description: "Nâng cao chất lượng cuộc sống với các kỹ năng thiết yếu",
    icon: "lightbulb",
  },
  {
    id: 7,
    name: "Tâm lý học",
    count: 567,
    color: "from-teal-500 to-emerald-500",
    image: "/image/anh.png",
    href: "/books?category=Tâm lý học",
    description: "Hiểu rõ bản thân và con người qua góc nhìn tâm lý học",
    icon: "brain",
  },
  {
    id: 8,
    name: "Kinh tế",
    count: 734,
    color: "from-yellow-500 to-orange-500",
    image: "/image/anh.png",
    href: "/books?category=Kinh tế",
    description: "Nắm bắt xu hướng kinh tế và tài chính thế giới",
    icon: "trending-up",
  },
  {
    id: 9,
    name: "Lịch sử",
    count: 423,
    color: "from-amber-500 to-red-500",
    image: "/image/anh.png",
    href: "/books?category=Lịch sử",
    description: "Tìm hiểu quá khứ để hiểu rõ hiện tại và tương lai",
    icon: "clock",
  },
  {
    id: 10,
    name: "Thiếu nhi",
    count: 982,
    color: "from-cyan-500 to-blue-500",
    image: "/image/anh.png",
    href: "/books?category=Thiếu nhi",
    description: "Nuôi dưỡng tâm hồn trẻ thơ với những câu chuyện kỳ diệu",
    icon: "star",
  },
  {
    id: 11,
    name: "Truyện tranh",
    count: 1245,
    color: "from-rose-500 to-pink-500",
    image: "/image/anh.png",
    href: "/books?category=Truyện tranh",
    description: "Giải trí với những tác phẩm truyện tranh hấp dẫn",
    icon: "image",
  },
  {
    id: 12,
    name: "Nấu ăn",
    count: 345,
    color: "from-red-500 to-orange-500",
    image: "/image/anh.png",
    href: "/books?category=Nấu ăn",
    description: "Khám phá nghệ thuật ẩm thực và công thức nấu ăn đa dạng",
    icon: "utensils",
  },
];

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "count">("name");

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return b.count - a.count;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>{" "}
          / <span className="font-medium text-gray-800">Danh mục</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Danh Mục Nổi Bật</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Khám phá {sortedCategories.length} danh mục sách đa dạng với hơn{" "}
            {categories.reduce((sum, cat) => sum + cat.count, 0).toLocaleString()} đầu sách
          </p>
        </div>

        {/* Search & Sort */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort-by" className="sr-only">
                Sắp xếp
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "count")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sắp xếp theo tên A-Z</option>
                <option value="count">Sắp xếp theo số lượng sách</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <rect x="3" y="3" width="7" height="9" rx="1" />
                  <rect x="14" y="3" width="7" height="5" rx="1" />
                  <rect x="14" y="12" width="7" height="9" rx="1" />
                  <rect x="3" y="15" width="7" height="6" rx="1" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                <p className="text-sm text-gray-600">Danh mục</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.reduce((sum, cat) => sum + cat.count, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Tổng sách</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600"
                >
                  <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...categories.map((c) => c.count)).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Danh mục lớn nhất</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-600"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(categories.reduce((sum, cat) => sum + cat.count, 0) / categories.length)
                    .toFixed(0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">TB sách/danh mục</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {sortedCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCategories.map((cat) => (
              <Link key={cat.id} href={cat.href}>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group h-full">
                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-40 group-hover:opacity-30 transition-opacity`}
                    ></div>
                    <div className="absolute inset-0 bg-black/20"></div>

                    {/* Icon */}
                    <div className="absolute top-4 right-4">
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white drop-shadow-md"
                        >
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                        </svg>
                      </div>
                    </div>

                    {/* Count Badge */}
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-white/95 text-gray-900 font-bold text-sm shadow-lg">
                        {cat.count.toLocaleString()} sách
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {cat.description}
                    </p>

                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Khám phá ngay</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-1 group-hover:translate-x-1 transition-transform"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy danh mục
            </h3>
            <p className="text-gray-600 mb-6">
              Không có danh mục nào phù hợp với từ khóa tìm kiếm của bạn.
            </p>
            <Button onClick={() => setSearchQuery("")} variant="primary" size="md">
              Xóa tìm kiếm
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Không tìm thấy danh mục bạn cần?</h2>
          <p className="text-white/90 mb-6">
            Khám phá tất cả các đầu sách trong cửa hàng của chúng tôi
          </p>
          <Link href="/books">
            <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Xem tất cả sách
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
