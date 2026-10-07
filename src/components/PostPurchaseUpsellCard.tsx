import React, { useState } from 'react';
import {
  PackagePlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { mbApiService } from '../services/api';

interface PostPurchaseUpsellCardProps {
  orderId: string;
  onUpsellApplied: (newTotal: number, updatedItemName: string) => void;
}

export const PostPurchaseUpsellCard: React.FC<PostPurchaseUpsellCardProps> = ({
  orderId,
  onUpsellApplied,
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddUpsell = async () => {
    setIsApplying(true);
    setError(null);
    try {
      const response = await mbApiService.addOrderUpsell({
        orderId,
        upsellProduct: {
          id: 'mb-tech-pouch',
          name: 'M&B Waterproof Tech Pouch',
          price: 990,
          originalPrice: 1500,
        },
      });

      if (response.success) {
        setIsApplied(true);
        onUpsellApplied(response.newTotal, 'M&B Waterproof Tech Pouch');
      } else {
        setError(response.message || 'Unable to update parcel. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add upsell item to shipment.');
    } finally {
      setIsApplying(false);
    }
  };

  if (isApplied) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-4.5 text-center space-y-2 animate-fadeIn">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white">
          Tech Pouch Successfully Added to Order {orderId}!
        </h4>
        <p className="text-xs text-neutral-300">
          Your active Cash on Delivery shipment has been updated. The rider will collect the discounted PKR 990 with zero additional courier fees.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#211815] via-[#1A1816] to-[#141518] border-2 border-[#C88D76]/70 rounded-2xl p-4.5 sm:p-5 shadow-xl space-y-3.5">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C88D76]/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#E2B29F] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C88D76]" />
            <span>Special One-Time Add-On Offer</span>
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
          Zero Extra Shipping
        </span>
      </div>

      {/* Product Highlight */}
      <div className="flex items-start gap-3.5 bg-[#121417] p-3 rounded-xl border border-[#2B3038]">
        {/* Placeholder Graphic / Icon */}
        <div className="w-14 h-14 rounded-lg bg-[#1C2025] border border-[#C88D76]/40 flex items-center justify-center text-[#E2B29F] shrink-0 font-display font-black text-xs text-center p-1 leading-tight">
          TECH POUCH
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="text-sm font-bold text-white leading-tight">
            M&B Waterproof Tech Pouch
          </h4>
          <p className="text-[11px] text-neutral-400 leading-snug">
            Add to your existing shipment with ZERO additional shipping fees. Weatherproof organizer for chargers, cables, and SSDs.
          </p>

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-base font-extrabold text-[#E2B29F] font-mono">
              PKR 990
            </span>
            <span className="text-xs text-neutral-500 line-through font-mono">
              PKR 1,500
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-800/40">
              Save PKR 510 (34% Off)
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-red-950/60 border border-red-800/60 rounded-lg flex items-center gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* One-Click Action Button */}
      <button
        type="button"
        disabled={isApplying}
        onClick={handleAddUpsell}
        className="w-full py-3 px-4 bg-gradient-to-r from-[#DF9B84] via-[#C88D76] to-[#B87A63] hover:from-[#F0B09A] hover:to-[#C88D76] text-neutral-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#C88D76]/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
      >
        {isApplying ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Adding to Parcel #{orderId}...</span>
          </>
        ) : (
          <>
            <PackagePlus className="w-4 h-4 stroke-[2.5]" />
            <span>Add to My Current Parcel (+PKR 990)</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400 text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>No OTP or address re-entry required · Added to the same flyer box</span>
      </div>
    </div>
  );
};
