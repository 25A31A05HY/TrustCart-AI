/**
 * TrustCart AI — Premium Product Card Component
 * Editorial retail design: clean off-white canvas, unboxed metadata, tabular pricing,
 * and zero candy pill badges.
 */
import React from 'react';
import {
  Star,
  Plus,
  Scale,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onInspect?: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  isCompared?: boolean;
  matchReason?: string;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onInspect,
  onToggleCompare,
  isCompared = false,
  matchReason,
  compact = false
}) => {
  const hasDiscount = product.originalPrice > product.price;

  return (
    <article
      className={`group flex flex-col bg-white border ${
        isCompared ? 'border-[#2E4032] ring-1 ring-[#2E4032]/40' : 'border-[#E6E4DC]'
      } rounded-xl overflow-hidden hover:border-[#C8C5BA] transition-all duration-200 shadow-xs hover:shadow-md`}
    >
      
      {/* Product Image Frame */}
      <div className="relative aspect-[4/3] w-full bg-[#F6F5F1] overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
        />

        {/* Subtle Brand Watermark or Sale Tag */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded bg-[#FAF9F6]/90 text-[#8B3A2B] border border-[#E8D5D0] shadow-xs">
              Special Price
            </span>
          </div>
        )}

        {/* Quick Inspect Button */}
        {onInspect && (
          <button
            onClick={() => onInspect(product)}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#5A5850] hover:text-[#1A1A18] border border-[#DDD9CF] shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
            title="Inspect Verified Specifications"
            aria-label="Inspect specifications"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div className="space-y-1.5">
          {/* Zero-Pill Unboxed Metadata Line */}
          <div className="flex items-center gap-1.5 text-xs text-[#7A7870] font-medium">
            <span className="uppercase tracking-wider text-[11px] font-semibold text-[#5A5850]">{product.brand}</span>
            <span aria-hidden="true">&bull;</span>
            <span>{product.category}</span>
            <span aria-hidden="true">&bull;</span>
            <span className={product.inStock && product.stockCount > 0 ? 'text-[#2E4032]' : 'text-[#A0352A]'}>
              {product.inStock && product.stockCount > 0 ? `In Stock (${product.stockCount})` : 'Out of Stock'}
            </span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onInspect && onInspect(product)}
            className="font-serif text-[15px] font-bold text-[#1A1A18] leading-snug line-clamp-2 cursor-pointer hover:text-[#2E4032] transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Match Reason if relevant */}
          {matchReason && (
            <p className="text-xs text-[#3B523F] font-medium bg-[#F0F4F1] px-2.5 py-1 rounded-md border border-[#D5E0D7]">
              Matched: {matchReason}
            </p>
          )}

          {/* Key specs text snippet (non-compact) */}
          {!compact && (
            <div className="text-xs text-[#6B6962] pt-1 line-clamp-2 leading-relaxed">
              {Object.entries(product.specs).slice(0, 3).map(([key, val], idx) => (
                <span key={key}>
                  {idx > 0 && ' · '}
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {String(val)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing, Rating, & Actions Footer */}
        <div className="pt-3 border-t border-[#F0EFEA] space-y-3">
          <div className="flex items-baseline justify-between">
            {/* Price with tabular numerals */}
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-bold text-[#1A1A18] font-mono tabular-nums">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-[#7A7870]">{product.currency}</span>
              {hasDiscount && (
                <span className="text-xs text-[#9E9C94] line-through font-mono tabular-nums ml-1">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-1 text-xs text-[#5A5850]">
              <Star className="w-3.5 h-3.5 fill-[#C79E38] text-[#C79E38]" />
              <span className="font-semibold text-[#1A1A18]">{product.rating.toFixed(1)}</span>
              <span className="text-[#8E8C84]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAddToCart && onAddToCart(product)}
              disabled={!product.inStock || product.stockCount <= 0}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                product.inStock && product.stockCount > 0
                  ? 'bg-[#2E4032] hover:bg-[#243328] text-white shadow-xs active:scale-[0.99]'
                  : 'bg-[#F2F0EB] text-[#A5A39B] cursor-not-allowed border border-[#E0DED6]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{product.inStock ? 'Add to Bag' : 'Out of Stock'}</span>
            </button>

            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(product)}
                className={`p-2 rounded-lg border text-xs transition-colors ${
                  isCompared
                    ? 'bg-[#2E4032] text-white border-[#2E4032]'
                    : 'bg-white hover:bg-[#F6F5F1] border-[#DDD9CF] text-[#5A5850] hover:text-[#1A1A18]'
                }`}
                title={isCompared ? 'Remove from Comparison' : 'Add to Compare'}
                aria-label="Toggle comparison"
              >
                {isCompared ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

      </div>

    </article>
  );
};
