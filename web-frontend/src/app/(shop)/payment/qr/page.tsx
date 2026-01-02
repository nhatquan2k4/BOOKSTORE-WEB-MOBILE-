// "use client";

// import { useState, useEffect, Suspense, useCallback, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Breadcrumb } from "@/components/ui";
// import { paymentApi } from "@/lib/api/payment";
// import { ordersApi } from "@/lib/api/orders";
// import { cartService } from "@/services/cart.service";
// // SignalR imports kept for future use when backend hub is ready
// import type { HubConnection } from "@microsoft/signalr";
// // import { HubConnectionBuilder, HubConnectionState, HttpTransportType } from "@microsoft/signalr";

// // Define payment status type
// type PaymentStatus = "pending" | "checking" | "success" | "failed" | "expired";

// // Component nội dung chính
// function QRPaymentContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // --- FIX 1: Lấy trực tiếp từ URL, không dùng useState cho params ---
//   const type = searchParams.get("type");
//   const bookId = searchParams.get("bookId");
//   const rawOrderId = searchParams.get("orderId");
//   // Loại bỏ các ký tự lạ nếu có
//   const orderId = rawOrderId ? rawOrderId.trim() : "";
//   const amountParam = searchParams.get("amount");

//   // State
//   const [timeLeft, setTimeLeft] = useState(900);
//   const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
//   const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
//   const [isLoadingQR, setIsLoadingQR] = useState(true);
//   const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

//   const connectionRef = useRef<HubConnection | null>(null);

//   const [bankInfo, setBankInfo] = useState({
//     accountNumber: "",
//     accountName: "",
//     content: "",
//   });

//   const [showCopiedAlert, setShowCopiedAlert] = useState(false);

//   // --- FIX 2: Init QR Code an toàn hơn ---
//   useEffect(() => {
//     // Nếu chưa có orderId thì chưa làm gì cả
//     if (!orderId) {
//       console.warn("Chưa tìm thấy OrderId trong URL");
//       return;
//     }

//     const initQR = async () => {
//       try {
//         setIsLoadingQR(true);
//         console.log("=== CREATING QR CODE ===");
//         console.log("OrderId:", orderId);
//         console.log("Amount:", amountParam);
//         console.log("Type:", type);
//         console.log("BookId:", bookId);

//         const desc = type === "rent" ? `THUE ${bookId}` : `MUA ${orderId}`;
        
//         // Đảm bảo amount là số
//         const amountValue = amountParam ? Number(amountParam) : 0;

//         console.log("Request payload:", {
//           orderId: orderId, 
//           amount: amountValue,
//           description: desc,
//         });

//         const data = await paymentApi.createQR({
//           orderId: orderId, 
//           amount: amountValue,
//           description: desc,
//         });

//         console.log("=== API RESPONSE ===");
//         console.log("Full response:", data);
//         console.log("Success:", data.success);
//         console.log("QR Code URL:", data.qrCodeUrl);
//         console.log("Account Number:", data.accountNumber);
//         console.log("Account Name:", data.accountName);
//         console.log("Transfer Content:", data.transferContent);

//         if (data && data.success) {
//           setQrCodeUrl(data.qrCodeUrl);
//           setBankInfo({
//             accountNumber: data.accountNumber,
//             accountName: data.accountName,
//             content: data.transferContent,
//           });
//           console.log("✅ QR Code set successfully!");
//         } else {
//             console.error("❌ API trả về lỗi hoặc không thành công:", data);
//         }
//       } catch (error) {
//         console.error("❌ Init QR error:", error);
//         if (error instanceof Error) {
//           console.error("Error message:", error.message);
//           console.error("Error stack:", error.stack);
//         }
//       } finally {
//         setIsLoadingQR(false);
//         console.log("=== QR LOADING COMPLETE ===");
//       }
//     };

//     initQR();
//   }, [orderId, amountParam, type, bookId]);

//   // Xử lý khi thành công
//   const handleSuccess = useCallback(async () => {
//     if (paymentStatus === "success") return; 

//     console.log("Thanh toán thành công! Đang xử lý chuyển hướng...");

//     if (type === "buy") {
//       try {
//         await cartService.clearCart();
//       } catch (e) {
//         console.error("Lỗi clear cart:", e);
//       }
//     }

//     setPaymentStatus("success");

//     setTimeout(() => {
//       const successUrl = type === "rent"
//           ? `/payment/success?type=rent&bookId=${bookId}&orderId=${orderId}`
//           : `/payment/success?type=buy&orderId=${orderId}`;
//       router.push(successUrl);
//     }, 1500);
//   }, [type, bookId, orderId, router, paymentStatus]);

