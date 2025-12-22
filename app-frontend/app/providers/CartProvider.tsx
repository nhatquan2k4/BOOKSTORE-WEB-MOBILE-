import React, { createContext, useContext, useMemo, useState } from 'react';

type CartItem = {
  id: string | number; // Support both UUID string and number
  title: string;
  price: number;
  quantity: number;
  selected?: boolean;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (item: { id: string | number; title: string; price: number }) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
  toggleSelect: (id: string | number) => void;
  setQuantity: (id: string | number, qty: number) => void;
  selectAll: (value: boolean) => void;
  totalCount: number; // selected quantity sum
  totalPrice: number; // selected total amount
  selectedRowCount: number; // number of selected rows
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: { id: string | number; title: string; price: number }) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
  return [...prev, { ...item, quantity: 1, selected: false }];
    });
  };

  const toggleSelect = (id: string | number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)));
  };

  const setQuantity = (id: string | number, qty: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, qty) } : p)));
  };

  const selectAll = (value: boolean) => {
    setItems((prev) => prev.map((p) => ({ ...p, selected: value })));
  };

  const removeFromCart = (id: string | number) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => setItems([]);

  const totalCount = useMemo(() => items.reduce((s, i) => s + (i.selected ? i.quantity : 0), 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, i) => s + (i.selected ? i.price * i.quantity : 0), 0), [items]);
  const selectedRowCount = useMemo(() => items.reduce((s, i) => s + (i.selected ? 1 : 0), 0), [items]);

  const value = { items, addToCart, removeFromCart, clearCart, toggleSelect, setQuantity, selectAll, totalCount, totalPrice, selectedRowCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartProvider;
