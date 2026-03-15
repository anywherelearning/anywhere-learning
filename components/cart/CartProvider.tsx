'use client';

import { createContext, useContext, useReducer, useEffect, useState, useCallback, useMemo } from 'react';
import type { CartItem, ByobTier } from '@/lib/cart';
import { loadCart, saveCart, cartTotalCents, cartTotalWithByob, getNextByobTier } from '@/lib/cart';

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
  byobTier: ByobTier | null;
  byobDiscountCents: number;
  byobTotalCents: number;
  nextByobTier: { tier: ByobTier; itemsNeeded: number } | null;
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

  // Load cart from localStorage on mount — drop stale items missing a price ID
  useEffect(() => {
    const loaded = loadCart();
    const valid = loaded.filter((item) => !!item.stripePriceId);
    if (valid.length !== loaded.length) {
      // Some items had empty price IDs (cached before Stripe sync) — remove them
      saveCart(valid);
    }
    dispatch({ type: 'SET_ITEMS', items: valid });
    setIsMounted(true);
  }, []);

  // Sync to localStorage on every items change (skip initial render)
  useEffect(() => {
    if (isMounted) {
      saveCart(state.items);
    }
  }, [state.items, isMounted]);

  // Clear cart on successful purchase return
  // Checkout redirects to /checkout/success?session_id=xxx
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.has('session_id') && window.location.pathname.includes('/checkout/success')) {
      dispatch({ type: 'CLEAR' });
    }
  }, []);

  // Re-open cart when returning from cancelled Stripe checkout (?cart=open)
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('cart') === 'open' && state.items.length > 0) {
      dispatch({ type: 'OPEN' });
      // Clean up the URL param without a reload
      const url = new URL(window.location.href);
      url.searchParams.delete('cart');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [isMounted]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const byob = cartTotalWithByob(state.items);
  const nextTier = getNextByobTier(state.items);

  const value = useMemo<CartContextValue>(() => ({
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
    byobTier: byob.tier,
    byobDiscountCents: byob.discountCents,
    byobTotalCents: byob.totalCents,
    nextByobTier: nextTier,
  }), [state.items, state.isOpen, isMounted, addItem, removeItem, clearCart, isInCart, openCart, closeCart, byob.tier, byob.discountCents, byob.totalCents, nextTier]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
