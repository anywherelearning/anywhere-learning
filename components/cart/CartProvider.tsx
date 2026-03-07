'use client';

import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import type { CartItem } from '@/lib/cart';
import { loadCart, saveCart, cartTotalCents } from '@/lib/cart';

// ─── State & Actions ───

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'SET_ITEMS'; items: CartItem[] }
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; slug: string }
  | { type: 'CLEAR' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items };
    case 'ADD_ITEM':
      if (state.items.some((i) => i.slug === action.item.slug)) return state;
      return { ...state, items: [...state.items, action.item] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.slug !== action.slug) };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

// ─── Context ───

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  isCartOpen: boolean;
  isMounted: boolean;
  addItem: (item: CartItem) => boolean;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  isInCart: (slug: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

// ─── Provider ───

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    dispatch({ type: 'SET_ITEMS', items: loadCart() });
    setIsMounted(true);
  }, []);

  // Sync to localStorage on every items change (skip initial render)
  useEffect(() => {
    if (isMounted) {
      saveCart(state.items);
    }
  }, [state.items, isMounted]);

  // Clear cart on successful purchase return
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      dispatch({ type: 'CLEAR' });
    }
  }, []);

  const addItem = useCallback((item: CartItem): boolean => {
    if (state.items.some((i) => i.slug === item.slug)) return false;
    dispatch({ type: 'ADD_ITEM', item });
    return true;
  }, [state.items]);

  const removeItem = useCallback((slug: string) => {
    dispatch({ type: 'REMOVE_ITEM', slug });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const isInCart = useCallback((slug: string): boolean => {
    return state.items.some((i) => i.slug === slug);
  }, [state.items]);

  const openCart = useCallback(() => dispatch({ type: 'OPEN' }), []);
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE' }), []);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount: state.items.length,
        totalCents: cartTotalCents(state.items),
        isCartOpen: state.isOpen,
        isMounted,
        addItem,
        removeItem,
        clearCart,
        isInCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
