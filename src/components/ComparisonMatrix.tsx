/**
 * TrustCart AI — Product Comparison Matrix Screen
 * Editorial retail design: Clean tabular side-by-side specification comparison
 * using canonical database records. Non-existent specs are explicitly rendered
 * as "Not available in catalogue".
 * Includes interactive Difference Highlighting mode.
 */
import React, { useState } from 'react';
import {
  Scale,
  X,
  Star,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { Product, CurrencyCode, formatCurrencyPrice } from '../types';

interface ComparisonMatrixProps {
  products: Product[];
  comparedProducts: Product[];
  onRemoveCompare: (productId: string) => void;
  onAddCompare: (product: Product) => void;
  onClearCompare: () => void;
  onAddToCart: (product: Product) => void;
  selectedCurrency?: CurrencyCode;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  products,
  comparedProducts,
  onRemoveCompare,
  onAddCompare,
  onClearCompare,
  onAddToCart,
  selectedCurrency = 'USD'
}) => {
  const [highlightDiffs, setHighlightDiffs] = useState<boolean>(true);

  // Collect union of all spec keys across compared products
  const allSpecKeys = Array.from(
    new Set(
      comparedProducts.flatMap((p) => Object.keys(p.specs || {}))
    )
  ).sort();

  // Find lowest price
  const lowestPrice = comparedProducts.length > 0
    ? Math.min(...comparedProducts.map(p => {
        return formatCurrencyPrice(p.price, p.currency, selectedCurrency).convertedAmount;
      }))
    : 0;

  // Find highest rating
  const highestRating = comparedProducts.length > 0
    ? Math.max(...comparedProducts.map(p => p.rating))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E6E4DC] gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#7A7870] font-semibold block mb-1">
            Deterministic Side-by-Side Analysis
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18] tracking-tight">
            Verified Specification Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[#686660] mt-1 max-w-xl">
            Compare official catalogue specifications side-by-side. Differing specs are automatically highlighted to assist your purchase decision.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {comparedProducts.length > 1 && (
            <button
              type="button"
              onClick={() => setHighlightDiffs(!highlightDiffs)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                highlightDiffs
                  ? 'bg-[#F2ECE1] border-[#C8BFA8] text-[#5A451A]'
                  : 'bg-white border-[#DDD9CF] text-[#686660] hover:bg-[#F9F8F5]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#5A451A]" />
              <span>Highlight Differences: <strong className="font-bold">{highlightDiffs ? 'ON' : 'OFF'}</strong></span>
            </button>
          )}

          {comparedProducts.length > 0 && (
            <button
              onClick={onClearCompare}
              className="text-xs text-[#8F3E2B] hover:text-[#6E2A1B] font-medium underline underline-offset-2 transition-colors"
            >
              Clear Matrix ({comparedProducts.length})
            </button>
          )}
        </div>
      </div>

      {/* Select Products to Compare Bar */}
      <div className="p-4 bg-white border border-[#E6E4DC] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <span className="text-[#4A4842] font-medium">Add product to matrix:</span>
        <div className="flex items-center space-x-2">
          <select
            onChange={(e) => {
              const selected = products.find(p => p.id === e.target.value);
              if (selected) onAddCompare(selected);
              e.target.value = '';
            }}
            defaultValue=""
            className="bg-[#FAF9F6] border border-[#D5D3C9] rounded-lg px-3 py-2 text-xs text-[#1A1A18] focus:outline-none focus:border-[#2E4032] transition-colors"
          >
            <option value="" disabled>Select an item from the verified catalogue...</option>
            {products
              .filter(p => !comparedProducts.some(cp => cp.id === p.id))
              .map(p => {
                const pr = formatCurrencyPrice(p.price, p.currency, selectedCurrency);
                return (
                  <option key={p.id} value={p.id}>
                    {p.title} ({pr.formatted})
                  </option>
                );
              })}
          </select>
        </div>
      </div>

      {comparedProducts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E6E4DC] rounded-2xl space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#F4F3EE] flex items-center justify-center mx-auto text-[#686660]">
            <Scale className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#1A1A18]">No products currently in comparison</h3>
            <p className="text-xs text-[#7A7870] max-w-sm mx-auto">
              Select products from the Catalogue tab or click the Compare icon on any product card to see side-by-side spec verification.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E6E4DC] bg-white shadow-xs">
          <table className="w-full border-collapse text-left text-xs min-w-[700px]">
            
            {/* Table Header: Product Cards */}
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E6E4DC]">
                <th className="p-4 w-48 font-serif font-bold text-[#1A1A18] text-sm align-top sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC]">
                  <div className="space-y-1">
                    <span>Attribute / Spec</span>
                    {highlightDiffs && comparedProducts.length > 1 && (
                      <div className="flex items-center space-x-1 text-[10px] text-[#8C6D23] font-sans font-normal pt-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Diff highlighting active</span>
                      </div>
                    )}
                  </div>
                </th>

                {comparedProducts.map((p) => {
                  const pr = formatCurrencyPrice(p.price, p.currency, selectedCurrency);
                  const isLowest = pr.convertedAmount === lowestPrice && comparedProducts.length > 1;

                  return (
                    <th key={p.id} className="p-4 w-64 align-top border-l border-[#E6E4DC]">
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => onRemoveCompare(p.id)}
                          className="p-1 rounded-md text-[#9A9890] hover:text-[#8F3E2B] hover:bg-[#EFECE5] transition-colors"
                          title="Remove from comparison"
                          aria-label={`Remove ${p.title} from comparison`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#F4F3EE] mb-3 border border-[#EAE8E0]">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      <span className="text-[10px] uppercase font-semibold tracking-wider text-[#7A7870]">{p.brand}</span>
                      <h3 className="font-serif font-bold text-xs text-[#1A1A18] line-clamp-2 mt-0.5" title={p.title}>
                        {p.title}
                      </h3>

                      <div className="mt-2 flex items-baseline space-x-1.5">
                        <span className="text-base font-bold text-[#1A1A18] font-mono tabular-nums">
                          {pr.formatted}
                        </span>
                        <span className="text-[10px] text-[#7A7870]">{selectedCurrency}</span>
                        {isLowest && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#EDF4EE] text-[#2E4032] border border-[#CCE0D1]">
                            Lowest Price
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onAddToCart(p)}
                        disabled={!p.inStock || p.stockCount <= 0}
                        className={`mt-3 w-full py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center space-x-1.5 transition-all ${
                          p.inStock && p.stockCount > 0
                            ? 'bg-[#2E4032] hover:bg-[#233226] text-white shadow-xs active:scale-[0.99]'
                            : 'bg-[#F0EFEA] text-[#A09E95] cursor-not-allowed border border-[#DDD9CF]'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{p.inStock && p.stockCount > 0 ? 'Add to Bag' : 'Out of Stock'}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F0EFEA] text-[#2C2B27]">
              
              {/* Product SKU */}
              <tr>
                <td className="p-4 font-semibold text-[#5A5850] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC]">
                  Product ID / SKU
                </td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 border-l border-[#E6E4DC] font-mono text-[11px] text-[#6B6962]">
                    {p.sku || p.id}
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr>
                <td className="p-4 font-semibold text-[#5A5850] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC]">
                  Category Path
                </td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 border-l border-[#E6E4DC]">
                    {p.category} &gt; {p.subcategory}
                  </td>
                ))}
              </tr>

              {/* Stock Status */}
              {(() => {
                const stockValues = comparedProducts.map(p => p.inStock && p.stockCount > 0);
                const isDiff = new Set(stockValues).size > 1;
                return (
                  <tr className={highlightDiffs && isDiff ? 'bg-[#FCF9F2]' : ''}>
                    <td className="p-4 font-semibold text-[#5A5850] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC]">
                      <div className="flex items-center justify-between">
                        <span>Inventory Status</span>
                        {highlightDiffs && isDiff && (
                          <span className="text-[10px] font-semibold text-[#8C6D23] px-1.5 py-0.5 rounded bg-[#F5EEDD]">Diff</span>
                        )}
                      </div>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 border-l border-[#E6E4DC]">
                        {p.inStock && p.stockCount > 0 ? (
                          <span className="inline-flex items-center space-x-1.5 text-[#2E4032] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>In Stock ({p.stockCount} units available)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 text-[#8F3E2B] font-medium">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Strictly Out of Stock</span>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })()}

              {/* Customer Rating */}
              {(() => {
                const ratingValues = comparedProducts.map(p => p.rating);
                const isDiff = new Set(ratingValues).size > 1;
                return (
                  <tr className={highlightDiffs && isDiff ? 'bg-[#FCF9F2]' : ''}>
                    <td className="p-4 font-semibold text-[#5A5850] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC]">
                      <div className="flex items-center justify-between">
                        <span>Verified Customer Rating</span>
                        {highlightDiffs && isDiff && (
                          <span className="text-[10px] font-semibold text-[#8C6D23] px-1.5 py-0.5 rounded bg-[#F5EEDD]">Diff</span>
                        )}
                      </div>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 border-l border-[#E6E4DC]">
                        <div className="flex items-center space-x-1.5">
                          <Star className="w-3.5 h-3.5 fill-[#C79E38] text-[#C79E38]" />
                          <span className="font-semibold text-[#1A1A18] font-mono">{p.rating.toFixed(1)} / 5</span>
                          <span className="text-[#8A8880]">({p.reviewCount} reviews)</span>
                          {p.rating === highestRating && comparedProducts.length > 1 && (
                            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FAF4E6] text-[#8A6820] border border-[#EBDCB8]">
                              Top Rated
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })()}

              {/* Manufacturer Warranty */}
              {(() => {
                const warrantyValues = comparedProducts.map(p => p.warrantyMonths);
                const isDiff = new Set(warrantyValues).size > 1;
                return (
                  <tr className={highlightDiffs && isDiff ? 'bg-[#FCF9F2]' : ''}>
                    <td className="p-4 font-semibold text-[#5A5850] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC]">
                      <div className="flex items-center justify-between">
                        <span>Manufacturer Warranty</span>
                        {highlightDiffs && isDiff && (
                          <span className="text-[10px] font-semibold text-[#8C6D23] px-1.5 py-0.5 rounded bg-[#F5EEDD]">Diff</span>
                        )}
                      </div>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 border-l border-[#E6E4DC]">
                        {p.warrantyMonths} Months Official Manufacturer Limited Warranty
                      </td>
                    ))}
                  </tr>
                );
              })()}

              {/* Return Window */}
              {(() => {
                const returnValues = comparedProducts.map(p => p.returnWindowDays);
                const isDiff = new Set(returnValues).size > 1;
                return (
                  <tr className={highlightDiffs && isDiff ? 'bg-[#FCF9F2]' : ''}>
                    <td className="p-4 font-semibold text-[#5A5850] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC]">
                      <div className="flex items-center justify-between">
                        <span>Store Return Window</span>
                        {highlightDiffs && isDiff && (
                          <span className="text-[10px] font-semibold text-[#8C6D23] px-1.5 py-0.5 rounded bg-[#F5EEDD]">Diff</span>
                        )}
                      </div>
                    </td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-4 border-l border-[#E6E4DC]">
                        {p.returnWindowDays} Calendar Days (subject to return policy)
                      </td>
                    ))}
                  </tr>
                );
              })()}

              {/* All Unique Technical Specs */}
              {allSpecKeys.map((specKey) => {
                const specValues = comparedProducts.map(p => {
                  const val = p.specs ? p.specs[specKey] : undefined;
                  return val !== undefined && val !== null ? String(val) : '__MISSING__';
                });
                const isDiff = new Set(specValues).size > 1;

                return (
                  <tr key={specKey} className={highlightDiffs && isDiff ? 'bg-[#FCF9F2]' : ''}>
                    <td className="p-4 font-semibold text-[#5A5850] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC] capitalize">
                      <div className="flex items-center justify-between">
                        <span>{specKey.replace(/([A-Z])/g, ' $1')}</span>
                        {highlightDiffs && isDiff && (
                          <span className="text-[10px] font-semibold text-[#8C6D23] px-1.5 py-0.5 rounded bg-[#F5EEDD]">Diff</span>
                        )}
                      </div>
                    </td>
                    {comparedProducts.map((p) => {
                      const val = p.specs ? p.specs[specKey] : undefined;
                      return (
                        <td key={p.id} className="p-4 border-l border-[#E6E4DC]">
                          {val !== undefined && val !== null ? (
                            <span className="text-[#1A1A18] font-medium font-mono text-[11px]">
                              {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                            </span>
                          ) : (
                            <span className="text-[#9A9890] italic text-[11px]">
                              Not available in catalogue
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
