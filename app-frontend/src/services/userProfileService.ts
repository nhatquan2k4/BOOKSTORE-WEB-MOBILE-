import { api } from './apiClient';
import { API_BASE_URL, MINIO_BASE_URL, API_ENDPOINTS } from '@/src/config/api';
import type { UserProfile, UpdateUserProfileDto } from '../types/userProfile';

/**
 * Lấy thông tin profile của user hiện tại
 */
export const getMyProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<{ success: boolean; data: UserProfile }>(API_ENDPOINTS.USER_PROFILE.GET);
    const profile = response.data;

    // Smart URL resolution: Handle both relative paths and full URLs
    if (profile?.avatarUrl && typeof profile.avatarUrl === 'string') {
      const url = profile.avatarUrl;
      
      // If relative path (starts with /), prepend MINIO_BASE_URL (not API_BASE_URL!)
      if (url.startsWith('/')) {
        profile.avatarUrl = `${MINIO_BASE_URL}${url}`;
        console.log('🖼️ Avatar URL resolved:', profile.avatarUrl);
      } 
      // If full URL but contains localhost, replace with actual host
      else if (url.startsWith('http') && (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0'))) {
        try {
          const minioHost = new URL(MINIO_BASE_URL).hostname;
          profile.avatarUrl = url.replace(/localhost|127\.0\.0\.1|0\.0\.0\.0/g, minioHost).replace(':9000', `:${new URL(MINIO_BASE_URL).port || '9000'}`);
          console.log('🖼️ Avatar URL normalized:', profile.avatarUrl);
        } catch {
          // ignore
        }
      }
      // Otherwise use as-is (full URL from backend)
    }

    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin profile
 */
export const updateMyProfile = async (dto: UpdateUserProfileDto): Promise<UserProfile> => {
  try {
    const response = await api.put<{ success: boolean; message: string; data: UserProfile }>(
      API_ENDPOINTS.USER_PROFILE.UPDATE,
      dto
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Upload avatar (xóa ảnh cũ tự động)
 */
export const uploadAvatar = async (fileUri: string): Promise<string> => {
  try {
    // Tạo FormData
    const formData = new FormData();
    
    // Lấy tên file và extension từ URI
    const filename = fileUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Thêm file vào FormData
    formData.append('file', {
      uri: fileUri,
      name: filename,
      type: type,
    } as any);

    // Upload
    const response = await api.post<{
      success: boolean;
      message: string;
      data: { avatarUrl: string; fileName: string; size: number };
    }>(API_ENDPOINTS.USER_PROFILE.UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    let avatarUrl = response.data.avatarUrl;
    
    // Smart URL resolution: Handle both relative paths and full URLs
    if (avatarUrl && typeof avatarUrl === 'string') {
      // If relative path (starts with /), prepend MINIO_BASE_URL (not API_BASE_URL!)
      if (avatarUrl.startsWith('/')) {
        avatarUrl = `${MINIO_BASE_URL}${avatarUrl}`;
        console.log('🖼️ Uploaded avatar URL resolved:', avatarUrl);
      }
      // If full URL but contains localhost, replace with actual host
      else if (avatarUrl.startsWith('http') && (avatarUrl.includes('localhost') || avatarUrl.includes('127.0.0.1') || avatarUrl.includes('0.0.0.0'))) {
        try {
          const minioHost = new URL(MINIO_BASE_URL).hostname;
          avatarUrl = avatarUrl.replace(/localhost|127\.0\.0\.1|0\.0\.0\.0/g, minioHost).replace(':9000', `:${new URL(MINIO_BASE_URL).port || '9000'}`);
          console.log('🖼️ Uploaded avatar URL normalized:', avatarUrl);
        } catch {
          // ignore
        }
      }
      // Otherwise use as-is (full URL from backend)
    }

    return avatarUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Xóa avatar
 */
export const deleteAvatar = async (): Promise<void> => {
  try {
    await api.delete(API_ENDPOINTS.USER_PROFILE.DELETE_AVATAR);
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
};

export default {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  deleteAvatar,
};
