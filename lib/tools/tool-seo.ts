/**
 * SEO configuration for the free worksheet tools: per-tool metadata, FAQ
 * content (rendered + FAQPage JSON-LD), long-tail variation pages, and
 * JSON-LD builders. One place to keep every tool's search scaffolding.
 */

import type { WorksheetOptions } from '@/components/tools/WorksheetControls';

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolVariation {
  slug: string;
  /** Unique page title (title tag). */
  title: string;
  description: string;
  h1: string;
  /** ~200 words of unique intro copy above the tool. */
  intro: string[];
  /** Settings the variation pre-loads into the tool. */
  defaultOptions: Partial<WorksheetOptions>;
  /** Sight words only: the word list this variation preloads. */
  defaultListId?: string;
  /** Handwriting only: text the variation preloads into the textarea. */
  defaultText?: string;
}

export interface ToolSeoConfig {
  slug: string;
  name: string;
  title: string;
  description: string;
  h1: string;
  faqs: ToolFaqItem[];
  variations: ToolVariation[];
}

const SITE = 'https://anywherelearning.co';

// ─── Name tracing ────────────────────────────────────────────────────

export const NAME_TRACING: ToolSeoConfig = {
  slug: 'name-tracing',
  name: 'Name Tracing Worksheet Generator',
  title: 'Free Name Tracing Worksheet Generator | Custom Printable',
  description:
    "Type any name and get a free printable name tracing worksheet in seconds. Choose letter size, style, and practice rows. No signup required, made by a former teacher.",
  h1: 'Free Name Tracing Worksheet Generator',
  faqs: [
    {
      question: 'Is this name tracing generator really free?',
      answer:
        'Yes, completely. Type a name, adjust the options, and download your PDF. No account, no watermark, no catch. If you want, we can also email the worksheet to you along with a few of our favorite low-prep learning ideas, but the download never depends on it.',
    },
    {
      question: 'What age should a child start tracing their name?',
      answer:
        'Most children are ready to start name tracing somewhere between ages 3 and 5, but readiness matters more than age. Good signs: your child can hold a crayon with some control, shows interest in letters, and can focus for a few minutes at a time. Start with just the first name in large letters, and keep sessions short and happy.',
    },
    {
      question: 'Should my child learn uppercase or lowercase letters first?',
      answer:
        'For name writing, the convention that serves kids best long-term is a capital first letter followed by lowercase, exactly how their name will be written everywhere else. Many children find all-caps easier at first, and that is fine as a starting point, but switching to standard capitalization early saves re-learning later.',
    },
    {
      question: 'What paper and writing tools work best for tracing practice?',
      answer:
        'Regular printer paper is fine. For very young children, a fat crayon or thick triangular pencil is easier to control than a standard pencil. Some families slide the page into a plastic sleeve and use a dry-erase marker so one printout lasts for weeks of practice.',
    },
    {
      question: 'Why are there solid lines and a dashed middle line?',
      answer:
        'That is standard school ruling. The solid bottom line is the baseline the letters sit on, the solid top line caps tall letters, and the dashed midline shows where short letters like a, c, and e reach. Practicing with these guides from the start builds correct letter proportions without any extra explanation.',
    },
    {
      question: 'How many times a day should my child practice?',
      answer:
        'Little and often beats long sessions. One page, once a day, is plenty for a preschooler. If your child asks for more, wonderful. If they resist, shrink the task: one row instead of one page. The goal at this age is a child who feels good about writing their own name.',
    },
  ],
  variations: [
    {
      slug: 'preschool',
      title: 'Preschool Name Tracing Worksheets | Free Generator',
      description:
        'Make free preschool name tracing worksheets with extra-large letters and simple guide lines. Type a name, print, and practice. Built by a former teacher.',
      h1: 'Preschool Name Tracing Worksheets',
      intro: [
        "At preschool age, name tracing is less about handwriting and more about ownership. That string of letters is theirs, often the first word they recognize anywhere. This version of our generator is preset for preschool hands: extra-large letters, a solid example to look at, and plenty of room for wobbly attempts.",
        "A note from my classroom years: at this stage, celebrate every attempt. A backwards letter or a line that escapes the guides is completely normal at ages 3 and 4. Keep sessions to a few minutes, stop while it is still fun, and let your child watch you write their name too. Imitation is how this skill actually takes root.",
      ],
      defaultOptions: { letterSize: 'large', rowsPerLine: 4 },
    },
    {
      slug: 'kindergarten',
      title: 'Kindergarten Name Tracing Worksheets | Free Generator',
      description:
        'Free kindergarten name tracing worksheets with standard school guide lines. Custom name, medium letters, more practice rows. Print in seconds.',
      h1: 'Kindergarten Name Tracing Worksheets',
      intro: [
        "By kindergarten, most children can recognize their name and are ready to write it with correct letter formation and proportions. This version is preset for that stage: medium letters, standard school ruling with the dashed midline, and more practice rows per page.",
        "Two things matter most right now. First, correct capitalization: a capital first letter, lowercase for the rest, because that is how their name will appear on every list and label for the rest of their life. Second, letter proportions: short letters stop at the dashed line, tall letters reach the top. The guide lines do that teaching quietly, so you can just sit nearby and encourage.",
      ],
      defaultOptions: { letterSize: 'medium', rowsPerLine: 6 },
    },
  ],
};

