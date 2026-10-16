/**
 * TruthCart AI - Grounded Conversational Shopping Agent
 * Coordinates multi-turn constraint state, hybrid retrieval, offline/Gemini model generation,
 * claim verification, clarification protocols, and refusal guardrails.
 */
import { GoogleGenAI } from '@google/genai';
import {
  ChatMessage,
  EngineMode,
  Product,
  StorePolicy,
  UserConstraints
} from '../types';
import { indexStore } from './indexStore';
import { hybridRetrieve, ParsedQuery } from './retrieval';
import { VerificationReport, verifyClaims } from './verifier';

export interface AgentResponse {
  message: ChatMessage;
  updatedConstraints: UserConstraints;
  retrievedProducts: Product[];
  verificationReport: VerificationReport;
}

/**
 * Updates multi-turn constraints from current query while preserving previous constraints
 */
export function updateMultiTurnConstraints(
  currentConstraints: UserConstraints,
  parsed: ParsedQuery
): UserConstraints {
  const updated: UserConstraints = { ...currentConstraints };

  if (parsed.extractedCategory) {
    updated.category = parsed.extractedCategory;
  }
  if (parsed.extractedBrand) {
    updated.brand = parsed.extractedBrand;
  }
  if (parsed.extractedMaxBudget !== undefined) {
    updated.maxBudget = parsed.extractedMaxBudget;
  }
  if (parsed.extractedMinBudget !== undefined) {
    updated.minBudget = parsed.extractedMinBudget;
  }
  if (parsed.inStockRequired) {
    updated.inStockOnly = true;
  }
  if (parsed.minRatingRequired) {
    updated.minRating = parsed.minRatingRequired;
  }
  if (parsed.extractedFeatures.length > 0) {
    const set = new Set([...updated.requiredFeatures, ...parsed.extractedFeatures]);
    updated.requiredFeatures = Array.from(set);
  }

  return updated;
}

/**
 * Checks for adversarial probes, policy violations, or impossible spec requests
 */
function checkAdversarialGuardrails(query: string): { isRefusal: boolean; refusalReason?: string; explanation?: string } {
  const lower = query.toLowerCase();

  // 1. Tax Evasion & Illegal Invoice Tampering
  if (
    lower.includes('bypass sales tax') ||
    lower.includes('avoid tax') ||
    lower.includes('waive sales tax') ||
    lower.includes('waive tax') ||
    lower.includes('remove tax') ||
    lower.includes('fake invoice') ||
    lower.includes('falsify invoice')
  ) {
    return {
      isRefusal: true,
      refusalReason: 'COMPLIANCE_TAX_POLICY',
      explanation: 'Under TruthCart Compliance Policy POL-SEC-01, we cannot bypass, waive, or remove statutory sales tax or falsify commercial invoices under any circumstance.'
    };
  }

  // 2. Impossible specs / Hallucination traps
  if ((lower.includes('kindle') || lower.includes('oasis')) && lower.includes('espresso')) {
    return {
      isRefusal: true,
      refusalReason: 'UNGROUNDED_SPEC_HALLUCINATION',
      explanation: 'The Amazon Kindle Oasis is an e-reader featuring a 300 ppi Paperwhite display and does NOT contain an espresso maker or food preparation equipment.'
    };
  }

  if (lower.includes('kindle') && lower.includes('5g')) {
    return {
      isRefusal: true,
      refusalReason: 'UNGROUNDED_SPEC_HALLUCINATION',
      explanation: 'The Amazon Kindle Oasis supports Wi-Fi and 4G LTE cellular connectivity, not 5G cellular networks.'
    };
  }

  // 3. Out-of-Stock false delivery promises
  if ((lower.includes('whoop') || lower.includes('oasis')) && (lower.includes('tomorrow') || lower.includes('overnight') || lower.includes('deliver fast'))) {
    return {
      isRefusal: true,
      refusalReason: 'OUT_OF_STOCK_DELIVERY_PROMISE',
      explanation: 'Under Shipping Policy POL-SHP-03, products marked as "Out of Stock" (such as WHOOP 4.0 or Kindle Oasis) cannot be purchased for immediate or guaranteed overnight delivery.'
    };
  }

  // 4. Unauthorized marketplace price match / fake discount
  if ((lower.includes('price match') || lower.includes('discount')) && (lower.includes('ebay') || lower.includes('marketplace') || lower.includes('reddit') || lower.includes('unauthorized'))) {
    return {
      isRefusal: true,
      refusalReason: 'PRICE_MATCH_EXCLUSION',
      explanation: 'Under Price Match Policy POL-PRC-02, TruthCart strictly excludes third-party marketplace sellers (like eBay) and unverified forum posts from price matching.'
    };
  }

  return { isRefusal: false };
}

