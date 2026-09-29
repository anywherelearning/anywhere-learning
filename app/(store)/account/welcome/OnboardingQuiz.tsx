'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import KidsSetup from '@/components/account/KidsSetup';
import ExplorerBuilder from '@/components/account/ExplorerBuilder';
import HeroScene from '@/components/account/HeroScene';
import { ExplorerFigure } from '@/components/account/ExplorerAvatar';
import { loadProfile, type Child } from '@/lib/member-profile';
import { avatarFor, saveAvatar, type KidAvatar } from '@/lib/kid-roadmap';

/**
 * First-run onboarding for a new member, as a "trailhead": the illustrated map
 * scene on one side, the form on the other. Two stages, then the home trail:
 *   1. Kids + family plan (KidsSetup). The kids wait in the scene as outlines.
 *   2. Build each child's explorer (ExplorerBuilder), one at a time, with the
 *      explorer standing big in the scene and changing as you pick.
 * The trail's engine picks the first activities, so there's no planner step.
 */

// Stand-ins shown as faded outlines before the kids' explorers exist.
const GHOSTS: KidAvatar[] = [
  { base: 'boy', color: '#6b8e6b', hairStyle: 'short' },
  { base: 'girl', color: '#c4836a', hairStyle: 'ponytail' },
  { base: 'girl', color: '#7d8fb3', hairStyle: 'bun' },
  { base: 'boy', color: '#bf7c48', hairStyle: 'curly' },
];

