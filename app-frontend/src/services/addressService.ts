import { api } from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import type { Address, CreateAddressDto, UpdateAddressDto } from '../types/address';

const addressService = {
  /**
   * Lấy danh sách địa chỉ của user hiện tại
   */
  async getMyAddresses(): Promise<Address[]> {
    const response = await api.get(API_ENDPOINTS.USER_PROFILE.ADDRESSES);
    // apiClient already unwraps response.data, so response = { success, data }
    return response.data || [];
  },

  /**
   * Lấy địa chỉ mặc định của user hiện tại
   */
  async getDefaultAddress(): Promise<Address | null> {
    try {
      const response = await api.get(API_ENDPOINTS.USER_PROFILE.DEFAULT_ADDRESS);
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
    const response = await api.post(API_ENDPOINTS.USER_PROFILE.ADDRESSES, data);
    return response.data;
  },

  /**
   * Lấy thông tin địa chỉ theo ID
   */
  async getAddressById(id: string): Promise<Address> {
    const response = await api.get(API_ENDPOINTS.USER_PROFILE.ADDRESS_BY_ID(id));
    return response.data;
  },

  /**
   * Cập nhật địa chỉ
   */
  async updateAddress(id: string, data: UpdateAddressDto): Promise<Address> {
    const response = await api.put(API_ENDPOINTS.USER_PROFILE.ADDRESS_BY_ID(id), data);
    return response.data;
  },

  /**
   * Xóa địa chỉ
   */
  async deleteAddress(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.USER_PROFILE.ADDRESS_BY_ID(id));
  },

  /**
   * Đặt địa chỉ mặc định
   */
  async setDefaultAddress(id: string): Promise<void> {
    await api.put(API_ENDPOINTS.USER_PROFILE.SET_DEFAULT_ADDRESS(id));
  },
};

export default addressService;
