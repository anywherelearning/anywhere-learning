import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const FILE = join(__dirname, '..', 'lib', 'fallback-products.ts');

// Option A voice: skill-led, ~150 chars, no ages, no times, no "homeschool" framing.
// Pattern: action → specific thing kids do → skill-becomes-tangible payoff.
const NEW: Record<string, string> = {
  // OUTDOOR-LEARNING
  'spring-outdoor-pack':
    "20 spring activities — planting, bird-watching, fresh-air observation. Outside becomes the lesson plan, no prep needed.",
  'summer-outdoor-pack':
    "20 summer activities — water experiments, outdoor cooking, sun-powered investigation. Backyards and parks turn into real classrooms.",
  'fall-outdoor-pack':
    "20 fall activities — leaf science, harvest math, seasonal observation. Learning that follows what's actually changing outside.",
  'winter-outdoor-pack':
    "20 cold-weather activities — ice experiments, star-gazing, cosy indoor curiosity. The season is the lesson plan.",
  'nature-journal-walks':
    "Guided sketching, writing, and observation prompts. Kids slow down, notice more, and build a quiet habit of paying attention.",
  'nature-walk-task-cards':
    "Cards turn any walk into focused investigation. Kids notice patterns, ask better questions, and leave having learned something real.",
  'nature-choice-boards':
    "Nine self-directed options per board. Kids pick their adventure, parent steps back, and outside time becomes their own.",
  'outdoor-learning-missions':
    "Cards for building, exploring, observing, problem-solving in nature. Each mission turns outside time into something earned.",
  'outdoor-stem-challenges':
    "Kids build, test, and engineer with sticks, stones, and what they find. STEM with no kit, no batteries, just real materials.",
  'land-art-challenges':
    "15 prompts for making beautiful, temporary art from rocks, leaves, sand. Creativity, restraint, and a deep look at what's already there.",
  'nature-crafts':
    "Hands-on crafts using backyard finds. Kids make something real with their hands from what nature gave them.",

  // CREATIVITY-MAKER
  'board-game-studio':
    "Kids design, build, and playtest an original board game from scratch. Systems thinking, iteration, and the rare joy of a rule that works.",
  'rube-goldberg-machine':
    "Build an absurdly complicated machine to do something simple. Cause-and-effect engineering with cardboard, marbles, and a lot of laughs.",
  'survival-base':
    "Design a base camp for an imaginary expedition — geography, resources, layout. Where would you sleep, eat, and store water in a real place?",
  'imaginary-world':
    "Build an entire imaginary world — geography, creatures, rules, stories. Worldbuilding teaches kids how systems hang together.",
  'creature-habitat':
    "Invent a creature, then build the habitat it would actually need. Biology, art, and engineering wired into one project.",
  'theme-park':
    "Kids design a theme park from scratch — ride layouts, scale models, ticket prices. Systems design hiding inside a kid's dream project.",
  'mini-movie':
    "Write a script, shoot it, edit it, premiere it. Stop-motion or radio drama. Storytelling becomes a full production they own.",
  'invent-a-sport':
    "Kids design the rules, build the equipment, and playtest with family. Iteration in real time, no two test runs alike.",
  'kinetic-sculpture':
    "Build art that moves. Levers, balance, motion. Physics, mechanics, and design thinking in one tangible build.",
  'build-a-museum':
    "Pick a topic, research it, curate the exhibit, host opening night. Kids become the expert on something they chose.",

  // REAL-WORLD-MATH
  'budget-challenge':
    "Kids pick a real family weekend, set a budget, then plan dinner, an outing, and a small splurge inside the cap. Budgeting becomes a tool, not a chore.",
  'kitchen-math-challenge':
    "Kids plan a week of meals, calculate the grocery cost, and shop to a real budget. Fractions, multiplication, and food on the table.",
  'smart-shopper':
    "Kids compare prices, read labels, and make real purchasing calls at the store. Unit pricing and consumer literacy in their own hands.",
  'backyard-campout-planner':
    "Plan a backyard campout — gear list, meals on a budget, star map. Real math hiding inside a real evening together.",
  'clothing-swap-thrift-math':
    "Thrift and swap with a budget. Kids weigh value, calculate savings, and learn what a fair trade looks like.",
  'family-electricity-audit':
    "Audit what's drawing power in the house, calculate the cost, and find real savings. Math that immediately changes how the family lives.",
  'farmers-market-challenge':
    "Budget, shop, count change at a real market. Kids talk to vendors, weigh produce, and come home with the meal they planned.",
  'garage-sale-math':
    "Price items, count change, talk to customers, track profit. A weekend job that teaches arithmetic and confidence at once.",
  'garden-plot-planner':
    "Design a garden with real measurements, spacing, and budgets. Geometry, planning, and something living to point at.",
  'party-planner-math':
    "Plan a party with a budget — invites, food, decorations, timing. Multiplication, division, and one well-run afternoon.",
  'road-trip-calculator':
    "Calculate distances, fuel costs, drive times, food stops. Kids plan the route and own the budget for a real trip.",
  'savings-goal-tracker':
    "Kids pick something they want, set a goal, track deposits, watch it grow. Delayed gratification taught with real numbers.",
  'sports-stats-lab':
    "Pull real stats from a favorite sport — averages, percentages, charts. Data analysis dressed up as fandom.",

  // PLANNING-PROBLEM-SOLVING
  'community-impact':
    "Kids spot a real community problem and run a project to address it. Planning, outreach, follow-through, and the confidence of finishing.",
  'problem-solver':
    "Identify a problem, brainstorm, prototype, test, iterate. Design thinking in five steps kids actually walk through.",
  'time-energy-planner':
    "Kids map their week — what drains them, what energizes them, what fits where. Self-awareness as a planning tool, not a lecture.",
  'travel-day':
    "Kids plan a real travel day from wake-up to landing. Transit, food, breaks, contingencies. The art of a smooth itinerary.",
  'emergency-ready':
    "What goes in the bag, who do you call, where do you meet. Calm, clear thinking under pressure, practiced before it's needed.",
  'everyday-redesign':
    "Kids pick something annoying — a drawer, a chore, a routine — and redesign it. Design thinking applied to the kitchen junk drawer.",
  'fix-it-detective':
    "A real household problem. Investigate, diagnose, test fixes, document what worked. Resourcefulness practiced on real stuff.",
  'neighbourhood-problem-spotter':
    "Walk the block, find what's broken or missing, propose a fix. Civic observation that turns into a real letter or pitch.",
  'outdoor-survival-planner':
    "Plan a real expedition — route, gear, food, water, contingencies. Logistics, risk thinking, and respect for the outdoors.",
  'pack-like-a-pro':
    "A trip, a packing list, a weight limit. Kids prioritize, swap, and learn what they actually need versus what they think they do.",
  'scavenger-hunt-designer':
    "Kids design their own hunt — clues, route, prizes. Planning, writing, and the test of running it for someone else.",
  'swap-day-challenge':
    "Trade roles with a sibling, parent, or pet for a day. Empathy delivered through experience, not a lecture.",
  'what-if-scenario-lab':
    "Real scenarios with no easy answer. Kids weigh tradeoffs, defend a choice, hear another view. Critical thinking, not multiple choice.",
  'decision-lab':
    "Everyday decisions made deliberately — what to wear, what to spend, what to say. Confidence built one small call at a time.",

  // AI-LITERACY
  'media-info-check':
    "Kids learn to check a source, spot bias, and verify a claim before trusting it. Habits that hold up against any feed, any year.",
  'ai-basics':
    "What AI actually is, what it can't do, and how to use it without losing your judgment. Plain language, no panic, no hype.",
  'algorithm-awareness':
    "Why a feed shows you what it shows you. Kids learn to see the algorithm, name it, and decide whether to follow it.",
  'bias-fairness-lab':
    "AI inherits human bias. Kids test it, find the gaps, and ask the harder design questions. No coding needed.",
  'build-ai-helper':
    "Design an AI helper from concept to ethics — what it does, who it serves, what it should refuse. Creative thinking about a tool kids will use forever.",
  'create-with-ai':
    "Use AI for creative projects with credit, consent, and clarity. Where AI fits, where it doesn't, and how to make work you can sign your name to.",
  'deepfake-spotter':
    "Kids practice spotting manipulated images, voices, and videos. The single most useful media literacy skill of the decade.",
  'hallucination-detective':
    "AI gets things confidently wrong. Kids learn to catch it, verify facts, and stop trusting fluent-sounding answers by default.",
  'healthy-tech-boundaries':
    "Kids design their own tech rules — when, where, how much, why. Self-regulation written by them, not handed down.",
  'privacy-footprint':
    "Map what apps and sites know about you. Kids see their digital trail and decide what they want to leave behind.",
  'prompt-like-a-coach':
    "Better prompts get better answers. Kids learn to direct AI like they'd direct a junior collaborator — clearly, with context.",

  // ENTREPRENEURSHIP
  'micro-business':
    "Kids plan, launch, and run a real micro-business — find customers, set prices, deliver, count profit. Entrepreneurship without a pitch deck.",
  'brand-builder':
    "Build a brand from scratch — name, voice, look, story. Kids learn what a brand actually is by making one.",
  'business-failure-lab':
    "Real businesses that flopped, why, and what to take from it. Resilience taught by people who already paid for the lesson.",
  'community-service-business':
    "Build a small business that solves a real local problem. Profit and purpose in the same project.",
  'customer-discovery':
    "Before you build, ask. Kids interview real potential customers and let the answers shape the idea.",
  'investor-pitch':
    "Build the pitch deck, run the numbers, deliver the ask. Persuasion, math, and standing up in front of a real audience.",
  'marketing-campaign':
    "A full campaign — audience, message, channels, creative. Kids learn to make people care about something on purpose.",
  'pricing-experiment':
    "Set a price, sell some, adjust, try again. Kids learn pricing the only way it's ever really learned — by testing.",
  'product-design-lab':
    "Find a problem worth solving, design something for it, test it on real users. Empathy and engineering in one loop.",
  'supply-chain-detective':
    "Trace one product from raw material to your hands. Kids see the whole system, the ethics, the math, the miles.",
  'shark-tank-pitch':
    "90 seconds, a real product, a real ask, a tough audience. The pitch as a performance kids prepare and own.",

  // COMMUNICATION-WRITING
  'write-like-a-pro':
    "Real-world writing — emails, complaints, requests, persuasion. The kind of writing that gets results in actual life.",
  'adventure-story-map':
    "Kids visually map an adventure story before writing a word. Plot, character, stakes — all on one page they can see.",
  'community-tour-guide':
    "Kids write a guided tour of their own community. Voice, pacing, and the art of making the familiar interesting.",
  'directions-challenge':
    "Write instructions clear enough for someone else to follow without help. The single hardest writing skill, practiced.",
  'family-debate-night':
    "Pick a topic, take sides, argue well, listen better. Persuasion and respectful disagreement, modeled at the dinner table.",
  'family-recipe-book':
    "Kids collect, write, and design a book of family recipes with the stories behind them. A keepsake built one voice at a time.",
  'market-stall-pitch':
    "Sell something for real. Kids find the words that get a stranger to stop, listen, and buy. The original pitch practice.",
  'mini-magazine-creator':
    "Pick a topic, plan the layout, write the articles, design the cover. Kids edit themselves into something they're proud to share.",
  'my-review-column':
    "Books, games, restaurants, anything. Kids form opinions, defend them, and write reviews someone would actually read.",
  'neighbourhood-interview':
    "Kids interview a real neighbour or relative and share their story. The skill of asking, listening, and writing what they heard.",
  'trail-guide-creator':
    "Write a real guide to a local trail — landmarks, distance, what to notice. Nature writing with a job to do.",

  // WORLDSCHOOLING
  'cultural-celebration-journal':
    "Kids observe and document a real cultural celebration — what happened, why, what it felt like. Curiosity captured, not collected.",
  'currency-market-math':
    "Convert prices, compare costs, count change in a new currency. Real markets, real math, in real time.",
  'everyday-life-comparison':
    "Notice how a different place does the everyday — meals, school, transit, time. Curiosity as the lens, not judgment.",
  'local-language-mission':
    "Real-world language missions in a new place. Order coffee, ask directions, thank the host. Confidence one phrase at a time.",
  'nature-geography-field-study':
    "A field study wherever you are — landforms, weather, plants, wildlife. Geography that's outside the window, not in a book.",
  'people-stories-interview':
    "Kids talk to locals and travellers with thoughtful questions and real listening. Stories shape how kids see the world.",
  'street-explorer-map-maker':
    "Walk a new neighbourhood, then draw it from memory. Landmarks, routes, observations. Memory and place, hand-drawn.",
  'transport-navigation-challenge':
    "Read the map, decode the timetable, plan the route. Kids own a real journey from start to finish.",
  'travel-reflection-postcards':
    "Turn a trip into a hand-made postcard with a story to send home. Reflection that lasts longer than a photo dump.",
  'world-food-detective':
    "Try a local dish, trace the ingredients, learn the story. Food as the door into a place.",
};

let content = readFileSync(FILE, 'utf8');
let updatedCount = 0;
const failed: string[] = [];

for (const [slug, newDesc] of Object.entries(NEW)) {
  // Pattern: slug: "X", ... shortDescription:\n      "..."
  const re = new RegExp(
    `(slug:\\s*"${slug}",[\\s\\S]*?shortDescription:\\s*\\n?\\s*)"[^"]*"`,
    'g',
  );
  const before = content;
  content = content.replace(re, (_match, prefix) => `${prefix}"${newDesc.replace(/"/g, '\\"')}"`);
  if (content !== before) {
    updatedCount += 1;
  } else {
    failed.push(slug);
  }
}

writeFileSync(FILE, content);
console.log(`Updated ${updatedCount} / ${Object.keys(NEW).length}`);
if (failed.length) console.log('Failed:', failed.join(', '));
