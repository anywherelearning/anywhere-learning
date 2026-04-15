'use client';

import { useState } from 'react';

export default function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/subscription/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Portal error:', data.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Portal error:', error);
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="text-xs text-forest underline underline-offset-2 hover:text-forest-dark transition-colors disabled:opacity-50"
    >
      {isLoading ? 'Loading...' : 'Manage subscription'}
    </button>
  );
}
