import React from 'react';
import { X, Check, Star, ShieldCheck, Zap, ShoppingBag } from 'lucide-react';
import { Product, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currency';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  currency?: CurrencyCode;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  currency = 'PKR',
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-[#16181B] border border-[#2B3038] rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#2B3038] flex items-center justify-between bg-[#14171A]">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#E2B29F]">
                Specification Blueprint
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-xs text-neutral-400 font-medium">Sialkot & Lahore Atelier</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
            
            {/* Top Showcase Banner */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-[#2B3038]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex text-[#E2B29F]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#E2B29F]" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-white tabular-nums">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-neutral-400">
                    ({product.reviewCount} verified Pakistani reviews)
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl text-white">
                  {product.name}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {product.subtitle}
                </p>

                <div className="py-2.5 px-3 bg-[#14171A] rounded-lg border border-[#2B3038] inline-flex items-baseline gap-3">
                  <span className="font-display font-extrabold text-xl text-[#E2B29F] tabular-nums">
                    {formatCurrency(product.price, currency)}
                  </span>
                  <span className="text-xs text-neutral-400 line-through tabular-nums">
                    {formatCurrency(product.originalPrice, currency)}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Free COD Nationwide
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Specifications Matrix */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Technical Specifications
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#14171A] rounded-lg border border-[#2B3038]">
                  <span className="text-neutral-500 block text-[10px]">Capacity</span>
                  <span className="font-semibold text-white">{product.specs.capacity}</span>
                </div>
                <div className="p-3 bg-[#14171A] rounded-lg border border-[#2B3038]">
                  <span className="text-neutral-500 block text-[10px]">Empty Weight</span>
                  <span className="font-semibold text-white">{product.specs.weight}</span>
                </div>
                <div className="p-3 bg-[#14171A] rounded-lg border border-[#2B3038]">
                  <span className="text-neutral-500 block text-[10px]">Laptop Core</span>
                  <span className="font-semibold text-white">{product.specs.laptopFit}</span>
                </div>
                <div className="p-3 bg-[#14171A] rounded-lg border border-[#2B3038]">
                  <span className="text-neutral-500 block text-[10px]">Shell Fabric</span>
                  <span className="font-semibold text-white">{product.specs.material}</span>
                </div>
                <div className="p-3 bg-[#14171A] rounded-lg border border-[#2B3038]">
                  <span className="text-neutral-500 block text-[10px]">Dimensions</span>
                  <span className="font-semibold text-white">{product.specs.dimensions}</span>
                </div>
                <div className="p-3 bg-[#14171A] rounded-lg border border-[#2B3038]">
                  <span className="text-neutral-500 block text-[10px]">Weather Rating</span>
                  <span className="font-semibold text-white">{product.specs.waterproofRating}</span>
                </div>
              </div>
            </div>

            {/* Engineering Highlights */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Field Testing & Daily Commute Benefits
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {product.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-[#14171A] rounded-lg border border-[#2B3038]/70">
                    <Check className="w-3.5 h-3.5 text-[#E2B29F] shrink-0 mt-0.5" />
                    <span className="text-neutral-300">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Doorstep Inspection Reminder */}
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/50 rounded-xl flex items-center gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-neutral-300">
                <strong className="text-emerald-300">Open-Parcel Inspection Guaranteed:</strong> Inspect the laptop sleeve and all zips before paying the courier rider.
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  onBuyNow(product);
                  onClose();
                }}
                className="py-3 px-4 bg-gradient-to-r from-[#DF9B84] to-[#C5832B] hover:from-[#F0C0B0] hover:to-[#D49D87] text-neutral-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Zap className="w-4 h-4 fill-neutral-950" />
                <span>Buy Now (Instant COD)</span>
              </button>

              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="py-3 px-4 bg-[#1C2025] hover:bg-[#23282F] border border-[#2B3038] text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#E2B29F]" />
                <span>Add to Cart</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
