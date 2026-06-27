'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClerk, useUser, useReverification } from '@clerk/nextjs';
import { IS_FOUNDER_PHASE } from '@/lib/membership';
import KidsSettingsSection from '@/components/account/KidsSettingsSection';

interface Member {
  name: string;
  email: string;
  tier: string;
  joinedAt: string;
  nextRenewalAt: string;
  priceLabel: string;
  paymentLast4: string;
  paymentBrand: string;
  status: 'active' | 'trialing' | 'canceling' | 'canceled' | 'past_due' | 'unknown';
  billingPortalAvailable: boolean;
  /** Set when the user actually has subscription history. Starter-Pack-only
   *  buyers don't (no subscription row), so we hide the tab for them. */
  hasSubscription: boolean;
  /** True while on a free trial (not yet charged). */
  isTrialing: boolean;
  /** ISO date the trial converts. Only set when isTrialing. */
  trialEndsAt: string | null;
  /** Whether they locked the founder rate (for trial-upgrade copy). */
  isFounder: boolean;
  /** True when a trial is set to expire at day 14 instead of converting. */
  cancelAtPeriodEnd: boolean;
}

type Tab = 'profile' | 'kids' | 'subscription';

export default function AccountSettings({ member }: { member: Member }) {
  const TABS: { value: Tab; label: string }[] = member.hasSubscription
    ? [
        { value: 'profile', label: 'Profile' },
        { value: 'kids', label: 'Your kids' },
        { value: 'subscription', label: 'Subscription' },
      ]
    : [
        { value: 'profile', label: 'Profile' },
        { value: 'kids', label: 'Your kids' },
      ];

  const [tab, setTab] = useState<Tab>('profile');
  const { signOut } = useClerk();

  async function handleSignOut() {
    await signOut({ redirectUrl: '/' });
  }

  return (
    <main className="bg-cream pb-8">
      {/* Header */}
      <section className="pt-6 md:pt-8 pb-4">
        <div className="mx-auto max-w-[960px] px-6">
          <p className="font-body font-semibold text-[11.5px] uppercase tracking-[0.18em] text-[#C97B5C] inline-flex items-center gap-2.5">
            <span className="w-[22px] h-px bg-[#C97B5C] inline-block" />
            Settings &amp; billing
          </p>
          <h1 className="mt-3 font-display text-[clamp(1.875rem,3.4vw,2.5rem)] leading-[1.08] tracking-[-0.012em]">
            Your{' '}
            <em className="not-italic italic text-forest-dark">account.</em>
          </h1>
          <p className="mt-2 font-body text-[14.5px] text-gray-500">
            Manage your profile, subscription, and email preferences in one place.
          </p>
        </div>
      </section>

      {/* Tab nav */}
      <div className="border-b border-[#D8D4C5]">
        <div className="mx-auto max-w-[960px] px-6">
          <nav aria-label="Account sections" className="flex gap-1 overflow-x-auto overflow-y-hidden">
            {TABS.map((t) => {
              const active = tab === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTab(t.value)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative font-body font-medium text-[14px] px-3 py-3 cursor-pointer bg-transparent border-0 whitespace-nowrap transition-colors ${
                    active ? 'text-forest-dark font-semibold' : 'text-gray-500 hover:text-forest-dark'
                  }`}
                >
                  {t.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-3 right-3 -bottom-px h-[2px] bg-forest rounded"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[960px] px-6 pt-5">
        {/* PROFILE — custom inline form, wired to Clerk via useUser / useClerk.
            Name is editable here. Email + password use Clerk's portal because
            both require verification flows (add → verify → make primary) that
            we shouldn't reinvent. The portal button opens an in-page modal so
            the user never leaves the settings page. */}
        {tab === 'profile' && <ProfileTab fallback={member} />}

        {/* YOUR KIDS */}
        {tab === 'kids' && <KidsSettingsSection />}

        {/* SUBSCRIPTION */}
        {tab === 'subscription' && member.hasSubscription && (
          <SettingsCard
            title="Subscription"
            description="Your membership plan, renewal, and payment method."
          >
            {/* Trial members get a distinct card: clear they're not paying yet,
                with a one-tap path to start membership and unlock downloads. */}
            {member.isTrialing ? (
              <TrialUpgradeCard member={member} />
            ) : (
              <div className="bg-[#E6EBDF] border border-[#C9D3BE] rounded-[12px] p-5 mb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="m-0 font-body font-semibold text-[11.5px] uppercase tracking-[0.16em] text-forest-dark">
                      Current plan
                    </p>
                    <p className="m-0 mt-1.5 font-display italic text-[22px] leading-[1.2] text-ink">
                      {member.tier}
                    </p>
                    <p className="m-0 mt-1 font-body text-[13.5px] text-gray-600">
                      {member.priceLabel}
                      {IS_FOUNDER_PHASE && ' · Founder rate locked in for life'}
                    </p>
                  </div>
                  <StatusBadge status={member.status} />
                </div>
              </div>
            )}

            <StatRow
              label={
                member.isTrialing
                  ? 'Membership starts'
                  : member.status === 'canceling'
                    ? 'Access through'
                    : 'Next renewal'
              }
              value={member.nextRenewalAt}
            />
            <StatRow
              label="Payment method"
              value={
                member.paymentBrand === '—' || member.paymentLast4 === '—'
                  ? 'No card on file'
                  : `${member.paymentBrand} ending in ${member.paymentLast4}`
              }
              action={
                member.billingPortalAvailable
                  ? { label: 'Update', href: '/api/billing/portal' }
                  : undefined
              }
            />
            <StatRow label="Member since" value={member.joinedAt} />

            <FooterRow>
              {member.billingPortalAvailable ? (
                <Link
                  href="/api/billing/portal"
                  className="inline-flex items-center gap-2 border-[1.5px] border-forest text-forest-dark font-body font-semibold py-2.5 px-4 rounded-[10px] text-[13.5px] no-underline hover:bg-[#E6EBDF] transition-all"
                >
                  Manage billing &rarr;
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 border-[1.5px] border-gray-300 text-gray-400 font-body font-semibold py-2.5 px-4 rounded-[10px] text-[13.5px] cursor-not-allowed">
                  Manage billing &rarr;
                </span>
              )}
              {/* Trial members cancel via the trial card above (it sets
                  cancel-at-trial-end with no charge). Showing a second
                  "Cancel subscription" portal link here would be confusing,
                  so it's hidden while trialing. */}
              {member.isTrialing ? null : member.billingPortalAvailable ? (
                <Link
                  href="/api/billing/portal"
                  className="font-body font-medium text-[13px] text-gray-500 no-underline hover:text-forest-dark transition-colors"
                >
                  Cancel subscription
                </Link>
              ) : (
                <Link
                  href="/contact"
                  className="font-body font-medium text-[13px] text-gray-500 no-underline hover:text-forest-dark transition-colors"
                >
                  Need to cancel? Email us
                </Link>
              )}
            </FooterRow>
          </SettingsCard>
        )}

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-[#D8D4C5] flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 font-body text-[13px] text-gray-500">
            Need help?{' '}
            <Link
              href="/contact"
              className="text-forest-dark font-semibold no-underline border-b border-forest/25 hover:text-forest hover:border-forest transition-colors"
            >
              Email support
            </Link>
            .
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="font-body font-medium text-[13px] text-gray-500 bg-transparent border-0 cursor-pointer hover:text-forest-dark transition-colors"
            >
              Sign out
            </button>
            <span aria-hidden="true" className="w-px h-3.5 bg-[#C9C5B7]" />
            <Link
              href="/contact"
              className="font-body font-medium text-[13px] text-gray-500 no-underline hover:text-forest-dark transition-colors"
            >
              Close your account? Email us
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-gold/20 rounded-2xl p-5 md:p-6">
      <h2 className="font-display text-[clamp(1.25rem,2.4vw,1.625rem)] leading-[1.15] tracking-[-0.008em] text-ink m-0">
        {title}
      </h2>
      <p className="m-0 mt-1 mb-4 font-body text-[14px] leading-[1.5] text-gray-500">
        {description}
      </p>
      {children}
    </section>
  );
}

function ProfileTab({ fallback }: { fallback: Member }) {
  const { user, isLoaded } = useUser();

  const [firstName, setFirstName] = useState(user?.firstName || fallback.name.split(/\s+/)[0] || '');
  const [lastName, setLastName] = useState(user?.lastName || fallback.name.split(/\s+/).slice(1).join(' ') || '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasPassword = user?.passwordEnabled;

  // Initialize from Clerk once it loads (in case the fallback was stale)
  if (isLoaded && user && firstName === '' && user.firstName) {
    setFirstName(user.firstName);
  }
  if (isLoaded && user && lastName === '' && user.lastName) {
    setLastName(user.lastName);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setStatus('idle');
    setErrorMsg(null);
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2400);
    } catch (err) {
      console.error('[settings] name update failed:', err);
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard
      title="Profile"
      description="Update your name and avatar. Email and password are managed below."
    >
      <AvatarUploader />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <Field label="First name">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full appearance-none bg-cream border border-[#D8D4C5] rounded-[10px] px-3.5 py-2.5 font-body text-[14.5px] text-ink outline-none focus:border-forest focus:shadow-[0_0_0_3px_rgba(88,129,87,0.18)] transition-all"
          />
        </Field>
        <Field label="Last name">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full appearance-none bg-cream border border-[#D8D4C5] rounded-[10px] px-3.5 py-2.5 font-body text-[14.5px] text-ink outline-none focus:border-forest focus:shadow-[0_0_0_3px_rgba(88,129,87,0.18)] transition-all"
          />
        </Field>
      </div>

      <EmailManager />

      <PasswordManager hasPassword={!!hasPassword} />

      <FooterRow>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isLoaded || saving}
          className="inline-flex items-center gap-2 bg-forest text-cream font-body font-semibold py-2.5 px-5 rounded-xl text-[14.5px] border-0 cursor-pointer hover:bg-forest-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {status === 'saved' && (
          <span className="font-body text-[13px] text-forest-dark font-medium" role="status">
            ✓ Saved
          </span>
        )}
        {status === 'error' && (
          <span className="font-body text-[13px] text-[#7A3D24]" role="alert">
            {errorMsg || 'Could not save. Try again.'}
          </span>
        )}
      </FooterRow>
    </SettingsCard>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <label className="block font-body font-semibold text-[12.5px] uppercase tracking-[0.14em] text-gray-600 mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="m-0 mt-1.5 font-body text-[12.5px] text-gray-500">{hint}</p>}
    </div>
  );
}

function StatRow({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#D8D4C5] last:border-b-0">
      <div>
        <p className="m-0 font-body font-semibold text-[11.5px] uppercase tracking-[0.14em] text-gray-500">
          {label}
        </p>
        <p className="m-0 mt-0.5 font-body text-[14.5px] text-ink">{value}</p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="font-body font-semibold text-[13px] text-forest-dark no-underline border-b border-forest/25 pb-px hover:text-forest hover:border-forest transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

function FooterRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-[#D8D4C5]">
      {children}
    </div>
  );
}


/**
 * Trial member's plan card: makes clear they're on a free trial (not charged),
 * shows when it converts, and offers a one-tap "start membership now" that
 * ends the trial early (charges the saved card) so downloads unlock right away.
 */
function TrialUpgradeCard({ member }: { member: Member }) {
  const [working, setWorking] = useState<null | 'subscribe' | 'cancel' | 'resume'>(null);
  const [error, setError] = useState<string | null>(null);

  const startsLabel = member.nextRenewalAt;
  const priceNumber = member.priceLabel.split('/')[0];
  const ending = member.cancelAtPeriodEnd;

  async function handleSubscribe() {
    setError(null);
    setWorking('subscribe');
    try {
      const res = await fetch('/api/checkout/upgrade-trial', { method: 'POST' });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (res.ok && data.ok) {
        window.location.assign('/account?upgraded=1');
        return;
      }
      setError(data.message || 'Could not start your membership. Please try again.');
      setWorking(null);
    } catch {
      setError('Network error. Please try again.');
      setWorking(null);
    }
  }

  async function handleCancelToggle(resume: boolean) {
    setError(null);
    setWorking(resume ? 'resume' : 'cancel');
    try {
      const res = await fetch('/api/checkout/cancel-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (res.ok && data.ok) {
        window.location.reload();
        return;
      }
      setError(data.message || 'Could not update your trial. Please try again.');
      setWorking(null);
    } catch {
      setError('Network error. Please try again.');
      setWorking(null);
    }
  }

  return (
    <div className="bg-[#E6EBDF] border border-[#C9D3BE] rounded-[12px] p-5 mb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="m-0 font-body font-semibold text-[11.5px] uppercase tracking-[0.16em] text-forest-dark">
            Current plan
          </p>
          <p className="m-0 mt-1.5 font-display italic text-[22px] leading-[1.2] text-ink">
            Free trial
          </p>
          <p className="m-0 mt-1 font-body text-[13.5px] text-gray-600">
            {ending
              ? `Ends ${startsLabel} · You won't be charged`
              : '$0 so far · Read every guide in your browser'}
          </p>
        </div>
        <StatusBadge status="trialing" />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-[12.5px] text-[#7A3D24] bg-[#F7EBE2] border border-[#E8D4C2] rounded-[10px] px-3 py-2">
          {error}
        </p>
      )}

      {ending ? (
        /* Trial set to expire on day 14: reassure + offer to keep it going. */
        <div className="mt-4 pt-4 border-t border-[#C9D3BE]">
          <p className="m-0 font-body text-[13.5px] leading-[1.55] text-gray-700">
            Your trial is set to end on <strong className="text-forest-dark">{startsLabel}</strong>{' '}
            and you won&apos;t be charged. You can keep reading every guide in your browser until
            then. Changed your mind?
          </p>
          <button
            type="button"
            onClick={() => handleCancelToggle(true)}
            disabled={working !== null}
            className="mt-3.5 inline-flex items-center gap-2 border-[1.5px] border-forest text-forest-dark font-body font-semibold text-[13.5px] py-2.5 px-4 rounded-[10px] bg-transparent cursor-pointer hover:bg-[#dfe6d4] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {working === 'resume' ? 'Restoring…' : 'Keep my membership going'}
          </button>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-[#C9D3BE]">
          <p className="m-0 font-body text-[13.5px] leading-[1.55] text-gray-700">
            Want to <strong className="text-forest-dark">download guides as PDFs?</strong> Start your
            membership now and downloads unlock immediately. It&apos;s the same {member.priceLabel}
            {member.isFounder ? ' founder rate' : ''} that begins on {startsLabel} anyway.
          </p>
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={working !== null}
            className="mt-3.5 inline-flex items-center gap-2 bg-forest text-cream font-body font-semibold text-[13.5px] py-2.5 px-4 rounded-[10px] border-0 cursor-pointer hover:bg-forest-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {working === 'subscribe' ? 'Starting your membership…' : `Subscribe now to download · ${priceNumber} today`}
          </button>
          <p className="m-0 mt-3 font-body text-[12.5px] text-gray-500">
            Not for you?{' '}
            <button
              type="button"
              onClick={() => handleCancelToggle(false)}
              disabled={working !== null}
              className="bg-transparent border-0 p-0 font-body text-[12.5px] text-gray-500 underline decoration-gray-300 underline-offset-2 cursor-pointer hover:text-forest-dark disabled:opacity-60"
            >
              {working === 'cancel' ? 'Canceling…' : 'Cancel your trial'}
            </button>
            . You&apos;ll keep access until {startsLabel} and never be charged.
          </p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Member['status'] }) {
  const config: Record<Member['status'], { label: string; bg: string; color: string }> = {
    active: { label: 'Active', bg: '#F2DECF', color: '#7A3D24' },
    trialing: { label: 'Free trial', bg: '#E6EBDF', color: '#3A5A40' },
    canceling: { label: 'Canceling at period end', bg: '#F5E7BC', color: '#7A5E1F' },
    canceled: { label: 'Canceled', bg: '#E5D9D9', color: '#7A3636' },
    past_due: { label: 'Past due', bg: '#F5DBCB', color: '#7A3D24' },
    unknown: { label: 'No subscription', bg: '#F2EFE4', color: '#7B8378' },
  };
  const c = config[status];
  return (
    <span
      className="font-body font-semibold text-[10.5px] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Read-only email display + profile-image manager.
   Email changes/additions go through the Clerk hosted email page if the
   user ever needs them — for now we keep this surface focused.
   ───────────────────────────────────────────────────────────────────── */
function EmailManager() {
  const { user, isLoaded } = useUser();
  if (!isLoaded || !user) {
    return (
      <Field label="Email">
        <div className="text-[13.5px] text-gray-500">Loading…</div>
      </Field>
    );
  }
  const primaryEmail = user.primaryEmailAddress?.emailAddress || "";
  return (
    <Field label="Email">
      <input
        type="email"
        value={primaryEmail}
        disabled
        size={Math.max(primaryEmail.length + 2, 18)}
        className="appearance-none bg-[#F2EFE4] border border-[#D8D4C5] rounded-[10px] px-3.5 py-2.5 font-body text-[14.5px] text-gray-600 outline-none cursor-not-allowed inline-block max-w-full"
      />
    </Field>
  );
}


/* ─────────────────────────────────────────────────────────────────────
   Inline password manager — set / change / remove password.
   ───────────────────────────────────────────────────────────────────── */
function PasswordManager({ hasPassword }: { hasPassword: boolean }) {
  const { user } = useUser();
  const updatePassword = useReverification(
    (params: { newPassword: string; currentPassword?: string; signOutOfOtherSessions?: boolean }) =>
      user!.updatePassword(params),
  );
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function reset() {
    setOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErr(null);
    setInfo(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    if (!user) return;
    if (newPassword.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr('Passwords don’t match.');
      return;
    }
    setBusy(true);
    try {
      await updatePassword({
        newPassword,
        ...(hasPassword ? { currentPassword } : {}),
        signOutOfOtherSessions: true,
      });
      setInfo(hasPassword ? 'Password changed.' : 'Password set. You can now sign in with email + password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setOpen(false), 1600);
    } catch (e) {
      setErr(prettyErr(e, 'Could not update password.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Field
      label="Password"
      hint={
        hasPassword
          ? 'Change your password anytime.'
          : 'You sign in with a magic link. Set a password to also use email + password.'
      }
    >
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 border-[1.5px] border-forest text-forest-dark font-body font-semibold py-2 px-4 rounded-[10px] text-[13.5px] bg-cream hover:bg-[#E6EBDF] transition-all cursor-pointer"
        >
          {hasPassword ? 'Change password' : 'Set a password'} &rarr;
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#F2EFE4] border border-[#D8D4C5] rounded-[10px] p-4 flex flex-col gap-3">
          {hasPassword && (
            <div>
              <label className="block font-body font-semibold text-[11.5px] uppercase tracking-[0.14em] text-gray-600 mb-1.5">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full appearance-none bg-cream border border-[#D8D4C5] rounded-[10px] px-3.5 py-2.5 font-body text-[14.5px] text-ink outline-none focus:border-forest focus:shadow-[0_0_0_3px_rgba(88,129,87,0.18)] transition-all"
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-body font-semibold text-[11.5px] uppercase tracking-[0.14em] text-gray-600 mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full appearance-none bg-cream border border-[#D8D4C5] rounded-[10px] px-3.5 py-2.5 font-body text-[14.5px] text-ink outline-none focus:border-forest focus:shadow-[0_0_0_3px_rgba(88,129,87,0.18)] transition-all"
              />
            </div>
            <div>
              <label className="block font-body font-semibold text-[11.5px] uppercase tracking-[0.14em] text-gray-600 mb-1.5">
                Confirm
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full appearance-none bg-cream border border-[#D8D4C5] rounded-[10px] px-3.5 py-2.5 font-body text-[14.5px] text-ink outline-none focus:border-forest focus:shadow-[0_0_0_3px_rgba(88,129,87,0.18)] transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 bg-forest text-cream font-body font-semibold py-2.5 px-4 rounded-[10px] text-[13.5px] cursor-pointer hover:bg-forest-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? 'Saving…' : hasPassword ? 'Change password' : 'Set password'}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="font-body text-[13px] text-gray-500 hover:text-forest-dark cursor-pointer bg-transparent border-0"
            >
              Cancel
            </button>
            {info && <span className="text-[12.5px] text-forest-dark" role="status">{info}</span>}
            {err && <span className="text-[12.5px] text-[#7A3D24]" role="alert">{err}</span>}
          </div>
          <p className="m-0 text-[11.5px] text-gray-500">
            For your safety, you&apos;ll be signed out of other devices on save.
          </p>
        </form>
      )}
    </Field>
  );
}

/** Pull the friendliest message out of a Clerk or generic error. */
function prettyErr(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === 'object' && e !== null) {
    const obj = e as { errors?: Array<{ longMessage?: string; message?: string }>; message?: string };
    if (Array.isArray(obj.errors) && obj.errors[0]) {
      return obj.errors[0].longMessage || obj.errors[0].message || obj.message || fallback;
    }
    if (obj.message) return obj.message;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

/* ─────────────────────────────────────────────────────────────────────
   Profile-picture uploader. Reads/writes to Clerk's hosted user image —
   Clerk handles storage and CDN. The avatar in the header reads
   user.imageUrl, so updates here flow through automatically.
   ───────────────────────────────────────────────────────────────────── */
function AvatarUploader() {
  const { user, isLoaded } = useUser();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!isLoaded || !user) {
    return (
      <Field label="Profile picture">
        <div className="text-[13.5px] text-gray-500">Loading…</div>
      </Field>
    );
  }

  // `hasImage` is true even when the user has Clerk's auto-generated default
  // avatar. To know if it's a "real" user upload, compare imageUrl against the
  // gravatar/default URLs Clerk uses. Simpler: just check if hasImage is true
  // AND the URL contains a Clerk image storage marker. Good enough.
  const hasUploadedImage =
    user.hasImage && !user.imageUrl?.includes('clerk.com/identicon');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null);
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Quick validation
    if (!file.type.startsWith('image/')) {
      setErr('Pick an image file (JPG, PNG, or GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr('Image is larger than 5 MB. Try a smaller one.');
      return;
    }

    setBusy(true);
    try {
      await user.setProfileImage({ file });
      // Reload so the header bridge picks up the new imageUrl.
      // Without this Clerk's local user object updates but useUser elsewhere
      // doesn't always re-render synchronously.
      await user.reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed. Try again.');
    } finally {
      setBusy(false);
      // Reset the input so re-selecting the same file fires onChange again.
      e.target.value = '';
    }
  }

  async function handleRemove() {
    setErr(null);
    if (!user) return;
    setBusy(true);
    try {
      await user.setProfileImage({ file: null });
      await user.reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not remove image.');
    } finally {
      setBusy(false);
    }
  }

  const initial = (user.firstName || user.fullName || 'M').trim().charAt(0).toUpperCase();

  return (
    <Field label="Profile picture" hint="Square images work best. Up to 5 MB.">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border border-[#D8D4C5] bg-[#F2EFE4] grid place-items-center flex-shrink-0">
          {hasUploadedImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display italic text-[26px] text-forest-dark">{initial}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label
            className={`inline-flex items-center gap-2 border-[1.5px] border-forest text-forest-dark font-body font-semibold py-2 px-4 rounded-[10px] text-[13.5px] bg-cream cursor-pointer hover:bg-[#E6EBDF] transition-all ${
              busy ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {busy ? 'Uploading…' : hasUploadedImage ? 'Change photo' : 'Upload photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={busy}
              className="sr-only"
            />
          </label>
          {hasUploadedImage && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="font-body text-[13px] text-gray-500 bg-transparent border-0 cursor-pointer hover:text-[#7A3D24] transition-colors disabled:opacity-60"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      {err && (
        <p className="m-0 mt-2 text-[12.5px] text-[#7A3D24]" role="alert">
          {err}
        </p>
      )}
    </Field>
  );
}
