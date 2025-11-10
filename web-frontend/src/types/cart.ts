// Cart Types
import type { Book } from './book';

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  bookId: string;
  book?: Book;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

// API Request Types
export interface AddToCartRequest {
  userId: string;
  bookId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity: number;
}
