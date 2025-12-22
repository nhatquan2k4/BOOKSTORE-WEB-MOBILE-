"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { categoryService } from "@/services";
import type { CategoryDto } from "@/types/dtos";

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name">("name");
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoryService.getCategories(1, 100); // Fetch all categories
        setCategories(response?.items || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    return a.name.localeCompare(b.name);
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
            Khám phá {sortedCategories.length} danh mục sách đa dạng
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
                onChange={(e) => setSortBy(e.target.value as "name")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sắp xếp theo tên A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden h-64">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6 space-y-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCategories.map((cat, index) => {
              // Use index for stable color rotation
              const colorClasses = [
                "from-blue-500 to-cyan-500",
                "from-purple-500 to-pink-500",
                "from-orange-500 to-red-500",
                "from-green-500 to-teal-500",
                "from-indigo-500 to-purple-500",
                "from-pink-500 to-rose-500",
                "from-yellow-500 to-orange-500",
                "from-cyan-500 to-blue-500",
              ];
              const colorClass = colorClasses[index % colorClasses.length];

              // Fallback images based on category name (UI-only enhancement)
              const catName = cat.name || "";
              const categoryImages: Record<string, string> = {
                "lập trình": "/image/lap_trinh.jpg",
                "programming": "/image/lap_trinh.jpg",
                "kinh doanh": "/image/kinh_doanh.jpg",
                "business": "/image/kinh_doanh.jpg",
                "thiết kế": "/image/thiet_ke.jpg",
                "design": "/image/thiet_ke.jpg",
                "khoa học": "/image/khoa_hoc.png",
                "science": "/image/khoa_hoc.png",
                "văn học": "/image/van_hoc.jpg",
                "literature": "/image/van_hoc.jpg",
                "kỹ năng sống": "/image/ky_nang_song.jpg",
                "life skills": "/image/ky_nang_song.jpg",
                "thiếu nhi": "/image/thieu_nhi.jpg",
                "children": "/image/thieu_nhi.jpg",
                "ngoại ngữ": "/image/ngoai_ngu.jpg",
                "foreign languages": "/image/ngoai_ngu.jpg",
              };
              const catImage = categoryImages[catName.toLowerCase()] || "/image/anh.png";

              return (
                <Link key={cat.id} href={`/categories/${cat.id}`}>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group h-full">
                  {/* Cover Image */}
                  <div className={`relative h-48 bg-gradient-to-br ${colorClass} overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <div className="relative h-full flex items-center justify-center p-6">
                      <Image
                        src={catImage}
                        alt={cat.name}
                        width={200}
                        height={200}
                        className="object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                    </div>

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
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {cat.description || "Khám phá các đầu sách trong danh mục này"}
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
              );
            })}
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
      </div>
    </main>
  );
}
