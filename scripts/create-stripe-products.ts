import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is required. Set it in .env.local');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Product catalog — MUST match pricing in seed.ts and fallback-products.ts
// Tiers: Singles $5.99 · Nature/outdoor cards $7.99 · Seasonal $14.99 · Guide $9.99
const catalog = [
  // ─── Bundles ───
  { slug: 'seasonal-bundle', name: 'Full Seasonal Bundle (All 4 Seasons)', priceCents: 4499, description: 'All 4 seasonal packs — 80 outdoor activities for every time of year.' },
  { slug: 'creativity-mega-bundle', name: 'Creativity Mega Bundle', priceCents: 4499, description: 'All 10 creativity packs — game design, filmmaking, invention, and more.' },
  { slug: 'real-world-mega-bundle', name: 'Real-World Skills Mega Bundle', priceCents: 4499, description: 'All 10 real-world skills packs — budgeting, cooking, business, and more.' },
  { slug: 'ai-digital-bundle', name: 'AI & Digital Literacy Bundle', priceCents: 4499, description: 'All 10 AI & digital literacy packs.' },
  { slug: 'real-world-math-bundle', name: 'Real-World Math Mega Bundle', priceCents: 4499, description: 'All 10 Real-World Math guides — campout planning, garage sales, garden plots, road trips, and more.' },
  { slug: 'communication-writing-bundle', name: 'Communication & Writing Mega Bundle', priceCents: 4499, description: 'All 12 Communication & Writing guides in one download.' },
  { slug: 'entrepreneurship-bundle', name: 'Entrepreneurship Mega Bundle', priceCents: 4499, description: 'All 11 Entrepreneurship guides in one download.' },
  { slug: 'planning-problem-solving-bundle', name: 'Planning & Problem-Solving Mega Bundle', priceCents: 4499, description: 'All 13 Planning & Problem-Solving guides in one download.' },
  { slug: 'nature-art-bundle', name: 'Nature Art Bundle', priceCents: 1799, description: 'Land Art + Nature Crafts + Nature Journal.' },
  { slug: 'outdoor-toolkit-bundle', name: 'Outdoor Toolkit Bundle', priceCents: 2399, description: 'Walk Cards + Missions + STEM + Choice Boards.' },
  { slug: 'outdoor-mega-bundle', name: 'Outdoor & Nature Mega Bundle', priceCents: 4199, description: 'All 7 outdoor & nature packs — walk cards, missions, STEM challenges, choice boards, land art, nature crafts, and nature journal.' },
  // ─── Seasonal ($12.99) ───
  { slug: 'spring-outdoor-pack', name: 'Spring Outdoor Learning Pack', priceCents: 1499, description: '20 outdoor activities that use spring\'s energy to build real-world skills.' },
  { slug: 'summer-outdoor-pack', name: 'Summer Outdoor Learning Pack', priceCents: 1499, description: '20 summer activities for families who learn on the move.' },
  { slug: 'fall-outdoor-pack', name: 'Fall Outdoor Learning Pack', priceCents: 1499, description: '20 autumn activities for observation, science, and creative skills.' },
  { slug: 'winter-outdoor-pack', name: 'Winter Outdoor Learning Pack', priceCents: 1499, description: '20 winter activities for cosy indoor days and cold outdoor adventures.' },
  // ─── Nature cards ($6.99) ───
  { slug: 'nature-journal-walks', name: 'Nature Journal & Walk Cards', priceCents: 799, description: '25 nature walk prompts and journaling activities.' },
  { slug: 'nature-walk-task-cards', name: 'Nature Walk Task Cards', priceCents: 799, description: 'Structured observation prompts for any outdoor walk.' },
  { slug: 'nature-choice-boards', name: 'Nature Choice Boards', priceCents: 799, description: 'Pick-your-own-adventure style nature activity boards.' },
  { slug: 'outdoor-learning-missions', name: 'Outdoor Learning Missions', priceCents: 799, description: 'Mission-based outdoor challenges for curious explorers.' },
  { slug: 'outdoor-stem-challenges', name: 'Outdoor STEM Challenge Cards', priceCents: 799, description: '20 outdoor STEM challenges in the natural world.' },
  { slug: 'land-art-challenges', name: 'Land Art Challenge Cards', priceCents: 799, description: '15 land art challenges using natural materials.' },
  { slug: 'nature-crafts', name: 'Nature Crafts for Kids', priceCents: 799, description: 'Hands-on crafting projects using natural materials.' },
  // ─── Creativity singles ($4.99) ───
  { slug: 'board-game-studio', name: 'Board Game Studio', priceCents: 599, description: 'Design, build, and playtest an original board game.' },
  { slug: 'rube-goldberg-machine', name: 'Rube Goldberg Machine', priceCents: 599, description: 'Build an absurdly complicated machine to do something simple.' },
  { slug: 'survival-base', name: 'Build a Survival Base', priceCents: 599, description: 'Plan and build a survival base for an imaginary expedition.' },
  { slug: 'imaginary-world', name: 'Build an Imaginary World', priceCents: 599, description: 'Design an entire imaginary world with its own rules and geography.' },
  { slug: 'creature-habitat', name: 'Create a Creature & Habitat', priceCents: 599, description: 'Design a new creature and build its perfect habitat.' },
  { slug: 'theme-park', name: 'Design a Theme Park', priceCents: 599, description: 'Create a theme park or adventure course from scratch.' },
  { slug: 'mini-movie', name: 'Create a Mini Movie', priceCents: 599, description: 'Write, film, and edit a mini movie, stop-motion, or radio drama.' },
  { slug: 'invent-a-sport', name: 'Invent a New Sport', priceCents: 599, description: 'Create a new sport with original rules and scoring.' },
  { slug: 'kinetic-sculpture', name: 'Kinetic Sculpture', priceCents: 599, description: 'Build a moving sculpture or art installation.' },
  { slug: 'build-a-museum', name: 'Build a Museum', priceCents: 599, description: 'Create a museum or interactive exhibit from scratch.' },
  // ─── Real-World Skills singles ($4.99) ───
  { slug: 'budget-challenge', name: 'Budget Challenge', priceCents: 599, description: '12 real-money challenges that teach budgeting.' },
  { slug: 'community-impact', name: 'Community Impact Project', priceCents: 599, description: 'Plan and run a project that helps your local community.' },
  { slug: 'kitchen-math-challenge', name: 'Kitchen Math & Meal Planning Challenge', priceCents: 599, description: 'Advanced kitchen maths and meal planning activities.' },
  { slug: 'media-info-check', name: 'Media & Info Check', priceCents: 599, description: 'Spot misinformation, check sources, and think critically about media.' },
  { slug: 'micro-business', name: 'Micro-Business Challenge', priceCents: 599, description: 'Plan, launch, and run a simple real business.' },
  { slug: 'problem-solver', name: 'Problem-Solver Studio', priceCents: 599, description: 'Structured approach to solving real-world problems.' },
  { slug: 'smart-shopper', name: 'Smart Shopper Lab', priceCents: 599, description: 'Become a critical, informed consumer.' },
  { slug: 'time-energy-planner', name: 'Time & Energy Planner', priceCents: 599, description: 'Build time management and energy awareness skills.' },
  { slug: 'travel-day', name: 'Travel Day Itinerary Challenge', priceCents: 599, description: 'Plan a full travel day — routes, budgets, timing.' },
  { slug: 'write-like-a-pro', name: 'Write It Like a Pro', priceCents: 599, description: 'Real-world writing for real audiences.' },
  // ─── AI & Digital Literacy singles ($4.99) ───
  { slug: 'ai-basics', name: 'AI Basics: Myths, Facts & Smart Rules', priceCents: 599, description: 'Understand what AI is, what it can do, and how to use it wisely.' },
  { slug: 'algorithm-awareness', name: 'Algorithm Awareness', priceCents: 599, description: 'Why Am I Seeing This? Understand how algorithms shape what we see.' },
  { slug: 'bias-fairness-lab', name: 'Bias & Fairness Lab', priceCents: 599, description: 'Explore bias in AI systems and why fairness matters.' },
  { slug: 'build-ai-helper', name: 'Build Your Own AI Helper', priceCents: 599, description: 'Design and prototype an AI tool that solves a real problem.' },
  { slug: 'create-with-ai', name: 'Create with AI, Ethically', priceCents: 599, description: 'Use AI as a creative partner while understanding the ethics.' },
  { slug: 'deepfake-spotter', name: 'Deepfake & Manipulation Spotter', priceCents: 599, description: 'Spot manipulated media and understand deepfake technology.' },
  { slug: 'hallucination-detective', name: 'Hallucination Detective', priceCents: 599, description: 'Catch when AI gets things wrong — fact-checking AI outputs.' },
  { slug: 'healthy-tech-boundaries', name: 'Healthy Tech & AI Boundaries', priceCents: 599, description: 'Build healthy boundaries with technology and AI tools.' },
  { slug: 'privacy-footprint', name: 'Privacy & Digital Footprint Map', priceCents: 599, description: 'Understand and manage your digital footprint and privacy.' },
  { slug: 'prompt-like-a-coach', name: 'Prompt Like a Coach', priceCents: 599, description: 'Master the art of talking to AI effectively.' },
  // ─── Real-World Math singles ($4.99) ───
  { slug: 'backyard-campout-planner', name: 'Backyard Campout Planner', priceCents: 599, description: 'Plan a backyard campout — gear lists, meal prep, stargazing, and budgets.' },
  { slug: 'clothing-swap-thrift-math', name: 'Clothing Swap & Thrift Math', priceCents: 599, description: 'Thrift shopping and clothing swap maths — budgets, value, and smart spending.' },
  { slug: 'family-electricity-audit', name: 'Family Electricity Audit', priceCents: 599, description: 'Audit electricity use, calculate costs, and find real ways to save.' },
  { slug: 'farmers-market-challenge', name: 'Farmers Market Challenge', priceCents: 599, description: 'Budget and shop at a farmers market — prices, change, and smart choices.' },
  { slug: 'garage-sale-math', name: 'Garage Sale Math', priceCents: 599, description: 'Price, sell, and count change at a real garage sale.' },
  { slug: 'garden-plot-planner', name: 'Garden Plot Planner', priceCents: 599, description: 'Design a garden with real measurements, spacing, and budgets.' },
  { slug: 'party-planner-math', name: 'Party Planner Math', priceCents: 599, description: 'Plan a party with real budgets, quantities, and timing.' },
  { slug: 'road-trip-calculator', name: 'Road Trip Calculator', priceCents: 599, description: 'Calculate distances, fuel costs, and budgets for a real road trip.' },
  { slug: 'savings-goal-tracker', name: 'Savings Goal Tracker', priceCents: 599, description: 'Set and track a real savings goal — deposits, progress, and money maths.' },
  { slug: 'sports-stats-lab', name: 'Sports Stats Lab', priceCents: 599, description: 'Analyse real sports stats — averages, percentages, and data visualisation.' },
  // ─── Life Skills ───
  { slug: 'future-ready-skills-map', name: 'The Future-Ready Skills Map', priceCents: 999, description: 'A complete roadmap of real-world skills every kid needs.' },
  { slug: 'my-small-business-project', name: 'My Small Business Project', priceCents: 599, description: 'Full small business project from idea to launch.' },
  { slug: 'time-capsule', name: 'Time Capsule', priceCents: 599, description: 'Create a meaningful time capsule project.' },
  // ─── Communication & Writing singles ($4.99) ───
  { slug: 'adventure-story-map', name: 'Adventure Story Map', priceCents: 599, description: 'Create a visual story map and write your own adventure narrative.' },
  { slug: 'community-tour-guide', name: 'Community Tour Guide', priceCents: 599, description: 'Research and create a guided tour of your community.' },
  { slug: 'directions-challenge', name: 'Directions Challenge', priceCents: 599, description: 'Write clear step-by-step directions and test if others can follow them.' },
  { slug: 'family-debate-night', name: 'Family Debate Night', priceCents: 599, description: 'Prepare arguments, debate topics as a family, and practise persuasive speaking.' },
  { slug: 'family-recipe-book', name: 'Family Recipe Book', priceCents: 599, description: 'Document family recipes with clear instructions and family stories.' },
  { slug: 'market-stall-pitch', name: 'Market Stall Pitch', priceCents: 599, description: 'Create a persuasive pitch to sell a product or service.' },
  { slug: 'mini-magazine-creator', name: 'Mini Magazine Creator', priceCents: 599, description: 'Write and design a mini magazine with articles, headlines, and illustrations.' },
  { slug: 'my-review-column', name: 'My Review Column', priceCents: 599, description: 'Write reviews of books, movies, products, or experiences.' },
  { slug: 'neighbourhood-interview', name: 'Neighbourhood Interview Project', priceCents: 599, description: 'Interview community members and present their stories.' },
  { slug: 'trail-guide-creator', name: 'Trail Guide Creator', priceCents: 599, description: 'Create a written guide to a local trail or walking path.' },
  // ─── Entrepreneurship singles ($4.99) ───
  { slug: 'brand-builder', name: 'Brand Builder', priceCents: 599, description: 'Build a brand identity from scratch — name, logo, personality, and values.' },
  { slug: 'business-failure-lab', name: 'Business Failure Lab', priceCents: 599, description: 'Analyse real business failures, learn from mistakes, and build resilience.' },
  { slug: 'community-service-business', name: 'Community Service Business', priceCents: 599, description: 'Design and launch a service-based business with a social mission.' },
  { slug: 'customer-discovery', name: 'Customer Discovery Challenge', priceCents: 599, description: 'Conduct real customer interviews and refine a business idea.' },
  { slug: 'investor-pitch', name: 'Investor Pitch Portfolio', priceCents: 599, description: 'Create a compelling investor pitch with financial reasoning.' },
  { slug: 'marketing-campaign', name: 'Marketing Campaign Creator', priceCents: 599, description: 'Design and execute a marketing campaign to reach a real audience.' },
  { slug: 'pricing-experiment', name: 'Pricing Experiment', priceCents: 599, description: 'Test different pricing strategies and make data-informed decisions.' },
  { slug: 'product-design-lab', name: 'Product Design Lab', priceCents: 599, description: 'Use design thinking to create a product that solves a real problem.' },
  { slug: 'supply-chain-detective', name: 'Supply Chain Detective', priceCents: 599, description: 'Trace a product journey from source to consumer.' },
  { slug: 'shark-tank-pitch', name: 'The Shark Tank Pitch', priceCents: 599, description: 'Develop and deliver a high-stakes business pitch.' },
  // ─── Planning & Problem-Solving singles ($4.99) ───
  { slug: 'emergency-ready', name: 'Emergency Ready Challenge', priceCents: 599, description: 'Think clearly under pressure and build emergency preparedness.' },
  { slug: 'everyday-redesign', name: 'Everyday Redesign Challenge', priceCents: 599, description: 'Examine everyday objects and redesign them for better function.' },
  { slug: 'fix-it-detective', name: 'Fix-It Detective', priceCents: 599, description: 'Diagnose and fix real household problems using logic.' },
  { slug: 'neighbourhood-problem-spotter', name: 'Neighbourhood Problem Spotter', priceCents: 599, description: 'Spot real neighbourhood problems and brainstorm solutions.' },
  { slug: 'outdoor-survival-planner', name: 'Outdoor Survival Planner', priceCents: 599, description: 'Plan outdoor expeditions and build survival thinking skills.' },
  { slug: 'pack-like-a-pro', name: 'Pack Like a Pro', priceCents: 599, description: 'Master strategic packing — priorities, weight, space, and logistics.' },
  { slug: 'scavenger-hunt-designer', name: 'Scavenger Hunt Designer', priceCents: 599, description: 'Design, create, and test your own scavenger hunts.' },
  { slug: 'swap-day-challenge', name: 'The Swap Day Challenge', priceCents: 599, description: 'Swap roles for a day — empathy, planning, and responsibility.' },
  { slug: 'what-if-scenario-lab', name: 'The What-If Scenario Lab', priceCents: 599, description: 'Explore hypothetical scenarios, predict outcomes, and plan responses.' },
  { slug: 'decision-lab', name: 'What Would You Do? Decision Lab', priceCents: 599, description: 'Work through real decision scenarios and justify choices.' },
];

