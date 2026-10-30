import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';
import {
  GRANT_SOURCES,
  GRANT_SOURCE_LABELS,
  grantAccess,
  listGrants,
  revokeGrant,
  type GrantSource,
} from '@/lib/access-grants';

export const metadata: Metadata = {
  title: 'Access grants',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** Comma-separated ADMIN_EMAILS, defaulting to the owner inbox. */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || 'info@anywherelearning.co')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** The signed-in admin's email, or null. Every action re-checks this. */
async function adminEmail(): Promise<string | null> {
  try {
    const u = await currentUser();
    const allowed = adminEmails();
    const match = u?.emailAddresses.find(
      (e) => e.verification?.status === 'verified' && allowed.includes(e.emailAddress.toLowerCase()),
    );
    return match ? match.emailAddress : null;
  } catch {
    return null;
  }
}

async function createGrant(formData: FormData) {
  'use server';
  if (!(await adminEmail())) notFound();
  const str = (k: string) => String(formData.get(k) ?? '').trim();
  const result = await grantAccess({
    email: str('email'),
    months: Number(str('months') || 12),
    source: str('source') as GrantSource,
    firstName: str('firstName') || undefined,
    lastName: str('lastName') || undefined,
    giftFrom: str('giftFrom') || undefined,
    note: str('note') || undefined,
    sendEmail: formData.get('sendEmail') === 'on',
  });
  revalidatePath('/admin/grants');
  if (!result.ok) redirect(`/admin/grants?error=${encodeURIComponent(result.error)}`);
  const until = result.endsAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const msg = `${result.extended ? 'Extended' : 'Granted'} through ${until}.${result.emailed ? ' Welcome email sent.' : ' No email sent.'}${result.warning ? ` Warning: ${result.warning}` : ''}`;
  redirect(`/admin/grants?ok=${encodeURIComponent(msg)}`);
}

async function revoke(formData: FormData) {
  'use server';
  if (!(await adminEmail())) notFound();
  const id = String(formData.get('id') ?? '');
  if (id) await revokeGrant(id);
  revalidatePath('/admin/grants');
  redirect(`/admin/grants?ok=${encodeURIComponent('Grant revoked. Access ended now.')}`);
}

function fmt(d: Date | null) {
  return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
}

/**
 * /admin/grants: give someone membership with no card and no renewal (gifts,
 * Odyssey / charter orders, co-op families, comps). Owner-only: anyone not on
 * ADMIN_EMAILS gets a 404, so the page doesn't advertise itself.
 */
export default async function GrantsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  if (!(await adminEmail())) notFound();
  const { ok, error } = await searchParams;

  let grants: Awaited<ReturnType<typeof listGrants>> = [];
  let loadError: string | null = null;
  try {
    grants = await listGrants();
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Could not load grants.';
  }
  const now = new Date();
  const statusOf = (g: (typeof grants)[number]) =>
    g.revokedAt ? 'Revoked' : g.endsAt <= now ? 'Ended' : g.startsAt > now ? 'Queued' : 'Active';
  const activeCount = grants.filter((g) => statusOf(g) === 'Active').length;

  const input = 'w-full rounded-lg border border-[#D8D4C5] bg-white px-3 py-2 font-body text-[15px] text-[#2F3A2E]';
  const lbl = 'block font-body text-[13px] font-semibold text-[#3d5c3b] mb-1';

  return (
    <main className="min-h-screen bg-cream px-4 py-10 font-body text-[#2F3A2E]">
      <div className="mx-auto max-w-[920px]">
        <h1 className="text-[28px] font-semibold">Access grants</h1>
        <p className="mt-1 text-[15px] text-gray-600">
          Membership with no card and no auto-renewal. Use it for gifts, Odyssey or charter orders, co-op
          families and comps. {activeCount} active right now.
        </p>

        {ok && <p className="mt-5 rounded-lg bg-[#E6EBDF] px-4 py-3 text-[15px] text-[#3d5c3b]">{ok}</p>}
        {error && <p className="mt-5 rounded-lg bg-[#F6E3DC] px-4 py-3 text-[15px] text-[#8a3b22]">{error}</p>}

        <form action={createGrant} className="mt-6 grid gap-4 rounded-2xl border border-[#D8D4C5] bg-white p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={lbl} htmlFor="email">Parent&apos;s email (the person who will use it)</label>
            <input id="email" name="email" type="email" required className={input} />
          </div>
          <div>
            <label className={lbl} htmlFor="firstName">First name (optional)</label>
            <input id="firstName" name="firstName" className={input} />
          </div>
          <div>
            <label className={lbl} htmlFor="lastName">Last name (optional)</label>
            <input id="lastName" name="lastName" className={input} />
          </div>
          <div>
            <label className={lbl} htmlFor="source">Where it came from</label>
            <select id="source" name="source" defaultValue="gift" className={input}>
              {GRANT_SOURCES.map((s) => (
                <option key={s} value={s}>{GRANT_SOURCE_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl} htmlFor="months">Months</label>
            <input id="months" name="months" type="number" min={1} max={36} defaultValue={12} className={input} />
          </div>
          <div>
            <label className={lbl} htmlFor="giftFrom">Gift from (gifts only, shown in the email)</label>
            <input id="giftFrom" name="giftFrom" placeholder="Grandma Jo" className={input} />
          </div>
          <div>
            <label className={lbl} htmlFor="note">Note for you (order #, co-op name)</label>
            <input id="note" name="note" className={input} />
          </div>
          <label className="flex items-center gap-2 text-[14px] sm:col-span-2">
            <input type="checkbox" name="sendEmail" defaultChecked />
            Send the welcome email with a one-tap sign-in link
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-xl bg-[#588157] px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-[#3d5c3b]">
              Grant access
            </button>
          </div>
        </form>

        <h2 className="mt-10 text-[20px] font-semibold">All grants</h2>
        {loadError ? (
          <p className="mt-3 text-[14px] text-[#8a3b22]">
            {loadError} If the table doesn&apos;t exist yet, run <code>npm run db:create-access-grants</code>.
          </p>
        ) : grants.length === 0 ? (
          <p className="mt-3 text-[14px] text-gray-600">No grants yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-[#D8D4C5] bg-white">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="bg-[#f7f5f0] text-[12px] uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Through</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Note</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {grants.map((g) => {
                  const status = statusOf(g);
                  return (
                    <tr key={g.id} className="border-t border-[#EEE9DD] align-top">
                      <td className="px-3 py-2">{g.email}</td>
                      <td className="px-3 py-2">
                        {GRANT_SOURCE_LABELS[g.source as GrantSource] ?? g.source}
                        {g.giftFrom ? <span className="block text-[12px] text-gray-500">from {g.giftFrom}</span> : null}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{fmt(g.endsAt)}</td>
                      <td className="px-3 py-2">{status}</td>
                      <td className="px-3 py-2 text-gray-600">{g.note}</td>
                      <td className="px-3 py-2 text-right">
                        {status === 'Active' || status === 'Queued' ? (
                          <form action={revoke}>
                            <input type="hidden" name="id" value={g.id} />
                            <button type="submit" className="text-[13px] font-semibold text-[#8a3b22] hover:underline">
                              Revoke
                            </button>
                          </form>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
