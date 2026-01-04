// Wishlist Types

/**
 * Wishlist item with full book details
 */
export interface WishlistItem {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
  bookTitle: string;
  bookISBN?: string;
  bookImageUrl?: string;
  bookPrice?: number;
  bookDiscountPrice?: number;
  authorNames?: string;
  publisherName?: string;
}

/**
 * Wishlist summary with total count and book IDs
 */
export interface WishlistSummary {
  totalItems: number;
  bookIds: string[];
}

/**
 * Wishlist count response
 */
export interface WishlistCountResponse {
  count: number;
}

/**
 * Book exists in wishlist response
 */
export interface BookInWishlistResponse {
  exists: boolean;
}

/**
 * Add to wishlist response
 */
export interface AddToWishlistResponse {
  message: string;
  data: WishlistItem;
}
