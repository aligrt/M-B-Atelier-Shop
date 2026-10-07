import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Truck,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import { CartItem, OrderDetails } from '../types';
import { PAKISTAN_CITIES, STORE_PHONE_NUMBER } from '../data/products';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderSuccess: (order: OrderDetails) => void;
  onContinueShopping: () => void;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onOrderSuccess,
  onContinueShopping,
}) => {
  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState<string>('Lahore');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal;

  const validateForm = () => {
    if (cart.length === 0) {
      setErrorMsg('Your cart is empty. Please add a bag to order.');
      return false;
    }
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name for courier delivery.');
      return false;
    }
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid Pakistani mobile number (e.g., 0300 1234567).');
      return false;
    }
    if (!address.trim() || address.trim().length < 8) {
      setErrorMsg('Please enter your complete street address (House #, Street, Sector/Colony).');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const generateOrderId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `MBA-${randomNum}`;
  };

  const buildWhatsAppMessage = (orderId: string) => {
    const itemsList = cart
      .map((item) => `• ${item.product.name} (x${item.quantity}) - PKR ${(item.product.price * item.quantity).toLocaleString()}`)
      .join('\n');

    const msg = `*NEW COD ORDER: ${orderId}* 🚚\n\n` +
      `*Customer Details:*\n` +
      `👤 Name: ${fullName.trim()}\n` +
      `📱 WhatsApp: ${phone.trim()}\n` +
      `📍 City: ${city}\n` +
      `🏠 Address: ${address.trim()}\n` +
      (deliveryNotes.trim() ? `📝 Delivery Note: ${deliveryNotes.trim()}\n` : '') +
      `\n*Order Summary:*\n` +
      `${itemsList}\n\n` +
      `💰 *Total Amount:* PKR ${total.toLocaleString()} (Cash on Delivery)\n` +
      `📦 *Shipping:* FREE Across Pakistan\n` +
      `🔍 *Open-Parcel Inspection:* Requested\n\n` +
      `_Please confirm dispatch timeline via TCS/Trax. Thank you!_`;

    return encodeURIComponent(msg);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const orderId = generateOrderId();
    const order: OrderDetails = {
      orderId,
      customerName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city,
      deliveryNotes: deliveryNotes.trim() || undefined,
      items: [...cart],
      subtotal,
      shipping: 0,
      total,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'COD',
    };

    // Open WhatsApp order confirmation
    const waUrl = `https://wa.me/${STORE_PHONE_NUMBER}?text=${buildWhatsAppMessage(orderId)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderSuccess(order);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-[#16181B] border-l border-[#2B3038] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#2B3038] flex items-center justify-between bg-[#14171A]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C88D76]" />
              <h2 className="font-display font-bold text-lg text-white">
                Cash on Delivery Checkout
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Top COD Trust Banner */}
            <div className="bg-[#1C2025] border border-[#2B3038] rounded-xl p-3.5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#E2B29F] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block">
                  Open-Parcel Inspection Guaranteed
                </span>
                <span className="text-neutral-300">
                  You can open and inspect the bag when the courier rider arrives before paying cash.
                </span>
              </div>
            </div>

            {/* Cart Items List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Your Order ({cart.reduce((a, b) => a + b.quantity, 0)} items)
                </span>
                {cart.length > 0 && (
                  <span className="text-[11px] text-[#E2B29F] font-semibold">
                    Free Nationwide Courier
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 px-4 bg-[#14171A] rounded-xl border border-[#2B3038]">
                  <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-300">Your bag is empty</p>
                  <p className="text-xs text-neutral-500 mt-1 mb-4">Select a model from the catalog to continue.</p>
                  <button
                    onClick={() => {
                      onClose();
                      onContinueShopping();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] text-neutral-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Explore Models
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 bg-[#14171A] p-3 rounded-xl border border-[#2B3038]"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg bg-neutral-900 border border-[#2B3038] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-xs text-[#E2B29F] font-bold tabular-nums mt-0.5">
                          PKR {(item.product.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          PKR {item.product.price.toLocaleString()} each
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-[#1C2025] p-1 rounded-lg border border-[#2B3038]">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-neutral-300 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-neutral-300 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COD Delivery Details Form */}
            {cart.length > 0 && (
              <form onSubmit={handleConfirmOrder} className="space-y-4 pt-2">
                <div className="border-t border-[#2B3038] pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                    Delivery Address (Pakistan COD)
                  </h3>

                  {errorMsg && (
                    <div className="mb-3 p-3 bg-red-950/60 border border-red-800/80 rounded-lg flex items-center gap-2 text-xs text-red-200">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Full Name <span className="text-[#E2B29F]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Babar Butt"
                        className="w-full bg-[#14171A] border border-[#2B3038] focus:border-[#C88D76] focus:ring-1 focus:ring-[#C88D76] rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors"
                      />
                    </div>

                    {/* Mobile Number (WhatsApp) */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Mobile Number (WhatsApp) <span className="text-[#E2B29F]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0300 1234567 or +92 3XX"
                          className="w-full bg-[#14171A] border border-[#2B3038] focus:border-[#C88D76] focus:ring-1 focus:ring-[#C88D76] rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors"
                        />
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Courier rider will call and WhatsApp tracking link is sent to this number.
                      </p>
                    </div>

                    {/* City Selection Dropdown */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        City <span className="text-[#E2B29F]">*</span>
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#14171A] border border-[#2B3038] focus:border-[#C88D76] focus:ring-1 focus:ring-[#C88D76] rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-colors cursor-pointer"
                      >
                        {PAKISTAN_CITIES.map((c) => (
                          <option key={c} value={c} className="bg-[#181B1F] text-white">
                            {c} {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi'].includes(c) ? '(24-48h Delivery)' : '(2-3 Days)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Complete Street Address <span className="text-[#E2B29F]">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House / Flat #, Street #, Sector / Colony / Area landmark"
                        className="w-full bg-[#14171A] border border-[#2B3038] focus:border-[#C88D76] focus:ring-1 focus:ring-[#C88D76] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none transition-colors resize-none"
                      />
                    </div>

                    {/* Optional Delivery Notes */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Special Instructions / Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="e.g. Near Arfa Tower / Deliver after 3 PM"
                        className="w-full bg-[#14171A] border border-[#2B3038] focus:border-[#C88D76] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Financial Summary */}
                <div className="bg-[#14171A] p-4 rounded-xl border border-[#2B3038] space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="text-white font-medium tabular-nums">
                      PKR {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Nationwide Courier (TCS / Trax)</span>
                    </span>
                    <span className="text-emerald-400 font-bold uppercase">FREE</span>
                  </div>
                  <div className="border-t border-[#2B3038] pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">Total Amount (COD)</span>
                    <span className="text-lg font-extrabold text-[#E2B29F] tabular-nums">
                      PKR {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Primary Submit Button */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] hover:from-[#F0C0B0] hover:to-[#D49D87] active:from-[#A86C55] active:to-[#9C5B42] disabled:opacity-50 text-neutral-950 font-bold text-sm sm:text-base rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C88D76]/20 cursor-pointer"
                  >
                    <Truck className="w-5 h-5 text-neutral-950" />
                    <span>
                      {isSubmitting ? 'Confirming Order...' : 'Confirm Cash on Delivery Order 🚚'}
                    </span>
                  </button>

                  {/* Secondary WhatsApp Direct Option */}
                  <a
                    href={`https://wa.me/${STORE_PHONE_NUMBER}?text=${buildWhatsAppMessage(generateOrderId())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 text-center"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Order via WhatsApp Chat with Store Manager</span>
                  </a>
                </div>

                {/* Footer security note */}
                <p className="text-[11px] text-center text-neutral-400 pt-1">
                  🔒 No online advance payment required. Pay only after open-parcel check.
                </p>
              </form>
            )}

          </div>

          {/* Drawer Footer if Cart Empty */}
          {cart.length === 0 && (
            <div className="p-4 border-t border-[#2B3038] bg-[#14171A]">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#1C2025] hover:bg-[#252A30] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
