import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { STORE_PHONE_NUMBER } from '../data/products';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  const defaultMsg = encodeURIComponent(
    'Assalam-o-Alaikum M&B Atelier! I am interested in ordering a bag via Cash on Delivery. Can you guide me?'
  );

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
      {/* Speech prompt bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-[#1A1E24] text-white border border-[#2D3748] px-3.5 py-2 rounded-xl shadow-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Chat with Store Manager</span>
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
        className="w-13 h-13 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-950/60 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40 relative group"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-[#141414]"></span>
        </span>
        <MessageSquare className="w-6 h-6 fill-white" />
      </a>
    </aside>
  );
};
