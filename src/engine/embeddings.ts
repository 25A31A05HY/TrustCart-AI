/**
 * TruthCart AI - Vector Embedding & Dense Semantic Representation Engine
 * Provides deterministic semantic embeddings (128-dimensional L2-normalized) for offline execution,
 * with optional Gemini embedding adapter when GEMINI_API_KEY is configured.
 */
import { GoogleGenAI } from '@google/genai';
import { tokenize } from './tokenizer';

export const EMBEDDING_DIM = 128;

// Common retail semantic concept anchors mapped to dense subspace indices
const SEMANTIC_CONCEPTS: Record<string, string[]> = {
  audio_noise: ['anc', 'noise', 'cancell', 'headphon', 'earbud', 'sound', 'audio', 'decibel', 'quiet', 'music', 'acoustic', 'listen'],
  battery_power: ['batteri', 'charg', 'mah', 'hour', 'playtime', 'usbc', 'magsaf', 'quick', 'power', 'endur'],
  computing_power: ['laptop', 'processor', 'ram', 'cpu', 'gpu', 'ssd', 'm3', 'intel', 'ryzen', 'geforc', 'rtx', 'render', 'code'],
  portability_weight: ['lightweight', 'compact', 'featherlight', 'portabl', 'lbs', 'gram', 'travel', 'thin', 'briefcas'],
  display_visual: ['display', 'screen', 'oled', '4k', 'retina', 'resolut', 'hz', 'bright', 'nit', 'color', 'monitor'],
  durability_water: ['waterproof', 'resist', 'ip68', 'ipx8', 'ip54', 'durabl', 'milspec', 'titanium', 'rugged', 'submers'],
  camera_imaging: ['camera', 'megapix', 'zoom', 'video', 'lens', 'sensor', 'photo', '4k120', 'fps', 'hdr', 'stabil'],
  home_cleaning: ['vacuum', 'mop', 'clean', 'hepa', 'suction', 'dust', 'pet', 'carpet', 'robot', 'filter'],
  ergonomic_comfort: ['ergonom', 'chair', 'lumbar', 'postur', 'pillow', 'mesh', 'cushion', 'spine', 'comfort'],
  policy_return: ['return', 'refund', 'restock', 'window', 'exchang', 'fee', 'unopen', 'damag', 'receipt', 'label'],
  policy_price: ['price', 'match', 'competitor', 'guarante', 'discount', 'adjust', 'cheaper', 'author', 'retailer'],
  policy_shipping: ['ship', 'deliver', 'express', 'overnight', 'ground', 'freight', 'transit', 'cutoff', 'courier'],
  policy_warranty: ['warranti', 'defect', 'repair', 'coverag', 'drop', 'manufactur', 'liquid', 'screen', 'protect']
};

/**
 * FNV-1a 32-bit hash algorithm for deterministic token projection
 */
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Computes deterministic dense semantic vector (L2-normalized) for text
 */
export function generateDeterministicEmbedding(text: string): number[] {
  const vec = new Array<number>(EMBEDDING_DIM).fill(0);
  const tokens = tokenize(text);
  if (tokens.length === 0) return vec;

  // 1. Direct subword & token hashing into embedding dimensions
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const hash = fnv1a(token);
    const dim1 = hash % EMBEDDING_DIM;
    const dim2 = (hash >> 8) % EMBEDDING_DIM;
    const sign = (hash & 1) === 0 ? 1.0 : -1.0;

    // Position weighting (early tokens carry slight prior)
    const posWeight = 1.0 / Math.sqrt(1 + i * 0.1);
    vec[dim1] += sign * 1.5 * posWeight;
    vec[dim2] += -sign * 0.75 * posWeight;

    // 2. Character n-gram subword features (for misspellings & variants)
    for (let k = 3; k <= Math.min(5, token.length); k++) {
      for (let s = 0; s <= token.length - k; s++) {
        const sub = token.substring(s, s + k);
        const subHash = fnv1a(sub);
        const subDim = subHash % EMBEDDING_DIM;
        vec[subDim] += 0.25 * ((subHash & 1) === 0 ? 1 : -1);
      }
    }
  }

  // 3. Dense semantic subspace projection
  const conceptKeys = Object.keys(SEMANTIC_CONCEPTS);
  conceptKeys.forEach((concept, cIdx) => {
    const keywords = SEMANTIC_CONCEPTS[concept];
    let conceptOverlap = 0;
    for (const kw of keywords) {
      if (tokens.includes(kw)) {
        conceptOverlap += 1.0;
      }
    }

    if (conceptOverlap > 0) {
      const baseDim = (cIdx * 7) % EMBEDDING_DIM;
      for (let offset = 0; offset < 4; offset++) {
        const targetDim = (baseDim + offset) % EMBEDDING_DIM;
        vec[targetDim] += Math.sqrt(conceptOverlap) * 2.0;
      }
    }
  });

  // 4. L2 Normalization
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIM; i++) {
      vec[i] /= norm;
    }
  }

  return vec;
}

/**
 * Calculates Cosine Similarity between two L2-normalized vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(-1.0, Math.min(1.0, dotProduct));
}

/**
 * High-level embedding generator with Gemini fallback
 */
export async function getEmbedding(text: string, useGemini = false): Promise<number[]> {
  if (useGemini && process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      // Use text embedding model if available
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: text
      });
      const values = (response as any).embedding?.values || (response as any).embeddings?.[0]?.values;
      if (values && values.length > 0) {
        // Project or use Gemini embedding
        return values.slice(0, EMBEDDING_DIM);
      }
    } catch {
      // Fallback silently to deterministic generator
    }
  }

  return generateDeterministicEmbedding(text);
}