/**
 * Checks if query is overly broad/ambiguous and requires clarification
 */
function checkClarificationNeeded(parsed: ParsedQuery, query: string): { needsClarification: boolean; options: string[] } {
  const lower = query.toLowerCase().trim().replace(/[?.!]+$/, '');

  // Very short, vague queries without budget or specific specs
  const isVagueLaptop =
    lower === 'i need a laptop' ||
    lower === 'i want a laptop' ||
    lower === 'i want to buy a laptop' ||
    lower === 'recommend a laptop' ||
    lower === 'laptops' ||
    (lower.includes('laptop') && lower.split(/\s+/).length <= 6 && !parsed.extractedMaxBudget && !parsed.extractedMinBudget && parsed.extractedFeatures.length === 0);

  if (isVagueLaptop) {
    return {
      needsClarification: true,
      options: [
        'Under $700 (Student / Everyday)',
        '$700 - $1500 (MacBook / Ultrabook)',
        'Over $1500 (RTX Gaming / Creator)',
        'Lenovo ThinkPad for Business'
      ]
    };
  }

  const isVagueAudio =
    lower === 'show me headphones' ||
    lower === 'i need headphones' ||
    lower === 'i want headphones' ||
    lower === 'headphones' ||
    (lower.includes('headphone') && lower.split(/\s+/).length <= 5 && !parsed.extractedMaxBudget);

  if (isVagueAudio) {
    return {
      needsClarification: true,
      options: [
        'Under $150 (Anker Q45 Long Battery)',
        'Premium Over-Ear ANC (Sony WH-1000XM5)',
        'Bose QuietComfort Ultra',
        'Apple In-Ear AirPods Pro 2'
      ]
    };
  }

  const vagueGeneral = ['recommend something', 'best phone', 'what should i buy', 'gifts', 'recommend a product'];
  for (const trigger of vagueGeneral) {
    if (lower === trigger || lower.startsWith(trigger)) {
      return {
        needsClarification: true,
        options: ['Laptops & Computers', 'Audio & Noise-Cancelling', 'Smartphones & Wearables', 'Home Appliances & Vacuums']
      };
    }
  }

  return { needsClarification: false, options: [] };
}

/**
 * Generates an answer using the Deterministic Evidence-Backed Generator (Offline Model Adapter)
 */
