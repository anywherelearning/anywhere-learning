/**
 * Guide content files (guides/content/<slug>.json) are the source the PDFs are
 * rendered from. The member reader also uses them to show a guide one step per
 * screen on phones. Server-only: reads from disk (see outputFileTracingIncludes
 * in next.config.ts so the files ship with the route on Vercel).
 */

import fs from 'node:fs/promises';
import path from 'node:path';

type Line = { k: string; v: string };

export interface GuideStep {
  title: string;
  why?: string;
  kid?: string;
  you?: string;
  starters?: string[];
  ask?: string[];
  tip?: string;
  levels?: { explore?: string; develop?: string; extend?: string };
}

export interface GuideCard {
  name?: string;
  t: string;
  d?: string;
  art?: string;
}

export interface GuideContent {
  slug: string;
  category: string;
  title: string;
  tagline?: string;
  ages?: string;
  goal?: string;
  need?: string[];
  academics?: { subject: string; text: string }[];
  lesson?: { text?: string; before?: string; model?: { part: string; line: string }[]; modelNote?: string };
  howTo?: {
    intro?: string;
    plan?: { when: string; what: string }[];
    troubleshoot?: { q: string; a: string }[];
    example?: { title?: string; before?: string[]; after?: string[]; why?: string };
  };
  levelsLine?: string;
  steps?: GuideStep[];
  themes?: { title: string; ages?: string; rule?: string; cards: GuideCard[]; extras?: string[]; short?: string }[];
  reference?: { title: string; intro?: string; items: { name: string; lines: Line[]; ask?: string }[]; after?: { label: string; lines: string[] } };
  fromHome?: { text: string } | null;
  photo?: { src: string; alt?: string; caption?: string };
  conclusion?: { headline?: string; text?: string; celebrate?: string; extensions?: string[] };
  signs?: string[] | null;
  makeItReal?: string | null;
  onTheRoad?: string[] | null;
  backHome?: string | null;
}

export async function loadGuideContent(slug: string): Promise<GuideContent | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const raw = await fs.readFile(path.join(process.cwd(), 'guides', 'content', `${slug}.json`), 'utf8');
    const g = JSON.parse(raw);
    // The Skills Map is a different document type, and a guide needs steps or
    // cards to be readable one screen at a time.
    if (g.type === 'map' || (!g.steps?.length && !g.themes?.length)) return null;
    return g as GuideContent;
  } catch {
    return null;
  }
}
