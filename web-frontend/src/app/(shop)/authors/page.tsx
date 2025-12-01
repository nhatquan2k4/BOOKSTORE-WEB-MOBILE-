"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

  // Mock data
  const MOCK_AUTHORS: Author[] = [
    {
      id: "1",
      name: "James Clear",
      avatar: "/image/anh.png",
      bookCount: 12,
      followers: 45600,
      bio: "Tác giả bestseller của Atomic Habits, chuyên gia về thói quen và năng suất",
      categories: ["Kỹ năng sống", "Tự phát triển"],
    },
    {
      id: "2",
      name: "Nguyễn Nhật Ánh",
      avatar: "/image/anh.png",
      bookCount: 28,
      followers: 128000,
      bio: "Nhà văn nổi tiếng Việt Nam với nhiều tác phẩm văn học tuổi teen đình đám",
      categories: ["Văn học", "Thiếu nhi"],
    },
    {
      id: "3",
      name: "Yuval Noah Harari",
      avatar: "/image/anh.png",
      bookCount: 8,
      followers: 89000,
      bio: "Sử gia và triết gia người Israel, tác giả của Sapiens và Homo Deus",
      categories: ["Khoa học", "Lịch sử"],
    },
    {
      id: "4",
      name: "Dale Carnegie",
      avatar: "/image/anh.png",
      bookCount: 15,
      followers: 156000,
      bio: "Nhà văn và diễn giả người Mỹ, nổi tiếng với Đắc Nhân Tâm",
      categories: ["Kỹ năng sống", "Kinh doanh"],
    },
  ];

  const categories = ["Tất cả", "Kỹ năng sống", "Văn học", "Khoa học", "Kinh tế"];

  const filteredAuthors = MOCK_AUTHORS.filter((author) => {
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

        {filteredAuthors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy tác giả phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}
