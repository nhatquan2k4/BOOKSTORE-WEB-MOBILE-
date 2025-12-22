'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { bookService } from '@/services';
import type { BookDetailDto } from '@/types/dtos';

/**
 * Hàm tính giá thuê dựa trên giá mua của sách
 * - 3 ngày: cố định 10.000đ
 * - Các gói khác: tính theo % giá sách
 * - Cuối cùng làm tròn lên đến 1.000đ cho đẹp
 */
const calculateRentalPrice = (purchasePrice: number, days: number): number => {
  // Gói 3 ngày: cố định
  if (days === 3) return 10_000;

  // Bảng % cho từng gói
  const percentages: { [key: number]: number } = {
    7: 0.05, // 5%
    15: 0.08, // 8%
    30: 0.12, // 12%
    60: 0.2, // 20%
    90: 0.25, // 25%
    180: 0.35, // 35%
    365: 0.5, // 50%
  };

  const percentage = percentages[days] || 0;
  const rawPrice = purchasePrice * percentage;

  // Làm tròn tới 1.000đ
  return Math.round(rawPrice / 1000) * 1000;
};

/**
 * Hàm tạo danh sách gói thuê dựa trên giá mua
 * - Giữ nguyên thứ tự, tên gói, flag "phổ biến" giống UI cũ
 * - Tự tính giá dựa trên calculateRentalPrice
 * - Tính "tiết kiệm" dựa trên gói 7 ngày làm chuẩn
 */
const generateRentalPlans = (purchasePrice: number) => {
  // Khung gói giống giao diện cũ
  const basePlans = [
    { days: 3, duration: '3 ngày', popular: false },
    { days: 7, duration: '7 ngày', popular: false },
    { days: 15, duration: '15 ngày', popular: false },
    { days: 30, duration: '30 ngày', popular: false },
    { days: 60, duration: '60 ngày', popular: false },
    { days: 90, duration: '90 ngày', popular: false },
    { days: 180, duration: '180 ngày', popular: true },
    { days: 365, duration: '1 năm (365 ngày)', popular: false },
  ];

  // Giá chuẩn để tính mức tiết kiệm: quy đổi gói 7 ngày thành giá /ngày rồi nhân lên
  const base7Price = calculateRentalPrice(purchasePrice, 7); // giá 7 ngày
  const basePerDay = base7Price / 7; // giá 1 ngày theo gói 7

  return basePlans.map((plan, index) => {
    const price = calculateRentalPrice(purchasePrice, plan.days);

    // Nếu gói dài ngày mà rẻ hơn nhiều so với quy đổi từ gói 7 ngày thì hiện "tiết kiệm"
    // discount = 1 - (giá thật / giá quy đổi)
    let discount = 0;
    if (plan.days > 3 && basePerDay > 0) {
      const theoreticalPrice = basePerDay * plan.days;
      discount = Math.round((1 - price / theoreticalPrice) * 100);
      if (discount < 0) discount = 0; // không để âm
    }

    return {
      id: index + 1,
      duration: plan.duration,
      days: plan.days,
      price,
      discount,
      popular: plan.popular,
    };
  });
};

