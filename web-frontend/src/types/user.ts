// User & Auth Types
export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;

  // Relations
  profile?: UserProfile;
  addresses?: UserAddress[];
  roles?: Role[];
}

export type UserStatus = "Active" | "Suspended" | "Deleted";

export interface UserProfile {
  id: string;
  userId: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  avatarUrl?: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface Role {
  id: string;
  name: string; // "Admin", "Customer", "Shipper"
  description?: string;
}

// Auth Request/Response Types
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

// Backend response structure
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Auth Response from backend (data field)
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  userName: string;
  email: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  avatarUrl?: string;
}
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateAddressRequest {
  recipientName: string;
  phoneNumber: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
  isDefault: boolean;
}
