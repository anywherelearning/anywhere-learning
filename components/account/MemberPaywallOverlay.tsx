'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

/**
 * Soft paywall for signed-in non-members (the "guest" tier). Instead of
 * hard-bouncing a guest out of the member zone, we let the real page render
 * behind a frosted cover that fades in over the lower two-thirds, so they get
 * a teaser of what's inside and a one-click path to start a trial. Scroll is
 * locked so they can't peek past the cover, and the cover sits below the nav's
 * z-index (60/70) so guests can still switch pages and sign out. Content
 * endpoints gate server-side regardless, so nothing paid actually leaks.
 */
export default function MemberPaywallOverlay({
  trialDays,
  annualPriceUsd,
  monthlyPriceUsd,
}: {
  trialDays: number;
  annualPriceUsd: number;
  monthlyPriceUsd: number;
}) {
  const ctaRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    ctaRef.current?.focus();
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

  return (
    <aside className="mpw" aria-labelledby="mpw-title">
      <div className="mpw-blur" aria-hidden="true" />
      <div className="mpw-tint" aria-hidden="true" />
      <div className="mpw-card">
        <span className="mpw-eyebrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          Members only
        </span>
        <h2 id="mpw-title" className="mpw-title">
          Unlock the full membership
        </h2>
        <p className="mpw-body">
          Start your {trialDays}-day free trial to open every activity guide, your family&apos;s
          trail, This Month, and the Learning Record.
        </p>
        <Link ref={ctaRef} href="/start-trial" className="mpw-btn">
          Start free trial <span aria-hidden="true">&rarr;</span>
        </Link>
        <p className="mpw-fine">
          $0 today. Then ${annualPriceUsd}/year or ${monthlyPriceUsd}/month. Cancel anytime.
        </p>
        <Link href="/join" className="mpw-link">
          See everything included
        </Link>
      </div>
      <style>{`
        .mpw{position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;
          justify-content:flex-end;align-items:center;padding:0 20px
          clamp(48px,14vh,132px);font-family:'DM Sans',system-ui,sans-serif}
        .mpw-blur{position:absolute;inset:0;backdrop-filter:blur(7px);
          -webkit-backdrop-filter:blur(7px);
          -webkit-mask-image:linear-gradient(to bottom,transparent 26%,#000 52%);
          mask-image:linear-gradient(to bottom,transparent 26%,#000 52%)}
        .mpw-tint{position:absolute;inset:0;background:linear-gradient(to bottom,
          rgba(250,249,246,0) 22%,rgba(250,249,246,.55) 44%,
          rgba(250,249,246,.94) 62%,var(--am-bg1,#faf9f6) 78%)}
        .mpw-card{position:relative;text-align:center;max-width:440px;width:100%;
          display:flex;flex-direction:column;align-items:center;gap:14px}
        .mpw-eyebrow{display:inline-flex;align-items:center;gap:7px;
          font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
          color:#3d5c3b;background:rgba(88,129,87,.12);
          padding:6px 13px;border-radius:999px}
        .mpw-title{font-family:'Dancing Script','DM Sans',cursive;font-weight:700;
          font-size:clamp(30px,6vw,40px);line-height:1.05;color:#3d5c3b;margin:0}
        .mpw-body{font-size:15.5px;line-height:1.55;color:#57604f;margin:0;max-width:380px}
        .mpw-btn{display:inline-flex;align-items:center;gap:9px;margin-top:4px;
          background:#588157;color:#faf9f6;font-weight:600;font-size:16px;
          padding:14px 30px;border-radius:14px;text-decoration:none;
          box-shadow:0 8px 22px -8px rgba(61,92,59,.55);
          transition:background .15s ease,transform .15s ease,box-shadow .15s ease}
        .mpw-btn:hover{background:#3d5c3b;transform:translateY(-1px);
          box-shadow:0 12px 26px -8px rgba(61,92,59,.6)}
        .mpw-btn:active{transform:translateY(0)}
        .mpw-btn:focus-visible{outline:3px solid #d4a373;outline-offset:3px}
        .mpw-fine{font-size:13px;color:#7a8070;margin:0}
        .mpw-link{font-size:13.5px;font-weight:600;color:#8a6a3a;text-decoration:underline;
          text-underline-offset:3px}
        .mpw-link:hover{color:#6f5227}
      `}</style>
    </aside>
  );
}
