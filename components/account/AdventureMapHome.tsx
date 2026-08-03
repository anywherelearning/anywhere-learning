'use client';

/**
 * THE ADVENTURE MAP — member Home (July 2026 redesign, v2 modern finish).
 *
 * THESIS: the Home is a living map you travel, not a dashboard. The explorer is
 *   a token on a winding trail; finished activities are waypoints behind you
 *   carrying the gear earned there; the next activity is the glowing stop ahead.
 *   A backpack below shows the whole collection: what's gathered and what's left.
 * OWN-WORLD: soft grainy-gradient illustrated terrain (contemporary flat-with-
 *   depth), glassmorphic chrome, refined muted palette. Bricolage Grotesque +
 *   mono coordinates. Deliberately NOT flat 2000s clip-art.
 * STORY: the parent sees how far the family has come, the very next step, and a
 *   collection worth filling.
 * FIRST VIEWPORT: full illustrated map; trail climbs through collected gear to
 *   "YOU ARE HERE", a glowing next marker ahead, a glass signpost with the next
 *   entry + actions. The backpack collection sits just below.
 * FORM: illustrated trail map + collection. Same per-kid data; only the world changed.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { loadProfile, childAge, DEMO_KIDS, type Child } from '@/lib/member-profile';
import { loadWeek, removeItem, FAMILY_TARGET, type WeekItem } from '@/lib/week';
import { markDone as markDoneStatus } from '@/lib/account-status';
import { recordCompletion, completionLog } from '@/lib/completions';
import { packFor, GEAR, TIER_META, type GearTier, type EarnedGear } from '@/lib/gear';
import { gearIconSVG } from '@/lib/explorer-art';
import { ExplorerFigure, ExplorerHead } from '@/components/account/ExplorerAvatar';
import ExplorerBuilder from '@/components/account/ExplorerBuilder';
import KidsSetup from '@/components/account/KidsSetup';
import PlannerModal from '@/components/account/PlannerModal';
import { avatarFor, saveAvatar, nudgeFor, walkMode, type KidAvatar } from '@/lib/kid-roadmap';
import { activeQuest, earnedMedals, writeChallenge, clearChallenge, type MonthChallengeEntry } from '@/lib/month-challenge';
import { nextForKid, territoryOf, engineFor, skipTerritory, passActivity, clearPassed } from '@/lib/plan-engine';
import { loadPrefs } from '@/lib/plan-prefs';
import { hexToRgba, minsLabel } from '@/lib/activity-visuals';
import { areaMetaForSlug } from '@/lib/roadmap';
import type { PlanActivity } from '@/lib/weekly-plan';
import type { Effort } from '@/lib/activity-effort';

function childLabel(c: Child, i: number) {
  return c.name.trim() || `Child ${i + 1}`;
}

// One trail shape per leg (cycled by leg index) so consecutive legs feel
// different — rolling, zigzagging, climbing. All keep the same contract: 12
// stops from the bottom-left to the right edge, evenly-ish spaced, with the
// right end (x≳1080) held high so the token + avatars clear the signpost card.
const TRAILS: [number, number][][] = [
  // 0 — steady climb
  [[150, 852], [292, 782], [430, 710], [560, 628], [674, 544], [784, 468], [888, 410], [996, 372], [1108, 350], [1232, 340], [1362, 336], [1500, 334]],
  // 1 — rolling waves
  [[150, 834], [278, 762], [404, 820], [528, 744], [652, 796], [774, 704], [892, 612], [1002, 490], [1112, 366], [1244, 348], [1378, 338], [1508, 332]],
  // 2 — early climb, then gentle
  [[150, 856], [272, 714], [398, 762], [524, 644], [650, 704], [774, 576], [894, 504], [1006, 416], [1116, 356], [1248, 342], [1382, 336], [1510, 332]],
  // 3 — bigger zigzag
  [[150, 812], [272, 868], [400, 730], [526, 808], [652, 678], [776, 748], [896, 576], [1006, 446], [1118, 362], [1250, 344], [1384, 338], [1512, 334]],
  // 4 — gentle S, dipping past the trees
  [[150, 860], [280, 786], [406, 704], [532, 782], [656, 628], [780, 704], [900, 528], [1010, 414], [1122, 358], [1252, 344], [1384, 336], [1512, 332]],
];
const STOPS = TRAILS[0].length; // 12 — same on every trail
const VW = 1600, VH = 1000;
const px = (x: number) => `${(x / VW) * 100}%`;
const py = (y: number) => `${(y / VH) * 100}%`;

function smooth(pts: [number, number][]) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const xm = (pts[i][0] + pts[i + 1][0]) / 2;
    const ym = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q ${pts[i][0]} ${pts[i][1]} ${xm} ${ym}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return d;
}

// Where the trees sit on the map (same spots every leg; the glyph changes).
const TREES: [number, number][] = [
  [120, 476], [192, 516], [70, 526], [1046, 616], [1116, 576], [1186, 636],
  [1298, 476], [300, 776], [1430, 696], [560, 820], [980, 670],
];

type TreeKind = 'broadleaf' | 'pine' | 'cactus' | 'palm' | 'snowpine';

interface Region {
  name: string;
  tree: TreeKind;
  snow: boolean;   // white caps on the peaks
  river: boolean;  // draw the water ribbon
  vars: Record<string, string>; // palette, applied as CSS vars on the map
}

// The legs of one long expedition. Each time the trail fills, the family wraps
// to the next region (scenery changes; the total stop count keeps climbing).
const REGIONS: Region[] = [
  {
    name: 'Forest Valley', tree: 'broadleaf', snow: true, river: true,
    vars: {
      '--r-sky1': 'var(--am-sky1)', '--r-sky2': 'var(--am-sky2)',
      '--r-hilltop': '#e6d5ad', '--r-hill': 'var(--am-hill)',
      '--r-hill2top': '#d8c091', '--r-hill2': 'var(--am-hill-2)',
      '--r-foresttop': '#8ba876', '--r-forest': 'var(--am-forest-deep)',
      '--r-mtntop': '#a9bbb0', '--r-mtn': '#8ba28e',
      '--r-water1': '#a6d0d8', '--r-water2': 'var(--am-water)',
      '--r-sun1': '#f6d98a', '--r-sun2': '#f0c869', '--r-suncore': '#f4d27e',
    },
  },
  {
    name: 'Highland Peaks', tree: 'pine', snow: true, river: true,
    vars: {
      '--r-sky1': '#d4e6ef', '--r-sky2': '#eef4f4',
      '--r-hilltop': '#cdd3c6', '--r-hill': '#a7b4a4',
      '--r-hill2top': '#b8c2b6', '--r-hill2': '#8fa091',
      '--r-foresttop': '#6f8f77', '--r-forest': '#40614c',
      '--r-mtntop': '#bccad3', '--r-mtn': '#8598a3',
      '--r-water1': '#bfe0e6', '--r-water2': '#7fb6c0',
      '--r-sun1': '#eef1e9', '--r-sun2': '#e3ebe6', '--r-suncore': '#eef2ec',
    },
  },
  {
    name: 'Golden Desert', tree: 'cactus', snow: false, river: false,
    vars: {
      '--r-sky1': '#f5e4c6', '--r-sky2': '#f8f0dc',
      '--r-hilltop': '#eccf95', '--r-hill': '#d9a866',
      '--r-hill2top': '#e3ba7e', '--r-hill2': '#c9954f',
      '--r-foresttop': '#e9cd8c', '--r-forest': '#cf9f5b',
      '--r-mtntop': '#d3a072', '--r-mtn': '#b1774d',
      '--r-water1': '#a6d0d8', '--r-water2': '#79b6bf',
      '--r-sun1': '#f8cf74', '--r-sun2': '#f4bd58', '--r-suncore': '#f6c866',
    },
  },
  {
    name: 'Sunny Coast', tree: 'palm', snow: false, river: true,
    vars: {
      '--r-sky1': '#bfe3ee', '--r-sky2': '#e9f5f2',
      '--r-hilltop': '#efd9a8', '--r-hill': '#e2c187',
      '--r-hill2top': '#ecd39a', '--r-hill2': '#dbb877',
      '--r-foresttop': '#5fc3c9', '--r-forest': '#2f8f9c',
      '--r-mtntop': '#bcd3cf', '--r-mtn': '#9ab8b4',
      '--r-water1': '#7fd0d4', '--r-water2': '#3f9aa6',
      '--r-sun1': '#f7d98a', '--r-sun2': '#f3c869', '--r-suncore': '#f5d27e',
    },
  },
  {
    name: 'Snowfield', tree: 'snowpine', snow: true, river: true,
    vars: {
      '--r-sky1': '#dbe8f0', '--r-sky2': '#f3f8fb',
      '--r-hilltop': '#eef4f8', '--r-hill': '#d5e2ea',
      '--r-hill2top': '#e4eef4', '--r-hill2': '#c7d8e2',
      '--r-foresttop': '#d3e3ea', '--r-forest': '#b0c7d3',
      '--r-mtntop': '#d2dfe8', '--r-mtn': '#a9c0cd',
      '--r-water1': '#cfe6ec', '--r-water2': '#a3c8d4',
      '--r-sun1': '#f0f4f7', '--r-sun2': '#e6eef3', '--r-suncore': '#eef4f7',
    },
  },
];

/** The tree canopy for a region (sits above a shared shadow + baseline y≈54). */
function TreeGlyph({ kind }: { kind: TreeKind }) {
  switch (kind) {
    case 'pine':
      return (
        <>
          <path d="M0,-24 L-22,6 L22,6 Z" fill="var(--r-foresttop)" />
          <path d="M0,-8 L-26,30 L26,30 Z" fill="var(--r-forest)" />
          <path d="M0,4 L-30,44 L30,44 Z" fill="var(--r-foresttop)" opacity="0.92" />
          <rect x="-4" y="42" width="8" height="12" rx="2" fill="#6f5433" />
        </>
      );
    case 'snowpine':
      return (
        <>
          <path d="M0,-24 L-22,6 L22,6 Z" fill="var(--r-forest)" />
          <path d="M0,-8 L-26,30 L26,30 Z" fill="var(--r-forest)" />
          <path d="M0,4 L-30,44 L30,44 Z" fill="var(--r-forest)" />
          <path d="M0,-24 L-9,-9 L9,-9 Z" fill="#ffffff" opacity="0.92" />
          <path d="M0,-8 L-12,9 L12,9 Z" fill="#ffffff" opacity="0.8" />
          <path d="M0,4 L-15,23 L15,23 Z" fill="#ffffff" opacity="0.68" />
          <rect x="-4" y="42" width="8" height="12" rx="2" fill="#6f5433" />
        </>
      );
    case 'cactus':
      return (
        <>
          <rect x="-9" y="-20" width="18" height="74" rx="9" fill="var(--r-foresttop)" />
          <rect x="-25" y="4" width="10" height="28" rx="5" fill="var(--r-foresttop)" />
          <rect x="-25" y="-6" width="10" height="16" rx="5" fill="var(--r-foresttop)" />
          <rect x="15" y="-2" width="10" height="26" rx="5" fill="var(--r-foresttop)" />
          <rect x="15" y="-16" width="10" height="18" rx="5" fill="var(--r-foresttop)" />
          <ellipse cx="0" cy="-14" rx="6" ry="8" fill="#ffffff" opacity="0.14" />
        </>
      );
    case 'palm':
      return (
        <>
          <path d="M2,54 Q-4,22 -3,-12" stroke="#8a6a44" strokeWidth="8" fill="none" strokeLinecap="round" />
          <g fill="var(--r-foresttop)">
            <path d="M-3,-12 Q-36,-20 -42,-4 Q-22,-14 -3,-6 Z" />
            <path d="M-3,-12 Q30,-22 40,-8 Q20,-14 -3,-6 Z" />
            <path d="M-3,-12 Q-22,-40 -8,-48 Q-3,-28 -3,-6 Z" />
            <path d="M-3,-12 Q18,-38 8,-50 Q-1,-30 -3,-6 Z" />
          </g>
          <circle cx="-3" cy="-11" r="4" fill="var(--r-forest)" />
        </>
      );
    default: // broadleaf
      return (
        <>
          <circle cx="0" cy="6" r="24" fill="var(--r-foresttop)" />
          <circle cx="-13" cy="20" r="17" fill="var(--r-forest)" opacity="0.9" />
          <circle cx="13" cy="20" r="17" fill="var(--r-forest)" opacity="0.9" />
          <rect x="-4" y="36" width="8" height="18" rx="2" fill="#7a5a38" />
        </>
      );
  }
}

