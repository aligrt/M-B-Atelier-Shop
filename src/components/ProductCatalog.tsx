import React, { useState } from 'react';
import { Star, ShieldCheck, Check, ShoppingBag, Eye, Zap, Sparkles, Scale, X } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';
import { ProductComparisonModal } from './ProductComparisonModal';

interface ProductCatalogProps {
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onAddToCart,
  onBuyNow,
  onSelectProduct,
}) => {
  // Set of selected product IDs for comparison
  const [comparedProductIds, setComparedProductIds] = useState<string[]>(['metro-commuter', 'tech-exec']);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const toggleCompare = (productId: string) => {
    setComparedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleCompareAll = () => {
    setComparedProductIds(PRODUCTS.map((p) => p.id));
    setIsCompareModalOpen(true);
  };

  const handleOpenCompareModal = () => {
    if (comparedProductIds.length === 0) {
      setComparedProductIds(PRODUCTS.map((p) => p.id));
    }
    setIsCompareModalOpen(true);
  };

  const selectedProducts = PRODUCTS.filter((p) => comparedProductIds.includes(p.id));

  return (
    <section id="shop" className="py-14 sm:py-20 bg-[#14171A] border-b border-[#252A30] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 pb-6 border-b border-[#252A30] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E2B29F] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C88D76]" />
              <span>The Atelier Collection</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              3 Purpose-Built Models
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-xl">
              Zero fluff. Each silhouette solves a specific Pakistani transit and tech carry challenge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Compare Action in Header */}
            <button
              onClick={handleCompareAll}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-200 bg-[#1C2025] hover:bg-[#23282F] border border-[#2B3038] hover:border-[#C88D76] rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Scale className="w-4 h-4 text-[#E2B29F]" />
              <span>Compare All 3 Specs</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-neutral-300 font-medium">Same-Day Sialkot Dispatch</span>
            </div>
          </div>
        </div>

        {/* 3-Column Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => {
            const savings = product.originalPrice - product.price;
            const savingsPercent = Math.round((savings / product.originalPrice) * 100);
            const isCompared = comparedProductIds.includes(product.id);

            return (
              <div
                key={product.id}
                id={product.id === 'metro-commuter' ? 'model-1-metro' : undefined}
                className={`group flex flex-col bg-[#1A1E24] rounded-2xl border transition-all duration-300 overflow-hidden relative shadow-lg ${
                  isCompared
                    ? 'ring-1 ring-[#C88D76]/60 border-[#C88D76] shadow-[#C88D76]/10'
                    : product.id === 'metro-commuter'
                    ? 'border-[#C88D76]/50'
                    : 'border-[#2B3038] hover:border-neutral-500'
                }`}
              >
                {/* Top Badge Banner & Compare Toggle */}
                <div className="px-5 py-2.5 bg-[#15181C] border-b border-[#252A30] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#E2B29F] uppercase tracking-wider text-[11px]">
                    {product.badge}
                  </span>

                  {/* Toggle Compare Checkbox Control */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none group/toggle">
                    <input
                      type="checkbox"
                      checked={isCompared}
                      onChange={() => toggleCompare(product.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isCompared
                          ? 'bg-[#C88D76] border-[#C88D76] text-neutral-950'
                          : 'bg-[#181B1F] border-neutral-600 group-hover/toggle:border-neutral-400'
                      }`}
                    >
                      {isCompared && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-[11px] font-semibold transition-colors ${
                        isCompared ? 'text-[#E2B29F]' : 'text-neutral-400 group-hover/toggle:text-neutral-200'
                      }`}
                    >
                      Compare
                    </span>
                  </label>
                </div>

                {/* Product Image Stage */}
                <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                  <img
                    src={product.image}
                    alt={`${product.name} - ${product.subtitle}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  
                  {/* Subtle Dark Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1E24] via-transparent to-black/20 pointer-events-none" />

                  {/* Quick View Button on Image */}
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/85 hover:bg-black text-white text-xs font-medium rounded-lg backdrop-blur-md border border-neutral-700 flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#E2B29F]" />
                    <span>Deep Dive Specs</span>
                  </button>
                </div>

                {/* Content Area */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Star Rating & Reviews */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center text-[#E2B29F]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#E2B29F]" />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-white tabular-nums">
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="text-neutral-500 text-xs">·</span>
                      <span className="text-xs text-neutral-400">
                        {product.reviewCount} Reviews
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-display font-bold text-xl text-white group-hover:text-[#E2B29F] transition-colors leading-snug">
                      {product.name}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-xs text-neutral-400 mt-1 mb-4 leading-relaxed">
                      {product.subtitle}
                    </p>

                    {/* Price Block */}
                    <div className="py-3 px-3.5 bg-[#15181C] rounded-xl border border-[#252A30] mb-5 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-neutral-400 mr-1.5">COD Price:</span>
                        <span className="font-display font-extrabold text-2xl text-white tabular-nums">
                          PKR {product.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-neutral-500 line-through tabular-nums block">
                          PKR {product.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium">
                          Save PKR {savings.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Key Feature Bullets */}
                    <div className="space-y-2 mb-6">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Key Engineering Highlights:
                      </p>
                      <ul className="space-y-2 text-xs text-neutral-300">
                        {product.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-[#15181C] border border-[#C88D76]/50 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 text-[#E2B29F]" />
                            </span>
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="space-y-2.5 pt-4 border-t border-[#252A30]">
                    {/* Primary Buy Now (Instant COD Checkout) */}
                    <button
                      onClick={() => onBuyNow(product)}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] hover:from-[#F0C0B0] hover:to-[#D49D87] active:from-[#A86C55] active:to-[#9C5B42] text-neutral-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-neutral-950" />
                      <span>Buy Now - Free COD</span>
                    </button>

                    {/* Secondary Add to Cart */}
                    <button
                      onClick={() => onAddToCart(product)}
                      className="w-full py-2.5 px-4 bg-[#1C2025] hover:bg-[#23282F] border border-[#2B3038] text-neutral-200 hover:text-white font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#E2B29F]" />
                      <span>Add to Cart</span>
                    </button>

                    {/* Quick Specs / Compare Toggle Helper */}
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Open Parcel Check</span>
                      </div>
                      <button
                        onClick={() => toggleCompare(product.id)}
                        className="text-[#E2B29F] hover:underline cursor-pointer font-medium"
                      >
                        {isCompared ? 'Remove from Compare' : '+ Add to Compare'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Floating / Sticky Comparison Dock Bar when items are selected */}
        {comparedProductIds.length > 0 && (
          <aside aria-label="Compare Bar" className="fixed bottom-4 sm:bottom-6 left-3 right-18 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-30 sm:w-auto sm:min-w-[420px] max-w-xl bg-[#181D24]/95 backdrop-blur-md border border-[#C88D76]/80 rounded-2xl shadow-2xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#C88D76] flex items-center justify-center text-neutral-950 shrink-0">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white whitespace-nowrap">
                    Compare ({comparedProductIds.length})
                  </span>
                  <span className="hidden sm:inline text-neutral-500">·</span>
                  <span className="hidden sm:inline text-xs text-neutral-300 truncate">
                    {selectedProducts.map((p) => p.name.replace('The ', '')).join(', ')}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate">
                  Material, weight & dimensions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={handleOpenCompareModal}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] hover:from-[#F0C0B0] hover:to-[#D49D87] text-neutral-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                Compare Table
              </button>
              <button
                onClick={() => setComparedProductIds([])}
                className="p-1.5 sm:p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                title="Clear comparison selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </aside>
        )}

      </div>

      {/* Comparison Matrix Modal */}
      <ProductComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        products={selectedProducts}
        allProducts={PRODUCTS}
        onRemoveProduct={(id) => setComparedProductIds((prev) => prev.filter((item) => item !== id))}
        onAddProduct={(p) => setComparedProductIds((prev) => [...prev, p.id])}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
      />
    </section>
  );
};
