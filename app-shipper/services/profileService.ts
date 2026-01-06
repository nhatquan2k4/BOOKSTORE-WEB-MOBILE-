import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';

// Profile Interfaces
export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileDto {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  note?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserAddressDto {
  recipientName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  note?: string;
  isDefault?: boolean;
}

export interface UpdateUserAddressDto {
  recipientName?: string;
  phoneNumber?: string;
  province?: string;
  district?: string;
  ward?: string;
  street?: string;
  note?: string;
  isDefault?: boolean;
}

class ProfileService {
  private async getAuthHeader() {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    console.debug('[ProfileService] getAuthHeader token:', token ? '<<present>>' : '<<missing>>');
    if (!token) {
      const err: any = new Error('No access token in storage');
      err.code = 'NO_TOKEN';
      throw err;
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  // ==================== Profile Management ====================

  /**
   * Get current user's profile information
   */
  async getMyProfile(): Promise<UserProfile> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/UserProfile/profile`,
        { headers }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get profile');
      }
    } catch (error: any) {
      console.error('[ProfileService] getMyProfile error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update current user's profile information
   */
  async updateMyProfile(dto: UpdateUserProfileDto): Promise<UserProfile> {
    try {
      const headers = await this.getAuthHeader();
      
      console.log('[ProfileService] updateMyProfile - DTO:', dto);
      
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/UserProfile/profile`,
        dto,
        { 
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('[ProfileService] updateMyProfile - Response:', response.data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('[ProfileService] updateMyProfile error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Better error messages
      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.errors 
          ? Object.values(error.response.data.errors).flat().join(', ')
          : error.response.data?.message || 'Dữ liệu không hợp lệ';
        throw new Error(errorMsg);
      }
      
      throw error;
    }
  }

  /**
   * Upload avatar image
   * @param imageUri - Local URI of the image file
   */
  async uploadAvatar(imageUri: string): Promise<string> {
    try {
      const headers = await this.getAuthHeader();
      
      // Create FormData
      const formData = new FormData();
      
      // Extract filename and determine file type
      let filename = imageUri.split('/').pop() || 'avatar.jpg';
      
      // Handle different URI formats (file://, content://, etc.)
      if (filename.includes('?')) {
        filename = filename.split('?')[0];
      }
      
      const match = /\.(\w+)$/.exec(filename);
      const extension = match ? match[1].toLowerCase() : 'jpg';
      
      // Make sure filename has proper extension
      if (!match) {
        filename = `avatar_${Date.now()}.${extension}`;
      }
      
      const type = `image/${extension === 'jpg' ? 'jpeg' : extension}`;

      console.log('[ProfileService] uploadAvatar - URI:', imageUri);
      console.log('[ProfileService] uploadAvatar - filename:', filename, 'type:', type);

      // Append file to FormData with proper structure for React Native
      const file: any = {
        uri: imageUri,
        name: filename,
        type: type,
      };
      
      formData.append('file', file);

      console.log('[ProfileService] uploadAvatar - Uploading to:', `${API_CONFIG.BASE_URL}/UserProfile/profile/avatar`);

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/UserProfile/profile/avatar`,
        formData,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          },
          // Add timeout for large files
          timeout: 30000,
        }
      );

      console.log('[ProfileService] uploadAvatar - Response status:', response.status);
      console.log('[ProfileService] uploadAvatar - Response data:', response.data);

      if (response.data.success) {
        return response.data.data.avatarUrl;
      } else {
        throw new Error(response.data.message || 'Failed to upload avatar');
      }
    } catch (error: any) {
      console.error('[ProfileService] uploadAvatar error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Provide more specific error messages
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'File không hợp lệ');
      } else if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      } else if (error.response?.status === 413) {
        throw new Error('File quá lớn (tối đa 5MB)');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Không thể upload ảnh');
      }
    }
  }

  /**
   * Delete current avatar
   */
  async deleteAvatar(): Promise<void> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}/UserProfile/profile/avatar`,
        { headers }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete avatar');
      }
    } catch (error: any) {
      console.error('[ProfileService] deleteAvatar error:', error.response?.data || error.message);
      throw error;
    }
  }

  // ==================== Address Management ====================

  /**
   * Get all addresses of current user
   */
  async getMyAddresses(): Promise<UserAddress[]> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/UserProfile/addresses`,
        { headers }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get addresses');
      }
    } catch (error: any) {
      console.error('[ProfileService] getMyAddresses error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get default address
   */
  async getDefaultAddress(): Promise<UserAddress> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/UserProfile/addresses/default`,
        { headers }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get default address');
      }
    } catch (error: any) {
      console.error('[ProfileService] getDefaultAddress error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get address by ID
   */
  async getAddressById(id: string): Promise<UserAddress> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/UserProfile/addresses/${id}`,
        { headers }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get address');
      }
    } catch (error: any) {
      console.error('[ProfileService] getAddressById error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Add new address
   */
  async addAddress(dto: CreateUserAddressDto): Promise<UserAddress> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/UserProfile/addresses`,
        dto,
        { headers }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add address');
      }
    } catch (error: any) {
      console.error('[ProfileService] addAddress error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update address by ID
   */
  async updateAddress(id: string, dto: UpdateUserAddressDto): Promise<UserAddress> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/UserProfile/addresses/${id}`,
        dto,
        { headers }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update address');
      }
    } catch (error: any) {
      console.error('[ProfileService] updateAddress error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete address by ID
   */
  async deleteAddress(id: string): Promise<void> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}/UserProfile/addresses/${id}`,
        { headers }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete address');
      }
    } catch (error: any) {
      console.error('[ProfileService] deleteAddress error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(id: string): Promise<void> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/UserProfile/addresses/${id}/set-default`,
        {},
        { headers }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to set default address');
      }
    } catch (error: any) {
      console.error('[ProfileService] setDefaultAddress error:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();
export default profileService;
