/**
 * SEO data pull: Google Search Console + GA4 + Bing Webmaster, no browser.
 *
 * Replaces the browser-driven data pulls in the weekly SEO scan. Writes one
 * JSON file (all raw rows) and one Markdown file (the tables the scan reads)
 * per run, into the SEO-WEEKLY data folder.
 *
 * Auth, either of:
 *   (a) OAuth desktop client, your own Google login. Save the client JSON as
 *       ./google-oauth-credentials.json. First run opens a browser once and
 *       saves ./google-oauth-token.json; later runs are headless. Use this on
 *       a Workspace org that blocks service account keys. Both files are
 *       gitignored.
 *   (b) Service account key at ./google-service-account.json
 *       or GOOGLE_SERVICE_ACCOUNT_KEY=<path>. The account email must be a user
 *       in Search Console and a Viewer on the GA4 property.
 * (a) wins when both exist. Setup notes at the bottom of this file.
 *
 * Bing is optional: set BING_WEBMASTER_API_KEY (Bing Webmaster Tools >
 * Settings > API access). Without it the Bing section is skipped.
 *
 * Usage:
 *   npm run seo:pull                 # 28-day and 90-day windows, today's date
 *   npm run seo:pull -- --out ./tmp  # write somewhere else
 *   npm run seo:pull -- --check      # only verify auth and access, pull nothing
 */

import { google, type analyticsdata_v1beta } from 'googleapis';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as http from 'node:http';
import { execFile } from 'node:child_process';

const SITE_URL = 'sc-domain:anywherelearning.co';
const SITE_ORIGIN = 'https://anywherelearning.co';
const BING_SITE = 'https://anywherelearning.co/';
const GA4_PROPERTY = process.env.GA4_PROPERTY_ID || 'properties/528296208';
const DEFAULT_OUT = '/Users/ameliedrouin/Desktop/Anywhere Learning/SEO-WEEKLY/data';
const KEY_ENV = 'GOOGLE_SERVICE_ACCOUNT_KEY';
const KEY_FALLBACK = path.join(process.cwd(), 'google-service-account.json');
const OAUTH_CREDENTIALS = path.join(process.cwd(), 'google-oauth-credentials.json');
const OAUTH_TOKEN = path.join(process.cwd(), 'google-oauth-token.json');
const OAUTH_PORT = 3847;
const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
];
type AuthClient = InstanceType<typeof google.auth.GoogleAuth> | InstanceType<typeof google.auth.OAuth2>;

// Queries that are bots, brand, or a squatter's brand. Excluded from every
// table and subtracted from totals in the "clean" figures.
const NOISE_QUERIES = new Set([
  'how to choose activities for middle schoolers abroad',
  'scavenger hunt planning service',
  'anywhere teacher',
  'anywhere training',
  'anyones learning',
  'learn anywhere',
  'educational guide llblogkids',
]);
const BRAND_RE = /anywhere\s*learning|anywherelearning/i;
const KEY_EVENTS = ['generate_lead', 'start_trial', 'purchase'];

type Row = { key: string; clicks: number; impressions: number; ctr: number; position: number };

function isNoise(q: string): boolean {
  const s = q.trim().toLowerCase();
  return NOISE_QUERIES.has(s) || BRAND_RE.test(s);
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}
const hasFlag = (name: string) => process.argv.includes(name);

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// GSC data lags about two days; end the window at yesterday minus one.
function window(days: number) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { startDate: fmt(start), endDate: fmt(end) };
}

function serviceAccountKeyFile(): string | undefined {
  const fromEnv = process.env[KEY_ENV];
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  if (fs.existsSync(KEY_FALLBACK)) return KEY_FALLBACK;
  return undefined;
}

