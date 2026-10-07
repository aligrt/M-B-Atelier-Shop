import React from 'react';
import { CheckCircle2, MessageSquare, Copy, Check } from 'lucide-react';
import { OrderDetails } from '../types';
import { STORE_PHONE_NUMBER } from '../data/products';

interface OrderSuccessModalProps {
  order: OrderDetails | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello M&B Atelier! I just placed COD Order *${order.orderId}* for PKR ${order.total.toLocaleString()}. Please confirm dispatch status.`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-[#16181B] border border-[#2B3038] rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          
          {/* Header Banner */}
          <div className="bg-[#1C2025] px-6 py-6 border-b border-[#2B3038] text-center">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#E2B29F]">
              Order Confirmed · Cash on Delivery
            </span>
            <h2 className="font-display text-2xl font-extrabold text-white mt-1">
              Thank You, {order.customerName}!
            </h2>
            <div className="mt-2 inline-flex items-center gap-2 bg-[#14171A] px-3 py-1 rounded-md border border-[#2B3038]">
              <span className="text-xs text-neutral-400">Order ID:</span>
              <span className="text-xs font-mono font-bold text-[#E2B29F]">{order.orderId}</span>
              <button
                onClick={handleCopyOrderId}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-5 space-y-5">
            {/* Delivery Alert */}
            <div className="bg-[#14171A] p-4 rounded-xl border border-[#2B3038] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Destination:</span>
                <span className="font-semibold text-white">{order.city}, Pakistan</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Recipient Phone:</span>
                <span className="font-semibold text-white tabular-nums">{order.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Payment Due on Delivery:</span>
                <span className="font-bold text-[#E2B29F] tabular-nums text-sm">
                  PKR {order.total.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-[#2B3038] text-neutral-300">
                <span className="text-neutral-500 block mb-0.5">Shipping Address:</span>
                <p className="line-clamp-2">{order.address}</p>
              </div>
            </div>

            {/* What to expect next */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                What Happens Next?
              </h3>
              <div className="space-y-2.5 text-xs text-neutral-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#1C2025] border border-[#2B3038] text-[#E2B29F] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-white">Same-Day Dispatch:</strong> Your bag is packed at our Sialkot and Lahore atelier and handed to TCS / Trax Courier with tracking.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#1C2025] border border-[#2B3038] text-[#E2B29F] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-white">Courier Rider Calls:</strong> The rider will call your phone ({order.phone}) before delivery.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#1C2025] border border-[#2B3038] text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-emerald-300">Open-Parcel Check:</strong> Open flyer, inspect laptop sleeve & zippers, then hand cash to rider.
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Chat Direct Button */}
            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/${STORE_PHONE_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Confirm Status on WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-[#1C2025] hover:bg-[#23282F] text-neutral-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Back to Store
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
