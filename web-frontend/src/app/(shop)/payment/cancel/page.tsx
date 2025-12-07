"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

// 1. Component con chứa logic chính (dùng useSearchParams)
function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
      {/* Cancel Icon */}
      <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Message */}
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Đã hủy thanh toán
      </h1>
      <p className="text-gray-600 mb-6">
        Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn vẫn được lưu trong giỏ hàng.
      </p>

      {orderId && (
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
          <p className="font-mono font-semibold text-gray-900">{orderId}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href={orderId ? `/checkout?orderId=${orderId}` : "/checkout"}
          className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Tiếp tục thanh toán
        </Link>
        <Link
          href="/cart"
          className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Xem giỏ hàng
        </Link>
        <Link
          href="/"
          className="block w-full text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          Về trang chủ
        </Link>
      </div>

      {/* Info */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm text-gray-600">
          Sản phẩm trong giỏ hàng sẽ được giữ trong 7 ngày
        </p>
      </div>
    </div>
  );
}

// 2. Fallback UI khi đang tải
function PaymentCancelFallback() {
  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
      <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8 animate-pulse"></div>
      <p className="text-gray-500">Đang tải thông tin...</p>
    </div>
  );
}

// 3. Component chính Export Default (Có bọc Suspense)
export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Suspense fallback={<PaymentCancelFallback />}>
        <PaymentCancelContent />
      </Suspense>
    </div>
  );
}