import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { and, eq, gte, lte, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  calendarEvents,
  children,
  customResources,
  unavailableWindows,
  weeklyGoals,
} from '@/lib/db/schema';
import { getDashboardUserId } from '@/lib/dashboard-session';
import { isDashboardMember } from '@/lib/dashboard-access';
import { isoMonday } from '@/lib/planner';
import { runPlannerForWeek, startProgramForUser } from '@/lib/planner-run';
import { PROGRAMS, programActivityCount } from '@/lib/programs';
import { STANDARD_SUBJECTS } from '@/lib/taxonomy';

export const runtime = 'nodejs';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';
const MAX_TURNS = 5;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface PostBody {
  message?: string;
  history?: ChatMessage[];
  weekStart?: string;
}

function addDaysIso(iso: string, days: number): string {
  const t = Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

// ─── Tool definitions ────────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'start_program',
    description:
      'Start a done-for-you multi-week program by dropping its activities onto the calendar. Use when the parent wants a guided path toward a skill (entrepreneurship, money/math, nature, making, communication).',
    input_schema: {
      type: 'object',
      properties: {
        programId: { type: 'string', description: 'One of the known program ids.' },
        childIds: { type: 'array', items: { type: 'string' }, description: 'Kid ids. Empty = whole family.' },
        startDate: { type: 'string', description: 'YYYY-MM-DD; snapped to that week\'s Monday. Defaults to the current week.' },
      },
      required: ['programId'],
    },
  },
  {
    name: 'plan_week',
    description:
      'Set this week\'s per-kid subject goals and immediately generate the plan. The planner places the parent\'s own materials first, then fills the rest with Anywhere Learning activities. Use for requests like "plan a light outdoor week" or "3 math and 2 writing for Sam".',
    input_schema: {
      type: 'object',
      properties: {
        weekStart: { type: 'string', description: 'YYYY-MM-DD, defaults to current week.' },
        goals: {
          type: 'array',
          description: 'Per-kid per-subject targets.',
          items: {
            type: 'object',
            properties: {
              childId: { type: 'string' },
              subjectId: { type: 'string', description: 'One of the known subject ids.' },
              count: { type: 'number', description: 'How many that subject this week (1-12).' },
            },
            required: ['childId', 'subjectId', 'count'],
          },
        },
      },
      required: ['goals'],
    },
  },
  {
    name: 'add_material',
    description:
      "Add the parent's own curriculum or commitment (e.g. Singapore Math, piano, co-op) so the planner schedules it. Use when they mention something they already use.",
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subjects: { type: 'array', items: { type: 'string' }, description: 'Known subject ids it counts toward.' },
        childIds: { type: 'array', items: { type: 'string' }, description: 'Empty = all kids.' },
        mode: { type: 'string', enum: ['independent', 'together', 'either'] },
        cadence: { type: 'string', enum: ['flexible', 'fixed'] },
        timesPerWeek: { type: 'number', description: 'For flexible cadence, 1-7.' },
        fixedDays: { type: 'array', items: { type: 'number' }, description: 'For fixed cadence: 0=Mon..6=Sun.' },
      },
      required: ['title', 'subjects'],
    },
  },
  {
    name: 'block_time',
    description:
      'Block out time the planner should respect: a parent-unavailable window (kids do solo work), a full day off (travel/sick), or a co-op/class. Use for "we\'re traveling Friday" or "I have calls Tuesday morning".',
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'YYYY-MM-DD.' },
        kind: { type: 'string', enum: ['mom-out', 'all-off', 'co-op'] },
        startTime: { type: 'string', description: 'HH:MM, required unless all-off.' },
        endTime: { type: 'string', description: 'HH:MM, required unless all-off.' },
        label: { type: 'string' },
      },
      required: ['date', 'kind'],
    },
  },
  {
    name: 'summarize_week',
    description: 'Read what is currently planned for a week. Use to answer "what are we doing this week".',
    input_schema: {
      type: 'object',
      properties: {
        weekStart: { type: 'string', description: 'YYYY-MM-DD, defaults to current week.' },
      },
      required: [],
    },
  },
];

// ─── Tool execution ──────────────────────────────────────────────────────────

const VALID_KINDS = new Set(['mom-out', 'all-off', 'co-op']);
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