// One-time browser consent for the OAuth desktop client. Listens on
// localhost for the redirect, exchanges the code, saves the token.
async function oauthConsent(client: InstanceType<typeof google.auth.OAuth2>): Promise<void> {
  const authUrl = client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES });
  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://localhost:${OAUTH_PORT}`);
      const c = url.searchParams.get('code');
      if (!c) {
        res.writeHead(400).end('Missing code');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' }).end('<p>Signed in. You can close this tab.</p>');
      server.close();
      resolve(c);
    });
    server.on('error', reject);
    server.listen(OAUTH_PORT, () => {
      console.log(`\nOne-time sign-in: opening a browser. If it does not open, visit:\n${authUrl}\n`);
      execFile('open', [authUrl], () => undefined);
    });
  });
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  fs.writeFileSync(OAUTH_TOKEN, JSON.stringify(tokens, null, 2));
  console.log(`Token saved to ${OAUTH_TOKEN}. Future runs are headless.`);
}

async function getAuth(): Promise<{ auth: AuthClient; who: string }> {
  if (fs.existsSync(OAUTH_CREDENTIALS)) {
    const raw = JSON.parse(fs.readFileSync(OAUTH_CREDENTIALS, 'utf8'));
    const creds = raw.installed ?? raw.web;
    if (!creds?.client_id) {
      console.error(`${OAUTH_CREDENTIALS} is not an OAuth client file (expected an "installed" block).`);
      process.exit(1);
    }
    const client = new google.auth.OAuth2(creds.client_id, creds.client_secret, `http://localhost:${OAUTH_PORT}`);
    // Persist refreshed tokens so the saved file never goes stale.
    client.on('tokens', (t) => {
      const cur = fs.existsSync(OAUTH_TOKEN) ? JSON.parse(fs.readFileSync(OAUTH_TOKEN, 'utf8')) : {};
      fs.writeFileSync(OAUTH_TOKEN, JSON.stringify({ ...cur, ...t }, null, 2));
    });
    if (fs.existsSync(OAUTH_TOKEN)) {
      client.setCredentials(JSON.parse(fs.readFileSync(OAUTH_TOKEN, 'utf8')));
    } else {
      await oauthConsent(client);
    }
    return { auth: client, who: `OAuth client ${creds.client_id.split('-')[0]}... (your Google login)` };
  }

  const keyFile = serviceAccountKeyFile();
  if (keyFile) {
    const email = JSON.parse(fs.readFileSync(keyFile, 'utf8')).client_email as string | undefined;
    const auth = new google.auth.GoogleAuth({ keyFile, scopes: SCOPES });
    return { auth, who: `service account ${email ?? '(unknown)'}` };
  }

  console.error(
    `No Google credentials found. Save an OAuth desktop client as ${OAUTH_CREDENTIALS}, ` +
      `or a service account key as ${KEY_FALLBACK} (or ${KEY_ENV}=<path>).\n` +
      'See the setup notes at the bottom of scripts/seo-pull.ts.',
  );
  process.exit(1);
}

// ---------- Google Search Console ----------

async function gscTable(
  sc: ReturnType<typeof google.searchconsole>,
  dimension: 'query' | 'page',
  days: number,
): Promise<Row[]> {
  const { startDate, endDate } = window(days);
  const rows: Row[] = [];
  let startRow = 0;
  const rowLimit = 5000;
  for (;;) {
    const res = await sc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: { startDate, endDate, dimensions: [dimension], rowLimit, startRow },
    });
    const batch = res.data.rows ?? [];
    for (const r of batch) {
      const key = (r.keys?.[0] ?? '').replace(SITE_ORIGIN, '') || '/';
      rows.push({
        key,
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        ctr: r.ctr ?? 0,
        position: r.position ?? 0,
      });
    }
    if (batch.length < rowLimit) break;
    startRow += rowLimit;
  }
  rows.sort((a, b) => b.impressions - a.impressions);
  return rows;
}

async function gscTotals(sc: ReturnType<typeof google.searchconsole>, days: number) {
  const { startDate, endDate } = window(days);
  const res = await sc.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: { startDate, endDate, dimensions: [], rowLimit: 1 },
  });
  const r = res.data.rows?.[0];
  return {
    startDate,
    endDate,
    clicks: r?.clicks ?? 0,
    impressions: r?.impressions ?? 0,
    ctr: r?.ctr ?? 0,
    position: r?.position ?? 0,
  };
}