//   // Hàm giả lập thanh toán thành công (TEST ONLY)
//   const handleTestPayment = async () => {
//     if (!orderId || isConfirmingPayment) return;
    
//     try {
//       setIsConfirmingPayment(true);
//       console.log("🧪 [TEST] Confirming payment for order:", orderId);
      
//       await ordersApi.confirmPayment(orderId);
      
//       console.log("✅ [TEST] Payment confirmed successfully!");
//       await handleSuccess();
//     } catch (error) {
//       console.error("❌ [TEST] Failed to confirm payment:", error);
//       alert("Lỗi xác nhận thanh toán: " + (error instanceof Error ? error.message : "Unknown error"));
//     } finally {
//       setIsConfirmingPayment(false);
//     }
//   };

//   // --- FIX 3: Kết nối SignalR chuẩn (DISABLED - Dùng nút test thay thế) ---
//   useEffect(() => {
//     // DISABLED: SignalR tạm thời bị tắt vì backend chưa có hub
//     // Dùng nút "TEST: Đã thanh toán" để giả lập thanh toán thành công
//     console.log("ℹ️ SignalR disabled - Use TEST button to simulate payment");
    
//     /* Original SignalR code - Uncomment when backend hub is ready
//     if (!orderId || paymentStatus === "success") return;
//     const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5276';
//     const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
//     const HUB_URL = `${cleanBaseUrl}/hubs/notifications`;
//     console.log(`Đang kết nối SignalR tới: ${HUB_URL}`);
//     const connection = new HubConnectionBuilder()
//       .withUrl(HUB_URL, {
//         accessTokenFactory: () => {
//             if (typeof window !== 'undefined') {
//                 return localStorage.getItem('accessToken') || '';
//             }
//             return '';
//         },
//       })
//       .withAutomaticReconnect()
//       .build();
//     connection.start()
//       .then(() => {
//         console.log("✅ Đã kết nối SignalR NotificationHub");
//         connectionRef.current = connection;
//         connection.on("ReceivePaymentStatus", (receivedId, status) => {
//           console.log(`🔔 SignalR Event: ID=${receivedId}, Status=${status}`);
//           const backendId = String(receivedId).trim().toLowerCase();
//           const currentId = String(orderId).trim().toLowerCase();
//           const paidStatuses = ["paid", "completed", "success"];
//           if (backendId === currentId && paidStatuses.includes(String(status).toLowerCase())) {
//             console.log("MATCH! Chuyển trạng thái success.");
//             handleSuccess();
//           }
//         });
//       })
//       .catch((err) => console.error("❌ Lỗi kết nối SignalR:", err));
//     return () => {
//       if (connectionRef.current && connectionRef.current.state === HubConnectionState.Connected) {
//         connectionRef.current.stop();
//       }
//     };
//     */
//   }, [orderId, handleSuccess, paymentStatus]);

//   // Polling dự phòng (DISABLED - Endpoint không tồn tại)
//   useEffect(() => {
//     // DISABLED: API endpoint /api/payment/status/{orderId} chưa có
//     // Dùng nút "TEST: Đã thanh toán" để giả lập thanh toán thành công
//     console.log("ℹ️ Payment status polling disabled - Use TEST button");
    
//     /* Original Polling code - Uncomment when backend endpoint is ready
//     if (!orderId || paymentStatus === "success" || paymentStatus === "expired") return;
//     let isMounted = true;
//     const checkStatus = async () => {
//       try {
//         if (!orderId) return;
//         const res = await paymentApi.checkStatus(orderId);
//         if (!isMounted) return;
//         const status = res.status?.toLowerCase();
//         if (res.success && ["paid", "completed", "success"].includes(status)) {
//           console.log("Polling success!");
//           await handleSuccess();
//         }
//       } catch (error) {
//         // Silent error
//       }
//     };
//     const intervalId = setInterval(checkStatus, 3000);
//     return () => {
//       isMounted = false;
//       clearInterval(intervalId);
//     };
//     */
//   }, [orderId, paymentStatus, handleSuccess]);

//   // Timer Countdown
//   useEffect(() => {
//     if (paymentStatus !== "pending") return;
//     const timer = setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
//     return () => clearInterval(timer);
//   }, [paymentStatus]);

//   const formatTime = (s: number) =>
//     `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

//   const handleCopy = (text: string) => {
//     if (!text) return;
//     navigator.clipboard.writeText(text);
//     setShowCopiedAlert(true);
//     setTimeout(() => setShowCopiedAlert(false), 2000);
//   };

