// src/utils/price.ts

/**
 * Interface cho kết quả trả về sau khi tính toán giá
 */
export interface BookPrice {
  finalPrice: number;      // Giá bán cuối cùng (đã trừ giảm giá nếu có)
  originalPrice: number;   // Giá gốc
  hasDiscount: boolean;    // Có giảm giá hay không
  discountPercent: number; // Phần trăm giảm (VD: 20)
  discountAmount: number;  // Số tiền được giảm (VD: 20.000)
  isValid: boolean;        // Dữ liệu giá có hợp lệ để hiển thị không
}

/**
 * Interface đầu vào (chấp nhận object từ API)
 */
export interface PriceableBook {
  currentPrice?: number | null;
  discountPrice?: number | null;
}

/**
 * Hàm trung tâm giải quyết logic giá
 * @param book - Object sách từ API
 */
export function resolveBookPrice(book: PriceableBook): BookPrice {
  // 1. Validate đầu vào: Nếu null/undefined thì coi là 0
  const currentPrice = book.currentPrice ?? 0;
  const discountPrice = book.discountPrice ?? 0;

  // 2. Guard: Nếu giá gốc <= 0, đánh dấu là không hợp lệ
  if (currentPrice <= 0) {
    // Log warning nhẹ để dev biết (không cần hiện lên UI)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Price Logic] Invalid price detected:', book);
    }
    
    return {
      finalPrice: 0,
      originalPrice: 0,
      hasDiscount: false,
      discountPercent: 0,
      discountAmount: 0,
      isValid: false, // Cờ này quan trọng: UI sẽ dùng để hiện "Liên hệ"
    };
  }

  // 3. Logic giảm giá: Chỉ tính là giảm giá nếu giá giảm > 0 VÀ nhỏ hơn giá gốc
  const hasDiscount = discountPrice > 0 && discountPrice < currentPrice;

  // 4. Tính toán giá cuối cùng
  const finalPrice = hasDiscount ? discountPrice : currentPrice;
  const originalPrice = currentPrice;
  const discountAmount = hasDiscount ? originalPrice - finalPrice : 0;

  // 5. Tính % (Làm tròn xuống - Math.floor để an toàn marketing)
  const discountPercent = hasDiscount 
    ? Math.floor((discountAmount / originalPrice) * 100) 
    : 0;

  return {
    finalPrice,
    originalPrice,
    hasDiscount,
    discountPercent,
    discountAmount,
    isValid: true,
  };
}

/**
 * Format tiền tệ chuẩn Việt Nam (VD: 100.000₫)
 */
export function formatPrice(price: number): string {
  if (!price && price !== 0) return '0₫';
  return price.toLocaleString('vi-VN') + '₫';
}

/**
 * Format tiền tệ dạng đầy đủ (VD: 100.000 VNĐ)
 */
export function formatPriceFull(price: number): string {
  if (!price && price !== 0) return '0 VNĐ';
  return price.toLocaleString('vi-VN') + ' VNĐ';
}