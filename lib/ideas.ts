// ---------------------------------------------------------------------------
// /ideas data layer
// ---------------------------------------------------------------------------

export type IdeaSection = { name: string; items: string[] }

export type IdeaList = {
  slug: string
  title: string
  intro: string
  /** Blog post slug this list was pulled from (for print CTA) */
  blogSlug?: string
  /** ISO dates surfaced in schema, the visible byline, and the sitemap */
  published?: string
  updated?: string
  sections: IdeaSection[]
}

export type IdeaCategory = {
  slug: string
  name: string
  accent: string
  icon: string
  blurb: string
  lists: IdeaList[]
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export const IDEAS_DATA: IdeaCategory[] = [
  // -----------------------------------------------------------------------
  // 1. Nature & Outdoor
  // -----------------------------------------------------------------------
  {
    slug: 'nature',
    name: 'Nature & Outdoor',
    accent: '#6b8e6b',
    icon: 'Leaf',
    blurb:
      'Free printable nature and outdoor checklists for kids: nature walks, backyard science, forest school, scavenger hunts, and land art. Zero gear, zero prep, any patch of outside.',
    lists: [
      {
        slug: 'nature-walk-ideas',
        blogSlug: 'nature-walks-science',
        title: 'Nature Walk Checklist: 50 Ideas for Kids',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'This is a free printable checklist of 50 nature walk ideas for kids ages 2 to 12, organized into five themes: observe, collect, create, listen and feel, and challenge. None of them need gear, prep, or an agenda. Pin it to the fridge, screenshot it, or print it and tuck it in your bag.',
        sections: [
          {
            name: 'Observe',
            items: [
              'Find five different leaf shapes',
              'Spot a bird and watch it for one full minute',
              'Look for something red then orange then yellow',
              'Find the oldest tree you can and guess its age',
              'Watch a cloud change shape',
              'Find an insect and count its legs',
              'Look under a rock, gently put it back',
              'Notice three different bird songs',
              'Find a spider web and look for its maker',
              'Spot the moon in the daytime sky',
            ],
          },
          {
            name: 'Collect',
            items: [
              'Gather five leaves of different colors',
              'Find a perfectly round stone',
              'Collect three kinds of seeds or pods',
              "Find a feather (look don't always take)",
              'Pick up one piece of litter to throw away',
              'Find a stick taller than you',
              'Gather petals for pressing at home',
              'Collect acorns or pinecones for counting',
            ],
          },
          {
            name: 'Create',
            items: [
              'Build a tiny fairy house from twigs',
              'Make a face on the ground with leaves and stones',
              'Stack the tallest rock tower you can',
              'Draw the view with a stick in the dirt',
              'Weave grass or long leaves into a braid',
              'Make a nature crown from flexible stems',
              'Arrange found objects from smallest to biggest',
              'Press a leaf rubbing using paper and a crayon',
              'Build a dam or a boat in a stream',
              'Create a color gradient line from light to dark leaves',
              'Sketch one thing in a nature journal',
            ],
          },
          {
            name: 'Listen & Feel',
            items: [
              'Close your eyes and name every sound you hear',
              'Find the softest and the roughest thing you can touch',
              'Feel tree bark and describe it in three words',
              'Stand still and feel which way the wind blows',
              'Walk barefoot on three different surfaces',
              'Sit quietly for two minutes and just watch',
              'Listen for water: a stream, a drip, a puddle',
            ],
          },
          {
            name: 'Challenge',
            items: [
              'Walk in complete silence for one full minute',
              'Find something camouflaged',
              'Identify a track or footprint',
              'Guess what an animal ate by looking at chew marks',
              'Find evidence of a bird building a nest',
              'Spot three different types of clouds',
              "Estimate a tree's height using your shadow",
              'Race two leaves down a creek',
              'Time how long a puddle takes to shrink',
              'Balance on a log for ten seconds',
              'Navigate to a spot using only landmarks',
              'Leave the trail nicer than you found it',
              'Pick one thing to look up when you get home',
              "Plan where you'll walk next time",
            ],
          },
        ],
      },
      {
        slug: 'backyard-science-ideas',
        blogSlug: 'backyard-science-experiments',
        title: 'Backyard Science Checklist: 15 Experiments',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'A free printable checklist of 15 backyard science experiments for kids ages 5 to 11, covering water and weather, plants and soil, and animals and bugs. Every experiment uses what you already have: water, dirt, jars, and sunlight. No lab coat, no kit.',
        sections: [
          {
            name: 'Water & Weather',
            items: [
              'Run an evaporation race: water in sun shade and cover check hourly',
              'Make a DIY rain gauge and track rainfall over a week',
              'Build a liquid density tower with honey dish soap water oil',
              'Test what floats in a puddle (leaf stick pebble feather)',
              'Time how long a puddle takes to evaporate on a hot vs cool day',
            ],
          },
          {
            name: 'Plants & Soil',
            items: [
              'Plant the same seed in full sun partial shade and a dark closet',
              'Plant three different seed types and race to see which sprouts first',
              'Drop soil into a jar of water shake and observe the layers',
              'Bury five items (leaf banana peel paper plastic fabric) and check weekly',
              'Create a worm habitat in a clear jar with alternating soil and sand layers',
            ],
          },
          {
            name: 'Animals & Bugs',
            items: [
              'Place different foods near an ant trail and watch which they find first',
              'Build a bug hotel from pinecones bamboo tubes bark and straw',
              'Set up a bird feeder and log which species visit and when',
              'Mark a one-meter square and count every living creature',
              'Sit with eyes closed and draw a sound map of everything you hear',
            ],
          },
        ],
      },
      {
        slug: 'forest-school-ideas',
        blogSlug: 'forest-school-activities',
        title: 'Forest School Checklist: 13 Activities',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'This free printable forest school checklist gives you 13 activities in three themes: build and create, sense and observe, and risk and challenge. A park, a treeline, or a few backyard trees is plenty. Print it and let the woods do the teaching.',
        sections: [
          {
            name: 'Build & Create',
            items: [
              'Build a den from fallen branches leaned against a low tree fork',
              'Build a miniature village on the forest floor from sticks bark and pebbles',
              'Find a ditch or stream and build a bridge strong enough to hold a rock',
              'Create land art by arranging natural materials in patterns on the ground',
              'Weave grasses and wildflowers through a forked-stick frame',
            ],
          },
          {
            name: 'Sense & Observe',
            items: [
              'Mix different soils with water to make mud paint and paint on bark',
              'Set up a blindfold rope trail and follow it using only touch sound and smell',
              'Pick a sit spot and sit quietly for five to fifteen minutes observing',
              'Sit in a circle and take turns building a collaborative story set in the woods',
            ],
          },
          {
            name: 'Risk & Challenge',
            items: [
              'Let kids climb a tree with low sturdy branches',
              'Teach basic whittling with a real knife and soft wood (age 7+)',
              'Build a small campfire together and learn fire safety',
              'Design a natural obstacle course using logs rocks and branches',
            ],
          },
        ],
      },
      {
        slug: 'seasonal-scavenger-ideas',
        blogSlug: 'seasonal-scavenger-hunts',
        title: 'Seasonal Scavenger Hunt Checklist: 17 Finds',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'A free printable scavenger hunt checklist with 17 nature finds for kids ages 3 to 10, split by season: spring, summer, autumn, and winter. Print the season you are in, tuck it in your pocket, and see what you can spot.',
        sections: [
          {
            name: 'Spring',
            items: [
              'Find a plant at three stages of growth (seed sprout mature)',
              'Spot an insect pollinator visiting a flower',
              'Find evidence of a bird building a nest',
              'Locate a puddle ecosystem and observe what lives near it',
            ],
          },
          {
            name: 'Summer',
            items: [
              'Find five different leaf shapes and sort by type',
              'Locate an animal home (burrow web hive nest)',
              'Find something that uses camouflage',
              'Spot three flying insects and describe how they move differently',
            ],
          },
          {
            name: 'Autumn',
            items: [
              'Collect five leaves in different stages of color change',
              'Find three different seed dispersal strategies (wind animal gravity)',
              'Spot evidence of an animal preparing for winter',
              'Find something decomposing and describe what is breaking it down',
            ],
          },
          {
            name: 'Winter',
            items: [
              'Find animal tracks and identify the creature',
              'Spot three evergreen species and compare their needles',
              'Find evidence of life under bark rocks or soil',
              'Observe frost patterns and describe the shapes',
              'Locate a bird and watch it for five minutes',
            ],
          },
        ],
      },
      {
        slug: 'land-art-ideas',
        blogSlug: 'kinetic-sculpture-land-art',
        title: '14 Land Art & Nature Sculpture Ideas',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'These 14 land art and nature sculpture ideas for kids come as a free printable checklist, organized into arrange and pattern, build and sculpt, and weave and hang. The only supplies are what you find outside. Nothing to buy, nothing to clean up.',
        sections: [
          {
            name: 'Arrange & Pattern',
            items: [
              'Arrange petal mandalas from fallen blossoms in concentric circles',
              'Create twig frames around wildflowers as natural picture frames',
              'Arrange leaves in a color gradient from green to yellow to red',
              'Create seed mosaics using acorns chestnuts and pine cones',
              'Make a face on the ground with leaves and stones',
            ],
          },
          {
            name: 'Build & Sculpt',
            items: [
              'Make mud sculptures decorated with seeds petals and grass',
              'Stack beach stones into balance sculptures',
              'Build a gravity marble run using bark channels and acorns',
              'Freeze natural materials into ice sculptures overnight',
              'Build snow spirals walls labyrinths and furniture',
            ],
          },
          {
            name: 'Weave & Hang',
            items: [
              'Build a wind chime from sticks and dried seed pods',
              'Hang leaf mobiles from tree branches',
              'Weave stick and leaf crowns with autumn foliage',
              'Create sand labyrinths decorated with shells and sea glass',
            ],
          },
        ],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 2. Kitchen & Cooking
  // -----------------------------------------------------------------------
  {
    slug: 'kitchen',
    name: 'Kitchen & Cooking',
    accent: '#8b7355',
    icon: 'ChefHat',
    blurb:
      'Kitchen and cooking activity checklists for kids, free to print: counting, measuring, fractions, and budgeting woven into real meals. The best classroom you already own.',
    lists: [
      {
        slug: 'kitchen-ideas',
        blogSlug: 'kitchen-learning-lab',
        title: '30 Cooking & Kitchen Activities for Kids',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'This is a free printable checklist of 30 cooking and kitchen activities for kids from toddler to teen, covering counting and measuring, fractions, real-world skills, and cooking a full dish. Every one fits into meals you are already making. No worksheets required.',
        sections: [
          {
            name: 'Count & Measure',
            items: [
              'Count out the right number of items for a recipe',
              'Set the table with the correct number of everything',
              'Measure with cups and spoons of different sizes',
              'Weigh produce on a kitchen scale and compare',
              'Convert between teaspoons tablespoons and cups',
              'Time a boiling pot and predict when it will boil',
              'Set a timer and calculate the halfway point',
              'Pour two cups to different levels and make them equal',
            ],
          },
          {
            name: 'Fractions & Math',
            items: [
              'Halve a recipe and figure out the new amounts',
              'Double a recipe to practice multiplication',
              'Slice pizza into equal eighths or cake into sixths',
              'Compare prices per unit at the grocery store',
              'Triple a recipe that serves four for twelve people',
              'Track how many bananas the family eats in a week',
              'Estimate how many cups of pasta fill a pot',
              'Calculate the cost per serving of a meal',
            ],
          },
          {
            name: 'Real-World Skills',
            items: [
              'Plan a meal on a $20 budget using the grocery flyer',
              'Read a recipe start to finish before beginning',
              'Time-stack a meal so everything is ready together',
              'Reorganize a drawer or shelf (empty sort put back)',
              'Name the shapes you cut: triangles rectangles circles',
              'Pack a lunchbox efficiently (spatial reasoning)',
              'Sort produce by size shape or color',
              'Follow a recipe with no help from an adult',
            ],
          },
          {
            name: 'Cook Something',
            items: [
              'Bake something from scratch measuring everything yourself',
              'Cook eggs three different ways',
              'Make a salad dressing by taste-testing ratios',
              'Invent a smoothie recipe and write it down',
              'Make ice cream in a bag (cream sugar vanilla ice salt)',
              'Cook a full family meal start to finish',
            ],
          },
        ],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3. Life Skills & Money
  // -----------------------------------------------------------------------
  {
    slug: 'life-skills',
    name: 'Life Skills & Money',
    accent: '#c4836a',
    icon: 'Lightbulb',
    blurb:
      'Life skills checklists for kids you can print free: money, chores by age, independence, and family history. The everyday stuff that builds capable, confident kids.',
    lists: [
      {
        slug: 'life-skills-ideas',
        blogSlug: 'life-skills-before-12',
        title: 'The Life Skills Checklist: 28 Skills for Kids',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'A free printable life skills checklist with 28 skills for kids across four areas: money and budgeting, independence, home skills, and thinking skills. These are the skills no test measures but every adult needs. Start small and let your kids surprise you.',
        sections: [
          {
            name: 'Money & Budgeting',
            items: [
              'Give kids $30 and a meal to plan and buy within budget',
              'Save for a specific goal and track progress visually',
              'Play "worth it or not" when shopping',
              'Help kids start a small business',
              'Let each kid pick one cause to donate their own money to',
              'Use cash for some purchases so they see money leaving',
              'Compare two brands and decide which is the better deal',
              'Count the change in a jar and guess the total first',
            ],
          },
          {
            name: 'Independence',
            items: [
              'Make a phone call to schedule an appointment',
              'Navigate public transport: read a schedule buy a ticket figure out transfers',
              'Hand them the grocery list and budget and wait in the car',
              'Plan the next family outing from start to finish',
              'Order food at a restaurant without a parent ordering for them',
              'Ask a librarian or shop clerk for help finding something',
              'Walk to a familiar destination alone',
            ],
          },
          {
            name: 'Home Skills',
            items: [
              'Do their own laundry start to finish',
              'Cook five meals independently by age 12',
              'Run a treasure hunt with a hand-drawn map',
              'Clean a bathroom from start to finish',
              'Sew a button or mend a small tear',
              'Change a light bulb or tighten a loose screw',
              'Pack their own bag for a trip or school day',
            ],
          },
          {
            name: 'Thinking Skills',
            items: [
              'Guess how long a task will take then time it',
              'Use the "3-before-me" rule: try three things before asking',
              'Hand them a broken item and let them figure it out',
              'Give them a real say in a portion of the family budget',
              'Interview a grandparent with five prepared questions',
              'Look at a problem from two sides before choosing',
            ],
          },
        ],
      },
      {
        slug: 'chores-by-age-ideas',
        blogSlug: 'age-appropriate-chores-life-skills',
        title: '24 Chores for Kids by Age: 2 to 12+',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'This free printable chore chart lists 24 chores for kids in four age bands: ages 2 to 5, 6 to 8, 9 to 11, and 12 and up. Each band holds chores kids can genuinely own at that stage. Post it once and stop the daily reminding.',
        sections: [
          {
            name: 'Ages 2-5',
            items: [
              'Put toys in a bin after playing',
              'Carry dishes to the sink after meals',
              'Put dirty clothes in the hamper',
              'Set the table with the correct number of everything',
              'Sort laundry by color',
              'Water plants with a small watering can',
            ],
          },
          {
            name: 'Ages 6-8',
            items: [
              'Load and unload the dishwasher',
              'Fold simple laundry (towels socks t-shirts)',
              'Sweep the kitchen floor',
              'Feed pets independently on a schedule',
              'Make their own bed each morning',
              'Wipe down counters after meals',
            ],
          },
          {
            name: 'Ages 9-11',
            items: [
              'Do their own laundry start to finish',
              'Cook simple meals (eggs pasta sandwiches)',
              'Clean a bathroom from start to finish',
              'Pack their own bag for a trip or school day',
              'Take out garbage and recycling without being asked',
              'Help with grocery shopping using a list',
            ],
          },
          {
            name: 'Ages 12+',
            items: [
              'Plan and cook a full family meal',
              'Do basic home repairs (tighten screws hang pictures)',
              'Run errands independently',
              'Meal plan for a week on a budget',
              'Schedule their own appointments',
              'Handle a minor household emergency',
            ],
          },
        ],
      },
      {
        slug: 'history-ideas',
        blogSlug: 'real-world-history-for-kids',
        title: '11 Family History Activities for Kids',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'A free printable checklist of 11 family history activities for kids ages 6 to 12, spanning family stories, local history, and food history. History is not a textbook. It is the story your family carries and the buildings you walk past.',
        sections: [
          {
            name: 'Family History',
            items: [
              'Interview a grandparent with five prepared questions and record it',
              'Build a family timeline with birth years immigration dates and world events',
              "Trace your family's immigration story and connect it to historical events",
              'Date old family photos from visual clues (clothing cars hairstyles)',
              "Cook a meal from your family's heritage country",
            ],
          },
          {
            name: 'Local History',
            items: [
              'Walk your downtown asking what is the oldest thing here',
              'Visit a cemetery and compare dates spot epidemic or war clusters',
              'Find a vintage tool and figure out how it works',
            ],
          },
          {
            name: 'Food History',
            items: [
              "Pick one dish a week and trace its origin country and history",
              "Track an ingredient's history (chocolate sugar tea potato)",
              'Compare how a common food was made 100 years ago vs today (butter bread pasta)',
            ],
          },
        ],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 4. STEM & Engineering
  // -----------------------------------------------------------------------
  {
    slug: 'stem',
    name: 'STEM & Engineering',
    accent: '#3d5c3b',
    icon: 'Cog',
    blurb:
      'STEM and engineering checklists for kids, free and printable: hands-on builds, fair tests, and what-happens-if experiments from household materials. Science without a lab.',
    lists: [
      {
        slug: 'stem-ideas',
        blogSlug: 'outdoor-stem-challenges',
        title: 'STEM Activities Checklist: 24 No-Kit Builds',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'This is a free printable STEM checklist with 24 builds and experiments for kids ages 5 to 12, split into build and engineer, science and experiment, and backyard STEM. Everything uses what you already have: cardboard, tape, kitchen supplies, and the recycling bin.',
        sections: [
          {
            name: 'Build & Engineer',
            items: [
              'Build the tallest tower from spaghetti and marshmallows',
              'Design a paper airplane that goes the farthest (try three designs)',
              'Build a craft-stick bridge that holds a book',
              'Engineer a foil boat that carries the most pennies before sinking',
              'Build a marble run on a wall using cardboard tubes and tape',
              'Design a container that protects an egg from a one-story drop',
              'Build a wind-powered cart that rolls across a table',
              'Construct a catapult from a Y-shaped stick and rubber band',
            ],
          },
          {
            name: 'Science & Experiment',
            items: [
              'Run an evaporation race: water in sun shade and cover',
              'Build a liquid density tower with honey dish soap water and oil',
              'Plant the same seed in full sun partial shade and dark',
              'Drop objects from the same height and see which lands first',
              "Track shadows hourly by marking a stick's shadow tip with rocks",
              'Bury five items and check weekly to track decomposition',
              'Make a DIY rain gauge and track rainfall over a week',
              'Test which surfaces hold heat: sun-warmed rock vs shaded rock',
            ],
          },
          {
            name: 'Backyard STEM',
            items: [
              'Build a bridge across a gap using only sticks stones and bark',
              'Dig water channels in sand or dirt to move water from A to B',
              'Design a shelter for a toy using found materials',
              'Sit with eyes closed and draw a sound map of everything you hear',
              'Roll different objects down a slope and compare speed',
              'Mark a one-meter square and count every living creature',
              'Engineer a solar oven that melts chocolate',
              'Build a working weather station with three homemade instruments',
            ],
          },
        ],
      },
      {
        slug: 'engineering-ideas',
        blogSlug: 'engineering-for-kids',
        title: 'Engineering Challenge Checklist: 16 Builds',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'A free printable checklist of 16 engineering build challenges for kids, sorted from quick builds to real engineering projects. Hand them cardboard, tape, and a challenge, then stand back and watch them think. Every build uses household materials.',
        sections: [
          {
            name: 'Quick Builds',
            items: [
              'Build a paper column that holds the heaviest book (round vs square vs triangle)',
              'Make a balloon-powered car from a bottle straws and bottle-cap wheels',
              'Build the longest cantilever off a table edge with craft sticks and coins',
              'Fold a paper boat hull that holds the most marbles before tipping',
              'Build a catapult from a spoon rubber band and cup',
              'Build a zipline for a toy across the room and tune the slope for a soft landing',
            ],
          },
          {
            name: 'Bigger Projects',
            items: [
              'Engineer a working drawbridge with string pulleys and cardboard',
              'Build a working trebuchet from kitchen materials',
              'Build an insulated cup that keeps ice frozen longest',
              'Design a rubber-band-powered paddle boat for the bathtub',
              'Build an automatic pet feeder prototype from cardboard tubes and a cup',
            ],
          },
          {
            name: 'Real Engineering',
            items: [
              'Build a water filter from sand gravel and cotton then test it with muddy water',
              'Design earthquake-proof towers on a wobbly gelatin base and shake-test them',
              'Design a load-bearing chair from cardboard you can sit on',
              'Design a slide for a toy car (steeper equals faster but does steeper equal better)',
              'Build a fort that holds a kid inside it',
            ],
          },
        ],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 5. Creative & Maker
  // -----------------------------------------------------------------------
  {
    slug: 'creative',
    name: 'Creative & Maker',
    accent: '#c47a8f',
    icon: 'Palette',
    blurb:
      'Creative activity checklists for kids, free to print: making, storytelling, and inventing with whatever is on hand. No kit required, no wrong answers.',
    lists: [
      {
        slug: 'creative-ideas',
        blogSlug: 'raise-creative-kids',
        title: '26 Creative & Maker Ideas for Kids',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'This is a free printable checklist of 26 creative activities for kids from toddler to teen, organized into make something, tell a story, and invent and solve. Creativity is not about art supplies. It is about making something that did not exist five minutes ago.',
        sections: [
          {
            name: 'Make Something',
            items: [
              'Build a fort from couch cushions sheets and fairy lights',
              'Cardboard box challenge: empty box tape markers make something',
              'Try the one-material challenge: cardboard only make something useful',
              'Draw a map of an imaginary island with regions rules and inhabitants',
              'Build a Minecraft world with a parliament farms and trading posts',
              'Design and playtest a board game with rules and pieces',
              'Create a family newspaper with sections (weather sports gossip comics)',
              'Write a choose-your-own-adventure story',
              'Build a Rube Goldberg machine from household items',
            ],
          },
          {
            name: 'Tell a Story',
            items: [
              'Film script and edit a short video about something they learned',
              'Write a letter to a relative who will actually write back',
              'Create a restaurant menu for a meal the kid is cooking',
              'Script a video they want to film',
              'Write an instruction manual for a LEGO build',
              'Make a presentation to grandparents about a topic they studied',
              'Write a complaint letter to a company about a product that broke',
              'Start a family travel blog where everyone contributes',
            ],
          },
          {
            name: 'Invent & Solve',
            items: [
              'Give kids a broken thing and a roll of tape: see if they can fix it',
              'Invent a sport with random objects (balls cones pool noodles)',
              'Ask "what if" questions at dinner ("What if gravity worked sideways?")',
              'Give kids a real problem to solve (reorganize a closet plan a meal with limited ingredients)',
              'Hand them a broken thing and let them figure out a repair',
              "Keep a \"Game Inventor's Notebook\" to record rules",
              'Draw the same imaginary city from different time periods',
              'Give kids a space and say "invent a game. You have 10 minutes"',
              'Build a kinetic sculpture that moves under wind or gravity',
            ],
          },
        ],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 6. Travel & Worldschool
  // -----------------------------------------------------------------------
  {
    slug: 'travel',
    name: 'Travel & Worldschool',
    accent: '#d4a373',
    icon: 'Globe',
    blurb:
      'Travel and worldschool checklists for kids, printable and free: learning that works on a road trip, in your own city, or abroad.',
    lists: [
      {
        slug: 'travel-ideas',
        blogSlug: 'homeschool-while-traveling',
        title: '22 Travel & Worldschool Activities for Kids',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'A free printable checklist of 22 travel and worldschool activities for kids ages 5 to 14, grouped into explore and discover, document and create, and go deep. They work in your own city, on a road trip, or halfway around the globe. No plane ticket required.',
        sections: [
          {
            name: 'Explore & Discover',
            items: [
              'Let kids be the navigator: hand them the map',
              'Give each kid a small daily budget in local currency',
              'Order food in the local language at a shop or restaurant',
              'Visit a local museum nature center or workshop',
              'Hold a family meeting each evening: what surprised you',
              'Take a cooking class with a local family',
              'Join a local sports group in a new country',
              'Walk your downtown asking "what is the oldest thing here?"',
            ],
          },
          {
            name: 'Document & Create',
            items: [
              'Start a daily travel journal (notebook photo journal or app)',
              'Write and record an original song about a travel experience',
              'Create a blog post with research writing and photos',
              'Make a poster about a country: wildlife geography and culture',
              'Film a day-in-the-life video at each new place',
              'Photograph five things that are different from home',
              'Draw a map of your route from memory',
            ],
          },
          {
            name: 'Go Deep',
            items: [
              'Spend a full week researching something that sparked curiosity',
              'Pick one "go deep" day per week: spend all day at one site',
              'Return to favorite spots and compare visits over time',
              "Trace your family's immigration story on a world map",
              'Keep a "question jar" notebook of every question asked during the day',
              "Cook a meal from your family's heritage country",
              'Interview a local person about their daily life',
            ],
          },
        ],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 7. AI & Digital
  // -----------------------------------------------------------------------
  {
    slug: 'ai-digital',
    name: 'AI & Digital',
    accent: '#7b8fa1',
    icon: 'Sparkle',
    blurb:
      'AI and digital literacy checklists for kids, free to print: understand how AI works, use it wisely, and question what they see online. Makers, not just users.',
    lists: [
      {
        slug: 'ai-digital-ideas',
        blogSlug: 'ai-for-kids-2026',
        title: '18 AI & Digital Literacy Ideas for Kids',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'This free printable checklist gives you 18 AI and digital literacy activities for kids ages 8 and up, in three themes: understand AI, use AI wisely, and media literacy. Each one turns screen time from passive scrolling into thinking, creating, and questioning.',
        sections: [
          {
            name: 'Understand AI',
            items: [
              'Write "The cat sat on the..." and have kids finish it, then explain that is what AI does',
              'Play the autocomplete game: tap predicted words 20 times on a phone keyboard',
              'Sort pictures into groups (animals vs vehicles) then explain AI does the same',
              'Play "bot or not": read two stories one human one AI and guess which',
              'Ask an AI to draw a "doctor" and a "nurse" and discuss the bias',
              'Discuss AI ethics at dinner: "If AI writes an essay who gets the grade?"',
            ],
          },
          {
            name: 'Use AI Wisely',
            items: [
              'Use a chatbot with supervision and compare vague vs specific prompts',
              'Ask AI factual questions and verify answers with real sources',
              'Type a bad prompt see the mediocre result then upgrade it together',
              'Use AI as a brainstorming partner for stories or video projects',
              'After every AI use check at least one claim against a real source',
              'Ask AI facts about your home country then fact-check every one',
            ],
          },
          {
            name: 'Media Literacy',
            items: [
              'Play "spot the ad" while watching TV together',
              'Do a reverse image search on a dramatic photo',
              'Pick a claim your child heard and trace it back to its original source',
              'Watch commercials together and ask: what are they selling what feeling are they creating',
              'Show a mix of real and AI-generated photos and see if kids can tell',
              'Use the "three-source rule" before believing any interesting claim',
            ],
          },
        ],
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 8. Mindset & Emotional Skills
  // -----------------------------------------------------------------------
  {
    slug: 'mindset',
    name: 'Mindset & Emotional Skills',
    accent: '#9b7bb8',
    icon: 'Heart',
    blurb:
      'Mindset and resilience checklists for kids, free and printable: safe failure, bouncing back, and perspective practice. The invisible skills that change everything.',
    lists: [
      {
        slug: 'resilience-ideas',
        blogSlug: 'how-to-build-resilience-in-kids',
        title: 'Resilience Checklist: 12 Challenges for Kids',
        published: '2026-06-10',
        updated: '2026-06-10',
        intro:
          'A free printable resilience checklist with 12 challenges for kids ages 4 to 12, built around safe failure, bouncing back, and perspective. Resilience is not something kids are born with. It is built through practice, and this list is the practice.',
        sections: [
          {
            name: 'Safe Failure',
            items: [
              'Give them a task slightly above their skill level and resist helping',
              'Let them try something they might fail at (a recipe a build a new skill)',
              'After a failure ask "what would you do differently" not "what went wrong"',
              'Tell stories about your own failures and what you learned',
            ],
          },
          {
            name: 'Bounce Back',
            items: [
              'Set a challenge they cannot complete in one try (juggling solving a puzzle learning a knot)',
              'When they say "I can\'t" add "yet" and mean it',
              'Give them a broken thing and no instructions',
              'Create a family "failure trophy" to celebrate the best attempt of the week',
            ],
          },
          {
            name: 'Perspective',
            items: [
              'Ask "will this matter in a week? a month? a year?"',
              'Read a biography together and count the setbacks before the success',
              'Play "what is the worst that could happen" and follow it to the logical (undramatic) end',
              'Compare a photo of them one year ago to now and list everything they learned',
            ],
          },
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return all categories. */
export function getAllCategories(): IdeaCategory[] {
  return IDEAS_DATA
}

/** Look up a category by its slug. */
export function getCategoryBySlug(slug: string): IdeaCategory | undefined {
  return IDEAS_DATA.find((cat) => cat.slug === slug)
}

/** Find a specific list across all categories. */
export function getListBySlug(
  slug: string
): { category: IdeaCategory; list: IdeaList } | undefined {
  for (const category of IDEAS_DATA) {
    const list = category.lists.find((l) => l.slug === slug)
    if (list) return { category, list }
  }
  return undefined
}

/** Find the idea list that was pulled from a given blog post (reverse of
 *  the `blogSlug` field). Used to cross-link blog posts to their checklist. */
export function getListByBlogSlug(
  blogSlug: string
): { category: IdeaCategory; list: IdeaList } | undefined {
  for (const category of IDEAS_DATA) {
    const list = category.lists.find((l) => l.blogSlug === blogSlug)
    if (list) return { category, list }
  }
  return undefined
}

/** Count all idea items across all lists in a category. */
export function getTotalIdeas(category: IdeaCategory): number {
  return category.lists.reduce(
    (total, list) =>
      total + list.sections.reduce((sum, s) => sum + s.items.length, 0),
    0
  )
}

/** Count the number of lists in a category. */
export function getListCount(category: IdeaCategory): number {
  return category.lists.length
}
