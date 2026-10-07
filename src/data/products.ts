import { Product, Review } from '../types';
import heroImg from '../assets/images/hero_metro_commuter_bag_1791391545810.jpg';
import metroImg from '../assets/images/product_metro_commuter_1791391565431.jpg';
import techExecImg from '../assets/images/product_tech_exec_1791391581865.jpg';
import slingImg from '../assets/images/product_urban_sling_1791391596666.jpg';
import craftsmanshipImg from '../assets/images/craftsmanship_sialkot_1791391611997.jpg';

export const ASSET_IMAGES = {
  hero: heroImg,
  metro: metroImg,
  techExec: techExecImg,
  sling: slingImg,
  craftsmanship: craftsmanshipImg,
};

export const STORE_PHONE_NUMBER = '923008472910';
export const STORE_DISPLAY_PHONE = '+92 300 8472910';

export const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Sialkot',
  'Multan',
  'Peshawar',
  'Gujranwala',
  'Quetta',
  'Hyderabad',
  'Other',
] as const;

export const PRODUCTS: Product[] = [
  {
    id: 'metro-commuter',
    name: 'The Metro Commuter Backpack',
    subtitle: 'Engineered for Bike Commuters, Monsoon Downpours, & Heavy Tech',
    price: 6990,
    originalPrice: 8990,
    image: metroImg,
    rating: 5.0,
    reviewCount: 248,
    badge: 'Flagship · Pakistan Biker Choice',
    tagline: 'Model 1 — Engineered to survive 70cc / 125cc rides on Sharea Faisal & Canal Road.',
    features: [
      'Built-in Waterproof Rain Cover (High-Vis Neon with elastic hem)',
      '3M™ Reflective Safety Strip (360° headlight reflection on night commutes)',
      'Anti-Theft Hidden Back Pocket (Concealed lumbar zip for cash, phone & CNIC)',
      'Suspended Laptop Sleeve (Air-cushioned floor protects up to 16" laptops)',
    ],
    specs: {
      capacity: '24 Liters',
      weight: '890 grams',
      laptopFit: 'Up to 16" (MacBook Pro / ThinkPad / Dell XPS / Gaming)',
      material: '1000D Matte Ballistic Oxford with TPU Hydro-Shield',
      dimensions: '48 cm (H) x 31 cm (W) x 16 cm (D)',
      waterproofRating: 'IPX4 Water-Resistant Shell + Full IPX7 Rain Cover',
    },
    highlights: [
      'Tested under torrential monsoon downpours with zero moisture penetration.',
      'Sialkot-reinforced double-box bartack stitching at all stress points.',
      'Air-mesh ergonomic channel prevents back sweat in humid 40°C Pakistani summers.',
      'Luggage pass-through strap for effortless airport travel.',
    ],
    inStock: true,
  },
  {
    id: 'tech-exec',
    name: 'The Tech Exec Clamshell',
    subtitle: 'Architectural 180° Clamshell for C-Suite, Freelancers & Travel',
    price: 8990,
    originalPrice: 11990,
    image: techExecImg,
    rating: 4.9,
    reviewCount: 186,
    badge: 'Executive Series · TSA 180°',
    tagline: 'Model 2 — Structured silhouette that stands upright on boardroom tables and co-working desks.',
    features: [
      '180° Flat Suitcase Opening (Airport security breeze & complete gear visibility)',
      'Dedicated Lower Charger Vault (Isolates heavy power bricks & powerbanks)',
      'Velvet Microfiber Laptop Sleeve (Zero-scratch protection for aluminum unibody)',
      'Luggage Pass-Through (Rigid ballistic strap fits all standard carry-ons)',
    ],
    specs: {
      capacity: '28 Liters (Expandable gusset)',
      weight: '1,050 grams',
      laptopFit: 'Dual slots: 16" Laptop + 12.9" iPad Pro / Tablet',
      material: 'Carbon-Weave Matte Slate Nylon with YKK Aquaguard Zippers',
      dimensions: '46 cm (H) x 32 cm (W) x 18 cm (D)',
      waterproofRating: 'Splashproof Ballistic Shell + Inverted Seam Construction',
    },
    highlights: [
      'Structured EVA foam sidewalls ensure the bag never flops over or sags.',
      'Magnetic quick-snap key tether and discreet pen slots.',
      'Reinforced top aluminum alloy grab handle wrapped in matte silicone.',
      'Integrated cable pass-through port for fast charging on the go.',
    ],
    inStock: true,
  },
  {
    id: 'urban-sling',
    name: 'The Urban Minimalist Sling',
    subtitle: 'Tactical Quick-Grab Crossbody for Everyday Carry & City Runs',
    price: 4990,
    originalPrice: 6490,
    image: slingImg,
    rating: 4.9,
    reviewCount: 142,
    badge: 'EDC Series · Ultra-Light',
    tagline: 'Model 3 — Kept tight to your chest or back. Quick access in crowded bazaars and transit.',
    features: [
      'Weather-Sealed Zippers (Blocks dust, exhaust grime, and sudden rain)',
      'Fleece-Lined Tablet Slot (Snug fit for 11" iPad, Kindle, or notebook)',
      'Tactical Quick-Release Buckle (German-style one-click magnetic release)',
      'Ambidextrous Reversible Strap (Padded strap switches to left or right carry)',
    ],
    specs: {
      capacity: '8 Liters',
      weight: '420 grams',
      laptopFit: 'Tablets up to 11" (iPad Air / iPad Mini / Kindle Paperwhite)',
      material: '600D Matte Charcoal Ripstop with Weather-Sealed Zippers',
      dimensions: '32 cm (H) x 20 cm (W) x 10 cm (D)',
      waterproofRating: 'Weatherproof Shell with Rubberized Gusset Welds',
    },
    highlights: [
      'Ergonomic contour hugs the torso during aggressive motorbike turns.',
      'Concealed RFID-blocking wallet card pocket on rear backrest.',
      'Heavy-duty zinc alloy hardware with gunmetal bronze finish.',
      'Expandable bottom compression straps to carry an umbrella or light jacket.',
    ],
    inStock: true,
  },
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'Hamza Tariq',
    city: 'Karachi',
    rating: 5,
    title: 'Survives Sharea Faisal bike commute in Karachi rains!',
    comment:
      'I ride a YBR 125 from Gulshan to I.I. Chundrigar Road daily. The built-in rain cover saved my 16" M2 MacBook Pro during monsoon showers last week. The rider allowed me to open the parcel and test the zips before taking cash. 10/10 Pakistani brand.',
    date: '3 days ago',
    verifiedBuyer: true,
    productName: 'The Metro Commuter Backpack',
    commuteType: 'Daily Bike Commute (18 km)',
  },
  {
    id: 'rev-2',
    name: 'Zainab Qureshi',
    city: 'Lahore',
    rating: 5,
    title: 'Boardroom quality that matches international bags.',
    comment:
      'Ordered the Tech Exec Clamshell for office at Arfa Software Technology Park. The 180° clamshell makes finding cables effortless, and it stands upright without flopping. The Sialkot stitch quality is genuinely superior to imported fast-fashion bags.',
    date: '1 week ago',
    verifiedBuyer: true,
    productName: 'The Tech Exec Clamshell',
    commuteType: 'Metro & Careem Commute',
  },
  {
    id: 'rev-3',
    name: 'Bilal Ahmed',
    city: 'Islamabad',
    rating: 5,
    title: 'The Sling is unmatched for cafe hops and daily carry.',
    comment:
      'The quick-release buckle is super satisfying. Fits my iPad Pro 11", keys, wallet, AirPods and powerbank with zero bulk. Delivery reached F-8 Islamabad in 24 hours via Trax. Open parcel inspection was smooth.',
    date: '2 weeks ago',
    verifiedBuyer: true,
    productName: 'The Urban Minimalist Sling',
    commuteType: 'Urban Walk & Car',
  },
  {
    id: 'rev-4',
    name: 'Omer Farooq',
    city: 'Rawalpindi',
    rating: 5,
    title: 'Hidden back pocket gives total peace of mind in Saddar.',
    comment:
      'The anti-theft lumbar zip is invisible when the backpack is on your back. Kept my CNIC, passport and cash safe. Also love that Sialkot leather/nylon craftsmanship is finally available locally at honest PKR pricing.',
    date: '3 weeks ago',
    verifiedBuyer: true,
    productName: 'The Metro Commuter Backpack',
    commuteType: 'Bike & Metro Bus',
  },
];