const TIER_ORDER: GearTier[] = ['find', 'everyday', 'big'];
const TIER_LABEL: Record<GearTier, string> = { find: 'Trail finds', everyday: 'Everyday gear', big: 'Big gear' };

function fmtDate(at?: string) {
  if (!at) return '';
  try {
    return new Date(at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

interface GearDetail {
  id: string;
  name: string;
  tier: GearTier;
  on: boolean;
  slug?: string;
  at?: string;
  fresh?: boolean;
}

/** One explorer's fresh gear from just-finishing an activity together. */
interface NewFind {
  kidId: string;
  name: string;
  avatar: KidAvatar | null;
  gear: EarnedGear;
}

/** A quick "what they're into" line for the signpost: the first sentence of the
 *  parent-facing description, falling back to the SEO excerpt. */
function blurbFor(a?: PlanActivity): string {
  const src = (a?.description ?? a?.excerpt ?? '').trim();
  if (!src) return '';
  const m = src.match(/^.*?[.!?](\s|$)/);
  const sentence = (m ? m[0] : src).trim();
  // Fits two lines on the card? Keep the whole sentence.
  if (sentence.length <= 104) return sentence;
  // Too long: end it early at the last clause (comma) or word before ~100 chars,
  // then close cleanly with a period — never trailing "…".
  const cut = sentence.slice(0, 100);
  const comma = cut.lastIndexOf(',');
  const end = comma > 55 ? comma : cut.lastIndexOf(' ');
  return sentence.slice(0, end > 0 ? end : 100).replace(/[\s,;:—-]+$/, '') + '.';
}

// ── monthly-challenge keepsake medal (earned by finishing a family challenge) ──
function MedalIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="15" r="6" /><path d="M8.5 9 6 2h4l1.5 4M15.5 9 18 2h-4l-1.5 4" />
    </svg>
  );
}
// Compact keepsake: a gold coin stamped with the month's first letter. Tapping
// it opens a popup with the full challenge. Stays small as they accumulate.
function MonthMedal({ entry, onOpen }: { entry: MonthChallengeEntry; onOpen: (e: MonthChallengeEntry) => void }) {
  return (
    <button type="button" className="am-medal" title={`${entry.month}: ${entry.title}`} aria-label={`${entry.month} monthly challenge`} onClick={() => onOpen(entry)}>
      {entry.month.slice(0, 1)}
    </button>
  );
}

export default function AdventureMapHome({
  activities,
  preview = false,
}: {
  activities: PlanActivity[];
  preview?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [sel, setSel] = useState(0);
  const [items, setItems] = useState<WeekItem[]>([]);
  const [avatars, setAvatars] = useState<Record<string, KidAvatar | null>>({});
  const [packByKid, setPackByKid] = useState<Record<string, EarnedGear[]>>({});
  const [editKids, setEditKids] = useState(false);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<GearDetail | null>(null);
  const [finds, setFinds] = useState<NewFind[] | null>(null);
  const [rev, setRev] = useState(0); // bump to recompute the engine after skip/swap
  const [menu, setMenu] = useState<{ kid: string; name: string } | null>(null);
  const [menuView, setMenuView] = useState<'main' | 'backpack' | 'builder' | 'plan'>('main');
  const [planOpen, setPlanOpen] = useState(false); // the "Add activities" picker
  const [planForKid, setPlanForKid] = useState<number | undefined>(undefined);
  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set()); // in-flight "Done" veils
  const [quest, setQuest] = useState<MonthChallengeEntry | null>(null); // this month's accepted challenge
  const [medals, setMedals] = useState<MonthChallengeEntry[]>([]); // finished monthly challenges
  const [medalDetail, setMedalDetail] = useState<MonthChallengeEntry | null>(null); // tapped-medal popup

  const bySlug = useMemo(() => {
    const m = new Map<string, PlanActivity>();
    activities.forEach((a) => m.set(a.slug, a));
    return m;
  }, [activities]);
  const effortBySlug = useMemo(() => {
    const m: Record<string, Effort> = {};
    activities.forEach((a) => (m[a.slug] = a.effort));
    return m;
  }, [activities]);

  function recomputePack(cid: string): EarnedGear[] {
    const comps = completionLog()
      .filter((l) => l.child === cid)
      .map((l) => ({ slug: l.slug, at: l.at, effort: effortBySlug[l.slug] ?? ('Quick' as Effort) }));
    return packFor(cid, comps);
  }

  function load() {
    // Guest teaser: ignore localStorage entirely and show a generic demo trail.
    // Keeps the paywalled backdrop appealing and free of any real/stale family.
    if (preview) {
      setChildren(DEMO_KIDS);
      setItems([]);
      setAvatars({});
      setPackByKid({});
      setQuest(null);
      setMedals([]);
      setReady(true);
      return;
    }
    const p = loadProfile();
    const kids = p?.children ?? [];
    setChildren(kids);
    setItems(loadWeek());
    const av: Record<string, KidAvatar | null> = {};
    const pk: Record<string, EarnedGear[]> = {};
    kids.forEach((c, i) => {
      const cid = c.id ?? childLabel(c, i);
      av[cid] = avatarFor(cid);
      pk[cid] = recomputePack(cid);
    });
    setAvatars(av);
    setPackByKid(pk);
    setQuest(activeQuest());
    setMedals(earnedMedals());
    setReady(true);
  }
  useEffect(() => {
    load();
    // Re-read the monthly challenge when the family comes back from This Month
    // (accepting / finishing it there should show up here without a reload).
    const refresh = () => { setQuest(activeQuest()); setMedals(earnedMedals()); };
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;
  if (children.length === 0) {
    return <KidsSetup onDone={() => load()} onSkip={() => load()} />;
  }

  const i = Math.min(sel, children.length - 1);
  const c = children[i];
  const cid = c.id ?? childLabel(c, i);
  const label = childLabel(c, i);
  const av = avatars[cid] ?? null;
  const pack = packByKid[cid] ?? [];
  const laneItems = items.filter((it) => it.child === cid);
  // The next stop on the shared trail is always the Skills Map engine's pick;
  // a kid's own added activities are extra (gear only), tracked separately.
  void rev; // engine reads localStorage; rev forces recompute after skip/swap
  const prefs = loadPrefs();
  const enabledTerritories = new Set(prefs.territories);
  const enabledEfforts = new Set(prefs.efforts);
  const family = preview ? true : (walkMode() ?? 'family') === 'family'; // one shared trail (default) vs per-kid
  const sideBySide = family && children.length > 1;
  const familyName = (() => {
    const ns = children.map((kd, ki) => childLabel(kd, ki));
    if (ns.length <= 1) return ns[0] ?? label;
    if (ns.length === 2) return `${ns[0]} & ${ns[1]}`;
    return `${ns.slice(0, -1).join(', ')} & ${ns[ns.length - 1]}`;
  })();
  const engineScope = family ? 'family' : cid;
  const allLogs = completionLog();
  // family: the shared trail's engine sees the whole family's history (so a
  // solo activity by one kid won't be offered to everyone); individual: just
  // this kid. doneSlugs (lifetime) ranks territory coverage; recentDone (last
  // year) is what's actually excluded, so activities resurface after a year.
  const scopedLogs = family ? allLogs : allLogs.filter((l) => l.child === cid);
  const doneSlugs = new Set(scopedLogs.map((l) => l.slug));
  const yearCutoff = Date.now() - 365 * 86400000;
  const recentDone = new Set(scopedLogs.filter((l) => Date.parse(l.at) >= yearCutoff).map((l) => l.slug));
  const doneAt = new Map<string, number>();
  scopedLogs.forEach((l) => {
    const t = Date.parse(l.at);
    if (!Number.isNaN(t) && t > (doneAt.get(l.slug) ?? 0)) doneAt.set(l.slug, t);
  });
  // family: fit the youngest kid so everyone can join; individual: this kid
  const familyAges = children.map((kd) => childAge(kd)).filter((a): a is number => a != null);
  const engineAge = family ? (familyAges.length ? Math.min(...familyAges) : null) : childAge(c);
  const eng = engineFor(engineScope);
  // The MAIN trail is always the "together" activity the engine picks — a kid's
  // own added activities never hijack it; they only earn that kid extra gear.
  // A "whole family" pick added from the Library queues onto the shared trail as
  // a manual next-stop that overrides the engine until it's completed.
  const familyPick = family ? items.find((it) => it.child === FAMILY_TARGET) : undefined;
  const enginePick = nextForKid({ age: engineAge, doneSlugs, recentDone, doneAt, passed: eng.passed, skips: eng.skips, nudge: nudgeFor(engineScope), activities, enabledTerritories, enabledEfforts });
  const nextSlug = familyPick?.slug ?? enginePick?.slug;
  const nextAct = nextSlug ? bySlug.get(nextSlug) : undefined;
  const nextTerritorySlug = familyPick ? territoryOf(familyPick.slug)?.slug : enginePick?.territorySlug;
  const isEnginePick = !familyPick && !!enginePick;
  // Extra activities THIS explorer is doing on their own (earn gear only).
  const soloItems = laneItems;

  // The shared trail advances only with activities the WHOLE family has done
  // together: each "reached it" records for every kid, so together-activities
  // are the slugs present in every kid's log. A solo activity lands in only one
  // kid's log, so it never moves the token — it just adds a gear to the pack.
  const kidIds = children.map((kd, ki) => kd.id ?? childLabel(kd, ki));
  const perKidSlugs = kidIds.map((id) => new Set(allLogs.filter((l) => l.child === id).map((l) => l.slug)));
  const sharedCount = perKidSlugs.length
    ? [...perKidSlugs[0]].filter((s) => perKidSlugs.every((set) => set.has(s))).length
    : 0;
  const total = family ? sharedCount : pack.length;
  // Legs of one long journey: fill the trail, then wrap to the next region.
  const PER_LEG = STOPS - 1;
  const leg = Math.floor(total / PER_LEG);
  const region = REGIONS[leg % REGIONS.length];
  const legPoints = TRAILS[leg % TRAILS.length];
  const k = total % PER_LEG;
  const trailFinds = pack.slice(Math.max(0, pack.length - k));
  const tokenPt = legPoints[k];
  const nextPt = legPoints[k + 1];
  const futurePts = legPoints.slice(k + 2);
  const traveled = smooth(legPoints.slice(0, k + 1));
  const ahead = smooth(legPoints.slice(k));

  // backpack collection: earned (unique) vs the full catalog
  const earnedIds = new Set(pack.map((g) => g.id));
  const earnedById = new Map(pack.map((g) => [g.id, g] as const));
  const catalogTotal = TIER_ORDER.reduce((n, t) => n + GEAR[t].length, 0);
  const activityTitle = (slug?: string) => (slug ? bySlug.get(slug)?.title ?? slug.replace(/-/g, ' ') : 'an activity');
  const collected = earnedIds.size;
  const pctCollected = Math.round((collected / catalogTotal) * 100);

  function logNext() {
    if (!nextSlug || busy) return;
    const slug = nextSlug;
    setBusy(true);
    removeItem(slug, cid); // no-op for an engine pick (not on the plan queue)
    removeItem(slug, FAMILY_TARGET); // clear it if this was a manual family pick
    markDoneStatus(slug);
    // family trail: every explorer did it together and earns a find; individual: just this kid
    const recipients = family
      ? children.map((kd, ki) => ({ id: kd.id ?? childLabel(kd, ki), name: childLabel(kd, ki) }))
      : [{ id: cid, name: label }];
    recipients.forEach((r) => recordCompletion(slug, r.id));
    clearPassed(engineScope); // finishing one lets earlier swap-aways resurface later
    setPackByKid((prev) => {
      const out = { ...prev };
      recipients.forEach((r) => { out[r.id] = recomputePack(r.id); });
      return out;
    });
    setItems(loadWeek());
    setRev((r) => r + 1);
    // reveal the fresh find for every explorer who just did it, not only the
    // one selected in the trail card
    const revealed: NewFind[] = [];
    recipients.forEach((r) => {
      const rp = recomputePack(r.id);
      const g = rp[rp.length - 1];
      if (g) revealed.push({ kidId: r.id, name: r.name, avatar: avatars[r.id] ?? null, gear: g });
    });
    if (revealed.length) setFinds(revealed);
    setBusy(false);
  }

  // ─── plan management, folded into the explorer pop-up (no separate page) ───
  function openPlanner(kidIndex: number) {
    setPlanForKid(kidIndex);
    setPlanOpen(true);
  }
  function closePlanner() {
    setPlanOpen(false);
    setItems(loadWeek());
    setRev((r) => r + 1);
  }
  // Remove from the plan without marking done, so it can be suggested again.
  function removePlan(slug: string, kidId: string) {
    removeItem(slug, kidId);
    setItems(loadWeek());
    setRev((r) => r + 1);
  }
  // Check one off: mark done, earn the gear, reveal the find, advance the engine.
  function donePlan(slug: string, kidId: string, kidName: string) {
    const key = `${slug}__${kidId}`;
    setDoneKeys((prev) => new Set(prev).add(key));
    window.setTimeout(() => {
      removeItem(slug, kidId);
      markDoneStatus(slug);
      recordCompletion(slug, kidId);
      clearPassed(engineScope);
      const pack = recomputePack(kidId);
      setPackByKid((prev) => ({ ...prev, [kidId]: pack }));
      setItems(loadWeek());
      setRev((r) => r + 1);
      setDoneKeys((prev) => { const n = new Set(prev); n.delete(key); return n; });
      const g = pack[pack.length - 1];
      if (g) setFinds([{ kidId, name: kidName, avatar: avatars[kidId] ?? null, gear: g }]);
    }, 640);
  }

  function skipArea() {
    if (!nextTerritorySlug) return;
    skipTerritory(engineScope, nextTerritorySlug);
    setRev((r) => r + 1);
  }

  function differentOne() {
    if (!nextSlug) return;
    passActivity(engineScope, nextSlug);
    setRev((r) => r + 1);
  }

  function openMenu(_e: React.MouseEvent, kidId: string, ki: number, name: string) {
    setSel(ki);
    setMenuView('main');
    setMenu({ kid: kidId, name });
  }

  // First-time build opens the same explorer pop-up as every later edit, jumped
  // straight to the builder view — never the old inline card under the trail.
  function openBuilder(kidId: string, ki: number, name: string) {
    setSel(ki);
    setMenuView('builder');
    setMenu({ kid: kidId, name });
  }

  return (
    <main className="am-root">
      <style>{`
        .am-root{background:linear-gradient(180deg,var(--am-bg1),var(--am-bg2));min-height:100vh;font-family:var(--font-body),sans-serif;color:var(--am-ink);padding:clamp(14px,2.5vw,30px)}
        .am-plate{font-family:var(--font-plate),sans-serif}
        .am-mono{font-family:var(--font-catalog),monospace}
        .am-wrap{max-width:1200px;margin:0 auto}
        .am-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:0 6px;margin-bottom:14px}
        .am-kicker{font-family:var(--font-catalog),monospace;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--am-trail)}
        .am-h1{font-family:var(--font-plate),sans-serif;font-size:clamp(32px,6vw,52px);font-weight:800;letter-spacing:-0.02em;line-height:1.02;margin:6px 0 0}
        .am-link{font-family:var(--font-catalog),monospace;font-size:12px;color:var(--am-muted);text-decoration:none}
        .am-quest{display:flex;align-items:center;gap:11px;margin:0 6px 12px;padding:10px 15px;border-radius:15px;color:#fff;background:linear-gradient(145deg,#d9ac52,#c0873f 60%,#a86f2c);box-shadow:0 18px 36px -22px rgba(150,100,25,.75)}
        .am-quest-flag{flex-shrink:0;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.22)}
        .am-quest-kicker{display:block;font-family:var(--font-catalog),monospace;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.92}
        .am-quest-title{display:block;font-family:var(--font-plate),sans-serif;font-size:clamp(16px,2vw,19px);font-weight:800;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .am-quest-actions{flex-shrink:0;display:flex;align-items:center;gap:7px}
        .am-quest-done{font-family:var(--font-catalog),monospace;font-size:11.5px;font-weight:700;letter-spacing:.04em;background:#fff;color:#9a6b1f;border:none;padding:7px 14px;border-radius:999px;cursor:pointer;transition:transform .14s,filter .14s}
        .am-quest-done:hover{transform:translateY(-1px);filter:brightness(1.04)}
        .am-quest-cancel{font-family:var(--font-body),sans-serif;font-size:12px;font-weight:600;background:transparent;color:rgba(255,255,255,.9);border:none;cursor:pointer;padding:6px 4px;text-decoration:underline;text-underline-offset:3px}
        .am-quest-cancel:hover{color:#fff}
        .am-medals{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 6px 12px;padding:9px 14px;border-radius:15px;background:rgba(214,162,78,.12);border:1px solid rgba(214,162,78,.32)}
        .am-medals-label{font-family:var(--font-catalog),monospace;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#9a6b1f}
        .am-medal{width:34px;height:34px;border-radius:50%;border:2px solid rgba(255,255,255,.9);cursor:pointer;display:grid;place-items:center;font-family:var(--font-plate),sans-serif;font-size:15px;font-weight:800;color:#6e4d12;background:radial-gradient(circle at 40% 33%,#f6d876,#cf9a2e);box-shadow:0 4px 10px -4px rgba(120,80,10,.7);transition:transform .14s}
        .am-medal:hover{transform:translateY(-2px) scale(1.06)}
        .am-modal-medals{margin-top:4px;padding-top:12px;border-top:1px solid rgba(50,40,20,.1)}
        .am-link:hover{color:var(--am-flag)}
        .am-frame{position:relative;border-radius:26px;overflow:hidden;box-shadow:0 40px 90px -46px rgba(50,48,42,.55),0 2px 0 rgba(255,255,255,.5) inset}
        .am-map{position:relative;width:100%;height:clamp(440px,68vh,640px)}
        @media (max-width:760px){.am-map{height:60vh;min-height:430px}}
        .am-svg{position:absolute;inset:0;width:100%;height:100%}
        .am-grain{position:absolute;inset:0;width:100%;height:100%;opacity:.10;mix-blend-mode:soft-light;pointer-events:none}
        .am-vignette{position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 140px rgba(50,40,20,.16)}
        .am-chrome{position:absolute;inset:0;pointer-events:none}
        .am-chrome>*{pointer-events:auto}
        .am-glass{background:rgba(247,242,232,.62);backdrop-filter:blur(12px) saturate(1.1);-webkit-backdrop-filter:blur(12px) saturate(1.1);border:1px solid rgba(255,255,255,.55);box-shadow:0 10px 30px -14px rgba(50,40,20,.4)}
        .am-tabs{position:absolute;top:16px;left:16px;display:flex;gap:7px;flex-wrap:wrap;max-width:72%}
        .am-tab{font-family:var(--font-catalog),monospace;font-size:11.5px;letter-spacing:.03em;text-transform:uppercase;color:var(--am-ink);padding:7px 13px;border-radius:22px;cursor:pointer;background:rgba(247,242,232,.6);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.5);box-shadow:0 6px 16px -10px rgba(50,40,20,.5);transition:transform .14s ease,background .14s ease,box-shadow .14s ease}
        .am-tab:hover:not([data-on="true"]){background:rgba(247,242,232,.92);box-shadow:0 8px 18px -10px rgba(50,40,20,.55)}
        .am-tab:active{transform:translateY(1px)}
        .am-tab[data-on="true"]{background:var(--am-flag);color:#fff;border-color:transparent}
        .am-pin{position:absolute;transform:translate(-50%,-50%)}
        .am-find{width:clamp(38px,3.6vw,50px);height:clamp(38px,3.6vw,50px);border-radius:50%;background:rgba(247,242,232,.9);border:1px solid rgba(255,255,255,.7);box-shadow:0 8px 18px -7px rgba(50,40,20,.55);padding:7px;display:grid;place-items:center}
        .am-find::after{content:"";position:absolute;inset:auto 0 -9px 0;height:8px;margin:0 auto;width:60%;border-radius:50%;background:rgba(50,40,20,.18);filter:blur(3px)}
        .am-token{position:relative;width:clamp(84px,8.4vw,124px);height:clamp(84px,8.4vw,124px);border-radius:50%;background:radial-gradient(circle at 50% 34%,#fff,rgba(247,242,232,.9));border:3px solid var(--am-flag);box-shadow:0 16px 34px -12px rgba(50,40,20,.6),0 0 0 8px rgba(208,104,74,.12);cursor:pointer;overflow:hidden;display:grid;place-items:center}
        .am-token>div{width:80%}
        .am-family-row{display:flex;align-items:flex-end;justify-content:center}
        .am-token-fam{width:clamp(54px,6vw,84px);height:clamp(54px,6vw,84px);margin:0 -9px;border-width:2.5px;border-color:rgba(255,255,255,.85);box-shadow:0 10px 22px -10px rgba(50,40,20,.55);opacity:.92}
        .am-token-fam.is-sel{border-color:var(--am-flag);box-shadow:0 15px 30px -12px rgba(50,40,20,.6),0 0 0 6px rgba(208,104,74,.14);opacity:1;z-index:3;transform:translateY(-5px)}
        .am-token-fam>div{width:82%}
        .am-here{position:absolute;top:-32px;left:50%;transform:translateX(-50%);white-space:nowrap;font-family:var(--font-catalog),monospace;font-size:10px;letter-spacing:.08em;color:var(--am-ink);padding:4px 9px;border-radius:20px}
        .am-next{position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;width:52px;height:52px}
        .am-next-glow{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(208,104,74,.5),transparent 68%);animation:amGlow 2.2s ease-in-out infinite}
        .am-next-dot{position:relative;width:24px;height:24px;border-radius:50%;background:var(--am-flag);border:3px solid #fff;box-shadow:0 6px 14px -5px rgba(50,40,20,.6)}
        .am-signpost{position:absolute;right:18px;bottom:18px;z-index:6;width:min(350px,66%);border-radius:18px;overflow:hidden}
        @media (max-width:760px){.am-signpost{position:static;width:auto;margin:0;border-radius:0;border:none;border-top:1px solid rgba(255,255,255,.5)}.am-tabs{max-width:100%}}
        .am-sign-head{padding:10px 16px;font-family:var(--font-catalog),monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--am-trail);display:flex;justify-content:space-between;align-items:center}
        .am-sign-body{padding:2px 18px 18px}
        .am-territory{font-family:var(--font-catalog),monospace;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--am-gold);margin-bottom:5px}
        .am-sub-actions{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:3px}
        .am-sub-actions button{background:none;border:none;cursor:pointer;font-family:var(--font-catalog),monospace;font-size:11.5px;color:var(--am-muted);padding:4px;text-decoration:underline;text-underline-offset:2px}
        .am-sub-actions button:hover{color:var(--am-flag)}
        .am-sub-actions span{color:var(--am-muted);opacity:.5}
        .am-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;width:100%;border:none;border-radius:12px;padding:13px 16px;font-weight:700;font-size:14px;cursor:pointer;text-decoration:none;transition:filter .15s,transform .12s}
        .am-btn:hover{filter:brightness(1.04)}.am-btn:active{transform:translateY(1px)}
        .am-btn-primary{background:var(--am-flag);color:#fff;box-shadow:0 10px 22px -10px rgba(208,104,74,.8)}
        .am-btn-ghost{background:rgba(255,255,255,.4);color:var(--am-ink);border:1px solid rgba(50,40,20,.16)}
        /* backpack */
        .am-pack{margin-top:16px;border-radius:22px;padding:clamp(18px,2.4vw,26px);background:rgba(247,242,232,.7);border:1px solid rgba(255,255,255,.6);box-shadow:0 24px 60px -40px rgba(50,40,20,.5)}
        .am-pack-head{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
        .am-bar{flex:1;min-width:160px;height:9px;border-radius:6px;background:rgba(50,40,20,.1);overflow:hidden}
        .am-bar>span{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,var(--am-gold),var(--am-flag))}
        .am-tier{margin-top:18px}
        .am-tier-h{display:flex;align-items:baseline;gap:8px;margin-bottom:10px}
        .am-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(clamp(46px,5vw,58px),1fr));gap:9px}
        .am-slot{position:relative;aspect-ratio:1;border-radius:14px;display:grid;place-items:center;padding:9px}
        .am-slot-on{background:#fff;border:1px solid rgba(50,40,20,.08);box-shadow:0 8px 16px -10px rgba(50,40,20,.4)}
        .am-slot-off{background:rgba(50,40,20,.05);border:1px dashed rgba(50,40,20,.18)}
        .am-slot-off .am-ico{filter:grayscale(1);opacity:.4}
        .am-slot{transition:transform .12s ease}
        .am-slot:hover{transform:translateY(-2px)}
        .am-ico{width:78%;height:78%;display:grid;place-items:center}
        .am-pack-btn{position:absolute;left:16px;bottom:16px;display:grid;place-items:center;padding:8px;border-radius:18px;cursor:pointer;transition:transform .14s ease,filter .14s ease}
        .am-pack-btn:hover{transform:translateY(-2px);filter:brightness(1.03)}
        .am-pack-btn svg{display:block}
        .am-scrim{position:fixed;inset:0;z-index:200;background:rgba(28,22,12,.5);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);display:grid;place-items:center;padding:20px}
        .am-modal{width:min(760px,100%);max-height:86vh;overflow:auto;background:var(--am-paper);border-radius:22px;box-shadow:0 50px 110px -34px rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.6);animation:amRise .3s cubic-bezier(.22,1,.36,1) both}
        .am-modal-head{position:sticky;top:0;z-index:2;background:var(--am-paper);padding:22px 24px 16px;border-bottom:1px solid rgba(50,40,20,.1);display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
        .am-modal-body{padding:8px 24px 28px}
        .am-close{flex:none;width:34px;height:34px;border-radius:50%;border:1px solid rgba(50,40,20,.15);background:rgba(50,40,20,.05);color:var(--am-ink);font-size:14px;cursor:pointer;display:grid;place-items:center}
        .am-close:hover{background:rgba(50,40,20,.1)}
        .am-find{cursor:pointer;transition:transform .14s ease}
        .am-pin:hover .am-find{transform:scale(1.08)}
        .am-slot{cursor:pointer}
        .am-detail{position:relative;width:min(360px,100%);text-align:center;background:var(--am-paper);border-radius:22px;padding:32px 26px 26px;box-shadow:0 50px 110px -34px rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.6);animation:amRise .3s cubic-bezier(.22,1,.36,1) both}
        .am-detail .am-close{position:absolute;top:14px;right:14px}
        .am-detail-ico{width:118px;height:118px;margin:0 auto 14px}
        .am-finds{position:relative;width:min(400px,100%);text-align:center;background:var(--am-paper);border-radius:22px;padding:30px 22px 22px;box-shadow:0 50px 110px -34px rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.6);animation:amRise .3s cubic-bezier(.22,1,.36,1) both}
        .am-finds .am-close{position:absolute;top:14px;right:14px}
        .am-finds-sub{font-size:13px;color:var(--am-muted);margin:8px 0 16px;line-height:1.5}
        .am-finds-sub strong{color:var(--am-ink)}
        .am-finds-list{display:flex;flex-direction:column;gap:9px}
        .am-find-row{display:flex;align-items:center;gap:11px;text-align:left;background:#fff;border:1px solid rgba(50,40,20,.1);border-radius:14px;padding:9px 12px}
        .am-find-av{flex:none;width:40px;height:40px;border-radius:50%;overflow:hidden;background:radial-gradient(120% 120% at 50% 20%,#dcecee,#eef2e7);display:grid;place-items:center}
        .am-find-tx{display:flex;flex-direction:column;min-width:0;flex:1}
        .am-find-name{font-family:var(--font-catalog),monospace;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--am-gold)}
        .am-find-gear{font-family:var(--font-plate),sans-serif;font-size:15.5px;font-weight:700;color:var(--am-ink);line-height:1.15}
        .am-find-tier{flex:none;font-family:var(--font-catalog),monospace;font-size:9.5px;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap}
        .am-find-ico{flex:none;width:46px;height:46px}
        .am-menu-scrim{position:fixed;inset:0;z-index:250}
        .am-menu{position:fixed;transform:translate(-50%,-100%);z-index:251;min-width:200px;background:var(--am-paper);border-radius:16px;border:1px solid rgba(255,255,255,.6);box-shadow:0 26px 56px -18px rgba(50,40,20,.6);padding:8px;animation:amRise .18s ease both}
        .am-menu::after{content:"";position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);border:8px solid transparent;border-top-color:var(--am-paper);border-bottom:0}
        .am-menu-name{font-family:var(--font-catalog),monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--am-gold);padding:6px 10px 8px}
        .am-menu-item{display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:none;border:none;cursor:pointer;font-family:var(--font-body),sans-serif;font-size:14px;font-weight:600;color:var(--am-ink);padding:10px;border-radius:10px;text-decoration:none;transition:background .12s}
        .am-menu-item:hover{background:rgba(50,40,20,.06)}
        .am-menu-item svg{flex:none;color:var(--am-trail)}
        .am-explorer-modal{position:relative;width:min(600px,100%);max-height:88vh;overflow:auto;background:var(--am-paper);border-radius:24px;border:1px solid rgba(255,255,255,.6);box-shadow:0 50px 110px -34px rgba(0,0,0,.6);animation:amRise .3s cubic-bezier(.22,1,.36,1) both;padding:clamp(18px,3vw,24px)}
        .am-explorer-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:clamp(12px,2vw,20px);align-items:center}
        .am-avatar-stage{position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border-radius:20px;padding:26px 18px 22px;background:radial-gradient(130% 80% at 50% 32%, rgba(146,192,203,.5), rgba(247,242,232,0) 68%), linear-gradient(180deg,#dbebed,#eef2e7 78%)}
        .am-big-figure{position:relative;z-index:2;width:clamp(150px,19vw,196px);aspect-ratio:26/34;display:grid;place-items:center;filter:drop-shadow(0 16px 18px rgba(50,40,20,.22))}
        .am-avatar-name{position:relative;z-index:2;font-family:var(--font-plate),sans-serif;font-size:clamp(23px,2.8vw,30px);font-weight:800;color:var(--am-ink);margin-top:16px}
        .am-backpack-toggle{position:relative;z-index:2;margin-top:13px;display:inline-flex;align-items:center;font-family:var(--font-catalog),monospace;font-size:12px;letter-spacing:.03em;color:var(--am-ink);background:rgba(247,242,232,.92);border:1px solid rgba(50,40,20,.16);border-radius:999px;padding:9px 18px;cursor:pointer;transition:transform .14s,filter .14s}
        .am-backpack-toggle:hover{transform:translateY(-2px);filter:brightness(1.02)}
        .am-bp-count{font-weight:700;color:var(--am-trail)}
        .am-options{display:flex;flex-direction:column;gap:9px;justify-content:center}
        .am-option{display:flex;align-items:center;gap:11px;text-align:left;background:#fff;border:1px solid rgba(50,40,20,.1);border-radius:13px;padding:11px 13px;cursor:pointer;text-decoration:none;transition:transform .14s,box-shadow .14s,border-color .14s}
        .am-option:hover{transform:translateY(-2px);box-shadow:0 14px 28px -14px rgba(50,40,20,.42);border-color:rgba(191,124,72,.45)}
        .am-option-ic{flex:none;width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:rgba(191,124,72,.13);color:var(--am-trail)}
        .am-option-tx{display:flex;flex-direction:row;align-items:center;gap:8px;min-width:0}
        .am-option-tx strong{font-family:var(--font-plate),sans-serif;font-size:14.5px;font-weight:700;color:var(--am-ink);line-height:1.15}
        .am-option-count{flex:none;min-width:20px;height:20px;padding:0 6px;border-radius:999px;display:inline-grid;place-items:center;background:var(--am-flag);color:#fff;font-family:var(--font-catalog),monospace;font-size:11px;font-weight:700}
        .am-option-arrow{margin-left:auto;color:var(--am-trail);font-size:16px}
        @media(max-width:480px){
          .am-explorer-grid{grid-template-columns:1fr;gap:14px}
          .am-big-figure{width:clamp(140px,40vw,180px)}
          .am-option{padding:10px 12px;gap:10px}
          .am-option-ic{width:34px;height:34px;border-radius:10px}
          .am-option-tx strong{font-size:13.5px}
          .am-avatar-name{font-size:20px}
        }
        .am-back{background:none;border:none;cursor:pointer;font-family:var(--font-catalog),monospace;font-size:12px;color:var(--am-muted);padding:2px 4px;margin-bottom:8px}
        .am-back:hover{color:var(--am-flag)}
        .am-plan-now{background:#fff;border:1px solid rgba(50,40,20,.1);border-radius:14px;padding:12px 14px;box-shadow:0 8px 18px -12px rgba(50,40,20,.35)}
        .am-plan-list{display:flex;flex-direction:column;gap:8px}
        .am-plan-item{display:flex;flex-direction:column;gap:1px;padding:10px 13px;border-radius:11px;background:rgba(50,40,20,.045)}
        .am-plan-terr{font-family:var(--font-catalog),monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--am-trail)}
        .am-plan-title{font-size:14px;font-weight:600;color:var(--am-ink)}
        .am-add-btn{flex:none;display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;color:#faf9f6;background:var(--am-forest,#588157);border:none;border-radius:11px;padding:9px 15px;cursor:pointer;transition:filter .14s}
        .am-add-btn:hover{filter:brightness(.95)}
        .am-empty-plan{display:flex;width:100%;align-items:center;gap:12px;text-align:left;background:rgba(88,129,87,.06);border:1px dashed rgba(88,129,87,.32);border-radius:14px;padding:16px 16px;cursor:pointer;font-size:13.5px;color:var(--am-muted);line-height:1.4}
        .am-empty-plan strong{color:var(--am-ink);font-weight:700}
        .am-empty-plan:hover{background:rgba(88,129,87,.1)}
        .am-empty-ic{flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(88,129,87,.14);color:var(--am-forest,#588157)}
        .am-plan-cards{display:flex;flex-direction:column;gap:10px}
        .am-pcard{position:relative;overflow:hidden;background:#fff;border:1px solid rgba(50,40,20,.12);border-radius:14px;padding:12px 14px 12px 17px;box-shadow:0 2px 8px -5px rgba(70,55,30,.2);transition:transform .18s ease,box-shadow .18s ease}
        .am-pcard:hover{transform:translateY(-2px);box-shadow:0 14px 26px -16px rgba(70,55,30,.4)}
        .am-pcard-bar{position:absolute;left:0;top:0;bottom:0;width:4px}
        .am-pcard-top{display:flex;align-items:center;gap:9px}
        .am-pcard-ic{flex:none;width:32px;height:32px;border-radius:10px;display:grid;place-items:center}
        .am-pcard-cat{flex:1;min-width:0;font-family:var(--font-catalog),monospace;font-size:10px;letter-spacing:.05em;text-transform:uppercase;font-weight:700}
        .am-pcard-x{flex:none;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:rgba(50,40,20,.05);border:none;color:var(--am-muted);cursor:pointer;opacity:.7;transition:opacity .14s}
        .am-pcard-x:hover{opacity:1}
        .am-pcard-title{font-size:15px;font-weight:600;color:var(--am-ink);line-height:1.3;margin:9px 0 11px}
        .am-pcard-foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .am-pcard-time{font-size:11px;font-weight:600;color:var(--am-muted);background:#f3ede1;border-radius:999px;padding:4px 10px}
        .am-pcard-start{display:inline-flex;align-items:center;gap:5px;padding:7px 12px;border-radius:9px;text-decoration:none;background:var(--am-forest,#588157);color:#faf9f6;font-size:12.5px;font-weight:600;transition:filter .14s ease,transform .12s ease}
        .am-pcard-start:hover{filter:brightness(.95)}
        .am-pcard-start:active{transform:translateY(1px)}
        .am-pcard-done{display:inline-flex;align-items:center;gap:5px;padding:7px 11px;border-radius:9px;cursor:pointer;background:transparent;border:1px solid rgba(61,92,59,.2);color:var(--am-forest,#588157);font-size:12.5px;font-weight:600}
        .am-pcard-done:hover{background:rgba(88,129,87,.08)}
        .am-pcard-veil{position:absolute;inset:0;background:rgba(88,129,87,.95);display:flex;align-items:center;justify-content:center;gap:8px;color:#faf9f6;font-size:14px;font-weight:600;animation:amRise .2s ease both}
        .am-fresh{display:inline-block;font-family:var(--font-catalog),monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:var(--am-flag);padding:5px 12px;border-radius:20px;margin-bottom:14px}
        @keyframes amGlow{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.12)}}
        @keyframes amRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .am-rise{animation:amRise .5s cubic-bezier(.22,1,.36,1) both}
        .am-draw{stroke-dasharray:2600;stroke-dashoffset:2600;animation:amDraw 1.5s ease-out .15s forwards}
        @keyframes amDraw{to{stroke-dashoffset:0}}
        @media (prefers-reduced-motion:reduce){.am-rise,.am-next-glow,.am-draw{animation:none;stroke-dashoffset:0}}
      `}</style>

      <div className="am-wrap">
        <div className="am-head">
          <div>
            <div className="am-kicker">Leg {leg + 1} · {region.name} · {total} {total === 1 ? 'stop' : 'stops'} reached{sideBySide ? ' together' : ''}</div>
            <h1 className="am-h1">{sideBySide ? `${familyName}'s trail` : `${label}'s trail`}</h1>
          </div>
        </div>

        {/* This month's family challenge, rippling in from the This Month page:
            an accepted one is the active quest; finished ones become keepsake medals. */}
        {quest && (
          <div className="am-quest am-rise">
            <span className="am-quest-flag">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 22V4M4 4h12l-2 4 2 4H4" /></svg>
            </span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span className="am-quest-kicker">{quest.month} · Family quest</span>
              <span className="am-quest-title">{quest.title}</span>
            </span>
            <span className="am-quest-actions">
              <button
                className="am-quest-done"
                onClick={() => { writeChallenge(`${quest.month}:${quest.title}`, { ...quest, status: 'done', at: new Date().toISOString() }); setQuest(null); setMedals(earnedMedals()); }}
              >✓ Done</button>
              <button
                className="am-quest-cancel"
                onClick={() => { clearChallenge(`${quest.month}:${quest.title}`); setQuest(null); }}
                aria-label="Cancel this challenge"
              >Cancel</button>
            </span>
          </div>
        )}
        {medals.length > 0 && (
          <div className="am-medals am-rise">
            <span className="am-medals-label">Monthly challenges</span>
            {medals.map((m) => <MonthMedal key={`${m.month}-${m.title}`} entry={m} onOpen={setMedalDetail} />)}
          </div>
        )}

        <div className="am-frame">
          <div className="am-map" style={region.vars as React.CSSProperties}>
            <svg className="am-svg" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="amSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--r-sky1)" /><stop offset="1" stopColor="var(--r-sky2)" />
                </linearGradient>
                <linearGradient id="amHill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--r-hilltop)" /><stop offset="1" stopColor="var(--r-hill)" />
                </linearGradient>
                <linearGradient id="amHill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--r-hill2top)" /><stop offset="1" stopColor="var(--r-hill2)" />
                </linearGradient>
                <linearGradient id="amForest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--r-foresttop)" /><stop offset="1" stopColor="var(--r-forest)" />
                </linearGradient>
                <linearGradient id="amMtn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--r-mtntop)" /><stop offset="1" stopColor="var(--r-mtn)" />
                </linearGradient>
                <linearGradient id="amWater" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="var(--r-water1)" /><stop offset="1" stopColor="var(--r-water2)" />
                </linearGradient>
                <radialGradient id="amSun" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="var(--r-sun1)" /><stop offset="0.55" stopColor="var(--r-sun2)" /><stop offset="1" stopColor="var(--r-sun2)" stopOpacity="0" />
                </radialGradient>
                <filter id="amNoise"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /></filter>
              </defs>

              <rect width={VW} height={VH} fill="url(#amSky)" />
              <circle cx="1320" cy="150" r="150" fill="url(#amSun)" />
              <circle cx="1320" cy="150" r="46" fill="var(--r-suncore)" />
              {/* atmospheric distant mountains */}
              <path d="M0,330 L200,150 L360,330 Z" fill="url(#amMtn)" opacity="0.55" />
              <path d="M250,330 L470,120 L520,190 L620,90 L800,330 Z" fill="url(#amMtn)" opacity="0.8" />
              {region.snow && <>
                <path d="M470,120 L520,190 L558,152 Z" fill="#f4f0e6" opacity="0.9" />
                <path d="M620,90 L664,150 L706,116 Z" fill="#f4f0e6" opacity="0.9" />
              </>}
              {/* hill bands with soft haze seams */}
              <path d="M0,300 Q400,234 820,292 Q1200,346 1600,282 L1600,1000 L0,1000 Z" fill="url(#amHill)" />
              <path d="M0,300 Q400,234 820,292 Q1200,346 1600,282" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="6" />
              <path d="M0,430 Q380,364 760,418 Q1150,472 1600,408 L1600,1000 L0,1000 Z" fill="url(#amHill2)" />
              <path d="M0,560 Q420,480 900,538 Q1250,582 1600,518 L1600,1000 L0,1000 Z" fill="url(#amForest)" />
              {/* river (skipped in dry regions like the desert) */}
              {region.river && <>
                <path d="M-20,410 C220,470 250,650 470,700 C690,748 660,900 940,952" fill="none" stroke="url(#amWater)" strokeWidth="30" strokeLinecap="round" opacity="0.92" />
                <path d="M-20,410 C220,470 250,650 470,700 C690,748 660,900 940,952" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="7" strokeLinecap="round" />
              </>}
              {/* trees — the glyph changes with the region */}
              {TREES.map(([tx, ty], ti) => (
                <g key={ti} transform={`translate(${tx},${ty})`}>
                  <ellipse cx="0" cy="52" rx="24" ry="7" fill="rgba(50,40,20,.16)" />
                  <TreeGlyph kind={region.tree} />
                </g>
              ))}
              {/* trail */}
              <path className="am-draw" d={traveled} fill="none" stroke="var(--am-trail)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
              <path className="am-draw" d={traveled} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d={ahead} fill="none" stroke="var(--am-trail)" strokeWidth="9" strokeLinecap="round" strokeDasharray="2 26" opacity="0.7" />
            </svg>

            <svg className="am-grain" aria-hidden="true"><rect width="100%" height="100%" filter="url(#amNoise)" /></svg>
            <div className="am-vignette" />

            <div className="am-chrome">
              <div className="am-tabs">
                {children.map((kd, ki) => (
                  <button key={kd.id ?? ki} className="am-tab" data-on={ki === i} aria-pressed={ki === i} onClick={() => setSel(ki)}>{childLabel(kd, ki)}</button>
                ))}
                <button className="am-tab" onClick={() => setEditKids(true)} style={{ borderStyle: 'dashed' }}>+ explorer</button>
              </div>

              {futurePts.map(([x, y], fi) => (
                <span key={`fut${fi}`} className="am-pin" style={{ left: px(x), top: py(y) }}>
                  <span style={{ display: 'block', width: 14, height: 14, borderRadius: '50%', border: '2px dashed rgba(50,40,20,.4)' }} />
                </span>
              ))}

              {trailFinds.map((g, gi) => {
                const [x, y] = legPoints[gi];
                return (
                  <span
                    key={gi}
                    className="am-pin am-rise"
                    style={{ left: px(x), top: py(y) }}
                    title={`${g.name} · ${TIER_META[g.tier].label}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setDetail({ id: g.id, name: g.name, tier: g.tier, on: true, slug: g.slug, at: g.at })}
                  >
                    <span className="am-find"><span className="am-ico" dangerouslySetInnerHTML={{ __html: gearIconSVG(g.id, `am${cid}${gi}`.replace(/[^a-z0-9]/gi, ''), false) }} /></span>
                  </span>
                );
              })}

              {nextSlug && nextPt && (
                <span className="am-next" style={{ left: px(nextPt[0]), top: py(nextPt[1]) }}>
                  <span className="am-next-glow" />
                  <span className="am-next-dot" />
                </span>
              )}

              <span className="am-pin" style={{ left: px(tokenPt[0]), top: py(tokenPt[1]) }}>
                <span className="am-here am-glass">You are here</span>
                {family && children.length > 1 ? (
                  <div className="am-family-row">
                    {children.map((kd, ki) => {
                      const kid = kd.id ?? childLabel(kd, ki);
                      const kav = avatars[kid] ?? null;
                      const kpack = packByKid[kid] ?? [];
                      const on = ki === i;
                      return (
                        <button
                          key={kid}
                          className={`am-token am-token-fam${on ? ' is-sel' : ''}`}
                          onClick={(e) => (kav ? openMenu(e, kid, ki, childLabel(kd, ki)) : openBuilder(kid, ki, childLabel(kd, ki)))}
                          aria-label={`${childLabel(kd, ki)}'s options`}
                          title={childLabel(kd, ki)}
                        >
                          {kav ? (
                            <div><ExplorerFigure avatar={kav} gear={kpack.map((g) => g.id)} fill /></div>
                          ) : (
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--am-flag)' }}>{childLabel(kd, ki)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : av ? (
                  <button className="am-token" onClick={(e) => openMenu(e, cid, i, label)} aria-label={`${label}'s options`}>
                    <div><ExplorerFigure avatar={av} gear={pack.map((g) => g.id)} fill /></div>
                  </button>
                ) : (
                  <button className="am-token" onClick={() => openBuilder(cid, i, label)} aria-label={`Build ${label}'s explorer`} style={{ fontSize: 11, fontWeight: 700, color: 'var(--am-flag)', padding: 8, textAlign: 'center' }}>Build {label}</button>
                )}
              </span>

            </div>
          </div>

          {/* signpost — glass, overlaid on desktop / below map on mobile */}
          <div className="am-signpost am-glass am-rise">
            <div className="am-sign-head"><span>Next stop{familyPick ? ' · your pick' : sideBySide ? ' · together' : ''}</span><span>●</span></div>
            <div className="am-sign-body">
              {nextSlug ? (
                <>
                  <h2 className="am-plate" style={{ fontSize: 'clamp(18px,2.1vw,22px)', fontWeight: 700, lineHeight: 1.12, margin: 0, color: 'var(--am-ink)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.24em' }}>{nextAct?.title ?? nextSlug}</h2>
                  <div style={{ fontFamily: 'var(--font-catalog),monospace', fontSize: 10.5, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--am-trail)', margin: '7px 0 0' }}>
                    {areaMetaForSlug(nextSlug)[0]?.name ? `${areaMetaForSlug(nextSlug)[0].name} · ` : ''}{minsLabel((effortBySlug[nextSlug] ?? 'Quick') as Effort)}
                  </div>
                  {blurbFor(nextAct) && (
                    <p style={{ fontSize: 12.5, color: 'var(--am-muted)', margin: '6px 0 13px', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.9em' }}>{blurbFor(nextAct)}</p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Link href={`/api/download/activity/${nextSlug}?view=1`} target="_blank" rel="noopener noreferrer" prefetch={false} className="am-btn am-btn-primary">Open the guide →</Link>
                    <button className="am-btn am-btn-ghost" onClick={logNext} disabled={busy}>✓ We reached it</button>
                    {isEnginePick && (
                      <div className="am-sub-actions">
                        <button onClick={differentOne}>Different one</button>
                        <span aria-hidden="true">·</span>
                        <button onClick={skipArea}>Skip this area</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="am-plate" style={{ fontSize: 21, fontWeight: 700, margin: 0, color: 'var(--am-ink)' }}>Every trail explored.</h2>
                  <p style={{ fontSize: 12.5, color: 'var(--am-muted)', margin: '7px 0 14px', lineHeight: 1.5 }}>{sideBySide ? 'The family has' : `${label} has`} reached into every Skills Map area. Revisit a favourite in the Library any time.</p>
                  <Link href="/account" className="am-btn am-btn-primary">Browse the Library →</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* EXPLORER POP-UP — big avatar + options; the backpack opens inside it */}
        {menu && !planOpen && (
          <div className="am-scrim" onClick={() => setMenu(null)} role="dialog" aria-modal="true" aria-label={`${label}'s explorer`}>
            <div className="am-explorer-modal" onClick={(e) => e.stopPropagation()}>
              <button className="am-close" style={{ position: 'absolute', top: 14, right: 14, zIndex: 3 }} onClick={() => setMenu(null)} aria-label="Close">✕</button>

              {menuView === 'main' ? (
                <div className="am-explorer-grid">
                  <div className="am-avatar-stage" style={{ ...(region.vars as React.CSSProperties), background: 'radial-gradient(120% 78% at 50% 26%, var(--r-sun1), transparent 62%), linear-gradient(180deg, var(--r-sky1) 0%, var(--r-sky2) 34%, var(--r-hilltop) 100%)' }}>
                    <div className="am-big-figure">
                      {av ? (
                        <ExplorerFigure avatar={av} gear={pack.map((g) => g.id)} fill />
                      ) : (
                        <button className="am-btn am-btn-primary" style={{ width: 'auto', padding: '12px 18px' }} onClick={() => setMenuView('builder')}>Build {label}</button>
                      )}
                    </div>
                    <div className="am-avatar-name">{label}</div>
                    <button className="am-backpack-toggle" onClick={() => setMenuView('backpack')}>Look inside the backpack</button>
                  </div>

                  <div className="am-options">
                    <button className="am-option" onClick={() => setMenuView('builder')}>
                      <span className="am-option-ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg></span>
                      <span className="am-option-tx"><strong>Change the explorer</strong></span>
                    </button>
                    <button className="am-option" onClick={() => setMenuView('plan')}>
                      <span className="am-option-ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l-5-5 5-5M4 13h11a5 5 0 0 1 5 5v1" /></svg></span>
                      <span className="am-option-tx"><strong>Doing on their own</strong>{soloItems.length > 0 && <span className="am-option-count">{soloItems.length}</span>}</span>
                    </button>
                    {medals.length > 0 && (
                      <div className="am-modal-medals">
                        <span className="am-medals-label">Monthly challenges</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 7 }}>
                          {medals.map((m) => <MonthMedal key={`${m.month}-${m.title}`} entry={m} onOpen={setMedalDetail} />)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : menuView === 'backpack' ? (
                <div>
                  <button className="am-back" onClick={() => setMenuView('main')}>← Back to {label}</button>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 14px', margin: '2px 0 4px' }}>
                    <div className="am-plate" style={{ fontSize: 'clamp(20px,2.4vw,26px)', fontWeight: 800, color: 'var(--am-ink)' }}>{label}&apos;s backpack</div>
                    <div className="am-mono" style={{ fontSize: 12.5, color: 'var(--am-muted)' }}>{collected} of {catalogTotal} collected</div>
                  </div>
                  <div className="am-bar" style={{ margin: '4px 0 6px', maxWidth: 320 }}><span style={{ width: `${pctCollected}%` }} /></div>
                  <div className="am-modal-body" style={{ padding: '6px 0 2px' }}>
                    {TIER_ORDER.map((tier) => {
                      const gitems = GEAR[tier];
                      const got = gitems.filter((g) => earnedIds.has(g.id)).length;
                      return (
                        <div key={tier} className="am-tier">
                          <div className="am-tier-h">
                            <span className="am-plate" style={{ fontSize: 15, fontWeight: 700 }}>{TIER_LABEL[tier]}</span>
                            <span className="am-mono" style={{ fontSize: 11.5, color: 'var(--am-muted)' }}>{got}/{gitems.length}</span>
                          </div>
                          <div className="am-grid">
                            {gitems.map((g) => {
                              const on = earnedIds.has(g.id);
                              return (
                                <div
                                  key={g.id}
                                  className={`am-slot ${on ? 'am-slot-on' : 'am-slot-off'}`}
                                  title={on ? g.name : `${g.name} · not collected yet`}
                                  onClick={() => setDetail({ id: g.id, name: g.name, tier, on, slug: earnedById.get(g.id)?.slug, at: earnedById.get(g.id)?.at })}
                                >
                                  <span className="am-ico" dangerouslySetInnerHTML={{ __html: gearIconSVG(g.id, `pk${tier}${g.id}`.replace(/[^a-z0-9]/gi, ''), false) }} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : menuView === 'builder' ? (
                <div>
                  <button className="am-back" onClick={() => setMenuView('main')}>← Back to {label}</button>
                  <ExplorerBuilder
                    bare
                    kidName={label}
                    initial={av}
                    onSave={(a) => { saveAvatar(menu.kid, a); load(); setMenuView('main'); }}
                    onCancel={() => setMenuView('main')}
                  />
                </div>
              ) : (
                <div>
                  <button className="am-back" onClick={() => setMenuView('main')}>← Back to {label}</button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0 4px' }}>
                    <div className="am-plate" style={{ fontSize: 'clamp(19px,2.3vw,25px)', fontWeight: 800, color: 'var(--am-ink)', flex: 1 }}>{label} on their own</div>
                    <button className="am-add-btn" onClick={() => openPlanner(i)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                      Add
                    </button>
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--am-muted)', margin: '0 0 14px', lineHeight: 1.45 }}>
                    Extra activities just for {label}. They keep moving with the family on the trail, and each one finished simply drops another gear in their backpack.
                  </p>

                  {laneItems.length === 0 ? (
                    <>
                      <button className="am-empty-plan" onClick={() => openPlanner(i)}>
                        <span className="am-empty-ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></span>
                        <span><strong>Nothing extra for {label} yet.</strong> They move with the family on the trail. Add something only if they want to do more on their own.</span>
                      </button>
                      {nextSlug && (
                        <div className="am-plan-now" style={{ marginTop: 12 }}>
                          <div className="am-mono" style={{ fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--am-trail)' }}>On the family trail now</div>
                          <div className="am-plate" style={{ fontSize: 17, fontWeight: 700, marginTop: 2, color: 'var(--am-ink)' }}>{nextAct?.title ?? nextSlug}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="am-plan-cards">
                      {laneItems.map((it) => {
                        const a = bySlug.get(it.slug);
                        if (!a) return null;
                        const veil = doneKeys.has(`${it.slug}__${it.child}`);
                        const area = areaMetaForSlug(a.slug)[0];
                        const ac = area?.color ?? a.trackColor;
                        return (
                          <div key={it.slug} className="am-pcard" style={{ borderColor: hexToRgba(ac, 0.24) }}>
                            <span className="am-pcard-bar" style={{ background: ac }} aria-hidden="true" />
                            <div className="am-pcard-top">
                              <span className="am-pcard-ic" style={{ background: hexToRgba(ac, 0.14), display: 'grid', placeItems: 'center' }} aria-hidden="true"><span style={{ width: 9, height: 9, borderRadius: '50%', background: ac }} /></span>
                              <span className="am-pcard-cat" style={{ color: ac }}>{area?.name ?? a.categoryLabel}</span>
                              <button className="am-pcard-x" onClick={() => removePlan(it.slug, it.child)} aria-label={`Remove ${a.title}`} title="Remove from plan">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                              </button>
                            </div>
                            <div className="am-pcard-title">{a.title}</div>
                            <div className="am-pcard-foot">
                              <span className="am-pcard-time">{minsLabel(a.effort)}</span>
                              <span style={{ flex: 1 }} />
                              <Link href={`/api/download/activity/${it.slug}?view=1`} target="_blank" rel="noopener noreferrer" prefetch={false} className="am-pcard-start">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>Open
                              </Link>
                              <button className="am-pcard-done" onClick={() => donePlan(it.slug, it.child, label)}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6" /></svg>Done
                              </button>
                            </div>
                            {veil && <div className="am-pcard-veil"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6" /></svg>Nice work</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* GEAR DETAIL — opened by clicking a gear on the map or in the backpack */}
        {detail && (
          <div className="am-scrim" style={{ zIndex: 300 }} onClick={() => setDetail(null)} role="dialog" aria-modal="true" aria-label={detail.name}>
            <div className="am-detail" onClick={(e) => e.stopPropagation()}>
              <button className="am-close" onClick={() => setDetail(null)} aria-label="Close">✕</button>
              {detail.fresh && <div className="am-fresh">✦ New find!</div>}
              <div className="am-detail-ico" style={detail.on ? undefined : { filter: 'grayscale(1)', opacity: 0.5 }} dangerouslySetInnerHTML={{ __html: gearIconSVG(detail.id, `det${detail.id}`.replace(/[^a-z0-9]/gi, ''), false) }} />
              <div className="am-mono" style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--am-gold)' }}>{TIER_META[detail.tier].label}</div>
              <h3 className="am-plate" style={{ fontSize: 24, fontWeight: 700, margin: '5px 0 0', color: 'var(--am-ink)' }}>{detail.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--am-muted)', margin: '11px 0 0', lineHeight: 1.55 }}>
                {detail.on ? (
                  <>Found doing <strong style={{ color: 'var(--am-ink)' }}>{activityTitle(detail.slug)}</strong>{detail.at ? <> · {fmtDate(detail.at)}</> : null}.</>
                ) : (
                  <>Not collected yet. Finish an activity out on the trail to find gear like this.</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* MEDAL DETAIL — tap a monthly-challenge medal to see what it was */}
        {medalDetail && (
          <div className="am-scrim" style={{ zIndex: 320 }} onClick={() => setMedalDetail(null)} role="dialog" aria-modal="true" aria-label={`${medalDetail.month} monthly challenge`}>
            <div className="am-detail" onClick={(e) => e.stopPropagation()}>
              <button className="am-close" onClick={() => setMedalDetail(null)} aria-label="Close">✕</button>
              <div style={{ width: 96, height: 96, margin: '4px auto 14px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at 40% 33%, #f6d876, #cf9a2e)', color: '#6e4d12', boxShadow: '0 16px 30px -14px rgba(120,80,10,.7)', border: '3px solid rgba(255,255,255,.9)' }}>
                <span style={{ fontFamily: 'var(--font-plate),sans-serif', fontSize: 46, fontWeight: 800 }}>{medalDetail.month.slice(0, 1)}</span>
              </div>
              <div className="am-mono" style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--am-gold)' }}>{medalDetail.month} · Monthly challenge</div>
              <h3 className="am-plate" style={{ fontSize: 24, fontWeight: 700, margin: '5px 0 0', color: 'var(--am-ink)' }}>{medalDetail.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--am-muted)', margin: '11px 0 0', lineHeight: 1.55 }}>
                The family took this on together and finished it{medalDetail.at ? <> · {fmtDate(medalDetail.at)}</> : null}.
              </p>
            </div>
          </div>
        )}

        {/* NEW FINDS — after finishing an activity, one fresh find per explorer */}
        {finds && finds.length > 0 && (
          <div className="am-scrim" style={{ zIndex: 300 }} onClick={() => setFinds(null)} role="dialog" aria-modal="true" aria-label="New finds">
            <div className="am-finds" onClick={(e) => e.stopPropagation()}>
              <button className="am-close" onClick={() => setFinds(null)} aria-label="Close">✕</button>
              <div className="am-fresh">✦ {finds.length > 1 ? 'New finds!' : 'New find!'}</div>
              <p className="am-finds-sub">
                Earned doing <strong>{activityTitle(finds[0].gear.slug)}</strong>
              </p>
              <div className="am-finds-list">
                {finds.map((f) => (
                  <div key={f.kidId} className="am-find-row">
                    <span className="am-find-av">
                      {f.avatar ? <ExplorerHead avatar={f.avatar} size={40} /> : <span style={{ width: 40, height: 40, borderRadius: '50%', display: 'block', background: 'rgba(50,40,20,.1)' }} />}
                    </span>
                    <div className="am-find-tx">
                      <div className="am-find-name">{f.name}</div>
                      <div className="am-find-gear">{f.gear.name}</div>
                    </div>
                    <span className="am-find-tier" style={{ color: TIER_META[f.gear.tier].color }}>{TIER_META[f.gear.tier].label}</span>
                    <span className="am-find-ico" dangerouslySetInnerHTML={{ __html: gearIconSVG(f.gear.id, `nf${f.kidId}${f.gear.id}`.replace(/[^a-z0-9]/gi, ''), false) }} />
                  </div>
                ))}
              </div>
              <button className="am-btn am-btn-primary" style={{ marginTop: 16 }} onClick={() => setFinds(null)}>Nice!</button>
            </div>
          </div>
        )}
      </div>

      {editKids && <KidsSetup onDone={() => { setEditKids(false); load(); }} onSkip={() => setEditKids(false)} />}
      {planOpen && (
        <PlannerModal
          activities={activities}
          children={children}
          initialKids={planForKid != null ? [planForKid] : undefined}
          onClose={closePlanner}
          onSeeWeek={closePlanner}
        />
      )}
    </main>
  );
}
