import React from 'react';
import { Sparkles, Tag, ArrowRight, X } from 'lucide-react';
import { CustomerOffer, CustomerUser, formatPakistaniPhoneDisplay } from '../services/api';

interface ReturningCustomerBannerProps {
  user: CustomerUser;
  offers: CustomerOffer[];
  onApplyOffer: (code: string) => void;
  onOpenAccount: () => void;
  onDismiss?: () => void;
}

export const ReturningCustomerBanner: React.FC<ReturningCustomerBannerProps> = ({
  user,
  offers,
  onApplyOffer,
  onOpenAccount,
  onDismiss,
}) => {
  if (offers.length === 0) return null;

  const primaryOffer = offers[0];

  return (
    <aside
      aria-label="Loyal Patron Privilege Offer"
      className="sticky top-16 sm:top-20 z-30 bg-gradient-to-r from-[#2A1810] via-[#1F1714] to-[#16181B] border-b border-[#C88D76]/50 shadow-md py-2.5 px-3 sm:px-6 text-xs text-white"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 text-center sm:text-left flex-wrap justify-center sm:justify-start">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#C88D76] text-neutral-950 tracking-wider">
            <Sparkles className="w-3 h-3" />
            {primaryOffer.badge || 'VIP REWARD'}
          </span>
          <span className="text-neutral-300">
            Welcome back, <strong className="text-white">{user.name || formatPakistaniPhoneDisplay(user.uid)}</strong>!
          </span>
          <span className="text-[#E2B29F] font-semibold">
            {primaryOffer.title}: Code <span className="font-mono underline font-bold">{primaryOffer.code}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onApplyOffer(primaryOffer.code)}
            className="px-3 py-1 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] hover:from-[#F0C0B0] hover:to-[#D49D87] text-neutral-950 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Tag className="w-3 h-3 text-neutral-950" />
            <span>Apply Coupon</span>
          </button>

          <button
            onClick={onOpenAccount}
            className="text-[11px] text-neutral-300 hover:text-white underline underline-offset-2 flex items-center gap-0.5 cursor-pointer px-1.5 py-1"
          >
            <span>View Orders</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
