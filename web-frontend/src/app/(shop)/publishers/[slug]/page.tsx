"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

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
  },
  "nxb-tre": {
    id: 2,
    name: "NXB Trẻ",
    slug: "nxb-tre",
    logo: "",
    cover: "",
    description: "Nhà xuất bản Trẻ là một trong những nhà xuất bản uy tín hàng đầu tại Việt Nam, chuyên xuất bản sách văn học, kinh tế, và phát triển bản thân. Được thành lập năm 1981, NXB Trẻ đã xuất bản hàng nghìn đầu sách chất lượng cao.",
    foundedYear: 1981,
    category: "Văn học - Kinh tế",
    bookCount: 2456,
    followers: 67890,
    address: "161B Lý Chính Thắng, Q.3, TP.HCM",
    phone: "028 3930 2090",
    email: "info@nxbtre.com.vn",
    website: "https://nxbtre.com.vn",
    achievements: [
      "Giải thưởng Sách hay năm 2022",
      "Top 5 NXB lớn nhất Việt Nam",
      "Hơn 40 năm kinh nghiệm"
    ],
    specialties: ["Văn học", "Kinh tế", "Phát triển bản thân", "Tiểu thuyết"]
  },
  "nxb-lao-dong": {
    id: 3,
    name: "NXB Lao Động",
    slug: "nxb-lao-dong",
    logo: "",
    cover: "",
    description: "Nhà xuất bản Lao Động là đơn vị xuất bản sách chuyên nghiệp với nhiều đầu sách về kinh tế, quản trị, kỹ năng sống và văn học. Với phương châm 'Tri thức là sức mạnh', chúng tôi cam kết mang đến những cuốn sách giá trị cho độc giả.",
    foundedYear: 1961,
    category: "Kinh tế - Kỹ năng",
    bookCount: 1876,
    followers: 52340,
    address: "175 Giảng Võ, Đống Đa, Hà Nội",
    phone: "024 3851 3380",
    email: "info@nxblaodong.com.vn",
    website: "https://nxblaodong.com.vn",
    achievements: [
      "Giải A Giải thưởng Sách Quốc gia",
      "Nhà xuất bản tiêu biểu 2021",
      "Hơn 60 năm phát triển"
    ],
    specialties: ["Kinh tế", "Quản trị", "Kỹ năng sống", "Tâm lý học"]
  },
  "nxb-van-hoc": {
    id: 4,
    name: "NXB Văn Học",
    slug: "nxb-van-hoc",
    logo: "",
    cover: "",
    description: "Nhà xuất bản Văn học là cơ quan xuất bản chuyên sâu về văn học thuộc Hội Nhà văn Việt Nam. Chúng tôi tự hào là đơn vị xuất bản các tác phẩm văn học kinh điển và đương đại của các nhà văn trong và ngoài nước.",
    foundedYear: 1957,
    category: "Văn học",
    bookCount: 3210,
    followers: 78900,
    address: "18 Nguyễn Trường Tộ, Ba Đình, Hà Nội",
    phone: "024 3733 4645",
    email: "info@nxbvanhoc.com.vn",
    website: "https://nxbvanhoc.com.vn",
    achievements: [
      "Giải thưởng Hồ Chí Minh về văn học nghệ thuật",
      "Nhà xuất bản văn học hàng đầu VN",
      "Hơn 65 năm hoạt động"
    ],
    specialties: ["Văn học Việt Nam", "Văn học nước ngoài", "Thơ", "Truyện ngắn"]
  },
  "nxb-thanh-nien": {
    id: 5,
    name: "NXB Thanh Niên",
    slug: "nxb-thanh-nien",
    logo: "",
    cover: "",
    description: "Nhà xuất bản Thanh Niên chuyên xuất bản các ấn phẩm hướng đến giới trẻ với nội dung đa dạng từ văn học, kỹ năng sống đến giải trí. Chúng tôi mong muốn đồng hành cùng thế hệ trẻ Việt Nam trong hành trình phát triển toàn diện.",
    foundedYear: 1976,
    category: "Thanh thiếu niên",
    bookCount: 1650,
    followers: 43210,
    address: "64B Nguyễn Thị Minh Khai, Q.1, TP.HCM",
    phone: "028 3822 0804",
    email: "info@nxbthanhnien.vn",
    website: "https://nxbthanhnien.vn",
    achievements: [
      "Top 10 NXB uy tín",
      "Giải thưởng Sách hay dành cho tuổi teen",
      "Gần 50 năm đồng hành cùng giới trẻ"
    ],
    specialties: ["Văn học tuổi teen", "Kỹ năng sống", "Light novel", "Manga"]
  },
  "nxb-chinh-tri-quoc-gia": {
    id: 6,
    name: "NXB Chính Trị Quốc Gia Sự Thật",
    slug: "nxb-chinh-tri-quoc-gia",
    logo: "",
    cover: "",
    description: "Nhà xuất bản Chính trị quốc gia Sự thật là nhà xuất bản hàng đầu về sách chính trị, lý luận, lịch sử và khoa học xã hội. Chúng tôi xuất bản các tác phẩm có giá trị lý luận và thực tiễn cao phục vụ sự nghiệp xây dựng và phát triển đất nước.",
    foundedYear: 1945,
    category: "Chính trị - Lịch sử",
    bookCount: 5430,
    followers: 92100,
    address: "7/129 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
    phone: "024 3942 0426",
    email: "info@nxbctqg.org.vn",
    website: "https://nxbctqg.org.vn",
    achievements: [
      "Giải thưởng Sách Quốc gia (nhiều lần)",
      "Nhà xuất bản hàng đầu về sách chính trị",
      "Gần 80 năm lịch sử"
    ],
    specialties: ["Sách chính trị", "Lý luận", "Lịch sử", "Hồi ký"]
  },
  "nxb-phu-nu": {
    id: 7,
    name: "NXB Phụ Nữ Việt Nam",
    slug: "nxb-phu-nu",
    logo: "",
    cover: "",
    description: "Nhà xuất bản Phụ nữ Việt Nam chuyên xuất bản các ấn phẩm dành cho phụ nữ và gia đình với nội dung phong phú về nuôi dạy con, chăm sóc sức khỏe, làm đẹp, nấu ăn và văn học. Chúng tôi đồng hành cùng phụ nữ Việt trong cuộc sống hiện đại.",
    foundedYear: 1960,
    category: "Gia đình - Phụ nữ",
    bookCount: 1980,
    followers: 56780,
    address: "39 Hàng Chuối, Hai Bà Trưng, Hà Nội",
    phone: "024 3971 3145",
    email: "info@nxbphunu.com.vn",
    website: "https://nxbphunu.com.vn",
    achievements: [
      "Nhà xuất bản dành cho phụ nữ hàng đầu",
      "Giải thưởng Sách hay về gia đình",
      "Hơn 60 năm hoạt động"
    ],
    specialties: ["Nuôi dạy con", "Chăm sóc sức khỏe", "Nấu ăn", "Làm đẹp"]
  },
  "nxb-hoi-nha-van": {
    id: 8,
    name: "NXB Hội Nhà Văn",
    slug: "nxb-hoi-nha-van",
    logo: "",
    cover: "",
    description: "Nhà xuất bản Hội Nhà văn là cơ quan xuất bản trực thuộc Hội Nhà văn Việt Nam, chuyên xuất bản các tác phẩm văn học nghệ thuật của các hội viên và văn nghệ sĩ trong nước. Chúng tôi đề cao giá trị nghệ thuật và tính nhân văn trong từng tác phẩm.",
    foundedYear: 1957,
    category: "Văn học nghệ thuật",
    bookCount: 2890,
    followers: 64320,
    address: "65 Nguyễn Du, Hai Bà Trưng, Hà Nội",
    phone: "024 3943 1008",
    email: "info@nxbhoinhavan.vn",
    website: "https://nxbhoinhavan.vn",
    achievements: [
      "Nhiều tác phẩm đạt giải thưởng văn học",
      "Nhà xuất bản uy tín về văn học",
      "Hơn 65 năm phát triển"
    ],
    specialties: ["Văn học đương đại", "Thơ ca", "Tiểu luận", "Hồi ký văn học"]
  }
};

