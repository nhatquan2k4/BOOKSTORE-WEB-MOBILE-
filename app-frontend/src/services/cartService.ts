// Cart Service - API calls for shopping cart
import { api } from './apiClient';

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

/**
 * Get current user's cart
 */
export const getMyCart = async (): Promise<Cart | null> => {
  try {
    console.log('🛒 Fetching cart from API...');
    const response = await api.get<any>('/api/Cart');
    
    console.log('📦 Cart API response:', JSON.stringify(response, null, 2));
    
    // Try different response structures
    if (response?.cart) {
      console.log('✅ Found cart in response.cart');
      return response.cart as Cart;
    } else if (response?.Cart) {
      console.log('✅ Found cart in response.Cart');
      return response.Cart as Cart;
    } else if (response?.data?.cart) {
      console.log('✅ Found cart in response.data.cart');
      return response.data.cart as Cart;
    } else if (response?.data) {
      console.log('✅ Found cart in response.data');
      return response.data as Cart;
    } else if (response?.items) {
      // Response might be the cart object directly
      console.log('✅ Found cart as direct response');
      return response as Cart;
    }
    
    console.warn('⚠️ No cart found in response structure');
    return null;
  } catch (error: any) {
    console.error('❌ Error fetching cart:', error);
    console.error('Error details:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (request: AddToCartRequest): Promise<Cart> => {
  try {
    console.log('🛒 Adding to cart:', JSON.stringify(request, null, 2));
    const response = await api.post<any>('/api/Cart/add', request);
    
    console.log('📦 Add to cart response:', JSON.stringify(response, null, 2));
    
    // Response might be wrapped or direct
    if (response?.data?.cart) {
      return response.data.cart as Cart;
    } else if (response?.data) {
      return response.data as Cart;
    } else if (response?.cart) {
      return response.cart as Cart;
    } else {
      return response as Cart;
    }
  } catch (error: any) {
    console.error('❌ Error adding to cart:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItemQuantity = async (request: UpdateCartItemRequest): Promise<Cart> => {
  try {
    const response = await api.put<any>('/api/Cart/update-quantity', request);
    
    if (response?.data) {
      return response.data as Cart;
    } else {
      return response as Cart;
    }
  } catch (error: any) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (request: RemoveFromCartRequest): Promise<Cart> => {
  try {
    const response = await api.delete<any>('/api/Cart/remove', { data: request });
    
    if (response?.data) {
      return response.data as Cart;
    } else {
      return response as Cart;
    }
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async (): Promise<void> => {
  try {
    await api.delete('/api/Cart/clear');
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Get cart item count
 */
export const getCartItemCount = async (): Promise<number> => {
  try {
    const response = await api.get<any>('/api/Cart/count');
    
    if (response?.itemCount !== undefined) {
      return response.itemCount;
    } else if (response?.ItemCount !== undefined) {
      return response.ItemCount;
    }
    
    return 0;
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return 0;
  }
};

/**
 * Get cart total amount
 */
export const getCartTotal = async (): Promise<number> => {
  try {
    const response = await api.get<any>('/api/Cart/total');
    
    if (response?.totalAmount !== undefined) {
      return response.totalAmount;
    } else if (response?.TotalAmount !== undefined) {
      return response.TotalAmount;
    }
    
    return 0;
  } catch (error) {
    console.error('Error fetching cart total:', error);
    return 0;
  }
};

export default {
  getMyCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartItemCount,
  getCartTotal,
};