export default function RentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [book, setBook] = useState<BookDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch book detail from API
  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true);
        const bookData = await bookService.getBookById(id);
        setBook(bookData);
      } catch (error) {
        console.error("Error fetching book detail:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchBookDetail();
  }, [id]);

  // Transform BookDetailDto to display format
  const bookData = book ? {
    id: book.id,
    title: book.title,
    author: book.authors?.[0]?.name || "Tác giả không xác định",
    publisher: book.publisher?.name || "NXB",
    publishYear: book.publicationYear,
    pages: book.pageCount,
    language: book.language,
    format: 'ePub, PDF, Mobi',
    size: '2.5 MB',
    isbn: book.isbn,
    category: book.categories?.[0]?.name || "Chưa phân loại",
    rating: 4.5,
    reviews: 0,
    cover: book.images?.[0]?.imageUrl || '/image/anh.png',
    description: book.description || "Chưa có mô tả",
    features: [
      'Đọc offline không cần kết nối internet',
      'Đồng bộ trên nhiều thiết bị',
      'Tìm kiếm và highlight văn bản',
      'Đánh dấu trang và ghi chú',
      'Chế độ đọc ban đêm',
      'Điều chỉnh font chữ và cỡ chữ',
    ],
    purchasePrice: book.metadata?.find(m => m.key === "currentPrice")?.value ? parseInt(book.metadata.find(m => m.key === "currentPrice")!.value) : 350_000,
  } : null;

  // Tính gói thuê từ giá mua
  const purchasePrice = bookData?.purchasePrice || 350_000;
  const rentalPlans = useMemo(
    () => generateRentalPlans(purchasePrice),
    [purchasePrice]
  );

  // chọn mặc định gói thứ 2 (7 ngày) cho hợp lý
  const [selectedPlan, setSelectedPlan] = useState<number>(rentalPlans[1]?.id ?? rentalPlans[0]?.id ?? 1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');

  const currentPlan = rentalPlans.find((p) => p.id === selectedPlan);

  const handleRentNow = () => {
    if (!bookData) return;
    // Chuyển thẳng đến trang QR để thanh toán thuê eBook
    const queryParams = new URLSearchParams({
      type: 'rent',
      bookId: String(params.id ?? bookData.id),
      bookTitle: bookData.title,
      bookCover: bookData.cover,
      planId: String(selectedPlan),
      duration: String(currentPlan?.duration ?? 0),
      price: String(currentPlan?.price ?? 0),
    });
    router.push(`/payment/qr?${queryParams.toString()}`);
  };

  const handleBuyNow = () => {
    if (!bookData) return;
    router.push(`/checkout?type=buy&bookId=${params.id ?? bookData.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sách</h2>
          <Link href="/rent" className="text-blue-600 hover:underline">Quay lại trang thuê sách</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600 transition">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/rent" className="hover:text-blue-600 transition">
            Thuê eBook
          </Link>
          <span>/</span>
          <span className="text-gray-900">{bookData.title}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Book Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Book Cover */}
                <div>
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
                    <Image src={bookData.cover} alt={bookData.title} fill className="object-cover" />
                    <div className="absolute top-4 left-4">
                      <Badge variant="success" className="bg-green-500 text-white">
                        eBook
                      </Badge>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 font-bold text-gray-900">{bookData.rating}</span>
                      </div>
                      <p className="text-xs text-gray-600">{bookData.reviews} đánh giá</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="font-bold text-gray-900 mb-1">{bookData.pages}</div>
                      <p className="text-xs text-gray-600">Trang</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-bold text-gray-900 mb-1">{bookData.size}</div>
                      <p className="text-xs text-gray-600">Dung lượng</p>
                    </div>
                  </div>
                </div>

                {/* Book Details */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{bookData.title}</h1>

                  <div className="space-y-2 mb-6">
                    <p className="text-gray-700">
                      <span className="font-semibold">Tác giả:</span>{' '}
                      <Link href={`/author/${bookData.author}`} className="text-blue-600 hover:underline">
                        {bookData.author}
                      </Link>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Nhà xuất bản:</span> {bookData.publisher}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Năm xuất bản:</span> {bookData.publishYear}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Ngôn ngữ:</span> {bookData.language}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Định dạng:</span> {bookData.format}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">ISBN:</span> {bookData.isbn}
                    </p>
                  </div>

                  {/* Category Badge */}
                  <div className="mb-6">
                    <Badge variant="default" className="bg-blue-100 text-blue-700">
                      {bookData.category}
                    </Badge>
                  </div>

                  {/* Features */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Tính năng nổi bật
                    </h3>
                    <ul className="space-y-2">
                      {bookData.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <svg
                            className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-8">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`relative py-4 text-sm font-medium transition-colors ${
                      activeTab === 'description' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mô tả
                    {activeTab === 'description' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`relative py-4 text-sm font-medium transition-colors ${
                      activeTab === 'details' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Chi tiết
                    {activeTab === 'details' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`relative py-4 text-sm font-medium transition-colors ${
                      activeTab === 'reviews' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Đánh giá ({bookData.reviews})
                    {activeTab === 'reviews' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="prose max-w-none">
                {activeTab === 'description' && (
                  <div className="text-gray-700 leading-relaxed">
                    <p>{bookData.description}</p>
                  </div>
                )}
                {activeTab === 'details' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Tác giả</p>
                      <p className="font-semibold text-gray-900">{bookData.author}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Nhà xuất bản</p>
                      <p className="font-semibold text-gray-900">{bookData.publisher}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Năm xuất bản</p>
                      <p className="font-semibold text-gray-900">{bookData.publishYear}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Số trang</p>
                      <p className="font-semibold text-gray-900">{bookData.pages}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Ngôn ngữ</p>
                      <p className="font-semibold text-gray-900">{bookData.language}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Định dạng</p>
                      <p className="font-semibold text-gray-900">{bookData.format}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Dung lượng</p>
                      <p className="font-semibold text-gray-900">{bookData.size}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">ISBN</p>
                      <p className="font-semibold text-gray-900">{bookData.isbn}</p>
                    </div>
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đánh giá</h3>
                    <p className="text-gray-600">Hãy là người đầu tiên đánh giá sách này</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Rental Plans */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Chọn gói thuê</h2>

                  {/* Rental Plans */}
                  <div className="space-y-3 mb-6">
                    {rentalPlans.map((plan) => (
                      <Button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        variant={selectedPlan === plan.id ? 'primary' : 'outline'}
                        size="md"
                        className={`w-full p-4 ${
                          selectedPlan === plan.id
                            ? 'bg-blue-50 shadow-md'
                            : ''
                        } relative`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-2 -right-2">
                            <Badge variant="danger" className="text-xs">
                              Phổ biến
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">{plan.duration}</div>
                            {plan.discount > 0 && (
                              <div className="text-xs text-green-600 font-medium">
                                Tiết kiệm {plan.discount}%
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-blue-600">
                              {plan.price.toLocaleString('vi-VN')}₫
                            </div>
                            {/* Nếu muốn hiển thị giá gốc có thể bật thêm đoạn này */}
                            {/* {plan.discount > 0 && (
                              <div className="text-xs text-gray-500 line-through">
                                {(plan.price / (1 - plan.discount / 100)).toLocaleString('vi-VN')}₫
                              </div>
                            )} */}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleRentNow}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
                    >
                      Thuê ngay - {currentPlan?.price.toLocaleString('vi-VN')}₫
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">hoặc</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleBuyNow}
                      variant="outline"
                      className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold py-3"
                    >
                      Mua sở hữu - {bookData.purchasePrice.toLocaleString('vi-VN')}₫
                    </Button>
                  </div>

                  {/* Benefits */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Quyền lợi khi thuê:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Đọc không giới hạn trong thời gian thuê
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Đồng bộ trên tất cả thiết bị
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Gia hạn dễ dàng
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Hỗ trợ 24/7
                      </li>
                    </ul>
                  </div>

                  {/* Note */}
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex gap-2">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-xs text-yellow-800">
                        Sau khi hết hạn thuê, bạn sẽ không còn quyền truy cập sách. Có thể gia hạn hoặc mua sở hữu bất kỳ
                        lúc nào.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
