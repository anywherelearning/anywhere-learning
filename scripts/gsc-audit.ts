/**
 * Google Search Console + GA4 audit script.
 *
 * First run: opens a browser for Google sign-in, saves a refresh token locally.
 * Subsequent runs: uses the saved token (no browser needed).
 *
 * Usage:
 *   npx tsx scripts/gsc-audit.ts              # last 28 days
 *   npx tsx scripts/gsc-audit.ts --days 90    # last 90 days
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';

const CREDENTIALS_PATH = path.join(process.cwd(), 'google-oauth-credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'google-oauth-token.json');
const SITE_URL = 'sc-domain:anywherelearning.co';
const GA4_PROPERTY = process.env.GA4_PROPERTY_ID || 'properties/528296208';

// ─── Parse CLI args ───
const daysFlag = process.argv.indexOf('--days');
const days = daysFlag !== -1 ? parseInt(process.argv[daysFlag + 1], 10) : 28;

// ─── OAuth helpers ───

function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('Missing google-oauth-credentials.json in project root.');
    console.error('Download it from Google Cloud Console > APIs & Services > Credentials.');
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  return raw.installed || raw.web;
}

function createOAuth2Client(creds: ReturnType<typeof loadCredentials>) {
  return new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    'http://localhost:3847'
  );
}

async function getAuthenticatedClient() {
  const creds = loadCredentials();
  const oauth2 = createOAuth2Client(creds);

  // Try saved token first
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oauth2.setCredentials(token);

    // Refresh if expired
    if (token.expiry_date && token.expiry_date < Date.now()) {
      const { credentials } = await oauth2.refreshAccessToken();
      oauth2.setCredentials(credentials);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2));
    }

    return oauth2;
  }

  // First run: browser auth flow
  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/analytics.readonly',
    ],
  });

  console.log('\n🔑 First-time setup: opening browser for Google sign-in...\n');

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || '', 'http://localhost:3847');
      const code = url.searchParams.get('code');
      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h2>Authenticated! You can close this tab.</h2>');
        server.close();
        resolve(code);
      } else {
        res.writeHead(400);
        res.end('Missing code parameter');
        reject(new Error('No auth code received'));
      }
    });
    server.listen(3847, () => {
      // Open browser
      const open = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      require('child_process').exec(`${open} "${authUrl}"`);
    });
  });

  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('✅ Token saved. Future runs won\'t need browser auth.\n');

  return oauth2;
}

// ─── Date helpers ───

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getDateRange(numDays: number) {
  const end = new Date();
  end.setDate(end.getDate() - 1); // yesterday (GSC data has ~2 day lag)
  const start = new Date(end);
  start.setDate(start.getDate() - numDays);
  return { startDate: formatDate(start), endDate: formatDate(end) };
}

// ─── GSC queries ───

async function fetchGSCPerformance(auth: InstanceType<typeof google.auth.OAuth2>) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const { startDate, endDate } = getDateRange(days);

  console.log(`\n📊 GSC Performance (${startDate} to ${endDate})\n`);
  console.log('='.repeat(60));

  // Overall totals
  const totals = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: { startDate, endDate, dimensions: [], rowLimit: 1 },
  });

  const row = totals.data.rows?.[0];
  if (row) {
    console.log(`\nClicks: ${row.clicks}`);
    console.log(`Impressions: ${row.impressions}`);
    console.log(`CTR: ${((row.ctr || 0) * 100).toFixed(1)}%`);
    console.log(`Avg Position: ${(row.position || 0).toFixed(1)}`);
  } else {
    console.log('\nNo data yet (site may be too new).');
  }

  // Top queries
  console.log('\n\n🔍 Top 20 Queries\n');
  const queries = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: 20,
      orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
    },
  });

  if (queries.data.rows?.length) {
    console.log(`${'Query'.padEnd(50)} ${'Clicks'.padStart(7)} ${'Impr'.padStart(7)} ${'CTR'.padStart(7)} ${'Pos'.padStart(7)}`);
    console.log('-'.repeat(80));
    for (const r of queries.data.rows) {
      const q = (r.keys?.[0] || '').slice(0, 48);
      console.log(
        `${q.padEnd(50)} ${String(r.clicks).padStart(7)} ${String(r.impressions).padStart(7)} ${((r.ctr || 0) * 100).toFixed(1).padStart(6)}% ${(r.position || 0).toFixed(1).padStart(7)}`
      );
    }
  } else {
    console.log('No query data yet.');
  }

  // Top pages
  console.log('\n\n📄 Top 20 Pages\n');
  const pages = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: 20,
      orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
    },
  });

  if (pages.data.rows?.length) {
    console.log(`${'Page'.padEnd(60)} ${'Clicks'.padStart(7)} ${'Impr'.padStart(7)}`);
    console.log('-'.repeat(76));
    for (const r of pages.data.rows) {
      const p = (r.keys?.[0] || '').replace('https://anywherelearning.co', '').slice(0, 58);
      console.log(
        `${p.padEnd(60)} ${String(r.clicks).padStart(7)} ${String(r.impressions).padStart(7)}`
      );
    }
  } else {
    console.log('No page data yet.');
  }

  // Index coverage via URL inspection is limited, so show sitemaps instead
  console.log('\n\n🗺️  Sitemaps\n');
  const sitemaps = await searchconsole.sitemaps.list({ siteUrl: SITE_URL });
  if (sitemaps.data.sitemap?.length) {
    for (const s of sitemaps.data.sitemap) {
      console.log(`${s.path} -- ${s.lastSubmitted} -- ${s.contents?.[0]?.submitted || '?'} URLs submitted`);
    }
  }
}

// ─── GA4 queries ───

async function fetchGA4Overview(auth: InstanceType<typeof google.auth.OAuth2>) {
  if (!GA4_PROPERTY) {
    console.log('\n\n📈 GA4: Skipped (set GA4_PROPERTY_ID env var, e.g. "properties/123456789")\n');
    return;
  }

  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });
  const { startDate, endDate } = getDateRange(days);

  console.log(`\n\n📈 GA4 Overview (${startDate} to ${endDate})\n`);
  console.log('='.repeat(60));

  const report = await analyticsdata.properties.runReport({
    property: GA4_PROPERTY,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'ecommercePurchases' },
        { name: 'totalRevenue' },
      ],
    },
  });

  const row = report.data?.rows?.[0];
  if (row?.metricValues) {
    const v = row.metricValues;
    console.log(`Sessions: ${v[0]?.value}`);
    console.log(`Users: ${v[1]?.value}`);
    console.log(`New Users: ${v[2]?.value}`);
    console.log(`Avg Session Duration: ${parseFloat(v[3]?.value || '0').toFixed(0)}s`);
    console.log(`Bounce Rate: ${(parseFloat(v[4]?.value || '0') * 100).toFixed(1)}%`);
    console.log(`Purchases: ${v[5]?.value}`);
    console.log(`Revenue: $${parseFloat(v[6]?.value || '0').toFixed(2)}`);
  }

  // Top pages
  console.log('\n\nTop Pages by Sessions:\n');
  const pageReport = await analyticsdata.properties.runReport({
    property: GA4_PROPERTY,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 20,
    },
  });

  if (pageReport.data?.rows?.length) {
    console.log(`${'Page'.padEnd(55)} ${'Sessions'.padStart(10)} ${'Users'.padStart(10)}`);
    console.log('-'.repeat(77));
    for (const r of pageReport.data.rows) {
      const p = (r.dimensionValues?.[0]?.value || '').slice(0, 53);
      console.log(
        `${p.padEnd(55)} ${(r.metricValues?.[0]?.value || '').padStart(10)} ${(r.metricValues?.[1]?.value || '').padStart(10)}`
      );
    }
  }

  // Traffic sources
  console.log('\n\nTraffic Sources:\n');
  const sourceReport = await analyticsdata.properties.runReport({
    property: GA4_PROPERTY,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15,
    },
  });

  if (sourceReport.data?.rows?.length) {
    console.log(`${'Source / Medium'.padEnd(45)} ${'Sessions'.padStart(10)} ${'Users'.padStart(10)}`);
    console.log('-'.repeat(67));
    for (const r of sourceReport.data.rows) {
      const source = `${r.dimensionValues?.[0]?.value} / ${r.dimensionValues?.[1]?.value}`.slice(0, 43);
      console.log(
        `${source.padEnd(45)} ${(r.metricValues?.[0]?.value || '').padStart(10)} ${(r.metricValues?.[1]?.value || '').padStart(10)}`
      );
    }
  }
}

// ─── Main ───

async function main() {
  const auth = await getAuthenticatedClient();
  await fetchGSCPerformance(auth);
  await fetchGA4Overview(auth);
  console.log('\n\nDone! Run again anytime with: npx tsx scripts/gsc-audit.ts\n');
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
