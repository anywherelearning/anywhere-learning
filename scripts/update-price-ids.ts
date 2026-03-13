import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { products } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const priceMap: Record<string, string> = {
  "seasonal-bundle": "price_1T9JRgAMzOBftCntfI1aLvEE",
  "creativity-mega-bundle": "price_1T9JRiAMzOBftCnt0lx9Os6i",
  "real-world-mega-bundle": "price_1T9JRjAMzOBftCntFm9zj9GQ",
  "ai-digital-bundle": "price_1T9JRkAMzOBftCntbfyHJ8iT",
  "nature-art-bundle": "price_1T9JRlAMzOBftCntK5wQT4BB",
  "outdoor-toolkit-bundle": "price_1T9JRmAMzOBftCnt1KfveOg0",
  "spring-outdoor-pack": "price_1T9JRnAMzOBftCnter2iXs5U",
  "summer-outdoor-pack": "price_1T9JRpAMzOBftCntCjZuZtsr",
  "fall-outdoor-pack": "price_1T9JRqAMzOBftCntZUufoT7D",
  "winter-outdoor-pack": "price_1T9JRrAMzOBftCntnfkRGyig",
  "nature-journal-walks": "price_1T9JRtAMzOBftCnteaV4N09t",
  "nature-walk-task-cards": "price_1T9JRuAMzOBftCntADRoP9ax",
  "nature-choice-boards": "price_1T9JRvAMzOBftCntN1sSLFfz",
  "outdoor-learning-missions": "price_1T9JRwAMzOBftCntBg65DIYs",
  "outdoor-stem-challenges": "price_1T9JRyAMzOBftCntlu1FMGoj",
  "land-art-challenges": "price_1T9JRzAMzOBftCnt1Km8Xa4Y",
  "nature-crafts": "price_1T9JS0AMzOBftCntCud5dNSB",
  "board-game-studio": "price_1T9JS1AMzOBftCntnWFqBERm",
  "rube-goldberg-machine": "price_1T9JS2AMzOBftCntlaGbkfMO",
  "survival-base": "price_1T9JS3AMzOBftCntNsz5uJHA",
  "imaginary-world": "price_1T9JS4AMzOBftCntNyxRNRL5",
  "creature-habitat": "price_1T9JS5AMzOBftCntxDUbzSlO",
  "theme-park": "price_1T9JS6AMzOBftCntlSD4pH6M",
  "mini-movie": "price_1T9JS7AMzOBftCntDZWszNAZ",
  "invent-a-sport": "price_1T9JS9AMzOBftCntYLhYtCOo",
  "kinetic-sculpture": "price_1T9JSAAMzOBftCntCZjp86ZU",
  "build-a-museum": "price_1T9JSBAMzOBftCntYOFiDvxx",
  "budget-challenge": "price_1T9JSCAMzOBftCntB2DLyCq9",
  "community-impact": "price_1T9JSDAMzOBftCntLgwWzewC",
  "kitchen-math-challenge": "price_1T9JSEAMzOBftCntBWdJuwyv",
  "media-info-check": "price_1T9JSFAMzOBftCnt6L4vlSby",
  "micro-business": "price_1T9JSGAMzOBftCnt4xTYcDgd",
  "problem-solver": "price_1T9JSIAMzOBftCntVhLx6rwW",
  "smart-shopper": "price_1T9JSJAMzOBftCntc1pvCvMe",
  "time-energy-planner": "price_1T9JSKAMzOBftCntfoNqvdED",
  "travel-day": "price_1T9JSLAMzOBftCntYEHNo6po",
  "write-like-a-pro": "price_1T9JSMAMzOBftCntGuJMocwc",
  "ai-basics": "price_1T9JSNAMzOBftCnt26iKEB5F",
  "algorithm-awareness": "price_1T9JSPAMzOBftCntKMMxnypH",
  "bias-fairness-lab": "price_1T9JSQAMzOBftCntLKPon1Vc",
  "build-ai-helper": "price_1T9JSRAMzOBftCnt85dfs48U",
  "create-with-ai": "price_1T9JSSAMzOBftCntFtxc482j",
  "deepfake-spotter": "price_1T9JSTAMzOBftCntoqOuS1gv",
  "hallucination-detective": "price_1T9JSUAMzOBftCntJu8j245c",
  "healthy-tech-boundaries": "price_1T9JSVAMzOBftCntN6dTNMNu",
  "privacy-footprint": "price_1T9JSWAMzOBftCnt0Kr6K6QN",
  "prompt-like-a-coach": "price_1T9JSYAMzOBftCnt4jxEltIh",
  "future-ready-skills-map": "price_1T9JSZAMzOBftCntfh73EgWC",
  "my-small-business-project": "price_1T9JSaAMzOBftCnt7K7w8xvT",
  "time-capsule": "price_1T9JSbAMzOBftCntkCNr8dKm",
};

async function updatePriceIds() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log('Updating Stripe price IDs in database...\n');

  let updated = 0;
  for (const [slug, priceId] of Object.entries(priceMap)) {
    const result = await db
      .update(products)
      .set({ stripePriceId: priceId })
      .where(eq(products.slug, slug));
    console.log(`  ✓ ${slug} → ${priceId}`);
    updated++;
  }

  console.log(`\nDone! Updated ${updated} products.`);
}

updatePriceIds().catch(console.error);
