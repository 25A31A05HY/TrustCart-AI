/**
 * TruthCart AI - Structured Chunking & Search Index Store
 * Manages catalogue records, policy documents, chunking, inverted index, dense vectors,
 * and dynamic dataset ingestion with schema validation and provenance tracking.
 */
import { CATALOGUE } from '../data/catalogue';
import { POLICIES } from '../data/policies';
import {
  DocumentChunk,
  Product,
  StorePolicy,
  PolicyClause
} from '../types';
import { generateDeterministicEmbedding } from './embeddings';
import { computeTermFrequencies, tokenize } from './tokenizer';

export interface IngestionLog {
  id: string;
  timestamp: string;
  type: 'catalogue' | 'policy';
  action: 'initial_load' | 'append' | 'replace';
  recordsProcessed: number;
  recordsValid: number;
  recordsFailed: number;
  errors: string[];
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
}

/**
 * Auto-detects and parses CSV, JSONL, or JSON string into structured records with canonical column mapping
 */
export function parseTextToRecords(rawText: string): { records: any[]; format: 'json' | 'jsonl' | 'csv'; error?: string } {
  const trimmed = rawText.trim();
  if (!trimmed) return { records: [], format: 'json' };

  // 1. Check standard JSON
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      return { records: Array.isArray(parsed) ? parsed : [parsed], format: 'json' };
    } catch {
      // Continue to check JSONL or CSV
    }
  }

  // 2. Check JSONL
  const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
  let isJsonl = true;
  const jsonlRecords: any[] = [];
  for (const line of lines) {
    if (line.startsWith('{') && line.endsWith('}')) {
      try {
        jsonlRecords.push(JSON.parse(line));
      } catch {
        isJsonl = false;
        break;
      }
    } else {
      isJsonl = false;
      break;
    }
  }
  if (isJsonl && jsonlRecords.length > 0) {
    return { records: jsonlRecords, format: 'jsonl' };
  }

  // 3. Parse CSV
  const csvRecords: any[] = [];
  if (lines.length >= 2) {
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_\-]+/g, ''));
    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;
      const row: Record<string, any> = {};
      for (let j = 0; j < headers.length; j++) {
        const val = values[j] !== undefined ? values[j].replace(/^["']|["']$/g, '') : '';
        const h = headers[j];
        if (h === 'productid' || h === 'id' || h === 'sku') row.id = val;
        else if (h === 'title' || h === 'productname' || h === 'name') row.title = val;
        else if (h === 'brand' || h === 'manufacturer') row.brand = val;
        else if (h === 'category') row.category = val;
        else if (h === 'subcategory' || h === 'type') row.subcategory = val;
        else if (h === 'price' || h === 'cost' || h === 'currentprice') row.price = parseFloat(val) || 0;
        else if (h === 'originalprice' || h === 'msrp') row.originalPrice = parseFloat(val) || 0;
        else if (h === 'currency') row.currency = val || 'USD';
        else if (h === 'stockcount' || h === 'stock' || h === 'quantity') row.stockCount = parseInt(val, 10) || 0;
        else if (h === 'instock' || h === 'availability') row.inStock = val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'in stock';
        else if (h === 'rating' || h === 'stars') row.rating = parseFloat(val) || 4.5;
        else if (h === 'reviewcount' || h === 'reviews') row.reviewCount = parseInt(val, 10) || 10;
        else if (h === 'description' || h === 'features') row.keyFeatures = [val];
        else {
          if (!row.specs) row.specs = {};
          row.specs[h] = val;
        }
      }
      if (row.id || row.title) {
        csvRecords.push(row);
      }
    }
    return { records: csvRecords, format: 'csv' };
  }

  return { records: [], format: 'json', error: 'Unable to parse text as valid JSON, JSONL, or CSV.' };
}

class IndexStore {
  private products: Map<string, Product> = new Map();
  private policies: Map<string, StorePolicy> = new Map();
  private policyClauses: Map<string, PolicyClause> = new Map();
  private chunks: DocumentChunk[] = [];
  private invertedIndex: Map<string, Map<string, number>> = new Map();
  private docLengths: Map<string, number> = new Map();
  private avgDocLength: number = 0;
  private ingestionHistory: IngestionLog[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.initializeDefaultData();
  }

