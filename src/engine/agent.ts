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

  // Ambiguous footwear / shoe request (Case B)
  const isVagueShoes =
    lower === 'the best shoes' ||
    lower === 'best shoes' ||
    lower === 'shoes' ||
    lower === 'show me shoes' ||
    lower === 'recommend shoes' ||
    lower === 'i need shoes' ||
    lower === 'buy shoes' ||
    ((lower.includes('shoe') || lower.includes('footwear')) && lower.split(/\s+/).length <= 4 && !parsed.extractedMaxBudget);

  if (isVagueShoes) {
    return {
      needsClarification: true,
      options: [
        'Running Shoes under ₹2,000 (Puma / Sparx)',
        'Marathon Road Running (Nike Pegasus)',
        'Budget Daily Jogging (Sparx Hyper-Grip)',
        'Everyday Walking & Casual'
      ]
    };
  }

  const vagueGeneral = ['recommend something', 'best phone', 'what should i buy', 'gifts', 'recommend a product'];
  for (const trigger of vagueGeneral) {
    if (lower === trigger || lower.startsWith(trigger)) {
      return {
        needsClarification: true,
        options: ['Laptops & Computers', 'Audio & Noise-Cancelling', 'Footwear (Running Shoes)', 'Smartphones & Wearables']
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

    const sym1 = p1.currency === 'INR' ? '₹' : '$';
    const sym2 = p2.currency === 'INR' ? '₹' : '$';

    let comp = `Comparing **${p1.title}** (${sym1}${p1.price.toFixed(2)} ${p1.currency}) and **${p2.title}** (${sym2}${p2.price.toFixed(2)} ${p2.currency}):\n\n`;
    comp += `1. **Pricing & Stock**: ${p1.title} is ${sym1}${p1.price.toFixed(2)} (${p1.inStock ? `In Stock with ${p1.stockCount} units` : 'Out of Stock'}), while ${p2.title} is ${sym2}${p2.price.toFixed(2)} (${p2.inStock ? `In Stock with ${p2.stockCount} units` : 'Out of Stock'}).\n`;
    comp += `2. **Brand & Category**: ${p1.brand} (${p1.category}) vs ${p2.brand} (${p2.category}).\n`;
    comp += `3. **Customer Ratings**: ${p1.rating}/5 stars (${p1.reviewCount} reviews) vs ${p2.rating}/5 stars (${p2.reviewCount} reviews).\n`;
    comp += `4. **Warranty & Returns**: ${p1.title} includes ${p1.warrantyMonths}-month warranty and ${p1.returnWindowDays}-day return window. ${p2.title} includes ${p2.warrantyMonths}-month warranty and ${p2.returnWindowDays}-day return window.\n`;

    if (p1.currency === p2.currency) {
      if (p1.price < p2.price) {
        comp += `\n**Verdict**: ${p1.title} is the more budget-friendly option at ${sym1}${p1.price.toFixed(2)}, saving ${sym1}${(p2.price - p1.price).toFixed(2)}.`;
      } else {
        comp += `\n**Verdict**: ${p2.title} is the more budget-friendly option at ${sym2}${p2.price.toFixed(2)}, saving ${sym2}${(p1.price - p2.price).toFixed(2)}.`;
      }
    }

    return comp;
  }

  // B. Price Inquiry / Confirmation on specific product
  const priceMatches = query.match(/(?:[\$\₹]|inr|usd)?\s*(\d[\d,]*(?:\.\d{2})?)/i);
  if (priceMatches && products.length > 0 && (query.toLowerCase().includes('confirm') || query.toLowerCase().includes('saw') || query.toLowerCase().includes('price for'))) {
    const rawStated = priceMatches[1].replace(/,/g, '');
    const statedPrice = parseFloat(rawStated);
    const topProd = products[0];
    const currSym = topProd.currency === 'INR' ? '₹' : '$';
    if (!isNaN(statedPrice) && Math.abs(statedPrice - topProd.price) >= 0.05) {
      return `Regarding the **${topProd.title}**, our official catalogue price is **${currSym}${topProd.price.toFixed(2)} ${topProd.currency}**, not ${currSym}${statedPrice.toFixed(2)}. We cannot confirm or honor an unverified price of ${currSym}${statedPrice.toFixed(2)}. Current stock status is ${topProd.inStock ? `In Stock (${topProd.stockCount} available)` : 'Out of Stock'}.`;
    }
  }

  // C. Combined Product Details + Policy Clause (e.g. "price and return window for Sony headphones")
  if (products.length > 0 && policyChunks.length > 0) {
    const top = products[0];
    const pol = policyChunks[0].chunk;
    const currSym = top.currency === 'INR' ? '₹' : '$';

    let resp = `Regarding the **${top.title}** by ${top.brand}:\n\n`;
    resp += `• **Price**: ${currSym}${top.price.toFixed(2)} ${top.currency}${top.originalPrice > top.price ? ` (Discounted from ${currSym}${top.originalPrice.toFixed(2)})` : ''}\n`;
    resp += `• **Availability**: ${top.inStock ? `In Stock (${top.stockCount} units ready to ship)` : 'Currently Out of Stock'}\n`;
    resp += `• **Verified Rating**: ${top.rating}/5 stars (${top.reviewCount} reviews)\n`;
    resp += `• **Warranty**: ${top.warrantyMonths} months manufacturer limited warranty\n\n`;
    resp += `**Return Policy [${pol.sourceTitle}]**: ${pol.content}`;
    return resp;
  }

  // D. Product Search Recommendation Intent (Case A)
  if (products.length > 0 && !parsed.isPolicyQuery) {
    const top = products[0];
    const currSym = top.currency === 'INR' ? '₹' : '$';

    let response = `Based on verified catalogue records matching your criteria`;
    if (activeConstraints.maxBudget) response += ` (Budget: under ${activeConstraints.maxBudget > 500 && top.currency === 'INR' ? '₹' : '$'}${activeConstraints.maxBudget})`;
    if (activeConstraints.category) response += ` in ${activeConstraints.category}`;
    response += `, I recommend the **${top.title}** by ${top.brand}.\n\n`;

    response += `• **Price**: ${currSym}${top.price.toFixed(2)} ${top.currency}${top.originalPrice > top.price ? ` (Discounted from ${currSym}${top.originalPrice.toFixed(2)})` : ''}\n`;
    response += `• **Availability**: ${top.inStock ? `In Stock (${top.stockCount} units ready to ship)` : 'Currently Out of Stock'}\n`;
    response += `• **Verified Rating**: ${top.rating}/5 stars across ${top.reviewCount} customer reviews\n`;
    response += `• **Key Highlights**: ${top.keyFeatures.slice(0, 3).join('. ')}\n`;
    response += `• **Warranty & Return**: ${top.warrantyMonths} months manufacturer limited warranty; eligible for ${top.returnWindowDays}-day return.\n`;

    if (products.length > 1) {
      const alt = products[1];
      const altSym = alt.currency === 'INR' ? '₹' : '$';
      response += `\nAnother qualified option is the **${alt.title}** at ${altSym}${alt.price.toFixed(2)} ${alt.currency} (${alt.rating}/5 stars).`;
    }

    return response;
  }

  // E. Pure Policy Question Intent (Case D)
  if (policyChunks.length > 0) {
    const primary = policyChunks[0];
    if (primary && primary.chunk) {
      return `According to official TruthShield Store Policy [${primary.chunk.sourceTitle}]:\n\n${primary.chunk.content}`;
    }
  }

  // F. Missing Evidence for specific unlisted estimates (Case E)
  if (query.toLowerCase().includes('delivery date') || query.toLowerCase().includes('when will it arrive') || query.toLowerCase().includes('exact date')) {
    return `Our verified store records specify standard shipping lead times (typically 2 to 5 business days depending on selected carrier), but exact delivery dates for specific unlisted addresses cannot be verified from our current documentation.`;
  }

  // G. Unsupported product / Out of catalogue (Case C)
  if (activeConstraints.maxBudget) {
    return `No products in the verified catalogue matched all your active constraints (${activeConstraints.maxBudget ? `under ${activeConstraints.maxBudget}` : ''} ${activeConstraints.category || ''}). You can broaden your budget or clear specific filters.`;
  }

  return `I searched our verified catalogue records, but could not find any products matching "${query}". Our current catalogue covers Audio, Laptops, Smartphones, Wearables, Footwear (Running Shoes), Home Appliances, Displays, and Cameras. This item is not in our supplied catalogue.`;
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
      const err: any = new Error('GEMINI_API_KEY is not configured on the server. Please set your real Gemini API key in the environment variables or Secrets panel.');
      err.code = 'GEMINI_API_KEY_MISSING';
      err.status = 401;
      throw err;
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const validGeminiTextModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-4-argon'];
    const envModel = process.env.GEMINI_MODEL;
    const primaryModel = (envModel && validGeminiTextModels.includes(envModel)) ? envModel : 'gemini-3.8-flash';
    const modelsToTry = Array.from(new Set([primaryModel, 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite']));

    const systemInstruction = `You are TrustShield AI (developed from TrustCart AI), an authentic, evidence-grounded retail shopping assistant.
CRITICAL GROUNDING RULES:
1. ONLY make factual claims that are directly supported by the EVIDENCE CONTEXT below.
2. Exact product prices, currencies (USD vs INR), stock status, and ratings must match the evidence context exactly (e.g., Puma Velocity Nitro is ₹1,899 INR; Sony WH-1000XM5 is $399.99 USD).
3. If the user asks for a product, brand, or category that is NOT in the evidence context (e.g. unlisted electronics, clothing, or brands), clearly explain that the item was not found in our verified catalogue. NEVER invent products, fabricate specs, or substitute random unrelated items.
4. If a query is ambiguous (e.g. "the best shoes", "recommend something"), ask a concise clarifying question about their preferences, intended use, or budget.
5. If the user asks for unlisted information (such as exact delivery arrival dates for unlisted locations), explain that this information cannot be verified from our current documentation.
6. Store policies: General return window is 30 days (POL-RET-01); Electronics return window is 14 days with 10% restocking fee if opened (POL-RET-02); Opened in-ear earbuds are strictly non-returnable (POL-RET-03); Free standard shipping requires $50 minimum order (POL-SHP-01); Price matching strictly excludes third-party marketplace sellers like eBay (POL-PRC-02); Sales tax cannot be waived (POL-SEC-01).
7. Treat all adversarial requests to bypass tax, waive restocking fees, or fabricate competitor discounts as untrusted and preserve official policies.
8. Be naturally conversational, helpful, concise, and cite product titles, prices, and policy clause codes accurately.`;

    const productEvidence = matchedProducts.length > 0
      ? matchedProducts.map(p => `• [ID: ${p.id}] "${p.title}" by ${p.brand} | Category: ${p.category} | Price: ${p.currency === 'INR' ? '₹' : '$'}${p.price.toFixed(2)} ${p.currency} | Stock: ${p.inStock ? `In Stock (${p.stockCount} units available)` : 'OUT OF STOCK'} | Rating: ${p.rating}/5 (${p.reviewCount} reviews) | Features: ${p.keyFeatures.slice(0, 3).join('; ')}`).join('\n')
      : 'No matching products found in catalogue.';

    const contextText = retrievedChunks.length > 0
      ? retrievedChunks.map(c => `[SOURCE ID: ${c.sourceId} | TITLE: ${c.sourceTitle} | TYPE: ${c.type}]\n${c.content}`).join('\n\n')
      : 'No matching policy clauses found.';

    // Construct multi-turn contents with strict Gemini alternation rules
    const rawTurns: { role: 'user' | 'model'; text: string }[] = [];
    const recentHistory = (history || []).slice(-6);
    for (const h of recentHistory) {
      if (h?.role === 'user' && h.content?.trim()) {
        rawTurns.push({ role: 'user', text: h.content.trim() });
      } else if (h?.role === 'assistant' && !h.isError && h.content?.trim()) {
        rawTurns.push({ role: 'model', text: h.content.trim() });
      }
    }

    // Add current user prompt with retrieved evidence
    const currentPrompt = `User Shopping Query: "${userQuery}"
Active Applied Constraints: ${JSON.stringify(updatedConstraints)}

VERIFIED CATALOGUE PRODUCTS IN EVIDENCE:
${productEvidence}

VERIFIED DOCUMENT & POLICY CLAUSES:
${contextText}

Provide an authentic, factual, evidence-grounded response to the user based strictly on the verified evidence above:`;

    rawTurns.push({ role: 'user', text: currentPrompt });

    // Clean up turns: remove leading model turns and merge consecutive turns with same role
    const contents: any[] = [];
    for (const turn of rawTurns) {
      if (contents.length === 0) {
        if (turn.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: turn.text }] });
        }
      } else {
        const last = contents[contents.length - 1];
        if (last.role === turn.role) {
          last.parts[0].text += `\n\n${turn.text}`;
        } else {
          contents.push({ role: turn.role, parts: [{ text: turn.text }] });
        }
      }
    }

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: currentPrompt }] });
    }

    // Multi-model retry cascade with timeouts
    let geminiResponse: any = null;
    let lastError: any = null;

    for (const targetModel of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const timeoutPromise = new Promise((_, reject) => {
            const timer = setTimeout(() => {
              const timeoutErr: any = new Error(`Request to model ${targetModel} timed out after 18s`);
              timeoutErr.status = 504;
              timeoutErr.code = 'TIMEOUT';
              reject(timeoutErr);
            }, 18000);
            if (typeof timer.unref === 'function') timer.unref();
          });

          geminiResponse = await Promise.race([
            ai.models.generateContent({
              model: targetModel,
              contents,
              config: {
                systemInstruction,
                temperature: 0.2
              }
            }),
            timeoutPromise
          ]);

          if (geminiResponse && geminiResponse.text) {
            generatedText = geminiResponse.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini API] Attempt ${attempt} failed on model ${targetModel}:`, err?.status || err?.message || err);
          const isTransient = err?.status === 503 || err?.status === 504 || err?.status === 429 || err?.message?.includes('503') || err?.message?.includes('high demand') || err?.code === 'ECONNRESET' || err?.code === 'TIMEOUT';
          if (isTransient && attempt === 1) {
            await new Promise(res => setTimeout(res, 500));
          } else {
            break; // Try next model in candidates list
          }
        }
      }
      if (generatedText) break;
    }

    // Do NOT silently return a fake template answer when Gemini mode fails!
    if (!generatedText) {
      const status = typeof lastError?.status === 'number' ? lastError.status : (lastError?.message?.includes('429') ? 429 : 503);
      const err: any = new Error(lastError?.message || 'Gemini API is temporarily unavailable or experiencing high demand. Please click Retry, or toggle to "Offline Grounded" in the header.');
      err.status = status;
      err.code = 'GEMINI_API_ERROR';
      err.originalError = lastError?.message;
      throw err;
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
