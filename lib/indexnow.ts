/**
 * IndexNow submission helpers — shared between the CLI script
 * (scripts/indexnow.ts) and the Vercel deploy webhook
 * (app/api/indexnow/route.ts).
 */

export const INDEXNOW_HOST = "anywherelearning.co";
export const INDEXNOW_KEY = "76d009dc1b117562f9cf8e09defbc4a3";
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";
const BATCH_LIMIT = 10_000;

export interface IndexNowResult {
  ok: boolean;
  status: number;
  submitted: number;
  message?: string;
}

/**
 * POST a batch of URLs to the IndexNow API. Returns status without
 * throwing so callers (webhook, CLI) can decide how to handle.
 * Accepted: 200 (indexed) or 202 (queued). 403 usually means the key
 * file is not reachable at INDEXNOW_KEY_LOCATION — check the deploy.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  if (urls.length === 0) {
    return { ok: true, status: 200, submitted: 0, message: "no urls" };
  }

  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls.slice(0, BATCH_LIMIT),
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  const body = await res.text();
  const ok = res.status === 200 || res.status === 202;
  return { ok, status: res.status, submitted: urls.length, message: body || undefined };
}

/**
 * Validate that every URL points to the configured host. Throws on
 * invalid input so callers can fail fast.
 */
export function validateHostUrls(urls: string[]): void {
  for (const u of urls) {
    let parsed: URL;
    try {
      parsed = new URL(u);
    } catch {
      throw new Error(`Invalid URL: ${u}`);
    }
    if (parsed.hostname !== INDEXNOW_HOST) {
      throw new Error(`URL must be on ${INDEXNOW_HOST}: ${u}`);
    }
  }
}

/**
 * Fetch and parse URLs from the production sitemap.
 */
export async function fetchSitemapUrls(): Promise<string[]> {
  const res = await fetch(`https://${INDEXNOW_HOST}/sitemap.xml`);
  if (!res.ok) {
    throw new Error(`Failed to fetch sitemap: ${res.status}`);
  }
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}
