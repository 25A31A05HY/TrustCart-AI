/**
 * TruthCart AI - Grounded Conversational Shopping Assistant
 * Core Domain Types and Data Contracts
 */

export interface ProductSpec {
  [key: string]: string | number | boolean;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  daysMin: number;
  daysMax: number;
  cost: number;
  carrier: string;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  currency: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  leadTimeDays: number;
  imageUrl: string;
  specs: ProductSpec;
  keyFeatures: string[];
  reviews: ProductReview[];
  warrantyMonths: number;
  returnWindowDays: number;
  shippingOptions: ShippingOption[];
  tags: string[];
}

export interface PolicyClause {
  id: string;
  clauseCode: string;
  title: string;
  content: string;
  summary: string;
  exceptions?: string[];
  keywords: string[];
  category: 'returns' | 'shipping' | 'price_match' | 'warranty' | 'general' | 'payments';
}

export interface StorePolicy {
  id: string;
  category: 'returns' | 'shipping' | 'price_match' | 'warranty' | 'general' | 'payments';
  title: string;
  lastUpdated: string;
  clauses: PolicyClause[];
}

export type ChunkType = 'product_spec' | 'product_feature' | 'product_review' | 'policy_clause' | 'inventory_status';

export interface DocumentChunk {
  id: string;
  type: ChunkType;
  sourceId: string;
  sourceTitle: string;
  section: string;
  content: string;
  metadata: {
    productId?: string;
    brand?: string;
    category?: string;
    price?: number;
    inStock?: boolean;
    policyCode?: string;
    policyCategory?: string;
    rating?: number;
  };
  tokenFrequencies?: Map<string, number>;
  embedding?: number[];
  termNorm?: number;
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  sparseScore: number;
  denseScore: number;
  combinedScore: number;
  rank: number;
  matchHighlights: string[];
}

export type ClaimVerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'CONTRADICTED' | 'REFUSED_POLICY';

export interface Citation {
  id: string;
  chunkId: string;
  sourceId: string;
  sourceTitle: string;
  type: ChunkType;
  snippet: string;
  exactMatch: boolean;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface ClaimEvaluation {
  claimId: string;
  text: string;
  status: ClaimVerificationStatus;
  confidence: number; // 0.0 to 1.0
  sourceCitation?: Citation;
  contradictionExplanation?: string;
  correctionSuggestion?: string;
}

export interface UserConstraints {
  maxBudget?: number;
  minBudget?: number;
  category?: string;
  brand?: string;
  inStockOnly: boolean;
  minRating?: number;
  requiredFeatures: string[];
  maxLeadTimeDays?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
  selectedShippingId?: string;
}

export type EngineMode = 'gemini' | 'deterministic_offline';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations: Citation[];
  claims: ClaimEvaluation[];
  retrievedProducts: Product[];
  refusalReason?: string;
  clarificationOptions?: string[];
  appliedConstraints?: Partial<UserConstraints>;
  engineMode: EngineMode;
  retrievalLatencyMs?: number;
  verificationLatencyMs?: number;
  totalLatencyMs?: number;
  isError?: boolean;
  errorDetails?: string;
  retryable?: boolean;
}

export type AdversarialCategory =
  | 'hallucination_bait'
  | 'price_tampering'
  | 'policy_jailbreak'
  | 'out_of_stock_promise'
  | 'competitor_flash_sale'
  | 'multi_constraint'
  | 'ambiguous_clarification'
  | 'fraud_and_safety';

export interface AdversarialTestCase {
  id: string;
  title: string;
  category: AdversarialCategory;
  userQuery: string;
  expectedBehavior: 'refuse' | 'correct' | 'clarify' | 'grounded_recommend';
  criteriaDescription: string;
  verificationRules: {
    forbiddenTerms?: string[];
    requiredAttributions?: string[];
    maxAllowedPrice?: number;
    expectedRefusalPhrase?: string;
    mustNotPromiseStock?: boolean;
    mustAskClarification?: boolean;
  };
}

export interface BenchmarkResultItem {
  testId: string;
  title: string;
  category: AdversarialCategory;
  query: string;
  assistantResponse: string;
  passed: boolean;
  score: number; // 0 - 100
  failureReasons: string[];
  claimsVerifiedCount: number;
  claimsContradictedCount: number;
  citationsCount: number;
  latencyMs: number;
  engineModeUsed: EngineMode;
}

export interface BenchmarkSuiteSummary {
  runTimestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallScore: number;
  groundednessRate: number;
  hallucinationRate: number;
  citationPrecision: number;
  constraintAdherenceRate: number;
  refusalPrecision: number;
  avgLatencyMs: number;
  results: BenchmarkResultItem[];
}

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£'
};

export const EXCHANGE_RATES_FROM_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  INR: 86.5,
  EUR: 0.92,
  GBP: 0.78
};

export function formatCurrencyPrice(
  amount: number,
  fromCurrency: string = 'USD',
  targetCurrency: CurrencyCode = 'USD'
): { formatted: string; convertedAmount: number; symbol: string } {
  // Normalize to USD first
  let usd = amount;
  const fromUpper = (fromCurrency || 'USD').toUpperCase();
  if (fromUpper === 'INR') usd = amount / 86.5;
  else if (fromUpper === 'EUR') usd = amount / 0.92;
  else if (fromUpper === 'GBP') usd = amount / 0.78;

  // Convert from USD to target currency
  const rate = EXCHANGE_RATES_FROM_USD[targetCurrency] || 1.0;
  const convertedAmount = Number((usd * rate).toFixed(2));
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || '$';

  return {
    formatted: `${symbol}${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    convertedAmount,
    symbol
  };
}
