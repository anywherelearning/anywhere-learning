/**
 * Structured product descriptions for the TPT-style product detail page.
 * Each product has an opening paragraph, "What's Included" bullets, and skill tags.
 * Shared constants provide template sections used across all products.
 */

// ─── Per-product description data ────────────────────────────────────

export interface ProductDescription {
  /** Opening paragraph: what this is and who it's for */
  opening: string;
  /** Checkmark bullet items specific to this product */
  whatsIncluded: string[];
  /** Subject/skill tags displayed as pills */
  skillTags: string[];
  /**
   * Hand-tuned title and meta for products where the generated template is
   * costing clicks. Only set this when GSC shows a real reason: the template
   * title truncating, the description repeating the title, or the snippet
   * speaking to the wrong searcher. Everything else keeps the template.
   */
  seo?: { title: string; description: string };
  /**
   * Parent questions answered on the page and shipped as FAQPage schema.
   * Only written for activities that already rank on page one and need the
   * extra depth to earn the click (see the Sept 2026 audit).
   */
  faqs?: { question: string; answer: string }[];
  /**
   * The academics and life skills this specific activity actually carries.
   * This is the only substantial block on the page that is unique per product,
   * so it is what makes a product page worth indexing on its own rather than
   * reading as a near-duplicate of the other 133. Optional: pages without it
   * render exactly as before.
   */
  insideTheLearning?: {
    /** 2-3 sentences: the real task first, then the school subjects inside it */
    lead: string;
    /** Each skill tied to the specific moment in the activity where it happens */
    skills: { skill: string; where: string }[];
  };
  /** Product format label */
  format: 'Activity Guide' | 'Project Guide' | 'Card Guide' | 'Parent Guide' | 'Bundle';
}

// ─── Shared template sections ────────────────────────────────────────

/** What every activity/project guide includes (shared across all products) */
export const SHARED_ACTIVITY_STRUCTURE = [
  'What this activity builds: clear learning focus',
  'Materials needed (minimal or none)',
  'Before you start: parent-friendly guidance',
  'Step-by-step instructions to follow along',
  '3 flexible levels: Explore / Develop / Extend',
  'Support tips and conversation starters',
];

/** Selling points shared across all products */
export const SHARED_WHY_FAMILIES_LOVE_IT = [
  'Low prep. Open and follow along on any device',
  'Reusable year after year, with a different experience every time',
  'Works for one child or five, multi-age friendly',
  'Curiosity-driven, not curriculum-driven',
  'Flexible: use one activity a day or one a week',
  'Real-world skills through real-world experiences',
];

/** Why parents love the Skills Map (parent guide format only) */
export const SHARED_WHY_PARENTS_LOVE_IT = [
  'A clear roadmap so you stop second-guessing your learning plan',
  'Use it as a menu, not a checklist. No rush, no pressure',
  'Designed to grow with your child, from babies through teens',
  'Honest, plain-language guidance, no academic jargon',
  'Built around real life: kitchens, parks, conversations, not desks',
  'The lens behind every guide and activity in the library',
];

/** Category-specific "Best For" audiences */
export const SHARED_BEST_FOR: Record<string, string[]> = {
  default: [
    'Homeschool families',
    'Worldschool families',
    'After-school, weekends & summer break',
    'Families who want meaningful, low-prep activities',
  ],
  'outdoor-learning': [
    'Homeschool families',
    'Worldschool families',
    'After-school, weekends & summer break',
    'Outdoor classrooms & nature programs',
  ],
  'creativity-maker': [
    'Homeschool families',
    'Worldschool families',
    'After-school, weekends & summer break',
    'Kids who love building, designing & creating',
  ],
  'ai-literacy': [
    'Homeschool families',
    'Worldschool families',
    'After-school, weekends & summer break',
    'Families raising tech-savvy, critical thinkers',
  ],
  'real-world-math': [
    'Homeschool families',
    'Worldschool families',
    'After-school, weekends & summer break',
    'Practical maths & financial literacy',
  ],
  'communication-writing': [
    'Homeschool families',
    'Worldschool families',
    'After-school, weekends & summer break',
    'Families who value practical communication skills',
  ],
  'entrepreneurship': [
    'Homeschool families',
    'Worldschool families',
    'After-school, weekends & summer break',
    'Families raising future founders & problem-solvers',
  ],
  'planning-problem-solving': [
    'Homeschool families',
    'Worldschool families',
    'After-school, weekends & summer break',
    'Families who value independent thinking',
  ],
  'start-here': [
    'Homeschool families',
    'Worldschool families',
    'After-school, weekends & summer break',
    'Families new to real-world learning',
  ],
  'emotional-social-skills': [
    'Homeschool families',
    'Worldschool families',
    'After-school, weekends & summer break',
    'Families raising emotionally aware, resilient kids',
  ],
  bundle: [
    'Homeschool families',
    'Worldschool families',
    'After-school, weekends & summer break',
    'Families who want a complete resource library',
    'Parents looking for the best value',
  ],
};

// ─── Per-product descriptions ────────────────────────────────────────

