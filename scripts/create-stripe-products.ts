import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is required. Set it in .env.local');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Product catalog - MUST match pricing in seed.ts and fallback-products.ts
// Tiers: Singles $5.99 · Nature/outdoor cards $7.99 · Seasonal $14.99 · Guide $9.99
const catalog = [
  // ─── Seasonal ($12.99) ───
  { slug: 'spring-outdoor-pack', name: 'Spring Outdoor Learning Pack', priceCents: 1499, description: '20 outdoor activities that use spring\'s energy to build real-world skills.' },
  { slug: 'summer-outdoor-pack', name: 'Summer Outdoor Learning Pack', priceCents: 1499, description: '20 summer activities for families who learn on the move.' },
  { slug: 'fall-outdoor-pack', name: 'Fall Outdoor Learning Pack', priceCents: 1499, description: '20 autumn activities for observation, science, and creative skills.' },
  { slug: 'winter-outdoor-pack', name: 'Winter Outdoor Learning Pack', priceCents: 1499, description: '20 winter activities for cosy indoor days and cold outdoor adventures.' },
  // ─── Nature cards ($6.99) ───
  { slug: 'nature-journal-walks', name: 'My Nature Journal', priceCents: 799, description: 'Nature journal for kids ages 6-14: 36 seasonal prompts plus a full journal to fill in. Sketching, writing and outdoor observation.' },
  { slug: 'nature-walk-task-cards', name: 'Nature Walk Task Cards', priceCents: 799, description: '66 nature walk task cards for kids ages 6-14: turn any walk into focused outdoor learning. Low-prep, any trail, any season.' },
  { slug: 'nature-choice-boards', name: 'Nature Choice Boards', priceCents: 799, description: 'Outdoor choice boards for kids ages 6-14: 5 boards, 12 options each, for self-directed nature-based learning. Low-prep.' },
  { slug: 'outdoor-learning-missions', name: 'Outdoor Learning Missions', priceCents: 799, description: 'Outdoor scavenger hunt missions for kids ages 6-14: 10 hunts, 120 finds, real evidence. Any walk, no prep.' },
  { slug: 'outdoor-stem-challenges', name: 'Outdoor STEM Challenge Cards', priceCents: 799, description: '24 outdoor STEM challenges for kids ages 6-14: build, test, and engineer using what nature provides. Low-prep.' },
  { slug: 'outdoor-stem-challenges-volume-2', name: 'Outdoor STEM Challenge Cards Volume 2', priceCents: 799, description: '24 new outdoor STEM challenges for kids ages 6-14 in 5 themes: rope, launchers, water, wind, and levers. Low-prep.' },
  { slug: 'outdoor-movement-challenge-cards', name: 'Outdoor Movement Challenge Cards', priceCents: 799, description: 'Outdoor movement challenge cards for kids ages 6-14: 24 PR, streak, and adventure challenges. No equipment, low-prep.' },
  { slug: 'land-art-challenges', name: 'Land Art Challenge Cards', priceCents: 799, description: '48 land art challenges for kids ages 6-14: create beautiful, temporary art using natural materials. Any outdoor space.' },
  { slug: 'nature-crafts', name: 'Nature Crafts for Kids', priceCents: 799, description: 'Nature crafts for kids ages 6-14: hands-on outdoor craft projects using materials found in your backyard or on a trail.' },
  // ─── Creativity singles ($4.99) ───
  { slug: 'board-game-studio', name: 'Board Game Studio', priceCents: 599, description: 'Creativity project for kids ages 6-14: invent, build and playtest an original board game, then make Version 2.' },
  { slug: 'rube-goldberg-machine', name: 'Build a Rube Goldberg Machine', priceCents: 599, description: 'STEM engineering project for kids ages 6-14: build a chain reaction machine, then test and fix it one change at a time.' },
  { slug: 'survival-base', name: 'Build a Survival Base', priceCents: 599, description: 'Design project for kids ages 6-14: plan and build a survival base for an imaginary expedition, then survive a surprise.' },
  { slug: 'imaginary-world', name: 'Build an Imaginary World', priceCents: 599, description: 'Creativity project for kids ages 6-14: invent a whole imaginary world, map it, build a corner of it and tell its legends.' },
  { slug: 'creature-habitat', name: 'Create a Creature + Build Its Habitat', priceCents: 599, description: 'Science and art project for kids ages 6-14: invent a creature, give every feature a job and build the habitat it needs.' },
  { slug: 'theme-park', name: 'Create a Theme Park or Adventure Course', priceCents: 599, description: 'Design project for kids ages 6-14: design, build and open a theme park, from the map and the flow to the prices.' },
  { slug: 'mini-movie', name: 'Create a Mini Movie or Radio Drama', priceCents: 599, description: 'Creativity project for kids ages 6-14: storyboard, film, edit and premiere a mini movie, stop-motion, radio drama or live show.' },
  { slug: 'invent-a-sport', name: 'Invent a New Sport', priceCents: 599, description: 'Creativity project for kids ages 6-14: invent a new sport, from the field and the gear to fair scoring and a championship.' },
  { slug: 'kinetic-sculpture', name: 'Kinetic Sculpture or Art Installation', priceCents: 599, description: 'STEAM project for kids ages 6-14: build a kinetic sculpture that moves, using balance, gravity and a little physics.' },
  { slug: 'build-a-museum', name: 'Build a Museum or Interactive Exhibit', priceCents: 599, description: 'Creativity project for kids ages 6-14: build a museum at home, from finding an angle to labels and a grand opening.' },
  // ─── Real-World Skills singles ($4.99) ───
  { slug: 'budget-challenge', name: 'Real-Life Budget Challenge', priceCents: 599, description: 'Real-world maths (STEM) for kids ages 9-14: plan a real day out on a real budget, then run the money on the day.' },
  { slug: 'community-impact', name: 'Community Impact Project', priceCents: 599, description: 'Project for kids ages 6-14: ask people what would really help, do it yourself, then go back and keep it going.' },
  { slug: 'kitchen-math-challenge', name: 'Kitchen Math & Meal Planning Challenge', priceCents: 599, description: 'Real-world maths (STEM) for kids ages 6-14: plan real family meals, price them by the package, shop the list and cook it.' },
  { slug: 'media-info-check', name: 'Media & Info Check', priceCents: 599, description: 'Spot misinformation, check sources, and think critically about media.' },
  { slug: 'micro-business', name: 'Micro-Business Challenge', priceCents: 599, description: 'Entrepreneurship for kids ages 6-14: run a small business for real, keep the books and work out profit per hour.' },
  { slug: 'problem-solver', name: 'Problem-Solver Studio', priceCents: 599, description: 'Project for kids ages 6-14: find out why a problem keeps coming back, build a simple fix, test it and make Version 2.' },
  { slug: 'smart-shopper', name: 'Smart Shopper Lab', priceCents: 599, description: 'Real-world maths (STEM) for kids ages 8-14: compare two real options, work out cost per use, spot the marketing, then wait before buying.' },
  { slug: 'time-energy-planner', name: 'Time & Energy Planner', priceCents: 599, description: 'Project for kids ages 6-14: track your own energy for a day, match jobs to the right time and find what brings you back.' },
  { slug: 'travel-day', name: 'Travel Day Itinerary Challenge', priceCents: 599, description: 'Planning activity for kids ages 6-14: plan a real day out with must-dos, a timeline, a budget and a Plan B.' },
  { slug: 'write-like-a-pro', name: 'Write It Like a Pro', priceCents: 599, description: 'Writing for kids ages 6-14: pick a style, write for a real audience, edit, and revise. Seven writing styles, one finished piece.' },
  // ─── AI & Digital Literacy singles ($4.99) ───
  { slug: 'ai-basics', name: 'AI Basics: Myths, Facts & Smart Rules', priceCents: 599, description: 'Understand what AI is, what it can do, and how to use it wisely.' },
  { slug: 'algorithm-awareness', name: 'Algorithm Awareness', priceCents: 599, description: 'Why Am I Seeing This? Understand how algorithms shape what we see.' },
  { slug: 'bias-fairness-lab', name: 'Bias & Fairness Lab', priceCents: 599, description: 'Explore bias in AI systems and why fairness matters.' },
  { slug: 'build-ai-helper', name: 'Build Your Own AI Helper', priceCents: 599, description: 'Design and prototype an AI tool that solves a real problem.' },
  { slug: 'create-with-ai', name: 'Create with AI, Ethically', priceCents: 599, description: 'Use AI as a creative partner while understanding the ethics.' },
  { slug: 'deepfake-spotter', name: 'Deepfake & Manipulation Spotter', priceCents: 599, description: 'Spot manipulated media and understand deepfake technology.' },
  { slug: 'hallucination-detective', name: 'Hallucination Detective', priceCents: 599, description: 'Catch when AI gets things wrong. Fact-check AI outputs.' },
  { slug: 'healthy-tech-boundaries', name: 'Healthy Tech & AI Boundaries', priceCents: 599, description: 'Build healthy boundaries with technology and AI tools.' },
  { slug: 'privacy-footprint', name: 'Privacy & Digital Footprint Map', priceCents: 599, description: 'Understand and manage your digital footprint and privacy.' },
  { slug: 'prompt-like-a-coach', name: 'Prompt Like a Coach', priceCents: 599, description: 'Master the art of talking to AI effectively.' },
  // ─── Real-World Math singles ($4.99) ───
  { slug: 'backyard-campout-planner', name: 'Backyard Campout Planner', priceCents: 599, description: 'Real-world math for kids ages 6-14: measure the site, budget the gear, plan the food and the schedule, then camp out.' },
  { slug: 'clothing-swap-thrift-math', name: 'Clothing Swap & Thrift Math', priceCents: 599, description: 'Real-world math for kids ages 6-14: cost per wear, pricing, a swap or thrift trip, and the percentage saved.' },
  { slug: 'family-electricity-audit', name: 'Family Electricity Audit', priceCents: 599, description: 'STEM project for kids ages 8-14: audit electricity use, calculate kilowatt-hours, and find real ways to save. Math and science combined.' },
  { slug: 'farmers-market-challenge', name: 'Farmers Market Challenge', priceCents: 599, description: 'Real-world math for kids ages 6-14: scout a farmers market, compare unit prices, shop on a budget and cook what\'s in season.' },
  { slug: 'garage-sale-math', name: 'Garage Sale Math', priceCents: 599, description: 'Real-world math for kids ages 6-14: price, haggle, make change and work out the real profit at a garage sale.' },
  { slug: 'garden-plot-planner', name: 'Garden Plot Planner', priceCents: 599, description: 'STEM math activity for kids ages 6-14: measure a garden, work out plant spacing and soil, budget the seeds, then plant and track it.' },
  { slug: 'party-planner-math', name: 'Party Planner Math', priceCents: 599, description: 'Real-world math for kids ages 6-14: plan and host a real party on $5 per guest, from food per guest to the party-day timeline.' },
  { slug: 'road-trip-calculator', name: 'Road Trip Calculator', priceCents: 599, description: 'Real-world math for kids ages 8-14: plan a real road trip, from driving time and gas to the full budget, then navigate it.' },
  { slug: 'savings-goal-tracker', name: 'Savings Goal Tracker', priceCents: 599, description: 'Real-world math for kids ages 6-14: save for a real goal, work out the timeline, earn more and track the percent saved.' },
  { slug: 'sports-stats-lab', name: 'Sports Stats Lab', priceCents: 599, description: 'STEM math activity for kids ages 6-14: track real sports stats, compare fairly with percentages and predict the next game.' },
  // ─── Life Skills ───
  { slug: 'future-ready-skills-map', name: 'The Future-Ready Skills Map', priceCents: 999, description: 'A 44-page parent guide to the 12 skill areas that matter most for kids ages 0-16+, organised into three age phases (Play, Build, Apply).' },
  // ─── Communication & Writing singles ($4.99) ───
  { slug: 'adventure-story-map', name: 'Adventure Story Map', priceCents: 599, description: 'Creative writing for kids ages 6-14: write an adventure set in a place they know, with a map a reader can follow. Low-prep, open-ended.' },
  { slug: 'community-tour-guide', name: 'Community Tour Guide', priceCents: 599, description: 'Writing activity for kids ages 6-14: create a guided tour of your community. Builds voice and local storytelling skills.' },
  { slug: 'directions-challenge', name: 'Directions Challenge', priceCents: 599, description: 'Writing activity for kids ages 6-14: write and test clear step-by-step directions. Low-prep clarity practice.' },
  { slug: 'family-debate-night', name: 'Family Debate Night', priceCents: 599, description: 'Communication activity for kids ages 6-14: family debate night builds persuasion, listening, and respectful disagreement.' },
  { slug: 'family-recipe-book', name: 'Family Recipe Book', priceCents: 599, description: 'Writing project for kids ages 6-14: create a family recipe book with stories and instructions. Voice-building at home.' },
  { slug: 'market-stall-pitch', name: 'Market Stall Pitch', priceCents: 599, description: 'Communication activity for kids ages 6-14: practise persuasive selling and pitching. Real-world voice training.' },
  { slug: 'mini-magazine-creator', name: 'Mini Magazine Creator', priceCents: 599, description: 'Writing project for kids ages 6-14: write and design a mini magazine. Voice, layout, and creative confidence in one.' },
  { slug: 'my-review-column', name: 'My Review Column', priceCents: 599, description: 'Writing activity for kids ages 6-14: write reviews and develop opinion writing skills. Voice-first, opinion-first.' },
  { slug: 'neighbourhood-interview', name: 'Neighbourhood Interview Project', priceCents: 599, description: 'Communication project for kids ages 6-14: interview community members and share their stories. Builds curiosity and confidence.' },
  { slug: 'trail-guide-creator', name: 'Trail Guide Creator', priceCents: 599, description: 'Outdoor writing for kids ages 6-14: write a guide to a local trail or walking path. Nature and writing in one project.' },
  // ─── Entrepreneurship singles ($4.99) ───
  { slug: 'brand-builder', name: 'Brand Builder', priceCents: 599, description: 'Build a brand identity from scratch: name, logo, personality, and values.' },
  { slug: 'business-failure-lab', name: 'Business Failure Lab', priceCents: 599, description: 'Analyse real business failures, learn from mistakes, and build resilience.' },
  { slug: 'community-service-business', name: 'Community Service Business', priceCents: 599, description: 'Design and launch a service-based business with a social mission.' },
  { slug: 'customer-discovery', name: 'Customer Discovery Challenge', priceCents: 599, description: 'Conduct real customer interviews and refine a business idea.' },
  { slug: 'investor-pitch', name: 'Investor Pitch Portfolio', priceCents: 599, description: 'Create a compelling investor pitch with financial reasoning.' },
  { slug: 'marketing-campaign', name: 'Marketing Campaign Creator', priceCents: 599, description: 'Entrepreneurship for kids ages 6-14: name it, brand it, write one clear message and count which sign really worked.' },
  { slug: 'pricing-experiment', name: 'Pricing Experiment', priceCents: 599, description: 'Entrepreneurship and math for kids ages 6-14: test two prices with real buyers and find the one that keeps the most money.' },
  { slug: 'product-design-lab', name: 'Product Design Lab', priceCents: 599, description: 'Use design thinking to create a product that solves a real problem.' },
  { slug: 'supply-chain-detective', name: 'Supply Chain Detective', priceCents: 599, description: 'Entrepreneurship and geography for kids ages 6-14: trace a real product from your cupboard back to where it started.' },
  { slug: 'shark-tank-pitch', name: 'Shark Tank Style Pitch', priceCents: 599, description: 'Business pitch for kids ages 6-14: build the numbers, pitch to family sharks and sign a real deal you pay back.' },
  // ─── Planning & Problem-Solving singles ($4.99) ───
  { slug: 'emergency-ready', name: 'Emergency Ready Challenge', priceCents: 599, description: 'Life skills for kids ages 6-14: build a real family emergency plan, run the fire drill and pack a three-day kit.' },
  { slug: 'everyday-redesign', name: 'Everyday Redesign Challenge', priceCents: 599, description: 'Examine everyday objects and redesign them for better function.' },
  { slug: 'fix-it-detective', name: 'Fix-It Detective', priceCents: 599, description: 'Problem-solving for kids ages 6-14: diagnose and fix real things around the house, safely and step by step.' },
  { slug: 'neighbourhood-problem-spotter', name: 'Neighbourhood Problem Spotter', priceCents: 599, description: 'Civic problem-solving for kids ages 6-14: spot a real problem nearby, find the cause and pitch a simple fix.' },
  { slug: 'outdoor-survival-planner', name: 'Outdoor Survival Planner', priceCents: 599, description: 'Outdoor safety activity for kids ages 6-14: learn survival priorities, practise real skills and plan a real outing.' },
  { slug: 'pack-like-a-pro', name: 'Pack Like a Pro', priceCents: 599, description: 'Life skill for kids ages 6-14: pack their own bag for a real trip, make real trade-offs and build a reusable list.' },
  { slug: 'scavenger-hunt-designer', name: 'Scavenger Hunt Designer', priceCents: 599, description: 'Planning activity for kids ages 6-14: design and run a real scavenger hunt with original clues, a route and rules.' },
  { slug: 'swap-day-challenge', name: 'The Swap Day Challenge', priceCents: 599, description: 'Life skills activity for kids ages 6-14: run the house for a day, see the invisible work and keep one job for good.' },
  { slug: 'what-if-scenario-lab', name: 'The What-If Scenario Lab', priceCents: 599, description: 'Critical thinking activity for kids ages 6-14: follow a big what-if all the way through, then try a slice of it for real.' },
  { slug: 'decision-lab', name: 'What Would You Do? Decision Lab', priceCents: 599, description: 'Life skill for kids ages 6-14: think through tough choices, handle pressure and make a real decision of their own.' },
  // ─── Worldschooling singles ($5.99) ───
  { slug: 'cultural-celebration-journal', name: 'Cultural Celebration Journal', priceCents: 599, description: 'Document festivals, holidays, and cultural celebrations through guided observation.' },
  { slug: 'currency-market-math', name: 'Currency & Market Math', priceCents: 599, description: 'Convert currencies, compare prices, and practise mental maths in real markets.' },
  { slug: 'everyday-life-comparison', name: 'Everyday Life Comparison', priceCents: 599, description: 'Compare daily life across cultures: transport, food, school, and play.' },
  { slug: 'local-language-mission', name: 'Local Language Mission', priceCents: 599, description: 'Build confidence in a new language through real-world missions.' },
  { slug: 'nature-geography-field-study', name: 'Nature & Geography Field Study', priceCents: 599, description: 'Observe local plants, wildlife, climate, and geography while travelling.' },
  { slug: 'people-stories-interview', name: 'People & Stories Interview Project', priceCents: 599, description: 'Interview locals and travellers, listen carefully, and record their stories.' },
  { slug: 'street-explorer-map-maker', name: 'Street Explorer Map Maker', priceCents: 599, description: 'Walk new neighbourhoods and create hand-drawn maps with landmarks.' },
  { slug: 'transport-navigation-challenge', name: 'Transport & Navigation Challenge', priceCents: 599, description: 'Read maps, decode local transport, and plan real routes in unfamiliar places.' },
  { slug: 'travel-reflection-postcards', name: 'Travel Reflection & Postcards', priceCents: 599, description: 'Capture travel memories through hand-made postcards and reflective writing.' },
  { slug: 'world-food-detective', name: 'World Food Detective', priceCents: 599, description: 'Investigate local cuisine: identify ingredients, trace origins, and document tastes.' },
  // ─── Emotional & Social Skills singles ($5.99) ───
  { slug: 'calm-down-toolkit', name: 'The Calm-Down Toolkit', priceCents: 599, description: 'Build a real reset kit and a when-I\'m-flooded plan from household stuff.' },
  { slug: 'big-feelings-lab', name: 'The Big Feelings Lab', priceCents: 599, description: 'Name a feeling, map it in the body, rate its size, watch it pass.' },
  { slug: 'boredom-toolkit', name: 'The Boredom Toolkit', priceCents: 599, description: 'Build the skill of handling boredom without a screen. Self-direction, creativity, independence.' },
  { slug: 'disappointment-lab', name: 'The Disappointment Lab', priceCents: 599, description: 'Sit through small planned letdowns and track bounce-back time.' },
  { slug: 'frustration-tolerance-cards', name: 'Frustration Tolerance Challenge Cards', priceCents: 799, description: '20 frustration challenges, each with a coping move to practice mid-feeling.' },
  { slug: 'comeback-journal', name: 'The Comeback Journal', priceCents: 599, description: 'Take a real flop, pull out the lesson, pick the next move.' },
  { slug: 'hard-thing-challenge', name: 'The Hard Thing Challenge', priceCents: 599, description: 'Pick one hard thing, commit, push through the messy middle, finish.' },
  { slug: 'repair-conversation', name: 'The Repair Conversation', priceCents: 599, description: 'Own a mistake, skip excuses, ask what would help, follow through.' },
  { slug: 'kindness-missions', name: 'The Kindness Missions', priceCents: 599, description: 'A deck of real-world kindness challenges that take effort and noticing.' },
  { slug: 'reading-the-room', name: 'Reading the Room', priceCents: 599, description: 'Scan a room, read body language, infer the backstory.' },
  { slug: 'conflict-fix', name: 'The Conflict Fix', priceCents: 599, description: 'A real script for working through fights with siblings or friends.' },
  { slug: 'solo-mission', name: 'The Solo Mission', priceCents: 599, description: 'Age-right do-it-without-me challenges that build real independence.' },
  { slug: 'worry-sorter', name: 'The Worry Sorter', priceCents: 599, description: 'Sort worries into can-control vs cannot-control, plan the rest.' },
];

// Slugs where the image filename doesn't match {slug}.jpg
const imageOverrides: Record<string, string> = {};

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
        console.log(`  updated ${item.name} (${productId}) - set image`);
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
