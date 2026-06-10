// ---------------------------------------------------------------------------
// Mapping from idea list slugs to their Vercel Blob PDF filenames.
// Both Full Color and B&W versions are available for each list.
// ---------------------------------------------------------------------------

const BLOB_BASE =
  'https://xkj3tzlgu6ylgllk.public.blob.vercel-storage.com/idea-lists'

/** Filename stems (without " - Full Color.pdf" / " - B&W.pdf" suffix) */
const SLUG_TO_FILENAME: Record<string, string> = {
  'nature-walk-ideas': 'List - 50 nature walk ideas for kids',
  'backyard-science-ideas': 'List - 15 backyard Science Experiment Ideas',
  'forest-school-ideas': 'List - 13 Forest School Activities',
  'seasonal-scavenger-ideas': 'List - 17 Seasonal Scavenger Hunt Ideas',
  'land-art-ideas': 'List - 14 Land Art & Nature Sculpture Ideas',
  'kitchen-ideas': 'List - 30 Kitchen Ideas for Kids',
  'life-skills-ideas': 'List - 28 Life Skills Ideas For Kids',
  'chores-by-age-ideas': 'List - 24 Age-Appropriate Chores by Age',
  'history-ideas': 'List - 11 Real-World History Ideas for Kids',
  'stem-ideas': 'List - 24 STEM & Engineering Ideas for Kids',
  'engineering-ideas': 'List - 16 Engineering Build Challenges for Kids',
  'creative-ideas': 'List - 26 Creative & Maker Ideas for Kids',
  'travel-ideas': 'List - 22 Travel & Worldschool Ideas for Kids',
  'ai-digital-ideas': 'List - 18 AI & Digital Literacy Ideas for Kids',
  'resilience-ideas': 'List - 12 Resilience-Building  Activities',
}

function blobUrl(filename: string): string {
  return `${BLOB_BASE}/${encodeURIComponent(filename)}`
}

export function getIdeaListPdfUrls(slug: string): {
  color: string
  bw: string
} | null {
  const stem = SLUG_TO_FILENAME[slug]
  if (!stem) return null
  return {
    color: blobUrl(`${stem} - Full Color.pdf`),
    bw: blobUrl(`${stem} - B&W.pdf`),
  }
}
