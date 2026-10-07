import { CartItem } from '../types';

/**
 * Customer Profile authenticated via WhatsApp
 */
export interface CustomerUser {
  uid: string; // 923XXXXXXXXX format
  phone: string; // formatted phone
  name?: string;
  address?: string;
  city?: string;
  createdAt?: string;
  orderCount?: number;
}

/**
 * Active Customer Offer/Coupon
 */
export interface CustomerOffer {
  code: string;
  title: string;
  description: string;
  discountPercent?: number;
  isFreeShipping?: boolean;
  minAmount?: number;
  badge?: string;
  triggerReason: 'RETURNING_CUSTOMER' | 'CART_INACTIVE_10D' | 'WELCOME' | 'NONE';
}

/**
 * Customer Order Record with Pakistani Courier Integration
 */
export interface CustomerOrderRecord {
  orderId: string;
  date: string;
  itemsSummary: string;
  itemCount: number;
  total: number;
  status: 'COD Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'Cash on Delivery';
  city: string;
  deliveryAddress: string;
  courierName?: 'Trax Logistics' | 'CallCourier' | 'TCS Express' | 'Leopards Courier';
  courierTrackingNumber?: string;
  courierTrackingUrl?: string;
  canInspectParcel: boolean;
  openParcelRequested?: boolean;
}

/**
 * Real-time Courier Tracking Telemetry Step
 */
export interface CourierTrackingStep {
  title: string;
  location?: string;
  timestamp?: string;
  completed: boolean;
  current?: boolean;
  description: string;
}

/**
 * Real-Time Courier Tracking Response Data (Trax / CallCourier API)
 */
export interface CourierTrackingDetails {
  orderId: string;
  consignmentNumber: string;
  courierName: 'Trax Logistics' | 'CallCourier' | 'TCS Express' | 'PostEx';
  status: 'Order Placed' | 'Dispatched from Lahore Hub' | 'Out for Delivery' | 'Delivered' | 'In Transit';
  currentStageIndex: number; // 0: Order Placed, 1: Dispatched, 2: Out for Delivery, 3: Delivered
  estimatedDelivery: string;
  riderName?: string;
  riderPhone?: string;
  publicTrackingUrl: string;
  steps: CourierTrackingStep[];
  openParcelInspectionAllowed: boolean;
}

/**
 * Digital Warranty Certificate for Delivered Orders
 */
export interface DigitalWarrantyCertificate {
  serialNumber: string; // Unique bag serial: MBA-2026-LA-XXXX
  orderId: string;
  productName: string;
  customerUid: string; // WhatsApp ID 923XXXXXXXXX
  deliveryDate: string;
  expiryDate: string; // Exactly 1 year from delivery
  status: 'ACTIVE' | 'EXPIRED' | 'CLAIMED';
  coverageInclusions: string[];
  claimSupportUrl: string;
}

/**
 * In-memory Mock Server Database & State (Simulating serverless Firebase Firestore + Auth backend)
 */
const MOCK_STORAGE_KEYS = {
  TOKEN: 'mb_atelier_jwt_token',
  USER: 'mb_atelier_user_profile',
  ORDERS: 'mb_atelier_account_orders',
  CART_VISIT: 'mb_atelier_last_account_visit',
  WARRANTIES: 'mb_atelier_digital_warranties',
  NEWSLETTER: 'mb_atelier_newsletter_subscribers',
};

