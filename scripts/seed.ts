import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { products } from '../lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { BUNDLE_CONTENTS } from '../lib/cart';

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required. Set it in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log('Seeding products...');

  // Product data matches slugs from fallback-products.ts.
  // Run `npm run stripe:sync` first to get real stripePriceIds.
  const productData = [
    // === BUNDLES (sortOrder 1–7) ===
    {
      name: 'Full Seasonal Bundle (All 4 Seasons)',
      slug: 'seasonal-bundle',
      description: 'All four seasonal outdoor learning packs in one bundle. 80 activities for every time of year.',
      shortDescription: 'All 4 seasonal packs \u2014 80 outdoor activities for every time of year.',
      priceCents: 4499,
      compareAtPriceCents: 5999,
      stripePriceId: 'price_1TFcTNAMzOBftCntknn9ugHW',
      blobUrl: '',
      imageUrl: '/products/four-seasons-bundle.jpg',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: null,
      activityCount: 80,
      ageRange: 'Ages 6\u201314',
      sortOrder: 2,
      active: true,
    },
    {
      name: 'Creativity Mega Bundle',
      slug: 'creativity-mega-bundle',
      description: 'All 10 creativity packs \u2014 game design, filmmaking, invention, sculpture, and more.',
      shortDescription: 'All 10 creativity packs in one download.',
      priceCents: 4499,
      compareAtPriceCents: 5999,
      stripePriceId: 'price_1TFcTNAMzOBftCntDc8CoKsa',
      blobUrl: '',
      imageUrl: '/products/mega-bundle-creativity.jpg',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: null,
      activityCount: null,
      ageRange: 'Ages 6\u201314',
      sortOrder: 3,
      active: true,
    },
    {
      name: 'Real-World Skills Mega Bundle',
      slug: 'real-world-mega-bundle',
      description: 'All 10 real-world skills packs \u2014 budgeting, cooking, business, media literacy, and more.',
      shortDescription: 'All 10 real-world skills packs in one download.',
      priceCents: 4499,
      compareAtPriceCents: 5999,
      stripePriceId: 'price_1TFcTNAMzOBftCntZTSpWFfb',
      blobUrl: '',
      imageUrl: '/products/mega-bundle-real-world.jpg',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: null,
      activityCount: null,
      ageRange: 'Ages 6\u201314',
      sortOrder: 4,
      active: true,
    },
    {
      name: 'AI & Digital Literacy Bundle',
      slug: 'ai-digital-bundle',
      description: 'All 10 AI & digital literacy packs \u2014 algorithms, deepfakes, privacy, prompt skills, and more.',
      shortDescription: 'All 10 AI & digital literacy packs in one download.',
      priceCents: 4499,
      compareAtPriceCents: 5999,
      stripePriceId: 'price_1TFcTOAMzOBftCntHzTASW76',
      blobUrl: '',
      imageUrl: '/products/mega-bundle-ai-digital.jpg',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: null,
      activityCount: null,
      ageRange: 'Ages 6\u201314',
      sortOrder: 5,
      active: true,
    },
    {
      name: 'Real-World Math Mega Bundle',
      slug: 'real-world-math-bundle',
      description: 'All 10 Real-World Math guides in one download: campout planning, garage sales, garden plots, road trips, sports stats, and more. Every activity puts kids in real-life scenarios where they use maths to plan, budget, and make smart decisions.',
      shortDescription: 'All 10 Real-World Math guides in one download.',
      priceCents: 4499,
      compareAtPriceCents: 5999,
      stripePriceId: 'price_1TFcTOAMzOBftCntWV4GZeM4',
      blobUrl: '',
      imageUrl: '/products/mega-bundle-real-world-math.jpg',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: null,
      activityCount: 10,
      ageRange: 'Ages 6–14',
      sortOrder: 8,
      active: true,
    },
    {
      name: 'Nature Art Bundle',
      slug: 'nature-art-bundle',
      description: 'Land Art + Nature Crafts + Nature Journal \u2014 three packs for families who love creating with nature.',
      shortDescription: 'Land Art + Nature Crafts + Nature Journal in one download.',
      priceCents: 1799,
      compareAtPriceCents: 2397,
      stripePriceId: 'price_1TFcTPAMzOBftCntIs6rjc1V',
      blobUrl: '',
      imageUrl: '/products/nature-art-bundle.jpg',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: null,
      activityCount: null,
      ageRange: 'Ages 6\u201314',
      sortOrder: 6,
      active: true,
    },
    {
      name: 'Outdoor Toolkit Bundle',
      slug: 'outdoor-toolkit-bundle',
      description: 'Walk Cards + Missions + STEM Challenges + Choice Boards \u2014 everything you need for outdoor learning.',
      shortDescription: 'Walk Cards + Missions + STEM + Choice Boards in one download.',
      priceCents: 2399,
      compareAtPriceCents: 3196,
      stripePriceId: 'price_1TFcTPAMzOBftCntA7iWyJ5t',
      blobUrl: '',
      imageUrl: '/products/outdoor-toolkit-bundle.jpg',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: null,
      activityCount: null,
      ageRange: 'Ages 6\u201314',
      sortOrder: 7,
      active: true,
    },

    {
      name: 'Outdoor & Nature Mega Bundle',
      slug: 'outdoor-mega-bundle',
      description: 'All 7 outdoor & nature packs: walk cards, missions, STEM challenges, choice boards, land art, nature crafts, and nature journal.',
      shortDescription: 'All 7 outdoor & nature packs in one download.',
      priceCents: 4199,
      compareAtPriceCents: 5593,
      stripePriceId: 'price_1TIVzrAMzOBftCntORiPbt2P',
      blobUrl: '',
      imageUrl: '/products/mega-bundle-outdoor.jpg',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: null,
      activityCount: null,
      ageRange: 'Ages 6\u201314',
      sortOrder: 8,
      active: true,
    },
    {
      name: 'Communication & Writing Mega Bundle',
      slug: 'communication-writing-bundle',
      description: 'All 10 Communication & Writing guides in one download: storytelling, debate, interviews, recipes, reviews, and more.',
      shortDescription: 'All 10 Communication & Writing guides in one download.',
      priceCents: 4499,
      compareAtPriceCents: 5999,
      stripePriceId: 'price_1TIVzsAMzOBftCntudyoAMdZ',

      blobUrl: '',
      imageUrl: '/products/mega-bundle-communication-writing.jpg',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: null,
      activityCount: null,
      ageRange: 'Ages 6–14',
      sortOrder: 9,
      active: true,
    },
    {
      name: 'Entrepreneurship Mega Bundle',
      slug: 'entrepreneurship-bundle',
      description: 'All 10 Entrepreneurship guides in one download: brand building, pitching, pricing, marketing, and more.',
      shortDescription: 'All 10 Entrepreneurship guides in one download.',
      priceCents: 4499,
      compareAtPriceCents: 5999,
      stripePriceId: 'price_1TIVzsAMzOBftCntL9ZJ2pZ4',

      blobUrl: '',
      imageUrl: '/products/mega-bundle-entrepreneurship.jpg',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: null,
      activityCount: null,
      ageRange: 'Ages 6–14',
      sortOrder: 10,
      active: true,
    },
    {
      name: 'Planning & Problem-Solving Mega Bundle',
      slug: 'planning-problem-solving-bundle',
      description: 'All 10 Planning & Problem-Solving guides in one download: survival planning, decision-making, scavenger hunts, and more.',
      shortDescription: 'All 10 Planning & Problem-Solving guides in one download.',
      priceCents: 4499,
      compareAtPriceCents: 5999,
      stripePriceId: 'price_1TIVzqAMzOBftCntHOBpwe5o',

      blobUrl: '',
      imageUrl: '/products/mega-bundle-planning-problem-solving.jpg',
      category: 'bundle',
      isBundle: true,
      bundleProductIds: null,
      activityCount: null,
      ageRange: 'Ages 6–14',
      sortOrder: 11,
      active: true,
    },

    // === OUTDOOR LEARNING - Seasonal packs (sortOrder 10-13) ===
    { name: 'Spring Outdoor Learning Pack', slug: 'spring-outdoor-pack', description: '20 outdoor activities for spring.', shortDescription: '20 spring outdoor activities.', priceCents: 1499, compareAtPriceCents: null, stripePriceId: 'price_1TFcTQAMzOBftCntYvoO0bs3', blobUrl: '', imageUrl: '/products/spring-outdoor-pack.jpg', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 20, ageRange: 'Ages 6\u201314', sortOrder: 10, active: true },
    { name: 'Summer Outdoor Learning Pack', slug: 'summer-outdoor-pack', description: '20 summer activities for families on the move.', shortDescription: '20 summer outdoor activities.', priceCents: 1499, compareAtPriceCents: null, stripePriceId: 'price_1TFcTRAMzOBftCntcBe5IbiX', blobUrl: '', imageUrl: '/products/summer-outdoor-pack.jpg', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 20, ageRange: 'Ages 6\u201314', sortOrder: 11, active: true },
    { name: 'Fall Outdoor Learning Pack', slug: 'fall-outdoor-pack', description: '20 autumn activities for observation and creative skills.', shortDescription: '20 fall outdoor activities.', priceCents: 1499, compareAtPriceCents: null, stripePriceId: 'price_1TFcTRAMzOBftCntOiiukmBd', blobUrl: '', imageUrl: '/products/fall-outdoor-pack.jpg', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 20, ageRange: 'Ages 6\u201314', sortOrder: 12, active: true },
    { name: 'Winter Outdoor Learning Pack', slug: 'winter-outdoor-pack', description: '20 winter activities for indoor and outdoor adventures.', shortDescription: '20 winter activities.', priceCents: 1499, compareAtPriceCents: null, stripePriceId: 'price_1TFcTSAMzOBftCntqOOGzx0P', blobUrl: '', imageUrl: '/products/winter-outdoor-pack.jpg', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 20, ageRange: 'Ages 6\u201314', sortOrder: 13, active: true },

    // === OUTDOOR LEARNING (sortOrder 20–26) ===
    { name: 'Nature Journal & Walk Cards', slug: 'nature-journal-walks', description: '25 nature walk prompts and journaling activities.', shortDescription: '25 nature walk and journal prompts.', priceCents: 799, compareAtPriceCents: null, stripePriceId: 'price_1TFcTSAMzOBftCntNAM1nnp4', blobUrl: '', imageUrl: '/products/nature-journal-walks.jpg', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 25, ageRange: 'Ages 6\u201314', sortOrder: 20, active: true },
    { name: 'Nature Walk Task Cards', slug: 'nature-walk-task-cards', description: 'Structured observation prompts for any outdoor walk.', shortDescription: 'Structured nature observation prompts.', priceCents: 799, compareAtPriceCents: null, stripePriceId: 'price_1TFcTTAMzOBftCnt7T0mraep', blobUrl: '', imageUrl: '/products/nature-walk-task-cards.jpg', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 21, active: true },
    { name: 'Nature Choice Boards', slug: 'nature-choice-boards', description: 'Pick-your-own-adventure nature activity boards.', shortDescription: 'Pick-your-own nature activity boards.', priceCents: 799, compareAtPriceCents: null, stripePriceId: 'price_1TFcTTAMzOBftCntVkFfPzek', blobUrl: '', imageUrl: '/products/nature-choice-boards.jpg', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 22, active: true },
    { name: 'Outdoor Learning Missions', slug: 'outdoor-learning-missions', description: 'Mission-based outdoor challenges for curious explorers.', shortDescription: 'Mission-based outdoor challenges.', priceCents: 799, compareAtPriceCents: null, stripePriceId: 'price_1TFcTUAMzOBftCntCKLS3VQS', blobUrl: '', imageUrl: '/products/outdoor-learning-missions.jpg', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 23, active: true },
    { name: 'Outdoor STEM Challenge Cards', slug: 'outdoor-stem-challenges', description: '20 outdoor STEM challenges using the natural world.', shortDescription: '20 outdoor STEM challenges.', priceCents: 799, compareAtPriceCents: null, stripePriceId: 'price_1TFcTUAMzOBftCntt5p1Oosa', blobUrl: '', imageUrl: '/products/outdoor-stem-challenges.jpg', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 20, ageRange: 'Ages 6\u201314', sortOrder: 24, active: true },
    { name: 'Land Art Challenge Cards', slug: 'land-art-challenges', description: '15 land art challenges using natural materials.', shortDescription: '15 land art challenges.', priceCents: 799, compareAtPriceCents: null, stripePriceId: 'price_1TFcTUAMzOBftCntKXDbLWvQ', blobUrl: '', imageUrl: '/products/land-art-challenges.jpg', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 15, ageRange: 'Ages 6\u201314', sortOrder: 25, active: true },
    { name: 'Nature Crafts for Kids', slug: 'nature-crafts', description: 'Hands-on crafting projects using natural materials.', shortDescription: 'Nature craft projects.', priceCents: 799, compareAtPriceCents: null, stripePriceId: 'price_1TFcTVAMzOBftCntMzWbHkjq', blobUrl: '', imageUrl: '/products/nature-crafts.jpg', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 26, active: true },

    // === CREATIVITY ANYWHERE (sortOrder 30–40) ===
    { name: 'Board Game Studio', slug: 'board-game-studio', description: 'Design, build, and playtest an original board game.', shortDescription: 'Design and build an original board game.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTWAMzOBftCntCEdcAPUE', blobUrl: '', imageUrl: '/products/board-game-studio.jpg', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 31, active: true },
    { name: 'Rube Goldberg Machine', slug: 'rube-goldberg-machine', description: 'Build an absurdly complicated machine to do something simple.', shortDescription: 'Build an absurd chain-reaction machine.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTWAMzOBftCnt2HICs5Uj', blobUrl: '', imageUrl: '/products/rube-goldberg-machine.jpg', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 32, active: true },
    { name: 'Build a Survival Base', slug: 'survival-base', description: 'Plan and build a survival base for an imaginary expedition.', shortDescription: 'Build a survival base for an expedition.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTXAMzOBftCnt2xp5XUtF', blobUrl: '', imageUrl: '/products/survival-base.jpg', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 33, active: true },
    { name: 'Build an Imaginary World', slug: 'imaginary-world', description: 'Design an entire imaginary world.', shortDescription: 'Design an imaginary world.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTXAMzOBftCntLpxVnTiV', blobUrl: '', imageUrl: '/products/imaginary-world.jpg', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 34, active: true },
    { name: 'Create a Creature & Habitat', slug: 'creature-habitat', description: 'Design a new creature and build its habitat.', shortDescription: 'Design a creature and its habitat.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTXAMzOBftCntW0sHBYh3', blobUrl: '', imageUrl: '/products/creature-habitat.jpg', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 35, active: true },
    { name: 'Design a Theme Park', slug: 'theme-park', description: 'Create a theme park or adventure course from scratch.', shortDescription: 'Design a theme park from scratch.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTYAMzOBftCntmrRvbNvV', blobUrl: '', imageUrl: '/products/theme-park.jpg', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 36, active: true },
    { name: 'Create a Mini Movie', slug: 'mini-movie', description: 'Write, film, and edit a mini movie or stop-motion.', shortDescription: 'Write, film, and edit a mini movie.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTYAMzOBftCntIDZw27XK', blobUrl: '', imageUrl: '/products/mini-movie.jpg', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 37, active: true },
    { name: 'Invent a New Sport', slug: 'invent-a-sport', description: 'Create a new sport with original rules and scoring.', shortDescription: 'Invent a new sport from scratch.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTZAMzOBftCntKUnaOIk2', blobUrl: '', imageUrl: '/products/invent-a-sport.jpg', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 38, active: true },
    { name: 'Kinetic Sculpture', slug: 'kinetic-sculpture', description: 'Build a moving sculpture or art installation.', shortDescription: 'Build a kinetic sculpture.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTZAMzOBftCntETLFEzEA', blobUrl: '', imageUrl: '/products/kinetic-sculpture.jpg', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 39, active: true },
    { name: 'Build a Museum', slug: 'build-a-museum', description: 'Create a museum or interactive exhibit from scratch.', shortDescription: 'Build a museum or exhibit.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTaAMzOBftCntswLeOkPC', blobUrl: '', imageUrl: '/products/build-a-museum.jpg', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 40, active: true },

    // === REAL-WORLD MATH, COMMUNICATION, ENTREPRENEURSHIP & PLANNING (sortOrder 50–60) ===
    { name: 'Budget Challenge', slug: 'budget-challenge', description: '12 real-money challenges that teach budgeting.', shortDescription: '12 real-money budgeting challenges.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTaAMzOBftCntcx3BoyC8', blobUrl: '', imageUrl: '/products/budget-challenge.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: 12, ageRange: 'Ages 8\u201314', sortOrder: 51, active: true },
    { name: 'Community Impact Project', slug: 'community-impact', description: 'Plan and run a project that helps your local community.', shortDescription: 'Community impact project.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTbAMzOBftCntFStp6niy', blobUrl: '', imageUrl: '/products/community-impact.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 52, active: true },
    { name: 'Kitchen Math & Meal Planning Challenge', slug: 'kitchen-math-challenge', description: 'Advanced kitchen maths and meal planning activities.', shortDescription: 'Advanced kitchen maths challenges.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTbAMzOBftCntCTnW0gph', blobUrl: '', imageUrl: '/products/kitchen-math-challenge.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 53, active: true },
    { name: 'Media & Info Check', slug: 'media-info-check', description: 'Spot misinformation and think critically about media.', shortDescription: 'Media literacy and fact-checking.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTcAMzOBftCntRkLHGW3w', blobUrl: '', imageUrl: '/products/media-info-check.jpg', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8\u201314', sortOrder: 54, active: true },
    { name: 'Micro-Business Challenge', slug: 'micro-business', description: 'Plan, launch, and run a simple real business.', shortDescription: 'Launch a micro-business.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTcAMzOBftCntZcUkdoFu', blobUrl: '', imageUrl: '/products/micro-business.jpg', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 55, active: true },
    { name: 'Problem-Solver Studio', slug: 'problem-solver', description: 'Structured approach to solving real-world problems.', shortDescription: 'Real-world problem solving.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTcAMzOBftCntgT52Nlxh', blobUrl: '', imageUrl: '/products/problem-solver.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 56, active: true },
    { name: 'Smart Shopper Lab', slug: 'smart-shopper', description: 'Become a critical, informed consumer.', shortDescription: 'Critical consumer skills.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTdAMzOBftCntoJjP3hy7', blobUrl: '', imageUrl: '/products/smart-shopper.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8\u201314', sortOrder: 57, active: true },
    { name: 'Time & Energy Planner', slug: 'time-energy-planner', description: 'Build time management and energy awareness skills.', shortDescription: 'Time and energy management.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTdAMzOBftCntcxl1ggJF', blobUrl: '', imageUrl: '/products/time-energy-planner.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8\u201314', sortOrder: 58, active: true },
    { name: 'Travel Day Itinerary Challenge', slug: 'travel-day', description: 'Plan a full travel day \u2014 routes, budgets, timing.', shortDescription: 'Plan a travel day itinerary.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTeAMzOBftCntm89oK6q4', blobUrl: '', imageUrl: '/products/travel-day.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 59, active: true },
    { name: 'Write It Like a Pro', slug: 'write-like-a-pro', description: 'Real-world writing for real audiences.', shortDescription: 'Real-world writing skills.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTeAMzOBftCnti098zzDn', blobUrl: '', imageUrl: '/products/write-like-a-pro.jpg', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8\u201314', sortOrder: 60, active: true },


    // === AI & DIGITAL LITERACY (sortOrder 70–79) ===
    { name: 'AI Basics: Myths, Facts & Smart Rules', slug: 'ai-basics', description: 'Understand what AI is and how to use it wisely.', shortDescription: 'AI basics for kids.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTfAMzOBftCntjVdNUY97', blobUrl: '', imageUrl: '/products/ai-basics.jpg', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 70, active: true },
    { name: 'Algorithm Awareness', slug: 'algorithm-awareness', description: 'Understand how algorithms shape what we see online.', shortDescription: 'Algorithm awareness.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTfAMzOBftCntwgbhXS2c', blobUrl: '', imageUrl: '/products/algorithm-awareness.jpg', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 71, active: true },
    { name: 'Bias & Fairness Lab', slug: 'bias-fairness-lab', description: 'Explore bias in AI systems.', shortDescription: 'AI bias and fairness.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTgAMzOBftCnty4weOSMp', blobUrl: '', imageUrl: '/products/bias-fairness-lab.jpg', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 72, active: true },
    { name: 'Build Your Own AI Helper', slug: 'build-ai-helper', description: 'Design and prototype an AI tool.', shortDescription: 'Design an AI helper.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTgAMzOBftCnt2rlB7hz4', blobUrl: '', imageUrl: '/products/build-ai-helper.jpg', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 73, active: true },
    { name: 'Create with AI, Ethically', slug: 'create-with-ai', description: 'Use AI as a creative partner ethically.', shortDescription: 'Ethical AI creativity.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcThAMzOBftCnt9kE7d4xI', blobUrl: '', imageUrl: '/products/create-with-ai.jpg', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 74, active: true },
    { name: 'Deepfake & Manipulation Spotter', slug: 'deepfake-spotter', description: 'Spot manipulated media and deepfakes.', shortDescription: 'Deepfake detection skills.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcThAMzOBftCntXZfm3eqs', blobUrl: '', imageUrl: '/products/deepfake-spotter.jpg', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 75, active: true },
    { name: 'Hallucination Detective', slug: 'hallucination-detective', description: 'Catch when AI gets things wrong.', shortDescription: 'AI fact-checking skills.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcThAMzOBftCnthpXo1GG3', blobUrl: '', imageUrl: '/products/hallucination-detective.jpg', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 76, active: true },
    { name: 'Healthy Tech & AI Boundaries', slug: 'healthy-tech-boundaries', description: 'Build healthy boundaries with technology.', shortDescription: 'Healthy tech boundaries.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTiAMzOBftCntLgtp68hD', blobUrl: '', imageUrl: '/products/healthy-tech-boundaries.jpg', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 77, active: true },
    { name: 'Privacy & Digital Footprint Map', slug: 'privacy-footprint', description: 'Understand and manage your digital footprint.', shortDescription: 'Digital privacy skills.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTiAMzOBftCntrpKs7RZt', blobUrl: '', imageUrl: '/products/privacy-footprint.jpg', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 78, active: true },
    { name: 'Prompt Like a Coach', slug: 'prompt-like-a-coach', description: 'Master the art of talking to AI effectively.', shortDescription: 'AI prompt skills.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTjAMzOBftCntIAAq45jj', blobUrl: '', imageUrl: '/products/prompt-like-a-coach.jpg', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 79, active: true },

    // === REAL-WORLD MATH - New guides (sortOrder 100-109) ===
    { name: 'Backyard Campout Planner', slug: 'backyard-campout-planner', description: 'Plan a backyard campout from gear lists to meal prep and stargazing schedule.', shortDescription: 'Plan a backyard campout with real maths.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTjAMzOBftCntwUjIM1oY', blobUrl: '', imageUrl: '/products/backyard-campout-planner.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 100, active: true },
    { name: 'Clothing Swap & Thrift Math', slug: 'clothing-swap-thrift-math', description: 'Organise a clothing swap or thrift haul using real budgeting and value skills.', shortDescription: 'Thrift shopping and clothing swap maths.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTkAMzOBftCntI5TYd61b', blobUrl: '', imageUrl: '/products/clothing-swap-thrift-math.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 101, active: true },
    { name: 'Family Electricity Audit', slug: 'family-electricity-audit', description: 'Audit your household electricity use, calculate costs, and find ways to save.', shortDescription: 'Audit electricity use and calculate savings.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTkAMzOBftCntqGIpYdvv', blobUrl: '', imageUrl: '/products/family-electricity-audit.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 102, active: true },
    { name: 'Farmers Market Challenge', slug: 'farmers-market-challenge', description: 'Navigate a farmers market with a budget. Compare prices, make choices, and track spending.', shortDescription: 'Budget and shop at a farmers market.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTlAMzOBftCntP7s0G52o', blobUrl: '', imageUrl: '/products/farmers-market-challenge.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 103, active: true },
    { name: 'Garage Sale Math', slug: 'garage-sale-math', description: 'Plan, price, and run a garage sale using real-world maths and money skills.', shortDescription: 'Price, sell, and count change at a garage sale.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTlAMzOBftCntpm3NSf6g', blobUrl: '', imageUrl: '/products/garage-sale-math.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 104, active: true },
    { name: 'Garden Plot Planner', slug: 'garden-plot-planner', description: 'Design a garden plot using area, spacing, budgets, and seasonal planning.', shortDescription: 'Design a garden with real measurements and budgets.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTmAMzOBftCntEpC5zsfb', blobUrl: '', imageUrl: '/products/garden-plot-planner.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 105, active: true },
    { name: 'Party Planner Math', slug: 'party-planner-math', description: 'Plan a party from guest list to budget: food quantities, costs, and timing.', shortDescription: 'Plan a party with real budgets and quantities.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTmAMzOBftCntCKj30Y3C', blobUrl: '', imageUrl: '/products/party-planner-math.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 106, active: true },
    { name: 'Road Trip Calculator', slug: 'road-trip-calculator', description: 'Plan a road trip. Calculate distances, fuel costs, timing, and budgets.', shortDescription: 'Calculate distances, fuel, and budgets for a road trip.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTnAMzOBftCntxsHa6OHa', blobUrl: '', imageUrl: '/products/road-trip-calculator.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 107, active: true },
    { name: 'Savings Goal Tracker', slug: 'savings-goal-tracker', description: 'Set a savings goal and track progress with real money maths.', shortDescription: 'Set and track a real savings goal.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTnAMzOBftCntIbm5J5xU', blobUrl: '', imageUrl: '/products/savings-goal-tracker.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 108, active: true },
    { name: 'Sports Stats Lab', slug: 'sports-stats-lab', description: 'Collect, analyse, and visualise real sports data: averages, percentages, and charts.', shortDescription: 'Analyse real sports stats and create charts.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcToAMzOBftCntrNhs4Q1o', blobUrl: '', imageUrl: '/products/sports-stats-lab.jpg', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 109, active: true },

    // === COMMUNICATION & WRITING - New guides (sortOrder 110-119) ===
    { name: 'Adventure Story Map', slug: 'adventure-story-map', description: 'Create a visual story map to plan and write your own adventure narrative.', shortDescription: 'Plan and write an adventure story.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/adventure-story-map.jpg', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 110, active: true },
    { name: 'Community Tour Guide', slug: 'community-tour-guide', description: 'Research and create a guided tour of your community.', shortDescription: 'Create a tour guide for your community.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/community-tour-guide.jpg', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 111, active: true },
    { name: 'Directions Challenge', slug: 'directions-challenge', description: 'Write clear, step-by-step directions and test if others can follow them.', shortDescription: 'Write and test clear directions.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/directions-challenge.jpg', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 112, active: true },
    { name: 'Family Debate Night', slug: 'family-debate-night', description: 'Prepare arguments, debate topics as a family, and practise persuasive speaking.', shortDescription: 'Family debate and persuasion skills.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/family-debate-night.jpg', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 113, active: true },
    { name: 'Family Recipe Book', slug: 'family-recipe-book', description: 'Document family recipes with clear instructions and family stories.', shortDescription: 'Create a family recipe book.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/family-recipe-book.jpg', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 114, active: true },
    { name: 'Market Stall Pitch', slug: 'market-stall-pitch', description: 'Create a persuasive pitch to sell a product or service at a market stall.', shortDescription: 'Practise persuasive selling.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/market-stall-pitch.jpg', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 115, active: true },
    { name: 'Mini Magazine Creator', slug: 'mini-magazine-creator', description: 'Write and design a mini magazine with articles, headlines, and illustrations.', shortDescription: 'Write and design a mini magazine.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/mini-magazine-creator.jpg', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 116, active: true },
    { name: 'My Review Column', slug: 'my-review-column', description: 'Write reviews of books, movies, products, or experiences.', shortDescription: 'Write opinion reviews.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/my-review-column.jpg', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 117, active: true },
    { name: 'Neighbourhood Interview Project', slug: 'neighbourhood-interview', description: 'Interview community members, practise active listening, and present their stories.', shortDescription: 'Interview people in your community.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/neighbourhood-interview.jpg', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 118, active: true },
    { name: 'Trail Guide Creator', slug: 'trail-guide-creator', description: 'Create a written guide to a local trail or walking path.', shortDescription: 'Write a trail guide.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/trail-guide-creator.jpg', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 119, active: true },

    // === ENTREPRENEURSHIP - New guides (sortOrder 120-129) ===
    { name: 'Brand Builder', slug: 'brand-builder', description: 'Build a brand identity from scratch: name, logo, personality, and values.', shortDescription: 'Build a brand from scratch.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/brand-builder.jpg', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 120, active: true },
    { name: 'Business Failure Lab', slug: 'business-failure-lab', description: 'Analyse real business failures, learn from mistakes, and build resilience.', shortDescription: 'Learn from real business failures.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/business-failure-lab.jpg', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 121, active: true },
    { name: 'Community Service Business', slug: 'community-service-business', description: 'Design and launch a service-based business with a social mission.', shortDescription: 'Build a business that helps your community.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/community-service-business.jpg', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 122, active: true },
    { name: 'Customer Discovery Challenge', slug: 'customer-discovery', description: 'Conduct real customer interviews, gather feedback, and refine a business idea.', shortDescription: 'Interview real customers.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/customer-discovery.jpg', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 123, active: true },
    { name: 'Investor Pitch Portfolio', slug: 'investor-pitch', description: 'Create a compelling investor pitch with financial reasoning and risk assessment.', shortDescription: 'Build an investor pitch.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/investor-pitch.jpg', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 124, active: true },
    { name: 'Marketing Campaign Creator', slug: 'marketing-campaign', description: 'Design and execute a marketing campaign to reach a real audience.', shortDescription: 'Create a marketing campaign.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/marketing-campaign.jpg', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 125, active: true },
    { name: 'Pricing Experiment', slug: 'pricing-experiment', description: 'Test different pricing strategies and make data-informed decisions.', shortDescription: 'Experiment with pricing strategies.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/pricing-experiment.jpg', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 126, active: true },
    { name: 'Product Design Lab', slug: 'product-design-lab', description: 'Use design thinking to create a product that solves a real problem.', shortDescription: 'Design a product from scratch.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/product-design-lab.jpg', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 127, active: true },
    { name: 'Supply Chain Detective', slug: 'supply-chain-detective', description: 'Trace a product\u2019s journey from source to consumer and understand global systems.', shortDescription: 'Investigate real supply chains.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/supply-chain-detective.jpg', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 128, active: true },
    { name: 'The Shark Tank Pitch', slug: 'shark-tank-pitch', description: 'Develop and deliver a high-stakes business pitch with financial thinking.', shortDescription: 'Pitch a business idea Shark Tank style.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/shark-tank-pitch.jpg', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 129, active: true },

    // === PLANNING & PROBLEM-SOLVING - New guides (sortOrder 130-139) ===
    { name: 'Emergency Ready Challenge', slug: 'emergency-ready', description: 'Think clearly under pressure and build confidence handling the unexpected.', shortDescription: 'Emergency preparedness challenges.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/emergency-ready.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 130, active: true },
    { name: 'Everyday Redesign Challenge', slug: 'everyday-redesign', description: 'Examine everyday objects and systems, then redesign them for better function.', shortDescription: 'Redesign everyday objects.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/everyday-redesign.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 131, active: true },
    { name: 'Fix-It Detective', slug: 'fix-it-detective', description: 'Diagnose and fix real household problems using logic and resourcefulness.', shortDescription: 'Fix real household problems.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/fix-it-detective.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 132, active: true },
    { name: 'Neighbourhood Problem Spotter', slug: 'neighbourhood-problem-spotter', description: 'Observe your neighbourhood, spot real problems, and brainstorm solutions.', shortDescription: 'Spot and solve neighbourhood problems.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/neighbourhood-problem-spotter.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 133, active: true },
    { name: 'Outdoor Survival Planner', slug: 'outdoor-survival-planner', description: 'Plan outdoor expeditions, think through scenarios, and build survival skills.', shortDescription: 'Plan outdoor survival adventures.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/outdoor-survival-planner.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 134, active: true },
    { name: 'Pack Like a Pro', slug: 'pack-like-a-pro', description: 'Master strategic packing: priorities, weight, space, and logistics.', shortDescription: 'Strategic packing and planning.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/pack-like-a-pro.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 135, active: true },
    { name: 'Scavenger Hunt Designer', slug: 'scavenger-hunt-designer', description: 'Design, create, and test your own scavenger hunts for friends and family.', shortDescription: 'Design your own scavenger hunts.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/scavenger-hunt-designer.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 136, active: true },
    { name: 'The Swap Day Challenge', slug: 'swap-day-challenge', description: 'Plan and run a swap day where you take on someone else\u2019s role or responsibilities.', shortDescription: 'Swap roles for a day.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/swap-day-challenge.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 137, active: true },
    { name: 'The What-If Scenario Lab', slug: 'what-if-scenario-lab', description: 'Explore hypothetical scenarios, predict outcomes, and plan responses.', shortDescription: 'Explore what-if scenarios.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/what-if-scenario-lab.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 138, active: true },
    { name: 'What Would You Do? Decision Lab', slug: 'decision-lab', description: 'Work through real decision scenarios, weigh options, and justify choices.', shortDescription: 'Practise real-world decision-making.', priceCents: 599, compareAtPriceCents: null, stripePriceId: '', blobUrl: '', imageUrl: '/products/decision-lab.jpg', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 139, active: true },

    // === START HERE & DEACTIVATED (sortOrder 90-92) ===
    { name: 'The Future-Ready Skills Map', slug: 'future-ready-skills-map', description: 'A complete roadmap of real-world skills every kid needs.', shortDescription: 'Future-ready skills roadmap.', priceCents: 999, compareAtPriceCents: null, stripePriceId: 'price_1T9JSZAMzOBftCntfh73EgWC', blobUrl: '', imageUrl: '/products/future-ready-skills-map.jpg', category: 'start-here', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 90, active: true },
    { name: 'My Small Business Project', slug: 'my-small-business-project', description: 'Full small business project from idea to launch.', shortDescription: 'Small business project.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTpAMzOBftCntQyH6fU3Q', blobUrl: '', imageUrl: '/products/my-small-business-project.jpg', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 91, active: false },
    { name: 'Time Capsule', slug: 'time-capsule', description: 'Create a meaningful time capsule project.', shortDescription: 'Time capsule project.', priceCents: 599, compareAtPriceCents: null, stripePriceId: 'price_1TFcTpAMzOBftCntpY0VMvLm', blobUrl: '', imageUrl: '/products/time-capsule.jpg', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 92, active: false },
  ];

  // Upsert all products (update existing, insert new)
  for (const product of productData) {
    await db.insert(products).values(product).onConflictDoUpdate({
      target: products.slug,
      set: {
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        priceCents: product.priceCents,
        compareAtPriceCents: product.compareAtPriceCents,
        imageUrl: product.imageUrl,
        category: product.category,
        isBundle: product.isBundle,
        activityCount: product.activityCount,
        ageRange: product.ageRange,
        sortOrder: product.sortOrder,
        active: product.active,
      },
    });
    console.log(`  ✓ ${product.name}`);
  }

  // ── Populate bundleProductIds for all bundles ──
  // Uses BUNDLE_CONTENTS from lib/cart.ts (slug → child slugs)
  console.log('\nLinking bundle → child product IDs...');
  for (const [bundleSlug, childSlugs] of Object.entries(BUNDLE_CONTENTS)) {
    // Look up real UUIDs for child products
    const childProducts = await db
      .select({ id: products.id, slug: products.slug })
      .from(products)
      .where(inArray(products.slug, childSlugs));

    if (childProducts.length === 0) {
      console.log(`  ⚠ ${bundleSlug}: no child products found`);
      continue;
    }

    const childIds = childProducts.map((p) => p.id);
    const missing = childSlugs.filter(
      (s) => !childProducts.some((p) => p.slug === s)
    );

    await db
      .update(products)
      .set({ bundleProductIds: JSON.stringify(childIds) })
      .where(eq(products.slug, bundleSlug));

    console.log(
      `  ✓ ${bundleSlug}: linked ${childIds.length}/${childSlugs.length} products` +
        (missing.length > 0 ? ` (missing: ${missing.join(', ')})` : '')
    );
  }

  console.log(`\nSeeded ${productData.length} products successfully!`);
  console.log('\nReminders:');
  console.log('  - Run `npm run stripe:sync` to create products in Stripe and get real price IDs');
  console.log('  - Update blobUrl values after uploading PDFs to Vercel Blob');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
