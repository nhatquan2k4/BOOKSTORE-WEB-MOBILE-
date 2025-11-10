"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { authApi } from "@/lib/api/identity/auth";
import { AuthCard, AuthCardIcon } from "@/components/auth";
import { FormField } from "@/components/auth";
import { PasswordInput } from "@/components/auth";
import { PasswordRequirements } from "@/components/auth";
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
    defaultValues: {
      email: email || "",
    },
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const password = watch("password");

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        setErrorMessage("Link không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link đặt lại mật khẩu mới.");
        return;
      }

      // Token validation will happen when user submits the form
      // For now, just mark as valid if token and email exist
      setTokenValid(true);
    };

    validateToken();
  }, [token, email]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("Token không hợp lệ.");
      return;
    }

    try {
      const response = await authApi.resetPassword({
        email: data.email,
        token: token,
        newPassword: data.password,
        confirmNewPassword: data.confirmPassword,
      });

      if (response.success) {
        setSuccessMessage(
          response.message || "Mật khẩu đã được đặt lại thành công!"
        );
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 2000);
      } else {
        setErrorMessage(
          response.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại."
        );
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        error?.response?.data?.message ||
        error?.message ||
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
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay về trang chủ
          </Link>
        </div>
      </AuthCard>
    );
  }

  const icon = (
    <AuthCardIcon>
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    </AuthCardIcon>
  );

  return (
    <AuthCard title="Đặt lại mật khẩu" subtitle="Nhập mật khẩu mới của bạn" icon={icon}>
      {successMessage && (
        <Alert variant="success" className="mb-6">
          <div>
            <p className="text-sm font-medium">{successMessage}</p>
            <p className="text-sm mt-1">Đang chuyển đến trang đăng nhập...</p>
          </div>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="danger" className="mb-6" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field (hidden but required by API) */}
        <input type="hidden" {...register("email")} />

        <FormField>
          <PasswordInput
            id="password"
            label="Mật khẩu mới"
            placeholder=""
            autoFocus
            required
            error={errors.password?.message}
            {...register("password", {
              required: "Mật khẩu là bắt buộc",
              minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: "Mật khẩu phải có chữ hoa, chữ thường và số",
              },
            })}
          />
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={'h-1 flex-1 rounded-full transition-all ' +
                      (password.length >= level * 2
                        ? password.length < 6 ? passwordStrengthColors.weak : password.length < 8 ? passwordStrengthColors.medium : passwordStrengthColors.strong
                        : passwordStrengthColors.empty)}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600">
                {password.length < 6 && "Mật khẩu yếu"}
                {password.length >= 6 && password.length < 8 && "Mật khẩu trung bình"}
                {password.length >= 8 && "Mật khẩu mạnh"}
              </p>
            </div>
          )}
        </FormField>

        <FormField>
          <PasswordInput
            id="confirmPassword"
            label="Xác nhận mật khẩu mới"
            placeholder=""
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Vui lòng xác nhận mật khẩu",
              validate: (value) => value === password || "Mật khẩu không khớp",
            })}
          />
        </FormField>

        <PasswordRequirements password={password || ''} />

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
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay về trang chủ
        </Link>
      </div>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
