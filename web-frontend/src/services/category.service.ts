import axiosInstance, { handleApiError, PagedResult } from '@/lib/axios';
import { CategoryDto, CategoryTreeDto } from '@/types/dtos';

const CATEGORY_BASE_URL = '/api/category';

export const categoryService = {
  /**
   * Lấy tất cả danh mục với phân trang
   */
  async getCategories(pageNumber: number = 1, pageSize: number = 50): Promise<PagedResult<CategoryDto>> {
    try {
      const response = await axiosInstance.get<PagedResult<CategoryDto>>(CATEGORY_BASE_URL, {
        params: { pageNumber, pageSize },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy cây danh mục (hierarchical)
   */
  async getCategoryTree(): Promise<CategoryTreeDto[]> {
    try {
      const response = await axiosInstance.get<CategoryTreeDto[]>(`${CATEGORY_BASE_URL}/tree`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy chi tiết danh mục
   */
  async getCategoryById(id: string): Promise<CategoryDto> {
    try {
      const response = await axiosInstance.get<CategoryDto>(`${CATEGORY_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Lấy danh mục con
   */
  async getSubCategories(parentId: string): Promise<CategoryDto[]> {
    try {
      const response = await axiosInstance.get<CategoryDto[]>(`${CATEGORY_BASE_URL}/${parentId}/subcategories`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
