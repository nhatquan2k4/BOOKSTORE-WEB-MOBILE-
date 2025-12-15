"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, Suspense } from "react";

// 1. Component con chứa logic chính (dùng useSearchParams)
function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const reason = searchParams.get("reason") || "Giao dịch không thành công";

  useEffect(() => {
    // Log failed payment for analytics
    console.log("Payment failed:", { orderId, reason });
  }, [orderId, reason]);

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
      {/* Error Icon */}
      <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      {/* Message */}
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Thanh toán thất bại
      </h1>
      <p className="text-gray-600 mb-6">{reason}</p>

      {orderId && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
          <p className="font-mono font-semibold text-gray-900">{orderId}</p>
        </div>
      )}

      {/* Common Reasons */}
      <div className="text-left mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="font-semibold text-sm mb-2">Nguyên nhân có thể:</p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Số dư tài khoản không đủ</li>
          <li>• Thông tin thanh toán không chính xác</li>
          <li>• Phiên giao dịch hết hạn</li>
          <li>• Lỗi kết nối ngân hàng</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href={orderId ? `/checkout?orderId=${orderId}` : "/checkout"}
          className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Thử lại thanh toán
        </Link>
        <Link
          href="/cart"
          className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Quay lại giỏ hàng
        </Link>
        <Link
          href="/account/customer-support"
          className="block w-full text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          Liên hệ hỗ trợ
        </Link>
      </div>

      {/* Help Link */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm text-gray-600">
          Cần trợ giúp?{" "}
          <Link href="/faq" className="text-blue-600 hover:underline">
            Xem câu hỏi thường gặp
          </Link>
        </p>
      </div>
    </div>
  );
}

// 2. Fallback UI khi đang tải
function PaymentFailedFallback() {
  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
      <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
      <p className="text-gray-500">Đang tải thông tin lỗi...</p>
    </div>
  );
}

// 3. Component chính Export Default (Có bọc Suspense)
export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Suspense fallback={<PaymentFailedFallback />}>
        <PaymentFailedContent />
      </Suspense>
    </div>
  );
}