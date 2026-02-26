import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { products } from '../lib/db/schema';

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required. Set it in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log('Seeding products...');

  const productData = [
    // === BUNDLES (sortOrder 1–5) ===
    {
      name: 'Master Bundle (Everything)',
      slug: 'master-bundle',
      description:
        'Every single activity pack we make — in one download. That\'s 220+ activities covering seasonal outdoor learning, creativity challenges, nature exploration, real-world skills, life skills, and AI literacy. This is the complete Anywhere Learning library.\n\nPerfect for families who want it all, or for co-ops and learning groups who want variety for every season and every interest. Print what you need, when you need it.\n\nIncludes all 17 individual packs plus any new packs added to the library.',
      shortDescription:
        'Every activity pack we make — 220+ activities in one download.',
      priceCents: 8999,
      compareAtPriceCents: 19883,
      lemonVariantId: 'LEMON_VARIANT_master-bundle',
      blobUrl: 'BLOB_URL_master-bundle',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: '[]',
      activityCount: 220,
      ageRange: 'Ages 4–14',
      sortOrder: 1,
      active: true,
    },
    {
      name: 'Full Seasonal Bundle (All 4 Seasons)',
      slug: 'seasonal-bundle',
      description:
        'All four seasonal outdoor learning packs in one bundle. Spring, summer, fall, and winter — 80 activities that get your family outside no matter the weather.\n\nEach season brings unique opportunities to explore, create, and learn from the world around you. These packs rotate naturally through the year so you always have fresh ideas ready.\n\nSave over individual pack pricing and never run out of outdoor activity ideas.',
      shortDescription:
        'All 4 seasonal packs — 80 outdoor activities for every time of year.',
      priceCents: 4999,
      compareAtPriceCents: 5996,
      lemonVariantId: 'LEMON_VARIANT_seasonal-bundle',
      blobUrl: 'BLOB_URL_seasonal-bundle',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: '[]',
      activityCount: 80,
      ageRange: 'Ages 4–14',
      sortOrder: 2,
      active: true,
    },
    {
      name: 'Real-World Skills Bundle (All 4 Packs)',
      slug: 'real-world-bundle',
      description:
        'All four real-world skills packs: Budget Challenge, Kitchen Math & Meal Planning, Smart Shopper Lab, and Micro-Business Challenge. 49 activities that teach kids practical skills they\'ll actually use.\n\nFrom grocery math to running a lemonade stand, these packs turn everyday situations into meaningful learning moments. Kids build confidence by solving real problems.\n\nPerfect for families who believe the best education happens in the real world.',
      shortDescription:
        'All 4 real-world skills packs — 49 practical activities kids actually use.',
      priceCents: 3499,
      compareAtPriceCents: 3996,
      lemonVariantId: 'LEMON_VARIANT_real-world-bundle',
      blobUrl: 'BLOB_URL_real-world-bundle',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: '[]',
      activityCount: 49,
      ageRange: 'Ages 6–14',
      sortOrder: 3,
      active: true,
    },
    {
      name: 'Creativity Bundle (All 3 Packs)',
      slug: 'creativity-bundle',
      description:
        'All three creativity packs: Board Game Studio, Rube Goldberg Machine, and Invent a Sport. 45 activities that stretch your child\'s imagination and problem-solving skills.\n\nThese aren\'t arts and crafts — they\'re design challenges that ask kids to think, build, test, and iterate. The kind of creative thinking that transfers to everything else they do.\n\nGreat for kids who love making things and asking "what if?"',
      shortDescription:
        'All 3 creativity packs — 45 design challenges for imaginative kids.',
      priceCents: 3299,
      compareAtPriceCents: 3897,
      lemonVariantId: 'LEMON_VARIANT_creativity-bundle',
      blobUrl: 'BLOB_URL_creativity-bundle',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: '[]',
      activityCount: 45,
      ageRange: 'Ages 6–14',
      sortOrder: 4,
      active: true,
    },
    {
      name: 'Nature & Outdoor Bundle (All 3 Packs)',
      slug: 'nature-bundle',
      description:
        'All three nature packs: Nature Journal & Walk Cards, Outdoor STEM Challenge Cards, and Land Art Challenge Cards. 60 activities for families who love being outside.\n\nFrom nature journaling to building ephemeral art from found materials, these packs turn any outdoor space into a learning environment.\n\nNo fancy equipment needed — just curiosity and a willingness to explore.',
      shortDescription:
        'All 3 nature packs — 60 outdoor activities for curious families.',
      priceCents: 2499,
      compareAtPriceCents: 2997,
      lemonVariantId: 'LEMON_VARIANT_nature-bundle',
      blobUrl: 'BLOB_URL_nature-bundle',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: '[]',
      activityCount: 60,
      ageRange: 'Ages 4–14',
      sortOrder: 5,
      active: true,
    },

    // === SEASONAL (sortOrder 10–13) ===
    {
      name: 'Spring Outdoor Learning Pack',
      slug: 'spring-outdoor-pack',
      description:
        'Twenty real-world activities designed for spring weather and seasonal changes. Watch seeds sprout, track bird migrations, measure rainfall, and explore your neighborhood as it comes alive.\n\nEach activity card includes adaptation notes so kids ages 4–14 can all participate at their own level. Younger kids work alongside a parent; older kids take the lead independently.\n\nNo special materials, no lesson plans, no prep. Just print, pick a card, and go outside.',
      shortDescription:
        '20 real-world spring activities. Print, pick a card, go outside.',
      priceCents: 1499,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_spring-outdoor-pack',
      blobUrl: 'BLOB_URL_spring-outdoor-pack',
      category: 'seasonal',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 20,
      ageRange: 'Ages 4–14',
      sortOrder: 10,
      active: true,
    },
    {
      name: 'Summer Outdoor Learning Pack',
      slug: 'summer-outdoor-pack',
      description:
        'Twenty activities built for long summer days. Water science experiments, nature scavenger hunts, night sky observations, and adventures that make the most of warm weather.\n\nPerfect for road trips, camping, beach days, or just your own backyard. These cards keep kids engaged without screens.\n\nEvery activity adapts to ages 4–14 and requires no special materials.',
      shortDescription:
        '20 summer activities for long days, road trips, and outdoor adventures.',
      priceCents: 1499,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_summer-outdoor-pack',
      blobUrl: 'BLOB_URL_summer-outdoor-pack',
      category: 'seasonal',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 20,
      ageRange: 'Ages 4–14',
      sortOrder: 11,
      active: true,
    },
    {
      name: 'Fall Outdoor Learning Pack',
      slug: 'fall-outdoor-pack',
      description:
        'Twenty activities that celebrate autumn changes. Leaf science, harvest math, weather tracking, and cozy outdoor projects for crisp fall days.\n\nWatch your kids notice the world changing around them — and understand why. These activities turn seasonal shifts into natural science lessons.\n\nWorks in any climate, any setting. Adapts to ages 4–14.',
      shortDescription:
        '20 fall activities — leaf science, harvest math, and cozy outdoor projects.',
      priceCents: 1499,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_fall-outdoor-pack',
      blobUrl: 'BLOB_URL_fall-outdoor-pack',
      category: 'seasonal',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 20,
      ageRange: 'Ages 4–14',
      sortOrder: 12,
      active: true,
    },
    {
      name: 'Winter Outdoor Learning Pack',
      slug: 'winter-outdoor-pack',
      description:
        'Twenty activities for cold weather and short days. Ice experiments, winter bird watching, shadow tracking, and indoor-outdoor challenges that keep learning going all season.\n\nDesigned for families who refuse to hibernate. Whether you have snow or just chilly days, these activities keep kids curious and moving.\n\nAdapts to ages 4–14. No special materials needed.',
      shortDescription:
        '20 winter activities — ice science, bird watching, and cold-weather challenges.',
      priceCents: 1499,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_winter-outdoor-pack',
      blobUrl: 'BLOB_URL_winter-outdoor-pack',
      category: 'seasonal',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 20,
      ageRange: 'Ages 4–14',
      sortOrder: 13,
      active: true,
    },

    // === CREATIVITY (sortOrder 20–22) ===
    {
      name: 'Creativity Anywhere: Board Game Studio',
      slug: 'creativity-board-game',
      description:
        'Fifteen design challenges that guide kids through creating their own board games from scratch. From game mechanics to artwork to playtesting, kids learn design thinking by doing.\n\nThis isn\'t "follow the instructions" — it\'s "figure it out." Kids make real decisions, test their ideas, and iterate based on what works.\n\nWorks with materials you already have at home. Ages 6–14.',
      shortDescription:
        '15 challenges to design and build original board games from scratch.',
      priceCents: 1299,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_creativity-board-game',
      blobUrl: 'BLOB_URL_creativity-board-game',
      category: 'creativity',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 15,
      ageRange: 'Ages 6–14',
      sortOrder: 20,
      active: true,
    },
    {
      name: 'Creativity Anywhere: Rube Goldberg Machine',
      slug: 'creativity-rube-goldberg',
      description:
        'Fifteen engineering challenges that build toward creating elaborate chain-reaction machines. Kids learn about simple machines, energy transfer, and creative problem-solving.\n\nStart with simple cause-and-effect setups, then combine them into increasingly complex contraptions. The kind of building that kids don\'t want to stop.\n\nUses household items. Ages 6–14.',
      shortDescription:
        '15 engineering challenges to build chain-reaction machines.',
      priceCents: 1299,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_creativity-rube-goldberg',
      blobUrl: 'BLOB_URL_creativity-rube-goldberg',
      category: 'creativity',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 15,
      ageRange: 'Ages 6–14',
      sortOrder: 21,
      active: true,
    },
    {
      name: 'Creativity Anywhere: Invent a Sport',
      slug: 'creativity-invent-sport',
      description:
        'Fifteen challenges that guide kids through inventing their own sports and physical games. Rules design, equipment creation, scoring systems, and competitive play.\n\nKids learn about fairness, game balance, and physical design by creating something entirely new. Then they actually play it.\n\nWorks indoors or outdoors, with any number of players. Ages 6–14.',
      shortDescription:
        '15 challenges to design original sports and physical games.',
      priceCents: 1299,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_creativity-invent-sport',
      blobUrl: 'BLOB_URL_creativity-invent-sport',
      category: 'creativity',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 15,
      ageRange: 'Ages 6–14',
      sortOrder: 22,
      active: true,
    },

    // === NATURE (sortOrder 30–32) ===
    {
      name: 'Nature Journal & Walk Cards',
      slug: 'nature-journal-walks',
      description:
        'Twenty-five guided nature walk activities with journaling prompts. Each card focuses on a different observation skill — sound mapping, texture hunting, seasonal change tracking, and more.\n\nKids learn to slow down and really notice the natural world. The journal prompts work for any environment, from city parks to rural trails.\n\nNo nature expertise required. Ages 4–14.',
      shortDescription:
        '25 guided nature walks with observation and journaling prompts.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_nature-journal-walks',
      blobUrl: 'BLOB_URL_nature-journal-walks',
      category: 'nature',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 25,
      ageRange: 'Ages 4–14',
      sortOrder: 30,
      active: true,
    },
    {
      name: 'Outdoor STEM Challenge Cards',
      slug: 'outdoor-stem-challenges',
      description:
        'Twenty outdoor science and engineering challenges. Build bridges from sticks, measure tree heights using shadows, design water filtration systems, and more.\n\nReal science, real engineering, real outdoors. These challenges use the scientific method in contexts that make sense to kids.\n\nNo lab equipment needed. Ages 6–14.',
      shortDescription:
        '20 outdoor science and engineering challenges — no lab needed.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_outdoor-stem-challenges',
      blobUrl: 'BLOB_URL_outdoor-stem-challenges',
      category: 'nature',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 20,
      ageRange: 'Ages 6–14',
      sortOrder: 31,
      active: true,
    },
    {
      name: 'Land Art Challenge Cards',
      slug: 'land-art-challenges',
      description:
        'Fifteen creative challenges inspired by land artists like Andy Goldsworthy. Kids create temporary art from natural materials — leaves, stones, sticks, flowers, and shadows.\n\nArt meets nature meets mindfulness. Kids learn to see beauty in natural materials and create something meaningful that returns to the earth.\n\nWorks anywhere outdoors. Ages 4–14.',
      shortDescription:
        '15 challenges to create art from natural materials — leaves, stones, sticks.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_land-art-challenges',
      blobUrl: 'BLOB_URL_land-art-challenges',
      category: 'nature',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 15,
      ageRange: 'Ages 4–14',
      sortOrder: 32,
      active: true,
    },

    // === REAL-WORLD SKILLS (sortOrder 40–43) ===
    {
      name: 'Budget Challenge',
      slug: 'budget-challenge',
      description:
        'Twelve real-world budgeting activities that teach kids to plan, track, and make decisions about money. From planning a family outing on a budget to comparing unit prices at the store.\n\nKids practice math in context — and learn that budgeting is about choices, not just numbers.\n\nUses real situations your family encounters every week. Ages 8–14.',
      shortDescription:
        '12 budgeting activities using real situations your family encounters.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_budget-challenge',
      blobUrl: 'BLOB_URL_budget-challenge',
      category: 'real-world',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 12,
      ageRange: 'Ages 8–14',
      sortOrder: 40,
      active: true,
    },
    {
      name: 'Kitchen Math & Meal Planning',
      slug: 'kitchen-math',
      description:
        'Fifteen activities that turn your kitchen into a math lab. Scaling recipes, measuring ingredients, calculating nutrition, and planning meals for a week on a budget.\n\nKids learn fractions, ratios, and estimation while making food they actually want to eat.\n\nPractical, delicious, and genuinely useful. Ages 6–14.',
      shortDescription:
        '15 kitchen activities — fractions, recipes, and meal planning made real.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_kitchen-math',
      blobUrl: 'BLOB_URL_kitchen-math',
      category: 'real-world',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 15,
      ageRange: 'Ages 6–14',
      sortOrder: 41,
      active: true,
    },
    {
      name: 'Smart Shopper Lab',
      slug: 'smart-shopper',
      description:
        'Twelve activities that teach comparison shopping, unit pricing, marketing awareness, and consumer math. Kids learn to be thoughtful consumers by analyzing real products and prices.\n\nTake these cards to the grocery store, the mall, or use them with online shopping. Real-world math meets critical thinking.\n\nAges 8–14.',
      shortDescription:
        '12 activities on comparison shopping, unit pricing, and smart spending.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_smart-shopper',
      blobUrl: 'BLOB_URL_smart-shopper',
      category: 'real-world',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 12,
      ageRange: 'Ages 8–14',
      sortOrder: 42,
      active: true,
    },
    {
      name: 'Micro-Business Challenge',
      slug: 'micro-business',
      description:
        'Ten activities that walk kids through starting a tiny real business. From brainstorming ideas to making a product to tracking profit and loss.\n\nKids learn entrepreneurship by doing it — not reading about it. Lemonade stands, craft sales, service businesses, and more.\n\nReal stakes, real learning. Ages 9–14.',
      shortDescription:
        '10 activities to start a real micro-business — from idea to profit.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_micro-business',
      blobUrl: 'BLOB_URL_micro-business',
      category: 'real-world',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 10,
      ageRange: 'Ages 9–14',
      sortOrder: 43,
      active: true,
    },

    // === LIFE SKILLS (sortOrder 50) ===
    {
      name: '10 Life Skills Guide',
      slug: 'life-skills-guide',
      description:
        'Ten essential life skills activities covering everything from reading a map to writing a meaningful letter to negotiating respectfully. These are the skills schools don\'t teach but every kid needs.\n\nEach activity takes 15–45 minutes and can be done at home or on the go. The adaptation notes help you adjust for any age from 6–14.\n\nThe foundation of the Anywhere Learning approach — real skills, real world.',
      shortDescription:
        '10 essential life skills activities — the ones schools don\'t teach.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_life-skills-guide',
      blobUrl: 'BLOB_URL_life-skills-guide',
      category: 'life-skills',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 10,
      ageRange: 'Ages 6–14',
      sortOrder: 50,
      active: true,
    },

    // === AI LITERACY (sortOrder 60–61) ===
    {
      name: 'AI Basics: Myths, Facts & Smart Rules',
      slug: 'ai-basics',
      description:
        'Twelve activities that help kids understand what AI actually is, what it can and can\'t do, and how to use it responsibly. Covers common myths, real capabilities, and family-friendly rules for AI use.\n\nNot a coding course — it\'s a thinking course. Kids learn to be smart, critical consumers of AI technology.\n\nDesigned for curious kids and parents navigating AI together. Ages 9–14.',
      shortDescription:
        '12 activities on understanding AI — myths, facts, and responsible use.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_ai-basics',
      blobUrl: 'BLOB_URL_ai-basics',
      category: 'ai-literacy',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 12,
      ageRange: 'Ages 9–14',
      sortOrder: 60,
      active: true,
    },
    {
      name: 'Hallucination Detective',
      slug: 'hallucination-detective',
      description:
        'Ten activities that teach kids to spot AI-generated errors, hallucinations, and misinformation. They learn to fact-check AI output and develop critical evaluation skills.\n\nKids become detectives — testing AI claims against reality, finding where AI confidently gets things wrong, and learning why it happens.\n\nEssential digital literacy for the AI age. Ages 9–14.',
      shortDescription:
        '10 activities to spot AI errors and build critical thinking skills.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_hallucination-detective',
      blobUrl: 'BLOB_URL_hallucination-detective',
      category: 'ai-literacy',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 10,
      ageRange: 'Ages 9–14',
      sortOrder: 61,
      active: true,
    },
  ];

  // Insert all products
  for (const product of productData) {
    await db.insert(products).values(product).onConflictDoNothing();
    console.log(`  ✓ ${product.name}`);
  }

  console.log(`\nSeeded ${productData.length} products successfully!`);
  console.log('\nReminders:');
  console.log('  - Update lemonVariantId values after creating Lemon Squeezy products');
  console.log('  - Update blobUrl values after uploading PDFs to Vercel Blob');
  console.log('  - Update bundleProductIds with actual product UUIDs after first seed');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