// ─── Handwriting practice ────────────────────────────────────────────

export const HANDWRITING: ToolSeoConfig = {
  slug: 'handwriting',
  name: 'Handwriting Practice Generator',
  title: 'Free Handwriting Practice Sheet Generator | Custom Printable',
  description:
    'Type any words or sentences and get free printable handwriting practice sheets. Print, pre-cursive, or cursive, with school guide lines. No signup required.',
  h1: 'Free Handwriting Practice Generator',
  faqs: [
    {
      question: 'What can I put on a handwriting practice sheet?',
      answer:
        'Anything you type. Favorite words, a line from the book you are reading together, a poem, a Bible verse, silly sentences your child invents, or the letters they keep flipping. Each line you type becomes its own group of practice rows, so you can mix a tricky word with a fun sentence on the same page.',
    },
    {
      question: 'What is copywork, and how is it different from handwriting drills?',
      answer:
        'Copywork means practicing handwriting by copying a real sentence worth reading, rather than repeating isolated letters. Charlotte Mason homeschoolers have used it for a century because it teaches handwriting, spelling, punctuation, and good sentence rhythm all at once. Paste a sentence you love into the box above and you have a copywork page.',
    },
    {
      question: 'When should a child move from tracing to writing on their own?',
      answer:
        'When tracing looks easy and a little boring, they are ready. The "Trace, then write" format is built for exactly that moment: a few rows to trace, then one empty ruled row to try it alone. If the freehand row falls apart, no problem, go back to tracing for another week. This is not a one-way door.',
    },
    {
      question: 'Should I teach print or cursive first?',
      answer:
        'Most schools teach print first, then introduce cursive around age 7 or 8. Some families go straight to cursive, and there is real research suggesting cursive can be easier for children with dyslexia because the letters connect and are harder to reverse. Both are valid. This tool does print, pre-cursive with entry and exit strokes, and full joined cursive, so you can follow whichever path suits your child.',
    },
    {
      question: 'How long should a handwriting session be?',
      answer:
        'Shorter than you think. Five to ten minutes of focused practice beats a half hour of grinding, especially for children under 8. Handwriting is a fine motor skill, and tired hands build sloppy habits. Stop while it still looks good.',
    },
    {
      question: 'My child hates handwriting practice. What now?',
      answer:
        'Change what they are writing before you change how much. A child who groans at "the cat sat on the mat" will often happily write a note to their grandmother, a label for their Lego build, or a menu for a pretend restaurant. Put those words in the box. The practice is identical; the willingness is not.',
    },
  ],
  variations: [
    {
      slug: 'cursive',
      title: 'Free Cursive Handwriting Practice Sheets | Custom Generator',
      description:
        'Make free printable cursive handwriting practice sheets from any words you type. Joined letters, school guide lines, trace then write. No signup.',
      h1: 'Cursive Handwriting Practice Sheets',
      intro: [
        'Cursive is having a quiet comeback, and not only for nostalgia. Joined writing is usually faster than print once it is fluent, it makes letter reversals much harder, and a number of teachers find it helps children who struggle to keep letters separate on the page. This version of the generator is preset to joined cursive with standard school ruling.',
        'A practical way in: start with the letters that share a movement rather than marching through the alphabet. The c, a, d, g family all begin with the same curve. Then the climbers, l, h, b, k. Then the tricky ones, r, s, f, z, which almost every child finds fiddly. Type a handful of words that use the family you are practicing, print, and let them trace before writing alone. Keep the pencil moving without lifting it; that continuous motion is the whole point of cursive.',
      ],
      defaultOptions: { letterStyle: 'cursive', letterSize: 'medium', rowsPerLine: 3 },
    },
    {
      slug: 'copywork',
      title: 'Free Copywork Generator for Homeschool | Printable Sheets',
      description:
        'Turn any sentence into a printable copywork page. Charlotte Mason style handwriting practice with real sentences. Free, no signup, print in seconds.',
      h1: 'Copywork Generator',
      intro: [
        'Copywork is handwriting practice that is also worth reading. Instead of repeating a letter forty times, a child copies a real sentence: a line from the book you are reading aloud, a proverb, a bit of poetry, something true about the world. Charlotte Mason homeschoolers have leaned on it for over a century, and the reason it endures is efficiency. One well-chosen sentence teaches letter formation, spelling patterns, punctuation, and the rhythm of good writing at the same time.',
        'Choosing the sentence matters more than the length. Pick something short enough that your child finishes without their hand aching, and good enough that you would happily read it aloud twice. For a 6-year-old that might be five words. For a 10-year-old, a full sentence with a comma in it. Paste it into the box, choose "Trace, then write" if they still need the support, and let the sentence do the teaching.',
      ],
      defaultOptions: { letterSize: 'small', rowsPerLine: 2, format: 'trace-and-write' },
      defaultText: 'The world is full of magic things,\npatiently waiting for our senses\nto grow sharper.',
    },
  ],
};

