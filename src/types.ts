export type CurrencyCode = 'PKR' | 'USD' | 'GBP' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstPKR: number; // 1 unit of foreign currency = X PKR (e.g., 1 USD = 278 PKR)
  format: (amountInPKR: number, rate: number) => string;
}

export interface ProductSpecs {
  capacity: string;
  weight: string;
  laptopFit: string;
  material: string;
  dimensions: string;
  waterproofRating: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  subtitle: string;
  price: number; // in PKR
  originalPrice: number; // in PKR
  image: string;
  rating: number;
  reviewCount: number;
  badge: string;
  tagline: string;
  features: string[];
  specs: ProductSpecs;
  highlights: string[];
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  unitManufacturingCost?: number; // for pricing & costing calculator
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CourierPartner {
  id: string;
  name: string;
  logo: string;
  trackingPrefix: string;
  accountNumber: string;
  centerCode: string;
  originCity: string;
  apiKey: string;
  apiSecret?: string;
  defaultRatePKR: number;
  deliveryEta: string; // e.g. "2–4 Days"
  status: 'active' | 'inactive';
  trackingUrlTemplate: string; // e.g. "https://trax.pk/tracking?cn="
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'flat';
  value: number; // percentage (e.g. 15 for 15%) or flat PKR (e.g. 500)
  minSpendPKR: number;
  maxDiscountPKR?: number;
  usageLimit: number;
  usageCount: number;
  expiryDate: string; // ISO date
  isActive: boolean;
  description: string;
}

export interface CampaignBanner {
  id: string;
  title: string;
  subtitle: string;
  discountBadge: string;
  countdownEndsAt: string | null; // ISO timestamp or null
  isActive: boolean;
  ctaText: string;
  ctaTargetId: string;
}

export interface StockMovementLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  change: number; // +10 or -2
  type: 'Restocked' | 'Manual Adjustment' | 'Supplier Inward Batch' | 'Damaged Return' | 'Order Dispatch' | 'RTO Return';
  timestamp: string;
  operatorNotes: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: 'Direct Product (COGS)' | 'Packaging & Unboxing' | 'Shipping & Courier' | 'Marketing (Meta/Google)' | 'Operating Overhead';
  amountPKR: number;
  description: string;
  orderId?: string;
  referenceNo?: string;
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  deliveryNotes?: string;
  items: CartItem[];
  subtotal: number; // in PKR
  discountAmount?: number;
  appliedCoupon?: string;
  shipping: number;
  total: number; // in PKR
  createdAt: string;
  paymentMethod: 'COD';
  status: 'processing' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'rto_returned';
  courierId?: string;
  courierName?: string;
  trackingNumber?: string;
  riderName?: string;
  riderPhone?: string;
  requestOpenParcel?: boolean;
}

export interface TrackingTimelineEvent {
  title: string;
  location: string;
  time: string;
  completed: boolean;
  current?: boolean;
  description: string;
}

export interface Review {
  id: string;
  name: string;
  city: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedBuyer: boolean;
  productName: string;
  commuteType: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickReplies?: string[];
}
