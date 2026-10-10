import { CurrencyCode, CurrencyConfig } from '../types';

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  PKR: {
    code: 'PKR',
    symbol: '₨',
    name: 'Pakistani Rupee',
    rateAgainstPKR: 1,
    format: (amountInPKR) => `₨ ${Math.round(amountInPKR).toLocaleString()}`,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateAgainstPKR: 278, // 1 USD ≈ 278 PKR
    format: (amountInPKR, rate) => `$${(amountInPKR / rate).toFixed(2)}`,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateAgainstPKR: 366, // 1 GBP ≈ 366 PKR
    format: (amountInPKR, rate) => `£${(amountInPKR / rate).toFixed(2)}`,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateAgainstPKR: 310, // 1 EUR ≈ 310 PKR
    format: (amountInPKR, rate) => `€${(amountInPKR / rate).toFixed(2)}`,
  },
};

/**
 * Format any PKR amount into the target currency with proper symbol
 */
export function formatCurrency(amountInPKR: number, currency: CurrencyCode = 'PKR'): string {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.PKR;
  return config.format(amountInPKR, config.rateAgainstPKR);
}

/**
 * Convert PKR to target currency numeric value
 */
export function convertFromPKR(amountInPKR: number, currency: CurrencyCode = 'PKR'): number {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.PKR;
  return amountInPKR / config.rateAgainstPKR;
}
