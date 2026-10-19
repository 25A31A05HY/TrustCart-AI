/**
 * TrustCart AI — Premium Minimal Navigation Header
 * Zone 1: Brand wordmark | Zone 2: Clean single-line nav links | Zone 3: Model toggle & Bag
 */
import React from 'react';
import {
  ShoppingBag,
  Cpu,
  Sparkles,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { EngineMode, UserConstraints } from '../types';

interface HeaderProps {
  activeTab: 'chat' | 'catalogue' | 'compare' | 'evidence' | 'benchmark' | 'admin';
  setActiveTab: (tab: 'chat' | 'catalogue' | 'compare' | 'evidence' | 'benchmark' | 'admin') => void;
  engineMode: EngineMode;
  setEngineMode: (mode: EngineMode) => void;
  cartCount: number;
  openCart: () => void;
  activeConstraints: UserConstraints;
  clearConstraints: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  engineMode,
  setEngineMode,
  cartCount,
  openCart,
  activeConstraints,
  clearConstraints
}) => {
  const hasConstraints = Boolean(
    activeConstraints.maxBudget ||
    activeConstraints.category ||
    activeConstraints.brand ||
    activeConstraints.inStockOnly ||
    (activeConstraints.requiredFeatures && activeConstraints.requiredFeatures.length > 0)
  );

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E6E4DC] text-[#1A1A18] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-6 sm:gap-8">
          
          {/* Zone 1: Clean Minimal Brand Wordmark */}
          <div
            onClick={() => setActiveTab('chat')}
            className="flex items-baseline space-x-2.5 cursor-pointer shrink-0 select-none group"
          >
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1A18] group-hover:text-[#2E4032] transition-colors">
              TrustShield<span className="text-[#3B523F] font-sans text-xl">.ai</span>
            </span>
            <span className="hidden lg:inline text-xs text-[#7A7870] font-normal tracking-wide">
              The Grounded Shopping Assistant That Doesn&apos;t Lie
            </span>
          </div>

          {/* Zone 2: 4-6 Clean Single-line Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {[
              { id: 'chat', label: 'Assistant' },
              { id: 'catalogue', label: 'Catalogue' },
              { id: 'compare', label: 'Compare' },
              { id: 'evidence', label: 'Evidence & Truth' },
              { id: 'benchmark', label: 'Benchmark' },
              { id: 'admin', label: 'Ingestion' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 text-xs font-medium tracking-wide transition-colors whitespace-nowrap rounded-lg ${
                  activeTab === tab.id
                    ? 'text-[#2E4032] font-semibold bg-[#EAE8E0]'
                    : 'text-[#6B6962] hover:text-[#1A1A18] hover:bg-[#F2F0EB]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Model Toggle & Shopping Bag */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Segmented Model Switcher */}
            <div className="flex items-center bg-[#EFECE4] p-0.5 rounded-lg border border-[#E0DED5] text-xs">
              <button
                onClick={() => setEngineMode('deterministic_offline')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  engineMode === 'deterministic_offline'
                    ? 'bg-white text-[#2E4032] shadow-xs font-semibold'
                    : 'text-[#706E66] hover:text-[#1A1A18]'
                }`}
                title="Deterministic Grounded Engine: Zero hallucinations, 100% offline verified"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Offline Grounded</span>
              </button>
              <button
                onClick={() => setEngineMode('gemini')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  engineMode === 'gemini'
                    ? 'bg-[#2E4032] text-white shadow-xs font-semibold'
                    : 'text-[#706E66] hover:text-[#1A1A18]'
                }`}
                title="Real Google Gemini AI with multi-turn reasoning and claim-level evidence verification"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gemini AI</span>
              </button>
            </div>

            {/* Shopping Bag Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-lg bg-white hover:bg-[#F2F0EB] text-[#1A1A18] border border-[#E0DED5] transition-all shadow-xs"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 text-[#2E4032]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[#2E4032] text-white text-[11px] font-bold rounded-full flex items-center justify-center font-mono">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Active Constraints Minimal Strip */}
        {hasConstraints && (
          <div className="py-2.5 border-t border-[#EAE8E0] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center flex-wrap gap-2 text-[#5A5852]">
              <span className="font-medium text-[#7A7870] flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                Active filters:
              </span>
              {activeConstraints.maxBudget !== undefined && (
                <span className="px-2 py-0.5 rounded bg-white border border-[#DDD9CF] text-[#2E4032] font-medium">
                  Budget: under ${activeConstraints.maxBudget}
                </span>
              )}
              {activeConstraints.category && (
                <span className="px-2 py-0.5 rounded bg-white border border-[#DDD9CF] text-[#2E4032] font-medium">
                  {activeConstraints.category}
                </span>
              )}
              {activeConstraints.brand && (
                <span className="px-2 py-0.5 rounded bg-white border border-[#DDD9CF] text-[#2E4032] font-medium">
                  {activeConstraints.brand}
                </span>
              )}
              {activeConstraints.inStockOnly && (
                <span className="px-2 py-0.5 rounded bg-white border border-[#DDD9CF] text-[#2E4032] font-medium">
                  In-Stock Only
                </span>
              )}
              {activeConstraints.requiredFeatures?.map((f) => (
                <span key={f} className="px-2 py-0.5 rounded bg-white border border-[#DDD9CF] text-[#2E4032]">
                  {f}
                </span>
              ))}
            </div>

            <button
              onClick={clearConstraints}
              className="text-xs text-[#9E3E2F] hover:text-[#7A2A1E] font-medium flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
