// ─── Blog Data Layer ───
// Hardcoded blog posts (same pattern as homepage products).
// Swap these functions for CMS/DB queries when ready.

export type BlogCategory =
  | 'homeschool-life'
  | 'nature-learning'
  | 'real-world-skills'
  | 'travel-worldschool'
  | 'getting-started';

export interface BlogAuthor {
  name: string;
  bio: string;
  avatarColor: string;
}

export type BlogContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'pull-quote'; text: string; attribution?: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'image'; alt: string; caption?: string }
  | { type: 'cta'; text: string; href: string; label: string };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  publishedAt: string;
  readTimeMinutes: number;
  author: BlogAuthor;
  heroImageAlt: string;
  content: BlogContentBlock[];
  relatedSlugs: string[];
}

export const blogCategories: Record<BlogCategory, { label: string; color: string }> = {
  'homeschool-life':     { label: 'Homeschool Life',      color: '#588157' },
  'nature-learning':     { label: 'Nature Learning',      color: '#6b8e6b' },
  'real-world-skills':   { label: 'Real-World Skills',    color: '#8b7355' },
  'travel-worldschool':  { label: 'Travel & Worldschool', color: '#c4836a' },
  'getting-started':     { label: 'Getting Started',      color: '#d4a373' },
};

const amelie: BlogAuthor = {
  name: 'Amelie',
  bio: 'Worldschooling mom, activity pack creator, and founder of Anywhere Learning. I believe the best education happens when kids are curious, connected, and free to explore.',
  avatarColor: '#d4a373',
};

