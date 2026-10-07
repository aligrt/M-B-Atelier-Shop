import React, { useState, useEffect } from 'react';
import {
  Package,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  Sparkles,
  ShoppingBag,
  MapPin,
  RefreshCw,
  Tag,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Box,
  Navigation,
  AlertCircle,
  MessageCircle,
  Award,
  FileText,
} from 'lucide-react';
import {
  CustomerUser,
  CustomerOrderRecord,
  CustomerOffer,
  DigitalWarrantyCertificate,
  CourierTrackingDetails,
  mbApiService,
  formatPakistaniPhoneDisplay,
  generateWarrantyCertificate,
} from '../services/api';
import { CourierTrackingModal } from './CourierTrackingModal';
import { DigitalWarrantyCard } from './DigitalWarrantyCard';

interface AccountPageProps {
  user: CustomerUser;
  onLogout: () => void;
  onContinueShopping: () => void;
  onTrackOrderDirect: (orderId: string) => void;
}

interface StepperStep {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ORDER_STEPS: StepperStep[] = [
  {
    id: 'processing',
    label: 'Processing',
    sublabel: 'Verified & Crafted in Sialkot',
    icon: Box,
  },
  {
    id: 'in_transit',
    label: 'In Transit',
    sublabel: 'Handed to Courier Partner',
    icon: Truck,
  },
  {
    id: 'out_for_delivery',
    label: 'Out for Delivery',
    sublabel: 'Rider en route to destination',
    icon: Navigation,
  },
  {
    id: 'delivered',
    label: 'Delivered',
    sublabel: 'Doorstep COD Handover',
    icon: CheckCircle2,
  },
];

interface OrderStatusStepperProps {
  status: CustomerOrderRecord['status'];
  courierName?: string;
  courierTrackingNumber?: string;
  compact?: boolean;
}

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({
  status,
  courierName,
  courierTrackingNumber,
  compact = false,
}) => {
  let currentStepIndex = 0;
  let isCancelled = false;

  switch (status) {
    case 'Delivered':
      currentStepIndex = 3;
      break;
    case 'Shipped':
      currentStepIndex = courierTrackingNumber ? 2 : 1;
      break;
    case 'COD Pending':
      currentStepIndex = 0;
      break;
    case 'Cancelled':
      isCancelled = true;
      currentStepIndex = -1;
      break;
    default:
      currentStepIndex = 0;
  }

  if (isCancelled) {
    return (
      <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-3 flex items-center gap-2.5 text-xs text-red-300">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        <div>
          <span className="font-semibold text-red-200">Order Cancelled:</span> This Cash on Delivery order was cancelled prior to dispatch.
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${compact ? 'py-1' : 'py-3'}`}>
      <div className="relative">
        {/* Background Connecting Line */}
        <div
          aria-hidden="true"
          className="absolute top-4 left-6 right-6 h-0.5 bg-[#252A30] -translate-y-1/2"
        >
          {/* Active Fill Line */}
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-[#C88D76] to-[#E2B29F] transition-all duration-500 ease-out"
            style={{
              width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Stepper Steps Grid */}
        <div className="relative flex justify-between items-start">
          {ORDER_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIndex || (status === 'Delivered' && idx === 3);
            const isCurrent = idx === currentStepIndex && status !== 'Delivered';

            return (
              <div
                key={step.id}
                className="flex flex-col items-center text-center relative group max-w-[70px] sm:max-w-[100px]"
              >
                {/* Step Circle Indicator */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 ${
                    isCompleted
                      ? 'bg-emerald-500 text-neutral-950 ring-4 ring-emerald-950/60 shadow-md shadow-emerald-950'
                      : isCurrent
                      ? 'bg-gradient-to-br from-[#DF9B84] to-[#C88D76] text-neutral-950 ring-4 ring-[#C88D76]/30 shadow-lg shadow-[#C88D76]/20 animate-pulse'
                      : 'bg-[#181B20] text-neutral-500 border border-[#2B3038]'
                  }`}
                  aria-label={`${step.label}: ${isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Upcoming'}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Step Text Label */}
                <div className="mt-2 space-y-0.5">
                  <p
                    className={`text-[11px] sm:text-xs font-bold leading-tight ${
                      isCompleted
                        ? 'text-white'
                        : isCurrent
                        ? 'text-[#E2B29F]'
                        : 'text-neutral-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  {!compact && (
                    <p className="hidden sm:block text-[9px] text-neutral-400 font-medium leading-tight line-clamp-1">
                      {idx === 1 && courierName ? courierName : step.sublabel}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const AccountPage: React.FC<AccountPageProps> = ({
  user,
  onLogout,
  onContinueShopping,
  onTrackOrderDirect,
}) => {
  // Navigation Tabs: 'orders' or 'warranty'
  const [activeTab, setActiveTab] = useState<'orders' | 'warranty'>('orders');

  const [orders, setOrders] = useState<CustomerOrderRecord[]>([]);
  const [offers, setOffers] = useState<CustomerOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  // Feature 1: Embedded Courier Tracking Slide-over Modal State
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [courierTrackingData, setCourierTrackingData] = useState<CourierTrackingDetails | null>(null);
  const [isCourierLoading, setIsCourierLoading] = useState(false);
  const [courierError, setCourierError] = useState<string | null>(null);

  useEffect(() => {
    mbApiService.recordAccountVisit();

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [ordersData, offersData] = await Promise.all([
          mbApiService.getOrderHistory(user.uid),
          mbApiService.getOffers(user.uid, false),
        ]);
        setOrders(ordersData);
        setOffers(offersData);

        if (ordersData.length > 0) {
          setExpandedOrderIds({ [ordersData[0].orderId]: true });
        }
      } catch (err) {
        console.error('Failed to load account data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user.uid]);

  // Handle Opening Embedded Courier Tracking Drawer
  const handleOpenCourierTracking = async (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTrackingOrderId(orderId);
    setIsTrackingModalOpen(true);
    setIsCourierLoading(true);
    setCourierError(null);

    try {
      const data = await mbApiService.getCourierTracking(orderId);
      setCourierTrackingData(data);
    } catch (err: any) {
      setCourierError(err?.message || 'Failed to fetch tracking data from courier API.');
    } finally {
      setIsCourierLoading(false);
    }
  };

  // Copy Order ID to clipboard with visual feedback
  const handleCopyOrderId = async (orderId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(orderId);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = orderId;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedOrderId(orderId);
      setTimeout(() => {
        setCopiedOrderId((prev) => (prev === orderId ? null : prev));
      }, 2000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const getStatusBadge = (status: CustomerOrderRecord['status']) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/60 text-blue-400 border border-blue-800/60">
            <Truck className="w-3.5 h-3.5" /> In Transit / Shipped
          </span>
        );
      case 'COD Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/60">
            <Clock className="w-3.5 h-3.5" /> COD Confirmed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/60 text-red-400 border border-red-800/60">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300">
            {status}
          </span>
        );
    }
  };

  // Filter delivered orders for Digital Warranty Vault
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered');
  const warrantyCertificates: DigitalWarrantyCertificate[] = deliveredOrders.map((ord) =>
    generateWarrantyCertificate(ord, user.uid)
  );

  return (
    <div className="min-h-screen bg-[#14171A] text-neutral-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Profile Banner */}
        <div className="bg-gradient-to-r from-[#1B1E23] to-[#16181B] border border-[#2B3038] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C88D76]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DF9B84] to-[#C88D76] text-neutral-950 flex items-center justify-center font-display font-extrabold text-xl shadow-lg shadow-[#C88D76]/30">
              {user.name ? user.name.slice(0, 1).toUpperCase() : 'MB'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                  {user.name || 'M&B Atelier Patron'}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#C88D76]/20 text-[#E2B29F] border border-[#C88D76]/30">
                  WhatsApp Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 font-mono mt-0.5">
                Customer ID (WhatsApp): <span className="text-white font-semibold">+{user.uid}</span> ({formatPakistaniPhoneDisplay(user.uid)})
              </p>
              {user.city && (
                <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C88D76]" />
                  <span>Default City: <strong className="text-neutral-200">{user.city}</strong></span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onContinueShopping}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#252A30] hover:bg-[#2F353D] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#C88D76]" />
              <span>Shop Bags</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3.5 py-2.5 bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-800/50 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Feature 4: Tab Switcher: Order History vs Digital Warranty Vault */}
        <div className="flex items-center gap-2 border-b border-[#2B3038] pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#252A30] text-white border border-[#3E4753] shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-[#1A1D21]'
            }`}
          >
            <Package className="w-4 h-4 text-[#C88D76]" />
            <span>Order History & Couriers</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#14171A] text-neutral-300">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('warranty')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'warranty'
                ? 'bg-gradient-to-r from-[#2B231F] to-[#201D1A] text-[#E2B29F] border border-[#C88D76]/60 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-[#1A1D21]'
            }`}
          >
            <Award className="w-4 h-4 text-[#C88D76]" />
            <span>Digital Warranty Vault</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#14171A] text-[#E2B29F] border border-[#C88D76]/30">
              {deliveredOrders.length} Active
            </span>
          </button>
        </div>

        {/* TAB 1: ORDER HISTORY & COURIER TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            {/* Returning Patron Perks / Offers Trigger Grid */}
            {offers.length > 0 && (
              <div className="bg-gradient-to-r from-[#211B18] to-[#1A1816] border border-[#C88D76]/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E2B29F]">
                  <Sparkles className="w-4 h-4 text-[#C88D76]" />
                  <span>Unlocked Patron Privileges for +{user.uid}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offers.map((offer) => (
                    <div
                      key={offer.code}
                      className="bg-[#141619] border border-[#2B3038] hover:border-[#C88D76]/60 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-white">{offer.title}</span>
                          {offer.badge && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#C88D76]/20 text-[#E2B29F] border border-[#C88D76]/40">
                              {offer.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400">{offer.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#252A30]">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#E2B29F] bg-[#1E2228] px-2.5 py-1 rounded border border-[#2B3038]">
                          <Tag className="w-3 h-3 text-[#C88D76]" />
                          <span>{offer.code}</span>
                        </div>
                        <button
                          onClick={onContinueShopping}
                          className="text-xs font-semibold text-[#DF9B84] hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <span>Apply in Cart</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order History Container */}
            <div className="bg-[#16181B] border border-[#2B3038] rounded-2xl shadow-xl overflow-hidden">
              <div className="px-5 sm:px-6 py-5 border-b border-[#2B3038] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#C88D76]" />
                    <span>Your Order History</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    All Cash on Delivery dispatches linked to WhatsApp account +{user.uid}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400">
                    Total Orders: <strong className="text-white font-mono">{orders.length}</strong>
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="py-16 text-center text-neutral-400 space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C88D76]" />
                  <p className="text-xs">Fetching purchase logs from Firestore serverless database...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 px-4 text-center space-y-3">
                  <Package className="w-12 h-12 text-neutral-600 mx-auto" />
                  <h3 className="text-base font-semibold text-white">No Previous Orders Found</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    You haven&apos;t placed any Cash on Delivery orders with this WhatsApp account yet.
                  </p>
                  <button
                    onClick={onContinueShopping}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] text-neutral-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-neutral-950" />
                    <span>Explore Sialkot Crafted Bags</span>
                  </button>
                </div>
              ) : (
                <div>
                  {/* MOBILE-RESPONSIVE CARD LAYOUT (< 768px, screens < md) */}
                  <div className="block md:hidden divide-y divide-[#2B3038]/80 p-4 space-y-4">
                    {orders.map((ord) => {
                      const isCopied = copiedOrderId === ord.orderId;
                      const isShippedOrDelivered = ord.status === 'Shipped' || ord.status === 'Delivered';

                      return (
                        <div
                          key={`mobile-${ord.orderId}`}
                          className="bg-[#191C21] border border-[#2B3038] hover:border-[#C88D76]/50 rounded-2xl p-4.5 space-y-4 shadow-lg transition-colors"
                        >
                          {/* Top Bar: Order ID + Copy Button + Status Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                                Order Reference
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenCourierTracking(ord.orderId)}
                                  className="font-mono text-sm font-bold text-white hover:text-[#E2B29F] transition-colors underline decoration-dotted underline-offset-4 cursor-pointer"
                                  title="Click to track in courier drawer"
                                >
                                  {ord.orderId}
                                </button>

                                {/* 'Copy to Clipboard' Button */}
                                <button
                                  onClick={(e) => handleCopyOrderId(ord.orderId, e)}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                                    isCopied
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                      : 'bg-[#252A30] hover:bg-[#2F353D] text-neutral-300 hover:text-white border border-[#353D47]'
                                  }`}
                                  title="Copy Order ID to share with support"
                                  aria-label={`Copy Order ID ${ord.orderId}`}
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="font-semibold text-[10px]">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-[#C88D76]" />
                                      <span className="text-[10px]">Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="shrink-0 pt-1">
                              {getStatusBadge(ord.status)}
                            </div>
                          </div>

                          {/* Visual Stepper Progression on Mobile Card */}
                          <div className="bg-[#121417] border border-[#252A30] rounded-xl p-3.5 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                              <span className="text-neutral-300 font-semibold">Delivery Progression</span>
                              <span className="text-[10px] text-[#E2B29F]">4-Stage Verification</span>
                            </div>
                            <OrderStatusStepper
                              status={ord.status}
                              courierName={ord.courierName}
                              courierTrackingNumber={ord.courierTrackingNumber}
                              compact={true}
                            />
                          </div>

                          {/* Key Order Meta: Items, Date, Destination */}
                          <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-[#252A30]/80">
                            <div>
                              <div className="text-[10px] text-neutral-500 uppercase font-semibold">Ordered Items</div>
                              <div className="text-white font-medium truncate mt-0.5" title={ord.itemsSummary}>
                                {ord.itemsSummary}
                              </div>
                              <div className="text-[11px] text-neutral-400 mt-0.5">
                                {ord.itemCount} {ord.itemCount === 1 ? 'bag' : 'bags'}
                              </div>
                            </div>

                            <div>
                              <div className="text-[10px] text-neutral-500 uppercase font-semibold">Destination City</div>
                              <div className="text-neutral-200 font-medium mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#C88D76]" />
                                <span>{ord.city}</span>
                              </div>
                              <div className="text-[11px] text-emerald-400/90 font-medium mt-0.5 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Open-Parcel</span>
                              </div>
                            </div>
                          </div>

                          {/* Financials & Feature 1: Live Track Parcel Button */}
                          <div className="bg-[#141619] border border-[#252A30] rounded-xl p-3 flex items-center justify-between gap-3">
                            <div>
                              <div className="text-[10px] text-neutral-500 uppercase font-semibold">Total (COD)</div>
                              <div className="text-base font-bold text-[#E2B29F] tabular-nums font-mono">
                                PKR {ord.total.toLocaleString()}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Live Track Parcel Button */}
                              <button
                                onClick={(e) => handleOpenCourierTracking(ord.orderId, e)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                                  isShippedOrDelivered
                                    ? 'bg-gradient-to-r from-[#DF9B84] to-[#C88D76] text-neutral-950 hover:brightness-110 shadow-[#C88D76]/20'
                                    : 'bg-[#252A30] hover:bg-[#2F353D] text-[#E2B29F] border border-[#3C4452]'
                                }`}
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Track Parcel</span>
                              </button>
                            </div>
                          </div>

                          {/* Support sharing helper for mobile */}
                          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-neutral-500" />
                              <span>Placed: {ord.date}</span>
                            </div>
                            <a
                              href={`https://wa.me/923008472910?text=${encodeURIComponent(`Hi M&B Atelier Support, I need an update on my Order ID: ${ord.orderId}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#E2B29F] hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp Support</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP TABLE LAYOUT (>= 768px, screens >= md) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#121417] text-neutral-400 uppercase tracking-wider text-[11px] border-b border-[#2B3038]">
                        <tr>
                          <th scope="col" className="px-5 py-3.5">Order ID & Support</th>
                          <th scope="col" className="px-5 py-3.5">Date</th>
                          <th scope="col" className="px-5 py-3.5">Bags / Items</th>
                          <th scope="col" className="px-5 py-3.5">Total Amount</th>
                          <th scope="col" className="px-5 py-3.5">Status</th>
                          <th scope="col" className="px-5 py-3.5 text-center">Live Courier Tracking</th>
                          <th scope="col" className="px-4 py-3.5 text-center">Progression</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2B3038]">
                        {orders.map((ord) => {
                          const isCopied = copiedOrderId === ord.orderId;
                          const isExpanded = !!expandedOrderIds[ord.orderId];
                          const isShippedOrDelivered = ord.status === 'Shipped' || ord.status === 'Delivered';

                          return (
                            <React.Fragment key={`desktop-${ord.orderId}`}>
                              <tr className="hover:bg-[#1B1E23]/60 transition-colors">
                                {/* Order ID + Copy Button */}
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleOpenCourierTracking(ord.orderId)}
                                      className="font-mono font-bold text-[#E2B29F] hover:underline cursor-pointer flex items-center gap-1"
                                      title="Click to track parcel"
                                    >
                                      <span>{ord.orderId}</span>
                                    </button>

                                    {/* 'Copy to Clipboard' Button */}
                                    <button
                                      onClick={(e) => handleCopyOrderId(ord.orderId, e)}
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                        isCopied
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                          : 'bg-[#252A30] hover:bg-[#2F353D] text-neutral-300 hover:text-white border border-[#353D47]'
                                      }`}
                                      title="Copy Order ID to clipboard for support"
                                      aria-label={`Copy Order ID ${ord.orderId}`}
                                    >
                                      {isCopied ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          <span className="font-semibold text-[10px]">Copied!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3 text-[#C88D76]" />
                                          <span className="text-[10px]">Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </td>

                                {/* Date */}
                                <td className="px-5 py-4 text-neutral-400 whitespace-nowrap font-mono">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                                    <span>{ord.date}</span>
                                  </div>
                                </td>

                                {/* Items */}
                                <td className="px-5 py-4 max-w-xs">
                                  <div className="text-white font-medium truncate" title={ord.itemsSummary}>
                                    {ord.itemsSummary}
                                  </div>
                                  <div className="text-[11px] text-neutral-500">
                                    {ord.city} • Open-Parcel Allowed
                                  </div>
                                </td>

                                {/* Total */}
                                <td className="px-5 py-4 whitespace-nowrap">
                                  <span className="font-bold text-[#E2B29F] text-sm tabular-nums">
                                    PKR {ord.total.toLocaleString()}
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 uppercase">
                                    Cash on Delivery
                                  </span>
                                </td>

                                {/* Status */}
                                <td className="px-5 py-4 whitespace-nowrap">
                                  {getStatusBadge(ord.status)}
                                </td>

                                {/* Feature 1: Live Track Parcel Button */}
                                <td className="px-5 py-4 text-center whitespace-nowrap">
                                  <button
                                    onClick={(e) => handleOpenCourierTracking(ord.orderId, e)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                                      isShippedOrDelivered
                                        ? 'bg-gradient-to-r from-[#DF9B84] to-[#C88D76] text-neutral-950 hover:brightness-110 shadow-md shadow-[#C88D76]/20'
                                        : 'bg-[#20252C] hover:bg-[#29303A] text-[#E2B29F] border border-[#353D47]'
                                    }`}
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>Track Parcel</span>
                                  </button>
                                </td>

                                {/* Visual Stepper Toggle Button */}
                                <td className="px-4 py-4 text-center whitespace-nowrap">
                                  <button
                                    onClick={() => toggleOrderExpansion(ord.orderId)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                      isExpanded
                                        ? 'bg-[#C88D76]/20 text-[#E2B29F] border border-[#C88D76]/40'
                                        : 'bg-[#20252C] hover:bg-[#282F38] text-neutral-300 border border-[#303742]'
                                    }`}
                                    title={isExpanded ? 'Hide status progression stepper' : 'View status progression stepper'}
                                  >
                                    <span>Timeline</span>
                                    {isExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </td>
                              </tr>

                              {/* Expandable Visual Stepper Row for Desktop */}
                              {isExpanded && (
                                <tr className="bg-[#121417]/90 border-b border-[#2B3038]">
                                  <td colSpan={7} className="px-6 py-4">
                                    <div className="bg-[#181B20] border border-[#2B3038] rounded-xl p-4 space-y-2">
                                      <div className="flex items-center justify-between text-xs text-neutral-400">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-white">Order Status Progression</span>
                                          <span className="text-[11px] font-mono text-[#E2B29F]">({ord.orderId})</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px]">
                                          <span className="text-neutral-400">Courier:</span>
                                          <strong className="text-neutral-200">{ord.courierName || 'Trax Logistics'}</strong>
                                        </div>
                                      </div>

                                      <div className="py-2">
                                        <OrderStatusStepper
                                          status={ord.status}
                                          courierName={ord.courierName}
                                          courierTrackingNumber={ord.courierTrackingNumber}
                                          compact={false}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Table Footer with Trust Guarantee & Helpline */}
              <div className="px-5 sm:px-6 py-4 bg-[#121417] border-t border-[#2B3038] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Doorstep Open-Parcel Inspection active for all Pakistani courier deliveries</span>
                </div>
                <div className="text-neutral-400 flex items-center gap-1.5 flex-wrap">
                  <span>Need order adjustments? WhatsApp Helpline:</span>
                  <a
                    href="https://wa.me/923008472910"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#E2B29F] font-semibold underline decoration-dotted"
                  >
                    +92 300 8472910
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL WARRANTY VAULT */}
        {activeTab === 'warranty' && (
          <div className="space-y-6">
            <div className="bg-[#16181B] border border-[#2B3038] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2B3038] pb-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#C88D76]" />
                    <span>Digital Warranty Vault</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    1-Year Local Sialkot Atelier Warranty automatically generated for all delivered orders.
                  </p>
                </div>
                <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero-Paperwork Verification</span>
                </div>
              </div>

              {warrantyCertificates.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Award className="w-12 h-12 text-neutral-600 mx-auto" />
                  <h3 className="text-sm font-semibold text-white">No Delivered Orders Yet</h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Digital warranty certificates are automatically activated and rendered once your parcel is marked &quot;Delivered&quot; by Trax or CallCourier riders.
                  </p>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="mt-2 px-4 py-2 bg-[#252A30] hover:bg-[#2F353D] text-[#E2B29F] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    View Active Dispatches
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {warrantyCertificates.map((cert) => (
                    <DigitalWarrantyCard
                      key={cert.serialNumber}
                      certificate={cert}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Feature 1: Embedded Courier Tracking Slide-Over Drawer */}
      <CourierTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        orderId={trackingOrderId}
        trackingData={courierTrackingData}
        isLoading={isCourierLoading}
        error={courierError}
        onRetry={() => {
          if (trackingOrderId) {
            handleOpenCourierTracking(trackingOrderId);
          }
        }}
      />
    </div>
  );
};
