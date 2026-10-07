import React from 'react';
import { Star, ShieldCheck, MapPin } from 'lucide-react';
import { REVIEWS } from '../data/products';

export const ReviewsSection: React.FC = () => {
  return (
    <section id="reviews" className="py-14 sm:py-20 bg-[#14171A] border-b border-[#252A30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 pb-6 border-b border-[#252A30]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E2B29F] mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C88D76]" />
              <span>Real Commuter Feedback</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tested on Pakistan’s Toughest Roads
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-xl">
              From monsoon downpours on Sharea Faisal to metro rides in Lahore. Verified buyers who pay via Cash on Delivery.
            </p>
          </div>

          <div className="mt-4 md:mt-0 bg-[#1C2025] px-4 py-3 rounded-xl border border-[#2B3038] flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-1 text-[#E2B29F]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#E2B29F]" />
                ))}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">Based on 570+ reviews</div>
            </div>
            <div className="border-l border-[#2B3038] pl-3">
              <span className="font-display font-extrabold text-2xl text-white tabular-nums">4.95</span>
              <span className="text-xs text-neutral-500"> / 5.0</span>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#181B1F] p-6 rounded-2xl border border-[#2B3038] flex flex-col justify-between hover:border-[#C88D76]/50 transition-colors"
            >
              <div>
                {/* Review Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-[#E2B29F]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#E2B29F]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-neutral-400">{rev.date}</span>
                </div>

                <h3 className="font-display font-bold text-base text-white mb-2 leading-snug">
                  "{rev.title}"
                </h3>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4">
                  {rev.comment}
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="pt-4 border-t border-[#252A30] flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>{rev.name}</span>
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                      Verified COD Buyer
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#C88D76]" />
                    <span>{rev.city}, Pakistan</span>
                    <span>·</span>
                    <span>{rev.productName}</span>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400 bg-[#14171A] px-2 py-1 rounded border border-[#2B3038] shrink-0">
                  {rev.commuteType}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
