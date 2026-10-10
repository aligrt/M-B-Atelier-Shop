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
} from 'lucide-react';
import {
  CustomerUser,
  CustomerOrderRecord,
  CustomerOffer,
  CourierTrackingInfo,
  mbApiService,
  formatPakistaniPhoneDisplay,
} from '../services/api';
import { STORE_PHONE_NUMBER, STORE_DISPLAY_PHONE } from '../data/products';
import { CourierTrackingModal } from './CourierTrackingModal';

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
    sublabel: 'Verified & Prepared in Lahore',
    icon: Box,
  },
  {
    id: 'dispatched',
    label: 'In Transit',
    sublabel: 'With Courier Partner',
    icon: Truck,
  },
  {
    id: 'out_for_delivery',
    label: 'Out for Delivery',
    sublabel: 'Rider on the Way',
    icon: Navigation,
  },
  {
    id: 'delivered',
    label: 'Delivered',
    sublabel: 'Open-Parcel COD Paid',
    icon: CheckCircle2,
  },
];

function getActiveStepIndex(status: CustomerOrderRecord['status']): number {
  switch (status) {
    case 'COD Pending':
      return 0;
    case 'Shipped':
      return 1;
    case 'Out for Delivery':
      return 2;
    case 'Delivered':
      return 3;
    default:
      return 0;
  }
}

export const AccountPage: React.FC<AccountPageProps> = ({
  user,
  onLogout,
  onContinueShopping,
  onTrackOrderDirect,
}) => {
  const [orders, setOrders] = useState<CustomerOrderRecord[]>([]);
  const [offers, setOffers] = useState<CustomerOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  // Courier Tracking Slide-Over State
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [courierTrackingData, setCourierTrackingData] = useState<CourierTrackingInfo | null>(null);
  const [isCourierLoading, setIsCourierLoading] = useState(false);
  const [courierError, setCourierError] = useState<string | null>(null);

  useEffect(() => {
    mbApiService.recordAccountVisit();

    const loadData = async () => {
      setIsLoading(true);
      try {
        const ordersData = mbApiService.getCustomerOrders(user.uid);
        const offersData = await mbApiService.getOffers(user.uid, false);
        setOrders(ordersData);
        setOffers(offersData);

        if (ordersData.length > 0) {
          setExpandedOrderIds({ [ordersData[0].orderId]: true });
        }
      } catch {
        // Suppress account data error disclosure in production
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user.uid]);

  const handleOpenCourierTracking = async (orderId: string) => {
    setTrackingOrderId(orderId);
    setIsTrackingModalOpen(true);
    setIsCourierLoading(true);
    setCourierError(null);

    try {
      const trackingResult = await mbApiService.getCourierTracking(orderId);
      setCourierTrackingData(trackingResult);
    } catch {
      setCourierError('Unable to fetch live courier updates. Please try again.');
    } finally {
      setIsCourierLoading(false);
    }
  };

  const handleCopyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => {
      setCopiedOrderId(null);
    }, 2000);
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <div className="min-h-screen bg-[#14171A] text-neutral-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Card */}
        <div className="bg-[#1A1D22] border border-[#2B3038] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#14171A] border border-[#C5832B]/50 flex items-center justify-center text-[#C5832B] font-extrabold text-xl font-mono shadow-inner">
              {user.name ? user.name[0].toUpperCase() : 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                  {user.name || 'Atelier Patron'}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                  WhatsApp Verified
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {formatPakistaniPhoneDisplay(user.uid)}
              </p>
              {user.city && (
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
                  <MapPin className="w-3 h-3 text-[#C5832B]" />
                  <span>{user.city}, Pakistan</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onContinueShopping}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#252A30] hover:bg-[#2F353D] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#C5832B]" />
              <span>Shop Bags</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3.5 py-2.5 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Orders List Container */}
        <div className="bg-[#16181B] border border-[#2B3038] rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-[#14171A] border-b border-[#2B3038] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C5832B]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Order History & Live Couriers ({orders.length})
              </h2>
            </div>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Open-Parcel Inspection Permitted
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <Package className="w-12 h-12 text-neutral-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Orders on this WhatsApp Account Yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Your future orders will appear here automatically with live courier consignment numbers and doorstep tracking.
              </p>
              <button
                onClick={onContinueShopping}
                className="px-4 py-2.5 bg-[#C5832B] hover:bg-[#E2B29F] text-neutral-950 text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <span>Browse Atelier Bags</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#252A30]">
              {orders.map((ord) => {
                const stepIdx = getActiveStepIndex(ord.status);
                const isExpanded = !!expandedOrderIds[ord.orderId];

                return (
                  <div key={ord.orderId} className="p-5 sm:p-6 space-y-4">
                    
                    {/* Order Summary Line */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-white">
                            {ord.orderId}
                          </span>
                          <button
                            onClick={() => handleCopyOrderId(ord.orderId)}
                            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#252A30] transition-colors cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedOrderId === ord.orderId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#1C2025] text-[#C5832B] border border-[#C5832B]/30">
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-300 mt-1">{ord.itemsSummary}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-white">
                          PKR {ord.total.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleOpenCourierTracking(ord.orderId)}
                          className="px-3 py-1.5 bg-[#1C2025] hover:bg-[#252A30] border border-[#C5832B]/40 hover:border-[#C5832B] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5 text-[#C5832B]" />
                          <span>Track Parcel</span>
                        </button>
                        <button
                          onClick={() => toggleOrderExpand(ord.orderId)}
                          className="p-1.5 text-neutral-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Stepper Progression */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-[#252A30]/60 space-y-4">
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          {ORDER_STEPS.map((st, i) => {
                            const isDone = i <= stepIdx;
                            const isCurrent = i === stepIdx;
                            const Icon = st.icon;
                            return (
                              <div key={st.id} className="space-y-1.5">
                                <div
                                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-all ${
                                    isDone
                                      ? 'bg-[#C5832B] text-neutral-950 font-bold'
                                      : 'bg-[#1C2025] text-neutral-500 border border-[#2B3038]'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className={`text-[11px] font-bold ${isDone ? 'text-white' : 'text-neutral-500'}`}>
                                  {st.label}
                                </div>
                                <div className="text-[9px] text-neutral-500 hidden sm:block">
                                  {st.sublabel}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Courier Details */}
                        <div className="p-3 bg-[#121417] rounded-xl border border-[#252A30] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-neutral-300 gap-2">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-[#C5832B]" />
                            <span>
                              Partner: <strong>{ord.courierName || 'Trax Logistics'}</strong> ({ord.courierTrackingNumber || 'TRX-882194'})
                            </span>
                          </div>
                          <a
                            href={`https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent(`Hi M&B Atelier Support, I need an update on my Order ID: ${ord.orderId}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E2B29F] hover:underline flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Helpline</span>
                          </a>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Assistance */}
          <div className="p-4 bg-[#14171A] border-t border-[#2B3038] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Open-Parcel Inspection standard on all deliveries
            </span>
            <div className="flex items-center gap-2">
              <span>Support WhatsApp:</span>
              <a
                href={`https://wa.me/${STORE_PHONE_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#C5832B] font-mono font-bold"
              >
                {STORE_DISPLAY_PHONE}
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Embedded Courier Tracking Drawer */}
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