async function executeTool(
  userId: string,
  name: string,
  input: Record<string, unknown>,
): Promise<{ result: string; changed: boolean }> {
  switch (name) {
    case 'start_program': {
      const childIds = Array.isArray(input.childIds) ? (input.childIds as string[]) : [];
      const res = await startProgramForUser(
        userId,
        String(input.programId),
        childIds,
        typeof input.startDate === 'string' ? input.startDate : undefined,
      );
      if ('error' in res) return { result: `Error: ${res.error}`, changed: false };
      return {
        result: `Added "${res.programTitle}": ${res.created} activities across ${res.weeks} weeks, starting the week of ${res.weekStart}.`,
        changed: true,
      };
    }

    case 'plan_week': {
      const rawGoals = Array.isArray(input.goals) ? input.goals : [];
      const goals: Record<string, Record<string, number>> = {};
      for (const g of rawGoals as Array<Record<string, unknown>>) {
        const childId = String(g.childId ?? '');
        const subjectId = String(g.subjectId ?? '');
        const count = Math.max(0, Math.min(12, Math.floor(Number(g.count) || 0)));
        if (!childId || !subjectId || count <= 0) continue;
        goals[childId] = goals[childId] ?? {};
        goals[childId][subjectId] = count;
      }
      if (Object.keys(goals).length === 0) {
        return { result: 'No valid goals were provided.', changed: false };
      }
      const weekStart = typeof input.weekStart === 'string' ? isoMonday(input.weekStart) : isoMonday(new Date().toISOString().slice(0, 10));
      await db
        .insert(weeklyGoals)
        .values({ userId, weekStart, goals })
        .onConflictDoUpdate({
          target: [weeklyGoals.userId, weeklyGoals.weekStart],
          set: { goals, updatedAt: new Date() },
        });
      const plan = await runPlannerForWeek(userId, weekStart, { clearPriorGenerated: true });
      const byType = plan.placements.reduce(
        (acc, p) => {
          acc[p.type] = (acc[p.type] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
      const summary = plan.placements
        .map((p) => `${p.date}: ${p.title} (${p.childNames.join(', ') || 'family'})`)
        .join('; ');
      const noteStr = plan.notes.length ? ` Notes: ${plan.notes.join(' ')}` : '';
      return {
        result: `Planned the week of ${plan.weekStart}. Placed ${plan.placements.length} (${JSON.stringify(byType)}). ${summary}${noteStr}`,
        changed: true,
      };
    }

    case 'add_material': {
      const subjects = Array.isArray(input.subjects) ? (input.subjects as string[]) : [];
      const cadence = input.cadence === 'fixed' ? 'fixed' : 'flexible';
      const [created] = await db
        .insert(customResources)
        .values({
          userId,
          title: String(input.title ?? 'Material').slice(0, 80),
          subjects,
          childIds: Array.isArray(input.childIds) ? (input.childIds as string[]) : [],
          mode:
            input.mode === 'independent' || input.mode === 'together' ? input.mode : 'either',
          durationMinutes: null,
          cadence,
          timesPerWeek:
            cadence === 'flexible'
              ? Math.max(1, Math.min(7, Math.floor(Number(input.timesPerWeek) || 3)))
              : null,
          fixedDays:
            cadence === 'fixed' && Array.isArray(input.fixedDays)
              ? (input.fixedDays as number[]).filter((n) => n >= 0 && n <= 6)
              : [],
        })
        .returning();
      return {
        result: `Added your material "${created.title}". It will be scheduled when you plan a week.`,
        changed: true,
      };
    }

    case 'block_time': {
      const kind = VALID_KINDS.has(String(input.kind)) ? String(input.kind) : 'mom-out';
      const date = String(input.date ?? '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return { result: 'Invalid date.', changed: false };
      }
      const startTime = HH_MM.test(String(input.startTime)) ? String(input.startTime) : '00:00';
      const endTime = HH_MM.test(String(input.endTime)) ? String(input.endTime) : '23:59';
      await db.insert(unavailableWindows).values({
        userId,
        date,
        startTime: kind === 'all-off' ? '00:00' : startTime,
        endTime: kind === 'all-off' ? '23:59' : endTime,
        label: typeof input.label === 'string' ? input.label.slice(0, 60) : null,
        kind,
      });
      return { result: `Blocked ${date} (${kind}).`, changed: true };
    }

    case 'summarize_week': {
      const weekStart = typeof input.weekStart === 'string' ? isoMonday(input.weekStart) : isoMonday(new Date().toISOString().slice(0, 10));
      const weekEnd = addDaysIso(weekStart, 6);
      const rows = await db
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.userId, userId),
            gte(calendarEvents.date, weekStart),
            lte(calendarEvents.date, weekEnd),
            eq(calendarEvents.skipped, false),
          ),
        )
        .orderBy(asc(calendarEvents.date));
      if (rows.length === 0) return { result: `Nothing planned for the week of ${weekStart}.`, changed: false };
      const list = rows
        .map((e) => `${e.date}: ${e.title}${e.childNames?.length ? ` (${(e.childNames as string[]).join(', ')})` : ''}${e.completed ? ' [done]' : ''}`)
        .join('; ');
      return { result: `Week of ${weekStart}: ${list}`, changed: false };
    }

    default:
      return { result: `Unknown tool: ${name}`, changed: false };
  }
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply:
        "AI planning isn't switched on yet. Add an ANTHROPIC_API_KEY to your environment and I'll be able to plan by chat. In the meantime, use the program shelf or the manual planner.",
      changed: false,
      configured: false,
    });
  }

  const userId = await getDashboardUserId();

  if (!(await isDashboardMember())) {
    return NextResponse.json({
      reply:
        'Planning by chat is a member feature. Members get the AI that builds a skill-rich week for you, guided skill programs, and a plan that fills itself. Become a member to turn it on.',
      changed: false,
      configured: true,
      needsUpgrade: true,
    });
  }

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const message = (body.message ?? '').trim();
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });

  const today = new Date().toISOString().slice(0, 10);
  const weekStart = body.weekStart ? isoMonday(body.weekStart) : isoMonday(today);

  // Build live context for the model.
  const kidRows = await db
    .select({ id: children.id, name: children.name, birthYear: children.birthYear })
    .from(children)
    .where(eq(children.userId, userId));
  const kidsCtx = kidRows.map(
    (k) => `${k.name} (id: ${k.id}${k.birthYear ? `, age ${new Date().getFullYear() - k.birthYear}` : ''})`,
  );
  const matRows = await db
    .select({ title: customResources.title })
    .from(customResources)
    .where(and(eq(customResources.userId, userId), eq(customResources.active, true)));

  const system = `You are the planning assistant inside Anywhere Learning, a homeschool planner. You help a parent plan their week by calling tools. Be warm, brief, and practical. Never use em dashes.

Today is ${today}. The week currently in view starts ${weekStart} (Monday).

KIDS:
${kidsCtx.length ? kidsCtx.join('\n') : '(none set up yet — tell the parent to add kids in Family setup before planning per-kid)'}

SUBJECT IDS (use these exact ids in goals/materials):
${STANDARD_SUBJECTS.map((s) => `${s.id} = ${s.label}`).join('\n')}

PROGRAMS (done-for-you paths, use the id with start_program):
${PROGRAMS.map((p) => `${p.id} = ${p.title} (${p.weeks.length} weeks, ${programActivityCount(p)} activities, ages ${p.ageRange})`).join('\n')}

THE PARENT'S OWN MATERIALS already saved:
${matRows.length ? matRows.map((m) => m.title).join(', ') : '(none yet)'}

GUIDELINES:
- To plan a week from scratch, call plan_week with per-kid subject goals. The planner auto-places their own materials first, then fills with Anywhere Learning activities. Pick reasonable counts (a typical week is 4-8 activities per kid total).
- If the parent mentions curriculum/lessons/co-op they use, call add_material first, then plan_week.
- If the parent wants a guided skill path, call start_program.
- For travel/sick/calls/co-op, call block_time before planning.
- After acting, confirm what you did in one or two friendly sentences. Mention specific days or activity names when helpful. Do not invent activities; the tools choose them.
- If you lack a kid id you need, ask the parent rather than guessing.`;

  const client = new Anthropic({ apiKey });

  const messages: Anthropic.MessageParam[] = [
    ...(Array.isArray(body.history) ? body.history : [])
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }) as Anthropic.MessageParam),
    { role: 'user', content: message },
  ];

  let changed = false;
  let finalText = '';

  try {
    for (let turn = 0; turn < MAX_TURNS; turn += 1) {
      const resp = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        tools: TOOLS.map((t, i) =>
          i === TOOLS.length - 1 ? { ...t, cache_control: { type: 'ephemeral' } } : t,
        ),
        messages,
      });

      const toolUses = resp.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
      );
      const textParts = resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join(' ')
        .trim();
      if (textParts) finalText = textParts;

      if (resp.stop_reason !== 'tool_use' || toolUses.length === 0) break;

      // Execute tools and feed results back.
      messages.push({ role: 'assistant', content: resp.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        const { result, changed: didChange } = await executeTool(
          userId,
          tu.name,
          (tu.input ?? {}) as Record<string, unknown>,
        );
        if (didChange) changed = true;
        toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: result });
      }
      messages.push({ role: 'user', content: toolResults });
    }
  } catch (err) {
    console.error('[agent] error', err);
    const detail = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json(
      {
        reply: `Something went wrong talking to the AI (${detail}). If this keeps happening, check the ANTHROPIC_API_KEY and ANTHROPIC_MODEL settings.`,
        changed,
        configured: true,
      },
      { status: 200 },
    );
  }

  return NextResponse.json({
    reply: finalText || 'Done.',
    changed,
    weekStart,
    configured: true,
  });
}
