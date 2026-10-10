import { ChatMessage } from '../types';

export const SYSTEM_PROMPT = `You are the official Customer Concierge AI for "M&B Atelier" (mbatelier.shop), Pakistan's premier D2C carry brand handcrafted in Sialkot and Lahore.
You speak with elegance, warmth, and precision. You understand Pakistani consumer realities (motorbike commuting, heavy 16" laptops, monsoon rains, and Cash on Delivery).

Key Store Information:
- Official WhatsApp Support: 0301 5466674 (+92 301 5466674)
- Payment: 100% Free Nationwide Cash on Delivery (COD) across Pakistan.
- Open-Parcel Inspection Guarantee: Customers are encouraged to open and inspect their bag in front of the courier rider BEFORE paying COD.
- Shipping & Delivery: Handled via official courier partners (Trax, CallCourier, PostEx, TCS). Delivery takes 24–48 hours in Lahore/Karachi/Islamabad, and 2–4 business days nationwide.
- Quality & Craftsmanship: Military-grade 1000D Ballistic Oxford fabric, weather-sealed zippers, suspended false-bottom laptop armor, and box-bartack reinforced stitching.
- Models:
  1. Model 1: The Metro Commuter Backpack (PKR 6,990) - Flagship for bike commuters with built-in high-vis rain cover and anti-theft lumbar vault. Fits up to 16" laptops.
  2. Model 2: The Tech Exec Clamshell (PKR 7,990) - 180° lay-flat TSA luggage opening, dual tech chamber for 16.2" laptop + iPad, luggage trolley strap.
  3. Model 3: The Urban Minimalist Sling (PKR 3,990) - Sleek crossbody daypack with German magnetic buckle, weather-proof zip, fits iPad Mini / Kindle.

Answer customer questions politely, concisely, and offer direct assistance. If a customer wants to place an order or track an order, guide them or offer the direct WhatsApp link.`;

export async function askAiAssistant(userQuery: string, history: ChatMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  // If Gemini API Key is available on frontend or via proxy, call Gemini Flash
  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${userQuery}` }],
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch {
      // Fallback cleanly to local rule-engine without leaking error details
    }
  }

  // High-fidelity fallback rule engine
  const q = userQuery.toLowerCase();

  if (q.includes('open parcel') || q.includes('inspect') || q.includes('check before paying')) {
    return 'Yes, absolutely! We guarantee 100% Open-Parcel Inspection at your doorstep. When your courier rider arrives, you can unbox the parcel and inspect the zippers, fabric, and laptop padding before handing over your Cash on Delivery payment.';
  }

  if (q.includes('delivery') || q.includes('how long') || q.includes('days') || q.includes('shipping')) {
    return 'We offer FREE Cash on Delivery (COD) across Pakistan. Delivery typically takes 24–48 hours in major metropolitan hubs (Lahore, Karachi, Islamabad, Rawalpindi) and 2–4 business days nationwide via Trax Logistics, CallCourier, and PostEx.';
  }

  if (q.includes('laptop') || q.includes('16') || q.includes('15') || q.includes('macbook')) {
    return 'Our Model 1 (Metro Commuter) and Model 2 (Tech Exec) both feature suspended false-bottom sleeves accommodating laptops up to 16.2" (MacBook Pro, ThinkPad, Dell Precision, and gaming laptops). The suspended core keeps your screen 1.5 inches above concrete floors for drop protection.';
  }

  if (q.includes('rain') || q.includes('waterproof') || q.includes('bike') || q.includes('monsoon')) {
    return 'All our bags are constructed from heavy 1000D Ballistic Oxford with TPU Hydro-Shield coating to deflect daily showers. For severe monsoons, Model 1 includes a dedicated high-vis neon rain cover stowed in the zipped base compartment that envelops your pack in seconds!';
  }

  if (q.includes('model 1') || q.includes('metro commuter')) {
    return 'The Metro Commuter Backpack (PKR 6,990) is our flagship biker bag. It features a 24L capacity, suspended 16" laptop sleeve, anti-theft lumbar chamber for CNIC and cash, 3M reflective safety stripe, and an integrated high-vis rain cover. Free nationwide COD!';
  }

  if (q.includes('model 2') || q.includes('tech exec') || q.includes('clamshell')) {
    return 'The Tech Exec Clamshell (PKR 7,990) unzips 180° like a suitcase for effortless tech scanning and travel. It includes dual sleeves for a 16" laptop + 12.9" tablet, powerbank pass-through, luggage trolley strap, and crush-proof top compartment.';
  }

  if (q.includes('model 3') || q.includes('sling') || q.includes('urban sling')) {
    return 'The Urban Minimalist Sling (PKR 3,990) is our quick-commute 7L crossbody bag. It has a magnetic German Fidlock™ buckle, weather-proof zips, iPad Mini pocket, and can be worn front or back on motorcycle rides.';
  }

  if (q.includes('track') || q.includes('status') || q.includes('where is my order')) {
    return 'You can check your parcel status anytime using our "Track Order" utility on the page or by entering your Order ID. You can also chat directly with our dispatch concierge on WhatsApp at 0301 5466674 with your order number!';
  }

  if (q.includes('contact') || q.includes('phone') || q.includes('whatsapp') || q.includes('number')) {
    return 'Our official store WhatsApp and customer concierge number is 0301 5466674 (+92 301 5466674). Our Lahore team is available 7 days a week to assist you with inquiries, custom requests, and order tracking.';
  }

  return 'Assalam-o-Alaikum! Welcome to M&B Atelier. All our handcrafted bags come with FREE Nationwide Cash on Delivery (COD) and doorstep Open-Parcel inspection. How can I assist you with bag sizing, commuter features, or placing an order today?';
}
