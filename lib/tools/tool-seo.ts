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

export const ALL_TOOLS: ToolSeoConfig[] = [NAME_TRACING];

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