  /**
   * Initializes store with canonical catalogue and policies
   */
  public initializeDefaultData(): void {
    this.products.clear();
    this.policies.clear();
    this.policyClauses.clear();
    this.chunks = [];
    this.invertedIndex.clear();
    this.docLengths.clear();

    // 1. Ingest Catalogue
    for (const prod of CATALOGUE) {
      this.products.set(prod.id, prod);
    }

    // 2. Ingest Policies
    for (const pol of POLICIES) {
      this.policies.set(pol.id, pol);
      for (const clause of pol.clauses) {
        this.policyClauses.set(clause.id, clause);
        this.policyClauses.set(clause.clauseCode, clause);
      }
    }

    // 3. Generate Chunks & Index
    this.rebuildIndex();

    this.ingestionHistory.push({
      id: `ingest-init-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'catalogue',
      action: 'initial_load',
      recordsProcessed: CATALOGUE.length,
      recordsValid: CATALOGUE.length,
      recordsFailed: 0,
      errors: []
    });

    this.isInitialized = true;
  }

  /**
   * Chunks products and policies into verifiable atomic documents and generates index
   */
  public rebuildIndex(): void {
    const newChunks: DocumentChunk[] = [];

    // Chunk Products
    for (const prod of this.products.values()) {
      // Chunk A: Core Specs & Pricing
      const specsContent = `Product: ${prod.title}. Brand: ${prod.brand}. Category: ${prod.category} > ${prod.subcategory}. Price: $${prod.price.toFixed(2)} ${prod.currency} (Original: $${prod.originalPrice.toFixed(2)}). Stock Status: ${prod.inStock ? `In Stock (${prod.stockCount} available)` : 'Out of Stock (0 available)'}. Warranty: ${prod.warrantyMonths} months manufacturer warranty. Return Window: ${prod.returnWindowDays} days. Lead Time: ${prod.leadTimeDays} business days. Detailed Specs: ${Object.entries(prod.specs).map(([k, v]) => `${k}: ${v}`).join(', ')}. Tags: ${prod.tags.join(', ')}.`;

      newChunks.push({
        id: `chunk-prod-${prod.id}-spec`,
        type: 'product_spec',
        sourceId: prod.id,
        sourceTitle: prod.title,
        section: 'Specifications & Pricing',
        content: specsContent,
        metadata: {
          productId: prod.id,
          brand: prod.brand,
          category: prod.category,
          price: prod.price,
          inStock: prod.inStock,
          rating: prod.rating
        }
      });

      // Chunk B: Key Features
      const featuresContent = `Product: ${prod.title}. Brand: ${prod.brand}. Key Features and Capabilities: ${prod.keyFeatures.join('. ')}.`;
      newChunks.push({
        id: `chunk-prod-${prod.id}-feat`,
        type: 'product_feature',
        sourceId: prod.id,
        sourceTitle: prod.title,
        section: 'Key Features',
        content: featuresContent,
        metadata: {
          productId: prod.id,
          brand: prod.brand,
          category: prod.category,
          price: prod.price,
          inStock: prod.inStock
        }
      });

      // Chunk C: Customer Reviews & Ratings
      if (prod.reviews && prod.reviews.length > 0) {
        const reviewTexts = prod.reviews.map(r => `Review by ${r.author} (${r.rating}/5 stars, "${r.title}"): "${r.text}"`).join(' | ');
        const reviewsContent = `Product: ${prod.title}. Overall Rating: ${prod.rating}/5 across ${prod.reviewCount} customer reviews. Verified Customer Reviews: ${reviewTexts}`;
        newChunks.push({
          id: `chunk-prod-${prod.id}-rev`,
          type: 'product_review',
          sourceId: prod.id,
          sourceTitle: prod.title,
          section: 'Verified Customer Reviews',
          content: reviewsContent,
          metadata: {
            productId: prod.id,
            brand: prod.brand,
            category: prod.category,
            rating: prod.rating
          }
        });
      }
    }

    // Chunk Policies
    for (const policy of this.policies.values()) {
      for (const clause of policy.clauses) {
        const clauseContent = `Policy Document: ${policy.title} [${clause.id}]. Clause Code: ${clause.clauseCode}. Topic: ${clause.title}. Policy Rule Content: ${clause.content}. Summary: ${clause.summary}.${clause.exceptions && clause.exceptions.length > 0 ? ` Explicit Exceptions: ${clause.exceptions.join('; ')}.` : ''} Key Keywords: ${clause.keywords.join(', ')}.`;

        newChunks.push({
          id: `chunk-pol-${clause.id.toLowerCase()}`,
          type: 'policy_clause',
          sourceId: clause.id,
          sourceTitle: `${policy.title} - ${clause.title}`,
          section: clause.title,
          content: clauseContent,
          metadata: {
            policyCode: clause.clauseCode,
            policyCategory: clause.category
          }
        });
      }
    }

    // Index Tokenization, BM25 TF structures, and Dense Vectors
    this.invertedIndex.clear();
    this.docLengths.clear();
    let totalLen = 0;

    for (const chunk of newChunks) {
      const tokens = tokenize(chunk.content);
      const tf = computeTermFrequencies(tokens);
      chunk.tokenFrequencies = tf;
      chunk.embedding = generateDeterministicEmbedding(chunk.content);

      const len = tokens.length;
      this.docLengths.set(chunk.id, len);
      totalLen += len;

      for (const [token, freq] of tf.entries()) {
        if (!this.invertedIndex.has(token)) {
          this.invertedIndex.set(token, new Map());
        }
        this.invertedIndex.get(token)!.set(chunk.id, freq);
      }
    }

    this.chunks = newChunks;
    this.avgDocLength = newChunks.length > 0 ? totalLen / newChunks.length : 0;
  }

  /**
   * Validates raw JSON/object against Product canonical schema
   */
  public validateProductSchema(item: any): SchemaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];

    if (!item || typeof item !== 'object') {
      return { valid: false, errors: ['Item is not a valid JSON object'], warnings: [], missingFields: ['all'] };
    }

    const requiredFields = ['id', 'title', 'brand', 'category', 'price'];
    for (const field of requiredFields) {
      if (item[field] === undefined || item[field] === null || item[field] === '') {
        missingFields.push(field);
        errors.push(`Missing mandatory field: ${field}`);
      }
    }

    if (item.price !== undefined) {
      const numPrice = Number(item.price);
      if (isNaN(numPrice) || numPrice < 0) {
        errors.push(`Invalid price: ${item.price}. Must be a non-negative number.`);
      }
    }

    if (item.stockCount !== undefined) {
      const numStock = Number(item.stockCount);
      if (isNaN(numStock) || numStock < 0) {
        errors.push(`Invalid stockCount: ${item.stockCount}. Must be a non-negative integer.`);
      }
    }

    if (!item.specs || typeof item.specs !== 'object') {
      warnings.push(`Product '${item.title || item.id}' lacks structured specs dictionary.`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      missingFields
    };
  }

  /**
   * Validates raw JSON/object against Policy Clause schema
   */
  public validatePolicySchema(item: any): SchemaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];

    const required = ['id', 'clauseCode', 'title', 'content', 'category'];
    for (const field of required) {
      if (!item[field]) {
        missingFields.push(field);
        errors.push(`Missing mandatory policy clause field: ${field}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      missingFields
    };
  }

  /**
   * Dynamically imports a batch of products with full validation
   */
  public importProducts(rawItems: any[], mode: 'append' | 'replace' = 'append'): IngestionLog {
    if (mode === 'replace') {
      this.products.clear();
    }

    let validCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rawItems.length; i++) {
      const raw = rawItems[i];
      const validation = this.validateProductSchema(raw);

      if (!validation.valid) {
        failedCount++;
        errors.push(`Record #${i} (${raw.id || 'unidentified'}): ${validation.errors.join(', ')}`);
        continue;
      }

      // Check duplicates
      if (mode === 'append' && this.products.has(raw.id)) {
        errors.push(`Record #${i} (${raw.id}): Duplicate product ID already exists in catalogue.`);
        failedCount++;
        continue;
      }

      // Normalize into canonical Product
      const normalized: Product = {
        id: String(raw.id).trim(),
        sku: raw.sku ? String(raw.sku).trim() : `SKU-${raw.id}`,
        title: String(raw.title).trim(),
        brand: String(raw.brand).trim(),
        category: String(raw.category).trim(),
        subcategory: raw.subcategory ? String(raw.subcategory).trim() : 'General',
        price: Number(raw.price),
        originalPrice: raw.originalPrice ? Number(raw.originalPrice) : Number(raw.price),
        currency: raw.currency ? String(raw.currency).toUpperCase() : 'USD',
        rating: raw.rating !== undefined ? Number(raw.rating) : 4.5,
        reviewCount: raw.reviewCount !== undefined ? Number(raw.reviewCount) : 10,
        inStock: raw.inStock !== undefined ? Boolean(raw.inStock) : (raw.stockCount ? Number(raw.stockCount) > 0 : true),
        stockCount: raw.stockCount !== undefined ? Number(raw.stockCount) : 10,
        leadTimeDays: raw.leadTimeDays !== undefined ? Number(raw.leadTimeDays) : 2,
        imageUrl: raw.imageUrl ? String(raw.imageUrl) : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        specs: typeof raw.specs === 'object' && raw.specs !== null ? raw.specs : {},
        keyFeatures: Array.isArray(raw.keyFeatures) ? raw.keyFeatures.map(String) : [String(raw.title)],
        reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
        warrantyMonths: raw.warrantyMonths ? Number(raw.warrantyMonths) : 12,
        returnWindowDays: raw.returnWindowDays ? Number(raw.returnWindowDays) : 14,
        shippingOptions: Array.isArray(raw.shippingOptions) ? raw.shippingOptions : [
          { id: 'shp-std', name: 'Standard Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
        ],
        tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [String(raw.category).toLowerCase(), String(raw.brand).toLowerCase()]
      };

      this.products.set(normalized.id, normalized);
      validCount++;
    }

    // Rebuild index
    this.rebuildIndex();

    const log: IngestionLog = {
      id: `ingest-prod-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'catalogue',
      action: mode,
      recordsProcessed: rawItems.length,
      recordsValid: validCount,
      recordsFailed: failedCount,
      errors
    };

    this.ingestionHistory.unshift(log);
    return log;
  }

  /**
   * Dynamically imports policies
   */
  public importPolicies(rawPolicies: any[], mode: 'append' | 'replace' = 'append'): IngestionLog {
    if (mode === 'replace') {
      this.policies.clear();
      this.policyClauses.clear();
    }

    let validCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const raw of rawPolicies) {
      if (!raw.id || !raw.title || !Array.isArray(raw.clauses)) {
        failedCount++;
        errors.push(`Invalid policy structure: ${raw.title || raw.id}`);
        continue;
      }

      const policy: StorePolicy = {
        id: raw.id,
        category: raw.category || 'general',
        title: raw.title,
        lastUpdated: raw.lastUpdated || new Date().toISOString().split('T')[0],
        clauses: []
      };

      for (const clause of raw.clauses) {
        const val = this.validatePolicySchema(clause);
        if (val.valid) {
          policy.clauses.push(clause);
          this.policyClauses.set(clause.id, clause);
          this.policyClauses.set(clause.clauseCode, clause);
          validCount++;
        } else {
          failedCount++;
          errors.push(`Policy clause error (${clause.id}): ${val.errors.join(', ')}`);
        }
      }

      this.policies.set(policy.id, policy);
    }

    this.rebuildIndex();

    const log: IngestionLog = {
      id: `ingest-pol-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'policy',
      action: mode,
      recordsProcessed: rawPolicies.length,
      recordsValid: validCount,
      recordsFailed: failedCount,
      errors
    };

    this.ingestionHistory.unshift(log);
    return log;
  }

  // Getters
  public getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  public getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  public getAllPolicies(): StorePolicy[] {
    return Array.from(this.policies.values());
  }

  public getPolicyClauseById(idOrCode: string): PolicyClause | undefined {
    return this.policyClauses.get(idOrCode);
  }

  public getChunks(): DocumentChunk[] {
    return this.chunks;
  }

  public getInvertedIndex(): Map<string, Map<string, number>> {
    return this.invertedIndex;
  }

  public getDocLengths(): Map<string, number> {
    return this.docLengths;
  }

  public getAvgDocLength(): number {
    return this.avgDocLength;
  }

  public getIngestionHistory(): IngestionLog[] {
    return this.ingestionHistory;
  }

  public getStatus() {
    return {
      initialized: this.isInitialized,
      productCount: this.products.size,
      policyCount: this.policies.size,
      clauseCount: this.policyClauses.size / 2, // Map stores both ID and Code
      chunkCount: this.chunks.length,
      vocabularySize: this.invertedIndex.size,
      lastIngestion: this.ingestionHistory[0] || null
    };
  }
}

export const indexStore = new IndexStore();
