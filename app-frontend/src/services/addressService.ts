import { api } from './apiClient';

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressDto {
  recipientName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault?: boolean;
}

export interface UpdateAddressDto {
  recipientName?: string;
  phoneNumber?: string;
  province?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
  isDefault?: boolean;
}

const addressService = {
  /**
   * Lấy danh sách địa chỉ của user hiện tại
   */
  async getMyAddresses(): Promise<Address[]> {
    const response = await api.get('/api/UserProfile/addresses');
    // apiClient already unwraps response.data, so response = { success, data }
    return response.data || [];
  },

  /**
   * Lấy địa chỉ mặc định của user hiện tại
   */
  async getDefaultAddress(): Promise<Address | null> {
    try {
      const response = await api.get('/api/UserProfile/addresses/default');
      return response.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // chưa có địa chỉ mặc định
      }
      throw error;
    }
  },

  /**
   * Thêm địa chỉ mới
   */
  async addAddress(data: CreateAddressDto): Promise<Address> {
    const response = await api.post('/api/UserProfile/addresses', data);
    return response.data;
  },

  /**
   * Lấy thông tin địa chỉ theo ID
   */
  async getAddressById(id: string): Promise<Address> {
    const response = await api.get(`/api/UserProfile/addresses/${id}`);
    return response.data;
  },

  /**
   * Cập nhật địa chỉ
   */
  async updateAddress(id: string, data: UpdateAddressDto): Promise<Address> {
    const response = await api.put(`/api/UserProfile/addresses/${id}`, data);
    return response.data;
  },

  /**
   * Xóa địa chỉ
   */
  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/api/UserProfile/addresses/${id}`);
  },

  /**
   * Đặt địa chỉ mặc định
   */
  async setDefaultAddress(id: string): Promise<void> {
    await api.put(`/api/UserProfile/addresses/${id}/set-default`);
  },
};

export default addressService;