async function pullGsc(auth: AuthClient) {
  const sc = google.searchconsole({ version: 'v1', auth });
  const out: Record<string, unknown> = {};
  for (const days of [28, 90]) {
    const totals = await gscTotals(sc, days);
    const queriesAll = await gscTable(sc, 'query', days);
    const noise = queriesAll.filter((r) => isNoise(r.key));
    const queries = queriesAll.filter((r) => !isNoise(r.key));
    const pages = await gscTable(sc, 'page', days);
    const noiseImpr = noise.reduce((s, r) => s + r.impressions, 0);
    const noiseClicks = noise.reduce((s, r) => s + r.clicks, 0);
    out[`d${days}`] = {
      totals,
      clean: {
        clicks: totals.clicks - noiseClicks,
        impressions: totals.impressions - noiseImpr,
        noiseImpressions: noiseImpr,
        noiseClicks,
      },
      queries,
      noise,
      pages,
    };
    console.log(
      `GSC ${days}d: ${totals.clicks} clicks, ${totals.impressions} impressions (${noiseImpr} noise), ` +
        `${queries.length} queries, ${pages.length} pages`,
    );
  }
  const sitemaps = await sc.sitemaps.list({ siteUrl: SITE_URL });
  out.sitemaps = (sitemaps.data.sitemap ?? []).map((s) => ({
    path: s.path,
    lastSubmitted: s.lastSubmitted,
    lastDownloaded: s.lastDownloaded,
    submitted: s.contents?.[0]?.submitted,
    indexed: s.contents?.[0]?.indexed,
    errors: s.errors,
    warnings: s.warnings,
  }));
  return out;
}

// ---------- GA4 ----------

async function pullGa4(auth: AuthClient) {
  const ad = google.analyticsdata({ version: 'v1beta', auth });
  const out: Record<string, unknown> = {};
  const keyMetrics = KEY_EVENTS.map((e) => ({ name: `keyEvents:${e}` }));

  for (const days of [7, 28]) {
    // GA4 has no two-day lag; end at yesterday.
    const end = new Date();
    end.setUTCDate(end.getUTCDate() - 1);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    const dateRanges = [{ startDate: fmt(start), endDate: fmt(end) }];

    const channels = await ad.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges,
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'engagedSessions' }, { name: 'keyEvents' }, ...keyMetrics],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: '20',
      },
    });

    const landing = await ad.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges,
        dimensions: [{ name: 'landingPage' }],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionDefaultChannelGroup',
            stringFilter: { matchType: 'EXACT', value: 'Organic Search' },
          },
        },
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'engagedSessions' },
          { name: 'engagementRate' },
          { name: 'userEngagementDuration' },
          { name: 'keyEvents' },
          ...keyMetrics,
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: '200',
      },
    });

    // Where leads come from, all channels: landing page x key events.
    const leadPages = await ad.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges,
        dimensions: [{ name: 'landingPage' }, { name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }, ...keyMetrics],
        metricFilter: {
          filter: {
            fieldName: 'keyEvents:generate_lead',
            numericFilter: { operation: 'GREATER_THAN', value: { int64Value: '0' } },
          },
        },
        orderBys: [{ metric: { metricName: 'keyEvents:generate_lead' }, desc: true }],
        limit: '100',
      },
    });

    const toRows = (d: analyticsdata_v1beta.Schema$RunReportResponse) => {
      const dims = (d.dimensionHeaders ?? []).map((h) => h.name ?? '');
      const mets = (d.metricHeaders ?? []).map((h) => h.name ?? '');
      return (d.rows ?? []).map((row) => {
        const o: Record<string, string | number> = {};
        dims.forEach((d, i) => (o[d] = row.dimensionValues?.[i]?.value ?? ''));
        mets.forEach((m, i) => (o[m] = Number(row.metricValues?.[i]?.value ?? 0)));
        return o;
      });
    };

    out[`d${days}`] = {
      range: dateRanges[0],
      channels: toRows(channels.data),
      organicLanding: toRows(landing.data),
      leadPages: toRows(leadPages.data),
    };
    const totalSessions = toRows(channels.data).reduce((s, r) => s + Number(r.sessions), 0);
    const leads = toRows(channels.data).reduce((s, r) => s + Number(r['keyEvents:generate_lead']), 0);
    console.log(`GA4 ${days}d: ${totalSessions} sessions, ${leads} generate_lead`);
  }
  return out;
}