export const FAQS = [
  {
    question: 'Can I really inspect the bag before paying Cash on Delivery (COD)?',
    answer:
      'Yes, 100%! We enforce our official "Open-Parcel Inspection Policy" with our courier partners (TCS, Trax & Leopards). When the rider reaches your doorstep, simply ask to open the flyer, inspect the zippers, fabric texture, and laptop padding. Pay the cash only when you are completely satisfied.',
  },
  {
    question: 'How does the 1-Year Local Warranty work in Pakistan?',
    answer:
      'Every M&B Atelier bag is manufactured in Sialkot with reinforced bartack stitching and heavy-duty zippers. If any stitch gives way or zipper malfunctions within 365 days of purchase, send a photo to our WhatsApp support. We will arrange free doorstep pickup, repair or replace it at our Sialkot atelier, and return it to you at zero cost.',
  },
  {
    question: 'How long does delivery take to my city?',
    answer:
      'Major metropolitan hubs (Lahore, Karachi, Islamabad, Rawalpindi) receive priority dispatch within 24–48 hours. Other cities (Faisalabad, Multan, Sialkot, Peshawar, Quetta) typically take 2–3 business days. All orders ship with tracking IDs via SMS and WhatsApp.',
  },
  {
    question: 'Will my 16" heavy gaming or workstation laptop fit in Model 1?',
    answer:
      'Yes! Model 1 (The Metro Commuter) features a suspended false-bottom sleeve that holds laptops up to 16 inches (including Dell Precision, Lenovo Legion, and 16" MacBook Pro). The suspended design keeps the laptop 1.5 inches above the bag bottom, so even if you drop your bag onto concrete, your screen does not hit the floor.',
  },
  {
    question: 'Are the bags genuinely waterproof during heavy Pakistani rain?',
    answer:
      'The outer fabric is 1000D Ballistic Nylon coated with TPU water-repellent layer, which effortlessly deflects daily drizzle and road splash. For heavy monsoon storms, Model 1 includes a dedicated stowaway high-vis neon rain cover stored in the zipped base compartment that envelops the entire backpack in under 5 seconds.',
  },
];
