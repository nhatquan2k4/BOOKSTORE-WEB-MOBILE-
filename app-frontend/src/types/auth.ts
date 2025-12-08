// Types dựa trên DTOs từ backend API

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Response types
export interface UserInfo {
  id: string;
  userName: string;
  email: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: UserInfo;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  message: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Service result type
export interface ServiceResult<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Token storage
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}
