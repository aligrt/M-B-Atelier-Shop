import React from 'react';
import { Truck, MapPin, Phone, Mail } from 'lucide-react';
import { STORE_PHONE_NUMBER, STORE_DISPLAY_PHONE } from '../data/products';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToSection }) => {
  return (
    <footer className="bg-[#111315] border-t border-[#252A30] text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand Manifesto */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo variant="mark" size="sm" />
              <div>
                <span className="font-display font-extrabold text-xl text-white tracking-[0.22em] block uppercase leading-none">
                  M&B ATELIER
                </span>
                <span className="text-[10px] text-[#C88D76] tracking-[0.14em]">mbatelier.shop</span>
              </div>
            </div>

            <p className="text-[#E2B29F] font-semibold text-sm">
              M&B Atelier | Functional Luxury. Built for the Daily Grind.
            </p>
            <p className="text-neutral-400 leading-relaxed max-w-md">
              Atelier Carry. Designed for You. Proof Against Pakistan. Engineered in Sialkot and Lahore for motorbike commuters, heavy workstation laptops, and monsoons.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-neutral-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C88D76]" /> EST. 2026 | Lahore & Sialkot, Pakistan
              </span>
              <span>·</span>
              <span className="text-[#E2B29F]">mbatelier.shop</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Quick Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onScrollToSection('shop')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Model 1: Metro Commuter Backpack
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('shop')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Model 2: Tech Exec Clamshell
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('shop')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Model 3: Urban Minimalist Sling
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('why-us')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Quality Standards & Sialkot Tough
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('tracking')}
                  className="hover:text-[#E2B29F] text-[#E2B29F] font-semibold transition-colors cursor-pointer"
                >
                  Live Order Tracking 🚚
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Open-Parcel Inspection FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Courier & Support info */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Cash on Delivery & Logistics
            </h4>
            
            <div className="bg-[#16181B] p-4 rounded-xl border border-[#252A30] space-y-2">
              <div className="flex items-center gap-2 text-white font-medium text-xs">
                <Truck className="w-4 h-4 text-[#E2B29F]" />
                <span>Courier Partners: TCS · Trax · Leopards</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Doorstep dispatch across Pakistan. Zero advance payment. Open-parcel inspection allowed before handing cash to the rider.
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Hotline: </span>
                <a
                  href={`https://wa.me/${STORE_PHONE_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#E2B29F] font-semibold tabular-nums"
                >
                  {STORE_DISPLAY_PHONE}
                </a>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Mail className="w-3.5 h-3.5 text-[#C88D76]" />
                <span>Concierge: contact@mbatelier.shop</span>
              </div>
              <div className="text-[11px] text-neutral-400 pt-0.5">
                Support Hours: Monday – Saturday (10:00 AM – 10:00 PM PKT)
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#1C1F24] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <div>
            © {new Date().getFullYear()} M&B Atelier (mbatelier.shop). All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Free Cash on Delivery</span>
            <span>·</span>
            <span>Open Parcel Inspection</span>
            <span>·</span>
            <span className="text-[#E2B29F] font-medium">Handcrafted in Pakistan 🇵🇰</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