// ─── Sight words ─────────────────────────────────────────────────────

export const SIGHT_WORDS: ToolSeoConfig = {
  slug: 'sight-words',
  name: 'Sight Words Worksheet Generator',
  title: 'Free Sight Words Worksheet Generator | Dolch & Fry Lists',
  description:
    'Free printable sight word worksheets from the full Dolch and Fry lists, or type your own words. Pick a grade level, print, and practice. No signup.',
  h1: 'Free Sight Words Worksheet Generator',
  faqs: [
    {
      question: 'What are sight words?',
      answer:
        'Sight words are the words that show up constantly in what children read, and many of them cannot be sounded out reliably. Words like said, come, one, and the break the usual phonics rules. Because they appear so often, recognizing them instantly frees up a child\'s attention for the words that genuinely need decoding, which is what makes reading start to flow.',
    },
    {
      question: 'What is the difference between the Dolch and Fry lists?',
      answer:
        'The Dolch list, from the 1930s, is 220 service words plus 95 nouns, grouped by grade from pre-primer through third grade. The Fry list is newer and ranked purely by how often each word appears in print, in blocks of 100. They overlap heavily. Dolch is the more common starting point in early years; Fry is handy when you want to work strictly in frequency order. Either is a fine choice, and this tool has both.',
    },
    {
      question: 'How many sight words should we work on at once?',
      answer:
        'Five to ten at a time for most children, and stay with that set until they are genuinely automatic rather than merely correct. A word your child gets right after a three-second pause is not learned yet. Delete the ones they already know from the word box above so the page only holds what is actually being worked on.',
    },
    {
      question: 'Is writing sight words better than flashcards?',
      answer:
        'They do different jobs, and together they work better than either alone. Flashcards build fast recognition; writing builds the motor memory and forces attention to the exact letter order, which is where words like was and saw or of and for come undone. A short written page plus a quick card review covers both sides.',
    },
    {
      question: 'What age or grade should sight word practice start?',
      answer:
        'Typically around kindergarten, once a child knows most letter sounds and can blend a few simple words. Starting sight words before any phonics foundation tends to turn into guessing from shape. If your child is not there yet, the pre-primer list will keep perfectly well for a few months.',
    },
  ],
  variations: [
    {
      slug: 'pre-k',
      title: 'Free Pre-K Sight Words Worksheets | Dolch Pre-Primer List',
      description:
        'Printable pre-K sight word worksheets using the 40-word Dolch pre-primer list. Large letters, tracing rows, free to print. Made by a former teacher.',
      h1: 'Pre-K Sight Words Worksheets',
      intro: [
        'The Dolch pre-primer list is where sight words begin: 40 words including a, and, I, see, and go. These are the words that will carry your child through their first real books, so they are worth genuine time. This page is preset with the full pre-primer list, large letters, and tracing rows.',
        'At this age, recognition comes before writing. Before printing anything, play with the words out loud: spot them on signs, in a favorite picture book, on the cereal box. Then use the page for the handful you are actively working on. Delete the rest from the word box; a 4-year-old faced with 40 words at once will simply close down, while five words they can conquer in a week builds the thing that actually matters, which is a child who believes they can read.',
      ],
      defaultOptions: { letterSize: 'large', rowsPerLine: 2 },
      defaultListId: 'dolch-pre-primer',
    },
    {
      slug: 'kindergarten',
      title: 'Free Kindergarten Sight Words Worksheets | Dolch Primer List',
      description:
        'Printable kindergarten sight word worksheets from the 52-word Dolch primer list. Choose letter size and practice rows, print free. No signup.',
      h1: 'Kindergarten Sight Words Worksheets',
      intro: [
        'The Dolch primer list is the kindergarten set: 52 words including all, are, came, please, and yes. By now most children know their letter sounds and can blend simple words, which is exactly the point at which sight words stop feeling like memorization and start filling real gaps in real sentences.',
        'Kindergarten is also when writing the words genuinely helps rather than frustrating. Writing forces attention to letter order, which is where the classic mix-ups live: was and saw, on and no, of and for. If your child keeps swapping a particular pair, put just those two on a page together and let them see the difference in their own handwriting. It works better than any amount of correcting.',
      ],
      defaultOptions: { letterSize: 'medium', rowsPerLine: 2 },
      defaultListId: 'dolch-primer',
    },
    {
      slug: 'grade-1',
      title: 'Free 1st Grade Sight Words Worksheets | Dolch First Grade List',
      description:
        'Printable first grade sight word worksheets from the Dolch first grade list. Trace or trace-then-write, choose your letter style, print free.',
      h1: 'First Grade Sight Words Worksheets',
      intro: [
        'The Dolch first grade list brings in words like after, every, think, and could. These are longer and more abstract than the earlier lists, and they are where many children first meet words they cannot picture. You can hold a cat in your mind; you cannot picture every. That abstractness is precisely why repetition and use in real sentences matter here.',
        'This is a good stage to switch to the "Trace, then write" format. A couple of traced rows to fix the shape, then one empty row where they write it from memory. That final unaided row is the one that tells you whether the word has actually landed, and it takes about ten extra seconds per word.',
      ],
      defaultOptions: { letterSize: 'medium', rowsPerLine: 2, format: 'trace-and-write' },
      defaultListId: 'dolch-grade-1',
    },
    {
      slug: 'grade-2',
      title: 'Free 2nd Grade Sight Words Worksheets | Dolch Second Grade List',
      description:
        'Printable second grade sight word worksheets from the Dolch second grade list. Smaller letters, write-from-memory rows, free to print.',
      h1: 'Second Grade Sight Words Worksheets',
      intro: [
        'The Dolch second grade list includes because, always, upon, and would. By second grade most children read reasonably fluently, so the job shifts from recognizing these words to spelling them correctly in their own writing. The gap between reading a word and spelling it is wider than most parents expect, and it is completely normal.',
        'Smaller letters make sense now, both because handwriting has matured and because it keeps the page from feeling babyish to a 7-year-old. If your child reads all of these easily but still misspells them in a story they wrote, that is exactly the right reason to use this page. Focus on the ones that show up misspelled in their actual writing, not the whole list.',
      ],
      defaultOptions: { letterSize: 'small', rowsPerLine: 2, format: 'trace-and-write' },
      defaultListId: 'dolch-grade-2',
    },
    {
      slug: 'grade-3',
      title: 'Free 3rd Grade Sight Words Worksheets | Dolch Third Grade List',
      description:
        'Printable third grade sight word worksheets from the Dolch third grade list. The last Dolch set: about, because, together, and more. Free to print.',
      h1: 'Third Grade Sight Words Worksheets',
      intro: [
        'The Dolch third grade list is the last one: about, better, carry, myself, together. Finish this and your child has the 220 words that make up roughly half of everything written in English, which is a genuinely remarkable milestone worth naming out loud when they get there.',
        'By third grade, a plain word list is rarely the most useful format. If a word is not sticking, the fix is usually context rather than repetition: have them write one sentence using it, out of their own head, about something they care about. That said, for the handful of stubborn spellings that keep reappearing wrong, a quick written page still earns its keep. Print it small, keep it short, and move on.',
      ],
      defaultOptions: { letterSize: 'small', rowsPerLine: 2, format: 'trace-and-write' },
      defaultListId: 'dolch-grade-3',
    },
  ],
};

