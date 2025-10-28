// User & Auth Types
export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  isEmailVerified: boolean;
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
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
