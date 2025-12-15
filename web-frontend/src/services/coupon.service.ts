import axiosInstance, { handleApiError } from '@/lib/axios';

const COUPON_BASE_URL = '/api/coupons';

export interface CouponDto {
  id: string;
  code: string;
  value: number;
  isPercentage: boolean;
  expiration: string;
  isUsed: boolean;
  userId?: string;
  description?: string;
}

export interface ValidateCouponRequest {
  code: string;
  subtotal: number;
}

export interface ValidateCouponResponse {
  success: boolean;
  message: string;
  discountAmount: number;
  coupon: CouponDto;
}

export const couponService = {
  /**
   * Validate coupon code and calculate discount
   * @param code - The coupon code to validate
   * @param subtotal - The cart subtotal amount
   * @returns Validation result with discount amount
   */
  async validateCoupon(
    code: string,
    subtotal: number
  ): Promise<ValidateCouponResponse> {
    try {
      const response = await axiosInstance.post<ValidateCouponResponse>(
        `${COUPON_BASE_URL}/validate`,
        {
          code,
          subtotal,
        }
      );
      return response.data;
    } catch (error) {
      // Return error response with message
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Mã giảm giá không hợp lệ';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get user's available coupons (personal + public)
   * Requires authentication
   * @returns List of available coupons for the current user
   */
  async getMyCoupons(): Promise<CouponDto[]> {
    try {
      const response = await axiosInstance.get<CouponDto[]>(
        `${COUPON_BASE_URL}/my-coupons`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get all public promotional coupons
   * No authentication required
   * @returns List of public coupons
   */
  async getPublicCoupons(): Promise<CouponDto[]> {
    try {
      const response = await axiosInstance.get<CouponDto[]>(
        `${COUPON_BASE_URL}/public`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Format coupon description for display
   * @param coupon - The coupon to format
   * @returns Formatted description string
   */
  formatCouponDescription(coupon: CouponDto): string {
    if (coupon.description) {
      return coupon.description;
    }

    if (coupon.isPercentage) {
      return `Giảm ${coupon.value}% giá trị đơn hàng`;
    } else {
      return `Giảm ${coupon.value.toLocaleString('vi-VN')}₫`;
    }
  },

  /**
   * Check if coupon is expired
   * @param coupon - The coupon to check
   * @returns true if expired, false otherwise
   */
  isExpired(coupon: CouponDto): boolean {
    return new Date(coupon.expiration) < new Date();
  },

  /**
   * Check if coupon is valid for use
   * @param coupon - The coupon to check
   * @returns true if valid, false otherwise
   */
  isValid(coupon: CouponDto): boolean {
    return !coupon.isUsed && !this.isExpired(coupon);
  },

  /**
   * Calculate discount amount
   * @param coupon - The coupon to calculate with
   * @param subtotal - The cart subtotal
   * @returns The discount amount
   */
  calculateDiscount(coupon: CouponDto, subtotal: number): number {
    if (coupon.isPercentage) {
      return (subtotal * coupon.value) / 100;
    } else {
      return Math.min(coupon.value, subtotal);
    }
  },
};
