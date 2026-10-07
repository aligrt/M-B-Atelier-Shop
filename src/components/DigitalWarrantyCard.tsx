import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Calendar,
  MessageCircle,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Lock,
  Sparkles,
} from 'lucide-react';
import { STORE_PHONE_NUMBER, STORE_DISPLAY_PHONE } from '../data/products';
import { DigitalWarrantyCertificate, formatPakistaniPhoneDisplay } from '../services/api';

interface DigitalWarrantyCardProps {
  certificate: DigitalWarrantyCertificate;
}

export const DigitalWarrantyCard: React.FC<DigitalWarrantyCardProps> = ({ certificate }) => {
  const [copiedSerial, setCopiedSerial] = useState(false);

  const handleCopySerial = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(certificate.serialNumber);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = certificate.serialNumber;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedSerial(true);
      setTimeout(() => setCopiedSerial(false), 2000);
    } catch (e) {
      console.warn('Copy serial failed', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappClaimUrl = `https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent(
    `Hello M&B Atelier Support. I would like to initiate a 1-Year Local Warranty claim for my bag.
Serial Number: ${certificate.serialNumber}
Order Reference: ${certificate.orderId}
Customer WhatsApp ID: +${certificate.customerUid}
Issue Description: `
  )}`;

  return (
    <div className="bg-gradient-to-br from-[#1C1F25] via-[#16181C] to-[#121417] border border-[#C88D76]/50 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-neutral-100 transition-all hover:border-[#E2B29F]/70">
      {/* Decorative Guilloche / Seal Watermark */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#C88D76]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DF9B84] via-[#C88D76] to-[#A36652]" />

      {/* Top Card Bar: Emblem + Official Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2B3038] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#272B33] to-[#191C21] border border-[#C88D76]/60 flex items-center justify-center text-[#E2B29F] shadow-lg">
            <Award className="w-6 h-6 text-[#C88D76]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm tracking-[0.2em] uppercase text-white">
                M&B ATELIER
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-950/70 text-emerald-400 border border-emerald-800/80">
                Active Local Warranty
              </span>
            </div>
            <p className="text-[11px] text-[#C88D76] font-medium tracking-wide">
              Official Sialkot Craftsmanship Guarantee
            </p>
          </div>
        </div>

        {/* Action Buttons: Print / Claim */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-[#20252C] hover:bg-[#2A313B] border border-[#373F4B] text-neutral-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Print or Save Certificate as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#E2B29F]" />
            <span className="hidden sm:inline">Print / Save PDF</span>
          </button>

          <a
            href={whatsappClaimUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Claim via WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Serial Number, Phone UID, Order Date, Expiry Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-5 border-b border-[#2B3038] text-xs">
        {/* Left Column: Unique Serial & Product */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
              Unique Bag Serial Number
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-base sm:text-lg font-extrabold text-[#E2B29F] tracking-wider">
                {certificate.serialNumber}
              </span>
              <button
                onClick={handleCopySerial}
                className="p-1 rounded bg-[#20252C] hover:bg-[#29303A] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Copy Serial Number"
              >
                {copiedSerial ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#C88D76]" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Laser-etched into inner leather seal of Model 1 / Model 2 / Model 3
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
              Registered Product
            </span>
            <p className="text-sm font-bold text-white mt-0.5">{certificate.productName}</p>
            <span className="text-[11px] text-neutral-400 font-mono">
              Order Ref: {certificate.orderId}
            </span>
          </div>
        </div>

        {/* Right Column: Customer WhatsApp ID & 1-Year Expiry Date */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
              Verified Patron ID (WhatsApp)
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm font-bold text-white">
                +{certificate.customerUid}
              </span>
              <span className="text-[11px] text-neutral-400">
                ({formatPakistaniPhoneDisplay(certificate.customerUid)})
              </span>
            </div>
            <p className="text-[10px] text-emerald-400/90 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Identity authenticated via WhatsApp OTP</span>
            </p>
          </div>

          <div className="bg-[#121417] p-3 rounded-xl border border-[#262B33]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Delivery Date:</span>
              <span className="font-mono font-medium text-white">{certificate.deliveryDate}</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t border-[#1F242C]">
              <span className="text-[#E2B29F] font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Warranty Expiry:</span>
              </span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {certificate.expiryDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Inclusions Checklist */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-300">
            What Is Covered Under Sialkot 365-Day Guarantee?
          </span>
          <span className="text-[10px] text-[#C88D76]">Doorstep Pickup Across Pakistan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {certificate.coverageInclusions.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-[#14171A] p-2.5 rounded-lg border border-[#23272F] text-neutral-300"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-snug">{item}</span>
            </div>
          ))}
        </div>

        {/* Direct WhatsApp Claim Helper */}
        <div className="mt-2 pt-3 border-t border-[#262C34] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#C88D76]" />
            <span>Digital Certificate Hash: <code className="font-mono text-[#E2B29F] text-[10px]">SHA256-{certificate.serialNumber.replace(/\D/g, '')}</code></span>
          </div>
          <a
            href={whatsappClaimUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E2B29F] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>Trigger WhatsApp Claim with Serial {certificate.serialNumber}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
