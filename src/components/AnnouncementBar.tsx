import React from 'react';
import { Truck, ShieldCheck, Sparkles } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <aside aria-label="Store Announcement" className="bg-[#111315] border-b border-[#22262B] text-xs py-2 px-3 text-[#C88D76] font-medium tracking-wide">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto">
          <Truck className="w-3.5 h-3.5 shrink-0 text-[#C88D76]" />
          <span className="text-neutral-200">
            <strong className="text-[#E2B29F] font-semibold">FREE Cash on Delivery (COD)</strong> Across Pakistan
          </span>
          <span className="hidden md:inline text-neutral-600">|</span>
          <span className="hidden md:flex items-center gap-1.5 text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E2B29F]" />
            <strong className="text-white">Open Parcel Inspection Allowed</strong> at your doorstep!
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1 text-[#E2B29F]">
            <Sparkles className="w-3 h-3 text-[#C88D76]" /> Lahore & Sialkot Atelier
          </span>
          <span>·</span>
          <span className="text-neutral-300">Same-Day Dispatch Before 4 PM</span>
        </div>
      </div>
    </aside>
  );
};
