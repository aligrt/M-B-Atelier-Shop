import React, { useState } from 'react';
import { ShoppingBag, Menu, X, PhoneCall, User, ShieldCheck } from 'lucide-react';
import { STORE_PHONE_NUMBER } from '../data/products';
import { BrandLogo } from './BrandLogo';
import { CustomerUser, formatPakistaniPhoneDisplay } from '../services/api';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onScrollToSection: (sectionId: string) => void;
  currentUser: CustomerUser | null;
  onOpenAccount: () => void;
  onTriggerAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onScrollToSection,
  currentUser,
  onOpenAccount,
  onTriggerAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onScrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#252A30] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Zone 1: Brand Zone - Wordmark & Intertwined M& Backpack Emblem */}
        <button
          onClick={() => handleNavClick('hero')}
          className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5832B] flex items-center gap-2.5 sm:gap-3 py-1 bg-transparent border-0 shrink-0"
        >
          <div className="flex items-center justify-center shrink-0 bg-transparent">
            <BrandLogo variant="mark" size="sm" className="bg-transparent" />
          </div>
          <div className="flex flex-col text-left justify-center">
            <span className="font-sans font-extrabold text-sm sm:text-base md:text-lg tracking-[0.2em] text-white group-hover:text-[#E2B29F] transition-colors uppercase leading-none">
              M&B ATELIER
            </span>
            <span className="text-[10px] tracking-[0.14em] text-[#C5832B] font-medium leading-tight mt-0.5">
              mbatelier.shop
            </span>
          </div>
        </button>

        {/* Zone 2: Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-neutral-300">
          <button
            onClick={() => handleNavClick('shop')}
            className="hover:text-[#E2B29F] transition-colors cursor-pointer py-1"
          >
            Shop Models
          </button>
          <button
            onClick={() => handleNavClick('why-us')}
            className="hover:text-[#E2B29F] transition-colors cursor-pointer py-1"
          >
            Why Us
          </button>
          <button
            onClick={() => handleNavClick('reviews')}
            className="hover:text-[#E2B29F] transition-colors cursor-pointer py-1"
          >
            Reviews
          </button>
          <button
            onClick={() => handleNavClick('warranty')}
            className="hover:text-[#E2B29F] transition-colors cursor-pointer py-1"
          >
            1-Yr Warranty
          </button>
          <button
            onClick={() => handleNavClick('tracking')}
            className="hover:text-[#E2B29F] transition-colors cursor-pointer py-1 font-semibold text-[#E2B29F]"
          >
            Track Order
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className="hover:text-[#E2B29F] transition-colors cursor-pointer py-1"
          >
            FAQs
          </button>
        </nav>

        {/* Zone 3: Actions (Account, WhatsApp, Cart) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Customer Account Button (Flow 2: /account access) */}
          {currentUser ? (
            <button
              onClick={onOpenAccount}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C2025] hover:bg-[#252A30] border border-[#C88D76]/40 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title={`WhatsApp ID: +${currentUser.uid}`}
            >
              <div className="w-5 h-5 rounded-full bg-[#C88D76]/30 text-[#E2B29F] flex items-center justify-center text-[10px] font-bold">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'W'}
              </div>
              <span className="hidden sm:inline font-mono text-[11px] text-[#E2B29F]">
                {currentUser.name || formatPakistaniPhoneDisplay(currentUser.uid)}
              </span>
              <span className="sm:hidden font-mono text-[11px] text-[#E2B29F]">Account</span>
            </button>
          ) : (
            <button
              onClick={onTriggerAuth}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-[#1C2025] hover:bg-[#252A30] border border-[#2B3038] rounded-lg transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#C88D76]" />
              <span>WhatsApp Login</span>
            </button>
          )}

          {/* Quick WhatsApp contact icon on desktop */}
          <a
            href={`https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent('Hello M&B Atelier! I have a question about your bags.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-md hover:bg-emerald-900/50 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Concierge</span>
          </a>

          {/* Cart Action Button with dynamic counter badge */}
          <button
            onClick={onOpenCart}
            aria-label={`Shopping Cart with ${cartCount} items`}
            className="relative flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-neutral-950 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] hover:from-[#F0C0B0] hover:to-[#D49D87] active:from-[#A86C55] active:to-[#9C5B42] rounded-lg transition-all shadow-md shadow-[#C88D76]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-neutral-950" />
            <span className="font-semibold text-neutral-950">Cart ({cartCount})</span>
            {cartCount > 0 && (
              <span className="sr-only">{cartCount} items in cart</span>
            )}
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#16181B] border-b border-[#252A30] px-4 pt-3 pb-5 space-y-3 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-2 text-sm font-medium text-neutral-200">
            {/* Account link on mobile */}
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccount();
                }}
                className="text-left py-2 px-3 rounded-lg bg-[#20252C] border border-[#C88D76]/40 text-[#E2B29F] font-semibold flex items-center justify-between"
              >
                <span>My Account (+{currentUser.uid})</span>
                <span className="text-[11px] underline">View Orders</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onTriggerAuth();
                }}
                className="text-left py-2 px-3 rounded-lg bg-[#1F2328] hover:bg-[#252A30] text-neutral-200 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[#C88D76]" />
                <span>Register or Login with WhatsApp</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('shop')}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#20242A] hover:text-[#E2B29F] transition-colors"
            >
              Shop Models (1, 2, 3)
            </button>
            <button
              onClick={() => handleNavClick('why-us')}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#20242A] hover:text-[#E2B29F] transition-colors"
            >
              Why Us & Sialkot Tough Quality
            </button>
            <button
              onClick={() => handleNavClick('reviews')}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#20242A] hover:text-[#E2B29F] transition-colors"
            >
              Customer Reviews (Karachi / Lahore / Islamabad)
            </button>
            <button
              onClick={() => handleNavClick('warranty')}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#20242A] hover:text-[#E2B29F] transition-colors"
            >
              1-Year Local Warranty & Repairs
            </button>
            <button
              onClick={() => handleNavClick('tracking')}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#20242A] hover:text-[#E2B29F] transition-colors font-medium text-[#E2B29F]"
            >
              Track Order (Live Courier Status)
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#20242A] hover:text-[#E2B29F] transition-colors"
            >
              Delivery & Open-Parcel FAQs
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Open Parcel Inspection
            </span>
            <a
              href={`https://wa.me/${STORE_PHONE_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-semibold flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5" /> WhatsApp Support
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
