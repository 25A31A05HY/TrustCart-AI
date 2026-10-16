/**
 * TrustCart AI — Product Discovery & Structured Catalogue Explorer
 * Clean editorial retail grid, multi-attribute filter controls, and tabular metrics.
 */
import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  PackageX
} from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductDiscoveryProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onInspectProduct: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
  comparedProductIds: string[];
}

export const ProductDiscovery: React.FC<ProductDiscoveryProps> = ({
  products,
  onAddToCart,
  onInspectProduct,
  onToggleCompare,
  comparedProductIds
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  // Extract unique categories & brands
  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set(products.map(p => p.brand));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesTags = p.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesBrand && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Brand
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) {
        return false;
      }

      // Price
      if (p.price > maxPrice) {
        return false;
      }

      // In-Stock
      if (inStockOnly && (!p.inStock || p.stockCount <= 0)) {
        return false;
      }

      // Rating
      if (minRating > 0 && p.rating < minRating) {
        return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, maxPrice, inStockOnly, minRating, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setMaxPrice(2500);
    setInStockOnly(false);
    setMinRating(0);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E6E4DC]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#7A7870] font-semibold block mb-1">
            Authoritative Retail Inventory
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18] tracking-tight">
            Verified Catalogue Explorer
          </h1>
          <p className="text-xs sm:text-sm text-[#686660] mt-1.5 max-w-xl">
            Browse our full store inventory. All specifications, real-time stock levels, and manufacturer warranties are verified and up to date.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-xs text-[#706E66]">
            Showing <strong className="text-[#1A1A18] font-mono">{filteredProducts.length}</strong> of {products.length} products
          </span>

          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F2F0EB] border border-[#DDD9CF] text-xs text-[#5A5850] hover:text-[#1A1A18] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Filter Surface */}
      <div className="bg-white border border-[#E6E4DC] rounded-xl p-5 space-y-4 shadow-2xs">
        
        {/* Top Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Keyword Search Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7870] block">
              Search Catalogue
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#9A9890]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Product name, specs, brand..."
                className="w-full bg-[#FAF9F6] border border-[#DDD9CF] focus:border-[#2E4032] rounded-lg pl-9 pr-3 py-2 text-xs text-[#1A1A18] placeholder-[#94928A] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7870] block">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#DDD9CF] focus:border-[#2E4032] rounded-lg px-3 py-2 text-xs text-[#1A1A18] focus:outline-none transition-colors"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7870] block">
              Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#DDD9CF] focus:border-[#2E4032] rounded-lg px-3 py-2 text-xs text-[#1A1A18] focus:outline-none transition-colors"
            >
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Sort Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7870] block">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#FAF9F6] border border-[#DDD9CF] focus:border-[#2E4032] rounded-lg px-3 py-2 text-xs text-[#1A1A18] focus:outline-none transition-colors"
            >
              <option value="featured">Featured Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

        </div>

        {/* Secondary Filter Row: Price Slider & In-Stock Switch */}
        <div className="pt-3 border-t border-[#F0EFEA] flex flex-wrap items-center justify-between gap-4 text-xs text-[#4A4842]">
          
          {/* Price Range Slider */}
          <div className="flex items-center space-x-3">
            <span className="font-medium text-[#7A7870]">Budget ceiling:</span>
            <input
              type="range"
              min="100"
              max="2500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-32 sm:w-44 accent-[#2E4032] cursor-pointer"
            />
            <span className="font-mono font-bold text-[#1A1A18] tabular-nums">${maxPrice}</span>
          </div>

          {/* In-Stock Only Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded text-[#2E4032] accent-[#2E4032] focus:ring-[#2E4032]"
            />
            <span className="font-medium text-[#2C2B27]">Show in-stock items only</span>
          </label>

          {/* Minimum Rating Options */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[#7A7870] font-medium mr-1">Rating:</span>
            {[0, 4.5, 4.8].map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  minRating === r
                    ? 'bg-[#2E4032] text-white font-semibold'
                    : 'bg-[#FAF9F6] text-[#605E56] hover:bg-[#EAE8E0] border border-[#DDD9CF]'
                }`}
              >
                {r === 0 ? 'All' : `${r}+ ★`}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E6E4DC] rounded-xl space-y-3">
          <PackageX className="w-10 h-10 text-[#9E9C94] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#1A1A18]">No products match your criteria</h3>
          <p className="text-xs text-[#6B6962] max-w-sm mx-auto">
            Try expanding your price range, clearing brand constraints, or viewing all categories.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#2E4032] text-white text-xs font-semibold rounded-lg hover:bg-[#233226] transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onInspect={onInspectProduct}
              onToggleCompare={onToggleCompare}
              isCompared={comparedProductIds.includes(product.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
