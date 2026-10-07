/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustBadges } from './components/TrustBadges';
import { ProductCatalog } from './components/ProductCatalog';
import { WhyUsCraftsmanship } from './components/WhyUsCraftsmanship';
import { ReviewsSection } from './components/ReviewsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Product, CartItem, OrderDetails } from './types';
import { PRODUCTS } from './data/products';
import { Check } from 'lucide-react';

export default function App() {
  // Cart state persisted to localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mb_atelier_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('mb_atelier_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

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
    // Check if in cart; if not add it, then immediately open drawer
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
    setIsCartOpen(false);
    setCart([]); // Clear cart upon successful order
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShopModel1 = () => {
    const model1El = document.getElementById('model-1-metro');
    if (model1El) {
      model1El.scrollIntoView({ behavior: 'smooth' });
      // Pulse animation highlight
      model1El.classList.add('ring-4', 'ring-[#C88D76]');
      setTimeout(() => {
        model1El.classList.remove('ring-4', 'ring-[#C88D76]');
      }, 1500);
    } else {
      scrollToSection('shop');
    }
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#14171A] text-neutral-100 selection:bg-[#C88D76] selection:text-neutral-950">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onScrollToSection={scrollToSection}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 3. Hero Section */}
        <Hero
          onShopModel1={handleShopModel1}
          onExploreCatalog={() => scrollToSection('shop')}
        />

        {/* 4. Trust Badges */}
        <TrustBadges />

        {/* 5. Product Catalog */}
        <ProductCatalog
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        {/* Craftsmanship & Why Us */}
        <WhyUsCraftsmanship />

        {/* Customer Reviews */}
        <ReviewsSection />

        {/* FAQs */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer onScrollToSection={scrollToSection} />

      {/* 6. Cash on Delivery Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderSuccess={handleOrderSuccess}
        onContinueShopping={() => scrollToSection('shop')}
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
      />

      {/* 7. Floating WhatsApp Button */}
      <FloatingWhatsApp />

      {/* Toast Notification */}
      {toastMessage && (
        <aside aria-label="Notification" className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#1C2025] text-white border border-[#C88D76]/50 px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm animate-in slide-in-from-bottom duration-200">
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
