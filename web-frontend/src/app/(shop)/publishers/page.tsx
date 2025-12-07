"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Mock data
const publishers = [
  {
    id: 1,
    name: "NXB Kim Đồng",
    slug: "nxb-kim-dong",
    logo: "https://via.placeholder.com/100",
    description: "Nhà xuất bản chuyên về sách thiếu nhi và văn học tuổi teen",
    bookCount: 1234,
    foundedYear: 1957,
    category: "Thiếu nhi"
  },
  {
    id: 2,
    name: "NXB Trẻ",
    slug: "nxb-tre",
    logo: "https://via.placeholder.com/100",
    description: "Xuất bản sách văn học, kỹ năng sống, kinh tế",
    bookCount: 2156,
    foundedYear: 1981,
    category: "Tổng hợp"
  },
  {
    id: 3,
    name: "NXB Văn học",
    slug: "nxb-van-hoc",
    logo: "https://via.placeholder.com/100",
    description: "Chuyên về văn học trong nước và dịch văn học thế giới",
    bookCount: 987,
    foundedYear: 1957,
    category: "Văn học"
  },
  {
    id: 4,
    name: "NXB Thế Giới",
    slug: "nxb-the-gioi",
    logo: "https://via.placeholder.com/100",
    description: "Xuất bản sách về khoa học, công nghệ, lịch sử thế giới",
    bookCount: 1567,
    foundedYear: 1957,
    category: "Khoa học"
  },
  {
    id: 5,
    name: "NXB Lao Động",
    slug: "nxb-lao-dong",
    logo: "https://via.placeholder.com/100",
    description: "Sách kỹ năng sống, kinh tế, quản trị",
    bookCount: 876,
    foundedYear: 1958,
    category: "Kinh tế"
  },
  {
    id: 6,
    name: "NXB Phụ Nữ",
    slug: "nxb-phu-nu",
    logo: "https://via.placeholder.com/100",
    description: "Sách về gia đình, làm đẹp, nuôi dạy con",
    bookCount: 654,
    foundedYear: 1957,
    category: "Gia đình"
  }
];

const categories = ["Tất cả", "Văn học", "Thiếu nhi", "Kinh tế", "Khoa học", "Gia đình", "Tổng hợp"];

export default function PublishersPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const filteredPublishers = publishers.filter(pub => {
    const matchesCategory = selectedCategory === "Tất cả" || pub.category === selectedCategory;
    return matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Nhà xuất bản</h1>
          <p className="text-lg opacity-90">
            Khám phá sách từ các nhà xuất bản uy tín
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Nhà xuất bản</span>
        </nav>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map(cat => (
            <Button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              variant={selectedCategory === cat ? "primary" : "outline"}
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Publishers Grid */}
        {filteredPublishers.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">Không tìm thấy nhà xuất bản phù hợp</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublishers.map(publisher => (
              <Link
                key={publisher.id}
                href={`/publishers/${publisher.slug}`}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition truncate">
                      {publisher.name}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                      {publisher.category}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {publisher.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>{publisher.bookCount.toLocaleString()} đầu sách</span>
                  </div>
                  <span>Từ {publisher.foundedYear}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm p-8 mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{publishers.length}+</div>
              <div className="text-gray-600">Nhà xuất bản</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {publishers.reduce((sum, p) => sum + p.bookCount, 0).toLocaleString()}+
              </div>
              <div className="text-gray-600">Đầu sách</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600">Chính hãng</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Hỗ trợ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
