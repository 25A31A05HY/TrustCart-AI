/**
 * TruthCart AI - Hybrid Retrieval Engine
 * Combines BM25 lexical search, dense semantic cosine scoring, and Reciprocal Rank Fusion (RRF)
 * with strict attribute constraint enforcement and provenance tracking.
 */
import {
  DocumentChunk,
  Product,
  RetrievalResult,
  UserConstraints
} from '../types';
import { cosineSimilarity, generateDeterministicEmbedding } from './embeddings';
import { indexStore } from './indexStore';
import { calculateBM25, tokenize } from './tokenizer';

export interface ParsedQuery {
  rawQuery: string;
  cleanKeywords: string[];
  intent: 'product_search' | 'product_comparison' | 'policy_question' | 'general_clarification';
  extractedCategory?: string;
  extractedBrand?: string;
  extractedMaxBudget?: number;
  extractedMinBudget?: number;
  inStockRequired: boolean;
  minRatingRequired?: number;
  extractedFeatures: string[];
  isPolicyQuery: boolean;
  policyCategoryHint?: string;
}

export interface RetrievalPackage {
  query: ParsedQuery;
  results: RetrievalResult[];
  matchedProducts: Product[];
  unmetConstraints: string[];
  retrievalFailureReason?: 'no_matches_found' | 'budget_exceeded' | 'out_of_stock' | 'catalogue_empty';
  totalChunksSearched: number;
  retrievalTimeMs: number;
}

/**
 * Deterministically parses structured user intent and constraints from natural language query
 */
export function parseQuery(queryText: string, activeConstraints?: UserConstraints): ParsedQuery {
  const lower = queryText.toLowerCase();
  const rawTokens = tokenize(queryText, false);

  // 1. Detect Intent
  let intent: ParsedQuery['intent'] = 'product_search';
  let isPolicyQuery = false;
  let policyCategoryHint: string | undefined = undefined;

  const policyKeywords = ['return', 'refund', 'warranty', 'guarantee', 'price match', 'shipping', 'delivery', 'overnight', 'restocking fee', 'sales tax', 'damaged'];
  for (const kw of policyKeywords) {
    if (lower.includes(kw)) {
      isPolicyQuery = true;
      intent = 'policy_question';
      if (kw.includes('return') || kw.includes('refund') || kw.includes('restock')) policyCategoryHint = 'returns';
      else if (kw.includes('price match')) policyCategoryHint = 'price_match';
      else if (kw.includes('ship') || kw.includes('deliver') || kw.includes('overnight')) policyCategoryHint = 'shipping';
      else if (kw.includes('warranty')) policyCategoryHint = 'warranty';
      break;
    }
  }

  if (lower.includes('compare') || lower.includes('vs') || lower.includes('versus') || lower.includes('difference between')) {
    intent = 'product_comparison';
  }

  // 2. Extract Budget constraints (e.g. "under $500", "below 800", "under ₹2,000", "budget 1000", "less than $400")
  let extractedMaxBudget = activeConstraints?.maxBudget;
  let extractedMinBudget = activeConstraints?.minBudget;

  const budgetRegex = /(?:under|below|less than|max|within|budget of)\s*(?:[\$\₹\€\£]|inr|usd)?\s*(\d[\d,]*)(?:\.\d{2})?/i;
  const budgetMatch = queryText.match(budgetRegex);
  if (budgetMatch && budgetMatch[1]) {
    extractedMaxBudget = parseFloat(budgetMatch[1].replace(/,/g, ''));
  }

  const minBudgetRegex = /(?:above|more than|at least|minimum of)\s*(?:[\$\₹\€\£]|inr|usd)?\s*(\d[\d,]*)(?:\.\d{2})?/i;
  const minMatch = queryText.match(minBudgetRegex);
  if (minMatch && minMatch[1]) {
    extractedMinBudget = parseFloat(minMatch[1].replace(/,/g, ''));
  }

  // 3. Extract Brand
  const knownBrands = ['Sony', 'Apple', 'Bose', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'Samsung', 'Google', 'Garmin', 'WHOOP', 'Roborock', 'Dyson', 'Breville', 'LG', 'Logitech', 'Herman Miller', 'GoPro', 'Amazon', 'Anker'];
  let extractedBrand = activeConstraints?.brand;
  for (const b of knownBrands) {
    if (lower.includes(b.toLowerCase())) {
      extractedBrand = b;
      break;
    }
  }

  // 4. Extract Category
  const categoryMap: Record<string, string[]> = {
    'Audio': ['headphone', 'headphones', 'earbud', 'earbuds', 'audio', 'earphones', 'anc'],
    'Laptops': ['laptop', 'laptops', 'ultrabook', 'notebook', 'macbook', 'thinkpad', 'computer'],
    'Smartphones': ['phone', 'phones', 'smartphone', 'smartphones', 'iphone', 'galaxy', 'pixel'],
    'Wearables': ['watch', 'smartwatch', 'tracker', 'fitness tracker', 'wearable', 'whoop', 'forerunner'],
    'Home Appliances': ['vacuum', 'vacuums', 'robot vacuum', 'espresso', 'coffee maker', 'coffee machine', 'dyson', 'mop'],
    'Displays': ['monitor', 'monitors', 'display', 'screen', '4k monitor', 'oled monitor'],
    'Accessories': ['mouse', 'keyboard', 'peripherals'],
    'Furniture': ['chair', 'seating', 'office chair', 'aeron'],
    'Cameras': ['camera', 'action camera', 'mirrorless', 'gopro']
  };

  let extractedCategory = activeConstraints?.category;
  for (const [cat, kws] of Object.entries(categoryMap)) {
    for (const kw of kws) {
      if (lower.includes(kw)) {
        extractedCategory = cat;
        break;
      }
    }
    if (extractedCategory) break;
  }

  // 5. In-Stock requirement
  const inStockRequired = activeConstraints?.inStockOnly || lower.includes('in stock') || lower.includes('available now') || lower.includes('ready to ship');

  // 6. Rating requirement
  let minRatingRequired = activeConstraints?.minRating;
  if (lower.includes('top rated') || lower.includes('best rated') || lower.includes('4+ star') || lower.includes('at least 4 star')) {
    minRatingRequired = 4.5;
  }

  // 7. Key Features / Specs
  const extractedFeatures: string[] = [...(activeConstraints?.requiredFeatures || [])];
  const featureChecks: Record<string, string> = {
    'noise cancelling': 'ANC active noise cancellation',
    'anc': 'ANC active noise cancellation',
    'battery': 'long battery life',
    'lightweight': 'lightweight portable',
    'waterproof': 'water resistant waterproof',
    'ip68': 'IP68 water resistant',
    'oled': 'OLED display',
    '4k': '4K resolution',
    'usb-c': 'USB-C connectivity',
    'thunderbolt': 'Thunderbolt 4'
  };

  for (const [k, v] of Object.entries(featureChecks)) {
    if (lower.includes(k) && !extractedFeatures.includes(v)) {
      extractedFeatures.push(v);
    }
  }

  return {
    rawQuery: queryText,
    cleanKeywords: rawTokens,
    intent,
    extractedCategory,
    extractedBrand,
    extractedMaxBudget,
    extractedMinBudget,
    inStockRequired,
    minRatingRequired,
    extractedFeatures,
    isPolicyQuery,
    policyCategoryHint
  };
}

