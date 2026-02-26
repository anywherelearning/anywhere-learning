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
        'Every single activity pack we make \u2014 in one download. That\'s 220+ activities covering seasonal outdoor learning, creativity challenges, nature exploration, real-world skills, life skills, and AI literacy. This is the complete Anywhere Learning library.\n\nPerfect for families who want it all, or for co-ops and learning groups who want variety for every season and every interest. Print what you need, when you need it.\n\nIncludes all 17 individual packs plus any new packs added to the library.',
      shortDescription:
        'Every activity pack we make \u2014 220+ activities in one download.',
      priceCents: 8999,
      compareAtPriceCents: 19883,
      lemonVariantId: 'LEMON_VARIANT_master-bundle',
      blobUrl: 'BLOB_URL_master-bundle',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: '[]',
      activityCount: 220,
      ageRange: 'Ages 4\u201314',
      sortOrder: 1,
      active: true,
    },
    {
      name: 'Full Seasonal Bundle (All 4 Seasons)',
      slug: 'seasonal-bundle',
      description:
        'All four seasonal outdoor learning packs in one bundle. Spring, summer, fall, and winter \u2014 80 activities that get your family outside no matter the weather.\n\nEach season brings unique opportunities to explore, create, and learn from the world around you. These packs rotate naturally through the year so you always have fresh ideas ready.\n\nSave over individual pack pricing and never run out of outdoor activity ideas.',
      shortDescription:
        'All 4 seasonal packs \u2014 80 outdoor activities for every time of year.',
      priceCents: 4999,
      compareAtPriceCents: 5996,
      lemonVariantId: 'LEMON_VARIANT_seasonal-bundle',
      blobUrl: 'BLOB_URL_seasonal-bundle',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: '[]',
      activityCount: 80,
      ageRange: 'Ages 4\u201314',
      sortOrder: 2,
      active: true,
    },
    {
      name: 'Real-World Skills Bundle (All 4 Packs)',
      slug: 'real-world-bundle',
      description:
        'All four real-world skills packs: Budget Challenge, Kitchen Math & Meal Planning, Smart Shopper Lab, and Micro-Business Challenge. 49 activities that teach kids practical skills they\'ll actually use.\n\nFrom grocery math to running a lemonade stand, these packs turn everyday situations into meaningful learning moments. Kids build confidence by solving real problems.\n\nPerfect for families who believe the best education happens in the real world.',
      shortDescription:
        'All 4 real-world skills packs \u2014 49 practical activities kids actually use.',
      priceCents: 3499,
      compareAtPriceCents: 3996,
      lemonVariantId: 'LEMON_VARIANT_real-world-bundle',
      blobUrl: 'BLOB_URL_real-world-bundle',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: '[]',
      activityCount: 49,
      ageRange: 'Ages 6\u201314',
      sortOrder: 3,
      active: true,
    },
    {
      name: 'Creativity Bundle (All 3 Packs)',
      slug: 'creativity-bundle',
      description:
        'All three creativity packs: Board Game Studio, Rube Goldberg Machine, and Invent a Sport. 45 activities that stretch your child\'s imagination and problem-solving skills.\n\nThese aren\'t arts and crafts \u2014 they\'re design challenges that ask kids to think, build, test, and iterate. The kind of creative thinking that transfers to everything else they do.\n\nGreat for kids who love making things and asking "what if?"',
      shortDescription:
        'All 3 creativity packs \u2014 45 design challenges for imaginative kids.',
      priceCents: 3299,
      compareAtPriceCents: 3897,
      lemonVariantId: 'LEMON_VARIANT_creativity-bundle',
      blobUrl: 'BLOB_URL_creativity-bundle',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: '[]',
      activityCount: 45,
      ageRange: 'Ages 6\u201314',
      sortOrder: 4,
      active: true,
    },
    {
      name: 'Nature & Outdoor Bundle (All 3 Packs)',
      slug: 'nature-bundle',
      description:
        'All three nature packs: Nature Journal & Walk Cards, Outdoor STEM Challenge Cards, and Land Art Challenge Cards. 60 activities for families who love being outside.\n\nFrom nature journaling to building ephemeral art from found materials, these packs turn any outdoor space into a learning environment.\n\nNo fancy equipment needed \u2014 just curiosity and a willingness to explore.',
      shortDescription:
        'All 3 nature packs \u2014 60 outdoor activities for curious families.',
      priceCents: 2499,
      compareAtPriceCents: 2997,
      lemonVariantId: 'LEMON_VARIANT_nature-bundle',
      blobUrl: 'BLOB_URL_nature-bundle',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: '[]',
      activityCount: 60,
      ageRange: 'Ages 4\u201314',
      sortOrder: 5,
      active: true,
    },

    // === SEASONAL (sortOrder 10–13) ===
    {
      name: 'Spring Outdoor Learning Pack',
      slug: 'spring-outdoor-pack',
      description:
        'Spring is your best teaching window. The world is waking up, energy is high, and learning happens naturally when you step outside. This pack gives you 20 carefully designed activity cards that turn spring moments into real skills \u2014 budgeting at the garden centre, measuring rainfall, mapping your neighbourhood, starting a container garden, and more.\n\nEvery card includes age adaptation notes so kids 4\u201314 can work at their own level. No lesson plans. No prep. Just print, pick one, and go outside.',
      shortDescription:
        '20 outdoor activities that use spring\u2019s energy to build real-world skills \u2014 from planting to weather science to neighbourhood explorations.',
      priceCents: 1499,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_spring-outdoor-pack',
      blobUrl: 'BLOB_URL_spring-outdoor-pack',
      category: 'seasonal',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 20,
      ageRange: 'Ages 4\u201314',
      sortOrder: 10,
      active: true,
    },
    {
      name: 'Summer Outdoor Learning Pack',
      slug: 'summer-outdoor-pack',
      description:
        'Summer is wide open. No schedules, no routines, no excuses. This pack gives you 20 activity cards designed for the season when learning should feel effortless \u2014 building with sand, tracking constellations, planning a day trip, running a lemonade stand, and more.\n\nPerfect for families at home, on the road, or anywhere the sun shines. Every card includes age adaptations for 4\u201314 and requires nothing you don\'t already have.',
      shortDescription:
        '20 summer activities for families who learn on the move \u2014 road trips, beach days, backyard explorations, and warm-weather adventures.',
      priceCents: 1499,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_summer-outdoor-pack',
      blobUrl: 'BLOB_URL_summer-outdoor-pack',
      category: 'seasonal',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 20,
      ageRange: 'Ages 4\u201314',
      sortOrder: 11,
      active: true,
    },
    {
      name: 'Fall Outdoor Learning Pack',
      slug: 'fall-outdoor-pack',
      description:
        'Fall is a masterclass in change \u2014 and change is where the best learning happens. This pack gives you 20 activity cards that use autumn\'s shifts to build real skills: leaf identification and pressing, harvest-season cooking math, weather journaling, seed saving, nature colour mixing, and more.\n\nDesigned for families who learn outdoors, at home, or on the go. Ages 4\u201314, no prep needed.',
      shortDescription:
        '20 autumn activities that use the changing season to build observation, science, and creative skills \u2014 from leaf pressing to harvest math.',
      priceCents: 1499,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_fall-outdoor-pack',
      blobUrl: 'BLOB_URL_fall-outdoor-pack',
      category: 'seasonal',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 20,
      ageRange: 'Ages 4\u201314',
      sortOrder: 12,
      active: true,
    },
    {
      name: 'Winter Outdoor Learning Pack',
      slug: 'winter-outdoor-pack',
      description:
        'Winter doesn\'t mean learning stops \u2014 it means learning moves closer to home. This pack gives you 20 activity cards for the colder months: kitchen chemistry experiments, snow and ice science, indoor engineering challenges, storytelling projects, winter bird watching, and budgeting for holiday gifts.\n\nWorks whether you\'re snowed in or somewhere warm. Ages 4\u201314, no prep needed.',
      shortDescription:
        '20 winter activities for cosy indoor days and cold outdoor adventures \u2014 from kitchen science to snow geometry to storytelling by firelight.',
      priceCents: 1499,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_winter-outdoor-pack',
      blobUrl: 'BLOB_URL_winter-outdoor-pack',
      category: 'seasonal',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 20,
      ageRange: 'Ages 4\u201314',
      sortOrder: 13,
      active: true,
    },

    // === CREATIVITY (sortOrder 20–22) ===
    {
      name: 'Creativity Anywhere: Board Game Studio',
      slug: 'creativity-board-game',
      description:
        'Your kids don\'t just play games \u2014 they design one from scratch. This pack walks them through the entire process: brainstorming a theme, designing game mechanics, creating a board and cards, writing rules, and playtesting with family.\n\nAlong the way they\'re building maths (probability, scoring systems), logic (game balance), storytelling (theme and narrative), and design thinking (iteration, feedback). One of our most-loved packs because the end result is something the whole family plays together.',
      shortDescription:
        'Design, build, and playtest an original board game \u2014 a project that builds maths, logic, storytelling, and design thinking all at once.',
      priceCents: 1299,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_creativity-board-game',
      blobUrl: 'BLOB_URL_creativity-board-game',
      category: 'creativity',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 15,
      ageRange: 'Ages 6\u201314',
      sortOrder: 20,
      active: true,
    },
    {
      name: 'Creativity Anywhere: Rube Goldberg Machine',
      slug: 'creativity-rube-goldberg',
      description:
        'The goal: make a machine that does something ridiculously simple (turn a page, ring a bell, pop a balloon) in the most complicated way possible. This pack gives kids a structured approach to an open-ended engineering challenge \u2014 starting small, adding chain reactions, troubleshooting failures, and documenting their design.\n\nUses only household materials. Teaches physics, cause-and-effect, persistence through failure, and the kind of creative problem-solving that no worksheet ever will.',
      shortDescription:
        'Build an absurdly complicated machine to do something simple \u2014 a hands-on engineering challenge that teaches physics, problem-solving, and persistence.',
      priceCents: 1299,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_creativity-rube-goldberg',
      blobUrl: 'BLOB_URL_creativity-rube-goldberg',
      category: 'creativity',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 15,
      ageRange: 'Ages 6\u201314',
      sortOrder: 21,
      active: true,
    },
    {
      name: 'Creativity Anywhere: Invent a Sport',
      slug: 'creativity-invent-sport',
      description:
        'What if your kids invented their own sport? This pack challenges them to design a game from the ground up: define the rules, create or repurpose equipment, design a scoring system, and then teach it to friends or family.\n\nIt builds communication (explaining rules clearly), negotiation (agreeing on changes), maths (scorekeeping, statistics), and physical creativity. Works indoors or out, for one kid or a whole group. One of the most fun, surprising packs we\'ve ever created.',
      shortDescription:
        'Create an entirely new sport with original rules, equipment, and scoring \u2014 then teach it to someone else.',
      priceCents: 1299,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_creativity-invent-sport',
      blobUrl: 'BLOB_URL_creativity-invent-sport',
      category: 'creativity',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 15,
      ageRange: 'Ages 6\u201314',
      sortOrder: 22,
      active: true,
    },

    // === NATURE (sortOrder 30–32) ===
    {
      name: 'Nature Journal & Walk Cards',
      slug: 'nature-journal-walks',
      description:
        'Every walk is a lesson \u2014 if you know where to look. This pack gives you 25 beautifully designed prompt cards that turn a regular walk into a nature observation experience. Track weather patterns, sketch plants, identify bird calls, measure shadows, map animal habitats, and build a season-long nature journal.\n\nTeaches scientific observation, patience, and a deep connection to the natural world. Works in a city park, a forest, a beach, or your own backyard.',
      shortDescription:
        '25 nature walk prompts and journaling activities that turn any outdoor walk into a rich observation and science experience.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_nature-journal-walks',
      blobUrl: 'BLOB_URL_nature-journal-walks',
      category: 'nature',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 25,
      ageRange: 'Ages 4\u201314',
      sortOrder: 30,
      active: true,
    },
    {
      name: 'Outdoor STEM Challenge Cards',
      slug: 'outdoor-stem-challenges',
      description:
        'The best science lab is outside your front door. This pack gives you 20 hands-on STEM challenge cards that use the natural world as raw material: build a bridge that holds weight using only sticks, filter water through layers of natural materials, create natural dyes from plants, measure tree height with shadows, engineer a shelter that stays dry.\n\nReal engineering, real science, real problem-solving \u2014 no worksheets, no textbooks, no special materials.',
      shortDescription:
        '20 outdoor STEM challenges that use the natural world as a laboratory \u2014 from bridge building to water filtration to natural dye making.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_outdoor-stem-challenges',
      blobUrl: 'BLOB_URL_outdoor-stem-challenges',
      category: 'nature',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 20,
      ageRange: 'Ages 6\u201314',
      sortOrder: 31,
      active: true,
    },
    {
      name: 'Land Art Challenge Cards',
      slug: 'land-art-challenges',
      description:
        'Art doesn\'t need a canvas \u2014 it needs a curious kid and whatever nature provides. Inspired by land artists like Andy Goldsworthy, this pack gives you 15 challenge cards for creating beautiful, temporary artwork using only natural materials: spirals from stones, colour gradients from leaves, mandalas from petals, sculptures from driftwood.\n\nTeaches composition, colour theory, patience, and a deep respect for natural materials. Every creation is photographed then left for nature to reclaim.',
      shortDescription:
        '15 land art challenges inspired by Andy Goldsworthy \u2014 creating beautiful, temporary art using only natural materials found outdoors.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_land-art-challenges',
      blobUrl: 'BLOB_URL_land-art-challenges',
      category: 'nature',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 15,
      ageRange: 'Ages 4\u201314',
      sortOrder: 32,
      active: true,
    },

    // === REAL-WORLD SKILLS (sortOrder 40–43) ===
    {
      name: 'Budget Challenge',
      slug: 'budget-challenge',
      description:
        'Kids don\'t learn money skills from worksheets about pretend shops. They learn by handling real money with real consequences. This pack gives you 12 challenges that put kids in charge of actual budget decisions: planning a grocery shop within a set budget, comparing prices across shops, saving for a goal, managing a weekly allowance, and understanding the difference between needs and wants.\n\nAges 8\u201314, with scaffolding notes for younger kids working with a parent.',
      shortDescription:
        '12 real-money challenges that teach kids budgeting, saving, and smart spending through actual decisions \u2014 not pretend ones.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_budget-challenge',
      blobUrl: 'BLOB_URL_budget-challenge',
      category: 'real-world',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 12,
      ageRange: 'Ages 8\u201314',
      sortOrder: 40,
      active: true,
    },
    {
      name: 'Kitchen Math & Meal Planning',
      slug: 'kitchen-math',
      description:
        'The kitchen is the most underrated classroom in your home. This pack gives you 15 activity cards that turn cooking into real learning: doubling and halving recipes (fractions), converting measurements (unit conversion), planning meals within a budget (money maths), understanding nutrition labels (data literacy), and calculating cost per serving (division).\n\nEvery activity ends with something your family actually eats. Ages 6\u201314.',
      shortDescription:
        '15 activities that turn cooking and meal planning into a rich maths and science experience \u2014 fractions, measurement, budgeting, and nutrition.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_kitchen-math',
      blobUrl: 'BLOB_URL_kitchen-math',
      category: 'real-world',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 15,
      ageRange: 'Ages 6\u201314',
      sortOrder: 41,
      active: true,
    },
    {
      name: 'Smart Shopper Lab',
      slug: 'smart-shopper',
      description:
        'Every trip to the shops is an economics lesson waiting to happen. This pack turns grocery runs into learning opportunities: compare unit prices, decode marketing claims, read nutrition labels critically, calculate savings from bulk buying, and understand the psychology behind product placement.\n\nYour kids become sharper, more critical consumers \u2014 a skill they\'ll use every day for the rest of their lives. Ages 8\u201314.',
      shortDescription:
        '12 activities that teach kids to be critical, informed consumers \u2014 comparing prices, reading labels, understanding marketing, and spotting value.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_smart-shopper',
      blobUrl: 'BLOB_URL_smart-shopper',
      category: 'real-world',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 12,
      ageRange: 'Ages 8\u201314',
      sortOrder: 42,
      active: true,
    },
    {
      name: 'Micro-Business Challenge',
      slug: 'micro-business',
      description:
        'What if your child ran their own business \u2014 even a small one? This pack walks them through the entire process: finding a problem to solve, designing a product or service, calculating costs and pricing, creating marketing materials, making their first sale, and reflecting on what they learned.\n\nPast projects from families using this pack include: handmade cards, dog walking services, baked goods, garden produce stands, and tech help for neighbours. Entrepreneurship isn\'t an abstract concept when you\'ve actually done it. Ages 9\u201314.',
      shortDescription:
        '10 guided activities to help your child plan, launch, and run a simple real business \u2014 from idea to first sale.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_micro-business',
      blobUrl: 'BLOB_URL_micro-business',
      category: 'real-world',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 10,
      ageRange: 'Ages 9\u201314',
      sortOrder: 43,
      active: true,
    },

    // === LIFE SKILLS (sortOrder 50) ===
    {
      name: '10 Life Skills Guide',
      slug: 'life-skills-guide',
      description:
        'This is where most families start. 10 carefully chosen activities that cover the skills that matter most for future-ready kids: budgeting, cooking, navigation, communication, negotiation, money management, growing something, learning from others, and real problem-solving.\n\nEach activity takes 30\u201360 minutes, needs no special materials, and includes notes on how to adapt for ages 6\u201314. Perfect as a first taste of the Anywhere Learning approach.',
      shortDescription:
        '10 real-world activities your kids can try this week \u2014 from budgeting a grocery run to writing a real letter to navigating somewhere new.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_life-skills-guide',
      blobUrl: 'BLOB_URL_life-skills-guide',
      category: 'life-skills',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 10,
      ageRange: 'Ages 6\u201314',
      sortOrder: 50,
      active: true,
    },

    // === AI LITERACY (sortOrder 60–61) ===
    {
      name: 'AI Basics: Myths, Facts & Smart Rules',
      slug: 'ai-basics',
      description:
        'AI is part of your child\'s world \u2014 and they deserve to understand it, not fear it. This pack gives you 12 activities that build real AI literacy: separating myths from facts, understanding how AI \'learns\' from data, exploring bias in AI systems, creating smart personal rules for AI use, and thinking critically about AI-generated content.\n\nDesigned to be balanced and skills-focused \u2014 not fear-based, not hype-based. Ages 9\u201314.',
      shortDescription:
        '12 age-appropriate activities that help kids understand what AI actually is, what it can and can\'t do, and how to use it wisely.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_ai-basics',
      blobUrl: 'BLOB_URL_ai-basics',
      category: 'ai-literacy',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 12,
      ageRange: 'Ages 9\u201314',
      sortOrder: 60,
      active: true,
    },
    {
      name: 'Hallucination Detective',
      slug: 'hallucination-detective',
      description:
        'AI makes things up. It sounds confident when it\'s wrong. And your kids need to know how to catch it. This pack gives you 10 detective-style activities where kids fact-check AI outputs, identify hallucinations, compare AI answers to real sources, and build a personal checklist for evaluating AI-generated content.\n\nIt\'s the most important digital literacy skill of the next decade \u2014 and it\'s also genuinely fun. Ages 9\u201314.',
      shortDescription:
        '10 investigation activities that teach kids to spot when AI gets things wrong \u2014 building critical thinking and media literacy skills.',
      priceCents: 999,
      compareAtPriceCents: null,
      lemonVariantId: 'LEMON_VARIANT_hallucination-detective',
      blobUrl: 'BLOB_URL_hallucination-detective',
      category: 'ai-literacy',
      isBundle: false,
      bundleProductIds: null,
      activityCount: 10,
      ageRange: 'Ages 9\u201314',
      sortOrder: 61,
      active: true,
    },
  ];

  // Insert all products
  for (const product of productData) {
    await db.insert(products).values(product).onConflictDoNothing();
    console.log(`  \u2713 ${product.name}`);
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
