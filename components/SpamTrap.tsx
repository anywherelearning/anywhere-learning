'use client';

import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';

/**
 * Bot guard for every form that posts to /api/subscribe.
 *
 * Two signals, checked server-side in lib/spam-guard.ts:
 * - `website`: a text field people never see. Form-filling bots fill it.
 * - `elapsedMs`: time from the form appearing to submit. A person needs a few
 *   seconds to type an email; a script does it instantly.
 *
 * Added Oct 2026 after generated gmail addresses came in through the blog
 * popup (they ran the page's JavaScript, so GA4 counted them as leads).
 *
 * Usage: `const spam = useSpamGuard();`, render `<SpamTrap inputRef={spam.trapRef} />`
 * inside the <form>, and spread `...spam.fields()` into the request body.
 */
export function useSpamGuard() {
  const trapRef = useRef<HTMLInputElement>(null);
  const shownAt = useRef(0);

  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  const fields = useCallback(
    () => ({
      website: trapRef.current?.value || undefined,
      elapsedMs: shownAt.current ? Date.now() - shownAt.current : undefined,
    }),
    [],
  );

  return useMemo(() => ({ trapRef, fields }), [fields]);
}

export function SpamTrap({ inputRef }: { inputRef: RefObject<HTMLInputElement | null> }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
    >
      <label>
        Website
        <input ref={inputRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
