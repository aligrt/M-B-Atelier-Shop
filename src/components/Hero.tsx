import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, Star, Zap, MapPin } from 'lucide-react';
import { ASSET_IMAGES } from '../data/products';
import { BrandLogo } from './BrandLogo';

interface HeroProps {
  onShopModel1: () => void;
  onExploreCatalog: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopModel1, onExploreCatalog }) => {
  return (
    <section id="hero" className="relative overflow-hidden bg-[#14171A] pt-8 pb-14 lg:pt-12 lg:pb-20 border-b border-[#252A30]">
      {/* Subtle copper ambient glows */}
      <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-[#C88D76]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#9C5B42]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Brand Identity Spotlight Banner (Matching uploaded brand image) */}
        <div className="mb-10 lg:mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1C1F24] to-[#15181C] border border-[#2B3038] shadow-2xl relative overflow-hidden">
          {/* Top subtle copper accent line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C88D76] to-transparent opacity-80" />

          {/* Top timestamp / location header */}
          <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-[#2B3038] pb-3 mb-6">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Lahore Atelier · Verified Pakistani D2C</span>
            </div>
            <div className="font-mono text-neutral-400">
              EST. 2026 | LAHORE, PAKISTAN
            </div>
          </div>

          {/* Main 3-Part Brand Architecture */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-center lg:text-left">
            
            {/* Left: Roundel Seal */}
            <div className="lg:col-span-3 flex justify-center lg:justify-start">
              <BrandLogo variant="roundel" />
            </div>

            {/* Center: Hero Monogram & Wordmark */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center text-center">
              <BrandLogo variant="mark" size="xl" />
              
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl tracking-[0.22em] text-white uppercase mt-2 text-balance leading-none">
                M&B ATELIER
              </h1>
              
              <p className="text-xs sm:text-sm tracking-[0.18em] font-semibold text-[#E2B29F] mt-1.5">
                mbatelier.shop
              </p>

              <div className="mt-4 px-4 py-1.5 rounded-full bg-[#14171A] border border-[#C88D76]/40 inline-flex items-center gap-2 text-xs text-neutral-200">
                <span className="text-[#E2B29F] font-semibold">M&B Atelier</span>
                <span className="text-neutral-500">|</span>
                <span>Functional Luxury. Built for the Daily Grind.</span>
              </div>
            </div>

            {/* Right: Tactical Falcon Emblem Card */}
            <div className="lg:col-span-3 flex justify-center lg:justify-end">
              <BrandLogo variant="falcon" className="w-56" />
            </div>

          </div>

          {/* 3 Pillar Cards (As shown in uploaded image reference) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#2B3038]">
            
            {/* Pillar [1] */}
            <div className="bg-[#F8F7F4] text-[#14171A] p-5 rounded-2xl shadow-lg border border-neutral-300 flex flex-col justify-between">
              <span className="text-xs font-mono font-bold text-neutral-500 mb-2">[1]</span>
              <div>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-[#16181B] leading-tight">
                  Proven Against Pakistan: Bike, Rain, Thief-Proof.
                </h3>
                <p className="text-xs text-neutral-700 mt-2">
                  1000D Ballistic Nylon with neon rain cover and anti-theft lumbar vault for 70cc/125cc rides.
                </p>
              </div>
            </div>

            {/* Pillar [2] */}
            <div className="bg-[#F8F7F4] text-[#14171A] p-5 rounded-2xl shadow-lg border border-neutral-300 flex flex-col justify-between">
              <span className="text-xs font-mono font-bold text-neutral-500 mb-2">[2]</span>
              <div>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-[#16181B] leading-tight">
                  Carry the City. Not the Load.
                </h3>
                <p className="text-xs text-neutral-700 mt-2">
                  Suspended false-bottom laptop armor & ergonomic weight-displacement air channel.
                </p>
              </div>
            </div>

            {/* Pillar [3] */}
            <div className="bg-[#F8F7F4] text-[#14171A] p-5 rounded-2xl shadow-lg border border-neutral-300 flex flex-col justify-between">
              <span className="text-xs font-mono font-bold text-neutral-500 mb-2">[3]</span>
              <div>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-[#16181B] leading-tight">
                  Sialkot Tough. D2C Smooth. 1-Year Local Warranty.
                </h3>
                <p className="text-xs text-neutral-700 mt-2">
                  Reinforced box-bartack stitching backed by free repair pickup and open-parcel COD.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Action Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headline, Highlights & Primary CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1C2025] border border-[#2B3038] rounded-md text-xs font-medium text-neutral-300">
              <MapPin className="w-3.5 h-3.5 text-[#C88D76]" />
              <span className="text-[#E2B29F] font-semibold tracking-wider uppercase text-[11px]">
                Atelier Handcrafted in Sialkot & Lahore
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-emerald-400 font-medium">Free Nationwide COD</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-[1.12]">
              PAKISTAN’S NEW <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F5D2C4] to-[#C88D76]">
                DAILY DRIVE 🇵🇰
              </span>
            </h2>

            <p className="text-base text-neutral-300 max-w-xl leading-relaxed">
              Engineered for Bike Commuters, Rain, & Heavy Tech. 1-Year Local Warranty.
              Built with heavy-duty 1000D ballistic Oxford, weather-sealed zippers, and instant rainproofing.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={onShopModel1}
                className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] hover:from-[#F0C0B0] hover:to-[#D49D87] active:from-[#A86C55] active:to-[#9C5B42] text-neutral-950 font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-[#C88D76]/25 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Zap className="w-4 h-4 text-neutral-950 fill-neutral-950" />
                <span className="whitespace-nowrap">Shop Model 1 (Metro Commuter) - Free COD</span>
                <ArrowRight className="w-4 h-4 text-neutral-950 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onExploreCatalog}
                className="inline-flex items-center justify-center gap-2 px-5 py-4 bg-[#1C2025] hover:bg-[#23282F] border border-[#2B3038] hover:border-[#C88D76]/50 text-white font-medium text-sm sm:text-base rounded-xl transition-colors cursor-pointer"
              >
                <span>View All 3 Models</span>
              </button>
            </div>

            {/* Proof Badges */}
            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
              <div className="flex items-center gap-1 text-[#E2B29F]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#E2B29F] text-[#E2B29F]" />
                ))}
                <span className="ml-1 font-bold text-white tabular-nums">4.95 / 5.0</span>
              </div>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-300">
                <strong className="text-white">570+</strong> Verified Riders across KHI, LHE & ISB
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Open Parcel Inspection
              </span>
            </div>

          </div>

          {/* Right Column: Hero Product Visual with Copper Chamfer Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-[#C88D76]/40 bg-[#1A1D22] shadow-2xl group copper-border-glow">
              
              {/* Product Badge Overlay */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black/85 backdrop-blur-md text-[#E2B29F] border border-[#C88D76]/50 rounded-md">
                  Model 1 · Metro Commuter
                </span>
                <span className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700/80 backdrop-blur-md rounded-md">
                  In Stock · Dispatch Today
                </span>
              </div>

              {/* Price Tag Overlay */}
              <div className="absolute top-4 right-4 z-20">
                <div className="px-3 py-1.5 bg-[#14171A]/90 backdrop-blur-md border border-[#2B3038] rounded-lg text-right">
                  <div className="text-[10px] text-neutral-400 line-through tabular-nums">PKR 8,990</div>
                  <div className="text-sm font-extrabold text-[#E2B29F] tabular-nums">PKR 6,990</div>
                </div>
              </div>

              {/* Main Image with Scrim */}
              <div className="aspect-[4/3] sm:aspect-[16/11] relative overflow-hidden bg-neutral-900">
                <img
                  src={ASSET_IMAGES.hero}
                  alt="M&B Atelier Metro Commuter Backpack"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14171A] via-transparent to-black/20" />
              </div>

              {/* Bottom Card Bar */}
              <div className="p-4 sm:p-5 bg-[#16191D] border-t border-[#252A30] flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-sm">The Metro Commuter Backpack</h3>
                  <p className="text-xs text-neutral-400">Suspended Laptop Core · Weatherproof Rain Cover</p>
                </div>
                <button
                  onClick={onShopModel1}
                  className="px-3.5 py-2 text-xs font-bold bg-[#C88D76] hover:bg-[#E2B29F] text-neutral-950 rounded-lg transition-colors cursor-pointer"
                >
                  Order Free COD
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