//   // Log current state for debugging
//   useEffect(() => {
//     console.log("=== CURRENT STATE ===");
//     console.log("OrderId:", orderId);
//     console.log("Amount:", amountParam);
//     console.log("QR URL:", qrCodeUrl);
//     console.log("Is Loading:", isLoadingQR);
//     console.log("Payment Status:", paymentStatus);
//     console.log("Bank Info:", bankInfo);
//   }, [orderId, amountParam, qrCodeUrl, isLoadingQR, paymentStatus, bankInfo]);

//   // --- RENDER UI ---
//   if (paymentStatus === "success") {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-green-50">
//         <div className="text-center p-8 bg-white rounded-2xl shadow-xl animate-in fade-in zoom-in">
//           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//             </svg>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
//           <p className="text-gray-600">Đang chuyển hướng...</p>
//         </div>
//       </div>
//     );
//   }

//   // Nếu không có OrderID, hiện thông báo lỗi thay vì màn hình trắng
//   if (!orderId) {
//     return (
//        <div className="min-h-screen flex items-center justify-center bg-gray-50">
//           <div className="text-center">
//              <h2 className="text-xl font-bold text-red-600">Lỗi: Không tìm thấy mã đơn hàng</h2>
//              <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
//                 Về trang chủ
//              </button>
//           </div>
//        </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4 max-w-4xl">
//         <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Thanh toán QR" }]} />

//         {showCopiedAlert && (
//           <div className="fixed top-20 right-4 z-50 animate-fade-in">
//             <div className="bg-green-500 text-white px-4 py-2 rounded shadow">Đã sao chép!</div>
//           </div>
//         )}

//         <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
//           {/* Cột trái: QR Code */}
//           <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white flex flex-col items-center justify-center text-center">
//             <h2 className="text-2xl font-bold mb-2">Quét mã để thanh toán</h2>
//             <div className="bg-white p-4 rounded-xl shadow-inner mb-6 mt-4">
//               {isLoadingQR ? (
//                 <div className="w-48 h-48 flex items-center justify-center text-gray-400">Đang tạo mã...</div>
//               ) : qrCodeUrl ? (
//                 <div className="w-48 h-48 flex items-center justify-center">
//                   {/* eslint-disable-next-line @next/next/no-img-element */}
//                   <img
//                     src={qrCodeUrl}
//                     alt="QR Code"
//                     className="max-w-full max-h-full rounded-lg object-contain"
//                     onError={(e) => {
//                       console.error("❌ QR Image load error:", e);
//                       console.error("Failed URL:", qrCodeUrl);
//                     }}
//                     onLoad={() => {
//                       console.log("✅ QR Image loaded successfully:", qrCodeUrl);
//                     }}
//                   />
//                 </div>
//               ) : (
//                 <div className="w-48 h-48 flex items-center justify-center text-red-500">
//                   <div className="text-center">
//                     <p className="font-bold">Lỗi tạo QR</p>
//                     <p className="text-xs mt-2">Kiểm tra console</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <div className="text-blue-100 mb-2 bg-white/10 px-4 py-2 rounded-full">
//               Hết hạn: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
//             </div>
//             <p className="text-sm text-blue-200 mt-2">
//               ⚠️ Sau khi chuyển khoản, bấm nút "Đã thanh toán" bên dưới
//             </p>
            
//             {/* TEST BUTTON - Nút giả lập thanh toán */}
//             <div className="mt-6 w-full">
//               <button
//                 onClick={handleTestPayment}
//                 disabled={isConfirmingPayment || (paymentStatus as string) === "success"}
//                 className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
//               >
//                 {isConfirmingPayment ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Đang xác nhận...
//                   </span>
//                 ) : (
//                   "✅ Đã thanh toán"
//                 )}
//               </button>
//               <p className="text-xs text-blue-100 mt-2 text-center">
//                 Bấm nút này sau khi đã chuyển khoản thành công
//               </p>
//             </div>
//           </div>

