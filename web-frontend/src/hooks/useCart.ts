'use client';

import { useState, useCallback } from 'react';
import { cartService } from '@/services';
import { Cart, AddToCartRequest, UpdateCartItemRequest } from '@/types/models/cart';

// Helper to convert CartDto to Cart model
function convertCartDto(cartDto: any): Cart {
  return {
    id: cartDto.id || '',
    userId: cartDto.userId || '',
    items: cartDto.items || [],
    totalAmount: cartDto.totalAmount || 0,
    updatedAt: cartDto.updatedAt || new Date().toISOString(),
  };
}

export function useCart(userId?: string) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cartDto = await cartService.getMyCart();
      if (cartDto) {
        setCart(convertCartDto(cartDto));
      } else {
        setCart(null);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải giỏ hàng';
      setError(errorMessage);
      console.error('Failed to load cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addItem = async (request: AddToCartRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const cartDto = await cartService.addToCart({
        bookId: request.bookId,
        quantity: request.quantity,
        userId: userId,
      });
      const updatedCart = convertCartDto(cartDto);
      setCart(updatedCart);
      return updatedCart;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể thêm sản phẩm';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (itemId: string, request: UpdateCartItemRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const cartDto = await cartService.updateCartItemQuantity(itemId, request.quantity);
      const updatedCart = convertCartDto(cartDto);
      setCart(updatedCart);
      return updatedCart;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật sản phẩm';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const cartDto = await cartService.removeCartItem(itemId);
      
      // Update local state with new cart
      if (cartDto) {
        setCart(convertCartDto(cartDto));
      } else {
        // If cart is now empty
        if (cart) {
          setCart({
            ...cart,
            items: [],
            totalAmount: 0,
          });
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa sản phẩm';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await cartService.clearCart();
      setCart(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa giỏ hàng';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getItemCount = () => {
    return cart?.items?.length || 0;
  };

  const getTotalPrice = () => {
    return cart?.totalAmount || 0;
  };

  return {
    cart,
    isLoading,
    error,
    loadCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getItemCount,
    getTotalPrice,
  };
}
