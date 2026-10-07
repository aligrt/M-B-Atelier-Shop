export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviewCount: number;
  badge: string;
  tagline: string;
  features: string[];
  specs: {
    capacity: string;
    weight: string;
    laptopFit: string;
    material: string;
    dimensions: string;
    waterproofRating: string;
  };
  highlights: string[];
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  deliveryNotes?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  paymentMethod: 'COD';
  status?: 'processing' | 'dispatched' | 'out_for_delivery' | 'delivered';
  courier?: 'Trax Logistics' | 'TCS Express' | 'Leopards Courier';
  trackingNumber?: string;
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
