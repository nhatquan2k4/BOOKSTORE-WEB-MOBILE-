// Cart types

export interface AddToCartRequest {
  bookId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  bookId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  bookId: string;
}

export interface CartItem {
  bookId: string;
  bookTitle: string;
  bookPrice: number;
  quantity: number;
  imageUrl?: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}
