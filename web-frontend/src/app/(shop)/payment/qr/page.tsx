'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Badge, Breadcrumb } from '@/components/ui';
import { paymentApi } from '@/lib/api/payment';

export default function QRPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút = 900 giây
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'success' | 'failed' | 'expired'>('pending');
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [sepayOrderId, setSepayOrderId] = useState<string>('');
  const [isLoadingQR, setIsLoadingQR] = useState(true);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [transferContent, setTransferContent] = useState<string>('');
  
  // Lấy thông tin từ URL - HỖ TRỢ CẢ RENT VÀ BUY
  const type = searchParams.get('type'); // 'rent' hoặc 'buy'
  const bookId = searchParams.get('bookId');
  const bookTitle = searchParams.get('bookTitle') || 'Sách';
  const bookCover = searchParams.get('bookCover') || '/image/default-book.jpg';
  const planId = searchParams.get('planId');
  const duration = searchParams.get('duration');
  const price = searchParams.get('price');
  
  // Generate orderId CHỈ 1 LẦN - không thay đổi khi re-render
  const [orderId] = useState(() => searchParams.get('orderId') || `ORD${Date.now()}`);
  
  // Tương thích ngược với code cũ
  const amount = searchParams.get('amount') || price || '450000';
  const bankCode = searchParams.get('bank') || 'MOMO'; // MOMO, VNPAY, ZALOPAY

  // Format số tiền
  const formatCurrency = (value: string) => {
    return Number.parseInt(value).toLocaleString('vi-VN');
  };

  // Helper: Get back URL based on type and bookId
  const getBackUrl = () => {
    if (type === 'rent') {
      return bookId ? `/rent/${bookId}` : '/rent';
    }
    return bookId ? `/books/${bookId}` : '/cart';
  };

  // Helper: Render QR Code based on loading and data state
  const renderQRCode = () => {
    if (isLoadingQR) {
      return (
        <div className="w-64 h-64 bg-white border-4 border-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-gray-600">Đang tạo mã QR...</p>
          </div>
        </div>
      );
    }

    if (qrCodeUrl) {
      return (
        <div className="w-64 h-64 bg-white border-4 border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
          <Image
            src={qrCodeUrl}
            alt="QR Code thanh toán"
            width={256}
            height={256}
            className="object-contain"
            priority
          />
        </div>
      );
    }

    // Fallback: Placeholder QR Code
    return (
      <div className="w-64 h-64 bg-white border-4 border-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-48 h-48 bg-gray-900 mb-2 mx-auto grid grid-cols-8 gap-1 p-2">
            {Array.from({ length: 64 }, (_, i) => (
              <div
                key={`qr-pixel-${orderId}-${i}`}
                className={`${Math.random() > 0.5 ? 'bg-white' : 'bg-gray-900'}`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 font-mono">{orderId}</p>
        </div>
      </div>
    );
  };

  // Helper: Get button text based on payment status
  const getButtonText = () => {
    if (paymentStatus === 'checking') {
      return (
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Đang kiểm tra...</span>
        </div>
      );
    }
    return 'Tôi đã thanh toán';
  };

  // Tạo QR code khi component mount hoặc khi orderId thay đổi
  useEffect(() => {
    const createQRCode = async () => {
      try {
        // Reset states khi tạo QR mới
        setIsLoadingQR(true);
        setPaymentStatus('pending');
        setTimeLeft(900);
        
        console.log('Creating QR with params:', { amount, orderId, type, bookId, planId });
        
        const data = await paymentApi.createQR({
          amount: Number.parseInt(amount),
          orderId,
          type: (type || 'buy') as 'rent' | 'buy',
          bookId: bookId || undefined,
          planId: planId || undefined,
          description: type === 'rent' 
            ? `THUE ${bookId} ${planId}` 
            : `MUA ${orderId}`,
        });
        
        console.log('QR Response:', data);
        
        if (data.success) {
          setQrCodeUrl(data.qrCodeUrl);
          setSepayOrderId(data.orderId);
          setAccountNumber(data.accountNumber);
          setAccountName(data.accountName);
          setTransferContent(data.transferContent);
          console.log('QR Code URL set:', data.qrCodeUrl);
        } else {
          console.error('QR creation failed:', data);
        }
      } catch (error) {
        console.error('Error creating QR:', error);
        alert('Lỗi tạo mã QR: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsLoadingQR(false);
      }
    };

    createQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]); // Chỉ phụ thuộc vào orderId để tự động cập nhật khi order mới

  // Đếm ngược thời gian
  useEffect(() => {
    if (paymentStatus !== 'pending') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus('expired');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus]);

  // Format thời gian
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // TODO: Tự động kiểm tra thanh toán (cần Sepay API hoặc backend thật)
  // Hiện tại chỉ dùng nút "Tôi đã thanh toán" để chuyển trang thủ công
  // useEffect(() => {
  //   if (paymentStatus !== 'pending' || !sepayOrderId) return;
  //   const checkPaymentStatus = async () => {
  //     // Implementation here
  //   };
  //   const checkInterval = setInterval(checkPaymentStatus, 5000);
  //   return () => clearInterval(checkInterval);
  // }, [paymentStatus, sepayOrderId, type, bookId, orderId, router]);

  // Xử lý nút "Tôi đã thanh toán" - Chuyển trang thành công
  const handleCheckPayment = async () => {
    if (!sepayOrderId) {
      alert('Chưa tạo được mã thanh toán. Vui lòng thử lại.');
      return;
    }

    setPaymentStatus('checking');
    
    // TODO: Tích hợp API kiểm tra thanh toán thật từ backend
    // Hiện tại chỉ chuyển trang sau 1 giây
    setTimeout(() => {
      setPaymentStatus('success');
      const successUrl = type === 'rent' 
        ? `/payment/success?type=rent&bookId=${bookId}&orderId=${orderId}`
        : `/payment/success?type=buy&orderId=${orderId}`;
      router.push(successUrl);
    }, 1000);

    // Code cũ với Sepay API (comment out)
    // try {
    //   const response = await fetch(`/api/payment/sepay/check-status?orderId=${sepayOrderId}`);
    //   if (!response.ok) throw new Error('Không thể kiểm tra trạng thái thanh toán');
    //   const data = await response.json();
    //   if (data.success && data.status === 'paid') {
    //     setPaymentStatus('success');
    //     setTimeout(() => router.push(successUrl), 1000);
    //   } else {
    //     setPaymentStatus('failed');
    //     setTimeout(() => setPaymentStatus('pending'), 3000);
    //   }
    // } catch (error) {
    //   console.error('Error checking payment:', error);
    //   setPaymentStatus('failed');
    //   setTimeout(() => setPaymentStatus('pending'), 3000);
    // }
  };

  // Copy thông tin
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopiedAlert(true);
    setTimeout(() => setShowCopiedAlert(false), 2000);
  };

  const getBankInfo = () => {
    switch (bankCode) {
      case 'MOMO':
        return {
          name: 'MoMo',
          logo: '/image/momo-logo.png',
          color: 'from-pink-500 to-pink-600',
          qrCode: '/image/qr-momo.png', // Thay bằng QR code thật
        };
      case 'VNPAY':
        return {
          name: 'VNPay',
          logo: '/image/vnpay-logo.png',
          color: 'from-blue-500 to-blue-600',
          qrCode: '/image/qr-vnpay.png',
        };
      case 'ZALOPAY':
        return {
          name: 'ZaloPay',
          logo: '/image/zalopay-logo.png',
          color: 'from-blue-400 to-cyan-500',
          qrCode: '/image/qr-zalopay.png',
        };
      default:
        return {
          name: 'Ngân hàng',
          logo: '/image/bank-logo.png',
          color: 'from-gray-500 to-gray-600',
          qrCode: '/image/qr-bank.png',
        };
    }
  };

  const bankInfo = getBankInfo();

  // Xây dựng breadcrumb items dựa trên nguồn (không cần Trang chủ vì Breadcrumb component tự thêm)
  const getBreadcrumbItems = () => {
    if (type === 'rent') {
      // Từ trang thuê eBook
      return [
        { label: 'Thuê eBook', href: '/rent' },
        ...(bookId && bookTitle ? [{ label: bookTitle, href: `/rent/${bookId}` }] : []),
        { label: 'Thanh toán QR' }
      ];
    }
    
    // Từ giỏ hàng hoặc mua ngay từ chi tiết sách
    if (bookId && bookTitle) {
      // Mua ngay từ trang chi tiết sách
      return [
        { label: 'Sách', href: '/books' },
        { label: bookTitle, href: `/books/${bookId}` },
        { label: 'Thanh toán QR' }
      ];
    }
    
    // Từ giỏ hàng
    return [
      { label: 'Giỏ hàng', href: '/cart' },
      { label: 'Thanh toán QR' }
    ];
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <Breadcrumb items={getBreadcrumbItems()} />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              {/* Success Icon */}
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Thanh toán thành công!
              </h1>
              
              <p className="text-gray-600 mb-2">
                Mã đơn hàng: <span className="font-semibold text-gray-900">{orderId}</span>
              </p>
              
              <p className="text-gray-600 mb-8">
                Số tiền: <span className="font-semibold text-red-600 text-xl">{formatCurrency(amount)}₫</span>
              </p>

              {type === 'rent' ? (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/></svg>
                    <span>Bạn đã thuê eBook thành công! Sách đã được thêm vào thư viện của bạn.</span>
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><path d="m14 18 4 4 4-4"/><path d="M16 2v4"/><path d="M18 14v8"/><path d="M21 11.354V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.343"/><path d="M3 10h18"/><path d="M8 2v4"/></svg>
                    <span>Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ giao hàng trong 2-3 ngày làm việc.</span>
                  </p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Link href={type === 'rent' ? '/account/library' : '/account/orders'}>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {type === 'rent' ? 'Xem thư viện' : 'Xem đơn hàng'}
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <Breadcrumb items={getBreadcrumbItems()} />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              {/* Expired Icon */}
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Mã QR đã hết hạn
              </h1>
              
              <p className="text-gray-600 mb-8">
                Phiên thanh toán đã hết thời gian. Vui lòng thử lại.
              </p>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => globalThis.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Tạo mã QR mới
                </Button>
                <Link href={getBackUrl()}>
                  <Button variant="outline">
                    Quay lại
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Breadcrumb items={getBreadcrumbItems()} />

      {/* Copy Alert */}
      {showCopiedAlert && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Đã sao chép!</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${bankInfo.color} text-white mb-4`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span className="font-semibold">Thanh toán qua {bankInfo.name}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quét mã QR để thanh toán
            </h1>
            <p className="text-gray-600">
              {type === 'rent' ? 'Thuê eBook' : 'Mua sách'} - Đơn hàng #{orderId}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* QR Code Section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                {/* Timer */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">Mã QR hết hạn sau:</span>
                  <span className={`font-bold text-lg ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>

                {/* QR Code */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-inner mx-auto w-fit">
                    {renderQRCode()}
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-center mb-4">
                    Hướng dẫn thanh toán
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-blue-600">1</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Mở ứng dụng <span className="font-semibold">{bankInfo.name}</span>
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-purple-600">2</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Chọn <span className="font-semibold">Quét mã QR</span>
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-green-600">3</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Quét mã và <span className="font-semibold">xác nhận</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Check Button */}
                <div className="mt-6 space-y-3">
                  <Button
                    onClick={handleCheckPayment}
                    disabled={paymentStatus === 'checking'}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-base font-semibold shadow-lg disabled:opacity-50"
                  >
                    {getButtonText()}
                  </Button>

                  {paymentStatus === 'failed' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600 text-center flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Chưa nhận được thanh toán. Vui lòng kiểm tra lại hoặc thử lại sau ít phút.
                      </p>
                    </div>
                  )}
                  
                  {!qrCodeUrl && !isLoadingQR && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-700 text-center flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Không thể tạo mã QR. Vui lòng thử lại hoặc liên hệ hỗ trợ.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                <h3 className="font-bold text-lg text-gray-900 mb-4">
                  Chi tiết thanh toán
                </h3>

                {/* Book info - CHỈ HIỆN KHI CÓ THÔNG TIN SÁCH */}
                {bookTitle && bookCover && (
                  <div className="flex gap-3 mb-4 pb-4 border-b">
                    <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden shadow-sm">
                      <Image
                        src={bookCover}
                        alt={bookTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                        {bookTitle}
                      </h4>
                      {duration && (
                        <Badge variant="info" className="text-xs">
                          Thuê {duration} ngày
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-4 pb-4 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-semibold text-gray-900">{orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Loại giao dịch:</span>
                    <Badge variant={type === 'rent' ? 'success' : 'default'}>
                      {type === 'rent' ? ' Thuê eBook' : ' Mua sách'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="font-semibold text-gray-900">{bankInfo.name}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền:</span>
                    <span className="font-bold text-2xl text-red-600">
                      {formatCurrency(amount)}₫
                    </span>
                  </div>
                </div>

                {/* Bank Transfer Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Thông tin chuyển khoản
                  </h4>
                  
                  {/* Account Number */}
                  <div>
                    <div className="text-xs text-gray-500 block mb-1">Số tài khoản</div>
                    <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border">
                      <span className="font-mono font-semibold text-sm">
                        {accountNumber || 'Đang tải...'}
                      </span>
                      <button
                        onClick={() => handleCopy(accountNumber)}
                        disabled={!accountNumber}
                        className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Account Name */}
                  <div>
                    <div className="text-xs text-gray-500 block mb-1">Chủ tài khoản</div>
                    <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border">
                      <span className="font-medium text-sm">
                        {accountName || 'Đang tải...'}
                      </span>
                      <button
                        onClick={() => handleCopy(accountName)}
                        disabled={!accountName}
                        className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 6 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Transfer Content */}
                  <div>
                    <div className="text-xs text-gray-500 block mb-1">
                      Nội dung chuyển khoản <span className="text-red-500">*</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-yellow-50 p-2 rounded border-2 border-yellow-300">
                      <span className="font-mono font-bold text-sm text-gray-900">
                        {transferContent || (type === 'rent' ? `THUE ${bookId} ${planId}` : `MUA ${orderId}`)}
                      </span>
                      <button
                        onClick={() => handleCopy(transferContent || (type === 'rent' ? `THUE ${bookId} ${planId}` : `MUA ${orderId}`))}
                        className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Nhập chính xác để tự động xác nhận
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mt-1"></div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-yellow-800 mb-1">
                        Đang chờ thanh toán
                      </p>
                      <p className="text-xs text-yellow-700">
                        Vui lòng quét mã QR và xác nhận thanh toán
                      </p>
                    </div>
                  </div>
                </div>

                {/* Support */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-sm text-gray-900">Cần hỗ trợ?</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Gặp vấn đề khi thanh toán? Liên hệ với chúng tôi
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Hotline
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Chat
                    </Button>
                  </div>
                </div>

                {/* Cancel */}
                <div className="mt-4">
                  <Link href={getBackUrl()}>
                    <Button variant="outline" className="w-full">
                      Hủy thanh toán
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