// ---------- Bing Webmaster ----------

async function bingGet<T>(method: string, key: string, extra: Record<string, string> = {}): Promise<T> {
  const u = new URL(`https://ssl.bing.com/webmaster/api.svc/json/${method}`);
  u.searchParams.set('siteUrl', BING_SITE);
  u.searchParams.set('apikey', key);
  for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v);
  const res = await fetch(u);
  if (!res.ok) throw new Error(`Bing ${method}: HTTP ${res.status} ${await res.text()}`);
  const body = (await res.json()) as { d: T };
  return body.d;
}

// Bing returns dates as "/Date(1717027200000)/".
function bingDate(s: string): string {
  const m = /\/Date\((\d+)\)\//.exec(s);
  return m ? new Date(Number(m[1])).toISOString().slice(0, 10) : s;
}

async function pullBing() {
  const key = process.env.BING_WEBMASTER_API_KEY;
  if (!key) {
    console.log('Bing: skipped (BING_WEBMASTER_API_KEY not set)');
    return { skipped: true };
  }
  type Traffic = { Date: string; Clicks: number; Impressions: number; Crawls?: number };
  type Query = { Query: string; Clicks: number; Impressions: number; AvgClickPosition: number; AvgImpressionPosition: number };
  type Page = { Query: string; Clicks: number; Impressions: number; AvgClickPosition: number; AvgImpressionPosition: number };

  const traffic = (await bingGet<Traffic[]>('GetRankAndTrafficStats', key)).map((t) => ({
    date: bingDate(t.Date),
    clicks: t.Clicks,
    impressions: t.Impressions,
  }));
  const queries = (await bingGet<Query[]>('GetQueryStats', key))
    .filter((q) => !isNoise(q.Query))
    .map((q) => ({ key: q.Query, clicks: q.Clicks, impressions: q.Impressions, position: q.AvgImpressionPosition }))
    .sort((a, b) => b.impressions - a.impressions);
  const pages = (await bingGet<Page[]>('GetPageStats', key))
    .map((p) => ({ key: p.Query.replace(BING_SITE.replace(/\/$/, ''), '') || '/', clicks: p.Clicks, impressions: p.Impressions, position: p.AvgImpressionPosition }))
    .sort((a, b) => b.impressions - a.impressions);

  const last28 = traffic.slice(-28);
  const totals28 = {
    clicks: last28.reduce((s, t) => s + t.clicks, 0),
    impressions: last28.reduce((s, t) => s + t.impressions, 0),
  };
  console.log(`Bing 28d: ${totals28.clicks} clicks, ${totals28.impressions} impressions, ${queries.length} queries`);
  return { totals28, traffic, queries, pages };
}

// ---------- Output ----------

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function mdTable(header: string[], rows: (string | number)[][]): string {
  const line = (cells: (string | number)[]) => `| ${cells.join(' | ')} |`;
  return [line(header), line(header.map(() => '---')), ...rows.map(line)].join('\n');
}

