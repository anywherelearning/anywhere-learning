import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getDashboardUserId } from '@/lib/dashboard-session';
import { STANDARD_SUBJECTS, STANDARD_SUBJECT_IDS } from '@/lib/taxonomy';

export const runtime = 'nodejs';

// Reuse the same model env var the planning agent uses so there is one place
// to configure the model. Default to the low-cost Haiku for this tiny task.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';

interface PostBody {
  title?: string;
  type?: string;
  note?: string;
}

// Structured output via a single tool. Forcing the tool gives us clean JSON
// without parsing free text.
const DRAFT_TOOL: Anthropic.Tool = {
  name: 'draft_log_entry',
  description:
    'Return a portfolio-ready description, an estimated duration, and the homeschool subjects this activity covers.',
  input_schema: {
    type: 'object',
    properties: {
      description: {
        type: 'string',
        description:
          'One to two warm, parent-voiced sentences a homeschool parent could put in a year-end portfolio. No emoji. No em dashes.',
      },
      durationMinutes: {
        type: 'number',
        description: 'A reasonable estimate of how long this took, in minutes (5 to 240).',
      },
      subjects: {
        type: 'array',
        items: { type: 'string' },
        description: 'The subject ids this counts toward. Use only the known ids.',
      },
    },
    required: ['description', 'durationMinutes', 'subjects'],
  },
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  // Graceful degrade: no key means no AI. Return a friendly reason, never throw,
  // so the log editor can just toast it and let the parent write it themselves.
  if (!apiKey) {
    return NextResponse.json({ ok: false, reason: 'AI is not switched on yet.' });
  }

  // Resolve the user for parity with the other dashboard routes (sets the anon
  // cookie when needed). We do not gate this assist behind membership.
  await getDashboardUserId();

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'Could not read the request.' });
  }

  const title = (body.title ?? '').trim();
  if (!title) {
    return NextResponse.json({ ok: false, reason: 'Name it first so I have something to go on.' });
  }
  const type = (body.type ?? '').trim();
  const note = (body.note ?? '').trim().slice(0, 500);

  const subjectList = STANDARD_SUBJECTS.map((s) => `${s.id} = ${s.label}`).join('\n');

  const system = `You help a homeschool parent log what their kid did, for a learning portfolio. Given a few words about an activity, write a short description and tag it. Be warm, concrete and specific to what was described. Never use em dashes. Never use emoji. Keep the description to one or two sentences.

SUBJECT IDS (use only these exact ids):
${subjectList}

Pick the one to three subjects that genuinely fit. Estimate a sensible duration in minutes.`;

  const userParts = [`Activity: ${title}`];
  if (type) userParts.push(`Type: ${type}`);
  if (note) userParts.push(`Extra detail: ${note}`);

  const client = new Anthropic({ apiKey });

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 350,
      system,
      tools: [DRAFT_TOOL],
      tool_choice: { type: 'tool', name: 'draft_log_entry' },
      messages: [{ role: 'user', content: userParts.join('\n') }],
    });

    const toolUse = resp.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === 'draft_log_entry',
    );
    if (!toolUse) {
      return NextResponse.json({ ok: false, reason: 'Could not draft that one. Try a few more words.' });
    }

    const out = toolUse.input as {
      description?: unknown;
      durationMinutes?: unknown;
      subjects?: unknown;
    };

    const description = typeof out.description === 'string' ? out.description.trim() : '';
    const durationMinutes = Math.max(
      5,
      Math.min(240, Math.round(Number(out.durationMinutes) || 30)),
    );
    // Keep only known subject ids, de-duplicated, capped at three.
    const subjects = Array.from(
      new Set(
        (Array.isArray(out.subjects) ? out.subjects : [])
          .map((s) => String(s))
          .filter((s) => STANDARD_SUBJECT_IDS.has(s)),
      ),
    ).slice(0, 3);

    if (!description) {
      return NextResponse.json({ ok: false, reason: 'Could not draft that one. Try a few more words.' });
    }

    return NextResponse.json({ ok: true, description, durationMinutes, subjects });
  } catch (err) {
    console.error('[log-assist] error', err);
    return NextResponse.json({ ok: false, reason: 'The draft helper had a hiccup. Try again in a moment.' });
  }
}
