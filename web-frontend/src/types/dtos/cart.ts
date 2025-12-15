// Cart DTOs
export interface CartDto {
  id: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  items: CartItemDto[];
  totalItems: number;
  totalAmount: number;
}

export interface CartItemDto {
  id: string;
  cartId: string;
  bookId: string;
  bookTitle: string;
  bookISBN: string;
  bookImageUrl?: string;
  bookPrice: number;
  quantity: number;
  subtotal: number;
  addedAt: string;
  updatedAt: string;
  authorNames?: string;
  publisherName?: string;
  isAvailable: boolean;
  stockQuantity: number;
}

export interface CreateCartDto {
  userId: string;
}

export interface UpdateCartDto {
  bookId: string;
  quantity: number;
}
