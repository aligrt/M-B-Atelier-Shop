import React from 'react';
import { Shield, Sparkles, Wrench, Package } from 'lucide-react';
import { ASSET_IMAGES } from '../data/products';

export const WhyUsCraftsmanship: React.FC = () => {
  return (
    <section id="why-us" className="py-14 sm:py-20 bg-[#16181B] border-b border-[#252A30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#14171A] border border-[#2B3038] text-xs font-bold uppercase tracking-wider text-[#E2B29F] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C88D76]" />
            <span>The Sialkot & Lahore Heritage</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
            Functional Luxury. Built for the Daily Grind.
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 mt-3 leading-relaxed">
            Most Pakistani bags are either overpriced imported polyester or cheap local replicas that rip after 2 months. 
            M&B Atelier bridges this gap: industrial-grade Sialkot technical engineering paired with luxury minimalist silhouettes.
          </p>
        </div>

        {/* Feature Split with Photography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Visual Asset */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-[#2B3038] bg-[#14171A] shadow-2xl group">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={ASSET_IMAGES.craftsmanship}
                  alt="Macro craftsmanship photo of reinforced stitching and weather-sealed zipper in Sialkot atelier"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="p-5 bg-[#14171A] border-t border-[#252A30]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Reinforced Box-Bartack Stitching</span>
                  <span className="text-[#E2B29F] font-mono font-medium">Tested to 25kg Load</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Every strap juncture features bonded nylon 6.6 heavy thread, preventing tears during violent road jerks and bike potholes.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Key Pillars */}
          <div className="lg:col-span-6 space-y-5">
            
            <div className="p-5 bg-[#1C2025] border border-[#2B3038] rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#14171A] border border-[#2B3038] flex items-center justify-center text-[#E2B29F] shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  1000D Matte Ballistic Oxford Fabric
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                  Twice as dense as typical 300D backpack polyester. Deflects abrasion from roadside curbs, bike silencer heat, and dusty commutes without fraying.
                </p>
              </div>
            </div>

            <div className="p-5 bg-[#1C2025] border border-[#2B3038] rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#14171A] border border-[#2B3038] flex items-center justify-center text-[#E2B29F] shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Suspended Laptop Air Cradle
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                  Laptops are protected in a dedicated false-bottom sleeve that sits 1.5 inches above ground level. If your bag drops onto tiled floors or road curbs, your laptop never absorbs the impact.
                </p>
              </div>
            </div>

            <div className="p-5 bg-[#1C2025] border border-[#2B3038] rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#14171A] border border-[#2B3038] flex items-center justify-center text-[#E2B29F] shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Doorstep Open Parcel Inspection
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                  Our courier agreement with Trax, TCS, and Leopards explicitly permits parcel inspection. You hold zero financial risk: verify the stitches, touch the zipper pulls, and hand cash to the rider only when delighted.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
