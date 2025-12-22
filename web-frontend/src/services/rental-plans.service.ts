import axiosInstance, { handleApiError } from '@/lib/axios';

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
   * Lấy tất cả rental plans
   */
  async getAllPlans(): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(BASE_URL);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Tạo rental plan mới
   */
  async createPlan(dto: CreateRentalPlanDto): Promise<unknown> {
    try {
      const response = await axiosInstance.post(BASE_URL, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh sách plans active
   */
  async getActivePlans(): Promise<unknown[]> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/active`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy plan theo ID
   */
  async getPlanById(id: string): Promise<unknown> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Cập nhật plan
   */
  async updatePlan(id: string, dto: UpdateRentalPlanDto): Promise<unknown> {
    try {
      const response = await axiosInstance.put(`${BASE_URL}/${id}`, dto);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Xóa plan
   */
  async deletePlan(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};
