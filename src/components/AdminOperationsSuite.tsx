import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  X,
  Package,
  Truck,
  Percent,
  Layers,
  Receipt,
  Calculator,
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  RefreshCw,
  ChevronRight,
  LogOut,
  CheckCircle2,
  Shield,
  KeyRound,
} from 'lucide-react';
import {
  Product,
  CourierPartner,
  PromoCode,
  CampaignBanner,
  ExpenseRecord,
  StockMovementLog,
  OrderDetails,
  CurrencyCode,
} from '../types';
import { storeStateService } from '../services/storeStateService';
import { formatCurrency } from '../utils/currency';
import { Admin2faBarrier } from './Admin2faBarrier';
import { securityService, AdminSessionClaims } from '../services/securityService';

interface AdminOperationsSuiteProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductsUpdated: (updated: Product[]) => void;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
}

type AdminTab =
  | 'catalog'
  | 'couriers'
  | 'campaigns'
  | 'inventory'
  | 'expenses'
  | 'pricing'
  | 'analytics';

export const AdminOperationsSuite: React.FC<AdminOperationsSuiteProps> = ({
  isOpen,
  onClose,
  products,
  onProductsUpdated,
  currency,
  onCurrencyChange,
}) => {
  // Zero-Trust Session & RBAC Safeguards
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionClaims, setSessionClaims] = useState<AdminSessionClaims | null>(null);
  const [idleRemainingSeconds, setIdleRemainingSeconds] = useState<number>(15 * 60);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Check active session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      const activeTok = securityService.getActiveAdminToken();
      if (activeTok) {
        const verifyRes = await securityService.verifyAdminToken(activeTok);
        if (verifyRes.valid && verifyRes.claims) {
          setIsAuthenticated(true);
          setSessionToken(activeTok);
          setSessionClaims(verifyRes.claims);
        }
      }
    };
    checkActiveSession();
  }, []);

  // 15-Minute Administrative Idle Inactivity Timeout Engine
  useEffect(() => {
    if (!isAuthenticated) return;

    lastActivityRef.current = Date.now();
    const IDLE_LIMIT_SECONDS = 15 * 60; // 15 minutes

    const registerActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', registerActivity);
    window.addEventListener('keydown', registerActivity);
    window.addEventListener('click', registerActivity);
    window.addEventListener('scroll', registerActivity);
    window.addEventListener('touchstart', registerActivity);

    const timer = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, IDLE_LIMIT_SECONDS - elapsedSec);
      setIdleRemainingSeconds(remaining);

      if (remaining <= 0) {
        // Zero-Trust Inactivity Auto-Lock
        handleSecureLogout('Administrative session auto-locked after 15 minutes of inactivity.');
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', registerActivity);
      window.removeEventListener('keydown', registerActivity);
      window.removeEventListener('click', registerActivity);
      window.removeEventListener('scroll', registerActivity);
      window.removeEventListener('touchstart', registerActivity);
      clearInterval(timer);
    };
  }, [isAuthenticated]);

  const handleSessionAuthenticated = (token: string, claims: AdminSessionClaims) => {
    setIsAuthenticated(true);
    setSessionToken(token);
    setSessionClaims(claims);
    setIdleRemainingSeconds(15 * 60);
    lastActivityRef.current = Date.now();
    setSessionNotice(null);

    // Fetch authoritative ERP data from server
    fetch('/api/admin/data', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.products) {
            onProductsUpdated(data.products);
          }
          if (data.couriers) setCouriers(data.couriers);
          if (data.promoCodes) setPromoCodes(data.promoCodes);
          if (data.campaignBanner) setCampaignBanner(data.campaignBanner);
          if (data.expenses) setExpenses(data.expenses);
          if (data.stockMovements) setStockLogs(data.stockMovements);
          if (data.orders) setOrders(data.orders);
        }
      })
      .catch(() => {});
  };

  const handleSecureLogout = (notice?: string) => {
    securityService.revokeAdminSession();
    setIsAuthenticated(false);
    setSessionToken(null);
    setSessionClaims(null);
    if (notice) {
      setSessionNotice(notice);
    }
  };

  const handleExtendSession = () => {
    lastActivityRef.current = Date.now();
    setIdleRemainingSeconds(15 * 60);
  };

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('catalog');

  // Dynamic ERP States
  const [couriers, setCouriers] = useState<CourierPartner[]>(storeStateService.getCouriers());
  const [defaultCourierId, setDefaultCourierId] = useState<string>(storeStateService.getDefaultCourierId());
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(storeStateService.getPromoCodes());
  const [campaignBanner, setCampaignBanner] = useState<CampaignBanner>(storeStateService.getCampaignBanner());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(storeStateService.getExpenses());
  const [stockLogs, setStockLogs] = useState<StockMovementLog[]>(storeStateService.getStockMovements());
  const [orders, setOrders] = useState<OrderDetails[]>(storeStateService.getOrders());

  // Product Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Courier Edit Modal
  const [editingCourier, setEditingCourier] = useState<CourierPartner | null>(null);
  const [isAddingCourier, setIsAddingCourier] = useState(false);

  // Promo Code Modal
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [isAddingPromo, setIsAddingPromo] = useState(false);

  // New Expense Form State
  const [newExpenseCat, setNewExpenseCat] = useState<ExpenseRecord['category']>('Marketing (Meta/Google)');
  const [newExpenseAmt, setNewExpenseAmt] = useState<string>('');
  const [newExpenseDesc, setNewExpenseDesc] = useState<string>('');

  // Pricing Calculator State
  const [calcUnitCost, setCalcUnitCost] = useState<number>(2650);
  const [calcPackaging, setCalcPackaging] = useState<number>(350);
  const [calcCourier, setCalcCourier] = useState<number>(250);
  const [calcCac, setCalcCac] = useState<number>(1200);
  const [calcTargetMargin, setCalcTargetMargin] = useState<number>(45);

  // Management Module Sidebar Search Filter
  const [sidebarFilter, setSidebarFilter] = useState('');

  if (!isOpen) return null;

  // ---------------- MODULE A: PRODUCT ACTIONS ---------------- //
  const handleSaveProduct = (prod: Product) => {
    if (isAddingProduct) {
      const updated = storeStateService.addProduct(prod);
      onProductsUpdated(updated);
      setIsAddingProduct(false);
    } else {
      const updated = storeStateService.updateProduct(prod);
      onProductsUpdated(updated);
      setEditingProduct(null);
    }
    setStockLogs(storeStateService.getStockMovements());
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product from the live catalog?')) {
      const updated = storeStateService.deleteProduct(productId);
      onProductsUpdated(updated);
    }
  };

  // ---------------- MODULE B: COURIER ACTIONS ---------------- //
  const handleSaveCourier = (cour: CourierPartner) => {
    if (isAddingCourier) {
      const updated = storeStateService.addCourier(cour);
      setCouriers(updated);
      setIsAddingCourier(false);
    } else {
      const updated = storeStateService.updateCourier(cour);
      setCouriers(updated);
      setEditingCourier(null);
    }
  };

  const handleDeleteCourier = (id: string) => {
    if (window.confirm('Delete this courier partner from the system?')) {
      const updated = storeStateService.deleteCourier(id);
      setCouriers(updated);
    }
  };

  const handleSetDefaultCourier = (id: string) => {
    storeStateService.setDefaultCourierId(id);
    setDefaultCourierId(id);
  };

  // ---------------- MODULE C: CAMPAIGNS & PROMOS ---------------- //
  const handleSavePromo = (promo: PromoCode) => {
    if (isAddingPromo) {
      const updated = storeStateService.addPromoCode(promo);
      setPromoCodes(updated);
      setIsAddingPromo(false);
    } else {
      const updated = storeStateService.updatePromoCode(promo);
      setPromoCodes(updated);
      setEditingPromo(null);
    }
  };

  const handleDeletePromo = (id: string) => {
    if (window.confirm('Remove this promo code?')) {
      const updated = storeStateService.deletePromoCode(id);
      setPromoCodes(updated);
    }
  };

  const handleSaveCampaignBanner = (banner: CampaignBanner) => {
    storeStateService.saveCampaignBanner(banner);
    setCampaignBanner(banner);
  };

  // ---------------- MODULE E: EXPENSE MANAGEMENT ---------------- //
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseAmt || isNaN(Number(newExpenseAmt))) return;
    const exp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: newExpenseCat,
      amountPKR: Number(newExpenseAmt),
      description: newExpenseDesc.trim() || `${newExpenseCat} expense entry`,
    };
    const updated = storeStateService.addExpense(exp);
    setExpenses(updated);
    setNewExpenseAmt('');
    setNewExpenseDesc('');
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Delete this expense record?')) {
      const updated = storeStateService.deleteExpense(id);
      setExpenses(updated);
    }
  };

  // ---------------- MODULE F: PRICING CALCULATIONS ---------------- //
  const totalLandedCost = calcUnitCost + calcPackaging + calcCourier + calcCac;
  const suggestedRsp = Math.round(totalLandedCost / (1 - calcTargetMargin / 100));
  const grossProfit = suggestedRsp - (calcUnitCost + calcPackaging);
  const grossMarginPct = Math.round((grossProfit / suggestedRsp) * 100) || 0;
  const netProfit = suggestedRsp - totalLandedCost;
  const netMarginPct = Math.round((netProfit / suggestedRsp) * 100) || 0;

  // ---------------- MODULE G: ANALYTICS CALCULATIONS ---------------- //
  const totalCompletedOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'dispatched');
  const grossRevenuePKR = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.total : 0), 0);
  const totalExpensesPKR = expenses.reduce((acc, e) => acc + e.amountPKR, 0);
  const netProfitPKR = grossRevenuePKR - totalExpensesPKR;
  const aovPKR = orders.length > 0 ? Math.round(grossRevenuePKR / orders.length) : 0;
  const rtoOrders = orders.filter((o) => o.status === 'rto_returned').length;
  const rtoRatePct = orders.length > 0 ? Math.round((rtoOrders / orders.length) * 100) : 0;

  // Module Category Definitions & Dynamic Badges
  const lowStockCount = products.filter((p) => p.stockQuantity <= (p.lowStockThreshold || 5)).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const activeCouriersCount = couriers.filter((c) => c.status === 'active').length;
  const activePromosCount = promoCodes.filter((p) => p.isActive).length;

  const moduleGroups = [
    {
      category: 'Merchandising & Catalog',
      modules: [
        {
          id: 'catalog' as AdminTab,
          label: 'Product Catalog',
          subtitle: 'CRUD inventory, pricing & specs',
          icon: Package,
          badge: `${products.length} Models`,
          badgeColor: 'bg-neutral-800 text-neutral-300 border border-neutral-700',
        },
        {
          id: 'inventory' as AdminTab,
          label: 'Inventory & Stock Logs',
          subtitle: 'Inward batches & live audit',
          icon: Layers,
          badge: lowStockCount > 0 ? `${lowStockCount} Low Stock` : `${totalStockUnits} Units`,
          badgeColor:
            lowStockCount > 0
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-neutral-800 text-neutral-300 border border-neutral-700',
        },
      ],
    },
    {
      category: 'Fulfillment & Logistics',
      modules: [
        {
          id: 'couriers' as AdminTab,
          label: 'Courier Management',
          subtitle: 'Trax, Leopards, TCS routing',
          icon: Truck,
          badge: `${activeCouriersCount} Live`,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        },
      ],
    },
    {
      category: 'Sales & Conversion',
      modules: [
        {
          id: 'campaigns' as AdminTab,
          label: 'Promos & Flash Sales',
          subtitle: 'Coupons, urgency countdowns',
          icon: Percent,
          badge: `${activePromosCount} Active`,
          badgeColor: 'bg-[#C5832B]/20 text-[#E2B29F] border border-[#C5832B]/30',
        },
      ],
    },
    {
      category: 'Finance & Unit Economics',
      modules: [
        {
          id: 'expenses' as AdminTab,
          label: 'Expense Ledger',
          subtitle: 'COGS, ads & courier bills',
          icon: Receipt,
          badge: `${expenses.length} Records`,
          badgeColor: 'bg-neutral-800 text-neutral-300 border border-neutral-700',
        },
        {
          id: 'pricing' as AdminTab,
          label: 'Costing & Margin Tool',
          subtitle: 'RSP simulator & margin target',
          icon: Calculator,
          badge: `${grossMarginPct}% Margin`,
          badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        },
        {
          id: 'analytics' as AdminTab,
          label: 'Executive Analytics',
          subtitle: 'P&L scorecard & returns',
          icon: BarChart3,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        },
      ],
    },
  ];

  const allModules = moduleGroups.flatMap((g) => g.modules);
  const currentModule = allModules.find((m) => m.id === activeTab) || allModules[0];
  const currentGroup = moduleGroups.find((g) => g.modules.some((m) => m.id === activeTab));

  const filteredGroups = moduleGroups
    .map((group) => {
      const filteredModules = group.modules.filter(
        (m) =>
          m.label.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
          m.subtitle.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
          group.category.toLowerCase().includes(sidebarFilter.toLowerCase())
      );
      return { ...group, modules: filteredModules };
    })
    .filter((g) => g.modules.length > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-6">
        
        {/* Main Admin Box */}
        <div className="relative w-full max-w-7xl bg-[#14171A] border border-[#2B3038] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[92vh]">
          
          {/* Header */}
          <div className="px-5 py-4 bg-[#111315] border-b border-[#2B3038] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1F242C] border border-[#C5832B]/50 flex items-center justify-center text-[#C5832B]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-extrabold text-base sm:text-lg text-white">
                    M&B Atelier · Admin Operations Suite
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-[#C5832B] text-neutral-950 rounded">
                    ERP Core
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Catalog CRUD · Logistics Routing · Campaign Engine · Costing & P&L
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <>
                  {/* Zero-Trust RBAC Pill */}
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="font-semibold">ADMIN_SUPER</span>
                  </div>

                  {/* 15m Idle Countdown */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border ${
                    idleRemainingSeconds <= 120
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-[#181B20] text-neutral-300 border-[#2B3038]'
                  }`}>
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Auto-Lock: {Math.floor(idleRemainingSeconds / 60).toString().padStart(2, '0')}:{(idleRemainingSeconds % 60).toString().padStart(2, '0')}</span>
                  </div>

                  {/* Lock / Secure Logout */}
                  <button
                    onClick={() => handleSecureLogout()}
                    className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Revoke Admin Token & Lock Session"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Low Idle Warning Ribbon */}
          {isAuthenticated && idleRemainingSeconds <= 120 && (
            <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>Zero-Trust Inactivity Warning: Session will auto-lock in {idleRemainingSeconds}s.</span>
              </div>
              <button
                onClick={handleExtendSession}
                className="px-2.5 py-1 bg-amber-500 text-neutral-950 font-bold rounded text-[11px] hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Extend Session
              </button>
            </div>
          )}

          {/* Authentication Barrier */}
          {!isAuthenticated ? (
            <div className="flex-1 overflow-y-auto">
              <Admin2faBarrier
                onAuthenticated={handleSessionAuthenticated}
                onCancel={onClose}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
              {/* Mobile Tab Strip (screens < md) */}
              <div className="md:hidden bg-[#16181B] border-b border-[#2B3038] px-3 py-2 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
                {allModules.map((m) => {
                  const Icon = m.icon;
                  const isActive = activeTab === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setActiveTab(m.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-[#C5832B] text-neutral-950 font-bold shadow-sm'
                          : 'bg-[#1C2025] text-neutral-300 hover:text-white border border-[#2B3038]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                      {m.badge && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-black/30 text-white font-mono">
                          {m.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Desktop Multi-Tab Sidebar (md+) */}
              <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 border-r border-[#2B3038] bg-[#111315] flex-col justify-between overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Management Module Quick Filter */}
                  <div className="p-3 border-b border-[#252A30] shrink-0">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        value={sidebarFilter}
                        onChange={(e) => setSidebarFilter(e.target.value)}
                        placeholder="Search modules..."
                        className="w-full pl-8 pr-7 py-1.5 bg-[#171A1E] border border-[#2B3038] rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5832B] transition-colors"
                      />
                      {sidebarFilter && (
                        <button
                          onClick={() => setSidebarFilter('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grouped Modules Navigation List */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {filteredGroups.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500 text-xs">
                        No modules match "{sidebarFilter}"
                      </div>
                    ) : (
                      filteredGroups.map((group) => (
                        <div key={group.category} className="space-y-1">
                          <div className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                            {group.category}
                          </div>
                          <div className="space-y-0.5">
                            {group.modules.map((mod) => {
                              const Icon = mod.icon;
                              const isActive = activeTab === mod.id;
                              return (
                                <button
                                  key={mod.id}
                                  onClick={() => setActiveTab(mod.id)}
                                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                                    isActive
                                      ? 'bg-gradient-to-r from-[#C5832B]/18 via-[#C5832B]/8 to-transparent border-l-2 border-[#C5832B] text-white shadow-sm'
                                      : 'text-neutral-400 hover:text-white hover:bg-[#1A1E24]/70 border-l-2 border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                        isActive
                                          ? 'bg-[#C5832B]/25 text-[#E2B29F] border border-[#C5832B]/40'
                                          : 'bg-[#181B20] text-neutral-400 group-hover:text-neutral-200'
                                      }`}
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <div
                                        className={`text-xs font-semibold truncate ${
                                          isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'
                                        }`}
                                      >
                                        {mod.label}
                                      </div>
                                      <div className="text-[10px] text-neutral-400 truncate">
                                        {mod.subtitle}
                                      </div>
                                    </div>
                                  </div>

                                  {mod.badge && (
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1.5 ${
                                        mod.badgeColor || 'bg-neutral-800 text-neutral-300'
                                      }`}
                                    >
                                      {mod.badge}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sidebar Footer Controls */}
                <div className="p-3 border-t border-[#252A30] bg-[#0E1012] space-y-2.5 shrink-0">
                  {/* Currency Switcher */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                      Pricing Display
                    </span>
                    <div className="flex items-center gap-1 bg-[#171A1E] p-0.5 rounded-lg border border-[#2B3038]">
                      {(['PKR', 'USD', 'GBP', 'EUR'] as CurrencyCode[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => onCurrencyChange(c)}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-colors ${
                            currency === c
                              ? 'bg-[#C5832B] text-neutral-950'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Realtime Sync Status & Lock Suite */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 font-medium text-[10px]">Realtime Synced</span>
                    </div>

                    <button
                      onClick={() => handleSecureLogout()}
                      className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Lock Admin Suite Session"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Lock Suite</span>
                    </button>
                  </div>
                </div>
              </aside>

              {/* Main Content Workspace */}
              <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#14171A]">
                {/* Active Module Context Breadcrumb Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#252A30] gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#C5832B] tracking-wider mb-0.5">
                      <span>{currentGroup?.category || 'ERP Modules'}</span>
                      <ChevronRight className="w-3 h-3 text-neutral-600" />
                      <span className="text-neutral-300">{currentModule?.label}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        {currentModule?.label}
                      </h3>
                      {currentModule?.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${currentModule?.badgeColor}`}>
                          {currentModule?.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {currentModule?.subtitle}
                    </p>
                  </div>

                  {/* Contextual Quick Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {activeTab === 'catalog' && (
                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setIsAddingProduct(true);
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-[#DF9B84] to-[#C5832B] hover:from-[#F0C0B0] text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Bag Model</span>
                      </button>
                    )}
                    {activeTab === 'couriers' && (
                      <button
                        onClick={() => {
                          setEditingCourier(null);
                          setIsAddingCourier(true);
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-[#DF9B84] to-[#C5832B] hover:from-[#F0C0B0] text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Courier Partner</span>
                      </button>
                    )}
                    {activeTab === 'campaigns' && (
                      <button
                        onClick={() => {
                          setEditingPromo(null);
                          setIsAddingPromo(true);
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-[#DF9B84] to-[#C5832B] hover:from-[#F0C0B0] text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Promo Code</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* ---------------- TAB 1: PRODUCT CATALOG MANAGER ---------------- */}
                {activeTab === 'catalog' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white">Dynamic Product Catalog</h3>
                        <p className="text-xs text-neutral-400">
                          Add, modify prices, edit features, and toggle live stock on mbatelier.shop
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setIsAddingProduct(true);
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-[#DF9B84] to-[#C5832B] hover:from-[#F0C0B0] text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Bag Model</span>
                      </button>
                    </div>

                    {/* Products Grid / Table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-[#1A1D22] border border-[#2B3038] rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden"
                        >
                          <div className="flex gap-3">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-20 h-20 rounded-xl object-cover border border-[#2B3038] shrink-0"
                            />
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono font-bold text-[#C5832B]">
                                SKU: {prod.sku || 'MBA-GEN-01'}
                              </span>
                              <h4 className="text-sm font-bold text-white line-clamp-1">{prod.name}</h4>
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs font-bold text-[#E2B29F]">
                                  {formatCurrency(prod.price, currency)}
                                </span>
                                {prod.originalPrice > prod.price && (
                                  <span className="text-[10px] text-neutral-500 line-through">
                                    {formatCurrency(prod.originalPrice, currency)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                    prod.inStock
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                                  }`}
                                >
                                  {prod.inStock ? `${prod.stockQuantity} In Stock` : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-[11px] text-neutral-400 line-clamp-2">
                            {prod.subtitle}
                          </p>

                          <div className="pt-2 border-t border-[#252A30] flex items-center justify-between">
                            <span className="text-[10px] text-neutral-500">
                              Unit Cost: PKR {prod.unitManufacturingCost?.toLocaleString() || '2,650'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setIsAddingProduct(false);
                                }}
                                className="p-1.5 bg-[#20252C] hover:bg-[#282F38] text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Edit / Add Modal Form */}
                    {(editingProduct || isAddingProduct) && (
                      <ProductEditorModal
                        product={
                          editingProduct || {
                            id: `model-${Date.now()}`,
                            sku: `MBA-NEW-${Math.floor(100 + Math.random() * 900)}`,
                            name: '',
                            subtitle: '',
                            price: 6990,
                            originalPrice: 8990,
                            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
                            rating: 5.0,
                            reviewCount: 1,
                            badge: 'New Release · Atelier Series',
                            tagline: 'Handcrafted in Sialkot with military-grade 1000D Oxford.',
                            features: [
                              'Weather-sealed YKK zips',
                              'Suspended laptop drop protection core',
                              'Air-cushioned breathable back harness',
                            ],
                            specs: {
                              capacity: '22 Liters',
                              weight: '850 grams',
                              laptopFit: 'Up to 16" Workstation Laptop',
                              material: '1000D Matte Ballistic Oxford with TPU',
                              dimensions: '48 cm x 30 cm x 15 cm',
                              waterproofRating: 'IPX4 Water-Resistant Coated',
                            },
                            highlights: [
                              'Tested on Pakistani motorcycle commutes',
                              'Doorstep open-parcel inspection allowed',
                            ],
                            inStock: true,
                            stockQuantity: 25,
                            lowStockThreshold: 5,
                            unitManufacturingCost: 2600,
                          }
                        }
                        isNew={isAddingProduct}
                        onClose={() => {
                          setEditingProduct(null);
                          setIsAddingProduct(false);
                        }}
                        onSave={handleSaveProduct}
                      />
                    )}
                  </div>
                )}

                {/* ---------------- TAB 2: COURIER MANAGEMENT ---------------- */}
                {activeTab === 'couriers' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white">Logistics & Courier Company Directory</h3>
                        <p className="text-xs text-neutral-400">
                          Configure Pakistani courier APIs, booking credentials, default rates, and automated tracking routing
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingCourier(null);
                          setIsAddingCourier(true);
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-[#DF9B84] to-[#C5832B] hover:from-[#F0C0B0] text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Logistics Partner</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {couriers.map((courier) => {
                        const isDefault = courier.id === defaultCourierId;
                        return (
                          <div
                            key={courier.id}
                            className={`rounded-2xl p-4 bg-[#1A1D22] border transition-all space-y-3 relative ${
                              isDefault
                                ? 'border-[#C5832B] ring-1 ring-[#C5832B]/50'
                                : 'border-[#2B3038]'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-[#14171A] border border-[#2B3038] flex items-center justify-center text-[#C5832B] font-bold text-xs">
                                  {courier.trackingPrefix}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white">{courier.name}</h4>
                                  <span className="text-[10px] text-neutral-400">
                                    Origin: {courier.originCity} ({courier.centerCode})
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                  courier.status === 'active'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}
                              >
                                {courier.status.toUpperCase()}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#14171A] p-2.5 rounded-xl border border-[#252A30]">
                              <div>
                                <span className="text-neutral-500 block">Default COD Rate</span>
                                <span className="text-white font-bold">PKR {courier.defaultRatePKR}</span>
                              </div>
                              <div>
                                <span className="text-neutral-500 block">Estimated Delivery</span>
                                <span className="text-[#E2B29F] font-bold">{courier.deliveryEta}</span>
                              </div>
                              <div>
                                <span className="text-neutral-500 block">Account Code</span>
                                <span className="text-neutral-300 font-mono text-[10px]">{courier.accountNumber}</span>
                              </div>
                              <div>
                                <span className="text-neutral-500 block">API Key Status</span>
                                <span className="text-emerald-400 font-mono text-[10px]">
                                  {courier.apiKey ? 'Connected' : 'Missing'}
                                </span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-[#252A30] flex items-center justify-between">
                              {isDefault ? (
                                <span className="text-[11px] text-[#C5832B] font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Default Active Partner
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSetDefaultCourier(courier.id)}
                                  className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer"
                                >
                                  Set as Default
                                </button>
                              )}

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingCourier(courier);
                                    setIsAddingCourier(false);
                                  }}
                                  className="p-1.5 bg-[#20252C] hover:bg-[#282F38] text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                                  title="Edit Courier"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCourier(courier.id)}
                                  className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Courier"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Courier Edit Modal */}
                    {(editingCourier || isAddingCourier) && (
                      <CourierEditorModal
                        courier={
                          editingCourier || {
                            id: `courier-${Date.now()}`,
                            name: '',
                            logo: '',
                            trackingPrefix: 'EXP',
                            accountNumber: 'MBA-ACC-01',
                            centerCode: 'LHE-01',
                            originCity: 'Lahore',
                            apiKey: '',
                            defaultRatePKR: 250,
                            deliveryEta: '2–3 Days',
                            status: 'active',
                            trackingUrlTemplate: 'https://example.com/track?cn=',
                          }
                        }
                        isNew={isAddingCourier}
                        onClose={() => {
                          setEditingCourier(null);
                          setIsAddingCourier(false);
                        }}
                        onSave={handleSaveCourier}
                      />
                    )}
                  </div>
                )}

                {/* ---------------- TAB 3: PROMOTIONS & FLASH SALES ---------------- */}
                {activeTab === 'campaigns' && (
                  <div className="space-y-6">
                    {/* Hero Banner Campaign Editor */}
                    <div className="bg-[#1A1D22] border border-[#2B3038] rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#C5832B]" />
                            <span>Active Announcement Banner & Countdown</span>
                          </h4>
                          <p className="text-xs text-neutral-400">
                            Controls the top header promo strip and promotional urgency countdown
                          </p>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={campaignBanner.isActive}
                            onChange={(e) =>
                              handleSaveCampaignBanner({ ...campaignBanner, isActive: e.target.checked })
                            }
                            className="w-4 h-4 rounded text-[#C5832B] accent-[#C5832B]"
                          />
                          <span>Banner Active</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">Banner Title</label>
                          <input
                            type="text"
                            value={campaignBanner.title}
                            onChange={(e) =>
                              handleSaveCampaignBanner({ ...campaignBanner, title: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">Discount Badge Text</label>
                          <input
                            type="text"
                            value={campaignBanner.discountBadge}
                            onChange={(e) =>
                              handleSaveCampaignBanner({ ...campaignBanner, discountBadge: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">Subtext / Instructions</label>
                          <input
                            type="text"
                            value={campaignBanner.subtitle}
                            onChange={(e) =>
                              handleSaveCampaignBanner({ ...campaignBanner, subtitle: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Promo Codes Engine */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">Custom Campaign Discount Codes</h4>
                          <p className="text-xs text-neutral-400">
                            Generate flat PKR discounts or percentage coupons verified at checkout
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingPromo(null);
                            setIsAddingPromo(true);
                          }}
                          className="px-3 py-1.5 bg-[#1C2025] hover:bg-[#252A30] border border-[#C5832B]/50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#C5832B]" />
                          <span>Add Promo Code</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        {promoCodes.map((promo) => (
                          <div
                            key={promo.id}
                            className="bg-[#1A1D22] border border-[#2B3038] rounded-xl p-3.5 space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm font-extrabold text-[#C5832B]">
                                {promo.code}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                  promo.isActive
                                    ? 'bg-emerald-950 text-emerald-400'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}
                              >
                                {promo.type === 'percentage' ? `${promo.value}% OFF` : `PKR ${promo.value} FLAT`}
                              </span>
                            </div>

                            <p className="text-[11px] text-neutral-300">{promo.description}</p>

                            <div className="text-[10px] text-neutral-500 space-y-0.5 border-t border-[#252A30] pt-2">
                              <div>Min Spend: PKR {promo.minSpendPKR.toLocaleString()}</div>
                              <div>
                                Usage: {promo.usageCount} / {promo.usageLimit || '∞'} redemptions
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                onClick={() => {
                                  setEditingPromo(promo);
                                  setIsAddingPromo(false);
                                }}
                                className="text-xs text-neutral-400 hover:text-white"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePromo(promo.id)}
                                className="text-xs text-rose-400 hover:text-rose-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Promo Editor Modal */}
                    {(editingPromo || isAddingPromo) && (
                      <PromoEditorModal
                        promo={
                          editingPromo || {
                            id: `promo-${Date.now()}`,
                            code: 'FLASH20',
                            type: 'percentage',
                            value: 15,
                            minSpendPKR: 4500,
                            usageLimit: 100,
                            usageCount: 0,
                            expiryDate: '2026-12-31T23:59:59Z',
                            isActive: true,
                            description: 'Seasonal flash discount',
                          }
                        }
                        isNew={isAddingPromo}
                        onClose={() => {
                          setEditingPromo(null);
                          setIsAddingPromo(false);
                        }}
                        onSave={handleSavePromo}
                      />
                    )}
                  </div>
                )}

                {/* ---------------- TAB 4: INVENTORY CONTROL & STOCK LOGS ---------------- */}
                {activeTab === 'inventory' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Real-Time Stock Inventory & Low-Stock Alerts</h3>
                      <p className="text-xs text-neutral-400">
                        Live stock counters synced with checkout orders and manual adjustments
                      </p>
                    </div>

                    {/* Stock Overview Table */}
                    <div className="bg-[#1A1D22] border border-[#2B3038] rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#14171A] text-neutral-400 border-b border-[#2B3038]">
                          <tr>
                            <th className="p-3.5">SKU & Product</th>
                            <th className="p-3.5">Stock Level</th>
                            <th className="p-3.5">Threshold Alert</th>
                            <th className="p-3.5">Unit Cost</th>
                            <th className="p-3.5 text-right">Quick Stock Update</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#252A30]">
                          {products.map((p) => {
                            const isLow = p.stockQuantity < p.lowStockThreshold && p.stockQuantity > 0;
                            const isOut = p.stockQuantity === 0;
                            return (
                              <tr key={p.id} className="hover:bg-[#1E2228] transition-colors">
                                <td className="p-3.5">
                                  <div className="font-bold text-white">{p.name}</div>
                                  <div className="text-[10px] font-mono text-[#C5832B]">{p.sku}</div>
                                </td>
                                <td className="p-3.5">
                                  <span
                                    className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs ${
                                      isOut
                                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                        : isLow
                                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    }`}
                                  >
                                    {p.stockQuantity} units
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  {isOut ? (
                                    <span className="text-rose-400 font-bold flex items-center gap-1">
                                      <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock (Red)
                                    </span>
                                  ) : isLow ? (
                                    <span className="text-amber-400 font-bold flex items-center gap-1">
                                      <AlertTriangle className="w-3.5 h-3.5" /> Low Stock &lt; 5 (Yellow)
                                    </span>
                                  ) : (
                                    <span className="text-emerald-400 flex items-center gap-1">
                                      <Check className="w-3.5 h-3.5" /> Healthy Level
                                    </span>
                                  )}
                                </td>
                                <td className="p-3.5 font-mono text-neutral-300">
                                  PKR {p.unitManufacturingCost?.toLocaleString() || '2,650'}
                                </td>
                                <td className="p-3.5 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        const updated = storeStateService.updateProduct({
                                          ...p,
                                          stockQuantity: Math.max(0, p.stockQuantity - 1),
                                          inStock: p.stockQuantity - 1 > 0,
                                        });
                                        onProductsUpdated(updated);
                                        setStockLogs(storeStateService.getStockMovements());
                                      }}
                                      className="w-7 h-7 bg-[#252A30] hover:bg-neutral-700 rounded text-white font-bold cursor-pointer"
                                    >
                                      -1
                                    </button>
                                    <button
                                      onClick={() => {
                                        const updated = storeStateService.updateProduct({
                                          ...p,
                                          stockQuantity: p.stockQuantity + 5,
                                          inStock: true,
                                        });
                                        onProductsUpdated(updated);
                                        setStockLogs(storeStateService.getStockMovements());
                                      }}
                                      className="px-2 h-7 bg-[#C5832B] hover:bg-[#E2B29F] text-neutral-950 font-bold rounded text-[11px] cursor-pointer"
                                    >
                                      +5 Inward
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Stock Movements Ledger */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#C5832B]" />
                        <span>Stock Movement Audit Log</span>
                      </h4>
                      <div className="bg-[#1A1D22] border border-[#2B3038] rounded-xl max-h-56 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#14171A] text-neutral-400 border-b border-[#2B3038] sticky top-0">
                            <tr>
                              <th className="p-2.5">Date & Time</th>
                              <th className="p-2.5">SKU / Model</th>
                              <th className="p-2.5">Adjustment</th>
                              <th className="p-2.5">Movement Type</th>
                              <th className="p-2.5">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#252A30] text-[11px]">
                            {stockLogs.map((log) => (
                              <tr key={log.id}>
                                <td className="p-2.5 text-neutral-400 font-mono">
                                  {new Date(log.timestamp).toLocaleDateString()} ·{' '}
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="p-2.5 font-bold text-white">{log.productName}</td>
                                <td className="p-2.5 font-mono font-bold">
                                  <span className={log.change > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                    {log.change > 0 ? `+${log.change}` : log.change}
                                  </span>
                                </td>
                                <td className="p-2.5 text-neutral-300">{log.type}</td>
                                <td className="p-2.5 text-neutral-400 italic">{log.operatorNotes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- TAB 5: EXPENSE MANAGEMENT SYSTEM ---------------- */}
                {activeTab === 'expenses' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Operational Expense Ledger</h3>
                      <p className="text-xs text-neutral-400">
                        Categorize COGS, packaging supplies, courier bills, and Meta/Google ad spend
                      </p>
                    </div>

                    {/* Add Expense Form */}
                    <form
                      onSubmit={handleAddExpense}
                      className="bg-[#1A1D22] border border-[#2B3038] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                    >
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Expense Category</label>
                        <select
                          value={newExpenseCat}
                          onChange={(e) => setNewExpenseCat(e.target.value as ExpenseRecord['category'])}
                          className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-xs text-white"
                        >
                          <option value="Direct Product (COGS)">Direct Product (COGS)</option>
                          <option value="Packaging & Unboxing">Packaging & Unboxing</option>
                          <option value="Shipping & Courier">Shipping & Courier</option>
                          <option value="Marketing (Meta/Google)">Marketing (Meta/Google)</option>
                          <option value="Operating Overhead">Operating Overhead</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Amount (PKR)</label>
                        <input
                          type="number"
                          value={newExpenseAmt}
                          onChange={(e) => setNewExpenseAmt(e.target.value)}
                          placeholder="e.g. 25000"
                          className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-xs text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">Description / PO Ref</label>
                        <input
                          type="text"
                          value={newExpenseDesc}
                          onChange={(e) => setNewExpenseDesc(e.target.value)}
                          placeholder="e.g. Meta Ads Week 1 / Trax invoice"
                          className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-xs text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-[#C5832B] hover:bg-[#E2B29F] text-neutral-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Log Expense
                      </button>
                    </form>

                    {/* Expense Table */}
                    <div className="bg-[#1A1D22] border border-[#2B3038] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#14171A] text-neutral-400 border-b border-[#2B3038]">
                          <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#252A30]">
                          {expenses.map((exp) => (
                            <tr key={exp.id} className="hover:bg-[#1E2228] transition-colors">
                              <td className="p-3 font-mono text-neutral-400">{exp.date}</td>
                              <td className="p-3 font-bold text-white">{exp.category}</td>
                              <td className="p-3 text-neutral-300">{exp.description}</td>
                              <td className="p-3 font-mono font-bold text-[#E2B29F]">
                                PKR {exp.amountPKR.toLocaleString()}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ---------------- TAB 6: COSTING & MARGIN CALCULATOR ---------------- */}
                {activeTab === 'pricing' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Dynamic Costing & Profit Margin Simulator</h3>
                      <p className="text-xs text-neutral-400">
                        Calculate total landed cost per bag model and generate suggested Retail Selling Price (RSP)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Inputs Column */}
                      <div className="lg:col-span-6 bg-[#1A1D22] border border-[#2B3038] rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5832B]">
                          1. Cost Breakdown Inputs (PKR)
                        </h4>

                        <div>
                          <label className="text-xs text-neutral-300 flex justify-between">
                            <span>Unit Manufacturing Cost (Sialkot Atelier)</span>
                            <span className="font-mono font-bold text-white">PKR {calcUnitCost.toLocaleString()}</span>
                          </label>
                          <input
                            type="range"
                            min="1000"
                            max="6000"
                            step="50"
                            value={calcUnitCost}
                            onChange={(e) => setCalcUnitCost(Number(e.target.value))}
                            className="w-full accent-[#C5832B] mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-neutral-300 flex justify-between">
                            <span>Custom Packaging & Dust Bag</span>
                            <span className="font-mono font-bold text-white">PKR {calcPackaging.toLocaleString()}</span>
                          </label>
                          <input
                            type="range"
                            min="100"
                            max="1000"
                            step="25"
                            value={calcPackaging}
                            onChange={(e) => setCalcPackaging(Number(e.target.value))}
                            className="w-full accent-[#C5832B] mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-neutral-300 flex justify-between">
                            <span>Courier COD Shipping Rate (Trax / CallCourier)</span>
                            <span className="font-mono font-bold text-white">PKR {calcCourier.toLocaleString()}</span>
                          </label>
                          <input
                            type="range"
                            min="150"
                            max="600"
                            step="10"
                            value={calcCourier}
                            onChange={(e) => setCalcCourier(Number(e.target.value))}
                            className="w-full accent-[#C5832B] mt-1"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-neutral-300 flex justify-between">
                            <span>Estimated Customer Acquisition Cost (CAC / Ads)</span>
                            <span className="font-mono font-bold text-white">PKR {calcCac.toLocaleString()}</span>
                          </label>
                          <input
                            type="range"
                            min="300"
                            max="3000"
                            step="50"
                            value={calcCac}
                            onChange={(e) => setCalcCac(Number(e.target.value))}
                            className="w-full accent-[#C5832B] mt-1"
                          />
                        </div>

                        <div className="pt-2 border-t border-[#252A30]">
                          <label className="text-xs text-neutral-300 flex justify-between">
                            <span>Target Net Profit Margin %</span>
                            <span className="font-mono font-bold text-[#C5832B]">{calcTargetMargin}%</span>
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="70"
                            step="1"
                            value={calcTargetMargin}
                            onChange={(e) => setCalcTargetMargin(Number(e.target.value))}
                            className="w-full accent-[#C5832B] mt-1"
                          />
                        </div>
                      </div>

                      {/* Outputs Column */}
                      <div className="lg:col-span-6 bg-[#1A1D22] border border-[#2B3038] rounded-2xl p-5 flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5832B] mb-3">
                            2. Projected Financial Indicators
                          </h4>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-[#14171A] rounded-xl border border-[#2B3038]">
                              <span className="text-neutral-500 block text-[10px]">Total Landed Cost</span>
                              <span className="text-base font-extrabold text-white font-mono">
                                PKR {totalLandedCost.toLocaleString()}
                              </span>
                            </div>

                            <div className="p-3 bg-[#14171A] rounded-xl border border-[#2B3038]">
                              <span className="text-neutral-500 block text-[10px]">Suggested Retail Price</span>
                              <span className="text-base font-extrabold text-[#E2B29F] font-mono">
                                PKR {suggestedRsp.toLocaleString()}
                              </span>
                            </div>

                            <div className="p-3 bg-[#14171A] rounded-xl border border-[#2B3038]">
                              <span className="text-neutral-500 block text-[10px]">Gross Margin</span>
                              <span className="text-sm font-bold text-emerald-400 font-mono">
                                {grossMarginPct}% (PKR {grossProfit.toLocaleString()})
                              </span>
                            </div>

                            <div className="p-3 bg-[#14171A] rounded-xl border border-[#2B3038]">
                              <span className="text-neutral-500 block text-[10px]">Net Profit per Unit</span>
                              <span className="text-sm font-bold text-emerald-400 font-mono">
                                PKR {netProfit.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Real-Time Margin Health Badge */}
                        <div
                          className={`p-4 rounded-xl border flex items-center gap-3 ${
                            netMarginPct >= 45
                              ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                              : netMarginPct >= 25
                              ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                              : 'bg-rose-950/40 border-rose-700/60 text-rose-300'
                          }`}
                        >
                          <TrendingUp className="w-6 h-6 shrink-0" />
                          <div className="text-xs">
                            <strong className="block">
                              {netMarginPct >= 45
                                ? 'Healthy High Margin (>45%)'
                                : netMarginPct >= 25
                                ? 'Moderate Margin (25%–44%)'
                                : 'Critical Low Margin (<25%)'}
                            </strong>
                            <span>
                              {netMarginPct >= 45
                                ? 'Strong buffer for COD return losses and seasonal discounts.'
                                : 'Monitor Meta CAC closely to avoid operating burn.'}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- TAB 7: EXECUTIVE ANALYTICS ---------------- */}
                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Executive Sales & P&L Scorecard</h3>
                      <p className="text-xs text-neutral-400">
                        Formula: Net Profit = (Completed COD Revenue) - (COGS + Operating Expenses + Courier Losses)
                      </p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                      <div className="p-4 bg-[#1A1D22] border border-[#2B3038] rounded-xl">
                        <span className="text-neutral-500 block text-[10px]">Gross Orders Placed</span>
                        <span className="text-xl font-extrabold text-white font-mono">{orders.length}</span>
                      </div>

                      <div className="p-4 bg-[#1A1D22] border border-[#2B3038] rounded-xl">
                        <span className="text-neutral-500 block text-[10px]">Gross COD Revenue</span>
                        <span className="text-xl font-extrabold text-[#E2B29F] font-mono">
                          {formatCurrency(grossRevenuePKR, currency)}
                        </span>
                      </div>

                      <div className="p-4 bg-[#1A1D22] border border-[#2B3038] rounded-xl">
                        <span className="text-neutral-500 block text-[10px]">Total Expenses Logged</span>
                        <span className="text-xl font-extrabold text-rose-400 font-mono">
                          {formatCurrency(totalExpensesPKR, currency)}
                        </span>
                      </div>

                      <div className="p-4 bg-[#1A1D22] border border-[#2B3038] rounded-xl">
                        <span className="text-neutral-500 block text-[10px]">Net Profit / (Burn)</span>
                        <span
                          className={`text-xl font-extrabold font-mono ${
                            netProfitPKR >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatCurrency(netProfitPKR, currency)}
                        </span>
                      </div>

                      <div className="p-4 bg-[#1A1D22] border border-[#2B3038] rounded-xl">
                        <span className="text-neutral-500 block text-[10px]">COD RTO / Return Rate</span>
                        <span className="text-xl font-extrabold text-amber-400 font-mono">{rtoRatePct}%</span>
                      </div>
                    </div>

                    {/* Visual Analytics Chart Representation */}
                    <div className="bg-[#1A1D22] border border-[#2B3038] rounded-2xl p-5 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Revenue vs. Expense Visual Distribution
                      </h4>

                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between text-neutral-400 mb-1">
                            <span>Completed Orders Revenue</span>
                            <span className="font-mono text-emerald-400 font-bold">
                              {formatCurrency(grossRevenuePKR, currency)}
                            </span>
                          </div>
                          <div className="w-full h-3 bg-[#14171A] rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-neutral-400 mb-1">
                            <span>Logged Operational Expenses</span>
                            <span className="font-mono text-rose-400 font-bold">
                              {formatCurrency(totalExpensesPKR, currency)}
                            </span>
                          </div>
                          <div className="w-full h-3 bg-[#14171A] rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: '45%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </main>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ---------------- SUB-COMPONENTS: MODAL EDITORS ---------------- //

const ProductEditorModal: React.FC<{
  product: Product;
  isNew: boolean;
  onClose: () => void;
  onSave: (p: Product) => void;
}> = ({ product, isNew, onClose, onSave }) => {
  const [formData, setFormData] = useState<Product>({ ...product });

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#16181B] border border-[#2B3038] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b border-[#2B3038] pb-3">
          <h4 className="font-bold text-white text-base">
            {isNew ? 'Create New Bag Model' : `Edit: ${formData.name}`}
          </h4>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-neutral-400 block mb-1">Product Title</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Retail Price (PKR)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Original Price (PKR)</label>
            <input
              type="number"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Stock Quantity</label>
            <input
              type="number"
              value={formData.stockQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stockQuantity: Number(e.target.value),
                  inStock: Number(e.target.value) > 0,
                })
              }
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Unit Manufacturing Cost (PKR)</label>
            <input
              type="number"
              value={formData.unitManufacturingCost || 2650}
              onChange={(e) =>
                setFormData({ ...formData, unitManufacturingCost: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-neutral-400 block mb-1">Image URL</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-neutral-400 block mb-1">Subtitle / Punchline</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#2B3038]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#20252C] text-neutral-300 rounded-lg text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-[#C5832B] text-neutral-950 font-bold rounded-lg text-xs"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
};

const CourierEditorModal: React.FC<{
  courier: CourierPartner;
  isNew: boolean;
  onClose: () => void;
  onSave: (c: CourierPartner) => void;
}> = ({ courier, isNew, onClose, onSave }) => {
  const [formData, setFormData] = useState<CourierPartner>({ ...courier });

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#16181B] border border-[#2B3038] rounded-2xl p-6 w-full max-w-md space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-[#2B3038] pb-3">
          <h4 className="font-bold text-white text-sm">
            {isNew ? 'Add Courier Partner' : `Edit: ${formData.name}`}
          </h4>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-neutral-400 block mb-1">Courier Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-neutral-400 block mb-1">Prefix</label>
              <input
                type="text"
                value={formData.trackingPrefix}
                onChange={(e) => setFormData({ ...formData, trackingPrefix: e.target.value })}
                className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Default Rate (PKR)</label>
              <input
                type="number"
                value={formData.defaultRatePKR}
                onChange={(e) => setFormData({ ...formData, defaultRatePKR: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">API Key / Token</label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white font-mono"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Delivery ETA</label>
            <input
              type="text"
              value={formData.deliveryEta}
              onChange={(e) => setFormData({ ...formData, deliveryEta: e.target.value })}
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#2B3038]">
          <button onClick={onClose} className="px-3 py-1.5 bg-[#20252C] text-neutral-300 rounded-lg">
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-3 py-1.5 bg-[#C5832B] text-neutral-950 font-bold rounded-lg"
          >
            Save Partner
          </button>
        </div>
      </div>
    </div>
  );
};

const PromoEditorModal: React.FC<{
  promo: PromoCode;
  isNew: boolean;
  onClose: () => void;
  onSave: (p: PromoCode) => void;
}> = ({ promo, isNew, onClose, onSave }) => {
  const [formData, setFormData] = useState<PromoCode>({ ...promo });

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#16181B] border border-[#2B3038] rounded-2xl p-6 w-full max-w-md space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-[#2B3038] pb-3">
          <h4 className="font-bold text-white text-sm">
            {isNew ? 'Create Promo Code' : `Edit: ${formData.code}`}
          </h4>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-neutral-400 block mb-1">Coupon Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-neutral-400 block mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'flat' })}
                className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
              >
                <option value="percentage">% Percentage</option>
                <option value="flat">Flat PKR</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Discount Value</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Min Spend (PKR)</label>
            <input
              type="number"
              value={formData.minSpendPKR}
              onChange={(e) => setFormData({ ...formData, minSpendPKR: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#14171A] border border-[#2B3038] rounded-lg text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#2B3038]">
          <button onClick={onClose} className="px-3 py-1.5 bg-[#20252C] text-neutral-300 rounded-lg">
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-3 py-1.5 bg-[#C5832B] text-neutral-950 font-bold rounded-lg"
          >
            Save Code
          </button>
        </div>
      </div>
    </div>
  );
};
