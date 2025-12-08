"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { authorService } from "@/services";
import type { AuthorDto } from "@/types/dtos";

type Author = {
  id: string;
  name: string;
  avatar: string;
  bookCount: number;
  followers: number;
  bio: string;
  categories: string[];
};

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

export default function AuthorsPage() {
  const [filterCategory, setFilterCategory] = useState("all");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch authors from API
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true);
        const response = await authorService.getAuthors(currentPage, 20);
        
        if (response.items && response.items.length > 0) {
          const transformedAuthors: Author[] = response.items.map((author: AuthorDto) => ({
            id: author.id,
            name: author.name,
            avatar: author.avartarUrl || "/image/anh.png",
            bookCount: author.bookCount || 0,
            followers: 0, // TODO: Add followers from backend
            bio: `Tác giả của ${author.bookCount} cuốn sách`, // TODO: Add bio from backend
            categories: [], // TODO: Add categories from backend
          }));
          setAuthors(transformedAuthors);
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

  const categories = ["Tất cả", "Kỹ năng sống", "Văn học", "Khoa học", "Kinh tế"];

  const filteredAuthors = authors.filter((author) => {
    const matchCategory =
      filterCategory === "all" ||
      filterCategory === "Tất cả" ||
      author.categories.includes(filterCategory);
    return matchCategory;
  });

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

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setFilterCategory(cat === "Tất cả" ? "all" : cat)}
                variant={(filterCategory === cat || (filterCategory === "all" && cat === "Tất cả")) ? "primary" : "outline"}
                size="sm"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuthors.map((author) => (
              <Link
              key={author.id}
              href={`/authors/${author.id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    className="object-cover rounded-full group-hover:scale-105 transition"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600">
                    {author.name}
                  </h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{author.bookCount} sách</span>
                    <span>{formatNumber(author.followers)} người theo dõi</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {author.bio}
              </p>

              <div className="flex flex-wrap gap-2">
                {author.categories.map((cat) => (
                  <Badge key={cat} variant="default" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
          </div>
        )}

        {!loading && filteredAuthors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy tác giả phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}
