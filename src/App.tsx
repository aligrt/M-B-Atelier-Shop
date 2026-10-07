/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
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
import { Product, CartItem, OrderDetails } from './types';
import {
  CustomerUser,
  CustomerOffer,
  mbApiService,
} from './services/api';
import { Check } from 'lucide-react';

export default function App() {
  // Navigation / Route state: 'home' or 'account'
  const [currentPage, setCurrentPage] = useState<'home' | 'account'>('home');

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

  // Handle URL hash or path on initial load (e.g. /account or #account)
  useEffect(() => {
    const checkHash = () => {
      const path = window.location.hash || window.location.pathname;
      if (path.includes('account')) {
        setCurrentPage('account');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Save Cart to storage
  useEffect(() => {
    try {
      localStorage.setItem('mb_atelier_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Flow 3: Returning customer strategy (Discount trigger)
  // On load or auth change, query GET /api/customer/offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const offers = await mbApiService.getOffers(currentUser?.uid, cart.length > 0);
        setActiveOffers(offers);
        // If returning user has a 10% coupon and no coupon currently applied, keep it ready
        if (offers.length > 0 && !appliedCoupon) {
          const retOffer = offers.find((o) => o.code === 'RETURNING10');
          if (retOffer) {
            // Can be applied by user
          }
        }
      } catch (e) {
        console.warn('Failed to fetch offers', e);
      }
    };

    fetchOffers();
  }, [currentUser, cart.length]);

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
    } catch (e) {
      console.warn('Failed to save last order', e);
    }
    setIsCartOpen(false);
    setCart([]); // Clear cart upon successful order
    setAppliedCoupon(null);
  };

  const handleUserAuthenticated = (user: CustomerUser, token: string) => {
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
    const model1El = document.getElementById('model-1-metro');
    if (model1El) {
      model1El.scrollIntoView({ behavior: 'smooth' });
      model1El.classList.add('ring-4', 'ring-[#C88D76]');
      setTimeout(() => {
        model1El.classList.remove('ring-4', 'ring-[#C88D76]');
      }, 1500);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#14171A] text-neutral-100 selection:bg-[#C88D76] selection:text-neutral-950">
      {/* 1. Global Announcement Bar */}
      <AnnouncementBar />

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

      {/* 3. Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onScrollToSection={scrollToSection}
        currentUser={currentUser}
        onOpenAccount={navigateToAccount}
        onTriggerAuth={() => setIsAuthModalOpen(true)}
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

          {/* Trust Badges */}
          <TrustBadges />

          {/* Product Catalog */}
          <ProductCatalog
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSelectProduct={(product) => setSelectedProduct(product)}
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

      {/* Footer */}
      <Footer onScrollToSection={scrollToSection} />

      {/* Cash on Delivery Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderSuccess={handleOrderSuccess}
        onContinueShopping={() => {
          if (currentPage !== 'home') setCurrentPage('home');
          scrollToSection('shop');
        }}
        currentUser={currentUser}
        onUserAuthenticated={handleUserAuthenticated}
        activeOffers={activeOffers}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(code) => setAppliedCoupon(code)}
      />

      {/* Standalone WhatsApp Auth Modal */}
      <WhatsAppAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={(user, token) => {
          setIsAuthModalOpen(false);
          handleUserAuthenticated(user, token);
          if (currentPage === 'account') {
            // Already navigated
          }
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Order Confirmed Modal */}
      <OrderSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onTrackOrder={(orderId) => {
          setConfirmedOrder(null);
          handleTrackFromFaq(orderId);
        }}
      />

      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />

      {/* Toast Notification */}
      {toastMessage && (
        <aside
          aria-label="Notification"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#1C2025] text-white border border-[#C88D76]/50 px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm animate-in slide-in-from-bottom duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
          <button
            onClick={() => setIsCartOpen(true)}
            className="ml-2 text-[#E2B29F] font-semibold underline underline-offset-2 hover:text-white transition-colors cursor-pointer"
          >
            View Cart
          </button>
        </aside>
      )}
    </div>
  );
}