// Slugs where the image filename doesn't match {slug}.jpg
const imageOverrides: Record<string, string> = {
  'seasonal-bundle': 'four-seasons-bundle.jpg',
  'creativity-mega-bundle': 'mega-bundle-creativity.jpg',
  'real-world-mega-bundle': 'mega-bundle-real-world.jpg',
  'ai-digital-bundle': 'mega-bundle-ai-digital.jpg',
  'real-world-math-bundle': 'mega-bundle-real-world-math.jpg',
  'communication-writing-bundle': 'mega-bundle-communication-writing.jpg',
  'entrepreneurship-bundle': 'mega-bundle-entrepreneurship.jpg',
  'planning-problem-solving-bundle': 'mega-bundle-planning-problem-solving.jpg',
};

async function createStripeProducts() {
  const siteUrl = process.env.NEXT_PUBLIC_URL || 'https://anywherelearning.co';
  console.log(`Creating ${catalog.length} products in Stripe...\n`);
  console.log(`Using image base URL: ${siteUrl}/products/\n`);
  const mapping: Record<string, string> = {};

  for (const item of catalog) {
    // Check if product already exists (by metadata slug)
    const existing = await stripe.products.search({
      query: `metadata["slug"]:"${item.slug}"`,
    });

    let productId: string;

    const imageFile = imageOverrides[item.slug] || `${item.slug}.jpg`;
    const imageUrl = `${siteUrl}/products/${imageFile}`;

    if (existing.data.length > 0) {
      productId = existing.data[0].id;
      // Update image if missing or different
      const currentImage = existing.data[0].images?.[0];
      if (currentImage !== imageUrl) {
        await stripe.products.update(productId, { images: [imageUrl] });
        console.log(`  updated ${item.name} (${productId}) — set image`);
      } else {
        console.log(`  exists  ${item.name} (${productId})`);
      }
    } else {
      const product = await stripe.products.create({
        name: item.name,
        description: item.description,
        metadata: { slug: item.slug },
        images: [imageUrl],
      });
      productId = product.id;
      console.log(`  created ${item.name} (${productId})`);
    }

    // Check if price already exists for this product
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 1,
    });

    let priceId: string;

    if (prices.data.length > 0 && prices.data[0].unit_amount === item.priceCents) {
      priceId = prices.data[0].id;
    } else {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: item.priceCents,
        currency: 'usd',
      });
      priceId = price.id;
    }

    mapping[item.slug] = priceId;
  }

  console.log('\n--- Stripe Price ID Mapping ---\n');
  console.log(JSON.stringify(mapping, null, 2));

  console.log('\nNext steps:');
  console.log('1. Replace STRIPE_PRICE_* placeholders in scripts/seed.ts with the IDs above');
  console.log('2. Run `npm run db:seed` to seed your database');
}

createStripeProducts().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
