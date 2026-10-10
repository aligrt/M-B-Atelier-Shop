import React, { useState } from 'react';
import { ChevronDown, HelpCircle, PhoneCall, Truck, Search, ArrowRight } from 'lucide-react';
import { FAQS, STORE_PHONE_NUMBER } from '../data/products';

interface FaqSectionProps {
  onTrackOrder?: (orderId: string) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onTrackOrder }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [quickOrderId, setQuickOrderId] = useState('');

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickOrderId.trim() && onTrackOrder) {
      onTrackOrder(quickOrderId.trim());
    } else {
      const trackingEl = document.getElementById('tracking');
      if (trackingEl) {
        trackingEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="faq" className="py-14 sm:py-20 bg-[#16181B] border-b border-[#252A30]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#14171A] border border-[#2B3038] text-xs font-bold uppercase tracking-wider text-[#E2B29F] mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#C88D76]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            Everything you need to know about Cash on Delivery, doorstep inspection, and our Sialkot & Lahore craftsmanship standards.
          </p>
        </div>

        {/* Quick Order Tracking Utility Banner inside FAQ */}
        <div className="mb-10 p-5 bg-[#14171A] border border-[#C88D76]/50 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C2025] border border-[#2B3038] flex items-center justify-center text-[#E2B29F] shrink-0">
              <Truck className="w-5 h-5 text-[#C88D76]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">
                Looking to track your active delivery?
              </h3>
              <p className="text-xs text-neutral-400">
                Enter your Order ID (e.g., <span className="font-mono text-[#E2B29F]">MBA-8492</span>) to see live courier milestones.
              </p>
            </div>
          </div>

          <form onSubmit={handleQuickTrack} className="w-full md:w-auto flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickOrderId}
                onChange={(e) => setQuickOrderId(e.target.value)}
                placeholder="Order ID (e.g. MBA-8492)"
                className="w-full pl-9 pr-3 py-2 bg-[#1C2025] border border-[#2B3038] focus:border-[#C88D76] rounded-xl text-xs text-white uppercase outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] hover:from-[#F0C0B0] hover:to-[#D49D87] text-neutral-950 font-bold text-xs rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Accordion list */}
        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#1C2025] border-[#C88D76]/60 shadow-md ring-1 ring-[#C88D76]/20'
                    : 'bg-[#14171A] border-[#2B3038] hover:border-neutral-500'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C88D76]"
                >
                  <span className="font-display font-semibold text-sm sm:text-base text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#E2B29F]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-[#2B3038]/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-10 p-5 bg-[#14171A] border border-[#2B3038] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-white font-semibold text-sm">Need advice on choosing the right model?</h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Chat directly with our product specialist in Sialkot and Lahore. Average response: under 5 minutes.
            </p>
          </div>
          <a
            href={`https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent('Hi! I need help selecting the right M&B Atelier bag.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 shrink-0 shadow-md"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
