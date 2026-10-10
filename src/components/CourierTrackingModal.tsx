import React from 'react';
import {
  X,
  Truck,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Package,
  Calendar,
  Navigation,
  RefreshCw,
  Box,
} from 'lucide-react';
import { CourierTrackingInfo } from '../services/api';

interface CourierTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  trackingData: CourierTrackingInfo | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export const CourierTrackingModal: React.FC<CourierTrackingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  trackingData,
  isLoading,
  error,
  onRetry,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-[#14171A] border-l border-[#2B3038] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 bg-[#181B20] border-b border-[#2B3038] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#20252C] border border-[#C5832B]/40 flex items-center justify-center text-[#C5832B]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Courier Dispatch Tracking
                  </h2>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                    Live
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">
                  Order ID: <span className="text-[#E2B29F] font-bold">{orderId}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#20252C] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
            {isLoading ? (
              <div className="py-24 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#C5832B] animate-spin mx-auto" />
                <p className="text-neutral-300 font-semibold">Querying Local Courier API...</p>
                <p className="text-[11px] text-neutral-500">Trax, CallCourier & PostEx Logistics Hub</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-rose-950/20 border border-rose-800/40 rounded-xl text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                <p className="text-rose-300 font-semibold">{error}</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-[#20252C] hover:bg-[#2A313A] text-white text-xs rounded-lg font-bold"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : trackingData ? (
              <div className="space-y-6">
                {/* Courier Partner Banner */}
                <div className="bg-[#1A1D22] border border-[#2B3038] rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                        Assigned Logistics Partner
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{trackingData.courierName}</h3>
                      <span className="font-mono text-xs text-[#E2B29F]">{trackingData.trackingNumber}</span>
                    </div>

                    <a
                      href={trackingData.courierPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-[#20252C] hover:bg-[#282F38] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Courier Portal</span>
                      <ExternalLink className="w-3 h-3 text-[#C5832B]" />
                    </a>
                  </div>

                  <div className="pt-3 border-t border-[#252A30] grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Status</span>
                      <span className="text-emerald-400 font-bold">{trackingData.statusText}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">COD Collect Amount</span>
                      <span className="text-white font-bold font-mono">
                        PKR {trackingData.cashToCollect?.toLocaleString() || '6,990'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-[#1A1D22] border border-[#2B3038] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#252A30] pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Progress Timeline
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Step {trackingData.currentStepIndex + 1} of {trackingData.timeline.length}
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2B3038]">
                    {trackingData.timeline.map((event, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            event.completed
                              ? 'bg-emerald-500 text-neutral-950 ring-4 ring-emerald-950/60'
                              : event.current
                              ? 'bg-[#C5832B] text-neutral-950 ring-4 ring-[#C5832B]/30 animate-pulse'
                              : 'bg-[#1C2025] text-neutral-500 border border-[#2B3038]'
                          }`}
                        >
                          {event.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className={`text-xs font-bold ${event.completed ? 'text-white' : 'text-neutral-400'}`}>
                            {event.step}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-mono">{event.time}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">{event.description}</p>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-500 pt-0.5">
                          <MapPin className="w-3 h-3 text-[#C5832B]" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rider Info if available */}
                {trackingData.rider && (
                  <div className="p-4 bg-[#1A1D22] border border-[#2B3038] rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase block font-bold">Courier Rider</span>
                      <span className="text-white font-bold">{trackingData.rider.name}</span>
                      <span className="text-[11px] text-neutral-400 block">{trackingData.rider.hub}</span>
                    </div>
                    <a
                      href={`tel:${trackingData.rider.phone}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{trackingData.rider.phone}</span>
                    </a>
                  </div>
                )}

                {/* Open-Parcel Guarantee Card */}
                <div className="p-4 bg-gradient-to-r from-[#191D22] to-[#121417] border border-emerald-600/40 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open Parcel Inspection Authorized</span>
                  </div>
                  <p className="text-[11px] text-neutral-300">
                    You have full permission to open this flyer, inspect the bag stitching, and examine laptop protection padding before paying the courier rider.
                  </p>
                </div>

              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#181B20] border-t border-[#2B3038] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#20252C] hover:bg-[#282F38] text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Close Drawer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
