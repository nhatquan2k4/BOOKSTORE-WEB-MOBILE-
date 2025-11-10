'use client';

import { useState, useCallback } from 'react';
import { cartApi } from '@/lib/api/cart';
import { Cart, AddToCartRequest, UpdateCartItemRequest } from '@/types/cart';

export function useCart(userId?: string) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const cart = await cartApi.getByUserId(userId);
      setCart(cart);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải giỏ hàng';
      setError(errorMessage);
      console.error('Failed to load cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const addItem = async (request: AddToCartRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const cart = await cartApi.addItem(request);
      setCart(cart);
      return cart;
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
      const cart = await cartApi.updateItem(itemId, request);
      setCart(cart);
      return cart;
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
      await cartApi.removeItem(itemId);

      // Remove item from local state
      if (cart) {
        setCart({
          ...cart,
          items: cart.items.filter((item) => item.id !== itemId),
        });
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
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      await cartApi.clear(userId);
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
    return cart?.items.length || 0;
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
