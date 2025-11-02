import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface CartItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  cover: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stock: number;
  selected: boolean;
}

export interface Voucher {
  code: string;
  discount: number; // percentage
  minOrder: number;
  maxDiscount: number;
}

export interface CheckoutData {
  selectedItems: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  appliedVoucher: Voucher | null;
}

interface CartStore {
  // Cart state
  cartItems: CartItem[];
  appliedVoucher: Voucher | null;
  
  // Checkout data
  checkoutData: CheckoutData | null;
  
  // Cart actions
  setCartItems: (items: CartItem[]) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  toggleSelectItem: (itemId: string, selected: boolean) => void;
  selectAll: (selected: boolean) => void;
  clearCart: () => void;
  
  // Voucher actions
  applyVoucher: (voucher: Voucher) => void;
  removeVoucher: () => void;
  
  // Checkout actions
  prepareCheckout: () => CheckoutData;
  clearCheckout: () => void;
  
  // Computed values
  getSelectedItems: () => CartItem[];
  getSubtotal: () => number;
  getDiscount: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cartItems: [],
      appliedVoucher: null,
      checkoutData: null,

      // Cart actions
      setCartItems: (items) => set({ cartItems: items }),

      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cartItems.find((i) => i.bookId === item.bookId);
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.bookId === item.bookId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { cartItems: [...state.cartItems, item] };
        }),

      removeFromCart: (itemId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== itemId),
        })),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === itemId
              ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) }
              : item
          ),
        })),

      toggleSelectItem: (itemId, selected) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === itemId ? { ...item, selected } : item
          ),
        })),

      selectAll: (selected) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) => ({ ...item, selected })),
        })),

      clearCart: () => set({ cartItems: [], appliedVoucher: null }),

      // Voucher actions
      applyVoucher: (voucher) => set({ appliedVoucher: voucher }),

      removeVoucher: () => set({ appliedVoucher: null }),

      // Checkout actions
      prepareCheckout: () => {
        const state = get();
        const selectedItems = state.getSelectedItems();
        const subtotal = state.getSubtotal();
        const discount = state.getDiscount();
        const shippingFee = state.getShippingFee();
        const total = state.getTotal();

        const checkoutData: CheckoutData = {
          selectedItems,
          subtotal,
          discount,
          shippingFee,
          total,
          appliedVoucher: state.appliedVoucher,
        };

        set({ checkoutData });
        return checkoutData;
      },

      clearCheckout: () => set({ checkoutData: null }),

      // Computed values
      getSelectedItems: () => {
        const state = get();
        return state.cartItems.filter((item) => item.selected);
      },

      getSubtotal: () => {
        const state = get();
        const selectedItems = state.getSelectedItems();
        return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getDiscount: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        const voucher = state.appliedVoucher;

        if (!voucher || voucher.discount === 0) return 0;

        const discountAmount = (subtotal * voucher.discount) / 100;
        return Math.min(discountAmount, voucher.maxDiscount);
      },

      getShippingFee: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        const voucher = state.appliedVoucher;

        // Free shipping for orders over 500,000
        if (subtotal >= 500000) return 0;

        // Free shipping voucher
        if (voucher?.discount === 0) {
          return 0;
        }

        // Default shipping fee
        return 30000;
      },

      getTotal: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        const discount = state.getDiscount();
        const shippingFee = state.getShippingFee();

        return subtotal - discount + shippingFee;
      },
    }),
    {
      name: 'cart-storage', // localStorage key
      partialize: (state) => ({
        cartItems: state.cartItems,
        appliedVoucher: state.appliedVoucher,
        checkoutData: state.checkoutData,
      }),
    }
  )
);
