"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Mail, RefreshCw, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api/identity/auth";

type VerificationStatus = "verifying" | "success" | "error";
type ResendStatus = "idle" | "sending" | "sent";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus("error");
      setMessage("Token xác minh không hợp lệ");
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus("verifying");
      const response = await authApi.verifyEmail(verificationToken);

      if (response.success) {
        setStatus("success");
        setMessage(response.message || "Xác minh email thành công!");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(response.message || "Xác minh email thất bại");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Đã xảy ra lỗi khi xác minh email. Token có thể đã hết hạn hoặc không hợp lệ."
      );
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage("Vui lòng nhập địa chỉ email");
      return;
    }

    try {
      setResendStatus("sending");
      const response = await authApi.resendVerificationEmail(email);

      if (response.success) {
        setResendStatus("sent");
        setMessage(
          "Email xác minh mới đã được gửi! Vui lòng kiểm tra hộp thư của bạn."
        );
      } else {
        setResendStatus("idle");
        setMessage(response.message || "Không thể gửi lại email xác minh");
      }
    } catch (error: any) {
      setResendStatus("idle");
      setMessage(
        error.response?.data?.message ||
          "Đã xảy ra lỗi khi gửi lại email xác minh"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Xác Minh Email
            </h1>
          </div>

          {/* Verifying State */}
          {status === "verifying" && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">
                Đang xác minh email của bạn...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Xác Minh Thành Công!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Đang chuyển hướng đến trang đăng nhập...
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Đăng Nhập Ngay
                </Link>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Xác Minh Thất Bại
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>

              {/* Resend Email Form */}
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <p className="text-sm text-gray-700 mb-4">
                  Nhập email để nhận mã xác minh mới:
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-3"
                />
                <button
                  onClick={handleResendEmail}
                  disabled={resendStatus === "sending"}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resendStatus === "sending" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang gửi...
                    </>
                  ) : resendStatus === "sent" ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Đã Gửi
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Gửi Lại Email Xác Minh
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <Link
                  href="/login"
                  className="inline-block w-full text-blue-600 hover:text-blue-700 font-medium"
                >
                  Quay Lại Đăng Nhập
                </Link>
                <Link
                  href="/register"
                  className="inline-block w-full text-gray-600 hover:text-gray-700 text-sm"
                >
                  Đăng Ký Tài Khoản Mới
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Cần trợ giúp?{" "}
            <a href="mailto:support@bookstore.vn" className="text-blue-600 hover:text-blue-700 font-medium">
              Liên hệ hỗ trợ
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
