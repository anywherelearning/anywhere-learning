/**
 * Server half of components/SpamTrap.tsx. A signup is treated as a bot when
 * the hidden `website` field has anything in it, or when the form was
 * submitted faster than a person could type an email.
 *
 * `elapsedMs` missing is allowed on purpose: a tab opened before a deploy
 * still runs the old form code, and it should not lose a real signup.
 */
export const MIN_FORM_MS = 2000;

export function looksLikeBot(body: { website?: unknown; elapsedMs?: unknown }): boolean {
  if (typeof body.website === 'string' && body.website.trim() !== '') return true;
  if (typeof body.elapsedMs === 'number' && body.elapsedMs >= 0 && body.elapsedMs < MIN_FORM_MS) return true;
  return false;
}