export default function OnboardingQuiz() {
  const router = useRouter();
  const [stage, setStage] = useState<'kids' | 'avatars'>('kids');
  const [kids, setKids] = useState<Child[]>([]);
  const [idx, setIdx] = useState(0);
  const [names, setNames] = useState<string[]>(['']);
  const [live, setLive] = useState<KidAvatar | null>(null);
  const onNames = useCallback((n: string[]) => setNames(n), []);
  const onLive = useCallback((a: KidAvatar) => setLive(a), []);

  const goHome = () => router.push('/account/home');

  function toAvatars() {
    const cs = loadProfile()?.children ?? [];
    if (!cs.length) {
      goHome();
      return;
    }
    setKids(cs);
    setIdx(0);
    setStage('avatars');
  }

  const kid = stage === 'avatars' ? kids[idx] : null;
  const cid = kid ? kid.id ?? kid.name : '';
  const isLast = idx >= kids.length - 1;
  const step = stage === 'kids' ? 0 : 1;

  const headline = stage === 'kids'
    ? 'Every adventure starts at the trailhead.'
    : `Now meet ${kid?.name}'s explorer.`;

  return (
    <main className="ob">
      <style>{`
        .ob{display:grid;min-height:100vh;background:linear-gradient(180deg,var(--am-bg1),var(--am-bg2));color:var(--am-ink)}
        @media (min-width:960px){.ob{grid-template-columns:1fr 1fr}}
        .ob-scene{position:relative;overflow:hidden;min-height:clamp(330px,52vw,420px);background:linear-gradient(180deg,var(--am-sky1),var(--am-sky2))}
        @media (min-width:960px){.ob-scene{min-height:100vh;position:sticky;top:0;height:100vh}}
        .ob-sun{position:absolute;top:8%;right:12%;width:130px;height:130px;border-radius:50%;background:radial-gradient(circle,rgba(255,214,107,.7),transparent 70%)}
        .ob-head{position:relative;padding:clamp(24px,4vw,56px)}
        .ob-kick{font-family:var(--font-catalog),monospace;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--am-trail)}
        .ob-h1{font-family:var(--font-plate),sans-serif;font-weight:800;font-size:clamp(30px,4.4vw,54px);letter-spacing:-.03em;line-height:1.02;margin:10px 0 0;max-width:460px}
        .ob-crowd{position:absolute;left:50%;bottom:clamp(20px,6vh,60px);transform:translateX(-50%);display:flex;align-items:flex-end;gap:12px}
        .ob-ghost{display:flex;flex-direction:column;align-items:center;gap:6px}
        .ob-ghost>div{width:clamp(70px,8vw,110px);aspect-ratio:26/34;opacity:.4;filter:grayscale(1) brightness(1.35)}
        .ob-ghost span{font-family:var(--font-catalog),monospace;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;background:rgba(247,242,232,.9);padding:3px 9px;border-radius:999px;min-height:19px}
        @media (max-width:959px){.ob-crowd.is-one{left:auto;right:6%;transform:none}.ob-h1{max-width:62%}}
        .ob-hero{width:clamp(150px,20vw,240px);aspect-ratio:26/34;filter:drop-shadow(0 18px 18px rgba(40,30,15,.3));transition:transform .3s}
        .ob-form{padding:clamp(24px,4vw,56px);display:flex;flex-direction:column;justify-content:center;max-width:620px;width:100%}
        .ob-steps{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;font-weight:700}
        .ob-dash{width:24px;border-top:3px dotted #bf7c48}
        .ob-num{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:11.5px;margin-right:6px}
        .ob-h2{font-family:var(--font-plate),sans-serif;font-weight:800;font-size:clamp(24px,2.6vw,30px);letter-spacing:-.01em;margin:24px 0 18px}
        .ob-skip{background:none;border:none;cursor:pointer;font-size:13.5px;color:var(--am-muted);margin-top:18px;align-self:flex-start;padding:0}
        .ob-skip:hover{color:var(--am-ink)}
      `}</style>

      <section className="ob-scene" aria-hidden="true">
        <HeroScene tone="light" hillHeight={260} />
        <span className="ob-sun" />
        <div className="ob-head">
          <div className="ob-kick">Welcome to Anywhere Learning</div>
          <div className="ob-h1">{headline}</div>
        </div>
        <div className={`ob-crowd${stage === 'kids' ? '' : ' is-one'}`}>
          {stage === 'kids' ? (
            names.slice(0, 4).map((n, i) => (
              <div key={i} className="ob-ghost">
                <div><ExplorerFigure avatar={GHOSTS[i % GHOSTS.length]} fill /></div>
                <span style={{ visibility: n ? 'visible' : 'hidden' }}>{n || '·'}</span>
              </div>
            ))
          ) : (
            <div className="ob-hero">{live && <ExplorerFigure avatar={live} fill />}</div>
          )}
        </div>
      </section>

      <section className="ob-form">
        <div className="ob-steps" aria-label={`Step ${step + 1} of 3`}>
          {['Your kids', 'Their explorers', 'Hit the trail'].map((t, i) => (
            <span key={t} style={{ display: 'contents' }}>
              {i > 0 && <span className="ob-dash" aria-hidden="true" />}
              <span style={{ display: 'inline-flex', alignItems: 'center', color: i <= step ? 'var(--am-ink)' : 'var(--am-muted)' }}>
                <span className="ob-num" style={{ background: i < step ? '#588157' : i === step ? '#d0684a' : 'rgba(58,44,23,0.1)', color: i <= step ? '#fff' : 'var(--am-muted)' }}>{i < step ? '✓' : i + 1}</span>
                {t}
              </span>
            </span>
          ))}
        </div>

        {stage === 'kids' ? (
          <>
            <h1 className="ob-h2">Who is coming along?</h1>
            <KidsSetup frameless submitLabel="Next: build their explorers →" onDone={toAvatars} onNamesChange={onNames} />
          </>
        ) : (
          <>
            <h1 className="ob-h2">
              Build {kid?.name}&apos;s explorer
              {kids.length > 1 && <span style={{ display: 'block', fontFamily: 'var(--font-catalog),monospace', fontSize: 11.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--am-trail)', marginTop: 6 }}>Explorer {idx + 1} of {kids.length}</span>}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--am-muted)', margin: '-8px 0 18px', lineHeight: 1.5 }}>
              They start with nothing but curiosity. Boots, a hat and a backpack get earned out on the trail.
            </p>
            <ExplorerBuilder
              key={cid}
              bare
              hidePreview
              kidName={kid?.name ?? ''}
              initial={avatarFor(cid)}
              onChange={onLive}
              saveLabel={isLast ? "Let's hit the trail →" : `Next: ${kids[idx + 1]?.name}'s explorer →`}
              onSave={(a) => {
                saveAvatar(cid, a);
                if (isLast) goHome();
                else setIdx((n) => n + 1);
              }}
            />
          </>
        )}

        <button type="button" onClick={goHome} className="ob-skip">Skip for now</button>
      </section>
    </main>
  );
}
