'use client';

import { useCart } from './CartProvider';

export default function CartIcon() {
  const { itemCount, isMounted, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-forest/5"
      aria-label={`Shopping cart${isMounted && itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? 's' : ''}` : ''}`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-forest"
        aria-hidden="true"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>

      {/* Badge — only renders after hydration to avoid SSR mismatch */}
      {isMounted && itemCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-semibold text-white shadow-sm animate-cart-badge">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}