/**
 * Performs full hybrid retrieval and constraint validation
 */
export function hybridRetrieve(
  queryText: string,
  activeConstraints?: UserConstraints,
  topK = 5
): RetrievalPackage {
  const startTime = performance.now();
  const parsed = parseQuery(queryText, activeConstraints);

  const allChunks = indexStore.getChunks();
  if (allChunks.length === 0) {
    return {
      query: parsed,
      results: [],
      matchedProducts: [],
      unmetConstraints: [],
      retrievalFailureReason: 'catalogue_empty',
      totalChunksSearched: 0,
      retrievalTimeMs: performance.now() - startTime
    };
  }

  const queryTokens = parsed.cleanKeywords;
  const queryEmbedding = generateDeterministicEmbedding(queryText);
  const invertedIndex = indexStore.getInvertedIndex();
  const docCounts = new Map<string, number>();
  for (const [token, posting] of invertedIndex.entries()) {
    docCounts.set(token, posting.size);
  }
  const avgDl = indexStore.getAvgDocLength();
  const totalDocs = allChunks.length;

  // 1. Calculate BM25 Sparse and Dense Cosine scores for each chunk
  const candidateScores: Array<{
    chunk: DocumentChunk;
    bm25: number;
    dense: number;
    bm25Rank?: number;
    denseRank?: number;
    rrfScore?: number;
    combinedScore?: number;
  }> = [];

  for (const chunk of allChunks) {
    // If it's a policy query, filter out non-policy chunks unless no policy match found
    if (parsed.isPolicyQuery && chunk.type !== 'policy_clause' && !parsed.rawQuery.toLowerCase().includes('product')) {
      continue;
    }

    const docLen = chunk.content.length / 5; // approximate token count
    const bm25Score = calculateBM25(
      queryTokens,
      chunk.tokenFrequencies || new Map(),
      docLen,
      avgDl,
      docCounts,
      totalDocs
    );

    const denseScore = chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0;

    candidateScores.push({
      chunk,
      bm25: bm25Score,
      dense: Math.max(0, denseScore)
    });
  }

  // 2. Rank for Reciprocal Rank Fusion (k=60)
  // Sort by BM25
  candidateScores.sort((a, b) => b.bm25 - a.bm25);
  candidateScores.forEach((c, idx) => { c.bm25Rank = idx + 1; });

  // Sort by Dense
  candidateScores.sort((a, b) => b.dense - a.dense);
  candidateScores.forEach((c, idx) => { c.denseRank = idx + 1; });

  // Compute RRF and Linear Hybrid Score
  const RRF_K = 60;
  let maxBm25 = 0;
  for (const c of candidateScores) {
    if (c.bm25 > maxBm25) maxBm25 = c.bm25;
  }

  for (const c of candidateScores) {
    const normBm25 = maxBm25 > 0 ? c.bm25 / maxBm25 : 0;
    const rrf = (1.0 / (RRF_K + (c.bm25Rank || 1))) + (1.0 / (RRF_K + (c.denseRank || 1)));
    c.rrfScore = rrf;
    // 50% BM25 lexical, 50% dense semantic
    c.combinedScore = 0.5 * normBm25 + 0.5 * c.dense;
  }

  // Sort by final combined score
  candidateScores.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));

  // 3. Filter Candidates against Hard Constraints
  const finalResults: RetrievalResult[] = [];
  const matchedProductIds = new Set<string>();
  const matchedProducts: Product[] = [];
  const unmetConstraints: string[] = [];

  for (const item of candidateScores) {
    const chunk = item.chunk;
    let passesHardConstraints = true;

    // Check if this chunk belongs to a product
    if (chunk.metadata.productId) {
      const prod = indexStore.getProductById(chunk.metadata.productId);
      if (prod) {
        // A. Hard Budget Constraint:
        // "A product priced at ₹2,500 must not be shown as satisfying a maximum price of ₹2,000."
        if (parsed.extractedMaxBudget !== undefined && prod.price > parsed.extractedMaxBudget) {
          passesHardConstraints = false;
          unmetConstraints.push(`Product ${prod.title} ($${prod.price}) exceeds maximum budget of $${parsed.extractedMaxBudget}`);
        }

        if (parsed.extractedMinBudget !== undefined && prod.price < parsed.extractedMinBudget) {
          passesHardConstraints = false;
        }

        // B. In-Stock Constraint
        if (parsed.inStockRequired && (!prod.inStock || prod.stockCount <= 0)) {
          passesHardConstraints = false;
          unmetConstraints.push(`Product ${prod.title} is currently Out of Stock`);
        }

        // C. Category Constraint
        if (parsed.extractedCategory && prod.category.toLowerCase() !== parsed.extractedCategory.toLowerCase()) {
          // If query specifically requested a category, filter other categories
          passesHardConstraints = false;
        }

        // D. Brand Constraint
        if (parsed.extractedBrand && prod.brand.toLowerCase() !== parsed.extractedBrand.toLowerCase()) {
          passesHardConstraints = false;
        }

        // E. Rating Constraint
        if (parsed.minRatingRequired && prod.rating < parsed.minRatingRequired) {
          passesHardConstraints = false;
        }

        if (passesHardConstraints && !matchedProductIds.has(prod.id)) {
          matchedProductIds.add(prod.id);
          matchedProducts.push(prod);
        }
      }
    }

    if (passesHardConstraints) {
      // Generate match highlights
      const highlights: string[] = [];
      const lowerContent = chunk.content.toLowerCase();
      for (const tok of queryTokens) {
        if (lowerContent.includes(tok)) {
          highlights.push(tok);
        }
      }

      finalResults.push({
        chunk,
        sparseScore: Number(item.bm25.toFixed(4)),
        denseScore: Number(item.dense.toFixed(4)),
        combinedScore: Number((item.combinedScore || 0).toFixed(4)),
        rank: finalResults.length + 1,
        matchHighlights: highlights
      });

      if (finalResults.length >= topK) {
        break;
      }
    }
  }

  // If matchedProducts is empty but product chunks exist in candidateScores, collect top matching products
  if (matchedProducts.length === 0) {
    for (const item of candidateScores) {
      if (item.chunk.metadata.productId) {
        const prod = indexStore.getProductById(item.chunk.metadata.productId);
        if (prod && !matchedProductIds.has(prod.id)) {
          if (parsed.extractedMaxBudget !== undefined && prod.price > parsed.extractedMaxBudget) continue;
          if (parsed.inStockRequired && (!prod.inStock || prod.stockCount <= 0)) continue;
          if (parsed.extractedCategory && prod.category.toLowerCase() !== parsed.extractedCategory.toLowerCase()) continue;
          matchedProductIds.add(prod.id);
          matchedProducts.push(prod);
          if (matchedProducts.length >= 3) break;
        }
      }
    }
  }

  // 4. Distinguish failure causes
  let retrievalFailureReason: RetrievalPackage['retrievalFailureReason'] = undefined;
  if (finalResults.length === 0) {
    if (parsed.extractedMaxBudget !== undefined && candidateScores.some(c => c.chunk.metadata.price && c.chunk.metadata.price > parsed.extractedMaxBudget!)) {
      retrievalFailureReason = 'budget_exceeded';
    } else if (parsed.inStockRequired && candidateScores.some(c => c.chunk.metadata.inStock === false)) {
      retrievalFailureReason = 'out_of_stock';
    } else {
      retrievalFailureReason = 'no_matches_found';
    }
  }

  const duration = performance.now() - startTime;

  return {
    query: parsed,
    results: finalResults,
    matchedProducts,
    unmetConstraints,
    retrievalFailureReason,
    totalChunksSearched: candidateScores.length,
    retrievalTimeMs: Number(duration.toFixed(2))
  };
}
