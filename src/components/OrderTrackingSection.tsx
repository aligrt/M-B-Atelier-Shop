import React, { useState } from 'react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  Package,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';
import { STORE_PHONE_NUMBER, PRODUCTS } from '../data/products';
import { OrderDetails, TrackingTimelineEvent } from '../types';

interface OrderTrackingSectionProps {
  lastPlacedOrder?: OrderDetails | null;
  activeTrackingId?: string | null;
}

export const OrderTrackingSection: React.FC<OrderTrackingSectionProps> = ({
  lastPlacedOrder,
  activeTrackingId,
}) => {
  const [searchId, setSearchId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [showRiderPass, setShowRiderPass] = useState(false);

  // Sync with activeTrackingId if passed from FAQ, modal, or navbar
  React.useEffect(() => {
    if (activeTrackingId) {
      setSearchId(activeTrackingId);
      handleTrack(activeTrackingId);
    }
  }, [activeTrackingId]);

  // Sample mock orders for instant demonstration
  const sampleOrders: Record<string, any> = {
    'MBA-8492': {
      orderId: 'MBA-8492',
      customerName: 'Khurram Shahzad',
      city: 'Karachi',
      address: 'House 42-B, Block 6, PECHS, Karachi',
      phone: '0321-4829103',
      courier: 'Trax Logistics',
      trackingNumber: 'TRX-83921094-PK',
      items: [
        { name: 'The Metro Commuter Backpack', quantity: 1, price: 6990 },
      ],
      total: 6990,
      status: 'out_for_delivery',
      statusLabel: 'Out for Doorstep Delivery',
      estimatedDelivery: 'Today (Expected before 5:00 PM)',
      riderName: 'Muhammad Tariq (Rider #KHI-18)',
      riderContact: '0315-9928104',
      timeline: [
        {
          title: 'Order Confirmed & Quality Checked',
          location: 'Sialkot Atelier & Stitching Workshop',
          time: 'Oct 5, 2:30 PM',
          completed: true,
          description: '1000D ballistic nylon and YKK zips passed 25kg load stress test.',
        },
        {
          title: 'Dispatched via Air Express Hub',
          location: 'Lahore Logistics Cargo Terminal',
          time: 'Oct 6, 8:15 AM',
          completed: true,
          description: 'Package sorted and transferred for Karachi express transit.',
        },
        {
          title: 'Arrived at Destination Hub',
          location: 'Karachi Sharea Faisal Delivery Facility',
          time: 'Oct 7, 7:40 AM',
          completed: true,
          description: 'Package received, scanned, and allocated to route rider.',
        },
        {
          title: 'Out for Doorstep Delivery',
          location: 'PECHS / Nursery Sector, Karachi',
          time: 'Oct 7, 9:30 AM',
          completed: false,
          current: true,
          description: 'Courier rider is on route. Open-parcel inspection allowed upon arrival.',
        },
      ],
    },
    'MBA-6231': {
      orderId: 'MBA-6231',
      customerName: 'Usman Ali',
      city: 'Lahore',
      address: 'Suite 401, Arfa Software Technology Park, Ferozepur Road, Lahore',
      phone: '0300-8472910',
      courier: 'TCS Express',
      trackingNumber: 'TCS-94810239-LHE',
      items: [
        { name: 'The Tech Exec Clamshell', quantity: 1, price: 8990 },
      ],
      total: 8990,
      status: 'dispatched',
      statusLabel: 'In Transit to Lahore Hub',
      estimatedDelivery: 'Tomorrow, Oct 8 (11:00 AM – 3:00 PM)',
      timeline: [
        {
          title: 'Order Confirmed & Packed',
          location: 'Sialkot Atelier Workshop',
          time: 'Oct 6, 4:00 PM',
          completed: true,
          description: 'Packed in water-shielded bubble wrap with Open-Parcel inspection slip.',
        },
        {
          title: 'Handed to TCS Express Courier',
          location: 'Sialkot Main Booking Center',
          time: 'Oct 6, 7:30 PM',
          completed: true,
          description: 'Manifest created. Linehaul vehicle departing for Lahore.',
        },
        {
          title: 'In Transit to Destination Facility',
          location: 'Lahore Thokar Niaz Baig Central Hub',
          time: 'Oct 7, 6:00 AM',
          completed: false,
          current: true,
          description: 'Consignment en route to local delivery distribution center.',
        },
        {
          title: 'Out for Delivery',
          location: 'Arfa Tower & Gulberg Sector, Lahore',
          time: 'Pending',
          completed: false,
          description: 'Rider will call prior to delivery.',
        },
      ],
    },
    'MBA-9104': {
      orderId: 'MBA-9104',
      customerName: 'Danyal Malik',
      city: 'Islamabad',
      address: 'Street 19, Sector F-8/2, Islamabad',
      phone: '0333-5129481',
      courier: 'Leopards Courier',
      trackingNumber: 'LEO-74819203-ISB',
      items: [
        { name: 'The Urban Minimalist Sling', quantity: 1, price: 4990 },
      ],
      total: 4990,
      status: 'processing',
      statusLabel: 'Atelier Quality Inspection',
      estimatedDelivery: 'Oct 9, 2026',
      timeline: [
        {
          title: 'Order Received & Logged',
          location: 'Online Storefront (mbatelier.shop)',
          time: 'Oct 7, 8:15 AM',
          completed: true,
          description: 'COD verification completed via WhatsApp auto-system.',
        },
        {
          title: 'Sialkot Atelier Quality Check',
          location: 'Sialkot Stitching Workshop',
          time: 'Oct 7, 10:00 AM',
          completed: false,
          current: true,
          description: 'Magnetic buckle and waterproof seam sealing inspection underway.',
        },
        {
          title: 'Dispatch via Express Courier',
          location: 'Islamabad Route Linehaul',
          time: 'Pending',
          completed: false,
          description: 'Scheduled for evening pickup.',
        },
      ],
    },
  };

  const handleTrack = (idToTrack?: string) => {
    const rawId = (idToTrack || searchId).trim().toUpperCase();
    if (!rawId) {
      setErrorMessage('Please enter your Order ID (e.g., MBA-8492).');
      setTrackedOrder(null);
      return;
    }

    setErrorMessage('');

    // Check if it matches the current session order
    if (lastPlacedOrder && lastPlacedOrder.orderId.toUpperCase() === rawId) {
      setTrackedOrder({
        orderId: lastPlacedOrder.orderId,
        customerName: lastPlacedOrder.customerName,
        city: lastPlacedOrder.city,
        address: lastPlacedOrder.address,
        phone: lastPlacedOrder.phone,
        courier: 'Trax Logistics',
        trackingNumber: `TRX-${Math.floor(10000000 + Math.random() * 90000000)}-PK`,
        items: lastPlacedOrder.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price * i.quantity,
        })),
        total: lastPlacedOrder.total,
        status: 'processing',
        statusLabel: 'Order Confirmed · Preparing Same-Day Sialkot Dispatch',
        estimatedDelivery: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi'].includes(lastPlacedOrder.city)
          ? 'Within 24–48 Hours'
          : '2–3 Business Days',
        timeline: [
          {
            title: 'Order Confirmed via Cash on Delivery',
            location: 'M&B Atelier Storefront',
            time: `Today, ${lastPlacedOrder.createdAt}`,
            completed: true,
            description: 'Order registered for nationwide dispatch. Free shipping applied.',
          },
          {
            title: 'Workshop Quality & Stitch Inspection',
            location: 'Sialkot Atelier',
            time: 'In Progress',
            completed: false,
            current: true,
            description: 'Inspecting zippers and stitching before attaching Open-Parcel flyer.',
          },
          {
            title: 'Handover to Courier Partner (TCS/Trax)',
            location: 'Linehaul Dispatch Center',
            time: 'Scheduled Before 4 PM',
            completed: false,
            description: 'Tracking SMS and WhatsApp notification will be sent automatically.',
          },
          {
            title: 'Doorstep Open-Parcel Inspection & COD',
            location: `${lastPlacedOrder.city}, Pakistan`,
            time: 'Expected Soon',
            completed: false,
            description: 'Inspect your bag before handing cash to rider.',
          },
        ],
      });
      return;
    }

    // Check pre-configured sample orders
    if (sampleOrders[rawId]) {
      setTrackedOrder(sampleOrders[rawId]);
      return;
    }

    // If format is like MBA-XXXX or any alphanumeric ID, generate an active realistic simulated tracking report
    if (rawId.startsWith('MBA-') || rawId.length >= 4) {
      const generatedNum = Math.floor(10000000 + Math.random() * 90000000);
      setTrackedOrder({
        orderId: rawId,
        customerName: 'Valued Atelier Patron',
        city: 'Destination Hub',
        address: 'Pakistan Delivery Address',
        phone: 'Registered Mobile Number',
        courier: 'Trax Logistics',
        trackingNumber: `TRX-${generatedNum}-PK`,
        items: [
          { name: 'The Metro Commuter Backpack (Model 1)', quantity: 1, price: 6990 },
        ],
        total: 6990,
        status: 'dispatched',
        statusLabel: 'In Transit via Courier Express',
        estimatedDelivery: 'Within 24–48 Hours',
        timeline: [
          {
            title: 'Order Confirmed & Packaged',
            location: 'Sialkot Atelier Workshop',
            time: 'Verified',
            completed: true,
            description: 'Quality inspected with Open-Parcel delivery slip affixed.',
          },
          {
            title: 'Dispatched to Linehaul Courier Hub',
            location: 'Central Transit Logistics',
            time: 'In Transit',
            completed: false,
            current: true,
            description: 'Package moving towards destination delivery hub.',
          },
          {
            title: 'Doorstep Delivery & Inspection',
            location: 'Your City, Pakistan',
            time: 'Expected Shortly',
            completed: false,
            description: 'Inspect before paying cash to courier rider.',
          },
        ],
      });
      return;
    }

    setErrorMessage(`Order ID "${rawId}" not found. Please enter a valid ID format like "MBA-8492" or try one of the demo order IDs below.`);
    setTrackedOrder(null);
  };

  const handleCopyTracking = (trackNum: string) => {
    navigator.clipboard.writeText(trackNum);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <section id="tracking" className="py-14 sm:py-20 bg-[#14171A] border-b border-[#252A30]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1C2025] border border-[#2B3038] text-xs font-bold uppercase tracking-wider text-[#E2B29F] mb-3">
            <Truck className="w-3.5 h-3.5 text-[#C88D76]" />
            <span>Nationwide Live Logistics</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Track Your Order Status
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            Enter your M&B Atelier Order ID to check live courier milestones, consignment numbers, and delivery timeline.
          </p>
        </div>

        {/* Input Bar Card */}
        <div className="bg-[#181B1F] border border-[#2B3038] rounded-2xl p-5 sm:p-7 shadow-xl mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Order ID (e.g. MBA-8492, MBA-6231)"
                className="w-full pl-12 pr-4 py-3.5 bg-[#14171A] border border-[#2B3038] focus:border-[#C88D76] focus:ring-1 focus:ring-[#C88D76] rounded-xl text-sm sm:text-base text-white placeholder-neutral-500 uppercase tracking-wider outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] hover:from-[#F0C0B0] hover:to-[#D49D87] active:from-[#A86C55] active:to-[#9C5B42] text-neutral-950 font-bold text-sm sm:text-base rounded-xl transition-all shadow-md shadow-[#C88D76]/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Truck className="w-4 h-4 text-neutral-950" />
              <span>Track Order</span>
            </button>
          </form>

          {/* Quick Demo Chips */}
          <div className="mt-4 pt-4 border-t border-[#252A30] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-400">Try Sample Orders:</span>
            {lastPlacedOrder && (
              <button
                type="button"
                onClick={() => {
                  setSearchId(lastPlacedOrder.orderId);
                  handleTrack(lastPlacedOrder.orderId);
                }}
                className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 font-semibold rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Your Order: {lastPlacedOrder.orderId}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchId('MBA-8492');
                handleTrack('MBA-8492');
              }}
              className="px-2.5 py-1 bg-[#14171A] border border-[#2B3038] text-neutral-300 hover:text-white hover:border-[#C88D76] rounded-lg transition-colors cursor-pointer font-mono"
            >
              MBA-8492 (Karachi - Out for Delivery)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchId('MBA-6231');
                handleTrack('MBA-6231');
              }}
              className="px-2.5 py-1 bg-[#14171A] border border-[#2B3038] text-neutral-300 hover:text-white hover:border-[#C88D76] rounded-lg transition-colors cursor-pointer font-mono"
            >
              MBA-6231 (Lahore - In Transit)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchId('MBA-9104');
                handleTrack('MBA-9104');
              }}
              className="px-2.5 py-1 bg-[#14171A] border border-[#2B3038] text-neutral-300 hover:text-white hover:border-[#C88D76] rounded-lg transition-colors cursor-pointer font-mono"
            >
              MBA-9104 (Islamabad - Workshop)
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Tracked Order Result Card */}
        {trackedOrder && (
          <div className="bg-[#181B1F] border border-[#C88D76]/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-300">
            
            {/* Top Status Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1C2025] to-[#14171A] border-b border-[#2B3038] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-[#E2B29F] bg-[#14171A] px-2.5 py-1 rounded border border-[#C88D76]/40">
                    {trackedOrder.orderId}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{trackedOrder.statusLabel}</span>
                  </div>
                </div>

                <h3 className="font-display font-extrabold text-lg sm:text-xl text-white mt-2">
                  Destination: {trackedOrder.city}, Pakistan
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Estimated Delivery: <strong className="text-neutral-200">{trackedOrder.estimatedDelivery}</strong>
                </p>
              </div>

              {/* Courier info block */}
              <div className="bg-[#14171A] p-3.5 rounded-xl border border-[#2B3038] space-y-1 text-xs">
                <div className="text-neutral-400 flex items-center justify-between gap-4">
                  <span>Courier Service:</span>
                  <strong className="text-white">{trackedOrder.courier}</strong>
                </div>
                <div className="text-neutral-400 flex items-center justify-between gap-4">
                  <span>Consignment #:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[#E2B29F] font-semibold">{trackedOrder.trackingNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyTracking(trackedOrder.trackingNumber)}
                      className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Tracking #"
                    >
                      {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline & Progress Breakdown */}
            <div className="p-5 sm:p-7 space-y-8">
              
              {/* Rider Live Alert if Out for Delivery */}
              {trackedOrder.status === 'out_for_delivery' && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-emerald-300 block text-sm">
                        Rider is actively delivering in your area!
                      </strong>
                      <span className="text-neutral-300">
                        {trackedOrder.riderName} · Contact: <strong className="text-white">{trackedOrder.riderContact}</strong>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRiderPass(!showRiderPass)}
                    className="px-3 py-1.5 bg-[#14171A] hover:bg-[#1C2025] text-[#E2B29F] border border-[#C88D76]/50 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    {showRiderPass ? 'Hide Inspection Pass' : 'Show Open-Parcel Pass'}
                  </button>
                </div>
              )}

              {/* Expandable Open-Parcel Pass to show rider */}
              {showRiderPass && (
                <div className="p-4 bg-[#14171A] border border-[#C88D76] rounded-xl text-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-[#E2B29F] font-bold uppercase tracking-wider text-[11px]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official Open-Parcel Inspection Certificate</span>
                  </div>
                  <p className="text-neutral-200 leading-relaxed">
                    <strong>To the Courier Delivery Agent (TCS / Trax / Leopards):</strong><br />
                    As per M&B Atelier Merchant Agreement <em>#MBA-COD-2026</em>, this parcel is registered with authorized 
                    <strong> Open-Parcel Inspection</strong>. The customer is entitled to unseal the flyer and inspect the bag, zips, and laptop compartment before handing over cash. In case of any query, rider can contact Trax/TCS helpline citing merchant account <em>M&B Atelier</em>.
                  </p>
                </div>
              )}

              {/* Progress Milestones Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-5">
                  Shipment Milestones
                </h4>

                <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#252A30]">
                  {trackedOrder.timeline.map((event: TrackingTimelineEvent, idx: number) => (
                    <div key={idx} className="relative group">
                      {/* Circle indicator */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          event.completed
                            ? 'bg-emerald-500 border-emerald-400 text-neutral-950'
                            : event.current
                            ? 'bg-[#14171A] border-[#C88D76] text-[#E2B29F] ring-4 ring-[#C88D76]/20'
                            : 'bg-[#181B1F] border-neutral-700 text-neutral-600'
                        }`}
                      >
                        {event.completed ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : event.current ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E2B29F] animate-ping" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h5 className={`font-semibold text-sm ${event.completed || event.current ? 'text-white' : 'text-neutral-400'}`}>
                            {event.title}
                          </h5>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {event.time}
                          </span>
                        </div>
                        <div className="text-xs text-[#E2B29F] font-medium flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Parcel Items Summary */}
              <div className="pt-4 border-t border-[#252A30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block mb-1">Parcel Contents:</span>
                  <div className="space-y-1">
                    {trackedOrder.items.map((it: any, i: number) => (
                      <div key={i} className="text-white font-medium flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-[#C88D76]" />
                        <span>{it.name} (x{it.quantity})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#14171A] p-3 rounded-xl border border-[#2B3038] text-right">
                  <span className="text-neutral-400 block">Total Due on Delivery:</span>
                  <span className="font-extrabold text-base text-[#E2B29F] tabular-nums">
                    PKR {trackedOrder.total.toLocaleString()} (Free COD)
                  </span>
                </div>
              </div>

              {/* Inquire on WhatsApp */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href={`https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent(
                    `Hello M&B Atelier! I am inquiring about Order *${trackedOrder.orderId}* (Tracking #${trackedOrder.trackingNumber}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Inquire Status with Concierge on WhatsApp</span>
                </a>

                <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Protected by 1-Year Local Sialkot Warranty</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};
