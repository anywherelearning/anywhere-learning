'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { BUNDLE_CONTENTS } from '@/lib/cart';

const PurchasedContext = createContext<Set<string>>(new Set());

/**
 * Expand purchased slugs to include bundles whose children are all owned.
 * e.g. if you bought nature-art-bundle + outdoor-toolkit-bundle, you effectively
 * own outdoor-mega-bundle since all 7 guides are covered.
 */
function expandPurchasedBundles(owned: Set<string>): Set<string> {
  // Collect all individual product slugs the user owns (direct + via bundles)
  const ownedChildren = new Set<string>(owned);
  for (const slug of owned) {
    const children = BUNDLE_CONTENTS[slug];
    if (children) {
      for (const child of children) ownedChildren.add(child);
    }
  }

  // Check every bundle - if all its children are owned, mark the bundle as purchased too
  const expanded = new Set<string>(owned);
  for (const [bundleSlug, children] of Object.entries(BUNDLE_CONTENTS)) {
    if (!expanded.has(bundleSlug) && children.every((c) => ownedChildren.has(c))) {
      expanded.add(bundleSlug);
    }
  }

  return expanded;
}

export function PurchasedProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/user/purchases')
      .then((r) => r.json())
      .then((data) => {
        if (data.slugs?.length > 0) setSlugs(expandPurchasedBundles(new Set(data.slugs)));
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
