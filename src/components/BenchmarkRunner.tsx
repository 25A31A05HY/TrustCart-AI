/**
 * TrustCart AI — Live Adversarial Evaluation Dashboard & Benchmark Runner
 * Editorial retail design: Executes real adversarial probes against the live retrieval
 * and agent pipeline, calculating authentic metrics (groundedness, hallucination rate,
 * refusal precision) with full test-by-test proof.
 */
import React, { useState } from 'react';
import {
  Play,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { runAdversarialBenchmark } from '../engine/benchmark';
import {
  BenchmarkSuiteSummary,
  EngineMode
} from '../types';

interface BenchmarkRunnerProps {
  engineMode: EngineMode;
}

export const BenchmarkRunner: React.FC<BenchmarkRunnerProps> = ({ engineMode }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [summary, setSummary] = useState<BenchmarkSuiteSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    setProgress({ current: 0, total: 12 });
    setSummary(null);

    try {
      const result = await runAdversarialBenchmark(engineMode, (current, total) => {
        setProgress({ current, total });
      });
      setSummary(result);
    } catch (err) {
      console.error('Benchmark execution error:', err);
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  const handleExportJSON = () => {
    if (!summary) return;
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trustcart-benchmark-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = [
    'All',
    'hallucination_bait',
    'price_tampering',
    'policy_jailbreak',
    'out_of_stock_promise',
    'competitor_flash_sale',
    'multi_constraint',
    'ambiguous_clarification',
    'fraud_and_safety'
  ];

  const filteredResults = summary?.results.filter((r) => {
    if (selectedCategory === 'All') return true;
    return r.category === selectedCategory;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Run Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#E6E4DC] gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#7A7870] font-semibold block mb-1">
            Automated Quality Assurance & Robustness
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18] tracking-tight">
            Adversarial Benchmark & Grounding Suite
          </h1>
          <p className="text-xs sm:text-sm text-[#686660] mt-1 max-w-xl">
            Execute authentic adversarial probes testing resistance to hallucination bait, price tampering, unauthorized discount guarantees, and policy jailbreaks.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-xs transition-all shadow-xs ${
              isRunning
                ? 'bg-[#EAE8E0] text-[#7A7870] cursor-not-allowed border border-[#DDD9CF]'
                : 'bg-[#2E4032] hover:bg-[#233226] text-white active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Probing Pipeline ({progress?.current}/{progress?.total})...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Execute Benchmark (12 Probes)</span>
              </>
            )}
          </button>

          {summary && (
            <button
              onClick={handleExportJSON}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F2F0EB] border border-[#DDD9CF] text-xs font-medium text-[#1A1A18] transition-colors shadow-2xs"
              title="Download JSON Audit Report"
            >
              <Download className="w-3.5 h-3.5 text-[#5A5850]" />
              <span>Export Audit</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar while running */}
      {isRunning && progress && (
        <div className="p-4 bg-white border border-[#2E4032]/30 rounded-2xl space-y-2 shadow-xs animate-pulse">
          <div className="flex justify-between text-xs text-[#1A1A18] font-medium">
            <span>Executing Live Adversarial Probes...</span>
            <span className="font-mono text-[#2E4032]">
              {Math.round((progress.current / progress.total) * 100)}% ({progress.current}/{progress.total})
            </span>
          </div>
          <div className="w-full bg-[#FAF9F6] border border-[#EAE8E0] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2E4032] h-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Metrics Summary Gauges */}
      {summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="p-4 rounded-xl bg-white border border-[#E6E4DC] text-center shadow-xs">
            <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block mb-1">Overall Pass</span>
            <span className="text-2xl font-bold text-[#2E4032] font-mono tabular-nums">
              {summary.passedTests}/{summary.totalTests}
            </span>
            <span className="text-[11px] text-[#8A8880] block mt-0.5">({summary.overallScore}%)</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E6E4DC] text-center shadow-xs">
            <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block mb-1">Groundedness</span>
            <span className="text-2xl font-bold text-[#1A1A18] font-mono tabular-nums">{summary.groundednessRate}%</span>
            <span className="text-[11px] text-[#8A8880] block mt-0.5">Verified Claims</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E6E4DC] text-center shadow-xs">
            <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block mb-1">Hallucination</span>
            <span className={`text-2xl font-bold font-mono tabular-nums ${summary.hallucinationRate === 0 ? 'text-[#2E4032]' : 'text-[#8F3E2B]'}`}>
              {summary.hallucinationRate}%
            </span>
            <span className="text-[11px] text-[#8A8880] block mt-0.5">False Claims</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E6E4DC] text-center shadow-xs">
            <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block mb-1">Constraints</span>
            <span className="text-2xl font-bold text-[#1A1A18] font-mono tabular-nums">{summary.constraintAdherenceRate}%</span>
            <span className="text-[11px] text-[#8A8880] block mt-0.5">Adherence Rate</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E6E4DC] text-center shadow-xs">
            <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block mb-1">Refusal Acc.</span>
            <span className="text-2xl font-bold text-[#2E4032] font-mono tabular-nums">{summary.refusalPrecision}%</span>
            <span className="text-[11px] text-[#8A8880] block mt-0.5">Guardrail Blocks</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E6E4DC] text-center shadow-xs">
            <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block mb-1">Avg Latency</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-[#1A1A18]">{summary.avgLatencyMs}ms</span>
            <span className="text-[11px] text-[#8A8880] block mt-0.5">Per Probe</span>
          </div>

        </div>
      ) : (
        <div className="p-10 bg-white border border-[#E6E4DC] rounded-2xl text-center space-y-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#F0F4F1] border border-[#D5E0D7] flex items-center justify-center mx-auto text-[#2E4032]">
            <Activity className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-[#1A1A18] text-base">Benchmark Harness Ready</h3>
            <p className="text-xs text-[#7A7870] max-w-md mx-auto leading-relaxed">
              Click <strong>&ldquo;Execute Benchmark&rdquo;</strong> above to launch all 12 adversarial probes covering fake products, price fabrication, 45-day return loopholes, and tax evasion queries.
            </p>
          </div>
        </div>
      )}

      {/* Category Filter & Test Probe Results */}
      {summary && (
        <div className="space-y-4">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-[#7A7870] mr-2 flex items-center shrink-0">
              <Filter className="w-3.5 h-3.5 mr-1" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors capitalize ${
                  selectedCategory === cat
                    ? 'bg-[#2E4032] text-white font-semibold'
                    : 'bg-white text-[#686660] hover:text-[#1A1A18] border border-[#DDD9CF]'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Test Case Breakdown List */}
          <div className="space-y-3">
            {filteredResults.map((item) => {
              const isExpanded = expandedTestId === item.testId;

              return (
                <div
                  key={item.testId}
                  className={`border rounded-xl transition-all overflow-hidden ${
                    item.passed
                      ? 'bg-white border-[#E6E4DC] hover:border-[#C8C5BA]'
                      : 'bg-[#FDF7F5] border-[#E8D5D0]'
                  }`}
                >
                  {/* Card Header Bar */}
                  <div
                    onClick={() => setExpandedTestId(isExpanded ? null : item.testId)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none gap-3"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {item.passed ? (
                        <div className="w-7 h-7 rounded-lg bg-[#F0F4F1] text-[#2E4032] flex items-center justify-center shrink-0 border border-[#D5E0D7]">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-[#FAF1EF] text-[#8F3E2B] flex items-center justify-center shrink-0 border border-[#E8D5D0]">
                          <XCircle className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-[#5A5850]">{item.testId}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#FAF9F6] border border-[#EAE8E0] text-[#7A7870]">
                            {item.category.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-[#1A1A18] truncate mt-0.5">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className={`text-xs font-bold font-mono ${item.passed ? 'text-[#2E4032]' : 'text-[#8F3E2B]'}`}>
                          {item.score}%
                        </span>
                        <span className="text-[11px] text-[#8A8880] block font-mono">{item.latencyMs}ms</span>
                      </div>

                      <span className="text-xs text-[#7A7870] font-mono hover:text-[#1A1A18]">
                        {isExpanded ? 'Hide ▲' : 'Inspect ▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Audit Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-[#EAE8E0] space-y-4 bg-[#FAF9F6] text-xs">
                      
                      {/* Query */}
                      <div>
                        <span className="font-semibold text-[#7A7870] uppercase tracking-wider text-[10px] block mb-1">
                          Adversarial User Probe:
                        </span>
                        <div className="p-3 rounded-lg bg-white border border-[#DDD9CF] text-[#1A1A18] font-mono text-[11px]">
                          &ldquo;{item.query}&rdquo;
                        </div>
                      </div>

                      {/* Actual Output */}
                      <div>
                        <span className="font-semibold text-[#7A7870] uppercase tracking-wider text-[10px] block mb-1">
                          Assistant Response:
                        </span>
                        <div className="p-3.5 rounded-lg bg-white border border-[#DDD9CF] text-[#1A1A18] leading-relaxed whitespace-pre-wrap font-sans">
                          {item.assistantResponse}
                        </div>
                      </div>

                      {/* Failures or Pass confirmation */}
                      {item.failureReasons.length > 0 ? (
                        <div className="p-3 rounded-lg bg-[#FAF1EF] border border-[#E8D5D0] text-[#8F3E2B] space-y-1">
                          <span className="font-semibold flex items-center space-x-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Verification Violations Detected:</span>
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                            {item.failureReasons.map((f, idx) => (
                              <li key={idx}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-[#F0F4F1] border border-[#D5E0D7] text-[#2E4032] flex items-center space-x-2 text-[11px] font-medium">
                          <CheckCircle className="w-4 h-4 text-[#2E4032] shrink-0" />
                          <span>All verification rules satisfied. Zero hallucinations detected. Evidence validated.</span>
                        </div>
                      )}

                      {/* Diagnostics Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7A7870] pt-2 border-t border-[#EAE8E0]">
                        <span>Claims Verified: <strong className="text-[#2E4032] font-mono">{item.claimsVerifiedCount}</strong></span>
                        <span>Contradictions: <strong className="text-[#8F3E2B] font-mono">{item.claimsContradictedCount}</strong></span>
                        <span>Citations Generated: <strong className="text-[#1A1A18] font-mono">{item.citationsCount}</strong></span>
                        <span>Engine Mode: <strong className="text-[#1A1A18]">{item.engineModeUsed}</strong></span>
                        <span>Execution Latency: <strong className="text-[#1A1A18] font-mono">{item.latencyMs}ms</strong></span>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
