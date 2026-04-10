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
  /** Product format label */
  format: 'Activity Pack' | 'Project Guide' | 'Card Pack' | 'Parent Guide' | 'Bundle';
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

/** Category-specific "Best For" audiences */
export const SHARED_BEST_FOR: Record<string, string[]> = {
  default: [
    'Homeschool families',
    'Worldschool families',
    'Families who want meaningful, low-prep activities',
    'Parents who value real-world learning',
  ],
  'outdoor-learning': [
    'Homeschool families',
    'Worldschool families',
    'Outdoor classrooms & nature programs',
    'Families who love learning outside',
  ],
  'creativity-anywhere': [
    'Homeschool families',
    'Worldschool families',
    'Project-based learning',
    'Kids who love building, designing & creating',
  ],
  'ai-literacy': [
    'Homeschool families',
    'Worldschool families',
    'Digital citizenship education',
    'Families raising tech-savvy, critical thinkers',
  ],
  'real-world-math': [
    'Homeschool families',
    'Worldschool families',
    'Practical maths & financial literacy',
    'Families who learn through everyday life',
  ],
  'communication-writing': [
    'Homeschool families',
    'Worldschool families',
    'Real-world writing & communication',
    'Families who value practical communication skills',
  ],
  'entrepreneurship': [
    'Homeschool families',
    'Worldschool families',
    'Business & entrepreneurship education',
    'Families raising future founders & problem-solvers',
  ],
  'planning-problem-solving': [
    'Homeschool families',
    'Worldschool families',
    'Project planning & logistics',
    'Families who value independent thinking',
  ],
  'start-here': [
    'Homeschool families',
    'Worldschool families',
    'Families new to real-world learning',
    'Parents looking for a starting framework',
  ],
  bundle: [
    'Homeschool families',
    'Worldschool families',
    'Families who want a complete resource library',
    'Parents looking for the best value',
  ],
};

// ─── Per-product descriptions ────────────────────────────────────────

