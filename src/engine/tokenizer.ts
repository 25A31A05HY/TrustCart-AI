/**
 * TruthCart AI - Text Tokenizer and Lexical Indexing Engine
 * Implements deterministic text normalization, unit preservation, token frequencies, and BM25 scoring.
 */

const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
  'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between',
  'both', 'but', 'by', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here',
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
  'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves',
  'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you',
  'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Basic algorithmic stemmer for English suffixes
 */
export function stemToken(token: string): string {
  if (token.length <= 3) return token;

  // Preserve technical units & abbreviations
  if (/^\d+(?:gb|tb|mb|ghz|mhz|mah|w|pa|mm|cm|in|fps|k|hz|lbs|kg|hours?|hrs?|days?|months?)$/.test(token)) {
    return token;
  }

  let word = token;
  if (word.endsWith('sses')) word = word.slice(0, -2);
  else if (word.endsWith('ies')) word = word.slice(0, -3) + 'y';
  else if (word.endsWith('ss')) { /* keep */ }
  else if (word.endsWith('s') && !word.endsWith('us') && !word.endsWith('is')) word = word.slice(0, -1);

  if (word.endsWith('eed')) word = word.slice(0, -1);
  else if ((word.endsWith('ed') || word.endsWith('ing')) && word.length > 5) {
    word = word.replace(/(?:ed|ing)$/, '');
  }

  if (word.endsWith('ational')) word = word.replace(/ational$/, 'ate');
  else if (word.endsWith('tional')) word = word.replace(/tional$/, 'tion');
  else if (word.endsWith('izer')) word = word.replace(/izer$/, 'ize');
  else if (word.endsWith('ator')) word = word.replace(/ator$/, 'ate');

  return word;
}

/**
 * Normalizes and extracts tokens, preserving alphanumeric technical spec tokens
 */
export function tokenize(text: string, removeStopwords = true): string[] {
  if (!text) return [];

  // Lowercase and handle punctuation while preserving compound terms and tech tokens (e.g. "wh-1000xm5", "3.2k", "rtx-4070")
  const clean = text.toLowerCase()
    .replace(/[^\w\s\.\-\$]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const rawTokens = clean.split(' ').filter(Boolean);
  const result: string[] = [];

  for (const raw of rawTokens) {
    // Strip trailing/leading punctuation
    const stripped = raw.replace(/^[\.\-\$]+|[\.\-]+$/g, '');
    if (!stripped || stripped.length < 2) continue;

    if (removeStopwords && STOPWORDS.has(stripped)) {
      continue;
    }

    const stemmed = stemToken(stripped);
    result.push(stemmed);
  }

  return result;
}

/**
 * Computes term frequencies for a document or query
 */
export function computeTermFrequencies(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  return tf;
}

/**
 * Calculates Robertson-Spärck Jones IDF
 */
export function calculateIdf(docFrequency: number, totalDocuments: number): number {
  return Math.log(1 + (totalDocuments - docFrequency + 0.5) / (docFrequency + 0.5));
}

/**
 * Calculates Okapi BM25 score for a document given a query
 */
export function calculateBM25(
  queryTokens: string[],
  docTermFreqs: Map<string, number>,
  docLength: number,
  avgDocLength: number,
  invertedIndexDocCounts: Map<string, number>,
  totalDocs: number,
  k1 = 1.2,
  b = 0.75
): number {
  let score = 0;
  const uniqueQueryTokens = Array.from(new Set(queryTokens));

  for (const token of uniqueQueryTokens) {
    const tf = docTermFreqs.get(token) || 0;
    if (tf === 0) continue;

    const docCount = invertedIndexDocCounts.get(token) || 1;
    const idf = calculateIdf(docCount, totalDocs);

    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + b * (docLength / (avgDocLength || 1)));

    score += idf * (numerator / denominator);
  }

  return Math.max(0, score);
}
