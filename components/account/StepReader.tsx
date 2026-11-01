'use client';

/**
 * Phone reader for guides that have a content file: one screen at a time
 * (the idea, how to run it, each step or card set, the toolkit, the finish)
 * instead of scrolling a long PDF. The essentials stay open; the extras
 * (try asking, tips, troubleshooting) fold away. Levels are three tabs, and
 * nothing is saved about which level a kid picks.
 *
 * Same content file as the PDFs, so the two never disagree. The PDF stays one
 * tap away for printing and downloading.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import TrialCapModal from '@/components/account/TrialCapModal';
import AddToWeekButton from '@/components/account/AddToWeekButton';
import WeDidIt from '@/components/account/ReaderActions';
import { effortFor } from '@/lib/activity-effort';
import type { GuideContent } from '@/lib/guide-content';

// Same category colours as the PDFs (guides/render/template.mjs).
const ACCENTS: Record<string, { accent: string; soft: string; paper: string }> = {
  'Writing & Communication': { accent: '#4f8aa0', soft: '#e3eff2', paper: '#f1f5f4' },
  'Outdoor Learning': { accent: '#588157', soft: '#e1e9d8', paper: '#f2f5ec' },
  'Real-World Math': { accent: '#b08a35', soft: '#f2e6c2', paper: '#f8f3e6' },
  'Creativity & Maker': { accent: '#c4836a', soft: '#f4e0d6', paper: '#f9f0eb' },
  'Emotional & Social Skills': { accent: '#b6748a', soft: '#f2e1e7', paper: '#f8eff2' },
  'Entrepreneurship': { accent: '#8b7355', soft: '#ece2d6', paper: '#f6f0e8' },
  'AI & Digital Literacy': { accent: '#6f86a0', soft: '#e2e8ef', paper: '#f1f3f6' },
  'Worldschooling': { accent: '#8a8470', soft: '#e7e4d9', paper: '#f4f2ec' },
  'Planning & Problem-Solving': { accent: '#5c7b6a', soft: '#dfe8e2', paper: '#eff4f1' },
};
const DEFAULT_ACCENT = { accent: '#bf7c48', soft: '#f6e9dc', paper: '#f7f2e8' };

const TIME: Record<string, string> = { Quick: 'Under an hour', 'Half-Day': 'Half-day', Project: 'Multi-day' };
const LEVELS = [['explore', 'Explore'], ['develop', 'Develop'], ['extend', 'Extend']] as const;

// The generic levels explainer lives on the website; card guides define their own.
const isOwnLevelsLine = (s?: string) => !!s && !/Pick the one that fits your kid today/.test(s);
const art = (src?: string) => (src?.startsWith('wc/') ? `/api/guide-art/${src}` : src?.startsWith('guides/assets/') ? `/api/guide-art/assets/${src.slice(14)}` : undefined);

type Screen =
  | { kind: 'idea'; label: string }
  | { kind: 'how'; label: string }
  | { kind: 'step'; label: string; i: number }
  | { kind: 'theme'; label: string; i: number }
  | { kind: 'ref'; label: string }
  | { kind: 'done'; label: string };

interface Props {
  guide: GuideContent;
  title: string;
  tier: 'member' | 'trial';
  imageUrl?: string | null;
  trialEndsAt?: string | null;
  priceLabel?: string;
  isFounder?: boolean;
  onShowPdf: () => void;
}

function Fold({ label, children, open = false }: { label: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="sr-fold" open={open}>
      <summary>{label}</summary>
      <div className="sr-fold-in">{children}</div>
    </details>
  );
}

export default function StepReader({ guide: g, title, tier, imageUrl, trialEndsAt, priceLabel, isFounder, onShowPdf }: Props) {
  const c = ACCENTS[g.category] ?? DEFAULT_ACCENT;
  const effort = effortFor(g.slug);
  const [at, setAt] = useState(0);
  const [level, setLevel] = useState<'explore' | 'develop' | 'extend'>('explore');
  const [capModalOpen, setCapModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resume, setResume] = useState<number | null>(null);
  const [sheet, setSheet] = useState<string | null>(null); // toolkit sheet open, scrolled to an item name ('' = top)
  const [got, setGot] = useState<number[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const screens = useMemo<Screen[]>(() => {
    const s: Screen[] = [{ kind: 'idea', label: 'The idea' }, { kind: 'how', label: 'How to run it' }];
    g.steps?.forEach((st, i) => s.push({ kind: 'step', label: `Step ${i + 1}`, i }));
    g.themes?.forEach((t, i) => s.push({ kind: 'theme', label: t.short || t.title, i }));
    if (g.reference) s.push({ kind: 'ref', label: g.reference.title });
    s.push({ kind: 'done', label: 'Finish' });
    return s;
  }, [g]);
  const screen = screens[at];
  const fullLabel = (sc: Screen) =>
    sc.kind === 'step' ? `Step ${sc.i + 1} · ${g.steps?.[sc.i]?.title ?? ''}` : sc.kind === 'theme' ? g.themes?.[sc.i]?.title ?? sc.label : sc.label;

  // Count the open like the PDF reader does (once per visit).
  useEffect(() => {
    fetch(`/api/view/activity/${g.slug}`, { method: 'POST' }).catch(() => {});
  }, [g.slug]);

  // Where they left off and what they've gathered live on this phone only.
  const posKey = `sr-pos:${g.slug}`;
  const needKey = `sr-need:${g.slug}`;
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(posKey));
      if (saved > 0 && saved < screens.length) setResume(saved);
      setGot(JSON.parse(localStorage.getItem(needKey) || '[]'));
    } catch { /* storage unavailable: start fresh */ }
  }, [posKey, needKey, screens.length]);
  useEffect(() => {
    try { if (at > 0) localStorage.setItem(posKey, String(at)); } catch { /* ignore */ }
  }, [at, posKey]);
  function toggleGot(i: number) {
    setGot((cur) => {
      const next = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i];
      try { localStorage.setItem(needKey, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  // Keep the screen on while the guide is open: hands are often full.
  useEffect(() => {
    type Lock = { release: () => Promise<void> };
    const wl = (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<Lock> } }).wakeLock;
    if (!wl) return;
    let lock: Lock | null = null;
    const get = () => { wl.request('screen').then((l) => { lock = l; }).catch(() => {}); };
    const onVis = () => { if (document.visibilityState === 'visible') get(); };
    get();
    document.addEventListener('visibilitychange', onVis);
    return () => { document.removeEventListener('visibilitychange', onVis); lock?.release().catch(() => {}); };
  }, []);

  // Card names in the step text open the toolkit over the step.
  const refNames = useMemo(() => {
    if (!g.reference) return [] as string[];
    return [g.reference.title, ...g.reference.items.map((it) => it.name), g.reference.after?.label].filter((x): x is string => !!x && x.length > 3).sort((a, b) => b.length - a.length);
  }, [g.reference]);
  function linked(text: string) {
    if (!refNames.length) return text;
    const re = new RegExp(`(${refNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
    return text.split(re).map((part, i) =>
      refNames.includes(part)
        ? <button key={i} type="button" className="sr-reflink" onClick={() => setSheet(part === g.reference?.title ? '' : part)}>{part}</button>
        : part,
    );
  }
  useEffect(() => {
    if (sheet === null) return;
    const body = document.querySelector<HTMLElement>('.sr-sheet-body');
    const el = sheet ? document.getElementById(`sr-sheet-${sheet}`) : null;
    if (body) body.scrollTop = el ? el.offsetTop - 8 : 0;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSheet(null); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [sheet]);

  const refBody = (idPrefix?: string) => g.reference && (
    <>
      {g.reference.intro && <p className="sr-lead">{g.reference.intro}</p>}
      {g.reference.items.map((it, i) => (
        <div className="sr-card sr-ref" key={i} id={idPrefix ? `${idPrefix}${it.name}` : undefined}>
          <h3>{it.name}</h3>
          {it.lines.map((l, j) => <p key={j}><b>{l.k}</b> {l.v}</p>)}
          {it.ask && <p className="sr-refask">{it.ask}</p>}
        </div>
      ))}
      {g.reference.after && (
        <div className="sr-card sr-ref" id={idPrefix ? `${idPrefix}${g.reference.after.label}` : undefined}>
          <div className="sr-role">{g.reference.after.label}</div>
          {g.reference.after.lines.map((l, i) => <p key={i}>{l}</p>)}
        </div>
      )}
    </>
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMenuOpen(false);
  }, [at]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent | TouchEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); };
  }, [menuOpen]);

  const go = (n: number) => setAt(Math.max(0, Math.min(screens.length - 1, n)));

  function downloadClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (tier !== 'trial') return;
    e.preventDefault();
    setCapModalOpen(true);
  }

  const stepCount = g.steps?.length ?? 0;
  const themeCount = g.themes?.length ?? 0;

  return (
    <main
      className="sr"
      style={{ '--ac': c.accent, '--soft': c.soft, '--paper': c.paper } as React.CSSProperties}
      onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchEnd={(e) => {
        const t = touch.current; touch.current = null;
        if (!t) return;
        const dx = e.changedTouches[0].clientX - t.x, dy = e.changedTouches[0].clientY - t.y;
        if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8 && !menuOpen) go(at + (dx < 0 ? 1 : -1));
      }}
    >
      <style>{`
        .sr{min-height:100vh;background:var(--paper);color:var(--am-ink,#32302a);font-family:var(--font-body),system-ui,sans-serif;padding-bottom:92px}
        .sr-top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--paper) 94%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid rgba(58,44,23,.08)}
        .sr-bar{display:flex;align-items:center;gap:10px;padding:10px 16px 6px}
        .sr-back{font-size:13px;color:var(--am-muted,#6b6152);text-decoration:none;white-space:nowrap}
        .sr-name{flex:1;min-width:0;font-family:var(--font-plate),sans-serif;font-weight:800;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center}
        .sr-pdf{font-size:12.5px;font-weight:700;color:var(--ac);background:none;border:none;padding:4px 0;cursor:pointer;white-space:nowrap}
        .sr-jump{position:relative;padding:2px 16px 10px}
        .sr-jumpbtn{display:flex;align-items:center;gap:8px;width:100%;background:#fffdf8;border:1.5px solid rgba(58,44,23,.14);border-radius:12px;padding:9px 12px;cursor:pointer;text-align:left;color:var(--am-ink,#32302a)}
        .sr-jumplabel{flex:1;min-width:0;font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .sr-jumpcount{font-family:var(--font-catalog),monospace;font-size:11px;font-weight:700;color:var(--am-muted,#6b6152)}
        .sr-caret{color:var(--ac);font-size:12px}
        .sr-progress{height:3px;background:var(--soft);border-radius:3px;margin-top:8px;overflow:hidden}.sr-progress i{display:block;height:100%;background:var(--ac);border-radius:3px;transition:width .25s}
        .sr-menu{position:absolute;left:16px;right:16px;top:calc(100% - 6px);z-index:40;list-style:none;margin:0;padding:6px;background:#fffdf8;border:1px solid rgba(58,44,23,.14);border-radius:14px;box-shadow:0 22px 40px -18px rgba(45,58,46,.45);max-height:65vh;overflow:auto}
        .sr-menu button{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:none;background:none;border-radius:10px;padding:10px 10px;font-size:14.5px;color:var(--am-ink,#32302a);cursor:pointer}
        .sr-menu button[data-on]{background:var(--soft);font-weight:700}
        .sr-mk{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:11.5px;font-weight:700;border:1.5px solid rgba(58,44,23,.2);color:var(--am-muted,#6b6152)}
        .sr-menu button[data-seen] .sr-mk{border-color:var(--ac);color:var(--ac)}
        .sr-menu button[data-on] .sr-mk{background:var(--ac);border-color:var(--ac);color:#fff}
        .sr-body{max-width:640px;margin:0 auto;padding:18px 16px 0}
        .sr-eyebrow{font-family:var(--font-catalog),monospace;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--am-trail,#bf7c48)}
        .sr h2{font-family:var(--font-plate),sans-serif;font-weight:800;font-size:26px;line-height:1.12;letter-spacing:-.01em;margin:6px 0 10px}
        .sr-lead{font-size:16px;line-height:1.5;color:#4a4436;margin:0 0 14px}
        .sr p{line-height:1.55}
        .sr-card{background:#fffdf8;border-radius:16px;padding:14px 16px;margin:12px 0;box-shadow:0 1px 0 rgba(58,44,23,.05),0 14px 30px -24px rgba(58,44,23,.55)}
        .sr-role{display:flex;align-items:center;gap:8px;font-family:var(--font-catalog),monospace;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ac);margin-bottom:6px}
        .sr-role b{background:var(--ac);color:#fff;border-radius:5px;padding:2px 6px;letter-spacing:.06em}
        .sr-card p{margin:0;font-size:15.5px}
        .sr-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
        .sr-chips span{font-size:12px;border:1px solid var(--soft);background:var(--paper);border-radius:999px;padding:3px 9px;color:#4a4436}
        .sr-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;background:var(--soft);border-radius:12px;padding:4px;margin-bottom:10px}
        .sr-tabs button{border:none;background:none;border-radius:9px;padding:8px 4px;font-size:13.5px;font-weight:700;color:#4a4436;cursor:pointer}
        .sr-tabs button[data-on]{background:#fffdf8;color:var(--ac);box-shadow:0 2px 6px -3px rgba(58,44,23,.35)}
        .sr-fold{background:#fffdf8;border-radius:14px;margin:10px 0;box-shadow:0 1px 0 rgba(58,44,23,.05)}
        .sr-fold summary{cursor:pointer;list-style:none;padding:13px 16px;font-weight:700;font-size:14.5px;display:flex;justify-content:space-between;align-items:center}
        .sr-fold summary::-webkit-details-marker{display:none}
        .sr-fold summary::after{content:'+';font-size:18px;color:var(--ac);font-weight:600}
        .sr-fold[open] summary::after{content:'−'}
        .sr-fold-in{padding:0 16px 14px;font-size:15px}
        .sr-fold-in ul{margin:0;padding-left:18px}.sr-fold-in li{margin:5px 0;line-height:1.45}
        .sr-ask li{font-style:italic}
        .sr-dl dt{font-weight:700;margin-top:10px}.sr-dl dd{margin:2px 0 0}
        .sr-learn{display:grid;gap:8px}.sr-learn div{border-left:3px solid var(--ac);padding-left:10px}.sr-learn b{display:block;font-size:14px}.sr-learn span{font-size:14px;color:#5a5243}
        .sr-before{font-size:14px;background:#f6e3df;border-radius:10px;padding:8px 10px;margin:8px 0;text-decoration:line-through;color:#7a4a42}
        .sr-model{display:grid;gap:6px;margin:8px 0}.sr-model div{display:grid;grid-template-columns:78px 1fr;gap:8px;align-items:start;font-size:14.5px}
        .sr-model em{font-style:normal;font-family:var(--font-catalog),monospace;font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;background:var(--ac);color:#fff;border-radius:5px;padding:3px 5px;text-align:center}
        .sr-photo{margin:4px 0 14px;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 14px 30px -22px rgba(58,44,23,.6)}
        .sr-photo img{display:block;width:100%;height:auto;max-height:320px;object-fit:cover;object-position:center 35%}
        .sr-photo{margin-left:0;margin-right:0}.sr-photo figcaption{font-size:13px;color:#5a5243;padding:8px 12px 10px;text-align:center;font-style:italic}
        .sr-home{background:var(--soft);border-radius:14px;padding:12px 14px;margin:12px 0}
        .sr-home .sr-eyebrow{color:var(--ac)}
        .sr-plan div{display:grid;grid-template-columns:96px 1fr;gap:8px;padding:6px 0;border-top:1px dashed rgba(58,44,23,.14);font-size:14.5px}.sr-plan div:first-child{border-top:none}
        .sr-plan b{color:var(--am-trail,#bf7c48);font-size:13px}
        .sr-levels{font-size:14px;background:#fffdf8;border-radius:12px;padding:10px 12px;margin:12px 0;border:1px dashed var(--ac)}
        .sr-cards{display:grid;gap:10px}
        .sr-cardx{display:grid;grid-template-columns:1fr 64px;gap:10px;align-items:center;background:#fffdf8;border-radius:14px;padding:12px 14px;box-shadow:0 1px 0 rgba(58,44,23,.05)}
        .sr-cardx img{width:64px;height:64px;object-fit:contain;mix-blend-mode:multiply}
        .sr-cardx h3{font-family:var(--font-plate),sans-serif;font-size:15px;font-weight:800;margin:0 0 3px}
        .sr-cardx p{margin:0;font-size:14.5px}
        .sr-cardx small{display:block;margin-top:5px;font-size:13px;color:#5a5243}.sr-cardx small b{color:var(--ac)}
        .sr-rule{font-size:14.5px;background:var(--soft);border-radius:12px;padding:10px 12px;margin:0 0 12px}
        .sr-ref h3{font-family:var(--font-plate),sans-serif;font-size:15.5px;font-weight:800;margin:0 0 6px}
        .sr-ref p{margin:3px 0;font-size:14.5px}.sr-ref p b{color:var(--ac)}
        .sr-ref .sr-refask{font-style:italic;border-top:1px dashed rgba(58,44,23,.2);padding-top:6px;margin-top:8px}
        .sr-celebrate{background:var(--soft);border-radius:14px;padding:12px 14px;margin:12px 0}
        .sr-actions{display:grid;gap:8px;margin:18px 0}
        .sr-actions>div{position:relative}
        .rd-btn{display:flex;width:100%;align-items:center;justify-content:center;gap:7px;padding:12px 14px;border-radius:12px;font-size:14.5px;font-weight:700;cursor:pointer;text-decoration:none;border:none}
        .rd-btn-ghost,.sr-btn-ghost{background:#fff;color:var(--ac);border:1.5px solid var(--soft)}
        .rd-trail>div>button{display:flex!important;width:100%!important;justify-content:center;padding:12px 14px!important;border-radius:12px!important;background:var(--ac)!important;color:#fff!important;font-size:14.5px!important}
        .rd-menu{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:30;background:#fffdf8;border:1px solid rgba(58,44,23,.14);border-radius:12px;box-shadow:0 18px 36px -16px rgba(45,58,46,.4);padding:6px}
        .rd-menu button{display:block;width:100%;text-align:left;padding:9px 11px;border:none;background:none;border-radius:8px;font-size:14px;cursor:pointer;color:var(--am-ink)}
        .rd-done{display:flex;flex-direction:column;gap:3px;align-items:center;padding:10px;border-radius:12px;background:var(--soft);color:#3d5c3b;font-size:14px}
        .rd-done a{font-size:12.5px;font-weight:700;color:var(--ac);text-decoration:none}
        .sr-reflink{display:inline;border:none;background:none;padding:0;font:inherit;color:var(--ac);font-weight:700;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px;cursor:pointer}
        .sr-need{list-style:none;margin:0;padding:0}
        .sr-need li{margin:2px 0}
        .sr-need label{display:flex;gap:10px;align-items:flex-start;padding:6px 0;cursor:pointer;line-height:1.45;font-size:15px}
        .sr-need input{flex:none;width:20px;height:20px;margin-top:1px;accent-color:var(--ac)}
        .sr-need label[data-got] span{color:#8a8274;text-decoration:line-through}
        .sr-gotcount{margin-left:auto;color:var(--am-muted,#6b6152)}
        .sr-resume{background:#fffdf8;border:1.5px solid var(--ac);border-radius:14px;padding:12px 14px;margin:0 0 14px;font-size:14.5px}
        .sr-resume div{display:flex;gap:8px;margin-top:10px}
        .sr-resume button{flex:1;border-radius:10px;padding:10px;font-size:14px;font-weight:700;cursor:pointer}
        .sr-resume-go{background:var(--ac);color:#fff;border:none}
        .sr-resume-no{background:#fff;color:#4a4436;border:1.5px solid rgba(58,44,23,.14)}
        .sr-sheet-bg{position:fixed;inset:0;z-index:60;background:rgba(40,34,24,.35);display:flex;align-items:flex-end}
        .sr-sheet{width:100%;max-width:640px;margin:0 auto;max-height:82vh;background:var(--paper);border-radius:20px 20px 0 0;display:flex;flex-direction:column;box-shadow:0 -18px 40px -20px rgba(0,0,0,.4)}
        .sr-sheet-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;border-bottom:1px solid rgba(58,44,23,.1);font-family:var(--font-plate),sans-serif;font-size:16px}
        .sr-sheet-head button{border:none;background:var(--soft);color:var(--ac);font-weight:700;font-size:13.5px;border-radius:999px;padding:6px 12px;cursor:pointer}
        .sr-sheet-body{position:relative;overflow:auto;padding:4px 16px calc(18px + env(safe-area-inset-bottom))}
        .sr-sheet-body .sr-ref{scroll-margin-top:8px}
        .sr-nav{position:fixed;left:0;right:0;bottom:0;z-index:20;display:flex;gap:10px;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--paper) 94%,transparent);backdrop-filter:blur(8px);border-top:1px solid rgba(58,44,23,.08)}
        .sr-nav button{border:none;border-radius:12px;padding:13px 14px;font-size:15px;font-weight:700;cursor:pointer}
        .sr-nav button{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .sr-prev{flex:1;background:#fffdf8;color:#4a4436;border:1.5px solid rgba(58,44,23,.14)!important}
        .sr-next{flex:1.3;background:var(--ac);color:#fff}
      `}</style>

      <div className="sr-top">
        <div className="sr-bar">
          <Link href="/account" className="sr-back">&larr; Library</Link>
          <div className="sr-name">{title}</div>
          {g.reference && <button type="button" className="sr-pdf" onClick={() => setSheet('')}>Toolkit</button>}
          <button type="button" className="sr-pdf" onClick={onShowPdf}>PDF</button>
        </div>
        <div className="sr-jump" ref={menuRef}>
          <button type="button" className="sr-jumpbtn" aria-haspopup="listbox" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            <span className="sr-jumplabel">{fullLabel(screen)}</span>
            <span className="sr-jumpcount">{at + 1} / {screens.length}</span>
            <span aria-hidden="true" className="sr-caret">&#9662;</span>
          </button>
          <div className="sr-progress"><i style={{ width: `${((at + 1) / screens.length) * 100}%` }} /></div>
          {menuOpen && (
            <ul className="sr-menu" role="listbox" aria-label="Sections">
              {screens.map((sc, i) => (
                <li key={i}>
                  <button type="button" role="option" aria-selected={i === at} data-on={i === at ? '' : undefined} data-seen={i < at ? '' : undefined} onClick={() => go(i)}>
                    <span className="sr-mk">{i < at ? '✓' : i + 1}</span>{fullLabel(sc)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="sr-body">
        {resume !== null && at === 0 && (
          <div className="sr-resume" role="status">
            <span>Pick up where you left off: <b>{fullLabel(screens[resume])}</b>?</span>
            <div>
              <button type="button" className="sr-resume-go" onClick={() => { go(resume); setResume(null); }}>Continue</button>
              <button type="button" className="sr-resume-no" onClick={() => { setResume(null); try { localStorage.removeItem(posKey); } catch { /* ignore */ } }}>Start over</button>
            </div>
          </div>
        )}
        {screen.kind === 'idea' && (
          <>
            <div className="sr-eyebrow">{g.category}</div>
            <h2>{g.title}</h2>
            <p className="sr-lead">{[g.ages, effort ? TIME[effort] : null].filter(Boolean).join(' · ')}</p>
            {(art(g.photo?.src) || imageUrl) && (
              <figure className="sr-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={art(g.photo?.src) || imageUrl || ''} alt={g.photo?.alt || ''} />
                {g.photo?.caption && <figcaption>{g.photo.caption}</figcaption>}
              </figure>
            )}
            {g.goal && <p className="sr-lead">{g.goal}</p>}
            {g.academics?.length ? (
              <div className="sr-card">
                <div className="sr-role">What your kid learns</div>
                <div className="sr-learn">{g.academics.map((a, i) => <div key={i}><b>{a.subject}</b><span>{a.text}</span></div>)}</div>
              </div>
            ) : null}
            {g.lesson?.text && (
              <div className="sr-card">
                <div className="sr-role">The skill, in a minute</div>
                <p>{g.lesson.text}</p>
                {g.lesson.model?.length ? (
                  <Fold label="See the example">
                    {g.lesson.before && <div className="sr-before">{g.lesson.before}</div>}
                    <div className="sr-model">{g.lesson.model.map((m, i) => <div key={i}><em>{m.part}</em><span>{m.line}</span></div>)}</div>
                    {g.lesson.modelNote && <p style={{ margin: '8px 0 0' }}>{g.lesson.modelNote}</p>}
                  </Fold>
                ) : null}
              </div>
            )}
          </>
        )}

        {screen.kind === 'how' && (
          <>
            <div className="sr-eyebrow">Your role</div>
            <h2>How to run it</h2>
            {g.howTo?.intro && <p className="sr-lead">{g.howTo.intro}</p>}
            {g.need?.length ? (
              <div className="sr-card">
                <div className="sr-role">What you need <span className="sr-gotcount">{got.length}/{g.need.length}</span></div>
                <ul className="sr-need">
                  {g.need.map((n, i) => (
                    <li key={i}>
                      <label data-got={got.includes(i) ? '' : undefined}>
                        <input type="checkbox" checked={got.includes(i)} onChange={() => toggleGot(i)} />
                        <span>{linked(n)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {g.fromHome?.text && (
              <div className="sr-home">
                <div className="sr-eyebrow">From our house</div>
                <p style={{ margin: '6px 0 0', fontSize: 15 }}>{g.fromHome.text}</p>
              </div>
            )}
            {isOwnLevelsLine(g.levelsLine) && <div className="sr-levels">{g.levelsLine}</div>}
            {g.howTo?.plan?.length ? (
              <Fold label="A simple plan">
                <div className="sr-plan">{g.howTo.plan.map((p, i) => <div key={i}><b>{p.when}</b><span>{p.what}</span></div>)}</div>
              </Fold>
            ) : null}
            {g.howTo?.example && (
              <Fold label={g.howTo.example.title || 'An example'}>
                {g.howTo.example.before && <div className="sr-before">{g.howTo.example.before.join(' ')}</div>}
                {g.howTo.example.after && <ul>{g.howTo.example.after.map((a, i) => <li key={i}>{a}</li>)}</ul>}
                {g.howTo.example.why && <p style={{ margin: '8px 0 0' }}>{g.howTo.example.why}</p>}
              </Fold>
            )}
            {g.howTo?.troubleshoot?.length ? (
              <Fold label="If it's not working">
                <dl className="sr-dl" style={{ margin: 0 }}>{g.howTo.troubleshoot.map((t, i) => <div key={i}><dt>{t.q}</dt><dd>{t.a}</dd></div>)}</dl>
              </Fold>
            ) : null}
          </>
        )}

        {screen.kind === 'step' && g.steps && (() => {
          const st = g.steps[screen.i];
          return (
            <>
              <div className="sr-eyebrow">Step {screen.i + 1} of {stepCount}</div>
              <h2>{st.title}</h2>
              {st.why && <p className="sr-lead">{st.why}</p>}
              {st.kid && (
                <div className="sr-card">
                  <div className="sr-role"><b>Kid</b> What your kid does</div>
                  <p>{linked(st.kid)}</p>
                </div>
              )}
              {st.you && (
                <div className="sr-card">
                  <div className="sr-role"><b>You</b> What you do</div>
                  <p>{linked(st.you)}</p>
                  {st.starters?.length ? <div className="sr-chips">{st.starters.map((s, i) => <span key={i}>{s}</span>)}</div> : null}
                </div>
              )}
              {st.levels && (
                <div className="sr-card">
                  <div className="sr-role">Pick the level</div>
                  <div className="sr-tabs" role="tablist">
                    {LEVELS.map(([k, label]) => (
                      <button key={k} type="button" role="tab" aria-selected={level === k} data-on={level === k ? '' : undefined} onClick={() => setLevel(k)}>{label}</button>
                    ))}
                  </div>
                  <p>{linked(st.levels[level] ?? '')}</p>
                </div>
              )}
              {st.ask?.length ? (
                <Fold label="Try asking">
                  <ul className="sr-ask">{st.ask.map((a, i) => <li key={i}>&ldquo;{a}&rdquo;</li>)}</ul>
                </Fold>
              ) : null}
              {st.tip && <Fold label="Tip"><p style={{ margin: 0 }}>{linked(st.tip)}</p></Fold>}
            </>
          );
        })()}

        {screen.kind === 'theme' && g.themes && (() => {
          const t = g.themes[screen.i];
          return (
            <>
              <div className="sr-eyebrow">{screen.i + 1} of {themeCount}{t.ages ? ` · ${t.ages}` : ''}</div>
              <h2>{t.title}</h2>
              {t.rule && <div className="sr-rule">{t.rule}</div>}
              <div className="sr-cards">
                {t.cards.map((cd, i) => (
                  <div className="sr-cardx" key={i}>
                    <div>
                      {cd.name && <h3>{cd.name}</h3>}
                      <p>{cd.t}</p>
                      {cd.d && <small><b>Deeper</b> {cd.d}</small>}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {art(cd.art) ? <img src={art(cd.art)} alt="" loading="lazy" /> : <span />}
                  </div>
                ))}
              </div>
              {t.extras?.length ? (
                <Fold label="Extras">
                  <ul>{t.extras.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </Fold>
              ) : null}
            </>
          );
        })()}

        {screen.kind === 'ref' && g.reference && (
          <>
            <div className="sr-eyebrow">Keep this open</div>
            <h2>{g.reference.title}</h2>
            {refBody()}
          </>
        )}

        {screen.kind === 'done' && (
          <>
            <div className="sr-eyebrow">You made it</div>
            <h2>{g.conclusion?.headline || 'Done!'}</h2>
            {g.conclusion?.text && <p className="sr-lead">{g.conclusion.text}</p>}
            {g.conclusion?.celebrate && (
              <div className="sr-celebrate">
                <div className="sr-eyebrow" style={{ color: 'var(--ac)' }}>Celebrate</div>
                <p style={{ margin: '6px 0 0', fontSize: 15 }}>{g.conclusion.celebrate}</p>
              </div>
            )}
            {g.makeItReal && (
              <div className="sr-card">
                <div className="sr-role">Make it real</div>
                <p>{g.makeItReal}</p>
              </div>
            )}
            {g.signs?.length ? <Fold label="Signs it's working"><ul>{g.signs.map((s, i) => <li key={i}>{s}</li>)}</ul></Fold> : null}
            {g.conclusion?.extensions?.length ? <Fold label="Keep it going"><ul>{g.conclusion.extensions.map((s, i) => <li key={i}>{s}</li>)}</ul></Fold> : null}
            <div className="sr-actions">
              {effort && <WeDidIt slug={g.slug} />}
              {effort && <div className="rd-trail"><AddToWeekButton slug={g.slug} title={title} variant="text" /></div>}
              <a href={`/api/download/activity/${g.slug}`} onClick={downloadClick} className="rd-btn sr-btn-ghost">
                {tier === 'trial' ? 'Download with membership' : 'Download the PDF'}
              </a>
            </div>
          </>
        )}
      </div>

      <nav className="sr-nav" aria-label="Guide navigation">
        {at > 0 && (
          <button type="button" className="sr-prev" onClick={() => go(at - 1)}>
            &larr; {screens[at - 1].kind === 'step' ? `Step ${(screens[at - 1] as { i: number }).i + 1}` : screens[at - 1].label}
          </button>
        )}
        {at < screens.length - 1 ? (
          <button type="button" className="sr-next" onClick={() => go(at + 1)}>
            {screens[at + 1].kind === 'step' ? `Step ${(screens[at + 1] as { i: number }).i + 1}` : screens[at + 1].label}&nbsp;&rarr;
          </button>
        ) : (
          <button type="button" className="sr-next" onClick={() => go(0)}>Back to the start</button>
        )}
      </nav>

      {sheet !== null && g.reference && (
        <div className="sr-sheet-bg" onClick={() => setSheet(null)}>
          <div className="sr-sheet" role="dialog" aria-modal="true" aria-label={g.reference.title} onClick={(e) => e.stopPropagation()}>
            <div className="sr-sheet-head">
              <b>{g.reference.title}</b>
              <button type="button" onClick={() => setSheet(null)} aria-label="Close">Close</button>
            </div>
            <div className="sr-sheet-body">{refBody('sr-sheet-')}</div>
          </div>
        </div>
      )}

      <TrialCapModal open={capModalOpen} onClose={() => setCapModalOpen(false)} trialEndsAt={trialEndsAt} priceLabel={priceLabel} isFounder={isFounder} />
    </main>
  );
}
