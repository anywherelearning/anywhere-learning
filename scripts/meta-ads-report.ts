/**
 * Read-only Meta ads report, straight from the Marketing API.
 *
 *   npm run ads:report                 # last 7 days (default)
 *   npm run ads:report -- today
 *   npm run ads:report -- yesterday
 *   npm run ads:report -- last_30d
 *   npm run ads:report -- maximum      # lifetime
 *   npm run ads:report -- last_7d --daily   # adds spend per ad set per day
 *   npm run ads:report -- last_7d --raw     # dumps raw action types (debugging)
 *
 * Needs META_ADS_READ_TOKEN (system user token with ads_read only) and
 * META_AD_ACCOUNT_ID (e.g. act_1022470323592686) in .env.local. The token
 * can only read; nothing here can change ads or spend money.
 */

import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

const GRAPH_API_VERSION = 'v21.0';
const PRESETS = ['today', 'yesterday', 'last_3d', 'last_7d', 'last_14d', 'last_30d', 'this_month', 'last_month', 'maximum'];

const args = process.argv.slice(2);
const preset = args.find((a) => !a.startsWith('--')) ?? 'last_7d';
const daily = args.includes('--daily');
const raw = args.includes('--raw');

type Action = { action_type: string; value: string };
type InsightRow = {
  ad_id?: string;
  ad_name?: string;
  adset_name?: string;
  campaign_name?: string;
  date_start?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  frequency?: string;
  inline_link_clicks?: string;
  inline_link_click_ctr?: string;
  cpm?: string;
  actions?: Action[];
  // Meta reports some standard events (StartTrial, Subscribe) here instead of in actions.
  conversions?: Action[];
};

// First match wins, so pixel-specific names are listed before generic ones.
const TRIAL_TYPES = ['offsite_conversion.fb_pixel_start_trial', 'start_trial_website', 'start_trial_total'];
const LEAD_TYPES = ['offsite_conversion.fb_pixel_lead', 'lead', 'onsite_web_lead'];
const LPV_TYPES = ['landing_page_view'];

function count(actions: Action[] | undefined, types: string[]): number {
  if (!actions) return 0;
  for (const t of types) {
    const hit = actions.find((a) => a.action_type === t);
    if (hit) return Number(hit.value);
  }
  return 0;
}

async function graph<T>(path: string, params: Record<string, string>): Promise<T[]> {
  const token = process.env.META_ADS_READ_TOKEN!;
  let url: string | null =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${path}?` +
    new URLSearchParams({ ...params, access_token: token, limit: '200' });
  const out: T[] = [];
  while (url) {
    const res = await fetch(url);
    const body = (await res.json()) as { data?: T[]; paging?: { next?: string }; error?: { message: string } };
    if (!res.ok || body.error) {
      console.error(`Meta API error: ${body.error?.message ?? res.statusText}`);
      process.exit(1);
    }
    out.push(...(body.data ?? []));
    url = body.paging?.next ?? null;
  }
  return out;
}

const money = (n: number) => `$${n.toFixed(2)}`;
const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n));
const lpad = (s: string, n: number) => s.padStart(n);

async function main() {
  const account = process.env.META_AD_ACCOUNT_ID;
  if (!process.env.META_ADS_READ_TOKEN || !account) {
    console.error('META_ADS_READ_TOKEN and META_AD_ACCOUNT_ID are required. Set them in .env.local');
    process.exit(1);
  }
  if (!PRESETS.includes(preset)) {
    console.error(`Unknown date range "${preset}". Use one of: ${PRESETS.join(', ')}`);
    process.exit(1);
  }

  const fields =
    'campaign_name,adset_name,ad_id,ad_name,spend,impressions,reach,frequency,inline_link_clicks,inline_link_click_ctr,cpm,actions,conversions';
  const [rows, ads] = await Promise.all([
    graph<InsightRow>(`${account}/insights`, {
      level: 'ad',
      fields,
      date_preset: preset,
      use_account_attribution_setting: 'true',
    }),
    graph<{ id: string; effective_status: string }>(`${account}/ads`, { fields: 'effective_status' }),
  ]);
  const status = new Map(ads.map((a) => [a.id, a.effective_status]));

  console.log(`\nMeta ads, ${preset}\n${'='.repeat(40)}`);
  if (rows.length === 0) {
    console.log('No delivery in this range.');
    return;
  }

  // Group ads under campaign > ad set, biggest spenders first.
  const byAdset = new Map<string, InsightRow[]>();
  for (const r of rows) {
    const key = `${r.campaign_name} > ${r.adset_name}`;
    byAdset.set(key, [...(byAdset.get(key) ?? []), r]);
  }

  let totalSpend = 0;
  for (const [adset, list] of [...byAdset].sort(
    (a, b) => b[1].reduce((s, r) => s + Number(r.spend), 0) - a[1].reduce((s, r) => s + Number(r.spend), 0),
  )) {
    const spend = list.reduce((s, r) => s + Number(r.spend), 0);
    totalSpend += spend;
    console.log(`\n${adset}  (${money(spend)})`);
    console.log(
      `  ${pad('Ad', 30)}${lpad('Status', 9)}${lpad('Spend', 10)}${lpad('Reach', 8)}${lpad('Freq', 6)}${lpad('Clicks', 8)}${lpad('CTR', 7)}${lpad('LPV', 6)}${lpad('Trials', 8)}${lpad('Leads', 7)}${lpad('Cost/res', 10)}`,
    );
    for (const r of list.sort((a, b) => Number(b.spend) - Number(a.spend))) {
      const s = Number(r.spend);
      const trials = count(r.conversions, TRIAL_TYPES) || count(r.actions, TRIAL_TYPES);
      const leads = count(r.actions, LEAD_TYPES);
      const results = trials || leads;
      const st = (status.get(r.ad_id ?? '') ?? '?').toLowerCase().replace('_', ' ');
      console.log(
        `  ${pad(r.ad_name ?? '', 30)}${lpad(st.slice(0, 8), 9)}${lpad(money(s), 10)}${lpad(r.reach ?? '0', 8)}${lpad(Number(r.frequency ?? 0).toFixed(2), 6)}${lpad(r.inline_link_clicks ?? '0', 8)}${lpad(`${Number(r.inline_link_click_ctr ?? 0).toFixed(1)}%`, 7)}${lpad(String(count(r.actions, LPV_TYPES)), 6)}${lpad(String(trials), 8)}${lpad(String(leads), 7)}${lpad(results ? money(s / results) : '-', 10)}`,
      );
      if (raw) {
        console.log(`    actions: ${(r.actions ?? []).map((a) => `${a.action_type}=${a.value}`).join(', ')}`);
        console.log(`    conversions: ${(r.conversions ?? []).map((a) => `${a.action_type}=${a.value}`).join(', ')}`);
      }
    }
  }
  console.log(`\nTotal spend: ${money(totalSpend)}`);

  if (daily) {
    const days = await graph<InsightRow>(`${account}/insights`, {
      level: 'adset',
      fields: 'adset_name,spend',
      date_preset: preset,
      time_increment: '1',
    });
    console.log(`\nSpend per ad set per day\n${'-'.repeat(40)}`);
    for (const d of days.sort((a, b) => (a.date_start! < b.date_start! ? -1 : 1))) {
      console.log(`  ${d.date_start}  ${pad(d.adset_name ?? '', 32)}${lpad(money(Number(d.spend)), 10)}`);
    }
  }
}

main();
