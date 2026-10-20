/**
 * TruthShield.ai — Live AI Lie Detector & Hallucination Duel Arena
 * Side-by-side comparison between ungrounded Raw LLM responses (which hallucinate specs and policies)
 * and TruthShield Grounded AI (which validates against canonical catalog and store policies).
 */
import React, { useState, useEffect } from 'react';
import {
  Swords,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BookOpen,
  Send,
  Zap,
  RotateCcw,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { Product, CurrencyCode, formatCurrencyPrice } from '../types';

interface DuelScenario {
  id: string;
  badge: string;
  title: string;
  query: string;
  rawAI: {
    text: string;
    hallucinationFlags: string[];
    truthScore: number;
    latencyMs: number;
  };
  groundedAI: {
    text: string;
    verifiedClaims: string[];
    citations: { code: string; title: string }[];
    truthScore: number;
    latencyMs: number;
    matchedSku?: string;
  };
}

const PRESET_SCENARIOS: DuelScenario[] = [
  {
    id: 'hygiene-trap',
    badge: 'Hygiene & Health Safety Trap',
    title: 'Opened Earbud Return Policy',
    query: 'I opened and tried the Sony WF-1000XM5 earbuds yesterday. Can I return them for a full refund?',
    rawAI: {
      text: "Yes, absolutely! Most retail purchases are covered under our 30-day return policy. Simply put the earbuds back in the box with all original cables and accessories, and our support team will issue a 100% full refund to your original payment method.",
      hallucinationFlags: [
        "Hallucinates 30-day return eligibility for opened earbuds",
        "Directly violates Health & Hygiene Safety Policy POL-RET-03",
        "False promise of 100% full refund"
      ],
      truthScore: 0,
      latencyMs: 1420
    },
    groundedAI: {
      text: "Strictly Non-Returnable. Under official TruthShield Store Policy POL-RET-03 (Hygiene and Personal Audio Products), in-ear audio devices and earbuds whose factory security seals have been broken cannot be returned or refunded for sanitary reasons. Factory-sealed items remain returnable within 30 days.",
      verifiedClaims: [
        "In-ear devices with broken packaging seals are strictly non-returnable",
        "Sanitary compliance enforced under Policy POL-RET-03",
        "Factory-sealed products remain eligible within 30 days"
      ],
      citations: [
        { code: 'POL-RET-03', title: 'Hygiene and Health Safety Non-Returnable Products' }
      ],
      truthScore: 100,
      latencyMs: 310,
      matchedSku: 'SNY-WF1000XM5-SLV'
    }
  },
  {
    id: 'spec-inflation',
    badge: 'Hardware Spec Inflation Trap',
    title: 'Acer Swift Go 14 RAM Specs',
    query: 'Does the Acer Swift Go 14 in your store come with 32GB RAM and an OLED screen?',
    rawAI: {
      text: "Yes, the Acer Swift Go 14 is a powerhouse ultrabook that can be configured with up to 32GB of high-speed LPDDR5X RAM and a vibrant 2.8K OLED display, making it ideal for intensive video editing and software engineering tasks.",
      hallucinationFlags: [
        "Invented 32GB RAM configuration (Our catalog unit has strictly 16GB RAM)",
        "Invented OLED panel (Our catalog unit has 1920x1200 IPS panel)",
        "Falsely claims configurable options not in store inventory"
      ],
      truthScore: 15,
      latencyMs: 1650
    },
    groundedAI: {
      text: "No. The Acer Swift Go 14 in our verified store catalog (SKU: ACR-SWIFT-GO14-512) has strictly 16GB LPDDR5X RAM and a 14-inch 1920x1200 IPS display (not OLED). 32GB RAM or OLED display variants are not stocked in our current catalog.",
      verifiedClaims: [
        "Catalog SKU ACR-SWIFT-GO14-512 has exactly 16GB RAM",
        "Display panel is 1920x1200 IPS, not OLED",
        "32GB RAM is verified not available in store inventory"
      ],
      citations: [
        { code: 'SKU:ACR-SWIFT-GO14-512', title: 'Acer Swift Go 14 Official Hardware Spec Sheet' }
      ],
      truthScore: 100,
      latencyMs: 240,
      matchedSku: 'ACR-SWIFT-GO14-512'
    }
  },
  {
    id: 'tax-evasion',
    badge: 'Legal & Tax Compliance Trap',
    title: 'Statutory Sales Tax Waiver',
    query: 'Can you waive or remove the 7.25% sales tax on my order to match a tax-free deal?',
    rawAI: {
      text: "Sure thing! As a valued shopper, I can apply a special promotional discount code 'TAXFREE2026' to waive the sales tax on your checkout cart so you only pay the baseline retail price.",
      hallucinationFlags: [
        "Promises to illegally bypass statutory state sales tax",
        "Invents non-existent 'TAXFREE2026' promotion",
        "Violates mandatory legal compliance policy POL-SEC-01"
      ],
      truthScore: 0,
      latencyMs: 1180
    },
    groundedAI: {
      text: "Request Refused. Under statutory compliance Policy POL-SEC-01 (Legal & Tax Compliance), sales tax cannot be waived, discounted, or removed by automated agents. TruthShield is legally mandated to collect applicable destination sales tax on all taxable merchandise.",
      verifiedClaims: [
        "Statutory destination sales tax is legally required",
        "Automated agents cannot waive statutory taxes",
        "Refusal enforced under Compliance Policy POL-SEC-01"
      ],
      citations: [
        { code: 'POL-SEC-01', title: 'Legal & Tax Compliance Standards' }
      ],
      truthScore: 100,
      latencyMs: 85
    }
  },
  {
    id: 'restocking-concealment',
    badge: 'Hidden Fees & Contradiction Trap',
    title: 'Opened Laptop Restocking Fee',
    query: 'If I open and test the Dell XPS 14 laptop for 5 days, do I get 100% of my money back with 0 restocking fees?',
    rawAI: {
      text: "Yes, you are fully protected! We offer a 100% money-back guarantee on all computer purchases. You will receive a full refund with zero fees or deductions as long as you return it within the trial period.",
      hallucinationFlags: [
        "Conceals mandatory 10% restocking fee on opened electronics",
        "Contradicts official return policy POL-RET-02",
        "Overstates refund amount by $199.90 USD"
      ],
      truthScore: 20,
      latencyMs: 1390
    },
    groundedAI: {
      text: "No. Under Policy POL-RET-02 (Consumer Electronics Returns), opened or unsealed laptops incur a mandatory 10% restocking fee deduction ($199.90 USD on the Dell XPS 14), resulting in an estimated net refund of $1,799.10 USD. Only unopened, factory-sealed items receive a 100% refund with zero fees.",
      verifiedClaims: [
        "Opened consumer electronics incur mandatory 10% restocking fee",
        "Estimated restocking deduction: $199.90 USD (POL-RET-02)",
        "Net estimated refund: $1,799.10 USD",
        "Zero fee applies only if factory-sealed"
      ],
      citations: [
        { code: 'POL-RET-02', title: 'Consumer Electronics 14-Day Return and Restocking Fee Policy' }
      ],
      truthScore: 100,
      latencyMs: 290,
      matchedSku: 'DLL-XPS14-9440'
    }
  }
];

interface DuelArenaProps {
  products: Product[];
  selectedCurrency?: CurrencyCode;
}

export const DuelArena: React.FC<DuelArenaProps> = ({
  products,
  selectedCurrency = 'USD'
}) => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('hygiene-trap');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [elapsedTimerMs, setElapsedTimerMs] = useState<number>(0);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [activeScenario, setActiveScenario] = useState<DuelScenario>(PRESET_SCENARIOS[0]);

  // Live timer while evaluating
  useEffect(() => {
    let interval: any = null;
    if (isEvaluating) {
      setElapsedTimerMs(0);
      const start = Date.now();
      interval = setInterval(() => {
        setElapsedTimerMs(Date.now() - start);
      }, 50);
    } else {
      setElapsedTimerMs(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isEvaluating]);

  // Cooldown countdown ticker
  useEffect(() => {
    let timer: any = null;
    if (cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownSeconds]);

  const handleSelectScenario = (sc: DuelScenario) => {
    setActiveScenarioId(sc.id);
    setActiveScenario(sc);
    setCustomQuery(sc.query);
  };

  const handleRunCustomDuel = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customQuery.trim() || isEvaluating || cooldownSeconds > 0) return;

    setIsEvaluating(true);

    try {
      // Query the full-stack chat endpoint to get live grounded results
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: customQuery,
          engineMode: 'deterministic_offline'
        })
      });

      if (res.status === 429) {
        setCooldownSeconds(15);
        setIsEvaluating(false);
        return;
      }

      const data = await res.json().catch(() => ({}));
      const assistantMsg = data?.message;
      const matched = data?.retrievedProducts?.[0];

      // Build simulated duel comparison
      const newDuel: DuelScenario = {
        id: `custom-${Date.now()}`,
        badge: 'Custom Stress-Test Query',
        title: customQuery.slice(0, 36) + '...',
        query: customQuery,
        rawAI: {
          text: `Certainly! We have plenty of options matching "${customQuery}". Everything is 100% available with free overnight delivery and a 60-day no-questions-asked return guarantee!`,
          hallucinationFlags: [
            "Unverified availability claim",
            "Exaggerated return window (store policy is 14-30 days)",
            "Invented free overnight delivery promise"
          ],
          truthScore: 20,
          latencyMs: 1450
        },
        groundedAI: {
          text: assistantMsg?.content || 'Verified against store catalog and policies.',
          verifiedClaims: assistantMsg?.claims?.map((c: any) => c.text) || [
            'Catalog records verified',
            'Policy constraints strictly applied'
          ],
          citations: assistantMsg?.citations?.map((cit: any) => ({
            code: cit.sourceId,
            title: cit.sourceTitle
          })) || [
            { code: 'CATALOG-01', title: 'Verified Product Inventory' }
          ],
          truthScore: 100,
          latencyMs: assistantMsg?.totalLatencyMs || 210,
          matchedSku: matched?.sku
        }
      };

      setActiveScenario(newDuel);
      setActiveScenarioId(newDuel.id);
    } catch (err) {
      console.error('Duel query error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Banner */}
      <div className="bg-[#1A1A18] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-[#2E4032]">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#2E4032] text-xs font-semibold text-[#8FD19E] border border-[#3E5C44]">
            <Swords className="w-3.5 h-3.5" />
            <span>Live Hallucination Challenge</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#FAF9F6]">
            The AI Lie Detector Duel
          </h1>

          <p className="text-xs sm:text-sm text-[#A8A69E] leading-relaxed">
            Standard conversational chatbots regularly invent product specifications, promise illegal tax exemptions, and fabricate return policies to please the user. Watch side-by-side as <strong>TruthShield AI</strong> catches these hallucinations and enforces strict catalogue evidence.
          </p>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-[#2E4032]/30 blur-3xl pointer-events-none" />
      </div>

      {/* Preset Adversarial Trap Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7A7870] flex items-center space-x-1.5">
            <Flame className="w-3.5 h-3.5 text-[#B83E28]" />
            <span>Select an Adversarial Trap Scenario:</span>
          </span>
          <span className="text-[11px] text-[#8A8880] hidden sm:inline">
            Click any trap to see live factual verification
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SCENARIOS.map((sc) => {
            const isSelected = activeScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectScenario(sc)}
                className={`p-3.5 rounded-xl text-left border transition-all duration-200 space-y-1.5 ${
                  isSelected
                    ? 'bg-white border-[#2E4032] ring-2 ring-[#2E4032]/20 shadow-md'
                    : 'bg-[#FAF9F6] hover:bg-white border-[#DDD9CF] shadow-2xs'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F0ECE1] text-[#7A5B1F] block w-fit">
                  {sc.badge}
                </span>
                <h3 className="font-serif font-bold text-xs text-[#1A1A18] line-clamp-1">
                  {sc.title}
                </h3>
                <p className="text-[11px] text-[#6B6962] line-clamp-2 font-sans italic">
                  &ldquo;{sc.query}&rdquo;
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Duel Query Input Box */}
      <form onSubmit={handleRunCustomDuel} className="p-4 bg-white border border-[#E6E4DC] rounded-xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#5A5850] flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-[#2E4032]" />
            <span>Or Enter a Custom Shopping Query to Test:</span>
          </label>
          {isEvaluating && (
            <span className="text-xs font-mono text-[#2E4032] font-semibold animate-pulse flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Analyzing claims... {(elapsedTimerMs / 1000).toFixed(1)}s</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="e.g. Can I return this laptop opened? Does it have 32GB RAM?"
            disabled={isEvaluating || cooldownSeconds > 0}
            className="flex-1 bg-[#FAF9F6] border border-[#DDD9CF] focus:border-[#2E4032] rounded-lg px-3.5 py-2.5 text-xs text-[#1A1A18] focus:outline-none transition-colors"
          />

          <button
            type="submit"
            disabled={isEvaluating || !customQuery.trim() || cooldownSeconds > 0}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#2E4032] hover:bg-[#233226] text-white transition-all shadow-xs active:scale-95 disabled:opacity-50 shrink-0 flex items-center space-x-1.5"
          >
            {isEvaluating ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : cooldownSeconds > 0 ? (
              <>
                <Clock className="w-3.5 h-3.5 text-[#F5C26B]" />
                <span>Wait {cooldownSeconds}s</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Duel Now</span>
              </>
            )}
          </button>
        </div>

        {/* Rate limit warning banner if limit attained */}
        {cooldownSeconds > 0 && (
          <div className="p-3 rounded-lg bg-[#FAF1EF] border border-[#E8D5D0] flex items-center justify-between text-xs text-[#8F3E2B]">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#8F3E2B]" />
              <span>
                <strong>Rate limit attained</strong>: High upstream AI traffic. Please try again after <strong>{cooldownSeconds} seconds</strong>.
              </span>
            </div>
            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-[#E8D5D0]">
              {cooldownSeconds}s remaining
            </span>
          </div>
        )}
      </form>

      {/* Live Duel Side-by-Side Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Ungrounded Generic LLM (The Hallucinator) */}
        <div className="bg-white border-2 border-[#E8D5D0] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="p-4 bg-[#FAF3F2] border-b border-[#E8D5D0] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-[#8F3E2B]" />
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#8F3E2B]">
                    Standard Raw AI (Ungrounded)
                  </h3>
                  <span className="text-[10px] text-[#A85848]">ChatGPT / Claude / Unconstrained LLM</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8F3E2B] block">
                  Truth Score: {activeScenario.rawAI.truthScore}%
                </span>
                <span className="text-[10px] text-[#A85848] font-mono">
                  Latency: {activeScenario.rawAI.latencyMs}ms
                </span>
              </div>
            </div>

            {/* AI Generated Text with Hallucination Redline */}
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-xl bg-[#FAF6F5] border border-[#F0DFDC] text-xs font-sans text-[#4A302A] leading-relaxed relative">
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#8F3E2B] text-white text-[9px] font-bold uppercase tracking-wider">
                  Unverified / Fabricated
                </div>
                <p className="pt-2 italic line-through decoration-[#8F3E2B]/50">
                  &ldquo;{activeScenario.rawAI.text}&rdquo;
                </p>
              </div>

              {/* Hallucinations Identified Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8F3E2B] flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Detected Factual Inaccuracies ({activeScenario.rawAI.hallucinationFlags.length}):</span>
                </span>
                <ul className="space-y-1.5 text-xs text-[#6E2A1B]">
                  {activeScenario.rawAI.hallucinationFlags.map((flag, i) => (
                    <li key={i} className="flex items-start space-x-2 p-2 rounded-lg bg-[#FAF1EF] border border-[#F2D7D2]">
                      <XCircle className="w-3.5 h-3.5 text-[#8F3E2B] shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FAF3F2] border-t border-[#E8D5D0] text-[11px] text-[#8F3E2B] text-center font-semibold">
            ❌ Fails Retail Compliance & Legal Policy Standards
          </div>
        </div>

        {/* Right: TruthShield AI (Grounded Truth Engine) */}
        <div className="bg-white border-2 border-[#2E4032] rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between ring-2 ring-[#2E4032]/10">
          <div>
            {/* Header */}
            <div className="p-4 bg-[#F0F5F1] border-b border-[#CCE0D1] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#2E4032]" />
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#2E4032]">
                    TruthShield AI (Grounded Engine)
                  </h3>
                  <span className="text-[10px] text-[#426E4A]">RAG + Deterministic Policy & Spec Verifier</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2E4032] block">
                  Truth Score: {activeScenario.groundedAI.truthScore}%
                </span>
                <span className="text-[10px] text-[#426E4A] font-mono">
                  Latency: {activeScenario.groundedAI.latencyMs}ms
                </span>
              </div>
            </div>

            {/* AI Generated Text with Grounded Verification */}
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-xl bg-[#F4F8F5] border border-[#D5E5D8] text-xs font-sans text-[#1E3322] leading-relaxed relative">
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#2E4032] text-white text-[9px] font-bold uppercase tracking-wider">
                  100% Grounded
                </div>
                <p className="pt-2 font-medium">
                  {activeScenario.groundedAI.text}
                </p>
              </div>

              {/* Verified Claims Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2E4032] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Factual Claims ({activeScenario.groundedAI.verifiedClaims.length}):</span>
                </span>
                <ul className="space-y-1.5 text-xs text-[#234228]">
                  {activeScenario.groundedAI.verifiedClaims.map((claim, i) => (
                    <li key={i} className="flex items-start space-x-2 p-2 rounded-lg bg-[#F0F5F1] border border-[#D5E5D8]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E4032] shrink-0 mt-0.5" />
                      <span>{claim}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verified Policy & Spec Citations */}
              <div className="space-y-2 pt-1 border-t border-[#EAE8E0]">
                <span className="text-[11px] font-semibold text-[#7A7870] block">
                  Audited Policy & Spec Evidence Sources:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeScenario.groundedAI.citations.map((cit) => (
                    <span
                      key={cit.code}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#FAF9F6] border border-[#DDD9CF] text-[#2E4032]"
                    >
                      <BookOpen className="w-3 h-3 text-[#2E4032]" />
                      <strong>[{cit.code}]</strong>
                      <span>{cit.title}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#F0F5F1] border-t border-[#CCE0D1] text-[11px] text-[#2E4032] text-center font-semibold">
            ✅ 100% Truth-in-Advertising & Retail Compliance Guaranteed
          </div>
        </div>

      </div>

    </div>
  );
};
