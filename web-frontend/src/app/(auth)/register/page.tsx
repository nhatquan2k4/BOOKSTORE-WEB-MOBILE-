"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts";
import type { RegisterRequest } from "@/types/models/user";
import { AuthCard } from "@/components/auth";
import { FormField, FormLabel, FormError } from "@/components/auth";
import { PasswordInput } from "@/components/auth";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  getInputClassName,
  authCheckboxStyles,
  authLinkStyles,
  authButtonStyles,
  authContainerStyles,
} from "@/constants/authStyles";

type RegisterFormData = RegisterRequest & {
  agreeTerms?: boolean;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();
  
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage("");
    setSuccessMessage("");
    
    if (!data.agreeTerms) {
      setErrorMessage("Bạn cần đồng ý với điều khoản sử dụng");
      return;
    }
    
    try {
      // Use auth context register - includes confirmPassword
      await registerUser({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
      });
      
      // Show success message - note: email verification might not work in dev
      setSuccessMessage(
        "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ."
      );
      
      // Redirect to home or dashboard after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      const errorMsg = err?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      
      // Hide SMTP errors from users
      if (errorMsg.includes('SMTP') || errorMsg.includes('email')) {
        setErrorMessage("Email không hợp lệ hoặc đã được sử dụng. Vui lòng thử email khác.");
      } else {
        setErrorMessage(errorMsg);
      }
    }
  };

  return (
    <AuthCard title="Đăng ký" subtitle="Tạo tài khoản mới để bắt đầu">
      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6">
          <Alert variant="success">
            {successMessage}
          </Alert>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Đang chuyển đến trang chủ...
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="danger" className="mb-6" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      {/* Register Form - Hide when success */}
      {!successMessage && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name Field */}
        <FormField>
          <FormLabel htmlFor="fullName" required>
            Họ và tên
          </FormLabel>
          <input
            id="fullName"
            type="text"
            placeholder="Nguyễn Văn A"
            {...register("fullName", {
              required: "Họ tên là bắt buộc",
              minLength: {
                value: 2,
                message: "Họ tên phải có ít nhất 2 ký tự",
              },
            })}
            className={getInputClassName(!!errors.fullName)}
          />
          {errors.fullName && <FormError>{errors.fullName.message}</FormError>}
        </FormField>

        {/* Email Field */}
        <FormField>
          <FormLabel htmlFor="email" required>
            Email
          </FormLabel>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
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

        {/* Phone Number Field */}
        <FormField>
          <FormLabel htmlFor="phoneNumber">
            Số điện thoại
          </FormLabel>
          <input
            id="phoneNumber"
            type="tel"
            placeholder="0123456789"
            {...register("phoneNumber", {
              pattern: {
                value: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ",
              },
            })}
            className={getInputClassName(!!errors.phoneNumber)}
          />
          {errors.phoneNumber && <FormError>{errors.phoneNumber.message}</FormError>}
        </FormField>

        {/* Password Field */}
        <FormField>
          <PasswordInput
            id="password"
            label="Mật khẩu"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register("password", {
              required: "Mật khẩu là bắt buộc",
              minLength: {
                value: 8,
                message: "Mật khẩu phải có ít nhất 8 ký tự",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~;])/,
                message: "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt",
              },
            })}
          />
          <p className="text-xs text-gray-500 mt-1">
            Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (vd: !@#$%^&*.,-)
          </p>
        </FormField>

        {/* Confirm Password Field */}
        <FormField>
          <PasswordInput
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            placeholder="••••••••"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Vui lòng xác nhận mật khẩu",
              validate: (value) =>
                value === password || "Mật khẩu không khớp",
            })}
          />
        </FormField>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="agreeTerms"
            {...register("agreeTerms")}
            className={`${authCheckboxStyles.base} mt-1`}
          />
          <label htmlFor="agreeTerms" className="text-sm text-gray-600 cursor-pointer">
            Tôi đồng ý với{" "}
            <Link href="/terms" className={authLinkStyles.primary}>
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link href="/privacy" className={authLinkStyles.primary}>
              Chính sách bảo mật
            </Link>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className={authButtonStyles.primary}
          loading={isSubmitting}
        >
          Đăng ký
        </Button>
      </form>
      )}

      {/* Divider - Show only when not success */}
      {!successMessage && (
        <>
      <div className={authContainerStyles.divider}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-600">Hoặc</span>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className={authLinkStyles.semibold}
          >
            Đăng nhập ngay
          </Link>
        </p>
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
      </>
      )}
    </AuthCard>
  );
}
