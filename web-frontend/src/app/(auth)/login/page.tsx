"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { authService } from "@/lib/auth/session";
import type { LoginRequest } from "@/types/user";
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

type LoginFormData = LoginRequest & {
  remember?: boolean;
};

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();
  
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage("");
    try {
      // Use centralized auth service which handles storage/session
      await authService.login({
        email: data.email,
        password: data.password,
      });

      // Redirect to shop
      router.push("/");
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 
        err?.message || 
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    }
  };

  return (
    <AuthCard title="Đăng nhập" subtitle="Chào mừng bạn trở lại!">
      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="danger" className="mb-6" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                value: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự",
              },
            })}
          />
        </FormField>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("remember")}
              className={authCheckboxStyles.base}
            />
            <span className="text-gray-600">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            href="/forgot-password"
            className={authLinkStyles.primary}
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className={authButtonStyles.primary}
          loading={isSubmitting}
        >
          Đăng nhập
        </Button>
      </form>

      {/* Divider */}
      <div className={authContainerStyles.divider}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-600">Hoặc</span>
        </div>
      </div>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className={authLinkStyles.semibold}
          >
            Đăng ký ngay
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
    </AuthCard>
  );
}