const mockBooks = [
  { id: "1", title: "Thần Đồng Đất Việt", author: "Nhiều tác giả", price: 89000, originalPrice: 110000, cover: "/image/anh.png", rating: 4.8, reviewCount: 234, stock: 50 },
  { id: "2", title: "Doraemon Tập 1", author: "Fujiko F Fujio", price: 25000, originalPrice: 30000, cover: "/image/anh.png", rating: 4.9, reviewCount: 567, stock: 120 },
  { id: "3", title: "Thám Tử Lừng Danh Conan", author: "Aoyama Gosho", price: 25000, cover: "/image/anh.png", rating: 4.7, reviewCount: 432, stock: 95 },
  { id: "4", title: "Harry Potter và Hòn Đá Phù Thủy", author: "J.K. Rowling", price: 165000, originalPrice: 200000, cover: "/image/anh.png", rating: 5.0, reviewCount: 1234, stock: 80 },
  { id: "5", title: "Nhật Ký Chú Bé Nhút Nhát", author: "Jeff Kinney", price: 79000, originalPrice: 95000, cover: "/image/anh.png", rating: 4.6, reviewCount: 321, stock: 65 },
  { id: "6", title: "Điều Kỳ Diệu Của Tiệm Tạp Hóa", author: "Higashino Keigo", price: 125000, cover: "/image/anh.png", rating: 4.8, reviewCount: 678, stock: 45 },
  { id: "7", title: "Dế Mèn Phiêu Lưu Ký", author: "Tô Hoài", price: 68000, originalPrice: 85000, cover: "/image/anh.png", rating: 4.9, reviewCount: 890, stock: 110 },
  { id: "8", title: "Conan Tập 50", author: "Aoyama Gosho", price: 25000, cover: "/image/anh.png", rating: 4.8, reviewCount: 345, stock: 88 }
];