export const productDescriptions: Record<string, ProductDescription> = {
  // ═══════════════════════════════════════════════════════════════════
  // BUNDLES
  // ═══════════════════════════════════════════════════════════════════
  'seasonal-bundle': {
    opening:
      'All four seasonal packs in one download: spring, summer, fall, and winter. 80 outdoor activities designed to match each season\'s unique energy and opportunities. Your family gets a full year of outdoor learning, ready whenever the season changes.',
    whatsIncluded: [
      '4 complete seasonal packs (Spring, Summer, Fall, Winter)',
      '80 outdoor activities total, 20 per season',
      'Language Arts, Maths, Science, and Physical Education in every pack',
      'Age adaptation notes for ages 6–14',
      '3 levels per activity: Explore / Develop / Extend',
    ],
    skillTags: ['Science', 'Maths', 'Writing', 'Observation', 'Nature', 'PE'],
    format: 'Bundle',
  },
  'creativity-mega-bundle': {
    opening:
      'All 10 Creativity Anywhere projects in one download. From building board games and Rube Goldberg machines to creating theme parks, museums, and stop-motion films, each project is a multi-step creative adventure that builds design thinking, problem-solving, and artistic confidence.',
    whatsIncluded: [
      '10 complete project guides',
      'Board Game Studio, Rube Goldberg Machine, Survival Base, Imaginary World',
      'Creature Habitat, Theme Park, Mini Movie, Invent a Sport',
      'Kinetic Sculpture, Build a Museum',
      'Each project spans multiple sessions with clear phases',
    ],
    skillTags: ['Design Thinking', 'Engineering', 'Art', 'Writing', 'Problem-Solving'],
    format: 'Bundle',
  },
  'real-world-mega-bundle': {
    opening:
      'All 10 Real-World Relevance activities in one download. Budgeting, meal planning, micro-businesses, media literacy, travel planning, smart shopping, and more. Each activity puts kids in real-life scenarios where they practise skills that actually matter, using real money, real decisions, and real thinking.',
    whatsIncluded: [
      '10 complete activity guides',
      'Budget Challenge, Kitchen Maths, Smart Shopper, Micro-Business',
      'Media & Info Check, Problem-Solver Studio, Travel Day Itinerary',
      'Community Impact, Write It Like a Pro, Time & Energy Planner',
      'Each activity uses real-world scenarios and practical decision-making',
    ],
    skillTags: ['Financial Literacy', 'Critical Thinking', 'Writing', 'Planning', 'Problem-Solving'],
    format: 'Bundle',
  },
  'ai-digital-bundle': {
    opening:
      'All 10 AI & Digital Literacy activities in one download. From understanding what AI actually is, to spotting deepfakes, checking for bias, building ethical AI projects, and managing digital boundaries. Everything your child needs to be a thoughtful, confident digital citizen.',
    whatsIncluded: [
      '10 complete activity guides covering AI and digital literacy',
      'AI Basics, Prompt Like a Coach, Hallucination Detective',
      'Bias & Fairness Lab, Privacy & Digital Footprint, Deepfake Spotter',
      'Algorithm Awareness, Healthy Tech Boundaries, Create With AI',
      'Build Your Own AI Helper',
    ],
    skillTags: ['AI Literacy', 'Critical Thinking', 'Digital Citizenship', 'Ethics', 'Privacy'],
    format: 'Bundle',
  },
  'nature-art-bundle': {
    opening:
      'Three of our most popular nature packs together: Land Art Challenge Cards, Nature Crafts for Kids, and the Nature Journal. From building sculptures with sticks and stones to pressing flowers, sketching birds, and creating art from found materials. Nature meets creativity in every activity.',
    whatsIncluded: [
      '3 complete nature + art packs',
      'Land Art Challenge Cards: 15 outdoor art challenges',
      'Nature Crafts for Kids: hands-on projects with found materials',
      'My Nature Journal: guided journaling prompts for outdoor observation',
      'All activities use materials found in nature, no supplies needed',
    ],
    skillTags: ['Art', 'Nature', 'Observation', 'Creativity', 'Journaling'],
    format: 'Bundle',
  },
  'outdoor-toolkit-bundle': {
    opening:
      'Four essential outdoor learning packs in one download: Nature Walk Task Cards, Outdoor Learning Missions, STEM Challenge Cards, and Nature Choice Boards. Whether you\'re in the backyard, at the park, or on a trail, you\'ll have a rich activity ready to go.',
    whatsIncluded: [
      '4 complete outdoor learning packs',
      'Nature Walk Task Cards: read-aloud exploration prompts',
      'Outdoor Learning Missions: structured outdoor challenges',
      'STEM Challenge Cards: 20 nature-based engineering challenges',
      'Nature Choice Boards: 5 self-directed activity menus',
    ],
    skillTags: ['STEM', 'Nature', 'Observation', 'Engineering', 'Self-Direction'],
    format: 'Bundle',
  },

  'outdoor-mega-bundle': {
    opening:
      'All 7 outdoor and nature activity guides in one download: Nature Walk Task Cards, Outdoor Learning Missions, STEM Challenge Cards, Nature Choice Boards, Land Art Challenges, Nature Crafts, and the Nature Journal. Whether you\'re building sculptures from sticks, solving STEM challenges at the park, or journaling beside a stream, this bundle has you covered for every kind of outdoor learning.',
    whatsIncluded: [
      '7 complete outdoor & nature packs',
      'Nature Walk Task Cards: read-aloud exploration prompts',
      'Outdoor Learning Missions: structured outdoor challenges',
      'STEM Challenge Cards: 20 nature-based engineering challenges',
      'Nature Choice Boards: 5 self-directed activity menus',
      'Land Art Challenge Cards: 15 outdoor art challenges',
      'Nature Crafts for Kids: hands-on projects with found materials',
      'My Nature Journal: guided journaling prompts for outdoor observation',
    ],
    skillTags: ['STEM', 'Nature', 'Art', 'Observation', 'Engineering', 'Creativity', 'Journaling'],
    format: 'Bundle',
  },

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
    format: 'Activity Pack',
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
    format: 'Activity Pack',
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
    format: 'Activity Pack',
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
    format: 'Activity Pack',
  },
  'nature-journal-walks': {
    opening:
      'A guided nature journal that helps kids slow down, observe, and connect with the outdoors. Packed with prompts for sketching, writing, and recording what they see, hear, and wonder about. Works in any season, any landscape, any weather.',
    whatsIncluded: [
      'Guided journaling prompts for outdoor observation',
      'Sketching, drawing, and descriptive writing activities',
      'Observation focuses: shadows, textures, sounds, patterns, colour',
      'Seasonal variations — works year-round',
      'Reusable format: use again and again across seasons',
    ],
    skillTags: ['Observation', 'Journaling', 'Science', 'Art', 'Writing'],
    format: 'Activity Guide',
  },
  'nature-walk-task-cards': {
    opening:
      'Read-aloud task cards that turn any walk into a focused nature exploration. Each card gives kids a specific mission: find three textures, listen for five sounds, sketch the smallest thing you can find. Perfect for parents who want a simple, low-prep way to make walks more engaging.',
    whatsIncluded: [
      'Read-aloud outdoor learning prompt cards',
      'Each card focuses on a specific sense or skill',
      'Works in parks, backyards, trails, beaches, or neighbourhoods',
      'Designed for parent-led or independent use',
      'Reusable across seasons, with different results every time',
    ],
    skillTags: ['Observation', 'Nature', 'Sensory Learning', 'Science'],
    format: 'Card Pack',
  },
  'nature-choice-boards': {
    opening:
      'Choose-your-own-adventure style nature activities. Each board gives kids 9 options to pick from: observe, create, explore, or investigate. Perfect for self-directed learners who want to choose what they do and how deep they go.',
    whatsIncluded: [
      '5 nature choice board activity menus',
      '9 options per board, a mix of observation, art, science, and movement',
      'Self-directed format builds independence and decision-making',
      'Works outdoors in any environment',
      'Flexible: complete one activity or the whole board',
    ],
    skillTags: ['Self-Direction', 'Nature', 'Science', 'Art', 'Decision-Making'],
    format: 'Card Pack',
  },
  'outdoor-learning-missions': {
    opening:
      'Mission-style outdoor challenges that get kids moving, observing, and problem-solving in nature. Each mission has a clear objective, steps to follow, and a reflection prompt. From building shelters to mapping ecosystems, these turn any outdoor space into an adventure zone.',
    whatsIncluded: [
      'Structured outdoor mission challenge cards',
      'Each mission: clear objective, steps, and reflection prompt',
      'Building, mapping, observing, and problem-solving challenges',
      'Works in backyards, parks, forests, and beaches',
      'Designed for solo or group missions',
    ],
    skillTags: ['Problem-Solving', 'Nature', 'Engineering', 'Observation', 'Science'],
    format: 'Card Pack',
  },
  'outdoor-stem-challenges': {
    opening:
      '20 outdoor STEM challenges that use the natural world as a laboratory. Build a bridge from sticks. Design a waterproof shelter. Measure tree heights using shadows. Engineer a boat that floats. Each challenge is a hands-on engineering adventure using only what you find outside.',
    whatsIncluded: [
      '20 outdoor STEM challenge cards',
      'Engineering: bridges, shelters, boats, towers, and structures',
      'Science: measurement, forces, materials, buoyancy',
      'Each challenge uses found natural materials only',
      'Includes testing criteria and reflection prompts',
    ],
    skillTags: ['STEM', 'Engineering', 'Science', 'Problem-Solving', 'Nature'],
    format: 'Card Pack',
  },
  'land-art-challenges': {
    opening:
      '15 land art challenges that turn natural materials into beautiful, temporary art. Create a mandala from stones. Build a spiral from leaves. Arrange colours from the forest floor. Kids learn about patterns, symmetry, colour, and composition, all while spending time outside.',
    whatsIncluded: [
      '15 land art challenge cards',
      'Mandalas, spirals, mosaics, patterns, and sculptures',
      'Uses only natural materials: stones, leaves, sticks, petals, bark',
      'Teaches pattern, symmetry, colour theory, and composition',
      'Temporary art: photograph and leave no trace',
    ],
    skillTags: ['Art', 'Nature', 'Patterns', 'Creativity', 'Observation'],
    format: 'Card Pack',
  },
  'nature-crafts': {
    opening:
      'Hands-on nature craft projects using materials found outdoors. Leaf pressing, stick weaving, flower pounding, bark rubbings, and more. Each project connects creativity with nature observation. Kids collect materials mindfully and create something meaningful from them.',
    whatsIncluded: [
      'Nature craft project guides using found materials',
      'Leaf pressing, flower pounding, bark rubbings, stick weaving',
      'Each project combines collection, observation, and creation',
      'Minimal additional supplies, mostly found materials',
      'Suitable for all seasons with seasonal variations',
    ],
    skillTags: ['Art', 'Nature', 'Crafts', 'Observation', 'Fine Motor Skills'],
    format: 'Activity Pack',
  },

  // ═══════════════════════════════════════════════════════════════════
  // CREATIVITY PROJECTS
  // ═══════════════════════════════════════════════════════════════════
  'board-game-studio': {
    opening:
      'Design, build, and playtest an original board game from scratch. Kids brainstorm themes, create rules, design the board, craft game pieces, and iterate based on playtesting. A complete creative project that builds design thinking, maths, writing, and strategic reasoning.',
    whatsIncluded: [
      'Complete project guide with step-by-step phases',
      'Theme brainstorming and game mechanic design',
      'Board layout, game piece creation, and rule writing',
      'Playtesting framework with feedback prompts',
      'Iteration cycle: improve based on real play',
    ],
    skillTags: ['Design Thinking', 'Maths', 'Writing', 'Strategy', 'Art'],
    format: 'Project Guide',
  },
  'rube-goldberg-machine': {
    opening:
      'Build an absurdly complicated machine to do something simple. Kids design chain reactions using everyday materials like dominoes, ramps, balls, and levers. Each step teaches engineering principles, cause-and-effect, and creative problem-solving through the joy of building something gloriously over-engineered.',
    whatsIncluded: [
      'Complete project guide with engineering principles',
      'Chain reaction design and planning steps',
      'Materials list using everyday household items',
      'Testing, troubleshooting, and iteration framework',
      'Extension challenges for more complex builds',
    ],
    skillTags: ['Engineering', 'Physics', 'Problem-Solving', 'Design', 'Cause & Effect'],
    format: 'Project Guide',
  },
  'survival-base': {
    opening:
      'Design and build a survival base for an imaginary expedition. Kids choose a biome, research challenges, plan their base layout, create models, and present their design. Combines geography, engineering, science, and creative design into one epic project.',
    whatsIncluded: [
      'Complete project guide from concept to presentation',
      'Biome research and environmental challenge analysis',
      'Base layout design with practical problem-solving',
      'Model building with everyday materials',
      'Presentation and defence of design choices',
    ],
    skillTags: ['Geography', 'Engineering', 'Science', 'Design', 'Presentation'],
    format: 'Project Guide',
  },
  'imaginary-world': {
    opening:
      'Create an entire imaginary world from scratch, including its geography, creatures, rules, languages, and stories. Kids build maps, design ecosystems, invent civilisations, and write lore. A massive open-ended creative project that spans writing, art, science, and worldbuilding.',
    whatsIncluded: [
      'Complete worldbuilding project guide',
      'Geography, climate, and ecosystem design',
      'Creature invention and civilisation building',
      'Map-making, language creation, and lore writing',
      'Flexible timeline: expand as deep as your child wants',
    ],
    skillTags: ['Writing', 'Art', 'Geography', 'Worldbuilding', 'Imagination'],
    format: 'Project Guide',
  },
  'creature-habitat': {
    opening:
      'Invent a brand-new creature and build its entire habitat. Kids design anatomy, diet, behaviour, and environment. Then they construct a physical model of the habitat. Combines biology, art, engineering, and scientific thinking into one creative adventure.',
    whatsIncluded: [
      'Complete creature + habitat design guide',
      'Anatomy, diet, behaviour, and adaptation design',
      'Habitat environment planning and ecosystem thinking',
      'Physical model construction with everyday materials',
      'Scientific presentation of creature and habitat',
    ],
    skillTags: ['Biology', 'Art', 'Engineering', 'Scientific Thinking', 'Design'],
    format: 'Project Guide',
  },
  'theme-park': {
    opening:
      'Design a theme park or adventure course from concept to completion. Kids plan rides, map layouts, calculate budgets, design marketing materials, and build scale models. A project that combines maths, art, engineering, writing, and business thinking.',
    whatsIncluded: [
      'Complete theme park design project guide',
      'Ride and attraction design with safety considerations',
      'Park layout mapping and visitor flow planning',
      'Budget calculations and pricing decisions',
      'Marketing design and scale model building',
    ],
    skillTags: ['Maths', 'Design', 'Engineering', 'Business', 'Art'],
    format: 'Project Guide',
  },
  'mini-movie': {
    opening:
      'Create a mini movie, stop-motion animation, or radio drama from scratch. Kids write scripts, design sets, create characters, record audio, and edit their production. A full creative process from concept to premiere, combining storytelling, technology, and artistic expression all in one.',
    whatsIncluded: [
      'Complete production guide (movie, animation, or radio drama)',
      'Scriptwriting, storyboarding, and character design',
      'Set design, costume, and prop creation',
      'Recording, editing, and production tips',
      'Premiere planning: share with family and friends',
    ],
    skillTags: ['Storytelling', 'Writing', 'Technology', 'Art', 'Collaboration'],
    format: 'Project Guide',
  },
  'invent-a-sport': {
    opening:
      'Create an entirely new sport with original rules, equipment, and scoring. Kids design the game, build equipment from everyday materials, write a rulebook, playtest with family, and iterate. A masterclass in design thinking, physical literacy, and creative problem-solving.',
    whatsIncluded: [
      'Complete sport invention project guide',
      'Game mechanic and rule design framework',
      'DIY equipment building with household materials',
      'Rulebook writing with clear, testable rules',
      'Playtesting and iteration cycle',
    ],
    skillTags: ['Design Thinking', 'Writing', 'Physical Literacy', 'Problem-Solving', 'Creativity'],
    format: 'Project Guide',
  },
  'kinetic-sculpture': {
    opening:
      'Design and build a kinetic sculpture or interactive art installation. Kids explore movement, balance, wind, and gravity to create art that moves. Combines physics, engineering, and artistic expression into a single hands-on project.',
    whatsIncluded: [
      'Complete kinetic art project guide',
      'Movement principles: balance, wind, gravity, rotation',
      'Material exploration and construction techniques',
      'Design iteration: test, adjust, refine',
      'Exhibition planning and artist statement writing',
    ],
    skillTags: ['Physics', 'Art', 'Engineering', 'Design', 'Expression'],
    format: 'Project Guide',
  },
  'build-a-museum': {
    opening:
      'Create a museum or interactive exhibit on any topic your child loves. Research, curate, design displays, write labels, build interactive elements, and host a grand opening. A project that teaches research skills, writing, design, and the art of sharing knowledge.',
    whatsIncluded: [
      'Complete museum/exhibit design project guide',
      'Topic selection and research framework',
      'Exhibit layout, display design, and label writing',
      'Interactive element creation',
      'Grand opening planning and visitor experience',
    ],
    skillTags: ['Research', 'Writing', 'Design', 'Curation', 'Presentation'],
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // REAL-WORLD MATH
  // ═══════════════════════════════════════════════════════════════════
  'budget-challenge': {
    opening:
      'Real-money challenges that teach kids budgeting and smart spending. Kids plan a meal on a budget, track family spending for a week, compare prices at different shops, and design their own savings plan. Financial literacy that happens in real life, not on a screen.',
    whatsIncluded: [
      'Multiple real-world budgeting challenges',
      'Meal planning on a budget with real prices',
      'Weekly spending tracker and analysis',
      'Price comparison and value assessment',
      'Personal savings plan design',
    ],
    skillTags: ['Financial Literacy', 'Maths', 'Planning', 'Decision-Making'],
    format: 'Project Guide',
  },
  'kitchen-math-challenge': {
    opening:
      'Go beyond recipes. Plan meals for a week, calculate grocery costs, compare unit prices, adjust portions, and manage a food budget. Real-world maths that happens in the kitchen, at the shop, and around the dinner table. The kind of maths your child will actually use for the rest of their life.',
    whatsIncluded: [
      'Meal planning and grocery budgeting challenges',
      'Unit price comparison and value calculations',
      'Portion adjustment and recipe scaling',
      'Weekly food budget management',
      'Real-world measurement and estimation',
    ],
    skillTags: ['Maths', 'Financial Literacy', 'Measurement', 'Planning'],
    format: 'Project Guide',
  },
  'smart-shopper': {
    opening:
      'Activities that teach kids to be critical, informed consumers. Compare prices, read labels, spot marketing tricks, calculate value, and make smart purchasing decisions. Financial literacy meets critical thinking, building skills every kid needs and no textbook teaches.',
    whatsIncluded: [
      'Consumer literacy challenges and activities',
      'Price comparison and unit price calculations',
      'Marketing trick identification and analysis',
      'Label reading and ingredient investigation',
      'Smart decision-making framework for purchases',
    ],
    skillTags: ['Financial Literacy', 'Critical Thinking', 'Maths', 'Consumer Skills'],
    format: 'Project Guide',
  },

  'real-world-math-bundle': {
    opening:
      'All 10 Real-World Math guides in one download. Campout planning, garage sales, garden plots, road trips, sports stats, and more. Every activity puts kids in real-life scenarios where they use maths to plan, budget, measure, and make smart decisions. The kind of maths that sticks because it actually matters.',
    whatsIncluded: [
      '10 complete real-world maths guides',
      'Backyard Campout Planner, Garage Sale Math, Garden Plot Planner',
      'Farmers Market Challenge, Party Planner Math, Road Trip Calculator',
      'Clothing Swap & Thrift Math, Family Electricity Audit',
      'Savings Goal Tracker, Sports Stats Lab',
    ],
    skillTags: ['Financial Literacy', 'Measurement', 'Budgeting', 'Data', 'Problem-Solving'],
    format: 'Bundle',
  },
  'backyard-campout-planner': {
    opening:
      'Plan a backyard campout from start to finish: gear checklists, meal prep, a stargazing schedule, and a campfire activity plan. Kids use measurement, budgeting, time planning, and estimation to organise a real overnight adventure. Maths that ends with marshmallows.',
    whatsIncluded: [
      'Complete campout planning guide with step-by-step phases',
      'Gear checklist with quantity and cost calculations',
      'Meal planning with shopping list and budget',
      'Stargazing schedule with time and direction planning',
      'Campfire activity plan with timing estimates',
    ],
    skillTags: ['Measurement', 'Budgeting', 'Time Planning', 'Estimation', 'Organisation'],
    format: 'Project Guide',
  },
  'clothing-swap-thrift-math': {
    opening:
      'Organise a clothing swap or plan a thrift store haul using real budgeting and value skills. Kids calculate cost-per-wear, compare prices, assess quality versus cost, and make smart spending decisions. Financial literacy meets sustainability.',
    whatsIncluded: [
      'Clothing swap organisation and planning guide',
      'Cost-per-wear calculation activities',
      'Price comparison and value assessment',
      'Budget planning and tracking',
      'Sustainability and smart spending reflection',
    ],
    skillTags: ['Financial Literacy', 'Budgeting', 'Value Assessment', 'Sustainability'],
    format: 'Project Guide',
  },
  'family-electricity-audit': {
    opening:
      'Audit your household electricity use: read meters, calculate costs, compare appliances, and find real ways to save. Kids learn about kilowatt-hours, unit pricing, and the maths behind energy bills. Practical environmental maths that makes a real difference at home.',
    whatsIncluded: [
      'Household electricity audit guide',
      'Meter reading and usage tracking',
      'Appliance comparison and cost calculations',
      'Energy-saving plan with estimated savings',
      'Kilowatt-hour and unit pricing activities',
    ],
    skillTags: ['Measurement', 'Data Analysis', 'Environmental Maths', 'Budgeting'],
    format: 'Project Guide',
  },
  'farmers-market-challenge': {
    opening:
      'Navigate a farmers market with a real budget. Compare prices, weigh options, calculate change, and make smart choices. Kids practise mental maths, estimation, and decision-making while shopping for real food. The kind of maths lesson that ends with a great meal.',
    whatsIncluded: [
      'Farmers market shopping challenge guide',
      'Budget planning and tracking sheet',
      'Price comparison and mental maths activities',
      'Change calculation and estimation practice',
      'Post-shop reflection and value assessment',
    ],
    skillTags: ['Mental Maths', 'Budgeting', 'Estimation', 'Decision-Making'],
    format: 'Project Guide',
  },
  'garage-sale-math': {
    opening:
      'Plan, price, and run a real garage sale using maths and money skills. Kids sort items, research prices, create price tags, make change, and track earnings. Addition, subtraction, multiplication, percentages, and money handling, all in one hands-on project.',
    whatsIncluded: [
      'Complete garage sale planning and running guide',
      'Pricing strategy and research activities',
      'Change-making and money handling practice',
      'Earnings tracking and profit calculation',
      'Post-sale analysis and reflection',
    ],
    skillTags: ['Money Handling', 'Pricing', 'Percentages', 'Multiplication', 'Entrepreneurship'],
    format: 'Project Guide',
  },
  'garden-plot-planner': {
    opening:
      'Design a garden plot using real measurements, area calculations, plant spacing, seed budgets, and seasonal planning. Kids measure, sketch to scale, calculate costs, and plan a planting schedule. Geometry, budgeting, and science growing together.',
    whatsIncluded: [
      'Garden plot design and planning guide',
      'Area and measurement calculations',
      'Plant spacing and row planning',
      'Seed budget and cost estimation',
      'Seasonal planting schedule',
    ],
    skillTags: ['Geometry', 'Measurement', 'Budgeting', 'Science', 'Planning'],
    format: 'Project Guide',
  },
  'party-planner-math': {
    opening:
      'Plan a party from guest list to budget. Calculate food quantities, compare supply costs, figure out timing, and stay within budget. Kids use multiplication, division, estimation, and budgeting to throw a real celebration. Maths that ends with a party.',
    whatsIncluded: [
      'Complete party planning guide with maths challenges',
      'Guest list and food quantity calculations',
      'Supply cost comparison and budgeting',
      'Timeline planning and scheduling',
      'Budget tracking and final cost analysis',
    ],
    skillTags: ['Multiplication', 'Budgeting', 'Estimation', 'Planning', 'Division'],
    format: 'Project Guide',
  },
  'road-trip-calculator': {
    opening:
      'Plan a road trip using real distances, fuel costs, driving times, and travel budgets. Kids calculate mileage, compare routes, estimate fuel expenses, plan stops, and build a complete trip budget. Geography meets maths on the open road.',
    whatsIncluded: [
      'Road trip planning and calculation guide',
      'Distance and driving time calculations',
      'Fuel cost estimation and route comparison',
      'Stop planning and scheduling',
      'Complete trip budget with contingency',
    ],
    skillTags: ['Geography', 'Estimation', 'Budgeting', 'Distance', 'Planning'],
    format: 'Project Guide',
  },
  'savings-goal-tracker': {
    opening:
      'Set a real savings goal and track progress with actual money maths. Kids choose a goal, calculate how long it will take, track deposits, visualise progress, and learn about the power of consistent saving. Financial literacy that builds real habits.',
    whatsIncluded: [
      'Savings goal setting and planning guide',
      'Timeline and deposit calculations',
      'Progress tracking and visualisation',
      'Deposit schedule and consistency tracking',
      'Reflection on saving habits and strategies',
    ],
    skillTags: ['Financial Literacy', 'Goal Setting', 'Data Tracking', 'Percentages'],
    format: 'Project Guide',
  },
  'sports-stats-lab': {
    opening:
      'Collect, analyse, and visualise real sports data. Kids track scores, calculate averages, work out percentages, create charts, and compare player or team stats. Data literacy and statistics brought to life through the sports they love.',
    whatsIncluded: [
      'Sports data collection and analysis guide',
      'Average and percentage calculation activities',
      'Chart and graph creation',
      'Player and team comparison',
      'Data interpretation and prediction challenges',
    ],
    skillTags: ['Statistics', 'Data Visualisation', 'Averages', 'Percentages', 'Analysis'],
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // CRITICAL THINKING
  // ═══════════════════════════════════════════════════════════════════
  'media-info-check': {
    opening:
      'Critical thinking activities that teach kids to evaluate information, spot bias, check sources, and think critically about what they see online. In a world of misinformation, these are essential skills that schools barely touch and every family needs.',
    whatsIncluded: [
      'Source evaluation and fact-checking activities',
      'Bias identification and perspective analysis',
      'Online information verification techniques',
      'News literacy and media awareness challenges',
      'Critical thinking frameworks for everyday use',
    ],
    skillTags: ['Critical Thinking', 'Media Literacy', 'Research', 'Analysis'],
    format: 'Project Guide',
  },
  'micro-business': {
    opening:
      'Guided activities to help your child plan, launch, and run a simple real business. From choosing a product to setting prices, marketing, tracking income, and reflecting on what they learned. Entrepreneurship skills applied to real life, not a simulation.',
    whatsIncluded: [
      'Complete micro-business launch guide',
      'Product/service brainstorming and market research',
      'Pricing strategy and cost calculation',
      'Marketing plan and customer outreach',
      'Income tracking, reflection, and iteration',
    ],
    skillTags: ['Entrepreneurship', 'Maths', 'Marketing', 'Planning', 'Communication'],
    format: 'Project Guide',
  },
  'problem-solver': {
    opening:
      'Design thinking challenges that teach kids to identify problems, brainstorm solutions, prototype, test, and iterate. Real-world problem-solving skills applied to everyday life, from improving a family routine to designing a better backpack. The way real engineers and designers think.',
    whatsIncluded: [
      'Design thinking challenge guides',
      'Problem identification and empathy mapping',
      'Brainstorming and solution generation frameworks',
      'Prototyping with everyday materials',
      'Testing, feedback, and iteration cycles',
    ],
    skillTags: ['Design Thinking', 'Problem-Solving', 'Engineering', 'Creativity'],
    format: 'Project Guide',
  },
  'travel-day': {
    opening:
      'Challenge your child to plan a real travel day from start to finish. Research destinations, compare transport options, calculate budgets, build itineraries, and navigate logistics. Geography, maths, and critical thinking all wrapped in one exciting planning challenge.',
    whatsIncluded: [
      'Complete travel day planning challenge',
      'Destination research and comparison',
      'Transport options and cost calculations',
      'Itinerary building with time management',
      'Budget planning and contingency thinking',
    ],
    skillTags: ['Geography', 'Maths', 'Planning', 'Research', 'Decision-Making'],
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // SELF-MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════
  'time-energy-planner': {
    opening:
      'Help your child learn to manage their time and energy effectively. Activities include building weekly schedules, tracking energy levels, prioritising tasks, setting goals, and reflecting on what works. Executive function skills that build real independence.',
    whatsIncluded: [
      'Time management and energy tracking activities',
      'Weekly schedule building and prioritisation',
      'Goal setting and progress reflection',
      'Energy level awareness and management',
      'Personal routine design and optimisation',
    ],
    skillTags: ['Time Management', 'Self-Regulation', 'Planning', 'Goal Setting'],
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // LITERACY
  // ═══════════════════════════════════════════════════════════════════
  'community-impact': {
    opening:
      'Guide your child through planning and executing a real community impact project. From identifying local needs to designing solutions, creating action plans, and reflecting on results. Builds empathy, leadership, project management, and the confidence to make a real difference.',
    whatsIncluded: [
      'Complete community project planning guide',
      'Local needs assessment and opportunity mapping',
      'Solution design and action plan creation',
      'Project execution support and milestones',
      'Reflection and impact assessment',
    ],
    skillTags: ['Leadership', 'Empathy', 'Project Management', 'Communication', 'Writing'],
    format: 'Project Guide',
  },
  'write-like-a-pro': {
    opening:
      'Real-world writing challenges that go beyond essays. Kids write emails, create social media posts, draft persuasive letters, design infographics with captions, and communicate for real audiences. Writing that matters, not writing for a grade.',
    whatsIncluded: [
      'Real-world writing challenge guides',
      'Email, letter, and professional communication',
      'Social media copywriting and caption design',
      'Persuasive writing for real audiences',
      'Infographic and visual communication design',
    ],
    skillTags: ['Writing', 'Communication', 'Persuasion', 'Design', 'Digital Literacy'],
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
    skillTags: ['AI Literacy', 'Critical Thinking', 'Digital Citizenship'],
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
    skillTags: ['Algorithm Literacy', 'Critical Thinking', 'Digital Citizenship', 'Self-Awareness'],
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
    skillTags: ['Ethics', 'Critical Thinking', 'AI Literacy', 'Empathy', 'Fairness'],
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
    skillTags: ['AI Literacy', 'Design Thinking', 'Ethics', 'Planning', 'Creativity'],
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
    skillTags: ['Critical Thinking', 'AI Literacy', 'Research', 'Verification'],
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
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // LIFE SKILLS
  // ═══════════════════════════════════════════════════════════════════
  'future-ready-skills-map': {
    opening:
      'A comprehensive parent guide to the 10 skills that matter most for your child\'s future, from emotional intelligence and critical thinking to AI literacy and life skills. This is not another activity pack; it\'s your roadmap for raising a capable, confident, future-ready human.',
    whatsIncluded: [
      '42-page comprehensive parent guide',
      '10 essential future-ready skills explained',
      'Organised into three pillars: Think, Create, Live',
      'Practical strategies for building each skill at home',
      'Age-appropriate milestones and conversation starters',
    ],
    skillTags: ['Parenting', 'Life Skills', 'Critical Thinking', 'Emotional Intelligence'],
    format: 'Parent Guide',
  },
  'my-small-business-project': {
    opening:
      'A complete project guide for kids to plan and run their own small business. From brainstorming ideas and researching markets to creating products, setting prices, designing marketing, and tracking profits. Real entrepreneurship, not a pretend exercise.',
    whatsIncluded: [
      'Complete small business project guide',
      'Idea brainstorming and market research',
      'Product/service development and pricing',
      'Marketing strategy and materials design',
      'Profit tracking and business reflection',
    ],
    skillTags: ['Entrepreneurship', 'Maths', 'Marketing', 'Planning', 'Creativity'],
    format: 'Project Guide',
  },
  'time-capsule': {
    opening:
      'A creative time capsule project that captures who your child is right now. Guided prompts for writing letters to their future self, collecting meaningful items, recording favourites, and reflecting on growth. A beautiful keepsake and a meaningful exercise in self-awareness.',
    whatsIncluded: [
      'Complete time capsule project guide',
      'Letter-to-future-self writing prompts',
      'Favourite things recording and reflection',
      'Meaningful item collection guidance',
      'Sealing ceremony and future opening date planning',
    ],
    skillTags: ['Self-Reflection', 'Writing', 'Creativity', 'Memory', 'Growth Mindset'],
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // COMMUNICATION & WRITING BUNDLE
  // ═══════════════════════════════════════════════════════════════════
  'communication-writing-bundle': {
    opening:
      'All 12 Communication & Writing guides in one download. Storytelling, debate, interviews, recipe writing, magazine design, trail guides, and more. Every activity puts kids in real communication scenarios: writing for real audiences, speaking with real purpose, and presenting with real confidence.',
    whatsIncluded: [
      '12 complete communication and writing guides',
      'Adventure Story Map, Community Tour Guide, Directions Challenge',
      'Family Debate Night, Family Recipe Book, Market Stall Pitch',
      'Mini Magazine Creator, My Review Column, Neighbourhood Interview',
      'Trail Guide Creator, Community Impact, Write It Like a Pro',
    ],
    skillTags: ['Writing', 'Communication', 'Persuasion', 'Storytelling', 'Presentation'],
    format: 'Bundle',
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENTREPRENEURSHIP BUNDLE
  // ═══════════════════════════════════════════════════════════════════
  'entrepreneurship-bundle': {
    opening:
      'All 11 Entrepreneurship guides in one download. Brand building, customer discovery, pitching, pricing, marketing, supply chains, product design, and more. Real business skills through hands-on projects. Kids learn by doing, not by reading about it.',
    whatsIncluded: [
      '11 complete entrepreneurship guides',
      'Brand Builder, Business Failure Lab, Community Service Business',
      'Customer Discovery, Investor Pitch, Marketing Campaign',
      'Pricing Experiment, Product Design Lab, Supply Chain Detective',
      'The Shark Tank Pitch, Micro-Business Challenge',
    ],
    skillTags: ['Entrepreneurship', 'Financial Literacy', 'Marketing', 'Design Thinking', 'Communication'],
    format: 'Bundle',
  },

  // ═══════════════════════════════════════════════════════════════════
  // PLANNING & PROBLEM-SOLVING BUNDLE
  // ═══════════════════════════════════════════════════════════════════
  'planning-problem-solving-bundle': {
    opening:
      'All 13 Planning & Problem-Solving guides in one download. Survival planning, emergency prep, decision-making, scavenger hunts, everyday redesign, packing logistics, and more. Kids practise thinking ahead, solving real problems, and making smart decisions about real things.',
    whatsIncluded: [
      '13 complete planning and problem-solving guides',
      'Emergency Ready, Everyday Redesign, Fix-It Detective',
      'Neighbourhood Problem Spotter, Outdoor Survival Planner, Pack Like a Pro',
      'Scavenger Hunt Designer, Swap Day Challenge, What-If Scenario Lab',
      'Decision Lab, Problem-Solver Studio, Time & Energy Planner, Travel Day',
    ],
    skillTags: ['Planning', 'Problem-Solving', 'Critical Thinking', 'Decision-Making', 'Life Skills'],
    format: 'Bundle',
  },

  // ═══════════════════════════════════════════════════════════════════
  // COMMUNICATION & WRITING - Individual Guides
  // ═══════════════════════════════════════════════════════════════════
  'adventure-story-map': {
    opening:
      'A visual story-mapping project that guides kids through planning and writing their own adventure narrative. They map out characters, settings, plot twists, and story arcs, then write the story. Creative writing meets spatial thinking in one hands-on project.',
    whatsIncluded: [
      'Visual story map template and planning guide',
      'Character and setting development prompts',
      'Plot structure and story arc planning',
      'Writing prompts tied to each map section',
      'Extension ideas for longer narratives',
    ],
    skillTags: ['Creative Writing', 'Storytelling', 'Planning', 'Narrative', 'Art'],
    format: 'Project Guide',
  },
  'community-tour-guide': {
    opening:
      'Research, write, and present a guided tour of your community. Kids choose what matters most about where they live, practise descriptive language, and build presentation confidence. A project that connects writing skills with local knowledge and pride in place.',
    whatsIncluded: [
      'Community research and tour planning guide',
      'Descriptive writing prompts for each tour stop',
      'Interview tips for gathering local stories',
      'Presentation and delivery practice',
      'Extension ideas for digital or illustrated guides',
    ],
    skillTags: ['Writing', 'Presentation', 'Research', 'Communication', 'Community'],
    format: 'Project Guide',
  },
  'directions-challenge': {
    opening:
      'Write clear, step-by-step directions and test whether someone else can follow them. Kids discover how hard precise communication really is, and get better at it through practice, testing, and feedback. The kind of writing skill they will use every day of their lives.',
    whatsIncluded: [
      'Direction-writing challenge guide',
      'Clarity and precision writing frameworks',
      'Peer testing and feedback activities',
      'Increasingly complex direction challenges',
      'Reflection on communication breakdowns',
    ],
    skillTags: ['Procedural Writing', 'Clarity', 'Communication', 'Logic', 'Testing'],
    format: 'Project Guide',
  },
  'family-debate-night': {
    opening:
      'A structured debate framework for the whole family. Kids prepare arguments, present their case, respond to counterpoints, and learn to disagree respectfully. Builds persuasive speaking, active listening, and the confidence to express opinions clearly.',
    whatsIncluded: [
      'Family debate structure and rules guide',
      'Age-appropriate debate topic cards',
      'Argument preparation framework',
      'Active listening and rebuttal practice',
      'Reflection prompts on persuasion and respect',
    ],
    skillTags: ['Persuasion', 'Critical Thinking', 'Listening', 'Public Speaking', 'Respect'],
    format: 'Project Guide',
  },
  'family-recipe-book': {
    opening:
      'Create a family recipe book that captures both the food and the stories behind it. Kids interview family members, write clear procedural instructions, and design pages that connect recipes with memories. Procedural writing meets family storytelling in a meaningful keepsake.',
    whatsIncluded: [
      'Recipe book project guide with page templates',
      'Family interview prompts for recipe stories',
      'Procedural writing framework for clear instructions',
      'Page design and illustration guidance',
      'Book binding and finishing ideas',
    ],
    skillTags: ['Procedural Writing', 'Interviewing', 'Design', 'Family History', 'Storytelling'],
    format: 'Project Guide',
  },
  'market-stall-pitch': {
    opening:
      'Create and deliver a persuasive pitch for a product or service, as if running a market stall. Kids choose their words, read their audience, and present with confidence. Communication meets entrepreneurship in a project that makes persuasion tangible and fun.',
    whatsIncluded: [
      'Pitch planning and writing guide',
      'Persuasive language and techniques',
      'Audience awareness and adaptation tips',
      'Delivery and presentation practice',
      'Feedback and iteration framework',
    ],
    skillTags: ['Persuasion', 'Communication', 'Entrepreneurship', 'Public Speaking', 'Confidence'],
    format: 'Project Guide',
  },
  'mini-magazine-creator': {
    opening:
      'Write and design a mini magazine from scratch: headlines, feature articles, illustrations, advertisements, and more. Kids work with multiple text types in one project, learning how different writing styles serve different purposes. A publishing project that builds real writing range.',
    whatsIncluded: [
      'Magazine creation project guide',
      'Multiple text type templates (articles, ads, editorials)',
      'Layout and design guidance',
      'Illustration and visual storytelling tips',
      'Publishing and sharing ideas',
    ],
    skillTags: ['Writing', 'Design', 'Multiple Text Types', 'Creativity', 'Publishing'],
    format: 'Project Guide',
  },
  'my-review-column': {
    opening:
      'Write reviews of books, movies, products, or experiences, and learn that opinions backed by evidence are powerful. Kids develop critical analysis skills, learn to structure arguments, and discover that their perspective matters. Opinion writing that builds confidence and voice.',
    whatsIncluded: [
      'Review writing guide with structure templates',
      'Critical analysis prompts and frameworks',
      'Opinion vs evidence balance guidance',
      'Multiple review formats (short, long, star rating)',
      'Sharing and publishing review ideas',
    ],
    skillTags: ['Opinion Writing', 'Critical Analysis', 'Communication', 'Voice', 'Persuasion'],
    format: 'Project Guide',
  },
  'neighbourhood-interview': {
    opening:
      'Interview people in your community, from neighbours and shop owners to local heroes, and share their stories. Kids prepare questions, practise active listening, and present what they learn. Builds interviewing skills, empathy, and the ability to tell someone else\'s story with care.',
    whatsIncluded: [
      'Interview project guide with question templates',
      'Active listening techniques and note-taking',
      'Story writing and presentation frameworks',
      'Ethical interviewing guidelines',
      'Portfolio ideas for collected stories',
    ],
    skillTags: ['Interviewing', 'Listening', 'Empathy', 'Writing', 'Communication'],
    format: 'Project Guide',
  },
  'trail-guide-creator': {
    opening:
      'Create a written guide to a local trail or walking path. Kids walk the route, observe carefully, take notes, and write a guide someone else could follow. Outdoor observation meets descriptive writing in a project that connects kids to nature and place.',
    whatsIncluded: [
      'Trail guide creation project',
      'Observation and note-taking frameworks',
      'Descriptive writing prompts for each trail section',
      'Map-making and wayfinding guidance',
      'Design ideas for a polished guide',
    ],
    skillTags: ['Descriptive Writing', 'Observation', 'Nature', 'Geography', 'Design'],
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
    format: 'Project Guide',
  },
  'shark-tank-pitch': {
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
    format: 'Project Guide',
  },

  // ═══════════════════════════════════════════════════════════════════
  // PLANNING & PROBLEM-SOLVING - Individual Guides
  // ═══════════════════════════════════════════════════════════════════
  'emergency-ready': {
    opening:
      'Help kids think clearly under pressure and build genuine confidence handling the unexpected. Activities cover emergency preparedness, decision-making under stress, and practical planning for real scenarios. Life skills that matter, not fear-based, just empowering.',
    whatsIncluded: [
      'Emergency preparedness challenge guide',
      'Scenario-based decision-making activities',
      'Emergency plan creation for home and travel',
      'Calm-under-pressure thinking frameworks',
      'Family emergency communication planning',
    ],
    skillTags: ['Critical Thinking', 'Life Skills', 'Planning', 'Decision-Making', 'Resilience'],
    format: 'Project Guide',
  },
  'everyday-redesign': {
    opening:
      'Look at everyday objects and systems with fresh eyes, then redesign them to work better. Kids practise observation, systems thinking, and creative problem-solving by improving the things they already use. Design thinking applied to real, everyday life.',
    whatsIncluded: [
      'Everyday redesign challenge guide',
      'Observation and analysis frameworks',
      'Problem identification and improvement planning',
      'Sketch and prototype activities',
      'Testing and iteration with real users',
    ],
    skillTags: ['Design Thinking', 'Systems Thinking', 'Creativity', 'Observation', 'Problem-Solving'],
    format: 'Project Guide',
  },
  'fix-it-detective': {
    opening:
      'Diagnose and fix real household problems using logic, observation, and resourcefulness. Kids learn to troubleshoot, building practical skills and the confidence to figure things out. Problem-solving that\'s genuinely useful in everyday life.',
    whatsIncluded: [
      'Fix-it challenge guide with real scenarios',
      'Troubleshooting and diagnosis frameworks',
      'Tool basics and safe handling guidance',
      'Step-by-step repair challenges',
      'Reflection on problem-solving strategies',
    ],
    skillTags: ['Problem-Solving', 'Life Skills', 'Logic', 'Resourcefulness', 'Practical Skills'],
    format: 'Project Guide',
  },
  'neighbourhood-problem-spotter': {
    opening:
      'Walk your neighbourhood with fresh eyes. Spot real problems, think about causes, and brainstorm solutions. Kids practise observation, critical thinking, and civic engagement. Problem-solving that connects kids to the place they live and the people around them.',
    whatsIncluded: [
      'Neighbourhood observation walk guide',
      'Problem identification and categorisation',
      'Root cause analysis activities',
      'Solution brainstorming and feasibility assessment',
      'Community proposal or presentation project',
    ],
    skillTags: ['Observation', 'Critical Thinking', 'Civic Engagement', 'Problem-Solving', 'Community'],
    format: 'Project Guide',
  },
  'outdoor-survival-planner': {
    opening:
      'Plan outdoor expeditions, think through survival scenarios, and build real outdoor planning skills. Kids research terrain, assess risks, plan supplies, and make decisions about shelter, water, and navigation. Adventure planning that builds critical thinking and practical confidence.',
    whatsIncluded: [
      'Outdoor survival planning guide',
      'Terrain research and risk assessment',
      'Supply planning and prioritisation',
      'Shelter, water, and navigation scenarios',
      'Expedition plan creation and review',
    ],
    skillTags: ['Planning', 'Risk Assessment', 'Nature', 'Critical Thinking', 'Survival Skills'],
    format: 'Project Guide',
  },
  'pack-like-a-pro': {
    opening:
      'Master strategic packing: priorities, weight, space management, and trip logistics. Kids learn to think ahead, make trade-offs, and plan for different scenarios. A surprisingly deep challenge that builds executive function skills through a real, practical task.',
    whatsIncluded: [
      'Strategic packing challenge guide',
      'Priority-setting and trade-off activities',
      'Weight and space optimisation challenges',
      'Scenario-based packing for different trips',
      'Reflection on planning and decision-making',
    ],
    skillTags: ['Planning', 'Decision-Making', 'Logic', 'Organisation', 'Life Skills'],
    format: 'Project Guide',
  },
  'scavenger-hunt-designer': {
    opening:
      'Design, create, and test your own scavenger hunts for friends and family. Kids plan clues, set challenge levels, think about pacing and flow, and iterate based on real feedback. A creative planning project that builds logic, writing, and design thinking.',
    whatsIncluded: [
      'Scavenger hunt design guide',
      'Clue writing and difficulty balancing',
      'Route planning and flow design',
      'Testing with real participants',
      'Iteration and improvement based on feedback',
    ],
    skillTags: ['Planning', 'Creativity', 'Writing', 'Logic', 'Design Thinking'],
    format: 'Project Guide',
  },
  'swap-day-challenge': {
    opening:
      'Plan and run a swap day where kids take on someone else\'s role or responsibilities for a full day. A unique challenge that builds empathy, planning skills, and genuine appreciation for what the people around them do every day.',
    whatsIncluded: [
      'Swap day planning and execution guide',
      'Role research and preparation activities',
      'Schedule planning and logistics',
      'Observation and empathy reflection prompts',
      'Post-swap discussion and appreciation activities',
    ],
    skillTags: ['Empathy', 'Planning', 'Life Skills', 'Responsibility', 'Reflection'],
    format: 'Project Guide',
  },
  'what-if-scenario-lab': {
    opening:
      'Explore hypothetical "what if" scenarios, predict outcomes, and plan responses. Kids work through situations that stretch their thinking, from everyday dilemmas to wildly creative scenarios. Speculative thinking that builds planning skills, creative reasoning, and adaptability.',
    whatsIncluded: [
      'What-if scenario challenge cards',
      'Outcome prediction and planning frameworks',
      'Risk assessment and contingency thinking',
      'Creative scenario generation',
      'Discussion prompts and reflection activities',
    ],
    skillTags: ['Creative Thinking', 'Planning', 'Critical Thinking', 'Adaptability', 'Risk Assessment'],
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
    format: 'Project Guide',
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
