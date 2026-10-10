import React, { useState } from 'react';
import { Star, ShieldCheck, Check, ShoppingBag, Eye, Zap, Sparkles, Scale, X } from 'lucide-react';
import { Product, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currency';
import { ProductComparisonModal } from './ProductComparisonModal';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  currency: CurrencyCode;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onBuyNow,
  onSelectProduct,
  currency,
}) => {
  // Set of selected product IDs for comparison
  const [comparedProductIds, setComparedProductIds] = useState<string[]>(
    products.slice(0, 2).map((p) => p.id)
  );
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
    setComparedProductIds(products.map((p) => p.id));
    setIsCompareModalOpen(true);
  };

  const handleOpenCompareModal = () => {
    if (comparedProductIds.length === 0) {
      setComparedProductIds(products.map((p) => p.id));
    }
    setIsCompareModalOpen(true);
  };

  const selectedProducts = products.filter((p) => comparedProductIds.includes(p.id));

  return (
    <section id="shop" className="py-14 sm:py-20 bg-[#14171A] border-b border-[#252A30] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 pb-6 border-b border-[#252A30] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E2B29F] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C5832B]" />
              <span>The Atelier Collection</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Purpose-Built Commuter Bags
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-xl">
              Engineered in Sialkot and Lahore. Heavy 1000D Ballistic Nylon, suspended false-bottom laptop armor, and free doorstep Open-Parcel inspection.
            </p>
          </div>

          {/* Quick Comparison Bar Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCompareAll}
              className="px-3.5 py-2 text-xs font-bold bg-[#1C2025] hover:bg-[#252A30] text-neutral-200 border border-[#2B3038] hover:border-[#C5832B]/50 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Scale className="w-3.5 h-3.5 text-[#C5832B]" />
              <span>Compare Specs</span>
            </button>
            {comparedProductIds.length > 0 && (
              <button
                onClick={handleOpenCompareModal}
                className="px-3.5 py-2 text-xs font-bold bg-[#C5832B] hover:bg-[#E2B29F] text-neutral-950 rounded-xl transition-all cursor-pointer shadow-md"
              >
                View Comparison ({comparedProductIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const savings = product.originalPrice - product.price;
            const isCompared = comparedProductIds.includes(product.id);

            return (
              <div
                key={product.id}
                id={`model-${product.id}`}
                className="group relative rounded-3xl bg-[#1A1D22] border border-[#2B3038] hover:border-[#C5832B]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900 border-b border-[#252A30]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1D22] via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black/85 backdrop-blur-md text-[#E2B29F] border border-[#C5832B]/40 rounded-md">
                      {product.badge}
                    </span>
                    {product.stockQuantity < 5 && product.stockQuantity > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800 rounded">
                        Only {product.stockQuantity} Left in Stock
                      </span>
                    )}
                  </div>

                  {/* Compare Toggle */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() => toggleCompare(product.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg backdrop-blur-md border transition-all flex items-center gap-1 cursor-pointer ${
                        isCompared
                          ? 'bg-[#C5832B] text-neutral-950 border-[#C5832B] font-bold'
                          : 'bg-black/75 text-neutral-300 border-neutral-700 hover:text-white'
                      }`}
                    >
                      <Scale className="w-3 h-3" />
                      <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                    </button>
                  </div>

                  {/* Deep Dive Action Overlay Button */}
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
                        <span className="text-xs text-neutral-400 mr-1.5">Price:</span>
                        <span className="font-display font-extrabold text-2xl text-white tabular-nums">
                          {formatCurrency(product.price, currency)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-neutral-500 line-through tabular-nums block">
                          {formatCurrency(product.originalPrice, currency)}
                        </span>
                        {savings > 0 && (
                          <span className="text-[10px] text-emerald-400 font-medium">
                            Save {formatCurrency(savings, currency)}
                          </span>
                        )}
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
                            <span className="w-4 h-4 rounded-full bg-[#15181C] border border-[#C5832B]/50 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 text-[#E2B29F]" />
                            </span>
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="space-y-2.5 pt-4 border-t border-[#252A30]">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium mb-1">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Doorstep Open-Parcel Check
                      </span>
                      <span>Free COD</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onBuyNow(product)}
                        className="py-3 px-3 bg-gradient-to-r from-[#DF9B84] to-[#C5832B] hover:from-[#F0C0B0] hover:to-[#D49D87] text-neutral-950 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Zap className="w-4 h-4 fill-neutral-950" />
                        <span>Instant COD</span>
                      </button>

                      <button
                        onClick={() => onAddToCart(product)}
                        className="py-3 px-3 bg-[#1F2329] hover:bg-[#282E37] border border-[#2B3038] text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#E2B29F]" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Comparison Modal */}
      <ProductComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        products={selectedProducts}
        allProducts={products}
        onRemoveProduct={(id) => setComparedProductIds((prev) => prev.filter((p) => p !== id))}
        onAddProduct={(prod) =>
          setComparedProductIds((prev) => (prev.includes(prod.id) ? prev : [...prev, prod.id]))
        }
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        currency={currency}
      />
    </section>
  );
};