export const productDescriptions: Record<string, ProductDescription> = {
  // ═══════════════════════════════════════════════════════════════════
  // SEASONAL / NATURE PACKS
  // ═══════════════════════════════════════════════════════════════════
  'spring-outdoor-pack': {
    opening:
      'Bring learning outside this spring, without prep, printables, or special supplies. 20 nature-based outdoor activities for families who want meaningful seasonal learning that feels calm, flexible, and doable. Spring offers endless learning moments: buds opening, puddles changing, birds returning, insects appearing.',
    whatsIncluded: [
      '20 spring-themed outdoor activities across 4 subjects',
      'Language Arts (5): descriptive writing, discussion prompts, how-to writing',
      'Maths (5): measurement, estimating, patterns, geometry, problem-solving',
      'Science (5): spring ecosystems, plant growth, water movement, birdsong',
      'Physical Education (5): no-equipment outdoor movement games',
    ],
    skillTags: ['Science', 'Maths', 'Writing', 'Observation', 'Nature', 'PE'],
    insideTheLearning: {
      lead:
        'Twenty spring activities that cover four school subjects outdoors. Measuring plant growth is geometry and estimation. Writing about what changed is descriptive writing. Watching water move and birds return is science. Nothing here looks like a lesson, and all of it is one.',
      skills: [
        { skill: 'Writing', where: 'Descriptive writing, how-to writing and discussion prompts, all about things they just watched happen' },
        { skill: 'Maths', where: 'Measurement, estimation, patterns, geometry and problem-solving using what is outside' },
        { skill: 'Science', where: 'Spring ecosystems, plant growth, water movement and birdsong observed first-hand' },
        { skill: 'Observation', where: 'Noticing seasonal change closely enough to write and measure it' },
        { skill: 'Nature', where: 'Real time outdoors as the setting rather than the topic' },
        { skill: 'PE', where: 'Five no-equipment movement games that need nothing but a garden or a park' },
      ],
    },
    format: 'Activity Guide',
  },
  'summer-outdoor-pack': {
    opening:
      '20 summer activities for families who learn on the move. Water experiments, shadow tracking, outdoor cooking, beach science, and more. Designed for long sunny days when kids have energy to burn and curiosity to feed, whether you\'re at home, at the beach, or travelling.',
    whatsIncluded: [
      '20 summer-themed outdoor activities across 4 subjects',
      'Language Arts (5): storytelling, nature poetry, observation writing',
      'Maths (5): shadow maths, water measurement, nature patterns',
      'Science (5): sun experiments, water science, insect observation',
      'Physical Education (5): summer movement games and water challenges',
    ],
    skillTags: ['Science', 'Maths', 'Writing', 'Water Science', 'Nature', 'PE'],
    insideTheLearning: {
      lead:
        'Twenty summer activities carrying four subjects. Shadow maths is geometry you can only do when the sun is out. Water measurement is volume with buckets. Insect observation is real biology. The season does the motivating and the subjects come along.',
      skills: [
        { skill: 'Writing', where: 'Storytelling, nature poetry and observation writing drawn from what is in front of them' },
        { skill: 'Maths', where: 'Shadow maths, water measurement and finding the patterns in natural things' },
        { skill: 'Science', where: 'Sun experiments, water science and insect observation done outside' },
        { skill: 'Water Science', where: 'Volume, flow and buoyancy explored with actual water' },
        { skill: 'Nature', where: 'Summer used as the classroom rather than the break from one' },
        { skill: 'PE', where: 'Five movement games and water challenges that need no equipment' },
      ],
    },
    format: 'Activity Guide',
  },
  'fall-outdoor-pack': {
    opening:
      '20 autumn activities that use the changing season to build observation and creative skills. Leaf collecting, weather tracking, nature journaling, harvest maths, and more. Perfect for families who want to make the most of fall\'s rich sensory environment.',
    whatsIncluded: [
      '20 fall-themed outdoor activities across 4 subjects',
      'Language Arts (5): seasonal storytelling, descriptive writing, leaf poetry',
      'Maths (5): harvest maths, leaf sorting, measurement, estimation',
      'Science (5): decomposition, weather patterns, migration, seasonal change',
      'Physical Education (5): fall movement games and nature challenges',
    ],
    skillTags: ['Science', 'Maths', 'Writing', 'Observation', 'Nature', 'PE'],
    insideTheLearning: {
      lead:
        'Twenty autumn activities across four subjects. Sorting leaves is classification and estimation. Watching things break down is decomposition science. Writing about the change is descriptive work with a subject they can hold in their hand.',
      skills: [
        { skill: 'Writing', where: 'Seasonal storytelling, descriptive writing and leaf poetry' },
        { skill: 'Maths', where: 'Harvest maths, sorting, measurement and estimation using what has fallen' },
        { skill: 'Science', where: 'Decomposition, weather patterns, migration and seasonal change' },
        { skill: 'Observation', where: 'Tracking what changes week to week and recording it' },
        { skill: 'Nature', where: 'Autumn as the material, not the backdrop' },
        { skill: 'PE', where: 'Five movement games and nature challenges for colder days' },
      ],
    },
    format: 'Activity Guide',
  },
  'winter-outdoor-pack': {
    opening:
      '20 winter activities for cosy indoor days and cold outdoor adventures. Ice experiments, star-gazing, shadow play, winter bird feeding, and fireside storytelling. Designed for families who want to keep learning alive even when it\'s cold outside.',
    whatsIncluded: [
      '20 winter-themed activities (indoor and outdoor)',
      'Language Arts (5): fireside storytelling, winter journaling, creative writing',
      'Maths (5): temperature tracking, ice measurement, star patterns',
      'Science (5): ice experiments, winter ecology, constellation observation',
      'Physical Education (5): winter movement games and challenges',
    ],
    skillTags: ['Science', 'Maths', 'Writing', 'Astronomy', 'Nature', 'PE'],
    insideTheLearning: {
      lead:
        'Twenty winter activities, indoor and out. Temperature tracking is data over time. Ice experiments are physical science with the best possible material. Star patterns are astronomy you can only do when the nights are long enough.',
      skills: [
        { skill: 'Writing', where: 'Fireside storytelling, winter journaling and creative writing' },
        { skill: 'Maths', where: 'Temperature tracking, ice measurement and mapping star patterns' },
        { skill: 'Science', where: 'Ice experiments, winter ecology and constellation observation' },
        { skill: 'Astronomy', where: 'Real constellation work, using the one season that gives them dark evenings' },
        { skill: 'Nature', where: 'Winter treated as a season to use rather than wait out' },
        { skill: 'PE', where: 'Five movement games and challenges built for cold weather' },
      ],
    },
    format: 'Activity Guide',
  },
  'nature-journal-walks': {
    opening:
      'A guided nature journal that helps kids slow down, observe, and connect with the outdoors. Packed with prompts for sketching, writing, and recording what they see, hear, and wonder about. Works in any season, any landscape, any weather.',
    whatsIncluded: [
      '36 illustrated journal prompt cards, by season',
      'A full journal: one page for every prompt, ready to print or copy into any notebook',
      'Draw first, write second: sound maps, trees, snowflakes, buds',
      'Seasonal variations that work year-round',
      'Reusable format: use again and again across seasons',
    ],
    skillTags: ['Observation', 'Journaling', 'Science', 'Art', 'Writing'],
    insideTheLearning: {
      lead:
        'A nature journal your child fills in outdoors, in whatever order suits. Sketching what they see, writing what they notice, following clouds and textures and sounds. Gentle and flexible by design, so it survives contact with a real week.',
      skills: [
        { skill: 'Observation', where: 'Focused prompts on light, textures and sounds rather than look at nature' },
        { skill: 'Journaling', where: 'Building the habit of recording outdoors, page by page, over time' },
        { skill: 'Writing', where: 'Descriptive writing about something directly in front of them' },
        { skill: 'Art', where: 'Sketching and drawing closely enough to actually see the thing' },
        { skill: 'Science', where: 'Recording observations in a form they can compare later' },
      ],
    },
    format: 'Activity Guide',
  },
  'nature-walk-task-cards': {
    opening:
      '66 read-aloud task cards that turn any walk into a focused nature exploration. Each card gives kids a specific mission: find three different greens, stay still for 15 seconds and watch what changes, look for evidence that something ate something. Perfect for parents who want a simple, low-prep way to make walks more engaging.',
    whatsIncluded: [
      '66 read-aloud cards in 7 themes, each with a Deeper question',
      'Each card asks for one specific find, then a Deeper why',
      'Works in parks, backyards, trails, beaches, or neighbourhoods',
      'Designed for parent-led or independent use',
      'Reusable across seasons, with different results every time',
    ],
    skillTags: ['Observation', 'Nature', 'Sensory Learning', 'Science'],
    insideTheLearning: {
      lead:
        'Sixty-six cards you read out loud on a walk, and your child does the noticing. No planning and no teaching script to invent on the spot. Each card has a main prompt plus a deeper question if they want to push further.',
      skills: [
        { skill: 'Observation', where: 'Prompts that make them find detail they would have walked straight past' },
        { skill: 'Nature', where: 'Works on a hike, at a beach, in a park or in the back garden' },
        { skill: 'Sensory Learning', where: 'Each card aims at a specific sense rather than general looking' },
        { skill: 'Science', where: 'The deeper questions push from what do you see to why is it like that' },
      ],
    },
    format: 'Card Guide',
  },
  'nature-choice-boards': {
    opening:
      'Choose-your-own-adventure style nature activities. Five boards, 12 options each: observe, create, build, or investigate. Perfect for self-directed learners who want to choose what they do and how deep they go.',
    whatsIncluded: [
      '5 nature choice board activity menus',
      '12 options per board, a mix of observation, art, science, and building',
      'Self-directed format builds independence and decision-making',
      'Works outdoors in any environment',
      'Boards for ages 6 to 8 up to 10 and up',
    ],
    skillTags: ['Self-Direction', 'Nature', 'Science', 'Art', 'Decision-Making'],
    insideTheLearning: {
      lead:
        'Five boards of twelve options each, and your child picks. That is the design. Choosing what to do and committing to it is the skill being built, alongside the observation, art and science on the board itself.',
      skills: [
        { skill: 'Self-Direction', where: 'Choosing their own activity from a menu instead of being assigned one' },
        { skill: 'Decision-Making', where: 'Committing to a choice and seeing it through' },
        { skill: 'Science', where: 'Observation and investigation options built around noticing detail outdoors' },
        { skill: 'Art', where: 'Making and drawing options sitting alongside the science ones' },
        { skill: 'Nature', where: 'Works in any outdoor space, from a garden to a forest' },
      ],
    },
    format: 'Card Guide',
  },
  'outdoor-learning-missions': {
    opening:
      'Ten scavenger hunt missions that turn any walk into fieldwork. Each one has 12 things to find and 3 Extras for going deeper, from animal signs and the water cycle to rocks, plants and sounds. Kids search, tick off finds, and back each one up with a clue.',
    whatsIncluded: [
      '10 scavenger hunt missions, 12 finds each',
      '3 Extras per mission for going deeper',
      'Watercolour illustrations kids can tick off',
      'Works in backyards, parks, forests, and beaches',
      'Under an hour per mission',
    ],
    skillTags: ['Problem-Solving', 'Nature', 'Engineering', 'Observation', 'Science'],
    insideTheLearning: {
      lead:
        'Scavenger-hunt missions with a goal, 12 finds, 3 Extras and a why-it-counts for every tick. Each hunt has twelve things to find plus extras if they want to go further. No teaching background needed, which is the point of the format.',
      skills: [
        { skill: 'Observation', where: 'Noticing details, patterns and changes rather than skimming past them' },
        { skill: 'Science', where: 'Making guesses, using evidence and comparing what they found' },
        { skill: 'Problem-Solving', where: 'Working out how to complete a mission with what is actually around' },
        { skill: 'Engineering', where: 'The Nature engineering hunt: spotting how plants and rocks handle wind, water and weight' },
        { skill: 'Nature', where: 'Runs in a backyard, a park, a forest or a beach' },
      ],
    },
    format: 'Card Guide',
  },
  'outdoor-stem-challenges': {
    opening:
      '24 outdoor STEM challenges that use the natural world as a laboratory. Build a bridge from sticks. Design a windproof shelter. Make a shadow clock. Engineer a raft that carries pebbles. Each challenge is a hands-on engineering adventure using only what you find outside.',
    whatsIncluded: [
      '24 outdoor STEM challenge cards in 5 themes',
      'Engineering: bridges, shelters, boats, towers, and structures',
      'Science: measurement, forces, materials, buoyancy',
      'Found natural materials, plus a cup, a bottle and an egg for three cards',
      'Includes testing criteria and reflection prompts',
    ],
    skillTags: ['STEM', 'Engineering', 'Science', 'Problem-Solving', 'Nature'],
    insideTheLearning: {
      lead:
        'Twenty-four build-and-test challenges outdoors, using sticks, rocks and whatever else is on the ground. Plan, build, test, improve. Change one thing and test again, which is exactly how engineers work and nothing like how building usually gets taught.',
      skills: [
        { skill: 'STEM', where: 'The full engineering loop: plan, build, test, then change one thing and retest' },
        { skill: 'Engineering', where: 'Bridges, shelters, boats, towers and structures that have to actually stand up' },
        { skill: 'Science', where: 'Measurement, forces, materials and buoyancy learned by testing them' },
        { skill: 'Problem-Solving', where: 'Working out why the first design failed and fixing that specific thing' },
        { skill: 'Nature', where: 'Built entirely from fallen natural materials, then taken apart afterwards' },
      ],
    },
    format: 'Card Guide',
  },
  'outdoor-stem-challenges-volume-2': {
    opening:
      '24 brand-new outdoor STEM challenges, the sequel to Outdoor STEM Challenge Cards. Twist real rope from grass. Tune a launcher until it hits the target three times straight. Move water uphill. Weigh things on a balance scale made from a stick and string. Five themes of challenges, from easier to harder, all built from what you find outside and around the house.',
    whatsIncluded: [
      '24 new outdoor STEM challenge cards',
      'Five themes, from rope-making to levers',
      'A Deeper extension on every card',
      'Found and household materials only',
      'Works alone or with the original deck',
    ],
    skillTags: ['STEM', 'Engineering', 'Science', 'Problem-Solving', 'Nature'],
    insideTheLearning: {
      lead:
        'Twenty-four new build-and-test challenges in five themes that go deeper than one-off builds: a child can pull one random card, or ride a whole theme from making rope to strength-testing the knots. Plan, build, test, improve, the same loop as the first deck, aimed at new physics.',
      skills: [
        { skill: 'STEM', where: 'The engineering loop across rope, launchers, water, wind, and levers' },
        { skill: 'Engineering', where: 'Pulleys, aqueducts, wind vanes, and balance scales that have to actually work' },
        { skill: 'Science', where: 'Fair testing: change one thing at a time, measure, and explain the result' },
        { skill: 'Problem-Solving', where: 'Finding the leak, the slipping knot, or the wobble, and fixing that exact thing' },
        { skill: 'Nature', where: 'Built from fallen sticks, stones, and grass, then taken apart afterwards' },
      ],
    },
    seo: {
      title: 'Outdoor STEM Challenge Cards Vol. 2: Low-Prep, Ages 6-14',
      description:
        '24 new outdoor STEM challenges: rope-making, launchers, water, wind and levers. Low-prep STEM activities for kids 6-14 using found materials.',
    },
    format: 'Card Guide',
  },
  'outdoor-movement-challenge-cards': {
    opening:
      '24 outdoor physical challenges built on personal records, streaks, and real effort. Kids time a tree sit and beat it a few seconds at a time, race their own lap time, keep a daily outside streak alive with a rain-gear backup, sample ways of moving until they find their thing, and duel a faster sibling with a handicap they tune until races finish even.',
    whatsIncluded: [
      '24 outdoor movement challenge cards',
      'Five themes, from PRs to adventures',
      'A Deeper level on every card',
      'A streak system with built-in backups',
      'No equipment. A body, a timer, outside.',
    ],
    skillTags: ['Physical Challenge', 'Healthy Habits', 'Perseverance', 'Outdoor Confidence', 'Movement'],
    insideTheLearning: {
      lead:
        'Movement here is a game played against yesterday’s self: time it, measure it, beat it. Streak cards build the daily habit, sampler cards help kids find their thing, and the adult can keep a number too. Two sets of personal records beat one.',
      skills: [
        { skill: 'Physical Challenge', where: 'Tree sits, sprint loops, long hauls, and loaded packs, measured and beaten' },
        { skill: 'Healthy Habits', where: 'A daily outside streak with a designed backup for rough days' },
        { skill: 'Perseverance', where: 'The PR mindset: today’s self versus yesterday’s number, not other kids' },
        { skill: 'Outdoor Confidence', where: 'Instinct walks, imperfect weather, and far points reached on foot' },
        { skill: 'Movement', where: 'Sampling styles, rating them, and choosing their thing' },
      ],
    },
    seo: {
      title: 'Outdoor Movement Challenge Cards for Kids Ages 6-14',
      description:
        '24 outdoor movement challenges built on personal records and streaks for kids ages 6-14: no equipment, works in any yard, park, or trail.',
    },
    format: 'Card Guide',
  },
  'land-art-challenges': {
    opening:
      '48 land art challenges that turn natural materials into beautiful, temporary art. Make a mandala from stones, build a stick-and-stone tower, sort the forest floor by colour, build a story path. Kids learn about patterns, symmetry, colour, and composition, all while spending time outside.',
    whatsIncluded: [
      '48 land art challenge cards in 4 themes',
      'Mandalas, rock towers, colour sorts, story paths, and sculptures',
      'Uses only natural materials: stones, leaves, sticks, petals, fallen bark',
      'Teaches pattern, symmetry, colour theory, and composition',
      'Temporary art: photograph and leave no trace',
    ],
    skillTags: ['Art', 'Nature', 'Patterns', 'Creativity', 'Observation'],
    insideTheLearning: {
      lead:
        'Challenge cards for making art out of what is on the ground: mandalas, spirals, mosaics, patterns. The art is temporary by design and gets taken apart at the end, which changes how a kid thinks about making something.',
      skills: [
        { skill: 'Art', where: 'Composing with colour, shape and arrangement using only found material' },
        { skill: 'Patterns', where: 'Building symmetry, spirals and repeating structures that have to hold together' },
        { skill: 'Nature', where: 'Using only fallen leaves, sticks, stones and petals, leaving living things alone' },
        { skill: 'Observation', where: 'Sorting natural material by colour, shape and texture before anything gets made' },
        { skill: 'Creativity', where: 'Making something real from whatever happens to be there' },
      ],
    },
    format: 'Card Guide',
  },
  'nature-crafts': {
    opening:
      'Six real crafts made from found materials: a nature frame, a wind chime, texture prints, earth paint, shadow tracing and story stones. Each one hides a bit of science or storytelling, and kids learn to test and change their choices like real makers.',
    whatsIncluded: [
      '6 step-by-step craft guides using found materials',
      'Nature frame, wind chime, texture prints, earth paint, shadow tracing, story stones',
      'Each project combines collection, observation, and creation',
      'Minimal additional supplies, mostly found materials',
      'A gallery and a gift idea to finish',
    ],
    skillTags: ['Art', 'Nature', 'Crafts', 'Observation', 'Fine Motor Skills'],
    insideTheLearning: {
      lead:
        'Six crafts made from what your child gathers: a frame for looking, a wind chime tuned by testing, texture prints, paint mixed from soil, shadow tracings and story stones. Gathering first, then making, then changing one thing to make it better.',
      skills: [
        { skill: 'Art', where: 'Prints, earth paint and shadow drawings made from found materials' },
        { skill: 'Nature', where: 'Collecting the materials outdoors before anything gets made' },
        { skill: 'Observation', where: 'Choosing textures, soils and views closely enough to see the difference' },
        { skill: 'Crafts', where: 'Real technique: knots, printing with even pressure, mixing pigment' },
        { skill: 'Fine Motor Skills', where: 'Tying knots, tracing shadows and painting with a stick' },
      ],
    },
    format: 'Activity Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // CREATIVITY PROJECTS
  // ═══════════════════════════════════════════════════════════════════
  'board-game-studio': {
    opening:
      'Your child invents a board game from nothing: the theme, how you win, what happens each turn, the board and the cards. Then they write 5 rules, hand it to someone who has never seen it, watch what goes wrong and build Version 2. Design thinking, clear writing and a little maths, ending with a family game night.',
    whatsIncluded: [
      '5 steps from the first idea to a family game night',
      'Menus of game types, turn ideas and card ideas',
      'The 5 rules every game needs',
      'A playtest checklist: confused, slow, bored, lucky, argued',
      'Version 2, a box cover and a back-of-box line',
    ],
    skillTags: ['Design Thinking', 'Maths', 'Writing', 'Strategy', 'Art'],
    insideTheLearning: {
      lead:
        'Your child designs a board game from scratch, then makes other people play it. Inventing the theme is the fun part. Balancing the numbers so it is winnable but not easy, and writing rules precise enough that a stranger can follow them without asking, is the part that teaches the most.',
      skills: [
        { skill: 'Creative Thinking', where: 'Inventing a theme and the mechanics that turn it into an actual game' },
        { skill: 'Design Thinking', where: 'Playtesting with real players, taking the feedback, and rebuilding the rules' },
        { skill: 'Math', where: 'Balancing the scoring and probabilities so the game is winnable but not a walkover' },
      ],
    },
    format: 'Project Guide',
  },
  'rube-goldberg-machine': {
    opening:
      'Your child builds a chain reaction that takes way too many steps to do one simple thing, like ringing a bell. They pick the ending first, build backwards with ramps, dominoes and levers, then test and fix one change at a time until every step works 3 runs in a row. A classic STEM engineering project where failure is part of the fun.',
    whatsIncluded: [
      '5 steps from picking the ending to the final demo',
      'A step menu: ramp, dominoes, lever, string pull, drop, catapult',
      'Endings that work, and ones to skip',
      'A fix list for when a step fails',
      'Quick reset tricks, plus a success rate challenge',
    ],
    skillTags: ['STEM', 'Engineering', 'Physics', 'Problem-Solving', 'Design', 'Cause & Effect'],
    seo: {
      title: "Rube Goldberg Machine for Kids: Build One at Home, Ages 6-14",
      description:
        'Rube Goldberg machine for kids, no kit needed. Design a chain reaction from dominoes, ramps, balls and levers, then test it, fix it, run it. Ages 6-14.',
    },
    insideTheLearning: {
      lead:
        'Your child builds a chain reaction machine out of household junk, and it will not work. Not at first, not at the tenth try. Each failure is a physics problem with a specific cause, and finding it is the entire activity.',
      skills: [
        { skill: 'Engineering', where: 'Designing a chain reaction where each step reliably triggers the next' },
        { skill: 'Science', where: 'Working with gravity, energy and friction until the physics cooperates' },
        { skill: 'Problem-Solving', where: 'Troubleshooting the step that keeps failing, then rebuilding it' },
        { skill: 'Communication', where: 'Explaining how the machine works and why each stage is there' },
      ],
    },
    format: 'Project Guide',
  },
  'survival-base': {
    opening:
      'Your child picks an imaginary expedition, maps the dangers and builds a base camp where every zone answers a danger: shelter, water, food, safety. They write the systems and a survival manual, then face a surprise scenario card and upgrade the base on the fly. Geography, engineering and creative writing in one immersive project.',
    whatsIncluded: [
      '5 steps from picking the destination to the final briefing',
      'Dangers matched to zones, so every zone has a reason',
      'Three ways to build: life-size, a model or a map',
      'Systems, a survival manual and ration maths',
      'Scenario cards to test the base, then upgrade it',
    ],
    skillTags: ['Geography', 'Engineering', 'Science', 'Design', 'Presentation'],
    insideTheLearning: {
      lead:
        'Your child designs a base that could survive somewhere hostile, real or invented. Every zone has to answer a real danger: this cold, this water supply, this terrain. Then a surprise scenario card tests it, and they upgrade on the fly.',
      skills: [
        { skill: 'Science', where: 'Designing around the dangers of a place: cold, water, storms and animals' },
        { skill: 'Planning', where: 'Laying out the base so it solves the practical problems in the right order' },
        { skill: 'Creative Thinking', where: 'Inventing a base that is genuinely theirs, built around real dangers' },
        { skill: 'Communication', where: 'Presenting the design and defending why it would work' },
      ],
    },
    format: 'Project Guide',
  },
  'imaginary-world': {
    opening:
      'Your child invents a whole world around one big idea, like a land with no night. They design the land and who lives there, build the culture and its rules, draw the map, build one corner in 3D, then tell a legend and give a tour to someone who has never been there. Writing, geography and art in one big creative project.',
    whatsIncluded: [
      '5 steps from one big idea to a guided tour',
      'Land and creatures that fit together, and why',
      'A culture with rules that have reasons',
      'A real map and one corner built in 3D',
      'A worldbuilding toolkit with 5 traveller questions',
    ],
    skillTags: ['Writing', 'Art', 'Geography', 'Worldbuilding', 'Imagination'],
    // Oct 26 2026: page one with 0 clicks on the default "Name | Category" title.
    seo: {
      title: 'Build an Imaginary World: Worldbuilding Guide, Ages 6-14',
      description:
        'The guide your family follows to build an imaginary world: draw the map, design the creatures, set the rules and write its stories. Ages 6 to 14.',
    },
    insideTheLearning: {
      lead:
        'Your child builds an entire world and it has to hold together. If the climate is like that, the food has to come from somewhere. If the geography is like that, the cities go here and not there. Invention plus consequences, which is much harder and much more interesting than invention alone.',
      skills: [
        { skill: 'Systems Thinking', where: 'Making geography, climate and ecosystem consistent with each other' },
        { skill: 'Creative Thinking', where: 'Inventing creatures, civilisations and the lore that connects them' },
        { skill: 'Storytelling', where: 'Map-making, legends, place names and a guided tour' },
      ],
    },
    format: 'Project Guide',
  },
  'creature-habitat': {
    opening:
      'Your child invents an animal that has never existed and gives every feature a survival job, borrowing tricks from real animals like the fennec fox and the poison dart frog. They sculpt the creature, build a shoebox habitat that fits its body, and make a field guide page like a scientist presenting a new species. Biology, art and engineering in one project.',
    whatsIncluded: [
      '5 steps from the first sketch to the big reveal',
      'Real animal tricks to borrow, all true',
      'Body part jobs and a habitat match guide',
      'A clay creature and a shoebox habitat',
      'A field guide checklist, like a real scientist',
    ],
    skillTags: ['Biology', 'Art', 'Engineering', 'Scientific Thinking', 'Design'],
    insideTheLearning: {
      lead:
        'Your child invents a creature and then builds the habitat that would actually keep it alive. Every design choice has to be justified biologically: this diet needs these teeth, this climate needs this adaptation. Then they build a physical model of it, which is where the spatial reasoning kicks in.',
      skills: [
        { skill: 'Science', where: 'Designing anatomy, diet, behaviour and adaptations that hold together as biology' },
        { skill: 'Problem-Solving', where: 'Working out what the creature would actually need to survive where they put it' },
        { skill: 'Engineering', where: 'Building a physical model, which needs spatial reasoning and real construction' },
        { skill: 'Communication', where: 'Documenting the creature and explaining why each choice makes sense' },
      ],
    },
    format: 'Project Guide',
  },
  'theme-park': {
    opening:
      'Your child designs a whole theme park or backyard adventure course: the theme, the star rides, the map and the prices. They plan how visitors move, build it as a model, a drawing or a life-size course, work out what a family of four would spend, then test it on a real visitor and hold a grand opening. Maths, design and business thinking in one big project.',
    whatsIncluded: [
      '5 steps from the theme to the grand opening',
      'Map flow: where the big ride goes, and why',
      'Three ways to build: tabletop, drawn or a backyard course',
      'Park maths: a family day total and wait times',
      'A park designer toolkit with an attraction mix and a map checklist',
    ],
    skillTags: ['Maths', 'Design', 'Engineering', 'Planning', 'Art'],
    insideTheLearning: {
      lead:
        'Your child designs a theme park: the rides, the layout, the visitor flow, what a family of four would spend and how long the lines are. Rides need to be safe, prices need to add up for a family, and the paths need to stop everyone bottlenecking at the entrance.',
      skills: [
        { skill: 'Spatial Thinking', where: 'Laying out the park and planning how visitors move through it' },
        { skill: 'Engineering', where: 'Designing rides that work and are safe' },
        { skill: 'Maths', where: 'Pricing a family day out and working out how long the line is' },
        { skill: 'Communication', where: 'Presenting the park and explaining the decisions behind the layout' },
      ],
    },
    format: 'Project Guide',
  },
  'mini-movie': {
    opening:
      'Your child writes, directs and produces their own show: a live play, a mini movie, a stop-motion film or a radio drama. They invent characters who want something, storyboard it shot by shot with wide, medium and close-up shots, build a simple set and rehearse. Then they record and edit it, or perform it live, and hold a premiere. No tech needed, though a phone works too.',
    whatsIncluded: [
      '5 steps from a one-sentence story to the premiere',
      'Characters with a want, a strength and a weakness',
      'A shot-by-shot storyboard with wide, medium and close-up shots',
      'Editing basics: trim, order, title and credits',
      'Four formats, tips for each, and no tech required',
    ],
    skillTags: ['Storytelling', 'Writing', 'Performing', 'Art', 'Collaboration'],
    insideTheLearning: {
      lead:
        'Your child makes a play, film, stop-motion or radio drama, and directs it like a real crew: a storyboard, shot choices, a rehearsal, an edit and a premiere. Most of it is sequencing and problem-solving under constraint, because something always fails and the shot still has to work.',
      skills: [
        { skill: 'Storytelling', where: 'Writing the script and designing the characters that carry it' },
        { skill: 'Directing', where: 'Choosing wide, medium or close-up shots, then trimming and ordering the clips' },
        { skill: 'Problem-Solving', where: 'Solving the practical failures with what is on hand' },
        { skill: 'Public Speaking', where: 'Performing it, then presenting the finished thing to an audience' },
      ],
    },
    format: 'Project Guide',
  },
  'invent-a-sport': {
    opening:
      'Your child invents a sport that has never existed: the field, the equipment, the scoring and the rulebook. They mark out the playing area, make gear from household things, set points that match how hard each move is, then playtest, fix what feels unfair and host the first championship. Design thinking, fair play and a lot of running around.',
    whatsIncluded: [
      '5 steps from one way to win to the championship',
      'A field that starts smaller than they think',
      'Scoring that matches how hard each move is',
      'Equipment swaps from around the house',
      'Fair play checks and the 5 rules every sport needs',
    ],
    skillTags: ['Design Thinking', 'Writing', 'Physical Literacy', 'Problem-Solving', 'Creativity'],
    faqs: [
      {
        question: 'What do kids actually make in this project?',
        answer:
          'A playable sport with a name, equipment built from what is in the house, a written rulebook, and a scoring system. Our kids invented Get Blocked on the trampoline: one thrower outside trying to land the ball, everyone inside blocking it. The test of done is that someone else can play it from the rulebook alone.',
      },
      {
        question: 'How long does inventing a sport take?',
        answer:
          'Plan on three to five sessions of about an hour. Design and the first build take one session, the first playtest usually breaks the rules within ten minutes, and the rewrite-and-replay loop fills the rest. Some kids keep tweaking for weeks.',
      },
      {
        question: 'What age is invent a sport for?',
        answer:
          'Ages 6 to 14. Younger kids invent simpler games with two or three rules and need help writing them down. Older kids handle scoring systems, fairness arguments, and equipment that has to be built to a measurement.',
      },
      {
        question: 'Do we need any equipment?',
        answer:
          'No. The equipment gets invented too. Balls, sticks, buckets, rope, tape, cardboard, and cushions cover almost every sport kids come up with. If something would need buying, the design gets changed instead.',
      },
    ],
    insideTheLearning: {
      lead:
        'Your child invents a sport, builds the equipment out of what is in the house, writes the rulebook, and then makes people play it. The rules have to be testable and the game has to be fair, which is a genuinely hard design problem the first time someone exploits a loophole.',
      skills: [
        { skill: 'Design Thinking', where: 'Designing the mechanics and rules, then rebuilding them after the first real game' },
        { skill: 'Math', where: 'Measurement, scoring and the numbers that decide whether it is balanced' },
        { skill: 'Ethics', where: 'Working out what fairness means, and closing the loopholes players find' },
        { skill: 'Communication', where: 'Writing a rulebook clear enough that others can play without asking' },
      ],
    },
    // Sept 28 2026: split the how-to search off to the post. Oct 26 2026:
    // Google kept this page for the whole cluster ("create a new sport",
    // "make a sport") and the post never got a click, so this page owns it
    // and the title uses the searchers' words.
    seo: {
      title: 'Create a New Sport With Kids: Step-by-Step Guide, 6-14',
      description:
        'Make up a new sport with your kids: pick the goal, build equipment from household stuff, write the rulebook and playtest it together. Ages 6 to 14.',
    },
    format: 'Project Guide',
  },
  'kinetic-sculpture': {
    opening:
      'Your child builds art that moves: a hanging mobile, a spinner, a wobbling balance sculpture or a piece that turns in the wind. They pick the movement, build a base that holds, then balance it using the real physics of weight times distance. Then they name it and show it in a family gallery. Pure STEAM: art, engineering and physics in the same build.',
    whatsIncluded: [
      '5 steps from picking the movement to a gallery show',
      'The balance rule: heavy close to the middle, light far out',
      'Bases and spinning joints from recycling bin finds',
      'A title card and an artist statement',
      'A moving art toolkit with five movement types',
    ],
    skillTags: ['STEM', 'Physics', 'Art', 'Engineering', 'Design', 'Expression'],
    insideTheLearning: {
      lead:
        'Your child builds art that moves, which means the physics has to work before the art does. Balance, wind, gravity, rotation. It will not move right the first time or the fifth. Test, adjust, rebuild, and the sculpture at the end is proof of the iterating.',
      skills: [
        { skill: 'Engineering', where: 'Making balance, gravity, wind and rotation actually produce movement' },
        { skill: 'Art', where: 'Designing something worth looking at once it works' },
        { skill: 'Problem-Solving', where: 'Testing, adjusting and rebuilding when the mechanism refuses to cooperate' },
        { skill: 'Communication', where: 'Explaining how it works and why it was built that way' },
      ],
    },
    format: 'Project Guide',
  },
  'build-a-museum': {
    opening:
      'Your child builds a real museum at home on a topic they love. They narrow it to an angle, research and pick the 5 to 8 pieces that tell the story, lay out a visitor path, write short labels that say what each piece is and why it matters, add a hands-on station, then open the doors with a guest book. Research, writing and design, driven by their own interests.',
    whatsIncluded: [
      '5 steps from a topic to opening day',
      'Topic to angle: turning a big subject into a museum',
      'A label formula that fits on a sticky note',
      'Interactive station ideas',
      'A visitor walk-through and a guest book',
    ],
    skillTags: ['Research', 'Writing', 'Design', 'Curation', 'Presentation'],
    // Oct 19 2026: this page outranked the post for "how to create a museum
    // exhibit" (16 impr at 22 vs 7). The post takes the how-to searcher; this
    // page speaks to the parent who wants the guide (Invent a Sport pattern).
    seo: {
      title: 'Build a Museum: Parent-Led Exhibit Project Guide, Ages 6-14',
      description:
        'The guide your family follows to build a museum: pick a topic, research it, curate objects, write labels and host an opening night. Ages 6 to 14.',
    },
    insideTheLearning: {
      lead:
        'Your child builds a real exhibit on something they already love, and opens it to actual visitors. Deciding what matters most about the topic, and what gets left out, is editorial thinking. Then they write labels that make sense to someone who knows nothing about it, which is the hardest short writing there is.',
      skills: [
        { skill: 'Research', where: 'Investigating the topic properly and finding what is genuinely worth exhibiting' },
        { skill: 'Curation', where: 'Deciding what matters most and cutting what does not earn its place'  },
        { skill: 'Writing', where: 'Labels clear, short and useful enough that a stranger understands the topic' },
        { skill: 'Design', where: 'Laying out the exhibit so a visitor moves through it in the right order' },
        { skill: 'Presentation', where: 'The grand opening, talking a real visitor through the work' },
      ],
    },
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // REAL-WORLD MATH
  // ═══════════════════════════════════════════════════════════════════
  'budget-challenge': {
    opening:
      'Your child plans a day out the family will actually do, inside a real budget. They find the real prices, hold back a buffer, rank a cut list and pitch the plan to you. Then they run the money on the day, track every spend against the plan and see which line was furthest off. Real-world STEM maths with a day out at the end.',
    whatsIncluded: [
      '5 steps from picking the day to tracking it',
      'Finding real prices: websites, menus, a phone call',
      'A 10% buffer and a ranked cut list',
      'Two what-ifs to test the plan before you go',
      'A Day Out Toolkit with a day tracker',
    ],
    skillTags: ['STEM', 'Real-World Math', 'Budgeting', 'Problem-Solving'],
    insideTheLearning: {
      lead:
        'Your child plans a day out against a real budget with prices they find themselves, builds in a buffer, then runs the money on the day. When something costs more than planned, they decide on the spot what gives, and afterwards they see how close the plan came.',
      skills: [
        { skill: 'Budgeting', where: 'Holding a whole plan inside a fixed limit when the prices are real' },
        { skill: 'Number Sense', where: 'Researching actual prices and totalling them up accurately' },
        { skill: 'Problem-Solving', where: 'Handling surprises on the day with the buffer and the cut list' },
        { skill: 'Decision-Making', where: 'Choosing what gets cut when something has to go' },
        { skill: 'Planning', where: 'A plan, a buffer and a cut list the family really follows' },
        { skill: 'Communication', where: 'Defending the trade-offs they made and explaining why' },
      ],
    },
    format: 'Project Guide',
  },
  'kitchen-math-challenge': {
    opening:
      'Your child plans one to three real meals for the family, checks what is already at home, turns the meals into a shopping list and prices it by the package. Then they shop it with their own list, help make it, and lay the receipt next to the plan. Real-world STEM maths about what one serving costs, and what the store makes you buy.',
    whatsIncluded: [
      '5 steps from checking the fridge to checking the receipt',
      'Per-serving vs per-package pricing (the bread loaf lesson)',
      'Turning meals into a shopping list for the whole family',
      'Shopping from their own list, and when a bigger size is really a deal',
      'Price Menu page for when you cannot check a flyer',
    ],
    skillTags: ['STEM', 'Real-World Math', 'Planning', 'Life Skills'],
    insideTheLearning: {
      lead:
        'Your child plans real meals against real prices, then shops and cooks them. The surprise comes at the shopping list: one sandwich costs $2.50 on paper and $15 at the store, because you cannot buy one slice of bread. Planning around that, and the leftovers it creates, is the skill.',
      skills: [
        { skill: 'Math', where: 'Multiplying servings for the family and estimating the total before the till' },
        { skill: 'Number Sense', where: 'Comparing the price per serving with the price per package' },
        { skill: 'Budgeting', where: 'Comparing the priced list with the real receipt' },
        { skill: 'Planning', where: 'Turning a day of meals into an ingredient list without duplicates' },
        { skill: 'Problem-Solving', where: 'Swapping on the spot when the store is out, and planning the leftovers' },
      ],
    },
    format: 'Project Guide',
  },
  'smart-shopper': {
    opening:
      'Your child makes a real purchase decision, with their own money or for something the family needs. They compare two options, build their own rubric, see both in person if they can, work out cost per use and hidden costs, and spot the marketing tricks. Then they wait two weeks before buying. Real-world STEM maths and media literacy, and the habit of thinking before spending.',
    whatsIncluded: [
      '5 steps from a gut pick to a real purchase',
      'A rubric they build themselves, plus a need or want check',
      'Cost per use, hidden costs and opportunity cost',
      'A Marketing Tricks page with a 3-question check',
      'The two-week wait, and a calendar check a month later',
    ],
    skillTags: ['STEM', 'Real-World Math', 'Critical Thinking', 'Decision-Making'],
    insideTheLearning: {
      lead:
        'Your child compares two things they are really about to buy and builds their own rubric to judge them. Cost per use, hidden costs, needs against wants. Then they spot the marketing aimed at them, make the call, and wait before spending, so the decision has to hold up.',
      skills: [
        { skill: 'Critical Thinking', where: 'Building a rubric and separating what they need from what they want' },
        { skill: 'Financial Literacy', where: 'Working out cost per use and the hidden costs nobody advertises' },
        { skill: 'Media Literacy', where: 'Naming the specific marketing tactics aimed at them' },
        { skill: 'Decision-Making', where: 'Making the call, waiting two weeks, then living with it' },
        { skill: 'Communication', where: 'Writing a recommendation they can actually defend' },
      ],
    },
    format: 'Project Guide',
  },

  'backyard-campout-planner': {
    opening:
      'Your child plans a real backyard campout from scratch: scouting and measuring the site, drawing a layout that fits, building the gear list and budget, working out food for everyone, and writing the schedule. Then you all camp out and compare the plan with the real night. Measurement, area, budgeting and time maths, with marshmallows at the end.',
    whatsIncluded: [
      '5 steps from scouting the site to camping out, each with your job and your kid\'s job',
      'A worked example on fitting a camp into a measured space',
      'Gear list and budget, with make-it, borrow-it or skip-it trade-offs',
      'Food quantities per camper and a schedule with buffer time',
      'Campout Numbers page: sizes, food per person, setup times and safety',
      'Three levels at every step (Explore, Develop, Extend)',
    ],
    skillTags: ['Measurement', 'Budgeting', 'Time Planning', 'Estimation', 'Organisation'],
    insideTheLearning: {
      lead:
        'Your child plans and runs a real campout in the backyard, and every part of it needs a number. Where the tent goes needs a tape measure and an area calculation. Feeding everyone needs multiplication. Getting the gear needs pricing and trade-offs against a limit. Then they actually sleep outside in the thing they planned.',
      skills: [
        { skill: 'Math', where: 'Measuring the site with a tape measure and working out the area the tent and gear need' },
        { skill: 'Number Sense', where: 'Calculating food per person and supply totals, pricing them, and trading things off to stay inside the limit' },
      ],
    },
    format: 'Project Guide',
  },
  'clothing-swap-thrift-math': {
    opening:
      'Your child audits their closet, works out cost per wear, prices their own clothes, then runs a clothing swap or shops a thrift store on a small budget. They finish by proving what secondhand saves with real percentages. Division, percentages and budgeting, used on clothes they actually wear.',
    whatsIncluded: [
      '5 steps from closet audit to new-versus-secondhand savings, each with your job and your kid\'s job',
      'A worked example on percent off and cost per wear',
      'Swap rules with a point system, or a thrift trip on a small budget',
      'Value Guide page: condition ratings, ballpark thrift prices, swap points and a quality check',
      'Three levels at every step (Explore, Develop, Extend)',
    ],
    skillTags: ['Financial Literacy', 'Budgeting', 'Value Assessment', 'Sustainability'],
    insideTheLearning: {
      lead:
        'Your child runs a clothing swap and works out what things are genuinely worth. Cost per wear is a division problem that changes how you look at a price tag. The gap between new and secondhand is a percentage. By the end, value is not the number printed on the label.',
      skills: [
        { skill: 'Number Sense', where: 'Dividing price by the number of times something gets worn to find cost per wear' },
        { skill: 'Percentages', where: 'Working out the discount between the new price and the secondhand one' },
        { skill: 'Financial Literacy', where: 'Shopping inside a limit and making the trade-offs that keep them there' },
        { skill: 'Critical Thinking', where: 'Deciding what value really means once the price tag stops being the answer' },
      ],
    },
    format: 'Project Guide',
  },
  'family-electricity-audit': {
    opening:
      'Kids hunt every device that plugs in, read the wattage labels, and work out what each one costs to run with your real electricity rate. Then they design a family saving plan, test it for a week, and calculate the real savings.',
    whatsIncluded: [
      '5 steps from the label hunt to a family test week',
      'An Energy Toolkit: typical watts, reading labels and your bill',
      'Appliance comparison and cost calculations',
      'Energy-saving plan with estimated savings',
      'A one-week family test with real savings',
    ],
    skillTags: ['STEM', 'Measurement', 'Data Analysis', 'Energy', 'Budgeting'],
    insideTheLearning: {
      lead:
        'Your child audits what your house actually spends on electricity, appliance by appliance. Watts times hours, then kilowatt-hours times the rate, and suddenly the numbers on the bill mean something. Then they rank the appliances, find where the waste is, and build a plan to cut it.',
      skills: [
        { skill: 'Number Sense', where: 'Multiplying watts by hours and kilowatt-hours by the rate, then scaling up to daily, weekly and monthly costs' },
        { skill: 'Organisation', where: 'Recording appliance data in tables, then sorting and ranking by what it costs' },
        { skill: 'Percentages', where: 'Working out what share of the total each appliance is responsible for' },
        { skill: 'Problem-Solving', where: 'Turning the findings into practical changes with estimated savings attached' },
      ],
    },
    format: 'Project Guide',
  },
  'farmers-market-challenge': {
    opening:
      'Your child takes a real budget to a farmers market, walks every stall before buying, compares unit prices from stall to stall, and plans a meal from what\'s in season. They talk to the growers, handle every purchase, then cook the meal with you and work out the cost per serving. Real money maths that ends with dinner.',
    whatsIncluded: [
      '5 steps from scouting the market to cooking the meal, each with your job and your kid\'s job',
      'A worked example on unit prices from two stalls',
      'Meal planning from what\'s in season and affordable',
      'Market Guide page: questions for growers, how produce is priced, a season chart and money tips',
      'Three levels at every step (Explore, Develop, Extend)',
    ],
    skillTags: ['Mental Maths', 'Budgeting', 'Estimation', 'Decision-Making'],
    insideTheLearning: {
      lead:
        'Your child shops a real market against a real budget, and every stall is a maths problem. Cost per kilo against cost per item. A running total in their head. Change checked before they walk away. They also have to talk to vendors, ask questions, and ask how much for half.',
      skills: [
        { skill: 'Number Sense', where: 'Running totals, calculating change, and scaling quantities on the spot' },
        { skill: 'Math', where: 'Unit pricing, working out cost per kilo, per bunch or per item to compare properly' },
        { skill: 'Financial Literacy', where: 'Staying inside a fixed budget and making the trade-offs that requires' },
        { skill: 'Pricing & Sales', where: 'Evaluating value across different vendors selling the same thing' },
        { skill: 'Planning', where: 'Choosing ingredients that work together as meals and still fit the budget' },
        { skill: 'Communication', where: 'Talking to vendors, asking real questions, and negotiating' },
      ],
    },
    format: 'Project Guide',
  },
  'garage-sale-math': {
    opening:
      'Your child runs a real garage sale, or a pretend one at home. They price their outgrown things, set a lowest price before anyone haggles, practise with tricky customers, make change and keep a sales log. Then they work out the real profit once the float goes back, and split it into spend, save and give.',
    whatsIncluded: [
      '5 steps from pricing to splitting the profit, each with your job and your kid\'s job',
      'A worked example on sales versus real profit',
      'Practice rounds with 4 tricky customers, including a haggle and a big bill',
      'Seller\'s Cheat Sheet: ballpark prices, making change and what not to sell',
      'Three levels at every step (Explore, Develop, Extend)',
    ],
    skillTags: ['Money Handling', 'Pricing', 'Percentages', 'Multiplication', 'Entrepreneurship'],
    insideTheLearning: {
      lead:
        'Your child runs an actual garage sale: prices the stock, handles the money, negotiates with customers and works out at the end whether they made anything. Profit stops being a definition when it is their own float and their own takings.',
      skills: [
        { skill: 'Pricing & Sales', where: 'Setting prices against condition, value and what the thing would really sell for, then negotiating' },
        { skill: 'Number Sense', where: 'Totalling sales, calculating change under pressure, and computing profit against cost' },
      ],
    },
    format: 'Project Guide',
  },
  'garden-plot-planner': {
    opening:
      'Your child designs and plants a real garden, from a backyard bed to a few pots. They measure the space, divide by plant spacing to see what really fits, budget the seeds, work out the soil, set harvest dates, then plant it and track the growth. Geometry, budgeting and science growing together.',
    whatsIncluded: [
      '5 steps from picking the spot to tracking the growth, each with your job and your kid\'s job',
      'A worked example on plant spacing: why the same bed fits 18 lettuces or 2 tomatoes',
      'Seed budget, soil estimate and a harvest-date calendar',
      'Garden Cheat Sheet: spacing, days to harvest, sun needs and growing on a budget',
      'Three levels at every step (Explore, Develop, Extend)',
    ],
    skillTags: ['STEM', 'Geometry', 'Measurement', 'Budgeting', 'Science', 'Planning'],
    insideTheLearning: {
      lead:
        'Your child designs a real garden plot and then plants it. Area and perimeter decide what fits. Division decides how many plants per row at the right spacing. Research decides what will survive there at all. Then they watch whether their plan was right, which takes a season.',
      skills: [
        { skill: 'Math', where: 'Measuring the space and calculating area and perimeter to see what will fit' },
        { skill: 'Number Sense', where: 'Dividing to work out plant spacing, plants per row and seed quantities, then pricing it against a limit' },
        { skill: 'Spatial Thinking', where: 'Designing a layout that gets everything into the space available' },
        { skill: 'Research', where: 'Investigating growing conditions, sun, water and season before committing' },
        { skill: 'Observation', where: 'Tracking growth against the plan and recording what actually happened' },
      ],
    },
    format: 'Project Guide',
  },
  'party-planner-math': {
    opening:
      'Your child plans a real party from start to finish on $5 per guest. They pick the guests, split the budget, work out how much food each person needs, divide it into packs and round up, then shop from their list and count back the party-day timeline. Then they host it and work out what it really cost per guest. Maths that ends with a party.',
    whatsIncluded: [
      '5 steps from the guest list to the final cost per guest',
      'Food per guest: multiply, divide into packs, round up',
      'A budget split, with decorations sorted into make, have, buy',
      'A party-day timeline counted back from the start',
      'A cheat sheet with amounts per guest and pack sizes',
    ],
    skillTags: ['Multiplication', 'Budgeting', 'Estimation', 'Planning', 'Division'],
    // Oct 19 2026: this page held "using math to make party plans" while the post sat deep.
    // Guide framing here so the post can own the how-to search.
    seo: {
      title: 'Party Planner Math: A Parent-Led Project Guide for Kids',
      description:
        'The guide your family follows to plan a real party on a budget: guest list, food quantities, price comparisons and a timeline, all worked out by your kid.',
    },
    insideTheLearning: {
      lead:
        'Your child plans a real party, and the maths is the only way to get there. Every food gets multiplied by the guests, divided into packs and rounded up, and every dollar has to fit inside the budget per guest. Then they host it and find out what it really cost.',
      skills: [
        { skill: 'Number Sense', where: 'Multiplying per guest, dividing into packs and rounding up' },
        { skill: 'Financial Literacy', where: 'Working inside a fixed budget, comparing prices and making the trade-offs that keep it there' },
      ],
    },
    format: 'Project Guide',
  },
  'road-trip-calculator': {
    opening:
      'Your child plans a real road trip: maps the route, works out the driving time with real stops, figures out the gas from miles per gallon and the price at the pump, and budgets the whole trip. Then they ride along as navigator, log what really happens and compare it with their plan. Geography meets maths on the open road.',
    whatsIncluded: [
      '5 steps from mapping the route to comparing the plan with the real drive',
      'Driving time with real speeds and real stops',
      'Gas cost from miles per gallon and the price at the pump',
      'A full trip budget with a buffer for surprises',
      'A cheat sheet with road trip numbers and twist cards',
    ],
    skillTags: ['Geography', 'Estimation', 'Budgeting', 'Distance', 'Planning'],
    seo: {
      title: 'Road Trip Math for Kids: Plan a Real Trip Budget, Ages 8-14',
      description:
        'Road trip math for kids: real distances, fuel costs, driving times and a full trip budget, worked out by your child before you leave. Ages 8-14.',
    },
    insideTheLearning: {
      lead:
        'Your child plans a real road trip with real distances. Divide the distance by the car\'s fuel use, multiply by the price at the pump, add the stops, work out driving times, compare two routes and find out one is cheaper but three hours longer. Then build a budget that survives the whole trip.',
      skills: [
        { skill: 'Math', where: 'Reading maps and calculating distances, then multi-step maths across fuel, time and expenses' },
        { skill: 'Budgeting', where: 'Estimating the real costs, comparing options and staying inside the total' },
        { skill: 'Planning', where: 'Scheduling the stops, managing the time and planning the route end to end' },
      ],
    },
    format: 'Project Guide',
  },
  'savings-goal-tracker': {
    opening:
      'Your child picks something real they want, finds the true price and turns it into a date: the gap divided by what they can save each week. They find ways to earn more, track every deposit and the percent of the goal, and do the maths when tempted to spend, until they buy it with their own money. Financial literacy that builds real habits.',
    whatsIncluded: [
      '5 steps from picking the goal to buying it with their own money',
      'The gap and the timeline: how many weeks, rounded up',
      'Ways to earn more, with an hourly rate for each',
      'A tracker with the percent of the goal, plus the spending test',
      'A toolkit with tracker columns and milestones',
    ],
    skillTags: ['Financial Literacy', 'Goal Setting', 'Data Tracking', 'Percentages'],
    insideTheLearning: {
      lead:
        'Your child sets a real savings goal and tracks it to the end. Percentage of the way there, weekly target, how many weeks left at this rate. They graph it. And every time they want to spend, opportunity cost stops being abstract.',
      skills: [
        { skill: 'Number Sense', where: 'Running totals across deposits and withdrawals, and the change calculations underneath' },
        { skill: 'Percentages', where: 'Working out how far along they are and what share is saved' },
        { skill: 'Budgeting', where: 'Setting the weekly target, then adjusting the plan when real life interferes' },
        { skill: 'Data & Graphs', where: 'Recording the numbers over time and charting the progress' },
        { skill: 'Decision-Making', where: 'Weighing a want against the goal, and understanding what the trade costs' },
      ],
    },
    format: 'Project Guide',
  },
  'sports-stats-lab': {
    opening:
      'Your child picks a sport and a question, then collects real stats from their own play, a game they watch or a backyard shooting test. They work out averages, use percentages to compare players fairly, spot the trend and predict the next game. STEM maths through the sport they care about, where the biggest total is not always the best stat.',
    whatsIncluded: [
      '5 steps from a question to a prediction checked against the next game',
      'A backyard shooting test for kids without a team',
      'Averages, the range, and the odd game that pulls them',
      'Percentages and per-game rates for fair comparisons',
      'A stats toolkit: what to track, fair comparisons, which chart',
    ],
    skillTags: ['STEM', 'Statistics', 'Data Visualisation', 'Averages', 'Percentages', 'Analysis'],
    insideTheLearning: {
      lead:
        'Your child collects real stats from a sport they care about and does statistics with them. Averages, shooting percentages, win rates. They chart it, rank players fairly using the numbers, and then predict what happens next and see whether they were right.',
      skills: [
        { skill: 'Percentages', where: 'Calculating averages, shooting percentages, win rates and success rates' },
        { skill: 'Organisation', where: 'Recording stats in tables, sorting them, then graphing to reveal the pattern and predict from it' },
      ],
    },
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // CRITICAL THINKING
  // ═══════════════════════════════════════════════════════════════════
  'media-info-check': {
    opening:
      'Your child picks a piece of online content and figures out whether it is trustworthy. They check five reliability signals, look for real evidence, cross-check with a second source, and make a call: reliable, misleading, or unsure. The habit of pausing before believing or sharing.',
    whatsIncluded: [
      'Five-signal quick check for any content',
      'Evidence evaluation (strong vs. weak proof)',
      'Cross-checking with second sources',
      'Share-or-wait decision framework',
      'Six ready-to-use scenario cards for offline practice',
    ],
    skillTags: ['Critical Thinking', 'Media Literacy', 'Digital Literacy'],
    insideTheLearning: {
      lead:
        'Your child runs a five-signal check on real content and decides whether it holds up. The technical part is checking sources and spotting what has been left out. The harder part is noticing that something was built to make them angry, and pausing anyway.',
      skills: [
        { skill: 'Critical Thinking', where: 'Questioning a claim even when the source looks entirely legitimate' },
        { skill: 'Digital Literacy', where: 'Checking sources, reading for context, and noticing what is missing' },
        { skill: 'Emotional Regulation', where: 'Pausing before reacting to content engineered to provoke' },
        { skill: 'Communication', where: 'Explaining their reasoning calmly, with the evidence attached' },
      ],
    },
    format: 'Project Guide',
  },
  'micro-business': {
    opening:
      'Your child designs a real business from scratch. They pick an idea, figure out who would actually pay for it, set prices that make money, build a brand, create a marketing plan, and pitch the whole thing out loud. Whether they actually launch or just walk through every step, the thinking is identical to what real entrepreneurs do.',
    whatsIncluded: [
      'Business idea selection with 12 starter cards',
      'Customer research and problem-solving',
      'Pricing strategy with real profit math',
      'Brand building and marketing plan',
      'Pitch practice and Version 2 revision',
    ],
    skillTags: ['Entrepreneurship', 'Problem-Solving', 'Communication'],
    insideTheLearning: {
      lead:
        'Your child runs a genuinely small business, start to finish. They pick the idea, ask customers what they actually want, price it with real profit maths, build the brand, and pitch it. Some of it will not work, and fixing it is the part that teaches.',
      skills: [
        { skill: 'Research', where: 'Asking real customers what they need before building anything' },
        { skill: 'Financial Literacy', where: 'Pricing it with real profit maths rather than a number that sounds nice' },
        { skill: 'Problem-Solving', where: 'Working out what is not landing and changing it' },
        { skill: 'Communication', where: 'Building the brand and pitching it to people who might buy' },
        { skill: 'Resilience', where: 'Keeping going when the first version does not sell' },
      ],
    },
    format: 'Project Guide',
  },
  'problem-solver': {
    opening:
      'Your child picks a real problem, figures out who it affects, brainstorms solutions, builds a prototype from whatever is around the house, tests it, gets feedback, and makes it better. Design thinking the way real engineers and inventors actually work, applied to everyday life.',
    whatsIncluded: [
      'Real problem identification with 8 starter cards',
      'Who-does-this-affect research step',
      'Brainstorming with constraints',
      'Prototype building with household materials',
      'Testing, feedback, and Version 2 revision',
    ],
    skillTags: ['Critical Thinking', 'Problem-Solving', 'Creativity'],
    insideTheLearning: {
      lead:
        'Your child picks a real problem, works out who it actually affects, then builds a prototype out of what is in the house and tests it on someone. It fails somewhere, gets revised, and gets tested again. The revision loop is the whole point.',
      skills: [
        { skill: 'Critical Thinking', where: 'Identifying a problem worth solving and researching who it really affects' },
        { skill: 'Problem-Solving', where: 'Brainstorming inside real constraints and building a prototype from household materials' },
        { skill: 'Planning', where: 'Sequencing the build so it gets finished, not just started' },
        { skill: 'Communication', where: 'Testing it on a real person and taking what they say seriously' },
      ],
    },
    format: 'Project Guide',
  },
  'travel-day': {
    opening:
      'Your child plans a real day out, like a theme park, a zoo, a city or a travel day. They collect a must-do from each person, put the stops in the order that wastes the least time, build a timeline with buffers and a budget, and write a Plan B for what could go wrong. Then they lead the day and compare the plan with what really happened.',
    whatsIncluded: [
      '5 steps from must-dos to leading the day',
      'Order rules that stop the day doubling back',
      'Time math with buffers, slack and a budget',
      'Plan B swaps for rain, closures and tired kids',
      'A Plan vs real table in a Day Planner Toolkit',
    ],
    skillTags: ['Planning', 'Time Management', 'Budgeting', 'Problem-Solving', 'Flexibility'],
    insideTheLearning: {
      lead:
        'Your child learns that a good day out is not the one with the most in it. It is the one in the right order, with room for things to go wrong. The same list in a different order can save an hour, and a Plan B turns a change into a decision instead of a meltdown.',
      skills: [
        { skill: 'Planning', where: 'Collecting must-dos, fixed times and prices before the day' },
        { skill: 'Critical Thinking', where: 'Finding the order that saves the most time on the map' },
        { skill: 'Math', where: 'Elapsed time, buffers, slack and adding up the costs' },
        { skill: 'Communication', where: 'Hearing what everyone wants and leading the family through the day' },
        { skill: 'Self-Management', where: 'Staying calm and switching to Plan B when something changes' },
      ],
    },
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // SELF-MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════
  'time-energy-planner': {
    opening:
      'Your child maps their own energy patterns, figures out when their brain actually works best, and builds a daily plan that matches hard tasks to high-energy windows. Then they test it in real life and fix what does not work. Self-awareness and planning skills that most adults never learn.',
    whatsIncluded: [
      'Brain dump and task sorting by priority',
      'Personal energy mapping throughout the day',
      'Task-to-energy matching system',
      'Time-blocked daily plan with buffers',
      'Real-life testing and Version 2 revision',
    ],
    skillTags: ['Planning', 'Self-Awareness', 'Life Skills'],
    insideTheLearning: {
      lead:
        'Your child maps when they actually have energy across a day, then matches tasks to it instead of fighting it. Brain dump, sort by priority, block the day with buffers built in. Then they test it against a real day and find out where it was optimistic.',
      skills: [
        { skill: 'Executive Functioning', where: 'Dumping every task out, sorting by priority, and building a time-blocked plan' },
        { skill: 'Planning', where: 'Matching hard tasks to high-energy hours and leaving buffers for reality' },
        { skill: 'Emotional Regulation', where: 'Noticing their own patterns instead of pushing through and crashing' },
        { skill: 'Problem-Solving', where: 'Testing the plan on a real day and fixing what did not survive' },
      ],
    },
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // LITERACY
  // ═══════════════════════════════════════════════════════════════════
  'community-impact': {
    opening:
      'Your child picks a real problem in their neighbourhood, figures out who it affects, designs a solution, builds a plan, and does something about it. Leadership, empathy, and project management through a project that actually matters to real people.',
    whatsIncluded: [
      'Neighbourhood needs spotting with 6 project idea cards',
      'Who-does-this-affect research step',
      'Solution design and action planning',
      'Project execution with real-world logistics',
      'Reflection and Version 2 thinking',
    ],
    skillTags: ['Leadership', 'Problem-Solving', 'Community'],
    // Oct 19 2026: this page held "community impact project" while the post sat deep.
    // Guide framing here so the post can own the how-to search.
    seo: {
      title: 'Community Impact: A Parent-Led Project Guide for Kids',
      description:
        'The guide your family follows to tackle a real neighbourhood problem: spot the need, find who it affects, plan a fix and carry it out together.',
    },
    insideTheLearning: {
      lead:
        'Your child finds something their own neighbourhood actually needs, works out who it affects, and then does something about it. The logistics are real, which is the point. A plan that survives contact with other people teaches more than a plan that stays on paper.',
      skills: [
        { skill: 'Planning', where: 'Designing the project and handling the real logistics that make it happen' },
        { skill: 'Communication', where: 'Talking to the people it affects, before and after' },
        { skill: 'Reflection', where: 'Working out what actually changed, and what they would do differently' },
      ],
    },
    format: 'Project Guide',
  },
  'write-like-a-pro': {
    opening:
      'Your child picks a real writing style (review, opinion piece, how-to guide, letter, short story, news report, or song), chooses a topic they care about, and writes a finished piece for a real audience. Drafting, editing, and revising the way actual writers work, not a five-paragraph essay for nobody.',
    whatsIncluded: [
      'Seven Writing Style Cards with real-world examples',
      'Topic selection and audience targeting',
      'Drafting with structure and voice',
      'Self-editing and revision process',
      'Final draft and Version 2 polish',
    ],
    skillTags: ['Writing', 'Communication', 'Creative Thinking'],
    insideTheLearning: {
      lead:
        'Your child picks one style and one real reader, and finds out the reader decides the words: what goes first, what gets cut, how formal to sound. Then they revise their own draft, which means seeing the gap between what they meant and what they actually put on the page.',
      skills: [
        { skill: 'Audience Awareness', where: 'Thinking about who is reading and letting that change the words, tone and detail' },
        { skill: 'Persuasion', where: 'Making a point and supporting it so someone else can follow the thinking' },
        { skill: 'Confidence', where: 'Revising their own work to something they know is good, and finishing it' },
      ],
    },
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // AI & DIGITAL LITERACY
  // ═══════════════════════════════════════════════════════════════════
  'ai-basics': {
    opening:
      'Help kids understand what AI actually is, what it isn\'t, and how to use it responsibly. Activities cover how AI works, common myths vs reality, healthy AI interactions, and setting smart rules for AI use. The foundation every kid needs before using any AI tool.',
    whatsIncluded: [
      'What AI actually is, and what it isn\'t',
      'Common AI myths vs reality exploration',
      'Healthy and useful AI interaction practice',
      'Smart rules and boundaries for AI use',
      'Reflection prompts and family discussion guides',
    ],
    skillTags: ['STEM', 'AI Literacy', 'Critical Thinking', 'Digital Citizenship'],
    insideTheLearning: {
      lead:
        'Your child sorts out what AI actually is from what people claim it is, myth by myth, then writes the rules your family will use it by. The point is accurate understanding rather than hype in either direction, and rules they helped set are rules they will actually keep.',
      skills: [
        { skill: 'AI Literacy', where: 'Separating what the technology really does from the hype, one myth at a time' },
        { skill: 'Critical Thinking', where: 'Questioning an answer and checking it instead of taking it at face value' },
        { skill: 'Digital Citizenship', where: 'Working out what safe and respectful use looks like in your house' },
        { skill: 'Decision-Making', where: 'Setting the boundaries and smart rules they will hold themselves to' },
        { skill: 'Communication', where: 'Explaining back, in their own words, what AI is and what it is not' },
      ],
    },
    format: 'Project Guide',
  },
  'algorithm-awareness': {
    opening:
      'Teach kids how algorithms shape what they see online, and what they don\'t. Activities explore recommendation systems, filter bubbles, engagement tricks, and how to take back control of their feed. Critical thinking for the attention economy.',
    whatsIncluded: [
      'How recommendation algorithms work',
      'Filter bubble exploration and awareness',
      'Engagement trick identification',
      'Feed audit and control strategies',
      'Reflection on personal online habits',
    ],
    skillTags: ['STEM', 'Algorithm Literacy', 'Critical Thinking', 'Digital Citizenship', 'Self-Awareness'],
    insideTheLearning: {
      lead:
        'Your child audits their own feed and works out why it shows them exactly what it shows them. They map how the recommendations are built, find the specific tricks used to hold their attention, then track what all of it does to their mood and their time. Hard to unsee once they have seen it.',
      skills: [
        { skill: 'Digital Literacy', where: 'Working out how a recommendation feed decides what to put in front of them' },
        { skill: 'Critical Thinking', where: 'Spotting the engagement tricks a feed uses to keep them scrolling' },
        { skill: 'Reflection', where: 'Tracking what their own feed does to their mood, their time and their habits' },
        { skill: 'Self-Direction', where: 'Auditing the feed and taking back control of what it serves them' },
        { skill: 'Decision-Making', where: 'Choosing deliberately what to follow rather than letting the algorithm choose' },
      ],
    },
    format: 'Project Guide',
  },
  'bias-fairness-lab': {
    opening:
      'Explore how AI can be unfair, and what to do about it. Kids investigate real examples of AI bias, examine who gets left out, test for fairness in prompts and outputs, and design better AI choices. Ethics and empathy applied to technology.',
    whatsIncluded: [
      'Real examples of AI bias investigation',
      'Fairness testing in AI prompts and outputs',
      'Who gets included and who gets left out',
      'Designing more equitable AI decisions',
      'Ethics discussion prompts and reflection',
    ],
    skillTags: ['STEM', 'Ethics', 'Critical Thinking', 'AI Literacy', 'Empathy', 'Fairness'],
    insideTheLearning: {
      lead:
        'Your child tests an AI on real prompts and finds the places where it quietly treats people differently. Then they work out who gets left out by that, put into words why it is unfair, and redesign the prompt to do better. It is critical thinking with a machine that argues back.',
      skills: [
        { skill: 'Critical Thinking', where: 'Spotting the assumptions buried inside an answer that looks neutral' },
        { skill: 'AI Literacy', where: 'Understanding where the limits of an AI output actually are' },
        { skill: 'Empathy', where: 'Thinking through whose needs get missed when a system decides' },
        { skill: 'Communication', where: 'Putting into words why a particular result feels unfair' },
        { skill: 'Decision-Making', where: 'Redesigning the prompt to get a more equitable outcome' },
      ],
    },
    format: 'Project Guide',
  },
  'build-ai-helper': {
    opening:
      'Design and plan your own AI helper: what it does, how it works, what data it needs, and what ethical rules it follows. Kids think through the entire process of creating a useful AI tool, from concept to ethics framework. No coding required, just creative, structured thinking.',
    whatsIncluded: [
      'AI helper concept design and purpose planning',
      'Data requirements and privacy considerations',
      'Ethical rules and boundaries framework',
      'User experience and interaction design',
      'Presentation of final AI helper concept',
    ],
    skillTags: ['STEM', 'AI Literacy', 'Design Thinking', 'Ethics', 'Planning', 'Creativity'],
    // Oct 26 2026: page one with 0 clicks on the default "Name | Category" title.
    seo: {
      title: 'Build Your Own AI Helper: A Kids Project Guide, Ages 9-14',
      description:
        'The guide your family follows to design an AI helper: what it does, what data it needs and the rules it must follow. No coding. Ages 9 to 14.',
    },
    insideTheLearning: {
      lead:
        'Your child designs an AI helper for a job that actually needs doing in your house. They work out what it would need to know, what it must never be given, and how to write instructions clear enough that it behaves. Then they test it, find where it falls over, and fix it.',
      skills: [
        { skill: 'Problem-Solving', where: 'Choosing a real job worth handing over, and designing something that could do it' },
        { skill: 'AI Literacy', where: 'Working out what the system would need to know and where it would fail' },
        { skill: 'Online Safety & Privacy', where: 'Deciding what information it should never be given access to' },
        { skill: 'Communication', where: 'Writing prompts precise enough that the helper does what was intended' },
        { skill: 'Reflection', where: 'Testing it, finding the gaps, and improving the design from what broke' },
      ],
    },
    format: 'Project Guide',
  },
  'create-with-ai': {
    opening:
      'Explore creative AI tools responsibly. Kids learn to use AI for writing, art, and brainstorming while understanding copyright, attribution, and the difference between using AI as a tool vs letting it do the work. Creativity meets responsibility.',
    whatsIncluded: [
      'Creative AI tool exploration and practice',
      'AI for writing, art, and brainstorming',
      'Copyright, attribution, and ownership understanding',
      'Tool vs replacement: knowing the difference',
      'Ethical creation guidelines and reflection',
    ],
    skillTags: ['AI Literacy', 'Creativity', 'Ethics', 'Digital Citizenship', 'Art'],
    insideTheLearning: {
      lead:
        'Your child uses AI to make something, then has to be straight about how they made it. Where the tool stops and their own work starts is the real question, and it is one plenty of adults get wrong. They practise attributing honestly and deciding when using it is fine and when it is not.',
      skills: [
        { skill: 'Creative Thinking', where: 'Making something genuinely original with the tool rather than letting it decide' },
        { skill: 'Digital Citizenship', where: 'Understanding consent, attribution and who owns what was made' },
        { skill: 'Decision-Making', where: 'Judging when using AI is appropriate and when it is not' },
        { skill: 'Communication', where: 'Being clear and honest about their process and their sources' },
      ],
    },
    format: 'Project Guide',
  },
  'deepfake-spotter': {
    opening:
      'Teach kids to spot manipulated images, videos, and content. Activities cover deepfake detection, image verification, "pause before sharing" habits, and how to evaluate whether what they\'re seeing is real. Media literacy for a world where seeing is no longer believing.',
    whatsIncluded: [
      'Deepfake detection techniques and practice',
      'Image and video verification methods',
      '"Pause before sharing" habit building',
      'Real vs manipulated content analysis',
      'Critical evaluation framework for visual media',
    ],
    skillTags: ['Media Literacy', 'Critical Thinking', 'AI Literacy', 'Verification'],
    insideTheLearning: {
      lead:
        'Your child learns to tell manipulated images and video from real ones, using actual verification techniques. Then comes the harder skill: noticing that a post is engineered to make them feel something, and pausing before they share it.',
      skills: [
        { skill: 'Observation', where: 'Reading an image or video for the evidence of manipulation' },
        { skill: 'Digital Citizenship', where: 'Building the habit of verifying before passing something on' },
        { skill: 'Emotional Regulation', where: 'Recognising when content is designed to provoke, and not taking the bait' },
        { skill: 'Decision-Making', where: 'Deciding what is worth sharing, and being able to say why' },
      ],
    },
    format: 'Project Guide',
  },
  'hallucination-detective': {
    opening:
      'Investigation activities that teach kids to spot when AI gets things wrong. Kids learn about AI hallucinations, practise verifying AI outputs, understand why AI makes confident mistakes, and develop the habit of always checking before trusting. Healthy scepticism for the AI age.',
    whatsIncluded: [
      'What AI hallucinations are and why they happen',
      'Fact-checking AI outputs: practical techniques',
      'Why AI sounds confident even when wrong',
      'Verification habit building',
      'Real examples of AI mistakes to investigate',
    ],
    skillTags: ['STEM', 'Critical Thinking', 'AI Literacy', 'Research', 'Verification'],
    insideTheLearning: {
      lead:
        'Your child gets an AI to state something confidently and wrong, then proves it. That is the whole hook. They cross-check sources, learn why a system sounds certain when it has no idea, and build the habit of verifying before believing.',
      skills: [
        { skill: 'Critical Thinking', where: 'Healthy scepticism plus real verification, cross-checking a claim against other sources' },
        { skill: 'Writing', where: 'Asking better follow-up questions and revising their own work into a second version' },
      ],
    },
    format: 'Project Guide',
  },
  'healthy-tech-boundaries': {
    opening:
      'Help your child create a personal technology and AI boundaries plan. Activities cover screen time awareness, digital wellbeing, setting healthy limits, managing notifications, and building a balanced relationship with technology. Not anti-tech, just pro-balance.',
    whatsIncluded: [
      'Screen time awareness and tracking activities',
      'Digital wellbeing self-assessment',
      'Personal boundaries plan creation',
      'Notification and distraction management',
      'Balanced technology relationship building',
    ],
    skillTags: ['Digital Wellbeing', 'Self-Management', 'Boundaries', 'Self-Awareness'],
    insideTheLearning: {
      lead:
        'Your child tracks their own screen time honestly, sees what it does to them, and then sets their own boundaries. Rules they wrote hold far better than rules handed down. They also go into the notification settings and turn off the things engineered to interrupt them.',
      skills: [
        { skill: 'Reflection', where: 'Tracking their real usage and assessing honestly how it affects them' },
        { skill: 'Self-Direction', where: 'Building habits and boundaries they set themselves' },
        { skill: 'Decision-Making', where: 'Planning what balanced technology use actually looks like for them' },
        { skill: 'Engineering', where: 'Getting into notification and distraction settings and configuring them deliberately' },
        { skill: 'Digital Citizenship', where: 'Taking responsibility for their own digital life rather than being managed' },
      ],
    },
    format: 'Project Guide',
  },
  'privacy-footprint': {
    opening:
      'Map your digital footprint and understand online privacy. Kids discover what personal data they share, how data trails work, smart sharing practices, and how to protect their personal information. Practical privacy skills every kid needs, not fear-based, just empowering.',
    whatsIncluded: [
      'Digital footprint mapping activities',
      'Personal data sharing audit',
      'How data trails work: tracking and cookies',
      'Smart sharing practices and privacy settings',
      'Personal privacy plan creation',
    ],
    skillTags: ['Privacy', 'Digital Citizenship', 'Critical Thinking', 'Self-Protection'],
    insideTheLearning: {
      lead:
        'Your child maps their own digital footprint and sees the trail they have already left. What is personal, what is public, and how tracking actually works. Then they go into the settings and change them, and practise saying no when an app asks for more than it needs.',
      skills: [
        { skill: 'Online Safety & Privacy', where: 'Sorting personal information from public, and seeing how data trails get built' },
        { skill: 'Critical Thinking', where: 'Thinking clearly about what sharing costs and who benefits from it' },
        { skill: 'Decision-Making', where: 'Setting privacy settings and sharing habits deliberately' },
        { skill: 'Digital Citizenship', where: 'Healthy boundaries online, and the confidence to advocate for their own' },
      ],
    },
    format: 'Project Guide',
  },
  'prompt-like-a-coach': {
    opening:
      'Teach kids to get better results from AI by writing better prompts. Activities cover prompt structure, asking better questions, healthy AI use (not copying), and learning to guide AI rather than just accepting its first answer. A skill that will matter for their entire lives.',
    whatsIncluded: [
      'Prompt structure and quality frameworks',
      'Better question writing techniques',
      'Iterating and refining AI conversations',
      'Healthy AI use: guide, don\'t copy',
      'Real practice scenarios with reflection',
    ],
    skillTags: ['AI Literacy', 'Communication', 'Critical Thinking', 'Writing'],
    insideTheLearning: {
      lead:
        'Your child learns to use AI as a tutor instead of an answer machine. That means writing specific instructions, asking it to explain rather than produce, and checking what comes back. The distinction between being coached and copying is the actual lesson.',
      skills: [
        { skill: 'Communication', where: 'Writing instructions specific enough to get something useful back' },
        { skill: 'Critical Thinking', where: 'Checking and revising the output instead of accepting it' },
        { skill: 'Writing', where: 'Organising their own thinking, using AI to practise and explain rather than to copy' },
      ],
    },
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // LIFE SKILLS
  // ═══════════════════════════════════════════════════════════════════
  'future-ready-skills-map': {
    opening:
      'Ever wonder if you\'re actually preparing your kid for real life, or just keeping them busy? This map answers it. Twelve skill areas, from reading and real-world math to critical thinking, AI, and emotional intelligence, laid out by age so you can see what matters now and what comes next. Not a curriculum. A clear picture, with hands-on ideas for every area.',
    whatsIncluded: [
      'The whole map on one page: all 12 skill areas, side by side for ages 6 to 11 and 11 to 14+',
      '24 skill pages: what to develop, what progress looks like (with checkboxes), and 4 to 6 hands-on ideas each',
      'A "Real talk" note from a former teacher in every area',
      'A sample week for each age band, showing how it all fits into ordinary days',
      'A "Your first 10 minutes" start page and a clickable table of contents',
      'Phone, color print, and black & white versions, yours to keep',
    ],
    skillTags: ['Parent guide', 'Ages 6 to 14+', '12 skill areas', 'Life Skills', 'Critical Thinking'],
    insideTheLearning: {
      lead:
        'It\'s for parents who want the big picture without a curriculum: you read your kid\'s column, circle two or three areas, and pick one idea for this week. It\'s not a lesson plan or a stack of worksheets, and it\'s not something your kid works through alone. It\'s a map for you, so the learning you do together has a direction.',
      skills: [
        { skill: 'Know what matters now', where: 'One page shows every area for your kid\'s age, so you stop guessing' },
        { skill: 'See progress', where: 'Simple checkboxes for what your kid already does, not a list to feel behind on' },
        { skill: 'Ideas that fit real life', where: 'Hands-on ways to build each skill at the kitchen table, outside, or on the road' },
        { skill: 'A long view', where: 'Two age bands, 6 to 11 and 11 to 14+, so you can see where each skill is heading' },
      ],
    },
    format: 'Parent Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // COMMUNICATION & WRITING - Individual Guides
  // ═══════════════════════════════════════════════════════════════════
  'adventure-story-map': {
    opening:
      'Your kid walks a place they know like a storyteller, draws a map of it, and writes an adventure that happens right there, on its paths and next to its landmarks. A reader can follow the whole story with the map in hand. Descriptive writing, map-making and story structure in one project.',
    whatsIncluded: [
      'A what-if walk to collect story spots and sense details',
      'Drawing a map from above, with a compass and a paced-out scale',
      'Planning a character, a problem and an ending on the map',
      'Writing the story with sounds, smells and dialogue from the walk',
      'Linking story to map so someone else can follow the route',
    ],
    skillTags: ['Creative Writing', 'Storytelling', 'Planning', 'Narrative', 'Art'],
    // Oct 26 2026: page one with 0 clicks on the default "Name | Category" title.
    seo: {
      title: 'Adventure Story Map: Plan and Write a Story, Ages 6-14',
      description:
        'The guide your family follows to map a real place your kid knows, then write an adventure set right there that a reader can follow on the map. Ages 6 to 14.',
    },
    insideTheLearning: {
      lead:
        'Your child maps a real place they know well, then sets an invented story inside it. The map forces them to translate a three-dimensional place they can walk through into a flat drawing, and the story forces them to notice the details that make a made-up event feel true. Descriptive writing gets much easier when the setting is a place they can go and stand in.',
      skills: [
        { skill: 'Writing', where: 'Building characters, plot and dialogue on a structured story arc, beginning through end' },
        { skill: 'Observation', where: 'Noticing the real details in a place that make invented events feel authentic' },
        { skill: 'Spatial Thinking', where: 'Translating a real three-dimensional space into a two-dimensional map' },
        { skill: 'Creative Thinking', where: 'Imagining fictional events inside a setting they actually know' },
      ],
    },
    format: 'Project Guide',
  },
  'community-tour-guide': {
    opening:
      'Research, write, and present a guided tour of your community. Kids choose what matters most about where they live, dig up its stories, and lead a real walking tour. A project that connects writing skills with local knowledge and pride in place.',
    whatsIncluded: [
      'Community research and tour planning guide',
      'Point, tell, ask: a three-part formula for every stop',
      'A practice house tour, then facts and stories from signs, neighbours and local sources',
      'Presentation and delivery practice',
      'Extension ideas for digital or illustrated guides',
    ],
    skillTags: ['Writing', 'Presentation', 'Research', 'Communication', 'Community'],
    insideTheLearning: {
      lead:
        'Your child researches their own town and then runs a real guided tour of it for a live audience. Research turns into a narrative, the narrative has to hold attention, and the route has to flow from one stop to the next. Standing in front of people and leading it is the part that changes them.',
      skills: [
        { skill: 'Research', where: 'Digging up the facts, stories and details about a place they thought they knew' },
        { skill: 'Storytelling', where: 'Turning those facts into a narrative that actually holds attention' },
        { skill: 'Organisation', where: 'Structuring the tour so it flows logically from first stop to last' },
        { skill: 'Public Speaking', where: 'Presenting clearly and confidently to a live audience' },
        { skill: 'Audience Awareness', where: 'Adjusting how they deliver it based on who is actually listening' },
        { skill: 'Confidence', where: 'Standing in front of people and leading the whole experience' },
      ],
    },
    format: 'Project Guide',
  },
  'directions-challenge': {
    opening:
      'Write clear, step-by-step directions and test whether someone else can follow them. Kids discover how hard precise communication really is, and get better at it through practice, testing, and feedback. The kind of writing skill they will use every day of their lives.',
    whatsIncluded: [
      'Pick a route or task and write the first directions',
      'A word-for-word test run where you follow only what was said',
      'Finding the breakdown: vague, missing, out of order or assumed',
      'Rewrite and run it again',
      'Look back: where else being clear matters',
    ],
    skillTags: ['Procedural Writing', 'Clarity', 'Communication', 'Logic', 'Testing'],
    insideTheLearning: {
      lead:
        'Your child writes directions and someone else follows them exactly as written. It goes wrong immediately, which is the point. What is obvious in their head turns out to be missing on the page, and they have to watch a real person get lost to see it.',
      skills: [
        { skill: 'Observation', where: 'Watching where the listener goes wrong and working out which word caused it' },
        { skill: 'Empathy', where: 'Realising that what is obvious to them is not obvious to anyone else' },
        { skill: 'Problem-Solving', where: 'Sequencing the steps properly and fixing the breakdown in real time' },
      ],
    },
    format: 'Project Guide',
  },
  'family-debate-night': {
    opening:
      'A structured debate framework for the whole family. Kids prepare arguments, present their case, respond to counterpoints, and learn to disagree respectfully. Builds persuasive speaking, active listening, and the confidence to express opinions clearly.',
    whatsIncluded: [
      'Family debate structure and rules guide',
      'Topic ideas and a check that both sides are arguable',
      'Argument preparation framework',
      'Active listening and rebuttal practice',
      'Reflection prompts on persuasion and respect',
    ],
    skillTags: ['Persuasion', 'Critical Thinking', 'Listening', 'Public Speaking', 'Respect'],
    insideTheLearning: {
      lead:
        'Your child argues a real position in front of the family, with reasons and evidence rather than volume. They pick a side, research the best point on the other side so they can answer it first, then actually listen to the rebuttal and respond to what was said. Disagreeing well is a rarer skill than winning.',
      skills: [
        { skill: 'Persuasion', where: 'Building a case out of reasons and evidence instead of opinion' },
        { skill: 'Critical Thinking', where: 'Working through both sides of an issue before deciding, then reasoning to a conclusion' },
        { skill: 'Public Speaking', where: 'Presenting the argument clearly and with some confidence' },
        { skill: 'Listening', where: 'Actually hearing the other side and responding to their points, not their person' },
      ],
    },
    format: 'Project Guide',
  },
  'family-recipe-book': {
    opening:
      'Create a family recipe book that captures both the food and the stories behind it. Kids interview family members, cook each dish from their own notes, and write instructions clear enough for anyone to follow. Procedural writing meets family storytelling in a meaningful keepsake.',
    whatsIncluded: [
      'Taste detective: guess the ingredients, then check with the cook',
      'Interviewing the cooks for the recipe and the story',
      'Cooking from their own notes to find the gaps',
      'Recipe cards a stranger could follow',
      'Putting the cookbook together and giving it back',
    ],
    skillTags: ['Procedural Writing', 'Interviewing', 'Design', 'Family History', 'Storytelling'],
    insideTheLearning: {
      lead:
        'Your child interviews the family, collects the recipes nobody has written down, and turns them into a book someone else could actually cook from. Procedural writing is unforgiving: if a step is missing, the dish fails. Editing for clarity has never had a more obvious test.',
      skills: [
        { skill: 'Writing', where: 'Writing step-by-step instructions clear enough for a stranger to follow, then editing out every ambiguity' },
        { skill: 'Organisation', where: 'Structuring a multi-recipe book with formatting that stays consistent throughout' },
      ],
    },
    format: 'Project Guide',
  },
  'market-stall-pitch': {
    opening:
      'Your kid picks something to sell, prices it to make a profit, writes a 30-second pitch and sells it to real customers at a stall, then counts up the money. Persuasion, money math and the nerve to handle a no.',
    whatsIncluded: [
      'Pitch planning and writing guide',
      'Persuasive language and techniques',
      'Audience awareness and adaptation tips',
      'Delivery and presentation practice',
      'Pricing that covers costs, making change and working out profit',
    ],
    skillTags: ['Persuasion', 'Communication', 'Entrepreneurship', 'Public Speaking', 'Confidence'],
    insideTheLearning: {
      lead:
        'Your child pitches a real product to real people who can walk away. That is the whole thing. They read the customer in front of them, adjust on the fly, handle the objection they did not expect, and keep going after someone says no.',
      skills: [
        { skill: 'Persuasion', where: 'Convincing someone the product is worth their time or their money' },
        { skill: 'Audience Awareness', where: 'Reading the customer and changing the message to suit them' },
        { skill: 'Confidence', where: 'Speaking up, holding eye contact, and handling rejection without folding' },
        { skill: 'Entrepreneurship', where: 'Understanding value, pricing, and what a customer actually wants' },
        { skill: 'Creative Thinking', where: 'Finding an interesting way to present the product, and answering objections on the spot' },
      ],
    },
    format: 'Project Guide',
  },
  'mini-magazine-creator': {
    opening:
      'Your child picks a topic they could talk about for hours and makes a whole magazine about it: an article, a tips list, a quiz, a how-to, each with a headline that makes someone want to read it. They research the facts, design the pages, and hand copies to real readers.',
    whatsIncluded: [
      'Cover remix warm-up and issue planning',
      'Research with a second-source check',
      'Four kinds of writing, each with its own headline',
      'Booklet layout and a first-time-reader edit',
      'Publishing to readers and planning Issue 2',
    ],
    skillTags: ['Writing', 'Design', 'Multiple Text Types', 'Creativity', 'Publishing'],
    insideTheLearning: {
      lead:
        'Your child produces a whole magazine, and the point is that no two pages are the same kind of writing. An article, a tips list, a quiz, a how-to. Four writing styles in one project, each with a different job, all edited to hold together.',
      skills: [
        { skill: 'Writing', where: 'Informational, opinion, procedural and playful writing in one publication, then edited to hold together' },
        { skill: 'Research', where: 'Finding real facts and information to stand the articles up' },
        { skill: 'Audience Awareness', where: 'Writing something a reader would actually enjoy and use, and laying it out to be read' },
      ],
    },
    format: 'Project Guide',
  },
  'my-review-column': {
    opening:
      'Your child becomes a reviewer: a blind taste test, a rating system they invent, then reviews of real things from their own week, each with an opinion, a reason, proof and one fair downside, good enough for someone else to decide from.',
    whatsIncluded: [
      'A blind taste test warm-up',
      'Invent your own rating system',
      'Reviewer\'s-eye notes and cost per use',
      'Opinion, reason, proof, downside, verdict',
      'Publish the column and test it on readers',
    ],
    skillTags: ['Opinion Writing', 'Critical Analysis', 'Communication', 'Voice', 'Math'],
    insideTheLearning: {
      lead:
        'Your child writes reviews of real things and has to be fair rather than just enthusiastic. An opinion needs specific reasons behind it. A description needs enough detail that a reader can picture it. Doing several in the same format is where the discipline comes in.',
      skills: [
        { skill: 'Writing', where: 'Forming a clear opinion, stating it confidently, and backing it with specific evidence' },
        { skill: 'Critical Thinking', where: 'Evaluating something fairly rather than emotionally' },
        { skill: 'Audience Awareness', where: 'Writing something genuinely useful to someone else, in a repeatable structure' },
      ],
    },
    format: 'Project Guide',
  },
  'neighbourhood-interview': {
    opening:
      'Interview people in your community, from neighbours and shop owners to local heroes, and share their stories. Kids prepare questions, practise active listening, and present what they learn. Builds interviewing skills, empathy, and the ability to tell someone else\'s story with care.',
    whatsIncluded: [
      'A 2-minute reporter warm-up',
      'Turning closed questions into open ones',
      'Running the interview and following up',
      'Writing a profile: scene, quote, detail, why',
      'Giving the profile back to the person',
    ],
    skillTags: ['Interviewing', 'Listening', 'Empathy', 'Writing', 'Communication'],
    insideTheLearning: {
      lead:
        'Your child interviews someone in your community, from a grandparent to the baker. Open questions rather than yes-or-no ones. Notes while the person is still talking. Then a long conversation turned into a short profile that opens with a scene and uses the person\'s own words.',
      skills: [
        { skill: 'Communication', where: 'Asking open questions that invite a real answer, and taking notes while someone speaks' },
        { skill: 'Listening', where: 'Paying genuine attention rather than waiting for their turn' },
        { skill: 'Empathy', where: 'Understanding a perspective and a life that is not theirs' },
      ],
    },
    format: 'Project Guide',
  },
  'trail-guide-creator': {
    opening:
      'Create a written guide to a local trail or walking path. Kids walk the route, observe carefully, take notes, and write a guide someone else could follow. Outdoor observation meets descriptive writing in a project that connects kids to nature and place.',
    whatsIncluded: [
      'Find-my-tree blindfold game',
      'Walk-and-notice with all the senses',
      'Numbered map with step counts (scale bar for older kids)',
      'Stop pattern: where, look, fact, next',
      'A test walk by someone who has never been, then fixes',
    ],
    skillTags: ['Descriptive Writing', 'Observation', 'Nature', 'Geography', 'Design'],
    insideTheLearning: {
      lead:
        'Your child writes a real trail guide for a walk near you, aimed at someone who has never been. That constraint changes everything. Every landmark they were going to skip has to be described, and the stops have to be ordered so a stranger does not get lost.',
      skills: [
        { skill: 'Writing', where: 'Descriptive writing that brings the place alive, plus clear informational writing a reader can act on' },
        { skill: 'Observation', where: 'Noticing the details in the natural world that most people walk straight past' },
        { skill: 'Organisation', where: 'Structuring a multi-stop guide in an order that makes sense on the ground' },
        { skill: 'Audience Awareness', where: 'Writing for someone who has never set foot there, and laying it out to be used' },
      ],
    },
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENTREPRENEURSHIP - Individual Guides
  // ═══════════════════════════════════════════════════════════════════
  'brand-builder': {
    opening:
      'Build a complete brand identity from scratch: name, logo, personality, values, and visual style. Kids learn what makes a brand memorable and why it matters. Creativity, communication, and strategic thinking wrapped into one hands-on project.',
    whatsIncluded: [
      'Brand identity creation guide',
      'Name brainstorming and testing activities',
      'Logo design and visual identity planning',
      'Brand personality and values definition',
      'Brand presentation and pitch',
    ],
    skillTags: ['Creativity', 'Communication', 'Design', 'Marketing', 'Identity'],
    insideTheLearning: {
      lead:
        'Your child builds a brand from nothing: the name, the logo, the colours, the personality, and the sentence that explains it. Then they pitch it and someone tells them what does not work. Deciding which feedback to take and which to defend is most of the lesson.',
      skills: [
        { skill: 'Art', where: 'Designing a logo and choosing colours that stay consistent across everything' },
        { skill: 'Storytelling', where: 'Writing a tagline and pitching the brand personality in a sentence' },
        { skill: 'Critical Thinking', where: 'Taking feedback on the design and deciding what to change and what to defend' },
        { skill: 'Creative Thinking', where: 'Making something original instead of a copy of a brand they already like' },
      ],
    },
    format: 'Project Guide',
  },
  'business-failure-lab': {
    opening:
      'Analyse real business failures, figure out what went wrong, and extract lessons that apply to any venture. Kids build resilience and critical thinking by studying mistakes, and learn that failure is a normal, useful part of entrepreneurship.',
    whatsIncluded: [
      'Business failure case studies for analysis',
      'Root cause analysis framework',
      'Lesson extraction and pattern recognition',
      'Resilience building discussion prompts',
      '"What would you do differently?" challenges',
    ],
    skillTags: ['Critical Thinking', 'Resilience', 'Problem-Solving', 'Analysis', 'Entrepreneurship'],
    insideTheLearning: {
      lead:
        'Your child takes real businesses that failed and works out why, which is almost never the obvious reason. They trace root causes, see how the problems fed each other, and design a fix that handles more than one at a time. Studying failure on purpose makes setbacks feel like information instead of a verdict.',
      skills: [
        { skill: 'Critical Thinking', where: 'Identifying the root cause rather than the surface reason everyone repeats' },
        { skill: 'Systems Thinking', where: 'Seeing how the separate problems connected to each other' },
        { skill: 'Problem-Solving', where: 'Designing a fix that addresses several factors at once' },
        { skill: 'Adaptability', where: 'Working out what the business should have changed, and when' },
        { skill: 'Resilience', where: 'Treating a setback as something to learn from rather than a final answer' },
        { skill: 'Communication', where: 'Telling the story of the failure so the lesson actually lands' },
      ],
    },
    format: 'Project Guide',
  },
  'community-service-business': {
    opening:
      'Design and launch a service-based business with a genuine social mission. Kids find a community need and build a business that helps, combining empathy with entrepreneurship, service with strategy. Social entrepreneurship that teaches both impact and business skills.',
    whatsIncluded: [
      'Social enterprise planning guide',
      'Community needs assessment activities',
      'Service design and delivery planning',
      'Impact measurement and reflection',
      'Marketing for purpose-driven businesses',
    ],
    skillTags: ['Social Entrepreneurship', 'Empathy', 'Planning', 'Community', 'Business'],
    insideTheLearning: {
      lead:
        'Your child spots a real need in the neighbourhood and builds a small service business around solving it. The catch is that the need has to be genuine, so they have to look properly and ask people rather than guess. Then they promote it, and the feedback tells them what they got wrong.',
      skills: [
        { skill: 'Observation', where: 'Spotting a need that actually exists rather than one they assumed' },
        { skill: 'Problem-Solving', where: 'Designing a service that genuinely solves it' },
        { skill: 'Planning', where: 'Working out the steps, the timing and what it takes to deliver' },
        { skill: 'Communication', where: 'Promoting it to the people who would actually use it' },
        { skill: 'Resilience', where: 'Taking the feedback and improving the service instead of defending it' },
      ],
    },
    format: 'Project Guide',
  },
  'customer-discovery': {
    opening:
      'Conduct real customer interviews, gather honest feedback, and use it to make a business idea better. Kids learn the most important entrepreneurship skill: listening before building. Research, communication, and critical thinking in one hands-on challenge.',
    whatsIncluded: [
      'Customer interview planning guide',
      'Question design and interviewing tips',
      'Feedback analysis and pattern finding',
      'Idea refinement based on real data',
      'Pivot or persevere decision framework',
    ],
    skillTags: ['Research', 'Communication', 'Listening', 'Critical Thinking', 'Entrepreneurship'],
    insideTheLearning: {
      lead:
        'Your child interviews real people about a real idea, before building anything. The hard part is asking questions that get honest answers instead of polite ones, then finding the pattern across what people said. Sometimes the data says the idea is wrong, and deciding what to do with that is the lesson.',
      skills: [
        { skill: 'Research', where: 'Designing questions that get real data rather than agreement' },
        { skill: 'Communication', where: 'Asking, listening properly, and following up on what they hear' },
        { skill: 'Empathy', where: 'Understanding the need behind what people actually say' },
        { skill: 'Critical Thinking', where: 'Finding patterns, testing assumptions, and drawing a conclusion that holds' },
        { skill: 'Entrepreneurship', where: 'Turning what they learned into a decision about the idea itself' },
      ],
    },
    format: 'Project Guide',
  },
  'investor-pitch': {
    opening:
      'Create a compelling investor pitch with financial reasoning, risk assessment, and persuasive presentation skills all in one project. Kids learn to communicate the value of an idea, back it up with numbers, and present with confidence. Business thinking meets public speaking.',
    whatsIncluded: [
      'Investor pitch preparation guide',
      'Financial projection basics',
      'Risk assessment and mitigation planning',
      'Pitch deck design and storytelling',
      'Delivery practice and Q&A preparation',
    ],
    skillTags: ['Financial Reasoning', 'Persuasion', 'Public Speaking', 'Risk Assessment', 'Planning'],
    insideTheLearning: {
      lead:
        'Your child plays the investor rather than the founder, which flips everything. They read the numbers, find the risk hiding behind the optimism, and decide where the money goes. Then they justify the call out loud, and change their mind when the evidence says to.',
      skills: [
        { skill: 'Critical Thinking', where: 'Reading costs, revenue and profit, and spotting the strengths and the risks' },
        { skill: 'Decision-Making', where: 'Weighing risk against reward and allocating limited resources strategically' },
        { skill: 'Communication', where: 'Explaining the reasoning behind the call, and reassessing when it does not hold' },
      ],
    },
    format: 'Project Guide',
  },
  'marketing-campaign': {
    opening:
      'Design and execute a marketing campaign to reach a real audience. Kids learn about target audiences, messaging, creative assets, and campaign strategy. Persuasion, creativity, and analytical thinking applied to a real marketing project.',
    whatsIncluded: [
      'Marketing campaign planning guide',
      'Target audience research and persona building',
      'Message crafting and creative brief',
      'Campaign asset creation (posters, social, etc.)',
      'Results tracking and campaign reflection',
    ],
    skillTags: ['Marketing', 'Communication', 'Creativity', 'Persuasion', 'Analysis'],
    insideTheLearning: {
      lead:
        'Your child runs a real campaign for something: works out who it is for, writes the message, makes the posters and posts, then puts it in front of people. The feedback comes back and usually it says the message was not as clear as they thought.',
      skills: [
        { skill: 'Critical Thinking', where: 'Researching who the audience actually is instead of assuming' },
        { skill: 'Persuasion', where: 'Crafting a message built to move a specific group of people' },
        { skill: 'Design Thinking', where: 'Making visuals and words work together across the campaign assets' },
        { skill: 'Adaptability', where: 'Reading the response and reworking the campaign from it' },
        { skill: 'Creative Thinking', where: 'Finding an original angle rather than copying what they have seen' },
      ],
    },
    format: 'Project Guide',
  },
  'pricing-experiment': {
    opening:
      'Test different pricing strategies and discover what makes people willing to pay. Kids experiment with value perception, anchoring, bundling, and other pricing techniques. Financial literacy and critical thinking through hands-on experimentation.',
    whatsIncluded: [
      'Pricing experiment design guide',
      'Value perception and anchoring activities',
      'Real pricing challenges and scenarios',
      'Data collection and analysis framework',
      'Strategy reflection and decision-making',
    ],
    skillTags: ['Financial Literacy', 'Critical Thinking', 'Experimentation', 'Maths', 'Decision-Making'],
    insideTheLearning: {
      lead:
        'Your child tests what a price actually does. Same product, different numbers, real reactions. They gather the data, find where their assumptions were wrong, and work out the margin underneath. Then they have to defend the price they landed on.',
      skills: [
        { skill: 'Financial Literacy', where: 'Costs, margins, and the logic that decides what a price should be' },
        { skill: 'Research', where: 'Collecting real prices and finding the patterns in them' },
        { skill: 'Critical Thinking', where: 'Testing their assumptions against the data instead of their instinct' },
        { skill: 'Problem-Solving', where: 'Balancing the trade-offs when the profitable price is not the popular one' },
        { skill: 'Communication', where: 'Explaining and pitching the pricing decision they made' },
      ],
    },
    format: 'Project Guide',
  },
  'product-design-lab': {
    opening:
      'Use design thinking to create a product that solves a real problem. Kids identify needs, brainstorm solutions, build prototypes, test with users, and iterate. The same process real designers and engineers use, scaled for kids and applied to problems they actually care about.',
    whatsIncluded: [
      'Design thinking process guide',
      'Need-finding and empathy mapping',
      'Brainstorming and idea selection',
      'Prototyping with everyday materials',
      'User testing and iteration cycles',
    ],
    skillTags: ['Design Thinking', 'Problem-Solving', 'Creativity', 'Engineering', 'Empathy'],
    insideTheLearning: {
      lead:
        'Your child finds something frustrating in your house and designs a product to fix it. Need-finding first, then brainstorming, then a prototype out of everyday materials, then a real user who tells them what is wrong with it. Then they do it again, better.',
      skills: [
        { skill: 'Design Thinking', where: 'Working the full loop: find the problem, brainstorm, prototype, improve' },
        { skill: 'Creative Thinking', where: 'Inventing the thing, designing it and naming it' },
        { skill: 'Critical Thinking', where: 'Evaluating which of their ideas would actually work' },
        { skill: 'Communication', where: 'Pitching the design and absorbing user feedback without defending' },
        { skill: 'Executive Functioning', where: 'Planning the project, managing it and revising when the plan slips' },
      ],
    },
    format: 'Project Guide',
  },
  'supply-chain-detective': {
    opening:
      'Trace a product\'s journey from raw materials to your front door, and discover the global systems that connect everything. Kids investigate supply chains, think about geography, labour, and sustainability, and develop systems thinking. Critical analysis meets global awareness.',
    whatsIncluded: [
      'Supply chain investigation guide',
      'Product journey mapping activities',
      'Geography and global trade connections',
      'Sustainability and ethics discussion prompts',
      'Systems thinking and interconnection mapping',
    ],
    skillTags: ['Systems Thinking', 'Geography', 'Critical Thinking', 'Sustainability', 'Research'],
    insideTheLearning: {
      lead:
        'Your child picks one ordinary object and traces where it actually came from. Raw material, factory, ship, shelf. It crosses more of the world than they expect. Then they imagine a disruption at one step and work out what breaks downstream.',
      skills: [
        { skill: 'Systems Thinking', where: 'Seeing how each step depends on the one before it' },
        { skill: 'Research', where: 'Finding the clues and piecing the journey together from partial information' },
        { skill: 'Geography', where: 'Tracing how trade physically connects places on a map' },
        { skill: 'Problem-Solving', where: 'Imagining a disruption and working out what it would take to fix it' },
        { skill: 'Communication', where: 'Presenting the whole journey clearly enough that it makes sense to someone else' },
      ],
    },
    format: 'Project Guide',
  },
  'shark-tank-pitch': {
    seo: {
      title: 'Shark Tank Pitch for Kids: Business Pitch Project, Ages 8-14',
      description:
        'A ready-to-run Shark Tank pitch project. Kids build a business, work out profit, write the pitch and present it live. Ages 8-14, no prep.',
    },
    opening:
      'Develop and deliver a high-stakes business pitch, Shark Tank style. Kids create a business concept, build financial projections, design their presentation, and pitch to family. Public speaking, financial thinking, and entrepreneurial confidence all in one thrilling project.',
    whatsIncluded: [
      'Shark Tank pitch project guide',
      'Business concept development framework',
      'Financial projections and break-even basics',
      'Pitch presentation design and delivery tips',
      'Q&A preparation and confidence building',
    ],
    skillTags: ['Public Speaking', 'Financial Thinking', 'Persuasion', 'Entrepreneurship', 'Confidence'],
    insideTheLearning: {
      lead:
        'Your child builds a business concept and pitches it to the family for real. Underneath that, they are working out profit and revenue, structuring an argument so it actually persuades, and presenting it out loud to people who ask hard questions. Then they revise it from the feedback and go again. None of it feels like schoolwork, because the pitch night is real and they want to win it.',
      skills: [
        { skill: 'Financial Literacy', where: 'Working out profit and revenue so the numbers in the pitch hold up' },
        { skill: 'Persuasion', where: 'Building a structured argument instead of just saying why they like the idea' },
        { skill: 'Public Speaking', where: 'Presenting the idea clearly and out loud, not reading it off a page' },
        { skill: 'Resilience', where: 'Handling the surprise questions calmly, then revising the pitch from what came back' },
      ],
    },
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // PLANNING & PROBLEM-SOLVING - Individual Guides
  // ═══════════════════════════════════════════════════════════════════
  'emergency-ready': {
    opening:
      'Your child builds the family emergency plan for real: a map with two ways out of every room, a meeting spot outside, a fire drill you actually run and time, a three-day stay-home kit with the water worked out, and a contact card in every pocket. Then a surprise drill with a twist tests it. Calm, practical readiness that kids feel safer for knowing.',
    whatsIncluded: [
      '5 steps from walking the house to a surprise drill',
      'Two ways out of every room, mapped and tested',
      'A timed fire drill and a meeting spot',
      'Three-day kit maths: people × litres × days',
      'Contact cards and twist cards in a Ready Toolkit',
    ],
    skillTags: ['Critical Thinking', 'Life Skills', 'Planning', 'Decision-Making', 'Resilience'],
    insideTheLearning: {
      lead:
        'Your child builds a real emergency plan for your home and learns that emergencies come in two kinds: two minutes to get out, or three days at home. One needs speed, the other needs supplies, and planning both is genuinely hard thinking. Not fear-based: practical readiness the whole family uses.',
      skills: [
        { skill: 'Critical Thinking', where: 'Sorting emergencies into leave-fast and stay-home, then finding the weakest link' },
        { skill: 'Planning', where: 'Sequencing and organising the plan so it works when it is needed' },
        { skill: 'Communication', where: 'Writing it clearly enough that anyone in the house could follow it' },
        { skill: 'Life Skills', where: 'Practical safety awareness they carry for good' },
        { skill: 'Executive Functioning', where: 'Managing the tasks and thinking ahead of the problem' },
      ],
    },
    format: 'Project Guide',
  },
  'everyday-redesign': {
    opening:
      'Your child picks something at home that bugs everyone, like lost shoes, a cluttered counter or the dinner rush, and redesigns it for real. They count the problem for a week, interview the family, keep asking why until they find the real cause, then build a fix that makes the right thing the easy thing. A second week of counting shows whether it worked.',
    whatsIncluded: [
      '5 steps from counting the problem to a week-long test',
      'Family interviews about what really bugs everyone',
      'Five whys to get past the symptom to the cause',
      'Redesign rules that make the right thing the easy thing',
      'Before and after numbers in a Redesign Toolkit',
    ],
    skillTags: ['Design Thinking', 'Critical Thinking', 'Systems Thinking', 'Life Skills', 'Problem-Solving'],
    insideTheLearning: {
      lead:
        'Your child learns that most everyday problems are not about people trying too little: they are about a system that makes the wrong thing easy. Telling everyone to try harder rarely works. Moving the shoe basket to where shoes actually come off does, and the count proves it.',
      skills: [
        { skill: 'Critical Thinking', where: 'Asking why until they reach the real cause, not the annoying symptom' },
        { skill: 'Math', where: 'Tallying the problem for a week, then comparing before and after' },
        { skill: 'Communication', where: 'Interviewing the family and getting everyone on board with the fix' },
        { skill: 'Creativity', where: 'Designing a fix that fits how people actually behave' },
        { skill: 'Life Skills', where: 'Running a real part of the home better, with their own system' },
      ],
    },
    format: 'Project Guide',
  },
  'fix-it-detective': {
    opening:
      'Your child becomes the household repair detective. They hunt for things that are loose, stuck or not working, describe exactly what is wrong, check the easy suspects first, then plan a fix with you and test whether it held. A clear safety card spells out what kids can open and what stays with an adult.',
    whatsIncluded: [
      'A 5-step guide from spotting the problem to testing the fix',
      'A worked example that diagnoses a flashlight step by step',
      'Easy suspects card: power, loose, dirty, dry, worn',
      'Safety rules card and common fixes card',
      'Fix-it log to record each repair',
    ],
    skillTags: ['Problem-Solving', 'Life Skills', 'Critical Thinking', 'Planning', 'Practical Skills'],
    insideTheLearning: {
      lead:
        'Your child learns to diagnose before they repair. They describe the symptom exactly, rule out the easy causes one at a time, plan the fix with you and then test it. Real household things, handled safely, with a parent beside them.',
      skills: [
        { skill: 'Problem-Solving', where: 'Working from the symptom to the cause to a fix that holds' },
        { skill: 'Critical Thinking', where: 'Testing one suspect at a time and ruling causes out' },
        { skill: 'Planning', where: 'Listing the tools and the steps before opening anything' },
        { skill: 'Research', where: 'Looking up how the thing works and how others have fixed it' },
        { skill: 'Life Skills', where: 'Using tools safely and knowing when to call an adult or a pro' },
      ],
    },
    format: 'Project Guide',
  },
  'neighbourhood-problem-spotter': {
    opening:
      'Your child walks the neighbourhood with you and looks at it like a detective. They spot what could work better, pick one problem worth solving, gather real evidence and find out why it happens. Then they design the simplest fix that could work, pitch it to someone who can say yes, and take care of one small part themselves.',
    whatsIncluded: [
      'A 5-step guide from the first walk to a real pitch',
      'A worked example that turns a grumble into a proposal',
      'What to look for card and Pick one card',
      'Who looks after it card and 30-second Pitch it card',
      'Proposal page to fill in and send',
    ],
    skillTags: ['Critical Thinking', 'Civic Engagement', 'Problem-Solving', 'Observation', 'Communication'],
    insideTheLearning: {
      lead:
        'Your child learns the difference between a complaint and a proposal. They walk their own neighbourhood, count what they see, talk to the people it affects and keep asking why. Then they make a short case to the person who can actually do something about it.',
      skills: [
        { skill: 'Critical Thinking', where: 'Getting from what they see to what is really causing it' },
        { skill: 'Math', where: 'Counting, tallying and comparing across several visits' },
        { skill: 'Geography', where: 'Mapping the route and looking for patterns on the map' },
        { skill: 'Problem-Solving', where: 'Choosing the simplest fix and answering objections' },
        { skill: 'Communication', where: 'Making a 30-second case to someone who can say yes' },
      ],
    },
    format: 'Project Guide',
  },
  'outdoor-survival-planner': {
    opening:
      'Your child learns what to do when something goes wrong outside, the calm way. They pick a scenario like a lost trail or a storm, put the priorities in order, take stock of what is in the pack and practise real skills with you. Then they handle a twist and write the trip plan your family takes on its next outing.',
    whatsIncluded: [
      'A 5-step guide from choosing a scenario to a real trip plan',
      'A worked example of what to do if you get lost',
      'Scenarios card and Priorities card',
      'If you are lost card and Skills to try card',
      'Trip plan to fill in before every outing',
    ],
    skillTags: ['Planning', 'Critical Thinking', 'Outdoor Skills', 'Resourcefulness', 'Life Skills'],
    insideTheLearning: {
      lead:
        'Your child learns that the first job in an emergency is to stop and think. They work out what comes first in a realistic situation, use what is actually in the pack, then go outside with you and test whether their shelter and signals really work.',
      skills: [
        { skill: 'Critical Thinking', where: 'Deciding what comes first and when the usual order changes' },
        { skill: 'Planning', where: 'Writing a real trip plan and leaving it with someone at home' },
        { skill: 'Problem-Solving', where: 'Finding two uses for ordinary things and handling a twist' },
        { skill: 'Science', where: 'Weather, body heat and how to stay warm and dry' },
        { skill: 'Geography', where: 'Using landmarks and directions to read a place' },
      ],
    },
    format: 'Project Guide',
  },
  'pack-like-a-pro': {
    opening:
      'Your child packs their own bag for a real trip. They work out what the trip actually needs, list everything they want, cut it down to fit real limits, then pack it and test it with some what-ifs. After the trip, they see what came home unused and build a packing list they can use year after year.',
    whatsIncluded: [
      'A 5-step guide from reading the trip to a reusable list',
      'A worked example that cuts one overstuffed bag down',
      'Read the trip card and Sort it card',
      'Packing tricks card and What-ifs card',
      'My always list to use on every trip',
    ],
    skillTags: ['Planning', 'Life Skills', 'Critical Thinking', 'Independence', 'Decision-Making'],
    insideTheLearning: {
      lead:
        'Your child takes charge of their own bag and finds out what trade-offs really feel like. They read the forecast, make the cuts themselves, carry what they chose, and learn from what came home unused. Passports, medicine and money stay with you.',
      skills: [
        { skill: 'Planning', where: 'Working out what the trip actually needs before packing' },
        { skill: 'Critical Thinking', where: 'Sorting need from want and defending every choice' },
        { skill: 'Math', where: 'Counting days, outfits and what fits the limit' },
        { skill: 'Problem-Solving', where: 'Finding things that do two jobs and handling the what-ifs' },
        { skill: 'Life Skills', where: 'Being in charge of their own things, year after year' },
      ],
    },
    format: 'Project Guide',
  },
  'scavenger-hunt-designer': {
    opening:
      'Your child designs and runs a real scavenger hunt for the family. They pick a theme, scout the spots, write clues that make players think, map the route and set the rules. Then they test it, run the whole event from the welcome to the prize, and make it better for the next round.',
    whatsIncluded: [
      'A 5-step guide from theme to a full event',
      'A worked example that tests and fixes one clue',
      'Themes card and Clue types card',
      'Rules to decide card and Twists card',
      'Hunt plan page for every spot, clue and hint',
    ],
    skillTags: ['Planning', 'Creative Writing', 'Problem-Solving', 'Leadership', 'Communication'],
    insideTheLearning: {
      lead:
        'Your child is in charge of an event other people actually play. They have to think like someone who does not know the answer, write just enough, test it on you and fix what breaks. Then they run the whole thing.',
      skills: [
        { skill: 'Writing', where: 'Writing riddles and rules a new player can follow' },
        { skill: 'Planning', where: 'Sequencing the clues and building the route backwards from the finish' },
        { skill: 'Geography', where: 'Scouting spots, using landmarks and drawing the map' },
        { skill: 'Math', where: 'Counting steps, estimating time and keeping score' },
        { skill: 'Communication', where: 'Hosting the event and giving hints without giving it away' },
      ],
    },
    format: 'Project Guide',
  },
  'swap-day-challenge': {
    opening:
      'Your child runs the house for a day or half a day while you work for them. They find all the work that keeps a home going, including the remembering and deciding nobody sees, then plan the day and the meals and handle what goes wrong. Afterwards they keep one job for good.',
    whatsIncluded: [
      'A 5-step guide from finding the work to keeping one job',
      'A worked example that shows what is inside one chore',
      'Where to look card and The invisible work card',
      'Swap rules card and Twists card',
      'Swap Day plan to fill in and compare with the real day',
    ],
    skillTags: ['Life Skills', 'Planning', 'Empathy', 'Time Management', 'Responsibility'],
    insideTheLearning: {
      lead:
        'Your child finds out what it takes to keep a home going, and most of it is the part nobody sees. They plan the day, make the calls, run it with you as the employee and then keep one job for good.',
      skills: [
        { skill: 'Planning', where: 'Scheduling the day and working out what has to happen first' },
        { skill: 'Math', where: 'Elapsed time, portions and how long things really take' },
        { skill: 'Empathy', where: 'Feeling what other people in the home carry' },
        { skill: 'Problem-Solving', where: 'Deciding what comes first when two things clash' },
        { skill: 'Life Skills', where: 'Cooking, cleaning and keeping one job for good' },
      ],
    },
    format: 'Project Guide',
  },
  'what-if-scenario-lab': {
    opening:
      'Your child takes a big what-if, like a week with no electricity, and thinks it all the way through. They map what would really happen by Day 3 and Day 7, ask someone who has lived something like it, make a plan, try a small slice of it for real, then handle a twist and convince the family.',
    whatsIncluded: [
      'A 5-step guide from the first reaction to a plan the family agrees on',
      'A worked example that shows how to go past the first answer',
      'What-ifs card and Keep asking card',
      'Try a slice card and Twists card',
      'Our plan page to fill in and present',
    ],
    skillTags: ['Critical Thinking', 'Planning', 'Curiosity', 'Trade-Offs', 'Communication'],
    insideTheLearning: {
      lead:
        'Your child follows one big question past the first easy answer. They talk to someone who has lived something like it, make hard choices, test a small piece for real and then have to convince the family.',
      skills: [
        { skill: 'Critical Thinking', where: 'Asking and then what, day by day, until the real problems show up' },
        { skill: 'Research', where: 'Asking someone who has lived it and finding out what surprised them' },
        { skill: 'Planning', where: 'Working out Day 1, the biggest problems and what to give up' },
        { skill: 'Science', where: 'Seeing how food, energy and water actually reach a home' },
        { skill: 'Communication', where: 'Presenting the plan and answering every doubt' },
      ],
    },
    format: 'Project Guide',
  },
  'decision-lab': {
    opening:
      'Work through real decision scenarios, weigh options, consider consequences, and justify choices. Kids practise the kind of thoughtful, structured decision-making that builds confidence and independence. Critical thinking applied to real-world situations they actually face.',
    whatsIncluded: [
      'Decision-making scenario cards',
      'Pros and cons analysis framework',
      'Consequence mapping activities',
      'Values-based decision-making practice',
      'Reflection on decision quality and outcomes',
    ],
    skillTags: ['Decision-Making', 'Critical Thinking', 'Ethics', 'Analysis', 'Independence'],
    insideTheLearning: {
      lead:
        'Your child works through real decision scenarios, weighs the options, maps out the consequences and then has to justify what they chose. Not the tidy version. The kind where the values matter and someone disagrees with them.',
      skills: [
        { skill: 'Critical Thinking', where: 'Analysing the options and reasoning through what each one leads to' },
        { skill: 'Decision-Making', where: 'Weighing choices and predicting the outcomes before committing' },
        { skill: 'Communication', where: 'Explaining and justifying the decision, then defending it in a debate' },
        { skill: 'Empathy', where: 'Considering the perspectives of everyone the decision touches' },
      ],
    },
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // WORLDSCHOOLING - Individual Guides
  // ═══════════════════════════════════════════════════════════════════
  'cultural-celebration-journal': {
    opening:
      'A guided journal for documenting festivals, holidays, and cultural celebrations wherever you go. Kids observe traditions, ask thoughtful questions, sketch what they see, and reflect on what makes each celebration meaningful. Cultural curiosity meets meaningful journaling.',
    whatsIncluded: [
      'Guided journal prompts for documenting celebrations',
      'Observation questions for traditions and customs',
      'Sketching and visual storytelling pages',
      'Reflection prompts on meaning and connection',
      'Reusable format: works for any festival, anywhere',
    ],
    skillTags: ['Cultural Awareness', 'Journaling', 'Observation', 'Reflection', 'Writing'],
    insideTheLearning: {
      lead:
        'Your child documents a real celebration, their own or someone else\'s, and works out what it says about what people value. It runs on asking respectful questions and listening to the answers, then recording what they found in writing and sketches. Research with actual people in it.',
      skills: [
        { skill: 'Cultural Awareness', where: 'Understanding what a celebration reveals about people\'s values and beliefs' },
        { skill: 'Research', where: 'Investigating the history, customs and significance across several sources' },
        { skill: 'Communication', where: 'Asking respectful questions and genuinely listening to personal stories' },
        { skill: 'Empathy', where: 'Understanding why it matters to the people it belongs to' },
        { skill: 'Critical Thinking', where: 'Looking past the surface of a tradition to what sits underneath it' },
      ],
    },
    format: 'Activity Guide',
  },
  'currency-market-math': {
    opening:
      'Turn every market visit into a maths lesson. Kids convert currencies, compare prices, calculate change in a new monetary system, and practise mental maths in real markets. Financial literacy and global awareness through real-world transactions.',
    whatsIncluded: [
      'Currency conversion challenges and exchange rate practice',
      'Price comparison activities for real markets',
      'Mental maths and change-calculation exercises',
      'Budget tracking for travel days',
      'Reflection on cost of living differences',
    ],
    skillTags: ['Maths', 'Financial Literacy', 'Mental Maths', 'Currency', 'Real-World'],
    insideTheLearning: {
      lead:
        'Your child does the maths in a real market, in a real currency, with real prices. Converting, comparing and calculating change under time pressure is arithmetic that matters immediately. Then they work out why the same thing costs what it costs here and not somewhere else.',
      skills: [
        { skill: 'Math', where: 'Addition, subtraction, multiplication, division and decimals, done at the stall' },
        { skill: 'Financial Literacy', where: 'Understanding money and budgeting when the spending choices are theirs' },
        { skill: 'Problem-Solving', where: 'Working backwards from a total and comparing options on the spot' },
        { skill: 'Critical Thinking', where: 'Asking why prices differ, and what that says about a place' },
      ],
    },
    format: 'Activity Guide',
  },
  'everyday-life-comparison': {
    opening:
      'Compare daily life in a new place to home: how people get around, what they eat, how schools work, what kids do for fun. Kids observe carefully, ask good questions, and reflect on what is the same, what is different, and why. Cultural awareness through everyday curiosity.',
    whatsIncluded: [
      'Comparison frameworks for everyday systems',
      'Observation prompts for transport, food, school, and play',
      'Side-by-side comparison templates',
      'Reflection on similarities and differences',
      'Discussion starters for the whole family',
    ],
    skillTags: ['Cultural Awareness', 'Observation', 'Reflection', 'Critical Thinking'],
    // Oct 26 2026: page one with 0 clicks on the default "Name | Category" title.
    seo: {
      title: 'Everyday Life Comparison: A Worldschooling Guide for Kids',
      description:
        'The guide your family follows to compare daily life somewhere new with home: transport, food, school and play, and why they differ. Ages 6 to 14.',
    },
    insideTheLearning: {
      lead:
        'Your child looks closely at how ordinary life works somewhere else, transport, food, school, play, and compares it with their own. The interesting part is never the difference itself, it is working out why it is that way. Curiosity aimed at things they normally walk past.',
      skills: [
        { skill: 'Observation', where: 'Noticing the details in a daily routine and asking why they are like that' },
        { skill: 'Cultural Awareness', where: 'Understanding how the way people live reflects values and place' },
        { skill: 'Empathy', where: 'Stepping properly into what someone else\'s ordinary day feels like' },
        { skill: 'Critical Thinking', where: 'Pushing past the surface difference to the reason underneath' },
        { skill: 'Communication', where: 'Having respectful conversations with people who live it' },
      ],
    },
    format: 'Activity Guide',
  },
  'local-language-mission': {
    opening:
      'Build confidence speaking a new language through real-world missions. Kids learn key phrases, practise greetings, order food, ask for directions, and complete language challenges with locals. Communication built on courage and curiosity, not perfection.',
    whatsIncluded: [
      'Language mission cards with progressive challenges',
      'Key phrase and pronunciation practice prompts',
      'Real-world communication missions (greetings, ordering, asking)',
      'Reflection prompts on confidence and progress',
      'Works for any language, anywhere',
    ],
    skillTags: ['Languages', 'Communication', 'Confidence', 'Cultural Awareness'],
    insideTheLearning: {
      lead:
        'Your child uses a language they do not speak to do real things: greet someone, order food, ask for directions. Missions get harder as they go. Perfection is explicitly not the goal, being understood is, and that difference is what gets a shy kid talking.',
      skills: [
        { skill: 'Communication', where: 'Expressing what they need and being understood without getting it perfect' },
        { skill: 'Confidence', where: 'Building courage through interactions with actual people who reply' },
        { skill: 'Observation', where: 'Noticing the language on signs and in conversations happening around them' },
        { skill: 'Critical Thinking', where: 'Comparing languages, spotting the patterns, and asking why they exist' },
        { skill: 'Cultural Awareness', where: 'Seeing what a language carries about how people live' },
      ],
    },
    format: 'Activity Guide',
  },
  'nature-geography-field-study': {
    opening:
      'Turn any landscape into a field study. Kids observe local plants, wildlife, climate, and geography. They sketch ecosystems, track weather, identify landforms, and connect what they see to bigger geographical patterns. Earth science through direct experience.',
    whatsIncluded: [
      'Field study observation framework',
      'Plant, wildlife, and ecosystem sketching prompts',
      'Weather and climate tracking activities',
      'Landform identification and geography connections',
      'Reflection on patterns across regions',
    ],
    skillTags: ['Geography', 'Science', 'Observation', 'Nature', 'Sketching'],
    insideTheLearning: {
      lead:
        'Your child does real field study outdoors: observing slowly, sketching what they see, tracking the weather, identifying landforms. Then the question shifts from what do I see to why is it like this, and how does that shape the people who live here.',
      skills: [
        { skill: 'Observation', where: 'Noticing colours, textures, patterns and movement without rushing past them' },
        { skill: 'Science', where: 'Asking questions, predicting, gathering evidence and drawing a conclusion' },
        { skill: 'Geography', where: 'Seeing how climate, landscape, plants, animals and people connect to a place' },
        { skill: 'Critical Thinking', where: 'Moving from what is there to why it is there and what it means for people' },
        { skill: 'Art', where: 'Sketching plants, wildlife and landforms closely enough to record them properly' },
      ],
    },
    format: 'Activity Guide',
  },
  'people-stories-interview': {
    opening:
      'Interview the people you meet on your travels: shopkeepers, hosts, fellow travellers, kids in the park. Kids prepare thoughtful questions, listen carefully, and record stories that turn strangers into characters. Communication, empathy, and global perspective built through real conversations.',
    whatsIncluded: [
      'Interview project guide with question templates',
      'Active listening and note-taking techniques',
      'Story collection and recording prompts',
      'Ethical interviewing guidance for kids',
      'Reflection on what stories teach us',
    ],
    skillTags: ['Communication', 'Listening', 'Empathy', 'Writing', 'Interviewing'],
    insideTheLearning: {
      lead:
        'Your child interviews someone with a story worth recording and turns it into a coherent narrative. Talking to a person they do not know takes nerve. Really hearing the answer takes more. Then it has to be organised into something that reads properly.',
      skills: [
        { skill: 'Communication', where: 'Asking clear questions and expressing their own ideas clearly' },
        { skill: 'Listening', where: 'Actually hearing what is said, not just collecting quotes' },
        { skill: 'Empathy', where: 'Seeing the world through the eyes of the person in front of them' },
        { skill: 'Confidence', where: 'Getting past the shyness of approaching someone new' },
        { skill: 'Cultural Awareness', where: 'Understanding perspectives and ways of living unlike their own' },
      ],
    },
    format: 'Activity Guide',
  },
  'street-explorer-map-maker': {
    opening:
      'Walk a new neighbourhood and turn it into a hand-drawn map. Kids note landmarks, sketch streets, label points of interest, and create their own guide to the area. Spatial thinking, observation, and geography all in one walking project.',
    whatsIncluded: [
      'Map-making project guide for any neighbourhood',
      'Landmark identification and sketching prompts',
      'Street layout and orientation activities',
      'Points-of-interest labelling and storytelling',
      'Personal walking-guide creation',
    ],
    skillTags: ['Geography', 'Spatial Thinking', 'Observation', 'Art', 'Mapping'],
    insideTheLearning: {
      lead:
        'Your child maps their own neighbourhood by walking it and drawing it. Turning a street they know into an accurate flat drawing is harder than it sounds. Then comes the better question: why is it arranged this way and not some other way.',
      skills: [
        { skill: 'Observation', where: 'Noticing buildings, streets, landmarks, patterns and people they normally walk past' },
        { skill: 'Spatial Thinking', where: 'Translating a real three-dimensional place into a two-dimensional map' },
        { skill: 'Geography', where: 'Reading terrain, landmarks and human-made features, and how they connect' },
        { skill: 'Critical Thinking', where: 'Asking why the place is arranged the way it is' },
        { skill: 'Communication', where: 'Explaining the map through labels, a legend and written description' },
      ],
    },
    format: 'Activity Guide',
  },
  'transport-navigation-challenge': {
    opening:
      'Navigate a new place using local transport. Kids read maps, decode public transport systems, plan routes, and practise getting from A to B in unfamiliar territory. Independence, problem-solving, and real-world geography skills built through real journeys.',
    whatsIncluded: [
      'Public transport decoding activities',
      'Map reading and route planning challenges',
      'Real navigation missions with progressive difficulty',
      'Time and cost calculations for journeys',
      'Reflection on independence and problem-solving',
    ],
    skillTags: ['Navigation', 'Geography', 'Problem-Solving', 'Independence', 'Maths'],
    insideTheLearning: {
      lead:
        'Your child navigates a real transport system, working out routes, fares and timings themselves. Missions get harder as they go. Reading a schedule under time pressure and deciding to ask a stranger for help is independence you cannot teach from a chair.',
      skills: [
        { skill: 'Problem-Solving', where: 'Working out a route in an unfamiliar system, and troubleshooting when it goes wrong' },
        { skill: 'Math', where: 'Reading costs, calculating journey times and understanding the distances' },
        { skill: 'Observation', where: 'Reading signs, schedules and routes, and noticing how the system actually works' },
        { skill: 'Geography', where: 'Seeing how transport connects places and shapes how a city works' },
        { skill: 'Critical Thinking', where: 'Comparing systems and asking why one works better than another' },
        { skill: 'Self-Direction', where: 'Navigating it themselves, making the calls, asking when they need to' },
      ],
    },
    format: 'Activity Guide',
  },
  'travel-reflection-postcards': {
    opening:
      'Capture travel memories through hand-made postcards and reflective writing. Kids choose moments that mattered, sketch scenes, write personal notes, and turn experiences into keepsakes. Reflective writing and visual storytelling that makes every trip more meaningful.',
    whatsIncluded: [
      'Postcard-making templates and prompts',
      'Reflective writing exercises for travel memories',
      'Sketching prompts for meaningful moments',
      'Personal note writing for friends and family',
      'Keepsake building for trips of any length',
    ],
    skillTags: ['Reflection', 'Writing', 'Art', 'Storytelling', 'Memory'],
    insideTheLearning: {
      lead:
        'Your child turns what they actually noticed on a trip into postcards for real people. Writing for a specific reader sharpens everything, and the small format forces them to work out which detail matters most out of everything they saw.',
      skills: [
        { skill: 'Writing', where: 'Organising their thoughts into clear writing, with enough vivid detail to bring it alive' },
        { skill: 'Observation', where: 'Reviewing everything they noticed and choosing what is worth keeping' },
        { skill: 'Reflection', where: 'Working out what actually mattered and connecting it to what they learned' },
        { skill: 'Communication', where: 'Writing to a real person in their own voice, so the experience lands' },
      ],
    },
    format: 'Activity Guide',
  },
  'world-food-detective': {
    opening:
      'Investigate the food of every place you visit. Kids identify ingredients, trace dishes to their origins, learn cooking traditions, and document what they taste. Food becomes a window into culture, history, and geography in this hands-on (and delicious) investigation.',
    whatsIncluded: [
      'Food detective investigation guide',
      'Ingredient identification and origin tracing',
      'Cooking tradition research prompts',
      'Tasting notes and personal review templates',
      'Cultural connections between food and place',
    ],
    skillTags: ['Cultural Awareness', 'Geography', 'Research', 'Observation', 'Writing'],
    insideTheLearning: {
      lead:
        'Your child investigates one dish like a case: where the ingredients come from, who cooked it first, why it exists in that place at all. Then they cook or taste it and write it up. Food turns out to be history that you can eat.',
      skills: [
        { skill: 'Research', where: 'Tracing ingredients and origins, and weighing whether a source is any good' },
        { skill: 'Observation', where: 'Paying real attention to flavour, texture, ingredients and how it is made' },
        { skill: 'Critical Thinking', where: 'Asking why a dish exists where it does, and spotting the patterns' },
        { skill: 'Communication', where: 'Describing, sketching and explaining what they found' },
      ],
    },
    format: 'Activity Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // EMOTIONAL & SOCIAL SKILLS
  // ═══════════════════════════════════════════════════════════════════
  'calm-down-toolkit': {
    opening:
      'Your child builds their own physical reset kit and a "when I\'m flooded" plan using stuff already around the house. They test different tools to find what actually settles their body, then turn it into a 3-line plan they can run on their own. Real self-regulation, not a poster on the wall.',
    whatsIncluded: [
      'Body-signal check-in: spot the flooded state early',
      'Household tool hunt with 6 starter reset options',
      'Test-and-rate framework to find what actually works',
      '3-line personal plan kids can run on their own',
      'Version 2 revision after a real hard moment',
    ],
    skillTags: ['Self-Regulation', 'Emotional Awareness', 'Coping Skills'],
    insideTheLearning: {
      lead:
        'Your child builds a calm-down kit that works for their body specifically, not the one a poster says should work. First they learn to catch a feeling on the way up. Then they test what actually brings it down, and keep only what does.',
      skills: [
        { skill: 'Self-Regulation', where: 'Noticing a feeling rising and acting on it before it takes over' },
        { skill: 'Emotional Awareness', where: 'Connecting a feeling to what it physically feels like inside' },
        { skill: 'Coping Skills', where: 'Testing strategies and keeping the ones that work for their body' },
      ],
    },
    format: 'Project Guide',
  },
  'big-feelings-lab': {
    opening:
      'Your child learns to name a feeling, find where it sits in the body, rate its size, and watch it pass without trying to fix it. They build a personal feelings map and track a week of real moments. Emotional intelligence the way real adults wish they\'d learned it.',
    whatsIncluded: [
      'Feelings vocabulary beyond happy, sad, mad',
      'Body-map activity: where the feeling lives',
      'Size-rating scale to name how big it is',
      'Week-long real-moments tracker',
      'Version 2 reflection on patterns and triggers',
    ],
    skillTags: ['Emotional Intelligence', 'Self-Awareness', 'Mindfulness'],
    insideTheLearning: {
      lead:
        'Your child studies their own feelings the way a scientist studies anything. Name it, find where it sits in the body, rate how big it is, then watch it pass on its own. A feeling that can be named loses some of its power. I am a terrible person is stuck. I am disappointed, about a seven, is something a kid can ride out.',
      skills: [
        { skill: 'Emotional Intelligence', where: 'Building a feelings vocabulary well past happy, sad and mad' },
        { skill: 'Self-Awareness', where: 'Mapping where a feeling physically sits and inventing their own scale for how big it is' },
        { skill: 'Mindfulness', where: 'Tracking real moments across a week and watching feelings pass without acting on them' },
      ],
    },
    format: 'Project Guide',
  },
  'boredom-toolkit': {
    opening:
      'Your child builds their own way out of boredom that does not involve a screen. They learn to sit with the empty feeling for a beat, build a toolkit of materials and prompts, and take a real no-screens stretch to figure out what their own brain reaches for. Boredom is not a problem. It is the first step toward creativity.',
    whatsIncluded: [
      'Notice-what-boredom-feels-like opening exercise',
      'Personal interest map of what calls to them when nothing is required',
      'Build your own toolkit of materials and prompts from household stuff',
      'A real no-screens, no-plans stretch to run the toolkit',
      'Small log of what they made or did, the long-term proof',
    ],
    skillTags: ['Self-Direction', 'Creativity', 'Independence'],
    insideTheLearning: {
      lead:
        'Your child gets handed nothing and has to decide what to do with it. That is the entire point. Starting from a blank slate is the executive function muscle most adults are still working on, and it only builds when nobody fills the gap for them.',
      skills: [
        { skill: 'Self-Direction', where: 'Deciding what to do without anyone suggesting it' },
        { skill: 'Creativity', where: 'Making something out of nothing, which is the literal definition of creative work' },
        { skill: 'Independence', where: 'Initiating from a blank slate instead of waiting to be given a plan' },
      ],
    },
    format: 'Project Guide',
  },
  'frustration-tolerance-cards': {
    opening:
      '20 short challenges that are a little frustrating on purpose, each paired with one coping move kids practice while the feeling is actually happening. Stack stones that keep falling. Untangle a string without yanking. Lose a rigged race with a script ready. Small safe doses, repeated often, done together: a gym for staying calm.',
    whatsIncluded: [
      '20 frustration challenge cards',
      'Five themes, from steady hands to losing',
      'A named coping move on every card',
      'Golden rules for safe practice',
      'Stones, string, spoons. Nothing to buy.',
    ],
    skillTags: ['Emotional Regulation', 'Resilience', 'Perseverance', 'Sportsmanship', 'SEL'],
    insideTheLearning: {
      lead:
        'You cannot learn to handle frustration by hearing about it. These cards create small safe doses on purpose, with the coping move read BEFORE the wave hits so it is ready mid-feeling. The adult does every challenge too and struggles out loud, which is half the lesson.',
      skills: [
        { skill: 'Emotional Regulation', where: 'Naming the feeling, rating it 1 to 5, body resets, and "not yet" self-talk' },
        { skill: 'Resilience', where: 'Rebuilding after collapse number four without exploding or quitting' },
        { skill: 'Perseverance', where: 'Attempt counting and staying in the annoying middle of a task' },
        { skill: 'Sportsmanship', where: 'Rigged races and loser’s-dance rounds that make losing practicable' },
        { skill: 'SEL', where: 'A shared vocabulary the whole family uses long after the cards' },
      ],
    },
    seo: {
      title: 'Frustration Tolerance Challenge Cards for Kids Ages 6-14',
      description:
        '20 hands-on frustration tolerance challenges with an emotional regulation move on every card. Practice staying calm mid-feeling, at home or school. Low-prep.',
    },
    format: 'Card Guide',
  },
  'disappointment-lab': {
    opening:
      'Your child sits through a small planned letdown, names the feeling, and tracks how long it takes to bounce back. They repeat it over weeks and watch their recovery time shrink. Resilience built on real reps, not pep talks.',
    whatsIncluded: [
      'Planned small-letdown scenarios to practise with',
      'Feeling-naming step (no fixing, no fleeing)',
      'Recovery-time tracker across multiple weeks',
      'Pattern spotting: what makes it shorter',
      'Version 2 reflection on what changed',
    ],
    skillTags: ['Resilience', 'Emotional Regulation', 'Growth Mindset'],
    insideTheLearning: {
      lead:
        'Your child practises not getting what they wanted, deliberately and in a low-stakes way. Sitting with the feeling instead of melting down, then finding out what helps them recover. Disappointment turns out to be survivable and temporary, which is a lot easier to learn before it matters.',
      skills: [
        { skill: 'Resilience', where: 'Learning that disappointment is survivable and does not last' },
        { skill: 'Emotional Regulation', where: 'Feeling something hard and recovering without it taking over' },
        { skill: 'Growth Mindset', where: 'Discovering what actually helps them bounce back, and using it next time' },
      ],
    },
    format: 'Project Guide',
  },
  'comeback-journal': {
    opening:
      'Your child takes a real flop, breaks down what actually happened without spiraling, pulls out the lesson, and picks the next move. They build a comeback journal habit they can return to for years. Growth mindset on the page, not the poster.',
    whatsIncluded: [
      'Flop debrief framework (what happened, no blame)',
      'Lesson-pulling prompt: the real takeaway',
      'Next-move decision step',
      'Reusable journal template for ongoing use',
      'Version 2 review of past comebacks',
    ],
    skillTags: ['Resilience', 'Reflection', 'Growth Mindset'],
    insideTheLearning: {
      lead:
        'Your child keeps a record of things that went wrong and what came next. The skill is looking at their own part in it honestly without spiralling. A flop turns into information, and the inner voice shifts from a verdict to a question.',
      skills: [
        { skill: 'Resilience', where: 'Learning that a flop is information rather than a verdict on them' },
        { skill: 'Reflection', where: 'Looking honestly at what they did without falling into a spiral' },
        { skill: 'Growth Mindset', where: 'Building an inner voice that asks what to learn instead of what is wrong with me' },
      ],
    },
    format: 'Project Guide',
  },
  'hard-thing-challenge': {
    opening:
      'Your child picks one genuinely hard thing, commits to it for a set stretch, keeps a record of the messy middle where most people quit, and crosses the finish. Real perseverance practice with a real outcome they can point to.',
    whatsIncluded: [
      'Hard-thing selection with 8 starter ideas',
      'Commitment contract with a real timeline',
      'Messy-middle log for when it gets hard',
      'Quit-vs-push-through decision framework',
      'Finish-line reflection and Version 2 plan',
    ],
    skillTags: ['Perseverance', 'Goal-Setting', 'Resilience'],
    insideTheLearning: {
      lead:
        'Your child picks something genuinely hard and sticks with it past the point where it stops being fun. That middle stretch, the dip, is where perseverance is actually built. What they get at the end is evidence that they can do hard things.',
      skills: [
        { skill: 'Perseverance', where: 'Pushing through the dip, where sticking with things is actually built' },
        { skill: 'Goal-Setting', where: 'Setting a real goal and tracking progress against it' },
        { skill: 'Resilience', where: 'Earning the belief that they can do hard things by doing one' },
      ],
    },
    format: 'Project Guide',
  },
  'repair-conversation': {
    opening:
      'Your child practises what to actually do after they hurt someone: own it, skip the excuses, ask what would help, and follow through. They rehearse a real recent moment and run the conversation for real. The social skill nobody teaches but everyone needs.',
    whatsIncluded: [
      '4-step repair script (own it, no excuses, ask, follow through)',
      'Real recent moment selection',
      'Rehearsal step with parent role-play',
      'Run-it-for-real conversation step',
      'Version 2 reflection on what shifted',
    ],
    skillTags: ['Social Skills', 'Empathy', 'Communication'],
    insideTheLearning: {
      lead:
        'Your child learns to actually repair something they broke with a person. The key move is separating what they meant from the impact it had, and owning the second without softening it. An apology that lands is a skill most adults never quite get.',
      skills: [
        { skill: 'Social Skills', where: 'Owning the hurt without softening it or shifting the blame' },
        { skill: 'Empathy', where: 'Noticing the impact of what they did, separately from what they intended' },
        { skill: 'Communication', where: 'Saying hard things clearly, then listening to what is actually needed' },
      ],
    },
    format: 'Project Guide',
  },
  'kindness-missions': {
    opening:
      'Your child builds and works through a deck of real-world kindness challenges that take actual effort and noticing, not the easy "be nice" kind. They track which missions changed something and pick the ones to keep. Empathy with receipts.',
    whatsIncluded: [
      '12 real-world kindness mission cards (effort-required, not easy)',
      'Build-your-own mission slot for ideas of their own',
      'Mission log: what happened, what shifted',
      'Pick-your-keepers reflection step',
      'Version 2 deck refresh after a month',
    ],
    skillTags: ['Empathy', 'Social Awareness', 'Kindness'],
    insideTheLearning: {
      lead:
        'Your child runs kindness missions that take actual effort and noticing. Not the easy be-nice kind. Spotting the chance to help without being told is the hard part, and doing it means stepping toward someone rather than away.',
      skills: [
        { skill: 'Empathy', where: 'Tuning in to what someone else is feeling or needs' },
        { skill: 'Social Awareness', where: 'Spotting the chance to help without being asked' },
        { skill: 'Kindness', where: 'Turning the noticing into something they actually do' },
      ],
    },
    format: 'Project Guide',
  },
  'reading-the-room': {
    opening:
      'Your child practises noticing what other people feel before words show up. In cafes, family dinners, and playgrounds, they learn to scan a room, read body language, and infer the backstory. The social awareness most adults still don\'t have.',
    whatsIncluded: [
      'Room-scan framework for real settings',
      'Body-language signals: what to actually watch for',
      'Backstory-inference step (guess and check)',
      'Real-world observation log across 5 settings',
      'Version 2 reflection on what got easier',
    ],
    skillTags: ['Social Awareness', 'Empathy', 'Observation'],
    insideTheLearning: {
      lead:
        'Your child practises reading a room before anyone says anything. Body language, tone, what is not being said. Then the harder judgement: knowing whether to step in, back off, or stay quiet.',
      skills: [
        { skill: 'Social Awareness', where: 'Reading someone\'s emotional state before words confirm it' },
        { skill: 'Observation', where: 'Slowing down enough to actually look, and knowing when to stay quiet' },
        { skill: 'Empathy', where: 'Stitching the clues together into what someone else is experiencing' },
      ],
    },
    format: 'Project Guide',
  },
  'conflict-fix': {
    opening:
      'Your child learns a real script for working through a fight with a sibling or friend: cool down, say it without attacking, hear the other side, find the fix. They run it on a real recent conflict and watch what shifts. Not a worksheet about feelings.',
    whatsIncluded: [
      '4-step conflict script (cool down, speak, hear, fix)',
      'Cool-down tools that actually work in the moment',
      'Say-it-without-attacking sentence frames',
      'Real recent conflict practice run',
      'Version 2 revision after using it for real',
    ],
    skillTags: ['Conflict Resolution', 'Communication', 'Social Skills'],
    insideTheLearning: {
      lead:
        'Your child learns to repair a real conflict rather than wait it out. Step one is noticing they are too hot to talk yet. Then saying what they need without attacking, and hearing the other side without spending the whole time loading a comeback.',
      skills: [
        { skill: 'Conflict Resolution', where: 'Cooling down first, then working the disagreement through to an actual fix' },
        { skill: 'Communication', where: 'Saying what they feel and need without turning it into an attack' },
        { skill: 'Social Skills', where: 'Listening to the other side properly instead of preparing their rebuttal' },
      ],
    },
    format: 'Project Guide',
  },
  'solo-mission': {
    opening:
      'Your child takes on age-right "do it without me" challenges: order at a counter, call a place, run an errand. They start small and build up, tracking what felt hard and what stopped feeling hard. Real independence built one mission at a time.',
    whatsIncluded: [
      'Mission menu: 12 age-right "do it without me" options',
      'Start-small-build-up sequencing framework',
      'Mission prep step: what to say, what to expect',
      'After-action log: what felt hard, what got easier',
      'Version 2 mission with one bigger step',
    ],
    skillTags: ['Independence', 'Confidence', 'Communication'],
    insideTheLearning: {
      lead:
        'Your child does one real thing alone: orders it, asks for it, pays for it, handles it. Speaking up to a stranger is the foundation of most adult interactions and almost nothing in childhood practises it. The confidence afterwards is earned, not talked into them.',
      skills: [
        { skill: 'Independence', where: 'The lived experience of handling a real thing without a parent stepping in' },
        { skill: 'Communication', where: 'Speaking clearly and listening properly to someone outside the family' },
        { skill: 'Confidence', where: 'The kind that comes from a real win rather than a pep talk' },
      ],
    },
    format: 'Project Guide',
  },
  'worry-sorter': {
    opening:
      'Your child takes what\'s spinning in their head, sorts it into can-control vs cannot-control, makes a plan for the controllable, and practises letting go of the rest. A real anxiety tool, not a calming poster.',
    whatsIncluded: [
      'Brain-dump step: get the spin out on paper',
      'Can-control vs cannot-control sorting framework',
      'Action plan for the controllable list',
      'Let-it-go practice for the rest',
      'Version 2 review after a week of using it',
    ],
    skillTags: ['Emotional Regulation', 'Anxiety Tools', 'Problem-Solving'],
    insideTheLearning: {
      lead:
        'Your child takes a spinning, shapeless worry and breaks it into specific named ones. Then they sort them: what they can act on, and what they cannot. A plan for the first pile, and practice at setting down the second.',
      skills: [
        { skill: 'Emotional Regulation', where: 'Turning a spinning feeling into specific, named worries' },
        { skill: 'Anxiety Tools', where: 'Telling apart what they can act on from what they cannot, and setting the rest down' },
        { skill: 'Problem-Solving', where: 'Building a real plan for the things that are actually in their control' },
      ],
    },
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // FREE-GUIDE FULL VERSIONS
  // ═══════════════════════════════════════════════════════════════════
  'square-foot-safari': {
    opening:
      'Your child marks off one small square of ground and studies it like a real field scientist. They observe closely, dig into the layers, keep field notes, and return across seasons to track what changed. Real-world STEM science, done in your own backyard. Scientists call it a quadrat study.',
    whatsIncluded: [
      'Mark off a real one-foot study square',
      'Slow observation: notice what most people walk past',
      'Hands-on investigation of every layer, top to soil',
      'Keep real field notes and sketches',
      'Return across seasons to compare and track change',
    ],
    skillTags: ['STEM', 'Science', 'Observation', 'Nature', 'Field Notes'],
    insideTheLearning: {
      lead:
        'Your child marks out one square foot of ground and stays with it. Sampling, counting, recording and comparing, which is exactly how real field studies work. The discovery is that ordinary ground is full of life if you look long enough.',
      skills: [
        { skill: 'STEM', where: 'Sampling, counting, recording and comparing, the way field studies actually run' },
        { skill: 'Science', where: 'Running a real survey method rather than a nature walk' },
        { skill: 'Observation', where: 'Noticing small detail instead of skimming past it' },
        { skill: 'Nature', where: 'Finding out that ordinary ground is crowded with living things' },
        { skill: 'Field Notes', where: 'Recording what they find accurately enough to compare later' },
      ],
    },
    format: 'Activity Guide',
  },
  'snack-mission': {
    opening:
      'Your child takes a real budget, a real store, and a real mission, then does the maths that decides what comes home. They plan, track a running total, make trade-offs, and count the change. Real-world STEM maths that sticks, because the numbers point at something they care about.',
    whatsIncluded: [
      'A real budget and a real shopping mission',
      'Plan and estimate prices before you go',
      'Track a running total in the store',
      'Make real trade-offs when it does not all fit',
      'Check out, count the change, and review',
      'A Shopper\'s Toolkit: rounding, shelf tags and counting change',
    ],
    skillTags: ['STEM', 'Real-World Math', 'Budgeting', 'Decision-Making'],
    insideTheLearning: {
      lead:
        'Your child gets twenty dollars and a real shop. Mental maths on the fly with a genuine reason to get it right, because going over means putting something back. Then they notice the same dollar buys wildly different amounts depending on what they pick.',
      skills: [
        { skill: 'STEM', where: 'Estimating, checking and adjusting against a hard constraint' },
        { skill: 'Real-World Math', where: 'Adding, estimating and rounding in their head while walking the aisles' },
        { skill: 'Budgeting', where: 'Matching what they want against what they have' },
        { skill: 'Decision-Making', where: 'Trading one thing for another when it will not all fit' },
      ],
    },
    format: 'Activity Guide',
  },
  'household-orchestra': {
    opening:
      'Your child builds a piece of music from five household objects. No instruments, no lessons. They find every sound each object can make, sort them high to low, build a steady beat with layers on top, shape it into a piece with a beginning and an end, then perform it for the family. Real creativity, with the science of pitch built in.',
    whatsIncluded: [
      '5 steps from five objects to a live performance',
      'Instrument ideas from around the house',
      'High or low: why some things sound higher',
      'A rhythm builder with beats, layers and rests',
      'Piece shapes to give the music a beginning and an end',
    ],
    skillTags: ['Creativity', 'Science of Sound', 'Rhythm', 'Composition', 'Music'],
    insideTheLearning: {
      lead:
        'Your child turns five household objects into instruments, finds out why some sound high and others low, and shapes the sounds into a piece they perform. Rhythm is maths you feel rather than calculate.',
      skills: [
        { skill: 'Creativity', where: 'Making instruments and music out of nothing' },
        { skill: 'Science of Sound', where: 'Finding out why bigger, looser things sound lower and smaller, tighter things higher' },
        { skill: 'Rhythm', where: 'The maths hiding inside music, felt rather than worked out on paper' },
        { skill: 'Music', where: 'Building something that genuinely makes sound and learning to play it' },
        { skill: 'Confidence', where: 'Performing something of their own in front of other people' },
      ],
    },
    format: 'Activity Guide',
  },
  'three-ais-one-question': {
    opening:
      'Your child asks the same question to three different AI tools, compares the answers, and figures out where the AI is bluffing. Done together at the keyboard. The single most important AI skill a kid can learn: how to use it without being fooled by it.',
    whatsIncluded: [
      'Pick a question with a real, checkable answer',
      'Ask three AI tools the exact same thing',
      'Compare where they agree and disagree',
      'Fact-check and catch the AI bluffing',
      'Form your own answer you can actually trust',
    ],
    skillTags: ['Critical Thinking', 'AI Literacy', 'Fact-Checking', 'Skepticism'],
    insideTheLearning: {
      lead:
        'Your child asks three different AIs the same question and lines up the answers. They disagree, which is the whole lesson. Confident does not mean correct, and the fix is verifying against the real world rather than picking whichever sounded surest.',
      skills: [
        { skill: 'Critical Thinking', where: 'Comparing sources instead of trusting the first answer they see' },
        { skill: 'AI Literacy', where: 'Understanding that an AI predicts words, and confidence is not accuracy' },
        { skill: 'Fact-Checking', where: 'Verifying a claim against the real world' },
        { skill: 'Skepticism', where: 'Building the instinct to ask how do we know' },
      ],
    },
    format: 'Activity Guide',
  },
  'complaint-to-product': {
    opening:
      'Your child turns one everyday family annoyance into a real product idea. They collect complaints, pick one worth solving, invent a fix, design it, and pitch it to the family. Every great business started as somebody\'s complaint.',
    whatsIncluded: [
      'Collect real complaints worth solving',
      'Pick one problem to tackle',
      'Brainstorm and choose the best fix',
      'Design the product, name and all',
      'Pitch it and field real questions',
    ],
    skillTags: ['Problem-Solving', 'Innovation', 'Design Thinking', 'Confidence'],
    insideTheLearning: {
      lead:
        'Your child takes something that genuinely annoys them and turns it into a product. A vague complaint has to become a clear problem first, which is most of the work. Then they invent the fix and have to stand up and sell it.',
      skills: [
        { skill: 'Problem-Solving', where: 'Turning a vague annoyance into a clearly defined problem' },
        { skill: 'Innovation', where: 'Inventing something that did not exist before' },
        { skill: 'Design Thinking', where: 'Noticing what bugs other people too, which is where good products start' },
        { skill: 'Confidence', where: 'Standing up and selling an idea they believe in' },
      ],
    },
    format: 'Project Guide',
  },
  'two-minute-story': {
    opening:
      'Your child takes a real moment from their own life and learns to tell it as a clear, gripping story in two minutes. They find the shape, cut it to the bone, and tell it for real.',
    whatsIncluded: [
      'Find a true story worth telling',
      'Shape it: beginning, turn, and point',
      'Cut it to a tight two minutes',
      'Practise delivery, pace, and a strong opening',
      'Tell it for real to an audience',
    ],
    skillTags: ['Storytelling', 'Public Speaking', 'Communication', 'Confidence'],
    insideTheLearning: {
      lead:
        'Your child shapes something that really happened into a story worth listening to in two minutes. The limit is the teacher. Saying what matters and cutting everything else is the heart of good communication, and it is much harder than talking for ten.',
      skills: [
        { skill: 'Storytelling', where: 'Shaping real life into something someone would want to hear' },
        { skill: 'Communication', where: 'Saying what matters and cutting what does not' },
        { skill: 'Public Speaking', where: 'Talking to an audience with confidence, which most adults still avoid' },
        { skill: 'Confidence', where: 'Telling it to the whole table and finding out they can hold a room' },
      ],
    },
    format: 'Activity Guide',
  },
  'plan-a-mini-adventure': {
    opening:
      'Your child plans a real two-hour family outing from start to finish, and the family actually goes. They choose it, work out the details, make the plan, lead the day, and look back on it. Real ownership of a real decision.',
    whatsIncluded: [
      'Choose a real outing within set limits',
      'Work out travel, timing, cost, and weather',
      'Build a packing list and a schedule',
      'Lead the family through the day',
      'Look back and improve the next one',
    ],
    skillTags: ['Planning', 'Organization', 'Ownership', 'Executive Function'],
    insideTheLearning: {
      lead:
        'Your child plans a real outing for the family and then the family actually goes. Everything has to be held at once: what, when, where, and what is needed. And people are counting on it, which is a very different feeling from planning something hypothetical.',
      skills: [
        { skill: 'Planning', where: 'Thinking through every step of something before it happens' },
        { skill: 'Organization', where: 'Holding what, when, where and what is needed all at the same time' },
        { skill: 'Ownership', where: 'Carrying a real thing from idea to finish with the family depending on it' },
        { skill: 'Executive Function', where: 'The plan-ahead and follow-through muscle that schoolwork rarely builds' },
      ],
    },
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // DEBUNDLED SEASONAL-PACK ACTIVITIES
  // ═══════════════════════════════════════════════════════════════════
  'decomposition-detective': {
    opening:
      'Your child builds a jar of leaves and soil, sets it outside, and turns detective on a slow mystery: what is quietly breaking this down, and why? They predict, observe over weeks, meet the decomposers, and run a real fair test. Hands-on STEM science and patience, learned in the backyard.',
    whatsIncluded: [
      'Build a decomposition time capsule from a jar, leaves, and soil',
      'Predict what rots and what does not',
      'Weeks of real observation, drawn and described',
      'Meet the decomposers: the science of who breaks it down',
      'Run a fair test comparing two conditions',
    ],
    skillTags: ['STEM', 'Science', 'Observation', 'Patience', 'Cause & Effect'],
    insideTheLearning: {
      lead:
        'Your child watches things rot, on purpose, over weeks. Slow science is the hard kind because nothing happens fast enough to be exciting. They record the small changes, and link moisture, air and the tiny decomposers to what they are seeing.',
      skills: [
        { skill: 'STEM', where: 'Running a long observation properly and recording it week after week' },
        { skill: 'Science', where: 'Learning what decomposers actually do and why it matters' },
        { skill: 'Observation', where: 'Catching the small changes, not just the obvious ones' },
        { skill: 'Patience', where: 'Sticking with something that takes weeks to show a result' },
        { skill: 'Cause & Effect', where: 'Linking moisture, air and organisms to the rate things break down' },
      ],
    },
    format: 'Project Guide',
  },
  'seed-travelers': {
    opening:
      'Your child collects seeds and pods and cracks the mystery of how each one travels: some fly, some float, some hitch a ride. They sort, test, and rank the travellers, then design the ultimate seed. Hands-on STEM science that turns a handful of seeds into a lesson on how nature engineers survival.',
    whatsIncluded: [
      'Collect and examine different seeds and pods',
      'Predict and sort by how each one travels',
      'Real drop, float, and stick tests',
      'Rank the travellers and their trade-offs',
      'Design an original seed and explain its weakness',
    ],
    skillTags: ['STEM', 'Science', 'Classification', 'Prediction', 'Adaptation'],
    insideTheLearning: {
      lead:
        'Your child collects seeds and works out how each one travels, from its shape alone. Wind, water, hitching a ride on an animal. They sort by what a seed is built to do rather than what it looks like, then test whether they were right.',
      skills: [
        { skill: 'STEM', where: 'Predicting from structure, then running a hands-on test to check' },
        { skill: 'Science', where: 'Understanding seed dispersal as a real mechanism' },
        { skill: 'Classification', where: 'Sorting by a meaningful difference rather than by appearance' },
        { skill: 'Prediction', where: 'Guessing how a seed travels, then proving or correcting it' },
        { skill: 'Adaptation', where: 'Reading the shape of a thing closely enough to see what it is built for' },
      ],
    },
    format: 'Activity Guide',
  },
  'camouflage-challenge': {
    opening:
      'Your child hides natural objects in plain sight, times how hard they are to find, and works out the real rules of camouflage, the survival trick animals use every day. Part hiding game, part real experiment, ending with a rule they proved themselves and a hunt for camouflage in the wild.',
    whatsIncluded: [
      'Hide natural objects in plain sight',
      'A timed finding test that turns the game into data',
      'A fair test of the same object on two backgrounds',
      'Build a camouflage rule from evidence',
      'Hunt for real camouflaged creatures outside',
    ],
    skillTags: ['STEM', 'Science', 'Observation', 'Adaptation', 'Evidence'],
    insideTheLearning: {
      lead:
        'Your child hides objects against different backgrounds and works out the rule for what disappears. Change one thing, the background, and see what changes. By the end they have built a rule from evidence they gathered, which is what animals have been relying on all along.',
      skills: [
        { skill: 'STEM', where: 'Running a fair test by changing one variable and holding the rest steady' },
        { skill: 'Science', where: 'Understanding a real survival mechanism rather than being told about it' },
        { skill: 'Observation', where: 'Training their eyes to catch pattern, colour and texture' },
        { skill: 'Adaptation', where: 'Seeing why an animal\'s colouring is not decoration but survival' },
        { skill: 'Evidence', where: 'Building a rule from what they actually tested, not what they guessed' },
      ],
    },
    format: 'Activity Guide',
  },
  'nature-data-tracker': {
    opening:
      'Your child picks one thing in nature that changes day to day, temperature, rainfall or sunset time, and tracks it for one to two weeks. They build a jar rain gauge, guess before every reading, work out the daily changes, chart the numbers and use averages to find the real trend. Then they predict tomorrow and race a weather app. Real-world STEM maths, done with a jar and a notebook.',
    whatsIncluded: [
      'Pick what to track and build a jar rain gauge',
      'Guess, check and record every day',
      'Work out the daily changes, ups and downs',
      'Chart it and use averages to find the trend',
      'Predict tomorrow and race the weather app',
    ],
    skillTags: ['STEM', 'Real-World Math', 'Data', 'Pattern Recognition', 'Prediction'],
    insideTheLearning: {
      lead:
        'Your child records real measurements outside, day after day, and then finds the trend hiding inside a plain row of numbers. Once they can see the pattern, they predict the next reading and check whether they were right. That loop is what science actually is.',
      skills: [
        { skill: 'STEM', where: 'Running a proper data collection over time, then testing a prediction against it' },
        { skill: 'Real-World Math', where: 'Comparing numbers and working out the exact difference between two days' },
        { skill: 'Data', where: 'Recording real measurements accurately enough to be worth analysing' },
        { skill: 'Pattern Recognition', where: 'Seeing the trend hidden inside an ordinary row of numbers' },
        { skill: 'Prediction', where: 'Using the pattern to make a reasoned guess, then finding out' },
      ],
    },
    format: 'Project Guide',
  },
  'grow-it-eat-it': {
    opening:
      'Your child plants something they can actually eat, tends it from seed to plate, and eats the thing they grew. Along the way they pick up responsibility, plant science, and the patience of caring for a living thing every day. Hands-on STEM science that turns a pot of radishes into real food and a real sense of I grew that.',
    whatsIncluded: [
      'Choose and plant a fast-growing edible',
      'Set up a growing spot and a daily care routine',
      'Track how it grows, week by week',
      'Spot droops and yellow leaves and fix them',
      'Harvest and eat what they grew',
    ],
    skillTags: ['STEM', 'Science', 'Responsibility', 'Patience', 'Observation'],
    insideTheLearning: {
      lead:
        'Your child grows food and then eats it, which takes weeks and cannot be rushed. Something living depends on them every day, not only on the days they feel like it. When one of seed, water, light or soil is missing, the plant tells them.',
      skills: [
        { skill: 'STEM', where: 'Watching how the variables interact and what happens when one is missing' },
        { skill: 'Science', where: 'Seeing first-hand how a seed, water, light and soil turn into food' },
        { skill: 'Responsibility', where: 'Taking full charge of a living thing that depends on them daily' },
        { skill: 'Patience', where: 'Sticking with something that pays off slowly' },
        { skill: 'Observation', where: 'Tracking the growth and noticing what the plant is telling them' },
      ],
    },
    format: 'Project Guide',
  },
  'kitchen-science-lab': {
    opening:
      'Your child solves a real chemistry mystery in the kitchen: five white powders that look almost the same. They make a colour-changing juice from red cabbage, run fair tests with water and vinegar, build a results table, then identify a secret powder you hand them, ruling suspects out one test at a time. Hands-on STEM science that teaches kids to think with evidence, not guesses.',
    whatsIncluded: [
      '5 steps from five suspects to a solved mystery',
      'Make a colour-changing juice from red cabbage',
      'A fair-test results table for five powders',
      'A clue key for ruling suspects out',
      'Question ideas for their own experiment',
    ],
    skillTags: ['STEM', 'Science', 'Scientific Method', 'Prediction', 'Chemistry'],
    insideTheLearning: {
      lead:
        'Your child identifies a mystery powder with evidence, not guesses: an indicator they made themselves, a fair-test results table, and tests chosen for what they rule out. That is the actual scientific method, not a demonstration of it.',
      skills: [
        { skill: 'Logic', where: 'Ruling suspects out, test by test, until only one is left' },
        { skill: 'Science', where: 'Predicting, testing, observing and concluding for real' },
        { skill: 'Scientific Method', where: 'Following the process properly, including when the result is not what they wanted' },
        { skill: 'Prediction', where: 'Committing to what they think will happen before finding out' },
        { skill: 'Chemistry', where: 'Watching reactions happen with ingredients they know' },
      ],
    },
    format: 'Activity Guide',
  },
  'probability-lab': {
    opening:
      'Your child builds a carnival game, works out the real odds of winning it, then sets a price and prize so the house comes out ahead. They test the maths against real games played and discover why every prize wall and scratch ticket is built to win slowly. Real-world STEM maths that turns probability into a game they can feel.',
    whatsIncluded: [
      '5 steps from a first guess to counting the till',
      'Build a carnival game: a paper-plate spinner, cups or dice',
      'Count the odds, then test them over 40 plays',
      'Set a price and prize so the house wins, but players still win sometimes',
      'An odds toolkit, plus where the trick hides: claw machines, prize walls, scratch tickets',
    ],
    skillTags: ['STEM', 'Real-World Math', 'Probability', 'Expected Value', 'Healthy Skepticism'],
    insideTheLearning: {
      lead:
        'Your child builds carnival-style games and works out the odds behind them. How likely something is when you calculate it, versus how likely it feels, are rarely the same number. Then they find where the profit hides in the gap between price in and prize out.',
      skills: [
        { skill: 'STEM', where: 'Predicting the odds, then running enough trials to test the prediction' },
        { skill: 'Real-World Math', where: 'Money maths on price in against prize out' },
        { skill: 'Probability', where: 'Working out how likely something actually is rather than how likely it seems' },
        { skill: 'Expected Value', where: 'Finding where the profit hides in the gap between cost and payout' },
        { skill: 'Healthy Skepticism', where: 'Seeing exactly how a game can be built to beat the player' },
      ],
    },
    format: 'Activity Guide',
  },
  'secret-code-lab': {
    opening:
      'Your child learns to write and crack secret codes, from simple ciphers to a keyword cipher they build themselves, then breaks a message with no key using letter-frequency detective work. They finish with a coded treasure hunt and discover how the same basic idea keeps passwords and messages safe. Logic and pattern-hunting disguised as a spy game.',
    whatsIncluded: [
      'Crack a starter code and learn how ciphers work',
      'Build your own cipher, including a keyword code',
      'Break a coded message with no key, using frequency',
      'See how encryption protects real secrets',
      'Design a coded treasure hunt',
    ],
    skillTags: ['STEM', 'Logic', 'Pattern Recognition', 'Cryptography', 'Problem-Solving'],
    insideTheLearning: {
      lead:
        'Your child makes and breaks real ciphers. A shift cipher is arithmetic wearing a disguise: move each letter by a number and wrap around. Cracking one leans on letter frequency, which is statistics. Mostly it teaches staying with a hard puzzle past the stuck part.',
      skills: [
        { skill: 'STEM', where: 'Real cryptography and the statistics that break it' },
        { skill: 'Logic', where: 'Working out the rule that governs the whole message' },
        { skill: 'Pattern Recognition', where: 'Spotting the rule hidden in a jumble of letters' },
        { skill: 'Cryptography', where: 'Building ciphers that hold up and then breaking someone else\'s' },
        { skill: 'Problem-Solving', where: 'Trying one approach after another and pushing through the stuck feeling' },
      ],
    },
    format: 'Activity Guide',
  },
  'body-owners-manual': {
    opening:
      'Your child becomes the scientist of their own body, running real self-experiments: resting heart rate, reaction time, senses, reflexes, and quirks. They measure, record, and compile it all into a real body manual for the one machine they will use every day. Hands-on STEM science that turns body literacy into something they discovered, not something they were told.',
    whatsIncluded: [
      'Take baseline body readings',
      'Test the heart, reflexes, and reaction time',
      'Run experiments on the senses',
      'Find personal quirks and bests',
      'Compile it all into a real body manual',
    ],
    skillTags: ['STEM', 'Science', 'Measurement', 'Body Literacy', 'Data'],
    insideTheLearning: {
      lead:
        'Your child runs experiments on their own body and trusts the readings over their assumptions. Pulse before and after exercise. What sleep does to the numbers. What food does. It is a fair test where they are both the scientist and the subject, and the data is theirs.',
      skills: [
        { skill: 'STEM', where: 'Designing a fair test on themselves and changing one variable at a time' },
        { skill: 'Science', where: 'Seeing cause and effect directly as exercise, food and rest move the numbers' },
        { skill: 'Measurement', where: 'Taking real readings off their own body and recording them accurately' },
        { skill: 'Body Literacy', where: 'Learning how their own body actually behaves rather than how they assumed it did' },
        { skill: 'Data', where: 'Building a record over time and reading the pattern that comes out of it' },
      ],
    },
    format: 'Activity Guide',
  },
  'family-history-detective': {
    opening:
      'Your child interviews the oldest person they can talk to and uncovers the real family stories nobody has written down. They build a timeline, sketch a family tree, and turn one memory into a story worth keeping. Real interviewing, active listening, and storytelling, plus a connection across generations that most kids never get.',
    whatsIncluded: [
      'Choose and interview an older relative',
      'Prepare open questions that unlock stories',
      'Dig past the facts to the real memories',
      'Build a family timeline and tree',
      'Write up one story and share it',
    ],
    skillTags: ['Interviewing', 'Active Listening', 'Storytelling', 'Writing', 'History'],
    insideTheLearning: {
      lead:
        'Your child interviews the family and turns rambling memories into stories worth reading. Real questions, then following the answer rather than the list. The discovery is usually that the people around them have far more in them than anyone mentioned.',
      skills: [
        { skill: 'Interviewing', where: 'Asking real questions and following where the answers actually go' },
        { skill: 'Active Listening', where: 'Hearing what was said, and asking the next question because of it' },
        { skill: 'Storytelling', where: 'Turning a wandering memory into something with shape' },
        { skill: 'Writing', where: 'Getting it down so it reads well and survives' },
        { skill: 'History', where: 'Connecting across generations and finding history in their own family' },
      ],
    },
    format: 'Project Guide',
  },
  'teach-it-to-learn-it': {
    opening:
      'Your child takes a skill they already know, a card trick, a recipe, a soccer move, breaks it into teachable steps, plans a real lesson, and teaches it to someone for real. Then they check if it landed and teach it better. The old truth in action: you never understand something as well as when you have to teach it.',
    whatsIncluded: [
      'Pick a skill they already know well',
      'Break it into clear, teachable steps',
      'Plan a real lesson with a hook and practice',
      'Teach it to a live student',
      'Check it landed, then teach it better',
    ],
    skillTags: ['Teaching', 'Public Speaking', 'Structuring Ideas', 'Communication', 'Metacognition'],
    insideTheLearning: {
      lead:
        'Your child teaches someone else something they can already do. Turning an automatic skill into clear ordered steps is where they discover the gaps in their own understanding. You do not really know a thing until you have had to teach it.',
      skills: [
        { skill: 'Teaching', where: 'Turning something automatic into clear steps another person can follow' },
        { skill: 'Structuring Ideas', where: 'Breaking a whole skill into an order that builds' },
        { skill: 'Public Speaking', where: 'Leading a lesson and holding one listener\'s attention start to finish' },
        { skill: 'Communication', where: 'Adjusting the explanation when the person in front of them is lost' },
        { skill: 'Metacognition', where: 'Understanding how they themselves learned it in the first place' },
      ],
    },
    format: 'Activity Guide',
  },
  'trade-it-up': {
    opening:
      'Your child starts with one small, nearly worthless object and trades their way up through a chain of real swaps, no money, just deal after deal. Along the way they hit the question that drives all of business: what is a thing worth, and worth to whom? Real negotiation, value, and resourcefulness, inspired by the famous red-paperclip-to-a-house story.',
    whatsIncluded: [
      'Pick a humble starting object',
      'Find the person who values it most',
      'Make real trades and log every swap',
      'Learn the moves that turn a no into a yes',
      'Aim for win-win deals and count the climb',
    ],
    skillTags: ['Negotiation', 'Value', 'Resourcefulness', 'Persuasion', 'Entrepreneurship'],
    insideTheLearning: {
      lead:
        'Your child starts with something small and trades their way up. Every trade is a real negotiation with a real person who can say no. What something is worth turns out not to be fixed, and the same object is treasure to one person and junk to another.',
      skills: [
        { skill: 'Negotiation', where: 'Making an offer, hearing no, and coming back with something better' },
        { skill: 'Value', where: 'Seeing that worth is not fixed and depends entirely on who is asked' },
        { skill: 'Resourcefulness', where: 'Turning almost nothing into something real through nerve and timing' },
        { skill: 'Persuasion', where: 'Making the case for a trade without pushing too hard' },
        { skill: 'Entrepreneurship', where: 'Running the whole thing themselves, deal after deal' },
      ],
    },
    format: 'Project Guide',
  },
  'play-the-world': {
    opening:
      'While travelling, your child finds a real game that local kids play, learns it properly, the rules, the words, the gear, and plays it right where you are. Then they figure out what the game reveals about the place. Worldschooling through the one language every child speaks: play. There is no faster way inside a culture.',
    whatsIncluded: [
      'Find a game local kids really play',
      'Learn the real rules, from locals if you can',
      'Make or gather the gear',
      'Learn the words that go with the game',
      'Play it for real and read the culture in it',
    ],
    skillTags: ['Cultural Immersion', 'Observation', 'Cross-Cultural Connection', 'Curiosity', 'Worldschooling'],
    insideTheLearning: {
      lead:
        'Your child plays the games local kids play, in the place they are. Not watching from the outside, joining in. It is the fastest way into a culture, and it makes them look at a new place closely enough to notice how it actually works.',
      skills: [
        { skill: 'Cultural Immersion', where: 'Stepping into local life by doing what local kids do, not observing it' },
        { skill: 'Observation', where: 'Looking at a new place closely enough to see how it works' },
        { skill: 'Cross-Cultural Connection', where: 'Playing alongside kids they cannot fully talk to yet' },
        { skill: 'Curiosity', where: 'Following what is different instead of retreating to the familiar' },
        { skill: 'Worldschooling', where: 'Turning being somewhere new into actual learning' },
      ],
    },
    format: 'Activity Guide',
  },
  'people-scientist': {
    opening:
      'Your child turns the scientific method loose on other people: they form a real hypothesis (smile first and more people smile back), run a kind little experiment, tally what actually happens, and draw a conclusion. Real data about real behaviour, and because every experiment is a small kind act, they build empathy and social confidence as they go.',
    whatsIncluded: [
      'Watch people and find a testable question',
      'Form a hypothesis about how people behave',
      'Design and run a kind experiment',
      'Tally the results honestly',
      'Draw a conclusion and test it again',
    ],
    skillTags: ['Scientific Method', 'Empathy', 'Observation', 'Social Confidence', 'Hypothesis-Testing'],
    insideTheLearning: {
      lead:
        'Your child studies people the way a scientist studies anything: watch closely, form a prediction, test it fairly. It sounds clinical and it is the opposite. Paying that much attention to what drives someone is where empathy actually comes from.',
      skills: [
        { skill: 'Scientific Method', where: 'Predicting, testing fairly and revising when the result disagrees' },
        { skill: 'Observation', where: 'Watching people closely enough to notice real patterns in behaviour' },
        { skill: 'Hypothesis-Testing', where: 'Making a prediction about people, then running a fair test on it' },
        { skill: 'Empathy', where: 'Paying close, kind attention and wondering what drives someone' },
        { skill: 'Social Confidence', where: 'Getting comfortable enough with people to study them up close' },
      ],
    },
    format: 'Activity Guide',
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────

/** Look up a product description, with fallback for products not in the map */
export function getProductDescription(
  slug: string,
  fallbackDescription: string,
  category: string,
  activityCount: number | null,
  isBundle: boolean,
): ProductDescription {
  if (productDescriptions[slug]) return productDescriptions[slug];

  // Auto-generate for unknown products
  const whatsIncluded = [
    activityCount ? `${activityCount} guided activities` : 'Guided activities with step-by-step instructions',
    'Age adaptation notes included',
    'Minimal or no materials needed',
    'PDF guide: open on any device',
  ];

  return {
    opening: fallbackDescription,
    whatsIncluded,
    skillTags: [],
    format: isBundle ? 'Bundle' : 'Project Guide',
  };
}

/** Get "Best For" list for a category */
export function getBestFor(category: string): string[] {
  return SHARED_BEST_FOR[category] || SHARED_BEST_FOR.default;
}
