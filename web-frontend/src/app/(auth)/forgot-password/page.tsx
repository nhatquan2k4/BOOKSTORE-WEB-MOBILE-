"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { authService } from "@/services";
import { AuthCard, AuthCardIcon } from "@/components/auth";
import { FormField, FormLabel, FormError } from "@/components/auth";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  getInputClassName,
  authButtonStyles,
  authLinkStyles,
  authContainerStyles,
  authAlertStyles,
} from "@/constants/authStyles";

type ForgotPasswordFormData = {
  email: string;
};

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>();
  
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const response = await authService.forgotPassword(data.email);
      
      setEmailSent(true);
      setSuccessMessage(
        response.message || 
        `Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến ${data.email}. Vui lòng kiểm tra hộp thư của bạn.`
      );
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 
        err?.message || 
        "Có lỗi xảy ra. Vui lòng thử lại."
      );
    }
  };

  const icon = (
    <AuthCardIcon>
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </AuthCardIcon>
  );

  return (
    <AuthCard
      title="Quên mật khẩu?"
      subtitle={emailSent ? "Kiểm tra email của bạn" : "Nhập email để nhận link đặt lại mật khẩu"}
      icon={icon}
    >
      {/* Success Alert */}
      {successMessage && (
        <Alert variant="success" className="mb-6">
          <p className="text-sm font-medium">{successMessage}</p>
        </Alert>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="danger" className="mb-6" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      {!emailSent ? (
        <>
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <FormField>
              <FormLabel htmlFor="email" required>
                Địa chỉ email
              </FormLabel>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                autoFocus
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ",
                  },
                })}
                className={getInputClassName(!!errors.email)}
              />
              {errors.email && <FormError>{errors.email.message}</FormError>}
            </FormField>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className={authButtonStyles.primary}
              loading={isSubmitting}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Gửi link đặt lại mật khẩu
            </Button>
          </form>

          {/* Info Box */}
          <Alert variant="info" className="mt-6">
            <p className="text-sm">
              Link đặt lại mật khẩu sẽ được gửi đến email của bạn và có hiệu lực trong 1 giờ.
            </p>
          </Alert>
        </>
      ) : (
        <>
          {/* Success Actions */}
          <div className="space-y-4">
            <Button
              variant="outline"
              className={authButtonStyles.outline}
              onClick={() => {
                setEmailSent(false);
                setSuccessMessage("");
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Gửi lại email
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>Không nhận được email?</p>
              <p className="mt-1">Kiểm tra thư mục spam hoặc thử lại sau vài phút.</p>
            </div>
          </div>
        </>
      )}

      {/* Divider */}
      <div className={authContainerStyles.divider}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-600">Hoặc</span>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center space-y-3">
        <Link
          href="/login"
          className={authLinkStyles.semibold}
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Quay lại đăng nhập
        </Link>
      </div>

      {/* Back to Home */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className={authLinkStyles.subtle}
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay về trang chủ
        </Link>
      </div>
    </AuthCard>
  );
}