export default function PublisherDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [activeTab, setActiveTab] = useState<"books" | "info">("books");
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "price-asc" | "price-desc">("newest");
  const itemsPerPage = 8;
  
  const { slug } = use(params);
  const publisher = publishers[slug];

  const sortedBooks = [...mockBooks].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.reviewCount - a.reviewCount;
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = sortedBooks.slice(startIndex, endIndex);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscount = (original: number, current: number) => {
    if (original <= 0 || current <= 0 || current >= original) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <div className="border-b flex gap-8 px-6">
            <button
              onClick={() => setActiveTab("books")}
              className={`relative py-4 text-sm font-medium transition-colors ${
                activeTab === "books" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sách xuất bản
              {activeTab === "books" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`relative py-4 text-sm font-medium transition-colors ${
                activeTab === "info" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Thông tin
              {activeTab === "info" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "books" ? (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold">
                    Sách xuất bản ({sortedBooks.length})
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Hiển thị <span className="font-semibold">{startIndex + 1}</span> -{" "}
                      <span className="font-semibold">{Math.min(endIndex, sortedBooks.length)}</span> /{" "}
                      <span className="font-semibold">{sortedBooks.length}</span>
                    </div>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "newest" | "popular" | "price-asc" | "price-desc")}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="popular">Bán chạy</option>
                      <option value="price-asc">Giá tăng dần</option>
                      <option value="price-desc">Giá giảm dần</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {paginatedBooks.map((book) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      className="flex flex-col rounded-xl bg-white p-3 shadow-sm transition hover:shadow-lg group"
                    >
                      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg mb-3">
                        <Image
                          src={book.cover}
                          alt={book.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {book.stock < 50 && (
                          <div className="absolute top-2 left-2">
                            <Badge className="text-xs bg-red-500 text-white font-bold">
                              Sắp hết
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-600 font-medium">{book.author}</p>

                        <div className="flex items-center gap-1 pt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-yellow-400"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span className="text-xs font-bold text-gray-700">{book.rating}</span>
                          <span className="text-xs text-gray-500">({book.reviewCount})</span>
                        </div>

                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <p className="text-blue-600 font-bold text-sm">{formatPrice(book.price)}</p>
                          {book.originalPrice && (
                            <>
                              <p className="text-xs text-gray-400 line-through">
                                {formatPrice(book.originalPrice)}
                              </p>
                              <Badge variant="danger" className="text-xs font-bold">
                                -{calculateDiscount(book.originalPrice, book.price)}%
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
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
