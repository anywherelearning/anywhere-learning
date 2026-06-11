// ---------------------------------------------------------------------------
// Per-list SEO content for /ideas/[slug] pages.
//
// Each entry gives a crawlable, keyword-aware layer on top of the raw checklist:
//   - seoTitle:        the <title> tag. Checklists lead with FORMAT intent
//                      (Checklist / Chart / Printable) so they never compete
//                      with the source blog post for its informational keyword.
//   - metaDescription: the SERP snippet (~150 chars). Unique opener per list,
//                      always says free + no signup (the real differentiator).
//   - howToUse:        a short unique paragraph of body text (parent-led framing)
//   - faqs:            4 Q&As targeting long-tail + "People Also Ask". First
//                      sentence of every answer stands alone (FAQPage schema
//                      ships answers to AI engines detached from questions).
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
    seoTitle: 'Nature Walk Checklist for Kids: 50 Printable Ideas (Free PDF)',
    metaDescription:
      'A printable nature walk checklist with 50 ideas for kids ages 2 to 12. No gear, no prep, no signup. Download the free PDF in color or black and white.',
    howToUse:
      'Pick two or three ideas before you head out the door, or let your kids choose. The point is not to do all 50 in one walk. You lead by noticing out loud, asking questions, and slowing down enough to follow what catches their attention. Tuck the printed checklist in your bag and check things off together as you go.',
    faqs: [
      {
        question: 'What age are these nature walk ideas for?',
        answer:
          'These nature walk ideas work for kids from toddler age up to about twelve. Younger kids love the collecting and observing ideas, while older kids dig into the challenges and measuring activities. You adjust the difficulty by how much you do for them versus how much you let them figure out.',
      },
      {
        question: 'Do I need any special equipment?',
        answer:
          'No equipment is needed for any of the 50 ideas. Every one uses what you already have or what you find outside. A few are more fun with a magnifying glass or a notebook, but none of them require buying anything.',
      },
      {
        question: 'Is the printable really free?',
        answer:
          'The nature walk checklist is completely free: free to read on this page and free to download as a PDF, with no email or signup required. You can print it in full color or in black and white, whichever suits your printer.',
      },
      {
        question: 'How many ideas should we do on one walk?',
        answer:
          'Two or three ideas per walk is the sweet spot for most families. The checklist is designed to last across many walks, not one. Some families pick a theme per outing, like all observing ideas one day and all collecting ideas the next.',
      },
    ],
  },

  'backyard-science-ideas': {
    seoTitle: 'Backyard Science Checklist: 15 Experiments to Print (Free)',
    metaDescription:
      'Print this backyard science checklist: 15 experiments for kids using water, dirt, jars, and sunlight. Free PDF, no signup, no kit. Real science at home.',
    howToUse:
      'These are hands-on science experiments you do alongside your kids, not demos they watch. Set up the materials together, ask what they think will happen before you start, and let them get it wrong. The mess and the surprise are where the learning lives. Work through one experiment at a time and let the questions pile up.',
    faqs: [
      {
        question: 'What supplies do I need for these experiments?',
        answer:
          'All 15 experiments use everyday things from around the house: water, soil, jars, food coloring, and a sunny spot. Each experiment lists what it uses, and none of them need a science kit or special chemicals.',
      },
      {
        question: 'What age group is this best for?',
        answer:
          'These backyard science experiments suit kids roughly five to eleven. Younger kids enjoy watching the changes and helping set up, while older kids can run the experiment themselves and start asking why it happened.',
      },
      {
        question: 'How long does each experiment take?',
        answer:
          'Most of the experiments take fifteen to thirty minutes to set up, though a few, like growing plants or watching weather, play out over several days. They are easy to fit into a normal afternoon.',
      },
      {
        question: 'Is the experiment checklist free to download?',
        answer:
          'The backyard science checklist is free, with no email or signup required. Download the PDF in full color or black and white, print it, and cross off experiments as your kids work through them.',
      },
    ],
  },

  'forest-school-ideas': {
    seoTitle: 'Forest School Checklist: 13 Activities to Print (Free PDF)',
    metaDescription:
      'A printable forest school checklist with 13 activities for any patch of trees. Free PDF, no signup. Den building, mud paint, sit spots, and safe risk.',
    howToUse:
      'A park, a treeline, or a backyard with a few trees is plenty for every activity on this checklist. Your job is to give your kids time, a loose challenge, and the freedom to take small risks while you stay close. Pick one activity per visit and let them lead. The repetition is the point: the same patch of woods teaches something new every season.',
    faqs: [
      {
        question: 'Do I need forest school training to use these?',
        answer:
          'No training or certification is needed for any of these 13 activities. They are written for regular parents and focus on building, observing, and safe outdoor risk, all things you can guide without any special qualification.',
      },
      {
        question: 'What if we do not live near a forest?',
        answer:
          'Any green space works for forest school activities. A neighborhood park, a few backyard trees, or a walking trail gives your kids everything they need for these activities.',
      },
      {
        question: 'Are these activities safe for younger children?',
        answer:
          'These forest school activities are safe for young kids with you nearby. The risk-and-challenge ideas are about letting kids test their limits in a way you supervise, like climbing or using simple tools, which builds confidence and judgment.',
      },
      {
        question: 'Is the forest school checklist free?',
        answer:
          'The checklist is free to read, print, and keep, with no signup and no email required. Download the PDF in color or black and white and bring it to the woods.',
      },
    ],
  },

  'seasonal-scavenger-ideas': {
    seoTitle: 'Seasonal Scavenger Hunt Checklist: 17 Nature Finds for Kids',
    metaDescription:
      'One printable scavenger hunt checklist per season: spring, summer, autumn, winter. 17 nature finds for kids ages 3 to 10. Free, no signup needed.',
    howToUse:
      'There is one hunt for each season, so this checklist works all year. Bring the season you are in, head outside, and let your kids search while you point out the things they walk right past. It turns a regular walk into a treasure hunt and gets everyone noticing how nature changes month to month.',
    faqs: [
      {
        question: 'How is this scavenger hunt different by season?',
        answer:
          'Each season has its own scavenger hunt list built around what is actually happening outside at that time, like buds and puddles in spring or animal tracks and frost in winter. You use the one that matches the time of year.',
      },
      {
        question: 'What age is this scavenger hunt for?',
        answer:
          'These scavenger hunts work for kids roughly three to ten. Little ones love the hunt itself, and older kids can go deeper by recording or sketching what they find.',
      },
      {
        question: 'Can I use this on a regular walk?',
        answer:
          'A regular walk is exactly where this checklist shines. Tuck the printed list in your pocket on any walk and check items off as you spot them. No special trip required.',
      },
      {
        question: 'Is the scavenger hunt printable free?',
        answer:
          'All four seasonal hunts are free in one printable checklist, no email or signup required. Download the PDF in full color or black and white and print the season you need.',
      },
    ],
  },

  'land-art-ideas': {
    seoTitle: '14 Land Art & Nature Sculpture Ideas for Kids (Printable)',
    metaDescription:
      'Arrange, stack, and weave found materials into outdoor art: 14 land art ideas for kids on one free printable checklist. No supplies to buy, no signup.',
    howToUse:
      'Land art uses what is already on the ground: leaves, stones, sticks, petals. Head outside together and start arranging, and your kids will take it from there. You can join in by building your own piece beside theirs. Keep the checklist handy for when they need a fresh starting point, then let their ideas run.',
    faqs: [
      {
        question: 'What materials do we need for land art?',
        answer:
          'Land art needs only what you find outside. Stones, leaves, sticks, flowers, and pinecones are the whole supply list. Nothing gets bought and nothing comes home, which is part of the appeal.',
      },
      {
        question: 'What age is land art good for?',
        answer:
          'Land art suits all ages, including toddlers. Little kids arrange and stack, while older kids take on the weaving and balancing challenges that need more patience and planning.',
      },
      {
        question: 'Is land art messy?',
        answer:
          'Land art is one of the tidiest creative activities there is. Everything stays outside and goes back to nature, so there is no cleanup when you are done.',
      },
      {
        question: 'Is the land art checklist free to print?',
        answer:
          'The 14-idea land art checklist is free to download and print, with no email or signup required. Choose the full color or black and white PDF, whichever suits your printer.',
      },
    ],
  },

  'kitchen-ideas': {
    seoTitle: '30 Cooking Activities for Kids That Sneak In Real Math (Free)',
    metaDescription:
      '30 cooking activities for kids that teach fractions, measuring, and budgeting at meals you already make. Free printable checklist, no signup.',
    howToUse:
      'Cooking is full of math and life skills hiding in plain sight. Pull your kids up to the counter and hand them a real job: measuring, counting, doubling a recipe, or pricing the ingredients. You guide and they do the work. Weave a few ideas into meals you are already making and the learning takes care of itself.',
    faqs: [
      {
        question: 'What can kids actually learn from cooking?',
        answer:
          'Cooking teaches a surprising amount of real math and life skill. Measuring teaches fractions, doubling a recipe is multiplication, and planning a meal on a budget is real-world math. These 30 activities pull all of that out of an ordinary cooking session.',
      },
      {
        question: 'What age are these kitchen activities for?',
        answer:
          'These cooking activities span toddler to teen. Young kids count and pour, while older kids handle fractions, budgeting, and cooking a dish start to finish. You match the job to what your child can handle.',
      },
      {
        question: 'Do I need special ingredients or tools?',
        answer:
          'No special ingredients or tools are needed. These activities work with whatever you are already cooking and the tools in your kitchen. The point is to add learning to normal meals, not to buy anything extra.',
      },
      {
        question: 'Is the cooking checklist really free?',
        answer:
          'The 30-activity checklist is free with no email or signup required. Download the PDF in color or black and white, stick it on the fridge, and check ideas off at dinner time.',
      },
    ],
  },

  'life-skills-ideas': {
    seoTitle: 'Life Skills Checklist for Kids: 28 Printable Skills by Area',
    metaDescription:
      'A printable life skills checklist for kids: 28 skills across money, independence, home, and thinking. Free PDF, no signup. Build one skill at a time.',
    howToUse:
      'Start small and hand over real responsibility a little at a time, then resist the urge to step in and fix it. Whether it is the grocery run, the laundry, or a phone call, doing the real thing with you nearby beats any lesson about it. Work through the checklist slowly over months, not days, and let your kids surprise you with what they can handle.',
    faqs: [
      {
        question: 'What life skills should kids learn before they grow up?',
        answer:
          'Kids should learn life skills in four areas before they leave home: managing money, handling tasks independently, running a household, and thinking through problems. This free 28-item checklist covers all four and builds a kid who can function on their own, which is the real goal.',
      },
      {
        question: 'At what age should kids start learning life skills?',
        answer:
          'Kids can start learning life skills earlier than most parents think, beginning with simple independence tasks as toddlers. The skills build from there, and the checklist is meant to be worked through gradually as your child is ready.',
      },
      {
        question: 'How do I teach life skills without it feeling like a lecture?',
        answer:
          'The way to teach a life skill is to hand over the real task instead of talking about it. Let them make the grocery list, handle the cash, or solve the problem themselves. Doing it for real, with you nearby, beats any lesson.',
      },
      {
        question: 'Is the life skills checklist free to download?',
        answer:
          'The 28-skill checklist is free, no email or signup required. Print the color or black and white PDF and check skills off as your kids earn them, at whatever pace fits your family.',
      },
    ],
  },

  'chores-by-age-ideas': {
    seoTitle: 'Chores for Kids by Age: 2 to 12+ (Free Printable Chore Chart)',
    metaDescription:
      '24 age-appropriate chores split into ages 2-5, 6-8, 9-11, and 12+. Free printable chore chart, no signup. Post it once and stop the daily reminding.',
    howToUse:
      'Chores are not punishment. They are how kids learn they are capable of real contribution to the family. Find your child age group in the chart, pick a couple of chores, and teach them properly once instead of redoing it for them. Post the chart where everyone can see who does what, and let the chart do the reminding.',
    faqs: [
      {
        question: 'What chores are appropriate for each age?',
        answer:
          'Age-appropriate chores fall into four bands on this chart: ages two to five, six to eight, nine to eleven, and twelve and up. Each band lists chores kids can genuinely handle at that stage, from putting away toys to cooking a meal.',
      },
      {
        question: 'Should kids be paid for chores?',
        answer:
          'Whether kids get paid for chores is a family call. Many parents keep basic chores unpaid as part of belonging to the household, and offer pay for bigger extra jobs. The chart works either way.',
      },
      {
        question: 'How do I get my kids to actually do their chores?',
        answer:
          'Kids do their chores when the chore is taught properly the first time, the expectations are clear, and they own it without hovering. A posted chart removes the daily reminding and makes the responsibility theirs.',
      },
      {
        question: 'Is the chore chart really free?',
        answer:
          'The chore chart is free to download with no email or signup required. Print the full color or black and white PDF, stick it on the fridge, and update it as your kids grow into the next age band.',
      },
    ],
  },

  'history-ideas': {
    seoTitle: 'Family History Activities for Kids: 11 Printable Ideas',
    metaDescription:
      '11 printable family history activities for kids: interview grandparents, build timelines, trace your food. Free PDF, no signup, ages 6 to 12.',
    howToUse:
      'History sticks when it is personal. Instead of dates to memorize, these ideas connect your kids to the story your own family carries and the buildings you walk past every day. Sit down and explore one together, whether that is interviewing a grandparent or tracing where a favorite food came from. Pick whatever fits your family this week.',
    faqs: [
      {
        question: 'How do I make history interesting for kids?',
        answer:
          'History gets interesting for kids when it becomes personal. These activities start with your own family, your town, and the food on your table, so history becomes a real story your kids are part of instead of a list of dates.',
      },
      {
        question: 'What age are these history activities for?',
        answer:
          'These family history activities suit kids roughly ages six to twelve. Younger kids enjoy interviewing relatives and looking at old photos, while older kids can build timelines and connect family stories to bigger world events.',
      },
      {
        question: 'Do I need to know a lot of history myself?',
        answer:
          'You do not need any history knowledge to use these activities. The whole point is to discover it together. You and your kids find the answers as you go, which is more fun and more memorable than any lecture.',
      },
      {
        question: 'Is the family history checklist free?',
        answer:
          'The 11-activity checklist is free with no signup or email required. Download the PDF in color or black and white and start with the grandparent interview, the one families say they wish they had done sooner.',
      },
    ],
  },

  'stem-ideas': {
    seoTitle: 'STEM Activities Checklist: 24 No-Kit Builds (Free PDF)',
    metaDescription:
      'A printable STEM checklist with 24 builds and experiments using cardboard, tape, and the recycling bin. Free PDF, no signup, ages 5 to 12.',
    howToUse:
      'STEM does not need a kit or a screen. Hand your kids cardboard, tape, and a clear challenge, then step back and let them think it through. When something fails, ask what they would change instead of fixing it for them. Pick a build that uses whatever is in your recycling bin today and let the engineering happen.',
    faqs: [
      {
        question: 'What is a good STEM activity to do at home?',
        answer:
          'A good STEM activity at home hands kids a real problem and lets them build a solution. This checklist has twenty-four, from cardboard structures to backyard experiments, all using materials you already have at home.',
      },
      {
        question: 'Do STEM activities require special kits?',
        answer:
          'STEM activities do not require kits. Every idea here uses household items: cardboard, tape, kitchen supplies, and things from the recycling bin. The thinking matters more than the materials.',
      },
      {
        question: 'What age are these STEM activities for?',
        answer:
          'These STEM activities work for kids roughly ages five to twelve. You make a build easier or harder by how much you guide versus how much you let your child problem-solve on their own.',
      },
      {
        question: 'Is the STEM checklist free to download?',
        answer:
          'The 24-build STEM checklist is free, no email or signup required. Print the color or black and white PDF and keep it near the recycling bin, where most of the materials come from anyway.',
      },
    ],
  },

  'engineering-ideas': {
    seoTitle: 'Engineering Challenge Checklist: 16 Builds for Kids (Free)',
    metaDescription:
      '16 engineering build challenges for kids on one printable checklist: ziplines, drawbridges, water filters. Household materials, free PDF, no signup.',
    howToUse:
      'Give them the materials, give them the challenge, and then give them space. Engineering is learned by trying, failing, and trying again, so the best thing you can do is not rescue them too fast. Build alongside them if they want company. Start with a quick build before working up to the bigger projects.',
    faqs: [
      {
        question: 'What is a simple engineering project for kids?',
        answer:
          'A simple engineering project for kids is a quick build with a clear test, like a paper column that holds a book or a balloon-powered car. This checklist is sorted from fast builds to bigger projects, so you can match the challenge to your time and your child.',
      },
      {
        question: 'What materials do engineering challenges need?',
        answer:
          'These engineering challenges need mostly cardboard, tape, paper, string, and recycling-bin finds. They are designed around cheap, everyday materials so kids can build, wreck, and rebuild without worrying about supplies.',
      },
      {
        question: 'How does building help my child learn?',
        answer:
          'Building teaches real problem-solving. When a structure fails, your child has to figure out why and try a new approach, which is exactly how engineers think and a skill that carries far beyond the project.',
      },
      {
        question: 'Is the engineering checklist free?',
        answer:
          'The 16-challenge checklist is free to download and print, no email or signup required. Pick the color or black and white PDF and let your kids cross off builds as they conquer them.',
      },
    ],
  },

  'creative-ideas': {
    seoTitle: '26 Creative Activities for Kids (Free Printable List)',
    metaDescription:
      'Making, storytelling, and inventing: 26 creative activities for kids beyond art supplies, on one free printable checklist. No signup, toddler to teen.',
    howToUse:
      'Offer a starting point, then let your kids steer and resist tidying up their ideas. A cardboard box, a what-if question, or a broken thing to fix is all the prompt most kids need. Pull one idea out the next time you hear the words I am bored, and keep the checklist somewhere the kids can raid it themselves.',
    faqs: [
      {
        question: 'What counts as a creative activity?',
        answer:
          'Creative activities cover far more than crafts. This list spans making things, telling stories, and inventing solutions, because real creativity is about original thinking, not just art projects.',
      },
      {
        question: 'My child says they are not creative. Will this help?',
        answer:
          'Kids who say they are not creative usually just have not practiced yet. Creativity is a muscle, not a talent some kids are born with. These open-ended ideas give every kid a low-pressure way to make and invent, and it grows with practice.',
      },
      {
        question: 'What age are these creative activities for?',
        answer:
          'These creative activities span toddler to teen. The making ideas suit younger kids, while the storytelling and inventing challenges give older kids room to go as deep as they want.',
      },
      {
        question: 'Is the creative checklist free to print?',
        answer:
          'The 26-activity checklist is free with no email or signup required. Download the full color or black and white PDF and post it where bored kids will find it.',
      },
    ],
  },

  'travel-ideas': {
    seoTitle: '22 Travel Activities for Kids: Road Trips to Abroad (Free PDF)',
    metaDescription:
      '22 travel and worldschool activities that turn any road trip, city day, or trip abroad into real learning. Free printable list, no signup needed.',
    howToUse:
      'These ideas work on a road trip, a day in your own city, or a trip across the globe. Let your kids explore, document what they notice, and dig into one thing that grabs them. Bring the checklist along wherever you are headed next, and let the place itself set the lesson plan.',
    faqs: [
      {
        question: 'What is worldschooling?',
        answer:
          'Worldschooling is using travel and the real world as the classroom. It does not require going far. These activities turn exploring, documenting, and digging into local culture into genuine learning, whether you are home or away.',
      },
      {
        question: 'Do we have to travel far to use these ideas?',
        answer:
          'These travel activities work without going far at all. Your own town, a weekend road trip, or overseas all work. The skill is learning to explore wherever you are, and that starts close to home.',
      },
      {
        question: 'What age are these travel activities for?',
        answer:
          'These travel activities work for kids roughly ages five to fourteen. Younger kids focus on exploring and noticing, while older kids take on the document-and-go-deep activities that build research and observation skills.',
      },
      {
        question: 'Is the travel checklist free?',
        answer:
          'The 22-activity travel checklist is free to download, no email or signup required. Print the color or black and white PDF and pack it with the snacks.',
      },
    ],
  },

  'ai-digital-ideas': {
    seoTitle: '18 AI & Digital Literacy Activities for Kids (Free Printable)',
    metaDescription:
      'Help kids understand AI, use it wisely, and question what they see online: 18 activities on a free printable checklist. No signup, ages 8 and up.',
    howToUse:
      'These ideas help your kids understand how AI works, use it as a tool for creating, and question what they see online. Sit beside them for the first few and talk through what comes up. Use the checklist to make tech a topic you explore together, not a battle you fight at bedtime.',
    faqs: [
      {
        question: 'How do I teach my kids about AI?',
        answer:
          'Teaching kids about AI starts with exploring it together. This checklist has activities that show how AI works, how to use it wisely, and how to question its answers, all framed so a parent can guide without being a tech expert.',
      },
      {
        question: 'What age is digital literacy appropriate for?',
        answer:
          'Digital literacy activities suit kids roughly ages eight and up, when they start using devices more independently. The media literacy ideas are valuable right through the teen years.',
      },
      {
        question: 'Will this just mean more screen time?',
        answer:
          'These activities change the kind of screen time rather than adding more. Instead of passive scrolling, devices become tools for thinking, making, and questioning, which is the heart of real digital literacy.',
      },
      {
        question: 'Is the AI literacy checklist free?',
        answer:
          'The 18-activity checklist is free with no email or signup required. Download the PDF in color or black and white, and work through the understand-AI activities first.',
      },
    ],
  },

  'resilience-ideas': {
    seoTitle: 'Resilience Checklist for Kids: 12 Printable Challenges',
    metaDescription:
      'A printable resilience checklist for kids ages 4 to 12: safe failure, bouncing back, and perspective practice. Free PDF, no email, no signup.',
    howToUse:
      'Your job here is sometimes to let them struggle. Give a challenge slightly above their level, then hold back from rescuing. Talk through what they would try next instead of what went wrong. Weave these moments into everyday life one at a time, and the bouncing back starts to come built in.',
    faqs: [
      {
        question: 'How do you build resilience in a child?',
        answer:
          'Resilience is built through practice with safe failure. These activities give kids manageable challenges and let them work through frustration, which is how resilience actually grows, not by protecting them from every struggle.',
      },
      {
        question: 'What age are these resilience activities for?',
        answer:
          'These resilience activities work across childhood, roughly ages four to twelve. You adjust the challenge to your child, making it just hard enough that they have to push through but not so hard they give up.',
      },
      {
        question: 'Is it okay to let my child fail on purpose?',
        answer:
          'Letting a child fail safely is one of the best teachers there is, within reason. The goal is not to make things hard for the sake of it, but to let kids learn they can recover and try again.',
      },
      {
        question: 'Is the resilience checklist free to download?',
        answer:
          'The 12-challenge resilience checklist is free, no email or signup required. Print the color or black and white PDF and pick one challenge to try this week.',
      },
    ],
  },
}

export function getIdeaListSeo(slug: string): IdeaListSeo | null {
  return IDEA_LIST_SEO[slug] ?? null
}
