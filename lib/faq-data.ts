/**
 * Shared FAQ data used by both the homepage and the standalone /faq page.
 * Organized into the four sections shown on /faq:
 *   1. Family fit
 *   2. Membership
 *   3. Using the activities
 *   4. Buying & refunds
 */

export interface FAQItem {
  question: string;
  answer: string;
}

// ─── 1. Is this for my family? ──────────────────────────────────────

export const familyFaqItems: FAQItem[] = [
  {
    question: 'Is this only for homeschoolers?',
    answer:
      "No, and that's the most common question I get. Anywhere Learning is built for any parent who wants more real-world learning in their family's days. School families, homeschoolers, worldschoolers, after-schoolers. Most of our members actually have kids in school. The activities work in the rhythm you already have, whether that's a Saturday morning or a stretch after dinner.",
  },
  {
    question: 'My kids are in school. Will they actually do these?',
    answer:
      "Kids who have homework, screens, and a busy week often need more real-world doing, not less. The activities don't feel like school. They're not worksheets, not lessons, not 'more work.' They're things kids actually want to do because they involve real tasks: cooking a meal, planning a trip, building something, running a small business. Most school families fit them into weekends, after-dinner stretches, or summer afternoons.",
  },
  {
    question: 'What ages does this work for?',
    answer:
      'Designed for ages 6 to 14. Every activity includes three skill levels: Explore for getting started, Develop for building confidence, Extend for going deeper. The levels are about where your kid is with that specific skill, not their age. Siblings can do the same activity side by side at different levels without anyone feeling overwhelmed or under-challenged.',
  },
  {
    question: "We're already doing a lot. Do we really need more activities?",
    answer:
      "Maybe not. If your kids are already cooking dinners, managing their own time, building things, and planning their own weekends, you're doing great. Anywhere Learning is for the families where life skills haven't quite fit in yet. Where the days fill up with school, screens, and 'what now?' and there's a quiet feeling that something's missing.",
  },
  {
    question: "What if I'm not crafty, outdoorsy, or patient?",
    answer:
      "Good. These are written for the parent who's tired, who doesn't own a glue gun, who isn't setting up a sensory bin at 7am. Activities work in kitchens, living rooms, and on errands. If you can boil water and sit at the kitchen table for fifteen minutes, you're qualified.",
  },
  {
    question: 'Do these work with Charlotte Mason, Montessori, or unschooling approaches?',
    answer:
      "They slot in naturally. The activities are child-led, curiosity-driven, and rooted in real-world experience, which fits Charlotte Mason, Montessori, unschooling, eclectic, and worldschool philosophies. They're not a curriculum, so they don't compete with the one you've chosen.",
  },
  {
    question: "Will these work if we're travelling or worldschooling?",
    answer:
      "They're designed for exactly that. Many activities use whatever environment you're in: a kitchen, a park, a hotel room, a new city. Open on any device, no printing needed for most, no bulky materials.",
  },
];

// ─── 2. About the membership ────────────────────────────────────────

export const membershipFaqItems: FAQItem[] = [
  {
    question: "What's the difference between buying activities individually and joining the membership?",
    answer:
      "Individual activities are $5.99 each. Bundles run around $44.99 (about 25% off). The membership is $99 a year for unlimited access to the entire library: 100+ activities, all eight categories, plus new ones added every quarter. If you'd buy more than two bundles in a year, the membership is the obvious choice.",
  },
  {
    question: "What's 'founding member' pricing?",
    answer:
      "The first 100 members pay $99/year, locked in for life. After the 100th founder joins, the price goes up to $149/year for new members. Your $99 rate stays the same forever, as long as you stay subscribed. Early members shape what this becomes, and I'd rather have 100 families actually using and shaping it than charge full price to a smaller group.",
  },
  {
    question: 'Does my founder rate really lock in for life?',
    answer:
      "Yes. As long as you stay subscribed, your annual renewal stays at $99, even when new members are paying $149 or more. If you cancel and rejoin later, you rejoin at the current public price, so it's worth holding onto.",
  },
  {
    question: 'How do I access the activities?',
    answer:
      "After joining, you get an email with login details. The full library lives in your member dashboard. View on any device: phone, tablet, or laptop. No printing required for most activities. Most parents open them on their phone right when they're about to do them with the kids.",
  },
  {
    question: 'How often are new activities added?',
    answer:
      'Quarterly. New activities across all eight categories, added to the library every quarter. Members get them automatically. No extra cost, no announcements you have to act on.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      "Yes. One click in your account, or one email to me. No phone tree, no retention specialist trying to talk you out of it. You keep access through the end of your paid year, and you won't be re-billed. If you're within 14 days of joining, you get a full refund, no questions asked.",
  },
  {
    question: 'What happens after I cancel?',
    answer:
      "You keep access until the end of your paid year, then your membership ends. You won't be billed again. If you rejoin later, you pay whatever the public price is at that point (currently $149 for non-founders).",
  },
  {
    question: 'Do you offer a free trial?',
    answer:
      "Not formally, but the 14-day money-back guarantee acts like one. Join, try everything, and if it's not for you, email within 14 days for a full refund. No questions, no friction. The free starter guide is also available with no payment if you'd like to try a few activities before deciding.",
  },
];

// ─── 3. Using the activities ────────────────────────────────────────

