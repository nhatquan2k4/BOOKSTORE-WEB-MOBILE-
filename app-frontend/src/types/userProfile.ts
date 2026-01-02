// User Profile types

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileDto {
  fullName?: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}
