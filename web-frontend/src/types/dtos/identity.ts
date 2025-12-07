// Identity DTOs - Authentication, Users, Roles, Permissions

// Auth DTOs
export interface LoginDto {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber?: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  userInfo: UserInfoDto;
}

export interface UserInfoDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles: string[];
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordResponseDto {
  success: boolean;
  message: string;
  error: string;
  username: string;
}

// User DTOs
export interface UserDto {
  id: string;
  email: string;
  isActive: boolean;
  createAt: string;
  updatedAt?: string;
  profiles?: UserProfileDto;
  addresses: UserAddressDto[];
  roles: string[];
  devices: UserDeviceDto[];
}

export interface UserSummaryDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isActive: boolean;
  createAt: string;
  roles: string[];
}

export interface UserProfileDto {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
}

export interface UserAddressDto {
  id: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
}

export interface CreateUserAddressDto {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
}

export interface UpdateUserAddressDto {
  recipientName?: string;
  phoneNumber?: string;
  streetAddress?: string;
  ward?: string;
  district?: string;
  province?: string;
  isDefault?: boolean;
}

export interface UserDeviceDto {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: string;
  lastLoginIp: string;
  lastLoginAt: string;
}

export interface CreateUserDeviceDto {
  deviceName: string;
  deviceType: string;
  lastLoginIp: string;
}

// Role DTOs
export interface RoleDto {
  id: string;
  name: string;
  description: string;
  permissionDtos: PermissionDto[];
  userCount: number;
}

// Permission DTOs
export interface PermissionDto {
  id: string;
  name: string;
  description?: string;
  roles?: string[];
}
