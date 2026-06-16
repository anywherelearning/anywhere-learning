'use client';

/**
 * Brand-styled sign-in flow. Uses Clerk's useSignIn hook directly so we never
 * mount the Clerk widget. Two-column layout on desktop: warm-side copy on the
 * left, sign-in card on the right. Mobile collapses to the card.
 *
 * Stages:
 *   1. identifier    — Google + email + password (or "email me a code")
 *   2. email_code    — verify the 6-digit code, signed in
 *   3. reset_request — enter email to receive a reset code
 *   4. reset_verify  — verify code + set new password
 */

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSignIn, useUser } from '@clerk/nextjs';

type Stage = 'identifier' | 'email_code' | 'reset_request' | 'reset_verify';

// ─── Warm-side copy per stage ─────────────────────────────────────────
const WARM_COPY: Record<
  Stage,
  { eyebrow: string; heading: React.ReactNode; sub: string; list?: string[] }
> = {
  identifier: {
    eyebrow: 'A warm hello',
    heading: (
      <>
        Real-world skills, picked up{' '}
        <em className="not-italic italic text-forest">right where you left off.</em>
      </>
    ),
    sub: "Sign in to keep building life skills with your kids, one hands-on activity at a time.",
    list: [
      '100+ activities across 9 categories',
      'Three difficulty levels, siblings together',
      'Quarterly drops included with membership',
    ],
  },
  email_code: {
    eyebrow: 'A warm hello',
    heading: (
      <>
        One last step.{' '}
        <em className="not-italic italic text-forest">Then you&apos;re in.</em>
      </>
    ),
    sub: "We sent a short code so we don't have to ask for your password. Pop it in on the right and you're signed in.",
  },
  reset_request: {
    eyebrow: 'Forgot password',
    heading: (
      <>
        Happens to the best of us.{' '}
        <em className="not-italic italic text-forest">Let&apos;s fix it.</em>
      </>
    ),
    sub: "We'll send a short code to the email you used when you joined. Type it in on the next screen and pick a new password.",
  },
  reset_verify: {
    eyebrow: 'Reset password',
    heading: (
      <>
        You&apos;re almost back{' '}
        <em className="not-italic italic text-forest">home.</em>
      </>
    ),
    sub: "Choose something memorable. Once it's saved, you'll head straight to your library.",
  },
};

// ─── Decorative botanical sprig ───────────────────────────────────────
function Botanical({ size = 64, opacity = 0.85 }: { size?: number; opacity?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 80 112"
      style={{ display: 'block', opacity }}
      aria-hidden="true"
    >
      <path
        d="M40 110 C 40 90, 40 70, 40 12"
        stroke="#588157"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <g stroke="#588157" strokeWidth="1.1" fill="none" strokeLinecap="round">
        <path d="M40 90 C 26 88, 18 80, 14 70" />
        <path d="M40 90 C 54 88, 62 80, 66 70" />
        <path d="M40 72 C 28 70, 22 62, 20 54" />
        <path d="M40 72 C 52 70, 58 62, 60 54" />
        <path d="M40 54 C 30 52, 26 46, 26 40" />
        <path d="M40 54 C 50 52, 54 46, 54 40" />
        <path d="M40 38 C 32 36, 30 32, 32 28" />
        <path d="M40 38 C 48 36, 50 32, 48 28" />
      </g>
      <g fill="#588157" opacity="0.18">
        <ellipse cx="20" cy="78" rx="10" ry="4" transform="rotate(-30 20 78)" />
        <ellipse cx="60" cy="78" rx="10" ry="4" transform="rotate(30 60 78)" />
        <ellipse cx="25" cy="62" rx="8" ry="3.5" transform="rotate(-30 25 62)" />
        <ellipse cx="55" cy="62" rx="8" ry="3.5" transform="rotate(30 55 62)" />
        <ellipse cx="29" cy="46" rx="7" ry="3" transform="rotate(-30 29 46)" />
        <ellipse cx="51" cy="46" rx="7" ry="3" transform="rotate(30 51 46)" />
      </g>
      <circle cx="40" cy="12" r="3.4" fill="#C97B5C" opacity="0.85" />
      <circle cx="40" cy="12" r="1.6" fill="#FAF8F3" />
    </svg>
  );
}

