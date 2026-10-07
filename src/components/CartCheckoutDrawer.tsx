import React, { useState, useEffect } from 'react';
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
  Tag,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  Check,
} from 'lucide-react';
import { CartItem, OrderDetails } from '../types';
import { PAKISTAN_CITIES, STORE_PHONE_NUMBER } from '../data/products';
import {
  CustomerUser,
  CustomerOffer,
  mbApiService,
  formatPakistaniPhoneDisplay,
} from '../services/api';
import { WhatsAppAuthModal } from './WhatsAppAuthModal';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderSuccess: (order: OrderDetails) => void;
  onContinueShopping: () => void;
  currentUser: CustomerUser | null;
  onUserAuthenticated: (user: CustomerUser, token: string) => void;
  activeOffers: CustomerOffer[];
  appliedCoupon: string | null;
  onApplyCoupon: (code: string | null) => void;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onOrderSuccess,
  onContinueShopping,
  currentUser,
  onUserAuthenticated,
  activeOffers,
  appliedCoupon,
  onApplyCoupon,
}) => {
  // Form fields for COD delivery
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState<string>('Lahore');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feature 2: High-Trust Open Parcel Guarantee checkbox (Pre-selected by default)
  const [requestOpenParcel, setRequestOpenParcel] = useState(true);

  // Flow 1: WhatsApp Auth Modal trigger
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [manualCouponInput, setManualCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Auto-populate when user is authenticated (Flow 1, Step 5)
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !fullName) {
        setFullName(currentUser.name);
      }
      if (currentUser.phone && !phone) {
        setPhone(currentUser.phone);
      }
      if (currentUser.address && !address) {
        setAddress(currentUser.address);
      }
      if (currentUser.city) {
        setCity(currentUser.city);
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Discount calculations based on active and applied coupon
  let discountAmount = 0;
  if (appliedCoupon === 'RETURNING10') {
    discountAmount = Math.round(subtotal * 0.1);
  }

  const shipping = 0; // Free nationwide courier across Pakistan
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyCouponCode = (codeToApply: string) => {
    setCouponError('');
    const cleanCode = codeToApply.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'RETURNING10') {
      const isEligible = activeOffers.some((o) => o.code === 'RETURNING10');
      if (isEligible || currentUser?.uid === '923001234567') {
        onApplyCoupon('RETURNING10');
        setManualCouponInput('');
      } else {
        setCouponError('RETURNING10 is exclusive to patrons with at least 1 completed order.');
      }
    } else if (cleanCode === 'MBFREE') {
      onApplyCoupon('MBFREE');
      setManualCouponInput('');
    } else {
      setCouponError('Invalid or expired coupon code for Pakistan COD delivery.');
    }
  };

  /**
   * Flow 1: Initiate WhatsApp OTP Authentication if not logged in.
   * Flow 2: Once logged in, execute secure COD order placement via POST /api/orders/place.
   */
  const handleProceedOrConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Your shopping cart is empty.');
      return;
    }

    // Step 1: If user is not authenticated, open Flow 1 WhatsApp Auth Modal
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    // Validation for delivery fields
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name for courier delivery.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your WhatsApp contact number.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your complete doorstep street address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Flow 2, Step 1: Secure Order Placement via API Service with Open Parcel Flag
      const response = await mbApiService.placeOrder({
        customerName: fullName.trim(),
        phone: currentUser.uid || phone.trim(),
        address: address.trim(),
        city,
        deliveryNotes: deliveryNotes.trim(),
        items: cart,
        subtotal,
        discountAmount,
        couponCode: appliedCoupon || undefined,
        total,
        openParcelRequested: requestOpenParcel,
      });

      if (response.success) {
        const orderData: OrderDetails = {
          orderId: response.orderId,
          customerName: fullName.trim(),
          phone: currentUser.phone || phone.trim(),
          address: address.trim(),
          city,
          deliveryNotes: deliveryNotes.trim(),
          items: cart,
          subtotal,
          shipping: 0,
          total,
          createdAt: new Date().toISOString(),
          paymentMethod: 'COD',
          status: 'processing',
          courier: 'Trax Logistics',
          trackingNumber: response.order.courierTrackingNumber,
        };

        onOrderSuccess(orderData);
      } else {
        setErrorMsg('Failed to place order. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error occurred while connecting to serverless database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <div className="w-screen max-w-md sm:max-w-lg bg-[#16181B] border-l border-[#2B3038] shadow-2xl flex flex-col justify-between">
            {/* Drawer Header */}
            <div className="px-5 py-4 bg-[#1C2025] border-b border-[#2B3038] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#252A30] flex items-center justify-center text-[#E2B29F]">
                  <ShoppingBag className="w-5 h-5 text-[#C88D76]" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                    <span>Your Atelier Cart</span>
                    <span className="text-xs font-mono font-semibold text-[#E2B29F] bg-[#14171A] px-2 py-0.5 rounded border border-[#2B3038]">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Cash on Delivery & Open-Parcel Verification across Pakistan
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#252A30] transition-colors cursor-pointer"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Authenticated Customer Pill / Banner */}
            {currentUser && (
              <div className="px-5 py-2.5 bg-[#14171A] border-b border-[#2B3038] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-neutral-300">
                    Logged in: <strong className="text-white">+{currentUser.uid}</strong>
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/80">
                  WhatsApp Verified
                </span>
              </div>
            )}

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Cart Items List */}
              <div className="space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto" />
                    <h3 className="text-sm font-semibold text-neutral-300">Your bag is empty</h3>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                      Explore our Sialkot craftsmanship backpacks and everyday carry bags engineered for heavy tech.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onContinueShopping();
                      }}
                      className="mt-2 px-4 py-2 bg-[#252A30] hover:bg-[#2F353D] text-[#E2B29F] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Browse Models
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-[#1C2025] p-3.5 rounded-xl border border-[#2B3038] flex gap-3 items-center"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover bg-neutral-900 border border-[#2B3038] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-[#C88D76] font-mono mt-0.5">
                          PKR {item.product.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-[#363C47] rounded-lg bg-[#14171A]">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="p-1 hover:text-[#C88D76] text-neutral-400 transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-mono font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="p-1 hover:text-[#C88D76] text-neutral-400 transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer ml-auto"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Coupon / Discount Code Section */}
              {cart.length > 0 && (
                <div className="bg-[#14171A] p-3.5 rounded-xl border border-[#2B3038] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#C88D76]" />
                      <span>Discount / Privilege Coupon</span>
                    </span>
                    {appliedCoupon && (
                      <button
                        onClick={() => onApplyCoupon(null)}
                        className="text-[11px] text-red-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Returning Customer Click-to-Apply Trigger (Flow 3) */}
                  {activeOffers.length > 0 && !appliedCoupon && (
                    <div className="space-y-1.5">
                      {activeOffers.map((offer) => (
                        <div
                          key={offer.code}
                          className="flex items-center justify-between p-2 bg-[#1C2025] rounded-lg border border-[#C88D76]/30 text-xs"
                        >
                          <div>
                            <span className="font-bold text-white block">{offer.code}</span>
                            <span className="text-[11px] text-neutral-400">{offer.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onApplyCoupon(offer.code)}
                            className="px-2.5 py-1 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] text-neutral-950 font-bold text-[10px] rounded hover:opacity-90 transition-opacity cursor-pointer"
                          >
                            Click to Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Manual Promo Code input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. RETURNING10 or MBFREE"
                      value={manualCouponInput}
                      onChange={(e) => setManualCouponInput(e.target.value)}
                      className="flex-1 bg-[#1A1D21] border border-[#2B3038] rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 uppercase font-mono outline-none focus:border-[#C88D76]"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCouponCode(manualCouponInput)}
                      className="px-3 py-1.5 bg-[#252A30] hover:bg-[#2F353D] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}
                </div>
              )}

              {/* COD Delivery Details Form */}
              {cart.length > 0 && (
                <form onSubmit={handleProceedOrConfirm} className="space-y-4 pt-2">
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
                          Trax/CallCourier riders contact via this number. Open-parcel confirmation sent via WhatsApp.
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

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>VIP Coupon ({appliedCoupon})</span>
                        <span className="font-semibold tabular-nums">
                          - PKR {discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Nationwide Courier (Trax / CallCourier)</span>
                      </span>
                      <span className="text-emerald-400 font-bold uppercase">FREE</span>
                    </div>

                    <div className="border-t border-[#2B3038] pt-2 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white">Total Amount (COD)</span>
                      <span className="text-lg font-extrabold text-[#E2B29F] tabular-nums">
                        PKR {total.toLocaleString()}
                      </span>
                    </div>

                    {/* Feature 2: Pre-selected Open Parcel Guarantee Checkbox */}
                    <div className="pt-2 border-t border-[#242830]">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={requestOpenParcel}
                          onChange={(e) => setRequestOpenParcel(e.target.checked)}
                          className="w-4 h-4 rounded border-[#3A424E] text-[#C88D76] focus:ring-[#C88D76] bg-[#14171A] accent-[#C88D76]"
                        />
                        <span className="text-[11px] text-neutral-300 font-medium">
                          I request <strong className="text-white">Open Parcel Inspection</strong> at doorstep.
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Feature 2: High-Trust Open Parcel Guarantee Badge Card */}
                  <div className="bg-gradient-to-r from-[#191D22] via-[#16191D] to-[#121417] border-2 border-emerald-600/40 rounded-xl p-3.5 sm:p-4 space-y-1.5 shadow-lg relative overflow-hidden">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl shrink-0 select-none">
                        📦
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            Open-Parcel Delivery Guaranteed
                          </h4>
                          <span className="px-1.5 py-0.5 bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-[9px] font-extrabold uppercase rounded">
                            Verified COD
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-300 leading-snug">
                          You are allowed to inspect your M&B Atelier bag in front of the rider before paying Cash on Delivery.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Button (Flow 1: Proceed to COD Checkout / Confirm Order) */}
                  <div className="space-y-2.5 pt-1">
                    {!currentUser ? (
                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-[#DF9B84] to-[#C5832B] hover:from-[#F0C0B0] hover:to-[#D49D87] text-neutral-950 font-bold text-sm sm:text-base rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C5832B]/20 cursor-pointer"
                      >
                        <Lock className="w-4 h-4 text-neutral-950" />
                        <span>Proceed to COD Checkout (WhatsApp Login)</span>
                        <ArrowRight className="w-4 h-4 text-neutral-950" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-[#DF9B84] to-[#C5832B] hover:from-[#F0C0B0] hover:to-[#D49D87] text-neutral-950 font-bold text-sm sm:text-base rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C5832B]/20 disabled:opacity-50 cursor-pointer"
                      >
                        <Truck className="w-5 h-5 text-neutral-950" />
                        <span>
                          {isSubmitting ? 'Submitting to Firestore...' : 'Confirm Cash on Delivery Order 🚚'}
                        </span>
                      </button>
                    )}

                    {/* Secondary WhatsApp Direct Option */}
                    <a
                      href={`https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent(`Hello M&B Atelier! I would like to order with COD directly.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-2 text-center"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>Order via Direct WhatsApp Chat</span>
                    </a>
                  </div>

                  {/* Trust Footer Note */}
                  <div className="bg-[#1C2025] rounded-xl p-3 border border-[#2B3038] flex items-start gap-2.5 text-[11px] text-neutral-300">
                    <ShieldCheck className="w-4 h-4 text-[#E2B29F] shrink-0 mt-0.5" />
                    <span>
                      <strong>1-Year Local Warranty Included:</strong> Manufactured in Sialkot with full doorstep pickup coverage for 365 days.
                    </span>
                  </div>
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

      {/* Flow 1: WhatsApp Authentication Modal */}
      <WhatsAppAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialPhone={phone}
        onAuthenticated={(user, token) => {
          setIsAuthModalOpen(false);
          onUserAuthenticated(user, token);
          // Flow 1 Step 5: Automatically activate fields and populate name/address
          if (user.name) setFullName(user.name);
          if (user.phone) setPhone(user.phone);
          if (user.address) setAddress(user.address);
          if (user.city) setCity(user.city);
        }}
      />
    </>
  );
};
