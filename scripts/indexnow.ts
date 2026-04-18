/**
 * IndexNow URL submission script.
 *
 * Pushes URLs to the IndexNow API so Bing (and through it, ChatGPT web
 * search), Yandex, Seznam, and Naver re-crawl them within minutes
 * instead of days. Google does not use IndexNow.
 *
 * Usage:
 *   npm run indexnow -- <url1> [url2] [url3] ...
 *   npm run indexnow -- --from-sitemap
 *
 * Examples:
 *   npm run indexnow -- https://anywherelearning.co/blog/new-post
 *   npm run indexnow -- \
 *     https://anywherelearning.co/shop/spring-outdoor-pack \
 *     https://anywherelearning.co/guides/nature-based-learning
 *
 * The --from-sitemap flag submits every URL in /sitemap.xml. Use
 * sparingly — IndexNow docs discourage submitting unchanged URLs.
 */

const HOST = "anywherelearning.co";
const KEY = "76d009dc1b117562f9cf8e09defbc4a3";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

// Max URLs per request per IndexNow spec.
const BATCH_LIMIT = 10_000;

async function submit(urls: string[]): Promise<void> {
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  const body = await res.text();

  // IndexNow returns:
  //   200 — accepted
  //   202 — accepted, URLs being processed
  //   400 — bad request (malformed URLs/payload)
  //   403 — key not found / key file mismatch
  //   422 — URLs outside the host
  //   429 — too many requests
  if (res.status === 200 || res.status === 202) {
    console.log(`OK  ${res.status}  ${urls.length} URL${urls.length === 1 ? "" : "s"} accepted`);
  } else {
    console.error(`ERR ${res.status}  ${body || "(empty response)"}`);
    process.exit(1);
  }
}

async function fetchSitemapUrls(): Promise<string[]> {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  if (!res.ok) {
    console.error(`Failed to fetch sitemap: ${res.status}`);
    process.exit(1);
  }
  const xml = await res.text();
  // Simple <loc>…</loc> extraction — sitemap.ts generates a flat
  // urlset, no sitemap index, so a regex is safe here.
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return matches.map((m) => m[1].trim());
}

function validateUrls(urls: string[]): void {
  for (const u of urls) {
    let parsed: URL;
    try {
      parsed = new URL(u);
    } catch {
      console.error(`Invalid URL: ${u}`);
      process.exit(1);
    }
    if (parsed.hostname !== HOST) {
      console.error(`URL must be on ${HOST}: ${u}`);
      process.exit(1);
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(
      "Usage:\n" +
        "  npm run indexnow -- <url1> [url2] ...\n" +
        "  npm run indexnow -- --from-sitemap\n",
    );
    process.exit(0);
  }

  let urls: string[];
  if (args[0] === "--from-sitemap") {
    console.log("Fetching sitemap...");
    urls = await fetchSitemapUrls();
    console.log(`Found ${urls.length} URLs in sitemap`);
  } else {
    urls = args;
  }

  validateUrls(urls);

  // Chunk if huge (unlikely for this site, but safe).
  for (let i = 0; i < urls.length; i += BATCH_LIMIT) {
    const batch = urls.slice(i, i + BATCH_LIMIT);
    await submit(batch);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
