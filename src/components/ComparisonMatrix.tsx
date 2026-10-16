/**
 * TrustCart AI — Product Comparison Matrix Screen
 * Editorial retail design: Clean tabular side-by-side specification comparison
 * using canonical database records. Non-existent specs are explicitly rendered
 * as "Not available in catalogue".
 */
import React from 'react';
import {
  Scale,
  X,
  Star,
  CheckCircle2,
  XCircle,
  ShoppingCart
} from 'lucide-react';
import { Product } from '../types';

interface ComparisonMatrixProps {
  products: Product[];
  comparedProducts: Product[];
  onRemoveCompare: (productId: string) => void;
  onAddCompare: (product: Product) => void;
  onClearCompare: () => void;
  onAddToCart: (product: Product) => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  products,
  comparedProducts,
  onRemoveCompare,
  onAddCompare,
  onClearCompare,
  onAddToCart
}) => {
  // Collect union of all spec keys across compared products
  const allSpecKeys = Array.from(
    new Set(
      comparedProducts.flatMap((p) => Object.keys(p.specs || {}))
    )
  ).sort();

  // Find lowest price
  const lowestPrice = comparedProducts.length > 0
    ? Math.min(...comparedProducts.map(p => p.price))
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
            Compare official catalogue specifications side-by-side. Missing or unverified attributes are explicitly rendered as &ldquo;Not available in catalogue&rdquo;.
          </p>
        </div>

        {comparedProducts.length > 0 && (
          <button
            onClick={onClearCompare}
            className="text-xs text-[#8F3E2B] hover:text-[#6E2A1B] font-medium underline underline-offset-2 self-start sm:self-auto transition-colors"
          >
            Clear Comparison List ({comparedProducts.length})
          </button>
        )}
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
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} (${p.price.toFixed(2)})
                </option>
              ))}
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
            <p className="text-xs text-[#7A7870] max-w-md mx-auto">
              Select items from the dropdown above, browse the Catalogue tab, or click &ldquo;Compare&rdquo; on any product card in the assistant stream.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E6E4DC] bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E6E4DC]">
                <th className="p-4 w-52 text-[#7A7870] font-semibold uppercase tracking-wider text-[11px] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC]">
                  Specification / Field
                </th>
                {comparedProducts.map((p) => (
                  <th key={p.id} className="p-4 min-w-[260px] align-top border-l border-[#E6E4DC]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A7870]">{p.brand}</span>
                        <h4 className="font-serif font-bold text-[#1A1A18] text-sm line-clamp-2">{p.title}</h4>
                      </div>
                      <button
                        onClick={() => onRemoveCompare(p.id)}
                        className="p-1 rounded-md hover:bg-[#EAE8E0] text-[#8A8880] hover:text-[#1A1A18] transition-colors"
                        title="Remove product from comparison"
                        aria-label="Remove product"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3.5 flex items-baseline justify-between">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-lg font-bold text-[#1A1A18] font-mono tabular-nums">
                          ${p.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-[#7A7870]">{p.currency}</span>
                      </div>
                      {p.price === lowestPrice && comparedProducts.length > 1 && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F0F4F1] text-[#2E4032] border border-[#D5E0D7]">
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
                ))}
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
              <tr>
                <td className="p-4 font-semibold text-[#5A5850] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC]">
                  Inventory Status
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

              {/* Customer Rating */}
              <tr>
                <td className="p-4 font-semibold text-[#5A5850] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC]">
                  Verified Customer Rating
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

              {/* Manufacturer Warranty */}
              <tr>
                <td className="p-4 font-semibold text-[#5A5850] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC]">
                  Manufacturer Warranty
                </td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 border-l border-[#E6E4DC]">
                    {p.warrantyMonths} Months Official Manufacturer Limited Warranty
                  </td>
                ))}
              </tr>

              {/* Return Window */}
              <tr>
                <td className="p-4 font-semibold text-[#5A5850] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC]">
                  Store Return Window
                </td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 border-l border-[#E6E4DC]">
                    {p.returnWindowDays} Calendar Days (subject to return policy)
                  </td>
                ))}
              </tr>

              {/* All Unique Technical Specs */}
              {allSpecKeys.map((specKey) => (
                <tr key={specKey}>
                  <td className="p-4 font-semibold text-[#5A5850] sticky left-0 bg-[#FAF9F6] z-10 border-r border-[#E6E4DC] capitalize">
                    {specKey.replace(/([A-Z])/g, ' $1')}
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
              ))}

            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
