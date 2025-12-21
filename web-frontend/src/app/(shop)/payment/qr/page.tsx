'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Breadcrumb } from '@/components/ui';
import { paymentApi } from '@/lib/api/payment';
import { cartService } from '@/services/cart.service';
// 1. IMPORT SIGNALR
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';

function QRPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Params
  const type = searchParams.get('type');
  const bookId = searchParams.get('bookId');
  const orderIdParam = searchParams.get('orderId');
  const amountParam = searchParams.get('amount');
  
  // State
  const [orderId] = useState(() => orderIdParam || '');
  const [amount] = useState(() => amountParam || '0');
  
  const [timeLeft, setTimeLeft] = useState(900);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'success' | 'failed' | 'expired'>('pending');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoadingQR, setIsLoadingQR] = useState(true);
  
  // Ref để tránh re-render liên tục khi dùng trong effect
  const connectionRef = useRef<HubConnection | null>(null);

  const [bankInfo, setBankInfo] = useState({
    accountNumber: '',
    accountName: '',
    content: ''
  });

  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  // 2. INIT QR CODE
  useEffect(() => {
    if (!orderId) return;

    const initQR = async () => {
      try {
        setIsLoadingQR(true);
        const desc = type === 'rent' 
            ? `THUE ${bookId}` 
            : `MUA ${orderId}`; 

        const data = await paymentApi.createQR({
          orderId,
          amount: Number(amount),
          description: desc
        });

        if (data.success) {
          setQrCodeUrl(data.qrCodeUrl);
          setBankInfo({
            accountNumber: data.accountNumber,
            accountName: data.accountName,
            content: data.transferContent 
          });
        }
      } catch (error) {
        console.error("Init QR error:", error);
      } finally {
        setIsLoadingQR(false);
      }
    };

    initQR();
  }, [orderId, amount, type, bookId]);

  // 3. XỬ LÝ KHI THÀNH CÔNG (Dùng useCallback để SignalR gọi được)
  const handleSuccess = useCallback(async () => {
    if (paymentStatus === 'success') return; // Chặn gọi nhiều lần

    // Clear cart nếu là mua hàng
    if (type === 'buy') {
      try { await cartService.clearCart(); } catch (e) { console.error(e); }
    }

    setPaymentStatus('success');
    
    // Tự động chuyển trang sau 1.5s
    setTimeout(() => {
      const successUrl = type === 'rent' 
        ? `/payment/success?type=rent&bookId=${bookId}&orderId=${orderId}`
        : `/payment/success?type=buy&orderId=${orderId}`;
      router.push(successUrl);
    }, 1500);
  }, [type, bookId, orderId, router, paymentStatus]);

  // 4. KẾT NỐI SIGNALR (REAL-TIME)
  useEffect(() => {
    if (!orderId || paymentStatus === 'success') return;

    // URL Backend Local (hoặc link Ngrok nếu đang test public)
    // Lưu ý: Nếu chạy Docker thì localhost:5276 là chuẩn.
    const HUB_URL = "http://localhost:5276/hubs/notifications"; 

    const connection = new HubConnectionBuilder()
        .withUrl(HUB_URL)
        .withAutomaticReconnect()
        .build();

    connection.start()
        .then(() => {
            console.log("🔥 Connected to SignalR NotificationHub");
            connectionRef.current = connection;

            // Lắng nghe sự kiện từ Backend
            connection.on("ReceivePaymentStatus", (receivedOrderId, status) => {
                console.log("⚡ SignalR Event:", receivedOrderId, status);
                
                // So sánh OrderId (chuyển về string lower case cho chắc)
                if (receivedOrderId.toString().toLowerCase() === orderId.toLowerCase() && status === "Paid") {
                    console.log("✅ Payment Confirmed via SignalR!");
                    handleSuccess();
                }
            });
        })
        .catch(err => console.error("❌ SignalR Connection Error: ", err));

    return () => {
        if (connectionRef.current) {
            connectionRef.current.stop();
        }
    };
  }, [orderId, handleSuccess, paymentStatus]);

  // 5. POLLING DỰ PHÒNG (Giữ lại để chắc chắn 100%)
  useEffect(() => {
    if (!orderId || paymentStatus === 'success' || paymentStatus === 'expired') return;

    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await paymentApi.checkStatus(orderId);
        const status = res.status?.toLowerCase();
        
        if (isMounted && res.success && ['paid', 'completed', 'success'].includes(status)) {
          await handleSuccess();
        }
      } catch (error) {
        // Ignore polling error
      }
    };

    // Poll chậm hơn (5s) vì đã có SignalR
    const intervalId = setInterval(checkStatus, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [orderId, paymentStatus, handleSuccess]);

  // Timer Countdown
  useEffect(() => {
    if (paymentStatus !== 'pending') return;
    const timer = setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearInterval(timer);
  }, [paymentStatus]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopiedAlert(true);
    setTimeout(() => setShowCopiedAlert(false), 2000);
  };

  if (paymentStatus === 'success') {
      return (
          <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl animate-in fade-in zoom-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
                <p className="text-gray-600">Đang chuyển hướng...</p>
            </div>
          </div>
      )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
       <div className="container mx-auto px-4 max-w-4xl">
          <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Thanh toán QR' }]} />
          
          {showCopiedAlert && (
            <div className="fixed top-20 right-4 z-50 animate-fade-in"><div className="bg-green-500 text-white px-4 py-2 rounded shadow">Đã sao chép!</div></div>
          )}

          <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white flex flex-col items-center justify-center text-center">
                  <h2 className="text-2xl font-bold mb-2">Quét mã để thanh toán</h2>
                  <div className="bg-white p-4 rounded-xl shadow-inner mb-6 mt-4">
                      {isLoadingQR ? <div className="w-48 h-48 flex items-center justify-center text-gray-400">Đang tạo mã...</div> : qrCodeUrl ? <Image src={qrCodeUrl} alt="QR" width={200} height={200} className="rounded-lg object-contain" /> : <div className="w-48 h-48 flex items-center justify-center text-red-500">Lỗi tạo QR</div>}
                  </div>
                  <div className="text-blue-100 mb-2 bg-white/10 px-4 py-2 rounded-full">Hết hạn: <span className="font-mono font-bold">{formatTime(timeLeft)}</span></div>
                  <p className="text-sm text-blue-200 mt-2 italic">Trang sẽ tự động chuyển khi hoàn tất</p>
              </div>

              <div className="p-8 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Thông tin chuyển khoản</h3>
                  <div className="space-y-5">
                      <div className="cursor-pointer" onClick={() => handleCopy(bankInfo.accountNumber)}>
                          <label className="text-xs text-gray-500 uppercase font-semibold">Số tài khoản</label>
                          <p className="font-mono font-bold text-xl text-blue-600">{bankInfo.accountNumber || "..."}</p>
                      </div>
                      <div className="cursor-pointer" onClick={() => handleCopy(amount.toString())}>
                          <label className="text-xs text-gray-500 uppercase font-semibold">Số tiền</label>
                          <p className="font-bold text-2xl text-red-600">{Number(amount).toLocaleString('vi-VN')}₫</p>
                      </div>
                      <div className="cursor-pointer" onClick={() => handleCopy(bankInfo.content)}>
                          <label className="text-xs text-gray-500 uppercase font-semibold">Nội dung <span className="text-red-500">(Bắt buộc)</span></label>
                          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg font-mono font-bold text-sm break-all mt-1">
                              {bankInfo.content || "..."}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
       </div>
    </div>
  );
}

export default function QRPaymentPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <QRPaymentContent />
    </Suspense>
  );
}