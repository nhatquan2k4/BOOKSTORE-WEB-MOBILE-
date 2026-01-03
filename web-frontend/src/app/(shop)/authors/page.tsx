"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { authorService } from "@/services";
import type { AuthorDto } from "@/types/dtos";
import { Pagination } from "@/components/ui/Pagination";
import { normalizeImageUrl } from "@/lib/imageUtils";

// --- PLACEHOLDER ---
const NoAvatarPlaceholder = () => (
  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400 border border-gray-300">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  </div>
);

// Type cho UI
type Author = {
  id: string;
  name: string;
  avatar: string | null;
  bookCount: number;
  followers: number;
  bio: string;
  categories: string[];
};

const formatNumber = (num: number) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export default function AuthorsPage() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12; 

  // Fetch authors from API
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true);
        // Gọi API lấy danh sách tác giả
        const response = await authorService.getAuthors(currentPage, pageSize);
        
        if (response && response.items) {
          const transformedAuthors: Author[] = response.items.map((author: AuthorDto) => ({
            id: author.id,
            name: author.name,
            // Xử lý ảnh avatar
            avatar: normalizeImageUrl(author.avartarUrl), 
            bookCount: author.bookCount || 0,
            followers: 0, // Backend chưa có field này -> Default 0
            bio: `Tác giả nổi bật của cửa hàng`,
            categories: ["Văn học", "Kinh tế"], // Backend chưa trả về -> Mock tạm để hiện UI
          }));
          
          setAuthors(transformedAuthors);
          setTotalPages(response.totalPages || 1);
        } else {
          setAuthors([]);
        }
      } catch (error) {
        console.error("Error fetching authors:", error);
        setAuthors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, [currentPage]);

  // Client-side filtering (Nếu backend hỗ trợ filter category thì nên chuyển logic này vào API call)
  const filteredAuthors = authors.filter((author) => {
    const matchCategory =
      filterCategory === "all" ||
      filterCategory === "Tất cả" ||
      author.categories.includes(filterCategory);
    return matchCategory;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Tác giả nổi bật</h1>
          <p className="text-lg opacity-90">
            Khám phá các tác giả và tác phẩm của họ
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Tác giả</span>
        </nav>

        {/* Authors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredAuthors.map((author) => (
                <Link
                    key={author.id}
                    href={`/authors/${author.id}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6 group block h-full border border-transparent hover:border-blue-100"
                >
                    <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                        {author.avatar ? (
                            <Image
                                src={author.avatar}
                                alt={author.name}
                                fill
                                className="object-cover rounded-full group-hover:scale-105 transition border-2 border-gray-100"
                                unoptimized
                            />
                        ) : (
                            <NoAvatarPlaceholder />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 line-clamp-1">
                        {author.name}
                        </h3>
                    </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                    {author.bio}
                    </p>
                </Link>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    {/* Sử dụng component Pagination có sẵn hoặc nút đơn giản */}
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >Trước</Button>
                        <span className="flex items-center px-4 font-medium">Trang {currentPage} / {totalPages}</span>
                        <Button 
                            variant="outline" 
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >Sau</Button>
                    </div>
                </div>
            )}
          </>
        )}

        {!loading && filteredAuthors.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg">Không tìm thấy tác giả nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}