//           {/* Cột phải: Thông tin */}
//           <div className="p-8 flex flex-col justify-center">
//             <h3 className="text-xl font-bold text-gray-800 mb-6">Thông tin chuyển khoản</h3>
//             <div className="space-y-5">
//               <div className="cursor-pointer group" onClick={() => handleCopy(bankInfo.accountNumber)}>
//                 <label className="text-xs text-gray-500 uppercase font-semibold">Số tài khoản</label>
//                 <p className="font-mono font-bold text-xl text-blue-600 group-hover:text-blue-500">
//                   {bankInfo.accountNumber || "..."}
//                 </p>
//               </div>
//               <div className="cursor-pointer group" onClick={() => handleCopy(amountParam || "")}>
//                 <label className="text-xs text-gray-500 uppercase font-semibold">Số tiền</label>
//                 <p className="font-bold text-2xl text-red-600 group-hover:text-red-500">
//                   {Number(amountParam).toLocaleString("vi-VN")}₫
//                 </p>
//               </div>
//               <div className="cursor-pointer group" onClick={() => handleCopy(bankInfo.content)}>
//                 <label className="text-xs text-gray-500 uppercase font-semibold">
//                   Nội dung <span className="text-red-500">(Bắt buộc)</span>
//                 </label>
//                 <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg font-mono font-bold text-sm break-all mt-1 group-hover:bg-yellow-100 transition">
//                   {bankInfo.content || "..."}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Wrapper Suspense bắt buộc cho Next.js khi dùng useSearchParams
// export default function QRPaymentPage() {
//   return (
//     <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải trang thanh toán...</div>}>
//       <QRPaymentContent />
//     </Suspense>
//   );
// }


"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Breadcrumb } from "@/components/ui";
import { paymentApi } from "@/lib/api/payment";
import { ordersApi } from "@/lib/api/orders"; // Import API đơn hàng để lấy giá chuẩn
import { cartService } from "@/services/cart.service";
import { orderService } from "@/services/order.service"; // Service lấy chi tiết đơn

