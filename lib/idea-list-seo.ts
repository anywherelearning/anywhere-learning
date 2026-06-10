// ---------------------------------------------------------------------------
// Per-list SEO content for /ideas/[slug] pages.
//
// Each entry gives a crawlable, keyword-aware layer on top of the raw checklist:
//   - seoTitle:        the <title> tag (absolute, leads with the search keyword)
//   - metaDescription: the SERP snippet (~150 chars, keyword + free + CTA)
//   - howToUse:        a short unique paragraph of body text (parent-led framing)
//   - faqs:            3-4 Q&As that target long-tail + "People Also Ask" results
//
// Voice: casual mom-to-mom, no em dashes, no fabricated anecdotes, no emojis.
// ---------------------------------------------------------------------------

export type IdeaListSeo = {
  seoTitle: string
  metaDescription: string
  howToUse: string
  faqs: { question: string; answer: string }[]
}

export const IDEA_LIST_SEO: Record<string, IdeaListSeo> = {
  'nature-walk-ideas': {
    seoTitle: '50 Nature Walk Ideas for Kids (Free Printable List)',
    metaDescription:
      'Free printable list of 50 nature walk ideas for kids. No gear or prep needed. Download the checklist and turn any ordinary walk into real learning.',
    howToUse:
      'Pick two or three ideas before you head out the door, or let your kids choose. The point is not to do all 50 in one walk. You lead by noticing out loud, asking questions, and slowing down enough to follow what catches their attention. Print the list, tuck it in your bag, and check things off together as you go.',
    faqs: [
      {
        question: 'What age are these nature walk ideas for?',
        answer:
          'Most work for kids from toddler age up to about twelve. Younger kids love the collecting and observing ideas, while older kids dig into the challenges and measuring activities. You adjust the difficulty by how much you do for them versus how much you let them figure out.',
      },
      {
        question: 'Do I need any special equipment?',
        answer:
          'No. Every idea on this list uses what you already have or what you find outside. A few are more fun with a magnifying glass or a notebook, but none of them require buying anything.',
      },
      {
        question: 'Is the printable really free?',
        answer:
          'Yes. The full list is free to read on this page and free to download as a PDF. You can print it in full color or in black and white, whichever suits your printer.',
      },
    ],
  },

  'backyard-science-ideas': {
    seoTitle: '15 Backyard Science Experiments for Kids (Free PDF)',
    metaDescription:
      'Free printable backyard science experiments for kids using water, dirt, and jars. Download the checklist and do real science at home, no kit required.',
    howToUse:
      'These are hands-on science experiments you do alongside your kids, not demos they watch. Set up the materials together, ask what they think will happen before you start, and let them get it wrong. The mess and the surprise are where the learning lives. Print the list and work through one experiment at a time.',
    faqs: [
      {
        question: 'What supplies do I need for these experiments?',
        answer:
          'Just everyday things from around the house: water, soil, jars, food coloring, and a sunny spot. Each experiment lists what it uses, and none of them need a science kit or special chemicals.',
      },
      {
        question: 'What age group is this best for?',
        answer:
          'These work well for kids roughly five to eleven. Younger kids enjoy watching the changes and helping set up, while older kids can run the experiment themselves and start asking why it happened.',
      },
      {
        question: 'How long does each experiment take?',
        answer:
          'Most take fifteen to thirty minutes to set up, though a few, like growing plants or watching weather, play out over several days. They are easy to fit into a normal afternoon.',
      },
    ],
  },

  'forest-school-ideas': {
    seoTitle: '13 Forest School Activities for Kids (Free Printable)',
    metaDescription:
      'Free printable forest school activities for kids, no training needed. Download the checklist and bring nature-based learning to any patch of trees.',
    howToUse:
      'You do not need a forest school certification or even a real forest. A park, a treeline, or a backyard with a few trees is plenty. Your job is to give them time, a loose challenge, and the freedom to take small risks. Print the list, pick an activity, and let them lead while you stay close.',
    faqs: [
      {
        question: 'Do I need forest school training to use these?',
        answer:
          'Not at all. These activities are written for regular parents. They focus on building, observing, and safe outdoor risk, all things you can guide without any special qualification.',
      },
      {
        question: 'What if we do not live near a forest?',
        answer:
          'Any green space works. A neighborhood park, a few backyard trees, or a walking trail gives your kids everything they need for these activities.',
      },
      {
        question: 'Are these activities safe for younger children?',
        answer:
          'Yes, with you nearby. The risk-and-challenge ideas are about letting kids test their limits in a way you supervise, like climbing or using simple tools, which builds confidence and judgment.',
      },
    ],
  },

  'seasonal-scavenger-ideas': {
    seoTitle: '17 Seasonal Scavenger Hunt Ideas (Free Printable)',
    metaDescription:
      'Free printable seasonal scavenger hunts for kids, one list each for spring, summer, autumn, and winter. Download and print to explore nature all year long.',
    howToUse:
      'There is one hunt for each season, so this list works all year. Print the season you are in, head outside, and let your kids search while you point out the things they walk right past. It turns a regular walk into a treasure hunt and gets everyone noticing how nature changes month to month.',
    faqs: [
      {
        question: 'How is this scavenger hunt different by season?',
        answer:
          'Each season has its own list built around what is actually happening outside at that time, like buds and puddles in spring or animal tracks and frost in winter. You print the one that matches the time of year.',
      },
      {
        question: 'What age is this scavenger hunt for?',
        answer:
          'It works for a wide range, roughly three to ten. Little ones love the hunt itself, and older kids can go deeper by recording or sketching what they find.',
      },
      {
        question: 'Can I use this on a regular walk?',
        answer:
          'Absolutely. That is the whole idea. Tuck the printed list in your pocket on any walk and check items off as you spot them.',
      },
    ],
  },

  'land-art-ideas': {
    seoTitle: '14 Land Art & Nature Sculpture Ideas for Kids (Free)',
    metaDescription:
      'Free printable land art and nature sculpture ideas for kids. Arrange, stack, and weave found materials outside, with no supplies to buy. Download the list.',
    howToUse:
      'Land art uses what is already on the ground: leaves, stones, sticks, petals. Head outside together and start arranging, and your kids will take it from there. You can join in by building your own piece beside theirs. Print the list for inspiration when they need a starting point, then let their ideas run.',
    faqs: [
      {
        question: 'What materials do we need for land art?',
        answer:
          'Only what you find outside. Stones, leaves, sticks, flowers, and pinecones are the whole supply list. Nothing gets bought and nothing comes home, which is part of the appeal.',
      },
      {
        question: 'What age is land art good for?',
        answer:
          'All ages, including toddlers. Little kids arrange and stack, while older kids take on the weaving and balancing challenges that need more patience and planning.',
      },
      {
        question: 'Is land art messy?',
        answer:
          'No. Everything stays outside and goes back to nature. It is one of the tidiest creative activities you can do, with no cleanup when you are done.',
      },
    ],
  },

  'kitchen-ideas': {
    seoTitle: '30 Kitchen Activities for Kids (Free Printable List)',
    metaDescription:
      'Free printable kitchen activities for kids that teach counting, measuring, fractions, and budgeting through real cooking. Download the checklist.',
    howToUse:
      'Cooking is full of math and life skills hiding in plain sight. Pull your kids up to the counter and hand them a real job: measuring, counting, doubling a recipe, or pricing the ingredients. You guide and they do the work. Print the list and pick a few ideas to weave into meals you are already making.',
    faqs: [
      {
        question: 'What can kids actually learn from cooking?',
        answer:
          'A surprising amount. Measuring teaches fractions, doubling a recipe is multiplication, and planning a meal on a budget is real-world math. These ideas pull all of that out of an ordinary cooking session.',
      },
      {
        question: 'What age are these kitchen activities for?',
        answer:
          'They span toddler to teen. Young kids count and pour, while older kids handle fractions, budgeting, and cooking a dish start to finish. You match the job to what your child can handle.',
      },
      {
        question: 'Do I need special ingredients or tools?',
        answer:
          'No. These work with whatever you are already cooking and the tools in your kitchen. The point is to add learning to normal meals, not to buy anything extra.',
      },
    ],
  },

  'life-skills-ideas': {
    seoTitle: '28 Life Skills for Kids (Free Printable Checklist)',
    metaDescription:
      'Free printable life skills checklist for kids covering money, independence, home skills, and thinking. Download and build the skills no test measures.',
    howToUse:
      'These are the skills no school test measures but every adult needs. Start small and hand over real responsibility a little at a time, then resist the urge to step in and fix it. You will be surprised what your kids can handle. Print the checklist and work through it slowly over months, not days.',
    faqs: [
      {
        question: 'What life skills should kids learn before they grow up?',
        answer:
          'This list covers four big areas: managing money, doing things independently, running a home, and thinking through problems. Together they build a kid who can function on their own, which is the real goal.',
      },
      {
        question: 'At what age should kids start learning life skills?',
        answer:
          'Earlier than most parents think. Toddlers can start with simple independence tasks, and the skills build from there. The list is meant to be worked through gradually as your child is ready.',
      },
      {
        question: 'How do I teach life skills without it feeling like a lecture?',
        answer:
          'You hand over the real task instead of talking about it. Let them make the grocery list, handle the cash, or solve the problem themselves. Doing it for real, with you nearby, beats any lesson.',
      },
    ],
  },

  'chores-by-age-ideas': {
    seoTitle: 'Age-Appropriate Chores by Age (Free Printable Chart)',
    metaDescription:
      'Free printable age-appropriate chores chart for kids, sorted by age from 2 to 12 and up. Download and give your kids real responsibility at home.',
    howToUse:
      'Chores are not punishment. They are how kids learn they are capable of real contribution to the family. Find your child age group, pick a couple of chores, and teach them properly once instead of redoing it for them. Print the chart and post it where everyone can see who does what.',
    faqs: [
      {
        question: 'What chores are appropriate for each age?',
        answer:
          'The chart breaks it down into four groups: ages two to five, six to eight, nine to eleven, and twelve and up. Each group lists chores kids can genuinely handle at that stage, from putting away toys to cooking a meal.',
      },
      {
        question: 'Should kids be paid for chores?',
        answer:
          'That is a family call. Many parents keep basic chores unpaid as part of belonging to the household, and offer pay for bigger extra jobs. The chart works either way.',
      },
      {
        question: 'How do I get my kids to actually do their chores?',
        answer:
          'Teach the chore properly the first time, keep your expectations clear, and let them own it instead of hovering. A posted chart removes the daily reminding and makes the responsibility theirs.',
      },
    ],
  },

  'history-ideas': {
    seoTitle: '11 Real-World History Activities for Kids (Free PDF)',
    metaDescription:
      'Free printable real-world history activities for kids using family stories, local landmarks, and food. Download and make history personal, not a textbook.',
    howToUse:
      'History sticks when it is personal. Instead of dates to memorize, these ideas connect your kids to the story your own family carries and the buildings you walk past every day. Sit down and explore one together, whether that is interviewing a grandparent or tracing where a favorite food came from. Print the list and pick what fits your family.',
    faqs: [
      {
        question: 'How do I make history interesting for kids?',
        answer:
          'You make it personal. These activities start with your own family, your town, and the food on your table, so history becomes a real story your kids are part of instead of a list of dates.',
      },
      {
        question: 'What age are these history activities for?',
        answer:
          'They suit roughly ages six to twelve. Younger kids enjoy interviewing relatives and looking at old photos, while older kids can build timelines and connect family stories to bigger world events.',
      },
      {
        question: 'Do I need to know a lot of history myself?',
        answer:
          'No. The whole point is to discover it together. You and your kids find the answers as you go, which is more fun and more memorable than any lecture.',
      },
    ],
  },

  'stem-ideas': {
    seoTitle: '24 STEM Activities for Kids at Home (Free Printable)',
    metaDescription:
      'Free printable STEM activities for kids using cardboard, tape, and recycling. Download the checklist and do real engineering at home, no kit needed.',
    howToUse:
      'STEM does not need a kit or a screen. Hand your kids cardboard, tape, and a clear challenge, then step back and let them think it through. When something fails, ask what they would change instead of fixing it for them. Print the list and pick a build that uses whatever is in your recycling bin today.',
    faqs: [
      {
        question: 'What is a good STEM activity to do at home?',
        answer:
          'Anything that hands kids a real problem and lets them build a solution. This list has twenty-four, from cardboard structures to backyard experiments, all using materials you already have at home.',
      },
      {
        question: 'Do STEM activities require special kits?',
        answer:
          'No. Every idea here uses household items: cardboard, tape, kitchen supplies, and things from the recycling bin. The thinking matters more than the materials.',
      },
      {
        question: 'What age are these STEM activities for?',
        answer:
          'They work for roughly ages five to twelve. You make a build easier or harder by how much you guide versus how much you let your child problem-solve on their own.',
      },
    ],
  },

  'engineering-ideas': {
    seoTitle: '16 Engineering Challenges for Kids (Free Printable)',
    metaDescription:
      'Free printable engineering challenges for kids using cardboard and tape. Download the checklist and watch your kids design, build, and problem-solve.',
    howToUse:
      'Give them the materials, give them the challenge, and then give them space. Engineering is learned by trying, failing, and trying again, so the best thing you can do is not rescue them too fast. Build alongside them if they want company. Print the list and start with a quick build before working up to the bigger projects.',
    faqs: [
      {
        question: 'What is a simple engineering project for kids?',
        answer:
          'Start with a quick build like a paper bridge or a tower that has to hold weight. This list is sorted from fast builds to bigger projects, so you can match the challenge to your time and your child.',
      },
      {
        question: 'What materials do engineering challenges need?',
        answer:
          'Mostly cardboard, tape, paper, and string. These challenges are designed around cheap, everyday materials so kids can build, wreck, and rebuild without worrying about supplies.',
      },
      {
        question: 'How does building help my child learn?',
        answer:
          'It builds real problem-solving. When a structure fails, your child has to figure out why and try a new approach, which is exactly how engineers think and a skill that carries far beyond the project.',
      },
    ],
  },

  'creative-ideas': {
    seoTitle: '26 Creative Activities for Kids (Free Printable List)',
    metaDescription:
      'Free printable creative activities for kids beyond art supplies: making, storytelling, and inventing. Download the checklist and spark real imagination.',
    howToUse:
      'Creativity is not just art supplies. It is solving problems, telling stories, and making something that did not exist five minutes ago. Offer a starting point, then let your kids steer and resist tidying up their ideas. Print the list and pull one out the next time you hear the words I am bored.',
    faqs: [
      {
        question: 'What counts as a creative activity?',
        answer:
          'More than crafts. This list covers making things, telling stories, and inventing solutions, because real creativity is about original thinking, not just art projects.',
      },
      {
        question: 'My child says they are not creative. Will this help?',
        answer:
          'Yes. Creativity is a muscle, not a talent some kids are born with. These open-ended ideas give every kid a low-pressure way to make and invent, and it grows with practice.',
      },
      {
        question: 'What age are these creative activities for?',
        answer:
          'They span toddler to teen. The making ideas suit younger kids, while the storytelling and inventing challenges give older kids room to go as deep as they want.',
      },
    ],
  },

  'travel-ideas': {
    seoTitle: '22 Worldschool & Travel Activities for Kids (Free)',
    metaDescription:
      'Free printable worldschool and travel activities for kids that work on a road trip, in your city, or abroad. Download and turn travel into learning.',
    howToUse:
      'You do not need a plane ticket to worldschool. These ideas work on a road trip, a day in your own city, or a trip across the globe. Let your kids explore, document what they notice, and dig into one thing that grabs them. Print the list and bring it along wherever you are headed next.',
    faqs: [
      {
        question: 'What is worldschooling?',
        answer:
          'It is using travel and the real world as the classroom. It does not require going far. These activities turn exploring, documenting, and digging into local culture into genuine learning, whether you are home or away.',
      },
      {
        question: 'Do we have to travel far to use these ideas?',
        answer:
          'Not at all. They work in your own town, on a weekend road trip, or overseas. The skill is learning to explore wherever you are, and that starts close to home.',
      },
      {
        question: 'What age are these travel activities for?',
        answer:
          'They work for roughly ages five to fourteen. Younger kids focus on exploring and noticing, while older kids take on the document-and-go-deep activities that build research and observation skills.',
      },
    ],
  },

  'ai-digital-ideas': {
    seoTitle: '18 AI & Digital Literacy Activities for Kids (Free)',
    metaDescription:
      'Free printable AI and digital literacy activities for kids. Download the checklist and turn screen time into thinking, creating, and questioning.',
    howToUse:
      'Screen time does not have to be passive time. These ideas help your kids understand how AI works, use it as a tool for creating, and question what they see online. Sit beside them for the first few and talk through what comes up. Print the list and use it to make tech a topic you explore together, not a battle.',
    faqs: [
      {
        question: 'How do I teach my kids about AI?',
        answer:
          'You start by exploring it together. This list has activities that show how AI works, how to use it wisely, and how to question its answers, all framed so a parent can guide without being a tech expert.',
      },
      {
        question: 'What age is digital literacy appropriate for?',
        answer:
          'These suit roughly ages eight and up, when kids are starting to use devices more independently. The media literacy ideas are valuable right through the teen years.',
      },
      {
        question: 'Will this just mean more screen time?',
        answer:
          'No, it changes the kind of screen time. Instead of passive scrolling, these activities turn devices into tools for thinking, making, and questioning, which is the heart of real digital literacy.',
      },
    ],
  },

  'resilience-ideas': {
    seoTitle: '12 Resilience Activities for Kids (Free Printable)',
    metaDescription:
      'Free printable resilience activities for kids built around safe failure, bouncing back, and perspective. Download and help your kids handle setbacks.',
    howToUse:
      'Resilience is not something kids are born with. It is built through practice and safe failures, which means your job is sometimes to let them struggle. Give a challenge slightly above their level, then hold back from rescuing. Talk through what they would try next. Print the list and weave these moments into everyday life.',
    faqs: [
      {
        question: 'How do you build resilience in a child?',
        answer:
          'Through practice with safe failure. These activities give kids manageable challenges and let them work through frustration, which is how resilience is actually built, not by protecting them from every struggle.',
      },
      {
        question: 'What age are these resilience activities for?',
        answer:
          'They work across childhood, roughly ages four to twelve. You adjust the challenge to your child, making it just hard enough that they have to push through but not so hard they give up.',
      },
      {
        question: 'Is it okay to let my child fail on purpose?',
        answer:
          'Within reason, yes. Safe, low-stakes failure is one of the best teachers there is. The goal is not to make things hard for the sake of it, but to let kids learn they can recover and try again.',
      },
    ],
  },
}

export function getIdeaListSeo(slug: string): IdeaListSeo | null {
  return IDEA_LIST_SEO[slug] ?? null
}
