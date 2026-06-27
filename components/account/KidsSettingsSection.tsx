'use client';

import { useEffect, useState } from 'react';
import { loadProfile, type Child } from '@/lib/member-profile';
import KidsSetup from '@/components/account/KidsSetup';

/**
 * The canonical "manage your kids" editor, embedded in Account settings.
 * Reads the profile from localStorage and edits in place. The Save button
 * itself confirms the save (no remount), so it stays put afterwards.
 */
export default function KidsSettingsSection() {
  const [ready, setReady] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    setChildren(loadProfile()?.children ?? []);
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div className="mt-6">
      <KidsSetup
        embedded
        initialChildren={children}
        title="Manage your kids"
        submitLabel="Save changes"
        onDone={() => {}}
      />
    </div>
  );
}
