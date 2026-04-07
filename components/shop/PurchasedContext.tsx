'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const PurchasedContext = createContext<Set<string>>(new Set());

export function PurchasedProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/user/purchases')
      .then((r) => r.json())
      .then((data) => {
        if (data.slugs?.length > 0) setSlugs(new Set(data.slugs));
      })
      .catch(() => {});
  }, []);

  return (
    <PurchasedContext.Provider value={slugs}>
      {children}
    </PurchasedContext.Provider>
  );
}

export function usePurchased() {
  return useContext(PurchasedContext);
}
