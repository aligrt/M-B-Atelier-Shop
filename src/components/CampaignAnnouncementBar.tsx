import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  ArrowRight,
  Tag,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { CampaignBanner, CurrencyCode } from '../types';
import { storeStateService } from '../services/storeStateService';

interface CampaignAnnouncementBarProps {
  onScrollToSection: (sectionId: string) => void;
  currency: CurrencyCode;
}

export const CampaignAnnouncementBar: React.FC<CampaignAnnouncementBarProps> = ({
  onScrollToSection,
}) => {
  const [banner, setBanner] = useState<CampaignBanner>(storeStateService.getCampaignBanner());
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      if (!banner.countdownEndsAt) {
        setTimeLeft(null);
        return;
      }

      const diff = new Date(banner.countdownEndsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [banner.countdownEndsAt]);

  if (!banner.isActive) return null;

  return (
    <aside
      aria-label="Active Store Campaign"
      className="bg-gradient-to-r from-[#211611] via-[#1A1412] to-[#14171A] border-b border-[#C5832B]/40 text-xs py-2 px-3 text-[#E2B29F] font-medium"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-center sm:text-left">
        
        {/* Campaign Message */}
        <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap w-full sm:w-auto">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#C5832B] text-neutral-950 tracking-wider">
            <Percent className="w-3 h-3" />
            {banner.discountBadge}
          </span>
          <span className="text-white font-semibold">{banner.title}</span>
          <span className="hidden md:inline text-neutral-500">·</span>
          <span className="hidden md:inline text-neutral-300">{banner.subtitle}</span>
        </div>

        {/* Countdown Timer & CTA */}
        <div className="flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto text-[11px]">
          {timeLeft && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/50 border border-[#C5832B]/40 rounded-lg text-white font-mono">
              <Clock className="w-3 h-3 text-[#C5832B]" />
              <span className="tabular-nums font-bold">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          )}

          <button
            onClick={() => onScrollToSection(banner.ctaTargetId || 'shop')}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1C2025] hover:bg-[#252A30] border border-[#C5832B]/50 hover:border-[#C5832B] text-white rounded-lg transition-colors cursor-pointer text-[11px] font-bold"
          >
            <span>{banner.ctaText || 'Shop Now'}</span>
            <ArrowRight className="w-3 h-3 text-[#C5832B]" />
          </button>
        </div>

      </div>
    </aside>
  );
};
