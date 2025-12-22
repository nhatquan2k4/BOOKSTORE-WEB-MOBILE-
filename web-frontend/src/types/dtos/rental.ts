// --- Auth & User ---
export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

// --- Common ---
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// --- Catalog (Book) ---
export interface AuthorDto {
  id: string;
  name: string;
}

export interface CategoryDto {
  id: string;
  name: string;
}

export interface BookImageDto {
  id: string;
  imageUrl: string;
  isMain: boolean;
}

// DTO cho Gói thuê (Được tính toán từ Backend)
export interface RentalPlanDto {
  id: number;
  days: number;
  durationLabel: string;
  price: number;
  savingsPercentage: number;
  isPopular: boolean;
}

export interface BookDetailDto {
  id: string;
  title: string;
  isbn: string;
  description?: string;
  publicationYear: number;
  language: string;
  edition?: string;
  pageCount: number;
  isAvailable: boolean;
  
  publisher?: { id: string; name: string };
  bookFormat?: { id: string; name: string };
  authors?: AuthorDto[];
  categories?: CategoryDto[];
  images?: BookImageDto[];
  
  // Giá bán & Giá giảm
  currentPrice?: number;
  discountPrice?: number;
  
  // Stock
  stockQuantity?: number;
  
  // Review info
  averageRating?: number;
  totalReviews?: number; // Sửa từ reviews thành totalReviews cho khớp backend thường dùng
  
  // --- QUAN TRỌNG: Danh sách gói thuê từ Backend ---
  rentalPlans?: RentalPlanDto[]; 
  
  // Metadata khác
  features?: string[]; // Nếu backend trả về list string tính năng
}

// --- Ordering ---
export interface OrderDto {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  createdAt: string;
  // ... các field khác của Order
}

// DTO gửi đi để tạo đơn thuê
export interface CreateRentalOrderDto {
  bookId: string;
  days: number; // 3, 7, 30...
}

// DTO nhận về sau khi tạo đơn
export interface OrderResponseDto {
  success: boolean;
  orderId: string;
  orderNumber: string;
  amount: number;
  message: string;
}