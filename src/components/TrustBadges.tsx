import React, { useState } from 'react';
import { ShieldCheck, PackageCheck, Award, ChevronDown, CheckCircle } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const [activeInfo, setActiveInfo] = useState<number | null>(null);

  const badges = [
    {
      id: 1,
      icon: ShieldCheck,
      badgeTag: 'Pillar [1]',
      title: 'Proven Against Pakistan: Bike, Rain, Thief-Proof',
      subtitle: 'Engineered for 70cc/125cc rides, downpours, & concealed lumbar security.',
      detail:
        'Every M&B Atelier bag is battle-tested on Pakistan roads: YKK Aquaguard weather-sealed zips, heavy 1000D Oxford ballistic weave, stowed high-vis rain cover, and a hidden lumbar anti-theft chamber for CNIC and cash.',
      highlights: ['Rain cover stowed in zipped base', 'Concealed passport & CNIC lumbar zip', 'Tested against vibration on 70cc/125cc bikes'],
    },
    {
      id: 2,
      icon: PackageCheck,
      badgeTag: 'Pillar [2]',
      title: 'Carry the City. Not the Load.',
      subtitle: 'Air-suspended false-bottom laptop sleeve & ergonomic weight distribution.',
      detail:
        'Our suspended laptop core keeps delicate workstation laptops 1.5 inches above concrete floors. Ergonomic high-density air-mesh channels prevent back sweat in 40°C humid summers.',
      highlights: ['False-bottom laptop drop armor', 'Ergonomic lumbar weight distribution', 'Luggage trolley pass-through strap'],
    },
    {
      id: 3,
      icon: Award,
      badgeTag: 'Pillar [3]',
      title: 'Sialkot Tough. D2C Smooth. Open-Parcel Guaranteed.',
      subtitle: 'Reinforced box-bartack stitching with doorstep inspection before paying COD.',
      detail:
        'Sialkot world-class tactical and sporting manufacturing brought directly to Pakistani professionals without middleman markups. Heavy-duty YKK zips, 1000D Oxford ballistic weave, and open-parcel inspection before paying a single rupee.',
      highlights: ['Sialkot military-grade box-bartack stitching', 'Open-parcel inspection before paying COD', 'Direct-to-consumer transparent pricing'],
    },
  ];

  return (
    <section id="why-us" className="bg-[#16181B] py-10 sm:py-14 border-b border-[#252A30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <p className="text-xs uppercase tracking-wider text-[#C5832B] font-bold mb-1">
            Built for Pakistani Realities
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Our 3 Uncompromising Quality Pillars
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            No drop-shipping gimmicks. Sialkot tough, Lahore designed, and doorstep open-parcel verified.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            const isOpen = activeInfo === idx;
            return (
              <div
                key={badge.id}
                onClick={() => setActiveInfo(isOpen ? null : idx)}
                className={`relative rounded-2xl p-6 bg-[#1C2025] border transition-all duration-300 cursor-pointer text-left ${
                  isOpen
                    ? 'border-[#C5832B] shadow-lg shadow-[#C5832B]/15 ring-1 ring-[#C5832B]/50'
                    : 'border-[#2B3038] hover:border-[#C5832B]/40 hover:bg-[#20252C]'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#14171A] border border-[#2B3038] flex items-center justify-center text-[#C5832B]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#E2B29F] bg-[#14171A] px-2.5 py-1 rounded border border-[#C5832B]/30">
                    {badge.badgeTag}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-white mb-1.5 flex items-center justify-between">
                  <span>{badge.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#C5832B]' : ''
                    }`}
                  />
                </h3>

                <p className="text-xs sm:text-sm text-neutral-300 mb-3">{badge.subtitle}</p>

                {/* Collapsible deep dive details */}
                {isOpen && (
                  <div className="pt-3 mt-3 border-t border-[#2B3038] space-y-3 text-xs text-neutral-300 animate-in fade-in duration-200">
                    <p className="leading-relaxed">{badge.detail}</p>
                    <ul className="space-y-1.5 pt-1">
                      {badge.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-neutral-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-2 text-[11px] text-[#C5832B] font-medium flex items-center gap-1">
                  <span>{isOpen ? 'Tap to collapse' : 'Tap to read full policy'}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
