import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Mail,
  QrCode,
  KeyRound,
  Check,
  Copy,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import {
  securityService,
  SECURITY_CONFIG,
  AdminSessionClaims,
  OtpDispatchLog,
} from '../services/securityService';

interface Admin2faBarrierProps {
  onAuthenticated: (token: string, claims: AdminSessionClaims) => void;
  onCancel: () => void;
}

type AuthStep = 'PRIMARY_CREDENTIALS' | 'AWAITING_2FA';
type TwoFactorMethod = 'totp' | 'whatsapp' | 'email' | 'break_glass';

export const Admin2faBarrier: React.FC<Admin2faBarrierProps> = ({ onAuthenticated, onCancel }) => {
  // Authentication Flow State
  const [authStep, setAuthStep] = useState<AuthStep>('PRIMARY_CREDENTIALS');
  const [activeMethod, setActiveMethod] = useState<TwoFactorMethod>('totp');

  // Step 1 Credentials
  const [identifier, setIdentifier] = useState(SECURITY_CONFIG.ADMIN_EMAIL_PRIMARY);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 2FA Inputs
  const [totpToken, setTotpToken] = useState('');
  const [whatsappOtp, setWhatsappOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [breakGlassCode, setBreakGlassCode] = useState('');

  // UI & Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBreakGlass, setCopiedBreakGlass] = useState(false);

  // Lockout & Rate-Limit Status
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState(
    securityService.getLockoutRemainingSeconds()
  );
  const isLockedOut = lockoutRemainingSec > 0;
  const [failedAttempts, setFailedAttempts] = useState(securityService.getFailedAttempts());

  // OTP Dispatches
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [lastDispatch, setLastDispatch] = useState<OtpDispatchLog | null>(null);

  // Dynamic QR Code SVG
  const [qrSvg, setQrSvg] = useState<string>('');
  const totpSecret = securityService.getTotpSecret();

  // Initialize QR Code on mount
  useEffect(() => {
    setQrSvg(securityService.generateTotpQrSvg(160));
  }, []);

  // Lockout Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const rem = securityService.getLockoutRemainingSeconds();
      setLockoutRemainingSec(rem);
      setFailedAttempts(securityService.getFailedAttempts());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // OTP Cooldown Timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setInterval(() => {
        setOtpCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpCooldown]);

  // ---------------- STEP 1: PRIMARY CREDENTIAL SUBMISSION ---------------- //
  const handlePrimarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');

    if (isLockedOut) {
      setErrorMsg(
        `Account locked. Please wait ${Math.ceil(lockoutRemainingSec / 60)} minutes or use Emergency Break-Glass recovery.`
      );
      return;
    }

    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter both administrative identifier and master passcode.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await securityService.verifyPrimaryCredentials(identifier, password);
      if (result.success) {
        setAuthStep('AWAITING_2FA');
        setErrorMsg('');
        setSuccessNotice('Primary credentials verified. Step 2 Multi-Factor Authentication required.');
      } else {
        setErrorMsg(result.error || 'Authentication rejected.');
        setFailedAttempts(securityService.getFailedAttempts());
        setLockoutRemainingSec(securityService.getLockoutRemainingSeconds());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- STEP 2: COMPLETE AUTHENTICATION & ISSUE JWT ---------------- //
  const finalizeAuthentication = async () => {
    setIsLoading(true);
    try {
      const session = await securityService.createAdminSession();
      setSuccessNotice('Zero-Trust cryptographic JWT issued. Access granted.');
      setTimeout(() => {
        onAuthenticated(session.token, session.claims);
      }, 400);
    } catch {
      setErrorMsg('Failed to issue cryptographically signed session token.');
    } finally {
      setIsLoading(false);
    }
  };

  // METHOD A: Verify TOTP Token
  const handleVerifyTotp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (totpToken.trim().length !== 6) {
      setErrorMsg('Enter the 6-digit TOTP token from Google Authenticator / Authy.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await securityService.verifyTotpToken(totpToken);
      if (result.success) {
        await finalizeAuthentication();
      } else {
        setErrorMsg(result.error || 'Invalid TOTP token.');
        setFailedAttempts(securityService.getFailedAttempts());
        setLockoutRemainingSec(securityService.getLockoutRemainingSeconds());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // METHOD B: Request WhatsApp OTP
  const handleRequestWhatsappOtp = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await securityService.requestWhatsappOtp();
      if (res.success) {
        setOtpCooldown(res.cooldownSeconds);
        setLastDispatch(res.dispatchLog);
        setSuccessNotice(`6-digit OTP dispatched to administrative mobile: ${SECURITY_CONFIG.ADMIN_PHONE_DISPLAY}`);
      } else {
        setErrorMsg(res.error || 'Failed to dispatch WhatsApp OTP.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // METHOD B: Verify WhatsApp OTP
  const handleVerifyWhatsappOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (whatsappOtp.trim().length !== 6) {
      setErrorMsg('Enter the 6-digit WhatsApp OTP received on 0301 5466674.');
      return;
    }

    setIsLoading(true);
    try {
      const res = securityService.verifyWhatsappOtp(whatsappOtp);
      if (res.success) {
        await finalizeAuthentication();
      } else {
        setErrorMsg(res.error || 'Incorrect OTP code.');
        setFailedAttempts(securityService.getFailedAttempts());
        setLockoutRemainingSec(securityService.getLockoutRemainingSeconds());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // METHOD C: Request Email OTP
  const handleRequestEmailOtp = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await securityService.requestEmailOtp();
      if (res.success) {
        setOtpCooldown(res.cooldownSeconds);
        setLastDispatch(res.dispatchLog);
        setSuccessNotice(`6-digit OTP dispatched to administrative email: ${SECURITY_CONFIG.ADMIN_EMAIL_PRIMARY}`);
      } else {
        setErrorMsg(res.error || 'Failed to dispatch Email OTP.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // METHOD C: Verify Email OTP
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (emailOtp.trim().length !== 6) {
      setErrorMsg('Enter the 6-digit Email OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const res = securityService.verifyEmailOtp(emailOtp);
      if (res.success) {
        await finalizeAuthentication();
      } else {
        setErrorMsg(res.error || 'Incorrect Email OTP code.');
        setFailedAttempts(securityService.getFailedAttempts());
        setLockoutRemainingSec(securityService.getLockoutRemainingSeconds());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // METHOD D: Emergency Break-Glass Code
  const handleVerifyBreakGlass = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!breakGlassCode.trim()) {
      setErrorMsg('Enter a single-use Emergency Break-Glass Recovery Code (e.g. MBA-9X82-K7L1).');
      return;
    }

    setIsLoading(true);
    try {
      const res = securityService.verifyBreakGlassCode(breakGlassCode);
      if (res.success) {
        setSuccessNotice(`Break-Glass Code verified. Burned from recovery ledger (${res.remainingCodes} remaining).`);
        await finalizeAuthentication();
      } else {
        setErrorMsg(res.error || 'Invalid or already burned recovery code.');
        setFailedAttempts(securityService.getFailedAttempts());
        setLockoutRemainingSec(securityService.getLockoutRemainingSeconds());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const copyEmergencySample = (code: string) => {
    setBreakGlassCode(code);
    navigator.clipboard.writeText(code);
    setCopiedBreakGlass(true);
    setTimeout(() => setCopiedBreakGlass(false), 2000);
  };

  return (
    <div className="p-6 sm:p-10 max-w-2xl mx-auto w-full">
      {/* Security Architecture Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1C2025] border border-[#C5832B]/50 text-[#C5832B] mb-3 shadow-lg shadow-black/40">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
            Zero-Trust Gateway Portal
          </h2>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#C5832B]/20 text-[#E2B29F] border border-[#C5832B]/30 rounded">
            RBAC v2.4
          </span>
        </div>
        <p className="text-xs text-neutral-400 max-w-md mx-auto">
          M&B Atelier Administrative Control Hub. Step-up multi-factor verification required for Role: <span className="text-[#C5832B] font-mono font-semibold">ADMIN_SUPER</span>.
        </p>
      </div>

      {/* Lockout Warning Banner */}
      {isLockedOut && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-left">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-rose-300">
              Zero-Trust Anti-Brute-Force Lockout Active
            </div>
            <p className="text-rose-200/80">
              Three consecutive failed 2FA verification attempts detected. Primary access is suspended for{' '}
              <span className="font-mono font-bold text-white">
                {Math.floor(lockoutRemainingSec / 60)}m {lockoutRemainingSec % 60}s
              </span>
              .
            </p>
            <p className="text-[11px] text-neutral-300 pt-1">
              Need immediate operational access? Use the <span className="text-[#E2B29F] font-semibold">Emergency Break-Glass Recovery Code</span> below.
            </p>
          </div>
        </div>
      )}

      {/* Status Notice / Error feedback */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="flex-1">{errorMsg}</span>
        </div>
      )}

      {successNotice && !errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="flex-1">{successNotice}</span>
        </div>
      )}

      {/* ---------------- STAGE 1: PRIMARY CREDENTIALS ---------------- */}
      {authStep === 'PRIMARY_CREDENTIALS' && (
        <div className="bg-[#181B20] border border-[#2B3038] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#252A30]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#C5832B] text-neutral-950 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-sm text-white">Step 1: Primary Administrative Credentials</h3>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Argon2id / PBKDF2 Hashed</span>
          </div>

          <form onSubmit={handlePrimarySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Administrative Identifier / Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@mbatelier.shop"
                disabled={isLockedOut}
                className="w-full px-3.5 py-2.5 bg-[#121417] border border-[#2B3038] rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5832B] disabled:opacity-50"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Authorized accounts: <code className="text-[#C5832B]">admin@mbatelier.shop</code> or <code className="text-[#C5832B]">babarbuttgrt@gmail.com</code>
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Primary Master Passcode
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">Min 8 characters</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator passcode"
                  disabled={isLockedOut}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#121417] border border-[#2B3038] rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5832B] disabled:opacity-50"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                <span>Default setup key: <code className="text-neutral-300">mbatelier2026</code> / <code className="text-neutral-300">admin123</code></span>
                {failedAttempts > 0 && (
                  <span className="text-rose-400 font-semibold">
                    Failed attempts: {failedAttempts}/3
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 text-xs text-neutral-400 hover:text-white rounded-xl border border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel & Exit Gateway
              </button>

              <button
                type="submit"
                disabled={isLoading || isLockedOut}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#DF9B84] to-[#C5832B] hover:brightness-110 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Proceed to 2FA Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Break-glass emergency button in step 1 if locked out */}
          {isLockedOut && (
            <div className="mt-4 pt-4 border-t border-[#252A30] text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthStep('AWAITING_2FA');
                  setActiveMethod('break_glass');
                }}
                className="text-xs text-[#E2B29F] hover:underline inline-flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Bypass lock with Single-Use Emergency Break-Glass Code →</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- STAGE 2: STEP-UP MULTI-FACTOR AUTHENTICATION ---------------- */}
      {authStep === 'AWAITING_2FA' && (
        <div className="bg-[#181B20] border border-[#2B3038] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#252A30] gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-sm text-white">Step 2: Multi-Factor Authentication (2FA)</h3>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Primary verified for: <span className="font-mono text-emerald-400">{identifier}</span>
              </p>
            </div>

            <button
              onClick={() => {
                setAuthStep('PRIMARY_CREDENTIALS');
                setErrorMsg('');
              }}
              className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer self-start sm:self-auto"
            >
              ← Change Primary Credentials
            </button>
          </div>

          {/* 2FA Secondary Method Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Method A: TOTP */}
            <button
              type="button"
              onClick={() => {
                setActiveMethod('totp');
                setErrorMsg('');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeMethod === 'totp'
                  ? 'bg-[#C5832B]/15 border-[#C5832B] text-white shadow-sm'
                  : 'bg-[#141619] border-[#252A30] text-neutral-400 hover:text-white hover:bg-[#1A1D22]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <QrCode className={`w-4 h-4 ${activeMethod === 'totp' ? 'text-[#C5832B]' : 'text-neutral-500'}`} />
                <span className="text-[9px] uppercase font-mono font-bold text-emerald-400">RFC 6238</span>
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">Google TOTP</div>
                <div className="text-[10px] text-neutral-400 truncate">Authenticator App</div>
              </div>
            </button>

            {/* Method B: WhatsApp / SMS */}
            <button
              type="button"
              onClick={() => {
                setActiveMethod('whatsapp');
                setErrorMsg('');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeMethod === 'whatsapp'
                  ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                  : 'bg-[#141619] border-[#252A30] text-neutral-400 hover:text-white hover:bg-[#1A1D22]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Smartphone className={`w-4 h-4 ${activeMethod === 'whatsapp' ? 'text-emerald-400' : 'text-neutral-500'}`} />
                <span className="text-[9px] uppercase font-mono text-neutral-400">Mobile</span>
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">WhatsApp / SMS</div>
                <div className="text-[10px] text-neutral-400 truncate">0301 5466674</div>
              </div>
            </button>

            {/* Method C: Email OTP */}
            <button
              type="button"
              onClick={() => {
                setActiveMethod('email');
                setErrorMsg('');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeMethod === 'email'
                  ? 'bg-blue-500/15 border-blue-500 text-white shadow-sm'
                  : 'bg-[#141619] border-[#252A30] text-neutral-400 hover:text-white hover:bg-[#1A1D22]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Mail className={`w-4 h-4 ${activeMethod === 'email' ? 'text-blue-400' : 'text-neutral-500'}`} />
                <span className="text-[9px] uppercase font-mono text-neutral-400">SMTP</span>
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">Email OTP</div>
                <div className="text-[10px] text-neutral-400 truncate">admin@mbatelier</div>
              </div>
            </button>

            {/* Method D: Break-Glass */}
            <button
              type="button"
              onClick={() => {
                setActiveMethod('break_glass');
                setErrorMsg('');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                activeMethod === 'break_glass'
                  ? 'bg-rose-500/15 border-rose-500 text-white shadow-sm'
                  : 'bg-[#141619] border-[#252A30] text-neutral-400 hover:text-white hover:bg-[#1A1D22]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <KeyRound className={`w-4 h-4 ${activeMethod === 'break_glass' ? 'text-rose-400' : 'text-neutral-500'}`} />
                <span className="text-[9px] uppercase font-mono text-rose-400">Emergency</span>
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">Break-Glass</div>
                <div className="text-[10px] text-neutral-400 truncate">Backup Code</div>
              </div>
            </button>
          </div>

          {/* ---------------- CHANNEL A: GOOGLE AUTHENTICATOR (RFC 6238 TOTP) ---------------- */}
          {activeMethod === 'totp' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#14171A] border border-[#2B3038] rounded-xl flex flex-col sm:flex-row items-center gap-5">
                {/* SVG QR Code */}
                <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                  <div
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                    className="w-36 h-36 flex items-center justify-center"
                  />
                </div>

                <div className="space-y-2 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5832B]/20 text-[#E2B29F]">
                      Google Authenticator / Authy
                    </span>
                    <span className="text-[11px] text-neutral-400">30s time-step</span>
                  </div>
                  <p className="text-xs text-neutral-300">
                    Scan the QR code with Google Authenticator, or manually enter the Base32 setup key below into your authenticator app.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="px-3 py-1.5 bg-[#0F1113] border border-[#2A2E35] rounded-lg font-mono text-xs text-[#E2B29F] tracking-widest truncate">
                      {totpSecret}
                    </div>
                    <button
                      type="button"
                      onClick={copySecretToClipboard}
                      className="px-2.5 py-1.5 bg-[#1F2329] hover:bg-[#282D35] text-xs text-white rounded-lg border border-[#323842] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy Secret Key"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 6-Digit Code Input */}
              <form onSubmit={handleVerifyTotp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Enter 6-Digit TOTP Token
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={totpToken}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setTotpToken(val);
                      if (val.length === 6) {
                        setTimeout(() => handleVerifyTotp(), 50);
                      }
                    }}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 bg-[#121417] border border-[#2B3038] rounded-xl text-white focus:outline-none focus:border-[#C5832B]"
                    autoFocus
                  />
                  <p className="text-[10px] text-neutral-400 text-center mt-1">
                    Token refreshed every 30 seconds. Clock skew tolerance: ±30s.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || totpToken.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-[#DF9B84] to-[#C5832B] hover:brightness-110 text-neutral-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify TOTP Token & Unlock Suite</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ---------------- CHANNEL B: WHATSAPP / SMS OTP ---------------- */}
          {activeMethod === 'whatsapp' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#14171A] border border-[#2B3038] rounded-xl space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Registered Administrative Phone</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Sialkot Admin SIM
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-white text-sm font-semibold">
                    {SECURITY_CONFIG.ADMIN_PHONE_DISPLAY} (0301 5466674)
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Window: Max 3/10m
                  </span>
                </div>

                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRequestWhatsappOtp}
                    disabled={isLoading || otpCooldown > 0}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {otpCooldown > 0 ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Resend in {otpCooldown}s</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Dispatch 6-Digit OTP to WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Simulated delivery feed for testing verification */}
                {lastDispatch && lastDispatch.channel === 'whatsapp' && (
                  <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between font-mono text-[10px] text-emerald-400">
                      <span>Live Pipeline Dispatch ID: {lastDispatch.id}</span>
                      <span>Expires in 5m</span>
                    </div>
                    <div className="text-neutral-300 text-[11px]">
                      Message to {lastDispatch.recipient}: "Your M&B Atelier Admin 2FA code is <span className="font-mono font-bold text-emerald-300 text-sm tracking-widest">{lastDispatch.codePreview}</span>"
                    </div>
                    <button
                      type="button"
                      onClick={() => setWhatsappOtp(lastDispatch.codePreview || '')}
                      className="text-[10px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      Click to autofill received code ({lastDispatch.codePreview}) →
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleVerifyWhatsappOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Enter 6-Digit WhatsApp OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={whatsappOtp}
                    onChange={(e) => setWhatsappOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 bg-[#121417] border border-[#2B3038] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || whatsappOtp.length !== 6}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Verify Mobile OTP & Unlock Suite</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ---------------- CHANNEL C: EMAIL OTP ---------------- */}
          {activeMethod === 'email' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#14171A] border border-[#2B3038] rounded-xl space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">Registered Primary Email</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                    SMTP Verified
                  </span>
                </div>

                <div className="text-xs font-mono text-white text-sm font-semibold">
                  {SECURITY_CONFIG.ADMIN_EMAIL_PRIMARY} / {SECURITY_CONFIG.ADMIN_EMAIL_SECONDARY}
                </div>

                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRequestEmailOtp}
                    disabled={isLoading || otpCooldown > 0}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {otpCooldown > 0 ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Resend in {otpCooldown}s</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send 6-Digit OTP to Email</span>
                      </>
                    )}
                  </button>
                </div>

                {lastDispatch && lastDispatch.channel === 'email' && (
                  <div className="mt-3 p-3 bg-blue-950/40 border border-blue-500/40 rounded-lg text-xs space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between font-mono text-[10px] text-blue-400">
                      <span>Transactional SMTP Dispatch: {lastDispatch.id}</span>
                      <span>Expires in 5m</span>
                    </div>
                    <div className="text-neutral-300 text-[11px]">
                      Security verification code sent to {lastDispatch.recipient}: <span className="font-mono font-bold text-blue-300 text-sm tracking-widest">{lastDispatch.codePreview}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailOtp(lastDispatch.codePreview || '')}
                      className="text-[10px] text-blue-400 hover:underline font-semibold cursor-pointer"
                    >
                      Click to autofill received code ({lastDispatch.codePreview}) →
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleVerifyEmailOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Enter 6-Digit Email OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 bg-[#121417] border border-[#2B3038] rounded-xl text-white focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || emailOtp.length !== 6}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Verify Email OTP & Unlock Suite</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ---------------- CHANNEL D: EMERGENCY BREAK-GLASS RECOVERY PROTOCOL ---------------- */}
          {activeMethod === 'break_glass' && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400">
                    <KeyRound className="w-4 h-4" />
                    <span className="text-xs font-bold text-rose-300">
                      Emergency Break-Glass Recovery Protocol
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                    {securityService.getAvailableRecoveryCodesCount()} / 5 Codes Remaining
                  </span>
                </div>

                <p className="text-xs text-neutral-300">
                  Lost your Google Authenticator or mobile device? Single-use recovery backup codes grant immediate one-time administrative access and bypass lockout mechanisms. Each code is invalidated permanently upon redemption.
                </p>

                <div className="p-2.5 bg-[#0F1113] border border-[#2A2E35] rounded-lg text-xs space-y-1">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono">
                    Emergency Backup Vault Sample:
                  </span>
                  <div className="flex items-center justify-between font-mono text-[#E2B29F]">
                    <span>{SECURITY_CONFIG.BREAK_GLASS_RECOVERY_CODES[0]}</span>
                    <button
                      type="button"
                      onClick={() => copyEmergencySample(SECURITY_CONFIG.BREAK_GLASS_RECOVERY_CODES[0])}
                      className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
                    >
                      {copiedBreakGlass ? 'Filled & Copied' : 'Load sample'}
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerifyBreakGlass} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Enter Single-Use Recovery Code (Format: MBA-XXXX-XXXX)
                  </label>
                  <input
                    type="text"
                    value={breakGlassCode}
                    onChange={(e) => setBreakGlassCode(e.target.value.toUpperCase())}
                    placeholder="MBA-9X82-K7L1"
                    className="w-full text-center font-mono text-lg py-3 bg-[#121417] border border-[#2B3038] rounded-xl text-white focus:outline-none focus:border-rose-500 uppercase tracking-widest"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !breakGlassCode.trim()}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Redeem Break-Glass Code & Issue Super Admin Token</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer Security Runbook Note */}
          <div className="pt-2 border-t border-[#252A30] flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-2">
            <span>Security runbook: <code className="text-[#C5832B]">docs/ADMIN_SECURITY_BLUEPRINT.md</code></span>
            <span>Idle timeout: 15 minutes of inactivity</span>
          </div>
        </div>
      )}
    </div>
  );
};