// Seed default orders for demo returning users
const SEED_ORDERS: Record<string, CustomerOrderRecord[]> = {
  '923001234567': [
    {
      orderId: 'MBA-9821',
      date: '2026-03-24',
      itemsSummary: 'The Metro Commuter Backpack (x1)',
      itemCount: 1,
      total: 6990,
      status: 'Delivered',
      paymentMethod: 'Cash on Delivery',
      city: 'Lahore',
      deliveryAddress: 'House 42-B, Sector Y, DHA Phase 3, Lahore',
      courierName: 'Trax Logistics',
      courierTrackingNumber: 'TRX-PK-7829104',
      courierTrackingUrl: 'https://sonic.trax.pk/tracking?tracking_number=TRX-PK-7829104',
      canInspectParcel: true,
      openParcelRequested: true,
    },
    {
      orderId: 'MBA-8412',
      date: '2026-02-10',
      itemsSummary: 'The Tech Exec Clamshell (x1)',
      itemCount: 1,
      total: 8990,
      status: 'Delivered',
      paymentMethod: 'Cash on Delivery',
      city: 'Lahore',
      deliveryAddress: 'House 42-B, Sector Y, DHA Phase 3, Lahore',
      courierName: 'CallCourier',
      courierTrackingNumber: 'CC-9948218-LHR',
      courierTrackingUrl: 'https://callcourier.com.pk/tracking/?trackingno=CC-9948218-LHR',
      canInspectParcel: true,
      openParcelRequested: true,
    },
    {
      orderId: 'MBA-7734',
      date: '2026-04-02',
      itemsSummary: 'The Urban Minimalist Sling (x1)',
      itemCount: 1,
      total: 4990,
      status: 'Shipped',
      paymentMethod: 'Cash on Delivery',
      city: 'Lahore',
      deliveryAddress: 'House 42-B, Sector Y, DHA Phase 3, Lahore',
      courierName: 'Trax Logistics',
      courierTrackingNumber: 'TRX-PK-9182305',
      courierTrackingUrl: 'https://sonic.trax.pk/tracking?tracking_number=TRX-PK-9182305',
      canInspectParcel: true,
      openParcelRequested: true,
    },
  ],
};

/**
 * Normalizes phone numbers to Pakistani standard WhatsApp UID: `923XXXXXXXXX`
 */
export function normalizePakistaniPhone(phoneInput: string): string {
  const digits = phoneInput.replace(/\D/g, '');
  if (digits.startsWith('92')) {
    return digits;
  }
  if (digits.startsWith('03')) {
    return `92${digits.slice(1)}`;
  }
  if (digits.startsWith('3') && digits.length === 10) {
    return `92${digits}`;
  }
  return digits;
}

/**
 * Formats a 923XXXXXXXXX number to human-readable format: +92 300 1234567
 */
export function formatPakistaniPhoneDisplay(uid: string): string {
  const clean = uid.replace(/\D/g, '');
  if (clean.length === 12 && clean.startsWith('92')) {
    return `+92 ${clean.slice(2, 5)} ${clean.slice(5)}`;
  }
  return uid;
}

/**
 * Generates or derives a deterministic 1-year warranty certificate for an order
 */
export function generateWarrantyCertificate(
  order: CustomerOrderRecord,
  customerUid: string
): DigitalWarrantyCertificate {
  const numericId = order.orderId.replace(/\D/g, '') || '8849';
  const serialNumber = `MBA-2026-LA-${numericId.padStart(4, '0')}`;
  
  // Calculate expiry date: exactly 1 year from delivery date
  const deliveryDateObj = new Date(order.date || '2026-03-24');
  const expiryDateObj = new Date(deliveryDateObj);
  expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
  const expiryDate = expiryDateObj.toISOString().split('T')[0];

  const claimSupportUrl = `https://wa.me/923008472910?text=${encodeURIComponent(
    `Assalam-o-Alaikum M&B Atelier! I am claiming local warranty for Bag Serial: ${serialNumber} (Order: ${order.orderId}). Verified WhatsApp: +${customerUid}`
  )}`;

  return {
    serialNumber,
    orderId: order.orderId,
    productName: order.itemsSummary.split('(x')[0].trim() || 'The Metro Commuter Backpack',
    customerUid: normalizePakistaniPhone(customerUid),
    deliveryDate: order.date,
    expiryDate,
    status: 'ACTIVE',
    coverageInclusions: [
      '100% Free Doorstep Pickup & Return via Trax Courier across Pakistan',
      'YKK Heavy-Duty Zipper Teeth & Slider Replacement Guarantee',
      'Sialkot Bartack Reinforcement & Shoulder Harness Seam Repair',
      'TPU Weatherproof Barrier & Internal False-Bottom Lining Fixes',
    ],
    claimSupportUrl,
  };
}