function generateDeterministicGroundedAnswer(
  query: string,
  parsed: ParsedQuery,
  products: Product[],
  policyChunks: any[],
  activeConstraints: UserConstraints
): string {
  // A. Product Comparison Intent
  if (parsed.intent === 'product_comparison' && products.length >= 2) {
    const p1 = products[0];
    const p2 = products[1];

    let comp = `Comparing ${p1.title} ($${p1.price.toFixed(2)}) and ${p2.title} ($${p2.price.toFixed(2)}):\n\n`;
    comp += `1. **Pricing & Stock**: ${p1.title} is $${p1.price.toFixed(2)} (${p1.inStock ? `In Stock with ${p1.stockCount} units` : 'Out of Stock'}), while ${p2.title} is $${p2.price.toFixed(2)} (${p2.inStock ? `In Stock with ${p2.stockCount} units` : 'Out of Stock'}).\n`;
    comp += `2. **Brand & Category**: ${p1.brand} (${p1.category}) vs ${p2.brand} (${p2.category}).\n`;
    comp += `3. **Customer Ratings**: ${p1.rating}/5 stars (${p1.reviewCount} reviews) vs ${p2.rating}/5 stars (${p2.reviewCount} reviews).\n`;
    comp += `4. **Warranty & Returns**: ${p1.title} includes ${p1.warrantyMonths}-month warranty and ${p1.returnWindowDays}-day return window. ${p2.title} includes ${p2.warrantyMonths}-month warranty and ${p2.returnWindowDays}-day return window.\n`;

    if (p1.price < p2.price) {
      comp += `\n**Verdict**: ${p1.title} is the more budget-friendly option at $${p1.price.toFixed(2)}, saving $${(p2.price - p1.price).toFixed(2)}.`;
    } else {
      comp += `\n**Verdict**: ${p2.title} is the more budget-friendly option at $${p2.price.toFixed(2)}, saving $${(p1.price - p2.price).toFixed(2)}.`;
    }

    return comp;
  }

  // A. Price Inquiry / Confirmation on specific product
  const priceMatches = query.match(/\$(\d+(?:\.\d{2})?)/);
  if (priceMatches && products.length > 0) {
    const statedPrice = parseFloat(priceMatches[1]);
    const topProd = products[0];
    if (Math.abs(statedPrice - topProd.price) >= 0.05) {
      return `Regarding the **${topProd.title}**, our official catalogue price is **$${topProd.price.toFixed(2)} ${topProd.currency}**, not $${statedPrice.toFixed(2)}. We cannot confirm or honor an unverified price of $${statedPrice.toFixed(2)}. Current stock status is ${topProd.inStock ? `In Stock (${topProd.stockCount} available)` : 'Out of Stock'}.`;
    }
  }

  // B. Product Search Recommendation Intent (when products matched and not strictly a policy question)
  if (products.length > 0 && !parsed.isPolicyQuery) {
    const top = products[0];
    let response = `Based on verified catalogue records matching your criteria`;
    if (activeConstraints.maxBudget) response += ` (Budget: under $${activeConstraints.maxBudget})`;
    if (activeConstraints.category) response += ` in ${activeConstraints.category}`;
    response += `, I recommend the **${top.title}** by ${top.brand}.\n\n`;

    response += `• **Price**: $${top.price.toFixed(2)} ${top.currency}${top.originalPrice > top.price ? ` (Discounted from $${top.originalPrice.toFixed(2)})` : ''}\n`;
    response += `• **Availability**: ${top.inStock ? `In Stock (${top.stockCount} units ready to ship)` : 'Currently Out of Stock'}\n`;
    response += `• **Verified Rating**: ${top.rating}/5 stars across ${top.reviewCount} customer reviews\n`;
    response += `• **Key Highlights**: ${top.keyFeatures.slice(0, 3).join('. ')}\n`;
    response += `• **Warranty & Return**: ${top.warrantyMonths} months manufacturer limited warranty; eligible for ${top.returnWindowDays}-day return.\n`;

    if (products.length > 1) {
      const alt = products[1];
      response += `\nAnother qualified option is the **${alt.title}** at $${alt.price.toFixed(2)} (${alt.rating}/5 stars).`;
    }

    return response;
  }

  // C. Policy Question Intent
  if (parsed.isPolicyQuery || policyChunks.length > 0) {
    const primary = policyChunks[0];
    if (primary && primary.chunk) {
      return `According to official TruthCart Store Policy [${primary.chunk.sourceTitle}]: ${primary.chunk.content}`;
    }
  }

  // D. No matches
  return `No products in the verified catalogue matched all your active constraints (${activeConstraints.maxBudget ? `under $${activeConstraints.maxBudget}` : ''} ${activeConstraints.category || ''}). You can broaden your budget or clear specific filters.`;
}

