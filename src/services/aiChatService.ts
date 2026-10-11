import { ChatMessage } from '../types';
import { STORE_PHONE_NUMBER, STORE_DISPLAY_PHONE } from '../data/products';

/**
 * Deterministic Rule-Based Customer Concierge
 * Completely free of external AI/LLM dependencies (Zero Gemini API requests).
 */
export async function askCustomerConcierge(userQuery: string, _history: ChatMessage[] = []): Promise<string> {
  const q = userQuery.toLowerCase().trim();

  if (!q) {
    return 'Assalam-o-Alaikum! Welcome to M&B Atelier. How can our concierge assist you today? Feel free to ask about our bag specs, Cash on Delivery, or delivery times.';
  }

  // 1. Doorstep Open Parcel Inspection
  if (q.includes('open parcel') || q.includes('inspect') || q.includes('check before paying') || q.includes('open package') || q.includes('pehle check')) {
    return 'Yes, absolutely! We guarantee 100% Doorstep Open-Parcel Inspection across Pakistan. When your courier rider arrives, you can unbox the parcel and verify the craftsmanship, zippers, and laptop padding before handing over your Cash on Delivery payment.';
  }

  // 2. Delivery timelines and shipping cost
  if (q.includes('delivery') || q.includes('how long') || q.includes('days') || q.includes('shipping') || q.includes('charges') || q.includes('deliver kab')) {
    return 'We offer 100% FREE Cash on Delivery (COD) across Pakistan. Delivery takes 24–48 hours in major metropolitan hubs (Lahore, Karachi, Islamabad, Rawalpindi) and 2–4 business days nationwide via Trax Logistics, CallCourier, and PostEx.';
  }

  // 3. Laptop compatibility and dimensions
  if (q.includes('laptop') || q.includes('16') || q.includes('15') || q.includes('macbook') || q.includes('size') || q.includes('fit') || q.includes('gaming')) {
    return 'Our Model 1 (Metro Commuter) and Model 2 (Tech Exec) both feature suspended false-bottom sleeves accommodating laptops up to 16.2" (MacBook Pro, ThinkPad, Dell Precision, and gaming rigs). The suspended core keeps your laptop elevated 1.5 inches above concrete floors for impact defense.';
  }

  // 4. Weatherproofing and monsoon protection
  if (q.includes('rain') || q.includes('waterproof') || q.includes('water resistant') || q.includes('monsoon') || q.includes('weather') || q.includes('barish')) {
    return 'All our bags are built from military-grade 1000D Ballistic Oxford with TPU Hydro-Shield coating to deflect torrential rain. In addition, Model 1 (Metro Commuter) features an integrated high-visibility neon rain cover stowed in its hidden base pocket for extreme monsoon downpours.';
  }

  // 5. Model 1 specific query
  if (q.includes('model 1') || q.includes('metro commuter') || q.includes('bike') || q.includes('motorcycle') || q.includes('rider')) {
    return 'The Metro Commuter Backpack (PKR 6,990) is our flagship bag for motorbike commuters and tech professionals. Features: 24L capacity, suspended 16" laptop armor, anti-theft lumbar passport/cash pocket, 3M reflective night strip, and integrated storm rain cover.';
  }

  // 6. Model 2 specific query
  if (q.includes('model 2') || q.includes('tech exec') || q.includes('clamshell') || q.includes('office') || q.includes('travel') || q.includes('airport')) {
    return 'The Tech Exec Clamshell (PKR 7,990) features a 180° lay-flat TSA luggage opening like a suitcase. It includes dual chambers for a 16" laptop + 12.9" tablet, powerbank pass-through port, luggage trolley strap, and crush-proof top vault for glasses and earbuds.';
  }

  // 7. Model 3 specific query
  if (q.includes('model 3') || q.includes('sling') || q.includes('urban sling') || q.includes('crossbody')) {
    return 'The Urban Minimalist Sling (PKR 3,990) is an everyday carry 7L crossbody bag. Built with German Fidlock™ magnetic buckles for instant unfastening, weather-proof zippers, and tailored sleeve for iPad Mini or Kindle.';
  }

  // 8. Order tracking
  if (q.includes('track') || q.includes('status') || q.includes('where is my order') || q.includes('kahan hai') || q.includes('tracking')) {
    return `You can track your order live anytime using the "Track Order" section at the top of the store by entering your Order ID (e.g., MBA-XXXX). For live courier updates, you can also message our dispatch team on WhatsApp at ${STORE_DISPLAY_PHONE}.`;
  }

  // 9. Payment methods and COD
  if (q.includes('payment') || q.includes('cod') || q.includes('cash on delivery') || q.includes('card') || q.includes('advance')) {
    return 'We operate on a 100% Cash on Delivery (COD) basis nationwide. You do not pay anything online in advance. Pay the courier rider only after receiving and inspecting your bag at your doorstep.';
  }

  // 10. Contact and WhatsApp support
  if (q.includes('contact') || q.includes('phone') || q.includes('whatsapp') || q.includes('call') || q.includes('human') || q.includes('support')) {
    return `You can reach our concierge team 7 days a week directly on WhatsApp at ${STORE_DISPLAY_PHONE} (+${STORE_PHONE_NUMBER}). We are based in Lahore & Sialkot and reply promptly!`;
  }

  // 11. Return and exchange policy
  if (q.includes('return') || q.includes('exchange') || q.includes('refund') || q.includes('change')) {
    return 'We offer a hassle-free 7-day exchange and inspection guarantee. If the bag does not fit your laptop or lifestyle, notify our WhatsApp concierge at 0301 5466674 for an immediate doorstep exchange.';
  }

  // Default helpful overview
  return `Assalam-o-Alaikum! Welcome to M&B Atelier. All our bags are handcrafted in Sialkot and Lahore, featuring 100% Free Nationwide Cash on Delivery (COD) and doorstep Open-Parcel inspection. How can we assist you with bag sizing, motorcycle commute features, or placing your order? You can also message our concierge on WhatsApp at ${STORE_DISPLAY_PHONE}.`;
}

// Retain backward-compatible alias without Gemini
export const askAiAssistant = askCustomerConcierge;
