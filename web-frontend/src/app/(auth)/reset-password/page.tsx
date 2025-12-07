"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { authService } from "@/services";
import {
  AuthCard,
  AuthCardIcon,
  FormField,
  PasswordInput,
  PasswordRequirements,
} from "@/components/auth";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  authButtonStyles,
  authLinkStyles,
  passwordStrengthColors,
} from "@/constants/authStyles";

type ResetPasswordFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

// 1. Component con chứa logic chính (sử dụng useSearchParams)
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    defaultValues: { email: email || "" },
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const password = watch("password");

  useEffect(() => {
    if (!token || !email) {
      setTokenValid(false);
      setErrorMessage(
        "Link không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link đặt lại mật khẩu mới."
      );
    } else {
      setTokenValid(true);
    }
  }, [token, email]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("Token không hợp lệ.");
      return;
    }

    try {
      const res = await authService.resetPassword(
        token,
        data.password,
        data.confirmPassword
      );

      setSuccessMessage(res.message || "Mật khẩu đã được đặt lại thành công!");

      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2000);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại."
      );
    }
  };

  if (tokenValid === null) {
    return (
      <AuthCard title="Đặt lại mật khẩu" subtitle="Đang xác thực...">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Đang xác thực...</p>
        </div>
      </AuthCard>
    );
  }

  if (tokenValid === false) {
    const icon = (
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M5.062 19h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
    );

    return (
      <AuthCard title="Link không hợp lệ" subtitle={errorMessage} icon={icon}>
        <div className="space-y-4">
          <Link href="/forgot-password">
            <Button variant="primary" className={authButtonStyles.primary}>
              Yêu cầu link mới
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="outline" className={authButtonStyles.ghost}>
              Quay lại đăng nhập
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className={authLinkStyles.subtle}>
            <svg
              className="w-4 h-4 inline mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Quay về trang chủ
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Đặt lại mật khẩu"
      subtitle="Nhập mật khẩu mới của bạn"
      icon={
        <AuthCardIcon>
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </AuthCardIcon>
      }
    >
      {successMessage && (
        <Alert variant="success" className="mb-6">
          <p className="text-sm font-medium">{successMessage}</p>
          <p className="text-sm mt-1">Đang chuyển đến trang đăng nhập...</p>
        </Alert>
      )}

      {errorMessage && (
        <Alert
          variant="danger"
          className="mb-6"
          onClose={() => setErrorMessage("")}
        >
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Hidden email */}
        <input type="hidden" {...register("email")} />

        {/* PASSWORD */}
        <FormField>
          <PasswordInput
            id="password"
            label="Mật khẩu mới"
            required
            error={errors.password?.message}
            {...register("password", {
              required: "Mật khẩu là bắt buộc",
              minLength: { value: 6, message: "Ít nhất 6 ký tự" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: "Phải có chữ hoa, chữ thường và số",
              },
            })}
          />

          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    className={
                      "h-1 flex-1 rounded-full transition-all " +
                      (password.length >= lvl * 2
                        ? password.length < 6
                          ? passwordStrengthColors.weak
                          : password.length < 8
                          ? passwordStrengthColors.medium
                          : passwordStrengthColors.strong
                        : passwordStrengthColors.empty)
                    }
                  />
                ))}
              </div>

              <p className="text-xs text-gray-600">
                {password.length < 6 && "Mật khẩu yếu"}
                {password.length >= 6 &&
                  password.length < 8 &&
                  "Mật khẩu trung bình"}
                {password.length >= 8 && "Mật khẩu mạnh"}
              </p>
            </div>
          )}
        </FormField>

        {/* CONFIRM PASSWORD */}
        <FormField>
          <PasswordInput
            id="confirmPassword"
            label="Xác nhận mật khẩu mới"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Vui lòng xác nhận mật khẩu",
              validate: (value) => value === password || "Mật khẩu không khớp",
            })}
          />
        </FormField>

        <PasswordRequirements password={password || ""} />

        <Button
          type="submit"
          variant="primary"
          className={authButtonStyles.primary}
          loading={isSubmitting}
          disabled={!!successMessage}
        >
          Đặt lại mật khẩu
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link href="/" className={authLinkStyles.subtle}>
          <svg
            className="w-4 h-4 inline mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay về trang chủ
        </Link>
      </div>
    </AuthCard>
  );
}

// 2. Fallback UI khi đang tải useSearchParams
function ResetPasswordFallback() {
  return (
    <AuthCard title="Đặt lại mật khẩu" subtitle="Đang tải dữ liệu...">
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" className="mb-4" />
      </div>
    </AuthCard>
  );
}

// 3. Component chính Export Default (Có bọc Suspense)
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}