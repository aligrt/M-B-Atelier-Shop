import React, { useState } from 'react';
import {
  Globe,
  ChevronDown,
} from 'lucide-react';
import { CurrencyCode } from '../types';
import { CURRENCY_CONFIGS } from '../utils/currency';

interface CurrencySelectorProps {
  currentCurrency: CurrencyCode;
  onSelectCurrency: (code: CurrencyCode) => void;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currentCurrency,
  onSelectCurrency,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currencies: CurrencyCode[] = ['PKR', 'USD', 'GBP', 'EUR'];

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1C2025] hover:bg-[#252A30] border border-[#2B3038] hover:border-[#C5832B]/50 rounded-lg text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
        aria-label="Select Currency"
      >
        <Globe className="w-3.5 h-3.5 text-[#C5832B]" />
        <span>{CURRENCY_CONFIGS[currentCurrency].symbol}</span>
        <span className="font-mono">{currentCurrency}</span>
        <ChevronDown className="w-3 h-3 text-neutral-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[#16181B] border border-[#2B3038] shadow-2xl z-40 py-1 overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[#2B3038] text-[10px] uppercase font-bold text-neutral-400">
              Select Currency
            </div>
            {currencies.map((code) => {
              const conf = CURRENCY_CONFIGS[code];
              const isSelected = code === currentCurrency;
              return (
                <button
                  key={code}
                  onClick={() => {
                    onSelectCurrency(code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#20252C] text-[#E2B29F] font-bold'
                      : 'text-neutral-300 hover:bg-[#1C2025] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-bold text-[#C5832B]">
                      {conf.symbol}
                    </span>
                    <span>{code}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-normal">
                    {conf.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
