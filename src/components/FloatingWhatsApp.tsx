import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { STORE_PHONE_NUMBER, STORE_DISPLAY_PHONE } from '../data/products';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  const defaultMsg = encodeURIComponent(
    'Assalam-o-Alaikum M&B Atelier! I have a question about placing a Cash on Delivery order.'
  );

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-20 sm:bottom-24 right-5 z-30 flex items-center gap-3">
      {/* Speech prompt bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-[#1A1E24] text-white border border-[#2D3748] px-3.5 py-2 rounded-xl shadow-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>WhatsApp Hotline: {STORE_DISPLAY_PHONE}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-neutral-400 hover:text-white p-0.5 rounded cursor-pointer ml-1"
            aria-label="Dismiss chat tip"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={`https://wa.me/${STORE_PHONE_NUMBER}?text=${defaultMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact M&B Atelier on WhatsApp"
        className="w-12 h-12 sm:w-13 sm:h-13 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-950/60 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40 relative group cursor-pointer"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-[#141414]"></span>
        </span>
        <MessageSquare className="w-5 h-5 fill-white text-white" />
      </a>
    </aside>
  );
};
