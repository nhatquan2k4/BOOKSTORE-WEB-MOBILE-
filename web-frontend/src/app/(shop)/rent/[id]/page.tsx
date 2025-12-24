'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { bookService, orderService } from '@/services';
import type { BookDetailDto } from '@/types/dtos';

// List tính năng tĩnh (giữ nguyên để hiển thị cho đẹp)
const STATIC_FEATURES = [
  'Đọc offline không cần kết nối internet',
  'Đồng bộ trên nhiều thiết bị',
  'Tìm kiếm và highlight văn bản',
  'Đánh dấu trang và ghi chú',
  'Chế độ đọc ban đêm',
  'Điều chỉnh font chữ và cỡ chữ',
];

export default function RentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // --- 1. STATE & API LOGIC (MỚI) ---
  const [book, setBook] = useState<BookDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); // State khi đang gọi API thuê
  
  const [selectedPlanId, setSelectedPlanId] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');

  // Load dữ liệu từ API
  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true);
        const data = await bookService.getBookById(id);
        setBook(data);

        // TODO: Tự động chọn gói Phổ biến hoặc gói đầu tiên từ API trả về
        // Tạm thời comment vì BookDetailDto không có rentalPlans
        // if (data?.rentalPlans && data.rentalPlans.length > 0) {
        //     const popularPlan = data.rentalPlans.find(p => p.isPopular);
        //     setSelectedPlanId(popularPlan ? popularPlan.id : data.rentalPlans[0].id);
        // }
      } catch (error) {
        console.error("Error fetching book detail:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchBookDetail();
  }, [id]);

  // --- 2. DATA MAPPING (CẦU NỐI GIỮA API VÀ UI CŨ) ---
  // Biến đổi dữ liệu API (BookDetailDto) thành format bookData mà UI cũ của bạn đang dùng
  const bookData = book ? {
    id: book.id,
    title: book.title,
    author: book.authors?.[0]?.name || "Tác giả không xác định",
    publisher: book.publisher?.name || "NXB",
    publishYear: book.publicationYear,
    pages: book.pageCount,
    language: book.language,
    format: book.bookFormat?.formatType || 'ePub, PDF',
    size: '2.5 MB', // Backend chưa có field này, để tạm
    isbn: book.isbn,
    category: book.categories?.[0]?.name || "Chưa phân loại",
    rating: book.averageRating || 4.5,
    reviews: book.totalReviews || 0,
    cover: book.images?.[0]?.imageUrl || '/image/anh.png',
    description: book.description || "Chưa có mô tả",
    features: STATIC_FEATURES,
    purchasePrice: book.currentPrice,
    // QUAN TRỌNG: TODO - Backend chưa trả về rentalPlans, để tạm array rỗng
    rentalPlans: [] as Array<{ 
      id: number; 
      name: string; 
      price: number; 
      duration: number; 
      isPopular?: boolean;
      durationLabel?: string;
      savingsPercentage?: number;
    }> // book.rentalPlans || []
  } : null;

  // Tìm gói đang chọn
  const currentPlan = bookData?.rentalPlans.find((p) => p.id === selectedPlanId);

  // --- 3. ACTIONS (LOGIC MỚI) ---
  
  const handleRentNow = async () => {
    if (!book || !currentPlan) return;

    try {
        setProcessing(true);
        // Gọi API tạo đơn hàng (Secure)
        const result = await orderService.createRentalOrder({
            bookId: book.id,
            days: currentPlan.duration
        });

        if (result.success) {
            // Chuyển hướng thanh toán với ID thật
            router.push(`/payment/qr?orderId=${result.orderId}&amount=${result.amount}`);
        } else {
            alert(result.message);
        }
    } catch (err: any) {
        alert(err.message || 'Lỗi tạo đơn hàng');
    } finally {
        setProcessing(false);
    }
  };

  const handleBuyNow = () => {
    if (!bookData) return;
    router.push(`/checkout?type=buy&bookId=${bookData.id}`);
  };

  // --- 4. RENDER UI (GIỮ NGUYÊN 100% HTML CŨ CỦA BẠN) ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Skeleton Loading giữ nguyên của bạn */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
            <div className="lg:col-span-2"><div className="bg-white rounded-xl shadow-sm p-6 md:p-8 h-96"></div></div>
            <div className="lg:col-span-1"><div className="bg-white rounded-xl shadow-lg p-6 h-64"></div></div>
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
          <Link href="/" className="hover:text-blue-600 transition">Trang chủ</Link>
          <span>/</span>
          <Link href="/rent" className="hover:text-blue-600 transition">Thuê eBook</Link>
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
                      <Badge variant="success" className="bg-green-500 text-white">eBook</Badge>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <span className="ml-1 font-bold text-gray-900">{bookData.rating} ⭐</span>
                      </div>
                      <p className="text-xs text-gray-600">{bookData.reviews} đánh giá</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="font-bold text-gray-900">{bookData.pages}</div>
                      <p className="text-xs text-gray-600">Trang</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-bold text-gray-900">{bookData.size}</div>
                      <p className="text-xs text-gray-600">Dung lượng</p>
                    </div>
                  </div>
                </div>

                {/* Book Details */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{bookData.title}</h1>

                  <div className="space-y-2 mb-6">
                    <p className="text-gray-700"><span className="font-semibold">Tác giả:</span> <Link href="#" className="text-blue-600 hover:underline">{bookData.author}</Link></p>
                    <p className="text-gray-700"><span className="font-semibold">Nhà xuất bản:</span> {bookData.publisher}</p>
                    <p className="text-gray-700"><span className="font-semibold">Năm xuất bản:</span> {bookData.publishYear}</p>
                    <p className="text-gray-700"><span className="font-semibold">Ngôn ngữ:</span> {bookData.language}</p>
                    <p className="text-gray-700"><span className="font-semibold">Định dạng:</span> {bookData.format}</p>
                    <p className="text-gray-700"><span className="font-semibold">ISBN:</span> {bookData.isbn}</p>
                  </div>

                  {/* Category Badge */}
                  <div className="mb-6">
                    <Badge variant="default" className="bg-blue-100 text-blue-700">{bookData.category}</Badge>
                  </div>

                  {/* Features */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">Tính năng nổi bật</h3>
                    <ul className="space-y-2">
                      {bookData.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-8">
                  {['description', 'details', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`relative py-4 text-sm font-medium transition-colors capitalize ${
                        activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab === 'description' ? 'Mô tả' : tab === 'details' ? 'Chi tiết' : 'Đánh giá'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="prose max-w-none">
                {activeTab === 'description' && (
                  <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: bookData.description }} />
                )}
                {activeTab === 'details' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600 mb-1">Tác giả</p><p className="font-semibold text-gray-900">{bookData.author}</p></div>
                    {/* ... Các chi tiết khác giữ nguyên ... */}
                    <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600 mb-1">ISBN</p><p className="font-semibold text-gray-900">{bookData.isbn}</p></div>
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div className="text-center py-12">
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

                  {/* Rental Plans Rendering */}
                  {bookData.rentalPlans.length === 0 ? (
                      <div className="text-red-500 text-center py-4 bg-red-50 rounded">Hiện chưa có gói thuê nào khả dụng.</div>
                  ) : (
                      <div className="space-y-3 mb-6">
                        {bookData.rentalPlans.map((plan) => (
                          <Button
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            variant={selectedPlanId === plan.id ? 'primary' : 'outline'}
                            className={`w-full p-4 h-auto relative ${
                              selectedPlanId === plan.id ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            {plan.isPopular && (
                              <div className="absolute -top-2 -right-2">
                                <Badge variant="danger" className="text-xs bg-red-500 text-white hover:bg-red-600">Phổ biến</Badge>
                              </div>
                            )}
                            <div className="flex items-center justify-between w-full">
                              <div className="text-left">
                                <div className="font-semibold text-gray-900">{plan.durationLabel}</div>
                                {(plan.savingsPercentage || 0) > 0 && (
                                  <div className="text-xs text-green-600 font-medium">Tiết kiệm {plan.savingsPercentage}%</div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg text-blue-600">
                                  {plan.price.toLocaleString('vi-VN')}₫
                                </div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleRentNow}
                      disabled={bookData.rentalPlans.length === 0 || processing}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg h-auto"
                    >
                      {processing ? "Đang xử lý..." : `Thuê ngay - ${currentPlan ? currentPlan.price.toLocaleString('vi-VN') : 0}₫`}
                    </Button>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                      <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">hoặc</span></div>
                    </div>

                    <Button
                      onClick={handleBuyNow}
                      variant="outline"
                      disabled={!bookData.purchasePrice}
                      className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold py-3 h-auto"
                    >
                      Mua sở hữu - {bookData.purchasePrice ? bookData.purchasePrice.toLocaleString('vi-VN') : 0}₫
                    </Button>
                  </div>

                  {/* Benefits */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Quyền lợi khi thuê:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500">✓</span> Đọc không giới hạn trong thời gian thuê
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500">✓</span> Đồng bộ trên tất cả thiết bị
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500">✓</span> Hỗ trợ 24/7
                      </li>
                    </ul>
                  </div>

                  {/* Note */}
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                    <span className="text-yellow-600">⚠</span>
                    <p className="text-xs text-yellow-800">
                      Sau khi hết hạn thuê, bạn sẽ không còn quyền truy cập sách. Có thể gia hạn hoặc mua sở hữu bất kỳ lúc nào.
                    </p>
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