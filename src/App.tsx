/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CampaignAnnouncementBar } from './components/CampaignAnnouncementBar';
import { ReturningCustomerBanner } from './components/ReturningCustomerBanner';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustBadges } from './components/TrustBadges';
import { ProductCatalog } from './components/ProductCatalog';
import { WhyUsCraftsmanship } from './components/WhyUsCraftsmanship';
import { ReviewsSection } from './components/ReviewsSection';
import { OrderTrackingSection } from './components/OrderTrackingSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AccountPage } from './components/AccountPage';
import { WhatsAppAuthModal } from './components/WhatsAppAuthModal';
import { AiChatbotDrawer } from './components/AiChatbotDrawer';
import { AdminOperationsSuite } from './components/AdminOperationsSuite';
import { Honeypot404 } from './components/Honeypot404';
import { Product, CartItem, OrderDetails, CurrencyCode } from './types';
import {
  CustomerUser,
  CustomerOffer,
  mbApiService,
} from './services/api';
import { storeStateService } from './services/storeStateService';
import { securityService } from './services/securityService';
import { Check } from 'lucide-react';

export default function App() {
  // Navigation / Route state: 'home' or 'account'
  const [currentPage, setCurrentPage] = useState<'home' | 'account'>('home');

  // Multi-Currency Converter state (PKR, USD, GBP, EUR)
  const [currency, setCurrency] = useState<CurrencyCode>('PKR');

  // Dynamic Catalog State managed via storeStateService
  const [products, setProducts] = useState<Product[]>(() => {
    return storeStateService.getProducts();
  });

  // Admin Operations Suite modal state
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Customer Auth state (WhatsApp as UID)
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    return mbApiService.getCurrentUser();
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Cart state persisted to localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mb_atelier_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Last placed order persisted to localStorage for tracking
  const [lastPlacedOrder, setLastPlacedOrder] = useState<OrderDetails | null>(() => {
    try {
      const saved = localStorage.getItem('mb_atelier_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Returning User Offers (Flow 3)
  const [activeOffers, setActiveOffers] = useState<CustomerOffer[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Modal / Drawer UI states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);

  // Reconnaissance Decoy State (404 Honeypot)
  const [isReconnaissanceDecoy, setIsReconnaissanceDecoy] = useState(false);
  const [probedPath, setProbedPath] = useState('');

  // Handle URL hash, query parameters, or reconnaissance probe
  useEffect(() => {
    const evaluateRoutingSecurity = () => {
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      const currentSearch = window.location.search;

      // 1. Thwart Reconnaissance Scanners (/admin, /wp-admin, /login, /dashboard, etc.)
      if (securityService.isReconnaissanceRoute(currentPath) || securityService.isReconnaissanceRoute(currentHash)) {
        setProbedPath(currentPath !== '/' ? currentPath : currentHash);
        setIsReconnaissanceDecoy(true);
        return;
      }

      // 2. Secret Authorized Gateway Access (?sec_portal=gateway-portal-x99 or #gateway-portal-x99)
      if (securityService.isAuthorizedGateway(currentSearch, currentHash)) {
        setIsAdminOpen(true);
        // Clean URL parameter without refreshing to obscure presence from history
        try {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch {
          // ignore
        }
      }

      // 3. Customer Account Portal
      if (currentPath.includes('account') || currentHash.includes('account')) {
        setCurrentPage('account');
      }
    };

    evaluateRoutingSecurity();
    window.addEventListener('hashchange', evaluateRoutingSecurity);
    window.addEventListener('popstate', evaluateRoutingSecurity);

    return () => {
      window.removeEventListener('hashchange', evaluateRoutingSecurity);
      window.removeEventListener('popstate', evaluateRoutingSecurity);
    };
  }, []);

  // Obscure Administrator Hotkey Chord: Ctrl + Shift + A (or Cmd + Shift + A)
  useEffect(() => {
    const handleKeyChord = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyChord);
    return () => window.removeEventListener('keydown', handleKeyChord);
  }, []);

  // Save Cart to storage
  useEffect(() => {
    try {
      localStorage.setItem('mb_atelier_cart', JSON.stringify(cart));
    } catch {
      // Storage write error suppressed
    }
  }, [cart]);

  // Flow 3: Returning customer strategy (Discount trigger)
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const offers = await mbApiService.getOffers(currentUser?.uid, cart.length > 0);
        setActiveOffers(offers);
      } catch {
        // Fallback offer fetching error suppressed
      }
    };

    fetchOffers();
  }, [currentUser, cart.length]);

  // Load authoritative product catalog from server API
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const liveProducts = await res.json();
          if (Array.isArray(liveProducts) && liveProducts.length > 0) {
            setProducts(liveProducts);
            storeStateService.saveProducts(liveProducts);
          }
        }
      } catch {
        // Use local fallback
      }
    };

    fetchCatalog();
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added "${product.name}" to cart`);
  };

  const handleBuyNow = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) return prev;
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart');
  };

  const handleOrderSuccess = (order: OrderDetails) => {
    setConfirmedOrder(order);
    setLastPlacedOrder(order);
    try {
      localStorage.setItem('mb_atelier_last_order', JSON.stringify(order));
    } catch {
      // Storage error suppressed
    }
    // Save order into StoreStateService
    storeStateService.saveOrder(order);
    // Refresh products stock
    setProducts(storeStateService.getProducts());

    setIsCartOpen(false);
    setCart([]); // Clear cart upon successful order
    setAppliedCoupon(null);
  };

  const handleUserAuthenticated = (user: CustomerUser) => {
    setCurrentUser(user);
    showToast(`Welcome ${user.name || `+${user.uid}`}! WhatsApp verified.`);
  };

  const handleLogout = () => {
    mbApiService.clearAuthSession();
    setCurrentUser(null);
    setActiveOffers([]);
    setAppliedCoupon(null);
    setCurrentPage('home');
    window.location.hash = '';
    showToast('Signed out of WhatsApp account');
  };

  const navigateToAccount = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentPage('account');
    window.location.hash = 'account';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    if (currentPage !== 'home') {
      setCurrentPage('home');
      window.location.hash = '';
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShopModel1 = () => {
    const model1El = document.getElementById('model-metro-commuter') || document.getElementById('shop');
    if (model1El) {
      model1El.scrollIntoView({ behavior: 'smooth' });
    } else {
      scrollToSection('shop');
    }
  };

  const handleTrackFromFaq = (orderId: string) => {
    setActiveTrackingId(orderId);
    if (currentPage !== 'home') {
      setCurrentPage('home');
      window.location.hash = '';
      setTimeout(() => {
        scrollToSection('tracking');
      }, 100);
    } else {
      scrollToSection('tracking');
    }
  };

  const handleApplyOfferCode = (code: string) => {
    setAppliedCoupon(code);
    setIsCartOpen(true);
    showToast(`Coupon "${code}" applied to order!`);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Reconnaissance Probe Honeypot: Return generic 404 to deceive scanners
  if (isReconnaissanceDecoy) {
    return (
      <Honeypot404
        attemptedPath={probedPath}
        onReturnToStore={() => {
          setIsReconnaissanceDecoy(false);
          setProbedPath('');
          window.location.hash = '';
          try {
            window.history.replaceState({}, '', '/');
          } catch {
            // ignore
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#14171A] text-neutral-100 selection:bg-[#C5832B] selection:text-neutral-950">
      {/* 1. Global Campaign Announcement Bar with Live Countdown */}
      <CampaignAnnouncementBar
        onScrollToSection={scrollToSection}
        currency={currency}
      />

      {/* 2. Returning Customer Strategy Sticky Banner (Flow 3) */}
      {currentUser && activeOffers.length > 0 && !isBannerDismissed && (
        <ReturningCustomerBanner
          user={currentUser}
          offers={activeOffers}
          onApplyOffer={handleApplyOfferCode}
          onOpenAccount={navigateToAccount}
          onDismiss={() => setIsBannerDismissed(true)}
        />
      )}

      {/* 3. Navigation Bar (Public: Zero Admin References) */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onScrollToSection={scrollToSection}
        currentUser={currentUser}
        onOpenAccount={navigateToAccount}
        onTriggerAuth={() => setIsAuthModalOpen(true)}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      {/* Main Content Area: Route Switching between Home and /account */}
      {currentPage === 'account' && currentUser ? (
        <main className="flex-1">
          <AccountPage
            user={currentUser}
            onLogout={handleLogout}
            onContinueShopping={navigateToHome}
            onTrackOrderDirect={handleTrackFromFaq}
          />
        </main>
      ) : (
        <main className="flex-1">
          {/* Hero Section */}
          <Hero
            onShopModel1={handleShopModel1}
            onExploreCatalog={() => scrollToSection('shop')}
          />

          {/* Quality Pillars & Trust Badges */}
          <TrustBadges />

          {/* Dynamic Product Catalog */}
          <ProductCatalog
            products={products}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSelectProduct={(product) => setSelectedProduct(product)}
            currency={currency}
          />

          {/* Craftsmanship & Why Us */}
          <WhyUsCraftsmanship />

          {/* Customer Reviews */}
          <ReviewsSection />

          {/* Live Order Tracking Utility Section */}
          <OrderTrackingSection
            lastPlacedOrder={lastPlacedOrder}
            activeTrackingId={activeTrackingId}
          />

          {/* FAQs */}
          <FaqSection onTrackOrder={handleTrackFromFaq} />
        </main>
      )}

      {/* Footer (Public: Zero Admin References) */}
      <Footer onScrollToSection={scrollToSection} />

      {/* Cart & Checkout Slide-Over Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderSuccess={handleOrderSuccess}
        onContinueShopping={() => setIsCartOpen(false)}
        currentUser={currentUser}
        onUserAuthenticated={handleUserAuthenticated}
        activeOffers={activeOffers}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(c) => setAppliedCoupon(c)}
      />

      {/* Product Deep Dive Specs Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        currency={currency}
      />

      {/* Order Confirmation Success Modal */}
      <OrderSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onTrackOrder={handleTrackFromFaq}
      />

      {/* WhatsApp OTP Authentication Modal */}
      <WhatsAppAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleUserAuthenticated}
      />

      {/* Dual Support: 1. AI Chatbot Drawer & 2. WhatsApp Direct Action */}
      <AiChatbotDrawer />

      {/* WhatsApp Floating Trigger for Quick Message */}
      <FloatingWhatsApp />

      {/* ERP Operations Suite Modal */}
      <AdminOperationsSuite
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onProductsUpdated={setProducts}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1C2025] text-white border border-[#C5832B] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-3 h-3" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
