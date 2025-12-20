'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { bookService, orderService } from '@/services';
import type { BookDetailDto } from '@/types/dtos';

export default function RentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [book, setBook] = useState<BookDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); // State loading khi bấm nút thuê
  
  // State lưu ID gói thuê đang chọn
  const [selectedPlanId, setSelectedPlanId] = useState<number>(0);
  
  // Tabs hiển thị
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');

  // 1. Fetch chi tiết sách từ API
  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true);
        const data = await bookService.getBookById(id);
        setBook(data);
        
        // Tự động chọn gói "Phổ biến" hoặc gói đầu tiên nếu có
        if (data?.rentalPlans && data.rentalPlans.length > 0) {
            const popularPlan = data.rentalPlans.find(p => p.isPopular);
            setSelectedPlanId(popularPlan ? popularPlan.id : data.rentalPlans[0].id);
        }
      } catch (error) {
        console.error("Error fetching book detail:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchBookDetail();
  }, [id]);

  // Lấy object gói thuê hiện tại dựa trên ID đã chọn
  const currentPlan = book?.rentalPlans?.find(p => p.id === selectedPlanId);

  // --- HÀM XỬ LÝ THUÊ MỚI (GỌI API) ---
  const handleRentNow = async () => {
    if (!book || !currentPlan) return;

    try {
        setProcessing(true);
        
        // Gọi API tạo đơn hàng (Backend tự tính giá dựa trên BookId và Days)
        const result = await orderService.createRentalOrder({
            bookId: book.id,
            days: currentPlan.days
        });

        if (result.success) {
            // Thành công -> Chuyển sang trang thanh toán QR với OrderId thật
            // Không truyền price qua URL nữa để bảo mật
            router.push(`/payment/qr?orderId=${result.orderId}&amount=${result.amount}`);
        } else {
            alert(result.message || "Không thể tạo đơn hàng");
        }
    } catch (err: any) {
        console.error(err);
        alert(err.message || "Lỗi kết nối server. Vui lòng thử lại.");
    } finally {
        setProcessing(false);
    }
  };

  const handleBuyNow = () => {
    if (!book) return;
    router.push(`/checkout?type=buy&bookId=${book.id}`);
  };

  // --- Render UI ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy sách</h2>
        <Link href="/rent" className="text-blue-600 hover:underline">Quay lại trang thuê sách</Link>
      </div>
    );
  }

  // Dữ liệu hiển thị (Fallback nếu null)
  const rentalPlans = book.rentalPlans || [];
  const coverImage = book.images?.find(i => i.isMain)?.imageUrl || book.images?.[0]?.imageUrl || '/image/anh.png';
  const authorName = book.authors?.[0]?.name || "Tác giả không xác định";
  const categoryName = book.categories?.[0]?.name || "Chưa phân loại";
  // Nếu backend chưa có field features, dùng list cứng tạm thời
  const features = book.features && book.features.length > 0 ? book.features : [
      'Đọc offline không cần kết nối internet',
      'Đồng bộ trên nhiều thiết bị',
      'Tìm kiếm và highlight văn bản',
      'Chế độ đọc ban đêm'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <span>/</span>
          <Link href="/rent" className="hover:text-blue-600">Thuê eBook</Link>
          <span>/</span>
          <span className="text-gray-900 line-clamp-1">{book.title}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Book Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Book Cover */}
                <div>
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg border border-gray-100">
                    <Image src={coverImage} alt={book.title} fill className="object-cover" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500 text-white hover:bg-green-600">eBook</Badge>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center font-bold text-gray-900">
                            {book.averageRating || 0} ⭐
                        </div>
                        <p className="text-xs text-gray-600">{book.totalReviews || 0} đánh giá</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="font-bold text-gray-900">{book.pageCount}</div>
                        <p className="text-xs text-gray-600">Trang</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="font-bold text-gray-900">{book.bookFormat?.name || 'PDF'}</div>
                        <p className="text-xs text-gray-600">Định dạng</p>
                    </div>
                  </div>
                </div>

                {/* Info Text */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">{book.title}</h1>
                  <div className="space-y-2 mb-6 text-gray-700 text-sm">
                    <p><span className="font-semibold text-gray-900">Tác giả:</span> <span className="text-blue-600">{authorName}</span></p>
                    <p><span className="font-semibold text-gray-900">Nhà xuất bản:</span> {book.publisher?.name}</p>
                    <p><span className="font-semibold text-gray-900">Năm xuất bản:</span> {book.publicationYear}</p>
                    <p><span className="font-semibold text-gray-900">Ngôn ngữ:</span> {book.language}</p>
                    <p><span className="font-semibold text-gray-900">ISBN:</span> {book.isbn}</p>
                  </div>
                  <div className="mb-6">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                          {categoryName}
                      </Badge>
                  </div>
                  
                  {/* Features List */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-blue-100">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                        Tính năng nổi bật
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                        {features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">✓</span> {f}
                            </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="border-b mb-6">
                <div className="flex gap-8">
                    <button 
                        onClick={() => setActiveTab('description')} 
                        className={`py-4 border-b-2 text-sm font-medium transition ${activeTab === 'description' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Mô tả
                    </button>
                    <button 
                        onClick={() => setActiveTab('details')} 
                        className={`py-4 border-b-2 text-sm font-medium transition ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Chi tiết
                    </button>
                    <button 
                        onClick={() => setActiveTab('reviews')} 
                        className={`py-4 border-b-2 text-sm font-medium transition ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Đánh giá ({book.totalReviews || 0})
                    </button>
                </div>
              </div>
              
              <div className="prose max-w-none text-gray-700 text-sm leading-relaxed">
                {activeTab === 'description' && (
                    <div dangerouslySetInnerHTML={{ __html: book.description || '<p>Chưa có mô tả.</p>' }} />
                )}
                {activeTab === 'details' && (
                    <div className="grid grid-cols-2 gap-4">
                        {/* Render chi tiết thêm nếu cần */}
                        <div className="p-4 bg-gray-50 rounded">Thông tin chi tiết đang cập nhật...</div>
                    </div>
                )}
                {activeTab === 'reviews' && (
                    <div className="text-center py-8 text-gray-500">
                        Chưa có đánh giá nào.
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Action Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="shadow-lg border-t-4 border-t-blue-600">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Chọn gói thuê</h2>
                  
                  {rentalPlans.length === 0 ? (
                      <div className="text-red-500 bg-red-50 p-4 rounded text-center text-sm">
                          Sách này hiện chưa hỗ trợ thuê hoặc chưa có giá bán.
                      </div>
                  ) : (
                      <div className="space-y-3 mb-6">
                        {rentalPlans.map((plan) => (
                          <div 
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`relative w-full p-4 border rounded-lg cursor-pointer transition-all group ${
                              selectedPlanId === plan.id 
                                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                                : 'border-gray-200 hover:border-blue-400 hover:shadow-sm'
                            }`}
                          >
                            {plan.isPopular && (
                              <div className="absolute -top-2.5 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
                                Phổ biến
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-bold text-gray-900">{plan.durationLabel}</div>
                                {plan.savingsPercentage > 0 && (
                                  <div className="text-xs text-green-600 font-medium mt-0.5">Tiết kiệm {plan.savingsPercentage}%</div>
                                )}
                              </div>
                              <div className="font-bold text-lg text-blue-600 group-hover:scale-105 transition-transform">
                                {plan.price.toLocaleString('vi-VN')}₫
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                  )}

                  <div className="space-y-4">
                    <Button 
                        onClick={handleRentNow}
                        disabled={rentalPlans.length === 0 || processing}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-md transition-all hover:-translate-y-0.5"
                    >
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Đang xử lý...
                            </span>
                        ) : (
                            `Thuê ngay - ${currentPlan ? currentPlan.price.toLocaleString('vi-VN') : 0}₫`
                        )}
                    </Button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                        <div className="relative flex justify-center"><span className="px-3 bg-white text-gray-400 text-xs uppercase">Hoặc</span></div>
                    </div>

                    <Button 
                        onClick={handleBuyNow} 
                        variant="outline" 
                        disabled={!book.currentPrice}
                        className="w-full border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-semibold py-5 h-auto transition-colors"
                    >
                        Mua sở hữu - {book.currentPrice?.toLocaleString('vi-VN') || 0}₫
                    </Button>
                    
                    <p className="text-xs text-center text-gray-500 mt-2">
                        Thanh toán an toàn qua QR Code / Ngân hàng
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