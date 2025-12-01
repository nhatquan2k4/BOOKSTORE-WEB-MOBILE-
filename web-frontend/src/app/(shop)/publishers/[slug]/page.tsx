"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface PublisherData {
  id: number;
  name: string;
  slug: string;
  logo: string;
  cover: string;
  description: string;
  foundedYear: number;
  category: string;
  bookCount: number;
  followers: number;
  address: string;
  phone: string;
  email: string;
  website: string;
  achievements: string[];
  specialties: string[];
}

// Mock data
const publishers: Record<string, PublisherData> = {
  "nxb-kim-dong": {
    id: 1,
    name: "NXB Kim Đồng",
    slug: "nxb-kim-dong",
    logo: "",
    cover: "",
    description: "Nhà xuất bản Kim Đồng là nhà xuất bản chuyên về sách thiếu nhi hàng đầu Việt Nam. Được thành lập từ năm 1957, chúng tôi đã đồng hành cùng nhiều thế hệ độc giả nhỏ tuổi với hàng nghìn đầu sách chất lượng.",
    foundedYear: 1957,
    category: "Thiếu nhi",
    bookCount: 1234,
    followers: 45678,
    address: "55 Quang Trung, Hai Bà Trưng, Hà Nội",
    phone: "024 3942 5280",
    email: "info@nxbkimdong.com.vn",
    website: "https://nxbkimdong.com.vn",
    achievements: [
      "Giải thưởng Xuất bản Việt Nam 2020",
      "Top 10 NXB uy tín nhất Việt Nam",
      "Hơn 60 năm hoạt động"
    ],
    specialties: ["Văn học thiếu nhi", "Truyện tranh", "Sách giáo khoa", "Sách kỹ năng sống"]
  }
};

const mockBooks = [
  { id: 1, title: "Thần Đồng Đất Việt", author: "Nhiều tác giả", price: 89000, image: "/image/anh.png", rating: 4.8 },
  { id: 2, title: "Doraemon Tập 1", author: "Fujiko F Fujio", price: 25000, image: "/image/anh.png", rating: 4.9 },
  { id: 3, title: "Thám Tử Lừng Danh Conan", author: "Aoyama Gosho", price: 25000, image: "/image/anh.png", rating: 4.7 },
  { id: 4, title: "Harry Potter và Hòn Đá Phù Thủy", author: "J.K. Rowling", price: 165000, image: "/image/anh.png", rating: 5.0 },
  { id: 5, title: "Nhật Ký Chú Bé Nhút Nhát", author: "Jeff Kinney", price: 79000, image: "/image/anh.png", rating: 4.6 },
  { id: 6, title: "Điều Kỳ Diệu Của Tiệm Tạp Hóa", author: "Higashino Keigo", price: 125000, image: "/image/anh.png", rating: 4.8 }
];

export default function PublisherDetailPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<"books" | "info">("books");
  const [isFollowing, setIsFollowing] = useState(false);

  const publisher = publishers[params.slug];

  if (!publisher) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-10"></div>
      </div>

      {/* Publisher Info */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md flex items-center justify-center flex-shrink-0">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{publisher.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {publisher.bookCount.toLocaleString()} đầu sách
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {publisher.followers.toLocaleString()} người theo dõi
                    </span>
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                      {publisher.category}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setIsFollowing(!isFollowing)}
                  variant={isFollowing ? "outline" : "primary"}
                  size="md"
                  className="whitespace-nowrap"
                >
                  {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </Button>
              </div>

              <p className="text-gray-700 mb-4">{publisher.description}</p>

              <div className="flex flex-wrap gap-2">
                {publisher.specialties.map((specialty: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b flex">
            <Button
              onClick={() => setActiveTab("books")}
              variant={activeTab === "books" ? "primary" : "outline"}
              size="md"
              className="relative px-8 py-4 rounded-none"
            >
              Sách xuất bản
              {activeTab === "books" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </Button>
            <Button
              onClick={() => setActiveTab("info")}
              variant={activeTab === "info" ? "primary" : "outline"}
              size="md"
              className="relative px-8 py-4 rounded-none"
            >
              Thông tin
              {activeTab === "info" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </Button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "books" ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Sách xuất bản ({mockBooks.length})</h2>
                  <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Mới nhất</option>
                    <option>Bán chạy</option>
                    <option>Giá thấp</option>
                    <option>Giá cao</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {mockBooks.map(book => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="group"
                    >
                      <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition">
                        <div className="relative aspect-[2/3]">
                          <img
                            src={book.image}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-blue-600">
                            {book.title}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2">{book.author}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-600 font-bold">{book.price.toLocaleString()}đ</span>
                            <div className="flex items-center gap-1 text-xs">
                              <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                              <span>{book.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Thông tin liên hệ</h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{publisher.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${publisher.phone}`} className="hover:text-blue-600">{publisher.phone}</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${publisher.email}`} className="hover:text-blue-600">{publisher.email}</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <a href={publisher.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        {publisher.website}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Thành tích & Giải thưởng</h3>
                  <ul className="space-y-2">
                    {publisher.achievements.map((achievement: string, index: number) => (
                      <li key={index} className="flex items-center gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* History */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Lịch sử hình thành</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Được thành lập từ năm {publisher.foundedYear}, {publisher.name} đã có hơn {new Date().getFullYear() - publisher.foundedYear} năm đồng hành cùng các thế hệ độc giả Việt Nam. Với sứ mệnh mang đến những cuốn sách chất lượng, chúng tôi không ngừng phát triển và hoàn thiện để xứng đáng với niềm tin của độc giả.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