// Component nội dung chính
function QRPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lấy params từ URL
  const type = searchParams.get("type");
  const rawOrderId = searchParams.get("orderId");
  const orderId = rawOrderId ? rawOrderId.trim() : "";
  
  // State
  const [amount, setAmount] = useState<number>(0); // Số tiền thực tế từ DB
  const [timeLeft, setTimeLeft] = useState(900);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [bankInfo, setBankInfo] = useState({
    accountNumber: "",
    accountName: "",
    content: "",
  });

  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  // --- 1. LẤY THÔNG TIN ĐƠN HÀNG CHUẨN TỪ DB ---
  useEffect(() => {
    if (!orderId) return;

    const fetchRealOrderAmount = async () => {
      try {
        setIsLoading(true);
        // Gọi API lấy chi tiết đơn hàng để lấy số tiền chốt trong DB
        const orderData = await orderService.getOrderById(orderId);
        
        if (orderData) {
            // Ưu tiên lấy finalAmount (giá cuối), nếu không có thì lấy totalAmount
            // Backend có thể trả về key viết hoa hoặc thường tùy cấu hình
            const rawFinalAmount = (orderData as unknown as Record<string, unknown>).finalAmount;
            const rawTotalAmount = (orderData as unknown as Record<string, unknown>).totalAmount;
            const realAmount = Number(rawFinalAmount ?? rawTotalAmount ?? 0);
            console.log("💰 Giá gốc từ DB:", realAmount);
            setAmount(realAmount);
            // Sau khi có giá chuẩn, mới tạo QR
            await initQR(realAmount);
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin đơn hàng:", err);
        setErrorMsg("Không thể lấy thông tin đơn hàng.");
        setIsLoading(false);
      }
    };

    fetchRealOrderAmount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // --- 2. TẠO MÃ QR VỚI SỐ TIỀN CHUẨN ---
  const initQR = async (realAmount: number) => {
    try {
      console.log("=== CREATING QR CODE ===");
      // Tạo nội dung chuyển khoản: "MUA [Mã Đơn]"
      // Lưu ý: Nội dung CK nên ngắn gọn, không dấu để app ngân hàng dễ đọc
      const desc = `THANHTOAN ${orderId.substring(0, 8)}`; 

      const data = await paymentApi.createQR({
        orderId: orderId, 
        amount: realAmount, // Dùng số tiền lấy từ DB
        description: desc,
      });

      if (data && data.success) {
        setQrCodeUrl(data.qrCodeUrl);
        setBankInfo({
          accountNumber: data.accountNumber,
          accountName: data.accountName,
          content: data.transferContent,
        });
      } else {
         setErrorMsg("Không thể tạo mã QR. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi tạo QR:", error);
      setErrorMsg("Lỗi kết nối đến cổng thanh toán.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. XỬ LÝ KHI THANH TOÁN THÀNH CÔNG ---
  const handleSuccess = useCallback(async () => {
    if (paymentStatus === "success") return; 

    console.log("✅ Thanh toán thành công! Chuyển hướng...");
    setPaymentStatus("success");

    // Nếu là đơn mua hàng, xóa giỏ hàng cho chắc
    if (type === "buy") {
      try { await cartService.clearCart(); } catch { }
    }

    setTimeout(() => {
      // Chuyển sang trang Success với đúng loại đơn
      const successUrl = `/payment/success?type=${type || 'buy'}&orderId=${orderId}`;
      router.push(successUrl);
    }, 1500);
  }, [type, orderId, router, paymentStatus]);

  // --- 4. NÚT GIẢ LẬP THANH TOÁN (Test) ---
  const handleTestPayment = async () => {
    if (!orderId || isConfirming) return;
    
    try {
      setIsConfirming(true);
      console.log("🧪 [TEST] Đang xác nhận thanh toán...");
      
      // Gọi API giả lập trong lib/api/orders.ts (đã sửa ở bước trước)
      await ordersApi.confirmPayment(orderId);
      
      await handleSuccess();
    } catch (error) {
      console.error("❌ Lỗi giả lập:", error);
      alert("Có lỗi khi xác nhận thanh toán.");
    } finally {
      setIsConfirming(false);
    }
  };

  // Timer đếm ngược
  useEffect(() => {
    if (paymentStatus !== "pending") return;
    const timer = setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearInterval(timer);
  }, [paymentStatus]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setShowCopiedAlert(true);
    setTimeout(() => setShowCopiedAlert(false), 2000);
  };

  // --- RENDER UI ---
  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl animate-in fade-in zoom-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
          <p className="text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
             <h2 className="text-xl font-bold text-red-600">Lỗi: Không tìm thấy mã đơn hàng</h2>
             <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Về trang chủ</button>
          </div>
       </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Thanh toán QR" }]} />

        {showCopiedAlert && (
          <div className="fixed top-20 right-4 z-50 animate-fade-in">
            <div className="bg-green-500 text-white px-4 py-2 rounded shadow">Đã sao chép!</div>
          </div>
        )}

        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Cột trái: QR Code */}
          <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold mb-2">Quét mã để thanh toán</h2>
            <div className="bg-white p-4 rounded-xl shadow-inner mb-6 mt-4">
              {isLoading ? (
                <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : errorMsg ? (
                 <div className="w-48 h-48 flex items-center justify-center text-red-500 text-sm">{errorMsg}</div>
              ) : qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-red-500">Lỗi ảnh QR</div>
              )}
            </div>
            
            <div className="text-blue-100 mb-2 bg-white/10 px-4 py-2 rounded-full">
              Hết hạn: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            
            {/* NÚT TEST */}
            <div className="mt-6 w-full">
              <button
                onClick={handleTestPayment}
                disabled={isConfirming || isLoading}
                className="w-full bg-green-400 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isConfirming ? "Đang xử lý..." : "Đã thanh toán (Giả lập)"}
              </button>
            </div>
          </div>

          {/* Cột phải: Thông tin */}
          <div className="p-8 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Thông tin chuyển khoản</h3>
            <div className="space-y-6">
              
              <div className="group cursor-pointer" onClick={() => handleCopy(bankInfo.accountNumber)}>
                <label className="text-xs text-gray-500 uppercase font-semibold">Số tài khoản</label>
                <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-xl text-blue-600 group-hover:text-blue-500 transition">
                    {bankInfo.accountNumber || "..."}
                    </p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600">Copy</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{bankInfo.accountName}</p>
              </div>

              <div className="group cursor-pointer" onClick={() => handleCopy(amount.toString())}>
                <label className="text-xs text-gray-500 uppercase font-semibold">Số tiền cần thanh toán</label>
                <div className="flex items-center gap-2">
                    <p className="font-bold text-2xl text-red-600 group-hover:text-red-500 transition">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                    </p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 group-hover:bg-red-50 group-hover:text-red-600">Copy</span>
                </div>
              </div>

              <div className="group cursor-pointer" onClick={() => handleCopy(bankInfo.content)}>
                <label className="text-xs text-gray-500 uppercase font-semibold">
                  Nội dung chuyển khoản <span className="text-red-500">*</span>
                </label>
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg font-mono font-bold text-sm break-all mt-1 group-hover:bg-yellow-100 transition relative">
                  {bankInfo.content || "..."}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    * Vui lòng nhập chính xác nội dung này để hệ thống tự động kích hoạt.
                </p>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải trang thanh toán...</div>}>
      <QRPaymentContent />
    </Suspense>
  );
}