const posts: BlogPost[] = [
  {
    slug: 'kitchen-learning-lab',
    title: '5 Ways to Turn Your Kitchen Into a Learning Lab',
    excerpt: 'Cooking dinner is already a maths lesson, a science experiment, and a life skills workshop. Here\u2019s how to make it intentional \u2014 without making it feel like school.',
    category: 'real-world-skills',
    publishedAt: '2026-02-24',
    readTimeMinutes: 6,
    author: amelie,
    heroImageAlt: 'Child measuring ingredients in a sunlit kitchen',
    content: [
      { type: 'paragraph', text: 'If you\u2019ve ever had a kid ask \u201cwhy does bread rise?\u201d while you\u2019re kneading dough, congratulations \u2014 you\u2019re already running a science class. The kitchen is the most underrated classroom in your home, and the best part? It requires zero prep.' },
      { type: 'heading', level: 2, text: '1. Let them measure everything' },
      { type: 'paragraph', text: 'Fractions become real when you\u2019re doubling a recipe. \u201cWhat\u2019s half of three-quarters?\u201d suddenly matters when chocolate chip cookies are on the line. Hand over the measuring cups and let them figure it out.' },
      { type: 'heading', level: 2, text: '2. Read the recipe together' },
      { type: 'paragraph', text: 'A recipe is a procedural text. It has sequencing, vocabulary, and instructions that need to be followed precisely. For younger kids, read it aloud. For older kids, let them lead the entire cook from the written page.' },
      { type: 'heading', level: 2, text: '3. Talk about where food comes from' },
      { type: 'paragraph', text: 'That tomato in the salad? It started as a seed, needed sun and water, was probably grown on a farm hundreds of kilometres away, shipped in a refrigerated truck, and stocked by a human at the shop. That\u2019s biology, geography, economics, and supply chain \u2014 in a single tomato.' },
      { type: 'pull-quote', text: 'The best learning doesn\u2019t feel like learning. It feels like dinner.', attribution: 'Amelie, Anywhere Learning' },
      { type: 'heading', level: 2, text: '4. Budget the weekly shop' },
      { type: 'paragraph', text: 'Give older kids a meal plan and a budget. Let them browse prices, compare brands, and figure out what\u2019s worth the splurge. This is real-world maths \u2014 the kind no worksheet can replicate.' },
      { type: 'heading', level: 2, text: '5. Let them fail (safely)' },
      { type: 'paragraph', text: 'Burnt pancakes? Too much salt? These are learning moments. Resilience, problem-solving, and the ability to laugh at a mistake \u2014 these are life skills that matter far more than getting the right answer on a test.' },
      { type: 'cta', text: 'Our Real-World Skills pack has 25 kitchen-based activities ready to print and use today.', href: '/shop', label: 'Browse Activity Packs' },
    ],
    relatedSlugs: ['nature-walks-science', 'curriculum-guilt-permission-slip'],
  },
  {
    slug: 'nature-walks-science',
    title: 'Why Nature Walks Are the Best Science Lesson You\u2019ll Never Plan',
    excerpt: 'Forget the textbook. A 30-minute walk outside teaches more science than a week of worksheets \u2014 and your kids will actually remember it.',
    category: 'nature-learning',
    publishedAt: '2026-02-17',
    readTimeMinutes: 5,
    author: amelie,
    heroImageAlt: 'Parent and child walking through a forest trail',
    content: [
      { type: 'paragraph', text: 'Last Tuesday, my youngest found a snail on our front path. Within five minutes, we\u2019d talked about molluscs, shells as protection, why snails leave trails, and whether they have eyes. No lesson plan. No curriculum guide. Just a kid, a snail, and curiosity.' },
      { type: 'paragraph', text: 'This is what real science looks like. Not a fill-in-the-blank worksheet about ecosystems \u2014 but a real, living creature that sparks genuine wonder.' },
      { type: 'heading', level: 2, text: 'Observation is the foundation of science' },
      { type: 'paragraph', text: 'Every great scientist started by noticing things. Darwin noticed finches. Marie Curie noticed glowing residue. Your kid notices that puddles disappear on hot days. That\u2019s evaporation. That\u2019s science. And it happened without you planning a thing.' },
      { type: 'pull-quote', text: 'You don\u2019t need a microscope to do science. You need a curious kid and an open door.' },
      { type: 'heading', level: 2, text: 'What to bring (almost nothing)' },
      { type: 'list', ordered: false, items: [
        'A small notebook or nature journal',
        'A pencil (not a pen \u2014 pencils work in the rain)',
        'A magnifying glass if you have one',
        'Your phone for photos and identification apps',
        'That\u2019s it. Really.',
      ]},
      { type: 'heading', level: 2, text: 'Questions beat answers' },
      { type: 'paragraph', text: 'When your child asks \u201cwhy are leaves green?\u201d, resist the urge to explain chlorophyll immediately. Instead, ask back: \u201cWhat do you think? Are all leaves green? What about in autumn?\u201d Let them sit with the question. That discomfort \u2014 that itch to know \u2014 is where real learning lives.' },
      { type: 'paragraph', text: 'You don\u2019t have to be a science teacher. You just have to be willing to say \u201cI don\u2019t know \u2014 let\u2019s find out together.\u201d' },
      { type: 'cta', text: 'Our Nature Journal & Walk Cards give you 25 ready-made prompts for outdoor exploration.', href: '/shop/nature-journal-walks', label: 'Get the Nature Pack' },
    ],
    relatedSlugs: ['kitchen-learning-lab', 'worldschool-three-kids'],
  },
  {
    slug: 'curriculum-guilt-permission-slip',
    title: 'Letting Go of Curriculum Guilt: A Permission Slip',
    excerpt: 'You chose homeschooling for freedom. So why does it feel like you\u2019re failing if you\u2019re not following a curriculum? Here\u2019s your permission to let go.',
    category: 'homeschool-life',
    publishedAt: '2026-02-10',
    readTimeMinutes: 7,
    author: amelie,
    heroImageAlt: 'Sunlit living room with books scattered on a cosy rug',
    content: [
      { type: 'paragraph', text: 'I need to tell you something that took me three years to learn: you don\u2019t need a curriculum. Not a structured one. Not a \u201crelaxed\u201d one. Not even an \u201cunschooling curriculum\u201d (which is an oxymoron, by the way). You need connection, curiosity, and the courage to trust that your kids are learning \u2014 even when it doesn\u2019t look like school.' },
      { type: 'heading', level: 2, text: 'Where the guilt comes from' },
      { type: 'paragraph', text: 'Most of us were schooled in systems that measured success with grades, tests, and completion checkboxes. We internalised the idea that learning = structured instruction. So when our homeschool day looks like baking, playing in the garden, and reading on the couch, a voice whispers: \u201cIs this enough?\u201d' },
      { type: 'paragraph', text: 'That voice isn\u2019t yours. It\u2019s the system\u2019s. And it\u2019s wrong.' },
      { type: 'pull-quote', text: 'The guilt isn\u2019t a sign you\u2019re doing it wrong. It\u2019s a sign you\u2019re unlearning what school taught you about learning.' },
      { type: 'heading', level: 2, text: 'What learning actually looks like' },
      { type: 'paragraph', text: 'Learning looks like a 6-year-old spending 45 minutes building a dam in a creek. It looks like a 10-year-old reading the same book for the fourth time because they love it that much. It looks like a 4-year-old sorting leaves by colour, size, and shape \u2014 without being asked to.' },
      { type: 'paragraph', text: 'None of this comes with a lesson plan. All of it is meaningful. And all of it is already happening in your home.' },
      { type: 'heading', level: 2, text: 'Your permission slip' },
      { type: 'list', ordered: false, items: [
        'You have permission to skip the textbook today.',
        'You have permission to follow your child\u2019s interest, even if it\u2019s not \u201con the schedule.\u201d',
        'You have permission to count the nature walk as science.',
        'You have permission to call the baking session maths.',
        'You have permission to trust yourself.',
      ]},
      { type: 'paragraph', text: 'This doesn\u2019t mean you never use a resource. It means the resource serves you \u2014 not the other way around. Activity cards, prompts, and ideas are tools. A curriculum that makes you feel guilty when you skip a day is a cage.' },
      { type: 'cta', text: 'Not sure where to start? Grab our free guide \u2014 it\u2019s designed for families exactly like yours.', href: '/free-guide', label: 'Get the Free Guide' },
    ],
    relatedSlugs: ['new-to-homeschooling', 'kitchen-learning-lab'],
  },
  {
    slug: 'worldschool-three-kids',
    title: 'How We Worldschool With Three Kids Under 10',
    excerpt: 'Worldschooling sounds romantic until you\u2019re in a foreign supermarket with a screaming toddler. Here\u2019s what it actually looks like \u2014 and how we make it work.',
    category: 'travel-worldschool',
    publishedAt: '2026-02-03',
    readTimeMinutes: 8,
    author: amelie,
    heroImageAlt: 'Family exploring a colourful market in Southeast Asia',
    content: [
      { type: 'paragraph', text: 'People picture worldschooling as tanned kids journaling on a beach in Bali. And sometimes it is. But mostly it\u2019s navigating a bus system in a language you don\u2019t speak, negotiating screen time in a hotel room, and explaining currency exchange to a 7-year-old who just wants to know why the ice cream costs \u201cso many numbers.\u201d' },
      { type: 'paragraph', text: 'It\u2019s messy. It\u2019s exhausting. And it\u2019s the best decision we ever made.' },
      { type: 'heading', level: 2, text: 'What a typical day looks like' },
      { type: 'paragraph', text: 'There\u2019s no typical day \u2014 that\u2019s the point. But if you want a rough idea: mornings are slow (reading, drawing, maybe a maths game). Afternoons are out \u2014 exploring a market, visiting a museum, hiking a trail. Evenings we talk about what we saw, sometimes journal, and always read together before bed.' },
      { type: 'pull-quote', text: 'Travel doesn\u2019t replace education. Travel is education. Every new city is a living textbook.' },
      { type: 'heading', level: 2, text: 'The secret: low expectations, high curiosity' },
      { type: 'paragraph', text: 'If you expect your kids to sit still and write essays about the Roman Colosseum, you\u2019ll be disappointed. If you expect them to run around it, ask weird questions, and remember the gladiator facts from the audio guide three months later \u2014 you\u2019ll be thrilled.' },
      { type: 'heading', level: 2, text: 'Resources that travel well' },
      { type: 'list', ordered: false, items: [
        'Printable activity cards (no wifi needed, no devices)',
        'A small nature journal per kid',
        'A world map they can mark up',
        'Library books from each new city',
        'Conversation \u2014 the most underrated learning tool',
      ]},
      { type: 'heading', level: 2, text: 'You don\u2019t have to travel full-time' },
      { type: 'paragraph', text: 'Worldschooling isn\u2019t just for nomad families. A weekend trip to a nearby town, a visit to a cultural festival, or even cooking a meal from another country \u2014 it all counts. The mindset is \u201cthe world is the classroom.\u201d The location is optional.' },
      { type: 'cta', text: 'Our activity packs are designed to work anywhere \u2014 from your kitchen table to a campsite in Portugal.', href: '/shop', label: 'Browse Activity Packs' },
    ],
    relatedSlugs: ['nature-walks-science', 'curriculum-guilt-permission-slip'],
  },
  {
    slug: 'new-to-homeschooling',
    title: 'New to Homeschooling? Start Here (No Curriculum Required)',
    excerpt: 'Just pulled your kids out of school? Overwhelmed by options? Take a breath. Here\u2019s everything you need to know to start \u2014 and none of what you don\u2019t.',
    category: 'getting-started',
    publishedAt: '2026-01-27',
    readTimeMinutes: 9,
    author: amelie,
    heroImageAlt: 'Child reading a book under a tree in golden afternoon light',
    content: [
      { type: 'paragraph', text: 'First: breathe. You made a brave choice. Whether you pulled your kids out of school because it wasn\u2019t working, because you want to travel, or because you just know there\u2019s a better way \u2014 you\u2019re in the right place. And you don\u2019t need to have it all figured out today.' },
      { type: 'heading', level: 2, text: 'The first week: do nothing (seriously)' },
      { type: 'paragraph', text: 'This might sound counterintuitive, but the best thing you can do in your first week is... nothing structured. Let your kids decompress. Let them be bored. Let them rediscover what they\u2019re actually interested in when nobody\u2019s telling them what to study. This process is called \u201cdeschooling\u201d and it\u2019s essential.' },
      { type: 'pull-quote', text: 'Deschooling isn\u2019t a break from learning. It\u2019s the beginning of real learning.' },
      { type: 'heading', level: 2, text: 'You don\u2019t need to recreate school at home' },
      { type: 'paragraph', text: 'This is the biggest mistake new homeschoolers make. You set up a desk, buy a whiteboard, create a timetable, and try to run 5 hours of structured lessons. By Wednesday, everyone\u2019s miserable. You didn\u2019t leave school to build another one. You left to do something different.' },
      { type: 'heading', level: 2, text: 'What you actually need to start' },
      { type: 'list', ordered: true, items: [
        'A library card (free and endlessly useful)',
        'Access to the outdoors (a garden, a park, a trail)',
        'A few open-ended activities or prompts',
        'The willingness to follow your child\u2019s lead',
        'That\u2019s genuinely it for the first month',
      ]},
      { type: 'heading', level: 2, text: 'Finding your style' },
      { type: 'paragraph', text: 'Charlotte Mason, Montessori, Unschooling, Eclectic, Classical \u2014 the labels can wait. For now, just pay attention. What does your child gravitate towards? What makes their eyes light up? Follow that thread. The philosophy will reveal itself.' },
      { type: 'heading', level: 3, text: 'A note on socialisation' },
      { type: 'paragraph', text: 'Yes, people will ask. No, it\u2019s not a real problem. Homeschooled kids socialise through co-ops, sports, community groups, neighbourhood play, and the simple fact that they interact with people of all ages \u2014 not just 30 kids born in the same year.' },
      { type: 'cta', text: 'Our free guide walks you through the first 30 days of homeschooling, step by step.', href: '/free-guide', label: 'Get the Free Guide' },
    ],
    relatedSlugs: ['curriculum-guilt-permission-slip', 'kitchen-learning-lab'],
  },
];

// ─── Helper Functions ───

export function getAllPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getFeaturedPost(): BlogPost {
  return getAllPosts()[0];
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  // First try same-category posts, then fill with recent posts
  const sameCat = posts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, limit);

  if (sameCat.length >= limit) return sameCat;

  const fromSlugs = post.relatedSlugs
    .map((s) => posts.find((p) => p.slug === s))
    .filter((p): p is BlogPost => p !== undefined && p.slug !== post.slug && !sameCat.some((sc) => sc.slug === p.slug));

  const combined = [...sameCat, ...fromSlugs].slice(0, limit);

  if (combined.length >= limit) return combined;

  const recent = getAllPosts()
    .filter((p) => p.slug !== post.slug && !combined.some((c) => c.slug === p.slug))
    .slice(0, limit - combined.length);

  return [...combined, ...recent].slice(0, limit);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatReadTime(minutes: number): string {
  return `${minutes} min read`;
}