// ─── Spelling ────────────────────────────────────────────────────────

export const SPELLING: ToolSeoConfig = {
  slug: 'spelling',
  name: 'Spelling List Worksheet Maker',
  title: 'Free Spelling Worksheet Maker | Custom Weekly Lists',
  description:
    "Type this week's spelling words and print practice sheets or a blank numbered test. Free custom spelling worksheets, no signup, made by a former teacher.",
  h1: 'Free Spelling Worksheet Maker',
  faqs: [
    {
      question: 'How do I use this for a weekly spelling routine?',
      answer:
        'A simple rhythm that works: on Monday print the trace format so the words go in through the hand as well as the eye. Midweek, switch to "Trace, then write" so they attempt each word unaided. On Friday print the blank test, read the words aloud, and let them write. Same tool, three formats, about two minutes of prep for the whole week.',
    },
    {
      question: 'What is the blank test format?',
      answer:
        'It is a numbered page of empty ruled rows with no words printed on it. You read each word aloud and your child writes it, exactly like a traditional Friday spelling test. The rows are numbered so you can call out "number four" and stay in sync without hovering over the page.',
    },
    {
      question: 'How many spelling words a week is reasonable?',
      answer:
        'Ten is the usual convention and works well for most children from about second grade. Five is plenty for a younger or struggling speller, and there is no prize for volume. Better ten words truly mastered than twenty half-learned that vanish by the following month.',
    },
    {
      question: 'Should spelling words be random or grouped by pattern?',
      answer:
        'Grouped by pattern, nearly always. A list built around one spelling pattern, all the -ight words, or the same vowel team, teaches a rule your child can apply to words that were never on any list. A random list only teaches those specific words. The exception is a personal list drawn from words your child actually misspells in their own writing, which is arguably the most valuable list of all.',
    },
    {
      question: 'My child aces the test on Friday and misspells the words a week later.',
      answer:
        'Extremely common, and it usually means the words were memorized rather than learned. Two things help. First, group the list by pattern so there is an underlying rule to hold on to. Second, revisit a mixed set of old words every few weeks rather than retiring a list the moment the test is done. Spaced repetition is unglamorous and it works.',
    },
  ],
  variations: [
    {
      slug: 'test',
      title: 'Free Printable Spelling Test Generator | Blank Numbered Sheets',
      description:
        'Make a free printable blank spelling test. Numbered ruled rows, your own word list, print in seconds. No signup, works on phones.',
      h1: 'Printable Spelling Test Generator',
      intro: [
        'This is the Friday version: a clean numbered page of empty ruled rows. You type this week\'s words so the count and the numbering come out right, but the words themselves never print. You read them aloud, your child writes them down, and the guide lines keep the handwriting tidy while they concentrate on the spelling.',
        'A small thing that makes the test less stressful: read each word, then use it in a sentence, then read it again. It gives a child a moment to picture the word and removes the guesswork on homophones like their and there. And if the test goes badly, treat it as information rather than a verdict. The words they missed are simply next week\'s list.',
      ],
      defaultOptions: { format: 'blank-test', letterSize: 'medium' },
    },
  ],
};

export const ALL_TOOLS: ToolSeoConfig[] = [NAME_TRACING, HANDWRITING, SIGHT_WORDS, SPELLING];

// ─── JSON-LD builders ────────────────────────────────────────────────

export function faqPageLd(faqs: ToolFaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function softwareApplicationLd(tool: ToolSeoConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    url: `${SITE}/tools/${tool.slug}`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: {
      '@type': 'Organization',
      name: 'Anywhere Learning',
      url: SITE,
    },
  };
}
