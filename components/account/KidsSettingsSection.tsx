'use client';

import { useEffect, useState } from 'react';
import { loadProfile, type Child } from '@/lib/member-profile';
import KidsSetup from '@/components/account/KidsSetup';

/**
 * The canonical "manage your kids" editor, embedded in Account settings.
 * Reads the profile from localStorage, edits in place, and confirms on save.
 */
export default function KidsSettingsSection() {
  const [ready, setReady] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [savedAt, setSavedAt] = useState(0);

  useEffect(() => {
    setChildren(loadProfile()?.children ?? []);
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div className="mt-6">
      <KidsSetup
        key={savedAt}
        embedded
        initialChildren={children}
        title="Manage your kids"
        submitLabel="Save changes"
        onDone={() => {
          setChildren(loadProfile()?.children ?? []);
          setSavedAt(Date.now());
        }}
      />
      {savedAt > 0 && (
        <p className="mt-3 font-body text-[13px] text-forest-dark">Saved. Your week will use these.</p>
      )}
    </div>
  );
}
