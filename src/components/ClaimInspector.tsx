/**
 * TrustCart AI — Claim-Level Evidence & Truth Inspector Component
 * Editorial retail design: Real-time verification audit showing atomic claims,
 * verified propositions, confidence meters, and chunk provenance.
 */
import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  FileText,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import { ChatMessage, Citation } from '../types';

interface ClaimInspectorProps {
  latestMessage?: ChatMessage;
  onSelectCitation?: (citation: Citation) => void;
}

export const ClaimInspector: React.FC<ClaimInspectorProps> = ({
  latestMessage,
  onSelectCitation
}) => {
  if (!latestMessage || latestMessage.role !== 'assistant') {
    return (
      <div className="bg-white border border-[#E6E4DC] rounded-2xl p-6 text-center space-y-3.5 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-[#F4F3EE] flex items-center justify-center mx-auto text-[#2E4032] border border-[#E0DED5]">
          <Layers className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-[#1A1A18] text-base">Evidence & Truth Inspector</h3>
          <p className="text-xs text-[#7A7870] leading-relaxed max-w-sm mx-auto">
            Ask any product inquiry or policy question in the assistant. Every factual proposition is decomposed into verifiable atomic claims and cross-referenced against authoritative catalogue specifications.
          </p>
        </div>
      </div>
    );
  }

  const claims = latestMessage.claims || [];
  const citations = latestMessage.citations || [];
  const verifiedCount = claims.filter(c => c.status === 'VERIFIED').length;
  const contradictedCount = claims.filter(c => c.status === 'CONTRADICTED').length;
  const unverifiedCount = claims.filter(c => c.status === 'UNVERIFIED').length;
  const total = claims.length || 1;
  const groundednessRate = Math.round((verifiedCount / total) * 100);

  return (
    <div className="bg-white border border-[#E6E4DC] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
      
      {/* Header & Turn Audit Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-5 border-b border-[#EAE8E0] gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#2E4032]" />
            <h3 className="font-serif font-bold text-base text-[#1A1A18]">Audit & Evidence Report</h3>
          </div>
          <p className="text-xs text-[#7A7870] mt-1">
            Turn Reference: <span className="font-mono text-[#4A4842]">{latestMessage.id}</span>
          </p>
        </div>

        {/* Engine mode pill */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F6F5F1] text-[#2E4032] border border-[#DDD9CF]">
            {latestMessage.engineMode === 'gemini' ? 'Gemini 3.8 Flash' : 'Offline Grounded Engine'}
          </span>
          {latestMessage.totalLatencyMs !== undefined && (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-[#F6F5F1] text-[#5A5850] border border-[#DDD9CF]">
              <Clock className="w-3.5 h-3.5 text-[#7A7870]" />
              <span>{latestMessage.totalLatencyMs}ms</span>
            </span>
          )}
        </div>
      </div>

      {/* Metric Gauges Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#EAE8E0] text-center">
          <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block">Groundedness</span>
          <span className="text-xl font-bold text-[#2E4032] font-mono tabular-nums">{groundednessRate}%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#EAE8E0] text-center">
          <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block">Verified Claims</span>
          <span className="text-xl font-bold text-[#1A1A18] font-mono tabular-nums">
            {verifiedCount} <span className="text-xs text-[#8A8880] font-normal">/ {claims.length}</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#EAE8E0] text-center">
          <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block">Contradictions</span>
          <span className={`text-xl font-bold font-mono tabular-nums ${contradictedCount > 0 ? 'text-[#8F3E2B]' : 'text-[#7A7870]'}`}>
            {contradictedCount}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#EAE8E0] text-center">
          <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block">Citations</span>
          <span className="text-xl font-bold text-[#1A1A18] font-mono tabular-nums">{citations.length}</span>
        </div>
      </div>

      {/* Latency Breakdown Bar */}
      {(latestMessage.retrievalLatencyMs !== undefined || latestMessage.verificationLatencyMs !== undefined) && (
        <div className="px-3.5 py-2.5 rounded-xl bg-[#FBFBFA] border border-[#EAE8E0] flex items-center justify-between text-xs text-[#7A7870]">
          <span className="font-medium">Pipeline Timing:</span>
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            {latestMessage.retrievalLatencyMs !== undefined && (
              <span>Retrieval: <strong className="text-[#1A1A18]">{latestMessage.retrievalLatencyMs}ms</strong></span>
            )}
            {latestMessage.verificationLatencyMs !== undefined && (
              <span>Verification: <strong className="text-[#1A1A18]">{latestMessage.verificationLatencyMs}ms</strong></span>
            )}
            <span>Total: <strong className="text-[#2E4032]">{latestMessage.totalLatencyMs}ms</strong></span>
          </div>
        </div>
      )}

      {/* Atomic Claims List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5850]">
            Atomic Claim Evaluation ({claims.length})
          </h4>
          <span className="text-[11px] text-[#8A8880]">Cross-checked against canonical records</span>
        </div>

        {claims.length === 0 ? (
          <p className="text-xs text-[#7A7870] italic p-3.5 bg-[#FAF9F6] rounded-xl border border-[#EAE8E0]">
            No factual propositions extracted in this response.
          </p>
        ) : (
          <div className="space-y-2.5">
            {claims.map((claim) => (
              <div
                key={claim.claimId}
                className={`p-3.5 rounded-xl border transition-all ${
                  claim.status === 'VERIFIED'
                    ? 'bg-[#FBFDFB] border-[#D5E0D7]'
                    : claim.status === 'CONTRADICTED'
                    ? 'bg-[#FDF7F5] border-[#E8D5D0]'
                    : 'bg-[#FDFCF8] border-[#EBDCB8]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-[#DDD9CF] text-[#5A5850]">
                      {claim.claimId}
                    </span>
                    {claim.status === 'VERIFIED' && (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-[#2E4032]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>VERIFIED ({Math.round(claim.confidence * 100)}%)</span>
                      </span>
                    )}
                    {claim.status === 'CONTRADICTED' && (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-[#8F3E2B]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>CONTRADICTED</span>
                      </span>
                    )}
                    {claim.status === 'UNVERIFIED' && (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-[#8A6820]">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>UNVERIFIED</span>
                      </span>
                    )}
                  </div>

                  {claim.sourceCitation && (
                    <button
                      onClick={() => onSelectCitation && onSelectCitation(claim.sourceCitation!)}
                      className="text-[11px] font-medium text-[#2E4032] hover:text-[#1A1A18] underline underline-offset-2 flex items-center space-x-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{claim.sourceCitation.sourceTitle}</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#1A1A18] leading-relaxed font-sans">
                  &ldquo;{claim.text}&rdquo;
                </p>

                {claim.contradictionExplanation && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-[#FAF1EF] border border-[#E8D5D0] text-[11px] text-[#8F3E2B] flex items-start space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#8F3E2B] shrink-0 mt-0.5" />
                    <span>{claim.contradictionExplanation}</span>
                  </div>
                )}

                {claim.sourceCitation && (
                  <div className="mt-2 text-[11px] text-[#5A5850] p-2 rounded-lg bg-white border border-[#E2E0D6] flex items-start space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-[#7A7870] shrink-0 mt-0.5" />
                    <span className="italic">&ldquo;{claim.sourceCitation.snippet}&rdquo;</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Citations List */}
      {citations.length > 0 && (
        <div className="pt-4 border-t border-[#EAE8E0] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5850]">
            Grounding Citations ({citations.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {citations.map((cit) => (
              <div
                key={cit.id}
                onClick={() => onSelectCitation && onSelectCitation(cit)}
                className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E6E4DC] hover:border-[#2E4032] cursor-pointer transition-colors text-xs space-y-1 group"
              >
                <div className="flex items-center justify-between text-[#1A1A18] font-medium">
                  <span className="truncate pr-2 font-semibold group-hover:text-[#2E4032] transition-colors">
                    {cit.sourceTitle}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-[#DDD9CF] text-[#7A7870] uppercase">
                    {cit.type}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6962] line-clamp-2 italic">
                  &ldquo;{cit.snippet}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
