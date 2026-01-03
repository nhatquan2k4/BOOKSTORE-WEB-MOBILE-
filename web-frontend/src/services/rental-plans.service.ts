import axiosInstance, { handleApiError } from '@/lib/axios';
import type { RentalPlanDto } from '@/types/dtos';

const BASE_URL = '/api/rental/plans';

export interface CreateRentalPlanDto {
  name: string;
  description?: string;
  durationDays: number;
  price: number;
  features?: string[];
  isActive?: boolean;
}

export interface UpdateRentalPlanDto {
  name?: string;
  description?: string;
  durationDays?: number;
  price?: number;
  features?: string[];
  isActive?: boolean;
}

export const rentalPlansService = {
  /**
   * Lấy tất cả rental plans (Admin only)
   */
  async getAllPlans(): Promise<RentalPlanDto[]> {
    try {
      const response = await axiosInstance.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error getting all plans:', error);
      return [];
    }
  },

  /**
   * Tạo rental plan mới (Admin only)
   */
  async createPlan(dto: CreateRentalPlanDto): Promise<RentalPlanDto | null> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      console.error('Error creating plan:', error);
      return null;
    }
  },

  /**
   * Lấy danh sách plans active (Public)
   */
  async getActivePlans(type?: string): Promise<RentalPlanDto[]> {
    try {
      const params = type ? { type } : {};
      console.log('[RentalPlansService] Calling API with params:', params);
      
      const response = await axiosInstance.get(`${BASE_URL}/active`, { params });
      
      console.log('[RentalPlansService] API Response:', response.data);
      console.log('[RentalPlansService] Total plans:', response.data?.length || 0);
      
      return response.data;
    } catch (error) {
      console.error('Error getting active plans:', error);
      return [];
    }
  },

  /**
   * Lấy plan theo ID (Public)
   */
  async getPlanById(id: string): Promise<RentalPlanDto | null> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting plan by id:', error);
      return null;
    }
  },

  /**
   * Cập nhật plan (Admin only)
   */
  async updatePlan(id: string, dto: UpdateRentalPlanDto): Promise<RentalPlanDto | null> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      console.error('Error updating plan:', error);
      return null;
    }
  },

  /**
   * Xóa plan (Admin only)
   */
  async deletePlan(id: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      return false;
    }
  },
};
