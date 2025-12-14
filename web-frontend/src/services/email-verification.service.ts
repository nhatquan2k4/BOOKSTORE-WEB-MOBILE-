import axiosInstance, { handleApiError } from '@/lib/axios';

const BASE_URL = '/api/EmailVerification';

export const emailVerificationService = {
  /**
   * Xác thực email
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/verify`, { token });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Gửi lại email xác thực
   */
  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/resend`, { email });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Kiểm tra trạng thái verification của user
   */
  async getVerificationStatus(userId: string): Promise<{ isVerified: boolean; emailSentAt?: string }> {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/status/${userId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