export const usingFaqItems: FAQItem[] = [
  {
    question: 'How much time does each activity take?',
    answer:
      "It depends on the activity and how into it your kid gets. Some are quick afternoon things, others can fill a whole rainy Saturday. Parent prep is intentionally minimal: read through the guide, grab whatever's already in the kitchen drawer, and you're ready.",
  },
  {
    question: 'Do I need special materials or supplies?',
    answer:
      "Mostly no. Each activity lists exactly what's needed at the top, usually household items or things you already have. I don't write activities that require a trip to a craft store. If something needs a specific item, it's named clearly so you can decide before starting.",
  },
  {
    question: 'How is this different from free printables I can find online?',
    answer:
      'Pinterest and free printables give you ideas. Anywhere Learning gives you step-by-step guides: low-prep, teacher-designed, with three skill levels per activity. No fill-in-the-blanks, no busywork, no glittery craft that lives on the fridge for a month then goes in the bin. Just real things to do, with real outcomes.',
  },
  {
    question: 'Can I reuse activities?',
    answer:
      "Yes. Every activity is designed to work differently each time. As your kids build the skill, they engage at a deeper level. The three levels (Explore, Develop, Extend) mean the same activity looks different the second or third time around. One activity often becomes a family ritual.",
  },
  {
    question: "Do these count as 'real' learning?",
    answer:
      "Every activity quietly weaves in real skills: math, literacy, critical thinking, science, communication, through hands-on experience. Kids learn by doing, not by filling in blanks. The skills are real, the learning sticks, and most of the time your kids don't even realize they're learning.",
  },
  {
    question: 'How do I get my kids to actually do them?',
    answer:
      "Honestly, the activities sell themselves once a kid is in one. The hard part is the first ten minutes, getting them off whatever screen they're on. Most parents find that picking activities that match what a kid already cares about (food, money, building, animals, technology) gets the first try. After that, it tends to compound.",
  },
  {
    question: 'Are screens involved?',
    answer:
      "Most activities are screen-free or screen-optional. The AI & Digital category uses screens on purpose, because learning to use technology thoughtfully is one of the most important skills kids today need. In other categories, a screen is sometimes part of doing the project itself (designing a poster, recording a pitch, mapping a trip) but never required if you'd rather do it offline. Either way, the activity is designed for parent and kid to do together, side by side.",
  },
];

// ─── 4. Buying & refunds ────────────────────────────────────────────

export const buyingFaqItems: FAQItem[] = [
  {
    question: "What's your refund policy?",
    answer:
      "For the membership: 14-day money-back guarantee. Email within 14 days of joining for a full refund, no questions asked. For individual activity purchases: since they're instant digital downloads, we offer a 48-hour refund window from time of purchase if something doesn't work as expected.",
  },
  {
    question: 'How do I pay?',
    answer:
      "Checkout is handled by Stripe. You'll see whatever payment methods are available on your device and in your region: card, Apple Pay, Google Pay, and PayPal where supported. Annual membership is one charge of $99 (or $149 after founder pricing ends). Individual activities are one-time purchases.",
  },
  {
    question: 'Do you offer monthly billing?',
    answer:
      "Not currently. The membership is annual only, to keep things simple. $99 once, then you're a member for a year, and renewal happens once a year unless you cancel.",
  },
  {
    question: 'Will my membership auto-renew?',
    answer:
      "Yes, it auto-renews annually at the rate you signed up at (founders renew at $99, after-founders at $149). I send a reminder email 14 days before renewal, so there are no surprises. You can cancel anytime from your account.",
  },
  {
    question: 'Will my price go up at renewal?',
    answer:
      "If you joined as a founding member (first 100), your $99/year is locked in for life. If you joined after that at $149, your price stays at $149 for renewal. I'd give you 60 days' notice if I ever changed pricing for existing members, and I have no plans to.",
  },
  {
    question: 'Do you offer bundle discounts for individual purchases?',
    answer:
      "Yes. Bundles save you about 25% compared to buying individual guides. That said: if you'd buy three or more bundles in a year, the membership is the better deal. It's $99 versus about $135 for three bundles.",
  },
  {
    question: 'Is there a multi-family or co-op rate?',
    answer:
      "Not formally yet. If you're a co-op, micro-school, or shared-cost group, email me at info@anywherelearning.co and we'll figure something out.",
  },
  {
    question: 'How do I access my individual purchases?',
    answer:
      'After checkout, your guides are available instantly in your account under Downloads. You can re-download them anytime, on any device. Nothing expires.',
  },
];

// ─── Curated subset for the homepage (highest-impact, broadest concerns) ─

export const coreFaqItems: FAQItem[] = [
  familyFaqItems[0], // Is this only for homeschoolers?
  familyFaqItems[2], // What ages does this work for?
  usingFaqItems[0], // How much time does each activity take?
  usingFaqItems[2], // How is this different from free printables?
  buyingFaqItems[0], // What's your refund policy?
];

// ─── Legacy aliases (kept so existing imports don't break) ──────────

export const homeschoolFaqItems: FAQItem[] = familyFaqItems;
export const aboutFaqItems: FAQItem[] = usingFaqItems;
export const purchasingFaqItems: FAQItem[] = buyingFaqItems;

// ─── Combined export (used for FAQPage JSON-LD + llms-full.txt) ─────

export const allFaqItems: FAQItem[] = [
  ...familyFaqItems,
  ...membershipFaqItems,
  ...usingFaqItems,
  ...buyingFaqItems,
];
