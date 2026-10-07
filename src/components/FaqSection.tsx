import React, { useState } from 'react';
import { ChevronDown, HelpCircle, PhoneCall } from 'lucide-react';
import { FAQS, STORE_PHONE_NUMBER } from '../data/products';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-14 sm:py-20 bg-[#16181B] border-b border-[#252A30]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#14171A] border border-[#2B3038] text-xs font-bold uppercase tracking-wider text-[#E2B29F] mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#C88D76]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            Everything you need to know about Cash on Delivery, doorstep inspection, and our Sialkot & Lahore warranty.
          </p>
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