// ─── Eyebrow chip (rule + uppercase label) ────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-body font-medium text-[11.5px] uppercase tracking-[0.18em] text-forest-dark">
      <span aria-hidden="true" className="inline-block w-[22px] h-px bg-forest" />
      {children}
    </span>
  );
}

/**
 * Resolves the post-sign-in destination.
 *
 * Reads `?redirect_url=…` from the current URL and returns it if it's a safe
 * same-origin path. Falls back to `/account` otherwise. Same-origin guard
 * blocks open-redirect attacks via crafted URLs.
 */
function getPostSignInDestination(): string {
  if (typeof window === 'undefined') return '/account';
  try {
    const raw = new URL(window.location.href).searchParams.get('redirect_url');
    if (!raw) return '/account';
    // Only allow same-origin relative paths. Reject anything starting with a
    // scheme or "//" (protocol-relative) to prevent open-redirect abuse.
    if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
    return '/account';
  } catch {
    return '/account';
  }
}

export default function CustomSignInForm() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const [pending, startTransition] = useTransition();
  const [stage, setStage] = useState<Stage>('identifier');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Carry redirect_url (and any other params) over to sign-up so a new
  // visitor who landed here mid-flow (e.g. trial checkout) keeps their
  // place after creating an account.
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const signUpHref = `/sign-up${qs ? `?${qs}` : ''}`;

  // Already signed in? Forward instead of showing a sign-in form. This
  // happens when the server middleware saw a stale session cookie (e.g.
  // right after minutes spent on Stripe Checkout) and bounced the visitor
  // here, but clerk-js then restored the session client-side. Without this,
  // a signed-in member stares at a "Welcome back" form that can't help them.
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      window.location.replace(getPostSignInDestination());
    }
  }, [userLoaded, isSignedIn]);

  // Magic-link tickets (?__clerk_ticket=…) from the welcome emails. Clerk's
  // prebuilt <SignIn> widget consumes these automatically; this custom form
  // has to do it by hand or the email's "Open my library" button dumps the
  // member on a sign-in form. While the ticket is being exchanged we show a
  // "signing you in" card instead of the form.
  const ticket = searchParams.get('__clerk_ticket');
  const [ticketState, setTicketState] = useState<'idle' | 'working' | 'failed'>(
    ticket ? 'working' : 'idle',
  );
  useEffect(() => {
    if (!ticket || !isLoaded || !signIn || !setActive) return;
    if (isSignedIn) return; // the signed-in forward above handles it
    let cancelled = false;
    (async () => {
      try {
        const result = await signIn.create({ strategy: 'ticket', ticket });
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          window.location.replace(getPostSignInDestination());
          return;
        }
        if (!cancelled) setTicketState('failed');
      } catch {
        if (!cancelled) {
          setTicketState('failed');
          setInfo('That sign-in link has expired or was already used. Sign in below instead.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket, isLoaded, isSignedIn]);

  function clearMessages() {
    setErr(null);
    setInfo(null);
  }

  // ─── Google OAuth ─────────────────────────────────────────────────
  async function handleGoogle() {
    if (!signIn) return;
    clearMessages();
    startTransition(async () => {
      try {
        await signIn.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/sso-callback',
          redirectUrlComplete: getPostSignInDestination(),
        });
      } catch (e) {
        setErr(prettyErr(e, 'Could not start Google sign-in.'));
      }
    });
  }

  // ─── Email + password ─────────────────────────────────────────────
  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn || !setActive) return;
    clearMessages();
    startTransition(async () => {
      try {
        const result = await signIn.create({
          identifier: email.trim(),
          password,
        });
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          window.location.href = getPostSignInDestination();
        } else {
          setErr('Additional verification needed. Try the email code option instead.');
        }
      } catch (e) {
        setErr(prettyErr(e, 'That email or password didn’t work.'));
      }
    });
  }

  // ─── Email code (magic-link alternative) ──────────────────────────
  async function handleSendEmailCode() {
    if (!signIn) return;
    clearMessages();
    if (!email) {
      setErr('Enter your email first.');
      return;
    }
    startTransition(async () => {
      try {
        const result = await signIn.create({ identifier: email.trim() });
        const emailFactor = result.supportedFirstFactors?.find(
          (f) => f.strategy === 'email_code',
        );
        if (!emailFactor) {
          setErr('No email-code option for this account. Try password.');
          return;
        }
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: (emailFactor as { emailAddressId: string }).emailAddressId,
        });
        setStage('email_code');
        setInfo(`We sent a 6-digit code to ${email}.`);
      } catch (e) {
        setErr(prettyErr(e, 'Could not send a sign-in code.'));
      }
    });
  }

  async function handleVerifyEmailCode(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn || !setActive) return;
    clearMessages();
    startTransition(async () => {
      try {
        const result = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: code.trim(),
        });
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          window.location.href = getPostSignInDestination();
        } else {
          setErr('Code accepted, but more verification needed.');
        }
      } catch (e) {
        setErr(prettyErr(e, 'That code didn’t work.'));
      }
    });
  }

  // ─── Forgot password ──────────────────────────────────────────────
  async function handleStartReset(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    clearMessages();
    startTransition(async () => {
      try {
        const result = await signIn.create({ identifier: email.trim() });
        const resetFactor = result.supportedFirstFactors?.find(
          (f) => f.strategy === 'reset_password_email_code',
        );
        if (!resetFactor) {
          setErr('Password reset isn’t available for this account.');
          return;
        }
        await signIn.prepareFirstFactor({
          strategy: 'reset_password_email_code',
          emailAddressId: (resetFactor as { emailAddressId: string }).emailAddressId,
        });
        setStage('reset_verify');
        setInfo(`Reset code sent to ${email}.`);
      } catch (e) {
        setErr(prettyErr(e, 'Could not send a reset code.'));
      }
    });
  }

  async function handleCompleteReset(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn || !setActive) return;
    clearMessages();
    if (newPassword.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    startTransition(async () => {
      try {
        const result = await signIn.attemptFirstFactor({
          strategy: 'reset_password_email_code',
          code: code.trim(),
          password: newPassword,
        });
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          window.location.href = getPostSignInDestination();
        } else {
          setErr('Reset accepted, but additional verification needed.');
        }
      } catch (e) {
        setErr(prettyErr(e, 'That code or password didn’t work.'));
      }
    });
  }

  // ─── Resend the email code ────────────────────────────────────────
  async function handleResendCode() {
    if (!signIn) return;
    clearMessages();
    startTransition(async () => {
      try {
        const emailFactor = signIn.supportedFirstFactors?.find(
          (f) => f.strategy === 'email_code',
        );
        if (!emailFactor) {
          setErr('Could not resend the code. Start over.');
          return;
        }
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: (emailFactor as { emailAddressId: string }).emailAddressId,
        });
        setInfo('A fresh code is on the way.');
      } catch (e) {
        setErr(prettyErr(e, 'Could not resend the code.'));
      }
    });
  }

  // ─── Magic-link exchange in progress ──────────────────────────────
  // Shown instead of the form while a __clerk_ticket is being consumed
  // (and while the already-signed-in forward above is about to fire).
  if (ticketState === 'working') {
    return (
      <div className="mx-auto max-w-[440px] text-center py-20">
        <Botanical size={48} opacity={0.9} />
        <h1 className="mt-5 font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.1] tracking-tight text-ink">
          Signing you <em className="not-italic italic text-forest">in.</em>
        </h1>
        <p className="mt-3 font-body text-[15.5px] text-gray-600">
          One second, opening your library&hellip;
        </p>
      </div>
    );
  }

  // ─── Two-column composition ───────────────────────────────────────
  const warm = WARM_COPY[stage];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] items-center gap-12 lg:gap-20">
      {/* WARM SIDE */}
      <div className="relative max-w-[440px] max-lg:order-2 max-lg:mx-auto max-lg:text-center">
        <div
          aria-hidden="true"
          className="hidden lg:block absolute -left-7 -top-3 origin-top-left"
          style={{ transform: 'rotate(-8deg)' }}
        >
          <Botanical size={64} opacity={0.85} />
        </div>
        <div className="lg:pt-24 max-lg:flex max-lg:justify-center max-lg:mb-2">
          <div className="lg:hidden">
            <Botanical size={42} opacity={0.9} />
          </div>
        </div>
        <div className="max-lg:flex max-lg:flex-col max-lg:items-center">
          <Eyebrow>{warm.eyebrow}</Eyebrow>
        </div>
        <h1 className="mt-3.5 font-display text-[clamp(1.9rem,3.4vw,2.875rem)] leading-[1.04] tracking-[-0.018em] text-ink text-balance">
          {warm.heading}
        </h1>
        <p className="mt-4 max-w-[380px] max-lg:mx-auto font-body text-[16px] leading-[1.6] text-gray-600">
          {warm.sub}
        </p>

        {warm.list && (
          <ul className="mt-6 flex flex-col gap-3 max-lg:items-center">
            {warm.list.map((t) => (
              <li
                key={t}
                className="flex max-lg:justify-center items-start gap-3 font-body text-[14.5px] text-gray-600 leading-[1.55]"
              >
                <span
                  aria-hidden="true"
                  className="flex-none mt-0.5 w-[18px] h-[18px] rounded-full bg-[#E6EBDF] text-forest-dark grid place-items-center text-[10px] font-bold"
                >
                  ✓
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 max-w-[360px] max-lg:mx-auto pt-4 border-t border-dashed border-[#C9C5B7] font-display italic text-[15.5px] text-gray-500">
          Hands-on activities for raising capable kids, ready for real life.
        </p>
      </div>

      {/* SIGN-IN CARD */}
      <div className="max-lg:order-1 w-full lg:w-[440px] mx-auto">
        <div className="relative bg-cream border border-[#D8D4C5] rounded-[18px] px-7 py-9 lg:px-11 lg:pt-10 lg:pb-9 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_24px_48px_-24px_rgba(45,58,46,0.18)]">
          {/* Corner ※ pressed-leaf stamp */}
          <div
            aria-hidden="true"
            className="absolute -top-3.5 right-6 w-9 h-9 rounded-full bg-[#F2DECF] border border-[rgba(201,123,92,0.35)] grid place-items-center font-display italic text-[18px] text-[#7A3D24] shadow-[0_6px_14px_-8px_rgba(201,123,92,0.5)]"
            style={{ transform: 'rotate(6deg)' }}
          >
            ※
          </div>

          {!isLoaded ? (
            <CardSkeleton />
          ) : (
            <>
              <CardHeader stage={stage} email={email} />

              <div className="mt-6">
                {stage === 'identifier' && (
                  <DefaultForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    pending={pending}
                    onGoogle={handleGoogle}
                    onSubmit={handlePasswordSignIn}
                    onSendCode={handleSendEmailCode}
                    onForgot={() => {
                      clearMessages();
                      setStage('reset_request');
                    }}
                  />
                )}

                {stage === 'email_code' && (
                  <CodeForm
                    code={code}
                    setCode={setCode}
                    pending={pending}
                    onSubmit={handleVerifyEmailCode}
                    onResend={handleResendCode}
                    onBack={() => {
                      clearMessages();
                      setStage('identifier');
                      setCode('');
                    }}
                  />
                )}

                {stage === 'reset_request' && (
                  <ForgotForm
                    email={email}
                    setEmail={setEmail}
                    pending={pending}
                    onSubmit={handleStartReset}
                    onBack={() => {
                      clearMessages();
                      setStage('identifier');
                    }}
                  />
                )}

                {stage === 'reset_verify' && (
                  <ResetForm
                    code={code}
                    setCode={setCode}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    pending={pending}
                    onSubmit={handleCompleteReset}
                    onBack={() => {
                      clearMessages();
                      setStage('identifier');
                      setCode('');
                      setNewPassword('');
                    }}
                  />
                )}
              </div>

              {info && (
                <p
                  className="mt-4 text-[12.5px] text-forest-dark font-body"
                  role="status"
                >
                  {info}
                </p>
              )}
              {err && (
                <p
                  className="mt-4 text-[12.5px] text-[#7A3D24] font-body bg-[#F7EBE2] border border-[#E8D4C2] rounded-[10px] px-3 py-2"
                  role="alert"
                >
                  {err}
                </p>
              )}

              <footer className="mt-6 pt-5 border-t border-[#D8D4C5] text-center">
                <p className="m-0 text-[13.5px] text-gray-500">
                  New here?{' '}
                  <Link
                    href={signUpHref}
                    className="text-forest-dark font-semibold border-b border-forest/25 hover:text-forest hover:border-forest transition-colors"
                  >
                    Create your account
                  </Link>
                </p>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card header (eyebrow + headline + sub) per stage ────────────────
function CardHeader({ stage, email }: { stage: Stage; email: string }) {
  const headlines: Record<Stage, React.ReactNode> = {
    identifier: (
      <>
        Pick up <em className="not-italic italic text-forest">where you left off.</em>
      </>
    ),
    email_code: (
      <>
        Check your inbox <em className="not-italic italic text-forest">for the code.</em>
      </>
    ),
    reset_request: (
      <>
        Let&apos;s get you back <em className="not-italic italic text-forest">in.</em>
      </>
    ),
    reset_verify: (
      <>
        Set a new password,{' '}
        <em className="not-italic italic text-forest">then you&apos;re home.</em>
      </>
    ),
  };
  const eyebrows: Record<Stage, string> = {
    identifier: 'Welcome back',
    email_code: 'Step 2 of 2',
    reset_request: 'Forgot password',
    reset_verify: 'Reset password',
  };
  const subs: Record<Stage, React.ReactNode> = {
    identifier:
      'Your library, your activities, your saved skill maps — right where you left them.',
    email_code: (
      <>
        We sent a 6-digit code{email ? <> to <strong className="text-ink font-semibold">{email}</strong></> : null}. It expires in 10 minutes.
      </>
    ),
    reset_request:
      "Type the email you signed up with — we'll send a code so you can choose a new password.",
    reset_verify:
      'Almost done. Enter the 6-digit code from your inbox and choose a new password.',
  };
  return (
    <header>
      <Eyebrow>{eyebrows[stage]}</Eyebrow>
      <h2 className="mt-3.5 font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.08] tracking-[-0.012em] text-ink text-balance">
        {headlines[stage]}
      </h2>
      <p className="mt-3 max-w-[340px] font-body text-[14.5px] leading-[1.55] text-gray-600">
        {subs[stage]}
      </p>
    </header>
  );
}

// ─── Default stage: Google + email + password ────────────────────────
function DefaultForm({
  email,
  setEmail,
  password,
  setPassword,
  pending,
  onGoogle,
  onSubmit,
  onSendCode,
  onForgot,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  pending: boolean;
  onGoogle: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onSendCode: () => void;
  onForgot: () => void;
}) {
  return (
    <>
      <GoogleBtn onClick={onGoogle} disabled={pending} />
      <Divider>or with your email</Divider>

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <FieldGroup label="Email">
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldInputCls}
          />
        </FieldGroup>

        <FieldGroup
          label="Password"
          hint={
            <button
              type="button"
              onClick={onForgot}
              className="font-body text-[12.5px] text-gray-500 border-b border-dashed border-[#C9C5B7] pb-px hover:text-forest-dark hover:border-forest transition-colors bg-transparent cursor-pointer"
            >
              Forgot password?
            </button>
          }
        >
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldInputCls}
          />
        </FieldGroup>

        <PrimaryBtn type="submit" disabled={pending || !email || !password}>
          {pending ? 'Signing in…' : (
            <>
              Sign in
              <span
                aria-hidden="true"
                className="inline-grid place-items-center w-[22px] h-[22px] rounded-full bg-white/20 text-cream text-[13px]"
              >
                →
              </span>
            </>
          )}
        </PrimaryBtn>
      </form>

      <p className="mt-4 text-center font-body text-[13.5px] text-gray-500">
        No password?{' '}
        <button
          type="button"
          onClick={onSendCode}
          disabled={pending}
          className="text-forest-dark font-semibold bg-transparent border-0 cursor-pointer hover:text-forest transition-colors"
        >
          Email me a code instead
        </button>
      </p>
    </>
  );
}

// ─── Email-code stage: 6-digit boxes ─────────────────────────────────
function CodeForm({
  code,
  setCode,
  pending,
  onSubmit,
  onResend,
  onBack,
}: {
  code: string;
  setCode: (v: string) => void;
  pending: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  onBack: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <CodeBoxes value={code} onChange={setCode} />
      <PrimaryBtn type="submit" disabled={pending || code.length !== 6}>
        {pending ? 'Verifying…' : 'Verify & sign in'}
      </PrimaryBtn>
      <div className="mt-1 pt-4 border-t border-dashed border-[#D8D4C5] flex items-center justify-between gap-3">
        <span className="font-body text-[13px] text-gray-500">Didn&apos;t get it?</span>
        <button
          type="button"
          onClick={onResend}
          disabled={pending}
          className="font-body font-semibold text-[13.5px] text-forest-dark bg-transparent border-0 cursor-pointer hover:text-forest transition-colors"
        >
          Resend the code &rarr;
        </button>
      </div>
      <p className="m-0 text-[12.5px] text-gray-500 font-body">
        Wrong email?{' '}
        <button
          type="button"
          onClick={onBack}
          className="text-gray-500 border-b border-dashed border-[#C9C5B7] pb-px hover:text-forest-dark hover:border-forest transition-colors bg-transparent border-0 cursor-pointer"
        >
          Start over
        </button>
      </p>
    </form>
  );
}

// ─── Forgot-password stage ──────────────────────────────────────────
function ForgotForm({
  email,
  setEmail,
  pending,
  onSubmit,
  onBack,
}: {
  email: string;
  setEmail: (v: string) => void;
  pending: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FieldGroup label="Email you signed up with">
        <input
          type="email"
          autoComplete="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldInputCls}
        />
      </FieldGroup>
      <PrimaryBtn type="submit" disabled={pending || !email}>
        {pending ? 'Sending…' : 'Send me a code'}
      </PrimaryBtn>
      <p className="text-center font-body text-[13.5px] text-gray-500">
        Remembered it?{' '}
        <button
          type="button"
          onClick={onBack}
          className="text-forest-dark font-semibold bg-transparent border-0 cursor-pointer hover:text-forest transition-colors"
        >
          Back to sign in
        </button>
      </p>
    </form>
  );
}

// ─── Reset-password stage ───────────────────────────────────────────
function ResetForm({
  code,
  setCode,
  newPassword,
  setNewPassword,
  pending,
  onSubmit,
  onBack,
}: {
  code: string;
  setCode: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  pending: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  const strong = newPassword.length >= 8 && /\d/.test(newPassword);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block font-body font-medium text-[12px] tracking-[0.04em] text-gray-600 mb-1.5">
          6-digit code
        </label>
        <CodeBoxes value={code} onChange={setCode} />
      </div>
      <FieldGroup label="New password">
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={fieldInputCls}
        />
      </FieldGroup>
      {newPassword.length > 0 && (
        <div
          className={`flex items-center gap-2 font-body text-[12.5px] ${
            strong ? 'text-forest' : 'text-gray-500'
          }`}
        >
          <span
            aria-hidden="true"
            className={`w-[14px] h-[14px] rounded-full grid place-items-center text-[9px] font-bold ${
              strong ? 'bg-[#E6EBDF] text-forest-dark' : 'bg-[#F2EFE4] text-gray-400'
            }`}
          >
            ✓
          </span>
          {strong
            ? 'Looks strong — 8+ characters with a number'
            : 'Aim for 8+ characters, including a number'}
        </div>
      )}
      <PrimaryBtn type="submit" disabled={pending || code.length !== 6 || newPassword.length < 8}>
        {pending ? 'Resetting…' : 'Save & sign in'}
      </PrimaryBtn>
      <button
        type="button"
        onClick={onBack}
        className="font-body text-[13px] text-gray-500 bg-transparent border-0 cursor-pointer hover:text-forest-dark transition-colors text-center"
      >
        &larr; Back to sign in
      </button>
    </form>
  );
}

// ─── Small UI primitives ─────────────────────────────────────────────

const fieldInputCls =
  "w-full appearance-none bg-[#FFFDF7] border border-[#D8D4C5] rounded-[11px] px-4 py-3 font-body text-[15px] text-ink outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] focus:border-forest focus:shadow-[0_0_0_4px_rgba(88,129,87,0.18)] transition-all";

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="block font-body font-medium text-[12px] tracking-[0.04em] text-gray-600">
          {label}
        </label>
        {hint}
      </div>
      {children}
    </div>
  );
}

function PrimaryBtn({
  children,
  disabled,
  type = 'button',
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="w-full inline-flex items-center justify-center gap-2.5 bg-forest text-cream font-body font-semibold text-[15px] py-3.5 px-4 rounded-[12px] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_-1px_0_rgba(0,0,0,0.10)_inset,0_12px_26px_-14px_rgba(58,90,64,0.55)] hover:bg-forest-dark hover:-translate-y-px transition-all border-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
    >
      {children}
    </button>
  );
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4.5 flex items-center gap-3" style={{ margin: '18px 0' }}>
      <span aria-hidden="true" className="flex-1 h-px bg-[#D8D4C5]" />
      <span className="font-display italic text-[13px] text-gray-500">{children}</span>
      <span aria-hidden="true" className="flex-1 h-px bg-[#D8D4C5]" />
    </div>
  );
}

function GoogleBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full inline-flex items-center justify-center gap-2.5 bg-[#FFFDF7] text-ink border border-[#D8D4C5] rounded-[12px] py-3 px-4 font-body font-semibold text-[14.5px] shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_18px_-14px_rgba(45,58,46,0.18)] hover:bg-[#F2EFE4] hover:border-[#C9C5B7] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}

// 6-digit code input rendered as 6 visual boxes over one hidden input
function CodeBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');
  const activeIdx = Math.min(value.length, 5);
  return (
    <label className="block relative">
      <span className="sr-only">6-digit code</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
        aria-label="6-digit code"
      />
      <div className="grid grid-cols-6 gap-2.5">
        {digits.map((d, i) => {
          const isActive = i === activeIdx && value.length < 6;
          const filled = d.trim() !== '';
          return (
            <div
              key={i}
              className={`h-[60px] rounded-[12px] bg-[#FFFDF7] grid place-items-center font-display text-[26px] text-ink transition-all ${
                isActive
                  ? 'border-[1.5px] border-forest shadow-[0_0_0_4px_rgba(88,129,87,0.18),inset_0_1px_0_rgba(255,255,255,0.5)]'
                  : 'border border-[#D8D4C5] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]'
              }`}
            >
              {filled ? d : isActive ? <span className="text-forest animate-pulse">|</span> : ''}
            </div>
          );
        })}
      </div>
    </label>
  );
}

function CardSkeleton() {
  return (
    <div className="pt-2">
      <div className="h-4 w-32 bg-[#F2EFE4] rounded animate-pulse" />
      <div className="mt-4 h-8 w-2/3 bg-[#F2EFE4] rounded animate-pulse" />
      <div className="mt-2 h-4 w-3/4 bg-[#F2EFE4] rounded animate-pulse" />
      <div className="mt-7 h-12 bg-[#F2EFE4] rounded animate-pulse" />
      <div className="mt-4 h-12 bg-[#F2EFE4] rounded animate-pulse" />
      <div className="mt-3 h-12 bg-[#F2EFE4] rounded animate-pulse" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.86 2.69-6.62z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.46-.8 5.95-2.18l-2.9-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.94v2.33A8.99 8.99 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.94A8.99 8.99 0 0 0 0 9c0 1.45.35 2.83.94 4.05l3.03-2.33z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58A8.99 8.99 0 0 0 9 0 8.99 8.99 0 0 0 .94 4.95l3.03 2.33C4.68 5.16 6.66 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function prettyErr(e: unknown, fallback: string): string {
  if (!e) return fallback;
  if (typeof e === 'object' && e !== null) {
    const obj = e as {
      errors?: Array<{ longMessage?: string; message?: string }>;
      message?: string;
    };
    if (Array.isArray(obj.errors) && obj.errors[0]) {
      return obj.errors[0].longMessage || obj.errors[0].message || obj.message || fallback;
    }
    if (obj.message) return obj.message;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}