function renderMarkdown(date: string, gsc: any, ga4: any, bing: any): string {
  const parts: string[] = [`# SEO data pull, ${date}`, ''];
  parts.push('Generated by scripts/seo-pull.ts. Noise and brand queries are removed from tables and from the clean totals.', '');

  for (const days of [28, 90]) {
    const d = gsc[`d${days}`];
    parts.push(`## GSC ${days} days (${d.totals.startDate} to ${d.totals.endDate})`, '');
    parts.push(
      `Clicks ${d.totals.clicks} (clean ${d.clean.clicks}) | Impressions ${d.totals.impressions} (clean ${d.clean.impressions}, noise ${d.clean.noiseImpressions}) | CTR ${pct(d.totals.ctr)} | Position ${d.totals.position.toFixed(1)}`,
      '',
    );
    const q = d.queries.filter((r: Row) => r.impressions >= 3);
    parts.push(`### Queries with 3+ impressions (${q.length})`, '');
    parts.push(mdTable(['Query', 'Clicks', 'Impr', 'CTR', 'Pos'], q.map((r: Row) => [r.key, r.clicks, r.impressions, pct(r.ctr), r.position.toFixed(1)])), '');
    parts.push(`### Pages (${d.pages.length})`, '');
    parts.push(mdTable(['Page', 'Clicks', 'Impr', 'CTR', 'Pos'], d.pages.map((r: Row) => [r.key, r.clicks, r.impressions, pct(r.ctr), r.position.toFixed(1)])), '');
  }
  parts.push('## Sitemaps', '');
  parts.push(mdTable(['Sitemap', 'Submitted', 'Indexed', 'Last read'], (gsc.sitemaps as any[]).map((s) => [s.path, s.submitted ?? '?', s.indexed ?? '?', s.lastDownloaded ?? '?'])), '');

  for (const days of [7, 28]) {
    const d = ga4[`d${days}`];
    parts.push(`## GA4 ${days} days (${d.range.startDate} to ${d.range.endDate})`, '');
    parts.push('### Channels', '');
    parts.push(
      mdTable(
        ['Channel', 'Sessions', 'Users', 'Engaged', 'Leads', 'Trials', 'Purchases'],
        d.channels.map((r: any) => [r.sessionDefaultChannelGroup, r.sessions, r.totalUsers, r.engagedSessions, r['keyEvents:generate_lead'], r['keyEvents:start_trial'], r['keyEvents:purchase']]),
      ),
      '',
    );
    parts.push('### Organic Search landing pages', '');
    parts.push(
      mdTable(
        ['Landing page', 'Sessions', 'Users', 'Eng. rate', 'Eng. sec/user', 'Leads', 'Trials'],
        d.organicLanding.map((r: any) => [
          r.landingPage,
          r.sessions,
          r.totalUsers,
          pct(Number(r.engagementRate)),
          r.totalUsers ? Math.round(Number(r.userEngagementDuration) / Number(r.totalUsers)) : 0,
          r['keyEvents:generate_lead'],
          r['keyEvents:start_trial'],
        ]),
      ),
      '',
    );
    parts.push('### Pages that produced leads (all channels)', '');
    parts.push(
      d.leadPages.length
        ? mdTable(['Landing page', 'Channel', 'Sessions', 'Leads'], d.leadPages.map((r: any) => [r.landingPage, r.sessionDefaultChannelGroup, r.sessions, r['keyEvents:generate_lead']]))
        : '(none in this window)',
      '',
    );
  }

  parts.push('## Bing', '');
  if (bing.skipped) {
    parts.push('Skipped: BING_WEBMASTER_API_KEY not set.', '');
  } else {
    parts.push(`28 days: ${bing.totals28.clicks} clicks, ${bing.totals28.impressions} impressions`, '');
    parts.push('### Queries', '');
    parts.push(mdTable(['Query', 'Clicks', 'Impr', 'Pos'], bing.queries.map((r: any) => [r.key, r.clicks, r.impressions, Number(r.position).toFixed(1)])), '');
    parts.push('### Pages', '');
    parts.push(mdTable(['Page', 'Clicks', 'Impr', 'Pos'], bing.pages.map((r: any) => [r.key, r.clicks, r.impressions, Number(r.position).toFixed(1)])), '');
  }
  parts.push('Not available by API (still needs the browser): GSC index coverage counts, GSC external links, Bing AI Performance, Bing Keyword Research, GSC "Request indexing".', '');
  return parts.join('\n');
}

