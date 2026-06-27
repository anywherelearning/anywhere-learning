import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { products } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// These are the ACTUAL price IDs pulled directly from Stripe API
const realPrices: Record<string, string> = {
  "seasonal-bundle": "price_1TLrpvAkIBECpwGmfll39qgU",
  "creativity-mega-bundle": "price_1TLrpXAkIBECpwGmiH5gmGNa",
  "real-world-mega-bundle": "price_1TLrpYAkIBECpwGmOJN33UUA",
  "ai-digital-bundle": "price_1TLrpYAkIBECpwGmwTymDpXV",
  "real-world-math-bundle": "price_1TLrpZAkIBECpwGmldyiIrpx",
  "communication-writing-bundle": "price_1TLo8lAkIBECpwGmNGXYXZif",
  "entrepreneurship-bundle": "price_1TLo8lAkIBECpwGmV5BcGnyY",
  "planning-problem-solving-bundle": "price_1TLo8lAkIBECpwGmZ54mEf19",
  "nature-art-bundle": "price_1TLrpaAkIBECpwGmguWVbtmQ",
  "outdoor-toolkit-bundle": "price_1TLrpbAkIBECpwGmUEAAVflw",
  "outdoor-mega-bundle": "price_1TLo8mAkIBECpwGm1ksHAleE",
  "spring-outdoor-pack": "price_1TLrpcAkIBECpwGmta3kZME4",
  "summer-outdoor-pack": "price_1TLrpyAkIBECpwGmJKaGyU3J",
  "fall-outdoor-pack": "price_1TLrpzAkIBECpwGm3pNLdhqG",
  "winter-outdoor-pack": "price_1TLrpeAkIBECpwGmVCg2NqGm",
  "nature-journal-walks": "price_1TLrpeAkIBECpwGm6cacYS90",
  "nature-walk-task-cards": "price_1TLrpfAkIBECpwGmYYJRzrKV",
  "nature-choice-boards": "price_1TLrpgAkIBECpwGml7Y7qQVt",
  "outdoor-learning-missions": "price_1TLrpgAkIBECpwGmf2frETKl",
  "outdoor-stem-challenges": "price_1TLrpgAkIBECpwGmDo8WjG4Z",
  "land-art-challenges": "price_1TLrphAkIBECpwGmqj1htffA",
  "nature-crafts": "price_1TLrphAkIBECpwGmHzBJOSW0",
  "board-game-studio": "price_1TLrpiAkIBECpwGmNCltdHtY",
  "rube-goldberg-machine": "price_1TLrpiAkIBECpwGms3N113ga",
  "survival-base": "price_1TLrpjAkIBECpwGmCLDpj9tF",
  "imaginary-world": "price_1TLrpjAkIBECpwGmY5nHhpP3",
  "creature-habitat": "price_1TLrpkAkIBECpwGm1v6HUls3",
  "theme-park": "price_1TLrpkAkIBECpwGmWo13CnUU",
  "mini-movie": "price_1TLrplAkIBECpwGm8e5ZKzXB",
  "invent-a-sport": "price_1TLrplAkIBECpwGmD8WCPsXt",
  "kinetic-sculpture": "price_1TLrplAkIBECpwGmq63l93oU",
  "build-a-museum": "price_1TLrpmAkIBECpwGm849TJdAW",
  "budget-challenge": "price_1TLrpmAkIBECpwGmgi9i7P74",
  "community-impact": "price_1TLrpnAkIBECpwGmK43FgWjR",
  "kitchen-math-challenge": "price_1TLrpnAkIBECpwGmH6nVrxMI",
  "media-info-check": "price_1TLrpnAkIBECpwGm2HJnA87z",
  "micro-business": "price_1TLrpoAkIBECpwGmjnbnqcVj",
  "problem-solver": "price_1TLrpoAkIBECpwGmQAxyKwev",
  "smart-shopper": "price_1TLrppAkIBECpwGmFDhNrYWB",
  "time-energy-planner": "price_1TLrppAkIBECpwGmNrQ7gqOz",
  "travel-day": "price_1TLrppAkIBECpwGmSIyPtK3g",
  "write-like-a-pro": "price_1TLrpqAkIBECpwGm8YmLcIp8",
  "ai-basics": "price_1TLrq6AkIBECpwGmWfe238bd",
  "algorithm-awareness": "price_1TLrq7AkIBECpwGmLznrtraX",
  "bias-fairness-lab": "price_1TLrq7AkIBECpwGmQJ9tuxrr",
  "build-ai-helper": "price_1TLrq8AkIBECpwGmJGcSG2lY",
  "create-with-ai": "price_1TLrq8AkIBECpwGmWnjiv4W3",
  "deepfake-spotter": "price_1TLrq9AkIBECpwGmFtLGmoqB",
  "hallucination-detective": "price_1TLrq9AkIBECpwGm1T5rkWKf",
  "healthy-tech-boundaries": "price_1TLrqAAkIBECpwGmF02VABa4",
  "privacy-footprint": "price_1TLrqAAkIBECpwGmWbsd0ZbP",
  "prompt-like-a-coach": "price_1TLrqBAkIBECpwGmiN5eALl8",
  "backyard-campout-planner": "price_1TLrqBAkIBECpwGmhykBV8al",
  "clothing-swap-thrift-math": "price_1TLrqCAkIBECpwGm23iixQgo",
  "family-electricity-audit": "price_1TLrqDAkIBECpwGmfW75ZUM3",
  "farmers-market-challenge": "price_1TLrqDAkIBECpwGmYmZ9kCi1",
  "garage-sale-math": "price_1TLrqEAkIBECpwGm1TSe6jkj",
  "garden-plot-planner": "price_1TLrqEAkIBECpwGmjGJs2vEP",
  "party-planner-math": "price_1TLrqFAkIBECpwGmmj18jxPy",
  "road-trip-calculator": "price_1TLrqFAkIBECpwGmlCHUbfKk",
  "savings-goal-tracker": "price_1TLrqGAkIBECpwGmxshVtOia",
  "sports-stats-lab": "price_1TLrqHAkIBECpwGm34eVhwIE",
  "future-ready-skills-map": "price_1TLo8tAkIBECpwGmREB9Zrrv",
  "adventure-story-map": "price_1TLo8kAkIBECpwGmic3LxtTU",
  "community-tour-guide": "price_1TLo8iAkIBECpwGmITWjmOaq",
  "directions-challenge": "price_1TLo8iAkIBECpwGm7SXopF3E",
  "family-debate-night": "price_1TLo8iAkIBECpwGmayHk4VnP",
  "family-recipe-book": "price_1TLo8hAkIBECpwGmsygtytDp",
  "market-stall-pitch": "price_1TLo8jAkIBECpwGmy0SJKZ5e",
  "mini-magazine-creator": "price_1TLo8hAkIBECpwGmJs00pcpK",
  "my-review-column": "price_1TLo8hAkIBECpwGm1sZFuzpq",
  "neighbourhood-interview": "price_1TLo8hAkIBECpwGmOYHC4JyU",
  "trail-guide-creator": "price_1TLo8gAkIBECpwGm6tH9yLpC",
  "brand-builder": "price_1TLo8jAkIBECpwGmPjNrOxxJ",
  "business-failure-lab": "price_1TLo8eAkIBECpwGmmPvYNP9t",
  "community-service-business": "price_1TLo8eAkIBECpwGm63W2XKKk",
  "customer-discovery": "price_1TLo8dAkIBECpwGmCYd8ASMS",
  "investor-pitch": "price_1TLo8dAkIBECpwGmXYRRNpcs",
  "marketing-campaign": "price_1TLo8cAkIBECpwGmtdAAK9XQ",
  "pricing-experiment": "price_1TLo8dAkIBECpwGmMliJ75t1",
  "product-design-lab": "price_1TLo8cAkIBECpwGmMmFBb346",
  "supply-chain-detective": "price_1TLo8dAkIBECpwGmh2DEDTfk",
  "shark-tank-pitch": "price_1TLo8dAkIBECpwGmnFj7FlKX",
  "emergency-ready": "price_1TLo8YAkIBECpwGmPgLRtzrj",
  "everyday-redesign": "price_1TLo8YAkIBECpwGmMHOmPEht",
  "fix-it-detective": "price_1TLo8ZAkIBECpwGmoBhiAkgI",
  "neighbourhood-problem-spotter": "price_1TLo8ZAkIBECpwGmeHYEEPmY",
  "outdoor-survival-planner": "price_1TLo8ZAkIBECpwGm3sHKP1zS",
  "pack-like-a-pro": "price_1TLo8ZAkIBECpwGmvgkmKSbD",
  "scavenger-hunt-designer": "price_1TLo8YAkIBECpwGmZmbCzTvu",
  "swap-day-challenge": "price_1TLo8YAkIBECpwGmkzNQZEYe",
  "what-if-scenario-lab": "price_1TLo8YAkIBECpwGmSfnJ5nSM",
  "decision-lab": "price_1TLo8aAkIBECpwGmi9IQ5bOz",
};

async function main() {
  let updated = 0;
  for (const [slug, priceId] of Object.entries(realPrices)) {
    await db.update(products).set({ stripePriceId: priceId }).where(eq(products.slug, slug));
    updated++;
  }
  console.log(`Updated ${updated} products`);

  const remaining = await db.select({ slug: products.slug, stripePriceId: products.stripePriceId }).from(products);
  const bad = remaining.filter(r => !r.stripePriceId || r.stripePriceId.includes('AMzOBftCnt'));
  if (bad.length > 0) {
    console.error(`WARNING: ${bad.length} products with missing/test IDs:`);
    bad.forEach(r => console.error(`  ${r.slug}: ${r.stripePriceId}`));
  } else {
    console.log('✓ All products have valid live Stripe price IDs');
  }
  process.exit(0);
}
main();
