import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Clock,
  Lock,
} from 'lucide-react';
import { mbApiService, CustomerUser } from '../services/api';

interface WhatsAppAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: CustomerUser, token: string) => void;
  initialPhone?: string;
}

export const WhatsAppAuthModal: React.FC<WhatsAppAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  initialPhone = '',
}) => {
  // Step 1: phone entry, Step 2: OTP entry
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [otpInput, setOtpInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verifiedUid, setVerifiedUid] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  // Sync initial phone if provided
  useEffect(() => {
    if (initialPhone) {
      setPhoneInput(initialPhone);
    }
  }, [initialPhone]);

  // Resend Countdown Timer (60s)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  // Format phone input as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const val = e.target.value;
    setPhoneInput(val);
  };

  // Flow 1 Step 2: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await mbApiService.requestOtp(phoneInput);
      setVerifiedUid(res.uid);
      setStep('OTP');
      setResendTimer(60);
      setCanResend(false);
      setDemoOtpHint(res.devOtp || '786920');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to send WhatsApp OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Flow 1 Step 4: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (otpInput.trim().length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await mbApiService.verifyOtp(verifiedUid || phoneInput, otpInput.trim());
      // Step 5: On successful verification, return user & token
      onAuthenticated(res.user, res.token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Verification failed. Please double-check the OTP.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await mbApiService.requestOtp(verifiedUid || phoneInput);
      setResendTimer(60);
      setCanResend(false);
      setDemoOtpHint(res.devOtp || '786920');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-md bg-[#16181B] border border-[#2B3038] rounded-2xl shadow-2xl p-6 sm:p-7 text-white overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#C88D76]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Close authentication"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-[#C88D76]/15 border border-[#C88D76]/40 flex items-center justify-center text-[#E2B29F]">
            <KeyRound className="w-4 h-4 text-[#C88D76]" />
          </div>
          <span className="text-xs uppercase tracking-widest text-[#C88D76] font-bold">
            M&B Atelier Identity
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight">
          {step === 'PHONE' ? 'Register or Login with WhatsApp' : 'Enter 6-Digit WhatsApp Code'}
        </h3>
        
        <p className="text-xs text-neutral-400 mt-1 mb-5">
          {step === 'PHONE'
            ? 'In Pakistan, your WhatsApp number is your secure Account ID. No passwords required.'
            : `We sent a 6-digit confirmation PIN via WhatsApp to +${verifiedUid || phoneInput}.`}
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Phone Entry */}
        {step === 'PHONE' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Pakistani Mobile Number <span className="text-[#C88D76]">*</span>
              </label>
              
              <div className="relative flex rounded-xl border border-[#2B3038] bg-[#121417] focus-within:border-[#C88D76] transition-colors">
                <div className="flex items-center pl-3.5 pr-2.5 border-r border-[#2B3038] text-xs font-bold text-[#E2B29F] select-none">
                  <span className="mr-1.5">🇵🇰</span> +92
                </div>
                <input
                  type="tel"
                  required
                  autoFocus
                  value={phoneInput.replace(/^(\+?92|0)/, '')}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setPhoneInput(`0${raw}`);
                  }}
                  placeholder="300 1234567"
                  className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-neutral-500 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-400">
                <span>e.g., 0300 1234567</span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Direct WhatsApp OTP
                </span>
              </div>
            </div>

            {/* Quick Demo Fill Helper */}
            <div className="bg-[#1C2025] border border-[#2B3038] rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#E2B29F]" /> Fast Test Presets:
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPhoneInput('03001234567')}
                  className="flex-1 text-[11px] py-1.5 px-2 bg-[#252A30] hover:bg-[#2F353D] text-neutral-200 rounded-lg text-center transition-colors cursor-pointer"
                >
                  Returning VIP Patron
                  <span className="block text-[9px] text-[#C88D76]">(Has 2 Previous Orders)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneInput('03219876543')}
                  className="flex-1 text-[11px] py-1.5 px-2 bg-[#252A30] hover:bg-[#2F353D] text-neutral-200 rounded-lg text-center transition-colors cursor-pointer"
                >
                  New First-Time User
                  <span className="block text-[9px] text-neutral-400">(Instant COD Account)</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] hover:from-[#F0C0B0] hover:to-[#D49D87] text-neutral-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C88D76]/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>Requesting WhatsApp Code...</span>
                </>
              ) : (
                <>
                  <span>Send WhatsApp Verification PIN</span>
                  <ArrowRight className="w-4 h-4 text-neutral-950" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP Entry */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                6-Digit Security Code
              </label>

              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full bg-[#121417] border border-[#2B3038] focus:border-[#C88D76] text-center tracking-[0.5em] text-xl font-bold font-mono py-3 rounded-xl text-white outline-none"
                />
              </div>

              {demoOtpHint && (
                <div className="mt-2.5 p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-[11px] text-emerald-300 flex items-center justify-between">
                  <span>
                    💬 WhatsApp Demo PIN: <strong>{demoOtpHint}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpInput(demoOtpHint)}
                    className="underline font-semibold hover:text-white cursor-pointer"
                  >
                    Auto-Fill PIN
                  </button>
                </div>
              )}
            </div>

            {/* Countdown / Resend Controls */}
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-[#E2B29F] font-semibold hover:underline cursor-pointer"
                  >
                    Resend OTP via WhatsApp
                  </button>
                ) : (
                  <span>Resend OTP in <strong className="text-white">{resendTimer}s</strong></span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('PHONE');
                  setOtpInput('');
                }}
                className="text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
              >
                Change Number
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpInput.length !== 6}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#DF9B84] to-[#C88D76] hover:from-[#F0C0B0] hover:to-[#D49D87] text-neutral-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C88D76]/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>Verifying WhatsApp Identity...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                  <span>Verify & Unlock Checkout</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-[#252A30] text-center text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-[#C88D76]" />
          <span>Encrypted Session • Verified via WhatsApp Business API</span>
        </div>
      </div>
    </div>
  );
};
