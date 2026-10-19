# TruthCart AI - Seamless Offline & Gemini Fallback Resilience Plan

Guarantees 100% response availability for TruthCart AI when the Gemini API is offline, rate-limited (HTTP 429), or experiencing high demand (HTTP 503). Integrates an automatic, zero-interruption fallback to TruthCart's local Verified Grounded Engine with complete offline search, product comparison, policy Q&A, and claim verification.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your confirmed choices in Phase 1, TruthCart AI will operate with automatic seamless fallback and full local grounded capabilities when online Gemini endpoints are unavailable.

- **Confirmed Decision 1**: **Automatic Seamless Fallback** — TruthCart AI automatically detects online API failures or quota exhaustion and delegates response generation to the local Verified Grounded Engine without throwing errors or interrupting the user session.
- **Confirmed Decision 2**: **Complete Offline Capabilities** — When running in offline grounded mode, TruthCart guarantees full catalogue search, multi-turn constraint persistence, 4-product comparison, policy clause retrieval, and claim-level evidence verification.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades TruthCart AI's full-stack architecture to ensure zero request drops under any external network or Gemini API condition. When Gemini models return 429, 503, 404, or network timeout, the application smoothly transitions to local hybrid retrieval and deterministic evidence generation.
- **Target Audience / Persona**: E-commerce shoppers, product reviewers, and compliance testers who require instant, factual answers and evidence-grounded recommendations regardless of API uptime.
- **Key Value**: 100% uptime SLA for shopping queries, 0% hallucination rate on local grounded fallback, and clear transparency regarding active engine modes and claim verification reports.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Shopping Request**: User inputs natural language query (e.g. "Cotton shirts under ₹2,000" or "Noise cancelling headphones under $150").
  2. **Model Attempt & Cascading Fallback**: Server attempts primary online model (`gemini-3.8-flash`) $\to$ fallback model (`gemini-flash-latest`, `gemini-3.1-flash-lite`) $\to$ local Verified Grounded Engine.
  3. **Response Delivery**: User receives instant, structured recommendations with verified citations, price matches, and warranty terms without error alerts.
  4. **Claim Inspector & Diagnostics**: Sidebar displays real-time claim groundedness score (100%), verified proposition count, and policy citations.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Refined, trustworthy e-commerce workspace with warm paper tones (`#FAF9F6`), forest green accents (`#2E4032`), and crisp tabular data.
  - *Typography & Hierarchy*: Display headings in `Plus Jakarta Sans` / `Outfit`, body prose in `DM Sans`, tabular figures in `tabular-nums` for prices and stock counts.
  - *Component Styling*: Clean unboxed text metadata with `·` separators; zero-pill discipline; single-row 3-zone header contract.
- **Interactive Feedback & Motion**:
  - Quiet engine indicator in header showing active engine state (`Gemini Online` vs `Verified Grounded Engine`).
  - Subtle toast alerts for cart operations and constraint resets.
  - Sub-200ms interactive tab switching across Chat, Catalogue, Comparison, Evidence, Benchmark, and Admin views.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Multi-Model Cascade before Offline Fallback**
  - *Chosen Approach*: Try `gemini-3.8-flash` $\to$ `gemini-flash-latest` $\to$ `gemini-3.1-flash-lite` $\to$ Local Grounded Engine.
  - *Why*: Maximizes the use of online LLM reasoning when quota allows, while ensuring instantaneous zero-latency response if all online quotas are exhausted.
  - *Alternatives Considered*: Direct failure on 429/503 (rejected because it breaks user experience).

- **Decision 2: Complete Local Engine Sovereignty**
  - *Chosen Approach*: Local engine runs BM25 + dense vector hybrid retrieval, constraint parser, pricing/stock verifier, policy engine, and claim validator purely in-memory.
  - *Why*: Eliminates external dependencies for baseline shopping assistance, ensuring full offline capability even in airplane mode or disconnected sandboxes.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                           Browser Frontend                             │
 │  ChatWorkspace  │  ProductDiscovery  │  ComparisonMatrix  │  Inspector │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │ POST /api/chat
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                        Express Server Backend                          │
 │                                                                        │
 │   1. Rate Limiter & Input Validator                                    │
 │   2. Guardrail Check (Tax Evasion / Spec Hallucination Refusals)       │
 │   3. Hybrid Retrieval (BM25 + Cosine RRF + Currency/Budget Parser)     │
 │                                                                        │
 │   4. Model Orchestrator & Multi-Model Cascade:                         │
 │      ├── Attempt 1: Gemini 3.8 Flash                                   │
 │      ├── Attempt 2: Gemini Flash Latest                                │
 │      ├── Attempt 3: Gemini 3.1 Flash Lite                              │
 │      └── Catch (429 / 503 / 404 / Missing Key):                        │
 │          └── Local Deterministic Evidence Generator                     │
 │                                                                        │
 │   5. Claim-Level Verifier (Truth Engine & Contradiction Alerts)         │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      In-Memory Canonical Store                         │
 │  24 Products │ 12 Policies │ 87 Document Chunks │ 1968 Inverted Tokens  │
 └────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State Mapping**:
  - `ChatMessage`: `id`, `role`, `content`, `citations`, `claims`, `retrievedProducts`, `appliedConstraints`, `engineMode`, `totalLatencyMs`.
  - `UserConstraints`: `maxBudget`, `minBudget`, `category`, `brand`, `inStockOnly`, `minRating`, `requiredFeatures`.
  - `VerificationReport`: `claims`, `citations`, `overallGroundedness`, `hallucinationRate`, `verifiedClaimsCount`, `contradictionAlerts`.

- **Verification & Test Strategy**:
  - `npx tsx src/test/suite.ts`: 24 automated unit and integration tests verifying ingestion, budget parsing (₹ and $), out-of-stock filtering, policy matching, claim verification, and adversarial refusals.
  - Server health endpoint `/api/health` and readiness endpoint `/api/readiness`.