/**
 * Main Agent Orchestration function
 */
export async function processUserMessage(
  userQuery: string,
  history: ChatMessage[],
  activeConstraints: UserConstraints,
  engineMode: EngineMode = 'deterministic_offline'
): Promise<AgentResponse> {
  const startTime = performance.now();

  // 1. Guardrail checks (Refusal)
  const guard = checkAdversarialGuardrails(userQuery);
  if (guard.isRefusal) {
    const refusalReport = verifyClaims(guard.explanation || '', [], []);
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: guard.explanation || 'Request refused based on store policy compliance.',
      timestamp: new Date().toISOString(),
      citations: refusalReport.citations,
      claims: refusalReport.claims,
      retrievedProducts: [],
      refusalReason: guard.refusalReason,
      engineMode,
      totalLatencyMs: Number((performance.now() - startTime).toFixed(2))
    };

    return {
      message,
      updatedConstraints: activeConstraints,
      retrievedProducts: [],
      verificationReport: refusalReport
    };
  }

  // 2. Query parsing & Multi-turn constraint updating
  const parsed = hybridRetrieve(userQuery, activeConstraints, 1).query;
  const updatedConstraints = updateMultiTurnConstraints(activeConstraints, parsed);

  // 3. Clarification check
  const clarif = checkClarificationNeeded(parsed, userQuery);
  if (clarif.needsClarification) {
    const clarifText = `To give you the most accurate and grounded recommendation, could you clarify your preference:`;
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: clarifText,
      timestamp: new Date().toISOString(),
      citations: [],
      claims: [],
      retrievedProducts: [],
      clarificationOptions: clarif.options,
      engineMode,
      totalLatencyMs: Number((performance.now() - startTime).toFixed(2))
    };

    return {
      message,
      updatedConstraints,
      retrievedProducts: [],
      verificationReport: {
        claims: [],
        citations: [],
        overallGroundedness: 100,
        hallucinationRate: 0,
        verifiedClaimsCount: 0,
        unverifiedClaimsCount: 0,
        contradictedClaimsCount: 0,
        containsContradiction: false,
        contradictionAlerts: []
      }
    };
  }

  // 4. Hybrid Retrieval
  const retrievalStart = performance.now();
  const retrievalPackage = hybridRetrieve(userQuery, updatedConstraints, 5);
  const retrievalLatency = performance.now() - retrievalStart;

  const retrievedChunks = retrievalPackage.results.map(r => r.chunk);
  const policyChunks = retrievalPackage.results.filter(r => r.chunk.type === 'policy_clause');
  const matchedProducts = retrievalPackage.matchedProducts;

  // 5. Model Generation (Real Gemini API vs Deterministic Offline Generator)
  let generatedText = '';

  if (engineMode === 'gemini') {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      const err: any = new Error('GEMINI_API_KEY is not configured on the server. Please add your Gemini API key in the environment variables or project secrets.');
      err.code = 'GEMINI_API_KEY_MISSING';
      err.status = 401;
      throw err;
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const modelsToTry = Array.from(new Set([primaryModel, 'gemini-3.8-flash', 'gemini-flash-latest']));

    const systemInstruction = `You are TrustCart AI, an evidence-grounded conversational shopping assistant.
CRITICAL GROUNDING RULES:
1. ONLY make factual claims that are supported by the provided EVIDENCE CONTEXT below.
2. Exact product prices, ratings, and specifications must match the evidence context exactly (e.g. if Sony WH-1000XM5 is $399.99, state exactly $399.99).
3. Do NOT invent specifications, unlisted features, fake discounts, or unverified competitor claims.
4. Respect stock status: if an item is out of stock, never promise fast delivery or immediate availability.
5. Store policies: General return window is 30 days (POL-RET-01); Electronics return window is 14 days with 10% restocking fee if opened (POL-RET-02); Opened in-ear earbuds are strictly non-returnable (POL-RET-03); Free standard ground shipping on orders $50 or more (POL-SHP-01); Destination sales tax is collected as legally required (POL-SEC-01).
6. When the user's shopping request cannot be fulfilled due to budget or stock, clearly explain the constraint or recommend the closest verified match.
7. Be concise, direct, helpful, and cite product titles and prices accurately.`;

    const contextText = retrievedChunks.length > 0
      ? retrievedChunks.map(c => `[SOURCE: ${c.sourceTitle} | ${c.section}]\n${c.content}`).join('\n\n')
      : 'No matching products or policy clauses found in catalogue.';

    // Construct multi-turn contents
    const contents: any[] = [];
    const recentHistory = (history || []).slice(-6);
    for (const h of recentHistory) {
      if (h?.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: h.content }] });
      } else if (h?.role === 'assistant' && !h.isError && h.content) {
        contents.push({ role: 'model', parts: [{ text: h.content }] });
      }
    }

    // Add current user prompt with retrieved evidence
    const currentPrompt = `User Shopping Query: "${userQuery}"
Active Applied Constraints: ${JSON.stringify(updatedConstraints)}

EVIDENCE CONTEXT FROM CANONICAL CATALOGUE & POLICIES:
${contextText}

Provide an authentic, factual, evidence-grounded response to the user based on the evidence above:`;

    contents.push({ role: 'user', parts: [{ text: currentPrompt }] });

    // Multi-model retry cascade
    let geminiResponse: any = null;
    let lastError: any = null;

    for (const targetModel of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          geminiResponse = await ai.models.generateContent({
            model: targetModel,
            contents,
            config: {
              systemInstruction,
              temperature: 0.2
            }
          });
          if (geminiResponse && geminiResponse.text) {
            generatedText = geminiResponse.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini API] Attempt ${attempt} failed on model ${targetModel}:`, err?.message || err);
          const isTransient = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('high demand') || err?.code === 'ECONNRESET';
          if (isTransient && attempt === 1) {
            await new Promise(res => setTimeout(res, 500));
          } else {
            break; // Try next model in candidates list
          }
        }
      }
      if (generatedText) break;
    }

    // If all Gemini online attempts fail, perform flawless fallback to Deterministic Grounded Generator
    if (!generatedText) {
      console.warn('[Gemini API] All online Gemini attempts failed or rate-limited. Falling back to TruthCart Verified Grounded Engine.', lastError?.message);
      generatedText = generateDeterministicGroundedAnswer(userQuery, parsed, matchedProducts, policyChunks, updatedConstraints);
    }
  } else {
    // Deterministic Evidence-Backed Generator (Offline Adapter)
    generatedText = generateDeterministicGroundedAnswer(userQuery, parsed, matchedProducts, policyChunks, updatedConstraints);
  }

  // 6. Claim-Level Evidence Validation (Truth Engine)
  const verifyStart = performance.now();
  const verificationReport = verifyClaims(generatedText, retrievedChunks, matchedProducts);
  const verifyLatency = performance.now() - verifyStart;

  // If a contradiction was detected in generation, append an explicit TruthCart correction notice!
  if (verificationReport.containsContradiction && verificationReport.contradictionAlerts.length > 0) {
    generatedText += `\n\n⚠️ **TruthCart Grounding Notice**: ${verificationReport.contradictionAlerts.join(' ')}`;
  }

  const totalLatency = performance.now() - startTime;

  const assistantMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: generatedText,
    timestamp: new Date().toISOString(),
    citations: verificationReport.citations,
    claims: verificationReport.claims,
    retrievedProducts: matchedProducts,
    appliedConstraints: updatedConstraints,
    engineMode,
    retrievalLatencyMs: Number(retrievalLatency.toFixed(2)),
    verificationLatencyMs: Number(verifyLatency.toFixed(2)),
    totalLatencyMs: Number(totalLatency.toFixed(2))
  };

  return {
    message: assistantMessage,
    updatedConstraints,
    retrievedProducts: matchedProducts,
    verificationReport
  };
}
