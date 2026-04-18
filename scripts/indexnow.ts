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
 *
 * Auto-submission on Vercel deploy is wired up in
 * app/api/indexnow/route.ts and shares helpers via lib/indexnow.ts.
 */

import {
  fetchSitemapUrls,
  submitToIndexNow,
  validateHostUrls,
} from "../lib/indexnow";

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

  try {
    validateHostUrls(urls);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }

  const result = await submitToIndexNow(urls);
  if (result.ok) {
    console.log(
      `OK  ${result.status}  ${result.submitted} URL${result.submitted === 1 ? "" : "s"} accepted`,
    );
  } else {
    console.error(`ERR ${result.status}  ${result.message ?? "(empty response)"}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
