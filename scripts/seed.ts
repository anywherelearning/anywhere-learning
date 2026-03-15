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

  // Product data matches slugs from fallback-products.ts.
  // Run `npm run stripe:sync` first to get real stripePriceIds.
  const productData = [
    // === BUNDLES (sortOrder 1–7) ===
    {
      name: 'Full Seasonal Bundle (All 4 Seasons)',
      slug: 'seasonal-bundle',
      description: 'All four seasonal outdoor learning packs in one bundle. 80 activities for every time of year.',
      shortDescription: 'All 4 seasonal packs \u2014 80 outdoor activities for every time of year.',
      priceCents: 3999,
      compareAtPriceCents: 5196,
      stripePriceId: 'price_1T9JRgAMzOBftCntfI1aLvEE',
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
      priceCents: 2999,
      compareAtPriceCents: 4990,
      stripePriceId: 'price_1T9JRiAMzOBftCnt0lx9Os6i',
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
      priceCents: 2999,
      compareAtPriceCents: 4990,
      stripePriceId: 'price_1T9JRjAMzOBftCntFm9zj9GQ',
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
      priceCents: 2999,
      compareAtPriceCents: 4990,
      stripePriceId: 'price_1T9JRkAMzOBftCntbfyHJ8iT',
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
      description: 'All 10 Real-World Math guides in one download — campout planning, garage sales, garden plots, road trips, sports stats, and more. Every activity puts kids in real-life scenarios where they use maths to plan, budget, and make smart decisions.',
      shortDescription: 'All 10 Real-World Math guides in one download.',
      priceCents: 2999,
      compareAtPriceCents: 4990,
      stripePriceId: 'price_1TAxH6AMzOBftCntxE8GfZzG',
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
      priceCents: 1499,
      compareAtPriceCents: 2097,
      stripePriceId: 'price_1T9JRlAMzOBftCntK5wQT4BB',
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
      priceCents: 1999,
      compareAtPriceCents: 2796,
      stripePriceId: 'price_1T9JRmAMzOBftCnt1KfveOg0',
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

    // === OUTDOOR LEARNING — Seasonal packs (sortOrder 10–13) ===
    { name: 'Spring Outdoor Learning Pack', slug: 'spring-outdoor-pack', description: '20 outdoor activities for spring.', shortDescription: '20 spring outdoor activities.', priceCents: 1299, compareAtPriceCents: null, stripePriceId: 'price_1T9JRnAMzOBftCnter2iXs5U', blobUrl: '', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 20, ageRange: 'Ages 6\u201314', sortOrder: 10, active: true },
    { name: 'Summer Outdoor Learning Pack', slug: 'summer-outdoor-pack', description: '20 summer activities for families on the move.', shortDescription: '20 summer outdoor activities.', priceCents: 1299, compareAtPriceCents: null, stripePriceId: 'price_1T9JRpAMzOBftCntCjZuZtsr', blobUrl: '', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 20, ageRange: 'Ages 6\u201314', sortOrder: 11, active: true },
    { name: 'Fall Outdoor Learning Pack', slug: 'fall-outdoor-pack', description: '20 autumn activities for observation and creative skills.', shortDescription: '20 fall outdoor activities.', priceCents: 1299, compareAtPriceCents: null, stripePriceId: 'price_1T9JRqAMzOBftCntZUufoT7D', blobUrl: '', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 20, ageRange: 'Ages 6\u201314', sortOrder: 12, active: true },
    { name: 'Winter Outdoor Learning Pack', slug: 'winter-outdoor-pack', description: '20 winter activities for indoor and outdoor adventures.', shortDescription: '20 winter activities.', priceCents: 1299, compareAtPriceCents: null, stripePriceId: 'price_1T9JRrAMzOBftCntnfkRGyig', blobUrl: '', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 20, ageRange: 'Ages 6\u201314', sortOrder: 13, active: true },

    // === OUTDOOR LEARNING (sortOrder 20–26) ===
    { name: 'Nature Journal & Walk Cards', slug: 'nature-journal-walks', description: '25 nature walk prompts and journaling activities.', shortDescription: '25 nature walk and journal prompts.', priceCents: 699, compareAtPriceCents: null, stripePriceId: 'price_1T9JRtAMzOBftCnteaV4N09t', blobUrl: '', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 25, ageRange: 'Ages 6\u201314', sortOrder: 20, active: true },
    { name: 'Nature Walk Task Cards', slug: 'nature-walk-task-cards', description: 'Structured observation prompts for any outdoor walk.', shortDescription: 'Structured nature observation prompts.', priceCents: 699, compareAtPriceCents: null, stripePriceId: 'price_1T9JRuAMzOBftCntADRoP9ax', blobUrl: '', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 21, active: true },
    { name: 'Nature Choice Boards', slug: 'nature-choice-boards', description: 'Pick-your-own-adventure nature activity boards.', shortDescription: 'Pick-your-own nature activity boards.', priceCents: 699, compareAtPriceCents: null, stripePriceId: 'price_1T9JRvAMzOBftCntN1sSLFfz', blobUrl: '', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 22, active: true },
    { name: 'Outdoor Learning Missions', slug: 'outdoor-learning-missions', description: 'Mission-based outdoor challenges for curious explorers.', shortDescription: 'Mission-based outdoor challenges.', priceCents: 699, compareAtPriceCents: null, stripePriceId: 'price_1T9JRwAMzOBftCntBg65DIYs', blobUrl: '', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 23, active: true },
    { name: 'Outdoor STEM Challenge Cards', slug: 'outdoor-stem-challenges', description: '20 outdoor STEM challenges using the natural world.', shortDescription: '20 outdoor STEM challenges.', priceCents: 699, compareAtPriceCents: null, stripePriceId: 'price_1T9JRyAMzOBftCntlu1FMGoj', blobUrl: '', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 20, ageRange: 'Ages 6\u201314', sortOrder: 24, active: true },
    { name: 'Land Art Challenge Cards', slug: 'land-art-challenges', description: '15 land art challenges using natural materials.', shortDescription: '15 land art challenges.', priceCents: 699, compareAtPriceCents: null, stripePriceId: 'price_1T9JRzAMzOBftCnt1Km8Xa4Y', blobUrl: '', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: 15, ageRange: 'Ages 6\u201314', sortOrder: 25, active: true },
    { name: 'Nature Crafts for Kids', slug: 'nature-crafts', description: 'Hands-on crafting projects using natural materials.', shortDescription: 'Nature craft projects.', priceCents: 699, compareAtPriceCents: null, stripePriceId: 'price_1T9JS0AMzOBftCntCud5dNSB', blobUrl: '', category: 'outdoor-learning', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 26, active: true },

    // === CREATIVITY ANYWHERE (sortOrder 30–40) ===
    { name: 'Board Game Studio', slug: 'board-game-studio', description: 'Design, build, and playtest an original board game.', shortDescription: 'Design and build an original board game.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JS1AMzOBftCntnWFqBERm', blobUrl: '', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 31, active: true },
    { name: 'Rube Goldberg Machine', slug: 'rube-goldberg-machine', description: 'Build an absurdly complicated machine to do something simple.', shortDescription: 'Build an absurd chain-reaction machine.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JS2AMzOBftCntlaGbkfMO', blobUrl: '', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 32, active: true },
    { name: 'Build a Survival Base', slug: 'survival-base', description: 'Plan and build a survival base for an imaginary expedition.', shortDescription: 'Build a survival base for an expedition.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JS3AMzOBftCntNsz5uJHA', blobUrl: '', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 33, active: true },
    { name: 'Build an Imaginary World', slug: 'imaginary-world', description: 'Design an entire imaginary world.', shortDescription: 'Design an imaginary world.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JS4AMzOBftCntNyxRNRL5', blobUrl: '', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 34, active: true },
    { name: 'Create a Creature & Habitat', slug: 'creature-habitat', description: 'Design a new creature and build its habitat.', shortDescription: 'Design a creature and its habitat.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JS5AMzOBftCntxDUbzSlO', blobUrl: '', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 35, active: true },
    { name: 'Design a Theme Park', slug: 'theme-park', description: 'Create a theme park or adventure course from scratch.', shortDescription: 'Design a theme park from scratch.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JS6AMzOBftCntlSD4pH6M', blobUrl: '', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 36, active: true },
    { name: 'Create a Mini Movie', slug: 'mini-movie', description: 'Write, film, and edit a mini movie or stop-motion.', shortDescription: 'Write, film, and edit a mini movie.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JS7AMzOBftCntDZWszNAZ', blobUrl: '', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 37, active: true },
    { name: 'Invent a New Sport', slug: 'invent-a-sport', description: 'Create a new sport with original rules and scoring.', shortDescription: 'Invent a new sport from scratch.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JS9AMzOBftCntYLhYtCOo', blobUrl: '', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 38, active: true },
    { name: 'Kinetic Sculpture', slug: 'kinetic-sculpture', description: 'Build a moving sculpture or art installation.', shortDescription: 'Build a kinetic sculpture.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSAAMzOBftCntCZjp86ZU', blobUrl: '', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 39, active: true },
    { name: 'Build a Museum', slug: 'build-a-museum', description: 'Create a museum or interactive exhibit from scratch.', shortDescription: 'Build a museum or exhibit.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSBAMzOBftCntYOFiDvxx', blobUrl: '', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 40, active: true },

    // === REAL-WORLD MATH, COMMUNICATION, ENTREPRENEURSHIP & PLANNING (sortOrder 50–60) ===
    { name: 'Budget Challenge', slug: 'budget-challenge', description: '12 real-money challenges that teach budgeting.', shortDescription: '12 real-money budgeting challenges.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSCAMzOBftCntB2DLyCq9', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: 12, ageRange: 'Ages 8\u201314', sortOrder: 51, active: true },
    { name: 'Community Impact Project', slug: 'community-impact', description: 'Plan and run a project that helps your local community.', shortDescription: 'Community impact project.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSDAMzOBftCntLgwWzewC', blobUrl: '', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 52, active: true },
    { name: 'Kitchen Math & Meal Planning Challenge', slug: 'kitchen-math-challenge', description: 'Advanced kitchen maths and meal planning activities.', shortDescription: 'Advanced kitchen maths challenges.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSEAMzOBftCntBWdJuwyv', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 53, active: true },
    { name: 'Media & Info Check', slug: 'media-info-check', description: 'Spot misinformation and think critically about media.', shortDescription: 'Media literacy and fact-checking.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSFAMzOBftCnt6L4vlSby', blobUrl: '', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8\u201314', sortOrder: 54, active: true },
    { name: 'Micro-Business Challenge', slug: 'micro-business', description: 'Plan, launch, and run a simple real business.', shortDescription: 'Launch a micro-business.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSGAMzOBftCnt4xTYcDgd', blobUrl: '', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 55, active: true },
    { name: 'Problem-Solver Studio', slug: 'problem-solver', description: 'Structured approach to solving real-world problems.', shortDescription: 'Real-world problem solving.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSIAMzOBftCntVhLx6rwW', blobUrl: '', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 56, active: true },
    { name: 'Smart Shopper Lab', slug: 'smart-shopper', description: 'Become a critical, informed consumer.', shortDescription: 'Critical consumer skills.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSJAMzOBftCntc1pvCvMe', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8\u201314', sortOrder: 57, active: true },
    { name: 'Time & Energy Planner', slug: 'time-energy-planner', description: 'Build time management and energy awareness skills.', shortDescription: 'Time and energy management.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSKAMzOBftCntfoNqvdED', blobUrl: '', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8\u201314', sortOrder: 58, active: true },
    { name: 'Travel Day Itinerary Challenge', slug: 'travel-day', description: 'Plan a full travel day \u2014 routes, budgets, timing.', shortDescription: 'Plan a travel day itinerary.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSLAMzOBftCntYEHNo6po', blobUrl: '', category: 'planning-problem-solving', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 59, active: true },
    { name: 'Write It Like a Pro', slug: 'write-like-a-pro', description: 'Real-world writing for real audiences.', shortDescription: 'Real-world writing skills.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSMAMzOBftCntGuJMocwc', blobUrl: '', category: 'communication-writing', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8\u201314', sortOrder: 60, active: true },

    // === AI & DIGITAL LITERACY (sortOrder 70–79) ===
    { name: 'AI Basics: Myths, Facts & Smart Rules', slug: 'ai-basics', description: 'Understand what AI is and how to use it wisely.', shortDescription: 'AI basics for kids.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSNAMzOBftCnt26iKEB5F', blobUrl: '', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 70, active: true },
    { name: 'Algorithm Awareness', slug: 'algorithm-awareness', description: 'Understand how algorithms shape what we see online.', shortDescription: 'Algorithm awareness.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSPAMzOBftCntKMMxnypH', blobUrl: '', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 71, active: true },
    { name: 'Bias & Fairness Lab', slug: 'bias-fairness-lab', description: 'Explore bias in AI systems.', shortDescription: 'AI bias and fairness.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSQAMzOBftCntLKPon1Vc', blobUrl: '', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 72, active: true },
    { name: 'Build Your Own AI Helper', slug: 'build-ai-helper', description: 'Design and prototype an AI tool.', shortDescription: 'Design an AI helper.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSRAMzOBftCnt85dfs48U', blobUrl: '', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 73, active: true },
    { name: 'Create with AI, Ethically', slug: 'create-with-ai', description: 'Use AI as a creative partner ethically.', shortDescription: 'Ethical AI creativity.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSSAMzOBftCntFtxc482j', blobUrl: '', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 74, active: true },
    { name: 'Deepfake & Manipulation Spotter', slug: 'deepfake-spotter', description: 'Spot manipulated media and deepfakes.', shortDescription: 'Deepfake detection skills.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSTAMzOBftCntoqOuS1gv', blobUrl: '', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 75, active: true },
    { name: 'Hallucination Detective', slug: 'hallucination-detective', description: 'Catch when AI gets things wrong.', shortDescription: 'AI fact-checking skills.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSUAMzOBftCntJu8j245c', blobUrl: '', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 76, active: true },
    { name: 'Healthy Tech & AI Boundaries', slug: 'healthy-tech-boundaries', description: 'Build healthy boundaries with technology.', shortDescription: 'Healthy tech boundaries.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSVAMzOBftCntN6dTNMNu', blobUrl: '', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 77, active: true },
    { name: 'Privacy & Digital Footprint Map', slug: 'privacy-footprint', description: 'Understand and manage your digital footprint.', shortDescription: 'Digital privacy skills.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSWAMzOBftCnt0Kr6K6QN', blobUrl: '', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 78, active: true },
    { name: 'Prompt Like a Coach', slug: 'prompt-like-a-coach', description: 'Master the art of talking to AI effectively.', shortDescription: 'AI prompt skills.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSYAMzOBftCnt4jxEltIh', blobUrl: '', category: 'ai-literacy', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 79, active: true },

    // === REAL-WORLD MATH — New guides (sortOrder 100–109) ===
    { name: 'Backyard Campout Planner', slug: 'backyard-campout-planner', description: 'Plan a backyard campout from gear lists to meal prep and stargazing schedule.', shortDescription: 'Plan a backyard campout with real maths.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1TAxHNAMzOBftCntZDrzftAh', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 100, active: true },
    { name: 'Clothing Swap & Thrift Math', slug: 'clothing-swap-thrift-math', description: 'Organise a clothing swap or thrift haul using real budgeting and value skills.', shortDescription: 'Thrift shopping and clothing swap maths.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1TAxHOAMzOBftCntqJHbNHBu', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 101, active: true },
    { name: 'Family Electricity Audit', slug: 'family-electricity-audit', description: 'Audit your household electricity use, calculate costs, and find ways to save.', shortDescription: 'Audit electricity use and calculate savings.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1TAxHPAMzOBftCntF6zZvzfs', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 102, active: true },
    { name: 'Farmers Market Challenge', slug: 'farmers-market-challenge', description: 'Navigate a farmers market with a budget — compare prices, make choices, and track spending.', shortDescription: 'Budget and shop at a farmers market.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1TAxHQAMzOBftCntGr7Iv95D', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 103, active: true },
    { name: 'Garage Sale Math', slug: 'garage-sale-math', description: 'Plan, price, and run a garage sale using real-world maths and money skills.', shortDescription: 'Price, sell, and count change at a garage sale.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1TAxHRAMzOBftCntBhGe0ECx', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 104, active: true },
    { name: 'Garden Plot Planner', slug: 'garden-plot-planner', description: 'Design a garden plot using area, spacing, budgets, and seasonal planning.', shortDescription: 'Design a garden with real measurements and budgets.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1TAxHSAMzOBftCnt0V8AwtI6', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 105, active: true },
    { name: 'Party Planner Math', slug: 'party-planner-math', description: 'Plan a party from guest list to budget — food quantities, costs, and timing.', shortDescription: 'Plan a party with real budgets and quantities.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1TAxHTAMzOBftCntwFqsXpkT', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 106, active: true },
    { name: 'Road Trip Calculator', slug: 'road-trip-calculator', description: 'Plan a road trip — calculate distances, fuel costs, timing, and budgets.', shortDescription: 'Calculate distances, fuel, and budgets for a road trip.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1TAxHUAMzOBftCntpRlzvjec', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 107, active: true },
    { name: 'Savings Goal Tracker', slug: 'savings-goal-tracker', description: 'Set a savings goal and track progress with real money maths.', shortDescription: 'Set and track a real savings goal.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1TAxHVAMzOBftCnt4wSLPh1g', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6–14', sortOrder: 108, active: true },
    { name: 'Sports Stats Lab', slug: 'sports-stats-lab', description: 'Collect, analyse, and visualise real sports data — averages, percentages, and charts.', shortDescription: 'Analyse real sports stats and create charts.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1TAxHWAMzOBftCntZADdCwoC', blobUrl: '', category: 'real-world-math', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 8–14', sortOrder: 109, active: true },

    // === START HERE & DEACTIVATED (sortOrder 90–92) ===
    { name: 'The Future-Ready Skills Map', slug: 'future-ready-skills-map', description: 'A complete roadmap of real-world skills every kid needs.', shortDescription: 'Future-ready skills roadmap.', priceCents: 999, compareAtPriceCents: null, stripePriceId: 'price_1T9JSZAMzOBftCntfh73EgWC', blobUrl: '', category: 'start-here', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 90, active: true },
    { name: 'My Small Business Project', slug: 'my-small-business-project', description: 'Full small business project from idea to launch.', shortDescription: 'Small business project.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSaAMzOBftCnt7K7w8xvT', blobUrl: '', category: 'entrepreneurship', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 9\u201314', sortOrder: 91, active: false },
    { name: 'Time Capsule', slug: 'time-capsule', description: 'Create a meaningful time capsule project.', shortDescription: 'Time capsule project.', priceCents: 499, compareAtPriceCents: null, stripePriceId: 'price_1T9JSbAMzOBftCntkCNr8dKm', blobUrl: '', category: 'creativity-anywhere', isBundle: false, bundleProductIds: null, activityCount: null, ageRange: 'Ages 6\u201314', sortOrder: 92, active: false },
  ];

  // Insert all products
  for (const product of productData) {
    await db.insert(products).values(product).onConflictDoNothing();
    console.log(`  \u2713 ${product.name}`);
  }

  console.log(`\nSeeded ${productData.length} products successfully!`);
  console.log('\nReminders:');
  console.log('  - Run `npm run stripe:sync` to create products in Stripe and get real price IDs');
  console.log('  - Update blobUrl values after uploading PDFs to Vercel Blob');
  console.log('  - Update bundleProductIds with actual product UUIDs after first seed');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
