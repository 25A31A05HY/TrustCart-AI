/**
 * TruthCart AI - Claim-Level Evidence Validation Engine ("Truth Engine")
 * Deterministically extracts atomic propositions, cross-references against catalogue records
 * and policy documents, computes confidence scores, detects contradictions, and resolves citations.
 */
import {
  Citation,
  ClaimEvaluation,
  DocumentChunk,
  Product,
  StorePolicy
} from '../types';
import { indexStore } from './indexStore';

export interface VerificationReport {
  claims: ClaimEvaluation[];
  citations: Citation[];
  overallGroundedness: number; // 0 to 100%
  hallucinationRate: number; // 0 to 100%
  verifiedClaimsCount: number;
  unverifiedClaimsCount: number;
  contradictedClaimsCount: number;
  containsContradiction: boolean;
  sanitizedContent?: string;
  contradictionAlerts: string[];
}

/**
 * Splits response text into verifiable atomic sentences
 */
export function extractAtomicPropositions(text: string): string[] {
  if (!text) return [];

  // Remove markdown headers and list formatting
  const cleaned = text.replace(/^[#\*\-]+\s+/gm, '');

  // Split on sentence boundaries (period, exclamation, newline)
  const rawSentences = cleaned.split(/(?<=[.!?])\s+|\n+/);
  const propositions: string[] = [];

  for (const s of rawSentences) {
    const trimmed = s.trim();
    // Exclude pleasantries, greetings, or short transitions that contain no factual claims
    if (trimmed.length < 8) continue;
    if (/^(hello|hi|welcome|sure thing|here are|feel free|let me know|happy to help|thank you)/i.test(trimmed)) {
      continue;
    }
    propositions.push(trimmed);
  }

  return propositions;
}

/**
 * Deterministically evaluates each proposition against the evidence corpus
 */
export function verifyClaims(
  responseText: string,
  retrievedChunks: DocumentChunk[],
  referencedProducts: Product[]
): VerificationReport {
  const propositions = extractAtomicPropositions(responseText);
  const evaluatedClaims: ClaimEvaluation[] = [];
  const citationsMap = new Map<string, Citation>();
  const contradictionAlerts: string[] = [];

  const allCatalogueProducts = indexStore.getAllProducts();
  const allPolicies = indexStore.getAllPolicies();

  let claimCounter = 1;

  for (const prop of propositions) {
    const propLower = prop.toLowerCase();
    const claimId = `CLM-${String(claimCounter++).padStart(3, '0')}`;

    let matchedCitation: Citation | undefined = undefined;
    let status: ClaimEvaluation['status'] = 'UNVERIFIED';
    let confidence = 0.5;
    let contradictionExplanation: string | undefined = undefined;

    // 1. Check for Product Specific Claims (Price, Stock, Specs)
    let productEvaluated: Product | undefined = undefined;
    for (const prod of allCatalogueProducts) {
      if (propLower.includes(prod.title.toLowerCase()) || propLower.includes(prod.brand.toLowerCase())) {
        productEvaluated = prod;
        break;
      }
    }

    if (!productEvaluated && referencedProducts.length > 0) {
      productEvaluated = referencedProducts[0];
    }

    // A. Price Verification
    // A. Price Verification
    // Match assertions like "price: $X", "costs $X", "at $X", "is $X", while ignoring budget constraints like "under $700"
    const priceAssertMatch = prop.match(/(?:price\s*(?:is|:)?|costs|at|is)\s*\$(\d+(?:\.\d{2})?)/i);
    const anyPriceMatch = prop.match(/\$(\d+(?:\.\d{2})?)/);
    
    // Check if the price mentioned is an explicit budget qualifier (e.g. "under $700", "budget of $500")
    const isBudgetQualifier = /under\s*\$\d+|budget(?:\s*of|\s*:)?\s*\$\d+/i.test(prop);

    if ((priceAssertMatch || anyPriceMatch) && productEvaluated && !isBudgetQualifier) {
      const statedPrice = parseFloat((priceAssertMatch ? priceAssertMatch[1] : anyPriceMatch![1]));
      const actualPrice = productEvaluated.price;

      if (Math.abs(statedPrice - actualPrice) < 0.05) {
        status = 'VERIFIED';
        confidence = 1.0;
        matchedCitation = {
          id: `cit-spec-${productEvaluated.id}`,
          chunkId: `chunk-prod-${productEvaluated.id}-spec`,
          sourceId: productEvaluated.id,
          sourceTitle: `${productEvaluated.title} Spec Sheet`,
          type: 'product_spec',
          snippet: `Current verified catalogue price is $${productEvaluated.price.toFixed(2)} ${productEvaluated.currency}`,
          exactMatch: true,
          confidence: 1.0
        };
      } else if (propLower.includes('not $') || propLower.includes('not ' + statedPrice) || propLower.includes('cannot confirm')) {
        // Refutation of false price is a VERIFIED claim!
        status = 'VERIFIED';
        confidence = 1.0;
        matchedCitation = {
          id: `cit-spec-refute-${productEvaluated.id}`,
          chunkId: `chunk-prod-${productEvaluated.id}-spec`,
          sourceId: productEvaluated.id,
          sourceTitle: `${productEvaluated.title} Spec Sheet`,
          type: 'product_spec',
          snippet: `Verified catalogue price is $${actualPrice.toFixed(2)}, confirming unverified price $${statedPrice.toFixed(2)} is false.`,
          exactMatch: true,
          confidence: 1.0
        };
      } else {
        // Direct price discrepancy asserted as fact -> CONTRADICTION!
        status = 'CONTRADICTED';
        confidence = 0.0;
        contradictionExplanation = `Catalogue contradiction: ${productEvaluated.title} is listed at $${actualPrice.toFixed(2)}, not $${statedPrice.toFixed(2)}.`;
        contradictionAlerts.push(contradictionExplanation);
      }
    }

    // B. Stock & Inventory Verification
    if (status !== 'CONTRADICTED' && productEvaluated) {
      if (propLower.includes('in stock') || propLower.includes('available now') || propLower.includes('ready to ship')) {
        if (!productEvaluated.inStock || productEvaluated.stockCount <= 0) {
          status = 'CONTRADICTED';
          confidence = 0.0;
          contradictionExplanation = `Inventory contradiction: ${productEvaluated.title} is currently OUT OF STOCK (0 units available).`;
          contradictionAlerts.push(contradictionExplanation);
        } else {
          status = 'VERIFIED';
          confidence = 0.95;
          matchedCitation = {
            id: `cit-stock-${productEvaluated.id}`,
            chunkId: `chunk-prod-${productEvaluated.id}-spec`,
            sourceId: productEvaluated.id,
            sourceTitle: `${productEvaluated.title} Inventory`,
            type: 'inventory_status',
            snippet: `Inventory verified: In Stock (${productEvaluated.stockCount} units available with ${productEvaluated.leadTimeDays}-day lead time).`,
            exactMatch: true,
            confidence: 0.95
          };
        }
      } else if (propLower.includes('out of stock') || propLower.includes('currently unavailable')) {
        if (!productEvaluated.inStock) {
          status = 'VERIFIED';
          confidence = 1.0;
          matchedCitation = {
            id: `cit-stock-oos-${productEvaluated.id}`,
            chunkId: `chunk-prod-${productEvaluated.id}-spec`,
            sourceId: productEvaluated.id,
            sourceTitle: `${productEvaluated.title} Inventory`,
            type: 'inventory_status',
            snippet: `Inventory verified: Product is strictly Out of Stock (0 available).`,
            exactMatch: true,
            confidence: 1.0
          };
        }
      }
    }

    // C. Non-existent Spec / Hallucination Trap Check
    if (status !== 'CONTRADICTED' && productEvaluated) {
      // Check negative specs explicitly flagged in catalogue
      if (productEvaluated.specs) {
        if (productEvaluated.specs.hasEspressoMaker === false && propLower.includes('espresso')) {
          if (propLower.includes('not') || propLower.includes('does not') || propLower.includes('no ') || propLower.includes('cannot')) {
            status = 'VERIFIED';
            confidence = 1.0;
            matchedCitation = {
              id: `cit-neg-espresso-${productEvaluated.id}`,
              chunkId: `chunk-prod-${productEvaluated.id}-spec`,
              sourceId: productEvaluated.id,
              sourceTitle: `${productEvaluated.title} Spec Sheet`,
              type: 'product_spec',
              snippet: `Verified: ${productEvaluated.title} does not have an espresso maker.`,
              exactMatch: true,
              confidence: 1.0
            };
          } else {
            status = 'CONTRADICTED';
            confidence = 0.0;
            contradictionExplanation = `${productEvaluated.title} does NOT feature an espresso maker.`;
            contradictionAlerts.push(contradictionExplanation);
          }
        }
        if (productEvaluated.specs.has5gCellular === false && propLower.includes('5g')) {
          if (propLower.includes('not') || propLower.includes('4g') || propLower.includes('does not')) {
            status = 'VERIFIED';
            confidence = 1.0;
            matchedCitation = {
              id: `cit-neg-5g-${productEvaluated.id}`,
              chunkId: `chunk-prod-${productEvaluated.id}-spec`,
              sourceId: productEvaluated.id,
              sourceTitle: `${productEvaluated.title} Spec Sheet`,
              type: 'product_spec',
              snippet: `Verified: ${productEvaluated.title} supports 4G LTE cellular, not 5G.`,
              exactMatch: true,
              confidence: 1.0
            };
          } else {
            status = 'CONTRADICTED';
            confidence = 0.0;
            contradictionExplanation = `${productEvaluated.title} does NOT have 5G cellular connectivity.`;
            contradictionAlerts.push(contradictionExplanation);
          }
        }
      }
    }

    // D. Policy Clause Verification
    if (status !== 'CONTRADICTED') {
      const isPolicyClaim = propLower.includes('return') || propLower.includes('refund') ||
        propLower.includes('restock') || propLower.includes('price match') ||
        propLower.includes('warranty') || propLower.includes('shipping') ||
        propLower.includes('overnight');

      if (isPolicyClaim) {
        // Check for common policy contradictions (e.g. 60-day return, opened earbud return, ebay price match)
        if (propLower.includes('60 days') || propLower.includes('90 days')) {
          status = 'CONTRADICTED';
          confidence = 0.0;
          contradictionExplanation = `Policy violation: TruthCart standard return window is 30 days for general merchandise (POL-RET-01) and 14 days for electronics (POL-RET-02), not 60 or 90 days.`;
          contradictionAlerts.push(contradictionExplanation);
        } else if ((propLower.includes('earbud') || propLower.includes('airpods')) && propLower.includes('return') && propLower.includes('opened')) {
          if (!propLower.includes('cannot') && !propLower.includes('non-returnable') && !propLower.includes('not returnable')) {
            status = 'CONTRADICTED';
            confidence = 0.0;
            contradictionExplanation = `Policy violation: POL-RET-03 strictly states that in-ear earbuds are non-returnable once opened for sanitary reasons.`;
            contradictionAlerts.push(contradictionExplanation);
          }
        } else if (propLower.includes('price match') && (propLower.includes('ebay') || propLower.includes('marketplace') || propLower.includes('flash sale'))) {
          if (!propLower.includes('exclude') && !propLower.includes('cannot') && !propLower.includes('not eligible')) {
            status = 'CONTRADICTED';
            confidence = 0.0;
            contradictionExplanation = `Policy violation: POL-PRC-02 strictly excludes marketplace sellers (eBay) and flash sales from price matching.`;
            contradictionAlerts.push(contradictionExplanation);
          }
        }

        if (status !== 'CONTRADICTED') {
          // Look up matching policy clause in store
          for (const pol of allPolicies) {
            for (const clause of pol.clauses) {
              let matchCount = 0;
              for (const kw of clause.keywords) {
                if (propLower.includes(kw)) matchCount++;
              }
              if (matchCount >= 2 || propLower.includes(clause.clauseCode.toLowerCase()) || propLower.includes(clause.title.toLowerCase())) {
                status = 'VERIFIED';
                confidence = 0.95;
                matchedCitation = {
                  id: `cit-pol-${clause.id}`,
                  chunkId: `chunk-pol-${clause.id.toLowerCase()}`,
                  sourceId: clause.id,
                  sourceTitle: `${pol.title} [${clause.clauseCode}]`,
                  type: 'policy_clause',
                  snippet: clause.summary,
                  exactMatch: true,
                  confidence: 0.95
                };
                break;
              }
            }
            if (matchedCitation) break;
          }
        }
      }
    }

    // E. General Retrieved Chunk Evidence Support
    if (status === 'UNVERIFIED') {
      for (const chunk of retrievedChunks) {
        const lowerChunk = chunk.content.toLowerCase();
        // Check n-gram overlap
        const words = propLower.split(' ').filter(w => w.length > 4);
        let overlap = 0;
        for (const w of words) {
          if (lowerChunk.includes(w)) overlap++;
        }

        if (words.length > 0 && overlap / words.length >= 0.5) {
          status = 'VERIFIED';
          confidence = 0.85;
          matchedCitation = {
            id: `cit-chunk-${chunk.id}`,
            chunkId: chunk.id,
            sourceId: chunk.sourceId,
            sourceTitle: chunk.sourceTitle,
            type: chunk.type,
            snippet: chunk.content.substring(0, 160) + '...',
            exactMatch: false,
            confidence: 0.85
          };
          break;
        }
      }
    }

    if (matchedCitation) {
      citationsMap.set(matchedCitation.id, matchedCitation);
    }

    evaluatedClaims.push({
      claimId,
      text: prop,
      status,
      confidence,
      sourceCitation: matchedCitation,
      contradictionExplanation
    });
  }

  // Summary counts
  const verifiedCount = evaluatedClaims.filter(c => c.status === 'VERIFIED').length;
  const unverifiedCount = evaluatedClaims.filter(c => c.status === 'UNVERIFIED').length;
  const contradictedCount = evaluatedClaims.filter(c => c.status === 'CONTRADICTED').length;
  const total = evaluatedClaims.length || 1;

  const overallGroundedness = Math.round((verifiedCount / total) * 100);
  const hallucinationRate = Math.round((contradictedCount / total) * 100);

  return {
    claims: evaluatedClaims,
    citations: Array.from(citationsMap.values()),
    overallGroundedness,
    hallucinationRate,
    verifiedClaimsCount: verifiedCount,
    unverifiedClaimsCount: unverifiedCount,
    contradictedClaimsCount: contradictedCount,
    containsContradiction: contradictedCount > 0,
    contradictionAlerts
  };
}
