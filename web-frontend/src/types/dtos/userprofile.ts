export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

// Map với UserProfileDto.cs
export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string; // DateTime? bên C# sang JSON thường là string ISO
  gender?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
}

// DTO để cập nhật Profile (Dựa trên tham số UpdateUserProfileDto bên C#)
export interface UpdateUserProfileDto {
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  // Optional avatar URL (frontend will send this when user uploads a new avatar)
  avatarUrl?: string;
  bio?: string;
}

// DTO Địa chỉ (Tôi suy luận từ các trường thông dụng, bạn cần check lại UserAddressDto bên C#)
export interface UserAddress {
  id: string;
  receiverName: string;
  phoneNumber: string;
  addressLine: string; // Số nhà, tên đường
  ward?: string;
  district?: string;
  city: string;
  isDefault: boolean;
}

// DTO Tạo mới địa chỉ
export interface CreateUserAddressDto {
  receiverName: string;
  phoneNumber: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city: string;
  isDefault?: boolean;
}