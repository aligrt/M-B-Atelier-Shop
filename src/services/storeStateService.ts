import {
  Product,
  CourierPartner,
  PromoCode,
  CampaignBanner,
  ExpenseRecord,
  StockMovementLog,
  OrderDetails,
} from '../types';
import {
  DEFAULT_DYNAMIC_PRODUCTS,
  DEFAULT_COURIERS,
  DEFAULT_PROMO_CODES,
  DEFAULT_CAMPAIGN_BANNER,
  DEFAULT_EXPENSES,
  DEFAULT_STOCK_MOVEMENTS,
} from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'mba_prod_catalog_v2',
  COURIERS: 'mba_couriers_v2',
  PROMOS: 'mba_promos_v2',
  CAMPAIGN: 'mba_campaign_banner_v2',
  EXPENSES: 'mba_expenses_v2',
  STOCK_LOGS: 'mba_stock_movements_v2',
  ORDERS: 'mba_orders_v2',
  DEFAULT_COURIER_ID: 'mba_default_courier_id_v2',
};

class StoreStateService {
  // Products CRUD
  getProducts(): Product[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Storage parse error suppressed
    }
    return DEFAULT_DYNAMIC_PRODUCTS;
  }

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {
      // Storage save error suppressed
    }
  }

  addProduct(newProduct: Product): Product[] {
    const products = this.getProducts();
    const updated = [newProduct, ...products];
    this.saveProducts(updated);
    // Log stock addition
    this.addStockMovement({
      id: `mov-${Date.now()}`,
      productId: newProduct.id,
      productName: newProduct.name,
      sku: newProduct.sku,
      change: newProduct.stockQuantity,
      type: 'Supplier Inward Batch',
      timestamp: new Date().toISOString(),
      operatorNotes: `Initial inward batch for new product: ${newProduct.name}`,
    });
    return updated;
  }

  updateProduct(updatedProduct: Product): Product[] {
    const products = this.getProducts();
    const existing = products.find((p) => p.id === updatedProduct.id);
    if (existing && existing.stockQuantity !== updatedProduct.stockQuantity) {
      const diff = updatedProduct.stockQuantity - existing.stockQuantity;
      this.addStockMovement({
        id: `mov-${Date.now()}`,
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        sku: updatedProduct.sku,
        change: diff,
        type: 'Manual Adjustment',
        timestamp: new Date().toISOString(),
        operatorNotes: `Stock adjusted from ${existing.stockQuantity} to ${updatedProduct.stockQuantity}`,
      });
    }
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    this.saveProducts(updated);
    return updated;
  }

  deleteProduct(productId: string): Product[] {
    const products = this.getProducts();
    const updated = products.filter((p) => p.id !== productId);
    this.saveProducts(updated);
    return updated;
  }

  // Couriers CRUD
  getCouriers(): CourierPartner[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURIERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Suppressed
    }
    return DEFAULT_COURIERS;
  }

  saveCouriers(couriers: CourierPartner[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COURIERS, JSON.stringify(couriers));
    } catch {
      // Suppressed
    }
  }

  addCourier(newCourier: CourierPartner): CourierPartner[] {
    const couriers = this.getCouriers();
    const updated = [...couriers, newCourier];
    this.saveCouriers(updated);
    return updated;
  }

  updateCourier(updatedCourier: CourierPartner): CourierPartner[] {
    const couriers = this.getCouriers();
    const updated = couriers.map((c) => (c.id === updatedCourier.id ? updatedCourier : c));
    this.saveCouriers(updated);
    return updated;
  }

  deleteCourier(courierId: string): CourierPartner[] {
    const couriers = this.getCouriers();
    const updated = couriers.filter((c) => c.id !== courierId);
    this.saveCouriers(updated);
    return updated;
  }

  getDefaultCourierId(): string {
    return localStorage.getItem(STORAGE_KEYS.DEFAULT_COURIER_ID) || 'trax';
  }

  setDefaultCourierId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.DEFAULT_COURIER_ID, id);
  }

  // Promo Codes CRUD
  getPromoCodes(): PromoCode[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROMOS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Suppressed
    }
    return DEFAULT_PROMO_CODES;
  }

  savePromoCodes(promos: PromoCode[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(promos));
    } catch {
      // Suppressed
    }
  }

  addPromoCode(promo: PromoCode): PromoCode[] {
    const promos = this.getPromoCodes();
    const updated = [...promos, promo];
    this.savePromoCodes(updated);
    return updated;
  }

  updatePromoCode(promo: PromoCode): PromoCode[] {
    const promos = this.getPromoCodes();
    const updated = promos.map((p) => (p.id === promo.id ? promo : p));
    this.savePromoCodes(updated);
    return updated;
  }

  deletePromoCode(id: string): PromoCode[] {
    const promos = this.getPromoCodes();
    const updated = promos.filter((p) => p.id !== id);
    this.savePromoCodes(updated);
    return updated;
  }

  validatePromoCode(code: string, subtotal: number): { valid: boolean; discountAmount: number; message: string; promo?: PromoCode } {
    const cleanCode = code.trim().toUpperCase();
    const promos = this.getPromoCodes();
    const match = promos.find((p) => p.code.toUpperCase() === cleanCode && p.isActive);

    if (!match) {
      return { valid: false, discountAmount: 0, message: `Promo code "${cleanCode}" is invalid or expired.` };
    }

    if (new Date(match.expiryDate).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, message: `Promo code "${cleanCode}" has expired.` };
    }

    if (subtotal < match.minSpendPKR) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum order of PKR ${match.minSpendPKR.toLocaleString()} required for code "${cleanCode}".`,
      };
    }

    if (match.usageLimit && match.usageCount >= match.usageLimit) {
      return { valid: false, discountAmount: 0, message: `Promo code "${cleanCode}" has reached maximum usage limit.` };
    }

    let discount = 0;
    if (match.type === 'percentage') {
      discount = Math.round((subtotal * match.value) / 100);
      if (match.maxDiscountPKR && discount > match.maxDiscountPKR) {
        discount = match.maxDiscountPKR;
      }
    } else {
      discount = match.value;
    }

    return {
      valid: true,
      discountAmount: discount,
      message: `Coupon "${cleanCode}" applied: Saved PKR ${discount.toLocaleString()}!`,
      promo: match,
    };
  }

  // Campaign Banner
  getCampaignBanner(): CampaignBanner {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CAMPAIGN);
      if (saved) return JSON.parse(saved);
    } catch {
      // Suppressed
    }
    return DEFAULT_CAMPAIGN_BANNER;
  }

  saveCampaignBanner(banner: CampaignBanner): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPAIGN, JSON.stringify(banner));
    } catch {
      // Suppressed
    }
  }

  // Expenses CRUD
  getExpenses(): ExpenseRecord[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Suppressed
    }
    return DEFAULT_EXPENSES;
  }

  saveExpenses(expenses: ExpenseRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch {
      // Suppressed
    }
  }

  addExpense(expense: ExpenseRecord): ExpenseRecord[] {
    const expenses = this.getExpenses();
    const updated = [expense, ...expenses];
    this.saveExpenses(updated);
    return updated;
  }

  deleteExpense(id: string): ExpenseRecord[] {
    const expenses = this.getExpenses();
    const updated = expenses.filter((e) => e.id !== id);
    this.saveExpenses(updated);
    return updated;
  }

  // Stock Movements Log
  getStockMovements(): StockMovementLog[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOCK_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Suppressed
    }
    return DEFAULT_STOCK_MOVEMENTS;
  }

  addStockMovement(log: StockMovementLog): void {
    try {
      const current = this.getStockMovements();
      const updated = [log, ...current];
      localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(updated));
    } catch {
      // Suppressed
    }
  }

  // Order Management for Store & Admin
  getOrders(): OrderDetails[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Suppressed
    }
    return [];
  }

  saveOrders(orders: OrderDetails[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // Suppressed
    }
  }

  saveOrder(newOrder: OrderDetails): void {
    const orders = this.getOrders();
    const updated = [newOrder, ...orders];
    this.saveOrders(updated);

    // Deduct stock for ordered items
    const products = this.getProducts();
    newOrder.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.product.id);
      if (prod) {
        const newQty = Math.max(0, prod.stockQuantity - item.quantity);
        prod.stockQuantity = newQty;
        prod.inStock = newQty > 0;
        this.addStockMovement({
          id: `mov-${Date.now()}-${prod.id}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          change: -item.quantity,
          type: 'Order Dispatch',
          timestamp: new Date().toISOString(),
          operatorNotes: `Order #${newOrder.orderId} placed by ${newOrder.customerName}`,
        });
      }
    });
    this.saveProducts(products);

    // If promo was used, increment usage count
    if (newOrder.appliedCoupon) {
      const promos = this.getPromoCodes();
      const match = promos.find((p) => p.code.toUpperCase() === newOrder.appliedCoupon?.toUpperCase());
      if (match) {
        match.usageCount += 1;
        this.savePromoCodes(promos);
      }
    }
  }

  updateOrderStatus(orderId: string, status: OrderDetails['status'], courierId?: string, trackingNumber?: string): OrderDetails[] {
    const orders = this.getOrders();
    const couriers = this.getCouriers();
    const selectedCourier = courierId ? couriers.find((c) => c.id === courierId) : undefined;

    const updated = orders.map((o) => {
      if (o.orderId === orderId) {
        return {
          ...o,
          status,
          courierId: courierId || o.courierId,
          courierName: selectedCourier ? selectedCourier.name : o.courierName,
          trackingNumber: trackingNumber || o.trackingNumber,
        };
      }
      return o;
    });
    this.saveOrders(updated);
    return updated;
  }
}

export const storeStateService = new StoreStateService();
