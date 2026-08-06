/**
 * Sight word reference data for the free /tools worksheet generators.
 *
 * Two standard published lists:
 * - Dolch: the 220 service words plus 95 nouns compiled by Edward William Dolch (1936/1948).
 * - Fry: the "Instant Words" ranked by frequency by Edward Fry. Only the first 300 are here.
 *
 * Both are long-standing public domain / freely used educational reference data.
 *
 * Conventions:
 * - Every word is lowercase, including proper nouns (america, indian, christmas,
 *   santa claus) and the pronoun "i". Lowercase is the standard convention for
 *   these lists and is what handwriting practice sheets need.
 * - Fry lists are in frequency rank order, not alphabetical.
 * - Dolch lists are alphabetical, as published.
 * - A word may appear in more than one list (Dolch and Fry overlap heavily),
 *   but never twice within the same list.
 */

export interface WordList {
  id: string;
  label: string;
  /**
   * Rough grade band for UI grouping, e.g. 'Pre-K', 'Kindergarten', 'Grade 1',
   * 'Grade 2', 'Grade 3'
   */
  grade: string;
  words: string[];
}

// ─── Dolch sight words ───────────────────────────────────────────────

export const DOLCH_LISTS: WordList[] = [
  {
    id: 'dolch-pre-primer',
    label: 'Dolch Pre-Primer',
    grade: 'Pre-K',
    words: [
      'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
      'funny', 'go', 'help', 'here', 'i', 'in', 'is', 'it', 'jump', 'little',
      'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
      'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you',
    ],
  },
  {
    id: 'dolch-primer',
    label: 'Dolch Primer',
    grade: 'Kindergarten',
    words: [
      'all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came',
      'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
      'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran',
      'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
      'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will',
      'with', 'yes',
    ],
  },
  {
    id: 'dolch-grade-1',
    label: 'Dolch First Grade',
    grade: 'Grade 1',
    words: [
      'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly',
      'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just',
      'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put',
      'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk',
      'were', 'when',
    ],
  },
  {
    id: 'dolch-grade-2',
    label: 'Dolch Second Grade',
    grade: 'Grade 2',
    words: [
      'always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call',
      'cold', 'does', "don't", 'fast', 'first', 'five', 'found', 'gave', 'goes',
      'green', 'its', 'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing',
      'sit', 'sleep', 'tell', 'their', 'these', 'those', 'upon', 'us', 'use', 'very',
      'wash', 'which', 'why', 'wish', 'work', 'would', 'write', 'your',
    ],
  },
  {
    id: 'dolch-grade-3',
    label: 'Dolch Third Grade',
    grade: 'Grade 3',
    words: [
      'about', 'better', 'bring', 'carry', 'clean', 'cut', 'done', 'draw', 'drink',
      'eight', 'fall', 'far', 'full', 'got', 'grow', 'hold', 'hot', 'hurt', 'if',
      'keep', 'kind', 'laugh', 'light', 'long', 'much', 'myself', 'never', 'only',
      'own', 'pick', 'seven', 'shall', 'show', 'six', 'small', 'start', 'ten',
      'today', 'together', 'try', 'warm',
    ],
  },
  {
    id: 'dolch-nouns',
    label: 'Dolch Nouns',
    grade: 'Pre-K',
    words: [
      'apple', 'baby', 'back', 'ball', 'bear', 'bed', 'bell', 'bird', 'birthday',
      'boat', 'box', 'boy', 'bread', 'brother', 'cake', 'car', 'cat', 'chair',
      'chicken', 'children', 'christmas', 'coat', 'corn', 'cow', 'day', 'dog',
      'doll', 'door', 'duck', 'egg', 'eye', 'farm', 'farmer', 'father', 'feet',
      'fire', 'fish', 'floor', 'flower', 'game', 'garden', 'girl', 'goodbye',
      'grass', 'ground', 'hand', 'head', 'hill', 'home', 'horse', 'house', 'kitty',
      'leg', 'letter', 'man', 'men', 'milk', 'money', 'morning', 'mother', 'name',
      'nest', 'night', 'paper', 'party', 'picture', 'pig', 'rabbit', 'rain', 'ring',
      'robin', 'santa claus', 'school', 'seed', 'sheep', 'shoe', 'sister', 'snow',
      'song', 'squirrel', 'stick', 'street', 'sun', 'table', 'thing', 'time', 'top',
      'toy', 'tree', 'watch', 'water', 'way', 'wind', 'window', 'wood',
    ],
  },
];