// ---------- Main ----------

async function main() {
  const { auth, who } = await getAuth();
  console.log(`Auth: ${who}`);

  if (hasFlag('--check')) {
    const sc = google.searchconsole({ version: 'v1', auth });
    const sites = await sc.sites.list();
    const ok = (sites.data.siteEntry ?? []).some((s) => s.siteUrl === SITE_URL);
    console.log(ok ? `GSC: OK, ${SITE_URL} is accessible` : `GSC: ${SITE_URL} not in the account's site list. Add this account as a user in Search Console.`);
    const ad = google.analyticsdata({ version: 'v1beta', auth });
    try {
      await ad.properties.runReport({ property: GA4_PROPERTY, requestBody: { dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }], metrics: [{ name: 'sessions' }] } });
      console.log(`GA4: OK, ${GA4_PROPERTY} is accessible`);
    } catch (e) {
      console.log(`GA4: no access to ${GA4_PROPERTY}. Give this account Viewer in Admin > Property access management. (${(e as Error).message})`);
    }
    console.log(process.env.BING_WEBMASTER_API_KEY ? 'Bing: key set' : 'Bing: BING_WEBMASTER_API_KEY not set (optional)');
    return;
  }

  const outDir = arg('--out') ?? DEFAULT_OUT;
  fs.mkdirSync(outDir, { recursive: true });
  // Local date for the filename (UTC would roll over at 5pm Pacific).
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const gsc = await pullGsc(auth);
  const ga4 = await pullGa4(auth);
  const bing = await pullBing();

  const jsonPath = path.join(outDir, `${date}.json`);
  const mdPath = path.join(outDir, `${date}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify({ date, gsc, ga4, bing }, null, 2));
  fs.writeFileSync(mdPath, renderMarkdown(date, gsc, ga4, bing));
  console.log(`\nWrote ${mdPath}\nWrote ${jsonPath}`);
}

main().catch((err) => {
  console.error('seo-pull failed:', err?.message ?? err);
  process.exit(1);
});

/*
 * One-time setup, option A: OAuth with your own login (use this on a Google
 * Workspace org that blocks service account keys). About 5 minutes.
 *
 * 1. console.cloud.google.com, pick a project (the existing one is fine).
 * 2. APIs & Services > Library: enable "Google Search Console API" and
 *    "Google Analytics Data API".
 * 3. APIs & Services > OAuth consent screen: User type "Internal", app name
 *    "seo-pull", your email for the contact fields. Internal means no
 *    verification and the refresh token never expires. (If the Google account
 *    that owns Search Console and GA4 is outside the Workspace org, pick
 *    "External" instead and then press "Publish app", otherwise the token dies
 *    after 7 days.)
 * 4. Credentials > Create credentials > OAuth client ID > Application type
 *    "Desktop app". Download the JSON and save it as
 *    google-oauth-credentials.json in the repo root (gitignored).
 * 5. Run: npm run seo:pull -- --check
 *    A browser opens once. Sign in with the account that owns Search Console
 *    and GA4. The token is saved to google-oauth-token.json (gitignored).
 *
 * Option B: service account key (if key creation is allowed).
 * 1. Same APIs as above. IAM & Admin > Service Accounts > create or reuse
 *    one > Keys > Add key > JSON. Save as google-service-account.json.
 * 2. Search Console > Settings > Users and permissions > add the service
 *    account email, "Restricted". GA4 > Admin > Property access management >
 *    add the same email as Viewer.
 * 3. Run: npm run seo:pull -- --check
 *
 * Optional, Bing: Bing Webmaster Tools > Settings > API access > generate a
 * key, then add BING_WEBMASTER_API_KEY=... to .env.local.
 */
