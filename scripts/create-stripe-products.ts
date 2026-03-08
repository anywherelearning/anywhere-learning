import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is required. Set it in .env.local');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Product catalog — same slugs as fallback-products.ts, only the fields Stripe needs
const catalog = [
  // ─── Bundles ───
  { slug: 'master-bundle', name: 'Master Bundle (Everything)', priceCents: 8999, description: 'Every activity pack we make — all categories, all ages, one download.' },
  { slug: 'seasonal-bundle', name: 'Full Seasonal Bundle (All 4 Seasons)', priceCents: 4999, description: 'All 4 seasonal packs — 80 outdoor activities for every time of year.' },
  { slug: 'creativity-mega-bundle', name: 'Creativity Mega Bundle', priceCents: 2999, description: 'All 11 creativity packs — game design, filmmaking, invention, and more.' },
  { slug: 'real-world-mega-bundle', name: 'Real-World Skills Mega Bundle', priceCents: 2999, description: 'All 11 real-world skills packs — budgeting, cooking, business, and more.' },
  { slug: 'ai-digital-bundle', name: 'AI & Digital Literacy Bundle', priceCents: 2999, description: 'All 10 AI & digital literacy packs.' },
  { slug: 'nature-art-bundle', name: 'Nature Art Bundle', priceCents: 2999, description: 'Land Art + Nature Crafts + Nature Journal.' },
  { slug: 'outdoor-toolkit-bundle', name: 'Outdoor Toolkit Bundle', priceCents: 2999, description: 'Walk Cards + Missions + STEM + Choice Boards.' },
  // ─── Seasonal ───
  { slug: 'spring-outdoor-pack', name: 'Spring Outdoor Learning Pack', priceCents: 1499, description: '20 outdoor activities that use spring\'s energy to build real-world skills.' },
  { slug: 'summer-outdoor-pack', name: 'Summer Outdoor Learning Pack', priceCents: 499, description: '20 summer activities for families who learn on the move.' },
  { slug: 'fall-outdoor-pack', name: 'Fall Outdoor Learning Pack', priceCents: 499, description: '20 autumn activities for observation, science, and creative skills.' },
  { slug: 'winter-outdoor-pack', name: 'Winter Outdoor Learning Pack', priceCents: 499, description: '20 winter activities for cosy indoor days and cold outdoor adventures.' },
  // ─── Nature ───
  { slug: 'nature-journal-walks', name: 'Nature Journal & Walk Cards', priceCents: 999, description: '25 nature walk prompts and journaling activities.' },
  { slug: 'nature-walk-task-cards', name: 'Nature Walk Task Cards', priceCents: 499, description: 'Structured observation prompts for any outdoor walk.' },
  { slug: 'nature-choice-boards', name: 'Nature Choice Boards', priceCents: 499, description: 'Pick-your-own-adventure style nature activity boards.' },
  { slug: 'outdoor-learning-missions', name: 'Outdoor Learning Missions', priceCents: 499, description: 'Mission-based outdoor challenges for curious explorers.' },
  { slug: 'outdoor-stem-challenges', name: 'Outdoor STEM Challenge Cards', priceCents: 499, description: '20 outdoor STEM challenges in the natural world.' },
  { slug: 'land-art-challenges', name: 'Land Art Challenge Cards', priceCents: 499, description: '15 land art challenges using natural materials.' },
  { slug: 'nature-crafts', name: 'Nature Crafts for Kids', priceCents: 499, description: 'Hands-on crafting projects using natural materials.' },
  // ─── Creativity ───
  { slug: 'creative-thinking-pack', name: 'Creative Thinking Pack', priceCents: 999, description: '20 open-ended challenges that build creative problem-solving.' },
  { slug: 'board-game-studio', name: 'Board Game Studio', priceCents: 499, description: 'Design, build, and playtest an original board game.' },
  { slug: 'rube-goldberg-machine', name: 'Rube Goldberg Machine', priceCents: 499, description: 'Build an absurdly complicated machine to do something simple.' },
  { slug: 'survival-base', name: 'Build a Survival Base', priceCents: 499, description: 'Plan and build a survival base for an imaginary expedition.' },
  { slug: 'imaginary-world', name: 'Build an Imaginary World', priceCents: 499, description: 'Design an entire imaginary world with its own rules and geography.' },
  { slug: 'creature-habitat', name: 'Create a Creature & Habitat', priceCents: 499, description: 'Design a new creature and build its perfect habitat.' },
  { slug: 'theme-park', name: 'Design a Theme Park', priceCents: 499, description: 'Create a theme park or adventure course from scratch.' },
  { slug: 'mini-movie', name: 'Create a Mini Movie', priceCents: 499, description: 'Write, film, and edit a mini movie, stop-motion, or radio drama.' },
  { slug: 'invent-a-sport', name: 'Invent a New Sport', priceCents: 499, description: 'Create a new sport with original rules and scoring.' },
  { slug: 'kinetic-sculpture', name: 'Kinetic Sculpture', priceCents: 499, description: 'Build a moving sculpture or art installation.' },
  { slug: 'build-a-museum', name: 'Build a Museum', priceCents: 499, description: 'Create a museum or interactive exhibit from scratch.' },
  // ─── Real-World Skills ───
  { slug: 'kitchen-maths-cooking', name: 'Kitchen Maths & Cooking', priceCents: 999, description: '15 cooking activities that teach real maths and science.' },
  { slug: 'budget-challenge', name: 'Budget Challenge', priceCents: 499, description: '12 real-money challenges that teach budgeting.' },
  { slug: 'community-impact', name: 'Community Impact Project', priceCents: 499, description: 'Plan and run a project that helps your local community.' },
  { slug: 'kitchen-math-challenge', name: 'Kitchen Math & Meal Planning Challenge', priceCents: 499, description: 'Advanced kitchen maths and meal planning activities.' },
  { slug: 'media-info-check', name: 'Media & Info Check', priceCents: 499, description: 'Spot misinformation, check sources, and think critically about media.' },
  { slug: 'micro-business', name: 'Micro-Business Challenge', priceCents: 499, description: 'Plan, launch, and run a simple real business.' },
  { slug: 'problem-solver', name: 'Problem-Solver Studio', priceCents: 499, description: 'Structured approach to solving real-world problems.' },
  { slug: 'smart-shopper', name: 'Smart Shopper Lab', priceCents: 499, description: 'Become a critical, informed consumer.' },
  { slug: 'time-energy-planner', name: 'Time & Energy Planner', priceCents: 499, description: 'Build time management and energy awareness skills.' },
  { slug: 'travel-day', name: 'Travel Day Itinerary Challenge', priceCents: 499, description: 'Plan a full travel day — routes, budgets, timing.' },
  { slug: 'write-like-a-pro', name: 'Write It Like a Pro', priceCents: 499, description: 'Real-world writing for real audiences.' },
  // ─── AI & Digital Literacy ───
  { slug: 'ai-basics', name: 'AI Basics: Myths, Facts & Smart Rules', priceCents: 499, description: 'Understand what AI is, what it can do, and how to use it wisely.' },
  { slug: 'algorithm-awareness', name: 'Algorithm Awareness', priceCents: 499, description: 'Why Am I Seeing This? Understand how algorithms shape what we see.' },
  { slug: 'bias-fairness-lab', name: 'Bias & Fairness Lab', priceCents: 499, description: 'Explore bias in AI systems and why fairness matters.' },
  { slug: 'build-ai-helper', name: 'Build Your Own AI Helper', priceCents: 499, description: 'Design and prototype an AI tool that solves a real problem.' },
  { slug: 'create-with-ai', name: 'Create with AI, Ethically', priceCents: 499, description: 'Use AI as a creative partner while understanding the ethics.' },
  { slug: 'deepfake-spotter', name: 'Deepfake & Manipulation Spotter', priceCents: 499, description: 'Spot manipulated media and understand deepfake technology.' },
  { slug: 'hallucination-detective', name: 'Hallucination Detective', priceCents: 499, description: 'Catch when AI gets things wrong — fact-checking AI outputs.' },
  { slug: 'healthy-tech-boundaries', name: 'Healthy Tech & AI Boundaries', priceCents: 499, description: 'Build healthy boundaries with technology and AI tools.' },
  { slug: 'privacy-footprint', name: 'Privacy & Digital Footprint Map', priceCents: 499, description: 'Understand and manage your digital footprint and privacy.' },
  { slug: 'prompt-like-a-coach', name: 'Prompt Like a Coach', priceCents: 499, description: 'Master the art of talking to AI effectively.' },
  // ─── Life Skills ───
  { slug: 'future-ready-skills-map', name: 'The Future-Ready Skills Map', priceCents: 999, description: 'A complete roadmap of real-world skills every kid needs.' },
  { slug: 'my-small-business-project', name: 'My Small Business Project', priceCents: 499, description: 'Full small business project from idea to launch.' },
  { slug: 'time-capsule', name: 'Time Capsule', priceCents: 499, description: 'Create a meaningful time capsule project.' },
];

async function createStripeProducts() {
  console.log(`Creating ${catalog.length} products in Stripe...\n`);
  const mapping: Record<string, string> = {};

  for (const item of catalog) {
    // Check if product already exists (by metadata slug)
    const existing = await stripe.products.search({
      query: `metadata["slug"]:"${item.slug}"`,
    });

    let productId: string;

    if (existing.data.length > 0) {
      productId = existing.data[0].id;
      console.log(`  exists  ${item.name} (${productId})`);
    } else {
      const product = await stripe.products.create({
        name: item.name,
        description: item.description,
        metadata: { slug: item.slug },
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