// ─── Fry instant words (first 300, frequency rank order) ─────────────

export const FRY_LISTS: WordList[] = [
  {
    id: 'fry-1-100',
    label: 'Fry First 100',
    grade: 'Kindergarten',
    words: [
      'the', 'of', 'and', 'a', 'to', 'in', 'is', 'you', 'that', 'it',
      'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i',
      'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'words',
      'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said',
      'there', 'use', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if',
      'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so',
      'some', 'her', 'would', 'make', 'like', 'him', 'into', 'time', 'has', 'look',
      'two', 'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people',
      'my', 'than', 'first', 'water', 'been', 'called', 'who', 'oil', 'sit', 'now',
      'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part',
    ],
  },
  {
    id: 'fry-101-200',
    label: 'Fry Second 100',
    grade: 'Grade 1',
    words: [
      'over', 'new', 'sound', 'take', 'only', 'little', 'work', 'know', 'place', 'years',
      'live', 'me', 'back', 'give', 'most', 'very', 'after', 'things', 'our', 'just',
      'name', 'good', 'sentence', 'man', 'think', 'say', 'great', 'where', 'help',
      'through', 'much', 'before', 'line', 'right', 'too', 'means', 'old', 'any',
      'same', 'tell', 'boy', 'follow', 'came', 'want', 'show', 'also', 'around',
      'form', 'three', 'small', 'set', 'put', 'end', 'does', 'another', 'well',
      'large', 'must', 'big', 'even', 'such', 'because', 'turn', 'here', 'why',
      'ask', 'went', 'men', 'read', 'need', 'land', 'different', 'home', 'us',
      'move', 'try', 'kind', 'hand', 'picture', 'again', 'change', 'off', 'play',
      'spell', 'air', 'away', 'animal', 'house', 'point', 'page', 'letter', 'mother',
      'answer', 'found', 'study', 'still', 'learn', 'should', 'america', 'world',
    ],
  },
  {
    id: 'fry-201-300',
    label: 'Fry Third 100',
    grade: 'Grade 2',
    words: [
      'high', 'every', 'near', 'add', 'food', 'between', 'own', 'below', 'country',
      'plant', 'last', 'school', 'father', 'keep', 'tree', 'never', 'start', 'city',
      'earth', 'eyes', 'light', 'thought', 'head', 'under', 'story', 'saw', 'left',
      "don't", 'few', 'while', 'along', 'might', 'close', 'something', 'seem', 'next',
      'hard', 'open', 'example', 'begin', 'life', 'always', 'those', 'both', 'paper',
      'together', 'got', 'group', 'often', 'run', 'important', 'until', 'children',
      'side', 'feet', 'car', 'mile', 'night', 'walk', 'white', 'sea', 'began', 'grow',
      'took', 'river', 'four', 'carry', 'state', 'once', 'book', 'hear', 'stop',
      'without', 'second', 'late', 'miss', 'idea', 'enough', 'eat', 'face', 'watch',
      'far', 'indian', 'real', 'almost', 'let', 'above', 'girl', 'sometimes',
      'mountains', 'cut', 'young', 'talk', 'soon', 'list', 'song', 'being', 'leave',
      'family', "it's",
    ],
  },
];

export const ALL_WORD_LISTS: WordList[] = [...DOLCH_LISTS, ...FRY_LISTS];

/** Look up a single word list by its id. Returns undefined for an unknown id. */
export function getWordList(id: string): WordList | undefined {
  return ALL_WORD_LISTS.find((list) => list.id === id);
}