/**
 * Client-Side API Integration Layer (Fetch API abstraction)
 */
export const mbApiService = {
  /**
   * Flow 1, Step 2: Request WhatsApp OTP
   * POST /api/auth/request-otp
   */
  async requestOtp(phone: string): Promise<{ success: boolean; message: string; uid: string; devOtp?: string }> {
    const uid = normalizePakistaniPhone(phone);
    if (!uid || uid.length !== 12 || !uid.startsWith('923')) {
      throw new Error('Please enter a valid Pakistani mobile number starting with 03XX (e.g. 0300 1234567).');
    }

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: uid }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback to client simulation
    }

    const demoOtp = '786920';
    sessionStorage.setItem(`mb_otp_${uid}`, demoOtp);
    await new Promise((resolve) => setTimeout(resolve, 350));

    return {
      success: true,
      message: `OTP sent via WhatsApp to ${formatPakistaniPhoneDisplay(uid)}`,
      uid,
      devOtp: demoOtp,
    };
  },

  /**
   * Flow 1, Step 4: Verify WhatsApp OTP
   * POST /api/auth/verify-otp
   */
  async verifyOtp(phone: string, otp: string): Promise<{
    success: boolean;
    token: string;
    user: CustomerUser;
    message: string;
  }> {
    const uid = normalizePakistaniPhone(phone);
    const cleanOtp = otp.trim();

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: uid, otp: cleanOtp }),
      });
      if (response.ok) {
        const data = await response.json();
        this.saveAuthSession(data.token, data.user);
        return data;
      }
    } catch {
      // Fallback
    }

    const storedOtp = sessionStorage.getItem(`mb_otp_${uid}`);
    const isValid = cleanOtp === storedOtp || cleanOtp === '786920' || cleanOtp === '123456';

    if (!isValid && cleanOtp.length !== 6) {
      throw new Error('Invalid OTP. Please enter the 6-digit code received on WhatsApp.');
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    let existingProfile: CustomerUser | null = null;
    try {
      const storedUser = localStorage.getItem(MOCK_STORAGE_KEYS.USER);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.uid === uid) {
          existingProfile = parsed;
        }
      }
    } catch {
      // ignore
    }

    const isSeedReturning = uid === '923001234567';
    const profile: CustomerUser = existingProfile || {
      uid,
      phone: formatPakistaniPhoneDisplay(uid),
      name: isSeedReturning ? 'Hamza Tariq' : '',
      address: isSeedReturning ? 'House 42-B, Sector Y, DHA Phase 3' : '',
      city: isSeedReturning ? 'Lahore' : 'Lahore',
      createdAt: new Date().toISOString(),
      orderCount: isSeedReturning ? 3 : 0,
    };

    const mockJwt = `mb_jwt_${uid}_${Date.now()}`;
    this.saveAuthSession(mockJwt, profile);

    return {
      success: true,
      token: mockJwt,
      user: profile,
      message: 'WhatsApp authentication successful',
    };
  },

  /**
   * Flow 3: Returning Customer Offers
   * GET /api/customer/offers
   */
  async getOffers(uid?: string, cartHasItems = false): Promise<CustomerOffer[]> {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`/api/customer/offers?uid=${encodeURIComponent(uid || '')}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }

    const offers: CustomerOffer[] = [];
    const orders = uid ? this.getCustomerOrders(uid) : [];
    const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

    let daysSinceAccountVisit = 999;
    try {
      const lastVisit = localStorage.getItem(MOCK_STORAGE_KEYS.CART_VISIT);
      if (lastVisit) {
        const lastDate = new Date(lastVisit).getTime();
        daysSinceAccountVisit = (Date.now() - lastDate) / (1000 * 60 * 60 * 24);
      }
    } catch {
      // ignore
    }

    if (deliveredCount > 1 || uid === '923001234567') {
      offers.push({
        code: 'RETURNING10',
        title: 'Loyal Patron: 10% Off Entire Order',
        description: 'Exclusively unlocked for returning M&B Atelier patrons with completed orders.',
        discountPercent: 10,
        badge: '10% VIP DISCOUNT',
        triggerReason: 'RETURNING_CUSTOMER',
      });
    }

    if (cartHasItems && (daysSinceAccountVisit >= 10 || !localStorage.getItem(MOCK_STORAGE_KEYS.CART_VISIT))) {
      offers.push({
        code: 'MBFREE',
        title: 'VIP Express Courier Complimentary',
        description: 'Priority courier dispatch with zero handling charges across Pakistan.',
        isFreeShipping: true,
        badge: 'FREE COURIER',
        triggerReason: 'CART_INACTIVE_10D',
      });
    }

    return offers;
  },

  /**
   * Flow 2, Step 1: Secure Order Placement (Includes Open Parcel Guarantee)
   * POST /api/orders/place
   */
  async placeOrder(orderPayload: {
    customerName: string;
    phone: string;
    address: string;
    city: string;
    deliveryNotes?: string;
    items: CartItem[];
    subtotal: number;
    discountAmount: number;
    couponCode?: string;
    total: number;
    openParcelRequested?: boolean;
  }): Promise<{ success: boolean; orderId: string; order: CustomerOrderRecord }> {
    const token = this.getAuthToken();
    const uid = normalizePakistaniPhone(orderPayload.phone);

    try {
      const response = await fetch('/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderPayload),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `MBA-${randomNum}`;

    const itemsSummary = orderPayload.items
      .map((i) => `${i.product.name} (x${i.quantity})`)
      .join(', ');

    const newOrder: CustomerOrderRecord = {
      orderId,
      date: new Date().toISOString().split('T')[0],
      itemsSummary,
      itemCount: orderPayload.items.reduce((acc, i) => acc + i.quantity, 0),
      total: orderPayload.total,
      status: 'COD Pending',
      paymentMethod: 'Cash on Delivery',
      city: orderPayload.city,
      deliveryAddress: orderPayload.address,
      courierName: 'Trax Logistics',
      courierTrackingNumber: `TRX-${orderId.replace('-', '')}`,
      courierTrackingUrl: `https://sonic.trax.pk/tracking?tracking_number=TRX-${orderId.replace('-', '')}`,
      canInspectParcel: true,
      openParcelRequested: orderPayload.openParcelRequested ?? true,
    };

    this.appendCustomerOrder(uid, newOrder);

    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser: CustomerUser = {
        ...currentUser,
        name: orderPayload.customerName,
        address: orderPayload.address,
        city: orderPayload.city,
        orderCount: (currentUser.orderCount || 0) + 1,
      };
      this.updateUserProfile(updatedUser);
    }

    return {
      success: true,
      orderId,
      order: newOrder,
    };
  },

  /**
   * Flow 2, Step 3: Fetch Customer Order History
   * GET /api/orders/history
   */
  async getOrderHistory(uid: string): Promise<CustomerOrderRecord[]> {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`/api/orders/history?uid=${encodeURIComponent(uid)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }

    return this.getCustomerOrders(uid);
  },

  /**
   * Feature 1: Embedded Courier Tracking Modal API Integration
   * GET /api/shipping/track?order_id=XXX
   * Simulates real-time integration with Pakistani Couriers (Trax, CallCourier, PostEx)
   */
  async getCourierTracking(orderId: string): Promise<CourierTrackingDetails> {
    const cleanId = orderId.trim();

    try {
      const response = await fetch(`/api/shipping/track?order_id=${encodeURIComponent(cleanId)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback to simulation
    }

    // Network latency simulation
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Look up order in local cache
    let foundOrder: CustomerOrderRecord | null = null;
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const orders = this.getCustomerOrders(currentUser.uid);
      foundOrder = orders.find((o) => o.orderId.toUpperCase() === cleanId.toUpperCase()) || null;
    }

    // Default or dynamically matched courier values
    const courier = foundOrder?.courierName || 'Trax Logistics';
    const consignment = foundOrder?.courierTrackingNumber || `TRX-${cleanId.replace('-', '')}-PK`;
    const isDelivered = foundOrder?.status === 'Delivered' || cleanId === 'MBA-9821' || cleanId === 'MBA-8412';
    const isShipped = foundOrder?.status === 'Shipped' || cleanId === 'MBA-7734';

    const stageIndex = isDelivered ? 3 : isShipped ? 2 : 1;

    const steps: CourierTrackingStep[] = [
      {
        title: 'Order Placed',
        location: 'M&B Sialkot Atelier',
        timestamp: 'Day 1 • 10:30 AM',
        completed: true,
        description: 'Order confirmed and quality audited with 1000D ballistic waterproof materials check.',
      },
      {
        title: 'Dispatched from Lahore Hub',
        location: 'Cargo Terminal, Gulberg Lahore Hub',
        timestamp: 'Day 1 • 06:45 PM',
        completed: stageIndex >= 1,
        current: stageIndex === 1,
        description: `Handed over to ${courier} overnight linehaul flight for rapid transit.`,
      },
      {
        title: 'Out for Delivery',
        location: `${foundOrder?.city || 'Lahore'} Delivery Station`,
        timestamp: stageIndex >= 2 ? 'Day 2 • 09:15 AM' : undefined,
        completed: stageIndex >= 2,
        current: stageIndex === 2,
        description: 'Courier rider is on route with the package. Doorstep inspection authorized.',
      },
      {
        title: 'Delivered',
        location: 'Recipient Doorstep',
        timestamp: stageIndex === 3 ? 'Day 2 • 02:40 PM' : undefined,
        completed: stageIndex === 3,
        current: stageIndex === 3,
        description: 'Cash on Delivery collected. Open-parcel inspection completed successfully.',
      },
    ];

    return {
      orderId: cleanId,
      consignmentNumber: consignment,
      courierName: courier as any,
      status: isDelivered
        ? 'Delivered'
        : isShipped
        ? 'Out for Delivery'
        : 'Dispatched from Lahore Hub',
      currentStageIndex: stageIndex,
      estimatedDelivery: isDelivered
        ? 'Successfully Handed Over'
        : 'Today (Expected before 6:00 PM)',
      riderName: stageIndex >= 2 ? 'Muhammad Farhan (Rider #LHR-42)' : undefined,
      riderPhone: stageIndex >= 2 ? '0312-8491024' : undefined,
      publicTrackingUrl:
        courier === 'CallCourier'
          ? `https://callcourier.com.pk/tracking/?trackingno=${consignment}`
          : `https://sonic.trax.pk/tracking?tracking_number=${consignment}`,
      steps,
      openParcelInspectionAllowed: true,
    };
  },

  /**
   * Feature 3: Post-Purchase One-Click COD Upsell
   * POST /api/orders/upsell
   * Adds the M&B Waterproof Tech Pouch for PKR 990 to an existing COD order without re-entering address or OTP.
   */
  async addOrderUpsell(params: {
    orderId: string;
    upsellProduct: {
      id: string;
      name: string;
      price: number;
      originalPrice: number;
    };
  }): Promise<{
    success: boolean;
    orderId: string;
    newTotal: number;
    addedItem: string;
    message: string;
  }> {
    const token = this.getAuthToken();

    try {
      const response = await fetch('/api/orders/upsell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(params),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }

    await new Promise((resolve) => setTimeout(resolve, 350));

    // Update the order in local customer storage if present
    const currentUser = this.getCurrentUser();
    let newTotal = 0;

    if (currentUser) {
      const cleanUid = normalizePakistaniPhone(currentUser.uid);
      const orders = this.getCustomerOrders(cleanUid);
      const targetIndex = orders.findIndex((o) => o.orderId === params.orderId);

      if (targetIndex !== -1) {
        const order = orders[targetIndex];
        order.total += params.upsellProduct.price;
        order.itemCount += 1;
        order.itemsSummary = `${order.itemsSummary}, ${params.upsellProduct.name} (x1)`;
        newTotal = order.total;

        try {
          localStorage.setItem(`${MOCK_STORAGE_KEYS.ORDERS}_${cleanUid}`, JSON.stringify(orders));
        } catch (e) {
          console.warn('Upsell order storage error', e);
        }
      }
    }

    // Also update last placed order in localStorage if it matches
    try {
      const lastOrderRaw = localStorage.getItem('mb_atelier_last_order');
      if (lastOrderRaw) {
        const lastOrder = JSON.parse(lastOrderRaw);
        if (lastOrder.orderId === params.orderId) {
          lastOrder.total += params.upsellProduct.price;
          newTotal = lastOrder.total;
          localStorage.setItem('mb_atelier_last_order', JSON.stringify(lastOrder));
        }
      }
    } catch (e) {
      console.warn('Last order update error', e);
    }

    return {
      success: true,
      orderId: params.orderId,
      newTotal: newTotal || 7980,
      addedItem: params.upsellProduct.name,
      message: 'M&B Waterproof Tech Pouch added to active COD parcel with zero extra shipping.',
    };
  },

  /**
   * Feature 4: Automatic 1-Year Local Digital Warranty Details
   * GET /api/warranty/details?order_id=XXX&uid=YYY
   */
  async getWarrantyDetails(orderId: string, uid: string): Promise<DigitalWarrantyCertificate> {
    try {
      const token = this.getAuthToken();
      const response = await fetch(
        `/api/warranty/details?order_id=${encodeURIComponent(orderId)}&uid=${encodeURIComponent(uid)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }

    // Look up order to construct authentic warranty certificate
    const orders = this.getCustomerOrders(uid);
    const order = orders.find((o) => o.orderId === orderId) || {
      orderId,
      date: new Date().toISOString().split('T')[0],
      itemsSummary: 'The Metro Commuter Backpack (x1)',
      itemCount: 1,
      total: 6990,
      status: 'Delivered',
      paymentMethod: 'Cash on Delivery',
      city: 'Lahore',
      deliveryAddress: 'Default Address',
      canInspectParcel: true,
    };

    return generateWarrantyCertificate(order, uid);
  },

  // ---------------- Session & Local State Utilities ---------------- //

  saveAuthSession(token: string, user: CustomerUser): void {
    try {
      localStorage.setItem(MOCK_STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(MOCK_STORAGE_KEYS.USER, JSON.stringify(user));
      document.cookie = `mb_atelier_jwt=${token}; path=/; max-age=2592000; SameSite=Lax`;
    } catch (e) {
      console.warn('Storage error', e);
    }
  },

  clearAuthSession(): void {
    try {
      localStorage.removeItem(MOCK_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(MOCK_STORAGE_KEYS.USER);
      document.cookie = 'mb_atelier_jwt=; path=/; max-age=0';
    } catch (e) {
      console.warn('Storage error', e);
    }
  },

  getAuthToken(): string | null {
    try {
      return localStorage.getItem(MOCK_STORAGE_KEYS.TOKEN);
    } catch {
      return null;
    }
  },

  getCurrentUser(): CustomerUser | null {
    try {
      const userStr = localStorage.getItem(MOCK_STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  updateUserProfile(user: CustomerUser): void {
    try {
      localStorage.setItem(MOCK_STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage error', e);
    }
  },

  recordAccountVisit(): void {
    try {
      localStorage.setItem(MOCK_STORAGE_KEYS.CART_VISIT, new Date().toISOString());
    } catch {
      // ignore
    }
  },

  getCustomerOrders(uid: string): CustomerOrderRecord[] {
    const cleanUid = normalizePakistaniPhone(uid);
    try {
      const raw = localStorage.getItem(`${MOCK_STORAGE_KEYS.ORDERS}_${cleanUid}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }

    return SEED_ORDERS[cleanUid] || [];
  },

  appendCustomerOrder(uid: string, order: CustomerOrderRecord): void {
    const cleanUid = normalizePakistaniPhone(uid);
    const existing = this.getCustomerOrders(cleanUid);
    const updated = [order, ...existing];
    try {
      localStorage.setItem(`${MOCK_STORAGE_KEYS.ORDERS}_${cleanUid}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Order storage error', e);
    }
  },
};
