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
import { CourierTrackingDetails } from '../services/api';

interface CourierTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  trackingData: CourierTrackingDetails | null;
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
          <div className="px-5 py-4 bg-[#181B20] border-b border-[#2B3038] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#20252C] border border-[#C88D76]/40 flex items-center justify-center text-[#E2B29F]">
                <Truck className="w-5 h-5 text-[#C88D76]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-display font-bold text-white">Live Courier Tracking</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                    Live Telemetry
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Order: <span className="text-white font-bold">{orderId}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-[#252A30] transition-colors cursor-pointer"
              aria-label="Close tracking drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {isLoading ? (
              <div className="py-20 text-center space-y-4">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#C88D76]" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Connecting to Courier Gateway</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Fetching real-time scans from Trax Logistics / CallCourier API...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-950/30 border border-red-800/60 rounded-xl p-5 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                <h3 className="text-sm font-semibold text-white">Unable to Load Courier Data</h3>
                <p className="text-xs text-red-200">{error}</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-[#252A30] hover:bg-[#2F353D] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                )}
              </div>
            ) : trackingData ? (
              <div className="space-y-6">
                {/* Courier Consignment & Dispatch Banner */}
                <div className="bg-[#191D22] border border-[#2B3038] rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                        Courier Partner
                      </div>
                      <div className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                        <span>{trackingData.courierName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#252A30] text-[#E2B29F] rounded border border-[#343C47]">
                          {trackingData.consignmentNumber}
                        </span>
                      </div>
                    </div>

                    <a
                      href={trackingData.publicTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-[#242930] hover:bg-[#2E3540] border border-[#363F4B] text-neutral-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                      title="Open Official Courier Portal"
                    >
                      <span className="text-[11px]">Portal</span>
                      <ExternalLink className="w-3 h-3 text-[#E2B29F]" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#262C34] text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold">Current Status</span>
                      <p className="font-bold text-emerald-400 mt-0.5">{trackingData.status}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold">Estimated Handover</span>
                      <p className="font-semibold text-white mt-0.5">{trackingData.estimatedDelivery}</p>
                    </div>
                  </div>

                  {/* Rider Contact Card if Out for Delivery or Dispatched */}
                  {trackingData.riderName && (
                    <div className="mt-3 bg-[#131518] border border-[#2B3038] rounded-lg p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center">
                          <Navigation className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase font-bold">Assigned Courier Rider</div>
                          <div className="text-xs font-semibold text-white">{trackingData.riderName}</div>
                        </div>
                      </div>

                      {trackingData.riderPhone && (
                        <a
                          href={`tel:${trackingData.riderPhone.replace(/\D/g, '')}`}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Rider</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* 4-Step Milestone Progression Timeline */}
                <div className="bg-[#181B20] border border-[#2B3038] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#C88D76]" />
                      <span>Tracking Progression Timeline</span>
                    </h3>
                    <span className="text-[11px] text-[#E2B29F] font-mono">
                      {trackingData.steps.filter((s) => s.completed).length} / {trackingData.steps.length} Milestones
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#2B3038]">
                    {trackingData.steps.map((step, idx) => {
                      return (
                        <div key={idx} className="relative group">
                          {/* Dot / Indicator */}
                          <div
                            className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                              step.completed
                                ? 'bg-emerald-500 text-neutral-950 ring-4 ring-emerald-950/60'
                                : step.current
                                ? 'bg-gradient-to-r from-[#DF9B84] to-[#C88D76] text-neutral-950 ring-4 ring-[#C88D76]/30 animate-pulse'
                                : 'bg-[#1C2025] text-neutral-500 border border-[#2B3038]'
                            }`}
                          >
                            {step.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>

                          {/* Step Content */}
                          <div className="space-y-1">
                            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                              <h4
                                className={`text-xs font-bold ${
                                  step.completed
                                    ? 'text-white'
                                    : step.current
                                    ? 'text-[#E2B29F]'
                                    : 'text-neutral-500'
                                }`}
                              >
                                {step.title}
                              </h4>
                              {step.timestamp && (
                                <span className="text-[10px] font-mono text-neutral-400">
                                  {step.timestamp}
                                </span>
                              )}
                            </div>

                            {step.location && (
                              <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                                <MapPin className="w-3 h-3 text-[#C88D76] shrink-0" />
                                <span>{step.location}</span>
                              </div>
                            )}

                            <p className="text-xs text-neutral-300 leading-relaxed bg-[#121417] p-2.5 rounded-lg border border-[#23272F]">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Open-Parcel Guarantee Notice inside Drawer */}
                <div className="bg-gradient-to-r from-[#171A1D] to-[#121417] border border-emerald-800/40 rounded-xl p-4 flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-neutral-300">
                    <span className="font-bold text-white block">Open-Parcel Inspection Instructions</span>
                    <p className="text-[11px] leading-relaxed">
                      You are legally authorized by M&B Atelier to unseal the flyer and inspect the bag, laptop cushioning, and zips in front of the {trackingData.courierName} rider before handing over Cash on Delivery.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-[#181B20] border-t border-[#2B3038] flex items-center justify-between gap-3">
            <span className="text-[11px] text-neutral-400">
              Need assistance? WhatsApp: <strong className="text-white">+92 300 8472910</strong>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#252A30] hover:bg-[#2F353D] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
