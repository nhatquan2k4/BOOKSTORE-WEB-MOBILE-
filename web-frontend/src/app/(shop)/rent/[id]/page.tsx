'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { bookService, orderService, cartService } from '@/services';
import type { BookDetailDto, RentalPlanDto } from '@/types/dtos';
import { toast } from 'sonner';

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export default function RentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // --- 1. STATE & API LOGIC (MỚI) ---
  const [book, setBook] = useState<BookDetailDto | null>(null);
  const [rentalPlans, setRentalPlans] = useState<RentalPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false); // State khi đang gọi API thuê
  
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');

  // Load dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Chỉ fetch book detail - rental plans đã được tính trong book detail
        const bookData = await bookService.getBookById(id);
        
        setBook(bookData);
        
        console.log('[RentPage] ========== RENTAL PLANS DEBUG ==========');
        console.log('[RentPage] Book data:', bookData);
        console.log('[RentPage] Rental plans from book:', bookData.rentalPlans);
        
        // Lấy rental plans từ book detail (đã được tính theo % giá sách)
        const rentalPlansFromBook = bookData.rentalPlans || [];
        
        console.log('[RentPage] Total rental plans:', rentalPlansFromBook.length);
        console.log('[RentPage] Rental plans data:', JSON.stringify(rentalPlansFromBook, null, 2));
        console.log('[RentPage] ==========================================');
        
        // Sort by duration ascending (3, 7, 14, 30, 180 days)
        rentalPlansFromBook.sort((a: any, b: any) => a.days - b.days);
        
        setRentalPlans(rentalPlansFromBook);
        
        // Tự động chọn gói đầu tiên
        if (rentalPlansFromBook.length > 0) {
          setSelectedPlanId(rentalPlansFromBook[0].id);
        } else {
          console.warn('[RentPage] No rental plans found!');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchData();
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
    size: book.files?.[0]?.fileSize ? `${(book.files[0].fileSize / (1024 * 1024)).toFixed(2)} MB` : 'N/A',
    isbn: book.isbn,
    category: book.categories?.[0]?.name || "Chưa phân loại",
    rating: book.averageRating,
    reviews: book.totalReviews,
    cover: book.images?.[0]?.imageUrl || '/image/anh.png',
    description: book.description || "Chưa có mô tả",
    purchasePrice: book.currentPrice,
    // Rental plans từ book.rentalPlans (đã tính động theo giá sách)
    rentalPlans: rentalPlans
      .filter((plan: any) => plan && plan.days && plan.price) // Filter out invalid plans
      .map((plan: any) => ({
        id: plan.id || `plan-${plan.days}`,
        name: plan.name || `Thuê ${plan.days} ngày`,
        price: plan.price,
        duration: plan.days, // This must be valid: 3, 7, 14, 30, 180
        durationLabel: `${plan.days} ngày`,
        description: plan.description || ''
      }))
  } : null;

  // Tìm gói đang chọn
  const currentPlan = bookData?.rentalPlans.find((p) => p.id === selectedPlanId);

  // --- 3. ACTIONS (LOGIC MỚI) ---
  
  const handleRentNow = async () => {
    console.log('[RentDetail] ========== HANDLE RENT NOW ==========');
    console.log('[RentDetail] Book:', book);
    console.log('[RentDetail] Current Plan:', currentPlan);
    console.log('[RentDetail] Book ID:', book?.id);
    console.log('[RentDetail] Duration:', currentPlan?.duration);
    
    if (!book || !currentPlan) {
      toast.error('Vui lòng chọn gói thuê');
      return;
    }

    // Validate book ID is valid UUID
    if (!isValidUUID(book.id)) {
      toast.error('Mã sách không hợp lệ');
      console.error('[RentDetail] Invalid Book ID format:', book.id);
      return;
    }

    // Validate duration value
    const validDurations = [3, 7, 14, 30, 180];
    if (!currentPlan.duration || !validDurations.includes(currentPlan.duration)) {
      toast.error('Gói thuê không hợp lệ. Vui lòng chọn lại.');
      console.error('[RentDetail] Invalid duration:', currentPlan.duration);
      console.error('[RentDetail] Valid durations:', validDurations);
      return;
    }

    // Check đăng nhập
    const token = globalThis.window?.localStorage?.getItem('accessToken');
    if (!token) {
      toast.error('Vui lòng đăng nhập để thuê sách');
  router.push(`/login?redirect=/rent/${id}`);
      return;
    }

    try {
        setProcessing(true);
        
        // Prepare data - Gửi RentalPlanId để backend biết chính xác gói thuê nào
        const requestData = {
            BookId: book.id,
            RentalPlanId: selectedPlanId, // ID của gói thuê user đã chọn
            Days: currentPlan.duration     // Số ngày (backup)
        };
        
        console.log('[RentDetail] ✅ Validation passed!');
        console.log('[RentDetail] Selected Plan ID:', selectedPlanId);
        console.log('[RentDetail] Request data:', JSON.stringify(requestData, null, 2));
        
        // Gọi API tạo đơn hàng
        const result = await orderService.createRentalOrder(requestData);

        console.log('[RentDetail] ✅ API response:', result);

        if (result && result.orderId) {
            toast.success('Tạo đơn thuê thành công!');
            // Chuyển hướng thanh toán - backend trả về { success, orderId, orderNumber, amount }
            const orderId = result.orderId;
            const amount = result.amount;
            router.push(`/payment/qr?orderId=${orderId}&amount=${amount}`);
        } else {
            toast.error('Không thể tạo đơn thuê. Vui lòng thử lại.');
        }
    } catch (error: any) {
        console.error('[RentDetail] ERROR:', error);
        console.error('[RentDetail] Error type:', error?.constructor?.name);
        console.error('[RentDetail] Error statusCode:', error?.statusCode);
        console.error('[RentDetail] Error message:', error?.message);
        console.error('[RentDetail] Error errors:', error?.errors);
        
        // handleApiError throws ApiError, not AxiosError
        // ApiError has: message, statusCode, errors (not response.data)
        let errorMessage = 'Lỗi không xác định';
        
        if (error?.message) {
            errorMessage = error.message;
        }
        
        // Check if it's a validation error
        if (error?.errors) {
            const errorDetails = Object.entries(error.errors)
                .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                .join('; ');
            errorMessage = `${errorMessage}. Chi tiết: ${errorDetails}`;
        }
        
        toast.error(`Lỗi tạo đơn thuê: ${errorMessage}`);
    } finally {
        setProcessing(false);
        console.log('[RentDetail] ========================================');
    }
  };

  const handleBuyNow = async () => {
    console.log('[RentDetail] ========== HANDLE BUY NOW ==========');
    console.log('[RentDetail] Book:', book);
    console.log('[RentDetail] Book ID:', book?.id);
    
    if (!book) {
      toast.error('Thông tin sách không hợp lệ');
      return;
    }

    // Validate book ID is valid UUID
    if (!isValidUUID(book.id)) {
      toast.error('Mã sách không hợp lệ');
      console.error('[RentDetail] Invalid Book ID format:', book.id);
      return;
    }
    
    // Check đăng nhập
    const token = globalThis.window?.localStorage?.getItem('accessToken');
    if (!token) {
      toast.error('Vui lòng đăng nhập để mua sách');
  router.push(`/login?redirect=/rent/${id}`);
      return;
    }
    
    try {
      setProcessing(true);
      
      // Prepare data with correct format (PascalCase for .NET backend)
      const cartData = {
        BookId: book.id,
        Quantity: 1
      };
      
      console.log('[RentDetail] Validation passed!');
      console.log('[RentDetail] Cart data:', JSON.stringify(cartData, null, 2));
      
      // Thêm vào giỏ hàng trước
      await cartService.addToCart(cartData as any);
      
      console.log('[RentDetail] Added to cart successfully');
      toast.success('Đã thêm vào giỏ hàng!');
      
      // Chuyển sang trang checkout với item này
      router.push(`/checkout?items=${book.id}`);
      
    } catch (error: any) {
      console.error('[RentDetail] ERROR:', error);
      console.error('[RentDetail] Error type:', error?.constructor?.name);
      console.error('[RentDetail] Error statusCode:', error?.statusCode);
      console.error('[RentDetail] Error message:', error?.message);
      console.error('[RentDetail] Error errors:', error?.errors);
      
      // handleApiError throws ApiError, not AxiosError
      let errorMessage = 'Lỗi không xác định';
      
      if (error?.message) {
          errorMessage = error.message;
      }
      
      // Check if it's a validation error
      if (error?.errors) {
          const errorDetails = Object.entries(error.errors)
              .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
              .join('; ');
          errorMessage = `${errorMessage}. Chi tiết: ${errorDetails}`;
      }
      
      // Nếu lỗi là "sách đã có trong giỏ", vẫn chuyển sang checkout
      if (errorMessage.includes('đã có') || errorMessage.includes('already') || errorMessage.includes('exist')) {
        toast.info('Sách đã có trong giỏ hàng');
        router.push(`/checkout?items=${book.id}`);
      } else {
        toast.error(`Lỗi thêm vào giỏ: ${errorMessage}`);
      }
    } finally {
      setProcessing(false);
      console.log('[RentDetail] ========================================');
    }
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
                            <div className="flex items-center justify-between w-full">
                              <div className="text-left">
                                <div className="font-semibold text-gray-900">{plan.name}</div>
                                {plan.description && (
                                  <div className="text-xs text-gray-600 mt-1">{plan.description}</div>
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
                      disabled={!bookData.purchasePrice || processing}
                      className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-semibold py-3 h-auto"
                    >
                      {processing ? 'Đang xử lý...' : `Mua sở hữu - ${bookData.purchasePrice ? bookData.purchasePrice.toLocaleString('vi-VN') : 0}₫`}
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